import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { RobotTask } from './robot-task.entity';

export enum StepType {
  MOVE = 'move',
  PICK = 'pick',
  PLACE = 'place',
  WELD = 'weld',
  PAINT = 'paint',
  INSPECT = 'inspect',
  MACHINE = 'machine',
  WAIT = 'wait',
  SYNCHRONIZE = 'synchronize',
  VALIDATE = 'validate',
  SCAN = 'scan',
  MEASURE = 'measure',
  CALIBRATE = 'calibrate',
  LEARN = 'learn',
  ADAPT = 'adapt',
  CUSTOM = 'custom'
}

export enum StepStatus {
  PENDING = 'pending',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum InteractionType {
  NONE = 'none',
  HUMAN_SUPERVISION = 'human_supervision',
  HUMAN_ASSISTANCE = 'human_assistance',
  HUMAN_APPROVAL = 'human_approval',
  ROBOT_COORDINATION = 'robot_coordination',
  SYSTEM_INTEGRATION = 'system_integration'
}

export interface StepPosition {
  x: number;
  y: number;
  z: number;
  rx?: number; // rotation around x-axis
  ry?: number; // rotation around y-axis
  rz?: number; // rotation around z-axis
}

export interface StepParameters {
  // Movement parameters
  speed?: number; // mm/s or deg/s
  acceleration?: number;
  deceleration?: number;
  precision?: number; // mm
  
  // Position parameters
  startPosition?: StepPosition;
  endPosition?: StepPosition;
  waypoints?: StepPosition[];
  
  // Tool parameters
  toolId?: string;
  toolSpeed?: number;
  toolForce?: number;
  toolSettings?: Record<string, any>;
  
  // Safety parameters
  safetyZone?: string;
  maxForce?: number;
  maxTorque?: number;
  collisionSensitivity?: number;
  
  // Quality parameters
  tolerances?: Record<string, number>;
  inspectionCriteria?: Record<string, any>;
  measurementPoints?: StepPosition[];
  
  // Timing parameters
  dwellTime?: number; // seconds to wait at position
  timeout?: number; // maximum execution time
  
  // Synchronization parameters
  waitForSignal?: string;
  sendSignal?: string;
  syncWithSteps?: string[]; // other step IDs to sync with
  
  // AI/Learning parameters
  adaptationEnabled?: boolean;
  learningMode?: boolean;
  modelParameters?: Record<string, any>;
  
  // Environmental parameters
  requiresCleanRoom?: boolean;
  temperatureRange?: { min: number; max: number };
  humidityRange?: { min: number; max: number };
}

export interface StepResult {
  success: boolean;
  executionTime: number; // seconds
  
  // Position results
  actualStartPosition?: StepPosition;
  actualEndPosition?: StepPosition;
  positionError?: number; // mm
  
  // Quality results
  measurements?: Record<string, number>;
  inspectionResult?: 'pass' | 'fail' | 'warning';
  qualityScore?: number;
  
  // Performance results
  actualSpeed?: number;
  actualForce?: number;
  energyConsumed?: number; // Wh
  
  // Output data
  capturedImages?: string[];
  sensorData?: Record<string, any>;
  toolData?: Record<string, any>;
  
  // Error information
  errors?: string[];
  warnings?: string[];
  
