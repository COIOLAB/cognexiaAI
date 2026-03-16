var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IoTDevice, ConnectivityType, SecurityLevel } from './iot-device.entity';
export var GatewayType;
(function (GatewayType) {
    GatewayType["EDGE_GATEWAY"] = "edge_gateway";
    GatewayType["INDUSTRIAL_GATEWAY"] = "industrial_gateway";
    GatewayType["CELLULAR_GATEWAY"] = "cellular_gateway";
    GatewayType["WIFI_GATEWAY"] = "wifi_gateway";
    GatewayType["SATELLITE_GATEWAY"] = "satellite_gateway";
    GatewayType["MESH_GATEWAY"] = "mesh_gateway";
    GatewayType["QUANTUM_GATEWAY"] = "quantum_gateway";
    GatewayType["AI_GATEWAY"] = "ai_gateway";
    GatewayType["BLOCKCHAIN_GATEWAY"] = "blockchain_gateway";
})(GatewayType || (GatewayType = {}));
export var GatewayStatus;
(function (GatewayStatus) {
    GatewayStatus["ONLINE"] = "online";
    GatewayStatus["OFFLINE"] = "offline";
    GatewayStatus["MAINTENANCE"] = "maintenance";
    GatewayStatus["ERROR"] = "error";
    GatewayStatus["OVERLOADED"] = "overloaded";
    GatewayStatus["DEGRADED"] = "degraded";
    GatewayStatus["UPDATING"] = "updating";
})(GatewayStatus || (GatewayStatus = {}));
let Gateway = class Gateway {
    // Lifecycle methods
    updateTimestamps() {
        if (this.status === GatewayStatus.ONLINE) {
            this.lastSeen = new Date();
        }
        this.lastHealthCheck = new Date();
    }
    // Helper methods
    isOnline() {
        return this.status === GatewayStatus.ONLINE;
    }
    isHealthy() {
        return [GatewayStatus.ONLINE, GatewayStatus.UPDATING].includes(this.status);
    }
    needsMaintenance() {
        if (!this.nextMaintenanceDate)
            return false;
        return new Date() >= this.nextMaintenanceDate;
    }
    isOverloaded() {
        return this.status === GatewayStatus.OVERLOADED ||
            (this.cpuUsage && this.cpuUsage > 90) ||
            (this.memoryUsage && this.memoryUsage > 90) ||
            (this.connectedDevicesCount >= this.networkConfig.maxDevices);
    }
    hasHighLatency() {
        return this.averageLatency > 1000; // > 1 second
    }
    hasHighErrorRate() {
        if (!this.performanceMetrics)
            return false;
        return this.performanceMetrics.errorRate > 5; // > 5%
    }
    canAcceptNewDevice() {
        return this.isOnline() &&
            !this.isOverloaded() &&
            this.connectedDevicesCount < this.networkConfig.maxDevices;
    }
    getCapacityUtilization() {
        return (this.connectedDevicesCount / this.networkConfig.maxDevices) * 100;
    }
    getGatewayHealth() {
        const factors = {
            connectivity: this.isOnline(),
            cpu: this.cpuUsage || 0,
            memory: this.memoryUsage || 0,
            storage: this.storageUsage || 0,
            capacity: this.getCapacityUtilization(),
            latency: this.averageLatency,
            errorRate: this.performanceMetrics?.errorRate || 0,
            uptime: this.performanceMetrics?.uptime || 0,
            temperature: this.temperature || 25,
            maintenance: !this.needsMaintenance()
        };
        let healthScore = 0;
        // Connectivity (20 points)
        if (factors.connectivity)
            healthScore += 20;
        // Resource usage (30 points total)
        if (factors.cpu < 70)
            healthScore += 10;
        else if (factors.cpu < 85)
            healthScore += 5;
        if (factors.memory < 70)
            healthScore += 10;
        else if (factors.memory < 85)
            healthScore += 5;
        if (factors.storage < 80)
            healthScore += 10;
        else if (factors.storage < 90)
            healthScore += 5;
        // Performance (25 points total)
        if (factors.capacity < 80)
            healthScore += 10;
        else if (factors.capacity < 90)
            healthScore += 5;
        if (factors.latency < 500)
            healthScore += 10;
        else if (factors.latency < 1000)
            healthScore += 5;
        if (factors.errorRate < 1)
            healthScore += 5;
        // Uptime and maintenance (25 points total)
        if (factors.uptime > 99)
            healthScore += 15;
        else if (factors.uptime > 95)
            healthScore += 10;
        else if (factors.uptime > 90)
            healthScore += 5;
        if (factors.maintenance)
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
    updatePerformanceMetrics(metrics) {
        this.performanceMetrics = {
            ...this.performanceMetrics,
            ...metrics
        };
    }
    addDevice() {
        this.connectedDevicesCount++;
    }
    removeDevice() {
        if (this.connectedDevicesCount > 0) {
            this.connectedDevicesCount--;
        }
    }
    updateLastSeen() {
        this.lastSeen = new Date();
        if (this.status === GatewayStatus.OFFLINE) {
            this.status = GatewayStatus.ONLINE;
        }
    }
    processMessage() {
        this.totalMessagesProcessed++;
    }
    processData(sizeInMB) {
        this.totalDataProcessed += sizeInMB;
    }
    recordError() {
        this.errorCount++;
    }
    updateResourceUsage(cpu, memory, storage, network) {
        this.cpuUsage = cpu;
        this.memoryUsage = memory;
        this.storageUsage = storage;
        this.networkUsage = network;
        // Check for overload condition
        if (cpu > 95 || memory > 95 || this.connectedDevicesCount >= this.networkConfig.maxDevices) {
            this.status = GatewayStatus.OVERLOADED;
        }
        else if (this.status === GatewayStatus.OVERLOADED && cpu < 80 && memory < 80) {
            this.status = GatewayStatus.ONLINE;
        }
    }
    getNetworkProtocols() {
        return this.networkConfig.supportedProtocols || [];
    }
    supportsProtocol(protocol) {
        return this.getNetworkProtocols().includes(protocol);
    }
    hasEdgeAI() {
        return this.hasAICapabilities && this.edgeCapabilities?.hasAIProcessing;
    }
    hasQuantumSecurity() {
        return this.hasQuantumCapabilities && this.securityFeatures?.hasQuantumSafeEncryption;
    }
    canProcessAtEdge() {
        return this.supportsEdgeComputing && this.edgeCapabilities?.hasDataPreprocessing;
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            location: this.location,
            connectedDevices: this.connectedDevicesCount,
            maxDevices: this.networkConfig?.maxDevices,
            cpuUsage: this.cpuUsage,
            memoryUsage: this.memoryUsage,
            averageLatency: this.averageLatency,
            isActive: this.isActive,
            lastSeen: this.lastSeen,
            health: this.getGatewayHealth()
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Gateway.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    Index(),
    __metadata("design:type", String)
], Gateway.prototype, "name", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: GatewayType,
        default: GatewayType.EDGE_GATEWAY
    }),
    Index(),
    __metadata("design:type", String)
], Gateway.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: GatewayStatus,
        default: GatewayStatus.OFFLINE
    }),
    Index(),
    __metadata("design:type", String)
], Gateway.prototype, "status", void 0);
__decorate([
    Column({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "description", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    Index(),
    __metadata("design:type", String)
], Gateway.prototype, "location", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "facility", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "department", void 0);
__decorate([
    Column({ length: 45, nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "ipAddress", void 0);
__decorate([
    Column({ length: 17, unique: true }),
    __metadata("design:type", String)
], Gateway.prototype, "macAddress", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "hostname", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "port", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: ConnectivityType,
        array: true,
        default: [ConnectivityType.WIFI, ConnectivityType.ETHERNET]
    }),
    __metadata("design:type", Array)
], Gateway.prototype, "supportedConnectivity", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "firmwareVersion", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "hardwareRevision", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "serialNumber", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "manufacturerName", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "modelNumber", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: SecurityLevel,
        default: SecurityLevel.HIGH
    }),
    __metadata("design:type", String)
], Gateway.prototype, "securityLevel", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Gateway.prototype, "edgeCapabilities", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Gateway.prototype, "securityFeatures", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Gateway.prototype, "networkConfig", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Gateway.prototype, "performanceMetrics", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Gateway.prototype, "lastSeen", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Gateway.prototype, "lastHealthCheck", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Gateway.prototype, "lastMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Gateway.prototype, "nextMaintenanceDate", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "cpuUsage", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "memoryUsage", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "storageUsage", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "networkUsage", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "temperature", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Gateway.prototype, "connectedDevicesCount", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Gateway.prototype, "totalDataProcessed", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Gateway.prototype, "totalMessagesProcessed", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Gateway.prototype, "errorCount", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Gateway.prototype, "averageLatency", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "latitude", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "longitude", void 0);
__decorate([
    Column({ type: 'decimal', precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Gateway.prototype, "altitude", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Gateway.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Gateway.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Gateway.prototype, "tags", void 0);
__decorate([
    Column({ default: true }),
    Index(),
    __metadata("design:type", Boolean)
], Gateway.prototype, "isActive", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "isRedundant", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "isLoadBalancer", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "hasAICapabilities", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "hasQuantumCapabilities", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "hasBlockchainCapabilities", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "supportsEdgeComputing", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Gateway.prototype, "isSimulated", void 0);
__decorate([
    OneToMany(() => IoTDevice, device => device.gateway),
    __metadata("design:type", Array)
], Gateway.prototype, "devices", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "primaryGatewayId", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Gateway.prototype, "backupGatewayIds", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Gateway.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Gateway.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Gateway.prototype, "updatedBy", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Gateway.prototype, "updateTimestamps", null);
Gateway = __decorate([
    Entity('gateways'),
    Index(['type', 'status']),
    Index(['location', 'status']),
    Index(['isActive'])
], Gateway);
export { Gateway };
//# sourceMappingURL=gateway.entity.js.map