import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsNumber } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  RETINA = 'retina',
  VOICE = 'voice',
  PALM = 'palm',
  VEIN = 'vein',
  KEYSTROKE = 'keystroke',
  GAIT = 'gait',
  SIGNATURE = 'signature',
  DNA = 'dna',
  HEARTBEAT = 'heartbeat',
  BRAINWAVE = 'brainwave',
}

export enum BiometricStatus {
  PENDING = 'pending',
  ENROLLED = 'enrolled',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
}

export enum BiometricQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

@Entity('biometric_auth')
@Index(['userId'])
@Index(['biometricType'])
@Index(['status'])
@Index(['deviceId'])
@Index(['createdAt'])
@Index(['isPrimary'])
export class BiometricAuth {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  userId: string;

  @Column({ type: 'enum', enum: BiometricType })
  @IsEnum(BiometricType)
  biometricType: BiometricType;

  @Column({ type: 'enum', enum: BiometricStatus, default: BiometricStatus.PENDING })
  @IsEnum(BiometricStatus)
  status: BiometricStatus;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  templateId: string; // Unique identifier for the biometric template

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  encryptedTemplate?: string; // Encrypted biometric template

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  templateHash?: string; // Hash of the original template for integrity

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceId?: string; // Device used for enrollment

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  deviceType?: string; // Scanner type, camera, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  deviceManufacturer?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  deviceVersion?: string;

  @Column({ type: 'enum', enum: BiometricQuality, default: BiometricQuality.GOOD })
  @IsEnum(BiometricQuality)
  enrollmentQuality: BiometricQuality;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  qualityScore?: number; // 0-100

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  confidenceThreshold?: number; // Minimum confidence for match

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean; // Primary biometric method

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isMultiModal: boolean; // Part of multi-modal biometric

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  multiModalGroupId?: string; // For grouping multi-modal biometrics

  // Security and Privacy
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  encryptionAlgorithm?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  keyId?: string; // Key used for encryption

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumSafe: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumProperties?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isOnDevice: boolean; // Template stored on device vs server

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isDistributed: boolean; // Template distributed across multiple locations

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  privacyLevel?: string;

  // Usage Statistics
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  usageCount: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  successCount: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastSuccessAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastFailureAt?: Date;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  averageMatchScore?: number;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  lastMatchScore?: number;

  // Liveness Detection
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresLivenessCheck: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  livenessMethod?: string;

  @Column({ type: 'jsonb', nullable: true })
  livenessConfig?: Record<string, any>;

  // Anti-Spoofing
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasAntiSpoofing: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  antiSpoofingMethod?: string;

  @Column({ type: 'jsonb', nullable: true })
  antiSpoofingConfig?: Record<string, any>;

  // Template Management
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  enrolledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUpdateAt?: Date;

  @Column({ type: 'int', default: 1 })
  @IsNumber()
  templateVersion: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  needsUpdate: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  updateReason?: string;

  // Environmental Factors
  @Column({ type: 'jsonb', nullable: true })
  enrollmentEnvironment?: Record<string, any>; // Lighting, temperature, etc.

  @Column({ type: 'jsonb', nullable: true })
  usageEnvironment?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  environmentalConstraints?: Record<string, any>;

  // Compliance and Audit
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  complianceLevel?: string;

  @Column({ type: 'jsonb', nullable: true })
  complianceData?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAuditable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Record<string, any>;

  // Error Handling
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastErrorAt?: Date;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  errorCount: number;

  @Column({ type: 'int', default: 5 })
  @IsNumber()
  maxErrors: number;

  // Location and Context
  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsString()
  enrollmentIp?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  enrollmentLocation?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  // Additional Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  technicalSpecs?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.biometricAuths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }

  get successRate(): number {
    if (this.usageCount === 0) return 0;
    return (this.successCount / this.usageCount) * 100;
  }

  get failureRate(): number {
    if (this.usageCount === 0) return 0;
    return (this.failureCount / this.usageCount) * 100;
  }

  get isHealthy(): boolean {
    return this.isActive && 
           !this.isExpired && 
           this.errorCount < this.maxErrors &&
           this.successRate >= 80;
  }

  get needsMaintenance(): boolean {
    return this.needsUpdate || 
           this.errorCount >= this.maxErrors / 2 ||
           this.successRate < 70;
  }

  get displayName(): string {
    return this.biometricType.charAt(0).toUpperCase() + 
           this.biometricType.slice(1).replace('_', ' ');
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    
    if (!this.templateId) {
      this.templateId = `${this.biometricType}_${uuidv4()}`;
    }
    
    if (!this.enrolledAt) {
      this.enrolledAt = new Date();
    }
  }

