import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { SalesQuote, QuoteStatus } from '../entities/sales-quote.entity';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(SalesQuote)
    private quoteRepository: Repository<SalesQuote>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async findAllOpportunities(filters: any = {}) {
    try {
      const queryBuilder = this.opportunityRepository.createQueryBuilder('opportunity')
        .leftJoinAndSelect('opportunity.customer', 'customer');

      if (filters.stage) {
        queryBuilder.andWhere('opportunity.stage = :stage', { stage: filters.stage });
      }

      if (filters.salesRep) {
        queryBuilder.andWhere('opportunity.salesRep = :salesRep', { salesRep: filters.salesRep });
      }

      if (filters.minValue) {
        queryBuilder.andWhere('opportunity.value >= :minValue', { minValue: filters.minValue });
      }

      const results = await queryBuilder.getMany();
      return results || [];
    } catch (error) {
      this.logger.error('Error finding opportunities:', error);
      return [];
    }
  }

  async getOpportunities(filters: any = {}) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const queryBuilder = this.opportunityRepository.createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.customer', 'customer');

    if (filters.stage) {
      queryBuilder.andWhere('opportunity.stage = :stage', { stage: filters.stage });
    }

    if (filters.salesRep) {
      queryBuilder.andWhere('opportunity.salesRep = :salesRep', { salesRep: filters.salesRep });
    }

    if (filters.minValue) {
      queryBuilder.andWhere('opportunity.value >= :minValue', { minValue: filters.minValue });
    }

    if (filters.search) {
      queryBuilder.andWhere('opportunity.name ILIKE :search OR opportunity.opportunityNumber ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createOpportunity(opportunityData: any, createdBy: string) {
    try {
      const opportunityNumber = await this.generateOpportunityNumber();
      
      const opportunity = this.opportunityRepository.create({
        ...opportunityData,
        opportunityNumber,
        name: opportunityData.name || 'New Opportunity',
        stage: opportunityData.stage || OpportunityStage.PROSPECTING,
        probability: opportunityData.probability || 10,
        value: opportunityData.value || 0,
        weightedValue: opportunityData.value ? opportunityData.value * (opportunityData.probability || 10) / 100 : 0,
        expectedCloseDate: opportunityData.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: createdBy || 'system',
        updatedBy: createdBy || 'system',
      });

      return await this.opportunityRepository.save(opportunity);
    } catch (error) {
      this.logger.error('Error creating opportunity:', error);
      throw error; // Let controller handle the error properly
    }
  }

  async updateOpportunityStage(id: string, stage: OpportunityStage, updatedBy: string) {
    try {
      const opportunity = await this.opportunityRepository.findOne({ where: { id } });
      
      if (!opportunity) {
        throw new NotFoundException(`Opportunity with ID ${id} not found`);
      }

      opportunity.stage = stage;
      opportunity.updatedBy = updatedBy;
      
      // Update probability based on stage
      opportunity.probability = this.getStageDefaultProbability(stage);
      opportunity.updateWeightedValue();

      return await this.opportunityRepository.save(opportunity);
    } catch (error) {
      this.logger.error(`Error updating opportunity stage ${id}:`, error);
      throw error;
    }
  }

  async createQuote(quoteData: any, createdBy: string) {
    try {
      const quoteNumber = await this.generateQuoteNumber();
      const lineItems = (quoteData.lineItems || []).map((item: any, index: number) => ({
        productId: item.productId || `item-${index + 1}`,
        productName: item.productName || item.description || `Item ${index + 1}`,
        description: item.description || item.productName || `Item ${index + 1}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0),
      }));
      const totals = this.calculateQuoteTotals(lineItems);
      
      const quote = this.quoteRepository.create({
        ...quoteData,
        quoteNumber,
        title: quoteData.title || 'New Quote',
        status: quoteData.status || QuoteStatus.DRAFT,
        lineItems,
        totals,
        validUntil: quoteData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: createdBy || 'system',
        updatedBy: createdBy || 'system',
      });

      return await this.quoteRepository.save(quote);
    } catch (error) {
      this.logger.error('Error creating quote:', error);
      throw error; // Let controller handle the error properly
    }
  }

  async getQuotes(filters: any = {}) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const queryBuilder = this.quoteRepository.createQueryBuilder('quote')
      .leftJoinAndSelect('quote.customer', 'customer')
      .leftJoinAndSelect('quote.opportunity', 'opportunity');

    if (filters.status) {
      queryBuilder.andWhere('quote.status = :status', { status: filters.status });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('quote.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.search) {
      queryBuilder.andWhere('quote.title ILIKE :search OR quote.quoteNumber ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getQuoteById(id: string) {
    return this.quoteRepository.findOne({
      where: { id },
      relations: ['customer', 'opportunity'],
    });
  }

  async updateQuote(id: string, updateData: any, updatedBy: string) {
    const quote = await this.getQuoteById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    const lineItems = (updateData.lineItems || quote.lineItems || []).map((item: any, index: number) => ({
      productId: item.productId || `item-${index + 1}`,
      productName: item.productName || item.description || `Item ${index + 1}`,
      description: item.description || item.productName || `Item ${index + 1}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0),
    }));
    const totals = this.calculateQuoteTotals(lineItems);
    Object.assign(quote, { ...updateData, lineItems, totals, updatedBy });
    return this.quoteRepository.save(quote);
  }

  async deleteQuote(id: string) {
    const quote = await this.quoteRepository.findOne({ where: { id } });
    if (!quote) {
      return;
    }
    await this.quoteRepository.remove(quote);
  }

  async updateQuoteStatus(id: string, status: QuoteStatus, updatedBy: string, reason?: string) {
    const quote = await this.getQuoteById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }
    quote.status = status;
    if (reason) {
      quote.notes = reason;
    }
    quote.updatedBy = updatedBy;
    return this.quoteRepository.save(quote);
  }

  async getQuoteStats() {
    const quotes = await this.quoteRepository.find();
    const totalValue = quotes.reduce((sum, quote) => sum + Number(quote.totals?.total || 0), 0);
    const statusBreakdown = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<QuoteStatus, number>);
    const accepted = statusBreakdown[QuoteStatus.ACCEPTED] || 0;
    const totalQuotes = quotes.length;

    return {
      totalQuotes,
      totalValue,
      acceptanceRate: totalQuotes ? (accepted / totalQuotes) * 100 : 0,
      expiringCount: quotes.filter(quote => quote.status === QuoteStatus.EXPIRED).length,
      statusBreakdown,
    };
  }

  async bulkDeleteQuotes(ids: string[]) {
    if (!ids?.length) {
      return;
    }
    await this.quoteRepository.delete(ids);
  }

  async exportQuotes(filters: any = {}) {
    const queryBuilder = this.quoteRepository.createQueryBuilder('quote')
      .leftJoinAndSelect('quote.customer', 'customer');

    if (filters.status) {
      queryBuilder.andWhere('quote.status = :status', { status: filters.status });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('quote.customerId = :customerId', { customerId: filters.customerId });
    }

    const data = await queryBuilder.getMany();
    const headers = ['quoteNumber', 'title', 'status', 'validUntil', 'total'];
    const rows = data.map((quote) =>
      [
        quote.quoteNumber,
        quote.title,
        quote.status,
        quote.validUntil?.toISOString?.() || quote.validUntil,
        quote.totals?.total || 0,
      ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  async deleteOpportunity(id: string) {
    const opportunity = await this.opportunityRepository.findOne({ where: { id } });
    if (!opportunity) {
      return;
    }
    await this.quoteRepository.delete({ opportunityId: id } as any);
    await this.opportunityRepository.remove(opportunity);
  }

  async bulkDeleteOpportunities(ids: string[]) {
    if (!ids?.length) {
      return;
    }
    await this.opportunityRepository.delete(ids);
  }

  async getSalesMetrics(filters: any = {}) {
    try {
      const opportunities = await this.findAllOpportunities(filters);
      
      return {
        totalValue: opportunities.reduce((sum, opp) => sum + Number(opp.value), 0),
        totalOpportunities: opportunities.length,
        avgDealSize: opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + Number(opp.value), 0) / opportunities.length : 0,
        winRate: this.calculateWinRate(opportunities),
        salesCycle: this.calculateAvgSalesCycle(opportunities),
      };
    } catch (error) {
      this.logger.error('Error getting sales metrics:', error);
      throw error;
    }
  }

  private async generateOpportunityNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.opportunityRepository.count();
    return `OPP-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.quoteRepository.count();
    return `Q-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private getStageDefaultProbability(stage: OpportunityStage): number {
    const stageProbs = {
      [OpportunityStage.PROSPECTING]: 10,
      [OpportunityStage.DISCOVERY]: 20,
      [OpportunityStage.QUALIFICATION]: 40,
      [OpportunityStage.PROPOSAL]: 60,
      [OpportunityStage.NEGOTIATION]: 80,
      [OpportunityStage.CLOSING]: 90,
      [OpportunityStage.WON]: 100,
      [OpportunityStage.LOST]: 0,
    };
    return stageProbs[stage] || 10;
  }

  private calculateWinRate(opportunities: Opportunity[]): number {
    const totalClosed = opportunities.filter(opp => 
      opp.stage === OpportunityStage.WON || opp.stage === OpportunityStage.LOST
    ).length;
    
    const won = opportunities.filter(opp => opp.stage === OpportunityStage.WON).length;
    
    return totalClosed > 0 ? (won / totalClosed) * 100 : 0;
  }

  private calculateAvgSalesCycle(opportunities: Opportunity[]): number {
    const closedOpps = opportunities.filter(opp => opp.actualCloseDate);
    
    if (closedOpps.length === 0) return 0;
    
    const totalDays = closedOpps.reduce((sum, opp) => {
      const days = Math.floor((opp.actualCloseDate.getTime() - opp.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return totalDays / closedOpps.length;
  }

  async findOpportunityById(id: string) {
    try {
      const opportunity = await this.opportunityRepository.findOne({ 
        where: { id },
        relations: ['customer'] 
      });
      if (!opportunity) {
        return null;
      }
      return opportunity;
    } catch (error) {
      this.logger.error(`Error finding opportunity ${id}:`, error);
      return null;
    }
  }

  async updateOpportunity(id: string, updateData: any, updatedBy: string) {
    try {
      const opportunity = await this.findOpportunityById(id);
      if (!opportunity) {
        return null;
      }
      Object.assign(opportunity, { ...updateData, updatedBy });
      return await this.opportunityRepository.save(opportunity);
    } catch (error) {
      this.logger.error(`Error updating opportunity ${id}:`, error);
      return null;
    }
  }

  async getSalesPipeline() {
    try {
      const opportunities = await this.opportunityRepository.find({
        relations: ['customer'],
        order: { expectedCloseDate: 'ASC' },
      });

      const opps = opportunities || [];
      const stages = Object.values(OpportunityStage);
      const pipeline = stages.map(stage => {
        const stageOpps = opps.filter(opp => opp.stage === stage);
        return {
          name: stage,
          count: stageOpps.length,
          value: stageOpps.reduce((sum, opp) => sum + Number(opp.value || 0), 0),
          avgProbability: stageOpps.length
            ? Math.round(stageOpps.reduce((sum, opp) => sum + Number(opp.probability || 0), 0) / stageOpps.length)
            : 0,
          opportunities: stageOpps.length,
        };
      });

      return {
        stages: pipeline,
        totalPipelineValue: opps.reduce((sum, opp) => sum + Number(opp.value || 0), 0),
        weightedPipelineValue: opps.reduce((sum, opp) => sum + Number(opp.weightedValue || 0), 0),
        avgSalesCycle: this.calculateAvgSalesCycle(opps),
        conversionRates: {
          prospectingToQualification: 35,
          qualificationToProposal: 45,
          proposalToNegotiation: 55,
          negotiationToClosed: 65,
        },
      };
    } catch (error) {
      this.logger.error('Error getting sales pipeline:', error);
      return {
        stages: [],
        totalPipelineValue: 0,
        weightedPipelineValue: 0,
        avgSalesCycle: 0,
        conversionRates: {
          prospectingToQualification: 0,
          qualificationToProposal: 0,
          proposalToNegotiation: 0,
          negotiationToClosed: 0,
        },
      };
    }
  }

  private calculateQuoteTotals(lineItems: Array<{
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0);
    const discount = lineItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    const taxable = Math.max(subtotal - discount, 0);
    const tax = lineItems.reduce((sum, item) => {
      const itemTax = (Number(item.taxRate || 0) / 100) * (Number(item.unitPrice) * Number(item.quantity));
      return sum + itemTax;
    }, 0);
    const total = Math.max(taxable + tax, 0);

    return {
      subtotal,
      discount,
      tax,
      total,
    };
  }
}
