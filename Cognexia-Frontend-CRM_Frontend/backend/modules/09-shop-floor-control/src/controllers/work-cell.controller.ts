// Industry 5.0 ERP Backend - Shop Floor Control Module
// WorkCell Controller - Comprehensive work cell management and production control
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
  WorkCell, 
  WorkCellType, 
  WorkCellStatus,
  WorkCellCapabilities,
  LayoutConfiguration,
  ProductionMetrics
} from '../entities/work-cell.entity';
import { Robot } from '../entities/robot.entity';
import { RobotTask } from '../entities/robot-task.entity';

// Services
import { ShopFloorControlService } from '../services/shop-floor-control.service';
import { RealTimeProductionMonitoringService } from '../services/RealTimeProductionMonitoringService';
import { PredictiveMaintenanceService } from '../services/PredictiveMaintenanceService';
import { AutonomousRobotCoordinationService } from '../services/AutonomousRobotCoordinationService';
import { HumanRobotSafetySystemService } from '../services/HumanRobotSafetySystemService';
import { AIPoweredRobotLearningService } from '../services/AIPoweredRobotLearningService';
import { DigitalTwinIntegrationService } from '../services/DigitalTwinIntegrationService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs
import { 
  CreateWorkCellDto,
  UpdateWorkCellDto,
  WorkCellQueryDto,
  StartProductionDto,
  IncrementProgressDto,
  SetProgressDto,
  UpdateProductionMetricsDto,
  AssignRobotsDto,
  AlertDto,
  IssueDto,
  BulkWorkCellOperationDto,
  WorkCellSummaryDto,
  WorkCellDashboardDto,
  LayoutConfigurationDto,
  WorkCellCapabilitiesDto
} from '../dto/work-cell.dto';