  // Learning data
  adaptationData?: Record<string, any>;
  performanceMetrics?: Record<string, number>;
}

export interface ValidationCriteria {
  positionTolerance?: number; // mm
  orientationTolerance?: number; // degrees
  forceTolerance?: number; // N
  speedTolerance?: number; // percentage
  timingTolerance?: number; // seconds
  qualityThreshold?: number; // percentage
  customValidations?: Array<{
    parameter: string;
    expectedValue: any;
    tolerance: number;
    units: string;
  }>;
}

@Entity('task_steps')
@Index(['taskId', 'stepOrder'])
@Index(['status'])
@Index(['type'])
export class TaskStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 1000, nullable: true })
  description?: string;

  @Column({ length: 500, nullable: true })
  instructions?: string;

  @Column({
    type: 'enum',
    enum: StepType
  })
  @Index()
  type: StepType;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING
  })
  @Index()
  status: StepStatus;

  @Column({
    type: 'enum',
    enum: InteractionType,
    default: InteractionType.NONE
  })
  interactionType: InteractionType;

  // Relationship
  @ManyToOne(() => RobotTask, task => task.steps, { onDelete: 'CASCADE' })
  task: RobotTask;

  @Column()
  @Index()
  taskId: string;

  // Step sequencing
  @Column({ type: 'int' })
  @Index()
  stepOrder: number;

  @Column({ type: 'text', array: true, nullable: true })
  dependsOnSteps?: string[]; // Step IDs this step depends on

  @Column({ type: 'text', array: true, nullable: true })
  blocksSteps?: string[]; // Step IDs blocked by this step

  @Column({ default: false })
  isParallel: boolean; // Can execute in parallel with other steps

  @Column({ default: false })
  isCritical: boolean; // Critical step - failure fails entire task

  @Column({ default: false })
  isOptional: boolean; // Optional step - can be skipped

  // Step configuration
  @Column({ type: 'jsonb' })
  parameters: StepParameters;

  @Column({ type: 'jsonb', nullable: true })
  result?: StepResult;

  @Column({ type: 'jsonb', nullable: true })
  validationCriteria?: ValidationCriteria;

  // Timing
  @Column({ type: 'int', nullable: true })
  estimatedDuration?: number; // seconds

  @Column({ type: 'int', nullable: true })
  actualDuration?: number; // seconds

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  // Retry handling
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'text', array: true, nullable: true })
  errors?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  warnings?: string[];

  // Quality and validation
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore?: number;

  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  positionAccuracy?: number; // mm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  speedAccuracy?: number; // percentage

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  forceAccuracy?: number; // N

  // Tool and equipment
  @Column({ nullable: true })
  requiredToolId?: string;

  @Column({ nullable: true })
  requiredEquipmentId?: string;

  @Column({ type: 'jsonb', nullable: true })
  toolConfiguration?: Record<string, any>;

  // Safety and compliance
  @Column({ type: 'text', array: true, nullable: true })
  safetyRequirements?: string[];

  @Column({ default: false })
  requiresSafetyStop: boolean;

  @Column({ default: false })
  requiresOperatorPresence: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Human interaction
  @Column({ type: 'int', nullable: true })
  humanInteractionDuration?: number; // seconds

  @Column({ nullable: true })
  assignedOperatorId?: string;

  @Column({ type: 'jsonb', nullable: true })
  humanInstructions?: Record<string, any>;

  // Learning and adaptation
  @Column({ default: false })
  enableLearning: boolean;

  @Column({ default: false })
  hasBeenOptimized: boolean;

  @Column({ type: 'jsonb', nullable: true })
  learningData?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  adaptationHistory?: Array<{
    timestamp: Date;
    parameter: string;
    oldValue: any;
    newValue: any;
    improvement: number;
  }>;

  // Performance metrics
  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  energyConsumed?: number; // Wh

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficiency?: number; // percentage

  @Column({ type: 'int', nullable: true })
  cycleTime?: number; // seconds

  // Configuration and metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: false })
  isSimulated: boolean;

  @Column({ default: false })
  requiresCalibration: boolean;

  @Column({ default: false })
  hasDigitalTwin: boolean;

  @Column({ default: false })
  isReversible: boolean;

  @Column({ default: false })
  canBeParallelized: boolean;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateStep() {
    // Ensure step order is valid
    if (this.stepOrder < 0) {
      throw new Error('Step order must be non-negative');
    }

    // Validate timing constraints
    if (this.estimatedDuration && this.estimatedDuration <= 0) {
      throw new Error('Estimated duration must be positive');
    }

    // Validate retry limits
    if (this.maxRetries < 0) {
      throw new Error('Max retries must be non-negative');
    }
  }

  // Helper Methods
  canStart(): boolean {
    return this.status === StepStatus.READY && 
           this.areDependenciesMet() &&
           this.isApproved();
  }

  areDependenciesMet(): boolean {
    // This would need to check actual dependency status
    // Simplified implementation
    return true;
  }

  isApproved(): boolean {
    return !this.requiresApproval || !!this.approvedBy;
  }

  isCompleted(): boolean {
    return this.status === StepStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === StepStatus.FAILED;
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  isOverdue(): boolean {
    if (!this.scheduledAt || this.isCompleted()) return false;
    return new Date() > this.scheduledAt;
  }

  getExecutionProgress(): number {
    if (!this.startedAt || this.isCompleted()) {
      return this.isCompleted() ? 100 : 0;
    }

    if (!this.estimatedDuration) return 0;

    const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
    return Math.min(100, (elapsed / this.estimatedDuration) * 100);
  }

  getRemainingTime(): number {
    if (!this.startedAt || !this.estimatedDuration || this.isCompleted()) return 0;
    
    const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
    return Math.max(0, this.estimatedDuration - elapsed);
  }

  start(): void {
    if (!this.canStart()) {
      throw new Error('Step cannot be started');
    }

    this.status = StepStatus.IN_PROGRESS;
    this.startedAt = new Date();
  }

  pause(): void {
    if (this.status === StepStatus.IN_PROGRESS) {
      this.status = StepStatus.PAUSED;
    }
  }

  resume(): void {
    if (this.status === StepStatus.PAUSED) {
      this.status = StepStatus.IN_PROGRESS;
    }
  }

  complete(result: StepResult): void {
    this.status = StepStatus.COMPLETED;
    this.completedAt = new Date();
    this.result = result;

    if (this.startedAt) {
      this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }

    // Extract quality metrics from result
    if (result.qualityScore !== undefined) {
      this.qualityScore = result.qualityScore;
    }

    if (result.energyConsumed !== undefined) {
      this.energyConsumed = result.energyConsumed;
    }

    // Calculate efficiency
    if (this.estimatedDuration && this.actualDuration) {
      this.efficiency = (this.estimatedDuration / this.actualDuration) * 100;
    }
  }

  fail(reason: string): void {
    this.status = StepStatus.FAILED;
    this.completedAt = new Date();

    if (!this.errors) this.errors = [];
    this.errors.push(reason);

    if (this.startedAt) {
      this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
  }

  skip(reason?: string): void {
    this.status = StepStatus.SKIPPED;
    this.completedAt = new Date();

    if (reason) {
      if (!this.warnings) this.warnings = [];
      this.warnings.push(`Skipped: ${reason}`);
    }
  }

  cancel(reason?: string): void {
    this.status = StepStatus.CANCELLED;
    this.completedAt = new Date();

    if (reason) {
      if (!this.warnings) this.warnings = [];
      this.warnings.push(`Cancelled: ${reason}`);
    }
  }

  retry(): void {
    if (!this.canRetry()) {
      throw new Error('Step cannot be retried');
    }

    this.retryCount++;
    this.status = StepStatus.READY;
    this.completedAt = null;
    this.startedAt = null;
    this.result = null;

    // Clear previous execution errors but keep historical data
    const errorCount = this.errors?.length || 0;
    this.clearErrors();
    
    if (!this.warnings) this.warnings = [];
    this.warnings.push(`Retry attempt ${this.retryCount} after ${errorCount} errors`);
  }

  addError(error: string): void {
    if (!this.errors) this.errors = [];
    this.errors.push(error);
  }

  addWarning(warning: string): void {
    if (!this.warnings) this.warnings = [];
    this.warnings.push(warning);
  }

  clearErrors(): void {
    this.errors = [];
  }

  clearWarnings(): void {
    this.warnings = [];
  }

  approve(approvedBy: string): void {
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    
    if (this.status === StepStatus.PENDING) {
      this.status = StepStatus.READY;
    }
  }

  recordLearning(learningData: Record<string, any>): void {
    if (!this.learningData) this.learningData = {};
    this.learningData = { ...this.learningData, ...learningData };
    this.enableLearning = true;
  }

  recordAdaptation(parameter: string, oldValue: any, newValue: any, improvement: number): void {
    if (!this.adaptationHistory) this.adaptationHistory = [];
    
    this.adaptationHistory.push({
      timestamp: new Date(),
      parameter,
      oldValue,
      newValue,
      improvement
    });
    
    this.hasBeenOptimized = true;
  }

  updateParameters(newParameters: Partial<StepParameters>): void {
    this.parameters = { ...this.parameters, ...newParameters };
  }

  validateResult(): boolean {
    if (!this.result || !this.validationCriteria) return true;

    const criteria = this.validationCriteria;
    const result = this.result;

    // Position validation
    if (criteria.positionTolerance && result.positionError) {
      if (result.positionError > criteria.positionTolerance) return false;
    }

    // Quality validation
    if (criteria.qualityThreshold && result.qualityScore) {
      if (result.qualityScore < criteria.qualityThreshold) return false;
    }

    // Custom validations
    if (criteria.customValidations) {
      for (const validation of criteria.customValidations) {
        const actualValue = result.measurements?.[validation.parameter];
        if (actualValue !== undefined) {
          const diff = Math.abs(actualValue - validation.expectedValue);
          if (diff > validation.tolerance) return false;
        }
      }
    }

    return true;
  }

  getEfficiencyScore(): number {
    return this.efficiency || 0;
  }

  getQualityScore(): number {
    return this.qualityScore || 0;
  }

  getStepSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      stepOrder: this.stepOrder,
      interactionType: this.interactionType,
      isCritical: this.isCritical,
      isOptional: this.isOptional,
      isParallel: this.isParallel,
      estimatedDuration: this.estimatedDuration,
      actualDuration: this.actualDuration,
      remainingTime: this.getRemainingTime(),
      progress: this.getExecutionProgress(),
      qualityScore: this.getQualityScore(),
      efficiencyScore: this.getEfficiencyScore(),
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      requiresApproval: this.requiresApproval,
      requiresOperatorPresence: this.requiresOperatorPresence,
      enableLearning: this.enableLearning,
      hasBeenOptimized: this.hasBeenOptimized,
      canStart: this.canStart(),
      canRetry: this.canRetry(),
      isOverdue: this.isOverdue(),
      isApproved: this.isApproved(),
      scheduledAt: this.scheduledAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt
    };
  }
}
