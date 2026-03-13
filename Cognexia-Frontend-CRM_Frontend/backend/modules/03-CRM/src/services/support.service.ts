import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupportTicket, TicketStatus, TicketPriority } from '../entities/support-ticket.entity';
import { SLA, EscalationLevel } from '../entities/sla.entity';
import { KnowledgeBaseArticle } from '../entities/knowledge-base.entity';

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority?: TicketPriority;
  category?: string;
  channel?: string;
  customer_id?: string;
  created_by?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  resolution_notes?: string;
  tags?: string[];
}

export interface TicketSearchCriteria {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assigned_to?: string;
  customer_id?: string;
  category?: string;
  channel?: string;
  created_after?: Date;
  created_before?: Date;
  tags?: string[];
}

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SLA)
    private slaRepository: Repository<SLA>,
    @InjectRepository(KnowledgeBaseArticle)
    private knowledgeBaseRepository: Repository<KnowledgeBaseArticle>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new support ticket
   */
  async createTicket(createDto: CreateTicketDto): Promise<SupportTicket> {
    try {
      const ticketNumber = await this.generateTicketNumber();
      
      const ticket = this.ticketRepository.create({
        ticket_number: ticketNumber,
        subject: createDto.subject || 'No Subject',
        description: createDto.description || '',
        priority: createDto.priority || TicketPriority.MEDIUM,
        category: createDto.category,
        channel: createDto.channel || 'web',
        customer_id: createDto.customer_id,
        created_by: createDto.created_by,
        tags: createDto.tags || [],
        custom_fields: createDto.custom_fields || {},
        status: TicketStatus.OPEN,
        response_count: 0,
      } as any);

      const savedTicket = await this.ticketRepository.save(ticket) as unknown as SupportTicket;

      // Find and apply SLA (wrapped in try-catch to not fail ticket creation)
      try {
        const sla = await this.findApplicableSLA(savedTicket);
        if (sla) {
          (savedTicket as any).sla_id = sla.id;
          (savedTicket as any).due_date = this.calculateDueDate(sla);
          await this.ticketRepository.save(savedTicket);
        }
      } catch (slaError) {
        console.warn('Failed to apply SLA:', slaError.message);
      }

      // Emit event for AI processing, auto-assignment, etc.
      try {
        this.eventEmitter.emit('ticket.created', savedTicket);
      } catch (eventError) {
        console.warn('Failed to emit ticket.created event:', eventError.message);
      }

      return savedTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new BadRequestException(`Failed to create ticket: ${error.message}`);
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['customer', 'assigned_agent', 'creator'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  /**
   * Update ticket
   */
  async updateTicket(id: string, updateDto: UpdateTicketDto): Promise<SupportTicket> {
    const ticket = await this.getTicketById(id);

    Object.assign(ticket, updateDto);

    // Track status changes
    if (updateDto.status) {
      if (updateDto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
      if (updateDto.status === TicketStatus.CLOSED && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
    }

    const updated = await this.ticketRepository.save(ticket);

    this.eventEmitter.emit('ticket.updated', { ticket: updated, changes: updateDto });

    return updated;
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(ticketId: string, agentId: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);

    (ticket as any).assignedTo = agentId;
    ticket.status = TicketStatus.OPEN;

    const updated = await this.ticketRepository.save(ticket);

    this.eventEmitter.emit('ticket.assigned', { ticket: updated, agent_id: agentId });

    return updated;
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(ticketId: string, escalateToId: string, reason: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);

    (ticket as any).isEscalated = true;
    (ticket as any).escalatedTo = escalateToId;
    (ticket as any).escalatedAt = new Date();
    ticket.priority = TicketPriority.URGENT; // Auto-increase priority

    const updated = await this.ticketRepository.save(ticket);

    this.eventEmitter.emit('ticket.escalated', { 
      ticket: updated, 
      escalated_to: escalateToId, 
      reason 
    });

    return updated;
  }

  /**
   * Add response to ticket
   */
  async addResponse(ticketId: string, response: string, userId: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);

    (ticket as any).responseCount = ((ticket as any).responseCount || 0) + 1;

    // Track first response time
    if (!ticket.firstRespondedAt) {
      ticket.firstRespondedAt = new Date();
    }

    const updated = await this.ticketRepository.save(ticket);

    this.eventEmitter.emit('ticket.response_added', { 
      ticket: updated, 
      response, 
      user_id: userId 
    });

    return updated;
  }

  /**
   * Search tickets with advanced filters
   */
  async searchTickets(criteria: TicketSearchCriteria): Promise<SupportTicket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (criteria.status && criteria.status.length > 0) {
      query.andWhere('ticket.status IN (:...status)', { status: criteria.status });
    }

    if (criteria.priority && criteria.priority.length > 0) {
      query.andWhere('ticket.priority IN (:...priority)', { priority: criteria.priority });
    }

    if (criteria.assigned_to) {
      query.andWhere('ticket.assigned_to = :assigned_to', { assigned_to: criteria.assigned_to });
    }

    if (criteria.customer_id) {
      query.andWhere('ticket.customer_id = :customer_id', { customer_id: criteria.customer_id });
    }

    if (criteria.category) {
      query.andWhere('ticket.category = :category', { category: criteria.category });
    }

    if (criteria.created_after) {
      query.andWhere('ticket.createdAt >= :created_after', { created_after: criteria.created_after });
    }

    if (criteria.created_before) {
      query.andWhere('ticket.createdAt <= :created_before', { created_before: criteria.created_before });
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query.andWhere('ticket.tags && ARRAY[:...tags]', { tags: criteria.tags });
    }

    query.leftJoinAndSelect('ticket.customer', 'customer');
    query.leftJoinAndSelect('ticket.assigned_agent', 'assigned_agent');
    query.orderBy('ticket.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * Get ticket statistics
   */
  async getTicketStatistics(timeRange?: { start: Date; end: Date }) {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (timeRange) {
      query.where('ticket.createdAt BETWEEN :start AND :end', timeRange);
    }

    const total = await query.getCount();
    const newTickets = await query.clone().andWhere('ticket.status = :status', { status: TicketStatus.OPEN }).getCount();
    const openTickets = await query.clone().andWhere('ticket.status = :status', { status: TicketStatus.OPEN }).getCount();
    const resolvedTickets = await query.clone().andWhere('ticket.status = :status', { status: TicketStatus.RESOLVED }).getCount();
    const closedTickets = await query.clone().andWhere('ticket.status = :status', { status: TicketStatus.CLOSED }).getCount();

    const avgResolutionTime = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)))', 'avg')
      .where('ticket.resolvedAt IS NOT NULL')
      .getRawOne();

    return {
      total,
      by_status: {
        new: newTickets,
        open: openTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      average_resolution_time_hours: avgResolutionTime?.avg ? avgResolutionTime.avg / 3600 : 0,
    };
  }

  /**
   * Check SLA compliance and trigger escalations
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkSLACompliance(): Promise<void> {
    const activeTickets = await this.ticketRepository.find({
      where: {
        status: In([TicketStatus.OPEN, TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
      },
    });

    for (const ticket of activeTickets) {
      if (!(ticket as any).slaId) continue;

      const sla = await this.slaRepository.findOne({ where: { id: (ticket as any).slaId } });
      if (!sla) continue;

      const now = new Date();
      const createdAt = new Date(ticket.createdAt);
      const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      // Check first response SLA
      if (!ticket.firstRespondedAt && sla.sla_targets.first_response_time_minutes) {
        if (minutesElapsed > sla.sla_targets.first_response_time_minutes) {
          await this.handleSLABreach(ticket, sla, 'first_response');
        }
      }

      // Check resolution time SLA
      if (!ticket.resolvedAt && sla.sla_targets.resolution_time_hours) {
        const hoursElapsed = minutesElapsed / 60;
        if (hoursElapsed > sla.sla_targets.resolution_time_hours) {
          await this.handleSLABreach(ticket, sla, 'resolution');
        }
      }

      // Check for auto-escalation
      if (sla.auto_escalate && sla.escalation_rules) {
        for (const rule of sla.escalation_rules) {
          if (minutesElapsed > rule.trigger_after_minutes && !ticket.escalatedTo) {
            await this.autoEscalateTicket(ticket, rule);
          }
        }
      }
    }
  }

  /**
   * Search knowledge base for relevant articles
   */
  async searchKnowledgeBase(query: string, limit: number = 10): Promise<KnowledgeBaseArticle[]> {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const articles = await this.knowledgeBaseRepository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: 'PUBLISHED' })
      .andWhere(
        '(article.title ILIKE :query OR article.content ILIKE :query OR article.summary ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('article.search_rank', 'DESC')
      .addOrderBy('article.view_count', 'DESC')
      .limit(safeLimit)
      .getMany();

    return articles;
  }

  /**
   * AI-powered ticket auto-assignment
   */
  async autoAssignTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);

    // AI logic to find best agent (simplified for now)
    // In production, this would use ML models to match ticket characteristics
    // with agent skills, availability, and performance

    const bestAgentId = await this.findBestAgent(ticket);
    
    if (bestAgentId) {
      return await this.assignTicket(ticketId, bestAgentId);
    }

    return ticket;
  }

  // ============= Private Helper Methods =============

  private async generateTicketNumber(): Promise<string> {
    const count = await this.ticketRepository.count();
    const year = new Date().getFullYear();
    return `TKT-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async findApplicableSLA(ticket: SupportTicket): Promise<SLA | null> {
    const slas = await this.slaRepository.find({ 
      where: { status: 'active' as any as any } as any,
      order: { priority_weight: 'DESC' }
    });

    for (const sla of slas) {
      if (sla.applicable_priority && !sla.applicable_priority.includes(ticket.priority)) {
        continue;
      }
      if (sla.applicable_category && !sla.applicable_category.includes(ticket.category)) {
        continue;
      }
      return sla;
    }

    return slas[0] || null; // Return highest priority or null
  }

  private calculateDueDate(sla: SLA): Date {
    const now = new Date();
    const hoursToAdd = sla.sla_targets.resolution_time_hours;
    
    if (sla.business_hours_only && sla.business_hours) {
      // Complex business hours calculation would go here
      // For now, simplified version
      return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  private async handleSLABreach(ticket: SupportTicket, sla: SLA, breachType: string): Promise<void> {
    sla.breach_count += 1;
    await this.slaRepository.save(sla);

    this.eventEmitter.emit('sla.breach', {
      ticket,
      sla,
      breach_type: breachType,
      breach_time: new Date(),
    });

    if (sla.breach_actions && Array.isArray(sla.breach_actions)) {
      const autoEscalateAction = sla.breach_actions.find((a: any) => a.auto_escalate);
      if (autoEscalateAction && !ticket.escalatedTo) {
        // Find appropriate escalation target
        const escalationTarget = await this.findEscalationTarget(ticket, sla);
        if (escalationTarget) {
          await this.escalateTicket(ticket.id, escalationTarget, `SLA ${breachType} breach`);
        }
      }
    }
  }

  private async autoEscalateTicket(ticket: SupportTicket, escalationRule: any): Promise<void> {
    // Find user with the escalation role
    const escalationTarget = await this.findUserByRole(escalationRule.escalate_to_role);
    
    if (escalationTarget) {
      await this.escalateTicket(
        ticket.id, 
        escalationTarget, 
        `Auto-escalation: ${escalationRule.level}`
      );
    }
  }

  private async findBestAgent(ticket: SupportTicket): Promise<string | null> {
    // Simplified agent selection
    // In production, this would involve:
    // - Agent skills matching
    // - Current workload analysis
    // - Performance metrics
    // - Availability status
    // - Language proficiency
    // - Customer history
    
    // For now, return null to indicate manual assignment needed
    return null;
  }

  private async findEscalationTarget(ticket: SupportTicket, sla: SLA): Promise<string | null> {
    // Find appropriate manager or senior agent
    return null;
  }

  private async findUserByRole(role: string): Promise<string | null> {
    // Query users by role
    return null;
  }
}
