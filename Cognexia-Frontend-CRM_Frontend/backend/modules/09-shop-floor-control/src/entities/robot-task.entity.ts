import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Robot } from './robot.entity';
import { WorkCell } from './work-cell.entity';
import { TaskStep } from './task-step.entity';

export enum TaskType {
  PICK_AND_PLACE = 'pick_and_place',
  ASSEMBLY = 'assembly',
  WELDING = 'welding',
  PAINTING = 'painting',
  INSPECTION = 'inspection',
  MACHINING = 'machining',
  PACKAGING = 'packaging',
  MATERIAL_HANDLING = 'material_handling',
  QUALITY_CHECK = 'quality_check',
  CALIBRATION = 'calibration',
  MAINTENANCE = 'maintenance',
  LEARNING = 'learning',
  COLLABORATIVE = 'collaborative',
  CUSTOM = 'custom'
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum TaskComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

export interface TaskRequirements {
  // Robot capabilities required
  minPayloadKg?: number;
  minReachMm?: number;
  minAxes?: number;
  maxSpeed?: number;
  requiredPrecision?: number; // mm
  
  // Advanced requirements
  visionRequired?: boolean;
  forceSensingRequired?: boolean;
  collaborativeMode?: boolean;
  aiCapabilitiesRequired?: string[];
  
  // Environmental requirements
  cleanRoomLevel?: string;
  temperatureRange?: { min: number; max: number };
  humidityRange?: { min: number; max: number };
  
  // Skill requirements
  requiredCertifications?: string[];
  minimumExperience?: number; // months
  safetyLevel?: string;
}

export interface TaskParameters {
  // Execution parameters
  maxExecutionTime?: number; // seconds
  retryCount?: number;
  timeoutThreshold?: number; // seconds
  
  // Quality parameters
  tolerances?: Record<string, number>;
  qualityCheckpoints?: string[];
  acceptanceCriteria?: Record<string, any>;
  
  // Performance parameters
  targetCycleTime?: number; // seconds
  energyConstraints?: number; // max kWh
  
  // Collaboration parameters
  humanInteractionPoints?: Array<{
    stepId: string;
    interactionType: string;
    duration: number;
    instructions: string;
  }>;
  
  // Safety parameters
  safetyZones?: string[];
  emergencyProcedures?: string[];
  riskAssessment?: {
    level: string;
    mitigationStrategies: string[];
  };
  
  // AI/ML parameters
  learningEnabled?: boolean;
  adaptationLevel?: number;
  modelParameters?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  completionTime: number; // seconds
  qualityScore?: number;
  defectsFound?: number;
  energyConsumed?: number; // kWh
  
  // Performance metrics
  cycleTime: number; // seconds
  accuracy: number; // percentage
  precision: number; // mm
  
  // Quality results
  qualityMetrics?: Record<string, number>;
  inspectionResults?: Array<{
    checkpoint: string;
    status: 'pass' | 'fail' | 'warning';
    value?: number;
    specification?: number;
  }>;
  
  // Output data
  outputData?: Record<string, any>;
  images?: string[]; // URLs or paths to captured images
  measurements?: Record<string, number>;
  
  // Errors and warnings
  errors?: string[];
  warnings?: string[];
  
