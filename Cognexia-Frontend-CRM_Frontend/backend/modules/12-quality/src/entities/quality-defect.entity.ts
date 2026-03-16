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
import { QualityInspection } from './quality-inspection.entity';

export enum DefectType {
  DIMENSIONAL = 'dimensional',
  SURFACE_FINISH = 'surface_finish',
  MATERIAL = 'material',
  ASSEMBLY = 'assembly',
  FUNCTIONAL = 'functional',
  VISUAL = 'visual',
  CONTAMINATION = 'contamination',
  PACKAGING = 'packaging',
  LABELING = 'labeling',
  DOCUMENTATION = 'documentation',
}

export enum DefectSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  COSMETIC = 'cosmetic',
}

export enum DefectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum RootCauseCategory {
  MACHINE = 'machine',
  METHOD = 'method',
  MATERIAL = 'material',
  MANPOWER = 'manpower',
  MEASUREMENT = 'measurement',
  ENVIRONMENT = 'environment',
  DESIGN = 'design',
  SUPPLIER = 'supplier',
}

@Entity('quality_defects')
@Index(['defectNumber'])
@Index(['type', 'severity'])
@Index(['status', 'createdAt'])
@Index(['workCenterId', 'productCode'])
export class QualityDefect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  defectNumber: string;

  @Column({
    type: 'enum',
    enum: DefectType,
  })
  type: DefectType;

  @Column({
    type: 'enum',
    enum: DefectSeverity,
  })
  severity: DefectSeverity;

  @Column({
    type: 'enum',
    enum: DefectStatus,
    default: DefectStatus.OPEN,
  })
  status: DefectStatus;

  @Column()
  workCenterId: string;

  @Column()
  workCenterName: string;

  @Column({ nullable: true })
  productionOrderId: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column()
  productCode: string;

  @Column()
  productName: string;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  detailedDescription: string;

  @Column({ nullable: true })
  location: string;

  @Column('json', { nullable: true })
  dimensions: {
    actual?: number;
    specification?: number;
    tolerance?: number;
    unit?: string;
    deviation?: number;
  };

  @Column('json', { nullable: true })
  images: Array<{
    filename: string;
    url: string;
    description?: string;
    uploadedAt: Date;
    annotations?: any;
  }>;

  @Column('json', { nullable: true })
  measurements: Array<{
    parameter: string;
    actual: number;
    specification: number;
    unit: string;
    deviation: number;
    equipmentUsed: string;
  }>;

  @Column()
  detectedBy: string;

  @Column({ nullable: true })
  detectedByName: string;

  @Column({ type: 'timestamp' })
  detectedAt: Date;

  @Column({ nullable: true })
  customerImpact: string;

  @Column({ default: false })
  customerNotified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  customerNotifiedAt: Date;

  @Column({
    type: 'enum',
    enum: RootCauseCategory,
    nullable: true,
  })
  rootCauseCategory: RootCauseCategory;

  @Column('text', { nullable: true })
  rootCauseAnalysis: string;

  @Column('json', { nullable: true })
  fishboneAnalysis: {
    machine?: string[];
    method?: string[];
    material?: string[];
    manpower?: string[];
    measurement?: string[];
    environment?: string[];
  };

  @Column('json', { nullable: true })
  correctiveActions: Array<{
    action: string;
    assignedTo: string;
    assignedToName?: string;
    dueDate: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'verified';
    completedAt?: Date;
    verifiedBy?: string;
    effectiveness?: 'effective' | 'partially_effective' | 'ineffective';
    notes?: string;
  }>;

  @Column('json', { nullable: true })
  preventiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    impact: string;
  }>;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costImpact: number;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column('json', { nullable: true })
  costBreakdown: {
    material?: number;
    labor?: number;
    rework?: number;
    scrap?: number;
    downtime?: number;
    investigation?: number;
  };

  @Column({ default: false })
  requiresCustomerApproval: boolean;

  @Column({ default: false })
  customerApproved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  customerApprovedAt: Date;

  @Column({ nullable: true })
  customerApprovedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  targetResolutionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualResolutionDate: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedByName: string;

  @Column('text', { nullable: true })
  resolutionNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  verifiedByName: string;

  @Column('text', { nullable: true })
  verificationNotes: string;

  @Column('json', { nullable: true })
  followUpInspections: Array<{
    inspectionId: string;
    date: Date;
    result: string;
    inspector: string;
  }>;

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column('json', { nullable: true })
  pharmaSpecific?: {
    deviationNumber: string;
    capa: {
      required: boolean;
      number?: string;
      dueDate?: Date;
    };
    qualification: {
      affected: string[];
      requalificationRequired: boolean;
    };
  };

  @Column('json', { nullable: true })
  automotiveSpecific?: {
    ppapImpact: boolean;
    customerPartNumber: string;
    sortingRequired: boolean;
    containmentActions: string[];
  };

  @Column('json', { nullable: true })
  complianceImpact: {
    standards: string[];
    regulations: string[];
    reportingRequired: boolean;
    reportedTo?: string[];
    reportedAt?: Date;
  };

  @Column('json', { nullable: true })
  lessons_learned: Array<{
    lesson: string;
    category: string;
    applicableAreas: string[];
    implementedActions: string[];
  }>;

  @Column('json', { nullable: true })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
    description?: string;
    uploadedAt: Date;
  }>;

  // Relationships
  @ManyToOne(() => QualityInspection, { nullable: true })
  @JoinColumn({ name: 'inspectionId' })
  inspection: QualityInspection;

  @Column({ nullable: true })
  inspectionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
