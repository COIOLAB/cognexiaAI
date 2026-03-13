// Industry 5.0 ERP Backend - Shop Floor Control Module
// Production Line Controller - Comprehensive production line management and optimization
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
  Patch,
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
import { 
  ProductionLine, 
  ProductionLineType, 
  ProductionLineStatus,
  LineCapabilities,
  ProductionSchedule,
  QualityMetrics,
  ProductionMetrics,
  ThroughputOptimization
} from '../entities/production-line.entity';
import { WorkCell } from '../entities/work-cell.entity';
import { Robot } from '../entities/robot.entity';

// Services
import { ShopFloorControlService } from '../services/shop-floor-control.service';
import { RealTimeProductionMonitoringService } from '../services/RealTimeProductionMonitoringService';
import { PredictiveMaintenanceService } from '../services/PredictiveMaintenanceService';
import { AutonomousRobotCoordinationService } from '../services/AutonomousRobotCoordinationService';
import { AIPoweredRobotLearningService } from '../services/AIPoweredRobotLearningService';
import { DigitalTwinIntegrationService } from '../services/DigitalTwinIntegrationService';
import { ProductionOptimizationService } from '../services/ProductionOptimizationService';
import { QualityAssuranceService } from '../services/QualityAssuranceService';
import { SmartSchedulingService } from '../services/SmartSchedulingService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs
import { 
  CreateProductionLineDto,
  UpdateProductionLineDto,
  ProductionLineQueryDto,
  StartProductionLineDto,
  IncrementLineProgressDto,
  SetLineProgressDto,
  UpdateProductionMetricsDto,
  UpdateQualityMetricsDto,
  UpdateThroughputOptimizationDto,
  AssignWorkCellsDto,
  AlertDto,
  QualityAlertDto,
  IssueDto,
  BulkProductionLineOperationDto,
  ProductionLineSummaryDto,
  ProductionLineDashboardDto,
  ProductionScheduleDto,
  LineCapabilitiesDto
} from '../dto/production-line.dto';

