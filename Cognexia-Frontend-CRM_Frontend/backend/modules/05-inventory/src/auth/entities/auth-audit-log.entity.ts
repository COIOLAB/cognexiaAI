import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../rbac/entities/User.entity';

export interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  userAgent: string;
  contentType?: string;
  contentLength?: number;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  coordinates: { lat: number; lon: number };
  timezone: string;
  isp: string;
  organization: string;
  asn: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  threat: boolean;
}

export interface DeviceContext {
  fingerprint: string;
  deviceId?: string;
  deviceType: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface SecurityContext {
  riskScore: number;
  threatLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: string[];
  mfaRequired: boolean;
  mfaMethod?: string;
  mfaVerified: boolean;
  deviceTrusted: boolean;
  locationTrusted: boolean;
  behaviorConsistent: boolean;
  complianceLevel: string;
}

export interface ComplianceMetadata {
  frameworks: string[]; // ['NIST', 'FISMA', 'FEDRAMP', 'SOX', 'HIPAA']
  classifications: string[]; // ['Public', 'Confidential', 'Secret']
  retention: {
    years: number;
    reason: string;
    destroyAfter: Date;
  };
  legalHold: boolean;
  dataSubjectId?: string; // For GDPR compliance
  consentRecorded: boolean;
  rightsExercised?: string[]; // ['access', 'rectification', 'erasure', 'portability']
}

@Entity('auth_audit_logs')
@Index(['userId'])
@Index(['eventType'])
@Index(['success'])
@Index(['timestamp'])
@Index(['ipAddress'])
@Index(['riskScore'])
@Index(['complianceFrameworks'])
export class AuthAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  sessionId: string;

  @Column()
  eventType: 
    'login_attempt' | 
    'login_success' | 
    'login_failure' | 
    'logout' |
    'mfa_setup' |
    'mfa_verification' |
    'password_change' |
    'password_reset' |
    'account_locked' |
    'account_unlocked' |
    'permission_granted' |
    'permission_denied' |
    'token_issued' |
    'token_refreshed' |
    'token_revoked' |
    'session_created' |
    'session_terminated' |
    'device_registered' |
    'device_trusted' |
    'device_compromised' |
    'suspicious_activity' |
    'compliance_violation' |
    'security_event' |
    'data_access' |
    'data_export' |
    'admin_action' |
    'system_access';

  @Column({ type: 'text' })
  description: string;

  @Column()
  success: boolean;

  @Column({ nullable: true })
  errorCode: string;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string;

  @Column()
  ipAddress: string;

  @Column({ type: 'json', nullable: true })
  geolocation: GeolocationData;

  @Column({ type: 'json' })
  requestContext: RequestContext;

  @Column({ type: 'json' })
  deviceContext: DeviceContext;

  @Column({ type: 'json' })
  securityContext: SecurityContext;

  @Column({ type: 'json' })
  complianceMetadata: ComplianceMetadata;

  @Column()
  riskScore: number; // 0-100

  @Column()
  threatLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

  @Column('simple-array')
  complianceFrameworks: string[];

  @Column('simple-array')
  dataClassifications: string[];

  @Column({ type: 'json', nullable: true })
  additionalData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  responseData: {
    statusCode: number;
    responseTime: number;
    dataReturned: boolean;
    sensitiveDataAccessed: boolean;
    recordsAffected: number;
    permissions: string[];
  };

  @Column({ nullable: true })
  correlationId: string; // For tracking related events

