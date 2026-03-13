import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../rbac/entities/User.entity';

export interface TOTPConfig {
  enabled: boolean;
  secret?: string;
  backupCodes: string[];
  lastUsed?: Date;
  qrCodeUrl?: string;
  issuer: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: number; // seconds
}

export interface SMSConfig {
  enabled: boolean;
  phoneNumber?: string;
  lastUsed?: Date;
  provider: 'twilio' | 'aws-sns' | 'vonage';
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  rateLimitCount: number;
  rateLimitReset: Date;
}

export interface EmailConfig {
  enabled: boolean;
  emailAddress?: string;
  lastUsed?: Date;
  provider: 'sendgrid' | 'ses' | 'nodemailer';
  templateId: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
}

export interface HardwareTokenConfig {
  enabled: boolean;
  devices: Array<{
    id: string;
    name: string;
    type: 'yubikey' | 'rsa-securid' | 'google-titan' | 'other';
    publicKey: string;
    certificate?: string;
    lastUsed?: Date;
    registered: Date;
    trusted: boolean;
  }>;
}

export interface BiometricConfig {
  enabled: boolean;
  fingerprint?: {
    enabled: boolean;
    templates: string[];
    enrollmentDate: Date;
    lastUsed?: Date;
    quality: number;
  };
  faceRecognition?: {
    enabled: boolean;
    template: string;
    enrollmentDate: Date;
    lastUsed?: Date;
    confidence: number;
  };
  voicePrint?: {
    enabled: boolean;
    template: string;
    enrollmentDate: Date;
    lastUsed?: Date;
    accuracy: number;
  };
  iris?: {
    enabled: boolean;
    template: string;
    enrollmentDate: Date;
    lastUsed?: Date;
  };
}

export interface PushNotificationConfig {
  enabled: boolean;
  deviceTokens: Array<{
    token: string;
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    appVersion: string;
    lastUsed?: Date;
    registered: Date;
  }>;
  provider: 'firebase' | 'apns' | 'custom';
}

export interface MFAPolicies {
  requireForLogin: boolean;
  requireForSensitiveOperations: boolean;
  requireForHighRiskActivities: boolean;
  gracePeriodHours: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  allowFallbackMethods: boolean;
  minimumMethods: number;
  adaptiveRequirement: boolean; // Based on risk assessment
  complianceLevel: 'basic' | 'enhanced' | 'government';
}

@Entity('mfa_configurations')
@Index(['userId'])
@Index(['enabled'])
export class MFAConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  enabled: boolean;

  @Column({ type: 'json' })
  totp: TOTPConfig;

  @Column({ type: 'json' })
  sms: SMSConfig;

  @Column({ type: 'json' })
  email: EmailConfig;

  @Column({ type: 'json' })
  hardware: HardwareTokenConfig;

  @Column({ type: 'json' })
  biometric: BiometricConfig;

  @Column({ type: 'json' })
  push: PushNotificationConfig;

  @Column({ type: 'json' })
  policies: MFAPolicies;

  @Column({ type: 'json', nullable: true })
  recoveryOptions: {
    backupCodes: {
      enabled: boolean;
      codes: string[];
      lastGenerated: Date;
      usedCodes: string[];
    };
    recoveryEmail: {
      enabled: boolean;
      email: string;
      verified: boolean;
    };
    recoveryPhone: {
      enabled: boolean;
      phone: string;
      verified: boolean;
    };
    adminOverride: {
      enabled: boolean;
      requiresApproval: boolean;
      approvers: string[];
    };
  };

  @Column({ type: 'json', nullable: true })
  auditTrail: Array<{
    timestamp: Date;
    action: 'setup' | 'verification' | 'failed_attempt' | 'lockout' | 'reset';
    method: string;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    riskScore: number;
    details: string;
  }>;

  @Column({ default: 0 })
  failedAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulAuth: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedAuth: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isLocked(): boolean {
    return this.lockedUntil ? new Date() < this.lockedUntil : false;
  }

  getActiveMethods(): string[] {
    const methods: string[] = [];
    
    if (this.totp.enabled) methods.push('totp');
    if (this.sms.enabled) methods.push('sms');
    if (this.email.enabled) methods.push('email');
    if (this.hardware.enabled && this.hardware.devices.length > 0) methods.push('hardware');
    if (this.biometric.enabled) methods.push('biometric');
    if (this.push.enabled && this.push.deviceTokens.length > 0) methods.push('push');
    
    return methods;
  }

  hasMinimumMethods(): boolean {
    return this.getActiveMethods().length >= this.policies.minimumMethods;
  }

  requiresMFAFor(operation: 'login' | 'sensitive' | 'high_risk'): boolean {
    switch (operation) {
      case 'login':
        return this.policies.requireForLogin;
      case 'sensitive':
        return this.policies.requireForSensitiveOperations;
      case 'high_risk':
        return this.policies.requireForHighRiskActivities;
      default:
        return false;
    }
  }

  addAuditEntry(entry: {
    action: string;
    method: string;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    riskScore: number;
    details: string;
  }): void {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      timestamp: new Date(),
      action: entry.action as any,
      method: entry.method,
      success: entry.success,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      riskScore: entry.riskScore,
      details: entry.details,
    });

    // Keep only last 100 entries
    if (this.auditTrail.length > 100) {
      this.auditTrail = this.auditTrail.slice(-100);
    }
  }

  incrementFailedAttempts(): void {
    this.failedAttempts++;
    this.lastFailedAuth = new Date();

    if (this.failedAttempts >= this.policies.maxFailedAttempts) {
      this.lockedUntil = new Date(
        Date.now() + this.policies.lockoutDurationMinutes * 60 * 1000
      );
    }
  }

  resetFailedAttempts(): void {
    this.failedAttempts = 0;
    this.lockedUntil = null;
    this.lastSuccessfulAuth = new Date();
  }
}
