import { ProductionLine } from './ProductionLine';
import { BillOfMaterials } from './BillOfMaterials';
import { WorkOrder } from './WorkOrder';
import { ProductionSchedule } from './ProductionSchedule';
export declare enum ProductionOrderStatus {
    PLANNED = "planned",
    RELEASED = "released",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    PARTIALLY_COMPLETED = "partially_completed"
}
export declare enum ProductionOrderPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum ProductionOrderType {
    MAKE_TO_STOCK = "make_to_stock",
    MAKE_TO_ORDER = "make_to_order",
    ENGINEER_TO_ORDER = "engineer_to_order",
    ASSEMBLE_TO_ORDER = "assemble_to_order",
    REWORK = "rework",
    PROTOTYPE = "prototype"
}
export declare class ProductionOrder {
    id: string;
    orderNumber: string;
    name: string;
    description: string;
    orderType: ProductionOrderType;
    status: ProductionOrderStatus;
    priority: ProductionOrderPriority;
    productId: string;
    productSku: string;
    productName: string;
    productVersion: string;
    plannedQuantity: number;
    producedQuantity: number;
    goodQuantity: number;
    scrapQuantity: number;
    reworkQuantity: number;
    unit: string;
    scheduledStartDate: Date;
    scheduledEndDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    estimatedDuration: number;
    actualDuration: number;
    productionLineId: string;
    productionLine: ProductionLine;
    billOfMaterialsId: string;
    billOfMaterials: BillOfMaterials;
    estimatedCost: number;
    actualCost: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    currency: string;
    customerId: string;
    customerName: string;
    salesOrderId: string;
    customerOrderNumber: string;
    requestedDeliveryDate: Date;
    promisedDeliveryDate: Date;
    qualityRequirements: {
        standard: string;
        inspectionRequired: boolean;
        testingRequired: boolean;
        certificationRequired: boolean;
        qualityPlan: string;
        acceptanceCriteria: string[];
    };
    qualityScore: number;
    firstPassYield: number;
    qualityIssues: {
        issueId: string;
        type: string;
        description: string;
        severity: string;
        status: string;
        createdDate: Date;
        resolvedDate: Date;
    }[];
    productionPlan: {
        phases: {
            phase: string;
            workCenter: string;
            scheduledStart: Date;
            scheduledEnd: Date;
            actualStart: Date;
            actualEnd: Date;
            status: string;
        }[];
        dependencies: {
            dependsOn: string;
            type: string;
            delay: number;
        }[];
        criticalPath: string[];
    };
    materialRequirements: {
        componentId: string;
        componentSku: string;
        componentName: string;
        requiredQuantity: number;
        allocatedQuantity: number;
        consumedQuantity: number;
        unit: string;
        status: string;
        reservationId: string;
    }[];
    materialAvailability: {
        available: boolean;
        shortages: {
            componentId: string;
            shortQuantity: number;
            expectedDate: Date;
        }[];
        lastChecked: Date;
    };
    realTimeTracking: {
        enabled: boolean;
        iotDevices: {
            deviceId: string;
            type: string;
            location: string;
            status: string;
            lastReading: Date;
        }[];
        currentMetrics: {
            efficiency: number;
            throughput: number;
            temperature: number;
            vibration: number;
            energy: number;
            timestamp: Date;
        };
    };
    aiOptimization: {
        recommendations: {
            type: string;
            description: string;
            impact: string;
            confidence: number;
            implemented: boolean;
        }[];
        predictions: {
            completionTime: Date;
            quality: number;
            efficiency: number;
            cost: number;
            confidence: number;
        };
        anomalies: {
            detected: boolean;
            type: string;
            severity: string;
            timestamp: Date;
            action: string;
        }[];
        lastAnalysis: Date;
    };
    digitalTwin: {
        id: string;
        enabled: boolean;
        simulationResults: {
            scenario: string;
            efficiency: number;
            quality: number;
            cost: number;
            duration: number;
            risks: string[];
        }[];
        realTimeSync: boolean;
        lastSync: Date;
    };
    humanAiCollaboration: {
        aiAssistance: {
            enabled: boolean;
            level: string;
            recommendations: string[];
            decisions: {
                decision: string;
                reason: string;
                humanApproved: boolean;
                timestamp: Date;
            }[];
        };
        operatorFeedback: {
            rating: number;
            comments: string;
            suggestions: string[];
            timestamp: Date;
        }[];
    };
    sustainabilityMetrics: {
        energyConsumption: number;
        carbonFootprint: number;
        wasteGeneration: number;
        waterUsage: number;
        materialRecycling: number;
        sustainabilityScore: number;
    };
    environmentalCompliance: {
        regulations: {
            regulation: string;
            status: string;
            compliance: boolean;
            lastAudit: Date;
        }[];
        certificates: {
            type: string;
            number: string;
            validUntil: Date;
        }[];
    };
    riskAssessment: {
        risks: {
            type: string;
            description: string;
            probability: number;
            impact: string;
            mitigation: string;
            status: string;
        }[];
        overallRiskScore: number;
        lastAssessment: Date;
    };
    performanceMetrics: {
        oee: number;
        availability: number;
        performance: number;
        quality: number;
        throughput: number;
        cycleTime: number;
        setupTime: number;
        downtime: number;
    };
    approvalWorkflow: {
        currentStage: string;
        approvals: {
            stage: string;
            approver: string;
            status: string;
            date: Date;
            comments: string;
        }[];
        requiredApprovals: string[];
    };
    changeHistory: {
        changeId: string;
        date: Date;
        type: string;
        description: string;
        changedBy: string;
        approvedBy: string;
        impact: string;
        reason: string;
    }[];
    workOrders: WorkOrder[];
    productionSchedule: ProductionSchedule;
    productionScheduleId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    approvedBy: string;
    approvedAt: Date;
    isActive(): boolean;
    isCompleted(): boolean;
    getCompletionPercentage(): number;
    getRemainingQuantity(): number;
    getYieldPercentage(): number;
    getScrapPercentage(): number;
    isOnSchedule(): boolean;
    private calculateSchedulePercentage;
    getCostVariance(): number;
    getCostVariancePercentage(): number;
    getScheduleVariance(): number;
    getScheduleVarianceDays(): number;
    canStart(): boolean;
    needsAttention(): boolean;
    getPrioritizedRisks(): any[];
    private getImpactWeight;
    getEstimatedCompletionDate(): Date;
    getQualityRating(): string;
    getSustainabilityRating(): string;
    validateOrder(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=ProductionOrder.d.ts.map