import { BillOfMaterials } from './BillOfMaterials';
export declare enum ComponentType {
    RAW_MATERIAL = "raw_material",
    COMPONENT = "component",
    SUB_ASSEMBLY = "sub_assembly",
    CONSUMABLE = "consumable",
    PACKAGING = "packaging",
    TOOL = "tool"
}
export declare enum ComponentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    OBSOLETE = "obsolete",
    SUBSTITUTE_AVAILABLE = "substitute_available"
}
export declare enum ConsumptionType {
    FIXED = "fixed",
    VARIABLE = "variable",
    BATCH = "batch",
    FORMULA_BASED = "formula_based"
}
export declare class BOMComponent {
    id: string;
    billOfMaterialsId: string;
    billOfMaterials: BillOfMaterials;
    componentId: string;
    componentSku: string;
    componentName: string;
    description: string;
    componentType: ComponentType;
    status: ComponentStatus;
    quantity: number;
    unit: string;
    consumptionType: ConsumptionType;
    scrapPercentage: number;
    allowancePercentage: number;
    unitCost: number;
    totalCost: number;
    currency: string;
    costLastUpdated: Date;
    leadTime: number;
    offset: number;
    isCriticalPath: boolean;
    sequenceNumber: number;
    primarySupplierId: string;
    primarySupplierName: string;
    alternativeSuppliers: {
        supplierId: string;
        supplierName: string;
        unitCost: number;
        leadTime: number;
        qualityRating: number;
        priority: number;
    }[];
    minimumOrderQuantity: number;
    economicOrderQuantity: number;
    specifications: {
        parameter: string;
        value: string;
        tolerance: string;
        unit: string;
        critical: boolean;
    }[];
    qualityRequirements: {
        standard: string;
        grade: string;
        certification: string;
        testingRequired: boolean;
        inspectionLevel: string;
    };
    materialProperties: {
        property: string;
        value: string;
        unit: string;
        testMethod: string;
    }[];
    processingInstructions: {
        operation: string;
        instruction: string;
        parameters: Record<string, any>;
        safety: string[];
        quality: string[];
    }[];
    handlingInstructions: {
        storage: string;
        handling: string;
        safety: string[];
        environmentalRequirements: string[];
    };
    substitutes: {
        componentId: string;
        componentSku: string;
        componentName: string;
        substitutionRatio: number;
        costDifference: number;
        qualityImpact: string;
        approvalRequired: boolean;
    }[];
    allowSubstitution: boolean;
    substitutionNotes: string;
    environmentalData: {
        carbonFootprint: number;
        recyclable: boolean;
        recycledContent: number;
        hazardousMaterial: boolean;
        rohs: boolean;
        reach: boolean;
    };
    sustainabilityMetrics: {
        sustainabilityRating: string;
        localSourcing: boolean;
        ethicalSourcing: boolean;
        certifications: string[];
    };
    drawingNumber: string;
    revision: string;
    engineeringData: {
        cad: {
            fileName: string;
            version: string;
            lastModified: Date;
        };
        drawings: {
            type: string;
            number: string;
            revision: string;
            fileName: string;
        }[];
        specifications: {
            document: string;
            section: string;
            revision: string;
        }[];
    };
    digitalTwinData: {
        id: string;
        properties: Record<string, any>;
        simulationResults: Record<string, any>;
        lastSync: Date;
    };
    aiInsights: {
        demandForecast: {
            nextPeriod: number;
            confidence: number;
            trend: string;
        };
        costOptimization: {
            recommendations: string[];
            potentialSavings: number;
        };
        qualityPrediction: {
            score: number;
            riskFactors: string[];
        };
        lastAnalysis: Date;
    };
    iotData: {
        sensors: {
            type: string;
            location: string;
            lastReading: Date;
            value: number;
            unit: string;
        }[];
        trackingEnabled: boolean;
        realTimeMonitoring: boolean;
    };
    batchTracked: boolean;
    lotTracked: boolean;
    serialTracked: boolean;
    shelfLife: number;
    traceabilityRequirements: {
        required: boolean;
        level: string;
        regulations: string[];
        documentation: string[];
    };
    changeHistory: {
        changeId: string;
        date: Date;
        reason: string;
        changedBy: string;
        approvedBy: string;
        oldValue: any;
        newValue: any;
    }[];
    engineeringApprovalRequired: boolean;
    qualityApprovalRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isActive(): boolean;
    calculateTotalCostWithWaste(): number;
    getEffectiveQuantity(): number;
    hasSubstitutes(): boolean;
    getBestSubstitute(): any | null;
    getCostVariance(actualCost: number): number;
    isEcoFriendly(): boolean;
    requiresSpecialHandling(): boolean;
    isCriticalComponent(): boolean;
    getLeadTimeRisk(): string;
    calculateOrderQuantity(productionQuantity: number): number;
    needsQualityInspection(): boolean;
    getSustainabilityScore(): number;
    validateComponent(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=BOMComponent.d.ts.map