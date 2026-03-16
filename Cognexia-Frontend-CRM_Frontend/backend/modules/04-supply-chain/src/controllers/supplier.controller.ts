// Industry 5.0 ERP Backend - Supply Chain Module
// Supplier Controller - Comprehensive supplier management
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
  UseInterceptors,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Entities
import { 
  Supplier, 
  SupplierTier, 
  SupplierType, 
  ComplianceStatus 
} from '../entities/Supplier.entity';
import { SupplierPerformanceMetric } from '../entities/SupplierPerformanceMetric.entity';
import { SupplyChainRiskAssessment } from '../entities/SupplyChainRiskAssessment.entity';

// Services
import { SupplierManagementService } from '../services/SupplierManagementService';
import { SupplierPerformanceAnalyticsService } from '../services/SupplierPerformanceAnalyticsService';
import { SupplyChainRiskManagementService } from '../services/SupplyChainRiskManagementService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs (to be implemented)
import { 
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierQueryDto,
  SupplierPerformanceUpdateDto,
  SupplierRiskAssessmentDto,
  BulkSupplierOperationDto
} from '../dto/supplier.dto';

@ApiTags('Supplier Management')
@Controller('supply-chain/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class SupplierController {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierPerformanceMetric)
    private readonly performanceRepository: Repository<SupplierPerformanceMetric>,
    @InjectRepository(SupplyChainRiskAssessment)
    private readonly riskRepository: Repository<SupplyChainRiskAssessment>,
    private readonly supplierManagementService: SupplierManagementService,
    private readonly performanceAnalyticsService: SupplierPerformanceAnalyticsService,
    private readonly riskManagementService: SupplyChainRiskManagementService,
  ) {}

  // ==================== SUPPLIER CRUD OPERATIONS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new supplier',
    description: 'Register a new supplier in the supply chain with comprehensive profile data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Supplier successfully created',
    type: Supplier
  })
  @ApiResponse({ status: 400, description: 'Invalid supplier data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'PROCUREMENT_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_CREATE')
  async createSupplier(
    @Body(ValidationPipe) createSupplierDto: CreateSupplierDto
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.create(createSupplierDto);
    const savedSupplier = await this.supplierRepository.save(supplier);
    
    // Initialize performance tracking
    await this.performanceAnalyticsService.initializeSupplierTracking(savedSupplier.id);
    
    // Perform initial risk assessment
    await this.riskManagementService.performInitialRiskAssessment(savedSupplier.id);
    
    return savedSupplier;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all suppliers with filtering and pagination',
    description: 'Retrieve suppliers based on various criteria with advanced filtering'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Suppliers retrieved successfully',
    type: [Supplier]
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'tier', required: false, enum: SupplierTier, description: 'Filter by supplier tier' })
  @ApiQuery({ name: 'type', required: false, enum: SupplierType, description: 'Filter by supplier type' })
  @ApiQuery({ name: 'status', required: false, enum: ComplianceStatus, description: 'Filter by compliance status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or supplier code' })
  @RequirePermissions('SUPPLIER_VIEW')
  async getAllSuppliers(
    @Query() queryDto: SupplierQueryDto
  ): Promise<{
    suppliers: Supplier[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.performanceMetrics', 'metrics')
      .leftJoinAndSelect('supplier.riskAssessments', 'risks');

    // Apply filters
    if (queryDto.tier) {
      queryBuilder.andWhere('supplier.tier = :tier', { tier: queryDto.tier });
    }

    if (queryDto.type) {
      queryBuilder.andWhere('supplier.type = :type', { type: queryDto.type });
    }

    if (queryDto.complianceStatus) {
      queryBuilder.andWhere('supplier.complianceStatus = :status', { 
        status: queryDto.complianceStatus 
      });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(supplier.name ILIKE :search OR supplier.supplierCode ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    if (queryDto.isActive !== undefined) {
      queryBuilder.andWhere('supplier.isActive = :isActive', { 
        isActive: queryDto.isActive 
      });
    }

    // Apply sorting
    const sortField = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`supplier.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const suppliers = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      suppliers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get supplier by ID',
    description: 'Retrieve detailed supplier information including performance metrics and risk assessments'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Supplier found',
    type: Supplier
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @RequirePermissions('SUPPLIER_VIEW')
  async getSupplierById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: [
        'performanceMetrics',
        'riskAssessments',
        'procurementOrders',
        'blockchainTransactions'
      ],
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return supplier;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update supplier information',
    description: 'Update supplier profile with comprehensive validation and audit trail'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Supplier successfully updated',
    type: Supplier
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'PROCUREMENT_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_UPDATE')
  async updateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateSupplierDto: UpdateSupplierDto
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Store old values for audit trail
    const oldValues = { ...supplier };

    // Update supplier
    Object.assign(supplier, updateSupplierDto);
    supplier.updatedAt = new Date();

    // Add to audit trail
    if (!supplier.auditTrail) {
      supplier.auditTrail = [];
    }

    supplier.auditTrail.push({
      action: 'supplier_updated',
      performedBy: 'current-user-id', // Should come from JWT token
      timestamp: new Date(),
      changes: this.getChangedFields(oldValues, supplier),
      reason: updateSupplierDto.updateReason || 'Profile update',
    });

    const updatedSupplier = await this.supplierRepository.save(supplier);

    // Trigger performance recalculation if needed
    if (this.shouldRecalculatePerformance(oldValues, updatedSupplier)) {
      await this.performanceAnalyticsService.recalculatePerformance(id);
    }

    // Update risk assessment if needed
    if (this.shouldUpdateRiskAssessment(oldValues, updatedSupplier)) {
      await this.riskManagementService.updateRiskAssessment(id);
    }

    return updatedSupplier;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deactivate supplier',
    description: 'Soft delete supplier (set as inactive) with comprehensive checks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @ApiResponse({ status: 204, description: 'Supplier successfully deactivated' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate supplier with active orders' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_DELETE')
  async deactivateSupplier(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const supplier = await this.supplierRepository.findOne({ 
      where: { id },
      relations: ['procurementOrders']
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Check for active orders
    const activeOrders = supplier.procurementOrders?.filter(
      order => order.status === 'PENDING' || order.status === 'IN_PROGRESS'
    );

    if (activeOrders && activeOrders.length > 0) {
      throw new Error(`Cannot deactivate supplier with ${activeOrders.length} active orders`);
    }

    // Soft delete - set as inactive
    supplier.isActive = false;
    supplier.updatedAt = new Date();

    // Add to audit trail
    if (!supplier.auditTrail) {
      supplier.auditTrail = [];
    }

    supplier.auditTrail.push({
      action: 'supplier_deactivated',
      performedBy: 'current-user-id', // Should come from JWT token
      timestamp: new Date(),
      changes: { isActive: false },
      reason: 'Supplier deactivation',
    });

    await this.supplierRepository.save(supplier);
  }

  // ==================== PERFORMANCE MANAGEMENT ====================

  @Get(':id/performance')
  @ApiOperation({ 
    summary: 'Get supplier performance metrics',
    description: 'Retrieve comprehensive performance analytics for a supplier'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Performance metrics retrieved successfully'
  })
  @RequirePermissions('SUPPLIER_PERFORMANCE_VIEW')
  async getSupplierPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period?: string
  ) {
    return await this.performanceAnalyticsService.getPerformanceMetrics(id, period);
  }

  @Post(':id/performance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Update supplier performance metrics',
    description: 'Record new performance data for a supplier'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'QUALITY_MANAGER', 'PROCUREMENT_MANAGER')
  @RequirePermissions('SUPPLIER_PERFORMANCE_UPDATE')
  async updateSupplierPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) performanceDto: SupplierPerformanceUpdateDto
  ) {
    return await this.performanceAnalyticsService.recordPerformanceData(id, performanceDto);
  }

  @Get(':id/performance/analytics')
  @ApiOperation({ 
    summary: 'Get advanced performance analytics',
    description: 'Retrieve AI-powered performance analytics and predictions'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @RequirePermissions('SUPPLIER_ANALYTICS_VIEW')
  async getPerformanceAnalytics(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.performanceAnalyticsService.getAdvancedAnalytics(id);
  }

  // ==================== RISK MANAGEMENT ====================

  @Get(':id/risk-assessment')
  @ApiOperation({ 
    summary: 'Get supplier risk assessment',
    description: 'Retrieve current risk assessment for a supplier'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @RequirePermissions('SUPPLIER_RISK_VIEW')
  async getRiskAssessment(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.riskManagementService.getCurrentRiskAssessment(id);
  }

  @Post(':id/risk-assessment')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Perform new risk assessment',
    description: 'Conduct comprehensive risk assessment for a supplier'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @Roles('RISK_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_RISK_ASSESS')
  async performRiskAssessment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) riskAssessmentDto: SupplierRiskAssessmentDto
  ) {
    return await this.riskManagementService.performRiskAssessment(id, riskAssessmentDto);
  }

  @Get(':id/risk-monitoring')
  @ApiOperation({ 
    summary: 'Get real-time risk monitoring',
    description: 'Retrieve real-time risk monitoring data and alerts'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @RequirePermissions('SUPPLIER_RISK_MONITOR')
  async getRiskMonitoring(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.riskManagementService.getRealTimeRiskMonitoring(id);
  }

  // ==================== SUSTAINABILITY & COMPLIANCE ====================

  @Get(':id/sustainability')
  @ApiOperation({ 
    summary: 'Get supplier sustainability metrics',
    description: 'Retrieve sustainability performance and ESG metrics'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @RequirePermissions('SUPPLIER_SUSTAINABILITY_VIEW')
  async getSustainabilityMetrics(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.supplierManagementService.assessSustainability(id);
  }

  @Get(':id/human-centric-values')
  @ApiOperation({ 
    summary: 'Get human-centric values assessment',
    description: 'Retrieve Industry 5.0 human-centric values evaluation'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @RequirePermissions('SUPPLIER_HUMAN_CENTRIC_VIEW')
  async getHumanCentricValues(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.supplierManagementService.evaluateHumanCentricValues(id);
  }

  @Put(':id/compliance-status')
  @ApiOperation({ 
    summary: 'Update supplier compliance status',
    description: 'Update compliance status with audit trail and notifications'
  })
  @ApiParam({ name: 'id', type: String, description: 'Supplier UUID' })
  @Roles('COMPLIANCE_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_COMPLIANCE_UPDATE')
  async updateComplianceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() complianceData: { 
      status: ComplianceStatus; 
      reason: string; 
      notes?: string 
    }
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    supplier.updateComplianceStatus(complianceData.status, complianceData.reason);
    
    return await this.supplierRepository.save(supplier);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Bulk import suppliers',
    description: 'Import multiple suppliers from CSV or JSON data'
  })
  @Roles('SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_BULK_IMPORT')
  async bulkImportSuppliers(
    @Body(ValidationPipe) bulkOperationDto: BulkSupplierOperationDto
  ) {
    return await this.supplierManagementService.bulkImportSuppliers(bulkOperationDto);
  }

  @Post('bulk/update')
  @ApiOperation({ 
    summary: 'Bulk update suppliers',
    description: 'Update multiple suppliers with batch operations'
  })
  @Roles('SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SUPPLIER_BULK_UPDATE')
  async bulkUpdateSuppliers(
    @Body(ValidationPipe) bulkOperationDto: BulkSupplierOperationDto
  ) {
    return await this.supplierManagementService.bulkUpdateSuppliers(bulkOperationDto);
  }

  @Get('analytics/dashboard')
  @ApiOperation({ 
    summary: 'Get supplier analytics dashboard',
    description: 'Retrieve comprehensive supplier analytics for dashboard'
  })
  @RequirePermissions('SUPPLIER_ANALYTICS_VIEW')
  async getSupplierDashboard() {
    return await this.supplierManagementService.getSupplierDashboard();
  }

  @Post('search')
  @ApiOperation({ 
    summary: 'Advanced supplier search',
    description: 'Perform complex supplier searches with multiple criteria'
  })
  @RequirePermissions('SUPPLIER_SEARCH')
  async searchSuppliers(
    @Body(ValidationPipe) searchCriteria: any
  ) {
    return await this.supplierManagementService.searchSuppliers(searchCriteria);
  }

  // ==================== HELPER METHODS ====================

  private getChangedFields(oldValues: any, newValues: any): Record<string, any> {
    const changes: Record<string, any> = {};
    
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key],
        };
      }
    }
    
    return changes;
  }

  private shouldRecalculatePerformance(oldValues: Supplier, newValues: Supplier): boolean {
    const performanceFields = [
      'qualityRating',
      'deliveryRating', 
      'serviceRating',
      'tier',
      'type'
    ];
    
    return performanceFields.some(field => oldValues[field] !== newValues[field]);
  }

  private shouldUpdateRiskAssessment(oldValues: Supplier, newValues: Supplier): boolean {
    const riskFields = [
      'complianceStatus',
      'tier',
      'financialRating',
      'certifications'
    ];
    
    return riskFields.some(field => 
      JSON.stringify(oldValues[field]) !== JSON.stringify(newValues[field])
    );
  }
}
