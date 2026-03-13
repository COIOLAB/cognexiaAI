var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert } from 'typeorm';
import { IoTDevice } from './iot-device.entity';
export var CommandType;
(function (CommandType) {
    // Basic Commands
    CommandType["START"] = "start";
    CommandType["STOP"] = "stop";
    CommandType["RESTART"] = "restart";
    CommandType["RESET"] = "reset";
    CommandType["SHUTDOWN"] = "shutdown";
    CommandType["SLEEP"] = "sleep";
    CommandType["WAKE"] = "wake";
    // Configuration Commands
    CommandType["SET_CONFIG"] = "set_config";
    CommandType["GET_CONFIG"] = "get_config";
    CommandType["UPDATE_FIRMWARE"] = "update_firmware";
    CommandType["CALIBRATE"] = "calibrate";
    CommandType["FACTORY_RESET"] = "factory_reset";
    // Data Commands
    CommandType["READ_SENSOR"] = "read_sensor";
    CommandType["START_STREAMING"] = "start_streaming";
    CommandType["STOP_STREAMING"] = "stop_streaming";
    CommandType["SET_SAMPLING_RATE"] = "set_sampling_rate";
    CommandType["CLEAR_BUFFER"] = "clear_buffer";
    // Control Commands
    CommandType["MOVE_TO_POSITION"] = "move_to_position";
    CommandType["SET_OUTPUT"] = "set_output";
    CommandType["TOGGLE_OUTPUT"] = "toggle_output";
    CommandType["SET_THRESHOLD"] = "set_threshold";
    // Maintenance Commands
    CommandType["RUN_DIAGNOSTICS"] = "run_diagnostics";
    CommandType["SELF_TEST"] = "self_test";
    CommandType["LOG_REPORT"] = "log_report";
    CommandType["BACKUP_DATA"] = "backup_data";
    // AI/ML Commands
    CommandType["TRAIN_MODEL"] = "train_model";
    CommandType["UPDATE_MODEL"] = "update_model";
    CommandType["RUN_INFERENCE"] = "run_inference";
    CommandType["OPTIMIZE_PERFORMANCE"] = "optimize_performance";
    // Security Commands
    CommandType["ROTATE_KEYS"] = "rotate_keys";
    CommandType["UPDATE_CERTIFICATES"] = "update_certificates";
    CommandType["ENABLE_ENCRYPTION"] = "enable_encryption";
    CommandType["SECURITY_SCAN"] = "security_scan";
    // Quantum Commands
    CommandType["INITIALIZE_QUANTUM_STATE"] = "initialize_quantum_state";
    CommandType["RUN_QUANTUM_ALGORITHM"] = "run_quantum_algorithm";
    CommandType["QUANTUM_ERROR_CORRECTION"] = "quantum_error_correction";
    // Robotics Commands
    CommandType["MOVE_TO_COORDINATE"] = "move_to_coordinate";
    CommandType["PICK_OBJECT"] = "pick_object";
    CommandType["PLACE_OBJECT"] = "place_object";
    CommandType["PERFORM_TASK"] = "perform_task";
    CommandType["EMERGENCY_STOP"] = "emergency_stop";
    // Custom Commands
    CommandType["CUSTOM"] = "custom";
})(CommandType || (CommandType = {}));
export var CommandStatus;
(function (CommandStatus) {
    CommandStatus["PENDING"] = "pending";
    CommandStatus["QUEUED"] = "queued";
    CommandStatus["EXECUTING"] = "executing";
    CommandStatus["COMPLETED"] = "completed";
    CommandStatus["FAILED"] = "failed";
    CommandStatus["TIMEOUT"] = "timeout";
    CommandStatus["CANCELLED"] = "cancelled";
    CommandStatus["RETRY"] = "retry";
})(CommandStatus || (CommandStatus = {}));
export var CommandPriority;
(function (CommandPriority) {
    CommandPriority["LOW"] = "low";
    CommandPriority["NORMAL"] = "normal";
    CommandPriority["HIGH"] = "high";
    CommandPriority["CRITICAL"] = "critical";
    CommandPriority["EMERGENCY"] = "emergency";
})(CommandPriority || (CommandPriority = {}));
export var CommandSource;
(function (CommandSource) {
    CommandSource["USER"] = "user";
    CommandSource["SYSTEM"] = "system";
    CommandSource["AI_AGENT"] = "ai_agent";
    CommandSource["SCHEDULER"] = "scheduler";
    CommandSource["API"] = "api";
    CommandSource["AUTOMATION"] = "automation";
    CommandSource["MAINTENANCE"] = "maintenance";
    CommandSource["SECURITY"] = "security";
    CommandSource["EMERGENCY"] = "emergency";
})(CommandSource || (CommandSource = {}));
let DeviceCommand = class DeviceCommand {
    setDefaults() {
        if (!this.scheduledAt) {
            this.scheduledAt = new Date();
        }
        if (!this.timeoutSeconds) {
            // Set default timeout based on command type
            switch (this.commandType) {
                case CommandType.UPDATE_FIRMWARE:
                    this.timeoutSeconds = 1800; // 30 minutes
                    break;
                case CommandType.TRAIN_MODEL:
                    this.timeoutSeconds = 3600; // 1 hour
                    break;
                case CommandType.RUN_DIAGNOSTICS:
                    this.timeoutSeconds = 600; // 10 minutes
                    break;
                case CommandType.EMERGENCY_STOP:
                    this.timeoutSeconds = 5; // 5 seconds
                    break;
                default:
                    this.timeoutSeconds = 300; // 5 minutes default
            }
        }
    }
    // Helper methods
    canExecute() {
        return this.status === CommandStatus.PENDING ||
            this.status === CommandStatus.QUEUED ||
            (this.status === CommandStatus.FAILED && this.retryCount < this.maxRetries);
    }
    isTimedOut() {
        if (!this.startedAt || !this.timeoutSeconds)
            return false;
        const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
        return elapsed > this.timeoutSeconds;
    }
    shouldRetry() {
        return this.status === CommandStatus.FAILED &&
            this.retryCount < this.maxRetries;
    }
    getExecutionTime() {
        if (!this.startedAt || !this.completedAt)
            return null;
        return this.completedAt.getTime() - this.startedAt.getTime();
    }
    isExpired() {
        if (!this.scheduledAt)
            return false;
        // Commands expire after 24 hours if not executed
        const expirationTime = new Date(this.scheduledAt.getTime() + 24 * 60 * 60 * 1000);
        return Date.now() > expirationTime.getTime();
    }
    markAsStarted() {
        this.status = CommandStatus.EXECUTING;
        this.startedAt = new Date();
        this.hasBeenExecuted = true;
    }
    markAsCompleted(result) {
        this.status = CommandStatus.COMPLETED;
        this.completedAt = new Date();
        this.result = result;
        if (this.startedAt) {
            this.executionDuration = this.getExecutionTime();
        }
    }
    markAsFailed(error, canRetry = true) {
        this.status = canRetry && this.shouldRetry() ? CommandStatus.RETRY : CommandStatus.FAILED;
        this.completedAt = new Date();
        this.result = {
            success: false,
            error,
            executionTime: this.getExecutionTime() || 0,
            resourcesUsed: { cpu: 0, memory: 0, network: 0 }
        };
        if (this.shouldRetry()) {
            this.retryCount++;
        }
    }
    markAsCancelled(reason) {
        this.status = CommandStatus.CANCELLED;
        this.completedAt = new Date();
        this.result = {
            success: false,
            error: reason || 'Command cancelled',
            executionTime: this.getExecutionTime() || 0,
            resourcesUsed: { cpu: 0, memory: 0, network: 0 }
        };
    }
    markAsTimedOut() {
        this.status = CommandStatus.TIMEOUT;
        this.completedAt = new Date();
        this.result = {
            success: false,
            error: `Command timed out after ${this.timeoutSeconds} seconds`,
            executionTime: this.timeoutSeconds * 1000,
            resourcesUsed: { cpu: 0, memory: 0, network: 0 }
        };
    }
    addToQueue() {
        this.status = CommandStatus.QUEUED;
    }
    isHighPriority() {
        return [CommandPriority.HIGH, CommandPriority.CRITICAL, CommandPriority.EMERGENCY].includes(this.priority);
    }
    isEmergency() {
        return this.priority === CommandPriority.EMERGENCY;
    }
    requiresAuthorization() {
        return this.isHighPriority() ||
            this.commandType === CommandType.FACTORY_RESET ||
            this.commandType === CommandType.UPDATE_FIRMWARE ||
            this.commandType === CommandType.EMERGENCY_STOP;
    }
    getPriorityScore() {
        const priorityScores = {
            [CommandPriority.LOW]: 1,
            [CommandPriority.NORMAL]: 2,
            [CommandPriority.HIGH]: 3,
            [CommandPriority.CRITICAL]: 4,
            [CommandPriority.EMERGENCY]: 5
        };
        return priorityScores[this.priority];
    }
    serialize() {
        return {
            id: this.id,
            deviceId: this.deviceId,
            commandType: this.commandType,
            status: this.status,
            priority: this.priority,
            parameters: this.parameters,
            result: this.result,
            createdAt: this.createdAt,
            scheduledAt: this.scheduledAt,
            completedAt: this.completedAt,
            executionDuration: this.executionDuration
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], DeviceCommand.prototype, "id", void 0);
__decorate([
    ManyToOne(() => IoTDevice, device => device.commands, {
        onDelete: 'CASCADE',
        eager: false
    }),
    __metadata("design:type", IoTDevice)
], DeviceCommand.prototype, "device", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], DeviceCommand.prototype, "deviceId", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: CommandType
    }),
    Index(),
    __metadata("design:type", String)
], DeviceCommand.prototype, "commandType", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: CommandStatus,
        default: CommandStatus.PENDING
    }),
    Index(),
    __metadata("design:type", String)
], DeviceCommand.prototype, "status", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: CommandPriority,
        default: CommandPriority.NORMAL
    }),
    Index(),
    __metadata("design:type", String)
], DeviceCommand.prototype, "priority", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: CommandSource,
        default: CommandSource.USER
    }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "source", void 0);
