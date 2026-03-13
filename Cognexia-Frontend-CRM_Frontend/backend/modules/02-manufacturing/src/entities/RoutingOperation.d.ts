import { Routing } from './Routing';
import { WorkCenter } from './WorkCenter';
export declare enum OperationType {
    SETUP = "setup",
    PROCESS = "process",
    INSPECTION = "inspection",
    MOVE = "move",
    WAIT = "wait",
    STORAGE = "storage",
    REWORK = "rework",
    SUBCONTRACT = "subcontract"
}
export declare enum OperationStatus {
    PLANNED = "planned",
    READY = "ready",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ON_HOLD = "on_hold",
    CANCELLED = "cancelled",
    SKIPPED = "skipped"
}
export declare enum OperationPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    URGENT = "urgent"
}
export declare class RoutingOperation {
    id: string;
    sequenceNumber: number;
    operationCode: string;
    operationName: string;
    description: string;
    operationType: OperationType;
    status: OperationStatus;
    priority: OperationPriority;
    setupTime: number;
    processTime: number;
    teardownTime: number;
    waitTime: number;
    moveTime: number;
    queueTime: number;
    laborCost: number;
    machineCost: number;
    materialCost: number;
    overheadCost: number;
    totalCost: number;
    standardQuantity: number;
    lotQuantity: number;
    efficiency: number;
    yieldRate: number;
    scrapRate: number;
    isCritical: boolean;
    isOptional: boolean;
    allowParallel: boolean;
    requiresOperator: boolean;
    operatorCount: number;
    skillRequirements: {
        skillLevel: string;
        certifications: string[];
        experience: number;
        training: string[];
    };
    hasQualityCheck: boolean;
    qualityParameters: {
        inspectionPoints: string[];
        tolerances: object;
        testProcedures: string[];
        acceptanceCriteria: string;
        samplingPlan: object;
    };
    toolRequirements: {
        tools: string[];
        fixtures: string[];
        gauges: string[];
        consumables: string[];
    };
    materialRequirements: {
        materials: object[];
        consumables: object[];
        lubricants: string[];
        cleaningMaterials: string[];
    };
    isAutomated: boolean;
    hasRobotAssistance: boolean;
    hasAiOptimization: boolean;
    hasDigitalTwin: boolean;
    hasVisionSystem: boolean;
    hasVoiceControl: boolean;
    hasAugmentedReality: boolean;
    aiConfiguration: {
        models: string[];
        algorithms: string[];
        optimization: object;
        predictiveAnalytics: boolean;
        adaptiveLearning: boolean;
    };
    iotConfiguration: {
        sensors: string[];
        dataPoints: string[];
        monitoringFrequency: number;
        alerts: object[];
    };
    environmentalImpact: {
        energyConsumption: number;
        emissions: number;
        wasteGeneration: number;
        noiseLevel: number;
        vibration: number;
    };
    safetyRequirements: {
        hazards: string[];
        ppe: string[];
        safetyProcedures: string[];
        riskAssessment: object;
        emergencyProcedures: string[];
    };
    workInstructions: {
        stepByStep: string[];
        images: string[];
        videos: string[];
        documents: string[];
        specifications: object;
    };
    performanceMetrics: {
        actualTime: number;
        actualCost: number;
        actualYield: number;
        defectRate: number;
        efficiency: number;
        utilization: number;
    };
    dependencies: {
        predecessors: string[];
        successors: string[];
        constraints: object[];
        bufferTime: number;
    };
    routingId: string;
    routing: Routing;
    workCenterId: string;
    workCenter: WorkCenter;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    getTotalTime(): number;
    getCycleTime(): number;
    getThroughputTime(): number;
    calculateResourceUtilization(): number;
    estimateCost(quantity?: number): number;
    validateOperation(): string[];
    canRunInParallel(otherOperation: RoutingOperation): boolean;
    isReady(): boolean;
    getEstimatedDuration(quantity?: number): number;
    clone(newSequenceNumber: number): Partial<RoutingOperation>;
}
//# sourceMappingURL=RoutingOperation.d.ts.map