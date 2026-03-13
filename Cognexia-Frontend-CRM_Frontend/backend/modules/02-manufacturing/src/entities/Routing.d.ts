import { BillOfMaterials } from './BillOfMaterials';
import { RoutingOperation } from './RoutingOperation';
export declare enum RoutingStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
    OBSOLETE = "obsolete"
}
export declare enum RoutingType {
    STANDARD = "standard",
    ALTERNATE = "alternate",
    BACKUP = "backup",
    CUSTOM = "custom"
}
export declare class Routing {
    id: string;
    code: string;
    name: string;
    description: string;
    type: RoutingType;
    status: RoutingStatus;
    version: string;
    effectiveDate: Date;
    expiryDate: Date;
    totalLeadTime: number;
    totalProcessTime: number;
    totalSetupTime: number;
    totalCost: number;
    efficiency: number;
    qualityYield: number;
    lotSize: number;
    minimumLotSize: number;
    maximumLotSize: number;
    isParallel: boolean;
    isFlexible: boolean;
    isAiOptimized: boolean;
    hasDigitalTwin: boolean;
    isDynamicRouting: boolean;
    hasPredictiveScheduling: boolean;
    aiConfiguration: {
        optimizationModel: string;
        parameters: object;
        lastOptimization: Date;
        improvementPercentage: number;
    };
    qualityConfiguration: {
        inspectionPoints: string[];
        tolerances: object;
        qualityStandards: string[];
        controlPlan: string;
    };
    environmentalImpact: {
        energyConsumption: number;
        co2Emission: number;
        wasteGeneration: number;
        waterUsage: number;
        recyclability: number;
    };
    safetyRequirements: {
        hazards: string[];
        protectiveEquipment: string[];
        safetyProcedures: string[];
        riskLevel: string;
    };
    documentation: {
        workInstructions: string[];
        drawingNumbers: string[];
        specifications: string[];
        videos: string[];
        images: string[];
    };
    approvalWorkflow: {
        approvers: string[];
        approvalDate: Date;
        approvedBy: string;
        comments: string;
        revisionHistory: object[];
    };
    billOfMaterialsId: string;
    billOfMaterials: BillOfMaterials;
    operations: RoutingOperation[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateTotalTime(): number;
    calculateCriticalPath(): RoutingOperation[];
    getBottleneckOperation(): RoutingOperation | null;
    estimateCompletionTime(quantity: number): number;
    validateRouting(): string[];
    clone(newCode: string, newName: string): Partial<Routing>;
}
//# sourceMappingURL=Routing.d.ts.map