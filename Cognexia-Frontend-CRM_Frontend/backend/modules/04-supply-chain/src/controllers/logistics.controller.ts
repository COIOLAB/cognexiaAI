// Industry 5.0 ERP Backend - Supply Chain Module
// Logistics Controller - Comprehensive logistics and shipment management
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
import { LogisticsShipment } from '../entities/LogisticsShipment';
import { Warehouse } from '../entities/Warehouse';
import { Supplier } from '../entities/Supplier.entity';

// Services
import { LogisticsCoordinationService } from '../services/LogisticsCoordinationService';
import { HyperAdvancedLogisticsService } from '../services/HyperAdvancedLogisticsService';
import { SmartCrossDockingFlowThroughService } from '../services/SmartCrossDockingFlowThroughService';
import { SupplyChainLogisticsManagementService } from '../services/SupplyChainLogisticsManagementService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs (to be implemented)
import { 
  CreateShipmentDto,
  UpdateShipmentDto,
  LogisticsQueryDto,
  RouteOptimizationDto,
  CrossDockingOperationDto,
  TrackingUpdateDto,
  DeliveryScheduleDto,
  BulkShipmentOperationDto
} from '../dto/logistics.dto';

export enum ShipmentStatus {
  PLANNED = 'planned',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum ShipmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum TransportMode {
  TRUCK = 'truck',
  RAIL = 'rail',
  AIR = 'air',
  SEA = 'sea',
  MULTIMODAL = 'multimodal'
}

@ApiTags('Logistics Management')
@Controller('supply-chain/logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class LogisticsController {
  constructor(
    @InjectRepository(LogisticsShipment)
    private readonly shipmentRepository: Repository<LogisticsShipment>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly logisticsCoordinationService: LogisticsCoordinationService,
    private readonly hyperAdvancedLogisticsService: HyperAdvancedLogisticsService,
    private readonly crossDockingService: SmartCrossDockingFlowThroughService,
    private readonly logisticsManagementService: SupplyChainLogisticsManagementService,
  ) {}

  // ==================== SHIPMENT MANAGEMENT ====================

  @Post('shipments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new shipment',
    description: 'Create a new shipment with AI-optimized routing and scheduling'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Shipment successfully created',
    type: LogisticsShipment
  })
  @ApiResponse({ status: 400, description: 'Invalid shipment data' })
  @Roles('LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN')
  @RequirePermissions('SHIPMENT_CREATE')
  async createShipment(
    @Body(ValidationPipe) createShipmentDto: CreateShipmentDto
  ): Promise<LogisticsShipment> {
    // Create base shipment
    const shipment = await this.shipmentRepository.create(createShipmentDto);
    
    // Use AI to optimize routing
    const optimizedRoute = await this.hyperAdvancedLogisticsService.optimizeRoute({
      origin: createShipmentDto.originAddress,
      destination: createShipmentDto.destinationAddress,
      cargo: createShipmentDto.items,
      constraints: createShipmentDto.constraints
    });

    shipment.route = optimizedRoute;
    shipment.estimatedDeliveryDate = optimizedRoute.estimatedDeliveryTime;
    
    const savedShipment = await this.shipmentRepository.save(shipment);
    
    // Initialize tracking
    await this.logisticsCoordinationService.initializeShipmentTracking(savedShipment.id);
    
    return savedShipment;
  }