__decorate([
    Column({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "description", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeviceCommand.prototype, "parameters", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeviceCommand.prototype, "result", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeviceCommand.prototype, "aiContext", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DeviceCommand.prototype, "scheduledAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DeviceCommand.prototype, "startedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DeviceCommand.prototype, "completedAt", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DeviceCommand.prototype, "timeoutSeconds", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DeviceCommand.prototype, "executionDuration", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DeviceCommand.prototype, "retryCount", void 0);
__decorate([
    Column({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], DeviceCommand.prototype, "maxRetries", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DeviceCommand.prototype, "retryDelaySeconds", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], DeviceCommand.prototype, "dependsOnCommands", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], DeviceCommand.prototype, "blocksCommands", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "authorizedBy", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "authorizationToken", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "securityLevel", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeviceCommand.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], DeviceCommand.prototype, "tags", void 0);
__decorate([
    Column({ default: false }),
    Index(),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "isUrgent", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "requiresConfirmation", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "isReversible", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "hasBeenExecuted", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "isSimulated", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceCommand.prototype, "logExecution", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], DeviceCommand.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], DeviceCommand.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "updatedBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "executedBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], DeviceCommand.prototype, "parentCommandId", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], DeviceCommand.prototype, "childCommandIds", void 0);
__decorate([
    BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeviceCommand.prototype, "setDefaults", null);
DeviceCommand = __decorate([
    Entity('device_commands'),
    Index(['deviceId', 'status']),
    Index(['commandType', 'status']),
    Index(['createdAt']),
    Index(['priority', 'status'])
], DeviceCommand);
export { DeviceCommand };
//# sourceMappingURL=device-command.entity.js.map