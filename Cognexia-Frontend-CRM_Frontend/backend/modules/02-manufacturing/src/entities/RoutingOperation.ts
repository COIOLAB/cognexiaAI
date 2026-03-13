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
import { Routing } from './Routing';
import { WorkCenter } from './WorkCenter';

export enum OperationType {
  SETUP = 'setup',
  PROCESS = 'process',
  INSPECTION = 'inspection',
  MOVE = 'move',
  WAIT = 'wait',
  STORAGE = 'storage',
  REWORK = 'rework',
  SUBCONTRACT = 'subcontract',
}

export enum OperationStatus {
  PLANNED = 'planned',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
}

export enum OperationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

@Entity('routing_operations')
@Index(['routingId', 'sequenceNumber'], { unique: true })
@Index(['workCenterId'])
@Index(['operationType'])
@Index(['status'])
export class RoutingOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({ type: 'varchar', length: 50 })
  operationCode: string;

  @Column({ type: 'varchar', length: 255 })
  operationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: OperationType,
    default: OperationType.PROCESS,
  })
  operationType: OperationType;

  @Column({
    type: 'enum',
    enum: OperationStatus,
    default: OperationStatus.PLANNED,
  })
  status: OperationStatus;

  @Column({
    type: 'enum',
    enum: OperationPriority,
    default: OperationPriority.NORMAL,
  })
  priority: OperationPriority;

  // Time Information (in minutes)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  setupTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  processTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  teardownTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  waitTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  moveTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  queueTime: number;

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  machineCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overheadCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  // Capacity and Efficiency
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  standardQuantity: number; // Pieces per operation

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  lotQuantity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  efficiency: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 99 })
  yieldRate: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  scrapRate: number; // Percentage

  // Planning and Scheduling
  @Column({ type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ type: 'boolean', default: false })
  allowParallel: boolean;

  @Column({ type: 'boolean', default: false })
  requiresOperator: boolean;

  @Column({ type: 'int', default: 1 })
  operatorCount: number;

  @Column({ type: 'jsonb', nullable: true })
  skillRequirements: {
    skillLevel: string;
    certifications: string[];
    experience: number; // years
    training: string[];
  };

  // Quality Control
  @Column({ type: 'boolean', default: false })
  hasQualityCheck: boolean;

  @Column({ type: 'jsonb', nullable: true })
  qualityParameters: {
    inspectionPoints: string[];
    tolerances: object;
    testProcedures: string[];
    acceptanceCriteria: string;
    samplingPlan: object;
  };

  // Tools and Equipment
  @Column({ type: 'jsonb', nullable: true })
  toolRequirements: {
    tools: string[];
    fixtures: string[];
    gauges: string[];
    consumables: string[];
  };

  // Material Requirements
  @Column({ type: 'jsonb', nullable: true })
  materialRequirements: {
    materials: object[];
    consumables: object[];
    lubricants: string[];
    cleaningMaterials: string[];
  };

  // Industry 5.0 Features
  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'boolean', default: false })
  hasRobotAssistance: boolean;

  @Column({ type: 'boolean', default: false })
  hasAiOptimization: boolean;

  @Column({ type: 'boolean', default: false })
  hasDigitalTwin: boolean;

  @Column({ type: 'boolean', default: false })
  hasVisionSystem: boolean;

  @Column({ type: 'boolean', default: false })
  hasVoiceControl: boolean;

  @Column({ type: 'boolean', default: false })
  hasAugmentedReality: boolean;

  // AI and Machine Learning
  @Column({ type: 'jsonb', nullable: true })
  aiConfiguration: {
    models: string[];
    algorithms: string[];
    optimization: object;
    predictiveAnalytics: boolean;
    adaptiveLearning: boolean;
  };

  // IoT and Sensors
  @Column({ type: 'jsonb', nullable: true })
  iotConfiguration: {
    sensors: string[];
    dataPoints: string[];
    monitoringFrequency: number;
    alerts: object[];
  };

  // Environmental and Safety
  @Column({ type: 'jsonb', nullable: true })
  environmentalImpact: {
    energyConsumption: number; // kWh
    emissions: number; // CO2 equivalent
    wasteGeneration: number; // kg
    noiseLevel: number; // dB
    vibration: number; // mm/s
  };

  @Column({ type: 'jsonb', nullable: true })
  safetyRequirements: {
    hazards: string[];
    ppe: string[]; // Personal Protective Equipment
    safetyProcedures: string[];
    riskAssessment: object;
    emergencyProcedures: string[];
  };

  // Documentation and Instructions
  @Column({ type: 'jsonb', nullable: true })
  workInstructions: {
    stepByStep: string[];
    images: string[];
    videos: string[];
    documents: string[];
    specifications: object;
  };

  // Performance Tracking
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    actualTime: number;
    actualCost: number;
    actualYield: number;
    defectRate: number;
    efficiency: number;
    utilization: number;
  };

  // Dependencies and Constraints
  @Column({ type: 'jsonb', nullable: true })
  dependencies: {
    predecessors: string[];
    successors: string[];
    constraints: object[];
    bufferTime: number;
  };

  // Relationships
  @Column({ type: 'varchar' })
  routingId: string;

  @ManyToOne(() => Routing, (routing) => routing.operations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routingId' })
  routing: Routing;

  @Column({ type: 'varchar', nullable: true })
  workCenterId: string;

  @ManyToOne(() => WorkCenter, (workCenter) => workCenter.routingOperations)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  // Methods
  getTotalTime(): number {
    return (this.setupTime || 0) + 
           (this.processTime || 0) + 
           (this.teardownTime || 0) + 
           (this.waitTime || 0) + 
           (this.moveTime || 0);
  }

  getCycleTime(): number {
    return (this.processTime || 0) / (this.standardQuantity || 1);
  }

  getThroughputTime(): number {
    return this.getTotalTime() + (this.queueTime || 0);
  }

  calculateResourceUtilization(): number {
    const totalAvailableTime = 480; // 8 hours in minutes
    const actualTime = this.getTotalTime();
    return (actualTime / totalAvailableTime) * 100;
  }

  estimateCost(quantity: number = 1): number {
    const laborTime = this.getTotalTime() / 60; // Convert to hours
    const machineTime = (this.processTime || 0) / 60;
    
    const labor = laborTime * (this.laborCost || 0);
    const machine = machineTime * (this.machineCost || 0);
    const material = (this.materialCost || 0) * quantity;
    const overhead = (this.overheadCost || 0) * quantity;

    return labor + machine + material + overhead;
  }

  validateOperation(): string[] {
    const errors: string[] = [];

    if (!this.workCenter) {
      errors.push('Work center is required');
    }

    if ((this.processTime || 0) <= 0) {
      errors.push('Process time must be greater than 0');
    }

    if ((this.standardQuantity || 0) <= 0) {
      errors.push('Standard quantity must be greater than 0');
    }

    if ((this.yieldRate || 0) <= 0 || (this.yieldRate || 0) > 100) {
      errors.push('Yield rate must be between 0 and 100');
    }

    return errors;
  }

  canRunInParallel(otherOperation: RoutingOperation): boolean {
    return this.allowParallel && 
           otherOperation.allowParallel && 
           this.workCenterId !== otherOperation.workCenterId;
  }

  isReady(): boolean {
    return this.status === OperationStatus.READY && 
           this.workCenter?.status === 'active';
  }

  getEstimatedDuration(quantity: number = 1): number {
    const setupTimeTotal = this.setupTime || 0;
    const processTimeTotal = ((this.processTime || 0) * quantity) / (this.standardQuantity || 1);
    const teardownTimeTotal = this.teardownTime || 0;
    
    return setupTimeTotal + processTimeTotal + teardownTimeTotal;
  }

  clone(newSequenceNumber: number): Partial<RoutingOperation> {
    return {
      sequenceNumber: newSequenceNumber,
      operationCode: `${this.operationCode}_COPY`,
      operationName: `${this.operationName} (Copy)`,
      description: this.description,
      operationType: this.operationType,
      status: OperationStatus.PLANNED,
      priority: this.priority,
      setupTime: this.setupTime,
      processTime: this.processTime,
      teardownTime: this.teardownTime,
      standardQuantity: this.standardQuantity,
      efficiency: this.efficiency,
      yieldRate: this.yieldRate,
      workCenterId: this.workCenterId,
      skillRequirements: this.skillRequirements,
      toolRequirements: this.toolRequirements,
      qualityParameters: this.qualityParameters,
      workInstructions: this.workInstructions,
    };
  }
}
