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
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsNumber, IsIP } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_SETUP = 'two_factor_setup',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  TWO_FACTOR_SUCCESS = 'two_factor_success',
  TWO_FACTOR_FAILURE = 'two_factor_failure',
  BIOMETRIC_SETUP = 'biometric_setup',
  BIOMETRIC_SUCCESS = 'biometric_success',
  BIOMETRIC_FAILURE = 'biometric_failure',
  BLOCKCHAIN_AUTH = 'blockchain_auth',
  QUANTUM_AUTH = 'quantum_auth',
  ROLE_CHANGE = 'role_change',
  PERMISSION_CHANGE = 'permission_change',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  DATA_EXPORT = 'data_export',
  SYSTEM_ACCESS = 'system_access',
  API_ACCESS = 'api_access',
  OAUTH_LOGIN = 'oauth_login',
  OAUTH_REVOKE = 'oauth_revoke',
  SESSION_EXPIRED = 'session_expired',
  CONCURRENT_LOGIN = 'concurrent_login',
  GEOLOCATION_ANOMALY = 'geolocation_anomaly',
  DEVICE_CHANGE = 'device_change',
  SECURITY_POLICY_VIOLATION = 'security_policy_violation',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  AI_THREAT_DETECTED = 'ai_threat_detected',
  QUANTUM_THREAT_DETECTED = 'quantum_threat_detected',
}

export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum SecurityAction {
  ALLOW = 'allow',
  DENY = 'deny',
  CHALLENGE = 'challenge',
  MONITOR = 'monitor',
  ALERT = 'alert',
  BLOCK = 'block',
  QUARANTINE = 'quarantine',
}

@Entity('security_audits')
@Index(['userId'])
@Index(['eventType'])
@Index(['riskLevel'])
@Index(['action'])
@Index(['ipAddress'])
@Index(['createdAt'])
@Index(['isAnomaly'])
export class SecurityAudit {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Column({ type: 'enum', enum: SecurityEventType })
  @IsEnum(SecurityEventType)
  eventType: SecurityEventType;

  @Column({ type: 'enum', enum: SecurityRiskLevel, default: SecurityRiskLevel.LOW })
  @IsEnum(SecurityRiskLevel)
  riskLevel: SecurityRiskLevel;

  @Column({ type: 'enum', enum: SecurityAction, default: SecurityAction.ALLOW })
  @IsEnum(SecurityAction)
  action: SecurityAction;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  description: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  details?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  resource?: string; // What resource was accessed

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  method?: string; // HTTP method or action type

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  endpoint?: string; // API endpoint or URL

  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  location?: string; // Geographic location

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  deviceType?: string; // mobile, desktop, tablet, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  browser?: string;

  // Security Analysis
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSuccessful: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAnomaly: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSuspicious: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlocked: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresInvestigation: boolean;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  riskScore?: number; // 0-100

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber()
  confidenceScore?: number; // AI confidence in threat detection

  @Column({ type: 'jsonb', nullable: true })
  threatIndicators?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  behaviorAnalysis?: Record<string, any>;

  // Industry 5.0 Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumRelated: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumMetrics?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBlockchainRelated: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainTxId?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isBiometricRelated: boolean;

  @Column({ type: 'jsonb', nullable: true })
  biometricData?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAIDetected: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  aiModel?: string; // Which AI model detected this

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis?: Record<string, any>;

  // Session and Context
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  correlationId?: string; // To group related events

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  source?: string; // web, mobile, api, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  component?: string; // Which system component

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  module?: string; // Which module (auth, hr, manufacturing, etc.)

  // Response and Mitigation
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  responseAction?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  mitigation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  alertLevel?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isResolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  resolvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  resolvedBy?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  resolution?: string;

  // Compliance and Reporting
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isComplianceRelated: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  regulatoryFramework?: string; // GDPR, SOX, HIPAA, etc.

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresReporting: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  reportedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  incidentId?: string;

  // Additional Context
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload?: Record<string, any>; // Sanitized request data

  @Column({ type: 'jsonb', nullable: true })
  responsePayload?: Record<string, any>; // Sanitized response data

  @Column({ type: 'jsonb', nullable: true })
  environmentInfo?: Record<string, any>;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.securityAudits, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Computed Properties
  get isHighRisk(): boolean {
    return this.riskLevel === SecurityRiskLevel.HIGH || 
           this.riskLevel === SecurityRiskLevel.CRITICAL || 
           this.riskLevel === SecurityRiskLevel.EMERGENCY;
  }

  get needsImmediateAction(): boolean {
    return this.riskLevel === SecurityRiskLevel.CRITICAL || 
           this.riskLevel === SecurityRiskLevel.EMERGENCY ||
           this.requiresInvestigation;
  }

