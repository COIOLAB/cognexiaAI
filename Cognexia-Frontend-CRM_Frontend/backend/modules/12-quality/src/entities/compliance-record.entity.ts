import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ComplianceType {
  REGULATORY = 'regulatory',
  STANDARD = 'standard',
  CERTIFICATION = 'certification',
  CUSTOMER_REQUIREMENT = 'customer_requirement',
  INTERNAL_POLICY = 'internal_policy',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review',
  PENDING_VERIFICATION = 'pending_verification',
  EXPIRED = 'expired',
  NOT_APPLICABLE = 'not_applicable',
}

export enum AuditType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  CUSTOMER = 'customer',
  REGULATORY = 'regulatory',
  CERTIFICATION = 'certification',
  SURVEILLANCE = 'surveillance',
}

export enum AuditResult {
  SATISFACTORY = 'satisfactory',
  MINOR_NON_CONFORMITY = 'minor_non_conformity',
  MAJOR_NON_CONFORMITY = 'major_non_conformity',
  CRITICAL_NON_CONFORMITY = 'critical_non_conformity',
  OBSERVATION = 'observation',
  OPPORTUNITY_FOR_IMPROVEMENT = 'opportunity_for_improvement',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('compliance_records')
@Index(['complianceType', 'status', 'effectiveDate'])
@Index(['standardCode', 'version'])
@Index(['auditDate', 'auditType'])
@Index(['renewalDate', 'isActive'])
export class ComplianceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  recordNumber: string;

  @Column({
    type: 'enum',
    enum: ComplianceType,
  })
  complianceType: ComplianceType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  standardCode: string;

  @Column()
  standardName: string;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  clause: string;

  @Column({
    type: 'enum',
    enum: ComplianceStatus,
  })
  status: ComplianceStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ nullable: true })
  issuingAuthority: string;

  @Column({ nullable: true })
  regulatoryBody: string;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  accreditationBody: string;

  @Column('json', { nullable: true })
  applicableAreas: {
    locations: string[];
    departments: string[];
    processes: string[];
    products: string[];
    services: string[];
  };

  @Column('json', { nullable: true })
  requirements: Array<{
    requirementId: string;
    description: string;
    category: string;
    mandatory: boolean;
    status: string;
    evidenceRequired: boolean;
    lastVerified: Date;
    verifiedBy: string;
  }>;

  @Column({
    type: 'enum',
    enum: AuditType,
    nullable: true,
  })
  auditType: AuditType;

  @Column({ type: 'date', nullable: true })
  auditDate: Date;

  @Column({ nullable: true })
  auditorName: string;

  @Column({ nullable: true })
  auditorOrganization: string;

  @Column({ nullable: true })
  auditScope: string;

  @Column({
    type: 'enum',
    enum: AuditResult,
    nullable: true,
  })
  auditResult: AuditResult;

  @Column('int', { nullable: true, default: 100 })
  complianceScore: number;

  @Column('json', { nullable: true })
  auditFindings: Array<{
    findingId: string;
    type: string;
    severity: string;
    description: string;
    requirement: string;
    evidence: string;
    recommendation: string;
    dueDate: Date;
    responsiblePerson: string;
    status: string;
    closureDate?: Date;
    verificationRequired: boolean;
  }>;

  @Column('json', { nullable: true })
  nonConformities: Array<{
    ncId: string;
    type: string;
    severity: string;
    description: string;
    rootCause: string;
    immediateAction: string;
    correctiveAction: string;
    preventiveAction: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    verificationDate?: Date;
    effectiveness?: string;
  }>;

  @Column('json', { nullable: true })
  correctiveActions: Array<{
    actionId: string;
    description: string;
    rootCause: string;
    assignedTo: string;
    targetDate: Date;
    actualDate?: Date;
    status: string;
    effectiveness: string;
    verifiedBy: string;
    verificationDate?: Date;
  }>;

  @Column('json', { nullable: true })
  preventiveActions: Array<{
    actionId: string;
    description: string;
    riskIdentified: string;
    assignedTo: string;
    targetDate: Date;
    actualDate?: Date;
    status: string;
    effectiveness: string;
  }>;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    nullable: true,
  })
  riskLevel: RiskLevel;

  @Column('json', { nullable: true })
  riskAssessment: {
    riskDescription: string;
    likelihood: number;
    impact: number;
    riskScore: number;
    mitigationMeasures: string[];
    residualRisk: number;
    reviewDate: Date;
  };

  @Column('json', { nullable: true })
  evidenceDocuments: Array<{
    documentId: string;
    title: string;
    type: string;
    url: string;
    uploadDate: Date;
    expiryDate?: Date;
    verified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
  }>;

  @Column('json', { nullable: true })
  training: {
    required: boolean;
    trainingPrograms: Array<{
      programId: string;
      programName: string;
      required: boolean;
      completionRequired: boolean;
      renewalPeriod: number;
    }>;
    competencyRequirements: string[];
    certificationRequired: boolean;
  };

  @Column('json', { nullable: true })
  monitoringPlan: {
    frequency: string;
    methods: string[];
    kpis: Array<{
      kpiName: string;
      target: number;
      measurement: string;
      frequency: string;
    }>;
    reviewSchedule: Array<{
      reviewType: string;
      frequency: string;
      nextDate: Date;
    }>;
  };

  @Column('json', { nullable: true })
  stakeholders: Array<{
    name: string;
    role: string;
    organization: string;
    responsibilities: string[];
    contactInfo: {
      email: string;
      phone: string;
    };
  }>;

  @Column('text', { nullable: true })
  complianceNotes: string;

  @Column('text', { nullable: true })
  auditNotes: string;

  @Column('text', { nullable: true })
  managementReview: string;

  @Column({ type: 'timestamp', nullable: true })
  managementReviewDate: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  complianceCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  nonCompliancePenalty: number;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column('json', { nullable: true })
  businessImpact: {
    operationalImpact: string;
    financialImpact: string;
    reputationalImpact: string;
    customerImpact: string;
    marketAccess: string;
  };

  @Column('json', { nullable: true })
  improvementOpportunities: Array<{
    opportunity: string;
    description: string;
    benefitExpected: string;
    resourcesRequired: string;
    timeframe: string;
    priority: string;
    assignedTo: string;
    status: string;
  }>;

  @Column('json', { nullable: true })
  benchmarking: {
    industryBenchmarks: Record<string, any>;
    bestPractices: string[];
    competitorComparison: Record<string, any>;
    improvementGaps: string[];
  };

  @Column('json', { nullable: true })
  communicationPlan: {
    internalCommunication: Array<{
      audience: string;
      method: string;
      frequency: string;
      responsible: string;
    }>;
    externalCommunication: Array<{
      stakeholder: string;
      method: string;
      frequency: string;
      responsible: string;
    }>;
  };

  @Column('simple-array', { nullable: true })
  relatedRecords: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  customAttributes: Record<string, any>;

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column('json', { nullable: true })
  pharmaSpecific?: {
    gmpGrade: string;
    fda21CFRPart: string;
    ichGuideline: string;
    pharmacovigilance: boolean;
    clinicalTrialCompliance: boolean;
    gdpCompliance: boolean;
  };

  @Column('json', { nullable: true })
  autoSpecific?: {
    aiagStandard: string;
    iso26262Level: string;
    functionalSafety: boolean;
    cybersecurity: boolean;
  };

  @Column('json', { nullable: true })
  aeroSpaceSpecific?: {
    as9100Grade: string;
    nadcapAccreditation: string;
    airworthiness: boolean;
    traceabilityLevel: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
