// Industry 5.0 ERP Backend - Manufacturing Module
// WorkOrder Entity - Represents detailed work orders for production execution
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductionOrder } from './ProductionOrder';
import { WorkCenter } from './WorkCenter';
import { OperationLog } from './OperationLog';

export enum WorkOrderStatus {
  CREATED = 'created',
  SCHEDULED = 'scheduled',
  RELEASED = 'released',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REWORK = 'rework',
}

export enum WorkOrderType {
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance',
  SETUP = 'setup',
  QUALITY_CHECK = 'quality_check',
  REWORK = 'rework',
  CLEANUP = 'cleanup',
  CALIBRATION = 'calibration',
}

export enum OperationType {
  MACHINING = 'machining',
  ASSEMBLY = 'assembly',
  WELDING = 'welding',
  PAINTING = 'painting',
  TESTING = 'testing',
  INSPECTION = 'inspection',
  PACKAGING = 'packaging',
  MATERIAL_HANDLING = 'material_handling',
}

@Entity('work_orders')
@Index(['workOrderNumber'], { unique: true })
@Index(['status'])
@Index(['productionOrderId'])
@Index(['workCenterId'])
@Index(['scheduledStartTime'])
@Index(['priority'])
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  workOrderNumber: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Order Configuration
  @Column({
    type: 'enum',
    enum: WorkOrderType,
    default: WorkOrderType.PRODUCTION,
  })
  workOrderType: WorkOrderType;

  @Column({
    type: 'enum',
    enum: WorkOrderStatus,
    default: WorkOrderStatus.CREATED,
  })
  @Index()
  status: WorkOrderStatus;

  @Column({
    type: 'enum',
    enum: OperationType,
    default: OperationType.ASSEMBLY,
  })
  operationType: OperationType;

  @Column({ type: 'integer', default: 3 })
  @Index()
  priority: number; // 1 = highest, 5 = lowest

  // Production References
  @Column({ type: 'uuid' })
  @Index()
  productionOrderId: string;

  @ManyToOne(() => ProductionOrder, (order) => order.workOrders)
  @JoinColumn({ name: 'productionOrderId' })
  productionOrder: ProductionOrder;

  @Column({ type: 'uuid' })
  @Index()
  workCenterId: string;

  @ManyToOne(() => WorkCenter, (center) => center.workOrders)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  // Sequencing
  @Column({ type: 'integer', default: 1 })
  sequenceNumber: number;

  @Column({ type: 'uuid', nullable: true })
  parentWorkOrderId: string;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: {
    workOrderId: string;
    type: string; // 'start_after', 'finish_after', 'start_with'
    delay: number; // in minutes
  }[];

  // Timing and Scheduling
  @Column({ type: 'timestamp' })
  @Index()
  scheduledStartTime: Date;

  @Column({ type: 'timestamp' })
  scheduledEndTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  estimatedDuration: number; // in minutes

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actualDuration: number; // in minutes

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  setupTime: number; // in minutes

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  cleanupTime: number; // in minutes

  // Quantity and Production
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  plannedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  completedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  scrappedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  reworkQuantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  // Resource Requirements
  @Column({ type: 'jsonb', nullable: true })
  requiredSkills: {
    skill: string;
    level: string;
    required: boolean;
    certified: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  requiredTools: {
    toolId: string;
    toolName: string;
    quantity: number;
    duration: number; // in minutes
    critical: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  requiredMaterials: {
    materialId: string;
    materialSku: string;
    materialName: string;
    quantity: number;
    unit: string;
    allocated: boolean;
    batchLot: string;
  }[];

  @Column({ type: 'integer', default: 1 })
  requiredOperators: number;

  @Column({ type: 'integer', default: 0 })
  assignedOperators: number;

  // Work Instructions and Documentation
  @Column({ type: 'jsonb', nullable: true })
  workInstructions: {
    step: number;
    instruction: string;
    duration: number;
    critical: boolean;
    safetyNotes: string[];
    qualityCheckpoints: string[];
    mediaUrl: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  safetyRequirements: {
    requirement: string;
    type: string; // PPE, procedure, environmental
    mandatory: boolean;
    notes: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  qualityParameters: {
    parameter: string;
    targetValue: string;
    tolerance: string;
    unit: string;
    method: string;
    frequency: string;
    critical: boolean;
  }[];

  // Operator Assignment and Tracking
  @Column({ type: 'jsonb', nullable: true })
  assignedOperators_detail: {
    operatorId: string;
    operatorName: string;
    role: string;
    skillLevel: string;
    assignedTime: Date;
    activeTime: number; // in minutes
    efficiency: number; // percentage
  }[];

  // Cost Tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overheadCost: number;

  // Quality Control
  @Column({ type: 'jsonb', nullable: true })
  qualityChecks: {
    checkId: string;
    parameter: string;
    actualValue: string;
    targetValue: string;
    tolerance: string;
    result: string; // pass, fail, warning
    checkedBy: string;
    checkedAt: Date;
    notes: string;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'boolean', default: false })
  qualityApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  qualityApprovedBy: string;

  // Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  realTimeMetrics: {
    currentStep: number;
    progress: number; // percentage
    efficiency: number;
    throughput: number;
    temperature: number;
    pressure: number;
    vibration: number;
    energy: number;
    lastUpdate: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  iotIntegration: {
    sensors: {
      sensorId: string;
      type: string;
      location: string;
      currentValue: number;
      unit: string;
      status: string;
      lastReading: Date;
    }[];
    automated: boolean;
    controlSystemId: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  aiAssistance: {
    enabled: boolean;
    recommendations: {
      type: string;
      description: string;
      confidence: number;
      implemented: boolean;
      timestamp: Date;
    }[];
    anomalyDetection: {
      anomalies: string[];
      riskScore: number;
      lastAnalysis: Date;
    };
    optimization: {
      suggestedSpeed: number;
      suggestedTemperature: number;
      suggestedSequence: number[];
      potentialTimeSaving: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  humanRobotCollaboration: {
    enabled: boolean;
    collaborativeRobots: {
      robotId: string;
      robotType: string;
      task: string;
      safetyZone: string;
      interactionMode: string; // cooperative, collaborative, coexistent
    }[];
    safetyProtocols: {
      protocol: string;
      active: boolean;
      lastCheck: Date;
    }[];
  };

  // Performance Tracking
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    cycleTime: number;
    setupTime: number;
    downtime: number;
    throughputRate: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  downtimeEvents: {
    eventId: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    reason: string;
    category: string; // planned, unplanned, breakdown, setup
    impact: string;
    resolution: string;
  }[];

  // Environmental and Sustainability
  @Column({ type: 'jsonb', nullable: true })
  environmentalMetrics: {
    energyConsumption: number; // kWh
    waterUsage: number; // liters
    wasteGenerated: number; // kg
    emissions: number; // kg CO2
    recycledMaterials: number; // percentage
  };

  // Change Management
  @Column({ type: 'jsonb', nullable: true })
  changeHistory: {
    changeId: string;
    timestamp: Date;
    changedBy: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
    approved: boolean;
  }[];

  // Relationships
  @OneToMany(() => OperationLog, (log) => log.workOrder)
  operationLogs: OperationLog[];

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  startedBy: string;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string;

  // Business Logic Methods
  isActive(): boolean {
    return [
      WorkOrderStatus.RELEASED,
      WorkOrderStatus.IN_PROGRESS,
    ].includes(this.status);
  }

  isCompleted(): boolean {
    return this.status === WorkOrderStatus.COMPLETED;
  }

  canStart(): boolean {
    return (
      this.status === WorkOrderStatus.SCHEDULED ||
      this.status === WorkOrderStatus.RELEASED
    ) && this.hasRequiredResources();
  }

  hasRequiredResources(): boolean {
    // Check if all required resources are available
    const hasOperators = this.assignedOperators >= this.requiredOperators;
    const hasMaterials = this.requiredMaterials?.every(m => m.allocated) ?? true;
    return hasOperators && hasMaterials;
  }

  getCompletionPercentage(): number {
    if (this.plannedQuantity === 0) return 0;
    return (this.completedQuantity / this.plannedQuantity) * 100;
  }

  getYieldPercentage(): number {
    const totalProduced = this.completedQuantity + this.scrappedQuantity + this.reworkQuantity;
    if (totalProduced === 0) return 0;
    return (this.completedQuantity / totalProduced) * 100;
  }

  getScrapRate(): number {
    const totalProduced = this.completedQuantity + this.scrappedQuantity + this.reworkQuantity;
    if (totalProduced === 0) return 0;
    return (this.scrappedQuantity / totalProduced) * 100;
  }

  getRemainingTime(): number {
    if (this.isCompleted()) return 0;
    if (!this.actualStartTime) return this.estimatedDuration;
    
    const elapsed = (Date.now() - this.actualStartTime.getTime()) / (1000 * 60); // minutes
    return Math.max(0, this.estimatedDuration - elapsed);
  }

  getEfficiency(): number {
    if (!this.actualDuration || this.actualDuration === 0) return 0;
    return (this.estimatedDuration / this.actualDuration) * 100;
  }

  isOverdue(): boolean {
    if (this.isCompleted()) return false;
    return new Date() > this.scheduledEndTime;
  }

  getOverdueTime(): number {
    if (!this.isOverdue()) return 0;
    return (Date.now() - this.scheduledEndTime.getTime()) / (1000 * 60); // minutes
  }

  getTotalDowntime(): number {
    if (!this.downtimeEvents) return 0;
    return this.downtimeEvents.reduce((total, event) => total + event.duration, 0);
  }

  getAverageProcessingTime(): number {
    if (this.completedQuantity === 0 || !this.actualDuration) return 0;
    return this.actualDuration / this.completedQuantity;
  }

  needsQualityInspection(): boolean {
    return this.qualityParameters?.some(p => p.critical) ?? false;
  }

  hasQualityIssues(): boolean {
    return this.qualityChecks?.some(check => check.result === 'fail') ?? false;
  }

  canRework(): boolean {
    return this.reworkQuantity > 0 && this.status === WorkOrderStatus.COMPLETED;
  }

  getEnvironmentalImpactScore(): number {
    const metrics = this.environmentalMetrics;
    if (!metrics) return 0;
    
    // Simple scoring algorithm - lower consumption is better
    let score = 100;
    if (metrics.energyConsumption > 10) score -= 20;
    if (metrics.wasteGenerated > 5) score -= 20;
    if (metrics.emissions > 2) score -= 20;
    if (metrics.recycledMaterials < 50) score -= 20;
    
    return Math.max(0, score);
  }

  getCostVariance(): number {
    return this.actualCost - this.estimatedCost;
  }

  getCostVariancePercentage(): number {
    if (this.estimatedCost === 0) return 0;
    return (this.getCostVariance() / this.estimatedCost) * 100;
  }

  validateWorkOrder(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.plannedQuantity <= 0) {
      errors.push('Planned quantity must be greater than zero');
    }

    if (!this.scheduledStartTime || !this.scheduledEndTime) {
      errors.push('Scheduled start and end times are required');
    }

    if (this.scheduledStartTime >= this.scheduledEndTime) {
      errors.push('Scheduled start time must be before end time');
    }

    if (this.estimatedDuration <= 0) {
      errors.push('Estimated duration must be greater than zero');
    }

    if (this.requiredOperators <= 0) {
      errors.push('At least one operator is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
