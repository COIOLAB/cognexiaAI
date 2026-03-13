import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Robot } from './robot.entity';

export enum TaskType {
  PICK_AND_PLACE = 'pick_and_place',
  WELDING = 'welding',
  PAINTING = 'painting',
  ASSEMBLY = 'assembly',
  INSPECTION = 'inspection',
  MACHINING = 'machining',
  PACKAGING = 'packaging',
  MATERIAL_HANDLING = 'material_handling',
  QUALITY_CONTROL = 'quality_control',
  MAINTENANCE = 'maintenance',
  CALIBRATION = 'calibration',
  CUSTOM = 'custom'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ABORTED = 'aborted'
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

@Entity('robot_tasks')
@Index(['robotId', 'status'])
@Index(['priority', 'scheduledStartTime'])
@Index(['taskType', 'status'])
export class RobotTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.CUSTOM
  })
  taskType: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NORMAL
  })
  priority: TaskPriority;

  // Task scheduling
  @Column('timestamp', { nullable: true })
  scheduledStartTime?: Date;

  @Column('timestamp', { nullable: true })
  scheduledEndTime?: Date;

  @Column('timestamp', { nullable: true })
  actualStartTime?: Date;

  @Column('timestamp', { nullable: true })
  actualEndTime?: Date;

  @Column('int', { nullable: true })
  estimatedDurationMinutes?: number;

  @Column('int', { nullable: true })
  actualDurationMinutes?: number;

  // Task parameters and configuration
  @Column('json', { nullable: true })
  parameters?: Record<string, any>;

  @Column('json', { nullable: true })
  waypoints?: Array<{
    position: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
    speed?: number;
    acceleration?: number;
    blendRadius?: number;
  }>;

  @Column('json', { nullable: true })
  toolSettings?: {
    toolType: string;
    settings: Record<string, any>;
  };

  @Column('json', { nullable: true })
  safetySettings?: {
    maxSpeed: number;
    maxForce: number;
    safetyZones: string[];
  };

  // Quality and requirements
  @Column('json', { nullable: true })
  qualityRequirements?: {
    tolerance: number;
    precision: number;
    requirements: string[];
  };

  @Column('json', { nullable: true })
  materialProperties?: {
    type: string;
    weight: number;
    dimensions: { length: number; width: number; height: number };
    properties: Record<string, any>;
  };

  // Progress tracking
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column('int', { default: 0 })
  currentStep: number;

  @Column('int', { default: 1 })
  totalSteps: number;

  @Column('json', { nullable: true })
  stepDetails?: Array<{
    stepNumber: number;
    name: string;
    status: string;
    startTime?: Date;
    endTime?: Date;
    result?: any;
  }>;

  // Results and metrics
  @Column('json', { nullable: true })
  results?: {
    success: boolean;
    qualityScore: number;
    metrics: Record<string, any>;
    outputs: Record<string, any>;
  };

  @Column('json', { nullable: true })
  performance?: {
    cycleTime: number;
    efficiency: number;
    accuracy: number;
    repeatability: number;
  };

  // Error handling
  @Column('json', { nullable: true })
  lastError?: {
    code: string;
    message: string;
    timestamp: Date;
    severity: string;
    context?: Record<string, any>;
  };

  @Column('int', { default: 0 })
  errorCount: number;

  @Column('int', { default: 3 })
  maxRetries: number;

  @Column('int', { default: 0 })
  retryCount: number;

  // Dependencies and relationships
  @Column('uuid', { nullable: true })
  parentTaskId?: string;

  @Column('simple-array', { nullable: true })
  dependsOnTasks?: string[];

  @Column('simple-array', { nullable: true })
  blockedTasks?: string[];

  @Column({ nullable: true })
  workOrderId?: string;

  @Column({ nullable: true })
  productionPlanId?: string;

  // Resource requirements
  @Column('simple-array', { nullable: true })
  requiredTools?: string[];

  @Column('simple-array', { nullable: true })
  requiredMaterials?: string[];

  @Column('json', { nullable: true })
  resourceUsage?: {
    energy: number;
    materials: Record<string, number>;
    time: number;
  };

  // Compliance and traceability
  @Column('simple-array', { nullable: true })
  complianceRequirements?: string[];

  @Column('json', { nullable: true })
  traceabilityData?: {
    batchNumber?: string;
    lotNumber?: string;
    serialNumbers?: string[];
    certificates?: string[];
  };

  // Human-robot collaboration
  @Column('boolean', { default: false })
  requiresHumanInteraction: boolean;

  @Column('json', { nullable: true })
  humanInteractionSteps?: Array<{
    stepNumber: number;
    description: string;
    instructions: string;
    safetyNotes: string;
  }>;

  @Column({ nullable: true })
  assignedOperator?: string;

  // Notifications and alerts
  @Column('json', { nullable: true })
  notifications?: Array<{
    type: string;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }>;

  @Column('boolean', { default: true })
  enableAlerts: boolean;

  @Column('simple-array', { nullable: true })
  alertRecipients?: string[];

  // Versioning and templates
  @Column({ default: '1.0.0' })
  version: string;

  @Column({ nullable: true })
  templateId?: string;

  @Column('boolean', { default: false })
  isTemplate: boolean;

  // Additional metadata
  @Column('json', { nullable: true })
  tags?: Record<string, string>;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Robot relationship
  @ManyToOne(() => Robot, robot => robot.tasks)
  @JoinColumn({ name: 'robotId' })
  robot: Robot;

  @Column()
  robotId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === TaskStatus.FAILED || this.status === TaskStatus.ABORTED;
  }

  get isActive(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  get isPending(): boolean {
    return this.status === TaskStatus.PENDING;
  }

  get duration(): number | null {
    if (this.actualStartTime && this.actualEndTime) {
      return Math.floor((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60));
    }
    return null;
  }

  get isOverdue(): boolean {
    if (!this.scheduledEndTime) return false;
    return new Date() > this.scheduledEndTime && !this.isCompleted;
  }

  get estimatedTimeRemaining(): number | null {
    if (!this.actualStartTime || !this.estimatedDurationMinutes) return null;
    const elapsed = Math.floor((new Date().getTime() - this.actualStartTime.getTime()) / (1000 * 60));
    return Math.max(0, this.estimatedDurationMinutes - elapsed);
  }

  // Methods
  start(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.actualStartTime = new Date();
    this.updatedAt = new Date();
  }

  pause(): void {
    this.status = TaskStatus.PAUSED;
    this.updatedAt = new Date();
  }

  resume(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  complete(results?: any): void {
    this.status = TaskStatus.COMPLETED;
    this.actualEndTime = new Date();
    this.progressPercentage = 100;
    if (results) {
      this.results = results;
    }
    this.updatedAt = new Date();
  }

  fail(error: { code: string; message: string; severity: string; context?: any }): void {
    this.status = TaskStatus.FAILED;
    this.lastError = {
      ...error,
      timestamp: new Date()
    };
    this.errorCount++;
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = TaskStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  abort(): void {
    this.status = TaskStatus.ABORTED;
    this.updatedAt = new Date();
  }

  updateProgress(percentage: number, currentStep?: number): void {
    this.progressPercentage = Math.min(100, Math.max(0, percentage));
    if (currentStep !== undefined) {
      this.currentStep = currentStep;
    }
    this.updatedAt = new Date();
  }

  addNotification(type: string, message: string): void {
    if (!this.notifications) {
      this.notifications = [];
    }
    this.notifications.push({
      type,
      message,
      timestamp: new Date(),
      acknowledged: false
    });
    this.updatedAt = new Date();
  }

  retry(): boolean {
    if (this.retryCount >= this.maxRetries) {
      return false;
    }
    this.retryCount++;
    this.status = TaskStatus.PENDING;
    this.progressPercentage = 0;
    this.currentStep = 0;
    this.lastError = null;
    this.updatedAt = new Date();
    return true;
  }
}
