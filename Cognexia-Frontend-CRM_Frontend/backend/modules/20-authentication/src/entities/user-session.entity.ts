import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsDate, IsUUID, IsIP } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPICIOUS = 'suspicious',
}

export enum SessionType {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  DESKTOP = 'desktop',
  IOT = 'iot',
}

@Entity('user_sessions')
@Index(['userId'])
@Index(['sessionToken'], { unique: true })
@Index(['refreshToken'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
@Index(['lastActivityAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  @IsString()
  sessionToken: string;

  @Column({ type: 'varchar', length: 500, unique: true, nullable: true })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.WEB })
  sessionType: SessionType;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsIP()
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
  device?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  browser?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  os?: string;

  // Industry 5.0 Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumSecured: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBiometricVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isZeroTrustValidated: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAIMonitored: boolean;

  @Column({ type: 'jsonb', nullable: true })
  securityContext?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceFingerprint?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  behaviorProfile?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  riskAssessment?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  quantumSessionId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainTxHash?: string;

  // Session Management
  @Column({ type: 'timestamp' })
  @IsDate()
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastActivityAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  terminatedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @Column({ type: 'int', default: 0 })
  activityCount: number;

  @Column({ type: 'int', default: 0 })
  suspiciousActivityCount: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  rememberMe: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPersistent: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isActive(): boolean {
    return this.status === SessionStatus.ACTIVE && !this.isExpired;
  }

  get duration(): number {
    const endTime = this.terminatedAt || new Date();
    return endTime.getTime() - this.createdAt.getTime();
  }

  get hasAdvancedSecurity(): boolean {
    return this.isQuantumSecured || this.isBlockchainVerified || this.isBiometricVerified;
  }

  get securityScore(): number {
    let score = 0;
    if (this.isBiometricVerified) score += 20;
    if (this.isBlockchainVerified) score += 30;
    if (this.isQuantumSecured) score += 40;
    if (this.isZeroTrustValidated) score += 10;
    return Math.min(score, 100);
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.sessionToken) {
      this.sessionToken = this.generateSessionToken();
    }
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
    this.lastActivityAt = new Date();
  }

  private generateSessionToken(): string {
    return `sess_${uuidv4()}_${Date.now()}`;
  }

  updateActivity(): void {
    this.lastActivityAt = new Date();
    this.activityCount += 1;
  }

  updateSuspiciousActivity(): void {
    this.suspiciousActivityCount += 1;
    if (this.suspiciousActivityCount >= 5) {
      this.status = SessionStatus.SUSPICIOUS;
    }
  }

  extend(additionalMinutes: number = 60): void {
    this.expiresAt = new Date(this.expiresAt.getTime() + additionalMinutes * 60 * 1000);
  }

  terminate(reason?: string): void {
    this.status = SessionStatus.TERMINATED;
    this.terminatedAt = new Date();
    this.terminationReason = reason;
  }

  expire(): void {
    this.status = SessionStatus.EXPIRED;
  }

  markAsSuspicious(reason?: string): void {
    this.status = SessionStatus.SUSPICIOUS;
    this.terminationReason = reason;
  }

  enableQuantumSecurity(quantumSessionId: string): void {
    this.isQuantumSecured = true;
    this.quantumSessionId = quantumSessionId;
  }

  enableBlockchainVerification(txHash: string): void {
    this.isBlockchainVerified = true;
    this.blockchainTxHash = txHash;
  }

  enableBiometricVerification(): void {
    this.isBiometricVerified = true;
  }

  enableZeroTrustValidation(): void {
    this.isZeroTrustValidated = true;
  }

  enableAIMonitoring(): void {
    this.isAIMonitored = true;
  }

  updateSecurityContext(context: Record<string, any>): void {
    this.securityContext = {
      ...this.securityContext,
      ...context,
      lastUpdated: new Date(),
    };
  }

  updateDeviceFingerprint(fingerprint: Record<string, any>): void {
    this.deviceFingerprint = fingerprint;
  }

  updateBehaviorProfile(behavior: Record<string, any>): void {
    this.behaviorProfile = {
      ...this.behaviorProfile,
      ...behavior,
      lastUpdated: new Date(),
    };
  }

  updateRiskAssessment(assessment: Record<string, any>): void {
    this.riskAssessment = {
      ...assessment,
      lastAssessed: new Date(),
    };
  }

  isFromTrustedDevice(): boolean {
    return this.deviceFingerprint?.isTrusted === true;
  }

  isFromKnownLocation(): boolean {
    return this.metadata?.knownLocation === true;
  }

  hasNormalBehavior(): boolean {
    return this.riskAssessment?.behaviorScore >= 80;
  }

  refreshToken(): string {
    this.refreshToken = `refresh_${uuidv4()}_${Date.now()}`;
    return this.refreshToken;
  }

  revokeRefreshToken(): void {
    this.refreshToken = null;
  }

  toJSON() {
    const { sessionToken, refreshToken, ...result } = this;
    return {
      ...result,
      hasSessionToken: !!sessionToken,
      hasRefreshToken: !!refreshToken,
    };
  }
}
