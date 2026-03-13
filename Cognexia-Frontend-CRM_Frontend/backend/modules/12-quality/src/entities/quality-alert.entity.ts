import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum AlertType {
  QUALITY_THRESHOLD = 'quality_threshold',
  DEFECT_RATE_HIGH = 'defect_rate_high',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  CALIBRATION_DUE = 'calibration_due',
  CALIBRATION_OVERDUE = 'calibration_overdue',
  INSPECTION_FAILED = 'inspection_failed',
  SPC_OUT_OF_CONTROL = 'spc_out_of_control',
  PROCESS_CAPABILITY_LOW = 'process_capability_low',
  TEMPERATURE_EXCURSION = 'temperature_excursion',
  ENVIRONMENTAL_LIMIT = 'environmental_limit',
  AUDIT_FINDING = 'audit_finding',
  CORRECTIVE_ACTION_OVERDUE = 'corrective_action_overdue',
  CERTIFICATE_EXPIRING = 'certificate_expiring',
  BATCH_HOLD = 'batch_hold',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
  DISMISSED = 'dismissed',
}

export enum AlertPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

@Entity('quality_alerts')
@Index(['severity', 'status'])
@Index(['type', 'createdAt'])
@Index(['workCenterId', 'isActive'])
@Index(['assignedTo', 'status'])
export class QualityAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  alertNumber: string;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertPriority,
    default: AlertPriority.NORMAL,
  })
  priority: AlertPriority;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  detailedDescription: string;

  @Column({ nullable: true })
  workCenterId: string;

  @Column({ nullable: true })
  workCenterName: string;

  @Column({ nullable: true })
  productCode: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ nullable: true })
  inspectionId: string;

  @Column({ nullable: true })
  defectId: string;

  @Column('json', { nullable: true })
  triggerConditions: {
    parameter?: string;
    threshold?: number;
    actualValue?: number;
    operator?: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
    duration?: number;
    sampleSize?: number;
  };

  @Column('json', { nullable: true })
  affectedProducts: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    batchNumbers?: string[];
  }>;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  assignedToName: string;

  @Column({ nullable: true })
  assignedToRole: string;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column('simple-array', { nullable: true })
  notificationRecipients: string[];

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ nullable: true })
  acknowledgedByName: string;

  @Column('text', { nullable: true })
  acknowledgmentNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedByName: string;

  @Column('text', { nullable: true })
  resolutionNotes: string;

  @Column('json', { nullable: true })
  immediateActions: Array<{
    action: string;
    takenBy: string;
    takenAt: Date;
    result: string;
  }>;

  @Column('json', { nullable: true })
  correctiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    completedAt?: Date;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @Column({ nullable: true })
  escalatedTo: string;

  @Column({ nullable: true })
  escalatedToName: string;

  @Column({ nullable: true })
  escalatedToRole: string;

  @Column('text', { nullable: true })
  escalationReason: string;

  @Column('json', { nullable: true })
  escalationHistory: Array<{
    escalatedAt: Date;
    escalatedFrom: string;
    escalatedTo: string;
    reason: string;
    level: number;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  targetResolutionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualResolutionDate: Date;

  @Column('int', { nullable: true })
  resolutionTimeMinutes: number;

  @Column({ default: false })
  customerNotificationRequired: boolean;

  @Column({ default: false })
  customerNotified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  customerNotifiedAt: Date;

  @Column({ nullable: true })
  customerNotificationMethod: string;

  @Column({ default: false })
  regulatoryReportingRequired: boolean;

  @Column({ default: false })
  regulatoryReported: boolean;

  @Column({ type: 'timestamp', nullable: true })
  regulatoryReportedAt: Date;

  @Column('simple-array', { nullable: true })
  regulatoryBodies: string[];

  @Column({ default: false })
  productionImpact: boolean;

  @Column('text', { nullable: true })
  productionImpactDescription: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCostImpact: number;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column('json', { nullable: true })
  businessImpact: {
    production: boolean;
    delivery: boolean;
    customer: boolean;
    compliance: boolean;
    safety: boolean;
    reputation: boolean;
  };

  @Column('json', { nullable: true })
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    likelihood: number;
    impact: number;
    riskScore: number;
    mitigationActions: string[];
  };

  @Column({ default: false })
  recurrence: boolean;

  @Column('simple-array', { nullable: true })
  relatedAlertIds: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastOccurrence: Date;

  @Column('int', { default: 1 })
  occurrenceCount: number;

  @Column('json', { nullable: true })
  automatedResponse: {
    enabled: boolean;
    actions: string[];
    executedAt?: Date;
    successful?: boolean;
    errorMessage?: string;
  };

  @Column('json', { nullable: true })
  spcData: {
    controlChart: string;
    violation: string;
    points: number[];
    limits: { ucl: number; lcl: number; centerline: number };
  };

  @Column('json', { nullable: true })
  complianceDetails: {
    standard: string;
    requirement: string;
    deviation: string;
    impact: string;
  };

  @Column('json', { nullable: true })
  environmentalData: {
    parameter: string;
    reading: number;
    limit: number;
    location: string;
    sensor: string;
  };

  @Column('json', { nullable: true })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
    description?: string;
    uploadedAt: Date;
  }>;

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column('json', { nullable: true })
  pharmaSpecific?: {
    deviationNumber: string;
    gmpImpact: string;
    investigationRequired: boolean;
    capaRequired: boolean;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  notificationLog: Array<{
    sentAt: Date;
    sentTo: string;
    method: string;
    successful: boolean;
    errorMessage?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
