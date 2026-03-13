import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../rbac/entities/User.entity';

export interface SessionLocation {
  country: string;
  region: string;
  city: string;
  coordinates: { lat: number; lon: number };
  timezone: string;
}

export interface SessionSecurity {
  encryptionLevel: 'AES-128' | 'AES-256' | 'ChaCha20';
  integrityCheck: string;
  antiTampering: boolean;
  secureTransport: boolean;
  tlsVersion: string;
}

export interface SessionCompliance {
  fismaLevel: 'Low' | 'Moderate' | 'High';
  fedrampLevel: 'LI-SaaS' | 'Low' | 'Moderate' | 'High';
  classification: 'Public' | 'Confidential' | 'Secret' | 'TopSecret';
  clearanceRequired: string[];
  complianceFlags: string[];
}

export interface SessionMonitoring {
  behaviorAnalysis: boolean;
  anomalyDetection: boolean;
  riskScore: number; // 0-100
  threatLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  suspiciousActivities: string[];
  lastRiskAssessment: Date;
}

@Entity('auth_sessions')
@Index(['userId'])
@Index(['sessionId'])
@Index(['ipAddress'])
@Index(['expiresAt'])
export class AuthSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  deviceFingerprint: string;

  @Column()
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  location: SessionLocation;

  @Column({ type: 'json' })
  security: SessionSecurity;

  @Column({ type: 'json' })
  compliance: SessionCompliance;

  @Column({ type: 'json' })
  monitoring: SessionMonitoring;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp' })
  lastActivity: Date;

  @Column({ default: 30 }) // minutes
  maxIdleTime: number;

  @Column({ default: 8 }) // hours
  absoluteTimeout: number;

  @Column({ default: false })
  renewalRequired: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  terminationReason: string;

  @Column({ type: 'json', nullable: true })
  mfaContext: {
    required: boolean;
    verified: boolean;
    methods: string[];
    lastVerified: Date;
  };

  @Column({ type: 'json', nullable: true })
  deviceContext: {
    trusted: boolean;
    knownDevice: boolean;
    deviceType: string;
    os: string;
    browser: string;
    registrationRequired: boolean;
  };

  @Column({ type: 'json', nullable: true })
  zeroTrustContext: {
    policyId: string;
    evaluationScore: number;
    violations: string[];
    lastEvaluation: Date;
    nextEvaluation: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Methods for session validation
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isIdle(): boolean {
    const idleTime = Date.now() - this.lastActivity.getTime();
    return idleTime > this.maxIdleTime * 60 * 1000;
  }

  requiresRenewal(): boolean {
    if (this.renewalRequired) return true;
    
    const sessionAge = Date.now() - this.createdAt.getTime();
    const maxAge = this.absoluteTimeout * 60 * 60 * 1000;
    return sessionAge > maxAge * 0.8; // Require renewal at 80% of max age
  }

  isHighRisk(): boolean {
    return this.monitoring.riskScore > 75 || 
           this.monitoring.threatLevel === 'High' || 
           this.monitoring.threatLevel === 'Critical';
  }

  updateActivity(): void {
    this.lastActivity = new Date();
  }

  addSuspiciousActivity(activity: string): void {
    if (!this.monitoring.suspiciousActivities) {
      this.monitoring.suspiciousActivities = [];
    }
    this.monitoring.suspiciousActivities.push(activity);
    this.monitoring.lastRiskAssessment = new Date();
  }
}