  @Get('shipments')
  @ApiOperation({ 
    summary: 'Get all shipments with filtering',
    description: 'Retrieve shipments based on various criteria with advanced filtering'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Shipments retrieved successfully',
    type: [LogisticsShipment]
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'status', required: false, enum: ShipmentStatus, description: 'Filter by shipment status' })
  @ApiQuery({ name: 'priority', required: false, enum: ShipmentPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'transportMode', required: false, enum: TransportMode, description: 'Filter by transport mode' })
  @RequirePermissions('SHIPMENT_VIEW')
  async getAllShipments(
    @Query() queryDto: LogisticsQueryDto
  ): Promise<{
    shipments: LogisticsShipment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.shipmentRepository.createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.supplier', 'supplier')
      .leftJoinAndSelect('shipment.destinationWarehouse', 'warehouse');

    // Apply filters
    if (queryDto.status) {
      queryBuilder.andWhere('shipment.status = :status', { status: queryDto.status });
    }

    if (queryDto.priority) {
      queryBuilder.andWhere('shipment.priority = :priority', { priority: queryDto.priority });
    }

    if (queryDto.transportMode) {
      queryBuilder.andWhere('shipment.transportMode = :transportMode', { 
        transportMode: queryDto.transportMode 
      });
    }

    if (queryDto.dateFrom && queryDto.dateTo) {
      queryBuilder.andWhere(
        'shipment.createdAt BETWEEN :dateFrom AND :dateTo',
        { dateFrom: queryDto.dateFrom, dateTo: queryDto.dateTo }
      );
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(shipment.trackingNumber ILIKE :search OR shipment.referenceNumber ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    const total = await queryBuilder.getCount();
    const shipments = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('shipment.createdAt', 'DESC')
      .getMany();

    return {
      shipments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('shipments/:id')
  @ApiOperation({ 
    summary: 'Get shipment by ID',
    description: 'Retrieve detailed shipment information including tracking history'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @RequirePermissions('SHIPMENT_VIEW')
  async getShipmentById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<LogisticsShipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['supplier', 'destinationWarehouse', 'trackingEvents'],
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return shipment;
  }

  @Put('shipments/:id')
  @ApiOperation({ 
    summary: 'Update shipment information',
    description: 'Update shipment details with validation and tracking'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @Roles('LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SHIPMENT_UPDATE')
  async updateShipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateShipmentDto: UpdateShipmentDto
  ): Promise<LogisticsShipment> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } });
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Store old values for tracking
    const oldStatus = shipment.status;

    Object.assign(shipment, updateShipmentDto);
    shipment.updatedAt = new Date();

    const updatedShipment = await this.shipmentRepository.save(shipment);

    // If status changed, create tracking event
    if (oldStatus !== updatedShipment.status) {
      await this.logisticsCoordinationService.createTrackingEvent(id, {
        status: updatedShipment.status,
        location: updatedShipment.currentLocation,
        timestamp: new Date(),
        notes: updateShipmentDto.statusNote || 'Status updated'
      });
    }

    return updatedShipment;
  }

  @Delete('shipments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Cancel shipment',
    description: 'Cancel a shipment with proper validation and notifications'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @Roles('LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SHIPMENT_CANCEL')
  async cancelShipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancellationData: { reason: string; refundRequired?: boolean }
  ): Promise<void> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (shipment.status === 'DELIVERED') {
      throw new Error('Cannot cancel delivered shipment');
    }

    shipment.status = 'CANCELLED' as any;
    shipment.cancellationReason = cancellationData.reason;
    shipment.updatedAt = new Date();

    await this.shipmentRepository.save(shipment);

    // Create tracking event
    await this.logisticsCoordinationService.createTrackingEvent(id, {
      status: 'CANCELLED',
      timestamp: new Date(),
      notes: `Shipment cancelled: ${cancellationData.reason}`
    });

    // Process refund if required
    if (cancellationData.refundRequired) {
      await this.logisticsManagementService.processShipmentRefund(id);
    }
  }

  // ==================== TRACKING & MONITORING ====================

  @Get('shipments/:id/tracking')
  @ApiOperation({ 
    summary: 'Get shipment tracking information',
    description: 'Retrieve real-time tracking information and history'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @RequirePermissions('SHIPMENT_TRACKING_VIEW')
  async getShipmentTracking(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.logisticsCoordinationService.getShipmentTracking(id);
  }

  @Post('shipments/:id/tracking')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Update shipment tracking',
    description: 'Add new tracking event to shipment history'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @Roles('LOGISTICS_OPERATOR', 'LOGISTICS_MANAGER', 'CARRIER', 'DRIVER')
  @RequirePermissions('SHIPMENT_TRACKING_UPDATE')
  async updateShipmentTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) trackingDto: TrackingUpdateDto
  ) {
    return await this.logisticsCoordinationService.createTrackingEvent(id, trackingDto);
  }

  @Get('tracking/real-time')
  @ApiOperation({ 
    summary: 'Get real-time tracking dashboard',
    description: 'Retrieve real-time status of all active shipments'
  })
  @RequirePermissions('LOGISTICS_DASHBOARD_VIEW')
  async getRealTimeTrackingDashboard() {
    return await this.logisticsCoordinationService.getRealTimeTrackingDashboard();
  }

  @Get('shipments/:id/estimated-delivery')
  @ApiOperation({ 
    summary: 'Get estimated delivery time',
    description: 'Get AI-powered estimated delivery time with confidence intervals'
  })
  @ApiParam({ name: 'id', type: String, description: 'Shipment UUID' })
  @RequirePermissions('SHIPMENT_ETA_VIEW')
  async getEstimatedDeliveryTime(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.hyperAdvancedLogisticsService.calculateEstimatedDelivery(id);
  }

  // ==================== ROUTE OPTIMIZATION ====================

  @Post('route/optimize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Optimize delivery routes',
    description: 'Use AI to optimize routes for multiple shipments'
  })
  @Roles('LOGISTICS_MANAGER', 'ROUTE_PLANNER', 'ADMIN')
  @RequirePermissions('ROUTE_OPTIMIZATION')
  async optimizeRoutes(
    @Body(ValidationPipe) routeOptimizationDto: RouteOptimizationDto
  ) {
    return await this.hyperAdvancedLogisticsService.optimizeMultipleRoutes(routeOptimizationDto);
  }

