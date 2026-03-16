// Industry 5.0 ERP Backend - Procurement Module
// PurchaseRequisitionController - Comprehensive requisition management
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
import { PurchaseRequisition, RequisitionStatus, PriorityLevel, RequisitionType } from '../entities/purchase-requisition.entity';
import { LineItem } from '../entities/line-item.entity';

// Services
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { AuditLoggingService } from '../services/audit-logging.service';

// Guards
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcurementPermissionGuard } from '../guards/procurement-permission.guard';

// DTOs (basic types for now)
interface CreateRequisitionDto {
  requisitionNumber?: string;
  title: string;
  description: string;
  type: RequisitionType;
  priority: PriorityLevel;
  department: string;
  requesterId: string;
  requiredDate: Date;
  justification: string;
  budgetCode?: string;
  lineItems: any[];
}

interface UpdateRequisitionDto extends Partial<CreateRequisitionDto> {}

interface RequisitionQueryDto {
  status?: RequisitionStatus;
  type?: RequisitionType;
  priority?: PriorityLevel;
  department?: string;
  requesterId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@ApiTags('Purchase Requisitions')
@Controller('requisitions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProcurementPermissionGuard)
export class PurchaseRequisitionController {
  private readonly logger = new Logger(PurchaseRequisitionController.name);

  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly requisitionRepository: Repository<PurchaseRequisition>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    private readonly requisitionService: PurchaseRequisitionService,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly auditService: AuditLoggingService,
  ) {}

  // ==================== REQUISITION CRUD OPERATIONS ====================

  @Get()
  @ApiOperation({ summary: 'Get all requisitions with filtering and pagination' })
  @ApiQuery({ name: 'status', enum: RequisitionStatus, required: false })
  @ApiQuery({ name: 'type', enum: RequisitionType, required: false })
  @ApiQuery({ name: 'priority', enum: PriorityLevel, required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of requisitions retrieved successfully' })
  async findAll(@Query() query: RequisitionQueryDto) {
    try {
      this.logger.log('Fetching requisitions with filters:', query);

      const queryBuilder = this.requisitionRepository.createQueryBuilder('req')
        .leftJoinAndSelect('req.lineItems', 'lineItems')
        .leftJoinAndSelect('req.approvals', 'approvals');

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('req.status = :status', { status: query.status });
      }

      if (query.type) {
        queryBuilder.andWhere('req.type = :type', { type: query.type });
      }

      if (query.priority) {
        queryBuilder.andWhere('req.priority = :priority', { priority: query.priority });
      }

      if (query.department) {
        queryBuilder.andWhere('req.department = :department', { department: query.department });
      }

      if (query.requesterId) {
        queryBuilder.andWhere('req.requesterId = :requesterId', { requesterId: query.requesterId });
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(req.title ILIKE :search OR req.requisitionNumber ILIKE :search OR req.description ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      // Apply sorting
      const sortBy = query.sortBy || 'submissionDate';
      const sortOrder = query.sortOrder || 'DESC';
      queryBuilder.orderBy(`req.${sortBy}`, sortOrder);

      // Apply pagination
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [requisitions, total] = await queryBuilder.getManyAndCount();

      return {
        data: requisitions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching requisitions', error.stack);
      throw new HttpException('Failed to fetch requisitions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get requisition by ID' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching requisition with ID: ${id}`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id },
        relations: [
          'lineItems',
          'approvals',
        ],
      });

      if (!requisition) {
        throw new HttpException('Requisition not found', HttpStatus.NOT_FOUND);
      }

      return requisition;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching requisition ${id}`, error.stack);
      throw new HttpException('Failed to fetch requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new requisition' })
  @ApiResponse({ status: 201, description: 'Requisition created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid requisition data' })
  async create(@Body() createRequisitionDto: CreateRequisitionDto) {
    try {
      this.logger.log('Creating new requisition:', createRequisitionDto.title);

      const requisition = await this.requisitionService.createRequisition(createRequisitionDto);

      // Log audit trail
      await this.auditService.logRequisitionAction(
        requisition.id,
        'CREATE' as any,
        createRequisitionDto.requesterId,
        { title: createRequisitionDto.title }
      );

      this.logger.log(`Requisition created successfully with ID: ${requisition.id}`);
      return requisition;
    } catch (error) {
      this.logger.error('Error creating requisition', error.stack);
      throw new HttpException('Failed to create requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update requisition information' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition updated successfully' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequisitionDto: UpdateRequisitionDto,
  ) {
    try {
      this.logger.log(`Updating requisition ${id}`);

      const requisition = await this.requisitionRepository.findOne({ where: { id } });
      if (!requisition) {
        throw new HttpException('Requisition not found', HttpStatus.NOT_FOUND);
      }

      // Store old values for audit
      const oldValues = { ...requisition };

      Object.assign(requisition, updateRequisitionDto);
      requisition.updatedAt = new Date();

      const updatedRequisition = await this.requisitionRepository.save(requisition);

      // Log audit trail
      await this.auditService.logRequisitionAction(
        requisition.id,
        'UPDATE' as any,
        'current_user', // TODO: Get from request context
        { changes: updateRequisitionDto }
      );

      this.logger.log(`Requisition ${id} updated successfully`);
      return updatedRequisition;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error updating requisition ${id}`, error.stack);
      throw new HttpException('Failed to update requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete requisition (soft delete)' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requisition not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Deleting requisition ${id}`);

      const requisition = await this.requisitionRepository.findOne({ where: { id } });
      if (!requisition) {
        throw new HttpException('Requisition not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete by setting status to cancelled
      requisition.status = RequisitionStatus.CANCELLED;
      requisition.updatedAt = new Date();

      await this.requisitionRepository.save(requisition);

      // Log audit trail
      await this.auditService.logRequisitionAction(
        requisition.id,
        'DELETE' as any,
        'current_user', // TODO: Get from request context
        { reason: 'Requisition deleted' }
      );

      this.logger.log(`Requisition ${id} deleted successfully`);
      return { message: 'Requisition deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error deleting requisition ${id}`, error.stack);
      throw new HttpException('Failed to delete requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== WORKFLOW OPERATIONS ====================

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit requisition for approval' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition submitted successfully' })
  async submitForApproval(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Submitting requisition ${id} for approval`);

      const requisition = await this.requisitionService.submitForApproval(id, 'current_user');

      // Log audit trail
      await this.auditService.logRequisitionAction(
        id,
        'SUBMIT' as any,
        'current_user',
        { status: 'PENDING_APPROVAL' }
      );

      return { message: 'Requisition submitted successfully', requisition };
    } catch (error) {
      this.logger.error(`Error submitting requisition ${id}`, error.stack);
      throw new HttpException('Failed to submit requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve requisition' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition approved successfully' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approvalData: { comments?: string },
  ) {
    try {
      this.logger.log(`Approving requisition ${id}`);

      const requisition = await this.requisitionService.approveRequisition(
        id,
        'current_user',
        approvalData.comments
      );

      // Log audit trail
      await this.auditService.logRequisitionAction(
        id,
        'APPROVE' as any,
        'current_user',
        { comments: approvalData.comments }
      );

      return { message: 'Requisition approved successfully', requisition };
    } catch (error) {
      this.logger.error(`Error approving requisition ${id}`, error.stack);
      throw new HttpException('Failed to approve requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject requisition' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition rejected successfully' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectionData: { reason: string },
  ) {
    try {
      this.logger.log(`Rejecting requisition ${id}`);

      const requisition = await this.requisitionService.rejectRequisition(
        id,
        'current_user',
        rejectionData.reason
      );

      // Log audit trail
      await this.auditService.logRequisitionAction(
        id,
        'REJECT' as any,
        'current_user',
        { reason: rejectionData.reason }
      );

      return { message: 'Requisition rejected successfully', requisition };
    } catch (error) {
      this.logger.error(`Error rejecting requisition ${id}`, error.stack);
      throw new HttpException('Failed to reject requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/convert-to-po')
  @ApiOperation({ summary: 'Convert requisition to purchase order' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Requisition converted to PO successfully' })
  async convertToPurchaseOrder(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Converting requisition ${id} to purchase order`);

      const requisition = await this.requisitionRepository.findOne({
        where: { id },
        relations: ['lineItems'],
      });

      if (!requisition) {
        throw new HttpException('Requisition not found', HttpStatus.NOT_FOUND);
      }

      if (requisition.status !== RequisitionStatus.APPROVED) {
        throw new HttpException('Only approved requisitions can be converted to purchase orders', HttpStatus.BAD_REQUEST);
      }

      const result = await this.requisitionService.convertToPurchaseOrder(requisition);

      // Log audit trail
      await this.auditService.logRequisitionAction(
        id,
        'CONVERT' as any,
        'current_user',
        { convertedTo: 'PURCHASE_ORDER' }
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error converting requisition ${id} to PO`, error.stack);
      throw new HttpException('Failed to convert requisition to purchase order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== AI-POWERED FEATURES ====================

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze requisition with AI' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'AI analysis completed successfully' })
  async analyzeWithAI(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Analyzing requisition ${id} with AI`);

      const analysis = await this.requisitionService.analyzeRequisitionWithAI(id);

      return {
        requisitionId: id,
        analysis,
        analyzedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error analyzing requisition ${id} with AI`, error.stack);
      throw new HttpException('Failed to analyze requisition', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/suggest-vendors')
  @ApiOperation({ summary: 'Get AI-suggested vendors for requisition' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Vendor suggestions retrieved successfully' })
  async suggestVendors(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Getting vendor suggestions for requisition ${id}`);

      const vendors = await this.requisitionService.suggestVendors(id);

      return {
        requisitionId: id,
        suggestedVendors: vendors,
        suggestedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting vendor suggestions for requisition ${id}`, error.stack);
      throw new HttpException('Failed to get vendor suggestions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/optimize-budget')
  @ApiOperation({ summary: 'Optimize budget allocation with AI' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'Budget optimization completed successfully' })
  async optimizeBudget(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Optimizing budget for requisition ${id}`);

      const optimization = await this.requisitionService.optimizeBudgetAllocation(id);

      return {
        requisitionId: id,
        optimization,
        optimizedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error optimizing budget for requisition ${id}`, error.stack);
      throw new HttpException('Failed to optimize budget', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== REPORTING & ANALYTICS ====================

  @Get('analytics/metrics')
  @ApiOperation({ summary: 'Get requisition metrics and analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(@Query() filters: any) {
    try {
      this.logger.log('Generating requisition metrics');

      const metrics = await this.requisitionService.getRequisitionMetrics(filters);

      return {
        filters,
        metrics,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating requisition metrics', error.stack);
      throw new HttpException('Failed to generate metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get requisition change history' })
  @ApiParam({ name: 'id', description: 'Requisition UUID' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getHistory(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Getting history for requisition ${id}`);

      const history = await this.auditService.getEntityAuditHistory('REQUISITION', id);

      return {
        requisitionId: id,
        history,
        retrievedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error getting history for requisition ${id}`, error.stack);
      throw new HttpException('Failed to get requisition history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/approve')
  @ApiOperation({ summary: 'Bulk approve requisitions' })
  @ApiResponse({ status: 200, description: 'Bulk approval completed' })
  async bulkApprove(@Body() bulkData: { requisitionIds: string[]; comments?: string }) {
    try {
      this.logger.log(`Bulk approving ${bulkData.requisitionIds.length} requisitions`);

      const results = [];
      for (const id of bulkData.requisitionIds) {
        try {
          const requisition = await this.requisitionService.approveRequisition(
            id,
            'current_user',
            bulkData.comments
          );
          results.push({ id, status: 'success', requisition });

          // Log audit trail
          await this.auditService.logRequisitionAction(
            id,
            'APPROVE' as any,
            'current_user',
            { comments: bulkData.comments, bulkOperation: true }
          );
        } catch (error) {
          results.push({ id, status: 'error', error: error.message });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      return {
        message: `Bulk approval completed: ${successCount} successful, ${errorCount} failed`,
        results,
        summary: { total: results.length, successful: successCount, failed: errorCount },
      };
    } catch (error) {
      this.logger.error('Error in bulk approve operation', error.stack);
      throw new HttpException('Bulk approval operation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('auto-approval/process')
  @ApiOperation({ summary: 'Process automatic approvals' })
  @ApiResponse({ status: 200, description: 'Auto-approval processing completed' })
  async processAutoApprovals() {
    try {
      this.logger.log('Processing automatic approvals');

      await this.requisitionService.processAutomaticApprovals();

      return { message: 'Auto-approval processing completed successfully' };
    } catch (error) {
      this.logger.error('Error processing automatic approvals', error.stack);
      throw new HttpException('Failed to process automatic approvals', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== DASHBOARD OPERATIONS ====================

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get requisition dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getDashboardSummary() {
    try {
      this.logger.log('Getting requisition dashboard summary');

      const [
        totalRequisitions,
        pendingApproval,
        approved,
        rejected,
        overdue,
      ] = await Promise.all([
        this.requisitionRepository.count(),
        this.requisitionRepository.count({ where: { status: RequisitionStatus.PENDING_APPROVAL } }),
        this.requisitionRepository.count({ where: { status: RequisitionStatus.APPROVED } }),
        this.requisitionRepository.count({ where: { status: RequisitionStatus.REJECTED } }),
        this.requisitionRepository.count({
          where: {
            status: RequisitionStatus.PENDING_APPROVAL,
            requiredDate: new Date() as any, // This would need proper date comparison
          },
        }),
      ]);

      const summary = {
        totalRequisitions,
        pendingApproval,
        approved,
        rejected,
        overdue,
        approvalRate: totalRequisitions > 0 ? Math.round((approved / totalRequisitions) * 100) : 0,
        generatedAt: new Date(),
      };

      return summary;
    } catch (error) {
      this.logger.error('Error getting dashboard summary', error.stack);
      throw new HttpException('Failed to get dashboard summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get requisitions for specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User requisitions retrieved successfully' })
  async getUserRequisitions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: RequisitionQueryDto,
  ) {
    try {
      this.logger.log(`Getting requisitions for user ${userId}`);

      const modifiedQuery = { ...query, requesterId: userId };
      return await this.findAll(modifiedQuery);
    } catch (error) {
      this.logger.error(`Error getting requisitions for user ${userId}`, error.stack);
      throw new HttpException('Failed to get user requisitions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
