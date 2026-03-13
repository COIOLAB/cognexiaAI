import { WorkCell } from './work-cell.entity';
import { RobotTask } from './robot-task.entity';
import { SafetyIncident } from './safety-incident.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
export declare enum RobotType {
    ARTICULATED = "articulated",
    SCARA = "scara",
    DELTA = "delta",
    CARTESIAN = "cartesian",
    COLLABORATIVE = "collaborative",
    MOBILE = "mobile",
    HUMANOID = "humanoid",
    AGV = "agv",// Automated Guided Vehicle
    DRONE = "drone",
    EXOSKELETON = "exoskeleton"
}
export declare enum RobotState {
    IDLE = "idle",
    ASSIGNED = "assigned",
    EXECUTING = "executing",
    PAUSED = "paused",
    ERROR = "error",
    MAINTENANCE = "maintenance",
    CALIBRATING = "calibrating",
    LEARNING = "learning",
    EMERGENCY_STOP = "emergency_stop",
    OFFLINE = "offline"
}
export declare enum OperatingMode {
    MANUAL = "manual",
    SEMI_AUTOMATIC = "semi_automatic",
    AUTOMATIC = "automatic",
    COLLABORATIVE = "collaborative",
    AUTONOMOUS = "autonomous",
    AI_DRIVEN = "ai_driven",
    SWARM = "swarm"
}
export declare enum SafetyStandard {
    ISO_10218 = "iso_10218",
    ISO_13849 = "iso_13849",
    IEC_61508 = "iec_61508",
    ANSI_RIA_R15_06 = "ansi_ria_r15_06",
    ISO_TS_15066 = "iso_ts_15066"
}
export declare enum AICapability {
    MACHINE_LEARNING = "machine_learning",
    COMPUTER_VISION = "computer_vision",
    NATURAL_LANGUAGE = "natural_language",
    PREDICTIVE_ANALYTICS = "predictive_analytics",
    REINFORCEMENT_LEARNING = "reinforcement_learning",
    FEDERATED_LEARNING = "federated_learning",
    QUANTUM_ML = "quantum_ml"
}
export interface RobotCapabilities {
    payloadKg: number;
    reachMm: number;
    axes: number;
    maxSpeedMmS: number;
    repeatabilityMm: number;
    workingSpace: {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        zMin: number;
        zMax: number;
    };
    forceSensing: boolean;
    visionSystem: boolean;
    tactileSensors: boolean;
    voiceCommands: boolean;
    gestureRecognition: boolean;
    emotionalIntelligence: boolean;
    humanAwareness: boolean;
    adaptiveSpeed: boolean;
    predictivePathPlanning: boolean;
    intentRecognition: boolean;
    aiCapabilities: AICapability[];
    neuralNetworkCapacity: number;
    memoryCapacity: number;
    protocols: string[];
    wirelessCapabilities: string[];
    quantumCommunication: boolean;
}
export interface RobotPosition {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
    joints?: number[];
    confidence: number;
    accuracy: number;
    timestamp: Date;
}
export interface SafetyConfiguration {
    safetyStandards: SafetyStandard[];
    emergencyStopType: 'category_0' | 'category_1' | 'category_2';
    safetyZones: SafetyZone[];
    collaborativeFeatures: {
        powerForceMonitoring: boolean;
        speedSeparationMonitoring: boolean;
        safetyRatedMonitoredStop: boolean;
        handGuiding: boolean;
    };
    riskAssessment: {
        level: 'low' | 'medium' | 'high' | 'critical';
        lastAssessment: Date;
        assessor: string;
    };
}
export interface SafetyZone {
    id: string;
    type: 'restricted' | 'collaborative' | 'human_only' | 'robot_only';
    shape: 'sphere' | 'cylinder' | 'box' | 'polygon';
    parameters: Record<string, number>;
    priority: number;
}
export interface PerformanceMetrics {
    cycleTime: number;
    throughput: number;
    uptime: number;
    oee: number;
    accuracy: number;
    precision: number;
    defectRate: number;
    firstPassYield: number;
    powerConsumption: number;
    energyEfficiency: number;
    carbonFootprint: number;
    mtbf: number;
    mttr: number;
    maintenanceCost: number;
    learningRate: number;
    adaptabilityScore: number;
    collaborationEfficiency: number;
    lastUpdated: Date;
}
export interface AILearningProfile {
    modelVersion: string;
    learningAlgorithm: string;
    trainingDataSize: number;
    accuracy: number;
    lastTraining: Date;
    adaptationRate: number;
    knowledgeBase: Record<string, any>;
    personalizedBehaviors: Record<string, any>;
    collaborationPatterns: Record<string, any>;
}
export declare class Robot {
    id: string;
    name: string;
    displayName?: string;
    type: RobotType;
    status: RobotState;
    operatingMode: OperatingMode;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    firmwareVersion?: string;
    softwareVersion?: string;
    manufacturingDate?: Date;
    installationDate?: Date;
    lastCalibrationDate?: Date;
    ipAddress?: string;
    macAddress?: string;
    port?: number;
    workCell?: WorkCell;
    workCellId?: string;
    location?: string;
    facility?: string;
    department?: string;
    productionLine?: string;
    workstation?: string;
    capabilities: RobotCapabilities;
    safetyConfiguration: SafetyConfiguration;
    currentPosition?: RobotPosition;
    targetPosition?: RobotPosition;
    currentSpeed?: number;
    currentLoad?: number;
    batteryLevel?: number;
    temperature?: number;
    performanceMetrics?: PerformanceMetrics;
    aiLearningProfile?: AILearningProfile;
    currentTaskId?: string;
    taskQueue?: string[];
    tasksCompleted: number;
    tasksFailedToday: number;
    totalOperatingHours: number;
    totalCycles: number;
    totalEnergyConsumed: number;
    totalMaintenanceEvents: number;
    lastSeen?: Date;
    lastTaskCompleted?: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    lastErrorOccurred?: Date;
    currentAlerts?: string[];
    recentErrors?: string[];
    errorCount: number;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
    isActive: boolean;
    isCollaborative: boolean;
    hasAI: boolean;
    hasVision: boolean;
    hasForceSensing: boolean;
    isLearning: boolean;
    isSimulated: boolean;
    needsCalibration: boolean;
    isEmergencyStopped: boolean;
    hasDigitalTwin: boolean;
    digitalTwinId?: string;
    tasks: RobotTask[];
    safetyIncidents: SafetyIncident[];
    maintenanceRecords: MaintenanceRecord[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    updateTimestamps(): void;
    isOnline(): boolean;
    isAvailable(): boolean;
    isCollaborativeMode(): boolean;
    needsMaintenance(): boolean;
    hasActiveAlerts(): boolean;
    hasRecentErrors(): boolean;
    getUtilization(): number;
    getOEE(): number;
    isCapableOf(requirement: Partial<RobotCapabilities>): boolean;
    updatePosition(position: Partial<RobotPosition>): void;
    addAlert(alert: string): void;
    clearAlerts(): void;
    addError(error: string): void;
    clearErrors(): void;
    emergencyStop(reason: string): void;
    reset(): void;
    startTask(taskId: string): void;
    completeTask(): void;
    failTask(reason: string): void;
    updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void;
    updateAIProfile(profile: Partial<AILearningProfile>): void;
    getHealthScore(): number;
    getRobotSummary(): Record<string, any>;
}
//# sourceMappingURL=robot.entity.d.ts.map