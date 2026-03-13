import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Robot, RobotType, RobotCapabilities, Position3D, SafetyConfiguration, AILearningProfile } from '../entities/robot.entity';
import { WorkCell, WorkCellType, WorkCellCapability, LayoutConfiguration } from '../entities/work-cell.entity';
import { RobotTask, TaskType, TaskStatus, TaskPriority, TaskComplexity, TaskRequirements, TaskParameters, TaskResult } from '../entities/robot-task.entity';
import { TaskStep, StepType, InteractionType, StepParameters, ValidationCriteria } from '../entities/task-step.entity';
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
    maxDistance?: number;
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
export declare class ShopFloorControlService {
    private readonly robotRepository;
    private readonly workCellRepository;
    private readonly taskRepository;
    private readonly stepRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(robotRepository: Repository<Robot>, workCellRepository: Repository<WorkCell>, taskRepository: Repository<RobotTask>, stepRepository: Repository<TaskStep>, eventEmitter: EventEmitter2);
    createRobot(createRobotDto: CreateRobotDto): Promise<Robot>;
    getRobotById(id: string): Promise<Robot>;
    getAllRobots(): Promise<Robot[]>;
    getAvailableRobots(): Promise<Robot[]>;
    activateRobot(robotId: string): Promise<Robot>;
    deactivateRobot(robotId: string, reason?: string): Promise<Robot>;
    emergencyStopRobot(robotId: string, reason: string): Promise<Robot>;
    createWorkCell(createWorkCellDto: CreateWorkCellDto): Promise<WorkCell>;
    getWorkCellById(id: string): Promise<WorkCell>;
    getAllWorkCells(): Promise<WorkCell[]>;
    activateWorkCell(workCellId: string): Promise<WorkCell>;
    emergencyStopWorkCell(workCellId: string, reason: string): Promise<WorkCell>;
    createTask(createTaskDto: CreateTaskDto): Promise<RobotTask>;
    getTaskById(id: string): Promise<RobotTask>;
    getAllTasks(): Promise<RobotTask[]>;
    getTasksByStatus(status: TaskStatus): Promise<RobotTask[]>;
    getPendingTasks(): Promise<RobotTask[]>;
    getActiveTasks(): Promise<RobotTask[]>;
    assignTask(taskId: string, robotId?: string): Promise<TaskAssignmentResult>;
    private selectOptimalRobot;
    private isRobotSuitableForTask;
    private calculateRobotTaskScore;
    private generateTaskAIAnalysis;
    startTask(taskId: string): Promise<RobotTask>;
    pauseTask(taskId: string): Promise<RobotTask>;
    resumeTask(taskId: string): Promise<RobotTask>;
    completeTask(taskId: string, result: TaskResult): Promise<RobotTask>;
    failTask(taskId: string, reason: string): Promise<RobotTask>;
    requestCollaboration(request: CollaborationRequest): Promise<Robot[]>;
    private calculateDistance;
    getShopFloorMetrics(): Promise<ShopFloorMetrics>;
    performHealthChecks(): Promise<void>;
    optimizeTaskScheduling(): Promise<void>;
    updateMetrics(): Promise<void>;
}
//# sourceMappingURL=shop-floor-control.service.d.ts.map