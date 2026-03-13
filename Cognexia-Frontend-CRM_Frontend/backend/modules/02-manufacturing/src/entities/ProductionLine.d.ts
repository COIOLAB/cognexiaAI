import { WorkCenter } from './WorkCenter';
import { ProductionOrder } from './ProductionOrder';
import { ProductionSchedule } from './ProductionSchedule';
export declare enum ProductionLineStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    BREAKDOWN = "breakdown",
    SETUP = "setup",
    CHANGEOVER = "changeover"
}
export declare enum ProductionLineType {
    ASSEMBLY = "assembly",
    FABRICATION = "fabrication",
    PACKAGING = "packaging",
    TESTING = "testing",
    MIXED = "mixed",
    FLEXIBLE = "flexible"
}
export declare class ProductionLine {
    id: string;
    code: string;
    name: string;
    description: string;
    type: ProductionLineType;
    status: ProductionLineStatus;
    facilityId: string;
    location: string;
    building: string;
    floor: string;
    designCapacity: number;
    currentCapacity: number;
    efficiency: number;
    utilization: number;
    oee: number;
    cycleTime: number;
    taktTime: number;
    setupCost: number;
    operatingCostPerHour: number;
    laborCostPerHour: number;
    overheadCostPerHour: number;
    productTypes: {
        id: string;
        name: string;
        sku: string;
        minQuantity: number;
        maxQuantity: number;
        setupTime: number;
    }[];
    capabilities: {
        operation: string;
        capacity: number;
        quality: string;
        certificationRequired: boolean;
    }[];
    qualityStandards: {
        standard: string;
        version: string;
        compliance: boolean;
        lastAudit: Date;
    }[];
    requiredOperators: number;
    currentOperators: number;
    skillRequirements: {
        skill: string;
        level: string;
        certified: boolean;
        required: boolean;
    }[];
    shiftConfiguration: {
        shift: string;
        startTime: string;
        endTime: string;
        operators: number;
        efficiency: number;
    }[];
    equipment: {
        id: string;
        name: string;
        type: string;
        manufacturer: string;
        model: string;
        status: string;
        lastMaintenance: Date;
        nextMaintenance: Date;
    }[];
    automationLevel: {
        level: string;
        percentage: number;
        robotics: boolean;
        aiIntegrated: boolean;
    };
    iotSensors: {
        id: string;
        type: string;
        location: string;
        status: string;
        lastReading: {
            timestamp: Date;
            value: number;
            unit: string;
        };
        thresholds: {
            min: number;
            max: number;
            critical: number;
        };
    }[];
    aiAnalytics: {
        predictiveMaintenanceScore: number;
        qualityPrediction: number;
        efficiencyOptimization: number;
        anomalyDetection: {
            score: number;
            lastAnomaly: Date;
            type: string;
        };
        lastAnalysis: Date;
    };
    digitalTwin: {
        id: string;
        status: string;
        lastSync: Date;
        simulationRunning: boolean;
        predictiveModel: {
            accuracy: number;
            lastTrained: Date;
            version: string;
        };
    };
    sustainabilityMetrics: {
        energyConsumption: number;
        carbonFootprint: number;
        wasteGeneration: number;
        waterUsage: number;
        recyclingRate: number;
    };
    humanAiCollaboration: {
        enabled: boolean;
        aiAssistanceLevel: string;
        humanOverrideCapability: boolean;
        collaborativeRobots: {
            count: number;
            types: string[];
            safetyLevel: string;
        };
    };
    firstPassYield: number;
    defectRate: number;
    reworkRate: number;
    complianceRecords: {
        regulation: string;
        status: string;
        lastAudit: Date;
        nextAudit: Date;
        certificateNumber: string;
    }[];
    workCenters: WorkCenter[];
    productionOrders: ProductionOrder[];
    productionSchedules: ProductionSchedule[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isOperational(): boolean;
    isAvailable(): boolean;
    calculateOEE(): number;
    getCurrentThroughput(): number;
    canProduceProduct(productId: string): boolean;
    estimateProductionTime(productId: string, quantity: number): number;
    calculateProductionCost(productId: string, quantity: number): number;
    getCapacityUtilization(): number;
    isMaintenanceRequired(): boolean;
    getEnergyEfficiencyRating(): string;
    getSustainabilityScore(): number;
}
//# sourceMappingURL=ProductionLine.d.ts.map