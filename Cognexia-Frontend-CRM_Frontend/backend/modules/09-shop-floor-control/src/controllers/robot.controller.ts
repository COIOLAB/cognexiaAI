// Industry 5.0 ERP Backend - Shop Floor Control Module
// Robot Controller - Comprehensive robot management and control
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
  Robot, 
  RobotType, 
  RobotState, 
  OperatingMode,
  RobotCapabilities,
  RobotPosition,
  PerformanceMetrics
} from '../entities/robot.entity';
import { RobotTask } from '../entities/robot-task.entity';
import { WorkCell } from '../entities/work-cell.entity';

// Services
import { ShopFloorControlService } from '../services/shop-floor-control.service';
import { CollaborativeRoboticsControlService } from '../services/CollaborativeRoboticsControlService';
import { AIPoweredRobotLearningService } from '../services/AIPoweredRobotLearningService';
import { AutonomousRobotCoordinationService } from '../services/AutonomousRobotCoordinationService';
import { HumanRobotSafetySystemService } from '../services/HumanRobotSafetySystemService';
import { PredictiveMaintenanceService } from '../services/PredictiveMaintenanceService';
import { RealTimeProductionMonitoringService } from '../services/RealTimeProductionMonitoringService';

// Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';

// DTOs (to be implemented)
import { 
  CreateRobotDto,
  UpdateRobotDto,
  RobotQueryDto,
  RobotCommandDto,
  RobotCalibrationDto,
  RobotPositionDto,
  RobotTaskAssignmentDto,
  BulkRobotOperationDto,
  SafetyConfigurationDto
} from '../dto/robot.dto';

