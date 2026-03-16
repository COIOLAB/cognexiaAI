// Industry 5.0 ERP Backend - Procurement Module
// BiddingService - Competitive bidding and RFQ management with AI-powered analysis
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Entities
import { RFQ, RFQStatus, RFQType } from '../entities/rfq.entity';
import { Bid, BidStatus } from '../entities/bid.entity';
import { Vendor } from '../entities/vendor.entity';
import { LineItem } from '../entities/line-item.entity';
import { ProcurementAlert } from '../entities/procurement-alert.entity';

// Services
import { AIProcurementIntelligenceService } from './ai-procurement-intelligence.service';
import { SupplierManagementService } from './supplier-management.service';

interface RFQCreateData {
  title: string;
  description: string;
  type: RFQType;
  dueDate: Date;
  requirements: any;
  lineItems: any[];
  evaluationCriteria: any;
  targetVendors?: string[];
}

interface BidSubmissionData {
  rfqId: string;
  vendorId: string;
  totalAmount: number;
  validityPeriod: number;
  lineItems: any[];
  technicalProposal: any;
  commercialProposal: any;
  terms: any;
}

@Injectable()
export class BiddingService {
  private readonly logger = new Logger(BiddingService.name);

  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    @InjectRepository(ProcurementAlert)
    private readonly alertRepository: Repository<ProcurementAlert>,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly supplierService: SupplierManagementService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== RFQ LIFECYCLE MANAGEMENT ====================

  async createRFQ(data: RFQCreateData): Promise<RFQ> {
    try {
      this.logger.log('Creating new RFQ:', data.title);

      // Generate RFQ number
      const rfqNumber = await this.generateRFQNumber();

      const rfq = this.rfqRepository.create({
        rfqNumber,
        title: data.title,
        description: data.description,
        type: data.type,
        issueDate: new Date(),
        dueDate: data.dueDate,
        status: RFQStatus.DRAFT,
        requirements: data.requirements,
        evaluationCriteria: data.evaluationCriteria,
        createdAt: new Date(),
      });

      const savedRFQ = await this.rfqRepository.save(rfq);

      // Create line items
      if (data.lineItems && data.lineItems.length > 0) {
        for (const itemData of data.lineItems) {
          const lineItem = this.lineItemRepository.create({
            ...itemData,
            rfqId: savedRFQ.id,
            createdAt: new Date(),
          });
          await this.lineItemRepository.save(lineItem);
        }
      }

      // If target vendors specified, send invitations
      if (data.targetVendors && data.targetVendors.length > 0) {
        await this.inviteVendors(savedRFQ.id, data.targetVendors);
      }

      // Emit event
      this.eventEmitter.emit('rfq.created', {
        rfqId: savedRFQ.id,
        rfqNumber: savedRFQ.rfqNumber,
        targetVendors: data.targetVendors,
      });

      this.logger.log(`RFQ created with ID: ${savedRFQ.id}`);
      return savedRFQ;
    } catch (error) {
      this.logger.error('Error creating RFQ', error.stack);
      throw error;
    }
  }

  async publishRFQ(rfqId: string): Promise<RFQ> {
    try {
      this.logger.log(`Publishing RFQ ${rfqId}`);

      const rfq = await this.rfqRepository.findOne({
        where: { id: rfqId },
        relations: ['lineItems', 'invitedVendors'],
      });

      if (!rfq) {
        throw new Error('RFQ not found');
      }

      if (rfq.status !== RFQStatus.DRAFT) {
        throw new Error('Only draft RFQs can be published');
      }

      // Validate RFQ completeness
      await this.validateRFQForPublication(rfq);

      // Update status
      rfq.status = RFQStatus.PUBLISHED;
      rfq.publishDate = new Date();
      rfq.updatedAt = new Date();

      const updatedRFQ = await this.rfqRepository.save(rfq);

      // Send notifications to invited vendors
      await this.notifyInvitedVendors(rfq);

      // Use AI to suggest additional vendors
      try {
        const suggestedVendors = await this.aiService.suggestVendorsForRFQ(rfqId);
        if (suggestedVendors.length > 0) {
          await this.inviteVendors(rfqId, suggestedVendors.map(v => v.vendorId));
        }
      } catch (error) {
        this.logger.warn('AI vendor suggestion failed', error);
      }

      // Emit event
      this.eventEmitter.emit('rfq.published', {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        dueDate: rfq.dueDate,
      });

      return updatedRFQ;
    } catch (error) {
      this.logger.error(`Error publishing RFQ ${rfqId}`, error.stack);
      throw error;
    }
  }

