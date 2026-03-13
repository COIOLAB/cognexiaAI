import { ProductionOrder } from './ProductionOrder';
import { ProductionLine } from './ProductionLine';
export declare enum ScheduleStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    FROZEN = "frozen",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REVISION_REQUIRED = "revision_required"
}
export declare enum SchedulePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    RUSH = "rush"
}
export declare enum SchedulingMethod {
    MANUAL = "manual",
    AUTOMATIC = "automatic",
    AI_OPTIMIZED = "ai_optimized",
    CONSTRAINT_BASED = "constraint_based",
    GENETIC_ALGORITHM = "genetic_algorithm"
}
export declare class ProductionSchedule {
    id: string;
    scheduleCode: string;
    scheduleName: string;
    description: string;
    status: ScheduleStatus;
    priority: SchedulePriority;
    schedulingMethod: SchedulingMethod;
    startDate: Date;
    endDate: Date;
    frozenDate: Date | null;
    lastOptimizedDate: Date;
    planningHorizonDays: number;
    bucketSizeHours: number;
    capacityConstraints: {
        workCenters: object[];
        resources: object[];
        materials: object[];
        labor: object[];
        tooling: object[];
    };
    schedulingConstraints: {
        dependencies: object[];
        precedenceRules: object[];
        setupConstraints: object[];
        qualityGates: object[];
        maintenanceWindows: object[];
    };
    overallUtilization: number;
    onTimeDeliveryRate: number;
    totalMakespan: number;
    averageFlowTime: number;
    totalLateness: number;
    numberOfJobs: number;
    numberOfSetups: number;
    optimizationResults: {
        algorithm: string;
        iterations: number;
        convergenceTime: number;
        improvementPercentage: number;
        objectives: object[];
        constraints: object[];
        kpis: object[];
    };
    isAiOptimized: boolean;
    aiConfiguration: {
        model: string;
        parameters: object;
        trainingData: string;
        confidence: number;
        learningEnabled: boolean;
        feedbackLoop: boolean;
    };
    schedulingParameters: {
        objectives: string[];
        weights: object;
        penalties: object;
        bufferTime: number;
        overlapAllowed: boolean;
        preemptionAllowed: boolean;
    };
    resourceAllocation: {
        workCenters: object[];
        operators: object[];
        tools: object[];
        materials: object[];
        energy: object[];
    };
    qualityIntegration: {
        inspectionSchedule: object[];
        qualityGates: object[];
        holdPoints: object[];
        reworkSchedule: object[];
    };
    maintenanceIntegration: {
        preventiveMaintenance: object[];
        predictiveMaintenance: object[];
        maintenanceWindows: object[];
        equipmentAvailability: object[];
    };
    simulationResults: {
        scenarios: object[];
        bestCase: object;
        worstCase: object;
        mostLikely: object;
        riskAnalysis: object;
    };
    hasDigitalTwin: boolean;
    digitalTwinData: {
        modelId: string;
        synchronization: boolean;
        realTimeUpdates: boolean;
        predictiveCapability: boolean;
    };
    environmentalImpact: {
        energyConsumption: number;
        carbonFootprint: number;
        wasteGeneration: number;
        sustainabilityScore: number;
    };
    riskAssessment: {
        risks: object[];
        mitigation: object[];
        contingencyPlans: object[];
        probability: object[];
        impact: object[];
    };
    collaboration: {
        stakeholders: string[];
        notifications: object[];
        approvals: object[];
        comments: object[];
        reviews: object[];
    };
    version: string;
    parentScheduleId: string;
    changeLog: {
        changes: object[];
        reasons: string[];
        approvals: object[];
        impact: object[];
    };
    externalIntegration: {
        erpSystem: string;
        mesSystem: string;
        apsSystem: string;
        wmsSystem: string;
        qmsSystem: string;
    };
    isRealTimeMonitoring: boolean;
    realTimeData: {
        lastUpdate: Date;
        progressTracking: object[];
        deviations: object[];
        alerts: object[];
        autoCorrections: object[];
    };
    productionLineId: string;
    productionLine: ProductionLine;
    productionOrders: ProductionOrder[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    approvedBy: string;
    approvedAt: Date;
    getDuration(): number;
    isActive(): boolean;
    isFrozen(): boolean;
    calculateUtilization(): number;
    calculateOnTimePerformance(): number;
    validateSchedule(): string[];
    detectResourceConflicts(): string[];
    checkCapacityConstraints(): string[];
    optimize(): object;
    freeze(): void;
    unfreeze(): void;
    createRevision(changes: object[]): Partial<ProductionSchedule>;
    private incrementVersion;
    generateScheduleReport(): object;
    canBeModified(): boolean;
    getSchedulingEfficiency(): number;
    getBottleneckAnalysis(): object;
}
//# sourceMappingURL=ProductionSchedule.d.ts.map