@ApiTags('Production Line Management')
@Controller('shop-floor/production-lines')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class ProductionLineController {
  constructor(
    @InjectRepository(ProductionLine)
    private readonly productionLineRepository: Repository<ProductionLine>,
    @InjectRepository(WorkCell)
    private readonly workCellRepository: Repository<WorkCell>,
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    private readonly shopFloorService: ShopFloorControlService,
    private readonly monitoringService: RealTimeProductionMonitoringService,
    private readonly predictiveMaintenanceService: PredictiveMaintenanceService,
    private readonly coordinationService: AutonomousRobotCoordinationService,
    private readonly aiLearningService: AIPoweredRobotLearningService,
    private readonly digitalTwinService: DigitalTwinIntegrationService,
    private readonly optimizationService: ProductionOptimizationService,
    private readonly qualityAssuranceService: QualityAssuranceService,
    private readonly schedulingService: SmartSchedulingService,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new production line',
    description: 'Register a new production line in the shop floor system'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Production line successfully created',
    type: ProductionLine
  })
  @ApiResponse({ status: 400, description: 'Invalid production line data' })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('PRODUCTION_LINE_CREATE')
  async createProductionLine(
    @Body(ValidationPipe) createProductionLineDto: CreateProductionLineDto
  ): Promise<ProductionLine> {
    const productionLine = this.productionLineRepository.create(createProductionLineDto);
    const savedProductionLine = await this.productionLineRepository.save(productionLine);
    
    // Initialize production line in shop floor system
    await this.shopFloorService.initializeProductionLine(savedProductionLine.id);
    
    // Initialize digital twin if enabled
    if (savedProductionLine.hasDigitalTwin) {
      await this.digitalTwinService.initializeProductionLineTwin(savedProductionLine.id);
    }
    
    // Initialize real-time monitoring
    await this.monitoringService.initializeProductionLineMonitoring(savedProductionLine.id);
    
    // Initialize AI optimization if enabled
    if (savedProductionLine.hasAI) {
      await this.optimizationService.initializeLineOptimization(savedProductionLine.id);
    }
    
    // Setup initial scheduling
    if (createProductionLineDto.productionSchedule) {
      await this.schedulingService.setupProductionSchedule(
        savedProductionLine.id, 
        createProductionLineDto.productionSchedule
      );
    }
    
    return savedProductionLine;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all production lines with filtering',
    description: 'Retrieve production lines with advanced filtering and status information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Production lines retrieved successfully',
    type: [ProductionLine]
  })
  @RequirePermissions('PRODUCTION_LINE_VIEW')
  async getAllProductionLines(
    @Query() queryDto: ProductionLineQueryDto
  ): Promise<{
    productionLines: ProductionLine[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.productionLineRepository.createQueryBuilder('productionLine')
      .leftJoinAndSelect('productionLine.workCells', 'workCells');

    // Apply filters
    if (queryDto.type) {
      queryBuilder.andWhere('productionLine.type = :type', { type: queryDto.type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('productionLine.status = :status', { status: queryDto.status });
    }

    if (queryDto.facility) {
      queryBuilder.andWhere('productionLine.facility ILIKE :facility', { 
        facility: `%${queryDto.facility}%` 
      });
    }

    if (queryDto.department) {
      queryBuilder.andWhere('productionLine.department ILIKE :department', { 
        department: `%${queryDto.department}%` 
      });
    }

    if (queryDto.isActive !== undefined) {
      queryBuilder.andWhere('productionLine.isActive = :isActive', { 
        isActive: queryDto.isActive 
      });
    }

    if (queryDto.hasAI !== undefined) {
      queryBuilder.andWhere('productionLine.hasAI = :hasAI', { 
        hasAI: queryDto.hasAI 
      });
    }

    if (queryDto.isFlexible !== undefined) {
      queryBuilder.andWhere('productionLine.isFlexible = :isFlexible', { 
        isFlexible: queryDto.isFlexible 
      });
    }

    if (queryDto.isAutonomous !== undefined) {
      queryBuilder.andWhere('productionLine.isAutonomous = :isAutonomous', { 
        isAutonomous: queryDto.isAutonomous 
      });
    }

    const total = await queryBuilder.getCount();
    const productionLines = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('productionLine.createdAt', 'DESC')
      .getMany();

    return {
      productionLines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get production line by ID',
    description: 'Retrieve detailed production line information including work cells and performance'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('PRODUCTION_LINE_VIEW')
  async getProductionLineById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({
      where: { id },
      relations: ['workCells', 'workCells.robots'],
    });

    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return productionLine;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update production line information',
    description: 'Update production line configuration and settings'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('PRODUCTION_LINE_UPDATE')
  async updateProductionLine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductionLineDto: UpdateProductionLineDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    Object.assign(productionLine, updateProductionLineDto);
    productionLine.updatedAt = new Date();

    const updatedProductionLine = await this.productionLineRepository.save(productionLine);

    // Update monitoring configuration
    await this.monitoringService.updateProductionLineConfiguration(id);

    // Update optimization if capabilities changed
    if (updateProductionLineDto.capabilities) {
      await this.optimizationService.updateLineCapabilities(id, updateProductionLineDto.capabilities);
    }

    return updatedProductionLine;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deactivate production line',
    description: 'Soft delete production line with safety checks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('PRODUCTION_LINE_DELETE')
  async deactivateProductionLine(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells']
    });

    if (!productionLine) {
      throw new Error('Production line not found');
    }

    // Check for active production
    if (productionLine.status === ProductionLineStatus.OPERATIONAL) {
      throw new Error('Cannot deactivate production line during active production');
    }

    // Check for assigned work cells
    if (productionLine.workCells && productionLine.workCells.length > 0) {
      throw new Error(`Cannot deactivate production line with ${productionLine.workCells.length} assigned work cells`);
    }

    productionLine.isActive = false;
    productionLine.status = ProductionLineStatus.IDLE;
    productionLine.updatedAt = new Date();

    await this.productionLineRepository.save(productionLine);
  }

  // ==================== PRODUCTION CONTROL ====================

  @Post(':id/production/start')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Start production on line',
    description: 'Begin production of a specific product batch on the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_START')
  async startProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) startProductionDto: StartProductionLineDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells']
    });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    if (!productionLine.canStartProduction()) {
      throw new Error('Production line is not available for production');
    }

    // Validate batch size against capabilities
    if (startProductionDto.batchSize < productionLine.capabilities.minBatchSize ||
        startProductionDto.batchSize > productionLine.capabilities.maxBatchSize) {
      throw new Error(`Batch size must be between ${productionLine.capabilities.minBatchSize} and ${productionLine.capabilities.maxBatchSize}`);
    }

    productionLine.startProduction(
      startProductionDto.productId,
      startProductionDto.productName,
      startProductionDto.batchId,
      startProductionDto.batchSize
    );

    // Set target throughput if provided
    if (startProductionDto.targetThroughput) {
      productionLine.currentThroughput = startProductionDto.targetThroughput;
    }

    const updatedProductionLine = await this.productionLineRepository.save(productionLine);

    // Notify monitoring system
    await this.monitoringService.onProductionLineStart(id, startProductionDto);

    // Start production on available work cells
    if (productionLine.workCells && productionLine.workCells.length > 0) {
      for (const workCell of productionLine.workCells) {
        if (workCell.isAvailable()) {
          await this.shopFloorService.startWorkCellProduction(workCell.id, {
            productId: startProductionDto.productId,
            productName: startProductionDto.productName,
            batchId: startProductionDto.batchId,
            batchSize: Math.ceil(startProductionDto.batchSize / productionLine.workCells.length)
          });
        }
      }
    }

    return updatedProductionLine;
  }

  @Post(':id/production/pause')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Pause production',
    description: 'Temporarily pause production on the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_CONTROL')
  async pauseProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells']
    });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.pauseProduction();
    await this.productionLineRepository.save(productionLine);

    // Pause all work cells
    if (productionLine.workCells) {
      for (const workCell of productionLine.workCells) {
        await this.shopFloorService.pauseWorkCellProduction(workCell.id);
      }
    }
  }

  @Post(':id/production/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Resume production',
    description: 'Resume paused production on the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_CONTROL')
  async resumeProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells']
    });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.resumeProduction();
    await this.productionLineRepository.save(productionLine);

    // Resume all work cells
    if (productionLine.workCells) {
      for (const workCell of productionLine.workCells) {
        await this.shopFloorService.resumeWorkCellProduction(workCell.id);
      }
    }
  }

  @Post(':id/production/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Complete production',
    description: 'Mark current production batch as completed'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_COMPLETE')
  async completeProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.completeProduction();
    await this.productionLineRepository.save(productionLine);

    // Notify monitoring system
    await this.monitoringService.onProductionLineComplete(id);

    // Process next scheduled item if available
    if (productionLine.productionSchedule?.scheduledProducts?.length > 0) {
      await this.schedulingService.processNextScheduledItem(id);
    }
  }

  @Patch(':id/production/progress/increment')
  @ApiOperation({ 
    summary: 'Increment batch progress',
    description: 'Increment the current batch progress counter'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER')
  @RequirePermissions('PRODUCTION_PROGRESS')
  async incrementProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) incrementDto: IncrementLineProgressDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.incrementBatchProgress(incrementDto.amount || 1);
    return await this.productionLineRepository.save(productionLine);
  }

  @Patch(':id/production/progress/set')
  @ApiOperation({ 
    summary: 'Set batch progress',
    description: 'Set the current batch progress to a specific value'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER')
  @RequirePermissions('PRODUCTION_PROGRESS')
  async setProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) setProgressDto: SetLineProgressDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.currentBatchProgress = setProgressDto.progress;
    return await this.productionLineRepository.save(productionLine);
  }

  @Get(':id/production/status')
  @ApiOperation({ 
    summary: 'Get production status',
    description: 'Get current production status and progress'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('PRODUCTION_VIEW')
  async getProductionStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return {
      status: productionLine.status,
      currentProduct: {
        id: productionLine.currentProductId,
        name: productionLine.currentProductName,
        batchId: productionLine.currentBatchId,
        batchSize: productionLine.currentBatchSize,
        progress: productionLine.currentBatchProgress,
        progressPercentage: productionLine.getBatchProgress()
      },
      throughput: {
        current: productionLine.currentThroughput,
        target: productionLine.capabilities.maxThroughput,
        efficiency: productionLine.getThroughputEfficiency()
      },
      schedule: productionLine.productionSchedule,
      productionTimes: {
        lastStart: productionLine.lastProductionStart,
        lastEnd: productionLine.lastProductionEnd,
        lastChangeoverStart: productionLine.lastChangeoverStart,
        lastChangeoverEnd: productionLine.lastChangeoverEnd
      },
      totals: {
        partsProduced: productionLine.totalPartsProduced,
        batchesCompleted: productionLine.totalBatchesCompleted,
        operatingHours: productionLine.totalOperatingHours
      }
    };
  }

  // ==================== SCHEDULING ====================

  @Put(':id/schedule')
  @ApiOperation({ 
    summary: 'Update production schedule',
    description: 'Update the production schedule for the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_PLANNER', 'PRODUCTION_MANAGER')
  @RequirePermissions('SCHEDULE_UPDATE')
  async updateSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) scheduleDto: ProductionScheduleDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    // Validate schedule with AI optimization
    const validatedSchedule = await this.schedulingService.validateAndOptimizeSchedule(id, scheduleDto);

    productionLine.productionSchedule = validatedSchedule;
    productionLine.updatedAt = new Date();

    const updatedProductionLine = await this.productionLineRepository.save(productionLine);

    // Update digital twin if enabled
    if (productionLine.hasDigitalTwin) {
      await this.digitalTwinService.updateProductionSchedule(id, validatedSchedule);
    }

    return updatedProductionLine;
  }

  @Get(':id/schedule')
  @ApiOperation({ 
    summary: 'Get production schedule',
    description: 'Retrieve current production schedule'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('SCHEDULE_VIEW')
  async getSchedule(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return productionLine.productionSchedule;
  }

  @Post(':id/schedule/optimize')
  @ApiOperation({ 
    summary: 'Optimize production schedule',
    description: 'Use AI to optimize the current production schedule'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_PLANNER', 'PRODUCTION_MANAGER')
  @RequirePermissions('SCHEDULE_OPTIMIZE')
  async optimizeSchedule(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.schedulingService.generateOptimizedSchedule(id);
  }

  // ==================== METRICS AND ANALYTICS ====================

  @Put(':id/metrics/production')
  @ApiOperation({ 
    summary: 'Update production metrics',
    description: 'Update real-time production metrics for the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'QUALITY_MANAGER', 'PRODUCTION_MANAGER')
  @RequirePermissions('METRICS_UPDATE')
  async updateProductionMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) metricsDto: UpdateProductionMetricsDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.updateProductionMetrics(metricsDto);
    return await this.productionLineRepository.save(productionLine);
  }

  @Put(':id/metrics/quality')
  @ApiOperation({ 
    summary: 'Update quality metrics',
    description: 'Update real-time quality metrics for the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('QUALITY_INSPECTOR', 'QUALITY_MANAGER', 'PRODUCTION_MANAGER')
  @RequirePermissions('QUALITY_METRICS_UPDATE')
  async updateQualityMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) metricsDto: UpdateQualityMetricsDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.updateQualityMetrics(metricsDto);

    // Check for quality issues
    if (metricsDto.overallQualityRate && metricsDto.overallQualityRate < 95) {
      productionLine.hasQualityIssues = true;
      productionLine.addQualityAlert(`Quality rate dropped to ${metricsDto.overallQualityRate}%`);
    }

    return await this.productionLineRepository.save(productionLine);
  }

  @Get(':id/metrics')
  @ApiOperation({ 
    summary: 'Get comprehensive metrics',
    description: 'Retrieve comprehensive production and quality metrics'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('METRICS_VIEW')
  async getMetrics(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return {
      production: productionLine.productionMetrics,
      quality: productionLine.qualityMetrics,
      throughputOptimization: productionLine.throughputOptimization,
      calculated: {
        healthScore: productionLine.getHealthScore(),
        efficiency: productionLine.getCurrentEfficiency(),
        oee: productionLine.getOEE(),
        teep: productionLine.getTEEP(),
        qualityRate: productionLine.getQualityRate(),
        firstPassYield: productionLine.getFirstPassYield(),
        throughputEfficiency: productionLine.getThroughputEfficiency(),
        lineUtilization: productionLine.getLineUtilization(),
        efficiencyScore: productionLine.getEfficiencyScore()
      },
      totals: {
        partsProduced: productionLine.totalPartsProduced,
        batchesCompleted: productionLine.totalBatchesCompleted,
        operatingHours: productionLine.totalOperatingHours,
        energyConsumed: productionLine.totalEnergyConsumed,
        downtimeEvents: productionLine.totalDowntimeEvents,
        defectsToday: productionLine.totalDefectsToday,
        reworkToday: productionLine.totalReworkToday
      }
    };
  }

  @Get(':id/performance/real-time')
  @ApiOperation({ 
    summary: 'Get real-time performance',
    description: 'Get current real-time performance data'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('REAL_TIME_MONITORING')
  async getRealTimePerformance(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.monitoringService.getRealTimeProductionLineData(id);
  }

  @Get(':id/analytics/productivity')
  @ApiOperation({ 
    summary: 'Get productivity analytics',
    description: 'Retrieve detailed productivity analysis and trends'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('ANALYTICS_VIEW')
  async getProductivityAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('timeframe') timeframe?: string
  ) {
    return await this.monitoringService.getProductionLineProductivityAnalytics(id, timeframe);
  }

  // ==================== OPTIMIZATION ====================

  @Put(':id/optimization/throughput')
  @ApiOperation({ 
    summary: 'Update throughput optimization',
    description: 'Update throughput optimization settings and results'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_ENGINEER', 'PRODUCTION_MANAGER')
  @RequirePermissions('OPTIMIZATION_UPDATE')
  async updateThroughputOptimization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) optimizationDto: UpdateThroughputOptimizationDto
  ): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.updateThroughputOptimization(optimizationDto);
    productionLine.isOptimized = true;
    
    return await this.productionLineRepository.save(productionLine);
  }

  @Post(':id/optimization/analyze')
  @ApiOperation({ 
    summary: 'Analyze line optimization',
    description: 'Perform comprehensive optimization analysis'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_ENGINEER', 'PRODUCTION_MANAGER')
  @RequirePermissions('OPTIMIZATION_ANALYZE')
  async analyzeOptimization(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.optimizationService.performComprehensiveAnalysis(id);
  }

  @Post(':id/optimization/ai-optimize')
  @ApiOperation({ 
    summary: 'AI-powered optimization',
    description: 'Use AI to optimize production line performance'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('AI_ENGINEER', 'PRODUCTION_MANAGER', 'ADMIN')
  @RequirePermissions('AI_OPTIMIZATION')
  async aiOptimize(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.optimizationService.performAIOptimization(id);
  }

  @Get(':id/optimization/bottlenecks')
  @ApiOperation({ 
    summary: 'Identify bottlenecks',
    description: 'Identify and analyze production bottlenecks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('OPTIMIZATION_VIEW')
  async identifyBottlenecks(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.optimizationService.identifyBottlenecks(id);
  }

  // ==================== WORK CELL MANAGEMENT ====================

  @Post(':id/work-cells/assign')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Assign work cells to production line',
    description: 'Assign one or more work cells to the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('WORK_CELL_ASSIGN')
  async assignWorkCells(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignWorkCellsDto: AssignWorkCellsDto
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    // Assign work cells
    for (const workCellId of assignWorkCellsDto.workCellIds) {
      const workCell = await this.workCellRepository.findOne({ where: { id: workCellId } });
      if (workCell) {
        workCell.productionLine = productionLine.name;
        await this.workCellRepository.save(workCell);
      }
    }

    // Update production line work cell count
    productionLine.assignedWorkCells += assignWorkCellsDto.workCellIds.length;
    await this.productionLineRepository.save(productionLine);
  }

  @Delete(':id/work-cells/:workCellId/unassign')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Unassign work cell from production line',
    description: 'Remove work cell assignment from the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @ApiParam({ name: 'workCellId', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('WORK_CELL_UNASSIGN')
  async unassignWorkCell(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('workCellId', ParseUUIDPipe) workCellId: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ 
      where: { id: workCellId, productionLine: id } 
    });
    
    if (!workCell) {
      throw new Error('Work cell not found in this production line');
    }

    workCell.productionLine = null;
    await this.workCellRepository.save(workCell);

    // Update production line work cell count
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    if (productionLine) {
      productionLine.assignedWorkCells = Math.max(0, productionLine.assignedWorkCells - 1);
      await this.productionLineRepository.save(productionLine);
    }
  }

  @Get(':id/work-cells')
  @ApiOperation({ 
    summary: 'Get assigned work cells',
    description: 'Get all work cells assigned to the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('WORK_CELL_VIEW')
  async getAssignedWorkCells(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const productionLine = await this.productionLineRepository.findOne({
      where: { id },
      relations: ['workCells']
    });

    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return productionLine.workCells;
  }

  @Get(':id/work-cells/available')
  @ApiOperation({ 
    summary: 'Get available work cells',
    description: 'Get work cells available for production on the line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('WORK_CELL_VIEW')
  async getAvailableWorkCells(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const productionLine = await this.productionLineRepository.findOne({
      where: { id },
      relations: ['workCells']
    });

    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return productionLine.getAvailableWorkCells();
  }

  // ==================== QUALITY CONTROL ====================

  @Post(':id/quality/check')
  @ApiOperation({ 
    summary: 'Perform quality check',
    description: 'Perform comprehensive quality check on the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('QUALITY_INSPECTOR', 'QUALITY_MANAGER')
  @RequirePermissions('QUALITY_CHECK')
  async performQualityCheck(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.qualityAssuranceService.performLineQualityCheck(id);
  }

  @Get(':id/quality/status')
  @ApiOperation({ 
    summary: 'Get quality status',
    description: 'Get comprehensive quality status for the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('QUALITY_VIEW')
  async getQualityStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.qualityAssuranceService.getLineQualityStatus(id);
  }

  @Post(':id/quality/predict')
  @ApiOperation({ 
    summary: 'Predict quality issues',
    description: 'Use AI to predict potential quality issues'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('QUALITY_MANAGER', 'AI_ENGINEER')
  @RequirePermissions('QUALITY_PREDICTION')
  async predictQualityIssues(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.qualityAssuranceService.predictQualityIssues(id);
  }

  // ==================== SAFETY & ALERTS ====================

  @Post(':id/emergency-stop')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Emergency stop production line',
    description: 'Immediately stop all operations for safety reasons'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SAFETY_OFFICER', 'PRODUCTION_MANAGER')
  @RequirePermissions('EMERGENCY_STOP')
  async emergencyStop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells'] 
    });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.emergencyStop(reason || 'Manual emergency stop');
    await this.productionLineRepository.save(productionLine);
  }

  @Post(':id/reset')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Reset production line',
    description: 'Reset production line to operational state after emergency stop'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('SAFETY_OFFICER', 'PRODUCTION_MANAGER')
  @RequirePermissions('PRODUCTION_LINE_RESET')
  async resetProductionLine(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ 
      where: { id },
      relations: ['workCells'] 
    });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.reset();
    await this.productionLineRepository.save(productionLine);
  }

  @Post(':id/alerts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add alert to production line',
    description: 'Add a new alert or warning to the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'MAINTENANCE_TECHNICIAN', 'PRODUCTION_MANAGER')
  @RequirePermissions('ALERT_CREATE')
  async addAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) alertDto: AlertDto
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.addAlert(alertDto.message);
    await this.productionLineRepository.save(productionLine);
  }

  @Post(':id/quality-alerts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add quality alert',
    description: 'Add a quality-specific alert to the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('QUALITY_INSPECTOR', 'QUALITY_MANAGER')
  @RequirePermissions('QUALITY_ALERT_CREATE')
  async addQualityAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) qualityAlertDto: QualityAlertDto
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.addQualityAlert(qualityAlertDto.message);
    await this.productionLineRepository.save(productionLine);
  }

  @Delete(':id/alerts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear all alerts',
    description: 'Clear all current alerts from the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'PRODUCTION_MANAGER')
  @RequirePermissions('ALERT_CLEAR')
  async clearAlerts(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.clearAlerts();
    await this.productionLineRepository.save(productionLine);
  }

  @Delete(':id/quality-alerts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear quality alerts',
    description: 'Clear all current quality alerts from the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('QUALITY_INSPECTOR', 'QUALITY_MANAGER')
  @RequirePermissions('QUALITY_ALERT_CLEAR')
  async clearQualityAlerts(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.clearQualityAlerts();
    await this.productionLineRepository.save(productionLine);
  }

  @Post(':id/issues')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Report issue',
    description: 'Report a new issue or problem with the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('PRODUCTION_OPERATOR', 'MAINTENANCE_TECHNICIAN', 'PRODUCTION_MANAGER')
  @RequirePermissions('ISSUE_REPORT')
  async reportIssue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) issueDto: IssueDto
  ): Promise<void> {
    const productionLine = await this.productionLineRepository.findOne({ where: { id } });
    
    if (!productionLine) {
      throw new Error('Production line not found');
    }

    productionLine.addIssue(issueDto.description);
    await this.productionLineRepository.save(productionLine);
  }

  // ==================== MAINTENANCE ====================

  @Get(':id/maintenance/schedule')
  @ApiOperation({ 
    summary: 'Get maintenance schedule',
    description: 'Retrieve predictive maintenance schedule for the production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('MAINTENANCE_VIEW')
  async getMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.predictiveMaintenanceService.getProductionLineMaintenanceSchedule(id);
  }

  @Post(':id/maintenance/predict')
  @ApiOperation({ 
    summary: 'Generate predictive maintenance',
    description: 'Use AI to predict upcoming maintenance needs'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @Roles('MAINTENANCE_MANAGER', 'PRODUCTION_MANAGER')
  @RequirePermissions('PREDICTIVE_MAINTENANCE')
  async predictMaintenance(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.predictiveMaintenanceService.generateProductionLineMaintenancePrediction(id);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/operations')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Execute bulk operations',
    description: 'Execute operations on multiple production lines simultaneously'
  })
  @Roles('PRODUCTION_MANAGER', 'SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('BULK_PRODUCTION_LINE_OPERATIONS')
  async executeBulkOperations(
    @Body(ValidationPipe) bulkOperationDto: BulkProductionLineOperationDto
  ) {
    return await this.shopFloorService.executeBulkProductionLineOperations(bulkOperationDto);
  }

  // ==================== DASHBOARD AND SUMMARY ====================

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get production line dashboard',
    description: 'Retrieve comprehensive production line management dashboard data'
  })
  @RequirePermissions('PRODUCTION_LINE_DASHBOARD_VIEW')
  async getProductionLineDashboard(): Promise<ProductionLineDashboardDto> {
    const productionLines = await this.productionLineRepository.find();

    const dashboard: ProductionLineDashboardDto = {
      total: productionLines.length,
      operational: productionLines.filter(pl => pl.status === ProductionLineStatus.OPERATIONAL).length,
      idle: productionLines.filter(pl => pl.status === ProductionLineStatus.IDLE).length,
      maintenance: productionLines.filter(pl => pl.status === ProductionLineStatus.MAINTENANCE).length,
      errors: productionLines.filter(pl => pl.status === ProductionLineStatus.ERROR).length,
      emergencyStopped: productionLines.filter(pl => pl.isEmergencyStopped).length,
      avgOEE: productionLines.reduce((sum, pl) => sum + pl.getOEE(), 0) / (productionLines.length || 1),
      avgTEEP: productionLines.reduce((sum, pl) => sum + pl.getTEEP(), 0) / (productionLines.length || 1),
      avgEfficiency: productionLines.reduce((sum, pl) => sum + pl.getCurrentEfficiency(), 0) / (productionLines.length || 1),
      avgQualityRate: productionLines.reduce((sum, pl) => sum + pl.getQualityRate(), 0) / (productionLines.length || 1),
      totalThroughput: productionLines.reduce((sum, pl) => sum + pl.currentThroughput, 0),
      needsMaintenance: productionLines.filter(pl => pl.needsMaintenance).length,
      qualityIssues: productionLines.filter(pl => pl.hasQualityIssues).length,
      optimizedLines: productionLines.filter(pl => pl.isOptimized).length,
    };

    return dashboard;
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get production lines summary',
    description: 'Get summarized information for all production lines'
  })
  @RequirePermissions('PRODUCTION_LINE_VIEW')
  async getProductionLinesSummary(): Promise<ProductionLineSummaryDto[]> {
    const productionLines = await this.productionLineRepository.find({
      relations: ['workCells']
    });

    return productionLines.map(productionLine => 
      productionLine.getProductionLineSummary() as ProductionLineSummaryDto
    );
  }

  @Get(':id/summary')
  @ApiOperation({ 
    summary: 'Get production line summary',
    description: 'Get summarized information for a specific production line'
  })
  @ApiParam({ name: 'id', type: String, description: 'Production line UUID' })
  @RequirePermissions('PRODUCTION_LINE_VIEW')
  async getProductionLineSummary(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProductionLineSummaryDto> {
    const productionLine = await this.productionLineRepository.findOne({
      where: { id },
      relations: ['workCells']
    });

    if (!productionLine) {
      throw new Error('Production line not found');
    }

    return productionLine.getProductionLineSummary() as ProductionLineSummaryDto;
  }
}
