import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { QualityPlan } from './quality-plan.entity';
import { QualityDefect } from './quality-defect.entity';

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum InspectionType {
  INCOMING = 'incoming',
  IN_PROCESS = 'in_process',
  FINAL = 'final',
  AUDIT = 'audit',
  CALIBRATION = 'calibration',
  COMPLIANCE = 'compliance',
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL_PASS = 'conditional_pass',
  PENDING = 'pending',
}

@Entity('quality_inspections')
export class QualityInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  inspectionNumber: string;

  @Column({
    type: 'enum',
    enum: InspectionType,
  })
  type: InspectionType;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.SCHEDULED,
  })
  status: InspectionStatus;

  @Column({
    type: 'enum',
    enum: InspectionResult,
    nullable: true,
  })
  result: InspectionResult;

  @Column()
  workCenterId: string;

  @Column({ nullable: true })
  productionOrderId: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ nullable: true })
  productCode: string;

  @Column()
  inspectorId: string;

  @Column({ nullable: true })
  inspectorName: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'json', nullable: true })
  inspectionParameters: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  testResults: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  measurements: Array<{
    parameter: string;
    value: number;
    unit: string;
    specification: { min?: number; max?: number; target?: number };
    passed: boolean;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'json', nullable: true })
  corrective_actions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
  }>;

  @Column({ type: 'json', nullable: true })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
  }>;

  @Column({ default: false })
  requiresReInspection: boolean;

  @Column({ nullable: true })
  reInspectionReason: string;

  @Column({ type: 'json', nullable: true })
  compliance: {
    standards: string[];
    regulations: string[];
    certifications: string[];
  };

  @Column({ type: 'json', nullable: true })
  industrySpecific: Record<string, any>;

  // Relationships
  @ManyToOne(() => QualityPlan, { nullable: true })
  @JoinColumn({ name: 'qualityPlanId' })
  qualityPlan: QualityPlan;

  @Column({ nullable: true })
  qualityPlanId: string;

  @OneToMany(() => QualityDefect, defect => defect.inspection)
  defects: QualityDefect[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
