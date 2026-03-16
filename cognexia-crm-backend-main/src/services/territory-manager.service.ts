import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Territory, AssignmentStrategy } from '../entities/territory.entity';
import { Lead } from '../entities/lead.entity';
import { User } from '../entities/user.entity';
import { CreateTerritoryDto, UpdateTerritoryDto } from '../dto/territory.dto';
import { EmailSenderService } from './email-sender.service';
import { ActivityLoggerService } from './activity-logger.service';

@Injectable()
export class TerritoryManagerService {
  constructor(
    @InjectRepository(Territory)
    private territoryRepository: Repository<Territory>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailSenderService: EmailSenderService,
    private activityLogger: ActivityLoggerService,
  ) {}

  private getTenantColumn(repo: Repository<any>): 'tenantId' | 'organizationId' | null {
    const columns = repo.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('tenantId')) {
      return 'tenantId';
    }
    if (columns.includes('organizationId')) {
      return 'organizationId';
    }
    return null;
  }

  // ============ Territory CRUD ============

  async createTerritory(tenantId: string, dto: CreateTerritoryDto): Promise<Territory> {
    try {
      const territory = this.territoryRepository.create({
        ...dto,
        name: dto?.name || 'New Territory',
        tenantId,
        active: dto?.active !== undefined ? dto.active : true,
        priority: dto?.priority || 1,
        totalLeadsAssigned: 0,
        activeLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
      });

      if (dto?.userIds && dto.userIds.length) {
        try {
          territory.users = await this.userRepository.findBy({ id: In(dto.userIds) });
        } catch (userError) {
          console.warn('Failed to load users for territory:', userError.message);
          territory.users = [];
        }
      }

      return await this.territoryRepository.save(territory);
    } catch (error) {
      console.error('Error creating territory:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async findAll(tenantId: string): Promise<Territory[]> {
    try {
      const territories = await this.territoryRepository.find({
        where: { tenantId },
        relations: ['users'],
        order: { priority: 'DESC', name: 'ASC' },
      });
      return territories || [];
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, tenantId: string): Promise<Territory> {
    try {
      const territory = await this.territoryRepository.findOne({
        where: { id, tenantId },
        relations: ['users'],
      });

      return territory || null;
    } catch (error) {
      return null;
    }
  }

  async updateTerritory(id: string, tenantId: string, dto: UpdateTerritoryDto): Promise<Territory> {
    const territory = await this.findOne(id, tenantId);
    Object.assign(territory, dto);

    if (dto.userIds) {
      territory.users = await this.userRepository.findBy({ id: In(dto.userIds) });
    }

    return this.territoryRepository.save(territory);
  }

  async deleteTerritory(id: string, tenantId: string): Promise<void> {
    const territory = await this.findOne(id, tenantId);
    await this.territoryRepository.remove(territory);
  }

  // ============ Lead Assignment ============

  async assignLead(leadId: string, tenantId: string, territoryId?: string, force?: boolean): Promise<Lead> {
    const leadQuery = this.leadRepository.createQueryBuilder('lead').where('lead.id = :id', { id: leadId });
    const leadTenantColumn = this.getTenantColumn(this.leadRepository);
    if (leadTenantColumn) {
      leadQuery.andWhere(`lead.${leadTenantColumn} = :tenantId`, { tenantId });
    }
    const lead = await leadQuery.getOne();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // If already assigned and not forcing, skip
    if (lead.assignedTo && !force) {
      return lead;
    }

    let territory: Territory;

    if (territoryId) {
      // Assign to specific territory
      territory = await this.findOne(territoryId, tenantId);
    } else {
      // Auto-determine territory
      territory = await this.determineTerritory(lead, tenantId);
    }

    if (!territory || !territory.active) {
      throw new NotFoundException('No suitable territory found for this lead');
    }

    // Select user from territory based on assignment strategy
    const assignedUser = await this.selectUserFromTerritory(territory, lead);

    if (assignedUser) {
      lead.assignedTo = assignedUser.id;
      await this.leadRepository.save(lead);

      // Update territory stats
      await this.territoryRepository.increment({ id: territory.id }, 'totalLeadsAssigned', 1);
      await this.territoryRepository.increment({ id: territory.id }, 'activeLeads', 1);

      // Send notification if enabled
      if (territory.sendNotificationOnAssignment) {
        await this.sendAssignmentNotification(territory, lead, assignedUser);
      }

      // Log activity
      await this.activityLogger.logActivity(
        tenantId,
        assignedUser.id,
        `${assignedUser.firstName} ${assignedUser.lastName}`,
        {
          action: 'lead_assigned',
          details: `Assigned via territory: ${territory.name}`,
          metadata: { territoryId: territory.id, userId: assignedUser.id, entityId: leadId },
        } as any
      );
    }

    return lead;
  }

  async bulkAssignLeads(leadIds: string[], tenantId: string, territoryId?: string, force?: boolean): Promise<{ assigned: number; failed: number }> {
    let assigned = 0;
    let failed = 0;

    for (const leadId of leadIds) {
      try {
        await this.assignLead(leadId, tenantId, territoryId, force);
        assigned++;
      } catch (error) {
        console.error(`Failed to assign lead ${leadId}:`, error);
        failed++;
      }
    }

    return { assigned, failed };
  }

  // ============ Territory Determination ============

  private async determineTerritory(lead: Lead, tenantId: string): Promise<Territory | null> {
    const territories = await this.findAll(tenantId);
    const activeTerritories = territories.filter(t => t.active);

    // Sort by priority (higher first)
    const sortedTerritories = activeTerritories.sort((a, b) => b.priority - a.priority);

    for (const territory of sortedTerritories) {
      if (await this.matchesTerritoryRules(lead, territory)) {
        return territory;
      }
    }

    return null;
  }

  private async matchesTerritoryRules(lead: Lead, territory: Territory): Promise<boolean> {
    // Check geographic boundaries
    if (territory.boundaries && territory.boundaries.length) {
      let matchesBoundary = false;

      for (const boundary of territory.boundaries) {
        switch (boundary.type) {
          case 'country':
            matchesBoundary = boundary.values.includes((lead as any).address?.country);
            break;
          case 'state':
            matchesBoundary = boundary.values.includes((lead as any).address?.state);
            break;
          case 'city':
            matchesBoundary = boundary.values.includes((lead as any).address?.city);
            break;
          case 'zipcode':
            matchesBoundary = boundary.values.includes((lead as any).address?.zipCode);
            break;
        }

        if (matchesBoundary) break;
      }

      if (!matchesBoundary) return false;
    }

    // Check assignment rules
    if (territory.assignmentRules && territory.assignmentRules.length) {
      // Sort rules by priority (higher first)
      const sortedRules = territory.assignmentRules.sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        const fieldValue = lead[rule.field];
        let matches = false;

        switch (rule.operator) {
          case 'equals':
            matches = fieldValue === rule.value;
            break;
          case 'contains':
            matches = String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
            break;
          case 'in':
            matches = Array.isArray(rule.value) && rule.value.includes(fieldValue);
            break;
          case 'greaterThan':
            matches = Number(fieldValue) > Number(rule.value);
            break;
          case 'lessThan':
            matches = Number(fieldValue) < Number(rule.value);
            break;
          case 'between':
            if (Array.isArray(rule.value) && rule.value.length === 2) {
              const num = Number(fieldValue);
              matches = num >= Number(rule.value[0]) && num <= Number(rule.value[1]);
            }
            break;
        }

        if (matches) return true;
      }

      return false;
    }

    // If no rules specified, territory matches
    return true;
  }

  // ============ User Selection Strategies ============

  private async selectUserFromTerritory(territory: Territory, lead: Lead): Promise<User | null> {
    if (!territory.users || territory.users.length === 0) {
      return null;
    }

    // Check capacity limits
    let eligibleUsers = territory.users;

    if (territory.hasCapacityLimit && territory.maxLeadsPerUser) {
      eligibleUsers = await this.filterUsersByCapacity(
        territory.users,
        territory.maxLeadsPerUser,
        territory.tenantId
      );
    }

    if (eligibleUsers.length === 0) {
      // Try overflow territory if configured
      if (territory.overflowTerritoryId) {
        const overflowTerritory = await this.findOne(territory.overflowTerritoryId, territory.tenantId);
        return this.selectUserFromTerritory(overflowTerritory, lead);
      }
      return null;
    }

    switch (territory.assignmentStrategy) {
      case AssignmentStrategy.ROUND_ROBIN:
        return this.roundRobinSelection(territory, eligibleUsers);

      case AssignmentStrategy.LOAD_BALANCED:
        return this.loadBalancedSelection(eligibleUsers, territory.tenantId);

      case AssignmentStrategy.FIRST_AVAILABLE:
        return eligibleUsers[0];

      case AssignmentStrategy.PRIORITY_BASED:
        return this.priorityBasedSelection(eligibleUsers);

      default:
        return eligibleUsers[0];
    }
  }

  private async roundRobinSelection(territory: Territory, users: User[]): Promise<User> {
    const index = territory.lastAssignedIndex % users.length;
    const selectedUser = users[index];

    // Update lastAssignedIndex
    await this.territoryRepository.update(territory.id, {
      lastAssignedIndex: index + 1,
    });

    return selectedUser;
  }

  private async loadBalancedSelection(users: User[], tenantId: string): Promise<User> {
    // Count active leads per user
    const userLoads = await Promise.all(
      users.map(async user => {
        const activeLeads = await this.leadRepository.count({
          where: {
            organizationId: tenantId,
            assignedTo: user.id,
            status: In(['new', 'contacted', 'qualified']) as any,
          } as any,
        });
        return { user, activeLeads };
      })
    );

    // Sort by load (ascending) and return user with least load
    userLoads.sort((a, b) => a.activeLeads - b.activeLeads);
    return userLoads[0].user;
  }

  private priorityBasedSelection(users: User[]): User {
    // Assume users array is already sorted by priority
    // In a real implementation, User entity would have a priority field
    return users[0];
  }

  private async filterUsersByCapacity(users: User[], maxLeads: number, tenantId: string): Promise<User[]> {
    const eligibleUsers: User[] = [];

    for (const user of users) {
      const activeLeads = await this.leadRepository.count({
        where: {
          organizationId: tenantId,
          assignedTo: user.id,
          status: In(['new', 'contacted', 'qualified']) as any,
        } as any,
      });

      if (activeLeads < maxLeads) {
        eligibleUsers.push(user);
      }
    }

    return eligibleUsers;
  }

  // ============ Rebalancing ============

  async rebalanceTerritories(
    tenantId: string,
    territoryIds?: string[],
    strategy: 'even' | 'proportional' | 'weighted' = 'even'
  ): Promise<{ reassigned: number }> {
    let territories: Territory[];

    if (territoryIds && territoryIds.length) {
      territories = await this.territoryRepository.findBy({ id: In(territoryIds), tenantId });
    } else {
      territories = await this.findAll(tenantId);
    }

    let reassigned = 0;

    for (const territory of territories) {
      if (!territory.active || !territory.users.length) continue;

      // Get unassigned or poorly distributed leads
      const leads = await this.leadRepository.find({
        where: {
          organizationId: tenantId,
          assignedTo: null, // Or implement more complex rebalancing logic
        } as any,
      });

      for (const lead of leads) {
        if (await this.matchesTerritoryRules(lead, territory)) {
          await this.assignLead(lead.id, tenantId, territory.id, false);
          reassigned++;
        }
      }
    }

    return { reassigned };
  }

  // ============ Statistics ============

  async getTerritoryStats(territoryId: string, tenantId: string): Promise<any> {
    const territory = await this.findOne(territoryId, tenantId);

    const userStats = await Promise.all(
      territory.users.map(async user => {
        const activeLeads = await this.leadRepository.count({
          where: { organizationId: tenantId, assignedTo: user.id, status: In(['new', 'contacted', 'qualified']) as any } as any,
        });

        const convertedLeads = await this.leadRepository.count({
          where: { organizationId: tenantId, assignedTo: user.id, status: 'converted' as any } as any,
        });

        const totalLeads = activeLeads + convertedLeads;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          activeLeads,
          convertedLeads,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      })
    );

    return {
      territoryId: territory.id,
      territoryName: territory.name,
      active: territory.active,
      totalUsers: territory.users.length,
      totalLeadsAssigned: territory.totalLeadsAssigned,
      activeLeads: territory.activeLeads,
      convertedLeads: territory.convertedLeads,
      conversionRate: territory.conversionRate,
      averageLeadsPerUser: territory.users.length > 0 ? territory.activeLeads / territory.users.length : 0,
      userStats,
    };
  }

  private async sendAssignmentNotification(territory: Territory, lead: Lead, assignedUser: User): Promise<void> {
    const recipients = territory.notificationEmails || [];
    if (assignedUser.email) {
      recipients.push(assignedUser.email);
    }

    if (recipients.length === 0) return;

    const leadContact = (lead as any).contact || {};
    await this.emailSenderService.sendEmail(
      territory.tenantId,
      recipients[0],
      `New Lead Assigned: ${leadContact.firstName || 'N/A'} ${leadContact.lastName || ''}`,
      `
        <h2>New Lead Assignment</h2>
        <p>A new lead has been assigned to <strong>${assignedUser.firstName} ${assignedUser.lastName}</strong></p>
        
        <h3>Lead Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${leadContact.firstName || 'N/A'} ${leadContact.lastName || ''}</li>
          <li><strong>Email:</strong> ${leadContact.email || 'N/A'}</li>
          <li><strong>Company:</strong> ${leadContact.company || 'N/A'}</li>
        </ul>
        
        <p><strong>Territory:</strong> ${territory.name}</p>
        <p><a href="${process.env.APP_URL}/crm/leads/${lead.id}">View Lead</a></p>
      `
    );
  }
}