  @Column({ nullable: true })
  parentEventId: string; // For event hierarchies

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  reviewed: boolean;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true, type: 'text' })
  reviewNotes: string;

  @Column({ default: false })
  exported: boolean;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt: Date;

  @Column({ nullable: true })
  exportedBy: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Static methods for creating specific audit log types
  static createLoginAttempt(data: {
    userId?: string;
    sessionId: string;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    deviceContext: DeviceContext;
    securityContext: SecurityContext;
    errorMessage?: string;
  }): Partial<AuthAuditLog> {
    return {
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: data.success ? 'login_success' : 'login_failure',
      description: data.success ? 'User logged in successfully' : `Login failed: ${data.errorMessage}`,
      success: data.success,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
      requestContext: {
        method: 'POST',
        url: '/auth/login',
        userAgent: data.userAgent,
        headers: {},
      },
      deviceContext: data.deviceContext,
      securityContext: data.securityContext,
      riskScore: data.securityContext.riskScore,
      threatLevel: data.securityContext.threatLevel,
      complianceFrameworks: ['NIST', 'FISMA'],
      dataClassifications: ['Confidential'],
      timestamp: new Date(),
    };
  }

  static createMFAEvent(data: {
    userId: string;
    sessionId: string;
    method: string;
    success: boolean;
    ipAddress: string;
    deviceContext: DeviceContext;
    securityContext: SecurityContext;
  }): Partial<AuthAuditLog> {
    return {
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: 'mfa_verification',
      description: `MFA verification using ${data.method} - ${data.success ? 'Success' : 'Failed'}`,
      success: data.success,
      ipAddress: data.ipAddress,
      requestContext: {
        method: 'POST',
        url: '/auth/mfa/verify',
        userAgent: '',
        headers: {},
      },
      deviceContext: data.deviceContext,
      securityContext: data.securityContext,
      riskScore: data.securityContext.riskScore,
      threatLevel: data.securityContext.threatLevel,
      complianceFrameworks: ['NIST', 'FISMA'],
      dataClassifications: ['Confidential'],
      timestamp: new Date(),
    };
  }

  static createSecurityEvent(data: {
    userId?: string;
    sessionId: string;
    eventType: AuthAuditLog['eventType'];
    description: string;
    threatLevel: AuthAuditLog['threatLevel'];
    ipAddress: string;
    deviceContext: DeviceContext;
    additionalData?: Record<string, any>;
  }): Partial<AuthAuditLog> {
    return {
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: data.eventType,
      description: data.description,
      success: false,
      ipAddress: data.ipAddress,
      requestContext: {
        method: 'SECURITY',
        url: '/security-event',
        userAgent: '',
        headers: {},
      },
      deviceContext: data.deviceContext,
      securityContext: {
        riskScore: 100,
        threatLevel: data.threatLevel,
        riskFactors: ['security_violation'],
        mfaRequired: true,
        mfaVerified: false,
        deviceTrusted: false,
        locationTrusted: false,
        behaviorConsistent: false,
        complianceLevel: 'high',
      },
      riskScore: 100,
      threatLevel: data.threatLevel,
      complianceFrameworks: ['NIST', 'FISMA', 'FEDRAMP'],
      dataClassifications: ['Secret'],
      additionalData: data.additionalData,
      timestamp: new Date(),
    };
  }

  static createDataAccessEvent(data: {
    userId: string;
    sessionId: string;
    resource: string;
    action: string;
    success: boolean;
    recordsAffected: number;
    sensitiveData: boolean;
    permissions: string[];
    ipAddress: string;
    deviceContext: DeviceContext;
  }): Partial<AuthAuditLog> {
    return {
      userId: data.userId,
      sessionId: data.sessionId,
      eventType: 'data_access',
      description: `${data.action} on ${data.resource} - ${data.recordsAffected} records`,
      success: data.success,
      ipAddress: data.ipAddress,
      requestContext: {
        method: 'GET',
        url: data.resource,
        userAgent: '',
        headers: {},
      },
      deviceContext: data.deviceContext,
      securityContext: {
        riskScore: data.sensitiveData ? 50 : 25,
        threatLevel: 'Low',
        riskFactors: [],
        mfaRequired: false,
        mfaVerified: true,
        deviceTrusted: true,
        locationTrusted: true,
        behaviorConsistent: true,
        complianceLevel: 'moderate',
      },
      responseData: {
        statusCode: data.success ? 200 : 403,
        responseTime: 0,
        dataReturned: data.success,
        sensitiveDataAccessed: data.sensitiveData,
        recordsAffected: data.recordsAffected,
        permissions: data.permissions,
      },
      complianceFrameworks: data.sensitiveData ? ['NIST', 'HIPAA', 'GDPR'] : ['NIST'],
      dataClassifications: data.sensitiveData ? ['Confidential'] : ['Public'],
      timestamp: new Date(),
    };
  }

  // Helper methods
  isHighRisk(): boolean {
    return this.riskScore > 75 || this.threatLevel === 'High' || this.threatLevel === 'Critical';
  }

  requiresReview(): boolean {
    return !this.reviewed && (
      this.isHighRisk() || 
      !this.success || 
      this.eventType.includes('failure') ||
      this.eventType.includes('suspicious')
    );
  }

  shouldRetain(): boolean {
    if (this.complianceMetadata?.legalHold) return true;
    if (!this.complianceMetadata?.retention) return true;
    
    return new Date() < this.complianceMetadata.retention.destroyAfter;
  }

  addTag(tag: string): void {
    if (!this.tags) this.tags = [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  markReviewed(reviewedBy: string, notes?: string): void {
    this.reviewed = true;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
  }
}
