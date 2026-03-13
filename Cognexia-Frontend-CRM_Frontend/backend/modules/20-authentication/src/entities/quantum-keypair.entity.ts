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

export enum QuantumAlgorithm {
  KYBER = 'kyber',           // Key Encapsulation Mechanism
  DILITHIUM = 'dilithium',   // Digital Signatures
  FALCON = 'falcon',         // Digital Signatures
  SPHINCS_PLUS = 'sphincs_plus', // Digital Signatures
  CLASSIC_MCELIECE = 'classic_mceliece', // Key Encapsulation
  NTRU = 'ntru',             // Key Encapsulation
  SABER = 'saber',           // Key Encapsulation
  FRODO = 'frodo',           // Key Encapsulation
  SIDH = 'sidh',             // Supersingular Isogeny
  RAINBOW = 'rainbow',       // Multivariate
  PICNIC = 'picnic',         // Zero-Knowledge Proofs
}

export enum KeyStatus {
  GENERATING = 'generating',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
  ARCHIVED = 'archived',
}

export enum KeyUsage {
  AUTHENTICATION = 'authentication',
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  KEY_EXCHANGE = 'key_exchange',
  MULTI_PURPOSE = 'multi_purpose',
}

export enum SecurityLevel {
  LEVEL_1 = 128,  // AES-128 equivalent
  LEVEL_3 = 192,  // AES-192 equivalent
  LEVEL_5 = 256,  // AES-256 equivalent
}

@Entity('quantum_keypairs')
@Index(['userId'])
@Index(['algorithm'])
@Index(['status'])
@Index(['usage'])
@Index(['securityLevel'])
@Index(['isPrimary'])
@Index(['createdAt'])
@Index(['expiresAt'])
export class QuantumKeyPair {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  keyId: string; // Unique identifier for the key pair

  @Column({ type: 'enum', enum: QuantumAlgorithm })
  @IsEnum(QuantumAlgorithm)
  algorithm: QuantumAlgorithm;

  @Column({ type: 'enum', enum: KeyStatus, default: KeyStatus.GENERATING })
  @IsEnum(KeyStatus)
  status: KeyStatus;

  @Column({ type: 'enum', enum: KeyUsage, default: KeyUsage.AUTHENTICATION })
  @IsEnum(KeyUsage)
  usage: KeyUsage;

  @Column({ type: 'enum', enum: SecurityLevel, default: SecurityLevel.LEVEL_3 })
  @IsEnum(SecurityLevel)
  securityLevel: SecurityLevel;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  publicKey?: string; // Base64 encoded public key

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  publicKeyHash?: string; // SHA-256 hash of public key

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  privateKeyRef?: string; // Reference to encrypted private key (HSM/secure enclave)

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  encryptionMethod?: string; // Method used to encrypt private key

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  keyDerivationSalt?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean; // Primary quantum key pair

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isHardwareBacked: boolean; // Stored in HSM or secure enclave

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  hardwareType?: string; // HSM model, TPM version, etc.

  // Key Generation Parameters
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  keySize?: number; // Key size in bits

  @Column({ type: 'jsonb', nullable: true })
  algorithmParameters?: Record<string, any>; // Algorithm-specific parameters

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  randomnessSource?: string; // TRNG, PRNG, Quantum RNG, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  generationSeed?: string; // Hash of the seed used for key generation

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  generatedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  generatorId?: string; // ID of the key generator

  // Lifecycle Management
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  activatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastRotatedAt?: Date;

  @Column({ type: 'int', default: 365 })
  @IsNumber()
  rotationPeriodDays: number; // Auto-rotation period

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  autoRotate: boolean;

  // Usage Statistics
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  usageCount: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  signatureCount: number; // Number of signatures created

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  encryptionCount: number; // Number of encryptions performed

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  keyExchangeCount: number; // Number of key exchanges

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  verificationCount: number; // Number of verifications performed

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastSignatureAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastEncryptionAt?: Date;

  // Post-Quantum Security Features
  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isQuantumResistant: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  quantumSecurityLevel?: string; // NIST security level

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsCombination: boolean; // Can be combined with classical crypto

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  hybridPartnerKeyId?: string; // ID of classical key for hybrid schemes

  // Performance Characteristics
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  signatureSize?: number; // Average signature size in bytes

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  publicKeySize?: number; // Public key size in bytes

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  privateKeySize?: number; // Private key size in bytes

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  avgSignTime?: number; // Average signing time in milliseconds

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  avgVerifyTime?: number; // Average verification time in milliseconds

