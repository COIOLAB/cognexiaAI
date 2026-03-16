// Industry 5.0 ERP Backend - Supply Chain Module
// Warehouse Controller - Comprehensive warehouse operations management
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
} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Entities
import { Warehouse } from '../entities/Warehouse';
import { InventoryItem } from '../entities/InventoryItem';
import { InventoryTransaction } from '../entities/InventoryTransaction';

// Services
import { IntelligentWarehouseOperationsService } from '../services/IntelligentWarehouseOperationsService';
import { AutonomousStorageRetrievalService } from '../services/AutonomousStorageRetrievalService';
import { RealTimeInventoryTrackingService } from '../services/RealTimeInventoryTrackingService';
import { SmartStorageLocationOptimizationService } from '../services/SmartStorageLocationOptimizationService';
import { SmartWarehouseLayoutOptimizationService } from '../services/SmartWarehouseLayoutOptimizationService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs (to be implemented)
import { 
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseQueryDto,
  InventoryMovementDto,
  StorageLocationDto,
  WarehouseOptimizationDto,
  BulkInventoryOperationDto
} from '../dto/warehouse.dto';

@ApiTags('Warehouse Management')
@Controller('supply-chain/warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class WarehouseController {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepository: Repository<InventoryTransaction>,
    private readonly warehouseOperationsService: IntelligentWarehouseOperationsService,
    private readonly autonomousStorageService: AutonomousStorageRetrievalService,
    private readonly inventoryTrackingService: RealTimeInventoryTrackingService,
    private readonly storageOptimizationService: SmartStorageLocationOptimizationService,
    private readonly layoutOptimizationService: SmartWarehouseLayoutOptimizationService,
  ) {}

  // ==================== WAREHOUSE CRUD OPERATIONS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new warehouse',
    description: 'Register a new warehouse facility with comprehensive configuration'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Warehouse successfully created',
    type: Warehouse
  })
  @ApiResponse({ status: 400, description: 'Invalid warehouse data' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN')
  @RequirePermissions('WAREHOUSE_CREATE')
  async createWarehouse(
    @Body(ValidationPipe) createWarehouseDto: CreateWarehouseDto
  ): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.create(createWarehouseDto);
    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    
    // Initialize warehouse operations
    await this.warehouseOperationsService.initializeWarehouse(savedWarehouse.id);
    
    // Setup initial storage layout
    await this.layoutOptimizationService.initializeWarehouseLayout(savedWarehouse.id);
    
    return savedWarehouse;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all warehouses with filtering',
    description: 'Retrieve warehouses based on various criteria'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Warehouses retrieved successfully',
    type: [Warehouse]
  })
  @RequirePermissions('WAREHOUSE_VIEW')
  async getAllWarehouses(
    @Query() queryDto: WarehouseQueryDto
  ): Promise<{
    warehouses: Warehouse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.warehouseRepository.createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.inventoryItems', 'inventory');

    // Apply filters
    if (queryDto.location) {
      queryBuilder.andWhere(
        'warehouse.city ILIKE :location OR warehouse.state ILIKE :location',
        { location: `%${queryDto.location}%` }
      );
    }

    if (queryDto.type) {
      queryBuilder.andWhere('warehouse.type = :type', { type: queryDto.type });
    }

    if (queryDto.isActive !== undefined) {
      queryBuilder.andWhere('warehouse.isActive = :isActive', { 
        isActive: queryDto.isActive 
      });
    }

    const total = await queryBuilder.getCount();
    const warehouses = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('warehouse.createdAt', 'DESC')
      .getMany();

    return {
      warehouses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get warehouse by ID',
    description: 'Retrieve detailed warehouse information including inventory'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_VIEW')
  async getWarehouseById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['inventoryItems', 'transactions'],
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return warehouse;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update warehouse information',
    description: 'Update warehouse configuration and settings'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN')
  @RequirePermissions('WAREHOUSE_UPDATE')
  async updateWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateWarehouseDto: UpdateWarehouseDto
  ): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    Object.assign(warehouse, updateWarehouseDto);
    warehouse.updatedAt = new Date();

    const updatedWarehouse = await this.warehouseRepository.save(warehouse);

    // Re-optimize layout if capacity or structure changed
    if (updateWarehouseDto.totalCapacity || updateWarehouseDto.layout) {
      await this.layoutOptimizationService.reoptimizeLayout(id);
    }

    return updatedWarehouse;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deactivate warehouse',
    description: 'Soft delete warehouse with inventory checks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('WAREHOUSE_DELETE')
  async deactivateWarehouse(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const warehouse = await this.warehouseRepository.findOne({ 
      where: { id },
      relations: ['inventoryItems']
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Check for active inventory
    const activeInventory = warehouse.inventoryItems?.filter(item => item.quantity > 0);
    if (activeInventory && activeInventory.length > 0) {
      throw new Error(`Cannot deactivate warehouse with ${activeInventory.length} active inventory items`);
    }

    warehouse.isActive = false;
    warehouse.updatedAt = new Date();

    await this.warehouseRepository.save(warehouse);
  }

  // ==================== INVENTORY MANAGEMENT ====================

  @Get(':id/inventory')
  @ApiOperation({ 
    summary: 'Get warehouse inventory',
    description: 'Retrieve all inventory items in a warehouse with real-time tracking'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('INVENTORY_VIEW')
  async getWarehouseInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('category') category?: string,
    @Query('lowStock') lowStock?: boolean
  ) {
    return await this.inventoryTrackingService.getWarehouseInventory(
      id, 
      { category, lowStock }
    );
  }

  @Post(':id/inventory/movement')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Record inventory movement',
    description: 'Record stock movement (inbound/outbound) with real-time tracking'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_OPERATOR', 'WAREHOUSE_MANAGER', 'SUPPLY_CHAIN_MANAGER')
  @RequirePermissions('INVENTORY_MOVEMENT')
  async recordInventoryMovement(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body(ValidationPipe) movementDto: InventoryMovementDto
  ) {
    return await this.inventoryTrackingService.recordMovement(warehouseId, movementDto);
  }

  @Get(':id/inventory/analytics')
  @ApiOperation({ 
    summary: 'Get inventory analytics',
    description: 'Retrieve comprehensive inventory analytics and insights'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('INVENTORY_ANALYTICS')
  async getInventoryAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period?: string
  ) {
    return await this.inventoryTrackingService.getInventoryAnalytics(id, period);
  }

  @Post(':id/inventory/cycle-count')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Initiate cycle count',
    description: 'Start inventory cycle count process with AI optimization'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_MANAGER', 'INVENTORY_CONTROLLER')
  @RequirePermissions('INVENTORY_CYCLE_COUNT')
  async initiateCycleCount(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body() cycleCountDto: { areas?: string[]; priority?: 'high' | 'medium' | 'low' }
  ) {
    return await this.inventoryTrackingService.initiateCycleCount(warehouseId, cycleCountDto);
  }

  // ==================== AUTONOMOUS STORAGE & RETRIEVAL ====================

  @Post(':id/storage/autonomous-putaway')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Execute autonomous putaway',
    description: 'Use AI to determine optimal storage locations for incoming inventory'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_OPERATOR', 'WAREHOUSE_MANAGER')
  @RequirePermissions('AUTONOMOUS_STORAGE')
  async executeAutonomousPutaway(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body(ValidationPipe) putawayDto: StorageLocationDto
  ) {
    return await this.autonomousStorageService.executePutaway(warehouseId, putawayDto);
  }

  @Post(':id/retrieval/autonomous-picking')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Execute autonomous picking',
    description: 'Use AI to optimize picking routes and strategies'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_OPERATOR', 'WAREHOUSE_MANAGER')
  @RequirePermissions('AUTONOMOUS_RETRIEVAL')
  async executeAutonomousPicking(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body() pickingDto: { orderIds: string[]; priority?: 'rush' | 'normal' | 'batch' }
  ) {
    return await this.autonomousStorageService.executePicking(warehouseId, pickingDto);
  }

  @Get(':id/storage/optimization-suggestions')
  @ApiOperation({ 
    summary: 'Get storage optimization suggestions',
    description: 'Get AI-powered suggestions for improving storage efficiency'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('STORAGE_OPTIMIZATION_VIEW')
  async getStorageOptimizationSuggestions(
    @Param('id', ParseUUIDPipe) warehouseId: string
  ) {
    return await this.storageOptimizationService.getOptimizationSuggestions(warehouseId);
  }

  // ==================== WAREHOUSE OPTIMIZATION ====================

  @Post(':id/layout/optimize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Optimize warehouse layout',
    description: 'Use AI to optimize warehouse layout for maximum efficiency'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('WAREHOUSE_LAYOUT_OPTIMIZE')
  async optimizeWarehouseLayout(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body(ValidationPipe) optimizationDto: WarehouseOptimizationDto
  ) {
    return await this.layoutOptimizationService.optimizeLayout(warehouseId, optimizationDto);
  }

  @Get(':id/layout/analysis')
  @ApiOperation({ 
    summary: 'Get layout analysis',
    description: 'Analyze current warehouse layout efficiency and bottlenecks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_ANALYSIS_VIEW')
  async getLayoutAnalysis(
    @Param('id', ParseUUIDPipe) warehouseId: string
  ) {
    return await this.layoutOptimizationService.analyzeCurrentLayout(warehouseId);
  }

  @Get(':id/performance/metrics')
  @ApiOperation({ 
    summary: 'Get warehouse performance metrics',
    description: 'Retrieve comprehensive warehouse performance analytics'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_PERFORMANCE_VIEW')
  async getWarehousePerformanceMetrics(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Query('period') period?: string
  ) {
    return await this.warehouseOperationsService.getPerformanceMetrics(warehouseId, period);
  }

  @Get(':id/utilization')
  @ApiOperation({ 
    summary: 'Get warehouse utilization',
    description: 'Retrieve space utilization and capacity analytics'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_UTILIZATION_VIEW')
  async getWarehouseUtilization(
    @Param('id', ParseUUIDPipe) warehouseId: string
  ) {
    return await this.warehouseOperationsService.getUtilizationAnalytics(warehouseId);
  }

  // ==================== REAL-TIME OPERATIONS ====================

  @Get(':id/real-time/status')
  @ApiOperation({ 
    summary: 'Get real-time warehouse status',
    description: 'Retrieve current warehouse status and active operations'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_REALTIME_VIEW')
  async getRealTimeStatus(
    @Param('id', ParseUUIDPipe) warehouseId: string
  ) {
    return await this.warehouseOperationsService.getRealTimeStatus(warehouseId);
  }

  @Get(':id/alerts')
  @ApiOperation({ 
    summary: 'Get warehouse alerts',
    description: 'Retrieve active alerts and notifications for the warehouse'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @RequirePermissions('WAREHOUSE_ALERTS_VIEW')
  async getWarehouseAlerts(
    @Param('id', ParseUUIDPipe) warehouseId: string
  ) {
    return await this.warehouseOperationsService.getActiveAlerts(warehouseId);
  }

  @Post(':id/alerts/:alertId/acknowledge')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Acknowledge warehouse alert',
    description: 'Mark a warehouse alert as acknowledged'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @ApiParam({ name: 'alertId', type: String, description: 'Alert ID' })
  @Roles('WAREHOUSE_OPERATOR', 'WAREHOUSE_MANAGER')
  @RequirePermissions('WAREHOUSE_ALERTS_MANAGE')
  async acknowledgeAlert(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Param('alertId') alertId: string
  ): Promise<void> {
    await this.warehouseOperationsService.acknowledgeAlert(warehouseId, alertId);
  }

  // ==================== BULK OPERATIONS ====================

  @Post(':id/inventory/bulk-update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Bulk inventory update',
    description: 'Update multiple inventory items simultaneously'
  })
  @ApiParam({ name: 'id', type: String, description: 'Warehouse UUID' })
  @Roles('WAREHOUSE_MANAGER', 'INVENTORY_CONTROLLER')
  @RequirePermissions('INVENTORY_BULK_UPDATE')
  async bulkInventoryUpdate(
    @Param('id', ParseUUIDPipe) warehouseId: string,
    @Body(ValidationPipe) bulkOperationDto: BulkInventoryOperationDto
  ) {
    return await this.inventoryTrackingService.bulkUpdateInventory(warehouseId, bulkOperationDto);
  }

  @Post('analytics/cross-warehouse')
  @ApiOperation({ 
    summary: 'Cross-warehouse analytics',
    description: 'Get analytics across multiple warehouses for comparison and optimization'
  })
  @RequirePermissions('WAREHOUSE_CROSS_ANALYTICS')
  async getCrossWarehouseAnalytics(
    @Body() warehouseIds: { warehouseIds: string[]; metrics: string[] }
  ) {
    return await this.warehouseOperationsService.getCrossWarehouseAnalytics(
      warehouseIds.warehouseIds, 
      warehouseIds.metrics
    );
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get warehouse dashboard',
    description: 'Retrieve comprehensive warehouse management dashboard data'
  })
  @RequirePermissions('WAREHOUSE_DASHBOARD_VIEW')
  async getWarehouseDashboard() {
    return await this.warehouseOperationsService.getDashboardData();
  }
}
