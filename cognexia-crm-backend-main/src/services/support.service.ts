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
  organizationId?: string;
  submittedBy?: string;
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

export interface CreateKnowledgeBaseArticleDto {
  title: string;
  content: string;
  summary?: string;
  type?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  visibility?: string;
  attachments?: any[];
  videoLinks?: any[];
  authorId?: string;
  organizationId?: string;
}

export interface UpdateKnowledgeBaseArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  status?: string;
  type?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  visibility?: string;
  organizationId?: string | null;
}

export interface KnowledgeBaseFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  organizationId?: string;
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
       ticketNumber: ticketNumber,
        subject: createDto.subject || 'No Subject',
        description: createDto.description || '',
        priority: createDto.priority || TicketPriority.MEDIUM,
        category: createDto.category,
        channel: createDto.channel || 'web',
        customer_id: createDto.customer_id,
        created_by: createDto.created_by,
        organizationId: createDto.organizationId,
        submittedBy: createDto.submittedBy,
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
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  /**
   * Delete ticket by ID
   */
  async deleteTicket(id: string): Promise<{ message: string }> {
    const ticket = await this.getTicketById(id);
    await this.ticketRepository.remove(ticket);
    return { message: `Ticket ${id} deleted successfully` };
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

    const inProgressTickets = await query.clone().andWhere('ticket.status = :status', { status: TicketStatus.IN_PROGRESS }).getCount();

    return {
      total,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      avgSatisfactionRating: 0,
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

    return articles.map((article) => this.serializeArticle(article));
  }

  async listKnowledgeBaseArticles(filters: KnowledgeBaseFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 20);
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const sortBy = this.normalizeSortBy(filters.sortBy);

    const query = this.knowledgeBaseRepository.createQueryBuilder('article');

    const status = this.normalizeEnum(filters.status, 'status');
    if (status) {
      query.andWhere('article.status = :status', { status });
    }

    const type = this.normalizeEnum(filters.type, 'type');
    if (type) {
      query.andWhere('article.type = :type', { type });
    }

    if (filters.category) {
      query.andWhere('article.category = :category', { category: filters.category });
    }

    if (filters.search) {
      query.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search OR article.summary ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.organizationId) {
      query.andWhere('article.organization_id = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    query.orderBy(sortBy, sortOrder).skip((page - 1) * limit).take(limit);

    const [articles, total] = await query.getManyAndCount();

    return {
      data: articles.map((article) => this.serializeArticle(article)),
      total,
      page,
      limit,
    };
  }

  async getKnowledgeBaseArticleById(id: string) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id }, relations: ['author', 'organization'] });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    return this.serializeArticle(article);
  }

  async createKnowledgeBaseArticle(createDto: CreateKnowledgeBaseArticleDto, authorId?: string) {
    if (!authorId) {
      throw new BadRequestException('Author is required to create an article');
    }

    const articleNumber = await this.generateArticleNumber();
    const article = this.knowledgeBaseRepository.create({
      article_number: articleNumber,
      title: createDto.title,
      content: createDto.content,
      summary: createDto.summary || null,
      type: this.normalizeEnum(createDto.type, 'type') || 'HOW_TO',
      visibility: this.normalizeEnum(createDto.visibility, 'visibility') || 'INTERNAL',
      category: createDto.category || null,
      tags: createDto.tags || [],
      keywords: createDto.keywords || [],
      author_id: authorId,
      organization_id: createDto.organizationId || null,
      status: 'DRAFT',
      attachments: createDto.attachments || [],
      video_links: createDto.videoLinks || [],
    } as any);

    const saved = await this.knowledgeBaseRepository.save(article);
    return this.serializeArticle(saved);
  }

  async updateKnowledgeBaseArticle(id: string, updateDto: UpdateKnowledgeBaseArticleDto) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }

    Object.assign(article, {
      title: updateDto.title ?? article.title,
      content: updateDto.content ?? article.content,
      summary: updateDto.summary ?? article.summary,
      status: this.normalizeEnum(updateDto.status, 'status') || article.status,
      type: this.normalizeEnum(updateDto.type, 'type') || article.type,
      visibility: this.normalizeEnum(updateDto.visibility, 'visibility') || article.visibility,
      category: updateDto.category ?? article.category,
      tags: updateDto.tags ?? article.tags,
      keywords: updateDto.keywords ?? article.keywords,
      organization_id:
        typeof updateDto.organizationId === 'undefined'
          ? article.organization_id
          : updateDto.organizationId,
    });

    const saved = await this.knowledgeBaseRepository.save(article);
    return this.serializeArticle(saved);
  }

  async deleteKnowledgeBaseArticle(id: string) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    await this.knowledgeBaseRepository.remove(article);
  }

  async publishKnowledgeBaseArticle(id: string) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    (article as any).status = 'PUBLISHED';
    (article as any).published_at = new Date();
    const saved = await this.knowledgeBaseRepository.save(article);
    return this.serializeArticle(saved);
  }

  async rateKnowledgeBaseArticle(id: string, isHelpful: boolean) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    if (isHelpful) {
      article.helpful_count = (article.helpful_count || 0) + 1;
    } else {
      article.not_helpful_count = (article.not_helpful_count || 0) + 1;
    }
    const totalRatings = (article.helpful_count || 0) + (article.not_helpful_count || 0);
    article.average_rating = totalRatings > 0 ? (article.helpful_count / totalRatings) * 5 : 0;
    article.rating_count = totalRatings;
    const saved = await this.knowledgeBaseRepository.save(article);
    return this.serializeArticle(saved);
  }

  async incrementKnowledgeBaseView(id: string) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    article.view_count = (article.view_count || 0) + 1;
    const saved = await this.knowledgeBaseRepository.save(article);
    return this.serializeArticle(saved);
  }

  async getRelatedKnowledgeBaseArticles(id: string) {
    const article = await this.knowledgeBaseRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Knowledge base article ${id} not found`);
    }
    if (!article.related_articles || article.related_articles.length === 0) {
      return [];
    }
    const related = await this.knowledgeBaseRepository.find({
      where: { id: In(article.related_articles) },
    });
    return related.map((item) => this.serializeArticle(item));
  }

  async getKnowledgeBaseStats() {
    const [totalArticles, published, drafts, allArticles] = await Promise.all([
      this.knowledgeBaseRepository.count(),
      this.knowledgeBaseRepository.count({ where: { status: 'PUBLISHED' as any } }),
      this.knowledgeBaseRepository.count({ where: { status: 'DRAFT' as any } }),
      this.knowledgeBaseRepository.find({ select: ['type', 'view_count', 'helpful_count', 'not_helpful_count'] }),
    ]);

    const totalViews = allArticles.reduce((sum, article) => sum + (article.view_count || 0), 0);
    const totalHelpful = allArticles.reduce((sum, article) => sum + (article.helpful_count || 0), 0);
    const totalNotHelpful = allArticles.reduce((sum, article) => sum + (article.not_helpful_count || 0), 0);
    const totalRatings = totalHelpful + totalNotHelpful;
    const avgHelpfulness = totalRatings > 0 ? (totalHelpful / totalRatings) * 100 : 0;

    const byType: Record<string, number> = {};
    allArticles.forEach((article) => {
      const key = this.toClientEnum(article.type);
      byType[key] = (byType[key] || 0) + 1;
    });

    return {
      totalArticles,
      published,
      drafts,
      totalViews,
      avgHelpfulness,
      byType,
    };
  }

  async getFeaturedArticles(limit: number = 5) {
    const safeLimit = Math.max(1, Number(limit) || 5);
    const featured = await this.knowledgeBaseRepository.find({
      where: { is_featured: true as any },
      order: { created_at: 'DESC' as any },
      take: safeLimit,
    });
    return featured.map((article) => this.serializeArticle(article));
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

  private async generateArticleNumber(): Promise<string> {
    const count = await this.knowledgeBaseRepository.count();
    const year = new Date().getFullYear();
    return `KB-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private normalizeEnum(value: string | undefined, type: 'status' | 'visibility' | 'type'): string | undefined {
    if (!value) return undefined;
    const normalized = value.toString().toUpperCase();
    const map: Record<string, string[]> = {
      status: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'],
      visibility: ['PUBLIC', 'INTERNAL', 'CUSTOMER', 'PARTNER'],
      type: ['HOW_TO', 'TROUBLESHOOTING', 'FAQ', 'BEST_PRACTICE', 'POLICY', 'ANNOUNCEMENT', 'TUTORIAL'],
    };
    return map[type].includes(normalized) ? normalized : undefined;
  }

  private toClientEnum(value?: string) {
    return value ? value.toString().toLowerCase() : '';
  }

  private normalizeSortBy(sortBy?: string) {
    switch (sortBy) {
      case 'updatedAt':
        return 'article.updated_at';
      case 'viewCount':
        return 'article.view_count';
      case 'title':
        return 'article.title';
      default:
        return 'article.created_at';
    }
  }

  private serializeArticle(article: KnowledgeBaseArticle) {
    return {
      id: article.id,
      articleNumber: article.article_number,
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      status: this.toClientEnum(article.status),
      visibility: this.toClientEnum(article.visibility),
      type: this.toClientEnum(article.type),
      category: article.category || '',
      tags: article.tags || [],
      keywords: article.keywords || [],
      viewCount: article.view_count || 0,
      helpfulCount: article.helpful_count || 0,
      notHelpfulCount: article.not_helpful_count || 0,
      relatedArticles: article.related_articles || [],
      attachments: article.attachments || [],
      videoLinks: article.video_links || [],
      organizationId: article.organization_id || undefined,
      organizationName: article.organization ? (article.organization as any).name : undefined,
      author: article.author_id,
      authorName: article.author ? (article.author as any).fullName || article.author?.email : undefined,
      publishedAt: article.published_at ? article.published_at.toISOString() : undefined,
      createdAt: article.created_at ? article.created_at.toISOString() : undefined,
      updatedAt: article.updated_at ? article.updated_at.toISOString() : undefined,
    };
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