  get ageInMinutes(): number {
    return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60));
  }

  get isRecent(): boolean {
    return this.ageInMinutes <= 60; // Within last hour
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    
    // Generate correlation ID if not provided
    if (!this.correlationId) {
      this.correlationId = uuidv4();
    }
  }

  markAsAnomaly(confidence: number = 0.8): void {
    this.isAnomaly = true;
    this.isSuspicious = true;
    this.confidenceScore = confidence;
    
    if (confidence > 0.9) {
      this.riskLevel = SecurityRiskLevel.HIGH;
      this.requiresInvestigation = true;
    }
  }

  markAsSuspicious(reason: string): void {
    this.isSuspicious = true;
    this.details = `${this.details || ''}\nSuspicious: ${reason}`.trim();
    
    if (this.riskLevel === SecurityRiskLevel.LOW) {
      this.riskLevel = SecurityRiskLevel.MEDIUM;
    }
  }

  blockEvent(reason: string): void {
    this.isBlocked = true;
    this.action = SecurityAction.BLOCK;
    this.responseAction = `Blocked: ${reason}`;
    this.riskLevel = SecurityRiskLevel.HIGH;
  }

  resolve(resolvedBy: string, resolution: string): void {
    this.isResolved = true;
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    this.resolution = resolution;
  }

  escalate(newRiskLevel: SecurityRiskLevel, reason: string): void {
    this.riskLevel = newRiskLevel;
    this.requiresInvestigation = true;
    this.details = `${this.details || ''}\nEscalated: ${reason}`.trim();
    
    if (newRiskLevel === SecurityRiskLevel.CRITICAL || newRiskLevel === SecurityRiskLevel.EMERGENCY) {
      this.requiresReporting = true;
    }
  }

  addThreatIndicator(indicator: string, value: any, severity: string): void {
    this.threatIndicators = {
      ...this.threatIndicators,
      [indicator]: {
        value,
        severity,
        detectedAt: new Date(),
      },
    };
  }

  updateRiskScore(score: number): void {
    this.riskScore = Math.max(0, Math.min(100, score));
    
    // Auto-update risk level based on score
    if (score >= 90) {
      this.riskLevel = SecurityRiskLevel.EMERGENCY;
    } else if (score >= 75) {
      this.riskLevel = SecurityRiskLevel.CRITICAL;
    } else if (score >= 50) {
      this.riskLevel = SecurityRiskLevel.HIGH;
    } else if (score >= 25) {
      this.riskLevel = SecurityRiskLevel.MEDIUM;
    } else {
      this.riskLevel = SecurityRiskLevel.LOW;
    }
  }

  addAIAnalysis(modelName: string, analysis: Record<string, any>): void {
    this.isAIDetected = true;
    this.aiModel = modelName;
    this.aiAnalysis = {
      ...this.aiAnalysis,
      [modelName]: {
        ...analysis,
        analyzedAt: new Date(),
      },
    };
  }

  addBehaviorData(behaviorData: Record<string, any>): void {
    this.behaviorAnalysis = {
      ...this.behaviorAnalysis,
      ...behaviorData,
      lastUpdated: new Date(),
    };
  }

  enableQuantumTracking(metrics: Record<string, any>): void {
    this.isQuantumRelated = true;
    this.quantumMetrics = metrics;
  }

  enableBlockchainTracking(txId: string): void {
    this.isBlockchainRelated = true;
    this.blockchainTxId = txId;
  }

  enableBiometricTracking(data: Record<string, any>): void {
    this.isBiometricRelated = true;
    this.biometricData = data;
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  generateIncidentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.incidentId = `INC-${timestamp}-${random}`.toUpperCase();
    return this.incidentId;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      eventType: this.eventType,
      riskLevel: this.riskLevel,
      action: this.action,
      description: this.description,
      resource: this.resource,
      method: this.method,
      ipAddress: this.ipAddress,
      location: this.location,
      deviceType: this.deviceType,
      isSuccessful: this.isSuccessful,
      isAnomaly: this.isAnomaly,
      isSuspicious: this.isSuspicious,
      isBlocked: this.isBlocked,
      requiresInvestigation: this.requiresInvestigation,
      riskScore: this.riskScore,
      confidenceScore: this.confidenceScore,
      isQuantumRelated: this.isQuantumRelated,
      isBlockchainRelated: this.isBlockchainRelated,
      isBiometricRelated: this.isBiometricRelated,
      isAIDetected: this.isAIDetected,
      aiModel: this.aiModel,
      sessionId: this.sessionId,
      correlationId: this.correlationId,
      source: this.source,
      component: this.component,
      module: this.module,
      isResolved: this.isResolved,
      resolvedAt: this.resolvedAt,
      isComplianceRelated: this.isComplianceRelated,
      requiresReporting: this.requiresReporting,
      incidentId: this.incidentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Computed properties
      isHighRisk: this.isHighRisk,
      needsImmediateAction: this.needsImmediateAction,
      ageInMinutes: this.ageInMinutes,
      isRecent: this.isRecent,
    };
  }
}
