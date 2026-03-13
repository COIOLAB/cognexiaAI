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
import { IsString, IsBoolean, IsOptional, IsDate, IsUUID, IsIP, IsEnum } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { User } from './user.entity';

export enum ResetStatus {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  BLOCKED = 'blocked',
}

export enum ResetMethod {
  EMAIL = 'email',
  SMS = 'sms',
  BIOMETRIC = 'biometric',
  QUANTUM = 'quantum',
  BLOCKCHAIN = 'blockchain',
  ADMIN_OVERRIDE = 'admin_override',
}

export enum ResetTrigger {
  USER_REQUEST = 'user_request',
  ADMIN_RESET = 'admin_reset',
  SECURITY_INCIDENT = 'security_incident',
  POLICY_ENFORCEMENT = 'policy_enforcement',
  ACCOUNT_RECOVERY = 'account_recovery',
  COMPLIANCE_REQUIREMENT = 'compliance_requirement',
}

@Entity('password_resets')
@Index(['userId'])
@Index(['token'], { unique: true })
@Index(['email'])
@Index(['status'])
@Index(['resetMethod'])
@Index(['createdAt'])
@Index(['expiresAt'])
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsString()
  @Index()
  token: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  hashedToken?: string;

  @Column({ type: 'enum', enum: ResetStatus, default: ResetStatus.PENDING })
  @IsEnum(ResetStatus)
  @Index()
  status: ResetStatus;

  @Column({ type: 'enum', enum: ResetMethod, default: ResetMethod.EMAIL })
  @IsEnum(ResetMethod)
  @Index()
  resetMethod: ResetMethod;

  @Column({ type: 'enum', enum: ResetTrigger, default: ResetTrigger.USER_REQUEST })
  @IsEnum(ResetTrigger)
  resetTrigger: ResetTrigger;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsIP()
  requestIpAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  requestUserAgent?: string;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsIP()
  usedIpAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  usedUserAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  requestLocation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  usedLocation?: string;

  // Industry 5.0 Security Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumSecured: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresBiometricConfirmation: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  biometricConfirmed: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAIValidated: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isZeroTrustVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  quantumProof?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainTxHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  biometricHash?: string;

  @Column({ type: 'jsonb', nullable: true })
  securityContext?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceFingerprint?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  riskAssessment?: Record<string, any>;

  // Reset Configuration
  @Column({ type: 'timestamp' })
  @IsDate()
  @Index()
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'int', default: 3 })
  maxAttempts: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresAdminApproval: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  adminApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  approvedAt?: Date;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isHighRisk: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresMultiFactorAuth: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  multiFactorCompleted: boolean;

  // Notification and Communication
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  emailSent: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  smsSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  emailSentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  smsSentAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  @IsString()
  smsCode?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  smsVerified: boolean;

  // Usage Tracking
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  usedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  revokedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  revokedReason?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  revokedBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  // Compliance and Audit
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  auditLogged: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  complianceLevel?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Record<string, any>[];

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.passwordResets)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isValid(): boolean {
    return this.status === ResetStatus.PENDING && !this.isExpired && this.attemptCount < this.maxAttempts;
  }

  get isUsable(): boolean {
    if (!this.isValid) return false;
    if (this.requiresAdminApproval && !this.adminApproved) return false;
    if (this.requiresBiometricConfirmation && !this.biometricConfirmed) return false;
    if (this.requiresMultiFactorAuth && !this.multiFactorCompleted) return false;
    return true;
  }

  get hasAdvancedSecurity(): boolean {
    return this.isQuantumSecured || this.isBlockchainVerified || this.requiresBiometricConfirmation;
  }

  get securityScore(): number {
    let score = 0;
    if (this.isQuantumSecured) score += 40;
    if (this.isBlockchainVerified) score += 30;
    if (this.requiresBiometricConfirmation && this.biometricConfirmed) score += 20;
    if (this.isAIValidated) score += 10;
    if (this.isZeroTrustVerified) score += 10;
    if (this.requiresMultiFactorAuth && this.multiFactorCompleted) score += 15;
    return Math.min(score, 100);
  }

  get remainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attemptCount);
  }

  get timeRemaining(): number {
    const now = new Date();
    return Math.max(0, this.expiresAt.getTime() - now.getTime());
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.token) {
      this.token = this.generateSecureToken();
    }
    if (!this.expiresAt) {
      // Default 24 hours expiration
      this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    this.hashedToken = this.hashToken(this.token);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyToken(token: string): boolean {
    const hashedInput = this.hashToken(token);
    return hashedInput === this.hashedToken;
  }

  incrementAttempt(): void {
    this.attemptCount += 1;
    if (this.attemptCount >= this.maxAttempts) {
      this.status = ResetStatus.BLOCKED;
    }
  }

  use(ipAddress?: string, userAgent?: string, location?: string): void {
    this.status = ResetStatus.USED;
    this.usedAt = new Date();
    this.usedIpAddress = ipAddress;
    this.usedUserAgent = userAgent;
    this.usedLocation = location;
  }

  revoke(reason: string, revokedBy?: string): void {
    this.status = ResetStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedReason = reason;
    this.revokedBy = revokedBy;
  }

  expire(): void {
    this.status = ResetStatus.EXPIRED;
  }

  block(): void {
    this.status = ResetStatus.BLOCKED;
  }

  approveByAdmin(adminId: string): void {
    this.adminApproved = true;
    this.approvedBy = adminId;
    this.approvedAt = new Date();
  }

  enableQuantumSecurity(proof: string): void {
    this.isQuantumSecured = true;
    this.quantumProof = proof;
  }

  enableBlockchainVerification(txHash: string): void {
    this.isBlockchainVerified = true;
    this.blockchainTxHash = txHash;
  }

  enableBiometricConfirmation(): void {
    this.requiresBiometricConfirmation = true;
  }

  confirmBiometric(hash: string): void {
    this.biometricConfirmed = true;
    this.biometricHash = hash;
  }

  enableMultiFactorAuth(): void {
    this.requiresMultiFactorAuth = true;
  }

  completeMultiFactor(): void {
    this.multiFactorCompleted = true;
  }

  validateWithAI(isValid: boolean): void {
    this.isAIValidated = isValid;
  }

  verifyZeroTrust(isVerified: boolean): void {
    this.isZeroTrustVerified = isVerified;
  }

  markAsHighRisk(): void {
    this.isHighRisk = true;
    this.requiresAdminApproval = true;
    this.requiresMultiFactorAuth = true;
  }

  sendEmail(): void {
    this.emailSent = true;
    this.emailSentAt = new Date();
  }

  sendSMS(phoneNumber: string): string {
    this.phoneNumber = phoneNumber;
    this.smsCode = this.generateSMSCode();
    this.smsSent = true;
    this.smsSentAt = new Date();
    return this.smsCode;
  }

  verifySMS(code: string): boolean {
    if (this.smsCode === code) {
      this.smsVerified = true;
      return true;
    }
    return false;
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

  updateRiskAssessment(assessment: Record<string, any>): void {
    this.riskAssessment = {
      ...assessment,
      assessedAt: new Date(),
    };
  }

  addAuditEntry(action: string, details: Record<string, any>): void {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action,
      details,
      timestamp: new Date(),
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
    });
    
    this.auditLogged = true;
  }

  extend(additionalHours: number = 24): void {
    const newExpiration = new Date(this.expiresAt.getTime() + additionalHours * 60 * 60 * 1000);
    this.expiresAt = newExpiration;
  }

  setCustomExpiration(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  addNote(note: string): void {
    if (this.notes) {
      this.notes += `\n${new Date().toISOString()}: ${note}`;
    } else {
      this.notes = `${new Date().toISOString()}: ${note}`;
    }
  }

  isFromSameDevice(ipAddress: string, userAgent: string): boolean {
    return this.requestIpAddress === ipAddress && this.requestUserAgent === userAgent;
  }

  isFromSameLocation(location: string): boolean {
    return this.requestLocation === location;
  }

  hasValidSMSCode(): boolean {
    return this.smsSent && !!this.smsCode && !this.smsVerified;
  }

  isSMSCodeExpired(expirationMinutes: number = 10): boolean {
    if (!this.smsSentAt) return true;
    const expirationTime = new Date(this.smsSentAt.getTime() + expirationMinutes * 60 * 1000);
    return new Date() > expirationTime;
  }

  regenerateToken(): string {
    this.token = this.generateSecureToken();
    this.hashedToken = this.hashToken(this.token);
    this.attemptCount = 0;
    this.status = ResetStatus.PENDING;
    return this.token;
  }

  clone(): Partial<PasswordReset> {
    return {
      userId: this.userId,
      email: this.email,
      resetMethod: this.resetMethod,
      resetTrigger: this.resetTrigger,
      requiresAdminApproval: this.requiresAdminApproval,
      requiresBiometricConfirmation: this.requiresBiometricConfirmation,
      requiresMultiFactorAuth: this.requiresMultiFactorAuth,
      isHighRisk: this.isHighRisk,
      maxAttempts: this.maxAttempts,
      complianceLevel: this.complianceLevel,
    };
  }

  toJSON() {
    const { token, hashedToken, smsCode, biometricHash, quantumProof, ...result } = this;
    return {
      ...result,
      hasToken: !!token,
      hasHashedToken: !!hashedToken,
      hasSMSCode: !!smsCode,
      hasBiometricHash: !!biometricHash,
      hasQuantumProof: !!quantumProof,
    };
  }
}
