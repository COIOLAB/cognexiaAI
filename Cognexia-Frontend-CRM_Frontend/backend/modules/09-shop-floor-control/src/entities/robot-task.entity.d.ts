import { Robot } from './robot.entity';
import { WorkCell } from './work-cell.entity';
import { TaskStep } from './task-step.entity';
export declare enum TaskType {
    PICK_AND_PLACE = "pick_and_place",
    ASSEMBLY = "assembly",
    WELDING = "welding",
    PAINTING = "painting",
    INSPECTION = "inspection",
    MACHINING = "machining",
    PACKAGING = "packaging",
    MATERIAL_HANDLING = "material_handling",
    QUALITY_CHECK = "quality_check",
    CALIBRATION = "calibration",
    MAINTENANCE = "maintenance",
    LEARNING = "learning",
    COLLABORATIVE = "collaborative",
    CUSTOM = "custom"
}
export declare enum TaskPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export declare enum TaskStatus {
    PENDING = "pending",
    QUEUED = "queued",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
export declare enum TaskComplexity {
    SIMPLE = "simple",
    MODERATE = "moderate",
    COMPLEX = "complex",
    ADVANCED = "advanced"
}
export interface TaskRequirements {
    minPayloadKg?: number;
    minReachMm?: number;
    minAxes?: number;
    maxSpeed?: number;
    requiredPrecision?: number;
    visionRequired?: boolean;
    forceSensingRequired?: boolean;
    collaborativeMode?: boolean;
    aiCapabilitiesRequired?: string[];
    cleanRoomLevel?: string;
    temperatureRange?: {
        min: number;
        max: number;
    };
    humidityRange?: {
        min: number;
        max: number;
    };
    requiredCertifications?: string[];
    minimumExperience?: number;
    safetyLevel?: string;
}
export interface TaskParameters {
    maxExecutionTime?: number;
    retryCount?: number;
    timeoutThreshold?: number;
    tolerances?: Record<string, number>;
    qualityCheckpoints?: string[];
    acceptanceCriteria?: Record<string, any>;
    targetCycleTime?: number;
    energyConstraints?: number;
    humanInteractionPoints?: Array<{
        stepId: string;
        interactionType: string;
        duration: number;
        instructions: string;
    }>;
    safetyZones?: string[];
    emergencyProcedures?: string[];
    riskAssessment?: {
        level: string;
        mitigationStrategies: string[];
    };
    learningEnabled?: boolean;
    adaptationLevel?: number;
    modelParameters?: Record<string, any>;
}
export interface TaskResult {
    success: boolean;
    completionTime: number;
    qualityScore?: number;
    defectsFound?: number;
    energyConsumed?: number;
    cycleTime: number;
    accuracy: number;
    precision: number;
    qualityMetrics?: Record<string, number>;
    inspectionResults?: Array<{
        checkpoint: string;
        status: 'pass' | 'fail' | 'warning';
        value?: number;
        specification?: number;
    }>;
    outputData?: Record<string, any>;
    images?: string[];
    measurements?: Record<string, number>;
    errors?: string[];
    warnings?: string[];
    learningData?: Record<string, any>;
    improvementSuggestions?: string[];
}
export interface AIAnalysis {
    optimizationSuggestions: string[];
    predictedIssues: Array<{
        issue: string;
        probability: number;
        mitigation: string;
    }>;
    performancePrediction: {
        estimatedTime: number;
        confidenceLevel: number;
        riskFactors: string[];
    };
    learningInsights: Record<string, any>;
}
export declare class RobotTask {
    id: string;
    name: string;
    description?: string;
    type: TaskType;
    priority: TaskPriority;
    status: TaskStatus;
    complexity: TaskComplexity;
    robot?: Robot;
    robotId?: string;
    workCell?: WorkCell;
    workCellId?: string;
    steps: TaskStep[];
    requirements: TaskRequirements;
    parameters: TaskParameters;
    result?: TaskResult;
    aiAnalysis?: AIAnalysis;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    remainingTime?: number;
    currentStepIndex: number;
    progressPercentage: number;
    stepsCompleted: number;
    totalSteps: number;
    retryCount: number;
    maxRetries: number;
    errors?: string[];
    warnings?: string[];
    qualityScore?: number;
    energyConsumed?: number;
    cycleTime?: number;
    accuracy?: number;
    precision?: number;
    productId?: string;
    batchId?: string;
    orderId?: string;
    customerId?: string;
    quantity?: number;
    partNumber?: string;
    dependsOnTasks?: string[];
    blockedTasks?: string[];
    parentTaskId?: string;
    subtaskIds?: string[];
    assignedOperatorId?: string;
    collaboratingRobotIds?: string[];
    requiresHumanCollaboration: boolean;
    requiresMultipleRobots: boolean;
    enableLearning: boolean;
    isOptimized: boolean;
    learningData?: Record<string, any>;
    optimizationHistory?: Array<{
        timestamp: Date;
        parameter: string;
        oldValue: any;
        newValue: any;
        improvement: number;
    }>;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
    isUrgent: boolean;
    isRepeatable: boolean;
    isTemplate: boolean;
    requiresApproval: boolean;
    isSimulated: boolean;
    hasDigitalTwin: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    approvedBy?: string;
    approvedAt?: Date;
    updateProgress(): void;
    canStart(): boolean;
    hasUnresolvedDependencies(): boolean;
    isCompleted(): boolean;
    isFailed(): boolean;
    canRetry(): boolean;
    isOverdue(): boolean;
    getEstimatedCompletion(): Date | null;
    getRemainingTime(): number;
    start(): void;
    pause(): void;
    resume(): void;
    complete(result: TaskResult): void;
    fail(reason: string): void;
    cancel(reason?: string): void;
    retry(): void;
    addError(error: string): void;
    addWarning(warning: string): void;
    clearErrors(): void;
    clearWarnings(): void;
    updateAIAnalysis(analysis: Partial<AIAnalysis>): void;
    recordLearning(learningData: Record<string, any>): void;
    recordOptimization(parameter: string, oldValue: any, newValue: any, improvement: number): void;
    getEfficiencyScore(): number;
    getQualityScore(): number;
    getPriorityScore(): number;
    getTaskSummary(): Record<string, any>;
}
//# sourceMappingURL=robot-task.entity.d.ts.map