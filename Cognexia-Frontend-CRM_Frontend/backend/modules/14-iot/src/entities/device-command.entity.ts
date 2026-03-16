import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert
} from 'typeorm';
import { IoTDevice } from './iot-device.entity';

export enum CommandType {
  // Basic Commands
  START = 'start',
  STOP = 'stop',
  RESTART = 'restart',
  RESET = 'reset',
  SHUTDOWN = 'shutdown',
  SLEEP = 'sleep',
  WAKE = 'wake',
  
  // Configuration Commands
  SET_CONFIG = 'set_config',
  GET_CONFIG = 'get_config',
  UPDATE_FIRMWARE = 'update_firmware',
  CALIBRATE = 'calibrate',
  FACTORY_RESET = 'factory_reset',
  
  // Data Commands
  READ_SENSOR = 'read_sensor',
  START_STREAMING = 'start_streaming',
  STOP_STREAMING = 'stop_streaming',
  SET_SAMPLING_RATE = 'set_sampling_rate',
  CLEAR_BUFFER = 'clear_buffer',
  
  // Control Commands
  MOVE_TO_POSITION = 'move_to_position',
  SET_OUTPUT = 'set_output',
  TOGGLE_OUTPUT = 'toggle_output',
  SET_THRESHOLD = 'set_threshold',
  
  // Maintenance Commands
  RUN_DIAGNOSTICS = 'run_diagnostics',
  SELF_TEST = 'self_test',
  LOG_REPORT = 'log_report',
  BACKUP_DATA = 'backup_data',
  
  // AI/ML Commands
  TRAIN_MODEL = 'train_model',
  UPDATE_MODEL = 'update_model',
  RUN_INFERENCE = 'run_inference',
  OPTIMIZE_PERFORMANCE = 'optimize_performance',
  
  // Security Commands
  ROTATE_KEYS = 'rotate_keys',
  UPDATE_CERTIFICATES = 'update_certificates',
  ENABLE_ENCRYPTION = 'enable_encryption',
  SECURITY_SCAN = 'security_scan',
  
  // Quantum Commands
  INITIALIZE_QUANTUM_STATE = 'initialize_quantum_state',
  RUN_QUANTUM_ALGORITHM = 'run_quantum_algorithm',
  QUANTUM_ERROR_CORRECTION = 'quantum_error_correction',
  
  // Robotics Commands
  MOVE_TO_COORDINATE = 'move_to_coordinate',
  PICK_OBJECT = 'pick_object',
  PLACE_OBJECT = 'place_object',
  PERFORM_TASK = 'perform_task',
  EMERGENCY_STOP = 'emergency_stop',
  
  // Custom Commands
  CUSTOM = 'custom'
}

export enum CommandStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  RETRY = 'retry'
}

