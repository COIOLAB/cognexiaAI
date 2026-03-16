import { BOMComponent } from './BOMComponent';
import { ProductionOrder } from './ProductionOrder';
import { Routing } from './Routing';
export declare enum BOMStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
    OBSOLETE = "obsolete",
    UNDER_REVIEW = "under_review"
}
export declare enum BOMType {
    MANUFACTURING = "manufacturing",
    ENGINEERING = "engineering",
    SALES = "sales",
    COSTING = "costing",
    PLANNING = "planning"
}
export declare enum RevisionStatus {
    CURRENT = "current",
    PREVIOUS = "previous",
    PENDING = "pending",
    REJECTED = "rejected"
}
export declare class BillOfMaterials {
    id: string;
    bomNumber: string;
    name: string;
    description: string;
    productId: string;
    productSku: string;
    productName: string;
    type: BOMType;
    status: BOMStatus;
    version: string;
    revisionStatus: RevisionStatus;
    effectiveDate: Date;
    obsoleteDate: Date;
    lastReviewDate: Date;
    nextReviewDate: Date;
    baseQuantity: number;
    baseUnit: string;
    totalCost: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    manufacturingLeadTime: number;
    setupTime: number;
    cycleTime: number;
    scrapFactor: number;
    yieldFactor: number;
    productionRequirements: {
        facility: string;
        productionLine: string;
        workCenter: string;
        skillRequirements: string[];
        equipmentRequired: string[];
        toolsRequired: string[];
        certificationRequired: boolean;
    };
    qualityRequirements: {
        standard: string;
        inspectionPoints: string[];
        testingRequired: boolean;
        certificationNeeded: boolean;
        documentationRequired: string[];
    };
    complianceRequirements: {
        regulation: string;
        requirement: string;
        documentation: string;
        auditRequired: boolean;
    }[];
    alternativeBOMs: {
        id: string;
        name: string;
        reason: string;
        costDifference: number;
        leadTimeDifference: number;
        qualityImpact: string;
    }[];
    configurationOptions: {
        option: string;
        value: string;
        impact: string;
        additionalCost: number;
    }[];
    aiOptimization: {
        costOptimization: {
            currentCost: number;
            optimizedCost: number;
            potentialSavings: number;
            recommendations: string[];
            lastAnalysis: Date;
        };
        sustainabilityScore: {
            score: number;
            carbonFootprint: number;
            recyclabilityRating: number;
            recommendations: string[];
        };
        riskAnalysis: {
            supplyRisk: number;
            qualityRisk: number;
            costVolatility: number;
            mitigation: string[];
        };
    };
    digitalTwinData: {
        id: string;
        simulationResults: {
            efficiency: number;
            quality: number;
            cost: number;
            leadTime: number;
        };
        lastSimulation: Date;
        predictiveInsights: string[];
    };
    sustainabilityMetrics: {
        carbonFootprint: number;
        energyConsumption: number;
        waterUsage: number;
        wasteGeneration: number;
        recyclabilityScore: number;
        sustainabilityRating: string;
    };
    supplyChainData: {
        criticalComponents: string[];
        supplierDependency: {
            componentId: string;
            supplierId: string;
            riskLevel: string;
            alternativeSuppliers: number;
        }[];
        leadTimeAnalysis: {
            shortest: number;
            longest: number;
            average: number;
            variability: number;
        };
    };
    changeHistory: {
        changeId: string;
        date: Date;
        reason: string;
        changedBy: string;
        impact: string;
        approvedBy: string;
        details: string;
    }[];
    approvalWorkflow: {
        currentStage: string;
        approvers: {
            role: string;
            userId: string;
            status: string;
            date: Date;
            comments: string;
        }[];
        requiredApprovals: string[];
    };
    components: BOMComponent[];
    productionOrders: ProductionOrder[];
    routings: Routing[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    approvedBy: string;
    approvedAt: Date;
    isActive(): boolean;
    isCurrent(): boolean;
    getTotalComponentCost(): number;
    calculateTotalLeadTime(): number;
    getCriticalPath(): string[];
    getSupplyRisk(): string;
    getSustainabilityRating(): string;
    requiresReview(): boolean;
    canBeProduced(): boolean;
    calculateMaterialVariance(actualCost: number): number;
    getOptimizationRecommendations(): string[];
    estimateProductionQuantity(availableComponents: Record<string, number>): number;
    validateBOM(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=BillOfMaterials.d.ts.map