import { WorkCenter } from './WorkCenter';
export declare enum DeviceType {
    SENSOR = "sensor",
    ACTUATOR = "actuator",
    GATEWAY = "gateway",
    CAMERA = "camera",
    CONTROLLER = "controller",
    MONITOR = "monitor",
    ANALYZER = "analyzer",
    BEACON = "beacon"
}
export declare enum DeviceStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    MAINTENANCE = "maintenance",
    ERROR = "error",
    CALIBRATING = "calibrating",
    STANDBY = "standby"
}
export declare enum CommunicationProtocol {
    MQTT = "mqtt",
    HTTP = "http",
    WEBSOCKET = "websocket",
    MODBUS = "modbus",
    OPCUA = "opcua",
    BLUETOOTH = "bluetooth",
    WIFI = "wifi",
    ETHERNET = "ethernet"
}
export declare class IoTDevice {
    id: string;
    deviceCode: string;
    deviceName: string;
    description: string;
    deviceType: DeviceType;
    status: DeviceStatus;
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareVersion: string;
    hardwareVersion: string;
    ipAddress: string;
    macAddress: string;
    communicationProtocol: CommunicationProtocol;
    port: number;
    networkConfig: {
        ssid: string;
        security: string;
        signalStrength: number;
        bandwidth: number;
        latency: number;
    };
    location: string;
    latitude: number;
    longitude: number;
    altitude: number;
    physicalProperties: {
        dimensions: object;
        weight: number;
        mountingType: string;
        enclosureRating: string;
        operatingTemperature: object;
        operatingHumidity: object;
    };
    dataPoints: {
        parameters: string[];
        units: object;
        ranges: object;
        accuracy: object;
        precision: object;
        samplingRate: number;
    };
    reportingInterval: number;
    lastDataReceived: Date;
    currentReadings: {
        values: object;
        timestamp: Date;
        quality: string;
        alarms: object[];
    };
    powerConfig: {
        powerSource: string;
        voltage: number;
        current: number;
        batteryLevel: number;
        batteryType: string;
        powerConsumption: number;
        sleepMode: boolean;
    };
    securityConfig: {
        authentication: string;
        encryption: string;
        certificates: string[];
        accessKeys: string[];
        permissions: object;
    };
    lastCalibration: Date;
    nextCalibrationDue: Date;
    calibrationIntervalDays: number;
    calibrationData: {
        procedure: string;
        reference: string;
        results: object[];
        accuracy: number;
        drift: number;
        adjustments: object[];
    };
    lastMaintenance: Date;
    nextMaintenanceDue: Date;
    alertConfig: {
        thresholds: object[];
        recipients: string[];
        methods: string[];
        escalation: object[];
        suppressionRules: object[];
    };
    activeAlerts: {
        alerts: object[];
        acknowledgements: object[];
        suppressions: object[];
    };
    performance: {
        uptime: number;
        availability: number;
        reliability: number;
        dataQuality: number;
        responseTime: number;
        throughput: number;
    };
    healthMetrics: {
        cpu: number;
        memory: number;
        storage: number;
        temperature: number;
        humidity: number;
        vibration: number;
        diagnostics: object[];
    };
    hasEdgeComputing: boolean;
    edgeConfig: {
        capabilities: string[];
        storage: number;
        processing: string;
        aiModels: string[];
        localAnalytics: boolean;
        offlineMode: boolean;
    };
    integrationConfig: {
        protocols: string[];
        apis: string[];
        subscriptions: object[];
        publications: object[];
        dataFormat: string;
        compression: string;
    };
    installationDate: Date;
    installedBy: string;
    warrantyExpiry: Date;
    installationNotes: {
        procedure: string;
        configuration: object;
        testing: object[];
        issues: string[];
        photos: string[];
    };
    lifecycle: {
        stage: string;
        expectedLife: number;
        actualLife: number;
        replacementPlan: object;
        upgradePath: string[];
    };
    purchaseCost: number;
    installationCost: number;
    maintenanceCost: number;
    operatingCost: number;
    workCenterId: string;
    workCenter: WorkCenter;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isOnline(): boolean;
    isHealthy(): boolean;
    getHealthScore(): number;
    needsCalibration(): boolean;
    needsMaintenance(): boolean;
    getUptimePercentage(): number;
    getDataFreshness(): number;
    getBatteryStatus(): string;
    updateStatus(newStatus: DeviceStatus, userId?: string): void;
    recordData(data: object): void;
    addAlert(alert: object): void;
    acknowledgeAlert(alertId: string, userId: string): void;
    performCalibration(results: object, userId?: string): void;
    validateConfiguration(): string[];
    generateStatusReport(): object;
    clone(newDeviceCode: string): Partial<IoTDevice>;
    estimateRemainingLife(): number;
    calculateTotalCost(): number;
    updateHealthMetrics(metrics: object): void;
}
//# sourceMappingURL=IoTDevice.d.ts.map