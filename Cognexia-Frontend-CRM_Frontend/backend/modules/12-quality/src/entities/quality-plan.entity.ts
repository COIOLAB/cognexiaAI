import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { QualityInspection } from './quality-inspection.entity';

export enum QualityPlanType {
  INCOMING_INSPECTION = 'incoming_inspection',
  IN_PROCESS_CONTROL = 'in_process_control',
  FINAL_INSPECTION = 'final_inspection',
  AUDIT_PLAN = 'audit_plan',
  CALIBRATION_PLAN = 'calibration_plan',
  COMPLIANCE_PLAN = 'compliance_plan',
}

export enum QualityPlanStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  RETIRED = 'retired',
}

export enum InspectionFrequency {
  EVERY_BATCH = 'every_batch',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand',
}

@Entity('quality_plans')
@Index(['productCode', 'workCenterId'])
@Index(['status', 'isActive'])
export class QualityPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  planNumber: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: QualityPlanType,
  })
  type: QualityPlanType;

  @Column({
    type: 'enum',
    enum: QualityPlanStatus,
    default: QualityPlanStatus.DRAFT,
  })
  status: QualityPlanStatus;

  @Column()
  productCode: string;

  @Column()
  productName: string;

  @Column()
  workCenterId: string;

  @Column()
  workCenterName: string;

  @Column('decimal', { precision: 3, scale: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: InspectionFrequency,
    default: InspectionFrequency.EVERY_BATCH,
  })
  inspectionFrequency: InspectionFrequency;

  @Column('int', { default: 1 })
  sampleSize: number;

  @Column('decimal', { precision: 5, scale: 2, default: 95.0 })
  acceptableQualityLevel: number;

  @Column('json')
  inspectionParameters: Array<{
    parameter: string;
    type: 'measurement' | 'visual' | 'functional' | 'attribute';
    specification: {
      min?: number;
      max?: number;
      target?: number;
      unit?: string;
      tolerance?: number;
    };
    method: string;
    equipment: string;
    frequency: string;
    criticalLevel: 'critical' | 'major' | 'minor';
    acceptanceCriteria: string;
  }>;

  @Column('json', { nullable: true })
  visualInspectionCriteria: Array<{
    aspect: string;
    description: string;
    acceptableDefects: number;
    severity: 'critical' | 'major' | 'minor';
    images?: string[];
  }>;

  @Column('json', { nullable: true })
  functionalTests: Array<{
    testName: string;
    procedure: string;
    expectedResult: string;
    equipment: string;
    duration: number;
    acceptance: string;
  }>;

  @Column('json')
  complianceStandards: {
    iso: string[];
    industry: string[];
    customer: string[];
    regulatory: string[];
  };

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column('json', { nullable: true })
  pharmaSpecific?: {
    gmpRequirements: string[];
    validationProtocol: string;
    cleaningProcedure: string;
    environmentalControls: {
      temperature: { min: number; max: number };
      humidity: { min: number; max: number };
      particleCount: number;
      microbialLimits: number;
    };
  };

  @Column('json', { nullable: true })
  automotiveSpecific?: {
    ppapRequirements: string[];
    ts16949Compliance: string[];
    customerSpecifications: string[];
    apqpPhase: string;
  };

  @Column('json', { nullable: true })
  chemicalSpecific?: {
    safetyRequirements: string[];
    hazmatCompliance: string[];
    environmentalLimits: any;
    reactivityTests: string[];
  };

  @Column('json', { nullable: true })
  equipmentCalibration: Array<{
    equipmentId: string;
    calibrationFrequency: string;
    tolerance: number;
    calibrationLab: string;
  }>;

  @Column('json', { nullable: true })
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationActions: string[];
    contingencyPlans: string[];
  };

  @Column('json', { nullable: true })
  approvalWorkflow: Array<{
    role: string;
    approver: string;
    approvedAt?: Date;
    comments?: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  requiresValidation: boolean;

  @Column('text', { nullable: true })
  validationNotes: string;

  @Column('json', { nullable: true })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;

  @Column('json', { nullable: true })
  changeHistory: Array<{
    version: number;
    changes: string;
    changedBy: string;
    changedAt: Date;
    reason: string;
  }>;

  // Relationships
  @OneToMany(() => QualityInspection, inspection => inspection.qualityPlan)
  inspections: QualityInspection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
