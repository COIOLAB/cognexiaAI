import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { IsEmail, IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Related entities
import { Role } from './role.entity';
import { UserSession } from './user-session.entity';
import { LoginAttempt } from './login-attempt.entity';
import { PasswordReset } from './password-reset.entity';
import { TwoFactorAuth } from './two-factor-auth.entity';
import { SecurityAudit } from './security-audit.entity';
import { BiometricAuth } from './biometric-auth.entity';
import { BlockchainIdentity } from './blockchain-identity.entity';
import { QuantumKeyPair } from './quantum-keypair.entity';

// Enums
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  LOCKED = 'locked',
  ARCHIVED = 'archived',
}

export enum SecurityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  CRITICAL = 'critical',
  QUANTUM = 'quantum',
}

export enum AuthenticationMethod {
  PASSWORD = 'password',
  TWO_FACTOR = 'two_factor',
  BIOMETRIC = 'biometric',
  BLOCKCHAIN = 'blockchain',
  QUANTUM = 'quantum',
  MULTI_MODAL = 'multi_modal',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['employeeId'], { unique: true })
@Index(['blockchainAddress'], { unique: true })
@Index(['quantumId'], { unique: true })
@Index(['createdAt'])
@Index(['lastLoginAt'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  // JWT Subject - alias for id for compatibility
  get sub(): string {
    return this.id;
  }

  // Basic Information
  @Column({ type: 'varchar', length: 100, unique: true })
  @IsEmail()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsString()
  @Index()
  username: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() // Never include password in responses
  @IsString()
  password: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  // Industry 5.0 Features
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ type: 'enum', enum: SecurityLevel, default: SecurityLevel.BASIC })
  @IsEnum(SecurityLevel)
  securityLevel: SecurityLevel;

  @Column({ type: 'enum', enum: AuthenticationMethod, default: AuthenticationMethod.PASSWORD })
  @IsEnum(AuthenticationMethod)
  preferredAuthMethod: AuthenticationMethod;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isTwoFactorEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBiometricEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSystemUser: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresPasswordChange: boolean;

  // Security Features
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  quantumId?: string;

  @Column({ type: 'jsonb', nullable: true })
  biometricTemplate?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  digitalIdentity?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  decentralizedId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  zeroTrustScore?: string;

  // Login and Session Information
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsString()
  lastLoginIp?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  lastLoginUserAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  lastLoginLocation?: string;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  accountLockedUntil?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  passwordChangedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  phoneVerifiedAt?: Date;

  // AI and Analytics
  @Column({ type: 'jsonb', nullable: true })
  behaviorProfile?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  riskProfile?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Compliance and Audit
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  complianceStatus?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  dataClassification?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  privacyLevel?: string;

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

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  // Relationships
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => LoginAttempt, (attempt) => attempt.user)
  loginAttempts: LoginAttempt[];

  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets: PasswordReset[];

  @OneToMany(() => TwoFactorAuth, (twoFactor) => twoFactor.user)
  twoFactorAuths: TwoFactorAuth[];

  @OneToMany(() => SecurityAudit, (audit) => audit.user)
  securityAudits: SecurityAudit[];

  @OneToMany(() => BiometricAuth, (biometric) => biometric.user)
  biometricAuths: BiometricAuth[];

  @OneToMany(() => BlockchainIdentity, (blockchain) => blockchain.user)
  blockchainIdentities: BlockchainIdentity[];

  @OneToMany(() => QuantumKeyPair, (quantum) => quantum.user)
  quantumKeyPairs: QuantumKeyPair[];

  // Computed Properties
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLocked(): boolean {
    return this.accountLockedUntil && this.accountLockedUntil > new Date();
  }

  get isVerified(): boolean {
    return this.isEmailVerified && this.status === UserStatus.ACTIVE;
  }

  get hasAdvancedSecurity(): boolean {
    return this.isTwoFactorEnabled || this.isBiometricEnabled || this.isBlockchainEnabled || this.isQuantumEnabled;
  }

  get securityScore(): number {
    let score = 0;
    if (this.isTwoFactorEnabled) score += 20;
    if (this.isBiometricEnabled) score += 25;
    if (this.isBlockchainEnabled) score += 30;
    if (this.isQuantumEnabled) score += 25;
    return Math.min(score, 100);
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    this.email = this.email.toLowerCase();
    this.username = this.username.toLowerCase();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
      this.passwordChangedAt = new Date();
    }
    this.email = this.email.toLowerCase();
    this.username = this.username.toLowerCase();
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async setPassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 12);
    this.passwordChangedAt = new Date();
    this.requiresPasswordChange = false;
  }

  lockAccount(duration: number = 30): void {
    this.accountLockedUntil = new Date(Date.now() + duration * 60 * 1000);
    this.status = UserStatus.LOCKED;
  }

  unlockAccount(): void {
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
    this.status = UserStatus.ACTIVE;
  }

  incrementFailedAttempts(): void {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
      this.lockAccount();
    }
  }

  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
  }

  updateLastLogin(ip: string, userAgent: string, location?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
    this.lastLoginUserAgent = userAgent;
    this.lastLoginLocation = location;
    this.resetFailedAttempts();
  }

  enableTwoFactor(): void {
    this.isTwoFactorEnabled = true;
    this.securityLevel = SecurityLevel.STANDARD;
  }

  disableTwoFactor(): void {
    this.isTwoFactorEnabled = false;
    if (this.securityLevel === SecurityLevel.STANDARD && !this.hasAdvancedSecurity) {
      this.securityLevel = SecurityLevel.BASIC;
    }
  }

  enableBiometric(template: Record<string, any>): void {
    this.isBiometricEnabled = true;
    this.biometricTemplate = template;
    this.securityLevel = SecurityLevel.HIGH;
  }

  disableBiometric(): void {
    this.isBiometricEnabled = false;
    this.biometricTemplate = null;
    this.updateSecurityLevel();
  }

  enableBlockchain(address: string): void {
    this.isBlockchainEnabled = true;
    this.blockchainAddress = address;
    this.securityLevel = SecurityLevel.CRITICAL;
  }

  disableBlockchain(): void {
    this.isBlockchainEnabled = false;
    this.blockchainAddress = null;
    this.updateSecurityLevel();
  }

  enableQuantum(quantumId: string): void {
    this.isQuantumEnabled = true;
    this.quantumId = quantumId;
    this.securityLevel = SecurityLevel.QUANTUM;
  }

  disableQuantum(): void {
    this.isQuantumEnabled = false;
    this.quantumId = null;
    this.updateSecurityLevel();
  }

  private updateSecurityLevel(): void {
    if (this.isQuantumEnabled) {
      this.securityLevel = SecurityLevel.QUANTUM;
    } else if (this.isBlockchainEnabled) {
      this.securityLevel = SecurityLevel.CRITICAL;
    } else if (this.isBiometricEnabled) {
      this.securityLevel = SecurityLevel.HIGH;
    } else if (this.isTwoFactorEnabled) {
      this.securityLevel = SecurityLevel.STANDARD;
    } else {
      this.securityLevel = SecurityLevel.BASIC;
    }
  }

  updateBehaviorProfile(behaviorData: Record<string, any>): void {
    this.behaviorProfile = {
      ...this.behaviorProfile,
      ...behaviorData,
      lastUpdated: new Date(),
    };
  }

  updateRiskProfile(riskData: Record<string, any>): void {
    this.riskProfile = {
      ...this.riskProfile,
      ...riskData,
      lastAssessed: new Date(),
    };
  }

  hasRole(roleName: string): boolean {
    return this.roles.some(role => role.name === roleName);
  }

  hasPermission(permissionName: string): boolean {
    return this.roles.some(role => 
      role.permissions.some(permission => permission.name === permissionName)
    );
  }

  getRoleNames(): string[] {
    return this.roles.map(role => role.name);
  }

  getPermissionNames(): string[] {
    const permissions = new Set<string>();
    this.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(permission.name);
      });
    });
    return Array.from(permissions);
  }

  toJSON() {
    const { password, biometricTemplate, ...result } = this;
    return result;
  }
}
