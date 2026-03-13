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
  BeforeInsert
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsArray } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// Enums
export enum QualityPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum InspectionType {
  INCOMING = 'incoming',
  IN_PROCESS = 'in_process',
  FINAL = 'final',
  AUDIT = 'audit',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier'
}

export enum InspectionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PASSED = 'passed',
  FAILED = 'failed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL_PASS = 'conditional_pass',
  PENDING = 'pending',
  NOT_APPLICABLE = 'not_applicable'
}

export enum NonConformanceStatus {
  OPEN = 'open',
  UNDER_INVESTIGATION = 'under_investigation',
  CORRECTIVE_ACTION = 'corrective_action',
  VERIFICATION = 'verification',
  CLOSED = 'closed',
  REJECTED = 'rejected'
}

export enum NonConformanceSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
  CATASTROPHIC = 'catastrophic'
}

export enum CAPAStatus {
  OPEN = 'open',
  INVESTIGATION = 'investigation',
  ACTION_PLANNING = 'action_planning',
  IMPLEMENTATION = 'implementation',
  VERIFICATION = 'verification',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum CAPAType {
  CORRECTIVE = 'corrective',
  PREVENTIVE = 'preventive',
  BOTH = 'both'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  OBSOLETE = 'obsolete'
}

export enum TrainingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Quality Plan Entity
 * Represents quality control and assurance plans
 */
@Entity('quality_plans')
@Index(['organizationId', 'status'])
@Index(['planType'])
@Index(['effectiveDate', 'expiryDate'])
export class QualityPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  planNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  planType: string; // 'product', 'process', 'system', 'project'

