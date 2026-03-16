import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { Contact } from '../entities/contact.entity';
import { CustomerInteraction } from '../entities/customer-interaction.entity';
import { SalesQuote } from '../entities/sales-quote.entity';
import { CustomerSegment } from '../entities/customer-segment.entity';

@Injectable()
export class CRMService {
  private readonly logger = new Logger(CRMService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(CustomerInteraction)
    private interactionRepository: Repository<CustomerInteraction>,
    @InjectRepository(SalesQuote)
    private quoteRepository: Repository<SalesQuote>,
    @InjectRepository(CustomerSegment)
    private segmentRepository: Repository<CustomerSegment>,
  ) {}

  // =================== CUSTOMER MANAGEMENT ===================

  async findAllCustomers(filters: any = {}, pagination: any = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const queryBuilder = this.customerRepository.createQueryBuilder('customer');

      // Apply filters
      if (filters.segment) {
        queryBuilder.andWhere('customer.customerType = :segment', { segment: filters.segment });
      }

      if (filters.region) {
        queryBuilder.andWhere("customer.address->>'region' = :region", { region: filters.region });
      }

      if (filters.industry) {
        queryBuilder.andWhere('customer.industry = :industry', { industry: filters.industry });
      }

      if (filters.status) {
        queryBuilder.andWhere('customer.status = :status', { status: filters.status });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(customer.companyName ILIKE :search OR customer.primaryContact->\'firstName\' ILIKE :search OR customer.primaryContact->\'lastName\' ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Add relations
      queryBuilder.leftJoinAndSelect('customer.leads', 'leads');
      queryBuilder.leftJoinAndSelect('customer.opportunities', 'opportunities');
      queryBuilder.leftJoinAndSelect('customer.contacts', 'contacts');

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [customers, total] = await queryBuilder.getManyAndCount();

      // Calculate summary statistics
      const summary = await this.getCustomerSummary();

      return {
        customers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
        summary,
      };
    } catch (error) {
      this.logger.error('Error finding customers:', error);
      throw error;
    }
  }

  async findCustomerById(id: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id },
        relations: ['leads', 'opportunities', 'contacts', 'interactions', 'quotes'],
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      return customer;
    } catch (error) {
      this.logger.error(`Error finding customer ${id}:`, error);
      throw error;
    }
  }

  async createCustomer(customerData: any, createdBy: string, organizationId?: string) {
    try {
      // Generate customer code
      const customerCode = await this.generateCustomerCode();

      const customerEntity = this.customerRepository.create({
        ...customerData,
        organizationId: organizationId || customerData.organizationId || customerData.orgId || null,
        customerCode,
        createdBy,
        updatedBy: createdBy,
      });
      
      if (Array.isArray(customerEntity)) {
        throw new Error('Failed to create customer entity');
      }

      const savedCustomer = await this.customerRepository.save(customerEntity) as unknown as Customer;
      
      this.logger.log(`Customer created: ${savedCustomer.id}`);
      return savedCustomer;
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updateData: any, updatedBy: string) {
    try {
      const customer = await this.findCustomerById(id);
      
      Object.assign(customer, updateData, { updatedBy });
      
      const updatedCustomer = await this.customerRepository.save(customer);
      this.logger.log(`Customer updated: ${id}`);
      
      return updatedCustomer;
    } catch (error) {
      this.logger.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  async deleteCustomer(id: string) {
    try {
      const customer = await this.findCustomerById(id);
      await this.customerRepository.remove(customer);
      
      this.logger.log(`Customer deleted: ${id}`);
      return { success: true, message: 'Customer deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  // =================== LEAD MANAGEMENT ===================

  async findAllLeads(filters: any = {}) {
    try {
      const queryBuilder = this.leadRepository.createQueryBuilder('lead');

      if (filters.status) {
        queryBuilder.andWhere('lead.status = :status', { status: filters.status });
      }

      if (filters.source) {
        queryBuilder.andWhere('lead.source = :source', { source: filters.source });
      }

      if (filters.score) {
        queryBuilder.andWhere('lead.score >= :score', { score: filters.score });
      }

      if (filters.assignedTo) {
        queryBuilder.andWhere('lead.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
      }

      const leads = await queryBuilder.getMany();
      const summary = await this.getLeadSummary();

      return { leads, summary };
    } catch (error) {
      this.logger.error('Error finding leads:', error);
      throw error;
    }
  }

  async createLead(leadData: any, createdBy: string) {
    try {
      const leadNumber = await this.generateLeadNumber();
      const score = this.calculateLeadScore(leadData);
      const qualification = this.qualifyLead(leadData, score);

      const leadEntity = this.leadRepository.create({
        ...leadData,
        leadNumber,
        score,
        qualification,
        assignedTo: this.assignLead(leadData),
        createdBy,
        updatedBy: createdBy,
      });
      
      if (Array.isArray(leadEntity)) {
        throw new Error('Failed to create lead entity');
      }

      const savedLead = await this.leadRepository.save(leadEntity) as unknown as Lead;
      this.logger.log(`Lead created: ${savedLead.id}`);
      
      return savedLead;
    } catch (error) {
      this.logger.error('Error creating lead:', error);
      throw error;
    }
  }

  async convertLeadToCustomer(leadId: string, conversionData: any, convertedBy: string) {
    try {
      const lead = await this.leadRepository.findOne({ where: { id: leadId } });
      
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }

      // Create customer from lead
      const customerData = {
        companyName: lead.contact.company || `${lead.contact.firstName} ${lead.contact.lastName}`,
        customerType: CustomerType.B2B,
        status: CustomerStatus.PROSPECT,
        industry: lead.demographics.industry || 'unknown',
        size: lead.demographics.companySize || 'unknown',
        primaryContact: lead.contact,
        demographics: lead.demographics,
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          communicationChannels: ['email'],
          marketingOptIn: true,
          newsletterOptIn: false,
          eventInvitations: false,
          privacySettings: {
            dataSharing: false,
            analytics: true,
            marketing: true,
          },
        },
        salesMetrics: {
          totalRevenue: 0,
          averageOrderValue: 0,
          paymentTerms: 'NET30',
          outstandingBalance: 0,
        },
        relationshipMetrics: {
          customerSince: new Date().toISOString(),
          loyaltyScore: 5,
          satisfactionScore: 5,
          npsScore: 0,
          interactionFrequency: 'weekly',
        },
        segmentation: {
          segment: 'prospect',
          tier: 'bronze',
          riskLevel: 'medium',
          growthPotential: 'medium',
        },
        tags: lead.tags,
      };

      const customer = await this.createCustomer(customerData, convertedBy, lead.organizationId);

      // Update lead as converted
      lead.status = LeadStatus.CONVERTED;
      lead.conversionData = {
        convertedDate: new Date().toISOString(),
        convertedBy,
        conversionValue: conversionData.value || 0,
        conversionNote: conversionData.note || '',
        customerId: (customer as Customer).id,
      };

      await this.leadRepository.save(lead);

      this.logger.log(`Lead converted to customer: ${leadId} -> ${customer.id}`);
      return { customer, lead };
    } catch (error) {
      this.logger.error(`Error converting lead ${leadId}:`, error);
      throw error;
    }
  }

  // =================== OPPORTUNITY MANAGEMENT ===================

  async getSalesPipeline(filters: any = {}) {
    try {
      const queryBuilder = this.opportunityRepository.createQueryBuilder('opportunity')
        .leftJoinAndSelect('opportunity.customer', 'customer');

      if (filters.timeframe) {
        const dateFilter = this.getTimeframeFilter(filters.timeframe);
        queryBuilder.andWhere('opportunity.expectedCloseDate BETWEEN :start AND :end', dateFilter);
      }

      if (filters.salesRep) {
        queryBuilder.andWhere('opportunity.salesRep = :salesRep', { salesRep: filters.salesRep });
      }

      const opportunities = await queryBuilder.getMany();

      // Calculate pipeline statistics
      const summary = this.calculatePipelineSummary(opportunities);
      const stageAnalysis = this.analyzePipelineStages(opportunities);
      const forecast = this.generateForecast(opportunities);

      return {
        summary,
        stages: stageAnalysis,
        opportunities: opportunities.slice(0, 10), // Return top 10 for display
        forecast,
      };
    } catch (error) {
      this.logger.error('Error getting sales pipeline:', error);
      throw error;
    }
  }

  // =================== ANALYTICS & REPORTING ===================

  async getCRMAnalytics(timeRange = '30d') {
    try {
      const dateFilter = this.getDateRangeFilter(timeRange);
      
      // Customer analytics
      const customerStats = await this.getCustomerAnalytics(dateFilter);
      const segmentAnalysis = await this.getSegmentAnalysis();
      const salesPerformance = await this.getSalesPerformanceAnalytics(dateFilter);
      const behaviorAnalysis = await this.getCustomerBehaviorAnalytics(dateFilter);
      const predictiveInsights = await this.getPredictiveInsights();

      return {
        overview: customerStats,
        customerSegments: segmentAnalysis,
        salesPerformance,
        customerBehavior: behaviorAnalysis,
        predictiveInsights,
      };
    } catch (error) {
      this.logger.error('Error getting CRM analytics:', error);
      throw error;
    }
  }

  async getCustomerInteractions(customerId: string) {
    try {
      const interactions = await this.interactionRepository.find({
        where: { customerId },
        order: { date: 'DESC' },
        take: 50,
        relations: ['contact'],
      });

      const summary = this.calculateInteractionSummary(interactions);
      const preferences = await this.getCustomerCommunicationPreferences(customerId);

      return {
        interactions,
        summary,
        communication_preferences: preferences,
      };
    } catch (error) {
      this.logger.error(`Error getting customer interactions ${customerId}:`, error);
      throw error;
    }
  }

  // =================== PRIVATE HELPER METHODS ===================

  private async generateCustomerCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.customerRepository.count();
    return `C-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private async generateLeadNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.leadRepository.count();
    return `L-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private calculateLeadScore(leadData: any): number {
    let score = 0;
    
    // Demographic scoring
    if (leadData.demographics?.annualRevenue > 100000000) score += 30;
    else if (leadData.demographics?.annualRevenue > 10000000) score += 20;
    else if (leadData.demographics?.annualRevenue > 1000000) score += 10;
    
    if (leadData.demographics?.employeeCount > 1000) score += 20;
    else if (leadData.demographics?.employeeCount > 100) score += 15;
    else if (leadData.demographics?.employeeCount > 50) score += 10;
    
    // Behavioral scoring
    if (leadData.behaviorData?.websiteVisits > 10) score += 15;
    else if (leadData.behaviorData?.websiteVisits > 5) score += 10;
    else if (leadData.behaviorData?.websiteVisits > 1) score += 5;
    
    if (leadData.behaviorData?.formSubmissions > 2) score += 20;
    else if (leadData.behaviorData?.formSubmissions > 0) score += 10;
    
    return Math.min(score, 100);
  }

  private qualifyLead(leadData: any, score: number): any {
    return {
      budget: score > 70 ? 'qualified' : 'investigating',
      authority: leadData.contact?.title?.toLowerCase().includes('director') || 
                leadData.contact?.title?.toLowerCase().includes('manager') ? 'qualified' : 'unknown',
      need: score > 60 ? 'qualified' : 'investigating',
      timeline: score > 80 ? 'qualified' : 'unknown',
      bantScore: score,
      qualifiedBy: 'AI_SYSTEM',
      qualifiedDate: new Date().toISOString()
    };
  }

  private assignLead(leadData: any): string {
    const salesReps = ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];
    const hash = leadData.contact?.email?.length || 0;
    return salesReps[hash % salesReps.length];
  }

  private async getCustomerSummary() {
    const total = await this.customerRepository.count();
    const active = await this.customerRepository.count({ where: { status: CustomerStatus.ACTIVE } });
    const b2b = await this.customerRepository.count({ where: { customerType: CustomerType.B2B } });
    const b2c = await this.customerRepository.count({ where: { customerType: CustomerType.B2C } });

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: total - active,
      b2bCustomers: b2b,
      b2cCustomers: b2c,
      avgLifetimeValue: 125000,
      avgSatisfactionScore: 8.7,
    };
  }

  private async getLeadSummary() {
    const total = await this.leadRepository.count();
    const qualified = await this.leadRepository.count({ where: { status: LeadStatus.QUALIFIED } });
    const converted = await this.leadRepository.count({ where: { status: LeadStatus.CONVERTED } });

    return {
      totalLeads: total,
      qualifiedLeads: qualified,
      convertedLeads: converted,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }

  private calculatePipelineSummary(opportunities: Opportunity[]) {
    const totalValue = opportunities.reduce((sum, opp) => sum + Number(opp.value), 0);
    const weightedValue = opportunities.reduce((sum, opp) => sum + (Number(opp.value) * opp.probability / 100), 0);
    const avgDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;

    return {
      totalValue,
      weightedValue,
      totalOpportunities: opportunities.length,
      avgDealSize,
      avgSalesCycle: 65,
      winRate: 68.2,
      forecastAccuracy: 89.5,
    };
  }

  private analyzePipelineStages(opportunities: Opportunity[]) {
    const stages = Object.values(OpportunityStage).filter(stage => 
      stage !== OpportunityStage.WON && stage !== OpportunityStage.LOST
    );

    return stages.map(stage => {
      const stageOpps = opportunities.filter(opp => opp.stage === stage);
      const stageValue = stageOpps.reduce((sum, opp) => sum + Number(opp.value), 0);
      const avgProbability = stageOpps.length > 0 
        ? stageOpps.reduce((sum, opp) => sum + opp.probability, 0) / stageOpps.length 
        : 0;

      return {
        stage,
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        value: stageValue,
        opportunities: stageOpps.length,
        avgProbability,
        avgTimeInStage: 14,
        conversionRate: 75.5,
      };
    });
  }

  private generateForecast(opportunities: Opportunity[]) {
    const currentQuarter = opportunities.filter(opp => 
      this.isInCurrentQuarter(opp.expectedCloseDate)
    );
    
    const committed = currentQuarter
      .filter(opp => opp.probability >= 90)
      .reduce((sum, opp) => sum + Number(opp.value), 0);

    const bestCase = currentQuarter
      .reduce((sum, opp) => sum + (Number(opp.value) * opp.probability / 100), 0);

    return {
      currentQuarter: {
        target: 5000000,
        committed,
        bestCase,
        pipeline: bestCase,
        achievement: 89.2,
      },
      nextQuarter: {
        target: 5500000,
        committed: 2100000,
        bestCase: 4200000,
        pipeline: 6800000,
      },
    };
  }

  private getTimeframeFilter(timeframe: string) {
    const now = new Date();
    let start: Date, end: Date;

    switch (timeframe) {
      case 'current_quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
        break;
      case 'next_quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
        end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
        break;
      default:
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
    }

    return { start, end };
  }

  private getDateRangeFilter(timeRange: string) {
    const now = new Date();
    let start: Date;

    switch (timeRange) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { start, end: now };
  }

  private isInCurrentQuarter(date: Date): boolean {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
    
    return date >= quarterStart && date <= quarterEnd;
  }

  private async getCustomerAnalytics(dateFilter: any) {
    // Mock implementation - replace with actual queries
    return {
      totalCustomers: 1547,
      activeCustomers: 1423,
      newCustomers: 89,
      churnedCustomers: 12,
      customerRetentionRate: 94.2,
      avgCustomerLifetimeValue: 125000,
      avgCustomerAcquisitionCost: 2500,
      customerSatisfactionScore: 8.7,
      netPromoterScore: 68,
    };
  }

  private async getSegmentAnalysis() {
    // Mock implementation - replace with actual segmentation logic
    return {
      byType: [
        { segment: 'B2B Enterprise', count: 456, revenue: 15200000, avgValue: 33333 },
        { segment: 'B2B SMB', count: 436, revenue: 8900000, avgValue: 20412 },
        { segment: 'B2C Premium', count: 355, revenue: 5200000, avgValue: 14648 },
        { segment: 'B2C Standard', count: 300, revenue: 2100000, avgValue: 7000 },
      ],
      byRegion: [
        { region: 'North America', count: 654, revenue: 18500000, growth: 12.5 },
        { region: 'Europe', count: 489, revenue: 10200000, growth: 8.9 },
        { region: 'Asia Pacific', count: 304, revenue: 6800000, growth: 25.8 },
        { region: 'Latin America', count: 100, revenue: 1900000, growth: 18.2 },
      ],
      byIndustry: [
        { industry: 'Technology', count: 289, revenue: 12100000 },
        { industry: 'Manufacturing', count: 234, revenue: 9800000 },
        { industry: 'Healthcare', count: 189, revenue: 7200000 },
        { industry: 'Financial Services', count: 156, revenue: 5400000 },
      ],
    };
  }

  private async getSalesPerformanceAnalytics(dateFilter: any) {
    return {
      totalRevenue: 31400000,
      avgDealSize: 85034,
      avgSalesCycle: 65,
      winRate: 68.2,
      quotaAttainment: 94.8,
      topPerformers: [
        { rep: 'Sarah Johnson', revenue: 2100000, deals: 28, winRate: 82.1 },
        { rep: 'Michael Brown', revenue: 1850000, deals: 24, winRate: 75.0 },
        { rep: 'Emily Davis', revenue: 1650000, deals: 22, winRate: 68.2 },
      ],
    };
  }

  private async getCustomerBehaviorAnalytics(dateFilter: any) {
    return {
      avgInteractionFrequency: 2.3,
      preferredChannels: [
        { channel: 'email', percentage: 45.2 },
        { channel: 'phone', percentage: 28.9 },
        { channel: 'video_call', percentage: 18.7 },
        { channel: 'in_person', percentage: 7.2 },
      ],
      engagementTrends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        emailEngagement: [65.2, 68.1, 72.3, 74.5],
        phoneEngagement: [78.9, 76.5, 79.2, 81.1],
        socialEngagement: [45.6, 52.3, 58.9, 62.1],
      },
    };
  }

  private async getPredictiveInsights() {
    return {
      churnRisk: { high: 45, medium: 89, low: 1289 },
      upsellOpportunity: { immediate: 78, short_term: 156, long_term: 234 },
      marketingAttribution: [
        { channel: 'Content Marketing', revenue: 8900000, roi: 4.2 },
        { channel: 'LinkedIn Campaigns', revenue: 6200000, roi: 3.8 },
        { channel: 'Google Ads', revenue: 4500000, roi: 3.1 },
        { channel: 'Referrals', revenue: 7800000, roi: 12.5 },
      ],
    };
  }

  private calculateInteractionSummary(interactions: CustomerInteraction[]) {
    return {
      totalInteractions: interactions.length,
      lastInteraction: interactions[0]?.date?.toISOString(),
      avgInteractionFrequency: 2.3,
      preferredChannel: 'email',
      engagementScore: 8.5,
      responseRate: 89.2,
      sentiment: 'positive',
    };
  }

  private async getCustomerCommunicationPreferences(customerId: string) {
    // Mock implementation - get from customer preferences
    return {
      channels: ['email', 'phone', 'video_call'],
      frequency: 'weekly',
      bestTimes: ['10:00-12:00', '14:00-16:00'],
      timezone: 'America/Los_Angeles',
      language: 'en-US',
    };
  }
}
