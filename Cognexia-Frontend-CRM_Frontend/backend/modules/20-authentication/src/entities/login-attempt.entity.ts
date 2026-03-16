import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsDate, IsUUID, IsIP, IsEnum, IsNumber } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum AttemptStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SUSPICIOUS = 'suspicious',
  RATE_LIMITED = 'rate_limited',
}

export enum AttemptMethod {
  PASSWORD = 'password',
  TWO_FACTOR = 'two_factor',
  BIOMETRIC = 'biometric',
  BLOCKCHAIN = 'blockchain',
  QUANTUM = 'quantum',
  SSO = 'sso',
  API_KEY = 'api_key',
}

export enum FailureReason {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_DISABLED = 'account_disabled',
  TWO_FACTOR_FAILED = 'two_factor_failed',
  BIOMETRIC_FAILED = 'biometric_failed',
  BLOCKCHAIN_FAILED = 'blockchain_failed',
  QUANTUM_FAILED = 'quantum_failed',
  RATE_LIMITED = 'rate_limited',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  GEOLOCATION_BLOCKED = 'geolocation_blocked',
  DEVICE_NOT_TRUSTED = 'device_not_trusted',
  TIME_RESTRICTED = 'time_restricted',
  NETWORK_RESTRICTED = 'network_restricted',
}

