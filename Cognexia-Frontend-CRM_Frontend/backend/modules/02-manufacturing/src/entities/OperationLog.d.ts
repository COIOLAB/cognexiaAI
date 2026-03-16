import { WorkOrder } from './WorkOrder';
import { WorkCenter } from './WorkCenter';
export declare enum OperationLogType {
    PRODUCTION = "production",
    QUALITY_CHECK = "quality_check",
    SETUP = "setup",
    BREAKDOWN = "breakdown",
    MAINTENANCE = "maintenance",
    CALIBRATION = "calibration",
    MATERIAL_CONSUMPTION = "material_consumption",
    OPERATOR_ACTION = "operator_action",
    SYSTEM_EVENT = "system_event",
    SAFETY_EVENT = "safety_event",
    ENVIRONMENTAL_EVENT = "environmental_event",
    COMPLIANCE_CHECK = "compliance_check",
    PROCESS_DEVIATION = "process_deviation"
}
export declare enum OperationStatus {
    STARTED = "started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    PAUSED = "paused",
    STOPPED = "stopped",
    FAILED = "failed",
    CANCELLED = "cancelled",
    WARNING = "warning",
    CRITICAL = "critical"
}
export declare enum IndustryType {
    OIL_GAS = "oil_gas",
    FMCG = "fmcg",
    DEFENCE = "defence",
    AIRCRAFT = "aircraft",
    NAVAL = "naval",
    CHEMICALS = "chemicals",
    AUTOMOTIVE = "automotive",
    PHARMACEUTICALS = "pharmaceuticals",
    ELECTRONICS = "electronics",
    TEXTILES = "textiles",
    STEEL = "steel",
    MINING = "mining",
    FOOD_BEVERAGE = "food_beverage",
    PLASTICS = "plastics",
    PAPER = "paper",
    CEMENT = "cement",
    ENERGY = "energy",
    GENERAL = "general"
}
export declare class OperationLog {
    id: string;
    timestamp: Date;
    logType: OperationLogType;
    status: OperationStatus;
    industryType: IndustryType;
    workOrderId: string;
    workOrder: WorkOrder;
    workCenterId: string;
    workCenter: WorkCenter;
    operatorId: string;
    operatorName: string;
    operationCode: string;
    operationName: string;
    description: string;
    sequenceStep: number;
    startTime: Date;
    endTime: Date;
    duration: number;
    plannedDuration: number;
    efficiency: number;
    quantityProcessed: number;
    quantityProduced: number;
    quantityRejected: number;
    quantityRework: number;
    unit: string;
    yieldPercentage: number;
    processParameters: {
        pressure?: number;
        temperature?: number;
        flowRate?: number;
        viscosity?: number;
        density?: number;
        h2sContent?: number;
        waterCut?: number;
        ph?: number;
        concentration?: number;
        reactorPressure?: number;
        catalystLevel?: number;
        purityLevel?: number;
        batchSize?: number;
        mixingTime?: number;
        cookingTemp?: number;
        moisture?: number;
        shelfLife?: number;
        torqueValue?: number;
        compressionRatio?: number;
        surfaceFinish?: number;
        materialGrade?: string;
        heatTreatment?: string;
        ndt?: boolean;
        apiContent?: number;
        dissolution?: number;
        sterility?: boolean;
        endotoxin?: number;
        bioburden?: number;
        resistance?: number;
        capacitance?: number;
        voltage?: number;
        current?: number;
        frequency?: number;
        tensileStrength?: number;
        threadCount?: number;
        colorFastness?: number;
        shrinkage?: number;
        speed?: number;
        force?: number;
        vibration?: number;
        noise?: number;
        humidity?: number;
        power?: number;
        energy?: number;
    };
    qualityMetrics: {
        inspectionResults: {
            parameter: string;
            specification: string;
            actual: string;
            result: string;
            inspector: string;
            timestamp: Date;
        }[];
        defects: {
            type: string;
            severity: string;
            location: string;
            cause: string;
            action: string;
        }[];
        compliance: {
            standard: string;
            requirement: string;
            status: string;
            certificate: string;
            expiry: Date;
        }[];
    };
    materialConsumption: {
        materials: {
            materialId: string;
            materialCode: string;
            materialName: string;
            batchLot: string;
            quantity: number;
            unit: string;
            cost: number;
            supplier: string;
            expiryDate?: Date;
            grade?: string;
            specification?: string;
            composition?: Record<string, number>;
            certifications?: string[];
            hazardClass?: string;
            flashPoint?: number;
            meltingPoint?: number;
        }[];
        waste: {
            type: string;
            quantity: number;
            unit: string;
            disposal: string;
            cost: number;
            environmental: boolean;
        }[];
    };
    equipmentData: {
        equipment: {
            equipmentId: string;
            equipmentCode: string;
            equipmentName: string;
            status: string;
            runTime: number;
            cycles: number;
            temperature: number;
            pressure: number;
            efficiency: number;
            maintenance: {
                lastService: Date;
                nextService: Date;
                condition: string;
            };
        }[];
        tools: {
            toolId: string;
            toolCode: string;
            toolName: string;
            usageTime: number;
            wearLevel: number;
            calibrationDue: Date;
        }[];
    };
    environmentalData: {
        emissions: {
            co2: number;
            nox: number;
            sox: number;
            particulates: number;
            voc: number;
        };
        waste: {
            solid: number;
            liquid: number;
            hazardous: number;
            recycled: number;
        };
        energy: {
            electricity: number;
            gas: number;
            steam: number;
            compressedAir: number;
            water: number;
        };
        safety: {
            incidents: {
                type: string;
                severity: string;
                description: string;
                action: string;
                resolved: boolean;
            }[];
            ppe: string[];
            hazards: string[];
        };
    };
    digitalTwinData: {
        twinId: string;
        syncTimestamp: Date;
        virtualParameters: Record<string, any>;
        predictions: {
            quality: number;
            efficiency: number;
            failure: number;
            maintenance: Date;
        };
        recommendations: string[];
    };
    aiInsights: {
        anomalies: {
            parameter: string;
            expected: number;
            actual: number;
            deviation: number;
            severity: string;
            recommendation: string;
        }[];
        optimization: {
            parameter: string;
            currentValue: number;
            recommendedValue: number;
            benefit: string;
            confidence: number;
        }[];
        predictions: {
            type: string;
            value: number;
            confidence: number;
            timeHorizon: string;
        }[];
    };
    iotData: {
        sensors: {
            sensorId: string;
            type: string;
            value: number;
            unit: string;
            status: string;
            timestamp: Date;
            calibrated: boolean;
        }[];
        actuators: {
            actuatorId: string;
            type: string;
            command: string;
            response: string;
            timestamp: Date;
        }[];
        connectivity: {
            protocol: string;
            latency: number;
            reliability: number;
        };
    };
    humanFactors: {
        operator: {
            fatigue: number;
            skill: string;
            experience: number;
            training: string[];
            certifications: string[];
        };
        ergonomics: {
            workload: string;
            posture: string;
            repetition: number;
            environment: string;
        };
        collaboration: {
            humanRobot: boolean;
            aiAssistance: boolean;
            teamwork: boolean;
            communication: string;
        };
    };
    regulatoryData: {
        api?: string;
        asme?: string;
        milSpec?: string;
        nadcap?: boolean;
        itar?: boolean;
        fda?: string;
        gmp?: boolean;
        ich?: string;
        haccp?: boolean;
        fsis?: boolean;
        brc?: string;
        reach?: boolean;
        osha?: boolean;
        epa?: string;
        iso?: string[];
        astm?: string[];
        ansi?: string[];
        iec?: string[];
        compliance: {
            standard: string;
            status: string;
            auditor: string;
            auditDate: Date;
            certificate: string;
            expiry: Date;
            findings: string[];
        }[];
    };
    operationCost: number;
    materialCost: number;
    laborCost: number;
    energyCost: number;
    maintenanceCost: number;
    currency: string;
    operatorNotes: string;
    supervisorNotes: string;
    systemNotes: string;
    attachments: {
        type: string;
        fileName: string;
        filePath: string;
        description: string;
        uploadedBy: string;
        uploadedAt: Date;
    }[];
    alerts: {
        alertId: string;
        type: string;
        message: string;
        acknowledged: boolean;
        acknowledgedBy: string;
        acknowledgedAt: Date;
        resolved: boolean;
        resolvedBy: string;
        resolvedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    getDurationInMinutes(): number;
    isCompleted(): boolean;
    hasQualityIssues(): boolean;
    isWithinTolerance(): boolean;
    getEfficiencyRating(): string;
    getEnvironmentalImpact(): number;
    getCarbonFootprint(): number;
    hasAnomalies(): boolean;
    getCriticalAnomalies(): any[];
    isComplianceValid(): boolean;
    getIndustrySpecificMetrics(): Record<string, any>;
    calculateOEE(): number;
    getTotalCost(): number;
    getUnresolvedAlerts(): any[];
    getCriticalAlerts(): any[];
    validateLog(): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=OperationLog.d.ts.map