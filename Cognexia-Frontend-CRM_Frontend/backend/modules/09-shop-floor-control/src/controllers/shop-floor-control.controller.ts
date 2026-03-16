import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { 
  ShopFloorControlService,
  CreateRobotDto,
  CreateWorkCellDto,
  CreateTaskDto,
  TaskAssignmentResult,
  CollaborationRequest,
  ShopFloorMetrics
} from '../services/shop-floor-control.service';
import { 
  Robot,
  RobotState,
  RobotType
} from '../entities/robot.entity';
import { 
  WorkCell,
  WorkCellStatus,
  WorkCellType
} from '../entities/work-cell.entity';
import { 
  RobotTask,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskResult
} from '../entities/robot-task.entity';
import { TaskStep } from '../entities/task-step.entity';

// Response DTOs
export class RobotResponseDto {
  id: string;
  name: string;
  type: RobotType;
  manufacturer: string;
  model: string;
  state: RobotState;
  isOnline: boolean;
  isAvailable: boolean;
  batteryLevel: number;
  currentTaskId?: string;
  workCellId?: string;
  healthScore: number;
  utilizationRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkCellResponseDto {
  id: string;
  name: string;
  type: WorkCellType;
  status: WorkCellStatus;
  location: string;
  currentRobots: number;
  maxRobots: number;
  currentTasks: number;
  efficiency: number;
  oee: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskResponseDto {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  progressPercentage: number;
  robotId?: string;
  workCellId?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  qualityScore?: number;
  createdAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class TaskExecutionDto {
  result: TaskResult;
}

export class EmergencyStopDto {
  reason: string;
}

export class CollaborationResponseDto {
  availableRobots: Robot[];
  recommendedRobots: Robot[];
  estimatedSetupTime: number;
  collaborationScore: number;
}

@ApiTags('Shop Floor Control')
@Controller('shop-floor-control')
@UseInterceptors(ClassSerializerInterceptor)
export class ShopFloorControlController {
  private readonly logger = new Logger(ShopFloorControlController.name);

  constructor(
    private readonly shopFloorControlService: ShopFloorControlService
  ) {}

  // Robot Management Endpoints
  @Post('robots')
  @ApiOperation({ 
    summary: 'Create a new robot',
    description: 'Register a new robot in the shop floor control system with capabilities and configuration'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Robot created successfully',
    type: RobotResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid robot configuration' })
  @ApiBody({ type: CreateRobotDto })
  async createRobot(@Body(ValidationPipe) createRobotDto: CreateRobotDto): Promise<RobotResponseDto> {
    try {
      const robot = await this.shopFloorControlService.createRobot(createRobotDto);
      return this.mapRobotToResponse(robot);
    } catch (error) {
      this.logger.error(`Failed to create robot: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('robots')
  @ApiOperation({ 
    summary: 'Get all robots',
    description: 'Retrieve a list of all robots with their current status and capabilities'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of robots retrieved successfully',
    type: [RobotResponseDto]
  })
  @ApiQuery({ name: 'status', required: false, enum: RobotState, description: 'Filter by robot state' })
  @ApiQuery({ name: 'type', required: false, enum: RobotType, description: 'Filter by robot type' })
  @ApiQuery({ name: 'workCellId', required: false, description: 'Filter by work cell ID' })
  async getAllRobots(
    @Query('status') status?: RobotState,
    @Query('type') type?: RobotType,
    @Query('workCellId') workCellId?: string
  ): Promise<RobotResponseDto[]> {
    try {
      const robots = await this.shopFloorControlService.getAllRobots();
      
      // Apply filters
      let filteredRobots = robots;
      
      if (status) {
        filteredRobots = filteredRobots.filter(robot => robot.state === status);
      }
      
      if (type) {
        filteredRobots = filteredRobots.filter(robot => robot.type === type);
      }
      
      if (workCellId) {
        filteredRobots = filteredRobots.filter(robot => robot.workCellId === workCellId);
      }

      return filteredRobots.map(robot => this.mapRobotToResponse(robot));
    } catch (error) {
      this.logger.error(`Failed to get robots: ${error.message}`);
      throw new HttpException('Failed to retrieve robots', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('robots/available')
  @ApiOperation({ 
    summary: 'Get available robots',
    description: 'Retrieve a list of robots that are online and available for task assignment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Available robots retrieved successfully',
    type: [RobotResponseDto]
  })
  async getAvailableRobots(): Promise<RobotResponseDto[]> {
    try {
      const robots = await this.shopFloorControlService.getAvailableRobots();
      return robots.map(robot => this.mapRobotToResponse(robot));
    } catch (error) {
      this.logger.error(`Failed to get available robots: ${error.message}`);
      throw new HttpException('Failed to retrieve available robots', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('robots/:id')
  @ApiOperation({ 
    summary: 'Get robot by ID',
    description: 'Retrieve detailed information about a specific robot including current tasks and performance metrics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot retrieved successfully',
    type: RobotResponseDto
  })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  @ApiParam({ name: 'id', description: 'Robot UUID' })
  async getRobotById(@Param('id') id: string): Promise<Robot> {
    try {
      return await this.shopFloorControlService.getRobotById(id);
    } catch (error) {
      this.logger.error(`Failed to get robot ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put('robots/:id/activate')
  @ApiOperation({ 
    summary: 'Activate robot',
    description: 'Bring a robot online and make it available for task assignment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot activated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  @ApiParam({ name: 'id', description: 'Robot UUID' })
  async activateRobot(@Param('id') id: string): Promise<RobotResponseDto> {
    try {
      const robot = await this.shopFloorControlService.activateRobot(id);
      return this.mapRobotToResponse(robot);
    } catch (error) {
      this.logger.error(`Failed to activate robot ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('robots/:id/deactivate')
  @ApiOperation({ 
    summary: 'Deactivate robot',
    description: 'Take a robot offline for maintenance or other reasons'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot deactivated successfully',
    type: RobotResponseDto
  })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  @ApiParam({ name: 'id', description: 'Robot UUID' })
  @ApiBody({ type: EmergencyStopDto, required: false })
  async deactivateRobot(
    @Param('id') id: string,
    @Body() body?: { reason?: string }
  ): Promise<RobotResponseDto> {
    try {
      const robot = await this.shopFloorControlService.deactivateRobot(id, body?.reason);
      return this.mapRobotToResponse(robot);
    } catch (error) {
      this.logger.error(`Failed to deactivate robot ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('robots/:id/emergency-stop')
  @ApiOperation({ 
    summary: 'Emergency stop robot',
    description: 'Immediately stop all robot operations for safety reasons'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Emergency stop executed successfully',
    type: RobotResponseDto
  })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  @ApiParam({ name: 'id', description: 'Robot UUID' })
  @ApiBody({ type: EmergencyStopDto })
  async emergencyStopRobot(
    @Param('id') id: string,
    @Body(ValidationPipe) emergencyStopDto: EmergencyStopDto
  ): Promise<RobotResponseDto> {
    try {
      const robot = await this.shopFloorControlService.emergencyStopRobot(id, emergencyStopDto.reason);
      return this.mapRobotToResponse(robot);
    } catch (error) {
      this.logger.error(`Failed to emergency stop robot ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Work Cell Management Endpoints
  @Post('work-cells')
  @ApiOperation({ 
    summary: 'Create work cell',
    description: 'Create a new work cell for organizing robots and production activities'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Work cell created successfully',
    type: WorkCellResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid work cell configuration' })
  @ApiBody({ type: CreateWorkCellDto })
  async createWorkCell(@Body(ValidationPipe) createWorkCellDto: CreateWorkCellDto): Promise<WorkCellResponseDto> {
    try {
      const workCell = await this.shopFloorControlService.createWorkCell(createWorkCellDto);
      return this.mapWorkCellToResponse(workCell);
    } catch (error) {
      this.logger.error(`Failed to create work cell: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('work-cells')
  @ApiOperation({ 
    summary: 'Get all work cells',
    description: 'Retrieve a list of all work cells with their status and metrics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Work cells retrieved successfully',
    type: [WorkCellResponseDto]
  })
  @ApiQuery({ name: 'status', required: false, enum: WorkCellStatus, description: 'Filter by work cell status' })
  @ApiQuery({ name: 'type', required: false, enum: WorkCellType, description: 'Filter by work cell type' })
  async getAllWorkCells(
    @Query('status') status?: WorkCellStatus,
    @Query('type') type?: WorkCellType
  ): Promise<WorkCellResponseDto[]> {
    try {
      const workCells = await this.shopFloorControlService.getAllWorkCells();
      
      // Apply filters
      let filteredWorkCells = workCells;
      
      if (status) {
        filteredWorkCells = filteredWorkCells.filter(wc => wc.status === status);
      }
      
      if (type) {
        filteredWorkCells = filteredWorkCells.filter(wc => wc.type === type);
      }

      return filteredWorkCells.map(workCell => this.mapWorkCellToResponse(workCell));
    } catch (error) {
      this.logger.error(`Failed to get work cells: ${error.message}`);
      throw new HttpException('Failed to retrieve work cells', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('work-cells/:id')
  @ApiOperation({ 
    summary: 'Get work cell by ID',
    description: 'Retrieve detailed information about a specific work cell including robots and tasks'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Work cell retrieved successfully',
    type: WorkCell
  })
  @ApiResponse({ status: 404, description: 'Work cell not found' })
  @ApiParam({ name: 'id', description: 'Work cell UUID' })
  async getWorkCellById(@Param('id') id: string): Promise<WorkCell> {
    try {
      return await this.shopFloorControlService.getWorkCellById(id);
    } catch (error) {
      this.logger.error(`Failed to get work cell ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put('work-cells/:id/activate')
  @ApiOperation({ 
    summary: 'Activate work cell',
    description: 'Start production operations in a work cell'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Work cell activated successfully',
    type: WorkCellResponseDto
  })
  @ApiResponse({ status: 404, description: 'Work cell not found' })
  @ApiParam({ name: 'id', description: 'Work cell UUID' })
  async activateWorkCell(@Param('id') id: string): Promise<WorkCellResponseDto> {
    try {
      const workCell = await this.shopFloorControlService.activateWorkCell(id);
      return this.mapWorkCellToResponse(workCell);
    } catch (error) {
      this.logger.error(`Failed to activate work cell ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('work-cells/:id/emergency-stop')
  @ApiOperation({ 
    summary: 'Emergency stop work cell',
    description: 'Immediately stop all operations in a work cell including all robots'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Emergency stop executed successfully',
    type: WorkCellResponseDto
  })
  @ApiResponse({ status: 404, description: 'Work cell not found' })
  @ApiParam({ name: 'id', description: 'Work cell UUID' })
  @ApiBody({ type: EmergencyStopDto })
  async emergencyStopWorkCell(
    @Param('id') id: string,
    @Body(ValidationPipe) emergencyStopDto: EmergencyStopDto
  ): Promise<WorkCellResponseDto> {
    try {
      const workCell = await this.shopFloorControlService.emergencyStopWorkCell(id, emergencyStopDto.reason);
      return this.mapWorkCellToResponse(workCell);
    } catch (error) {
      this.logger.error(`Failed to emergency stop work cell ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Task Management Endpoints
  @Post('tasks')
  @ApiOperation({ 
    summary: 'Create task',
    description: 'Create a new production task with steps and requirements'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Task created successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid task configuration' })
  @ApiBody({ type: CreateTaskDto })
  async createTask(@Body(ValidationPipe) createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.createTask(createTaskDto);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('tasks')
  @ApiOperation({ 
    summary: 'Get all tasks',
    description: 'Retrieve a list of all tasks with filtering options'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tasks retrieved successfully',
    type: [TaskResponseDto]
  })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus, description: 'Filter by task status' })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority, description: 'Filter by task priority' })
  @ApiQuery({ name: 'type', required: false, enum: TaskType, description: 'Filter by task type' })
  @ApiQuery({ name: 'robotId', required: false, description: 'Filter by assigned robot' })
  @ApiQuery({ name: 'workCellId', required: false, description: 'Filter by work cell' })
  async getAllTasks(
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('type') type?: TaskType,
    @Query('robotId') robotId?: string,
    @Query('workCellId') workCellId?: string
  ): Promise<TaskResponseDto[]> {
    try {
      const tasks = await this.shopFloorControlService.getAllTasks();
      
      // Apply filters
      let filteredTasks = tasks;
      
      if (status) {
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }
      
      if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
      }
      
      if (type) {
        filteredTasks = filteredTasks.filter(task => task.type === type);
      }
      
      if (robotId) {
        filteredTasks = filteredTasks.filter(task => task.robotId === robotId);
      }
      
      if (workCellId) {
        filteredTasks = filteredTasks.filter(task => task.workCellId === workCellId);
      }

      return filteredTasks.map(task => this.mapTaskToResponse(task));
    } catch (error) {
      this.logger.error(`Failed to get tasks: ${error.message}`);
      throw new HttpException('Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('tasks/pending')
  @ApiOperation({ 
    summary: 'Get pending tasks',
    description: 'Retrieve all tasks waiting for assignment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pending tasks retrieved successfully',
    type: [TaskResponseDto]
  })
  async getPendingTasks(): Promise<TaskResponseDto[]> {
    try {
      const tasks = await this.shopFloorControlService.getPendingTasks();
      return tasks.map(task => this.mapTaskToResponse(task));
    } catch (error) {
      this.logger.error(`Failed to get pending tasks: ${error.message}`);
      throw new HttpException('Failed to retrieve pending tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('tasks/active')
  @ApiOperation({ 
    summary: 'Get active tasks',
    description: 'Retrieve all tasks currently in progress or assigned'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active tasks retrieved successfully',
    type: [TaskResponseDto]
  })
  async getActiveTasks(): Promise<TaskResponseDto[]> {
    try {
      const tasks = await this.shopFloorControlService.getActiveTasks();
      return tasks.map(task => this.mapTaskToResponse(task));
    } catch (error) {
      this.logger.error(`Failed to get active tasks: ${error.message}`);
      throw new HttpException('Failed to retrieve active tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('tasks/:id')
  @ApiOperation({ 
    summary: 'Get task by ID',
    description: 'Retrieve detailed information about a specific task including steps and progress'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task retrieved successfully',
    type: RobotTask
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async getTaskById(@Param('id') id: string): Promise<RobotTask> {
    try {
      return await this.shopFloorControlService.getTaskById(id);
    } catch (error) {
      this.logger.error(`Failed to get task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('tasks/:id/assign')
  @ApiOperation({ 
    summary: 'Assign task to robot',
    description: 'Assign a task to a specific robot or use AI to select the optimal robot'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task assigned successfully',
    type: TaskAssignmentResult
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Assignment failed' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiQuery({ name: 'robotId', required: false, description: 'Specific robot to assign (optional for AI selection)' })
  async assignTask(
    @Param('id') id: string,
    @Query('robotId') robotId?: string
  ): Promise<TaskAssignmentResult> {
    try {
      return await this.shopFloorControlService.assignTask(id, robotId);
    } catch (error) {
      this.logger.error(`Failed to assign task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('tasks/:id/start')
  @ApiOperation({ 
    summary: 'Start task execution',
    description: 'Begin execution of an assigned task'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task started successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Task cannot be started' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async startTask(@Param('id') id: string): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.startTask(id);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to start task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('tasks/:id/pause')
  @ApiOperation({ 
    summary: 'Pause task execution',
    description: 'Temporarily pause an executing task'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task paused successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async pauseTask(@Param('id') id: string): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.pauseTask(id);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to pause task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('tasks/:id/resume')
  @ApiOperation({ 
    summary: 'Resume task execution',
    description: 'Resume a paused task'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task resumed successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async resumeTask(@Param('id') id: string): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.resumeTask(id);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to resume task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('tasks/:id/complete')
  @ApiOperation({ 
    summary: 'Complete task',
    description: 'Mark a task as completed with execution results'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task completed successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiBody({ type: TaskExecutionDto })
  async completeTask(
    @Param('id') id: string,
    @Body(ValidationPipe) taskExecutionDto: TaskExecutionDto
  ): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.completeTask(id, taskExecutionDto.result);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to complete task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('tasks/:id/fail')
  @ApiOperation({ 
    summary: 'Fail task',
    description: 'Mark a task as failed with reason'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task marked as failed successfully',
    type: TaskResponseDto
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiBody({ type: EmergencyStopDto })
  async failTask(
    @Param('id') id: string,
    @Body(ValidationPipe) failTaskDto: EmergencyStopDto
  ): Promise<TaskResponseDto> {
    try {
      const task = await this.shopFloorControlService.failTask(id, failTaskDto.reason);
      return this.mapTaskToResponse(task);
    } catch (error) {
      this.logger.error(`Failed to fail task ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Collaboration Endpoints
  @Post('collaboration/request')
  @ApiOperation({ 
    summary: 'Request robot collaboration',
    description: 'Find suitable robots for collaborative tasks'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Collaboration candidates found successfully',
    type: CollaborationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid collaboration request' })
  @ApiBody({ type: CollaborationRequest })
  async requestCollaboration(
    @Body(ValidationPipe) collaborationRequest: CollaborationRequest
  ): Promise<CollaborationResponseDto> {
    try {
      const suitableRobots = await this.shopFloorControlService.requestCollaboration(collaborationRequest);
      
      // Calculate collaboration metrics
      const collaborationScore = suitableRobots.length > 0 
        ? suitableRobots.reduce((sum, robot) => sum + robot.performanceMetrics.efficiency, 0) / suitableRobots.length
        : 0;
      
      const estimatedSetupTime = suitableRobots.length * 120; // 2 minutes per robot

      return {
        availableRobots: suitableRobots,
        recommendedRobots: suitableRobots.slice(0, 3), // Top 3 recommendations
        estimatedSetupTime,
        collaborationScore
      };
    } catch (error) {
      this.logger.error(`Failed to process collaboration request: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Analytics and Metrics Endpoints
  @Get('metrics')
  @ApiOperation({ 
    summary: 'Get shop floor metrics',
    description: 'Retrieve comprehensive metrics about shop floor operations'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Metrics retrieved successfully',
    type: ShopFloorMetrics
  })
  async getShopFloorMetrics(): Promise<ShopFloorMetrics> {
    try {
      return await this.shopFloorControlService.getShopFloorMetrics();
    } catch (error) {
      this.logger.error(`Failed to get shop floor metrics: ${error.message}`);
      throw new HttpException('Failed to retrieve metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('metrics/robots/:id')
  @ApiOperation({ 
    summary: 'Get robot performance metrics',
    description: 'Retrieve detailed performance metrics for a specific robot'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot metrics retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  @ApiParam({ name: 'id', description: 'Robot UUID' })
  async getRobotMetrics(@Param('id') id: string): Promise<any> {
    try {
      const robot = await this.shopFloorControlService.getRobotById(id);
      
      return {
        robotId: robot.id,
        name: robot.name,
        performanceMetrics: robot.performanceMetrics,
        healthScore: robot.getHealthScore(),
        utilizationRate: robot.getUtilizationRate(),
        taskExperience: robot.taskExperience,
        totalOperatingTime: robot.performanceMetrics.totalOperatingHours,
        currentState: robot.state,
        batteryLevel: robot.batteryLevel,
        lastMaintenanceDate: robot.lastMaintenanceDate,
        nextMaintenanceDate: robot.nextMaintenanceDate
      };
    } catch (error) {
      this.logger.error(`Failed to get robot metrics for ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('metrics/work-cells/:id')
  @ApiOperation({ 
    summary: 'Get work cell metrics',
    description: 'Retrieve detailed metrics for a specific work cell'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Work cell metrics retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Work cell not found' })
  @ApiParam({ name: 'id', description: 'Work cell UUID' })
  async getWorkCellMetrics(@Param('id') id: string): Promise<any> {
    try {
      const workCell = await this.shopFloorControlService.getWorkCellById(id);
      
      return {
        workCellId: workCell.id,
        name: workCell.name,
        productionMetrics: workCell.productionMetrics,
        currentUtilization: workCell.getCurrentUtilization(),
        efficiency: workCell.getEfficiency(),
        oee: workCell.productionMetrics.oee,
        currentRobots: workCell.currentRobots,
        maxRobots: workCell.maxRobots,
        currentTasks: workCell.currentTasks,
        status: workCell.status,
        capabilities: workCell.capabilities
      };
    } catch (error) {
      this.logger.error(`Failed to get work cell metrics for ${id}: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Helper methods for response mapping
  private mapRobotToResponse(robot: Robot): RobotResponseDto {
    return {
      id: robot.id,
      name: robot.name,
      type: robot.type,
      manufacturer: robot.manufacturer,
      model: robot.model,
      state: robot.state,
      isOnline: robot.isOnline,
      isAvailable: robot.isAvailable,
      batteryLevel: robot.batteryLevel,
      currentTaskId: robot.currentTaskId,
      workCellId: robot.workCellId,
      healthScore: robot.getHealthScore(),
      utilizationRate: robot.getUtilizationRate(),
      createdAt: robot.createdAt,
      updatedAt: robot.updatedAt
    };
  }

  private mapWorkCellToResponse(workCell: WorkCell): WorkCellResponseDto {
    return {
      id: workCell.id,
      name: workCell.name,
      type: workCell.type,
      status: workCell.status,
      location: workCell.location,
      currentRobots: workCell.currentRobots,
      maxRobots: workCell.maxRobots,
      currentTasks: workCell.currentTasks,
      efficiency: workCell.getEfficiency(),
      oee: workCell.productionMetrics.oee,
      createdAt: workCell.createdAt,
      updatedAt: workCell.updatedAt
    };
  }

  private mapTaskToResponse(task: RobotTask): TaskResponseDto {
    return {
      id: task.id,
      name: task.name,
      type: task.type,
      status: task.status,
      priority: task.priority,
      progressPercentage: task.progressPercentage,
      robotId: task.robotId,
      workCellId: task.workCellId,
      estimatedDuration: task.estimatedDuration,
      actualDuration: task.actualDuration,
      qualityScore: task.qualityScore,
      createdAt: task.createdAt,
      scheduledAt: task.scheduledAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt
    };
  }
}
