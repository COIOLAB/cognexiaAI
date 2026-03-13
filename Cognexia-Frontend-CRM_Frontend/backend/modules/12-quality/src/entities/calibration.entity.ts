import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CalibrationType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  SELF_CALIBRATION = 'self_calibration',
  CROSS_CALIBRATION = 'cross_calibration',
}

export enum CalibrationStatus {
  DUE = 'due',
  OVERDUE = 'overdue',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
}

export enum CalibrationResult {
  PASS = 'pass',
  FAIL = 'fail',
  LIMITED = 'limited',
  CONDITIONAL = 'conditional',
}

export enum EquipmentStatus {
  IN_SERVICE = 'in_service',
  OUT_OF_SERVICE = 'out_of_service',
  LIMITED_USE = 'limited_use',
  QUARANTINED = 'quarantined',
}

@Entity('calibrations')
@Index(['equipmentId', 'dueDate'])
@Index(['status', 'dueDate'])
@Index(['calibrationType', 'nextDueDate'])
@Index(['isActive', 'overdue'])
export class Calibration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  calibrationNumber: string;

  @Column()
  equipmentId: string;

  @Column()
  equipmentName: string;

  @Column({ nullable: true })
  equipmentModel: string;

  @Column({ nullable: true })
  equipmentSerialNumber: string;

  @Column({ nullable: true })
  equipmentLocation: string;

  @Column({ nullable: true })
  workCenterId: string;

  @Column({ nullable: true })
  workCenterName: string;

  @Column({
    type: 'enum',
    enum: CalibrationType,
  })
  calibrationType: CalibrationType;

  @Column({
    type: 'enum',
    enum: CalibrationStatus,
    default: CalibrationStatus.SCHEDULED,
  })
  status: CalibrationStatus;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'date' })
  nextDueDate: Date;

  @Column('int', { default: 365 })
  calibrationIntervalDays: number;

  @Column({ nullable: true })
  calibrationFrequency: string;

  @Column({ nullable: true })
  assignedTechnician: string;

  @Column({ nullable: true })
  technicianName: string;

  @Column({ nullable: true })
  technicianCertification: string;

  @Column({ nullable: true })
  calibrationLab: string;

  @Column({ nullable: true })
  externalVendor: string;

  @Column({ nullable: true })
  vendorCertificateNumber: string;

  @Column({
    type: 'enum',
    enum: CalibrationResult,
    nullable: true,
  })
  result: CalibrationResult;

  @Column({ default: false })
  overdue: boolean;

  @Column('int', { nullable: true })
  daysPastDue: number;

  @Column('json', { nullable: true })
  calibrationProcedure: {
    procedureId: string;
    procedureName: string;
    version: string;
    steps: Array<{
      stepNumber: number;
      description: string;
      expectedResult: string;
      actualResult?: string;
      pass?: boolean;
    }>;
  };

  @Column('json', { nullable: true })
  standardsUsed: Array<{
    standardId: string;
    description: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    certificateNumber: string;
    accuracy: string;
    traceability: string;
    lastCalibrationDate: Date;
    nextDueDate: Date;
  }>;

  @Column('json', { nullable: true })
  measurements: Array<{
    parameter: string;
    nominalValue: number;
    actualValue: number;
    tolerance: number;
    upperLimit: number;
    lowerLimit: number;
    unit: string;
    deviation: number;
    withinTolerance: boolean;
    uncertainty: number;
  }>;

  @Column('json', { nullable: true })
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
    vibration: string;
    cleanliness: string;
    otherFactors: Record<string, any>;
  };

  @Column('json', { nullable: true })
  calibrationData: {
    beforeCalibration: Record<string, any>;
    afterCalibration: Record<string, any>;
    adjustmentsMade: string[];
    replacedParts: Array<{
      part: string;
      oldValue: string;
      newValue: string;
      reason: string;
    }>;
  };

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  measurementUncertainty: number;

  @Column('decimal', { precision: 8, scale: 6, nullable: true })
  expandedUncertainty: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  confidenceLevel: number;

  @Column('int', { nullable: true })
  coverageFactor: number;

  @Column('json', { nullable: true })
  traceabilityChain: Array<{
    level: number;
    organization: string;
    standard: string;
    certificateNumber: string;
    accuracy: string;
    uncertainty: string;
  }>;

  @Column('text', { nullable: true })
  calibrationNotes: string;

  @Column('text', { nullable: true })
  findings: string;

  @Column('text', { nullable: true })
  recommendations: string;

  @Column('json', { nullable: true })
  nonConformities: Array<{
    description: string;
    severity: string;
    correctionTaken: string;
    preventiveAction: string;
    verificationRequired: boolean;
  }>;

  @Column('json', { nullable: true })
  correctiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    completedAt?: Date;
    verification?: string;
  }>;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.IN_SERVICE,
  })
  equipmentStatusAfterCalibration: EquipmentStatus;

  @Column('text', { nullable: true })
  equipmentStatusReason: string;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ nullable: true })
  certificateUrl: string;

  @Column({ type: 'date', nullable: true })
  certificateIssuedDate: Date;

  @Column({ type: 'date', nullable: true })
  certificateExpiryDate: Date;

  @Column({ nullable: true })
  issuingAuthority: string;

  @Column({ default: false })
  customerNotificationRequired: boolean;

  @Column({ default: false })
  customerNotified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  customerNotifiedAt: Date;

  @Column('simple-array', { nullable: true })
  affectedProducts: string[];

  @Column('simple-array', { nullable: true })
  affectedBatches: string[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  calibrationCost: number;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column('int', { nullable: true })
  calibrationDurationHours: number;

  @Column('int', { nullable: true })
  downtimeHours: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  downtimeCost: number;

  @Column('json', { nullable: true })
  qualityImpact: {
    impactAssessment: string;
    affectedMeasurements: string[];
    dataValidity: {
      from: Date;
      to: Date;
      reliable: boolean;
    };
    retestRequired: boolean;
    batchInvestigation: boolean;
  };

  @Column('json', { nullable: true })
  complianceRequirements: {
    standards: string[];
    regulations: string[];
    certifications: string[];
    auditRequirements: string[];
  };

  @Column('json', { nullable: true })
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    impactOnQuality: string;
    impactOnSafety: string;
    impactOnCompliance: string;
    mitigationActions: string[];
  };

  @Column({ default: false })
  criticalEquipment: boolean;

  @Column('json', { nullable: true })
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    technician: string;
    impact: string;
  }>;

  @Column('json', { nullable: true })
  calibrationHistory: Array<{
    date: Date;
    result: string;
    technician: string;
    nextDueDate: Date;
    certificateNumber: string;
  }>;

  @Column('json', { nullable: true })
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
    description?: string;
    uploadedAt: Date;
  }>;

  @Column('json', { nullable: true })
  automatedReminders: {
    enabled: boolean;
    reminderDays: number[];
    lastReminderSent: Date;
    recipientEmails: string[];
    escalationLevel: number;
  };

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  customAttributes: Record<string, any>;

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;
}
