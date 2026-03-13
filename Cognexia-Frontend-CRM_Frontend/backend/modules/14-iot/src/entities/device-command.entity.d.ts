import { IoTDevice } from './iot-device.entity';
export declare enum CommandType {
    START = "start",
    STOP = "stop",
    RESTART = "restart",
    RESET = "reset",
    SHUTDOWN = "shutdown",
    SLEEP = "sleep",
    WAKE = "wake",
    SET_CONFIG = "set_config",
    GET_CONFIG = "get_config",
    UPDATE_FIRMWARE = "update_firmware",
    CALIBRATE = "calibrate",
    FACTORY_RESET = "factory_reset",
    READ_SENSOR = "read_sensor",
    START_STREAMING = "start_streaming",
    STOP_STREAMING = "stop_streaming",
    SET_SAMPLING_RATE = "set_sampling_rate",
    CLEAR_BUFFER = "clear_buffer",
    MOVE_TO_POSITION = "move_to_position",
    SET_OUTPUT = "set_output",
    TOGGLE_OUTPUT = "toggle_output",
    SET_THRESHOLD = "set_threshold",
    RUN_DIAGNOSTICS = "run_diagnostics",
    SELF_TEST = "self_test",
    LOG_REPORT = "log_report",
    BACKUP_DATA = "backup_data",
    TRAIN_MODEL = "train_model",
    UPDATE_MODEL = "update_model",
    RUN_INFERENCE = "run_inference",
    OPTIMIZE_PERFORMANCE = "optimize_performance",
    ROTATE_KEYS = "rotate_keys",
    UPDATE_CERTIFICATES = "update_certificates",
    ENABLE_ENCRYPTION = "enable_encryption",
    SECURITY_SCAN = "security_scan",
    INITIALIZE_QUANTUM_STATE = "initialize_quantum_state",
    RUN_QUANTUM_ALGORITHM = "run_quantum_algorithm",
    QUANTUM_ERROR_CORRECTION = "quantum_error_correction",
    MOVE_TO_COORDINATE = "move_to_coordinate",
    PICK_OBJECT = "pick_object",
    PLACE_OBJECT = "place_object",
    PERFORM_TASK = "perform_task",
    EMERGENCY_STOP = "emergency_stop",
    CUSTOM = "custom"
}
export declare enum CommandStatus {
    PENDING = "pending",
    QUEUED = "queued",
    EXECUTING = "executing",
    COMPLETED = "completed",
    FAILED = "failed",
    TIMEOUT = "timeout",
    CANCELLED = "cancelled",
    RETRY = "retry"
}
export declare enum CommandPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export declare enum CommandSource {
    USER = "user",
    SYSTEM = "system",
    AI_AGENT = "ai_agent",
    SCHEDULER = "scheduler",
    API = "api",
    AUTOMATION = "automation",
    MAINTENANCE = "maintenance",
    SECURITY = "security",
    EMERGENCY = "emergency"
}
export interface CommandResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
    resourcesUsed: {
        cpu: number;
        memory: number;
        network: number;
    };
    sideEffects?: string[];
    warnings?: string[];
}
export interface AICommandContext {
    modelUsed?: string;
    confidence: number;
    alternatives?: Array<{
        command: string;
        confidence: number;
    }>;
    reasoning: string;
}
export declare class DeviceCommand {
    id: string;
    device: IoTDevice;
    deviceId: string;
    commandType: CommandType;
    status: CommandStatus;
    priority: CommandPriority;
    source: CommandSource;
    description?: string;
    parameters?: Record<string, any>;
    result?: CommandResult;
    aiContext?: AICommandContext;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    timeoutSeconds?: number;
    executionDuration?: number;
    retryCount: number;
    maxRetries: number;
    retryDelaySeconds?: number;
    dependsOnCommands?: string[];
    blocksCommands?: string[];
    authorizedBy?: string;
    authorizationToken?: string;
    securityLevel?: string;
    metadata?: Record<string, any>;
    tags?: string[];
    isUrgent: boolean;
    requiresConfirmation: boolean;
    isReversible: boolean;
    hasBeenExecuted: boolean;
    isSimulated: boolean;
    logExecution: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    executedBy?: string;
    parentCommandId?: string;
    childCommandIds?: string[];
    setDefaults(): void;
    canExecute(): boolean;
    isTimedOut(): boolean;
    shouldRetry(): boolean;
    getExecutionTime(): number | null;
    isExpired(): boolean;
    markAsStarted(): void;
    markAsCompleted(result: CommandResult): void;
    markAsFailed(error: string, canRetry?: boolean): void;
    markAsCancelled(reason?: string): void;
    markAsTimedOut(): void;
    addToQueue(): void;
    isHighPriority(): boolean;
    isEmergency(): boolean;
    requiresAuthorization(): boolean;
    getPriorityScore(): number;
    serialize(): Record<string, any>;
}
//# sourceMappingURL=device-command.entity.d.ts.map