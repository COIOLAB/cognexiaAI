import { WorkCenter } from './WorkCenter';
import { AIInsight } from './AIInsight';
export declare enum RobotType {
    INDUSTRIAL = "industrial",
    COLLABORATIVE = "collaborative",
    MOBILE = "mobile",
    HUMANOID = "humanoid",
    ARTICULATED = "articulated",
    SCARA = "scara",
    DELTA = "delta",
    CARTESIAN = "cartesian",
    SPECIALIZED = "specialized"
}
export declare enum RobotStatus {
    IDLE = "idle",
    RUNNING = "running",
    PAUSED = "paused",
    ERROR = "error",
    MAINTENANCE = "maintenance",
    CALIBRATING = "calibrating",
    LEARNING = "learning",
    EMERGENCY_STOP = "emergency_stop",
    OFFLINE = "offline"
}
export declare enum SafetyLevel {
    NONE = "none",
    BASIC = "basic",
    STANDARD = "standard",
    ADVANCED = "advanced",
    COLLABORATIVE = "collaborative",
    AUTONOMOUS = "autonomous"
}
export declare enum AutonomyLevel {
    MANUAL = "manual",
    ASSISTED = "assisted",
    SEMI_AUTONOMOUS = "semi_autonomous",
    FULLY_AUTONOMOUS = "fully_autonomous",
    SUPERINTELLIGENT = "superintelligent"
}
export declare class Robotics {
    id: string;
    robotCode: string;
    robotName: string;
    description: string;
    robotType: RobotType;
    status: RobotStatus;
    safetyLevel: SafetyLevel;
    autonomyLevel: AutonomyLevel;
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareVersion: string;
    installationDate: Date;
    warrantyExpiry: Date;
    physicalSpecs: {
        degreesOfFreedom: number;
        payload: number;
        reach: number;
        repeatability: number;
        speed: number;
        acceleration: number;
        weight: number;
        dimensions: object;
        workingEnvelope: object;
    };
    kinematics: {
        configuration: string;
        jointTypes: string[];
        jointLimits: object[];
        workspace: object;
        singularities: object[];
        calibration: object;
        forwardKinematics: object;
        inverseKinematics: object;
    };
    controlSystem: {
        controller: string;
        processingPower: string;
        memory: string;
        storage: string;
        operatingSystem: string;
        realTimeCapability: boolean;
        cycleTime: number;
        interpolationRate: number;
    };
    sensors: {
        vision: object[];
        force: object[];
        torque: object[];
        position: object[];
        proximity: object[];
        temperature: object[];
        vibration: object[];
        audio: object[];
        tactile: object[];
        lidar: object[];
    };
    endEffector: {
        type: string;
        specifications: object;
        toolChanging: boolean;
        tools: object[];
        adaptiveGripping: boolean;
        forceControl: boolean;
        compliance: object;
    };
    aiCapabilities: {
        visionSystem: boolean;
        pathPlanning: boolean;
        obstacleAvoidance: boolean;
        adaptiveLearning: boolean;
        reinforcementLearning: boolean;
        neuralNetworks: string[];
        computerVision: object;
        naturalLanguageProcessing: boolean;
        decisionMaking: object;
        predictiveAnalytics: boolean;
    };
    collaborativeFeatures: {
        humanDetection: boolean;
        safetyZones: object[];
        speedReduction: boolean;
        forceLimit: number;
        powerLimit: number;
        emergencyStop: boolean;
        handGuiding: boolean;
        voiceInteraction: boolean;
        gestureRecognition: boolean;
        augmentedReality: boolean;
    };
    safetySystems: {
        emergencyStop: boolean;
        lightCurtains: boolean;
        safetyMats: boolean;
        laserScanners: boolean;
        cameraMonitoring: boolean;
        forceMonitoring: boolean;
        speedMonitoring: boolean;
        workspaceMonitoring: boolean;
        riskAssessment: object;
        safetyRating: string;
    };
    programming: {
        languages: string[];
        interfaces: string[];
        teachingMethods: string[];
        simulationTools: string[];
        offlineProgramming: boolean;
        onlineProgramming: boolean;
        parametricProgramming: boolean;
        visualProgramming: boolean;
        voiceProgramming: boolean;
    };
    connectivity: {
        ethernet: boolean;
        wifi: boolean;
        bluetooth: boolean;
        usb: boolean;
        rs232: boolean;
        canBus: boolean;
        profinet: boolean;
        ethercat: boolean;
        modbus: boolean;
        opcua: boolean;
        mqtt: boolean;
        protocols: string[];
    };
    performanceMetrics: {
        uptime: number;
        efficiency: number;
        throughput: number;
        accuracy: number;
        cycleTime: number;
        errorRate: number;
        availability: number;
        oee: number;
        mtbf: number;
        mttr: number;
    };
    lastMaintenance: Date;
    nextMaintenanceDue: Date;
    maintenanceIntervalDays: number;
    healthMonitoring: {
        vibrationLevel: number;
        temperature: number;
        powerConsumption: number;
        jointWear: object[];
        lubricationLevel: number;
        batteryLevel: number;
        diagnostics: object[];
        predictiveHealth: object;
    };
    currentTask: {
        taskId: string;
        taskName: string;
        startTime: Date;
        estimatedCompletion: Date;
        progress: number;
        operation: string;
        target: object;
        parameters: object;
        priority: string;
    };
    taskQueue: {
        pending: object[];
        scheduled: object[];
        completed: object[];
        failed: object[];
        maxQueueSize: number;
        priorityLevels: string[];
    };
    learningCapabilities: {
        machineVision: boolean;
        adaptiveControl: boolean;
        skillLearning: boolean;
        environmentMapping: boolean;
        humanTeaching: boolean;
        imitationLearning: boolean;
        transferLearning: boolean;
        continuousLearning: boolean;
        experienceReplay: boolean;
    };
    knowledgeBase: {
        skills: object[];
        procedures: object[];
        experiences: object[];
        patterns: object[];
        rules: object[];
        models: object[];
        updates: object[];
        version: string;
    };
    quantumProcessing: boolean;
    quantumFeatures: {
        quantumSensors: boolean;
        quantumComputing: boolean;
        quantumCommunication: boolean;
        quantumEncryption: boolean;
        entanglement: boolean;
        superposition: boolean;
        algorithms: string[];
    };
    blockchainIntegration: boolean;
    blockchainFeatures: {
        taskVerification: boolean;
        qualityProvenance: boolean;
        maintenanceRecords: boolean;
        performanceMetrics: boolean;
        smartContracts: boolean;
        tokenization: boolean;
        consensus: string;
    };
    edgeComputing: {
        localProcessing: boolean;
        edgeAI: boolean;
        realTimeAnalytics: boolean;
        autonomousDecisions: boolean;
        offlineCapability: boolean;
        dataFiltering: boolean;
        latencyOptimization: boolean;
    };
    cloudIntegration: {
        cloudAI: boolean;
        remoteMonitoring: boolean;
        softwareUpdates: boolean;
        dataBackup: boolean;
        collaboration: boolean;
        fleetManagement: boolean;
        analytics: boolean;
    };
    environmental: {
        energyEfficiency: number;
        powerConsumption: number;
        carbonFootprint: number;
        noiseLevel: number;
        heatGeneration: number;
        sustainabilityRating: string;
        recyclingInfo: object;
    };
    acquisitionCost: number;
    operatingCostPerHour: number;
    maintenanceCostPerYear: number;
    roiMetrics: {
        paybackPeriod: number;
        laborSavings: number;
        productivityGain: number;
        qualityImprovement: number;
        costReduction: number;
        roi: number;
    };
    integration: {
        erp: boolean;
        mes: boolean;
        scada: boolean;
        plc: boolean;
        hmi: boolean;
        databases: string[];
        apis: string[];
        standards: string[];
        protocols: string[];
    };
    location: string;
    latitude: number;
    longitude: number;
    workspace: {
        boundaries: object;
        obstacles: object[];
        safeZones: object[];
        restrictedAreas: object[];
        calibrationPoints: object[];
        referenceFrames: object[];
    };
    workCenterId: string;
    workCenter: WorkCenter;
    aiInsights: AIInsight[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    lastOperatedBy: string;
    lastOperatedAt: Date;
    isOperational(): boolean;
    isCollaborative(): boolean;
    getOverallHealthScore(): number;
    calculateEfficiency(): number;
    needsMaintenance(): boolean;
    isTaskActive(): boolean;
    assignTask(task: object, userId?: string): boolean;
    updateTaskProgress(progress: number): void;
    completeCurrentTask(): void;
    emergencyStop(reason?: string): void;
    calibrate(): boolean;
    learn(skill: object): boolean;
    collaborate(humanOperator: string, task: object): boolean;
    predictMaintenance(): object;
    optimizePerformance(): object;
    generateReport(): object;
    clone(newRobotCode: string): Partial<Robotics>;
    shutdown(): void;
}
//# sourceMappingURL=Robotics.d.ts.map