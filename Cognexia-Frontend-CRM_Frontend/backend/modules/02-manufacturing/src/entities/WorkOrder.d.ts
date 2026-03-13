import { ProductionOrder } from './ProductionOrder';
import { WorkCenter } from './WorkCenter';
import { OperationLog } from './OperationLog';
export declare enum WorkOrderStatus {
    CREATED = "created",
    SCHEDULED = "scheduled",
    RELEASED = "released",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REWORK = "rework"
}
export declare enum WorkOrderType {
    PRODUCTION = "production",
    MAINTENANCE = "maintenance",
    SETUP = "setup",
    QUALITY_CHECK = "quality_check",
    REWORK = "rework",
    CLEANUP = "cleanup",
    CALIBRATION = "calibration"
}
export declare enum OperationType {
    MACHINING = "machining",
    ASSEMBLY = "assembly",
    WELDING = "welding",
    PAINTING = "painting",
    TESTING = "testing",
    INSPECTION = "inspection",
    PACKAGING = "packaging",
    MATERIAL_HANDLING = "material_handling"
}
export declare class WorkOrder {
    id: string;
    workOrderNumber: string;
    name: string;
    description: string;
    workOrderType: WorkOrderType;
    status: WorkOrderStatus;
    operationType: OperationType;
    priority: number;
    productionOrderId: string;
    productionOrder: ProductionOrder;
    workCenterId: string;
    workCenter: WorkCenter;
    sequenceNumber: number;
    parentWorkOrderId: string;
    dependencies: {
        workOrderId: string;
        type: string;
        delay: number;
    }[];
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    actualStartTime: Date;
    actualEndTime: Date;
    estimatedDuration: number;
    actualDuration: number;
    setupTime: number;
    cleanupTime: number;
    plannedQuantity: number;
    completedQuantity: number;
    scrappedQuantity: number;
    reworkQuantity: number;
    unit: string;
    requiredSkills: {
        skill: string;
        level: string;
        required: boolean;
        certified: boolean;
    }[];
    requiredTools: {
        toolId: string;
        toolName: string;
        quantity: number;
        duration: number;
        critical: boolean;
    }[];
    requiredMaterials: {
        materialId: string;
        materialSku: string;
        materialName: string;
        quantity: number;
        unit: string;
        allocated: boolean;
        batchLot: string;
    }[];
    requiredOperators: number;
    assignedOperators: number;
    workInstructions: {
        step: number;
        instruction: string;
        duration: number;
        critical: boolean;
        safetyNotes: string[];
        qualityCheckpoints: string[];
        mediaUrl: string;
    }[];
    safetyRequirements: {
        requirement: string;
        type: string;
        mandatory: boolean;
        notes: string;
    }[];
    qualityParameters: {
        parameter: string;
        targetValue: string;
        tolerance: string;
        unit: string;
        method: string;
        frequency: string;
        critical: boolean;
    }[];
    assignedOperators_detail: {
        operatorId: string;
        operatorName: string;
        role: string;
        skillLevel: string;
        assignedTime: Date;
        activeTime: number;
        efficiency: number;
    }[];
    estimatedCost: number;
    actualCost: number;
    laborCost: number;
    materialCost: number;
    overheadCost: number;
    qualityChecks: {
        checkId: string;
        parameter: string;
        actualValue: string;
        targetValue: string;
        tolerance: string;
        result: string;
        checkedBy: string;
        checkedAt: Date;
        notes: string;
    }[];
    qualityScore: number;
    qualityApproved: boolean;
    qualityApprovedBy: string;
    realTimeMetrics: {
        currentStep: number;
        progress: number;
        efficiency: number;
        throughput: number;
        temperature: number;
        pressure: number;
        vibration: number;
        energy: number;
        lastUpdate: Date;
    };
    iotIntegration: {
        sensors: {
            sensorId: string;
            type: string;
            location: string;
            currentValue: number;
            unit: string;
            status: string;
            lastReading: Date;
        }[];
        automated: boolean;
        controlSystemId: string;
    };
    aiAssistance: {
        enabled: boolean;
        recommendations: {
            type: string;
            description: string;
            confidence: number;
            implemented: boolean;
            timestamp: Date;
        }[];
        anomalyDetection: {
            anomalies: string[];
            riskScore: number;
            lastAnalysis: Date;
        };
        optimization: {
            suggestedSpeed: number;
            suggestedTemperature: number;
            suggestedSequence: number[];
            potentialTimeSaving: number;
        };
    };
    humanRobotCollaboration: {
        enabled: boolean;
        collaborativeRobots: {
            robotId: string;
            robotType: string;
            task: string;
            safetyZone: string;
            interactionMode: string;
        }[];
        safetyProtocols: {
            protocol: string;
            active: boolean;
            lastCheck: Date;
        }[];
    };
    performanceMetrics: {
        oee: number;
        availability: number;
        performance: number;
        quality: number;
        cycleTime: number;
        setupTime: number;
        downtime: number;
        throughputRate: number;
    };
    downtimeEvents: {
        eventId: string;
        startTime: Date;
        endTime: Date;
        duration: number;
        reason: string;
        category: string;
        impact: string;
        resolution: string;
    }[];
    environmentalMetrics: {
        energyConsumption: number;
        waterUsage: number;
        wasteGenerated: number;
        emissions: number;
        recycledMaterials: number;
    };
    changeHistory: {
        changeId: string;
        timestamp: Date;
        changedBy: string;
        field: string;
        oldValue: any;
        newValue: any;
        reason: string;
        approved: boolean;
    }[];
    operationLogs: OperationLog[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    startedBy: string;
    completedBy: string;
    isActive(): boolean;
    isCompleted(): boolean;
    canStart(): boolean;
    hasRequiredResources(): boolean;
    getCompletionPercentage(): number;
    getYieldPercentage(): number;
    getScrapRate(): number;
    getRemainingTime(): number;
    getEfficiency(): number;
    isOverdue(): boolean;
    getOverdueTime(): number;
    getTotalDowntime(): number;
    getAverageProcessingTime(): number;
    needsQualityInspection(): boolean;
    hasQualityIssues(): boolean;
    canRework(): boolean;
    getEnvironmentalImpactScore(): number;
    getCostVariance(): number;
    getCostVariancePercentage(): number;
    validateWorkOrder(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=WorkOrder.d.ts.map