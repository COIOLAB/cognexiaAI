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
import { WorkCenter } from './WorkCenter';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  EMERGENCY = 'emergency',
  OVERHAUL = 'overhaul',
  CALIBRATION = 'calibration',
  INSPECTION = 'inspection',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
  PENDING_APPROVAL = 'pending_approval',
}

export enum MaintenancePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

@Entity('equipment_maintenance')
@Index(['workCenterId'])
@Index(['maintenanceType'])
@Index(['status'])
@Index(['priority'])
@Index(['scheduledDate'])
export class EquipmentMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  maintenanceNumber: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
    default: MaintenanceType.PREVENTIVE,
  })
  maintenanceType: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.NORMAL,
  })
  priority: MaintenancePriority;

  // Scheduling
  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDuration: number; // hours

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDuration: number; // hours

  // Maintenance Team
  @Column({ length: 100, nullable: true })
  assignedTechnician: string;

  @Column({ length: 100, nullable: true })
  supervisor: string;

  @Column({ type: 'jsonb', nullable: true })
  maintenanceTeam: {
    technicians: string[];
    specialists: string[];
    contractors: string[];
    requiredSkills: string[];
  };

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  contractorCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  // Parts and Materials
  @Column({ type: 'jsonb', nullable: true })
  partsRequired: {
    parts: object[];
    consumables: object[];
    lubricants: string[];
    tools: string[];
    specialEquipment: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  partsUsed: {
    parts: object[];
    quantities: object[];
    costs: object[];
    suppliers: object[];
  };

  // Work Performed
  @Column({ type: 'jsonb', nullable: true })
  workPerformed: {
    tasks: string[];
    procedures: string[];
    replacedParts: string[];
    adjustments: string[];
    tests: string[];
    observations: string[];
  };

  // Quality and Testing
  @Column({ type: 'jsonb', nullable: true })
  qualityChecks: {
    preMaintenanceCheck: object;
    postMaintenanceCheck: object;
    functionalTests: object[];
    performanceTests: object[];
    safetyTests: object[];
  };

  // Condition Assessment
  @Column({ type: 'jsonb', nullable: true })
  conditionAssessment: {
    beforeMaintenance: object;
    afterMaintenance: object;
    wear: object;
    damage: object;
    improvements: string[];
  };

  // Documentation
  @Column({ type: 'jsonb', nullable: true })
  documentation: {
    workOrders: string[];
    procedures: string[];
    manuals: string[];
    photos: string[];
    videos: string[];
    reports: string[];
  };

  // Safety Information
  @Column({ type: 'jsonb', nullable: true })
  safetyInformation: {
    hazards: string[];
    precautions: string[];
    ppe: string[];
    lockoutTagout: boolean;
    permits: string[];
    incidents: object[];
  };

  // Predictive Maintenance Data
  @Column({ type: 'boolean', default: false })
  isPredictiveMaintenance: boolean;

  @Column({ type: 'jsonb', nullable: true })
  predictiveData: {
    triggerCondition: string;
    sensorData: object[];
    aiPrediction: object;
    remainingLife: number;
    recommendedAction: string;
  };

  // Environmental Impact
  @Column({ type: 'jsonb', nullable: true })
  environmentalImpact: {
    waste: object[];
    emissions: object;
    energyConsumption: number;
    waterUsage: number;
    recycling: object[];
  };

  // Compliance and Standards
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    standards: string[];
    regulations: string[];
    certifications: string[];
    auditRequired: boolean;
    complianceStatus: string;
  };

  // Follow-up Actions
  @Column({ type: 'jsonb', nullable: true })
  followUpActions: {
    required: boolean;
    actions: string[];
    dueDate: Date;
    responsible: string;
    status: string;
  };

  // Next Maintenance
  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'int', nullable: true })
  maintenanceInterval: number; // days

  @Column({ type: 'jsonb', nullable: true })
  nextMaintenanceDetails: {
    type: string;
    estimatedDuration: number;
    partsRequired: string[];
    specialRequirements: string[];
  };

  // Digital Integration
  @Column({ type: 'boolean', default: false })
  isDigitallyIntegrated: boolean;

  @Column({ type: 'jsonb', nullable: true })
  digitalData: {
    workOrderSystem: string;
    cmmsIntegration: boolean;
    iotData: object[];
    aiAnalysis: object;
    digitalSignature: string;
  };

  // Performance Impact
  @Column({ type: 'jsonb', nullable: true })
  performanceImpact: {
    downtimeBefore: number; // hours
    downtimeAfter: number; // hours
    efficiencyBefore: number; // percentage
    efficiencyAfter: number; // percentage
    qualityImpact: string;
    productivityGain: number;
  };

  // Relationships
  @Column({ type: 'varchar' })
  workCenterId: string;

  @ManyToOne(() => WorkCenter, (workCenter) => workCenter.maintenanceRecords)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Methods
  calculateActualDuration(): number {
    if (this.startedAt && this.completedAt) {
      return (this.completedAt.getTime() - this.startedAt.getTime()) / (1000 * 60 * 60); // hours
    }
    return 0;
  }

  isOverdue(): boolean {
    if (!this.scheduledDate) return false;
    return new Date() > this.scheduledDate && 
           this.status !== MaintenanceStatus.COMPLETED &&
           this.status !== MaintenanceStatus.CANCELLED;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    return Math.ceil((now.getTime() - this.scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  getEfficiencyGain(): number {
    if (!this.performanceImpact) return 0;
    const before = this.performanceImpact.efficiencyBefore || 0;
    const after = this.performanceImpact.efficiencyAfter || 0;
    return after - before;
  }

  getDowntimeReduction(): number {
    if (!this.performanceImpact) return 0;
    const before = this.performanceImpact.downtimeBefore || 0;
    const after = this.performanceImpact.downtimeAfter || 0;
    return before - after;
  }

  calculateROI(): number {
    // Simple ROI calculation based on downtime reduction and efficiency gain
    if (this.totalCost <= 0) return 0;

    const downtimeReduction = this.getDowntimeReduction();
    const efficiencyGain = this.getEfficiencyGain();
    
    // Estimate value based on equipment hourly rate and efficiency
    const hourlyValue = this.workCenter?.hourlyRate || 100;
    const annualHours = 8760; // hours in a year
    
    const downtimeValue = downtimeReduction * hourlyValue;
    const efficiencyValue = (efficiencyGain / 100) * hourlyValue * annualHours;
    
    const totalValue = downtimeValue + efficiencyValue;
    return ((totalValue - this.totalCost) / this.totalCost) * 100;
  }

  updateStatus(newStatus: MaintenanceStatus, userId?: string): void {
    this.status = newStatus;
    
    if (newStatus === MaintenanceStatus.IN_PROGRESS && !this.startedAt) {
      this.startedAt = new Date();
    }
    
    if (newStatus === MaintenanceStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
      this.actualDuration = this.calculateActualDuration();
      
      // Calculate next maintenance date if interval is set
      if (this.maintenanceInterval) {
        const nextDate = new Date(this.completedAt);
        nextDate.setDate(nextDate.getDate() + this.maintenanceInterval);
        this.nextMaintenanceDate = nextDate;
      }
    }
    
    if (userId) {
      this.updatedBy = userId;
    }
  }

  validateMaintenance(): string[] {
    const errors: string[] = [];

    if (!this.scheduledDate) {
      errors.push('Scheduled date is required');
    }

    if (!this.workCenterId) {
      errors.push('Work center is required');
    }

    if (this.estimatedDuration && this.estimatedDuration <= 0) {
      errors.push('Estimated duration must be positive');
    }

    if (this.status === MaintenanceStatus.COMPLETED && !this.completedAt) {
      errors.push('Completion date is required for completed maintenance');
    }

    if (this.totalCost < 0) {
      errors.push('Total cost cannot be negative');
    }

    return errors;
  }

  generateMaintenanceReport(): object {
    return {
      maintenanceNumber: this.maintenanceNumber,
      title: this.title,
      type: this.maintenanceType,
      status: this.status,
      priority: this.priority,
      workCenter: this.workCenter?.name,
      scheduledDate: this.scheduledDate,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      estimatedDuration: this.estimatedDuration,
      actualDuration: this.actualDuration,
      assignedTechnician: this.assignedTechnician,
      totalCost: this.totalCost,
      workPerformed: this.workPerformed,
      qualityChecks: this.qualityChecks,
      efficiencyGain: this.getEfficiencyGain(),
      downtimeReduction: this.getDowntimeReduction(),
      roi: this.calculateROI(),
      nextMaintenanceDate: this.nextMaintenanceDate,
    };
  }

  clone(newScheduledDate: Date): Partial<EquipmentMaintenance> {
    return {
      title: this.title,
      description: this.description,
      maintenanceType: this.maintenanceType,
      priority: this.priority,
      scheduledDate: newScheduledDate,
      estimatedDuration: this.estimatedDuration,
      workCenterId: this.workCenterId,
      partsRequired: this.partsRequired,
      safetyInformation: this.safetyInformation,
      compliance: this.compliance,
      status: MaintenanceStatus.SCHEDULED,
    };
  }

  canStart(): boolean {
    return this.status === MaintenanceStatus.SCHEDULED &&
           new Date() >= this.scheduledDate &&
           this.assignedTechnician !== null;
  }

  requiresApproval(): boolean {
    return this.priority === MaintenancePriority.CRITICAL ||
           this.priority === MaintenancePriority.EMERGENCY ||
           this.totalCost > 10000; // Configurable threshold
  }

  getMaintenanceHistory(): object {
    return {
      created: this.createdAt,
      scheduled: this.scheduledDate,
      started: this.startedAt,
      completed: this.completedAt,
      statusChanges: [], // Would need separate tracking table in practice
      costEvolution: [], // Would need separate tracking table in practice
    };
  }
}
