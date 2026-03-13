// Industry 5.0 ERP Backend - MaintenanceWorkOrder Entity
// Advanced work order management with AI scheduling and resource optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { Equipment } from './Equipment';
import { MaintenanceTechnician } from './MaintenanceTechnician';
import { MaintenanceTask } from './MaintenanceTask';
import { SparePart } from './SparePart';

export enum WorkOrderType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
  CALIBRATION = 'CALIBRATION',
  INSPECTION = 'INSPECTION',
  UPGRADE = 'UPGRADE',
}

export enum WorkOrderStatus {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

@Entity('maintenance_work_orders')
@Index(['equipmentId', 'status'])
@Index(['type', 'priority'])
@Index(['scheduledStartDate'])
export class MaintenanceWorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  workOrderNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: WorkOrderType })
  @Index()
  type: WorkOrderType;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.CREATED })
  @Index()
  status: WorkOrderStatus;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  @Index()
  priority: Priority;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assignedTechnicianId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  scheduledStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEndDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number; // minutes

  @Column({ type: 'int', nullable: true })
  actualDuration: number; // minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'json', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'json', nullable: true })
  requiredCertifications: string[];

  @Column({ type: 'json', nullable: true })
  requiredTools: {
    toolId: string;
    toolName: string;
    quantity: number;
    critical: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  safetyRequirements: {
    lockoutTagout: boolean;
    confinedSpace: boolean;
    hotWork: boolean;
    electricalSafety: boolean;
    chemicalHazards: boolean;
    personalProtectiveEquipment: string[];
    additionalPrecautions: string[];
  };

  @Column({ type: 'json', nullable: true })
  procedureSteps: {
    stepNumber: number;
    description: string;
    estimatedTime: number; // minutes
    safetyNotes?: string;
    requiredTools?: string[];
    checkpoints?: string[];
  }[];

  @Column({ type: 'text', nullable: true })
  workCompletedNotes: string;

  @Column({ type: 'json', nullable: true })
  completionChecklist: {
    item: string;
    completed: boolean;
    notes?: string;
    verifiedBy?: string;
    verificationDate?: Date;
  }[];

  @Column({ type: 'text', nullable: true })
  rootCauseAnalysis: string;

  @Column({ type: 'json', nullable: true })
  followUpActions: {
    action: string;
    assignedTo: string;
    dueDate: Date;
    priority: Priority;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];

  @Column({ type: 'json', nullable: true })
  qualityChecks: {
    checkName: string;
    passed: boolean;
    value?: number;
    unit?: string;
    notes?: string;
    checkedBy: string;
    checkedAt: Date;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  customerSatisfactionScore: number; // 0-10

  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
    uploadedBy: string;
    uploadedAt: Date;
    description?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  costBreakdown: {
    labor: number;
    materials: number;
    equipment: number;
    external: number;
    overhead: number;
  };

  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    firstTimeFixRate?: boolean;
    workOrderEfficiency?: number; // actual vs estimated time
    resourceUtilization?: number;
    qualityScore?: number;
    downtimeReduction?: number; // minutes saved
  };

  @Column({ type: 'boolean', default: false })
  requiresShutdown: boolean;

  @Column({ type: 'int', nullable: true })
  shutdownDuration: number; // minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shutdownCost: number;

  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    identifiedRisks: string[];
    mitigationMeasures: string[];
    residualRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assessedBy: string;
    assessmentDate: Date;
  };

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Equipment, equipment => equipment.workOrders)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @ManyToOne(() => MaintenanceTechnician, { nullable: true })
  @JoinColumn({ name: 'assignedTechnicianId' })
  assignedTechnician: MaintenanceTechnician;

  @OneToMany(() => MaintenanceTask, task => task.workOrder)
  tasks: MaintenanceTask[];

  // Computed properties
  get isOverdue(): boolean {
    if (!this.scheduledEndDate) return false;
    return new Date() > this.scheduledEndDate && this.status !== WorkOrderStatus.COMPLETED;
  }

  get completionPercentage(): number {
    if (!this.tasks || this.tasks.length === 0) return 0;
    const completedTasks = this.tasks.filter(task => task.status === 'COMPLETED').length;
    return (completedTasks / this.tasks.length) * 100;
  }

  get actualVsEstimatedTime(): number {
    if (!this.actualDuration || !this.estimatedDuration) return 0;
    return ((this.actualDuration - this.estimatedDuration) / this.estimatedDuration) * 100;
  }

  get actualVsEstimatedCost(): number {
    if (!this.actualCost || !this.estimatedCost) return 0;
    return ((this.actualCost - this.estimatedCost) / this.estimatedCost) * 100;
  }
}
