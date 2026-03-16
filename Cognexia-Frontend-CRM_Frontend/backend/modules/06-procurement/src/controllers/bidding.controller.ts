// Industry 5.0 ERP Backend - Procurement Module
// BiddingController - RFQ and competitive bidding management
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { RFQ, RFQStatus, RFQType } from '../entities/rfq.entity';
import { Bid, BidStatus } from '../entities/bid.entity';

// Services
import { BiddingService } from '../services/bidding.service';
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { AuditLoggingService } from '../services/audit-logging.service';

// Guards
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcurementPermissionGuard } from '../guards/procurement-permission.guard';

// DTOs (basic types for now)
interface CreateRFQDto {
  title: string;
  description: string;
  type: RFQType;
  dueDate: Date;
  requirements: any;
  lineItems: any[];
  evaluationCriteria: any;
  targetVendors?: string[];
}

interface CreateBidDto {
  rfqId: string;
  vendorId: string;
  totalAmount: number;
  validityPeriod: number;
  lineItems: any[];
  technicalProposal: any;
  commercialProposal: any;
  terms: any;
}

interface RFQQueryDto {
  status?: RFQStatus;
  type?: RFQType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface BidQueryDto {
  rfqId?: string;
  vendorId?: string;
  status?: BidStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@ApiTags('Bidding & RFQ Management')
@Controller('bidding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProcurementPermissionGuard)
export class BiddingController {
  private readonly logger = new Logger(BiddingController.name);

  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly biddingService: BiddingService,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly auditService: AuditLoggingService,
  ) {}

  // ==================== RFQ MANAGEMENT ====================

  @Get('rfqs')
  @ApiOperation({ summary: 'Get all RFQs with filtering and pagination' })
  @ApiQuery({ name: 'status', enum: RFQStatus, required: false })
  @ApiQuery({ name: 'type', enum: RFQType, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of RFQs retrieved successfully' })
  async getRFQs(@Query() query: RFQQueryDto) {
    try {
      this.logger.log('Fetching RFQs with filters:', query);

      const queryBuilder = this.rfqRepository.createQueryBuilder('rfq')
        .leftJoinAndSelect('rfq.bids', 'bids')
        .leftJoinAndSelect('rfq.lineItems', 'lineItems');

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('rfq.status = :status', { status: query.status });
      }

      if (query.type) {
        queryBuilder.andWhere('rfq.type = :type', { type: query.type });
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(rfq.title ILIKE :search OR rfq.rfqNumber ILIKE :search OR rfq.description ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      // Apply sorting
      const sortBy = query.sortBy || 'issueDate';
      const sortOrder = query.sortOrder || 'DESC';
      queryBuilder.orderBy(`rfq.${sortBy}`, sortOrder);

      // Apply pagination
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [rfqs, total] = await queryBuilder.getManyAndCount();

      return {
        data: rfqs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching RFQs', error.stack);
      throw new HttpException('Failed to fetch RFQs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rfqs/:id')
  @ApiOperation({ summary: 'Get RFQ by ID' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'RFQ details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'RFQ not found' })
  async getRFQ(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching RFQ with ID: ${id}`);

      const rfq = await this.rfqRepository.findOne({
        where: { id },
        relations: ['bids', 'lineItems', 'bids.vendor'],
      });

      if (!rfq) {
        throw new HttpException('RFQ not found', HttpStatus.NOT_FOUND);
      }

      return rfq;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching RFQ ${id}`, error.stack);
      throw new HttpException('Failed to fetch RFQ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rfqs')
  @ApiOperation({ summary: 'Create a new RFQ' })
  @ApiResponse({ status: 201, description: 'RFQ created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid RFQ data' })
  async createRFQ(@Body() createRFQDto: CreateRFQDto) {
    try {
      this.logger.log('Creating new RFQ:', createRFQDto.title);

      const rfq = await this.biddingService.createRFQ(createRFQDto);

      // Log audit trail
      await this.auditService.logAction({
        entityType: 'RFQ',
        entityId: rfq.id,
        action: 'CREATE' as any,
        userId: 'current_user', // TODO: Get from request context
        details: { title: createRFQDto.title },
        tags: ['rfq', 'create'],
      });

      this.logger.log(`RFQ created successfully with ID: ${rfq.id}`);
      return rfq;
    } catch (error) {
      this.logger.error('Error creating RFQ', error.stack);
      throw new HttpException('Failed to create RFQ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rfqs/:id/publish')
  @ApiOperation({ summary: 'Publish RFQ to vendors' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'RFQ published successfully' })
  async publishRFQ(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Publishing RFQ ${id}`);

      const rfq = await this.biddingService.publishRFQ(id);

      // Log audit trail
      await this.auditService.logAction({
        entityType: 'RFQ',
        entityId: id,
        action: 'PUBLISH' as any,
        userId: 'current_user',
        details: { status: 'PUBLISHED' },
        tags: ['rfq', 'publish'],
      });

      return { message: 'RFQ published successfully', rfq };
    } catch (error) {
      this.logger.error(`Error publishing RFQ ${id}`, error.stack);
      throw new HttpException('Failed to publish RFQ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rfqs/:id/close')
  @ApiOperation({ summary: 'Close RFQ for bidding' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'RFQ closed successfully' })
  async closeRFQ(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Closing RFQ ${id}`);

      const rfq = await this.biddingService.closeRFQ(id);

      // Log audit trail
      await this.auditService.logAction({
        entityType: 'RFQ',
        entityId: id,
        action: 'CLOSE' as any,
        userId: 'current_user',
        details: { status: 'CLOSED' },
        tags: ['rfq', 'close'],
      });

      return { message: 'RFQ closed successfully', rfq };
    } catch (error) {
      this.logger.error(`Error closing RFQ ${id}`, error.stack);
      throw new HttpException('Failed to close RFQ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rfqs/:id/invite-vendors')
  @ApiOperation({ summary: 'Invite vendors to participate in RFQ' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'Vendors invited successfully' })
  async inviteVendors(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() invitationData: { vendorIds: string[] }
  ) {
    try {
      this.logger.log(`Inviting vendors to RFQ ${id}`);

      await this.biddingService.inviteVendors(id, invitationData.vendorIds);

      // Log audit trail
      await this.auditService.logAction({
        entityType: 'RFQ',
        entityId: id,
        action: 'INVITE_VENDORS' as any,
        userId: 'current_user',
        details: { vendorCount: invitationData.vendorIds.length },
        tags: ['rfq', 'invite'],
      });

      return { message: 'Vendors invited successfully' };
    } catch (error) {
      this.logger.error(`Error inviting vendors to RFQ ${id}`, error.stack);
      throw new HttpException('Failed to invite vendors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== BID MANAGEMENT ====================

  @Get('bids')
  @ApiOperation({ summary: 'Get all bids with filtering and pagination' })
  @ApiQuery({ name: 'rfqId', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'status', enum: BidStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of bids retrieved successfully' })
  async getBids(@Query() query: BidQueryDto) {
    try {
      this.logger.log('Fetching bids with filters:', query);

      const queryBuilder = this.bidRepository.createQueryBuilder('bid')
        .leftJoinAndSelect('bid.vendor', 'vendor')
        .leftJoinAndSelect('bid.rfq', 'rfq')
        .leftJoinAndSelect('bid.lineItems', 'lineItems');

      // Apply filters
      if (query.rfqId) {
        queryBuilder.andWhere('bid.rfqId = :rfqId', { rfqId: query.rfqId });
      }

      if (query.vendorId) {
        queryBuilder.andWhere('bid.vendorId = :vendorId', { vendorId: query.vendorId });
      }

      if (query.status) {
        queryBuilder.andWhere('bid.status = :status', { status: query.status });
      }

      // Apply sorting
      const sortBy = query.sortBy || 'submissionDate';
      const sortOrder = query.sortOrder || 'DESC';
      queryBuilder.orderBy(`bid.${sortBy}`, sortOrder);

      // Apply pagination
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [bids, total] = await queryBuilder.getManyAndCount();

      return {
        data: bids,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching bids', error.stack);
      throw new HttpException('Failed to fetch bids', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('bids/:id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({ status: 200, description: 'Bid details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async getBid(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching bid with ID: ${id}`);

      const bid = await this.bidRepository.findOne({
        where: { id },
        relations: ['vendor', 'rfq', 'lineItems'],
      });

      if (!bid) {
        throw new HttpException('Bid not found', HttpStatus.NOT_FOUND);
      }

      return bid;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching bid ${id}`, error.stack);
      throw new HttpException('Failed to fetch bid', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bids')
  @ApiOperation({ summary: 'Submit a new bid' })
  @ApiResponse({ status: 201, description: 'Bid submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bid data' })
  async submitBid(@Body() createBidDto: CreateBidDto) {
    try {
      this.logger.log(`Submitting bid for RFQ ${createBidDto.rfqId} by vendor ${createBidDto.vendorId}`);

      const bid = await this.biddingService.submitBid(createBidDto);

      // Log audit trail
      await this.auditService.logBidAction(
        bid.id,
        'SUBMIT' as any,
        'current_user',
        { rfqId: createBidDto.rfqId, amount: createBidDto.totalAmount }
      );

      this.logger.log(`Bid submitted successfully with ID: ${bid.id}`);
      return bid;
    } catch (error) {
      this.logger.error('Error submitting bid', error.stack);
      throw new HttpException('Failed to submit bid', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bids/:id/withdraw')
  @ApiOperation({ summary: 'Withdraw a bid' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({ status: 200, description: 'Bid withdrawn successfully' })
  async withdrawBid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() withdrawalData: { reason?: string }
  ) {
    try {
      this.logger.log(`Withdrawing bid ${id}`);

      const bid = await this.biddingService.withdrawBid(id, withdrawalData.reason);

      // Log audit trail
      await this.auditService.logBidAction(
        id,
        'WITHDRAW' as any,
        'current_user',
        { reason: withdrawalData.reason }
      );

      return { message: 'Bid withdrawn successfully', bid };
    } catch (error) {
      this.logger.error(`Error withdrawing bid ${id}`, error.stack);
      throw new HttpException('Failed to withdraw bid', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bids/:id/award')
  @ApiOperation({ summary: 'Award a bid' })
  @ApiParam({ name: 'id', description: 'Bid UUID' })
  @ApiResponse({ status: 200, description: 'Bid awarded successfully' })
  async awardBid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() awardData: { reason?: string }
  ) {
    try {
      this.logger.log(`Awarding bid ${id}`);

      const bid = await this.biddingService.awardBid(id, awardData.reason);

      // Log audit trail
      await this.auditService.logBidAction(
        id,
        'AWARD' as any,
        'current_user',
        { reason: awardData.reason }
      );

      return { message: 'Bid awarded successfully', bid };
    } catch (error) {
      this.logger.error(`Error awarding bid ${id}`, error.stack);
      throw new HttpException('Failed to award bid', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== EVALUATION & ANALYSIS ====================

  @Post('rfqs/:id/evaluate')
  @ApiOperation({ summary: 'Evaluate bids for an RFQ' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'Bid evaluation completed successfully' })
  async evaluateBids(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Evaluating bids for RFQ ${id}`);

      const evaluation = await this.biddingService.evaluateBids(id);

      // Log audit trail
      await this.auditService.logAction({
        entityType: 'RFQ',
        entityId: id,
        action: 'EVALUATE_BIDS' as any,
        userId: 'current_user',
        details: { evaluatedBids: evaluation.bidEvaluations?.length || 0 },
        tags: ['rfq', 'evaluation'],
      });

      return {
        rfqId: id,
        evaluation,
        evaluatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error evaluating bids for RFQ ${id}`, error.stack);
      throw new HttpException('Failed to evaluate bids', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rfqs/:id/analysis')
  @ApiOperation({ summary: 'Get bid competition analysis for RFQ' })
  @ApiParam({ name: 'id', description: 'RFQ UUID' })
  @ApiResponse({ status: 200, description: 'Competition analysis retrieved successfully' })
  async getBidAnalysis(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Analyzing bid competition for RFQ ${id}`);

      const analysis = await this.biddingService.analyzeBidCompetition(id);

      return {
        rfqId: id,
        analysis,
        analyzedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error analyzing bid competition for RFQ ${id}`, error.stack);
      throw new HttpException('Failed to analyze bid competition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bids/compare')
  @ApiOperation({ summary: 'Compare multiple bids' })
  @ApiResponse({ status: 200, description: 'Bid comparison completed successfully' })
  async compareBids(@Body() comparisonData: { bidIds: string[] }) {
    try {
      this.logger.log(`Comparing bids: ${comparisonData.bidIds.join(', ')}`);

      const comparison = await this.biddingService.compareBids(comparisonData.bidIds);

      return comparison;
    } catch (error) {
      this.logger.error('Error comparing bids', error.stack);
      throw new HttpException('Failed to compare bids', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  @Get('analytics/metrics')
  @ApiOperation({ summary: 'Get bidding metrics and analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(@Query() filters: any) {
    try {
      this.logger.log('Generating bidding metrics');

      const metrics = await this.biddingService.getBiddingMetrics(filters);

      return {
        filters,
        metrics,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating bidding metrics', error.stack);
      throw new HttpException('Failed to generate metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get bidding dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary() {
    try {
      this.logger.log('Getting bidding dashboard summary');

      const [
        totalRFQs,
        activeRFQs,
        totalBids,
        pendingEvaluation,
        awarded,
      ] = await Promise.all([
        this.rfqRepository.count(),
        this.rfqRepository.count({ where: { status: RFQStatus.PUBLISHED } }),
        this.bidRepository.count(),
        this.rfqRepository.count({ where: { status: RFQStatus.UNDER_EVALUATION } }),
        this.bidRepository.count({ where: { status: BidStatus.AWARDED } }),
      ]);

      const summary = {
        totalRFQs,
        activeRFQs,
        totalBids,
        pendingEvaluation,
        awarded,
        averageBidsPerRFQ: totalRFQs > 0 ? Math.round((totalBids / totalRFQs) * 100) / 100 : 0,
        generatedAt: new Date(),
      };

      return summary;
    } catch (error) {
      this.logger.error('Error getting dashboard summary', error.stack);
      throw new HttpException('Failed to get dashboard summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== VENDOR-SPECIFIC ENDPOINTS ====================

  @Get('vendor/:vendorId/rfqs')
  @ApiOperation({ summary: 'Get RFQs for specific vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor RFQs retrieved successfully' })
  async getVendorRFQs(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Query() query: RFQQueryDto,
  ) {
    try {
      this.logger.log(`Getting RFQs for vendor ${vendorId}`);

      // This would need to check RFQs where the vendor was invited or can participate
      const queryBuilder = this.rfqRepository.createQueryBuilder('rfq')
        .leftJoinAndSelect('rfq.bids', 'bids')
        .where('rfq.status = :status', { status: RFQStatus.PUBLISHED });

      // Apply additional filters
      if (query.type) {
        queryBuilder.andWhere('rfq.type = :type', { type: query.type });
      }

      const rfqs = await queryBuilder.getMany();

      return {
        vendorId,
        rfqs,
        retrievedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting RFQs for vendor ${vendorId}`, error.stack);
      throw new HttpException('Failed to get vendor RFQs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vendor/:vendorId/bids')
  @ApiOperation({ summary: 'Get bids submitted by specific vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor bids retrieved successfully' })
  async getVendorBids(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Query() query: BidQueryDto,
  ) {
    try {
      this.logger.log(`Getting bids for vendor ${vendorId}`);

      const modifiedQuery = { ...query, vendorId };
      return await this.getBids(modifiedQuery);
    } catch (error) {
      this.logger.error(`Error getting bids for vendor ${vendorId}`, error.stack);
      throw new HttpException('Failed to get vendor bids', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
