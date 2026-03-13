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

export enum TwoFactorMethod {
  SMS = 'sms',
  EMAIL = 'email',
  AUTHENTICATOR = 'authenticator',
  PUSH = 'push',
  BACKUP_CODES = 'backup_codes',
  HARDWARE_TOKEN = 'hardware_token',
  BIOMETRIC = 'biometric',
}

export enum TwoFactorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
  REVOKED = 'revoked',
}

@Entity('two_factor_auth')
@Index(['userId'])
@Index(['method'])
@Index(['status'])
@Index(['createdAt'])
@Index(['expiresAt'])
export class TwoFactorAuth {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  userId: string;

  @Column({ type: 'enum', enum: TwoFactorMethod })
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;

  @Column({ type: 'enum', enum: TwoFactorStatus, default: TwoFactorStatus.PENDING })
  @IsEnum(TwoFactorStatus)
  status: TwoFactorStatus;

  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  secret?: string; // For authenticator apps

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  backupCodes?: string; // JSON string of backup codes

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string; // For SMS

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  email?: string; // For email

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean; // Primary 2FA method

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  attemptCount: number;

  @Column({ type: 'int', default: 3 })
  @IsNumber()
  maxAttempts: number;

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
  verifiedAt?: Date;

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsString()
  createdIp?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Security features
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  challengeHash?: string; // For secure challenges

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresQuantumSafe: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumProperties?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainBacked: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainTxId?: string;

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
  @ManyToOne(() => User, (user) => user.twoFactorAuths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }

  get isLocked(): boolean {
    return this.attemptCount >= this.maxAttempts;
  }

  get remainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attemptCount);
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    
    if (!this.expiresAt && this.method !== TwoFactorMethod.AUTHENTICATOR) {
      // Default expiration: 10 minutes for codes, 30 days for devices
      const minutes = this.method === TwoFactorMethod.SMS || this.method === TwoFactorMethod.EMAIL ? 10 : 43200; // 30 days
      this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    }
  }

  verify(code: string): boolean {
    if (this.isExpired || this.isLocked || !this.isActive) {
      return false;
    }

    const isValid = this.validateCode(code);
    
    if (isValid) {
      this.isVerified = true;
      this.verifiedAt = new Date();
      this.lastUsedAt = new Date();
      this.attemptCount = 0;
      this.status = TwoFactorStatus.VERIFIED;
    } else {
      this.attemptCount += 1;
      if (this.attemptCount >= this.maxAttempts) {
        this.status = TwoFactorStatus.EXPIRED;
        this.isActive = false;
      }
    }

    return isValid;
  }

  private validateCode(inputCode: string): boolean {
    switch (this.method) {
      case TwoFactorMethod.SMS:
      case TwoFactorMethod.EMAIL:
        return this.code === inputCode;
      
      case TwoFactorMethod.AUTHENTICATOR:
        return this.validateTOTP(inputCode);
      
      case TwoFactorMethod.BACKUP_CODES:
        return this.validateBackupCode(inputCode);
      
      default:
        return false;
    }
  }

  private validateTOTP(inputCode: string): boolean {
    // TOTP validation logic would go here
    // For now, simple comparison with stored code
    return this.code === inputCode;
  }

  private validateBackupCode(inputCode: string): boolean {
    if (!this.backupCodes) return false;
    
    try {
      const codes = JSON.parse(this.backupCodes);
      const codeIndex = codes.findIndex((code: string) => code === inputCode);
      
      if (codeIndex !== -1) {
        // Remove used backup code
        codes.splice(codeIndex, 1);
        this.backupCodes = JSON.stringify(codes);
        return true;
      }
    } catch (error) {
      // Invalid backup codes format
    }
    
    return false;
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateRandomCode(8));
    }
    
    this.backupCodes = JSON.stringify(codes);
    return codes;
  }

  private generateRandomCode(length: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  activate(): void {
    this.isActive = true;
    this.status = TwoFactorStatus.ACTIVE;
  }

  deactivate(): void {
    this.isActive = false;
    this.status = TwoFactorStatus.DISABLED;
  }

  revoke(): void {
    this.isActive = false;
    this.status = TwoFactorStatus.REVOKED;
  }

  extendExpiration(minutes: number): void {
    if (this.expiresAt) {
      this.expiresAt = new Date(this.expiresAt.getTime() + minutes * 60 * 1000);
    }
  }

  resetAttempts(): void {
    this.attemptCount = 0;
    if (this.status === TwoFactorStatus.EXPIRED && !this.isExpired) {
      this.status = TwoFactorStatus.ACTIVE;
      this.isActive = true;
    }
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  toJSON() {
    const { code, secret, backupCodes, challengeHash, ...result } = this;
    return {
      ...result,
      isExpired: this.isExpired,
      isLocked: this.isLocked,
      remainingAttempts: this.remainingAttempts,
    };
  }
}
