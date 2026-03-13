import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum CalibrationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum CalibrationType {
  POSITION = 'POSITION',
  ORIENTATION = 'ORIENTATION',
  JOINT = 'JOINT',
  TOOL = 'TOOL',
  VISION = 'VISION',
  FORCE = 'FORCE',
  FULL = 'FULL',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  FAILED = 'FAILED',
  REVERTED = 'REVERTED',
}

@Entity('robot_calibrations')
export class RobotCalibration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  robotId: string;

  @Column({
    type: 'enum',
    enum: CalibrationType,
  })
  type: CalibrationType;

  @Column({
    type: 'enum',
    enum: CalibrationStatus,
    default: CalibrationStatus.PENDING,
  })
  status: CalibrationStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column('json')
  parameters: {
    positions: any[];
    measurements: any[];
    tolerances: any;
    constraints: any;
    referencePoints: any[];
    toolConfiguration: any;
  };

  @Column('json', { nullable: true })
  results: {
    measurements: any[];
    corrections: any[];
    accuracy: number;
    precision: number;
    residuals: any[];
  };

  @Column('json', { nullable: true })
  metrics: {
    duration: number;
    iterations: number;
    convergence: number;
    accuracy: number;
    precision: number;
    reliability: number;
  };

  @Column('json', { default: [] })
  qualityChecks: Array<{
    checkPoint: string;
    expected: any;
    measured: any;
    deviation: number;
    passed: boolean;
    timestamp: Date;
  }>;

  @Column('json', { default: [] })
  executionHistory: Array<{
    timestamp: Date;
    status: string;
    progress?: number;
    message: string;
    details?: any;
  }>;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column('json', { nullable: true })
  verificationResults: {
    passed: boolean;
    timestamp: Date;
    checks: Array<{
      name: string;
      passed: boolean;
      details?: any;
    }>;
    metrics: {
      accuracy: number;
      precision: number;
      reliability: number;
    };
  };

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  applicationStatus: ApplicationStatus;

  @Column('json', { nullable: true })
  applicationResults: {
    success: boolean;
    timestamp: Date;
    backupCreated: boolean;
    appliedParameters: any;
    robotResponse: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  scheduledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  appliedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;
}
