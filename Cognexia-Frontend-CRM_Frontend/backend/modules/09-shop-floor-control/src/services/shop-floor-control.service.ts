import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  Robot, 
  RobotType, 
  RobotState, 
  RobotMode,
  AICapability,
  RobotCapabilities,
  Position3D,
  SafetyConfiguration,
  PerformanceMetrics,
  AILearningProfile
} from '../entities/robot.entity';
import { 
  WorkCell, 
  WorkCellType, 
  WorkCellStatus,
  WorkCellCapability,
  LayoutConfiguration,
  ProductionMetrics
} from '../entities/work-cell.entity';
import { 
  RobotTask, 
  TaskType, 
  TaskStatus, 
  TaskPriority, 
  TaskComplexity,
  TaskRequirements,
  TaskParameters,
  TaskResult,
  AIAnalysis
} from '../entities/robot-task.entity';
import { 
  TaskStep, 
  StepType, 
  StepStatus, 
  InteractionType,
  StepParameters,
  StepResult,
  ValidationCriteria
} from '../entities/task-step.entity';

// DTOs for service operations
export interface CreateRobotDto {
  name: string;
  type: RobotType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capabilities: RobotCapabilities;
  position: Position3D;
  workCellId?: string;
  safetyConfiguration?: SafetyConfiguration;
  aiLearningProfile?: AILearningProfile;
}

export interface CreateWorkCellDto {
  name: string;
  type: WorkCellType;
  location: string;
  capabilities: WorkCellCapability[];
  layoutConfiguration: LayoutConfiguration;
  maxRobots: number;
  maxHumans: number;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  complexity: TaskComplexity;
  requirements: TaskRequirements;
  parameters: TaskParameters;
  workCellId?: string;
  robotId?: string;
  steps: CreateTaskStepDto[];
  scheduledAt?: Date;
  productId?: string;
  batchId?: string;
  orderId?: string;
}

export interface CreateTaskStepDto {
  name: string;
  description?: string;
  type: StepType;
  stepOrder: number;
  parameters: StepParameters;
  interactionType?: InteractionType;
  estimatedDuration?: number;
  isCritical?: boolean;
  isOptional?: boolean;
  isParallel?: boolean;
  validationCriteria?: ValidationCriteria;
  dependsOnSteps?: string[];
}

export interface TaskAssignmentResult {
  success: boolean;
  taskId: string;
  robotId?: string;
  estimatedStartTime?: Date;
  estimatedCompletion?: Date;
  reason?: string;
}

export interface CollaborationRequest {
  primaryRobotId: string;
  taskId: string;
  requiredCapabilities: string[];
  maxDistance?: number; // meters
  preferredRobots?: string[];
  humanSupervisionRequired?: boolean;
}

export interface ShopFloorMetrics {
  totalRobots: number;
  activeRobots: number;
  idleRobots: number;
  robotUtilization: number;
  totalWorkCells: number;
  activeWorkCells: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
  overallEfficiency: number;
  safetyIncidents: number;
  energyConsumption: number;
  qualityScore: number;
}

@Injectable()
export class ShopFloorControlService {
  private readonly logger = new Logger(ShopFloorControlService.name);

  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    
    @InjectRepository(WorkCell)
    private readonly workCellRepository: Repository<WorkCell>,
    
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
    
    @InjectRepository(TaskStep)
    private readonly stepRepository: Repository<TaskStep>,
    