@Entity('login_attempts')
@Index(['userId'])
@Index(['email'])
@Index(['ipAddress'])
@Index(['status'])
@Index(['attemptMethod'])
@Index(['createdAt'])
@Index(['isSuccessful'])
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Column({ type: 'enum', enum: AttemptStatus })
  @IsEnum(AttemptStatus)
  @Index()
  status: AttemptStatus;

  @Column({ type: 'enum', enum: AttemptMethod, default: AttemptMethod.PASSWORD })
  @IsEnum(AttemptMethod)
  @Index()
  attemptMethod: AttemptMethod;

  @Column({ type: 'enum', enum: FailureReason, nullable: true })
  @IsOptional()
  @IsEnum(FailureReason)
  failureReason?: FailureReason;

  @Column({ type: 'boolean' })
  @IsBoolean()
  @Index()
  isSuccessful: boolean;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsIP()
  @Index()
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  device?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  browser?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  os?: string;

  // Industry 5.0 Security Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBiometricVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAIValidated: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isThreatDetected: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAnomalous: boolean;

  @Column({ type: 'number', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  riskScore: number; // 0-100

  @Column({ type: 'number', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  confidenceScore: number; // 0-100

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  threatType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  anomalyType?: string;

  @Column({ type: 'jsonb', nullable: true })
  securityContext?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceFingerprint?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  behaviorAnalysis?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  networkAnalysis?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  geolocationData?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  quantumSignature?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainProof?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  biometricHash?: string;

  // Timing and Performance
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  attemptDuration: number; // milliseconds

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  networkLatency: number; // milliseconds

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  processingTime: number; // milliseconds

  @Column({ type: 'int', default: 1 })
  @IsNumber()
  attemptSequence: number; // nth attempt in sequence

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  daySequence: number; // nth attempt today

  // Rate Limiting and Security
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isRateLimited: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isCaptchaRequired: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isCaptchaSolved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  captchaToken?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  requestId?: string;

  // Additional Context
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  referrer?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.loginAttempts, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Computed Properties
  get isSuccessAndSecure(): boolean {
    return this.isSuccessful && (this.isBiometricVerified || this.isBlockchainVerified || this.isQuantumVerified);
  }

  get isHighRisk(): boolean {
    return this.riskScore >= 80 || this.isThreatDetected;
  }

  get isSuspicious(): boolean {
    return this.status === AttemptStatus.SUSPICIOUS || this.isAnomalous || this.isThreatDetected;
  }

  get hasAdvancedAuth(): boolean {
    return this.isBiometricVerified || this.isBlockchainVerified || this.isQuantumVerified;
  }

  get securityScore(): number {
    let score = 100 - this.riskScore;
    if (this.isBiometricVerified) score += 10;
    if (this.isBlockchainVerified) score += 15;
    if (this.isQuantumVerified) score += 20;
    if (this.isAIValidated) score += 5;
    return Math.max(0, Math.min(100, score));
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    this.isSuccessful = this.status === AttemptStatus.SUCCESS;
  }

  markAsSuccessful(): void {
    this.status = AttemptStatus.SUCCESS;
    this.isSuccessful = true;
    this.failureReason = null;
  }

  markAsFailed(reason: FailureReason): void {
    this.status = AttemptStatus.FAILED;
    this.isSuccessful = false;
    this.failureReason = reason;
  }

  markAsBlocked(reason: FailureReason): void {
    this.status = AttemptStatus.BLOCKED;
    this.isSuccessful = false;
    this.failureReason = reason;
  }

  markAsSuspicious(reason?: string): void {
    this.status = AttemptStatus.SUSPICIOUS;
    this.isSuccessful = false;
    this.isAnomalous = true;
    if (reason) {
      this.notes = reason;
    }
  }

  markAsRateLimited(): void {
    this.status = AttemptStatus.RATE_LIMITED;
    this.isSuccessful = false;
    this.isRateLimited = true;
    this.failureReason = FailureReason.RATE_LIMITED;
  }

  setQuantumVerification(signature: string): void {
    this.isQuantumVerified = true;
    this.quantumSignature = signature;
  }

  setBlockchainVerification(proof: string): void {
    this.isBlockchainVerified = true;
    this.blockchainProof = proof;
  }

  setBiometricVerification(hash: string): void {
    this.isBiometricVerified = true;
    this.biometricHash = hash;
  }

  setAIValidation(isValid: boolean, analysis?: Record<string, any>): void {
    this.isAIValidated = isValid;
    if (analysis) {
      this.behaviorAnalysis = analysis;
    }
  }

  detectThreat(threatType: string, score: number): void {
    this.isThreatDetected = true;
    this.threatType = threatType;
    this.riskScore = Math.max(this.riskScore, score);
  }

  detectAnomaly(anomalyType: string, score: number): void {
    this.isAnomalous = true;
    this.anomalyType = anomalyType;
    this.riskScore = Math.max(this.riskScore, score);
  }

  updateSecurityContext(context: Record<string, any>): void {
    this.securityContext = {
      ...this.securityContext,
      ...context,
    };
  }

  updateDeviceFingerprint(fingerprint: Record<string, any>): void {
    this.deviceFingerprint = fingerprint;
  }

  updateNetworkAnalysis(analysis: Record<string, any>): void {
    this.networkAnalysis = analysis;
  }

  updateGeolocation(data: Record<string, any>): void {
    this.geolocationData = data;
    this.country = data.country;
    this.city = data.city;
    this.location = `${data.city}, ${data.country}`;
  }

  setTiming(duration: number, latency?: number, processing?: number): void {
    this.attemptDuration = duration;
    if (latency !== undefined) this.networkLatency = latency;
    if (processing !== undefined) this.processingTime = processing;
  }

  setSequence(attemptNumber: number, dayNumber: number): void {
    this.attemptSequence = attemptNumber;
    this.daySequence = dayNumber;
  }

  requireCaptcha(token?: string): void {
    this.isCaptchaRequired = true;
    if (token) {
      this.captchaToken = token;
      this.isCaptchaSolved = true;
    }
  }

  addNote(note: string): void {
    if (this.notes) {
      this.notes += `\n${note}`;
    } else {
      this.notes = note;
    }
  }

  updateRiskScore(score: number): void {
    this.riskScore = Math.max(0, Math.min(100, score));
  }

  updateConfidenceScore(score: number): void {
    this.confidenceScore = Math.max(0, Math.min(100, score));
  }

  isFromSameNetwork(otherAttempt: LoginAttempt): boolean {
    if (!this.ipAddress || !otherAttempt.ipAddress) return false;
    
    // Simple subnet check (same /24 network)
    const thisNetwork = this.ipAddress.substring(0, this.ipAddress.lastIndexOf('.'));
    const otherNetwork = otherAttempt.ipAddress.substring(0, otherAttempt.ipAddress.lastIndexOf('.'));
    
    return thisNetwork === otherNetwork;
  }

  isFromSameDevice(otherAttempt: LoginAttempt): boolean {
    if (!this.deviceFingerprint || !otherAttempt.deviceFingerprint) return false;
    
    return JSON.stringify(this.deviceFingerprint) === JSON.stringify(otherAttempt.deviceFingerprint);
  }

  isSimilarTiming(otherAttempt: LoginAttempt, thresholdMs: number = 1000): boolean {
    return Math.abs(this.attemptDuration - otherAttempt.attemptDuration) <= thresholdMs;
  }

  toJSON() {
    const { biometricHash, quantumSignature, blockchainProof, ...result } = this;
    return {
      ...result,
      hasBiometricHash: !!biometricHash,
      hasQuantumSignature: !!quantumSignature,
      hasBlockchainProof: !!blockchainProof,
    };
  }
}
