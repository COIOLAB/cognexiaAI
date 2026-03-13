var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { DeviceAlert } from './device-alert.entity';
import { SensorReading } from './sensor-reading.entity';
import { DeviceCommand } from './device-command.entity';
import { Gateway } from './gateway.entity';
// Enums for Industry 5.0 IoT
export var DeviceType;
(function (DeviceType) {
    DeviceType["SENSOR"] = "sensor";
    DeviceType["ACTUATOR"] = "actuator";
    DeviceType["GATEWAY"] = "gateway";
    DeviceType["EDGE_DEVICE"] = "edge_device";
    DeviceType["SMART_DEVICE"] = "smart_device";
    DeviceType["ROBOT"] = "robot";
    DeviceType["COLLABORATIVE_ROBOT"] = "collaborative_robot";
    DeviceType["AGV"] = "agv";
    DeviceType["DRONE"] = "drone";
    DeviceType["WEARABLE"] = "wearable";
    DeviceType["BEACON"] = "beacon";
    DeviceType["CAMERA"] = "camera";
    DeviceType["AI_ACCELERATOR"] = "ai_accelerator";
    DeviceType["QUANTUM_SENSOR"] = "quantum_sensor";
})(DeviceType || (DeviceType = {}));
export var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["ONLINE"] = "online";
    DeviceStatus["OFFLINE"] = "offline";
    DeviceStatus["MAINTENANCE"] = "maintenance";
    DeviceStatus["ERROR"] = "error";
    DeviceStatus["CALIBRATING"] = "calibrating";
    DeviceStatus["UPDATING"] = "updating";
    DeviceStatus["SLEEPING"] = "sleeping";
    DeviceStatus["DEGRADED"] = "degraded";
    DeviceStatus["CRITICAL"] = "critical";
})(DeviceStatus || (DeviceStatus = {}));
export var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["LOW"] = "low";
    SecurityLevel["MEDIUM"] = "medium";
    SecurityLevel["HIGH"] = "high";
    SecurityLevel["CRITICAL"] = "critical";
    SecurityLevel["QUANTUM_SAFE"] = "quantum_safe";
})(SecurityLevel || (SecurityLevel = {}));
export var ConnectivityType;
(function (ConnectivityType) {
    ConnectivityType["WIFI"] = "wifi";
    ConnectivityType["ETHERNET"] = "ethernet";
    ConnectivityType["BLUETOOTH"] = "bluetooth";
    ConnectivityType["ZIGBEE"] = "zigbee";
    ConnectivityType["LORA"] = "lora";
    ConnectivityType["CELLULAR_4G"] = "cellular_4g";
    ConnectivityType["CELLULAR_5G"] = "cellular_5g";
    ConnectivityType["SATELLITE"] = "satellite";
    ConnectivityType["MESH_NETWORK"] = "mesh_network";
    ConnectivityType["QUANTUM_CHANNEL"] = "quantum_channel";
})(ConnectivityType || (ConnectivityType = {}));
let IoTDevice = class IoTDevice {
    // Methods for Industry 5.0 operations
    updateTimestamps() {
        if (this.status === DeviceStatus.ONLINE) {
            this.lastSeen = new Date();
        }
    }
    // Helper methods
    isOnline() {
        return this.status === DeviceStatus.ONLINE;
    }
    isHealthy() {
        return [DeviceStatus.ONLINE, DeviceStatus.CALIBRATING].includes(this.status);
    }
    needsMaintenance() {
        if (!this.nextMaintenanceDate)
            return false;
        return new Date() >= this.nextMaintenanceDate;
    }
    hasLowBattery() {
        return this.batteryLevel !== undefined && this.batteryLevel < 20;
    }
    hasWeakSignal() {
        return this.signalStrength !== undefined && this.signalStrength < 30;
    }
    hasAICapabilities() {
        return this.capabilities?.hasAI || false;
    }
    hasQuantumCapabilities() {
        return this.capabilities?.hasQuantumSensing || false;
    }
    canPerformEdgeComputing() {
        return this.capabilities?.hasEdgeComputing || false;
    }
    isQuantumSecure() {
        return this.securityLevel === SecurityLevel.QUANTUM_SAFE;
    }
    getDeviceHealth() {
        const factors = {
            connectivity: this.isOnline(),
            battery: this.batteryLevel || 100,
            signal: this.signalStrength || 100,
            maintenance: !this.needsMaintenance(),
            lastSeen: this.lastSeen ? (Date.now() - this.lastSeen.getTime()) / 1000 / 60 : 0 // minutes
        };
        let healthScore = 0;
        if (factors.connectivity)
            healthScore += 30;
        if (factors.battery > 80)
            healthScore += 20;
        else if (factors.battery > 50)
            healthScore += 15;
        else if (factors.battery > 20)
            healthScore += 10;
        if (factors.signal > 80)
            healthScore += 20;
        else if (factors.signal > 50)
            healthScore += 15;
        else if (factors.signal > 30)
            healthScore += 10;
        if (factors.maintenance)
            healthScore += 15;
        if (factors.lastSeen < 10)
            healthScore += 15; // Last seen within 10 minutes
        else if (factors.lastSeen < 60)
            healthScore += 10;
        let overall;
        if (healthScore >= 90)
            overall = 'excellent';
        else if (healthScore >= 75)
            overall = 'good';
        else if (healthScore >= 60)
            overall = 'fair';
        else if (healthScore >= 40)
            overall = 'poor';
        else
            overall = 'critical';
        return { overall, factors };
    }
    updateLastSeen() {
        this.lastSeen = new Date();
        if (this.status === DeviceStatus.OFFLINE) {
            this.status = DeviceStatus.ONLINE;
        }
    }
    recordDataPoint() {
        this.dataPointsCollected++;
        this.lastDataReceived = new Date();
    }
    executeCommand() {
        this.commandsExecuted++;
    }
    generateAlert() {
        this.alertsGenerated++;
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], IoTDevice.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    Index(),
    __metadata("design:type", String)
], IoTDevice.prototype, "name", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: DeviceType,
        default: DeviceType.SENSOR
    }),
    Index(),
    __metadata("design:type", String)
], IoTDevice.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: DeviceStatus,
        default: DeviceStatus.OFFLINE
    }),
    Index(),
    __metadata("design:type", String)
], IoTDevice.prototype, "status", void 0);
__decorate([
    Column({ length: 500, nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "description", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    Index(),
    __metadata("design:type", String)
], IoTDevice.prototype, "location", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    Index(),
    __metadata("design:type", String)
], IoTDevice.prototype, "facility", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "department", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "workCenter", void 0);
__decorate([
    Column({ length: 45, nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "ipAddress", void 0);
__decorate([
    Column({ length: 17, unique: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "macAddress", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: ConnectivityType,
        array: true,
        default: [ConnectivityType.WIFI]
    }),
    __metadata("design:type", Array)
], IoTDevice.prototype, "connectivityTypes", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "firmwareVersion", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "hardwareRevision", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "serialNumber", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "manufacturerName", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "modelNumber", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: SecurityLevel,
        default: SecurityLevel.MEDIUM
    }),
    __metadata("design:type", String)
], IoTDevice.prototype, "securityLevel", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "capabilities", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "technicalSpecs", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "aiConfiguration", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "securityConfiguration", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], IoTDevice.prototype, "lastSeen", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], IoTDevice.prototype, "lastDataReceived", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], IoTDevice.prototype, "lastMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], IoTDevice.prototype, "nextMaintenanceDate", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "batteryLevel", void 0);
__decorate([
    Column({ type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "powerConsumption", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "signalStrength", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "dataPointsCollected", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "commandsExecuted", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "alertsGenerated", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "latitude", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "longitude", void 0);
__decorate([
    Column({ type: 'decimal', precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "altitude", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "currentTemperature", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "currentHumidity", void 0);
__decorate([
    Column({ type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], IoTDevice.prototype, "currentPressure", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IoTDevice.prototype, "customAttributes", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], IoTDevice.prototype, "tags", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], IoTDevice.prototype, "isActive", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], IoTDevice.prototype, "isSimulated", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], IoTDevice.prototype, "hasDigitalTwin", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "digitalTwinId", void 0);
__decorate([
    ManyToOne(() => Gateway, gateway => gateway.devices, { nullable: true }),
    __metadata("design:type", Gateway)
], IoTDevice.prototype, "gateway", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "gatewayId", void 0);
__decorate([
    OneToMany(() => SensorReading, reading => reading.device),
    __metadata("design:type", Array)
], IoTDevice.prototype, "sensorReadings", void 0);
__decorate([
    OneToMany(() => DeviceAlert, alert => alert.device),
    __metadata("design:type", Array)
], IoTDevice.prototype, "alerts", void 0);
__decorate([
    OneToMany(() => DeviceCommand, command => command.device),
    __metadata("design:type", Array)
], IoTDevice.prototype, "commands", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], IoTDevice.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], IoTDevice.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], IoTDevice.prototype, "updatedBy", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IoTDevice.prototype, "updateTimestamps", null);
IoTDevice = __decorate([
    Entity('iot_devices'),
    Index(['type', 'status']),
    Index(['location', 'status']),
    Index(['gatewayId', 'status'])
], IoTDevice);
export { IoTDevice };
//# sourceMappingURL=iot-device.entity.js.map