import { DigitalTwinSimulation } from './digital-twin-simulation.entity';
export declare enum TwinType {
    EQUIPMENT = "equipment",
    PROCESS = "process",
    FACILITY = "facility",
    PRODUCT = "product",
    SUPPLY_CHAIN = "supply_chain",
    PRODUCTION_LINE = "production_line",
    QUALITY_SYSTEM = "quality_system",
    ENERGY_SYSTEM = "energy_system",
    SAFETY_SYSTEM = "safety_system",
    COMPOSITE = "composite"
}
export declare enum TwinStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SYNCHRONIZING = "synchronizing",
    SIMULATING = "simulating",
    ERROR = "error",
    MAINTENANCE = "maintenance"
}
export declare enum SynchronizationMode {
    REAL_TIME = "real_time",
    BATCH = "batch",
    ON_DEMAND = "on_demand",
    SCHEDULED = "scheduled",
    EVENT_DRIVEN = "event_driven"
}
export declare enum IndustryType {
    AUTOMOTIVE = "automotive",
    AEROSPACE = "aerospace",
    PHARMACEUTICALS = "pharmaceuticals",
    CHEMICALS = "chemicals",
    STEEL = "steel",
    OIL_GAS = "oil_gas",
    FOOD_BEVERAGE = "food_beverage",
    ELECTRONICS = "electronics",
    TEXTILE = "textile",
    DEFENSE = "defense",
    ENERGY = "energy",
    MINING = "mining"
}
export declare class DigitalTwin {
    id: string;
    twinId: string;
    name: string;
    description?: string;
    twinType: TwinType;
    status: TwinStatus;
    industryType: IndustryType;
    physicalAssetId: string;
    physicalLocation: {
        facility: string;
        building?: string;
        floor?: string;
        zone?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
            elevation?: number;
        };
        address?: {
            street: string;
            city: string;
            state: string;
            country: string;
            zipCode: string;
        };
    };
    configuration: {
        syncMode: SynchronizationMode;
        updateFrequency: number;
        dataRetentionPeriod: number;
        simulationEnabled: boolean;
        aiAnalyticsEnabled: boolean;
        predictiveMaintenance: boolean;
        qualityMonitoring: boolean;
        energyOptimization: boolean;
        safetyMonitoring: boolean;
        complianceTracking: boolean;
        quantumOptimization?: boolean;
    };
    physicalSpecs: {
        manufacturer?: string;
        model?: string;
        serialNumber?: string;
        yearManufactured?: number;
        capacity?: Record<string, any>;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            weight?: number;
            unit: string;
        };
        operatingConditions?: {
            temperature?: {
                min: number;
                max: number;
                unit: string;
            };
            pressure?: {
                min: number;
                max: number;
                unit: string;
            };
            humidity?: {
                min: number;
                max: number;
            };
            vibration?: Record<string, any>;
            environment?: string[];
        };
        technicalSpecs?: Record<string, any>;
    };
    currentData: {
        timestamp: string;
        sensorData: Record<string, any>;
        performanceMetrics: {
            efficiency: number;
            throughput?: number;
            quality?: number;
            availability?: number;
            oee?: number;
        };
        operationalData: {
            status: string;
            temperature?: number;
            pressure?: number;
            vibration?: number;
            speed?: number;
            power?: number;
            energy?: number;
            production?: Record<string, any>;
        };
        qualityData?: {
            defectRate?: number;
            qualityScore?: number;
            inspectionResults?: Record<string, any>;
            compliance?: Record<string, boolean>;
        };
        maintenanceData?: {
            lastMaintenance?: string;
            nextMaintenance?: string;
            healthScore?: number;
            predictedFailure?: string;
            remainingUsefulLife?: number;
        };
    };
    historicalSummary: {
        dataPoints: number;
        timeRange: {
            start: string;
            end: string;
        };
        averages: Record<string, number>;
        trends: Record<string, any>;
        anomalies: Array<{
            timestamp: string;
            type: string;
            severity: string;
            description: string;
        }>;
        patterns: Record<string, any>;
    };
    aiInsights?: {
        predictions: Array<{
            type: string;
            prediction: any;
            confidence: number;
            timeHorizon: string;
            createdAt: string;
        }>;
        anomalies: Array<{
            detected: string;
            type: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            probability: number;
            recommendation: string;
        }>;
        optimizations: Array<{
            area: string;
            recommendation: string;
            potentialImprovement: number;
            implementationComplexity: 'low' | 'medium' | 'high';
            estimatedROI: number;
        }>;
        patterns: Array<{
            name: string;
            description: string;
            frequency: string;
            impact: string;
        }>;
    };
    simulationConfig?: {
        enabled: boolean;
        models: Array<{
            type: string;
            name: string;
            version: string;
            accuracy: number;
            lastCalibrated: string;
        }>;
        scenarios: Array<{
            name: string;
            description: string;
            parameters: Record<string, any>;
            lastRun: string;
            results?: Record<string, any>;
        }>;
        quantumSimulation?: {
            enabled: boolean;
            processor: string;
            algorithms: string[];
            performance: Record<string, number>;
        };
    };
    integrations: {
        iotPlatform?: {
            provider: string;
            endpoint: string;
            deviceIds: string[];
            protocols: string[];
        };
        erpSystem?: {
            system: string;
            modules: string[];
            syncStatus: string;
        };
        mes?: {
            system: string;
            workOrders: boolean;
            quality: boolean;
            maintenance: boolean;
        };
        scada?: {
            system: string;
            tags: string[];
            realTime: boolean;
        };
        plc?: Array<{
            type: string;
            address: string;
            protocol: string;
            tags: string[];
        }>;
        cloudPlatforms?: string[];
        apiEndpoints?: string[];
    };
    compliance: {
        standards: string[];
        certifications: string[];
        dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
        encryptionLevel: string;
        accessControls: Record<string, string[]>;
        auditTrail: boolean;
        dataResidency: string[];
        privacyCompliance: string[];
    };
    performance: {
        syncAccuracy: number;
        latency: number;
        dataCompleteness: number;
        modelAccuracy: number;
        availability: number;
        reliability: number;
        lastSyncTime: string;
        errorRate: number;
        processingTime: number;
    };
    tags: string[];
    customFields?: Record<string, any>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    simulations: DigitalTwinSimulation[];
    isHealthy(): boolean;
    getOverallEffectiveness(): number;
    requiresAttention(): boolean;
    getNextMaintenanceDate(): Date | null;
    getPredictedFailureDate(): Date | null;
    getHealthScore(): number;
    isRealTimeSync(): boolean;
    getLatestAnomalies(count?: number): any[];
    getOptimizationOpportunities(): any[];
    hasQuantumCapabilities(): boolean;
    calculateUptime(): number;
    getComplianceStatus(): {
        compliant: boolean;
        issues: string[];
    };
    getEnergyEfficiency(): number;
    updateCurrentData(newData: Partial<any>): void;
    addAnomalyDetection(anomaly: any): void;
    getIndustrySpecificMetrics(): Record<string, any>;
}
//# sourceMappingURL=digital-twin.entity.d.ts.map