  @Column({ 
    type: 'enum', 
    enum: QualityPlanStatus,
    default: QualityPlanStatus.DRAFT
  })
  @IsEnum(QualityPlanStatus)
  status: QualityPlanStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'text', nullable: true })
  versionNotes: string;

  // Scope and Objectives
  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  objectives: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  qualityRequirements: any[];

  // Standards and References
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  applicableStandards: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  referenceDocuments: any[];

  // Quality Activities
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  qualityActivities: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  inspectionPlan: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  testPlan: any[];

  // Resources and Responsibilities
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  responsibilities: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  requiredResources: any[];

  // Risk Assessment
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  identifiedRisks: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  mitigationStrategies: any[];

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  kpis: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  acceptanceCriteria: any[];

  // Approval and Review
  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @OneToMany(() => Inspection, inspection => inspection.qualityPlan)
  inspections: Inspection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generatePlanNumber() {
    if (!this.planNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.planNumber = `QP-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  approve(approver: User): void {
    if (this.status === QualityPlanStatus.UNDER_REVIEW) {
      this.status = QualityPlanStatus.APPROVED;
      this.approvedById = approver.id;
      this.approvalDate = new Date();
    }
  }

  activate(): void {
    if (this.status === QualityPlanStatus.APPROVED) {
      this.status = QualityPlanStatus.ACTIVE;
    }
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  needsReview(): boolean {
    if (!this.nextReviewDate) return false;
    return new Date() >= this.nextReviewDate;
  }

  createNewVersion(versionNotes: string): QualityPlan {
    const newPlan = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    newPlan.id = undefined;
    newPlan.version = this.version + 1;
    newPlan.versionNotes = versionNotes;
    newPlan.status = QualityPlanStatus.DRAFT;
    newPlan.approvalDate = null;
    newPlan.approvedById = null;
    return newPlan;
  }
}

/**
 * Inspection Entity
 * Represents quality inspections and tests
 */
@Entity('inspections')
@Index(['organizationId', 'status'])
@Index(['inspectionType', 'result'])
@Index(['inspectionNumber'], { unique: true })
@Index(['scheduledDate'])
@Index(['productLot'])
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  inspectionNumber: string;

  @Column({ 
    type: 'enum', 
    enum: InspectionType,
    default: InspectionType.IN_PROCESS
  })
  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @Column({ 
    type: 'enum', 
    enum: InspectionStatus,
    default: InspectionStatus.PLANNED
  })
  @IsEnum(InspectionStatus)
  status: InspectionStatus;

  @Column({ 
    type: 'enum', 
    enum: InspectionResult,
    default: InspectionResult.PENDING
  })
  @IsEnum(InspectionResult)
  result: InspectionResult;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Product/Item Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  productCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  quantityInspected: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  // Scheduling
  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  completionTime: Date;

  @Column({ type: 'int', nullable: true })
  estimatedDurationMinutes: number;

  @Column({ type: 'int', nullable: true })
  actualDurationMinutes: number;

  // Inspection Criteria
  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsArray()
  inspectionCriteria: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  testParameters: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  acceptanceCriteria: any[];

  // Results and Measurements
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  measurements: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  observations: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  defects: any[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  passRate: number; // percentage

  // Documentation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  photos: any[];

  // Environmental Conditions
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity: number;

  @Column({ type: 'text', nullable: true })
  environmentalConditions: string;

  // Equipment Used
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  equipmentUsed: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  calibrationRecords: any[];

  // Follow-up Actions
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresFollowUp: boolean;

  @Column({ type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ type: 'text', nullable: true })
  followUpActions: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  qualityPlanId: string;

  @ManyToOne(() => QualityPlan, plan => plan.inspections, { nullable: true })
  @JoinColumn({ name: 'qualityPlanId' })
  qualityPlan: QualityPlan;

  @Column({ type: 'uuid', nullable: true })
  inspectorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;

  @OneToMany(() => NonConformance, nc => nc.inspection)
  nonConformances: NonConformance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateInspectionNumber() {
    if (!this.inspectionNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.inspectionNumber = `INS-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  startInspection(): void {
    if (this.status === InspectionStatus.PLANNED) {
      this.status = InspectionStatus.IN_PROGRESS;
      this.startTime = new Date();
    }
  }

  completeInspection(resultData: any): void {
    if (this.status === InspectionStatus.IN_PROGRESS) {
      this.status = InspectionStatus.COMPLETED;
      this.completionTime = new Date();
      this.measurements = resultData.measurements || this.measurements;
      this.observations = resultData.observations || this.observations;
      this.defects = resultData.defects || this.defects;
      this.notes = resultData.notes || this.notes;
      
      // Calculate duration
      if (this.startTime) {
        const duration = (this.completionTime.getTime() - this.startTime.getTime()) / (1000 * 60);
        this.actualDurationMinutes = Math.round(duration);
      }

      // Determine result based on criteria
      this.evaluateResult();
    }
  }

  evaluateResult(): void {
    if (!this.measurements || this.measurements.length === 0) {
      this.result = InspectionResult.PENDING;
      return;
    }

    let passedCount = 0;
    let totalCount = 0;

    this.measurements.forEach(measurement => {
      totalCount++;
      if (measurement.result === 'pass' || measurement.withinTolerance) {
        passedCount++;
      }
    });

    if (totalCount > 0) {
      this.passRate = (passedCount / totalCount) * 100;
      this.overallScore = this.passRate;

      if (this.passRate === 100) {
        this.result = InspectionResult.PASS;
        this.status = InspectionStatus.PASSED;
      } else if (this.passRate >= 80) {
        this.result = InspectionResult.CONDITIONAL_PASS;
      } else {
        this.result = InspectionResult.FAIL;
        this.status = InspectionStatus.FAILED;
      }
    }
  }

  isOverdue(): boolean {
    if (this.status === InspectionStatus.COMPLETED) return false;
    return new Date() > this.scheduledDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    
    const today = new Date();
    const scheduled = new Date(this.scheduledDate);
    const diffTime = today.getTime() - scheduled.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  requiresCalibrationCheck(): boolean {
    if (!this.equipmentUsed) return false;
    
    return this.equipmentUsed.some(equipment => {
      if (equipment.lastCalibrationDate) {
        const calibrationDate = new Date(equipment.lastCalibrationDate);
        const today = new Date();
        const daysSinceCalibration = (today.getTime() - calibrationDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCalibration > (equipment.calibrationInterval || 365);
      }
      return true;
    });
  }
}

/**
 * Non-Conformance Entity
 * Represents quality issues and non-conformances
 */
@Entity('non_conformances')
@Index(['organizationId', 'status'])
@Index(['severity', 'priority'])
@Index(['ncNumber'], { unique: true })
@Index(['detectedDate'])
@Index(['productLot'])
export class NonConformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  ncNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({ 
    type: 'enum', 
    enum: NonConformanceStatus,
    default: NonConformanceStatus.OPEN
  })
  @IsEnum(NonConformanceStatus)
  status: NonConformanceStatus;

  @Column({ 
    type: 'enum', 
    enum: NonConformanceSeverity,
    default: NonConformanceSeverity.MINOR
  })
  @IsEnum(NonConformanceSeverity)
  severity: NonConformanceSeverity;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.MEDIUM
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  category: string; // 'product', 'process', 'documentation', 'system'

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  // Detection Information
  @Column({ type: 'timestamp' })
  detectedDate: Date;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  detectionMethod: string; // 'inspection', 'audit', 'customer_complaint', 'self_discovery'

  @Column({ type: 'varchar', length: 255, nullable: true })
  detectionLocation: string;

  // Product/Process Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  affectedProduct: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  affectedProcess: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  quantityAffected: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  // Root Cause Analysis
  @Column({ type: 'text', nullable: true })
  rootCauseAnalysis: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  contributingFactors: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  rootCauseMethod: string; // '5_whys', 'fishbone', 'fault_tree', 'pareto'

  // Impact Assessment
  @Column({ type: 'text', nullable: true })
  impactAssessment: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  customerImpacted: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  regulatoryImpact: boolean;

  // Containment Actions
  @Column({ type: 'text', nullable: true })
  immediateActions: string;

  @Column({ type: 'timestamp', nullable: true })
  containmentDate: Date;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  containmentVerified: boolean;

  // Investigation
  @Column({ type: 'timestamp', nullable: true })
  investigationStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  investigationCompleteDate: Date;

  @Column({ type: 'text', nullable: true })
  investigationNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  evidenceCollected: any[];

  // Resolution
  @Column({ type: 'text', nullable: true })
  correctionActions: string;

  @Column({ type: 'date', nullable: true })
  targetCompletionDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  // Verification and Closure
  @Column({ type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  effectivenessVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  closureDate: Date;

  @Column({ type: 'text', nullable: true })
  closureNotes: string;

  // Documentation
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  photos: any[];

  // Recurrence Prevention
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relatedNCNumbers: string; // Comma-separated list of related NC numbers

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  inspectionId: string;

  @ManyToOne(() => Inspection, inspection => inspection.nonConformances, { nullable: true })
  @JoinColumn({ name: 'inspectionId' })
  inspection: Inspection;

  @Column({ type: 'uuid', nullable: true })
  detectedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'detectedById' })
  detectedBy: User;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: User;

  @OneToMany(() => CAPA, capa => capa.nonConformance)
  capas: CAPA[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateNCNumber() {
    if (!this.ncNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.ncNumber = `NC-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  assignTo(user: User): void {
    if (this.status === NonConformanceStatus.OPEN) {
      this.assignedToId = user.id;
      this.status = NonConformanceStatus.UNDER_INVESTIGATION;
    }
  }

  startCorrectiveAction(): void {
    if (this.status === NonConformanceStatus.UNDER_INVESTIGATION) {
      this.status = NonConformanceStatus.CORRECTIVE_ACTION;
    }
  }

  submitForVerification(): void {
    if (this.status === NonConformanceStatus.CORRECTIVE_ACTION) {
      this.status = NonConformanceStatus.VERIFICATION;
    }
  }

  verify(verifier: User, notes: string, effective: boolean): void {
    if (this.status === NonConformanceStatus.VERIFICATION) {
      this.verifiedById = verifier.id;
      this.verificationDate = new Date();
      this.verificationNotes = notes;
      this.effectivenessVerified = effective;
      
      if (effective) {
        this.close();
      } else {
        this.status = NonConformanceStatus.CORRECTIVE_ACTION; // Back to corrective action
      }
    }
  }

  close(): void {
    if (this.status === NonConformanceStatus.VERIFICATION && this.effectivenessVerified) {
      this.status = NonConformanceStatus.CLOSED;
      this.closureDate = new Date();
      this.actualCompletionDate = new Date();
    }
  }

  isOverdue(): boolean {
    if (this.status === NonConformanceStatus.CLOSED || !this.targetCompletionDate) {
      return false;
    }
    return new Date() > this.targetCompletionDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    
    const today = new Date();
    const target = new Date(this.targetCompletionDate);
    const diffTime = today.getTime() - target.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateResolutionTime(): number {
    if (!this.actualCompletionDate) return 0;
    
    const start = new Date(this.detectedDate);
    const end = new Date(this.actualCompletionDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  requiresCAPAAction(): boolean {
    return this.severity === NonConformanceSeverity.MAJOR || 
           this.severity === NonConformanceSeverity.CRITICAL ||
           this.severity === NonConformanceSeverity.CATASTROPHIC ||
           this.isRecurring ||
           this.customerImpacted ||
           this.regulatoryImpact;
  }
}

/**
 * CAPA (Corrective and Preventive Actions) Entity
 * Represents systematic approaches to eliminate causes of non-conformities
 */
@Entity('capas')
@Index(['organizationId', 'status'])
@Index(['capaType', 'priority'])
@Index(['capaNumber'], { unique: true })
@Index(['targetDate'])
export class CAPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  capaNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({ 
    type: 'enum', 
    enum: CAPAStatus,
    default: CAPAStatus.OPEN
  })
  @IsEnum(CAPAStatus)
  status: CAPAStatus;

  @Column({ 
    type: 'enum', 
    enum: CAPAType,
    default: CAPAType.CORRECTIVE
  })
  @IsEnum(CAPAType)
  capaType: CAPAType;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.MEDIUM
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  category: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  problemStatement: string;

  // Root Cause Analysis
  @Column({ type: 'text', nullable: true })
  rootCauseAnalysis: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rootCauseMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  rootCauses: any[];

  // Investigation Phase
  @Column({ type: 'timestamp', nullable: true })
  investigationStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  investigationEndDate: Date;

  @Column({ type: 'text', nullable: true })
  investigationSummary: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  evidenceGathered: any[];

  // Action Planning
  @Column({ type: 'timestamp', nullable: true })
  planningStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  planningEndDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  plannedActions: any[];

  @Column({ type: 'text', nullable: true })
  actionPlan: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  resourcesRequired: any[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedCost: number;

  // Implementation
  @Column({ type: 'timestamp', nullable: true })
  implementationStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  implementationEndDate: Date;

  @Column({ type: 'text', nullable: true })
  implementationNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  implementedActions: any[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  implementationProgress: number; // 0-100%

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualCost: number;

  // Verification
  @Column({ type: 'timestamp', nullable: true })
  verificationStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  verificationEndDate: Date;

  @Column({ type: 'text', nullable: true })
  verificationMethod: string;

  @Column({ type: 'text', nullable: true })
  verificationResults: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  effectivenessVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  verificationEvidence: any[];

  // Timeline
  @Column({ type: 'date' })
  targetDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ type: 'date', nullable: true })
  effectivenessReviewDate: Date;

  // Follow-up
  @Column({ type: 'text', nullable: true })
  followUpActions: string;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'text', nullable: true })
  lessonsLearned: string;

  // Documentation
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Closure
  @Column({ type: 'timestamp', nullable: true })
  closureDate: Date;

  @Column({ type: 'text', nullable: true })
  closureNotes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  nonConformanceId: string;

  @ManyToOne(() => NonConformance, nc => nc.capas, { nullable: true })
  @JoinColumn({ name: 'nonConformanceId' })
  nonConformance: NonConformance;

  @Column({ type: 'uuid', nullable: true })
  initiatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'initiatedById' })
  initiatedBy: User;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateCAPANumber() {
    if (!this.capaNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.capaNumber = `CAPA-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  startInvestigation(): void {
    if (this.status === CAPAStatus.OPEN) {
      this.status = CAPAStatus.INVESTIGATION;
      this.investigationStartDate = new Date();
    }
  }

  completeInvestigation(summary: string, evidence: any[]): void {
    if (this.status === CAPAStatus.INVESTIGATION) {
      this.status = CAPAStatus.ACTION_PLANNING;
      this.investigationEndDate = new Date();
      this.investigationSummary = summary;
      this.evidenceGathered = evidence;
    }
  }

  startActionPlanning(): void {
    if (this.status === CAPAStatus.ACTION_PLANNING) {
      this.planningStartDate = new Date();
    }
  }

  completeActionPlanning(actionPlan: string, actions: any[]): void {
    if (this.status === CAPAStatus.ACTION_PLANNING) {
      this.planningEndDate = new Date();
      this.actionPlan = actionPlan;
      this.plannedActions = actions;
    }
  }

  startImplementation(): void {
    if (this.status === CAPAStatus.ACTION_PLANNING) {
      this.status = CAPAStatus.IMPLEMENTATION;
      this.implementationStartDate = new Date();
    }
  }

  updateImplementationProgress(progress: number, notes: string): void {
    if (this.status === CAPAStatus.IMPLEMENTATION) {
      this.implementationProgress = Math.min(100, Math.max(0, progress));
      this.implementationNotes = notes;
      
      if (this.implementationProgress === 100) {
        this.implementationEndDate = new Date();
        this.status = CAPAStatus.VERIFICATION;
      }
    }
  }

  startVerification(): void {
    if (this.status === CAPAStatus.VERIFICATION) {
      this.verificationStartDate = new Date();
    }
  }

  completeVerification(verifier: User, results: string, effective: boolean): void {
    if (this.status === CAPAStatus.VERIFICATION) {
      this.verifiedById = verifier.id;
      this.verificationEndDate = new Date();
      this.verificationResults = results;
      this.effectivenessVerified = effective;
      
      if (effective) {
        this.close();
      } else {
        this.status = CAPAStatus.IMPLEMENTATION; // Back to implementation
      }
    }
  }

  close(): void {
    if (this.status === CAPAStatus.VERIFICATION && this.effectivenessVerified) {
      this.status = CAPAStatus.CLOSED;
      this.closureDate = new Date();
      this.actualCompletionDate = new Date();
    }
  }

  isOverdue(): boolean {
    if (this.status === CAPAStatus.CLOSED || !this.targetDate) {
      return false;
    }
    return new Date() > this.targetDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    
    const today = new Date();
    const target = new Date(this.targetDate);
    const diffTime = today.getTime() - target.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateTotalTime(): number {
    if (!this.actualCompletionDate) return 0;
    
    const start = new Date(this.createdAt);
    const end = new Date(this.actualCompletionDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateCostVariance(): number {
    if (!this.estimatedCost || this.estimatedCost === 0) return 0;
    if (!this.actualCost) return 0;
    
    return ((this.actualCost - this.estimatedCost) / this.estimatedCost) * 100;
  }
}

/**
 * Quality Document Entity
 * Represents quality management documents
 */
@Entity('quality_documents')
@Index(['organizationId', 'status'])
@Index(['documentType'])
@Index(['documentNumber'], { unique: true })
@Index(['effectiveDate', 'reviewDate'])
export class QualityDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  documentNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  documentType: string; // 'procedure', 'work_instruction', 'specification', 'form', 'policy'

  @Column({ 
    type: 'enum', 
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT
  })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  relatedDocuments: string[];

  @Column({ type: 'text', nullable: true })
  revisionNotes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateDocumentNumber() {
    if (!this.documentNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.documentNumber = `QD-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  needsReview(): boolean {
    if (!this.reviewDate) return false;
    return new Date() >= this.reviewDate;
  }

  approve(approver: User): void {
    if (this.status === DocumentStatus.UNDER_REVIEW) {
      this.status = DocumentStatus.APPROVED;
      this.approvedById = approver.id;
    }
  }

  activate(): void {
    if (this.status === DocumentStatus.APPROVED) {
      this.status = DocumentStatus.ACTIVE;
    }
  }

  makeObsolete(): void {
    this.status = DocumentStatus.OBSOLETE;
  }
}

/**
 * Quality Metrics Entity
 * Stores aggregated quality metrics and KPIs
 */
@Entity('quality_metrics')
@Index(['organizationId', 'metricDate'])
@Index(['metricType'])
@Index(['period'])
export class QualityMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // 'defect_rate', 'first_pass_yield', 'customer_satisfaction', 'cost_of_quality'

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  period: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  metricValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  targetValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  previousValue: number;

  @Column({ type: 'int', default: 0 })
  totalInspections: number;

  @Column({ type: 'int', default: 0 })
  passedInspections: number;

  @Column({ type: 'int', default: 0 })
  failedInspections: number;

  @Column({ type: 'int', default: 0 })
  totalNonConformances: number;

  @Column({ type: 'int', default: 0 })
  closedNonConformances: number;

  @Column({ type: 'int', default: 0 })
  overdueNonConformances: number;

  @Column({ type: 'int', default: 0 })
  totalCAPAs: number;

  @Column({ type: 'int', default: 0 })
  closedCAPAs: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costOfQuality: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  preventionCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  appraisalCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  internalFailureCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  externalFailureCosts: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  additionalMetrics: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateFirstPassYield(): number {
    if (this.totalInspections === 0) return 0;
    return (this.passedInspections / this.totalInspections) * 100;
  }

  calculateDefectRate(): number {
    if (this.totalInspections === 0) return 0;
    return (this.failedInspections / this.totalInspections) * 100;
  }

  calculateNCClosureRate(): number {
    if (this.totalNonConformances === 0) return 0;
    return (this.closedNonConformances / this.totalNonConformances) * 100;
  }

  calculateCAPAClosureRate(): number {
    if (this.totalCAPAs === 0) return 0;
    return (this.closedCAPAs / this.totalCAPAs) * 100;
  }

  calculateCOQPercentage(totalRevenue: number): number {
    if (totalRevenue === 0) return 0;
    return (this.costOfQuality / totalRevenue) * 100;
  }

  isTargetMet(): boolean {
    if (!this.targetValue) return false;
    
    // For metrics like defect rate, lower is better
    if (this.metricType.includes('rate') || this.metricType.includes('cost')) {
      return this.metricValue <= this.targetValue;
    }
    
    // For metrics like yield, satisfaction, higher is better
    return this.metricValue >= this.targetValue;
  }

  calculateTrend(): string {
    if (!this.previousValue) return 'neutral';
    
    const change = this.metricValue - this.previousValue;
    const percentChange = Math.abs(change / this.previousValue) * 100;
    
    if (percentChange < 1) return 'stable';
    
    // For metrics where higher is better
    if (!this.metricType.includes('rate') && !this.metricType.includes('cost')) {
      return change > 0 ? 'improving' : 'declining';
    }
    
    // For metrics where lower is better
    return change < 0 ? 'improving' : 'declining';
  }
}