  enroll(templateData: string, quality: BiometricQuality): void {
    this.encryptedTemplate = templateData;
    this.enrollmentQuality = quality;
    this.status = BiometricStatus.ENROLLED;
    this.isVerified = true;
    this.enrolledAt = new Date();
  }

  activate(): void {
    if (this.status === BiometricStatus.ENROLLED) {
      this.status = BiometricStatus.ACTIVE;
      this.isActive = true;
    }
  }

  deactivate(): void {
    this.status = BiometricStatus.INACTIVE;
    this.isActive = false;
  }

  revoke(): void {
    this.status = BiometricStatus.REVOKED;
    this.isActive = false;
    this.encryptedTemplate = null; // Clear the template
  }

  markAsCompromised(reason: string): void {
    this.status = BiometricStatus.COMPROMISED;
    this.isActive = false;
    this.lastError = reason;
    this.lastErrorAt = new Date();
  }

  recordUsage(success: boolean, matchScore?: number): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
    
    if (success) {
      this.successCount += 1;
      this.lastSuccessAt = new Date();
      if (matchScore) {
        this.lastMatchScore = matchScore;
        this.averageMatchScore = this.averageMatchScore 
          ? (this.averageMatchScore + matchScore) / 2 
          : matchScore;
      }
    } else {
      this.failureCount += 1;
      this.lastFailureAt = new Date();
    }
  }

  recordError(error: string): void {
    this.errorCount += 1;
    this.lastError = error;
    this.lastErrorAt = new Date();
    
    if (this.errorCount >= this.maxErrors) {
      this.deactivate();
    }
  }

  resetErrors(): void {
    this.errorCount = 0;
    this.lastError = null;
    this.lastErrorAt = null;
  }

  updateTemplate(newTemplate: string, version?: number): void {
    this.encryptedTemplate = newTemplate;
    this.templateVersion = version || this.templateVersion + 1;
    this.lastUpdateAt = new Date();
    this.needsUpdate = false;
  }

  setExpiration(expirationDate: Date): void {
    this.expiresAt = expirationDate;
  }

  extendExpiration(days: number): void {
    const currentExpiration = this.expiresAt || new Date();
    this.expiresAt = new Date(currentExpiration.getTime() + days * 24 * 60 * 60 * 1000);
  }

  enableQuantumSafety(properties: Record<string, any>): void {
    this.isQuantumSafe = true;
    this.quantumProperties = properties;
  }

  enableLivenessDetection(method: string, config: Record<string, any>): void {
    this.requiresLivenessCheck = true;
    this.livenessMethod = method;
    this.livenessConfig = config;
  }

  enableAntiSpoofing(method: string, config: Record<string, any>): void {
    this.hasAntiSpoofing = true;
    this.antiSpoofingMethod = method;
    this.antiSpoofingConfig = config;
  }

  setMultiModal(groupId: string): void {
    this.isMultiModal = true;
    this.multiModalGroupId = groupId;
  }

  updateEnvironment(environment: Record<string, any>): void {
    this.usageEnvironment = {
      ...this.usageEnvironment,
      ...environment,
      lastUpdated: new Date(),
    };
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  generateReport(): Record<string, any> {
    return {
      id: this.id,
      biometricType: this.biometricType,
      status: this.status,
      isHealthy: this.isHealthy,
      successRate: this.successRate,
      failureRate: this.failureRate,
      usageCount: this.usageCount,
      lastUsedAt: this.lastUsedAt,
      enrolledAt: this.enrolledAt,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired,
      needsMaintenance: this.needsMaintenance,
      errorCount: this.errorCount,
      templateVersion: this.templateVersion,
      qualityScore: this.qualityScore,
      averageMatchScore: this.averageMatchScore,
      securityFeatures: {
        isQuantumSafe: this.isQuantumSafe,
        hasLivenessDetection: this.requiresLivenessCheck,
        hasAntiSpoofing: this.hasAntiSpoofing,
        isOnDevice: this.isOnDevice,
        isDistributed: this.isDistributed,
      },
    };
  }

  toJSON() {
    const { encryptedTemplate, templateHash, keyId, ...result } = this;
    return {
      ...result,
      isExpired: this.isExpired,
      successRate: this.successRate,
      failureRate: this.failureRate,
      isHealthy: this.isHealthy,
      needsMaintenance: this.needsMaintenance,
      displayName: this.displayName,
    };
  }
}
