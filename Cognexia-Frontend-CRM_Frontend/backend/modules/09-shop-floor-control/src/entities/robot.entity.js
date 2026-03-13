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
import { WorkCell } from './work-cell.entity';
import { RobotTask } from './robot-task.entity';
import { SafetyIncident } from './safety-incident.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
// Enums for Industry 5.0 Robotics
export var RobotType;
(function (RobotType) {
    RobotType["ARTICULATED"] = "articulated";
    RobotType["SCARA"] = "scara";
    RobotType["DELTA"] = "delta";
    RobotType["CARTESIAN"] = "cartesian";
    RobotType["COLLABORATIVE"] = "collaborative";
    RobotType["MOBILE"] = "mobile";
    RobotType["HUMANOID"] = "humanoid";
    RobotType["AGV"] = "agv";
    RobotType["DRONE"] = "drone";
    RobotType["EXOSKELETON"] = "exoskeleton";
})(RobotType || (RobotType = {}));
export var RobotState;
(function (RobotState) {
    RobotState["IDLE"] = "idle";
    RobotState["ASSIGNED"] = "assigned";
    RobotState["EXECUTING"] = "executing";
    RobotState["PAUSED"] = "paused";
    RobotState["ERROR"] = "error";
    RobotState["MAINTENANCE"] = "maintenance";
    RobotState["CALIBRATING"] = "calibrating";
    RobotState["LEARNING"] = "learning";
    RobotState["EMERGENCY_STOP"] = "emergency_stop";
    RobotState["OFFLINE"] = "offline";
})(RobotState || (RobotState = {}));
export var OperatingMode;
(function (OperatingMode) {
    OperatingMode["MANUAL"] = "manual";
    OperatingMode["SEMI_AUTOMATIC"] = "semi_automatic";
    OperatingMode["AUTOMATIC"] = "automatic";
    OperatingMode["COLLABORATIVE"] = "collaborative";
    OperatingMode["AUTONOMOUS"] = "autonomous";
    OperatingMode["AI_DRIVEN"] = "ai_driven";
    OperatingMode["SWARM"] = "swarm";
})(OperatingMode || (OperatingMode = {}));
export var SafetyStandard;
(function (SafetyStandard) {
    SafetyStandard["ISO_10218"] = "iso_10218";
    SafetyStandard["ISO_13849"] = "iso_13849";
    SafetyStandard["IEC_61508"] = "iec_61508";
    SafetyStandard["ANSI_RIA_R15_06"] = "ansi_ria_r15_06";
    SafetyStandard["ISO_TS_15066"] = "iso_ts_15066";
})(SafetyStandard || (SafetyStandard = {}));
export var AICapability;
(function (AICapability) {
    AICapability["MACHINE_LEARNING"] = "machine_learning";
    AICapability["COMPUTER_VISION"] = "computer_vision";
    AICapability["NATURAL_LANGUAGE"] = "natural_language";
    AICapability["PREDICTIVE_ANALYTICS"] = "predictive_analytics";
    AICapability["REINFORCEMENT_LEARNING"] = "reinforcement_learning";
    AICapability["FEDERATED_LEARNING"] = "federated_learning";
    AICapability["QUANTUM_ML"] = "quantum_ml";
})(AICapability || (AICapability = {}));
let Robot = class Robot {
    // Hooks
    updateTimestamps() {
        if (this.status !== RobotState.OFFLINE && this.status !== RobotState.ERROR) {
            this.lastSeen = new Date();
        }
    }
    // Helper Methods
    isOnline() {
        return ![RobotState.OFFLINE, RobotState.ERROR, RobotState.EMERGENCY_STOP].includes(this.status);
    }
    isAvailable() {
        return this.status === RobotState.IDLE && this.isActive && !this.needsCalibration;
    }
    isCollaborativeMode() {
        return this.operatingMode === OperatingMode.COLLABORATIVE && this.isCollaborative;
    }
    needsMaintenance() {
        if (!this.nextMaintenanceDate)
            return false;
        return new Date() >= this.nextMaintenanceDate;
    }
    hasActiveAlerts() {
        return this.currentAlerts && this.currentAlerts.length > 0;
    }
    hasRecentErrors() {
        return this.recentErrors && this.recentErrors.length > 0;
    }
    getUtilization() {
        if (!this.performanceMetrics)
            return 0;
        return this.performanceMetrics.uptime || 0;
    }
    getOEE() {
        if (!this.performanceMetrics)
            return 0;
        return this.performanceMetrics.oee || 0;
    }
    isCapableOf(requirement) {
        if (requirement.payloadKg && this.capabilities.payloadKg < requirement.payloadKg)
            return false;
        if (requirement.reachMm && this.capabilities.reachMm < requirement.reachMm)
            return false;
        if (requirement.axes && this.capabilities.axes < requirement.axes)
            return false;
        if (requirement.maxSpeedMmS && this.capabilities.maxSpeedMmS < requirement.maxSpeedMmS)
            return false;
        if (requirement.visionSystem && !this.capabilities.visionSystem)
            return false;
        if (requirement.forceSensing && !this.capabilities.forceSensing)
            return false;
        return true;
    }
    updatePosition(position) {
        this.currentPosition = {
            ...this.currentPosition,
            ...position,
            timestamp: new Date()
        };
    }
    addAlert(alert) {
        if (!this.currentAlerts)
            this.currentAlerts = [];
        this.currentAlerts.push(alert);
    }
    clearAlerts() {
        this.currentAlerts = [];
    }
    addError(error) {
        if (!this.recentErrors)
            this.recentErrors = [];
        this.recentErrors.push(error);
        // Keep only last 10 errors
        if (this.recentErrors.length > 10) {
            this.recentErrors = this.recentErrors.slice(-10);
        }
        this.errorCount++;
        this.lastErrorOccurred = new Date();
    }
    clearErrors() {
        this.recentErrors = [];
    }
    emergencyStop(reason) {
        this.status = RobotState.EMERGENCY_STOP;
        this.isEmergencyStopped = true;
        this.addAlert(`Emergency stop: ${reason}`);
    }
    reset() {
        this.status = RobotState.IDLE;
        this.isEmergencyStopped = false;
        this.clearAlerts();
        this.currentTaskId = null;
    }
    startTask(taskId) {
        this.currentTaskId = taskId;
        this.status = RobotState.EXECUTING;
    }
    completeTask() {
        this.status = RobotState.IDLE;
        this.currentTaskId = null;
        this.tasksCompleted++;
        this.lastTaskCompleted = new Date();
    }
    failTask(reason) {
        this.status = RobotState.ERROR;
        this.currentTaskId = null;
        this.tasksFailedToday++;
        this.addError(`Task failed: ${reason}`);
    }
    updatePerformanceMetrics(metrics) {
        this.performanceMetrics = {
            ...this.performanceMetrics,
            ...metrics,
            lastUpdated: new Date()
        };
    }
    updateAIProfile(profile) {
        this.aiLearningProfile = {
            ...this.aiLearningProfile,
            ...profile
        };
    }
    getHealthScore() {
        let score = 100;
        if (this.hasActiveAlerts())
            score -= 10;
        if (this.hasRecentErrors())
            score -= 15;
        if (this.needsMaintenance())
            score -= 20;
        if (this.needsCalibration)
            score -= 10;
        if (this.errorCount > 5)
            score -= 15;
        if (this.performanceMetrics?.uptime && this.performanceMetrics.uptime < 85)
            score -= 20;
        if (this.batteryLevel && this.batteryLevel < 20)
            score -= 10;
        return Math.max(0, score);
    }
    getRobotSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            operatingMode: this.operatingMode,
            manufacturer: this.manufacturer,
            model: this.model,
            location: this.location,
            healthScore: this.getHealthScore(),
            utilization: this.getUtilization(),
            oee: this.getOEE(),
            isAvailable: this.isAvailable(),
            currentTaskId: this.currentTaskId,
            tasksCompleted: this.tasksCompleted,
            lastSeen: this.lastSeen,
            capabilities: {
                payload: this.capabilities.payloadKg,
                reach: this.capabilities.reachMm,
                collaborative: this.isCollaborative,
                hasAI: this.hasAI,
                hasVision: this.hasVision,
                hasForceSensing: this.hasForceSensing
            }
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Robot.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "name", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "displayName", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: RobotType
    }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: RobotState,
        default: RobotState.OFFLINE
    }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "status", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: OperatingMode,
        default: OperatingMode.MANUAL
    }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "operatingMode", void 0);