@ApiTags('Robot Management')
@Controller('shop-floor/robots')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class RobotController {
  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
    @InjectRepository(WorkCell)
    private readonly workCellRepository: Repository<WorkCell>,
    private readonly shopFloorService: ShopFloorControlService,
    private readonly collaborativeRoboticsService: CollaborativeRoboticsControlService,
    private readonly aiLearningService: AIPoweredRobotLearningService,
    private readonly autonomousCoordinationService: AutonomousRobotCoordinationService,
    private readonly safetySystemService: HumanRobotSafetySystemService,
    private readonly predictiveMaintenanceService: PredictiveMaintenanceService,
    private readonly monitoringService: RealTimeProductionMonitoringService,
  ) {}

  // ==================== ROBOT CRUD OPERATIONS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new robot',
    description: 'Register a new robot in the shop floor system'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Robot successfully created',
    type: Robot
  })
  @ApiResponse({ status: 400, description: 'Invalid robot data' })
  @Roles('SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER', 'ADMIN')
  @RequirePermissions('ROBOT_CREATE')
  async createRobot(
    @Body(ValidationPipe) createRobotDto: CreateRobotDto
  ): Promise<Robot> {
    const robot = await this.robotRepository.create(createRobotDto);
    const savedRobot = await this.robotRepository.save(robot);
    
    // Initialize robot in shop floor system
    await this.shopFloorService.initializeRobot(savedRobot.id);
    
    // Setup safety configuration
    await this.safetySystemService.setupRobotSafety(savedRobot.id, createRobotDto.safetyConfiguration);
    
    // Initialize AI learning if robot has AI capabilities
    if (savedRobot.hasAI) {
      await this.aiLearningService.initializeRobotLearning(savedRobot.id);
    }
    
    return savedRobot;
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all robots with filtering',
    description: 'Retrieve robots with advanced filtering and status information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Robots retrieved successfully',
    type: [Robot]
  })
  @RequirePermissions('ROBOT_VIEW')
  async getAllRobots(
    @Query() queryDto: RobotQueryDto
  ): Promise<{
    robots: Robot[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = Math.min(queryDto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.robotRepository.createQueryBuilder('robot')
      .leftJoinAndSelect('robot.workCell', 'workCell')
      .leftJoinAndSelect('robot.tasks', 'tasks');

    // Apply filters
    if (queryDto.type) {
      queryBuilder.andWhere('robot.type = :type', { type: queryDto.type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('robot.status = :status', { status: queryDto.status });
    }

    if (queryDto.operatingMode) {
      queryBuilder.andWhere('robot.operatingMode = :mode', { mode: queryDto.operatingMode });
    }

    if (queryDto.workCellId) {
      queryBuilder.andWhere('robot.workCellId = :workCellId', { workCellId: queryDto.workCellId });
    }

    if (queryDto.manufacturer) {
      queryBuilder.andWhere('robot.manufacturer ILIKE :manufacturer', { 
        manufacturer: `%${queryDto.manufacturer}%` 
      });
    }

    if (queryDto.location) {
      queryBuilder.andWhere('robot.location ILIKE :location', { 
        location: `%${queryDto.location}%` 
      });
    }

    if (queryDto.isActive !== undefined) {
      queryBuilder.andWhere('robot.isActive = :isActive', { 
        isActive: queryDto.isActive 
      });
    }

    if (queryDto.isCollaborative !== undefined) {
      queryBuilder.andWhere('robot.isCollaborative = :isCollaborative', { 
        isCollaborative: queryDto.isCollaborative 
      });
    }

    if (queryDto.hasAI !== undefined) {
      queryBuilder.andWhere('robot.hasAI = :hasAI', { 
        hasAI: queryDto.hasAI 
      });
    }

    if (queryDto.needsMaintenance !== undefined) {
      if (queryDto.needsMaintenance) {
        queryBuilder.andWhere('robot.nextMaintenanceDate <= :now', { 
          now: new Date() 
        });
      } else {
        queryBuilder.andWhere('robot.nextMaintenanceDate > :now OR robot.nextMaintenanceDate IS NULL', { 
          now: new Date() 
        });
      }
    }

    const total = await queryBuilder.getCount();
    const robots = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('robot.createdAt', 'DESC')
      .getMany();

    return {
      robots,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get robot by ID',
    description: 'Retrieve detailed robot information including current status and performance'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('ROBOT_VIEW')
  async getRobotById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Robot> {
    const robot = await this.robotRepository.findOne({
      where: { id },
      relations: ['workCell', 'tasks', 'safetyIncidents', 'maintenanceRecords'],
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    return robot;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update robot information',
    description: 'Update robot configuration and settings'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER', 'ADMIN')
  @RequirePermissions('ROBOT_UPDATE')
  async updateRobot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRobotDto: UpdateRobotDto
  ): Promise<Robot> {
    const robot = await this.robotRepository.findOne({ where: { id } });
    
    if (!robot) {
      throw new Error('Robot not found');
    }

    // Store old operating mode for safety checks
    const oldOperatingMode = robot.operatingMode;

    Object.assign(robot, updateRobotDto);
    robot.updatedAt = new Date();

    // If switching to collaborative mode, verify safety configuration
    if (updateRobotDto.operatingMode === OperatingMode.COLLABORATIVE && 
        oldOperatingMode !== OperatingMode.COLLABORATIVE) {
      await this.safetySystemService.validateCollaborativeSafety(id);
    }

    const updatedRobot = await this.robotRepository.save(robot);

    // Update robot configuration in real-time monitoring
    await this.monitoringService.updateRobotConfiguration(id);

    return updatedRobot;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deactivate robot',
    description: 'Soft delete robot with safety checks'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('ROBOT_DELETE')
  async deactivateRobot(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const robot = await this.robotRepository.findOne({ 
      where: { id },
      relations: ['tasks']
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    // Check for active tasks
    const activeTasks = robot.tasks?.filter(
      task => task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
    );

    if (activeTasks && activeTasks.length > 0) {
      throw new Error(`Cannot deactivate robot with ${activeTasks.length} active tasks`);
    }

    // Emergency stop if robot is currently executing
    if (robot.status === RobotState.EXECUTING) {
      await this.emergencyStop(id, 'Robot deactivation');
    }

    robot.isActive = false;
    robot.status = RobotState.OFFLINE;
    robot.updatedAt = new Date();

    await this.robotRepository.save(robot);
  }

  // ==================== ROBOT CONTROL OPERATIONS ====================

  @Post(':id/commands')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Send command to robot',
    description: 'Send control commands to robot (start, stop, pause, resume, etc.)'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_OPERATOR', 'SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_CONTROL')
  async sendRobotCommand(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) commandDto: RobotCommandDto
  ) {
    return await this.shopFloorService.sendRobotCommand(id, commandDto);
  }

  @Post(':id/emergency-stop')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Emergency stop robot',
    description: 'Immediately stop robot for safety reasons'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_OPERATOR', 'SHOP_FLOOR_MANAGER', 'SAFETY_OFFICER')
  @RequirePermissions('ROBOT_EMERGENCY_STOP')
  async emergencyStop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string
  ): Promise<void> {
    const robot = await this.robotRepository.findOne({ where: { id } });
    
    if (!robot) {
      throw new Error('Robot not found');
    }

    robot.emergencyStop(reason || 'Manual emergency stop');
    await this.robotRepository.save(robot);

    // Notify safety system
    await this.safetySystemService.handleEmergencyStop(id, reason);
  }

  @Post(':id/reset')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Reset robot',
    description: 'Reset robot to idle state after error or emergency stop'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_RESET')
  async resetRobot(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const robot = await this.robotRepository.findOne({ where: { id } });
    
    if (!robot) {
      throw new Error('Robot not found');
    }

    // Perform safety checks before reset
    await this.safetySystemService.validateResetSafety(id);

    robot.reset();
    await this.robotRepository.save(robot);
  }

  @Patch(':id/position')
  @ApiOperation({ 
    summary: 'Update robot position',
    description: 'Update current robot position and orientation'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_OPERATOR', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_POSITION_UPDATE')
  async updateRobotPosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) positionDto: RobotPositionDto
  ): Promise<Robot> {
    const robot = await this.robotRepository.findOne({ where: { id } });
    
    if (!robot) {
      throw new Error('Robot not found');
    }

    robot.updatePosition(positionDto);
    
    // Update real-time monitoring
    await this.monitoringService.updateRobotPosition(id, positionDto);

    return await this.robotRepository.save(robot);
  }

  // ==================== TASK MANAGEMENT ====================

  @Post(':id/tasks/assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Assign task to robot',
    description: 'Assign a new task to the robot with AI-powered optimization'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SHOP_FLOOR_MANAGER', 'PRODUCTION_PLANNER')
  @RequirePermissions('TASK_ASSIGN')
  async assignTask(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Body(ValidationPipe) taskAssignmentDto: RobotTaskAssignmentDto
  ) {
    return await this.autonomousCoordinationService.assignTaskToRobot(robotId, taskAssignmentDto);
  }

  @Get(':id/tasks')
  @ApiOperation({ 
    summary: 'Get robot tasks',
    description: 'Retrieve current and historical tasks for the robot'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('TASK_VIEW')
  async getRobotTasks(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number
  ) {
    return await this.shopFloorService.getRobotTasks(robotId, { status, limit });
  }

  @Get(':id/tasks/current')
  @ApiOperation({ 
    summary: 'Get current robot task',
    description: 'Retrieve the currently executing task'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('TASK_VIEW')
  async getCurrentTask(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.shopFloorService.getCurrentRobotTask(robotId);
  }

  @Post(':id/tasks/:taskId/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Complete robot task',
    description: 'Mark the current task as completed'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @ApiParam({ name: 'taskId', type: String, description: 'Task UUID' })
  @Roles('SHOP_FLOOR_OPERATOR', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('TASK_COMPLETE')
  async completeTask(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string
  ): Promise<void> {
    const robot = await this.robotRepository.findOne({ where: { id: robotId } });
    
    if (!robot) {
      throw new Error('Robot not found');
    }

    robot.completeTask();
    await this.robotRepository.save(robot);

    // Update task status
    await this.shopFloorService.completeTask(taskId);
  }

  // ==================== SAFETY OPERATIONS ====================

  @Get(':id/safety/status')
  @ApiOperation({ 
    summary: 'Get robot safety status',
    description: 'Retrieve comprehensive safety status and configuration'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('SAFETY_VIEW')
  async getSafetyStatus(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.safetySystemService.getRobotSafetyStatus(robotId);
  }

  @Put(':id/safety/configuration')
  @ApiOperation({ 
    summary: 'Update safety configuration',
    description: 'Update robot safety configuration and parameters'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SAFETY_OFFICER', 'ROBOTICS_ENGINEER', 'ADMIN')
  @RequirePermissions('SAFETY_CONFIG_UPDATE')
  async updateSafetyConfiguration(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Body(ValidationPipe) safetyConfigDto: SafetyConfigurationDto
  ) {
    return await this.safetySystemService.updateSafetyConfiguration(robotId, safetyConfigDto);
  }

  @Post(':id/safety/check')
  @ApiOperation({ 
    summary: 'Perform safety check',
    description: 'Run comprehensive safety validation for the robot'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SAFETY_OFFICER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('SAFETY_CHECK')
  async performSafetyCheck(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.safetySystemService.performComprehensiveSafetyCheck(robotId);
  }

  // ==================== CALIBRATION & MAINTENANCE ====================

  @Post(':id/calibration')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Start robot calibration',
    description: 'Initiate robot calibration process'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('ROBOTICS_TECHNICIAN', 'ROBOTICS_ENGINEER')
  @RequirePermissions('ROBOT_CALIBRATION')
  async startCalibration(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Body(ValidationPipe) calibrationDto: RobotCalibrationDto
  ) {
    return await this.shopFloorService.startRobotCalibration(robotId, calibrationDto);
  }

  @Get(':id/calibration/status')
  @ApiOperation({ 
    summary: 'Get calibration status',
    description: 'Check current calibration status and results'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('ROBOT_CALIBRATION_VIEW')
  async getCalibrationStatus(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.shopFloorService.getCalibrationStatus(robotId);
  }

  @Get(':id/maintenance/schedule')
  @ApiOperation({ 
    summary: 'Get maintenance schedule',
    description: 'Retrieve predictive maintenance schedule for the robot'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('MAINTENANCE_VIEW')
  async getMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.predictiveMaintenanceService.getRobotMaintenanceSchedule(robotId);
  }

  @Post(':id/maintenance/predict')
  @ApiOperation({ 
    summary: 'Generate predictive maintenance',
    description: 'Use AI to predict upcoming maintenance needs'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('MAINTENANCE_MANAGER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('PREDICTIVE_MAINTENANCE')
  async predictMaintenance(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.predictiveMaintenanceService.generateMaintenancePrediction(robotId);
  }

  // ==================== PERFORMANCE & ANALYTICS ====================

  @Get(':id/performance')
  @ApiOperation({ 
    summary: 'Get robot performance metrics',
    description: 'Retrieve comprehensive performance analytics'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('PERFORMANCE_VIEW')
  async getPerformanceMetrics(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Query('period') period?: string
  ) {
    return await this.monitoringService.getRobotPerformanceMetrics(robotId, period);
  }

  @Get(':id/performance/real-time')
  @ApiOperation({ 
    summary: 'Get real-time performance',
    description: 'Retrieve current real-time performance data'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('REAL_TIME_MONITORING')
  async getRealTimePerformance(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.monitoringService.getRealTimeRobotData(robotId);
  }

  @Get(':id/analytics/productivity')
  @ApiOperation({ 
    summary: 'Get productivity analytics',
    description: 'Retrieve detailed productivity analysis and trends'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('ANALYTICS_VIEW')
  async getProductivityAnalytics(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Query('timeframe') timeframe?: string
  ) {
    return await this.monitoringService.getProductivityAnalytics(robotId, timeframe);
  }

  // ==================== AI & LEARNING ====================

  @Get(':id/ai/learning-profile')
  @ApiOperation({ 
    summary: 'Get AI learning profile',
    description: 'Retrieve robot AI learning status and capabilities'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('AI_PROFILE_VIEW')
  async getAILearningProfile(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.aiLearningService.getRobotLearningProfile(robotId);
  }

  @Post(':id/ai/train')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Start AI training',
    description: 'Initiate AI training session for the robot'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('AI_ENGINEER', 'ROBOTICS_ENGINEER', 'ADMIN')
  @RequirePermissions('AI_TRAINING')
  async startAITraining(
    @Param('id', ParseUUIDPipe) robotId: string,
    @Body() trainingConfig: any
  ) {
    return await this.aiLearningService.startTrainingSession(robotId, trainingConfig);
  }

  @Get(':id/ai/recommendations')
  @ApiOperation({ 
    summary: 'Get AI recommendations',
    description: 'Get AI-powered recommendations for robot optimization'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('AI_RECOMMENDATIONS')
  async getAIRecommendations(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.aiLearningService.generateOptimizationRecommendations(robotId);
  }

  // ==================== COLLABORATIVE OPERATIONS ====================

  @Get(':id/collaboration/status')
  @ApiOperation({ 
    summary: 'Get collaboration status',
    description: 'Check collaborative operation status with humans'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @RequirePermissions('COLLABORATION_VIEW')
  async getCollaborationStatus(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.collaborativeRoboticsService.getCollaborationStatus(robotId);
  }

  @Post(':id/collaboration/enable')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Enable collaborative mode',
    description: 'Enable human-robot collaboration with safety validation'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SAFETY_OFFICER', 'ROBOTICS_ENGINEER')
  @RequirePermissions('COLLABORATIVE_MODE')
  async enableCollaborativeMode(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.collaborativeRoboticsService.enableCollaborativeMode(robotId);
  }

  @Post(':id/collaboration/disable')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Disable collaborative mode',
    description: 'Switch robot back to autonomous operation'
  })
  @ApiParam({ name: 'id', type: String, description: 'Robot UUID' })
  @Roles('SAFETY_OFFICER', 'ROBOTICS_ENGINEER', 'SHOP_FLOOR_MANAGER')
  @RequirePermissions('COLLABORATIVE_MODE')
  async disableCollaborativeMode(
    @Param('id', ParseUUIDPipe) robotId: string
  ) {
    return await this.collaborativeRoboticsService.disableCollaborativeMode(robotId);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk/commands')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Send bulk commands to multiple robots',
    description: 'Execute commands on multiple robots simultaneously'
  })
  @Roles('SHOP_FLOOR_MANAGER', 'ADMIN')
  @RequirePermissions('BULK_ROBOT_CONTROL')
  async sendBulkCommands(
    @Body(ValidationPipe) bulkOperationDto: BulkRobotOperationDto
  ) {
    return await this.shopFloorService.executeBulkRobotCommands(bulkOperationDto);
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get robot dashboard',
    description: 'Retrieve comprehensive robot management dashboard data'
  })
  @RequirePermissions('ROBOT_DASHBOARD_VIEW')
  async getRobotDashboard() {
    return await this.shopFloorService.getRobotDashboard();
  }

  @Get('fleet/status')
  @ApiOperation({ 
    summary: 'Get fleet status overview',
    description: 'Get comprehensive overview of entire robot fleet'
  })
  @RequirePermissions('FLEET_VIEW')
  async getFleetStatus() {
    return await this.autonomousCoordinationService.getFleetStatus();
  }
}
