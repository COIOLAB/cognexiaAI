import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

// Entities
import { MarketingCampaign, CampaignStatus } from '../entities/marketing-campaign.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { MarketingAnalytics, AnalyticsEventType } from '../entities/marketing-analytics.entity';
import { CustomerSegment } from '../entities/customer-segment.entity';
import { Customer } from '../entities/customer.entity';
import { GeneratedContent } from '../entities/generated-content.entity';

// DTOs
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateCustomerSegmentDto,
  EmailTemplateDto,
  UpdateEmailTemplateDto,
  SendEmailCampaignDto,
  MarketingAnalyticsRequestDto,
  LeadScoringConfigDto,
  MarketingAutomationWorkflowDto,
} from '../dto/marketing.dto';

// External Services
import { AICustomerIntelligenceService } from './AICustomerIntelligenceService';
import { QuantumPersonalizationEngine } from './QuantumPersonalizationEngine';
import { AdvancedPredictiveAnalyticsService } from './AdvancedPredictiveAnalyticsService';
import { LLMService } from './llm.service';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    @InjectRepository(MarketingAnalytics)
    private readonly analyticsRepository: Repository<MarketingAnalytics>,
    @InjectRepository(CustomerSegment)
    private readonly segmentRepository: Repository<CustomerSegment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(GeneratedContent)
    private readonly generatedContentRepository: Repository<GeneratedContent>,
    private readonly eventEmitter: EventEmitter2,
    private readonly aiCustomerIntelligence: AICustomerIntelligenceService,
    private readonly quantumPersonalization: QuantumPersonalizationEngine,
    private readonly predictiveAnalytics: AdvancedPredictiveAnalyticsService,
    private readonly llmService: LLMService,
  ) {}

  // ==================== CAMPAIGN MANAGEMENT ====================

  async createCampaign(createCampaignDto: CreateCampaignDto, createdBy: string): Promise<MarketingCampaign> {
    try {
      const { targetSegments, ...campaignData } = createCampaignDto;
      const campaign = this.campaignRepository.create({
        ...campaignData,
        startDate: new Date(createCampaignDto.startDate),
        endDate: new Date(createCampaignDto.endDate),
        createdBy,
        updatedBy: createdBy,
      });

      const savedCampaign = await this.campaignRepository.save(campaign);

      // Load target segments if provided
      if (targetSegments?.length) {
        const segments = await this.segmentRepository.findBy({
          id: In(targetSegments),
        });
        savedCampaign.targetSegments = segments;
        await this.campaignRepository.save(savedCampaign);
      }

      // Emit campaign created event
      this.eventEmitter.emit('campaign.created', savedCampaign);

      this.logger.log(`Campaign created: ${savedCampaign.id}`);
      return savedCampaign;
    } catch (error) {
      this.logger.error(`Failed to create campaign: ${error.message}`);
      throw new BadRequestException('Failed to create campaign');
    }
  }

  // ==================== CONTENT LIBRARY ====================

  async listGeneratedContent(organizationId: string, contentType?: string): Promise<GeneratedContent[]> {
    const query = this.generatedContentRepository.createQueryBuilder('content')
      .where('content.organizationId = :organizationId', { organizationId });

    if (contentType) {
      query.andWhere('content.contentType = :contentType', { contentType });
    }

    return query.orderBy('content.createdAt', 'DESC').getMany();
  }

  async createGeneratedContent(
    organizationId: string,
    payload: {
      contentType: string;
      prompt: string;
      generatedText: string;
      model?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<GeneratedContent> {
    const content = this.generatedContentRepository.create({
      organizationId,
      contentType: payload.contentType,
      prompt: payload.prompt,
      generatedText: payload.generatedText,
      model: payload.model || 'manual',
      metadata: payload.metadata,
    });

    return this.generatedContentRepository.save(content);
  }

  async getAllCampaigns(filters?: {
    status?: CampaignStatus;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MarketingCampaign[]> {
    try {
      const query = this.campaignRepository.createQueryBuilder('campaign')
        .leftJoinAndSelect('campaign.targetSegments', 'segments');

      if (filters?.status) {
        query.andWhere('campaign.status = :status', { status: filters.status });
      }

      if (filters?.type) {
        query.andWhere('campaign.type = :type', { type: filters.type });
      }

      if (filters?.startDate && filters?.endDate) {
        query.andWhere('campaign.startDate BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      const campaigns = await query.orderBy('campaign.createdAt', 'DESC').getMany();
      return campaigns || [];
    } catch (error) {
      this.logger.error(`Error fetching campaigns: ${error.message}`);
      return [];
    }
  }

  async getCampaignById(id: string): Promise<MarketingCampaign> {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id },
        relations: ['targetSegments'],
      });

      return campaign || null;
    } catch (error) {
      this.logger.error(`Error fetching campaign ${id}: ${error.message}`);
      return null;
    }
  }

  async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto, updatedBy: string): Promise<MarketingCampaign> {
    const campaign = await this.getCampaignById(id);

    Object.assign(campaign, {
      ...updateCampaignDto,
      updatedBy,
    });

    const updatedCampaign = await this.campaignRepository.save(campaign);

    // Emit campaign updated event
    this.eventEmitter.emit('campaign.updated', updatedCampaign);

    this.logger.log(`Campaign updated: ${updatedCampaign.id}`);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.getCampaignById(id);
    await this.campaignRepository.remove(campaign);

    // Emit campaign deleted event
    this.eventEmitter.emit('campaign.deleted', { id });

    this.logger.log(`Campaign deleted: ${id}`);
  }

  async sendCampaign(id: string) {
    try {
      const campaign = await this.getCampaignById(id);
      if (!campaign) {
        return null;
      }
      
      // Update campaign status
      campaign.status = CampaignStatus.ACTIVE;
      await this.campaignRepository.save(campaign);

      // Emit campaign sent event
      this.eventEmitter.emit('campaign.sent', campaign);

      this.logger.log(`Campaign sent: ${id}`);
      return {
        sent: true,
        campaignId: id,
        recipients: 0, // Would be calculated from target segments
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error sending campaign ${id}:`, error.message);
      return null;
    }
  }

  async getCampaignAnalytics(id: string) {
    try {
      const campaign = await this.getCampaignById(id);
      
      if (!campaign) {
        return {
          campaignId: id,
          campaignName: '',
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          conversions: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          revenue: 0,
          roi: 0,
          topLinks: [],
          timeline: [],
        };
      }
      
      // Mock analytics - would pull from actual analytics data
      return {
        campaignId: id,
        campaignName: campaign.name,
        sent: 1500,
        delivered: 1425,
        opened: 685,
        clicked: 142,
        conversions: 35,
        openRate: 48.1,
        clickRate: 9.5,
        conversionRate: 2.3,
        revenue: 15750,
        roi: 315,
        topLinks: [
          { url: 'https://example.com/product-1', clicks: 45 },
          { url: 'https://example.com/product-2', clicks: 38 },
        ],
        timeline: [
          { date: '2024-01-01', opens: 150, clicks: 30 },
          { date: '2024-01-02', opens: 120, clicks: 25 },
        ],
      };
    } catch (error) {
      this.logger.error(`Error fetching campaign analytics: ${error.message}`);
      return {
        campaignId: id,
        campaignName: '',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenue: 0,
        roi: 0,
        topLinks: [],
        timeline: [],
      };
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  async createEmailTemplate(templateDto: EmailTemplateDto, createdBy: string): Promise<EmailTemplate> {
    const template = this.templateRepository.create({
      ...templateDto,
      createdBy,
      updatedBy: createdBy,
    });

    return await this.templateRepository.save(template);
  }

  async getAllEmailTemplates(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ templates: EmailTemplate[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 10));

    try {
      const query = this.templateRepository.createQueryBuilder('template');

      if (params?.category) {
        query.where('template.category = :category', { category: params.category });
      }

      const [templates, total] = await query
        .orderBy('template.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        templates: templates || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Error fetching email templates: ${error.message}`);
      return { templates: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate> {
    try {
      const template = await this.templateRepository.findOne({ where: { id } });
      return template || null;
    } catch (error) {
      this.logger.error(`Error fetching email template ${id}: ${error.message}`);
      return null;
    }
  }

  async getTemplateStats(): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    draftTemplates: number;
  }> {
    const totalTemplates = await this.templateRepository.count();
    // Treat NULL isActive as active (column default is true)
    const activeTemplates = await this.templateRepository
      .createQueryBuilder('template')
      .where('template.isActive = true OR template.isActive IS NULL')
      .getCount();

    return {
      totalTemplates,
      activeTemplates,
      draftTemplates: totalTemplates - activeTemplates,
    };
  }

  async updateEmailTemplate(
    id: string,
    templateDto: UpdateEmailTemplateDto,
    updatedBy: string,
  ): Promise<EmailTemplate> {
    const existingTemplate = await this.templateRepository.findOne({ where: { id } });
    if (!existingTemplate) {
      throw new NotFoundException('Email template not found');
    }

    Object.assign(existingTemplate, templateDto, { updatedBy });
    return this.templateRepository.save(existingTemplate);
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const existingTemplate = await this.templateRepository.findOne({ where: { id } });
    if (!existingTemplate) {
      throw new NotFoundException('Email template not found');
    }
    await this.templateRepository.remove(existingTemplate);
  }

  async duplicateEmailTemplate(id: string, createdBy: string): Promise<EmailTemplate> {
    const existingTemplate = await this.templateRepository.findOne({ where: { id } });
    if (!existingTemplate) {
      throw new NotFoundException('Email template not found');
    }

    const copy = this.templateRepository.create({
      ...existingTemplate,
      id: undefined,
      name: `${existingTemplate.name} Copy`,
      usageCount: 0,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy,
      updatedBy: createdBy,
    });

    return this.templateRepository.save(copy);
  }

  // ==================== CAMPAIGN EXECUTION ====================

  async sendEmailCampaign(sendEmailDto: SendEmailCampaignDto): Promise<{ sent: number; failed: number }> {
    try {
      const campaign = await this.getCampaignById(sendEmailDto.campaignId);
      const template = await this.getEmailTemplateById(sendEmailDto.templateId);
      
      // Get customers from target segments
      const segments = await this.segmentRepository.findBy({
        id: In(sendEmailDto.segmentIds),
      });

      let customers: Customer[] = [];
      for (const segment of segments) {
        const segmentCustomers = await this.getCustomersInSegment(segment);
        customers = customers.concat(segmentCustomers);
      }

      // Remove duplicates
      customers = customers.filter((customer, index, self) =>
        index === self.findIndex((c) => c.id === customer.id)
      );

      let sent = 0;
      let failed = 0;

      // Process email sending
      for (const customer of customers) {
        try {
          // In real implementation, would integrate with email service (SendGrid, AWS SES, etc.)
          await this.sendEmailToCustomer(customer, template, campaign);
          
          sent++;
        } catch (error) {
          this.logger.error(`Failed to send email to customer ${customer.id}: ${error.message}`);
          failed++;
        }
      }

      // Update campaign metrics
      await this.updateCampaignMetrics(campaign.id, { emailsSent: sent, emailsFailed: failed });

      return { sent, failed };
    } catch (error) {
      this.logger.error(`Failed to send email campaign: ${error.message}`);
      throw new BadRequestException('Failed to send email campaign');
    }
  }

  private async sendEmailToCustomer(customer: Customer, template: EmailTemplate, campaign: MarketingCampaign): Promise<void> {
    const email = customer.primaryContact?.email;
    if (!email) {
        this.logger.warn(`Skipping email for customer ${customer.id}: No email address found`);
        return;
    }

    this.logger.log(`Generating personalized content for ${email} for campaign ${campaign.name}`);

    // Generate personalized content using LLM
    const personalizedContent = await this.generatePersonalizedEmailContent(customer, template, campaign);

    // In real implementation, would use email service provider (SendGrid, AWS SES, etc.)
    // For now, we log the personalized content to demonstrate the LLM integration
    this.logger.log(`Sending email to ${email}:
      Subject: ${personalizedContent.subject}
      Body Preview: ${personalizedContent.body.substring(0, 100)}...
      Personalization Score: ${personalizedContent.personalizationScore}
    `);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Track the email sent event with personalized content metadata
    await this.recordAnalyticsEvent({
      campaignId: campaign.id,
      customerId: customer.id,
      eventType: AnalyticsEventType.EMAIL_SENT,
      eventData: {
        subject: personalizedContent.subject,
        personalizationScore: personalizedContent.personalizationScore,
        emailBodyLength: personalizedContent.body.length,
      },
    });
  }

  private async generatePersonalizedEmailContent(
    customer: Customer, 
    template: EmailTemplate, 
    campaign: MarketingCampaign
  ): Promise<{ subject: string; body: string; personalizationScore: number }> {
    const templateBody = template.bodyText || template.bodyHtml || '';
    const contactName = `${customer.primaryContact?.firstName || ''} ${customer.primaryContact?.lastName || ''}`.trim();

    try {
        const prompt = `
            You are an expert marketing copywriter. Create a personalized email for a customer based on the following details:

            Customer Profile:
            - Company: ${customer.companyName}
            - Industry: ${customer.industry}
            - Contact: ${contactName}
            - Recent Interactions: ${JSON.stringify(customer.interactions?.slice(0, 3) || [])}

            Campaign Details:
            - Name: ${campaign.name}
            - Type: ${campaign.type}
            - Goal: ${campaign.objectives}

            Email Template:
            - Subject: ${template.subject}
            - Body Structure: ${templateBody}

            Task:
            1. Personalize the subject line to grab attention.
            2. Rewrite the body to be highly relevant to the customer's industry and recent interactions.
            3. Maintain the core message of the campaign.
            4. Rate the personalization level (0-1).

            Return ONLY a JSON object with keys: "subject", "body", "personalizationScore".
        `;

        const completion = await this.llmService.generateCompletion(prompt);
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        this.logger.warn(`Failed to generate personalized content for ${customer.id}, using default template: ${error.message}`);
    }

    // Fallback to static template
    return {
        subject: template.subject,
        body: templateBody
            .replace('{{firstName}}', customer.primaryContact?.firstName || 'Customer')
            .replace('{{companyName}}', customer.companyName),
        personalizationScore: 0
    };
  }

  // ==================== ANALYTICS ====================

  async recordAnalyticsEvent(eventData: {
    campaignId: string;
    customerId?: string;
    segmentId?: string;
    eventType: AnalyticsEventType;
    eventData?: any;
    revenue?: number;
    currency?: string;
  }): Promise<MarketingAnalytics> {
    const analytics = this.analyticsRepository.create({
      ...eventData,
      eventDate: new Date(),
    });

    return await this.analyticsRepository.save(analytics);
  }

  async getMarketingAnalytics(request: MarketingAnalyticsRequestDto): Promise<any> {
    const parsedStart = request.startDate ? new Date(request.startDate) : null;
    const parsedEnd = request.endDate ? new Date(request.endDate) : null;
    const validStart = parsedStart && !Number.isNaN(parsedStart.getTime()) ? parsedStart : null;
    const validEnd = parsedEnd && !Number.isNaN(parsedEnd.getTime()) ? parsedEnd : null;
    const endDate = validEnd || new Date();
    const startDate = validStart || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const query = this.analyticsRepository.createQueryBuilder('analytics')
      .leftJoinAndSelect('analytics.campaign', 'campaign')
      .leftJoinAndSelect('analytics.segment', 'segment')
      .where('analytics.eventDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (request.campaignIds?.length) {
      query.andWhere('analytics.campaignId IN (:...campaignIds)', {
        campaignIds: request.campaignIds,
      });
    }

    if (request.segmentIds?.length) {
      query.andWhere('analytics.segmentId IN (:...segmentIds)', {
        segmentIds: request.segmentIds,
      });
    }

    const rawData = await query.getMany();

    // Process and aggregate data based on groupBy parameter
    return this.aggregateAnalyticsData(rawData, request.groupBy || 'day');
  }

  private aggregateAnalyticsData(data: MarketingAnalytics[], groupBy: string): any {
    const summary = {
      totalEvents: data.length,
      totalRevenue: 0,
      eventBreakdown: {},
      campaignPerformance: {},
      conversionFunnel: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        ctr: 0, // Click-through rate
      },
    };

    // Aggregate data
    data.forEach((event) => {
      // Revenue
      const revenue = Number(event.revenue) || 0;
      summary.totalRevenue += revenue;

      // Event breakdown
      summary.eventBreakdown[event.eventType] = 
        (summary.eventBreakdown[event.eventType] || 0) + 1;

      // Campaign performance
      if (event.campaignId) {
          if (!summary.campaignPerformance[event.campaignId]) {
              summary.campaignPerformance[event.campaignId] = { events: 0, revenue: 0 };
          }
          summary.campaignPerformance[event.campaignId].events++;
          summary.campaignPerformance[event.campaignId].revenue += revenue;
      }

      // Update conversion funnel
      switch (event.eventType) {
        case AnalyticsEventType.IMPRESSION:
          summary.conversionFunnel.impressions++;
          break;
        case AnalyticsEventType.CLICK:
        case AnalyticsEventType.EMAIL_CLICK:
          summary.conversionFunnel.clicks++;
          break;
        case AnalyticsEventType.CONVERSION:
        case AnalyticsEventType.PURCHASE:
          summary.conversionFunnel.conversions++;
          break;
      }
    });

    // Calculate rates
    if (summary.conversionFunnel.impressions > 0) {
      summary.conversionFunnel.ctr = 
        (summary.conversionFunnel.clicks / summary.conversionFunnel.impressions) * 100;
      summary.conversionFunnel.conversionRate = 
        (summary.conversionFunnel.conversions / summary.conversionFunnel.impressions) * 100;
    }

    return summary;
  }

  // ==================== CUSTOMER SEGMENTATION ====================

  async listCustomerSegments(): Promise<CustomerSegment[]> {
    return this.segmentRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getCustomerSegment(segmentId: string): Promise<CustomerSegment | null> {
    return this.segmentRepository.findOne({ where: { id: segmentId } });
  }

  async getSegmentStats(): Promise<{
    totalSegments: number;
    activeSegments: number;
    totalContacts: number;
  }> {
    const [totalSegments, activeSegments, segments] = await Promise.all([
      this.segmentRepository.count(),
      this.segmentRepository.count({ where: { isActive: true } }),
      this.segmentRepository.find({ select: ['customerCount'] }),
    ]);

    const totalContacts = segments.reduce((sum, segment) => sum + (segment.customerCount || 0), 0);

    return { totalSegments, activeSegments, totalContacts };
  }

  async createCustomerSegment(segmentDto: CreateCustomerSegmentDto, createdBy: string): Promise<CustomerSegment> {
    const segment = this.segmentRepository.create({
      ...segmentDto,
      type: segmentDto.criteria as any, // Map to existing enum
      criteria: {
        rules: segmentDto.conditions.map(condition => ({
          field: condition.field,
          operator: condition.operator as any,
          value: condition.value,
        })),
        conditions: 'AND', // Default logic
      },
      createdBy,
      updatedBy: createdBy,
    });

    const savedSegment = await this.segmentRepository.save(segment);

    // Calculate initial segment size
    await this.recalculateSegment(savedSegment.id);

    return savedSegment;
  }

  async recalculateSegment(segmentId: string): Promise<void> {
    const segment = await this.segmentRepository.findOne({ where: { id: segmentId } });
    if (!segment) return;

    // Real calculation - query customers based on criteria
    const customers = await this.getCustomersInSegment(segment);
    const customerCount = customers.length;
    
    // Calculate value - sum of totalRevenue from salesMetrics
    // Assuming salesMetrics.totalRevenue is available
    const segmentValue = customers.reduce((sum, customer) => {
        return sum + (Number(customer.salesMetrics?.totalRevenue) || 0);
    }, 0);

    await this.segmentRepository.update(segmentId, {
      customerCount,
      segmentValue,
      lastCalculated: new Date(),
    });
  }

  /**
   * Helper to fetch customers belonging to a segment based on its criteria
   */
  private async getCustomersInSegment(segment: CustomerSegment): Promise<Customer[]> {
    if (!segment.criteria?.rules?.length) {
      return [];
    }

    const query = this.customerRepository.createQueryBuilder('customer');
    
    // Handle 'AND' vs 'OR' logic
    const isOr = segment.criteria.conditions === 'OR';

    segment.criteria.rules.forEach((rule, index) => {
      const paramName = `param${index}`;
      const value = rule.value;
      
      let condition = '';
      
      // Handle nested fields (JSONB)
      let field = rule.field;
      // Simple handling for common JSONB fields
      if (field.includes('.')) {
        const parts = field.split('.');
        if (['salesMetrics', 'demographics', 'primaryContact', 'segmentation', 'aiInsights'].includes(parts[0])) {
             const jsonCol = parts[0];
             const jsonKey = parts.slice(1).join('.');
             // Postgres JSONB syntax for text extraction
             field = `customer.${jsonCol} ->> '${jsonKey}'`;
             
             // Cast to numeric if comparing numbers
             if (['greater_than', 'less_than'].includes(rule.operator) && !isNaN(Number(value))) {
                 field = `CAST(customer.${jsonCol} ->> '${jsonKey}' AS DECIMAL)`;
             }
        } else {
             field = `customer.${field}`;
        }
      } else {
        field = `customer.${field}`;
      }

      switch (rule.operator) {
        case 'equals':
          condition = `${field} = :${paramName}`;
          break;
        case 'not_equals':
          condition = `${field} != :${paramName}`;
          break;
        case 'greater_than':
          condition = `${field} > :${paramName}`;
          break;
        case 'less_than':
          condition = `${field} < :${paramName}`;
          break;
        case 'contains':
          condition = `${field} LIKE :${paramName}`;
          break;
        case 'not_contains':
          condition = `${field} NOT LIKE :${paramName}`;
          break;
        case 'in':
          condition = `${field} IN (:...${paramName})`;
          break;
        case 'not_in':
          condition = `${field} NOT IN (:...${paramName})`;
          break;
      }

      if (index === 0) {
        query.where(condition, { [paramName]: rule.operator.includes('contains') ? `%${value}%` : value });
      } else {
        if (isOr) {
            query.orWhere(condition, { [paramName]: rule.operator.includes('contains') ? `%${value}%` : value });
        } else {
            query.andWhere(condition, { [paramName]: rule.operator.includes('contains') ? `%${value}%` : value });
        }
      }
    });

    return query.getMany();
  }

  // ==================== AI-POWERED FEATURES ====================

  async getPersonalizedRecommendations(customerId: string): Promise<any> {
    try {
      const profile = await this.quantumPersonalization.generateQuantumPersonalization(customerId);
      return {
        products: profile.personalizations.productRecommendations,
        content: profile.personalizations.contentMatrix,
        channels: profile.personalizations.channelOptimization,
        timing: profile.personalizations.timingRecommendations,
        campaign: profile.personalizations.campaignPersonalization,
        experience: profile.personalizations.experienceOptimization,
        insights: profile.quantumInsights,
        scores: profile.optimizationScores,
        recommendations: profile.quantumRecommendations,
        coherence: profile.quantumCoherence,
      };
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      return { recommendations: [], confidence: 0 };
    }
  }

  async predictCampaignPerformance(campaignId: string): Promise<any> {
    try {
      const campaign = await this.getCampaignById(campaignId);
      
      return await this.predictiveAnalytics.predictCampaignPerformance({
        campaignType: campaign.type,
        budget: campaign.budget,
        targetAudience: campaign.targetSegments?.length || 1,
        content: campaign.content,
        objectives: campaign.objectives,
      });
    } catch (error) {
      this.logger.error(`Failed to predict campaign performance: ${error.message}`);
      return {
        predictedReach: 0,
        predictedConversions: 0,
        predictedROI: 0,
        confidence: 0,
      };
    }
  }

  async getCustomerLifetimeValue(customerId: string): Promise<number> {
    try {
      const insights = await this.aiCustomerIntelligence.generateCustomerInsights(customerId);
      return insights.lifetimeValue || 0;
    } catch (error) {
      this.logger.error(`Failed to calculate CLV: ${error.message}`);
      return 0;
    }
  }

  // ==================== AUTOMATION & SCHEDULING ====================

  @Cron(CronExpression.EVERY_HOUR)
  async processCampaignScheduling(): Promise<void> {
    const scheduledCampaigns = await this.campaignRepository.find({
      where: {
        status: CampaignStatus.SCHEDULED,
        startDate: Between(new Date(), new Date(Date.now() + 60 * 60 * 1000)), // Next hour
      },
    });

    for (const campaign of scheduledCampaigns) {
      try {
        await this.activateCampaign(campaign.id);
      } catch (error) {
        this.logger.error(`Failed to activate scheduled campaign ${campaign.id}: ${error.message}`);
      }
    }
  }

  async activateCampaign(campaignId: string): Promise<void> {
    await this.campaignRepository.update(campaignId, {
      status: CampaignStatus.ACTIVE,
    });

    this.eventEmitter.emit('campaign.activated', { campaignId });
    this.logger.log(`Campaign activated: ${campaignId}`);
  }

  // ==================== HELPER METHODS ====================

  private async updateCampaignMetrics(campaignId: string, metrics: any): Promise<void> {
    const campaign = await this.getCampaignById(campaignId);
    const currentMetrics = campaign.metrics || {};

    const updatedMetrics = {
      ...currentMetrics,
      ...metrics,
    };

    await this.campaignRepository.update(campaignId, {
      metrics: updatedMetrics,
    });
  }

  async getCampaignROI(campaignId: string): Promise<number> {
    const campaign = await this.getCampaignById(campaignId);
    const analytics = await this.analyticsRepository.find({
      where: { campaignId },
    });

    const totalRevenue = analytics.reduce((sum, event) => sum + (event.revenue || 0), 0);
    const roi = campaign.budget > 0 ? ((totalRevenue - campaign.budget) / campaign.budget) * 100 : 0;

    return Math.round(roi * 100) / 100; // Round to 2 decimal places
  }
}
