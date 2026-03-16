import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Organization, OrganizationStatus, SubscriptionStatus } from '../entities/organization.entity';
import { MasterOrganization } from '../entities/master-organization.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { User, UserType } from '../entities/user.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import * as bcrypt from 'bcrypt';

export interface CreateOrganizationDto {
  name: string;
  email: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPassword?: string;
  phone?: string;
  address?: string;
  website?: string;
  subscriptionPlanId?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  trialDays?: number;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
  settings?: Record<string, any>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
}

export interface OrganizationListFilter {
  status?: OrganizationStatus;
  subscriptionStatus?: SubscriptionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Organization Service
 * Manages client organizations with full CRUD operations
 */
@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(MasterOrganization)
    private masterOrganizationRepository: Repository<MasterOrganization>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create New Organization
   * Super admin only
   */
  async create(
    dto: CreateOrganizationDto,
    createdBy: User,
  ): Promise<Organization> {
    // Verify creator is super admin
    if (createdBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create organizations');
    }

    // Check if email already exists
    const existingOrg = await this.organizationRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingOrg) {
      throw new BadRequestException('Organization with this email already exists');
    }

    // Get master organization (CognexiaAI)
    let masterOrg = await this.masterOrganizationRepository.findOne({
      where: { name: 'CognexiaAI' },
    });

    if (!masterOrg) {
      const createdMaster = this.masterOrganizationRepository.create({
        name: 'CognexiaAI',
        description: 'Auto-created master organization',
        isActive: true,
      });
      masterOrg = await this.masterOrganizationRepository.save(createdMaster);
    }

    // Get subscription plan if provided
    let subscriptionPlan: SubscriptionPlan | null = null;
    if (dto.subscriptionPlanId) {
      subscriptionPlan = await this.subscriptionPlanRepository.findOne({
        where: { id: dto.subscriptionPlanId },
      });

      if (!subscriptionPlan) {
        throw new BadRequestException('Subscription plan not found');
      }
    }

    // Calculate trial end date
    const trialDays = dto.trialDays || subscriptionPlan?.trialDays || 14;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const metadataEntries = Object.entries({
      accountId: dto.accountId,
      country: dto.country,
      industry: dto.industry,
      accountType: dto.accountType,
      accountOwner: dto.accountOwner,
      accountStatus: dto.accountStatus,
      createdDate: dto.createdDate,
    }).filter(([, value]) => value !== undefined && value !== '');

