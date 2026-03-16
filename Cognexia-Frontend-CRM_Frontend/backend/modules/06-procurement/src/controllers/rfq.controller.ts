/**
 * Advanced RFQ (Request for Quotation) Controller
 * Industry 5.0 ERP - AI-Powered Procurement Management
 * 
 * Comprehensive RFQ management with AI intelligence, blockchain integration,
 * real-time analytics, and autonomous procurement processes.
 */

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
  UseInterceptors,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  Logger,
  UploadedFiles,
  Res,
  StreamableFile
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

// Import Services
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { RealTimeMarketIntelligenceService } from '../services/real-time-market-intelligence.service';
import { SupplierManagementService } from '../services/supplier-management.service';
import { BlockchainIntegrationService } from '../services/blockchain-integration.service';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';

// Import Entities and Types
import { RFQ, RFQStatus, RFQType, Priority, BidStatus } from '../entities/rfq.entity';

// Import Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';

@ApiTags('RFQ Management')
@ApiBearerAuth()
@Controller('procurement/rfq')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class RFQController {
  private readonly logger = new Logger(RFQController.name);

  constructor(
    private readonly aiIntelligenceService: AIProcurementIntelligenceService,
    private readonly marketIntelligenceService: RealTimeMarketIntelligenceService,
    private readonly supplierService: SupplierManagementService,
    private readonly blockchainService: BlockchainIntegrationService,
    private readonly analyticsService: AnalyticsDashboardService
  ) {}

  // =============== RFQ LIFECYCLE MANAGEMENT ===============

  @Post()
  @ApiOperation({ summary: 'Create new RFQ with AI optimization' })
  @ApiResponse({ status: 201, description: 'RFQ created successfully with AI insights' })
  @HttpCode(HttpStatus.CREATED)
  async createRFQ(@Body() createRFQDto: any): Promise<{ success: boolean; data: any; message: string }> {
    try {
      this.logger.log(`Creating new RFQ: ${createRFQDto.title}`);

      // AI-powered RFQ optimization
      const aiOptimizations = await this.aiIntelligenceService.optimizeRFQCreation({
        title: createRFQDto.title,
        description: createRFQDto.description,
        budget: createRFQDto.totalBudget,
        categories: createRFQDto.categories,
        timeline: createRFQDto.submissionDeadline,
        requirements: createRFQDto.requirements
      });

      // Get market intelligence
      const marketData = await this.marketIntelligenceService.getMarketIntelligence(
        createRFQDto.categories,
        createRFQDto.totalBudget
      );

      // Get supplier recommendations
      const supplierRecommendations = await this.supplierService.recommendSuppliersForRFQ({
        categories: createRFQDto.categories,
        budget: createRFQDto.totalBudget,
        requirements: createRFQDto.requirements
      });

      // Create RFQ with AI enhancements
      const rfq = await this.createRFQWithAI({
        ...createRFQDto,
        aiRecommendations: aiOptimizations,
        marketIntelligence: marketData,
        recommendedSuppliers: supplierRecommendations
      });

      // Store on blockchain for transparency
      const blockchainHash = await this.blockchainService.recordRFQCreation({
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
        title: rfq.title,
        budget: rfq.totalBudget,
        createdBy: rfq.createdBy,
        timestamp: new Date()
      });

      return {
        success: true,
        data: {
          ...rfq,
          aiOptimizations,
          marketIntelligence: marketData,
          supplierRecommendations,
          blockchainHash
        },
        message: 'RFQ created successfully with AI optimization'
      };

    } catch (error) {
      this.logger.error('Error creating RFQ:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all RFQs with filtering and AI insights' })
  @ApiResponse({ status: 200, description: 'RFQs retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: RFQStatus })
  @ApiQuery({ name: 'type', required: false, enum: RFQType })
  @ApiQuery({ name: 'priority', required: false, enum: Priority })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllRFQs(
    @Query('status') status?: RFQStatus,
    @Query('type') type?: RFQType,
    @Query('priority') priority?: Priority,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const filters = { status, type, priority };
      const rfqs = await this.getRFQsWithFilters(filters, page, limit);

      // Add AI insights for each RFQ
      const enrichedRFQs = await Promise.all(
        rfqs.data.map(async (rfq) => ({
          ...rfq,
          aiInsights: await this.aiIntelligenceService.generateRFQInsights(rfq.id),
          competitiveAnalysis: rfq.getCompetitiveAnalysis(),
          marketPosition: await this.marketIntelligenceService.analyzeRFQPosition(rfq.id)
        }))
      );

      return {
        success: true,
        data: {
          ...rfqs,
          data: enrichedRFQs
        },
        message: 'RFQs retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error retrieving RFQs:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFQ by ID with comprehensive analytics' })
  @ApiResponse({ status: 200, description: 'RFQ retrieved successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async getRFQById(@Param('id') id: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const rfq = await this.findRFQById(id);
      
      if (!rfq) {
        throw new Error(`RFQ with ID ${id} not found`);
      }

      // Get comprehensive analytics
      const analytics = await this.analyticsService.generateRFQAnalytics(id);
      const aiInsights = await this.aiIntelligenceService.generateRFQInsights(id);
      const marketAnalysis = await this.marketIntelligenceService.analyzeRFQPosition(id);
      const competitiveAnalysis = rfq.getCompetitiveAnalysis();

      return {
        success: true,
        data: {
          ...rfq,
          analytics,
          aiInsights,
          marketAnalysis,
          competitiveAnalysis,
          daysToDeadline: rfq.getDaysToDeadline(),
          responseRate: rfq.getResponseRate(),
          budgetUtilization: rfq.getBudgetUtilization()
        },
        message: 'RFQ retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error retrieving RFQ ${id}:`, error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update RFQ with AI optimization' })
  @ApiResponse({ status: 200, description: 'RFQ updated successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async updateRFQ(
    @Param('id') id: string,
    @Body() updateRFQDto: any
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const existingRFQ = await this.findRFQById(id);
      
      if (!existingRFQ) {
        throw new Error(`RFQ with ID ${id} not found`);
      }

      // AI optimization for updates
      const updateOptimizations = await this.aiIntelligenceService.optimizeRFQUpdates({
        currentRFQ: existingRFQ,
        updates: updateRFQDto
      });

      // Update RFQ with AI recommendations
      const updatedRFQ = await this.updateRFQWithAI(id, {
        ...updateRFQDto,
        aiOptimizations: updateOptimizations
      });

      // Record update on blockchain
      const blockchainHash = await this.blockchainService.recordRFQUpdate({
        rfqId: id,
        changes: updateRFQDto,
        updatedBy: updateRFQDto.lastModifiedBy,
        timestamp: new Date()
      });

      return {
        success: true,
        data: {
          ...updatedRFQ,
          updateOptimizations,
          blockchainHash
        },
        message: 'RFQ updated successfully'
      };

    } catch (error) {
      this.logger.error(`Error updating RFQ ${id}:`, error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete RFQ' })
  @ApiResponse({ status: 200, description: 'RFQ cancelled successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async cancelRFQ(
    @Param('id') id: string,
    @Body() cancelDto: { reason: string; cancelledBy: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.cancelRFQProcess(id, cancelDto);

      // Record cancellation on blockchain
      await this.blockchainService.recordRFQCancellation({
        rfqId: id,
        reason: cancelDto.reason,
        cancelledBy: cancelDto.cancelledBy,
        timestamp: new Date()
      });

      return {
        success: true,
        message: 'RFQ cancelled successfully'
      };

    } catch (error) {
      this.logger.error(`Error cancelling RFQ ${id}:`, error);
      throw error;
    }
  }

  // =============== RFQ PROCESS MANAGEMENT ===============

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish RFQ to suppliers with AI optimization' })
  @ApiResponse({ status: 200, description: 'RFQ published successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async publishRFQ(
    @Param('id') id: string,
    @Body() publishDto: { publishedBy: string; notifications?: boolean }
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const rfq = await this.findRFQById(id);
      
      if (!rfq.canBePublished()) {
        throw new Error('RFQ cannot be published - missing required information');
      }

      // AI-powered supplier selection optimization
      const supplierOptimization = await this.aiIntelligenceService.optimizeSupplierSelection({
        rfqId: id,
        currentSuppliers: rfq.invitedSuppliers,
        requirements: rfq.requirements,
        budget: rfq.totalBudget
      });

      // Publish RFQ
      const publishResult = await this.publishRFQProcess(id, {
        ...publishDto,
        optimizedSuppliers: supplierOptimization.recommendedSuppliers
      });

      // Send intelligent notifications
      if (publishDto.notifications !== false) {
        await this.sendIntelligentNotifications(id, supplierOptimization.recommendedSuppliers);
      }

      return {
        success: true,
        data: {
          ...publishResult,
          supplierOptimization
        },
        message: 'RFQ published successfully with AI-optimized supplier selection'
      };

    } catch (error) {
      this.logger.error(`Error publishing RFQ ${id}:`, error);
      throw error;
    }
  }

  @Post(':id/evaluate')
  @ApiOperation({ summary: 'Evaluate RFQ bids with AI analysis' })
  @ApiResponse({ status: 200, description: 'RFQ evaluation completed successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async evaluateRFQ(
    @Param('id') id: string,
    @Body() evaluationDto: { evaluatedBy: string; autoRanking?: boolean }
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const rfq = await this.findRFQById(id);
      
      if (!rfq.canBeEvaluated()) {
        throw new Error('RFQ cannot be evaluated - insufficient bids or deadline not reached');
      }

      // AI-powered bid evaluation
      const aiEvaluation = await this.aiIntelligenceService.evaluateBids({
        rfqId: id,
        bids: rfq.bids,
        criteria: rfq.evaluationCriteria,
        requirements: rfq.requirements
      });

      // Comprehensive analysis
      const evaluationResults = await this.performComprehensiveEvaluation(id, {
        ...evaluationDto,
        aiEvaluation
      });

      return {
        success: true,
        data: {
          ...evaluationResults,
          aiInsights: aiEvaluation,
          competitiveAnalysis: rfq.getCompetitiveAnalysis(),
          recommendations: await this.generateAwardRecommendations(id)
        },
        message: 'RFQ evaluation completed successfully'
      };

    } catch (error) {
      this.logger.error(`Error evaluating RFQ ${id}:`, error);
      throw error;
    }
  }

  @Post(':id/award')
  @ApiOperation({ summary: 'Award RFQ to winning supplier' })
  @ApiResponse({ status: 200, description: 'RFQ awarded successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async awardRFQ(
    @Param('id') id: string,
    @Body() awardDto: {
      supplierId: string;
      awardedBy: string;
      awardValue: number;
      conditions?: string[];
      notes?: string;
    }
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      // Award RFQ
      const awardResult = await this.awardRFQProcess(id, awardDto);

      // Generate contract recommendations
      const contractRecommendations = await this.aiIntelligenceService.generateContractRecommendations({
        rfqId: id,
        winningSupplierId: awardDto.supplierId,
        awardValue: awardDto.awardValue
      });

      // Record award on blockchain
      const blockchainHash = await this.blockchainService.recordRFQAward({
        rfqId: id,
        supplierId: awardDto.supplierId,
        awardValue: awardDto.awardValue,
        awardedBy: awardDto.awardedBy,
        timestamp: new Date()
      });

      return {
        success: true,
        data: {
          ...awardResult,
          contractRecommendations,
          blockchainHash
        },
        message: 'RFQ awarded successfully'
      };

    } catch (error) {
      this.logger.error(`Error awarding RFQ ${id}:`, error);
      throw error;
    }
  }

  // =============== BID MANAGEMENT ===============

  @Get(':id/bids')
  @ApiOperation({ summary: 'Get all bids for RFQ with AI analysis' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async getRFQBids(@Param('id') id: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const rfq = await this.findRFQById(id);
      
      if (!rfq) {
        throw new Error(`RFQ with ID ${id} not found`);
      }

      // Enhance bids with AI analysis
      const enrichedBids = await Promise.all(
        (rfq.bids || []).map(async (bid) => ({
          ...bid,
          aiAnalysis: await this.aiIntelligenceService.analyzeBid({
            bidId: bid.id,
            rfqRequirements: rfq.requirements,
            evaluationCriteria: rfq.evaluationCriteria
          }),
          riskAssessment: await this.assessBidRisk(bid),
          competitivePosition: await this.calculateCompetitivePosition(bid, rfq.bids)
        }))
      );

      return {
        success: true,
        data: {
          rfqId: id,
          totalBids: enrichedBids.length,
          bids: enrichedBids,
          summary: {
            averageScore: rfq.getAverageScore(),
            competitiveAnalysis: rfq.getCompetitiveAnalysis(),
            responseRate: rfq.getResponseRate()
          }
        },
        message: 'Bids retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error retrieving bids for RFQ ${id}:`, error);
      throw error;
    }
  }

  @Post(':id/bids/:bidId/evaluate')
  @ApiOperation({ summary: 'Evaluate specific bid with AI assistance' })
  @ApiResponse({ status: 200, description: 'Bid evaluated successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  async evaluateBid(
    @Param('id') id: string,
    @Param('bidId') bidId: string,
    @Body() evaluationDto: any
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      // AI-assisted bid evaluation
      const aiEvaluation = await this.aiIntelligenceService.evaluateSpecificBid({
        rfqId: id,
        bidId: bidId,
        evaluationCriteria: evaluationDto.criteria,
        humanScores: evaluationDto.scores
      });

      const evaluationResult = await this.evaluateSpecificBid(id, bidId, {
        ...evaluationDto,
        aiEvaluation
      });

      return {
        success: true,
        data: {
          ...evaluationResult,
          aiInsights: aiEvaluation
        },
        message: 'Bid evaluated successfully'
      };

    } catch (error) {
      this.logger.error(`Error evaluating bid ${bidId} for RFQ ${id}:`, error);
      throw error;
    }
  }

  // =============== ANALYTICS AND REPORTING ===============

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get comprehensive RFQ analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async getRFQAnalytics(@Param('id') id: string): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const analytics = await this.analyticsService.generateRFQAnalytics(id);
      const marketAnalysis = await this.marketIntelligenceService.analyzeRFQPosition(id);
      const performanceMetrics = await this.calculateRFQPerformanceMetrics(id);

      return {
        success: true,
        data: {
          rfqId: id,
          analytics,
          marketAnalysis,
          performanceMetrics,
          timestamp: new Date()
        },
        message: 'RFQ analytics retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error retrieving analytics for RFQ ${id}:`, error);
      throw error;
    }
  }

  @Get(':id/performance-report')
  @ApiOperation({ summary: 'Generate comprehensive RFQ performance report' })
  @ApiResponse({ status: 200, description: 'Performance report generated successfully' })
  @ApiProduces('application/pdf')
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async generatePerformanceReport(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      const report = await this.analyticsService.generateRFQPerformanceReport(id);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rfq-${id}-performance-report.pdf"`
      });

      return new StreamableFile(report);

    } catch (error) {
      this.logger.error(`Error generating performance report for RFQ ${id}:`, error);
      throw error;
    }
  }

  // =============== DOCUMENT MANAGEMENT ===============

  @Post(':id/documents')
  @ApiOperation({ summary: 'Upload documents to RFQ' })
  @ApiResponse({ status: 201, description: 'Documents uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiParam({ name: 'id', description: 'RFQ ID' })
  async uploadRFQDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: { documentType: string; description?: string }
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const uploadResults = await this.uploadDocuments(id, files, uploadDto);

      return {
        success: true,
        data: uploadResults,
        message: 'Documents uploaded successfully'
      };

    } catch (error) {
      this.logger.error(`Error uploading documents for RFQ ${id}:`, error);
      throw error;
    }
  }

  // =============== HELPER METHODS (PRIVATE) ===============

  private async createRFQWithAI(rfqData: any): Promise<any> {
    // Implementation for creating RFQ with AI enhancements
    // This would involve database operations and AI processing
    return {
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      ...rfqData,
      status: RFQStatus.DRAFT,
      createdDate: new Date()
    };
  }

  private async findRFQById(id: string): Promise<any> {
    // Implementation for finding RFQ by ID
    // This would involve database query
    return null; // Placeholder
  }

  private async getRFQsWithFilters(filters: any, page: number, limit: number): Promise<any> {
    // Implementation for getting RFQs with filters and pagination
    return {
      data: [],
      total: 0,
      page,
      limit
    };
  }

  private async updateRFQWithAI(id: string, updateData: any): Promise<any> {
    // Implementation for updating RFQ with AI recommendations
    return updateData;
  }

  private async cancelRFQProcess(id: string, cancelData: any): Promise<void> {
    // Implementation for cancelling RFQ
  }

  private async publishRFQProcess(id: string, publishData: any): Promise<any> {
    // Implementation for publishing RFQ
    return { publishedAt: new Date() };
  }

  private async sendIntelligentNotifications(rfqId: string, suppliers: string[]): Promise<void> {
    // Implementation for sending AI-powered notifications to suppliers
  }

  private async performComprehensiveEvaluation(id: string, evaluationData: any): Promise<any> {
    // Implementation for comprehensive RFQ evaluation
    return { evaluatedAt: new Date() };
  }

  private async generateAwardRecommendations(id: string): Promise<any> {
    // Implementation for generating award recommendations
    return { recommendations: [] };
  }

  private async awardRFQProcess(id: string, awardData: any): Promise<any> {
    // Implementation for awarding RFQ
    return { awardedAt: new Date() };
  }

  private async assessBidRisk(bid: any): Promise<any> {
    // Implementation for assessing bid risk
    return { riskLevel: 'medium', factors: [] };
  }

  private async calculateCompetitivePosition(bid: any, allBids: any[]): Promise<any> {
    // Implementation for calculating competitive position
    return { position: 1, percentile: 90 };
  }

  private async evaluateSpecificBid(rfqId: string, bidId: string, evaluationData: any): Promise<any> {
    // Implementation for evaluating specific bid
    return { evaluatedAt: new Date() };
  }

  private async calculateRFQPerformanceMetrics(id: string): Promise<any> {
    // Implementation for calculating RFQ performance metrics
    return { metrics: {} };
  }

  private async uploadDocuments(rfqId: string, files: Express.Multer.File[], uploadData: any): Promise<any> {
    // Implementation for uploading documents
    return { uploadedFiles: files.length };
  }
}