  async closeRFQ(rfqId: string): Promise<RFQ> {
    try {
      this.logger.log(`Closing RFQ ${rfqId}`);

      const rfq = await this.rfqRepository.findOne({
        where: { id: rfqId },
        relations: ['bids'],
      });

      if (!rfq) {
        throw new Error('RFQ not found');
      }

      rfq.status = RFQStatus.CLOSED;
      rfq.closeDate = new Date();
      rfq.updatedAt = new Date();

      const updatedRFQ = await this.rfqRepository.save(rfq);

      // Mark late bids as invalid
      await this.markLateBids(rfqId);

      // Trigger bid evaluation
      await this.initiateBidEvaluation(rfqId);

      // Emit event
      this.eventEmitter.emit('rfq.closed', {
        rfqId: rfq.id,
        bidCount: rfq.bids?.length || 0,
      });

      return updatedRFQ;
    } catch (error) {
      this.logger.error(`Error closing RFQ ${rfqId}`, error.stack);
      throw error;
    }
  }

  // ==================== BID MANAGEMENT ====================

  async submitBid(data: BidSubmissionData): Promise<Bid> {
    try {
      this.logger.log(`Submitting bid for RFQ ${data.rfqId} by vendor ${data.vendorId}`);

      // Validate bid submission
      await this.validateBidSubmission(data);

      // Generate bid number
      const bidNumber = await this.generateBidNumber();

      const bid = this.bidRepository.create({
        bidNumber,
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        submissionDate: new Date(),
        totalAmount: data.totalAmount,
        validityPeriod: data.validityPeriod,
        status: BidStatus.SUBMITTED,
        technicalProposal: data.technicalProposal,
        commercialProposal: data.commercialProposal,
        terms: data.terms,
        createdAt: new Date(),
      });

      const savedBid = await this.bidRepository.save(bid);

      // Create bid line items
      if (data.lineItems && data.lineItems.length > 0) {
        for (const itemData of data.lineItems) {
          const lineItem = this.lineItemRepository.create({
            ...itemData,
            bidId: savedBid.id,
            createdAt: new Date(),
          });
          await this.lineItemRepository.save(lineItem);
        }
      }

      // AI-powered bid analysis
      try {
        await this.aiService.analyzeBidSubmission(savedBid.id);
      } catch (error) {
        this.logger.warn('AI bid analysis failed', error);
      }

      // Emit event
      this.eventEmitter.emit('bid.submitted', {
        bidId: savedBid.id,
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        totalAmount: data.totalAmount,
      });

      this.logger.log(`Bid submitted with ID: ${savedBid.id}`);
      return savedBid;
    } catch (error) {
      this.logger.error('Error submitting bid', error.stack);
      throw error;
    }
  }