  // Cryptographic Audit
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAudited: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  auditReport?: string; // Reference to audit report

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  auditedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  certificationLevel?: string; // FIPS, Common Criteria, etc.

  // Compliance and Standards
  @Column({ type: 'jsonb', nullable: true })
  complianceStandards?: string[]; // NIST, ISO, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  fipsLevel?: string; // FIPS 140-2 level

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isCommonCriteriaApproved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  regulatoryApproval?: string;

  // Backup and Recovery
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasBackup: boolean;

  @Column({ type: 'jsonb', nullable: true })
  backupLocations?: string[]; // List of backup locations

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  recoveryKeyId?: string; // ID of recovery key

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsSplitKey: boolean; // Shamir's secret sharing support

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  splitKeyThreshold?: number; // Minimum shares needed for recovery

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  splitKeyShares?: number; // Total number of shares

  // Error Handling and Monitoring
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  errorCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastErrorAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  healthMetrics?: Record<string, any>; // Key health metrics

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  needsMaintenance: boolean;

  // Additional Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

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
  @ManyToOne(() => User, (user) => user.quantumKeyPairs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }

  get needsRotation(): boolean {
    if (!this.lastRotatedAt || !this.autoRotate) return false;
    
    const rotationDate = new Date(this.lastRotatedAt.getTime() + this.rotationPeriodDays * 24 * 60 * 60 * 1000);
    return rotationDate < new Date();
  }

  get ageInDays(): number {
    return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isHealthy(): boolean {
    return this.isActive && 
           !this.isExpired && 
           !this.needsMaintenance &&
           this.errorCount < 10 &&
           this.status === KeyStatus.ACTIVE;
  }

  get usageRate(): number {
    if (this.ageInDays === 0) return 0;
    return this.usageCount / this.ageInDays;
  }

  get algorithmDisplayName(): string {
    return this.algorithm.replace('_', '-').toUpperCase();
  }

  get securityLevelBits(): number {
    return this.securityLevel;
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    
    if (!this.keyId) {
      this.keyId = `${this.algorithm}_${uuidv4()}`;
    }
    
    if (!this.generatedAt) {
      this.generatedAt = new Date();
    }
  }

  activate(): void {
    if (this.status === KeyStatus.GENERATING) {
      this.status = KeyStatus.ACTIVE;
      this.isActive = true;
      this.activatedAt = new Date();
    }
  }

  deactivate(): void {
    this.status = KeyStatus.INACTIVE;
    this.isActive = false;
  }

  revoke(reason?: string): void {
    this.status = KeyStatus.REVOKED;
    this.isActive = false;
    
    this.metadata = {
      ...this.metadata,
      revocationReason: reason,
      revokedAt: new Date(),
    };
  }

  markCompromised(): void {
    this.status = KeyStatus.COMPROMISED;
    this.isActive = false;
    this.needsMaintenance = true;
    
    this.metadata = {
      ...this.metadata,
      compromisedAt: new Date(),
      requiresReplacement: true,
    };
  }

  archive(): void {
    this.status = KeyStatus.ARCHIVED;
    this.isActive = false;
    
    this.metadata = {
      ...this.metadata,
      archivedAt: new Date(),
    };
  }

  recordUsage(operation: string): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
    
    switch (operation) {
      case 'sign':
        this.signatureCount += 1;
        this.lastSignatureAt = new Date();
        break;
      case 'encrypt':
        this.encryptionCount += 1;
        this.lastEncryptionAt = new Date();
        break;
      case 'keyexchange':
        this.keyExchangeCount += 1;
        break;
      case 'verify':
        this.verificationCount += 1;
        break;
    }
  }

  recordError(error: string): void {
    this.errorCount += 1;
    this.lastError = error;
    this.lastErrorAt = new Date();
    
    if (this.errorCount >= 10) {
      this.needsMaintenance = true;
    }
    
    if (this.errorCount >= 50) {
      this.deactivate();
    }
  }

  resetErrors(): void {
    this.errorCount = 0;
    this.lastError = null;
    this.lastErrorAt = null;
    this.needsMaintenance = false;
  }

  scheduleRotation(days: number): void {
    this.autoRotate = true;
    this.rotationPeriodDays = days;
    
    if (!this.lastRotatedAt) {
      this.lastRotatedAt = new Date();
    }
  }

