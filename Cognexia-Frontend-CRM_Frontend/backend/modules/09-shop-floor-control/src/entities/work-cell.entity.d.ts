import { Robot } from './robot.entity';
import { RobotTask } from './robot-task.entity';
export declare enum WorkCellType {
    ASSEMBLY = "assembly",
    MACHINING = "machining",
    WELDING = "welding",
    PAINTING = "painting",
    PACKAGING = "packaging",
    INSPECTION = "inspection",
    MATERIAL_HANDLING = "material_handling",
    COLLABORATIVE = "collaborative",
    FLEXIBLE_MANUFACTURING = "flexible_manufacturing",
    SMART_ASSEMBLY = "smart_assembly"
}
export declare enum WorkCellStatus {
    OPERATIONAL = "operational",
    IDLE = "idle",
    MAINTENANCE = "maintenance",
    ERROR = "error",
    SETUP = "setup",
    CHANGEOVER = "changeover",
    EMERGENCY_STOP = "emergency_stop"
}
export interface WorkCellCapabilities {
    maxRobots: number;
    supportedOperations: string[];
    qualityLevels: string[];
    throughputCapacity: number;
    energyEfficiency: number;
    automationLevel: number;
    flexibilityScore: number;
    hasAIOptimization: boolean;
    hasAdaptiveControl: boolean;
    hasDigitalTwin: boolean;
    hasPredictiveMaintenance: boolean;
    hasCollaborativeFeatures: boolean;
    hasQuantumOptimization: boolean;
}
export interface LayoutConfiguration {
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    robotPositions: Array<{
        robotId?: string;
        x: number;
        y: number;
        z: number;
        rotation: number;
    }>;
    safetyZones: Array<{
        id: string;
        type: 'restricted' | 'collaborative' | 'human_only';
        coordinates: number[][];
    }>;
    workstations: Array<{
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
            z: number;
        };
        capabilities: string[];
    }>;
}
export interface ProductionMetrics {
    partsProducedToday: number;
    targetPartsPerDay: number;
    actualCycleTime: number;
    plannedCycleTime: number;
    throughputEfficiency: number;
    qualityRate: number;
    defectCount: number;
    reworkCount: number;
    firstPassYield: number;
    availability: number;
    performance: number;
    oee: number;
    uptime: number;
    downtime: number;
    robotUtilization: number;
    humanUtilization: number;
    energyConsumption: number;
    materialWaste: number;
    operatingCost: number;
    maintenanceCost: number;
    laborCost: number;
    carbonFootprint: number;
    waterUsage: number;
    wasteGenerated: number;
    lastUpdated: Date;
}
export declare class WorkCell {
    id: string;
    name: string;
    displayName?: string;
    type: WorkCellType;
    status: WorkCellStatus;
    description?: string;
    facility: string;
    department: string;
    productionLine: string;
    floor?: string;
    zone?: string;
    physicalLocation?: string;
    capabilities: WorkCellCapabilities;
    layoutConfiguration: LayoutConfiguration;
    currentProductId?: string;
    currentProductName?: string;
    currentBatchId?: string;
    currentBatchSize?: number;
    currentBatchProgress: number;
    productionMetrics?: ProductionMetrics;
    totalPartsProduced: number;
    totalBatchesCompleted: number;
    totalOperatingHours: number;
    totalEnergyConsumed: number;
    totalDowntimeEvents: number;
    averageQualityScore: number;
    totalDefectsToday: number;
    totalReworkToday: number;
    assignedRobots: number;
    assignedOperators: number;
    requiredSkills?: string[];
    certificationRequirements?: string[];
    lastProductionStart?: Date;
    lastProductionEnd?: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    lastSetupDate?: Date;
    nextCalibrationDate?: Date;
    currentAlerts?: string[];
    recentIssues?: string[];
    issueCount: number;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
    isActive: boolean;
    isFlexible: boolean;
    hasAI: boolean;
    hasDigitalTwin: boolean;
    isCollaborative: boolean;
    isAutonomous: boolean;
    needsMaintenance: boolean;
    isEmergencyStopped: boolean;
    robots: Robot[];
    tasks: RobotTask[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    updateCounters(): void;
    isOperational(): boolean;
    isAvailable(): boolean;
    canAcceptNewTask(): boolean;
    hasAvailableRobots(): boolean;
    getAvailableRobots(): Robot[];
    getUtilization(): number;
    getOEE(): number;
    getQualityRate(): number;
    getThroughputEfficiency(): number;
    getBatchProgress(): number;
    addAlert(alert: string): void;
    clearAlerts(): void;
    addIssue(issue: string): void;
    clearIssues(): void;
    startProduction(productId: string, productName: string, batchId: string, batchSize: number): void;
    completeProduction(): void;
    pauseProduction(): void;
    resumeProduction(): void;
    emergencyStop(reason: string): void;
    reset(): void;
    updateProductionMetrics(metrics: Partial<ProductionMetrics>): void;
    incrementBatchProgress(amount?: number): void;
    getHealthScore(): number;
    getEfficiencyScore(): number;
    getWorkCellSummary(): Record<string, any>;
}
//# sourceMappingURL=work-cell.entity.d.ts.map