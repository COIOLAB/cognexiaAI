import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ProductionPlan } from './ProductionPlan.entity';

export enum OrderStatus {
  PLANNED = 'planned',
  RELEASED = 'released',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum OrderType {
  MAKE_TO_STOCK = 'make_to_stock',
  MAKE_TO_ORDER = 'make_to_order',
  ENGINEER_TO_ORDER = 'engineer_to_order',
  ASSEMBLE_TO_ORDER = 'assemble_to_order'
}

export enum OrderPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 8,
  URGENT = 10,
  CRITICAL = 15
}

@Entity('production_orders')
@Index(['orderNumber'])
@Index(['status'])
@Index(['priority'])
@Index(['dueDate'])
@Index(['productId'])
@Index(['createdAt'])
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'varchar', length: 255 })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productVersion: string;

  @Column({ 
    type: 'enum', 
    enum: OrderType,
    default: OrderType.MAKE_TO_STOCK
  })
  orderType: OrderType;

  @Column({ 
    type: 'enum', 
    enum: OrderStatus,
    default: OrderStatus.PLANNED
  })
  status: OrderStatus;

  @Column({ 
    type: 'enum', 
    enum: OrderPriority,
    default: OrderPriority.NORMAL
  })
  priority: OrderPriority;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'pieces' })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantityCompleted: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantityRejected: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedEndDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerOrderNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  // Operations within this production order
  @Column({ type: 'json' })
  operations: Array<{
    operationId: string;
    operationNumber: number;
    operationName: string;
    operationType: 'setup' | 'production' | 'inspection' | 'transport' | 'wait';
    workstationId: string;
    workstationName: string;
    
    // Time estimates
    setupTime: number; // minutes
    standardTime: number; // minutes per unit
    estimatedDuration: number; // total minutes
    actualDuration?: number; // actual minutes taken
    
    // Resource requirements
    skillRequirements: string[];
    toolRequirements: Array<{
      toolId: string;
      toolName: string;
      quantity: number;
      required: boolean;
    }>;
    materialRequirements: Array<{
      materialId: string;
      materialName: string;
      quantityPerUnit: number;
      unit: string;
      availableQuantity?: number;
    }>;
    
    // Quality requirements
    qualityCheckRequired: boolean;
    qualityParameters?: Array<{
      parameter: string;
      specification: string;
      toleranceMin: number;
      toleranceMax: number;
      unit: string;
    }>;
    
    // Scheduling
    earliestStartTime?: Date;
    latestStartTime?: Date;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    
    // Status and progress
    status: 'planned' | 'ready' | 'in_progress' | 'completed' | 'on_hold';
    progressPercentage: number;
    
    // Dependencies
    predecessors: string[]; // operation IDs that must complete before this
    successors: string[]; // operation IDs that depend on this
    
    // Cost information
    laborCost?: number;
    materialCost?: number;
    overheadCost?: number;
    totalCost?: number;
    
    // Performance metrics
    efficiency?: number; // actual vs. standard time
    scrapRate?: number;
    reworkCount?: number;
    
    // Notes and issues
    notes?: string;
    issues?: Array<{
      issueId: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      reportedAt: Date;
      resolvedAt?: Date;
      resolution?: string;
    }>;
  }>;

  // Bill of Materials requirements
  @Column({ type: 'json', nullable: true })
  billOfMaterials: Array<{
    materialId: string;
    materialCode: string;
    materialName: string;
    quantityPerUnit: number;
    unit: string;
    totalQuantityRequired: number;
    allocatedQuantity?: number;
    issuedQuantity?: number;
    scrapFactor: number;
    isCritical: boolean;
    supplier?: {
      supplierId: string;
      supplierName: string;
      leadTime: number;
      unitCost: number;
    };
  }>;

  // Quality requirements and results
  @Column({ type: 'json', nullable: true })
  qualityRequirements: {
    inspectionPlan: Array<{
      inspectionId: string;
      operationId: string;
      inspectionType: 'incoming' | 'in_process' | 'final';
      parameters: Array<{
        parameter: string;
        specification: string;
        method: string;
        tolerance: {
          min: number;
          max: number;
          unit: string;
        };
      }>;
      sampleSize: number;
      acceptanceLevel: number;
    }>;
    qualityResults?: Array<{
      inspectionId: string;
      inspectionDate: Date;
      inspector: string;
      results: Array<{
        parameter: string;
        measuredValue: number;
        passed: boolean;
        notes?: string;
      }>;
      overallResult: 'pass' | 'fail' | 'conditional';
      certificateRequired: boolean;
    }>;
  };

  // Cost tracking
  @Column({ type: 'json', nullable: true })
  costTracking: {
    estimatedCosts: {
      materialCost: number;
      laborCost: number;
      overheadCost: number;
      toolingCost: number;
      totalCost: number;
    };
    actualCosts?: {
      materialCost: number;
      laborCost: number;
      overheadCost: number;
      toolingCost: number;
      totalCost: number;
    };
    costVariance?: number;
    costVariancePercentage?: number;
  };

  // Scheduling and constraints
  @Column({ type: 'json', nullable: true })
  schedulingConstraints: {
    cannotStartBefore?: Date;
    mustFinishBy?: Date;
    preferredShift?: 'day' | 'evening' | 'night' | 'any';
    resourcePreferences?: Array<{
      resourceType: 'workstation' | 'worker' | 'tool';
      resourceId: string;
      preference: 'required' | 'preferred' | 'avoid';
    }>;
    parallelOperations?: boolean;
    setupOptimization?: boolean;
  };

  // Production plan relationship
  @Column({ type: 'uuid', nullable: true })
  productionPlanId: string;

  @ManyToOne(() => ProductionPlan, { nullable: true })
  @JoinColumn({ name: 'productionPlanId' })
  productionPlan: ProductionPlan;

  // Performance metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    planningAccuracy?: number; // actual vs planned duration
    scheduleAdherence?: number; // on-time completion
    qualityMetrics?: {
      firstPassYield: number;
      scrapRate: number;
      reworkRate: number;
      defectRate: number;
    };
    efficiencyMetrics?: {
      overallEfficiency: number;
      laborEfficiency: number;
      equipmentEfficiency: number;
      materialEfficiency: number;
    };
    costPerformance?: {
      costVariance: number;
      costPerformanceIndex: number;
    };
  };

  // Alerts and notifications
  @Column({ type: 'json', nullable: true })
  alerts: Array<{
    alertId: string;
    type: 'delay' | 'quality' | 'resource' | 'material' | 'cost';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    triggeredAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    actions?: string[];
  }>;

  // Audit trail and history
  @Column({ type: 'json', nullable: true })
  auditTrail: Array<{
    action: string;
    userId: string;
    userName: string;
    timestamp: Date;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    reason?: string;
    ipAddress?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties and methods
  calculateProgress(): number {
    if (!this.operations || this.operations.length === 0) return 0;
    
    const totalProgress = this.operations.reduce((sum, op) => sum + op.progressPercentage, 0);
    return totalProgress / this.operations.length;
  }

  calculateTotalDuration(): number {
    if (!this.operations || this.operations.length === 0) return 0;
    
    return this.operations.reduce((sum, op) => sum + op.estimatedDuration, 0);
  }

  getCompletionDate(): Date | null {
    if (this.actualEndDate) return this.actualEndDate;
    if (this.plannedEndDate) return this.plannedEndDate;
    return null;
  }

  isOverdue(): boolean {
    const now = new Date();
    return now > this.dueDate && this.status !== OrderStatus.COMPLETED;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.dueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getScheduleVariance(): number {
    if (!this.plannedEndDate || !this.actualEndDate) return 0;
    
    const planned = this.plannedEndDate.getTime();
    const actual = this.actualEndDate.getTime();
    return (actual - planned) / (1000 * 60 * 60 * 24); // days
  }

  getCostVariance(): number {
    if (!this.costTracking?.estimatedCosts || !this.costTracking?.actualCosts) return 0;
    
    const estimated = this.costTracking.estimatedCosts.totalCost;
    const actual = this.costTracking.actualCosts.totalCost;
    return ((actual - estimated) / estimated) * 100; // percentage
  }

  getCriticalPath(): Array<{
    operationId: string;
    operationName: string;
    duration: number;
    earlyStart: Date;
    earlyFinish: Date;
    lateStart: Date;
    lateFinish: Date;
    slack: number;
    isCritical: boolean;
  }> {
    // Simplified critical path calculation
    // In production, this would implement proper CPM algorithm
    const criticalOperations: Array<{
      operationId: string;
      operationName: string;
      duration: number;
      earlyStart: Date;
      earlyFinish: Date;
      lateStart: Date;
      lateFinish: Date;
      slack: number;
      isCritical: boolean;
    }> = [];

    // Implementation would calculate critical path method
    return criticalOperations;
  }

  getNextOperation(): any {
    if (!this.operations) return null;
    
    return this.operations.find(op => 
      op.status === 'ready' || 
      (op.status === 'planned' && op.predecessors.every(predId => {
        const predOp = this.operations.find(o => o.operationId === predId);
        return predOp?.status === 'completed';
      }))
    );
  }

  canStart(): boolean {
    // Check if all prerequisites are met
    const nextOp = this.getNextOperation();
    if (!nextOp) return false;

    // Check material availability
    if (nextOp.materialRequirements) {
      for (const material of nextOp.materialRequirements) {
        if ((material.availableQuantity || 0) < material.quantityPerUnit * this.quantity) {
          return false;
        }
      }
    }

    // Check if workstation is available (would need to check actual schedule)
    return true;
  }

  validateConstraints(): Array<{
    constraint: string;
    violated: boolean;
    description: string;
    severity: 'warning' | 'error';
  }> {
    const violations: Array<{
      constraint: string;
      violated: boolean;
      description: string;
      severity: 'warning' | 'error';
    }> = [];

    // Check due date constraint
    if (this.plannedEndDate && this.plannedEndDate > this.dueDate) {
      violations.push({
        constraint: 'due_date',
        violated: true,
        description: `Planned end date (${this.plannedEndDate.toDateString()}) exceeds due date (${this.dueDate.toDateString()})`,
        severity: 'error'
      });
    }

    // Check operation sequence constraints
    this.operations.forEach(op => {
      op.predecessors.forEach(predId => {
        const predecessor = this.operations.find(o => o.operationId === predId);
        if (predecessor && op.scheduledStartTime && predecessor.scheduledEndTime) {
          if (op.scheduledStartTime < predecessor.scheduledEndTime) {
            violations.push({
              constraint: 'operation_sequence',
              violated: true,
              description: `Operation ${op.operationName} cannot start before predecessor ${predecessor.operationName} completes`,
              severity: 'error'
            });
          }
        }
      });
    });

    return violations;
  }
}