    private readonly eventEmitter: EventEmitter2
  ) {}

  // Robot Management
  async createRobot(createRobotDto: CreateRobotDto): Promise<Robot> {
    try {
      const robot = this.robotRepository.create({
        ...createRobotDto,
        state: RobotState.OFFLINE,
        mode: RobotMode.MANUAL,
        isOnline: false,
        isAvailable: false,
        batteryLevel: 100,
        performanceMetrics: {
          totalOperatingHours: 0,
          totalTasks: 0,
          successfulTasks: 0,
          averageTaskTime: 0,
          uptime: 0,
          efficiency: 0,
          accuracy: 0,
          energyEfficiency: 0,
          mtbf: 0,
          mttr: 0,
          qualityScore: 0,
          safetyScore: 100
        }
      });

      const savedRobot = await this.robotRepository.save(robot);

      this.eventEmitter.emit('robot.created', {
        robotId: savedRobot.id,
        name: savedRobot.name,
        type: savedRobot.type,
        workCellId: savedRobot.workCellId,
        timestamp: new Date()
      });

      this.logger.log(`Robot created: ${savedRobot.name} (${savedRobot.id})`);
      return savedRobot;
    } catch (error) {
      this.logger.error(`Failed to create robot: ${error.message}`);
      throw new BadRequestException(`Failed to create robot: ${error.message}`);
    }
  }

  async getRobotById(id: string): Promise<Robot> {
    const robot = await this.robotRepository.findOne({
      where: { id },
      relations: ['workCell', 'tasks', 'tasks.steps']
    });

    if (!robot) {
      throw new NotFoundException(`Robot with ID ${id} not found`);
    }

    return robot;
  }

  async getAllRobots(): Promise<Robot[]> {
    return this.robotRepository.find({
      relations: ['workCell', 'tasks']
    });
  }

  async getAvailableRobots(): Promise<Robot[]> {
    return this.robotRepository.find({
      where: { 
        isAvailable: true,
        isOnline: true,
        state: In([RobotState.IDLE, RobotState.READY])
      },
      relations: ['workCell']
    });
  }

  async activateRobot(robotId: string): Promise<Robot> {
    const robot = await this.getRobotById(robotId);
    
    robot.activate();
    const updatedRobot = await this.robotRepository.save(robot);

    this.eventEmitter.emit('robot.activated', {
      robotId: robot.id,
      name: robot.name,
      timestamp: new Date()
    });

    this.logger.log(`Robot activated: ${robot.name}`);
    return updatedRobot;
  }

  async deactivateRobot(robotId: string, reason?: string): Promise<Robot> {
    const robot = await this.getRobotById(robotId);
    
    robot.deactivate(reason);
    const updatedRobot = await this.robotRepository.save(robot);

    this.eventEmitter.emit('robot.deactivated', {
      robotId: robot.id,
      name: robot.name,
      reason,
      timestamp: new Date()
    });

    this.logger.log(`Robot deactivated: ${robot.name}, reason: ${reason}`);
    return updatedRobot;
  }

  async emergencyStopRobot(robotId: string, reason: string): Promise<Robot> {
    const robot = await this.getRobotById(robotId);
    
    robot.emergencyStop(reason);
    const updatedRobot = await this.robotRepository.save(robot);

    this.eventEmitter.emit('robot.emergency_stop', {
      robotId: robot.id,
      name: robot.name,
      reason,
      severity: 'HIGH',
      timestamp: new Date()
    });

    this.logger.error(`Emergency stop activated for robot: ${robot.name}, reason: ${reason}`);
    return updatedRobot;
  }

  // Work Cell Management
  async createWorkCell(createWorkCellDto: CreateWorkCellDto): Promise<WorkCell> {
    try {
      const workCell = this.workCellRepository.create({
        ...createWorkCellDto,
        status: WorkCellStatus.OFFLINE,
        currentRobots: 0,
        currentHumans: 0,
        currentTasks: 0,
        productionMetrics: {
          totalUnitsProduced: 0,
          totalOperatingHours: 0,
          averageCycleTime: 0,
          throughput: 0,
          yield: 0,
          qualityRate: 0,
          oee: 0,
          uptime: 0,
          availability: 0,
          performance: 0,
          quality: 0,
          defectRate: 0,
          reworkRate: 0,
          energyConsumption: 0,
          costPerUnit: 0
        }
      });

      const savedWorkCell = await this.workCellRepository.save(workCell);

      this.eventEmitter.emit('workcell.created', {
        workCellId: savedWorkCell.id,
        name: savedWorkCell.name,
        type: savedWorkCell.type,
        location: savedWorkCell.location,
        timestamp: new Date()
      });

      this.logger.log(`Work cell created: ${savedWorkCell.name} (${savedWorkCell.id})`);
      return savedWorkCell;
    } catch (error) {
      this.logger.error(`Failed to create work cell: ${error.message}`);
      throw new BadRequestException(`Failed to create work cell: ${error.message}`);
    }
  }

  async getWorkCellById(id: string): Promise<WorkCell> {
    const workCell = await this.workCellRepository.findOne({
      where: { id },
      relations: ['robots', 'tasks', 'tasks.steps']
    });

    if (!workCell) {
      throw new NotFoundException(`Work cell with ID ${id} not found`);
    }

    return workCell;
  }

  async getAllWorkCells(): Promise<WorkCell[]> {
    return this.workCellRepository.find({
      relations: ['robots', 'tasks']
    });
  }

  async activateWorkCell(workCellId: string): Promise<WorkCell> {
    const workCell = await this.getWorkCellById(workCellId);
    
    workCell.activate();
    const updatedWorkCell = await this.workCellRepository.save(workCell);

    this.eventEmitter.emit('workcell.activated', {
      workCellId: workCell.id,
      name: workCell.name,
      timestamp: new Date()
    });

    this.logger.log(`Work cell activated: ${workCell.name}`);
    return updatedWorkCell;
  }

  async emergencyStopWorkCell(workCellId: string, reason: string): Promise<WorkCell> {
    const workCell = await this.getWorkCellById(workCellId);
    
    // Stop all robots in the work cell
    const robots = await this.robotRepository.find({
      where: { workCellId }
    });

    for (const robot of robots) {
      await this.emergencyStopRobot(robot.id, `Work cell emergency stop: ${reason}`);
    }

    workCell.emergencyStop(reason);
    const updatedWorkCell = await this.workCellRepository.save(workCell);

    this.eventEmitter.emit('workcell.emergency_stop', {
      workCellId: workCell.id,
      name: workCell.name,
      reason,
      affectedRobots: robots.length,
      severity: 'CRITICAL',
      timestamp: new Date()
    });

    this.logger.error(`Emergency stop activated for work cell: ${workCell.name}, reason: ${reason}`);
    return updatedWorkCell;
  }

  // Task Management
  async createTask(createTaskDto: CreateTaskDto): Promise<RobotTask> {
    try {
      const task = this.taskRepository.create({
        ...createTaskDto,
        status: TaskStatus.PENDING,
        progressPercentage: 0,
        stepsCompleted: 0,
        totalSteps: createTaskDto.steps.length,
        retryCount: 0,
        currentStepIndex: 0
      });

      const savedTask = await this.taskRepository.save(task);

      // Create task steps
      const steps = createTaskDto.steps.map(stepDto => 
        this.stepRepository.create({
          ...stepDto,
          taskId: savedTask.id,
          status: StepStatus.PENDING
        })
      );

      await this.stepRepository.save(steps);

      // Load the complete task with steps
      const completeTask = await this.getTaskById(savedTask.id);

      this.eventEmitter.emit('task.created', {
        taskId: completeTask.id,
        name: completeTask.name,
        type: completeTask.type,
        priority: completeTask.priority,
        workCellId: completeTask.workCellId,
        stepsCount: steps.length,
        timestamp: new Date()
      });

      this.logger.log(`Task created: ${completeTask.name} (${completeTask.id}) with ${steps.length} steps`);
      return completeTask;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw new BadRequestException(`Failed to create task: ${error.message}`);
    }
  }

  async getTaskById(id: string): Promise<RobotTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['robot', 'workCell', 'steps']
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async getAllTasks(): Promise<RobotTask[]> {
    return this.taskRepository.find({
      relations: ['robot', 'workCell', 'steps'],
      order: { createdAt: 'DESC' }
    });
  }

  async getTasksByStatus(status: TaskStatus): Promise<RobotTask[]> {
    return this.taskRepository.find({
      where: { status },
      relations: ['robot', 'workCell', 'steps'],
      order: { priority: 'DESC', createdAt: 'ASC' }
    });
  }

  async getPendingTasks(): Promise<RobotTask[]> {
    return this.getTasksByStatus(TaskStatus.PENDING);
  }

  async getActiveTasks(): Promise<RobotTask[]> {
    return this.taskRepository.find({
      where: { 
        status: In([TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.PAUSED])
      },
      relations: ['robot', 'workCell', 'steps'],
      order: { priority: 'DESC', startedAt: 'ASC' }
    });
  }

  // Task Assignment with AI
  async assignTask(taskId: string, robotId?: string): Promise<TaskAssignmentResult> {
    try {
      const task = await this.getTaskById(taskId);

      if (task.status !== TaskStatus.PENDING && task.status !== TaskStatus.QUEUED) {
        return {
          success: false,
          taskId,
          reason: `Task is in ${task.status} status and cannot be assigned`
        };
      }

      let selectedRobot: Robot;

      if (robotId) {
        // Specific robot assignment
        selectedRobot = await this.getRobotById(robotId);
        
        if (!selectedRobot.isAvailable()) {
          return {
            success: false,
            taskId,
            robotId,
            reason: 'Specified robot is not available'
          };
        }

        if (!this.isRobotSuitableForTask(selectedRobot, task)) {
          return {
            success: false,
            taskId,
            robotId,
            reason: 'Robot does not meet task requirements'
          };
        }
      } else {
        // AI-powered robot selection
        selectedRobot = await this.selectOptimalRobot(task);
        
        if (!selectedRobot) {
          return {
            success: false,
            taskId,
            reason: 'No suitable robot available for this task'
          };
        }
      }

      // Assign task to robot
      task.robotId = selectedRobot.id;
      task.robot = selectedRobot;
      task.status = TaskStatus.ASSIGNED;

      // Generate AI analysis for the task
      const aiAnalysis = await this.generateTaskAIAnalysis(task, selectedRobot);
      task.aiAnalysis = aiAnalysis;

      // Update robot state
      selectedRobot.assignTask(task.id, task.estimatedDuration || 0);

      // Save changes
      await this.taskRepository.save(task);
      await this.robotRepository.save(selectedRobot);

      const estimatedStartTime = new Date();
      const estimatedCompletion = task.estimatedDuration 
        ? new Date(estimatedStartTime.getTime() + task.estimatedDuration * 1000)
        : undefined;

      this.eventEmitter.emit('task.assigned', {
        taskId: task.id,
        robotId: selectedRobot.id,
        taskName: task.name,
        robotName: selectedRobot.name,
        priority: task.priority,
        estimatedDuration: task.estimatedDuration,
        aiConfidence: aiAnalysis.performancePrediction.confidenceLevel,
        timestamp: new Date()
      });

      this.logger.log(`Task ${task.name} assigned to robot ${selectedRobot.name}`);

      return {
        success: true,
        taskId: task.id,
        robotId: selectedRobot.id,
        estimatedStartTime,
        estimatedCompletion
      };

    } catch (error) {
      this.logger.error(`Failed to assign task ${taskId}: ${error.message}`);
      return {
        success: false,
        taskId,
        reason: `Assignment failed: ${error.message}`
      };
    }
  }

  // AI-powered robot selection
  private async selectOptimalRobot(task: RobotTask): Promise<Robot | null> {
    const availableRobots = await this.getAvailableRobots();
    
    if (availableRobots.length === 0) {
      return null;
    }

    // Filter robots that meet basic requirements
    const suitableRobots = availableRobots.filter(robot => 
      this.isRobotSuitableForTask(robot, task)
    );

    if (suitableRobots.length === 0) {
      return null;
    }

    // Score robots based on multiple factors
    const scoredRobots = suitableRobots.map(robot => ({
      robot,
      score: this.calculateRobotTaskScore(robot, task)
    }));

    // Sort by score (highest first)
    scoredRobots.sort((a, b) => b.score - a.score);

    return scoredRobots[0].robot;
  }

  private isRobotSuitableForTask(robot: Robot, task: RobotTask): boolean {
    const requirements = task.requirements;

    // Check basic physical capabilities
    if (requirements.minPayloadKg && robot.capabilities.payloadKg < requirements.minPayloadKg) {
      return false;
    }

    if (requirements.minReachMm && robot.capabilities.reachMm < requirements.minReachMm) {
      return false;
    }

    if (requirements.minAxes && robot.capabilities.axes < requirements.minAxes) {
      return false;
    }

    if (requirements.requiredPrecision && robot.capabilities.repeatabilityMm > requirements.requiredPrecision) {
      return false;
    }

    // Check advanced capabilities
    if (requirements.visionRequired && !robot.capabilities.hasVision) {
      return false;
    }

    if (requirements.forceSensingRequired && !robot.capabilities.hasForceSensing) {
      return false;
    }

    if (requirements.collaborativeMode && !robot.capabilities.isCollaborative) {
      return false;
    }

    // Check AI capabilities
    if (requirements.aiCapabilitiesRequired && requirements.aiCapabilitiesRequired.length > 0) {
      const robotAICapabilities = robot.aiLearningProfile?.capabilities || [];
      const hasRequiredAI = requirements.aiCapabilitiesRequired.every(capability =>
        robotAICapabilities.includes(capability as AICapability)
      );
      if (!hasRequiredAI) {
        return false;
      }
    }

    // Check work cell compatibility
    if (task.workCellId && robot.workCellId !== task.workCellId) {
      return false;
    }

    return true;
  }

  private calculateRobotTaskScore(robot: Robot, task: RobotTask): number {
    let score = 0;

    // Base capability score (0-30 points)
    score += Math.min(30, robot.capabilities.payloadKg / 10);
    score += Math.min(30, robot.capabilities.reachMm / 100);
    score += Math.min(30, robot.capabilities.maxSpeed / 10);

    // Performance metrics score (0-40 points)
    score += robot.performanceMetrics.efficiency * 0.2;
    score += robot.performanceMetrics.accuracy * 0.2;

    // Experience score (0-20 points)
    const taskExperience = robot.taskExperience?.[task.type] || 0;
    score += Math.min(20, taskExperience / 5);

    // Health score (0-10 points)
    score += robot.getHealthScore() * 0.1;

    // Penalty for high utilization
    if (robot.performanceMetrics.uptime > 80) {
      score -= 10;
    }

    // Bonus for same work cell
    if (robot.workCellId === task.workCellId) {
      score += 15;
    }

    // Priority adjustment
    if (task.priority === TaskPriority.EMERGENCY) {
      score += 20;
    } else if (task.priority === TaskPriority.CRITICAL) {
      score += 10;
    }

    return score;
  }

  private async generateTaskAIAnalysis(task: RobotTask, robot: Robot): Promise<AIAnalysis> {
    // Simulate AI analysis generation
    const analysis: AIAnalysis = {
      optimizationSuggestions: [],
      predictedIssues: [],
      performancePrediction: {
        estimatedTime: task.estimatedDuration || 0,
        confidenceLevel: 0.85,
        riskFactors: []
      },
      learningInsights: {}
    };

    // Generate optimization suggestions based on robot capabilities
    if (robot.capabilities.maxSpeed > 5000) {
      analysis.optimizationSuggestions.push('Consider increasing movement speed for this high-speed robot');
    }

    if (robot.performanceMetrics.accuracy > 95) {
      analysis.optimizationSuggestions.push('Robot has exceptional accuracy - suitable for precision tasks');
    }

    // Predict potential issues
    if (robot.performanceMetrics.uptime > 90) {
      analysis.predictedIssues.push({
        issue: 'Robot fatigue due to high utilization',
        probability: 0.3,
        mitigation: 'Schedule maintenance break after this task'
      });
    }

    if (task.complexity === TaskComplexity.ADVANCED) {
      analysis.predictedIssues.push({
        issue: 'Complex task may require additional time',
        probability: 0.4,
        mitigation: 'Allow 20% buffer time and enable learning mode'
      });
    }

    // Performance prediction
    const baseTime = task.estimatedDuration || 300; // 5 minutes default
    const robotEfficiency = robot.performanceMetrics.efficiency / 100;
    analysis.performancePrediction.estimatedTime = Math.round(baseTime / robotEfficiency);

    // Confidence level based on robot experience
    const taskExperience = robot.taskExperience?.[task.type] || 0;
    analysis.performancePrediction.confidenceLevel = Math.min(0.95, 0.6 + (taskExperience * 0.05));

    // Risk factors
    if (robot.batteryLevel < 30) {
      analysis.performancePrediction.riskFactors.push('Low battery level');
    }

    if (task.requiresHumanCollaboration) {
      analysis.performancePrediction.riskFactors.push('Human-robot coordination required');
    }

    return analysis;
  }

  // Task Execution
  async startTask(taskId: string): Promise<RobotTask> {
    const task = await this.getTaskById(taskId);

    if (!task.canStart()) {
      throw new BadRequestException('Task cannot be started in current state');
    }

    task.start();
    const updatedTask = await this.taskRepository.save(task);

    this.eventEmitter.emit('task.started', {
      taskId: task.id,
      robotId: task.robotId,
      taskName: task.name,
      robotName: task.robot?.name,
      timestamp: new Date()
    });

    this.logger.log(`Task started: ${task.name} on robot ${task.robot?.name}`);
    return updatedTask;
  }

  async pauseTask(taskId: string): Promise<RobotTask> {
    const task = await this.getTaskById(taskId);
    
    task.pause();
    const updatedTask = await this.taskRepository.save(task);

    if (task.robot) {
      task.robot.pauseTask();
      await this.robotRepository.save(task.robot);
    }

    this.eventEmitter.emit('task.paused', {
      taskId: task.id,
      robotId: task.robotId,
      taskName: task.name,
      timestamp: new Date()
    });

    this.logger.log(`Task paused: ${task.name}`);
    return updatedTask;
  }

  async resumeTask(taskId: string): Promise<RobotTask> {
    const task = await this.getTaskById(taskId);
    
    task.resume();
    const updatedTask = await this.taskRepository.save(task);

    if (task.robot) {
      task.robot.resumeTask();
      await this.robotRepository.save(task.robot);
    }

    this.eventEmitter.emit('task.resumed', {
      taskId: task.id,
      robotId: task.robotId,
      taskName: task.name,
      timestamp: new Date()
    });

    this.logger.log(`Task resumed: ${task.name}`);
    return updatedTask;
  }

  async completeTask(taskId: string, result: TaskResult): Promise<RobotTask> {
    const task = await this.getTaskById(taskId);
    
    task.complete(result);
    const updatedTask = await this.taskRepository.save(task);

    if (task.robot) {
      task.robot.completeTask();
      await this.robotRepository.save(task.robot);
    }

    this.eventEmitter.emit('task.completed', {
      taskId: task.id,
      robotId: task.robotId,
      taskName: task.name,
      duration: task.actualDuration,
      success: result.success,
      qualityScore: result.qualityScore,
      timestamp: new Date()
    });

    this.logger.log(`Task completed: ${task.name}, success: ${result.success}`);
    return updatedTask;
  }

  async failTask(taskId: string, reason: string): Promise<RobotTask> {
    const task = await this.getTaskById(taskId);
    
    task.fail(reason);
    const updatedTask = await this.taskRepository.save(task);

    if (task.robot) {
      task.robot.failTask(reason);
      await this.robotRepository.save(task.robot);
    }

    this.eventEmitter.emit('task.failed', {
      taskId: task.id,
      robotId: task.robotId,
      taskName: task.name,
      reason,
      timestamp: new Date()
    });

    this.logger.error(`Task failed: ${task.name}, reason: ${reason}`);
    return updatedTask;
  }

  // Collaboration Management
  async requestCollaboration(request: CollaborationRequest): Promise<Robot[]> {
    const primaryRobot = await this.getRobotById(request.primaryRobotId);
    const availableRobots = await this.getAvailableRobots();

    // Filter suitable collaboration partners
    const suitableRobots = availableRobots.filter(robot => {
      // Don't include the primary robot
      if (robot.id === request.primaryRobotId) return false;

      // Check if robot has required capabilities
      if (request.requiredCapabilities) {
        const hasCapabilities = request.requiredCapabilities.every(capability => {
          // Simple capability check - in real implementation, this would be more sophisticated
          return robot.capabilities.specialCapabilities?.includes(capability);
        });
        if (!hasCapabilities) return false;
      }

      // Check distance constraint
      if (request.maxDistance && primaryRobot.position && robot.position) {
        const distance = this.calculateDistance(primaryRobot.position, robot.position);
        if (distance > request.maxDistance) return false;
      }

      // Check preferred robots
      if (request.preferredRobots && request.preferredRobots.length > 0) {
        return request.preferredRobots.includes(robot.id);
      }

      return true;
    });

    // Sort by suitability score
    suitableRobots.sort((a, b) => {
      let scoreA = a.performanceMetrics.efficiency + a.performanceMetrics.accuracy;
      let scoreB = b.performanceMetrics.efficiency + b.performanceMetrics.accuracy;

      // Bonus for same work cell
      if (a.workCellId === primaryRobot.workCellId) scoreA += 20;
      if (b.workCellId === primaryRobot.workCellId) scoreB += 20;

      return scoreB - scoreA;
    });

    this.eventEmitter.emit('collaboration.requested', {
      primaryRobotId: request.primaryRobotId,
      taskId: request.taskId,
      candidateRobots: suitableRobots.length,
      timestamp: new Date()
    });

    return suitableRobots;
  }

  private calculateDistance(pos1: Position3D, pos2: Position3D): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Analytics and Metrics
  async getShopFloorMetrics(): Promise<ShopFloorMetrics> {
    const [
      allRobots,
      allWorkCells,
      allTasks,
      activeTasks,
      completedTasks,
      failedTasks
    ] = await Promise.all([
      this.robotRepository.find(),
      this.workCellRepository.find(),
      this.taskRepository.find(),
      this.taskRepository.find({ where: { status: In([TaskStatus.IN_PROGRESS, TaskStatus.ASSIGNED]) } }),
      this.taskRepository.find({ where: { status: TaskStatus.COMPLETED } }),
      this.taskRepository.find({ where: { status: TaskStatus.FAILED } })
    ]);

    const activeRobots = allRobots.filter(r => r.isOnline && r.isAvailable);
    const idleRobots = allRobots.filter(r => r.isOnline && r.state === RobotState.IDLE);
    const activeWorkCells = allWorkCells.filter(wc => wc.status === WorkCellStatus.RUNNING);

    // Calculate averages
    const totalTaskTime = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
    const averageTaskTime = completedTasks.length > 0 ? totalTaskTime / completedTasks.length : 0;

    const totalEfficiency = allRobots.reduce((sum, robot) => sum + robot.performanceMetrics.efficiency, 0);
    const overallEfficiency = allRobots.length > 0 ? totalEfficiency / allRobots.length : 0;

    const totalEnergyConsumption = allRobots.reduce((sum, robot) => sum + (robot.energyConsumed || 0), 0);

    const totalQuality = allRobots.reduce((sum, robot) => sum + robot.performanceMetrics.qualityScore, 0);
    const qualityScore = allRobots.length > 0 ? totalQuality / allRobots.length : 0;

    return {
      totalRobots: allRobots.length,
      activeRobots: activeRobots.length,
      idleRobots: idleRobots.length,
      robotUtilization: allRobots.length > 0 ? (activeRobots.length / allRobots.length) * 100 : 0,
      totalWorkCells: allWorkCells.length,
      activeWorkCells: activeWorkCells.length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      averageTaskTime,
      overallEfficiency,
      safetyIncidents: 0, // Would be tracked separately
      energyConsumption: totalEnergyConsumption,
      qualityScore
    };
  }

  // Scheduled Operations
  @Cron(CronExpression.EVERY_5_MINUTES)
  async performHealthChecks(): Promise<void> {
    try {
      const robots = await this.robotRepository.find({
        where: { isOnline: true }
      });

      for (const robot of robots) {
        const healthScore = robot.getHealthScore();
        
        if (healthScore < 50) {
          this.logger.warn(`Robot ${robot.name} health score is low: ${healthScore}`);
          
          this.eventEmitter.emit('robot.health_warning', {
            robotId: robot.id,
            name: robot.name,
            healthScore,
            timestamp: new Date()
          });
        }

        // Update performance metrics
        robot.performanceMetrics.uptime = Math.min(100, robot.performanceMetrics.uptime + 0.1);
        
        // Simulate battery drain
        if (robot.state === RobotState.WORKING) {
          robot.batteryLevel = Math.max(0, robot.batteryLevel - 1);
        }

        await this.robotRepository.save(robot);
      }

      this.logger.debug(`Health checks completed for ${robots.length} robots`);
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async optimizeTaskScheduling(): Promise<void> {
    try {
      const pendingTasks = await this.getPendingTasks();
      
      for (const task of pendingTasks) {
        // Try to assign high priority tasks first
        if (task.priority === TaskPriority.EMERGENCY || task.priority === TaskPriority.CRITICAL) {
          const result = await this.assignTask(task.id);
          if (result.success) {
            this.logger.log(`Auto-assigned high priority task: ${task.name}`);
          }
        }
      }

      this.logger.debug(`Task scheduling optimization completed`);
    } catch (error) {
      this.logger.error(`Task scheduling optimization failed: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateMetrics(): Promise<void> {
    try {
      const workCells = await this.workCellRepository.find({
        relations: ['robots', 'tasks']
      });

      for (const workCell of workCells) {
        const completedTasks = workCell.tasks?.filter(t => t.status === TaskStatus.COMPLETED) || [];
        const totalDuration = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
        
        if (completedTasks.length > 0) {
          workCell.productionMetrics.averageCycleTime = totalDuration / completedTasks.length;
          workCell.productionMetrics.throughput = completedTasks.length / 24; // tasks per hour
        }

        await this.workCellRepository.save(workCell);
      }

      this.logger.debug(`Metrics updated for ${workCells.length} work cells`);
    } catch (error) {
      this.logger.error(`Metrics update failed: ${error.message}`);
    }
  }
}