  // Learning outcomes
  learningData?: Record<string, any>;
  improvementSuggestions?: string[];
}

export interface AIAnalysis {
  optimizationSuggestions: string[];
  predictedIssues: Array<{
    issue: string;
    probability: number;
    mitigation: string;
  }>;
  performancePrediction: {
    estimatedTime: number;
    confidenceLevel: number;
    riskFactors: string[];
  };
  learningInsights: Record<string, any>;
}

@Entity('robot_tasks')
@Index(['status', 'priority'])
@Index(['robotId', 'status'])
@Index(['workCellId', 'status'])
@Index(['type', 'status'])
@Index(['createdAt'])
export class RobotTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 1000, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskType
  })
  @Index()
  type: TaskType;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NORMAL
  })
  @Index()
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  @Index()
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskComplexity,
    default: TaskComplexity.SIMPLE
  })
  complexity: TaskComplexity;

  // Relationships
  @ManyToOne(() => Robot, robot => robot.tasks, { nullable: true })
  robot?: Robot;

  @Column({ nullable: true })
  @Index()
  robotId?: string;

  @ManyToOne(() => WorkCell, workCell => workCell.tasks, { nullable: true })
  workCell?: WorkCell;

  @Column({ nullable: true })
  @Index()
  workCellId?: string;

  @OneToMany(() => TaskStep, step => step.task, { cascade: true })
  steps: TaskStep[];

  // Task Definition
  @Column({ type: 'jsonb' })
  requirements: TaskRequirements;

  @Column({ type: 'jsonb' })
  parameters: TaskParameters;

  @Column({ type: 'jsonb', nullable: true })
  result?: TaskResult;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis?: AIAnalysis;

  // Scheduling and Timing
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDuration?: number; // seconds

  @Column({ type: 'int', nullable: true })
  actualDuration?: number; // seconds

  @Column({ type: 'int', nullable: true })
  remainingTime?: number; // seconds

  // Progress Tracking
  @Column({ type: 'int', default: 0 })
  currentStepIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'int', default: 0 })
  stepsCompleted: number;

  @Column({ type: 'int', default: 0 })
  totalSteps: number;

  // Retry and Error Handling
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'text', array: true, nullable: true })
  errors?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  warnings?: string[];

  // Quality and Performance
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  energyConsumed?: number; // kWh

  @Column({ type: 'int', nullable: true })
  cycleTime?: number; // seconds

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy?: number; // percentage

  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  precision?: number; // mm

  // Business Context
  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  customerId?: string;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  partNumber?: string;

  // Dependencies and Sequencing
  @Column({ type: 'text', array: true, nullable: true })
  dependsOnTasks?: string[]; // Task IDs this task depends on

  @Column({ type: 'text', array: true, nullable: true })
  blockedTasks?: string[]; // Task IDs blocked by this task

  @Column({ nullable: true })
  parentTaskId?: string; // Parent task if this is a subtask

  @Column({ type: 'text', array: true, nullable: true })
  subtaskIds?: string[]; // Child task IDs

  // Collaboration
  @Column({ nullable: true })
  assignedOperatorId?: string;

  @Column({ type: 'text', array: true, nullable: true })
  collaboratingRobotIds?: string[];

  @Column({ default: false })
  @Index()
  requiresHumanCollaboration: boolean;

  @Column({ default: false })
  requiresMultipleRobots: boolean;

  // Learning and Optimization
  @Column({ default: false })
  enableLearning: boolean;

  @Column({ default: false })
  isOptimized: boolean;

  @Column({ type: 'jsonb', nullable: true })
  learningData?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  optimizationHistory?: Array<{
    timestamp: Date;
    parameter: string;
    oldValue: any;
    newValue: any;
    improvement: number;
  }>;

  // Configuration and Metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: false })
  @Index()
  isUrgent: boolean;

  @Column({ default: false })
  isRepeatable: boolean;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: false })
  isSimulated: boolean;

  @Column({ default: false })
  hasDigitalTwin: boolean;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateProgress() {
    if (this.steps && this.steps.length > 0) {
      this.totalSteps = this.steps.length;
      this.stepsCompleted = this.steps.filter(step => 
        step.status === 'completed'
      ).length;
      this.progressPercentage = (this.stepsCompleted / this.totalSteps) * 100;
    }
  }

  // Helper Methods
  canStart(): boolean {
    return this.status === TaskStatus.ASSIGNED && 
           !this.hasUnresolvedDependencies() &&
           this.robot?.isAvailable();
  }

  hasUnresolvedDependencies(): boolean {
    // This would need to check the actual dependency status
    // Simplified implementation
    return false;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === TaskStatus.FAILED;
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  isOverdue(): boolean {
    if (!this.scheduledAt || this.isCompleted()) return false;
    return new Date() > this.scheduledAt;
  }

  getEstimatedCompletion(): Date | null {
    if (!this.startedAt || !this.estimatedDuration) return null;
    return new Date(this.startedAt.getTime() + this.estimatedDuration * 1000);
  }

  getRemainingTime(): number {
    if (!this.startedAt || !this.estimatedDuration || this.isCompleted()) return 0;
    const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
    return Math.max(0, this.estimatedDuration - elapsed);
  }

  start(): void {
    if (!this.canStart()) {
      throw new Error('Task cannot be started');
    }
    
    this.status = TaskStatus.IN_PROGRESS;
    this.startedAt = new Date();
    this.currentStepIndex = 0;
    
    if (this.robot) {
      this.robot.startTask(this.id);
    }
  }

  pause(): void {
    if (this.status === TaskStatus.IN_PROGRESS) {
      this.status = TaskStatus.PAUSED;
    }
  }

  resume(): void {
    if (this.status === TaskStatus.PAUSED) {
      this.status = TaskStatus.IN_PROGRESS;
    }
  }

  complete(result: TaskResult): void {
    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
    this.result = result;
    this.progressPercentage = 100;
    
    if (this.startedAt) {
      this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    
    if (this.robot) {
      this.robot.completeTask();
    }
  }

  fail(reason: string): void {
    this.status = TaskStatus.FAILED;
    this.completedAt = new Date();
    
    if (!this.errors) this.errors = [];
    this.errors.push(reason);
    
    if (this.robot) {
      this.robot.failTask(reason);
    }
  }

  cancel(reason?: string): void {
    this.status = TaskStatus.CANCELLED;
    this.completedAt = new Date();
    
    if (reason) {
      if (!this.warnings) this.warnings = [];
      this.warnings.push(`Cancelled: ${reason}`);
    }
  }

  retry(): void {
    if (!this.canRetry()) {
      throw new Error('Task cannot be retried');
    }
    
    this.retryCount++;
    this.status = TaskStatus.ASSIGNED;
    this.completedAt = null;
    this.startedAt = null;
    this.currentStepIndex = 0;
    this.progressPercentage = 0;
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

  updateAIAnalysis(analysis: Partial<AIAnalysis>): void {
    this.aiAnalysis = {
      ...this.aiAnalysis,
      ...analysis
    } as AIAnalysis;
  }

  recordLearning(learningData: Record<string, any>): void {
    if (!this.learningData) this.learningData = {};
    this.learningData = { ...this.learningData, ...learningData };
    this.enableLearning = true;
  }

  recordOptimization(parameter: string, oldValue: any, newValue: any, improvement: number): void {
    if (!this.optimizationHistory) this.optimizationHistory = [];
    
    this.optimizationHistory.push({
      timestamp: new Date(),
      parameter,
      oldValue,
      newValue,
      improvement
    });
    
    this.isOptimized = true;
  }

  getEfficiencyScore(): number {
    if (!this.estimatedDuration || !this.actualDuration) return 0;
    return Math.max(0, (this.estimatedDuration / this.actualDuration) * 100);
  }

  getQualityScore(): number {
    return this.qualityScore || 0;
  }

  getPriorityScore(): number {
    const priorityScores = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.NORMAL]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.CRITICAL]: 4,
      [TaskPriority.EMERGENCY]: 5
    };
    
    let score = priorityScores[this.priority];
    
    if (this.isUrgent) score += 2;
    if (this.isOverdue()) score += 1;
    
    return score;
  }

  getTaskSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      priority: this.priority,
      complexity: this.complexity,
      robotId: this.robotId,
      workCellId: this.workCellId,
      progressPercentage: this.progressPercentage,
      stepsCompleted: this.stepsCompleted,
      totalSteps: this.totalSteps,
      estimatedDuration: this.estimatedDuration,
      actualDuration: this.actualDuration,
      remainingTime: this.getRemainingTime(),
      qualityScore: this.getQualityScore(),
      efficiencyScore: this.getEfficiencyScore(),
      priorityScore: this.getPriorityScore(),
      scheduledAt: this.scheduledAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      requiresHumanCollaboration: this.requiresHumanCollaboration,
      requiresMultipleRobots: this.requiresMultipleRobots,
      isUrgent: this.isUrgent,
      canStart: this.canStart(),
      canRetry: this.canRetry(),
      isOverdue: this.isOverdue()
    };
  }
}
