import { IoTDevice, ConnectivityType, SecurityLevel } from './iot-device.entity';
export declare enum GatewayType {
    EDGE_GATEWAY = "edge_gateway",
    INDUSTRIAL_GATEWAY = "industrial_gateway",
    CELLULAR_GATEWAY = "cellular_gateway",
    WIFI_GATEWAY = "wifi_gateway",
    SATELLITE_GATEWAY = "satellite_gateway",
    MESH_GATEWAY = "mesh_gateway",
    QUANTUM_GATEWAY = "quantum_gateway",
    AI_GATEWAY = "ai_gateway",
    BLOCKCHAIN_GATEWAY = "blockchain_gateway"
}
export declare enum GatewayStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    MAINTENANCE = "maintenance",
    ERROR = "error",
    OVERLOADED = "overloaded",
    DEGRADED = "degraded",
    UPDATING = "updating"
}
export interface EdgeComputingCapabilities {
    hasAIProcessing: boolean;
    hasMLInference: boolean;
    hasDataPreprocessing: boolean;
    hasRealTimeAnalytics: boolean;
    hasLocalStorage: boolean;
    hasComputeOffloading: boolean;
    maxConcurrentTasks: number;
    processingPower: number;
    storageCapacity: number;
    memoryCapacity: number;
}
export interface SecurityFeatures {
    encryptionSupported: string[];
    authenticationMethods: string[];
    hasFirewall: boolean;
    hasIntrusionDetection: boolean;
    hasVPN: boolean;
    hasSecureBootLoader: boolean;
    hasTrustedPlatformModule: boolean;
    hasQuantumSafeEncryption: boolean;
    certificateAuthority?: string;
}
export interface NetworkConfiguration {
    maxDevices: number;
    supportedProtocols: string[];
    dataRateLimit: number;
    latencyOptimized: boolean;
    qosLevels: string[];
    loadBalancingEnabled: boolean;
    networkTopology: 'star' | 'mesh' | 'tree' | 'hybrid';
}
export interface PerformanceMetrics {
    dataProcessedToday: number;
    messagesProcessedToday: number;
    averageLatency: number;
    throughput: number;
    errorRate: number;
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    networkUsage: number;
}
export declare class Gateway {
    id: string;
    name: string;
    type: GatewayType;
    status: GatewayStatus;
    description?: string;
    location?: string;
    facility?: string;
    department?: string;
    ipAddress?: string;
    macAddress: string;
    hostname?: string;
    port?: number;
    supportedConnectivity: ConnectivityType[];
    firmwareVersion?: string;
    hardwareRevision?: string;
    serialNumber?: string;
    manufacturerName?: string;
    modelNumber?: string;
    securityLevel: SecurityLevel;
    edgeCapabilities: EdgeComputingCapabilities;
    securityFeatures: SecurityFeatures;
    networkConfig: NetworkConfiguration;
    performanceMetrics?: PerformanceMetrics;
    lastSeen?: Date;
    lastHealthCheck?: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    cpuUsage?: number;
    memoryUsage?: number;
    storageUsage?: number;
    networkUsage?: number;
    temperature?: number;
    connectedDevicesCount: number;
    totalDataProcessed: number;
    totalMessagesProcessed: number;
    errorCount: number;
    averageLatency: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: string[];
    isActive: boolean;
    isRedundant: boolean;
    isLoadBalancer: boolean;
    hasAICapabilities: boolean;
    hasQuantumCapabilities: boolean;
    hasBlockchainCapabilities: boolean;
    supportsEdgeComputing: boolean;
    isSimulated: boolean;
    devices: IoTDevice[];
    primaryGatewayId?: string;
    backupGatewayIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    updateTimestamps(): void;
    isOnline(): boolean;
    isHealthy(): boolean;
    needsMaintenance(): boolean;
    isOverloaded(): boolean;
    hasHighLatency(): boolean;
    hasHighErrorRate(): boolean;
    canAcceptNewDevice(): boolean;
    getCapacityUtilization(): number;
    getGatewayHealth(): {
        overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        factors: Record<string, any>;
    };
    updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void;
    addDevice(): void;
    removeDevice(): void;
    updateLastSeen(): void;
    processMessage(): void;
    processData(sizeInMB: number): void;
    recordError(): void;
    updateResourceUsage(cpu: number, memory: number, storage: number, network: number): void;
    getNetworkProtocols(): string[];
    supportsProtocol(protocol: string): boolean;
    hasEdgeAI(): boolean;
    hasQuantumSecurity(): boolean;
    canProcessAtEdge(): boolean;
    serialize(): Record<string, any>;
}
//# sourceMappingURL=gateway.entity.d.ts.map