import { RobotTask } from './robot-task.entity';
export declare enum StepType {
    MOVE = "move",
    PICK = "pick",
    PLACE = "place",
    WELD = "weld",
    PAINT = "paint",
    INSPECT = "inspect",
    MACHINE = "machine",
    WAIT = "wait",
    SYNCHRONIZE = "synchronize",
    VALIDATE = "validate",
    SCAN = "scan",
    MEASURE = "measure",
    CALIBRATE = "calibrate",
    LEARN = "learn",
    ADAPT = "adapt",
    CUSTOM = "custom"
}
export declare enum StepStatus {
    PENDING = "pending",
    READY = "ready",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    SKIPPED = "skipped",
    PAUSED = "paused",
    CANCELLED = "cancelled"
}
export declare enum InteractionType {
    NONE = "none",
    HUMAN_SUPERVISION = "human_supervision",
    HUMAN_ASSISTANCE = "human_assistance",
    HUMAN_APPROVAL = "human_approval",
    ROBOT_COORDINATION = "robot_coordination",
    SYSTEM_INTEGRATION = "system_integration"
}
export interface StepPosition {
    x: number;
    y: number;
    z: number;
    rx?: number;
    ry?: number;
    rz?: number;
}
export interface StepParameters {
    speed?: number;
    acceleration?: number;
    deceleration?: number;
    precision?: number;
    startPosition?: StepPosition;
    endPosition?: StepPosition;
    waypoints?: StepPosition[];
    toolId?: string;
    toolSpeed?: number;
    toolForce?: number;
    toolSettings?: Record<string, any>;
    safetyZone?: string;
    maxForce?: number;
    maxTorque?: number;
    collisionSensitivity?: number;
    tolerances?: Record<string, number>;
    inspectionCriteria?: Record<string, any>;
    measurementPoints?: StepPosition[];
    dwellTime?: number;
    timeout?: number;
    waitForSignal?: string;
    sendSignal?: string;
    syncWithSteps?: string[];
    adaptationEnabled?: boolean;
    learningMode?: boolean;
    modelParameters?: Record<string, any>;
    requiresCleanRoom?: boolean;
    temperatureRange?: {
        min: number;
        max: number;
    };
    humidityRange?: {
        min: number;
        max: number;
    };
}
export interface StepResult {
    success: boolean;
    executionTime: number;
    actualStartPosition?: StepPosition;
    actualEndPosition?: StepPosition;
    positionError?: number;
    measurements?: Record<string, number>;
    inspectionResult?: 'pass' | 'fail' | 'warning';
    qualityScore?: number;
    actualSpeed?: number;
    actualForce?: number;
    energyConsumed?: number;
    capturedImages?: string[];
    sensorData?: Record<string, any>;
    toolData?: Record<string, any>;
    errors?: string[];
    warnings?: string[];
    adaptationData?: Record<string, any>;
    performanceMetrics?: Record<string, number>;
}
export interface ValidationCriteria {
    positionTolerance?: number;
    orientationTolerance?: number;
    forceTolerance?: number;
    speedTolerance?: number;
    timingTolerance?: number;
    qualityThreshold?: number;
    customValidations?: Array<{
        parameter: string;
        expectedValue: any;
        tolerance: number;
        units: string;
    }>;
}
export declare class TaskStep {
    id: string;
    name: string;
    description?: string;
    instructions?: string;
    type: StepType;
    status: StepStatus;
    interactionType: InteractionType;
    task: RobotTask;
    taskId: string;
    stepOrder: number;
    dependsOnSteps?: string[];
    blocksSteps?: string[];
    isParallel: boolean;
    isCritical: boolean;
    isOptional: boolean;
    parameters: StepParameters;
    result?: StepResult;
    validationCriteria?: ValidationCriteria;
    estimatedDuration?: number;
    actualDuration?: number;
    startedAt?: Date;
    completedAt?: Date;
    scheduledAt?: Date;
    retryCount: number;
    maxRetries: number;
    errors?: string[];
    warnings?: string[];
    qualityScore?: number;
    positionAccuracy?: number;
    speedAccuracy?: number;
    forceAccuracy?: number;
    requiredToolId?: string;
    requiredEquipmentId?: string;
    toolConfiguration?: Record<string, any>;
    safetyRequirements?: string[];
    requiresSafetyStop: boolean;
    requiresOperatorPresence: boolean;
    requiresApproval: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    humanInteractionDuration?: number;
    assignedOperatorId?: string;
    humanInstructions?: Record<string, any>;
    enableLearning: boolean;
    hasBeenOptimized: boolean;
    learningData?: Record<string, any>;
    adaptationHistory?: Array<{
        timestamp: Date;
        parameter: string;
        oldValue: any;
        newValue: any;
        improvement: number;
    }>;
    energyConsumed?: number;
    efficiency?: number;
    cycleTime?: number;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
    isSimulated: boolean;
    requiresCalibration: boolean;
    hasDigitalTwin: boolean;
    isReversible: boolean;
    canBeParallelized: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    validateStep(): void;
    canStart(): boolean;
    areDependenciesMet(): boolean;
    isApproved(): boolean;
    isCompleted(): boolean;
    isFailed(): boolean;
    canRetry(): boolean;
    isOverdue(): boolean;
    getExecutionProgress(): number;
    getRemainingTime(): number;
    start(): void;
    pause(): void;
    resume(): void;
    complete(result: StepResult): void;
    fail(reason: string): void;
    skip(reason?: string): void;
    cancel(reason?: string): void;
    retry(): void;
    addError(error: string): void;
    addWarning(warning: string): void;
    clearErrors(): void;
    clearWarnings(): void;
    approve(approvedBy: string): void;
    recordLearning(learningData: Record<string, any>): void;
    recordAdaptation(parameter: string, oldValue: any, newValue: any, improvement: number): void;
    updateParameters(newParameters: Partial<StepParameters>): void;
    validateResult(): boolean;
    getEfficiencyScore(): number;
    getQualityScore(): number;
    getStepSummary(): Record<string, any>;
}
//# sourceMappingURL=task-step.entity.d.ts.map