__decorate([
    Column({ length: 100 }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "manufacturer", void 0);
__decorate([
    Column({ length: 100 }),
    Index(),
    __metadata("design:type", String)
], Robot.prototype, "model", void 0);
__decorate([
    Column({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "serialNumber", void 0);
__decorate([
    Column({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "firmwareVersion", void 0);
__decorate([
    Column({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "softwareVersion", void 0);
__decorate([
    Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "manufacturingDate", void 0);
__decorate([
    Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "installationDate", void 0);
__decorate([
    Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "lastCalibrationDate", void 0);
__decorate([
    Column({ length: 45, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "ipAddress", void 0);
__decorate([
    Column({ length: 17, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "macAddress", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Robot.prototype, "port", void 0);
__decorate([
    ManyToOne(() => WorkCell, workCell => workCell.robots, { nullable: true }),
    __metadata("design:type", WorkCell)
], Robot.prototype, "workCell", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "workCellId", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "location", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "facility", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "department", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "productionLine", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "workstation", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Robot.prototype, "capabilities", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Robot.prototype, "safetyConfiguration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "currentPosition", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "targetPosition", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Robot.prototype, "currentSpeed", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Robot.prototype, "currentLoad", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Robot.prototype, "batteryLevel", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Robot.prototype, "temperature", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "performanceMetrics", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "aiLearningProfile", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "currentTaskId", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Robot.prototype, "taskQueue", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "tasksCompleted", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "tasksFailedToday", void 0);
__decorate([
    Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "totalOperatingHours", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "totalCycles", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "totalEnergyConsumed", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "totalMaintenanceEvents", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "lastSeen", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "lastTaskCompleted", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "lastMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "nextMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Robot.prototype, "lastErrorOccurred", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Robot.prototype, "currentAlerts", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Robot.prototype, "recentErrors", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Robot.prototype, "errorCount", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Robot.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Robot.prototype, "tags", void 0);
__decorate([
    Column({ default: true }),
    Index(),
    __metadata("design:type", Boolean)
], Robot.prototype, "isActive", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "isCollaborative", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "hasAI", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "hasVision", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "hasForceSensing", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "isLearning", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "isSimulated", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "needsCalibration", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "isEmergencyStopped", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], Robot.prototype, "hasDigitalTwin", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "digitalTwinId", void 0);
__decorate([
    OneToMany(() => RobotTask, task => task.robot),
    __metadata("design:type", Array)
], Robot.prototype, "tasks", void 0);
__decorate([
    OneToMany(() => SafetyIncident, incident => incident.robot),
    __metadata("design:type", Array)
], Robot.prototype, "safetyIncidents", void 0);
__decorate([
    OneToMany(() => MaintenanceRecord, record => record.robot),
    __metadata("design:type", Array)
], Robot.prototype, "maintenanceRecords", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Robot.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Robot.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Robot.prototype, "updatedBy", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Robot.prototype, "updateTimestamps", null);
Robot = __decorate([
    Entity('robots'),
    Index(['type', 'status']),
    Index(['workCellId', 'status']),
    Index(['manufacturer', 'model']),
    Index(['operatingMode'])
], Robot);
export { Robot };
//# sourceMappingURL=robot.entity.js.map