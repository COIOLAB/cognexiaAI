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
import { ProductionLine } from './ProductionLine';

export enum ScheduleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REVISION_REQUIRED = 'revision_required',
}

export enum SchedulePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  RUSH = 'rush',
}

export enum SchedulingMethod {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  AI_OPTIMIZED = 'ai_optimized',
  CONSTRAINT_BASED = 'constraint_based',
  GENETIC_ALGORITHM = 'genetic_algorithm',
}

@Entity('production_schedules')
@Index(['scheduleCode'], { unique: true })
@Index(['status'])
@Index(['priority'])
@Index(['schedulingMethod'])
@Index(['startDate'])
@Index(['endDate'])
export class ProductionSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  scheduleCode: string;

  @Column({ length: 255 })
  scheduleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.DRAFT,
  })
  status: ScheduleStatus;

  @Column({
    type: 'enum',
    enum: SchedulePriority,
    default: SchedulePriority.NORMAL,
  })
  priority: SchedulePriority;

  @Column({
    type: 'enum',
    enum: SchedulingMethod,
    default: SchedulingMethod.MANUAL,
  })
  schedulingMethod: SchedulingMethod;

  // Time Range
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  frozenDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastOptimizedDate: Date;

  // Planning Horizon
  @Column({ type: 'int', default: 7 })
  planningHorizonDays: number;

  @Column({ type: 'int', default: 1 })
  bucketSizeHours: number; // Time bucket size for scheduling

  // Capacity and Constraints
  @Column({ type: 'jsonb', nullable: true })
  capacityConstraints: {
    workCenters: object[];
    resources: object[];
    materials: object[];
    labor: object[];
    tooling: object[];
  };

  @Column({ type: 'jsonb', nullable: true })
  schedulingConstraints: {
    dependencies: object[];
    precedenceRules: object[];
    setupConstraints: object[];
    qualityGates: object[];
    maintenanceWindows: object[];
  };

  // Performance Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallUtilization: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  onTimeDeliveryRate: number; // Percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMakespan: number; // Total time to complete all jobs (hours)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageFlowTime: number; // Average time from start to finish (hours)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalLateness: number; // Total lateness across all orders (hours)

  @Column({ type: 'int', default: 0 })
  numberOfJobs: number;

  @Column({ type: 'int', default: 0 })
  numberOfSetups: number;

  // Optimization Results
  @Column({ type: 'jsonb', nullable: true })
  optimizationResults: {
    algorithm: string;
    iterations: number;
    convergenceTime: number;
    improvementPercentage: number;
    objectives: object[];
    constraints: object[];
    kpis: object[];
  };

  // AI and Machine Learning
  @Column({ type: 'boolean', default: false })
  isAiOptimized: boolean;

  @Column({ type: 'jsonb', nullable: true })
  aiConfiguration: {
    model: string;
    parameters: object;
    trainingData: string;
    confidence: number;
    learningEnabled: boolean;
    feedbackLoop: boolean;
  };

  // Scheduling Parameters
  @Column({ type: 'jsonb', nullable: true })
  schedulingParameters: {
    objectives: string[]; // minimize makespan, maximize utilization, etc.
    weights: object; // objective weights
    penalties: object; // penalty costs
    bufferTime: number; // safety buffer percentage
    overlapAllowed: boolean;
    preemptionAllowed: boolean;
  };

  // Resource Allocation
  @Column({ type: 'jsonb', nullable: true })
  resourceAllocation: {
    workCenters: object[];
    operators: object[];
    tools: object[];
    materials: object[];
    energy: object[];
  };

  // Quality Integration
  @Column({ type: 'jsonb', nullable: true })
  qualityIntegration: {
    inspectionSchedule: object[];
    qualityGates: object[];
    holdPoints: object[];
    reworkSchedule: object[];
  };

  // Maintenance Integration
  @Column({ type: 'jsonb', nullable: true })
  maintenanceIntegration: {
    preventiveMaintenance: object[];
    predictiveMaintenance: object[];
    maintenanceWindows: object[];
    equipmentAvailability: object[];
  };

  // Simulation and What-If Analysis
  @Column({ type: 'jsonb', nullable: true })
  simulationResults: {
    scenarios: object[];
    bestCase: object;
    worstCase: object;
    mostLikely: object;
    riskAnalysis: object;
  };

  // Digital Twin Integration
  @Column({ type: 'boolean', default: false })
  hasDigitalTwin: boolean;

  @Column({ type: 'jsonb', nullable: true })
  digitalTwinData: {
    modelId: string;
    synchronization: boolean;
    realTimeUpdates: boolean;
    predictiveCapability: boolean;
  };

  // Environmental Considerations
  @Column({ type: 'jsonb', nullable: true })
  environmentalImpact: {
    energyConsumption: number; // kWh
    carbonFootprint: number; // kg CO2
    wasteGeneration: number; // kg
    sustainabilityScore: number; // 0-100
  };

  // Risk Management
  @Column({ type: 'jsonb', nullable: true })
  riskAssessment: {
    risks: object[];
    mitigation: object[];
    contingencyPlans: object[];
    probability: object[];
    impact: object[];
  };

  // Collaboration and Communication
  @Column({ type: 'jsonb', nullable: true })
  collaboration: {
    stakeholders: string[];
    notifications: object[];
    approvals: object[];
    comments: object[];
    reviews: object[];
  };

  // Version Control
  @Column({ length: 10, default: '1.0' })
  version: string;

  @Column({ nullable: true })
  parentScheduleId: string;

  @Column({ type: 'jsonb', nullable: true })
  changeLog: {
    changes: object[];
    reasons: string[];
    approvals: object[];
    impact: object[];
  };

  // Integration with External Systems
  @Column({ type: 'jsonb', nullable: true })
  externalIntegration: {
    erpSystem: string;
    mesSystem: string;
    apsSystem: string;
    wmsSystem: string;
    qmsSystem: string;
  };

  // Real-time Monitoring
  @Column({ type: 'boolean', default: false })
  isRealTimeMonitoring: boolean;

  @Column({ type: 'jsonb', nullable: true })
  realTimeData: {
    lastUpdate: Date;
    progressTracking: object[];
    deviations: object[];
    alerts: object[];
    autoCorrections: object[];
  };

  // Relationships
  @Column({ nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine)
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @OneToMany(() => ProductionOrder, (order) => order.productionSchedule)
  productionOrders: ProductionOrder[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  @Column({ length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Methods
  getDuration(): number {
    return (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60); // hours
  }

  isActive(): boolean {
    const now = new Date();
    return this.status === ScheduleStatus.ACTIVE &&
           now >= this.startDate &&
           now <= this.endDate;
  }

  isFrozen(): boolean {
    return this.status === ScheduleStatus.FROZEN;
  }

  calculateUtilization(): number {
    if (!this.resourceAllocation) return 0;

    const workCenters = this.resourceAllocation.workCenters || [];
    if (workCenters.length === 0) return 0;

    const totalUtilization = workCenters.reduce((sum: number, wc: any) => {
      return sum + (wc.utilization || 0);
    }, 0);

    return totalUtilization / workCenters.length;
  }

  calculateOnTimePerformance(): number {
    if (!this.productionOrders || this.productionOrders.length === 0) return 100;

    const onTimeOrders = this.productionOrders.filter(order => {
      return order.actualEndDate && order.scheduledEndDate &&
             order.actualEndDate <= order.scheduledEndDate;
    }).length;

    return (onTimeOrders / this.productionOrders.length) * 100;
  }

  validateSchedule(): string[] {
    const errors: string[] = [];

    if (this.startDate >= this.endDate) {
      errors.push('Start date must be before end date');
    }

    if (!this.productionOrders || this.productionOrders.length === 0) {
      errors.push('Schedule must contain at least one production order');
    }

    // Check for resource conflicts
    const resourceConflicts = this.detectResourceConflicts();
    if (resourceConflicts.length > 0) {
      errors.push(`Resource conflicts detected: ${resourceConflicts.join(', ')}`);
    }

    // Check capacity constraints
    const capacityViolations = this.checkCapacityConstraints();
    if (capacityViolations.length > 0) {
      errors.push(`Capacity violations: ${capacityViolations.join(', ')}`);
    }

    return errors;
  }

  detectResourceConflicts(): string[] {
    // Simplified conflict detection - in practice, this would be more complex
    const conflicts: string[] = [];
    
    if (!this.productionOrders) return conflicts;

    // Check for overlapping operations on same work center
    const operationsByWorkCenter = new Map();
    
    for (const order of this.productionOrders) {
      // This would require detailed operation scheduling data
      // For now, return empty array
    }

    return conflicts;
  }

  checkCapacityConstraints(): string[] {
    const violations: string[] = [];

    if (!this.capacityConstraints) return violations;

    // Check work center capacity
    const workCenters = this.capacityConstraints.workCenters || [];
    for (const wc of workCenters) {
      const capacity = (wc as any).availableCapacity || 0;
      const demand = (wc as any).requiredCapacity || 0;
      
      if (demand > capacity) {
        violations.push(`Work center ${(wc as any).name} over capacity`);
      }
    }

    return violations;
  }

  optimize(): object {
    // Placeholder for optimization algorithm
    // In practice, this would call the appropriate optimization service
    
    const optimizationResult = {
      success: false,
      improvementPercentage: 0,
      newMakespan: this.totalMakespan,
      newUtilization: this.overallUtilization,
      changes: [],
      recommendations: [],
    };

    // Update optimization results
    this.optimizationResults = {
      algorithm: this.schedulingMethod,
      iterations: 100,
      convergenceTime: 5.2,
      improvementPercentage: optimizationResult.improvementPercentage,
      objectives: [],
      constraints: [],
      kpis: [],
    };

    this.lastOptimizedDate = new Date();
    return optimizationResult;
  }

  freeze(): void {
    this.status = ScheduleStatus.FROZEN;
    this.frozenDate = new Date();
  }

  unfreeze(): void {
    if (this.status === ScheduleStatus.FROZEN) {
      this.status = ScheduleStatus.ACTIVE;
      this.frozenDate = null;
    }
  }

  createRevision(changes: object[]): Partial<ProductionSchedule> {
    const newVersion = this.incrementVersion();
    
    return {
      scheduleCode: `${this.scheduleCode}_REV${newVersion}`,
      scheduleName: `${this.scheduleName} (Revision ${newVersion})`,
      description: this.description,
      priority: this.priority,
      schedulingMethod: this.schedulingMethod,
      startDate: this.startDate,
      endDate: this.endDate,
      parentScheduleId: this.id,
      version: newVersion,
      status: ScheduleStatus.DRAFT,
      changeLog: {
        changes: changes,
        reasons: [],
        approvals: [],
        impact: [],
      },
    };
  }

  private incrementVersion(): string {
    const [major, minor] = this.version.split('.').map(Number);
    return `${major}.${minor + 1}`;
  }

  generateScheduleReport(): object {
    return {
      scheduleCode: this.scheduleCode,
      scheduleName: this.scheduleName,
      status: this.status,
      priority: this.priority,
      duration: this.getDuration(),
      utilization: this.calculateUtilization(),
      onTimePerformance: this.calculateOnTimePerformance(),
      numberOfJobs: this.numberOfJobs,
      makespan: this.totalMakespan,
      flowTime: this.averageFlowTime,
      optimization: this.optimizationResults,
      risks: this.riskAssessment,
      environmental: this.environmentalImpact,
      lastOptimized: this.lastOptimizedDate,
      version: this.version,
    };
  }

  canBeModified(): boolean {
    return this.status !== ScheduleStatus.FROZEN &&
           this.status !== ScheduleStatus.COMPLETED &&
           this.status !== ScheduleStatus.CANCELLED;
  }

  getSchedulingEfficiency(): number {
    // Calculate scheduling efficiency based on various metrics
    const utilizationScore = this.overallUtilization || 0;
    const onTimeScore = this.onTimeDeliveryRate || 0;
    const makespanScore = this.totalMakespan > 0 ? 
      Math.max(0, 100 - (this.totalMakespan / (this.getDuration() * 0.8)) * 100) : 0;

    return (utilizationScore + onTimeScore + makespanScore) / 3;
  }

  getBottleneckAnalysis(): object {
    // Analyze bottlenecks in the schedule
    return {
      workCenterBottlenecks: [],
      resourceBottlenecks: [],
      timeBottlenecks: [],
      recommendations: [],
    };
  }
}