@ApiTags('Work Cell Management')
@Controller('shop-floor/work-cells')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class WorkCellController {
  constructor(
    @InjectRepository(WorkCell)
    private readonly workCellRepository: Repository<WorkCell>,
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
    private readonly shopFloorService: ShopFloorControlService,
    private readonly monitoringService: RealTimeProductionMonitoringService,
    private readonly predictiveMaintenanceService: PredictiveMaintenanceService,
    private readonly coordinationService: AutonomousRobotCoordinationService,
    private readonly safetyService: HumanRobotSafetySystemService,
    private readonly aiLearningService: AIPoweredRobotLearningService,
    private readonly digitalTwinService: DigitalTwinIntegrationService,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new work cell',
    description: 'Register a new work cell in the shop floor system'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Work cell successfully created',
    type: WorkCell
  })
  @ApiResponse({ status: 400, description: 'Invalid work cell data' })
  @Roles('SHOP_FLOOR_MANAGER', 'PRODUCTION_MANAGER', 'ADMIN')
  @RequirePermissions('WORK_CELL_CREATE')
  async createWorkCell(
    @Body(ValidationPipe) createWorkCellDto: CreateWorkCellDto
  ): Promise<WorkCell> {
    const workCell = this.workCellRepository.create(createWorkCellDto);
    const savedWorkCell = await this.workCellRepository.save(workCell);
    
    // Initialize work cell in shop floor system
    await this.shopFloorService.initializeWorkCell(savedWorkCell.id);
    
    // Setup safety systems for the work cell
    await this.safetyService.setupWorkCellSafety(savedWorkCell.id, createWorkCellDto.layoutConfiguration);
    
    // Initialize digital twin if enabled
    if (savedWorkCell.hasDigitalTwin) {
      await this.digitalTwinService.initializeWorkCellTwin(savedWorkCell.id);
    }
    
    // Initialize real-time monitoring
    await this.monitoringService.initializeWorkCellMonitoring(savedWorkCell.id);
    
    return savedWorkCell;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all work cells with filtering',
    description: 'Retrieve work cells with advanced filtering and status information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Work cells retrieved successfully',
    type: [WorkCell]
  })
  @RequirePermissions('WORK_CELL_VIEW')
  async getAllWorkCells(
    @Query() queryDto: WorkCellQueryDto
  ): Promise<{
    workCells: WorkCell[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.workCellRepository.createQueryBuilder('workCell')
      .leftJoinAndSelect('workCell.robots', 'robots')
      .leftJoinAndSelect('workCell.tasks', 'tasks');

    // Apply filters
    if (queryDto.type) {
      queryBuilder.andWhere('workCell.type = :type', { type: queryDto.type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('workCell.status = :status', { status: queryDto.status });
    }

    if (queryDto.facility) {
      queryBuilder.andWhere('workCell.facility ILIKE :facility', { 
        facility: `%${queryDto.facility}%` 
      });
    }

    if (queryDto.department) {
      queryBuilder.andWhere('workCell.department ILIKE :department', { 
        department: `%${queryDto.department}%` 
      });
    }

    if (queryDto.productionLine) {
      queryBuilder.andWhere('workCell.productionLine ILIKE :productionLine', { 
        productionLine: `%${queryDto.productionLine}%` 
      });
    }

    if (queryDto.isActive !== undefined) {
      queryBuilder.andWhere('workCell.isActive = :isActive', { 
        isActive: queryDto.isActive 
      });
    }

    if (queryDto.hasAI !== undefined) {
      queryBuilder.andWhere('workCell.hasAI = :hasAI', { 
        hasAI: queryDto.hasAI 
      });
    }

    const total = await queryBuilder.getCount();
    const workCells = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('workCell.createdAt', 'DESC')
      .getMany();

    return {
      workCells,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get work cell by ID',
    description: 'Retrieve detailed work cell information including robots and performance'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('WORK_CELL_VIEW')
  async getWorkCellById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({
      where: { id },
      relations: ['robots', 'tasks'],
    });

    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return workCell;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update work cell information',
    description: 'Update work cell configuration and settings'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'PRODUCTION_MANAGER', 'ADMIN')
  @RequirePermissions('WORK_CELL_UPDATE')
  async updateWorkCell(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateWorkCellDto: UpdateWorkCellDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    Object.assign(workCell, updateWorkCellDto);
    workCell.updatedAt = new Date();

    // Update layout safety if layout changed
    if (updateWorkCellDto.layoutConfiguration) {
      await this.safetyService.validateLayoutSafety(id, updateWorkCellDto.layoutConfiguration);
    }

    const updatedWorkCell = await this.workCellRepository.save(workCell);

    // Update monitoring configuration
    await this.monitoringService.updateWorkCellConfiguration(id);

    return updatedWorkCell;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deactivate work cell',
    description: 'Soft delete work cell with safety checks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'PRODUCTION_MANAGER', 'ADMIN')
  @RequirePermissions('WORK_CELL_DELETE')
  async deactivateWorkCell(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ 
      where: { id },
      relations: ['robots', 'tasks']
    });

    if (!workCell) {
      throw new Error('Work cell not found');
    }

    // Check for active production
    if (workCell.status === WorkCellStatus.OPERATIONAL) {
      throw new Error('Cannot deactivate work cell during active production');
    }

    // Check for assigned robots
    if (workCell.robots && workCell.robots.length > 0) {
      throw new Error(`Cannot deactivate work cell with ${workCell.robots.length} assigned robots`);
    }

    workCell.isActive = false;
    workCell.status = WorkCellStatus.IDLE;
    workCell.updatedAt = new Date();

    await this.workCellRepository.save(workCell);
  }

  // ==================== PRODUCTION CONTROL ====================

  @Post(':id/production/start')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Start production in work cell',
    description: 'Begin production of a specific product batch'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_START')
  async startProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) startProductionDto: StartProductionDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    if (!workCell.isAvailable()) {
      throw new Error('Work cell is not available for production');
    }

    workCell.startProduction(
      startProductionDto.productId,
      startProductionDto.productName,
      startProductionDto.batchId,
      startProductionDto.batchSize
    );

    const updatedWorkCell = await this.workCellRepository.save(workCell);

    // Notify monitoring system
    await this.monitoringService.onProductionStart(id, startProductionDto);

    return updatedWorkCell;
  }

  @Post(':id/production/pause')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Pause production',
    description: 'Temporarily pause production in the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_CONTROL')
  async pauseProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.pauseProduction();
    await this.workCellRepository.save(workCell);

    // Pause robots in the cell
    if (workCell.robots) {
      for (const robot of workCell.robots) {
        await this.shopFloorService.sendRobotCommand(robot.id, { command: 'PAUSE' });
      }
    }
  }

  @Post(':id/production/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Resume production',
    description: 'Resume paused production in the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_CONTROL')
  async resumeProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.resumeProduction();
    await this.workCellRepository.save(workCell);

    // Resume robots in the cell
    if (workCell.robots) {
      for (const robot of workCell.robots) {
        await this.shopFloorService.sendRobotCommand(robot.id, { command: 'RESUME' });
      }
    }
  }

  @Post(':id/production/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Complete production',
    description: 'Mark current production batch as completed'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_COMPLETE')
  async completeProduction(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.completeProduction();
    await this.workCellRepository.save(workCell);

    // Notify monitoring system
    await this.monitoringService.onProductionComplete(id);
  }

  @Patch(':id/production/progress/increment')
  @ApiOperation({ 
    summary: 'Increment batch progress',
    description: 'Increment the current batch progress counter'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_PROGRESS')
  async incrementProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) incrementDto: IncrementProgressDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.incrementBatchProgress(incrementDto.amount || 1);
    return await this.workCellRepository.save(workCell);
  }

  @Patch(':id/production/progress/set')
  @ApiOperation({ 
    summary: 'Set batch progress',
    description: 'Set the current batch progress to a specific value'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PRODUCTION_PROGRESS')
  async setProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) setProgressDto: SetProgressDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.currentBatchProgress = setProgressDto.progress;
    return await this.workCellRepository.save(workCell);
  }

  @Get(':id/production/status')
  @ApiOperation({ 
    summary: 'Get production status',
    description: 'Get current production status and progress'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('PRODUCTION_VIEW')
  async getProductionStatus(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return {
      status: workCell.status,
      currentProduct: {
        id: workCell.currentProductId,
        name: workCell.currentProductName,
        batchId: workCell.currentBatchId,
        batchSize: workCell.currentBatchSize,
        progress: workCell.currentBatchProgress,
        progressPercentage: workCell.getBatchProgress()
      },
      productionTimes: {
        lastStart: workCell.lastProductionStart,
        lastEnd: workCell.lastProductionEnd
      },
      totals: {
        partsProduced: workCell.totalPartsProduced,
        batchesCompleted: workCell.totalBatchesCompleted,
        operatingHours: workCell.totalOperatingHours
      }
    };
  }

  // ==================== METRICS AND ANALYTICS ====================

  @Put(':id/metrics')
  @ApiOperation({ 
    summary: 'Update production metrics',
    description: 'Update real-time production metrics for the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER', 'QUALITY_MANAGER')
  @RequirePermissions('METRICS_UPDATE')
  async updateMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) metricsDto: UpdateProductionMetricsDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.updateProductionMetrics(metricsDto);
    return await this.workCellRepository.save(workCell);
  }

  @Get(':id/metrics')
  @ApiOperation({ 
    summary: 'Get production metrics',
    description: 'Retrieve comprehensive production metrics and KPIs'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('METRICS_VIEW')
  async getMetrics(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return {
      basic: workCell.productionMetrics,
      calculated: {
        healthScore: workCell.getHealthScore(),
        utilizationRate: workCell.getUtilization(),
        oeeScore: workCell.getOEE(),
        qualityRate: workCell.getQualityRate(),
        throughputEfficiency: workCell.getThroughputEfficiency(),
        efficiencyScore: workCell.getEfficiencyScore()
      },
      totals: {
        partsProduced: workCell.totalPartsProduced,
        batchesCompleted: workCell.totalBatchesCompleted,
        operatingHours: workCell.totalOperatingHours,
        energyConsumed: workCell.totalEnergyConsumed,
        downtimeEvents: workCell.totalDowntimeEvents
      }
    };
  }

  @Get(':id/performance/real-time')
  @ApiOperation({ 
    summary: 'Get real-time performance',
    description: 'Get current real-time performance data'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('REAL_TIME_MONITORING')
  async getRealTimePerformance(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.monitoringService.getRealTimeWorkCellData(id);
  }

  @Get(':id/analytics/productivity')
  @ApiOperation({ 
    summary: 'Get productivity analytics',
    description: 'Retrieve detailed productivity analysis and trends'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('ANALYTICS_VIEW')
  async getProductivityAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('timeframe') timeframe?: string
  ) {
    return await this.monitoringService.getWorkCellProductivityAnalytics(id, timeframe);
  }

  // ==================== ROBOT MANAGEMENT ====================

  @Post(':id/robots/assign')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Assign robots to work cell',
    description: 'Assign one or more robots to the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_ASSIGN')
  async assignRobots(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignRobotsDto: AssignRobotsDto
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    // Check capacity
    if (workCell.assignedRobots + assignRobotsDto.robotIds.length > workCell.capabilities.maxRobots) {
      throw new Error(`Work cell capacity exceeded. Max robots: ${workCell.capabilities.maxRobots}`);
    }

    // Assign robots
    for (const robotId of assignRobotsDto.robotIds) {
      const robot = await this.robotRepository.findOne({ where: { id: robotId } });
      if (robot) {
        robot.workCellId = id;
        await this.robotRepository.save(robot);
      }
    }

    // Update work cell robot count
    workCell.assignedRobots += assignRobotsDto.robotIds.length;
    await this.workCellRepository.save(workCell);
  }

  @Delete(':id/robots/:robotId/unassign')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Unassign robot from work cell',
    description: 'Remove robot assignment from the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @ApiParam({ name: 'robotId', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_UNASSIGN')
  async unassignRobot(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('robotId', ParseUUIDPipe) robotId: string
  ): Promise<void> {
    const robot = await this.robotRepository.findOne({ 
      where: { id: robotId, workCellId: id } 
    });
    
    if (!robot) {
      throw new Error('Robot not found in this work cell');
    }

    robot.workCellId = null;
    await this.robotRepository.save(robot);

    // Update work cell robot count
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    if (workCell) {
      workCell.assignedRobots = Math.max(0, workCell.assignedRobots - 1);
      await this.workCellRepository.save(workCell);
    }
  }

  @Get(':id/robots')
  @ApiOperation({ 
    summary: 'Get assigned robots',
    description: 'Get all robots assigned to the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('ROBOT_VIEW')
  async getAssignedRobots(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const workCell = await this.workCellRepository.findOne({
      where: { id },
      relations: ['robots']
    });

    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return workCell.robots;
  }

  @Get(':id/robots/available')
  @ApiOperation({ 
    summary: 'Get available robots',
    description: 'Get robots available for new tasks in the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('ROBOT_VIEW')
  async getAvailableRobots(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const workCell = await this.workCellRepository.findOne({
      where: { id },
      relations: ['robots']
    });

    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return workCell.getAvailableRobots();
  }

  // ==================== LAYOUT MANAGEMENT ====================

  @Put(':id/layout')
  @ApiOperation({ 
    summary: 'Update work cell layout',
    description: 'Update the physical layout configuration of the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('FACILITY_MANAGER', 'ROBOTICS_ENGINEER', 'ADMIN')
  @RequirePermissions('LAYOUT_UPDATE')
  async updateLayout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) layoutDto: LayoutConfigurationDto
  ): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    // Validate layout safety
    await this.safetyService.validateLayoutSafety(id, layoutDto);

    workCell.layoutConfiguration = layoutDto;
    workCell.updatedAt = new Date();

    const updatedWorkCell = await this.workCellRepository.save(workCell);

    // Update digital twin if enabled
    if (workCell.hasDigitalTwin) {
      await this.digitalTwinService.updateWorkCellLayout(id, layoutDto);
    }

    return updatedWorkCell;
  }

  @Get(':id/layout')
  @ApiOperation({ 
    summary: 'Get work cell layout',
    description: 'Get the current layout configuration'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('LAYOUT_VIEW')
  async getLayout(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return workCell.layoutConfiguration;
  }

  // ==================== SAFETY & ALERTS ====================

  @Post(':id/emergency-stop')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Emergency stop work cell',
    description: 'Immediately stop all operations for safety reasons'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SAFETY_OFFICER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('EMERGENCY_STOP')
  async emergencyStop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ 
      where: { id },
      relations: ['robots'] 
    });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.emergencyStop(reason || 'Manual emergency stop');
    await this.workCellRepository.save(workCell);

    // Notify safety system
    await this.safetyService.handleWorkCellEmergencyStop(id, reason);
  }

  @Post(':id/reset')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Reset work cell',
    description: 'Reset work cell to operational state after emergency stop'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('SAFETY_OFFICER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('WORK_CELL_RESET')
  async resetWorkCell(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ 
      where: { id },
      relations: ['robots'] 
    });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    // Perform safety checks before reset
    await this.safetyService.validateWorkCellResetSafety(id);

    workCell.reset();
    await this.workCellRepository.save(workCell);
  }

  @Post(':id/alerts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add alert to work cell',
    description: 'Add a new alert or warning to the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'MAINTENANCE_TECHNICIAN', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('ALERT_CREATE')
  async addAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) alertDto: AlertDto
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.addAlert(alertDto.message);
    await this.workCellRepository.save(workCell);
  }

  @Delete(':id/alerts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear all alerts',
    description: 'Clear all current alerts from the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('ALERT_CLEAR')
  async clearAlerts(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.clearAlerts();
    await this.workCellRepository.save(workCell);
  }

  @Post(':id/issues')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Report issue',
    description: 'Report a new issue or problem with the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('PRODUCTION_OPERATOR', 'MAINTENANCE_TECHNICIAN', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('ISSUE_REPORT')
  async reportIssue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) issueDto: IssueDto
  ): Promise<void> {
    const workCell = await this.workCellRepository.findOne({ where: { id } });
    
    if (!workCell) {
      throw new Error('Work cell not found');
    }

    workCell.addIssue(issueDto.description);
    await this.workCellRepository.save(workCell);
  }

  // ==================== MAINTENANCE ====================

  @Get(':id/maintenance/schedule')
  @ApiOperation({ 
    summary: 'Get maintenance schedule',
    description: 'Retrieve predictive maintenance schedule for the work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('MAINTENANCE_VIEW')
  async getMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.predictiveMaintenanceService.getWorkCellMaintenanceSchedule(id);
  }

  @Post(':id/maintenance/predict')
  @ApiOperation({ 
    summary: 'Generate predictive maintenance',
    description: 'Use AI to predict upcoming maintenance needs'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @Roles('MAINTENANCE_MANAGER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('PREDICTIVE_MAINTENANCE')
  async predictMaintenance(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.predictiveMaintenanceService.generateWorkCellMaintenancePrediction(id);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/operations')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Execute bulk operations',
    description: 'Execute operations on multiple work cells simultaneously'
  })
  @Roles('SHOP_FLOOR_MANAGER', 'PRODUCTION_MANAGER', 'ADMIN')
  @RequirePermissions('BULK_WORK_CELL_OPERATIONS')
  async executeBulkOperations(
    @Body(ValidationPipe) bulkOperationDto: BulkWorkCellOperationDto
  ) {
    return await this.shopFloorService.executeBulkWorkCellOperations(bulkOperationDto);
  }

  // ==================== DASHBOARD AND SUMMARY ====================

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get work cell dashboard',
    description: 'Retrieve comprehensive work cell management dashboard data'
  })
  @RequirePermissions('WORK_CELL_DASHBOARD_VIEW')
  async getWorkCellDashboard(): Promise<WorkCellDashboardDto> {
    const workCells = await this.workCellRepository.find();

    const dashboard: WorkCellDashboardDto = {
      total: workCells.length,
      operational: workCells.filter(wc => wc.status === WorkCellStatus.OPERATIONAL).length,
      idle: workCells.filter(wc => wc.status === WorkCellStatus.IDLE).length,
      maintenance: workCells.filter(wc => wc.status === WorkCellStatus.MAINTENANCE).length,
      errors: workCells.filter(wc => wc.status === WorkCellStatus.ERROR).length,
      emergencyStopped: workCells.filter(wc => wc.isEmergencyStopped).length,
      avgOEE: workCells.reduce((sum, wc) => sum + wc.getOEE(), 0) / (workCells.length || 1),
      avgUtilization: workCells.reduce((sum, wc) => sum + wc.getUtilization(), 0) / (workCells.length || 1),
      needsMaintenance: workCells.filter(wc => wc.needsMaintenance).length,
    };

    return dashboard;
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get work cells summary',
    description: 'Get summarized information for all work cells'
  })
  @RequirePermissions('WORK_CELL_VIEW')
  async getWorkCellsSummary(): Promise<WorkCellSummaryDto[]> {
    const workCells = await this.workCellRepository.find({
      relations: ['robots']
    });

    return workCells.map(workCell => workCell.getWorkCellSummary() as WorkCellSummaryDto);
  }

  @Get(':id/summary')
  @ApiOperation({ 
    summary: 'Get work cell summary',
    description: 'Get summarized information for a specific work cell'
  })
  @ApiParam({ name: 'id', type: String, description: 'Work cell UUID' })
  @RequirePermissions('WORK_CELL_VIEW')
  async getWorkCellSummary(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<WorkCellSummaryDto> {
    const workCell = await this.workCellRepository.findOne({
      where: { id },
      relations: ['robots']
    });

    if (!workCell) {
      throw new Error('Work cell not found');
    }

    return workCell.getWorkCellSummary() as WorkCellSummaryDto;
  }
}