  @Get('route/analysis')
  @ApiOperation({ 
    summary: 'Get route performance analysis',
    description: 'Analyze route performance and identify optimization opportunities'
  })
  @RequirePermissions('ROUTE_ANALYSIS_VIEW')
  async getRouteAnalysis(
    @Query('period') period?: string,
    @Query('region') region?: string
  ) {
    return await this.hyperAdvancedLogisticsService.analyzeRoutePerformance({ period, region });
  }

  @Post('route/alternative')
  @ApiOperation({ 
    summary: 'Generate alternative routes',
    description: 'Generate alternative route options for contingency planning'
  })
  @Roles('LOGISTICS_MANAGER', 'ROUTE_PLANNER')
  @RequirePermissions('ROUTE_PLANNING')
  async generateAlternativeRoutes(
    @Body() routeRequest: {
      origin: string;
      destination: string;
      constraints?: any;
      alternativeCount?: number;
    }
  ) {
    return await this.hyperAdvancedLogisticsService.generateAlternativeRoutes(routeRequest);
  }

  // ==================== CROSS-DOCKING OPERATIONS ====================

  @Post('cross-docking/operations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create cross-docking operation',
    description: 'Initialize cross-docking operation with AI optimization'
  })
  @Roles('LOGISTICS_MANAGER', 'WAREHOUSE_MANAGER', 'CROSS_DOCK_OPERATOR')
  @RequirePermissions('CROSS_DOCKING_CREATE')
  async createCrossDockingOperation(
    @Body(ValidationPipe) crossDockingDto: CrossDockingOperationDto
  ) {
    return await this.crossDockingService.initiateCrossDockingOperation(crossDockingDto);
  }

  @Get('cross-docking/operations')
  @ApiOperation({ 
    summary: 'Get cross-docking operations',
    description: 'Retrieve all active cross-docking operations'
  })
  @RequirePermissions('CROSS_DOCKING_VIEW')
  async getCrossDockingOperations(
    @Query('status') status?: string,
    @Query('facility') facility?: string
  ) {
    return await this.crossDockingService.getCrossDockingOperations({ status, facility });
  }

  @Get('cross-docking/optimization')
  @ApiOperation({ 
    summary: 'Get cross-docking optimization suggestions',
    description: 'Get AI-powered suggestions for improving cross-docking efficiency'
  })
  @RequirePermissions('CROSS_DOCKING_OPTIMIZATION_VIEW')
  async getCrossDockingOptimization() {
    return await this.crossDockingService.getOptimizationSuggestions();
  }

  // ==================== DELIVERY SCHEDULING ====================

  @Post('delivery/schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Schedule delivery',
    description: 'Schedule delivery with customer preferences and constraints'
  })
  @Roles('LOGISTICS_MANAGER', 'DELIVERY_SCHEDULER', 'CUSTOMER_SERVICE')
  @RequirePermissions('DELIVERY_SCHEDULE')
  async scheduleDelivery(
    @Body(ValidationPipe) scheduleDto: DeliveryScheduleDto
  ) {
    return await this.logisticsManagementService.scheduleDelivery(scheduleDto);
  }

  @Get('delivery/schedule/optimization')
  @ApiOperation({ 
    summary: 'Get delivery schedule optimization',
    description: 'Optimize delivery schedules for maximum efficiency'
  })
  @RequirePermissions('DELIVERY_OPTIMIZATION_VIEW')
  async getDeliveryScheduleOptimization(
    @Query('date') date?: string,
    @Query('region') region?: string
  ) {
    return await this.logisticsManagementService.optimizeDeliverySchedule({ date, region });
  }

  @Get('delivery/capacity')
  @ApiOperation({ 
    summary: 'Get delivery capacity analysis',
    description: 'Analyze delivery capacity and utilization'
  })
  @RequirePermissions('DELIVERY_CAPACITY_VIEW')
  async getDeliveryCapacityAnalysis(
    @Query('timeframe') timeframe?: string
  ) {
    return await this.logisticsManagementService.analyzeDeliveryCapacity(timeframe);
  }

  // ==================== ANALYTICS & REPORTING ====================

  @Get('analytics/performance')
  @ApiOperation({ 
    summary: 'Get logistics performance analytics',
    description: 'Retrieve comprehensive logistics performance metrics'
  })
  @RequirePermissions('LOGISTICS_ANALYTICS_VIEW')
  async getLogisticsPerformanceAnalytics(
    @Query('period') period?: string,
    @Query('metrics') metrics?: string[]
  ) {
    return await this.logisticsManagementService.getPerformanceAnalytics({ period, metrics });
  }

  @Get('analytics/cost-optimization')
  @ApiOperation({ 
    summary: 'Get cost optimization analysis',
    description: 'Analyze logistics costs and identify optimization opportunities'
  })
  @RequirePermissions('LOGISTICS_COST_ANALYSIS')
  async getCostOptimizationAnalysis() {
    return await this.hyperAdvancedLogisticsService.analyzeCostOptimization();
  }

  @Get('analytics/carbon-footprint')
  @ApiOperation({ 
    summary: 'Get carbon footprint analysis',
    description: 'Analyze environmental impact of logistics operations'
  })
  @RequirePermissions('LOGISTICS_SUSTAINABILITY_VIEW')
  async getCarbonFootprintAnalysis(
    @Query('period') period?: string
  ) {
    return await this.hyperAdvancedLogisticsService.analyzeCarbonFootprint(period);
  }

  @Get('analytics/predictive')
  @ApiOperation({ 
    summary: 'Get predictive analytics',
    description: 'Get AI-powered predictive insights for logistics planning'
  })
  @RequirePermissions('LOGISTICS_PREDICTIVE_ANALYTICS')
  async getPredictiveAnalytics(
    @Query('horizon') horizon?: string,
    @Query('metrics') metrics?: string[]
  ) {
    return await this.hyperAdvancedLogisticsService.getPredictiveAnalytics({ horizon, metrics });
  }

  // ==================== BULK OPERATIONS ====================

  @Post('shipments/bulk/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Bulk create shipments',
    description: 'Create multiple shipments in batch with optimization'
  })
  @Roles('LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SHIPMENT_BULK_CREATE')
  async bulkCreateShipments(
    @Body(ValidationPipe) bulkOperationDto: BulkShipmentOperationDto
  ) {
    return await this.logisticsManagementService.bulkCreateShipments(bulkOperationDto);
  }

  @Put('shipments/bulk/update')
  @ApiOperation({ 
    summary: 'Bulk update shipments',
    description: 'Update multiple shipments simultaneously'
  })
  @Roles('LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ADMIN')
  @RequirePermissions('SHIPMENT_BULK_UPDATE')
  async bulkUpdateShipments(
    @Body() bulkUpdateDto: {
      shipmentIds: string[];
      updates: Partial<UpdateShipmentDto>;
      updateReason: string;
    }
  ) {
    return await this.logisticsManagementService.bulkUpdateShipments(bulkUpdateDto);
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get logistics dashboard',
    description: 'Retrieve comprehensive logistics management dashboard data'
  })
  @RequirePermissions('LOGISTICS_DASHBOARD_VIEW')
  async getLogisticsDashboard() {
    return await this.logisticsManagementService.getDashboardData();
  }

  // ==================== CARRIER MANAGEMENT ====================

  @Get('carriers')
  @ApiOperation({ 
    summary: 'Get carrier information',
    description: 'Retrieve information about logistics carriers and their performance'
  })
  @RequirePermissions('CARRIER_VIEW')
  async getCarriers(
    @Query('type') type?: string,
    @Query('region') region?: string
  ) {
    return await this.logisticsManagementService.getCarriers({ type, region });
  }

  @Get('carriers/:carrierId/performance')
  @ApiOperation({ 
    summary: 'Get carrier performance metrics',
    description: 'Retrieve performance analytics for a specific carrier'
  })
  @ApiParam({ name: 'carrierId', type: String, description: 'Carrier ID' })
  @RequirePermissions('CARRIER_PERFORMANCE_VIEW')
  async getCarrierPerformance(
    @Param('carrierId') carrierId: string,
    @Query('period') period?: string
  ) {
    return await this.logisticsManagementService.getCarrierPerformance(carrierId, period);
  }

  @Post('carriers/selection/optimize')
  @ApiOperation({ 
    summary: 'Optimize carrier selection',
    description: 'Use AI to select optimal carriers for shipments'
  })
  @Roles('LOGISTICS_MANAGER', 'PROCUREMENT_MANAGER')
  @RequirePermissions('CARRIER_SELECTION')
  async optimizeCarrierSelection(
    @Body() selectionCriteria: {
      shipmentRequirements: any;
      constraints: any;
      preferences: any;
    }
  ) {
    return await this.hyperAdvancedLogisticsService.optimizeCarrierSelection(selectionCriteria);
  }
}