  performRotation(): void {
    this.lastRotatedAt = new Date();
    
    // The actual key rotation would be handled by the service
    this.metadata = {
      ...this.metadata,
      lastRotation: new Date(),
      rotationCount: (this.metadata?.rotationCount || 0) + 1,
    };
  }

  setExpiration(expirationDate: Date): void {
    this.expiresAt = expirationDate;
  }

  extendExpiration(days: number): void {
    const currentExpiration = this.expiresAt || new Date();
    this.expiresAt = new Date(currentExpiration.getTime() + days * 24 * 60 * 60 * 1000);
  }

  enableHardwareBackend(hardwareType: string): void {
    this.isHardwareBacked = true;
    this.hardwareType = hardwareType;
  }

  enableSplitKey(threshold: number, shares: number): void {
    this.supportsSplitKey = true;
    this.splitKeyThreshold = threshold;
    this.splitKeyShares = shares;
  }

  addBackupLocation(location: string): void {
    if (!this.backupLocations) {
      this.backupLocations = [];
    }
    
    if (!this.backupLocations.includes(location)) {
      this.backupLocations.push(location);
      this.hasBackup = true;
    }
  }

  removeBackupLocation(location: string): void {
    if (this.backupLocations) {
      this.backupLocations = this.backupLocations.filter(loc => loc !== location);
      this.hasBackup = this.backupLocations.length > 0;
    }
  }

  updatePerformanceMetrics(signTime?: number, verifyTime?: number): void {
    if (signTime) {
      this.avgSignTime = this.avgSignTime 
        ? (this.avgSignTime + signTime) / 2 
        : signTime;
    }
    
    if (verifyTime) {
      this.avgVerifyTime = this.avgVerifyTime 
        ? (this.avgVerifyTime + verifyTime) / 2 
        : verifyTime;
    }
  }

  updateHealthMetrics(metrics: Record<string, any>): void {
    this.healthMetrics = {
      ...this.healthMetrics,
      ...metrics,
      lastUpdated: new Date(),
    };
  }

  addComplianceStandard(standard: string): void {
    if (!this.complianceStandards) {
      this.complianceStandards = [];
    }
    
    if (!this.complianceStandards.includes(standard)) {
      this.complianceStandards.push(standard);
    }
  }

  setCertification(level: string, auditReport?: string): void {
    this.certificationLevel = level;
    this.isAudited = true;
    this.auditedAt = new Date();
    
    if (auditReport) {
      this.auditReport = auditReport;
    }
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  generateReport(): Record<string, any> {
    return {
      id: this.id,
      keyId: this.keyId,
      algorithm: this.algorithm,
      algorithmDisplayName: this.algorithmDisplayName,
      status: this.status,
      usage: this.usage,
      securityLevel: this.securityLevel,
      securityLevelBits: this.securityLevelBits,
      isActive: this.isActive,
      isHealthy: this.isHealthy,
      isExpired: this.isExpired,
      needsRotation: this.needsRotation,
      needsMaintenance: this.needsMaintenance,
      ageInDays: this.ageInDays,
      usageCount: this.usageCount,
      usageRate: this.usageRate,
      signatureCount: this.signatureCount,
      encryptionCount: this.encryptionCount,
      verificationCount: this.verificationCount,
      errorCount: this.errorCount,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      features: {
        isQuantumResistant: this.isQuantumResistant,
        isHardwareBacked: this.isHardwareBacked,
        supportsCombination: this.supportsCombination,
        supportsSplitKey: this.supportsSplitKey,
        hasBackup: this.hasBackup,
        autoRotate: this.autoRotate,
      },
      performance: {
        avgSignTime: this.avgSignTime,
        avgVerifyTime: this.avgVerifyTime,
        signatureSize: this.signatureSize,
        publicKeySize: this.publicKeySize,
      },
      compliance: {
        isAudited: this.isAudited,
        certificationLevel: this.certificationLevel,
        complianceStandards: this.complianceStandards,
        fipsLevel: this.fipsLevel,
      },
    };
  }

  toJSON() {
    const { privateKeyRef, keyDerivationSalt, generationSeed, ...result } = this;
    return {
      ...result,
      isExpired: this.isExpired,
      needsRotation: this.needsRotation,
      ageInDays: this.ageInDays,
      isHealthy: this.isHealthy,
      usageRate: this.usageRate,
      algorithmDisplayName: this.algorithmDisplayName,
      securityLevelBits: this.securityLevelBits,
    };
  }
}
