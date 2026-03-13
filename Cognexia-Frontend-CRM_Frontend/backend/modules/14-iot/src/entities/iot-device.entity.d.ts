import { DeviceAlert } from './device-alert.entity';
import { SensorReading } from './sensor-reading.entity';
import { DeviceCommand } from './device-command.entity';
import { Gateway } from './gateway.entity';
export declare enum DeviceType {
    SENSOR = "sensor",
    ACTUATOR = "actuator",
    GATEWAY = "gateway",
    EDGE_DEVICE = "edge_device",
    SMART_DEVICE = "smart_device",
    ROBOT = "robot",
    COLLABORATIVE_ROBOT = "collaborative_robot",
    AGV = "agv",// Automated Guided Vehicle
    DRONE = "drone",
    WEARABLE = "wearable",
    BEACON = "beacon",
    CAMERA = "camera",
    AI_ACCELERATOR = "ai_accelerator",
    QUANTUM_SENSOR = "quantum_sensor"
}
export declare enum DeviceStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    MAINTENANCE = "maintenance",
    ERROR = "error",
    CALIBRATING = "calibrating",
    UPDATING = "updating",
    SLEEPING = "sleeping",
    DEGRADED = "degraded",
    CRITICAL = "critical"
}
export declare enum SecurityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    QUANTUM_SAFE = "quantum_safe"
}
export declare enum ConnectivityType {
    WIFI = "wifi",
    ETHERNET = "ethernet",
    BLUETOOTH = "bluetooth",
    ZIGBEE = "zigbee",
    LORA = "lora",
    CELLULAR_4G = "cellular_4g",
    CELLULAR_5G = "cellular_5g",
    SATELLITE = "satellite",
    MESH_NETWORK = "mesh_network",
    QUANTUM_CHANNEL = "quantum_channel"
}
export interface DeviceCapabilities {
    hasAI: boolean;
    hasEdgeComputing: boolean;
    hasQuantumSensing: boolean;
    hasBlockchainWallet: boolean;
    supportsMachineLearning: boolean;
    hasComputerVision: boolean;
    hasNaturalLanguageProcessing: boolean;
    hasDigitalTwin: boolean;
    canLearn: boolean;
    hasAutonomousMode: boolean;
}
export interface TechnicalSpecs {
    processingPower: number;
    memorySize: number;
    storageCapacity: number;
    batteryCapacity?: number;
    operatingTemperatureMin: number;
    operatingTemperatureMax: number;
    ipRating?: string;
    powerConsumption: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
        weight: number;
    };
    certifications: string[];
}
export interface AIConfiguration {
    modelVersions: Record<string, string>;
    inferenceAcceleration: boolean;
    edgeTensorProcessing: boolean;
    quantumMLEnabled: boolean;
    federatedLearning: boolean;
    continuousLearning: boolean;
    explainableAI: boolean;
}
export interface SecurityConfiguration {
    encryption: {
        algorithm: string;
        keyLength: number;
        quantumResistant: boolean;
    };
    authentication: {
        method: string;
        certificateAuth: boolean;
        biometricAuth: boolean;
        blockchainAuth: boolean;
    };
    networkSecurity: {
        vpnEnabled: boolean;
        firewallEnabled: boolean;
        intrusionDetection: boolean;
        zeroTrustEnabled: boolean;
    };
}
export declare class IoTDevice {
    id: string;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    description?: string;
    location?: string;
    facility?: string;
    department?: string;
    workCenter?: string;
    ipAddress?: string;
    macAddress: string;
    connectivityTypes: ConnectivityType[];
    firmwareVersion?: string;
    hardwareRevision?: string;
    serialNumber?: string;
    manufacturerName?: string;
    modelNumber?: string;
    securityLevel: SecurityLevel;
    capabilities: DeviceCapabilities;
    technicalSpecs: TechnicalSpecs;
    aiConfiguration?: AIConfiguration;
    securityConfiguration: SecurityConfiguration;
    lastSeen?: Date;
    lastDataReceived?: Date;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    batteryLevel?: number;
    powerConsumption?: number;
    signalStrength?: number;
    dataPointsCollected: number;
    commandsExecuted: number;
    alertsGenerated: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    currentTemperature?: number;
    currentHumidity?: number;
    currentPressure?: number;
    configuration?: Record<string, any>;
    metadata?: Record<string, any>;
    customAttributes?: Record<string, any>;
    tags?: string[];
    isActive: boolean;
    isSimulated: boolean;
    hasDigitalTwin: boolean;
    digitalTwinId?: string;
    gateway?: Gateway;
    gatewayId?: string;
    sensorReadings: SensorReading[];
    alerts: DeviceAlert[];
    commands: DeviceCommand[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    updateTimestamps(): void;
    isOnline(): boolean;
    isHealthy(): boolean;
    needsMaintenance(): boolean;
    hasLowBattery(): boolean;
    hasWeakSignal(): boolean;
    hasAICapabilities(): boolean;
    hasQuantumCapabilities(): boolean;
    canPerformEdgeComputing(): boolean;
    isQuantumSecure(): boolean;
    getDeviceHealth(): {
        overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        factors: Record<string, any>;
    };
    updateLastSeen(): void;
    recordDataPoint(): void;
    executeCommand(): void;
    generateAlert(): void;
}
//# sourceMappingURL=iot-device.entity.d.ts.map