import { WorkCenter } from './WorkCenter';
import { ProductionLine } from './ProductionLine';
import { AIInsight } from './AIInsight';
export declare enum TwinType {
    COMPONENT = "component",
    EQUIPMENT = "equipment",
    PROCESS = "process",
    SYSTEM = "system",
    FACTORY = "factory",
    PRODUCT = "product",
    HUMAN = "human",
    ENVIRONMENT = "environment"
}
export declare enum TwinStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SYNCHRONIZING = "synchronizing",
    ERROR = "error",
    MAINTENANCE = "maintenance",
    CALIBRATING = "calibrating",
    UPDATING = "updating"
}
export declare enum SimulationMode {
    REAL_TIME = "real_time",
    ACCELERATED = "accelerated",
    BATCH = "batch",
    PREDICTIVE = "predictive",
    SCENARIO = "scenario",
    OPTIMIZATION = "optimization",
    TRAINING = "training"
}
export declare enum FidelityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    ULTRA_HIGH = "ultra_high",
    QUANTUM = "quantum"
}
export declare class DigitalTwin {
    id: string;
    twinCode: string;
    twinName: string;
    description: string;
    twinType: TwinType;
    status: TwinStatus;
    fidelityLevel: FidelityLevel;
    simulationMode: SimulationMode;
    physicalAsset: {
        assetId: string;
        assetType: string;
        manufacturer: string;
        model: string;
        serialNumber: string;
        specifications: object;
        location: object;
        installation: object;
    };
    digitalModel: {
        modelType: string;
        modelFiles: string[];
        geometry: object;
        materials: object[];
        physics: object;
        boundaries: object;
        constraints: object[];
    };
    dataSources: {
        sensors: object[];
        systems: string[];
        databases: string[];
        apis: string[];
        files: string[];
        streams: object[];
        frequency: number;
        protocols: string[];
    };
    lastSynchronization: Date;
    synchronizationInterval: number;
    synchronizationAccuracy: number;
    synchronizationMetrics: {
        latency: number;
        throughput: number;
        reliability: number;
        dataQuality: number;
        compression: number;
    };
    aiConfiguration: {
        models: object[];
        algorithms: string[];
        trainingData: string[];
        inference: object;
        learning: boolean;
        adaptation: boolean;
        prediction: object;
    };
    quantumEnabled: boolean;
    quantumConfiguration: {
        backend: string;
        qubits: number;
        algorithms: string[];
        optimization: object;
        simulation: object;
        entanglement: boolean;
        superposition: boolean;
    };
    blockchainEnabled: boolean;
    blockchainConfiguration: {
        network: string;
        contracts: string[];
        transactions: object[];
        consensus: string;
        validation: object;
        immutability: boolean;
        transparency: boolean;
    };
    securityConfiguration: {
        encryption: string;
        authentication: string;
        authorization: object;
        monitoring: boolean;
        threatDetection: boolean;
        incidentResponse: object;
        compliance: string[];
        auditTrail: boolean;
    };
    simulationParameters: {
        timeStep: number;
        duration: number;
        resolution: object;
        accuracy: number;
        convergence: object;
        boundary: object;
        initial: object;
        environment: object;
    };
    physicsModels: {
        mechanics: object;
        thermodynamics: object;
        electromagnetics: object;
        fluidDynamics: object;
        materialScience: object;
        quantum: object;
        relativistic: object;
        multiPhysics: boolean;
    };
    performanceMetrics: {
        computationalTime: number;
        memoryUsage: number;
        cpuUtilization: number;
        gpuUtilization: number;
        networkBandwidth: number;
        storageUsage: number;
        accuracy: number;
        efficiency: number;
    };
    validation: {
        methods: string[];
        criteria: object[];
        results: object[];
        accuracy: number;
        uncertainty: object;
        sensitivity: object[];
        calibration: object;
        verification: boolean;
    };
    predictiveCapabilities: {
        maintenance: boolean;
        failure: boolean;
        performance: boolean;
        quality: boolean;
        optimization: boolean;
        forecasting: object;
        scenarios: object[];
        confidence: number;
    };
    humanMachineInterface: {
        visualization: object;
        interaction: object;
        control: object;
        feedback: object;
        augmentedReality: boolean;
        virtualReality: boolean;
        mixedReality: boolean;
        hapticFeedback: boolean;
    };
    collaboration: {
        multiUser: boolean;
        sharing: object;
        versioning: object;
        access: object[];
        communication: object;
        annotation: object[];
        review: object;
        approval: object;
    };
    edgeComputingEnabled: boolean;
    edgeConfiguration: {
        nodes: object[];
        processing: object;
        storage: object;
        communication: object;
        synchronization: object;
        autonomy: number;
        latency: number;
    };
    cloudConfiguration: {
        provider: string;
        services: string[];
        storage: object;
        computing: object;
        analytics: object;
        ai: object;
        backup: object;
        disaster: object;
    };
    interoperability: {
        standards: string[];
        protocols: string[];
        formats: string[];
        apis: object[];
        integrations: object[];
        mapping: object[];
        translation: object[];
        federation: boolean;
    };
    environmentalSimulation: {
        climate: object;
        atmosphere: object;
        lighting: object;
        acoustics: object;
        vibration: object;
        electromagnetic: object;
        radiation: object;
        contamination: object;
    };
    lifecycle: {
        stage: string;
        version: string;
        updates: object[];
        maintenance: object;
        migration: object;
        retirement: object;
        archive: object;
        disposal: object;
    };
    resourceManagement: {
        computational: object;
        storage: object;
        network: object;
        licensing: object;
        maintenance: object;
        operation: object;
        optimization: object;
        allocation: object;
    };
    analytics: {
        realTime: boolean;
        batch: boolean;
        streaming: boolean;
        statistical: object;
        machine: object;
        deep: object;
        quantum: object;
        federated: boolean;
    };
    digitalThread: {
        design: object;
        manufacturing: object;
        quality: object;
        service: object;
        feedback: object;
        traceability: boolean;
        provenance: object;
        lineage: object[];
    };
    simulationResults: {
        current: object;
        historical: object[];
        predictions: object[];
        scenarios: object[];
        optimization: object[];
        validation: object;
        visualization: object[];
        reports: string[];
    };
    workCenterId: string;
    workCenter: WorkCenter;
    productionLineId: string;
    productionLine: ProductionLine;
    aiInsights: AIInsight[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    approvedBy: string;
    approvedAt: Date;
    isActive(): boolean;
    isSynchronized(): boolean;
    getPerformanceScore(): number;
    calculateComputationalLoad(): object;
    runSimulation(parameters: object): object;
    synchronizeWithPhysical(): boolean;
    predictFutureState(horizon: number): object;
    private simulatePerformance;
    private predictMaintenance;
    private predictFailure;
    private predictQuality;
    private calculateUncertainty;
    optimizeParameters(objectives: string[]): object;
    enableQuantumComputing(): boolean;
    enableBlockchain(): boolean;
    validateSecurity(): string[];
    generateReport(): object;
    private generateRecommendations;
    clone(newTwinCode: string): Partial<DigitalTwin>;
    archive(): void;
}
//# sourceMappingURL=DigitalTwin.d.ts.map