export enum CommandPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum CommandSource {
  USER = 'user',
  SYSTEM = 'system',
  AI_AGENT = 'ai_agent',
  SCHEDULER = 'scheduler',
  API = 'api',
  AUTOMATION = 'automation',
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  EMERGENCY = 'emergency'
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

@Entity('device_commands')
@Index(['deviceId', 'status'])
@Index(['commandType', 'status'])
@Index(['createdAt'])
@Index(['priority', 'status'])
export class DeviceCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IoTDevice, device => device.commands, { 
    onDelete: 'CASCADE',
    eager: false
  })
  device: IoTDevice;

  @Column()
  @Index()
  deviceId: string;

  @Column({
    type: 'enum',
    enum: CommandType
  })
  @Index()
  commandType: CommandType;

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.PENDING
  })
  @Index()
  status: CommandStatus;

  @Column({
    type: 'enum',
    enum: CommandPriority,
    default: CommandPriority.NORMAL
  })
  @Index()
  priority: CommandPriority;

  @Column({
    type: 'enum',
    enum: CommandSource,
    default: CommandSource.USER
  })
  source: CommandSource;

  @Column({ length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  result?: CommandResult;

  @Column({ type: 'jsonb', nullable: true })
  aiContext?: AICommandContext;

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', nullable: true })
  timeoutSeconds?: number; // Command timeout in seconds

  @Column({ type: 'int', nullable: true })
  executionDuration?: number; // Actual execution time in milliseconds

  // Retry logic
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'int', nullable: true })
  retryDelaySeconds?: number;

  // Dependencies
  @Column({ type: 'text', array: true, nullable: true })
  dependsOnCommands?: string[]; // Command IDs this command depends on

  @Column({ type: 'text', array: true, nullable: true })
  blocksCommands?: string[]; // Command IDs this command blocks

  // Security and Authorization
  @Column({ nullable: true })
  authorizedBy?: string; // User ID who authorized the command

  @Column({ type: 'text', nullable: true })
  authorizationToken?: string;

  @Column({ nullable: true })
  securityLevel?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: false })
  @Index()
  isUrgent: boolean;

  @Column({ default: false })
  requiresConfirmation: boolean;

  @Column({ default: false })
  isReversible: boolean;

  @Column({ default: false })
  hasBeenExecuted: boolean;

  @Column({ default: false })
  isSimulated: boolean; // For testing purposes

  @Column({ default: false })
  logExecution: boolean;

  // Audit trail
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  executedBy?: string; // System/user that actually executed the command

  // Command chain
  @Column({ nullable: true })
  parentCommandId?: string; // If this is a sub-command

  @Column({ type: 'text', array: true, nullable: true })
  childCommandIds?: string[]; // Sub-commands spawned by this command

  @BeforeInsert()
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
  canExecute(): boolean {
    return this.status === CommandStatus.PENDING || 
           this.status === CommandStatus.QUEUED ||
           (this.status === CommandStatus.FAILED && this.retryCount < this.maxRetries);
  }

  isTimedOut(): boolean {
    if (!this.startedAt || !this.timeoutSeconds) return false;
    const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
    return elapsed > this.timeoutSeconds;
  }

  shouldRetry(): boolean {
    return this.status === CommandStatus.FAILED && 
           this.retryCount < this.maxRetries;
  }

  getExecutionTime(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    return this.completedAt.getTime() - this.startedAt.getTime();
  }

  isExpired(): boolean {
    if (!this.scheduledAt) return false;
    // Commands expire after 24 hours if not executed
    const expirationTime = new Date(this.scheduledAt.getTime() + 24 * 60 * 60 * 1000);
    return Date.now() > expirationTime.getTime();
  }

  markAsStarted(): void {
    this.status = CommandStatus.EXECUTING;
    this.startedAt = new Date();
    this.hasBeenExecuted = true;
  }

  markAsCompleted(result: CommandResult): void {
    this.status = CommandStatus.COMPLETED;
    this.completedAt = new Date();
    this.result = result;
    if (this.startedAt) {
      this.executionDuration = this.getExecutionTime()!;
    }
  }

  markAsFailed(error: string, canRetry: boolean = true): void {
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

  markAsCancelled(reason?: string): void {
    this.status = CommandStatus.CANCELLED;
    this.completedAt = new Date();
    this.result = {
      success: false,
      error: reason || 'Command cancelled',
      executionTime: this.getExecutionTime() || 0,
      resourcesUsed: { cpu: 0, memory: 0, network: 0 }
    };
  }

  markAsTimedOut(): void {
    this.status = CommandStatus.TIMEOUT;
    this.completedAt = new Date();
    this.result = {
      success: false,
      error: `Command timed out after ${this.timeoutSeconds} seconds`,
      executionTime: this.timeoutSeconds! * 1000,
      resourcesUsed: { cpu: 0, memory: 0, network: 0 }
    };
  }

  addToQueue(): void {
    this.status = CommandStatus.QUEUED;
  }

  isHighPriority(): boolean {
    return [CommandPriority.HIGH, CommandPriority.CRITICAL, CommandPriority.EMERGENCY].includes(this.priority);
  }

  isEmergency(): boolean {
    return this.priority === CommandPriority.EMERGENCY;
  }

  requiresAuthorization(): boolean {
    return this.isHighPriority() || 
           this.commandType === CommandType.FACTORY_RESET ||
           this.commandType === CommandType.UPDATE_FIRMWARE ||
           this.commandType === CommandType.EMERGENCY_STOP;
  }

  getPriorityScore(): number {
    const priorityScores = {
      [CommandPriority.LOW]: 1,
      [CommandPriority.NORMAL]: 2,
      [CommandPriority.HIGH]: 3,
      [CommandPriority.CRITICAL]: 4,
      [CommandPriority.EMERGENCY]: 5
    };
    return priorityScores[this.priority];
  }

  serialize(): Record<string, any> {
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
}