  async withdrawBid(bidId: string, reason?: string): Promise<Bid> {
    try {
      this.logger.log(`Withdrawing bid ${bidId}`);

      const bid = await this.bidRepository.findOne({ where: { id: bidId } });

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BidStatus.SUBMITTED) {
        throw new Error('Only submitted bids can be withdrawn');
      }

      bid.status = BidStatus.WITHDRAWN;
      bid.withdrawalReason = reason;
      bid.withdrawalDate = new Date();
      bid.updatedAt = new Date();

      const updatedBid = await this.bidRepository.save(bid);

      // Emit event
      this.eventEmitter.emit('bid.withdrawn', {
        bidId: bid.id,
        rfqId: bid.rfqId,
        vendorId: bid.vendorId,
        reason,
      });

      return updatedBid;
    } catch (error) {
      this.logger.error(`Error withdrawing bid ${bidId}`, error.stack);
      throw error;
    }
  }

  // ==================== BID EVALUATION ====================

  async evaluateBids(rfqId: string): Promise<any> {
    try {
      this.logger.log(`Evaluating bids for RFQ ${rfqId}`);

      const rfq = await this.rfqRepository.findOne({
        where: { id: rfqId },
        relations: ['bids', 'bids.vendor', 'bids.lineItems'],
      });

      if (!rfq) {
        throw new Error('RFQ not found');
      }

      const validBids = rfq.bids.filter(bid => 
        bid.status === BidStatus.SUBMITTED && !bid.isLate
      );

      if (validBids.length === 0) {
        throw new Error('No valid bids found for evaluation');
      }

      // AI-powered bid evaluation
      const evaluation = await this.aiService.evaluateBids(rfqId);

      // Update bid scores
      for (const bid of validBids) {
        const bidEvaluation = evaluation.bidEvaluations.find(e => e.bidId === bid.id);
        if (bidEvaluation) {
          bid.technicalScore = bidEvaluation.technicalScore;
          bid.commercialScore = bidEvaluation.commercialScore;
          bid.overallScore = bidEvaluation.overallScore;
          bid.ranking = bidEvaluation.ranking;
          bid.evaluationComments = bidEvaluation.comments;
          bid.status = BidStatus.EVALUATED;
          bid.updatedAt = new Date();
          await this.bidRepository.save(bid);
        }
      }

      // Update RFQ status
      rfq.status = RFQStatus.UNDER_EVALUATION;
      rfq.evaluationStartDate = new Date();
      rfq.updatedAt = new Date();
      await this.rfqRepository.save(rfq);

      // Emit event
      this.eventEmitter.emit('bids.evaluated', {
        rfqId: rfq.id,
        evaluatedBids: validBids.length,
        winningBid: evaluation.recommendedBid,
      });

      return evaluation;
    } catch (error) {
      this.logger.error(`Error evaluating bids for RFQ ${rfqId}`, error.stack);
      throw error;
    }
  }

  async awardBid(bidId: string, awardReason?: string): Promise<Bid> {
    try {
      this.logger.log(`Awarding bid ${bidId}`);

      const bid = await this.bidRepository.findOne({
        where: { id: bidId },
        relations: ['rfq', 'vendor'],
      });

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BidStatus.EVALUATED) {
        throw new Error('Bid must be evaluated before awarding');
      }

      // Award the bid
      bid.status = BidStatus.AWARDED;
      bid.awardDate = new Date();
      bid.awardReason = awardReason;
      bid.updatedAt = new Date();

      const awardedBid = await this.bidRepository.save(bid);

      // Update RFQ status
      bid.rfq.status = RFQStatus.AWARDED;
      bid.rfq.awardDate = new Date();
      bid.rfq.winningBidId = bidId;
      bid.rfq.updatedAt = new Date();
      await this.rfqRepository.save(bid.rfq);

      // Mark other bids as unsuccessful
      await this.markUnsuccessfulBids(bid.rfqId, bidId);

      // Create contract or purchase order
      await this.initiateContractCreation(awardedBid);

      // Notify vendors
      await this.notifyBidResults(bid.rfqId, bidId);

      // Emit event
      this.eventEmitter.emit('bid.awarded', {
        bidId: bid.id,
        rfqId: bid.rfqId,
        vendorId: bid.vendorId,
        amount: bid.totalAmount,
      });

      return awardedBid;
    } catch (error) {
      this.logger.error(`Error awarding bid ${bidId}`, error.stack);
      throw error;
    }
  }

  // ==================== COMPETITIVE ANALYSIS ====================

  async analyzeBidCompetition(rfqId: string): Promise<any> {
    try {
      this.logger.log(`Analyzing bid competition for RFQ ${rfqId}`);

      const bids = await this.bidRepository.find({
        where: { rfqId, status: BidStatus.SUBMITTED },
        relations: ['vendor'],
      });

      if (bids.length === 0) {
        return { message: 'No bids available for analysis' };
      }

      const analysis = {
        totalBids: bids.length,
        priceRange: {
          lowest: Math.min(...bids.map(b => b.totalAmount)),
          highest: Math.max(...bids.map(b => b.totalAmount)),
          average: bids.reduce((sum, b) => sum + b.totalAmount, 0) / bids.length,
        },
        vendorTypes: this.analyzeVendorTypes(bids),
        competitivenessIndex: this.calculateCompetitivenessIndex(bids),
        outliers: this.identifyOutliers(bids),
        recommendations: await this.generateBidRecommendations(rfqId, bids),
      };

      return analysis;
    } catch (error) {
      this.logger.error(`Error analyzing bid competition for RFQ ${rfqId}`, error.stack);
      throw error;
    }
  }

  async compareBids(bidIds: string[]): Promise<any> {
    try {
      this.logger.log(`Comparing bids: ${bidIds.join(', ')}`);

      const bids = await this.bidRepository.find({
        where: { id: { $in: bidIds } },
        relations: ['vendor', 'lineItems'],
      });

      const comparison = await this.aiService.compareBids(bidIds);

      return {
        bids,
        comparison,
        recommendation: comparison.recommendedBid,
        analysisDate: new Date(),
      };
    } catch (error) {
      this.logger.error('Error comparing bids', error.stack);
      throw error;
    }
  }

  // ==================== VENDOR INVITATION ====================

  async inviteVendors(rfqId: string, vendorIds: string[]): Promise<void> {
    try {
      this.logger.log(`Inviting vendors to RFQ ${rfqId}: ${vendorIds.join(', ')}`);

      const rfq = await this.rfqRepository.findOne({ where: { id: rfqId } });
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      const vendors = await this.vendorRepository.findByIds(vendorIds);

      for (const vendor of vendors) {
        // Create invitation record
        if (!rfq.invitedVendors) rfq.invitedVendors = [];
        rfq.invitedVendors.push({
          vendorId: vendor.id,
          invitationDate: new Date(),
          status: 'INVITED',
        });

        // Create notification
        await this.createVendorNotification(vendor.id, rfq, 'RFQ_INVITATION');
      }

      rfq.updatedAt = new Date();
      await this.rfqRepository.save(rfq);

      // Emit event
      this.eventEmitter.emit('vendors.invited', {
        rfqId: rfq.id,
        vendorIds,
        invitationCount: vendorIds.length,
      });

    } catch (error) {
      this.logger.error(`Error inviting vendors to RFQ ${rfqId}`, error.stack);
      throw error;
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  async getBiddingMetrics(filters: any = {}): Promise<any> {
    try {
      this.logger.log('Generating bidding metrics');

      const rfqBuilder = this.rfqRepository.createQueryBuilder('rfq');
      const bidBuilder = this.bidRepository.createQueryBuilder('bid');

      // Apply filters
      if (filters.startDate) {
        rfqBuilder.andWhere('rfq.issueDate >= :startDate', { startDate: filters.startDate });
        bidBuilder.andWhere('bid.submissionDate >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        rfqBuilder.andWhere('rfq.issueDate <= :endDate', { endDate: filters.endDate });
        bidBuilder.andWhere('bid.submissionDate <= :endDate', { endDate: filters.endDate });
      }

      const [rfqs, bids] = await Promise.all([
        rfqBuilder.getMany(),
        bidBuilder.getMany(),
      ]);

      const metrics = {
        rfqMetrics: {
          total: rfqs.length,
          byStatus: this.groupByProperty(rfqs, 'status'),
          byType: this.groupByProperty(rfqs, 'type'),
          averageResponseTime: this.calculateAverageResponseTime(rfqs),
        },
        bidMetrics: {
          total: bids.length,
          byStatus: this.groupByProperty(bids, 'status'),
          averageBidsPerRFQ: rfqs.length > 0 ? bids.length / rfqs.length : 0,
          competitionRate: this.calculateCompetitionRate(rfqs, bids),
        },
        financialMetrics: {
          totalBidValue: bids.reduce((sum, bid) => sum + bid.totalAmount, 0),
          averageBidValue: bids.length > 0 ? 
            bids.reduce((sum, bid) => sum + bid.totalAmount, 0) / bids.length : 0,
          savingsAchieved: this.calculateSavingsAchieved(bids),
        },
      };

      return metrics;
    } catch (error) {
      this.logger.error('Error generating bidding metrics', error.stack);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async generateRFQNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const count = await this.rfqRepository.count({
      where: {
        createdAt: MoreThan(new Date(year, new Date().getMonth(), 1)),
      },
    });

    return `RFQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateBidNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const count = await this.bidRepository.count({
      where: {
        createdAt: MoreThan(new Date(year, new Date().getMonth(), 1)),
      },
    });

    return `BID-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  private async validateRFQForPublication(rfq: RFQ): Promise<void> {
    if (!rfq.title || rfq.title.trim().length === 0) {
      throw new Error('RFQ must have a title');
    }

    if (!rfq.dueDate || rfq.dueDate <= new Date()) {
      throw new Error('Due date must be in the future');
    }

    if (!rfq.lineItems || rfq.lineItems.length === 0) {
      throw new Error('RFQ must have at least one line item');
    }
  }

  private async validateBidSubmission(data: BidSubmissionData): Promise<void> {
    const rfq = await this.rfqRepository.findOne({ where: { id: data.rfqId } });
    
    if (!rfq) {
      throw new Error('RFQ not found');
    }

    if (rfq.status !== RFQStatus.PUBLISHED) {
      throw new Error('RFQ is not open for bidding');
    }

    if (new Date() > rfq.dueDate) {
      throw new Error('Bid submission deadline has passed');
    }

    // Check if vendor already submitted a bid
    const existingBid = await this.bidRepository.findOne({
      where: { rfqId: data.rfqId, vendorId: data.vendorId },
    });

    if (existingBid) {
      throw new Error('Vendor has already submitted a bid for this RFQ');
    }
  }

  private async markLateBids(rfqId: string): Promise<void> {
    const rfq = await this.rfqRepository.findOne({ where: { id: rfqId } });
    if (!rfq) return;

    await this.bidRepository.update(
      { 
        rfqId, 
        submissionDate: MoreThan(rfq.dueDate),
        status: BidStatus.SUBMITTED 
      },
      { isLate: true, status: BidStatus.INVALID }
    );
  }

  private async markUnsuccessfulBids(rfqId: string, awardedBidId: string): Promise<void> {
    await this.bidRepository.update(
      { rfqId, status: BidStatus.EVALUATED },
      { status: BidStatus.UNSUCCESSFUL }
    );

    // Keep the awarded bid status
    await this.bidRepository.update(
      { id: awardedBidId },
      { status: BidStatus.AWARDED }
    );
  }

  private async initiateBidEvaluation(rfqId: string): Promise<void> {
    // This would trigger the evaluation workflow
    this.eventEmitter.emit('bid.evaluation.initiated', { rfqId });
  }

  private async initiateContractCreation(bid: Bid): Promise<void> {
    // This would integrate with contract management
    this.eventEmitter.emit('contract.creation.initiated', {
      bidId: bid.id,
      vendorId: bid.vendorId,
      amount: bid.totalAmount,
    });
  }

  private async notifyInvitedVendors(rfq: RFQ): Promise<void> {
    // Send notifications to invited vendors
    for (const invitation of rfq.invitedVendors || []) {
      await this.createVendorNotification(invitation.vendorId, rfq, 'RFQ_PUBLISHED');
    }
  }

  private async notifyBidResults(rfqId: string, winningBidId: string): Promise<void> {
    const bids = await this.bidRepository.find({
      where: { rfqId },
      relations: ['vendor'],
    });

    for (const bid of bids) {
      const isWinner = bid.id === winningBidId;
      await this.createVendorNotification(
        bid.vendorId, 
        bid.rfq, 
        isWinner ? 'BID_AWARDED' : 'BID_UNSUCCESSFUL'
      );
    }
  }

  private async createVendorNotification(vendorId: string, rfq: RFQ, type: string): Promise<void> {
    const alert = this.alertRepository.create({
      entityType: 'RFQ',
      entityId: rfq.id,
      alertType: type,
      severity: 'MEDIUM',
      title: `RFQ ${type}`,
      message: `RFQ ${rfq.rfqNumber}: ${rfq.title}`,
      recipientId: vendorId,
      createdAt: new Date(),
    });

    await this.alertRepository.save(alert);
  }

  private groupByProperty(items: any[], property: string): any {
    return items.reduce((groups, item) => {
      const key = item[property];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateAverageResponseTime(rfqs: RFQ[]): number {
    const completedRFQs = rfqs.filter(rfq => rfq.status === RFQStatus.CLOSED);
    if (completedRFQs.length === 0) return 0;

    const totalTime = completedRFQs.reduce((sum, rfq) => {
      const responseTime = rfq.closeDate ? 
        (rfq.closeDate.getTime() - rfq.publishDate.getTime()) / (1000 * 60 * 60 * 24) : 0;
      return sum + responseTime;
    }, 0);

    return Math.round(totalTime / completedRFQs.length * 100) / 100;
  }

  private calculateCompetitionRate(rfqs: RFQ[], bids: Bid[]): number {
    const rfqsWithBids = rfqs.filter(rfq => 
      bids.some(bid => bid.rfqId === rfq.id)
    ).length;

    return rfqs.length > 0 ? Math.round((rfqsWithBids / rfqs.length) * 10000) / 100 : 0;
  }

  private calculateSavingsAchieved(bids: Bid[]): number {
    const awardedBids = bids.filter(bid => bid.status === BidStatus.AWARDED);
    
    // This would calculate savings based on budget vs awarded amount
    // Placeholder calculation
    return awardedBids.reduce((savings, bid) => {
      const estimatedSavings = bid.totalAmount * 0.05; // 5% average savings
      return savings + estimatedSavings;
    }, 0);
  }

  private analyzeVendorTypes(bids: Bid[]): any {
    // Analyze vendor types participating in bids
    return bids.reduce((types, bid) => {
      const vendorType = bid.vendor?.type || 'UNKNOWN';
      types[vendorType] = (types[vendorType] || 0) + 1;
      return types;
    }, {});
  }

  private calculateCompetitivenessIndex(bids: Bid[]): number {
    if (bids.length < 2) return 0;

    const amounts = bids.map(bid => bid.totalAmount).sort((a, b) => a - b);
    const range = amounts[amounts.length - 1] - amounts[0];
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;

    return range / average; // Higher values indicate more competitive pricing
  }

  private identifyOutliers(bids: Bid[]): any[] {
    const amounts = bids.map(bid => bid.totalAmount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2 * stdDev;

    return bids.filter(bid => Math.abs(bid.totalAmount - mean) > threshold);
  }

  private async generateBidRecommendations(rfqId: string, bids: Bid[]): Promise<string[]> {
    const recommendations = [];

    if (bids.length < 3) {
      recommendations.push('Consider inviting more vendors to increase competition');
    }

    const competitivenessIndex = this.calculateCompetitivenessIndex(bids);
    if (competitivenessIndex < 0.1) {
      recommendations.push('Low price variation detected - consider reviewing specifications');
    }

    return recommendations;
  }
}