    // Create organization
    const organization = this.organizationRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      address: dto.address,
      website: dto.website,
      masterOrganizationId: masterOrg.id,
      subscriptionPlanId: subscriptionPlan?.id,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      status: OrganizationStatus.TRIAL,
      trialEndsAt,
      maxUsers: subscriptionPlan?.includedUsers || 5,
      currentUserCount: 0,
      contactPersonName: dto.contactPersonName,
      contactPersonEmail: dto.contactPersonEmail,
      contactPersonPhone: dto.contactPersonPhone,
      metadata: metadataEntries.length ? Object.fromEntries(metadataEntries) : undefined,
    });

    const savedOrg = await this.organizationRepository.save(organization);

    await this.ensureOrgAdminUser(savedOrg, dto, createdBy);

    savedOrg.currentUserCount = await this.userRepository.count({
      where: { organizationId: savedOrg.id, isActive: true },
    });
    await this.organizationRepository.save(savedOrg);

    // Create audit log
    await this.createAuditLog(
      savedOrg.id,
      createdBy.id,
      AuditAction.CREATE,
      AuditEntityType.ORGANIZATION,
      savedOrg.id,
      `Organization created: ${savedOrg.name}`,
    );

    return savedOrg;
  }

  async upsertOrgAdminUser(
    organization_id: string,
    payload: {
      adminEmail?: string;
      adminFirstName?: string;
      adminLastName?: string;
      adminPassword?: string;
      contactPersonName?: string;
      contactPersonEmail?: string;
    },
    updatedBy: User,
  ): Promise<User> {
    if (updatedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can manage organization admins');
    }

    const organization = await this.organizationRepository.findOne({ where: { id: organization_id } });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const adminEmail = (payload.adminEmail || payload.contactPersonEmail || organization.email || '').toLowerCase();
    if (!adminEmail) {
      throw new BadRequestException('Admin email is required');
    }
    if (!payload.adminPassword) {
      throw new BadRequestException('Admin password is required');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (existingUser && existingUser.organizationId && existingUser.organizationId !== organization_id) {
      throw new BadRequestException('User with this email already exists in another organization');
    }

    const nameParts = (payload.adminFirstName || payload.adminLastName)
      ? { firstName: payload.adminFirstName || 'Admin', lastName: payload.adminLastName || 'User' }
      : this.splitName(payload.contactPersonName || 'Admin User');

    const passwordHash = await bcrypt.hash(payload.adminPassword, 10);

    let user: User;
    if (existingUser) {
      existingUser.firstName = nameParts.firstName;
      existingUser.lastName = nameParts.lastName;
      existingUser.passwordHash = passwordHash;
      existingUser.userType = UserType.ORG_ADMIN;
      existingUser.organizationId = organization_id;
      existingUser.roles = ['org_admin'];
      existingUser.permissions = ['*'];
      existingUser.isActive = true;
      existingUser.isEmailVerified = true;
      existingUser.isInvited = false;
      user = await this.userRepository.save(existingUser);
    } else {
      user = await this.userRepository.save(
        this.userRepository.create({
          email: adminEmail,
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          passwordHash,
          userType: UserType.ORG_ADMIN,
          organizationId: organization_id,
          roles: ['org_admin'],
          permissions: ['*'],
          isActive: true,
          isEmailVerified: true,
          isInvited: false,
        }),
      );
    }

    organization.currentUserCount = await this.userRepository.count({
      where: { organizationId: organization.id, isActive: true },
    });
    await this.organizationRepository.save(organization);

    await this.createAuditLog(
      organization.id,
      updatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      `Organization admin password set: ${user.email}`,
    );

    return user;
  }

  /**
   * Get Organization by ID
   */
  async findById(id: string, userId?: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  /**
   * List Organizations (Super Admin)
   * With filtering and pagination
   */
  async list(
    filter: OrganizationListFilter,
    requestingUser: User,
  ): Promise<{ organizations: Organization[]; total: number; page: number; limit: number }> {
    // Only super admins can list all organizations
    if (requestingUser.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can list all organizations');
    }

    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Organization> = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.subscriptionStatus) {
      where.subscriptionStatus = filter.subscriptionStatus;
    }

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.subscriptionPlan', 'subscriptionPlan');

    // Apply filters
    if (filter.status) {
      queryBuilder.andWhere('org.status = :status', { status: filter.status });
    }

    if (filter.subscriptionStatus) {
      queryBuilder.andWhere('org.subscriptionStatus = :subscriptionStatus', {
        subscriptionStatus: filter.subscriptionStatus,
      });
    }

    // Search filter
    if (filter.search) {
      queryBuilder.andWhere(
        '(org.name ILIKE :search OR org.email ILIKE :search OR org.contactPersonName ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Order by
    queryBuilder.orderBy('org.createdAt', 'DESC');

    const [organizations, total] = await queryBuilder.getManyAndCount();

    return {
      organizations,
      total,
      page,
      limit,
    };
  }

  /**
   * Export organizations to CSV
   */
  async exportToCsv(
    filter: { status?: OrganizationStatus; search?: string; organizationId?: string },
    requestingUser: User,
  ): Promise<string> {
    if (requestingUser.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can export organizations');
    }

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.subscriptionPlan', 'plan');

    if (filter.organizationId) {
      queryBuilder.andWhere('org.id = :organizationId', { organizationId: filter.organizationId });
    }
    if (filter.status) {
      queryBuilder.andWhere('org.status = :status', { status: filter.status });
    }
    if (filter.search) {
      queryBuilder.andWhere(
        '(org.name ILIKE :search OR org.email ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }
    queryBuilder.orderBy('org.createdAt', 'DESC');
    const orgs = await queryBuilder.getMany();

    const headers = ['id', 'name', 'email', 'phone', 'status', 'subscriptionStatus', 'maxUsers', 'currentUserCount', 'monthlyRevenue', 'createdAt'];
    const rows = orgs.map((o) => [
      o.id,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      o.email || '',
      o.phone || '',
      o.status || '',
      o.subscriptionStatus || '',
      o.maxUsers ?? '',
      o.currentUserCount ?? '',
      o.monthlyRevenue ?? '',
      o.createdAt ? new Date(o.createdAt).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csv;
  }

  /**
   * Update Organization
   */
  async update(
    id: string,
    dto: UpdateOrganizationDto,
    updatedBy: User,
  ): Promise<Organization> {
    const organization = await this.findById(id);

    // Verify permissions
    if (updatedBy.userType !== UserType.SUPER_ADMIN) {
      if (updatedBy.organizationId !== id || updatedBy.userType !== UserType.ORG_ADMIN) {
        throw new ForbiddenException('Insufficient permissions to update this organization');
      }
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== organization.email) {
      const existingOrg = await this.organizationRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingOrg) {
        throw new BadRequestException('Organization with this email already exists');
      }
    }

    // Track changes for audit
    const changes: any = {
      before: {},
      after: {},
    };

    // Update fields
    if (dto.name) {
      changes.before.name = organization.name;
      organization.name = dto.name;
      changes.after.name = dto.name;
    }

    if (dto.email) {
      changes.before.email = organization.email;
      organization.email = dto.email.toLowerCase();
      changes.after.email = dto.email;
    }

    if (dto.phone !== undefined) {
      organization.phone = dto.phone;
    }

    if (dto.address !== undefined) {
      organization.address = dto.address;
    }

    if (dto.website !== undefined) {
      organization.website = dto.website;
    }

    if (dto.logoUrl !== undefined) {
      organization.logoUrl = dto.logoUrl;
    }

    if (dto.contactPersonName !== undefined) {
      organization.contactPersonName = dto.contactPersonName;
    }

    if (dto.contactPersonEmail !== undefined) {
      organization.contactPersonEmail = dto.contactPersonEmail;
    }

    if (dto.contactPersonPhone !== undefined) {
      organization.contactPersonPhone = dto.contactPersonPhone;
    }

    const metadataEntries = Object.entries({
      accountId: dto.accountId,
      country: dto.country,
      industry: dto.industry,
      accountType: dto.accountType,
      accountOwner: dto.accountOwner,
      accountStatus: dto.accountStatus,
      createdDate: dto.createdDate,
    }).filter(([, value]) => value !== undefined && value !== '');

    if (metadataEntries.length) {
      organization.metadata = {
        ...(organization.metadata || {}),
        ...Object.fromEntries(metadataEntries),
      };
    }

    if (dto.settings) {
      organization.settings = { ...organization.settings, ...dto.settings };
    }

    if (dto.branding) {
      organization.branding = { ...organization.branding, ...dto.branding };
    }

    const updatedOrg = await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization.id,
      updatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization.id,
      `Organization updated: ${organization.name}`,
      undefined,
      undefined,
      false,
      changes,
    );

    return updatedOrg;
  }

  /**
   * Suspend Organization
   * Super admin only
   */
  async suspend(
    id: string,
    reason: string,
    suspendedBy: User,
  ): Promise<Organization> {
    if (suspendedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can suspend organizations');
    }

    const organization = await this.findById(id);

    if (organization.status === OrganizationStatus.SUSPENDED) {
      throw new BadRequestException('Organization is already suspended');
    }

    organization.status = OrganizationStatus.SUSPENDED;
    organization.isActive = false;
    organization.metadata = {
      ...organization.metadata,
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: suspendedBy.id,
    };

    const updatedOrg = await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization.id,
      suspendedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization.id,
      `Organization suspended: ${reason}`,
      undefined,
      undefined,
      true, // Security event
    );

    return updatedOrg;
  }

  /**
   * Activate/Reactivate Organization
   * Super admin only
   */
  async activate(
    id: string,
    activatedBy: User,
  ): Promise<Organization> {
    if (activatedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can activate organizations');
    }

    const organization = await this.findById(id);

    if (organization.status === OrganizationStatus.ACTIVE) {
      return organization;
    }

    organization.status = OrganizationStatus.ACTIVE;
    organization.isActive = true;

    // Clear suspension metadata
    if (organization.metadata) {
      delete organization.metadata.suspensionReason;
      delete organization.metadata.suspendedAt;
      delete organization.metadata.suspendedBy;
    }

    const updatedOrg = await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization.id,
      activatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization.id,
      'Organization activated',
      undefined,
      undefined,
      true,
    );

    return updatedOrg;
  }

  /**
   * Delete Organization (Soft Delete)
   * Super admin only
   */
  async delete(
    id: string,
    deletedBy: User,
  ): Promise<{ message: string }> {
    if (deletedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete organizations');
    }

    const organization = await this.findById(id);

    // Soft delete
    organization.status = OrganizationStatus.CANCELLED;
    organization.isActive = false;
    organization.deletedAt = new Date();

    await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization.id,
      deletedBy.id,
      AuditAction.DELETE,
      AuditEntityType.ORGANIZATION,
      organization.id,
      `Organization deleted: ${organization.name}`,
      undefined,
      undefined,
      true,
    );

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Get Organization Statistics
   */
  async getStatistics(id: string): Promise<any> {
    const organization = await this.findById(id);

    // Get user count
    const userCount = await this.userRepository.count({
      where: { organizationId: id, isActive: true },
    });

    return {
      id: organization.id,
      name: organization.name,
      status: organization.status,
      subscriptionStatus: organization.subscriptionStatus,
      userCount,
      maxUsers: organization.maxUsers,
      userPercentage: (userCount / organization.maxUsers) * 100,
      trialEndsAt: organization.trialEndsAt,
      monthlyRevenue: organization.monthlyRevenue,
      createdAt: organization.createdAt,
    };
  }

  /**
   * ========================================
   * SEAT MANAGEMENT (Multi-Tenant SaaS)
   * ========================================
   */

  /**
   * Check if organization can add a new user
   * Enforces seat limits based on subscription plan
   * 
   * @throws BadRequestException if seat limit reached
   */
  async canAddUser(organization_id: string): Promise<boolean> {
    const organization = await this.findById(organization_id);

    // Get current active user count
    const currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });

    // Check if adding user would exceed limit
    if (currentUserCount >= organization.maxUsers) {
      throw new BadRequestException(
        `Seat limit reached. Current: ${currentUserCount}/${organization.maxUsers} seats used. ` +
        `Please upgrade your plan or contact support to add more seats.`
      );
    }

    return true;
  }

  /**
   * Get seat usage for organization
   * Returns current usage and availability
   */
  async getSeatUsage(organization_id: string): Promise<{
    currentUsers: number;
    maxUsers: number;
    availableSeats: number;
    usagePercentage: number;
    canAddUsers: boolean;
  }> {
    const organization = await this.findById(organization_id);

    const currentUsers = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });

    const availableSeats = Math.max(0, organization.maxUsers - currentUsers);
    const usagePercentage = (currentUsers / organization.maxUsers) * 100;
    const canAddUsers = currentUsers < organization.maxUsers;

    return {
      currentUsers,
      maxUsers: organization.maxUsers,
      availableSeats,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      canAddUsers,
    };
  }

  /**
   * Update seat limit (Super Admin Only)
   * Used when client purchases additional seats or changes plan
   * 
   * @param organizationId - Organization to update
   * @param newMaxUsers - New maximum user count
   * @param updatedBy - Super admin performing the action
   * @param reason - Reason for change (e.g., "Purchased 10 additional seats", "Upgraded to Enterprise plan")
   * @param paymentConfirmed - Whether payment has been confirmed
   */
  async updateSeatLimit(
    organization_id: string,
    newMaxUsers: number,
    updatedBy: User,
    reason: string,
    paymentConfirmed: boolean = false,
  ): Promise<Organization> {
    // Only super admins can update seat limits
    if (updatedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can update seat limits');
    }

    const organization = await this.findById(organization_id);
    const oldMaxUsers = organization.maxUsers;

    // Validate new limit
    if (newMaxUsers < 1) {
      throw new BadRequestException('Maximum users must be at least 1');
    }

    // Check if reducing below current user count
    const currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });

    if (newMaxUsers < currentUserCount) {
      throw new BadRequestException(
        `Cannot reduce seat limit to ${newMaxUsers}. Organization currently has ${currentUserCount} active users. ` +
        `Please deactivate users first before reducing seat limit.`
      );
    }

    // Require payment confirmation for seat increases
    if (newMaxUsers > oldMaxUsers && !paymentConfirmed) {
      throw new BadRequestException(
        'Payment confirmation required for seat limit increase. ' +
        `Additional seats: ${newMaxUsers - oldMaxUsers}`
      );
    }

    // Update seat limit
    organization.maxUsers = newMaxUsers;
    organization.metadata = {
      ...organization.metadata,
      seatLimitHistory: [
        ...(organization.metadata?.seatLimitHistory || []),
        {
          previousLimit: oldMaxUsers,
          newLimit: newMaxUsers,
          updatedBy: updatedBy.id,
          updatedAt: new Date().toISOString(),
          reason,
          paymentConfirmed,
        },
      ],
    };

    const updatedOrg = await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization_id,
      updatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization_id,
      `Seat limit updated from ${oldMaxUsers} to ${newMaxUsers}. Reason: ${reason}`,
      undefined,
      undefined,
      true, // Security event
      {
        before: { maxUsers: oldMaxUsers },
        after: { maxUsers: newMaxUsers },
        reason,
        paymentConfirmed,
      },
    );

    return updatedOrg;
  }

  /**
   * Increment user count after successful user creation
   * Called automatically when new user is added
   */
  async incrementUserCount(organization_id: string): Promise<void> {
    const organization = await this.findById(organization_id);
    organization.currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });
    await this.organizationRepository.save(organization);
  }

  /**
   * Decrement user count after user deactivation
   * Called automatically when user is deactivated
   */
  async decrementUserCount(organization_id: string): Promise<void> {
    const organization = await this.findById(organization_id);
    organization.currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });
    await this.organizationRepository.save(organization);
  }

  private async ensureOrgAdminUser(
    organization: Organization,
    dto: CreateOrganizationDto,
    createdBy: User,
  ) {
    await this.upsertOrgAdminUser(
      organization.id,
      {
        adminEmail: dto.adminEmail,
        adminFirstName: dto.adminFirstName,
        adminLastName: dto.adminLastName,
        adminPassword: dto.adminPassword,
        contactPersonName: dto.contactPersonName,
        contactPersonEmail: dto.contactPersonEmail,
      },
      createdBy,
    );
  }

  private splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: 'Admin', lastName: 'User' };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: 'Admin' };
    }
    return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
  }

  /**
   * Create Audit Log Entry
   */
  private async createAuditLog(
    organization_id: string,
    user_id: string,
    action: AuditAction,
    entity_type: AuditEntityType,
    entity_id: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    isSecurityEvent: boolean = false,
    changes?: any,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) return;

    const auditLog = this.auditLogRepository.create({
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      metadata: {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        changes,
        ipAddress,
        userAgent,
        isSecurityEvent,
      },
    });

    await this.auditLogRepository.save(auditLog);
  }
}
