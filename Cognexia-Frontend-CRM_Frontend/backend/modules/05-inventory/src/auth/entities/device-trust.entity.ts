import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../rbac/entities/User.entity';

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  fonts: string[];
  canvas: string;
  webgl: string;
  audioContext: string;
  hardwareInfo: {
    cpu: string;
    memory: number;
    gpu: string;
  };
  networkInfo: {
    connectionType: string;
    downlink: number;
    effectiveType: string;
  };
}

export interface SecurityAttributes {
  encrypted: boolean;
  secureBootEnabled: boolean;
  tpmPresent: boolean;
  antivirusActive: boolean;
  firewallEnabled: boolean;
  osVersion: string;
  patchLevel: string;
  certificates: string[];
  complianceLevel: 'basic' | 'enhanced' | 'enterprise' | 'government';
}

export interface TrustMetrics {
  score: number; // 0-100
  factors: {
    knownDevice: boolean;
    locationConsistency: boolean;
    behaviorConsistency: boolean;
    securityCompliance: boolean;
    certificateValidity: boolean;
    noMalwareDetected: boolean;
  };
  riskIndicators: string[];
  lastAssessment: Date;
  assessmentCount: number;
}

export interface ComplianceInfo {
  fipsCompliant: boolean;
  commonCriteriaEvaluated: boolean;
  enterpriseManaged: boolean;
  mdmEnrolled: boolean;
  policies: {
    encryption: boolean;
    passcodeRequired: boolean;
    biometricEnabled: boolean;
    remoteWipeCapable: boolean;
    certificateInstalled: boolean;
  };
  attestations: {
    safetyNet?: string; // Android
    deviceCheck?: string; // iOS
    webAuthn?: string; // Web
    tpmAttestation?: string; // Windows
  };
}

@Entity('device_trust')
@Index(['userId'])
@Index(['deviceId'])
@Index(['fingerprint'])
@Index(['trustLevel'])
@Index(['lastSeen'])
export class DeviceTrust {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  deviceName: string;

  @Column()
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'iot' | 'embedded';

  @Column({ type: 'text' })
  fingerprint: string; // Hashed fingerprint

  @Column({ type: 'json' })
  fingerprintData: DeviceFingerprint;

  @Column({ type: 'json' })
  securityAttributes: SecurityAttributes;

  @Column({ type: 'json' })
  trustMetrics: TrustMetrics;

  @Column({ type: 'json' })
  complianceInfo: ComplianceInfo;

  @Column({ 
    type: 'enum',
    enum: ['unknown', 'untrusted', 'low', 'medium', 'high', 'verified'],
    default: 'unknown'
  })
  trustLevel: 'unknown' | 'untrusted' | 'low' | 'medium' | 'high' | 'verified';

  @Column({ default: false })
  registered: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  compromised: boolean;

  @Column({ nullable: true })
  compromisedReason: string;

  @Column({ type: 'timestamp', nullable: true })
  compromisedAt: Date;

  @Column({ type: 'timestamp' })
  firstSeen: Date;

  @Column({ type: 'timestamp' })
  lastSeen: Date;

  @Column({ default: 0 })
  accessCount: number;

  @Column({ type: 'json', nullable: true })
  locations: Array<{
    ipAddress: string;
    country: string;
    region: string;
    city: string;
    isp: string;
    firstSeen: Date;
    lastSeen: Date;
    count: number;
    suspicious: boolean;
  }>;

  @Column({ type: 'json', nullable: true })
  behaviorProfile: {
    averageSessionDuration: number;
    commonLoginTimes: string[];
    frequentLocations: string[];
    typicalUserAgents: string[];
    behaviorFlags: string[];
    anomalyScore: number;
    profileConfidence: number;
  };

  @Column({ type: 'json', nullable: true })
  certificates: Array<{
    type: 'client' | 'device' | 'ca';
    subject: string;
    issuer: string;
    serialNumber: string;
    fingerprint: string;
    validFrom: Date;
    validTo: Date;
    trusted: boolean;
  }>;

  @Column({ type: 'json', nullable: true })
  auditTrail: Array<{
    timestamp: Date;
    action: 'registration' | 'approval' | 'access' | 'compromise' | 'verification';
    details: string;
    ipAddress: string;
    riskScore: number;
    outcome: 'success' | 'failure' | 'blocked';
  }>;

  @Column({ type: 'timestamp', nullable: true })
  registrationRequestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  registrationApprovedAt: Date;

  @Column({ nullable: true })
  registrationApprovedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  nextVerificationDue: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isTrusted(): boolean {
    return this.trustLevel === 'high' || this.trustLevel === 'verified';
  }

  requiresApproval(): boolean {
    return this.registered && !this.approved;
  }

  isCompromised(): boolean {
    return this.compromised;
  }

  isStale(days: number = 30): boolean {
    const staleTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.lastSeen.getTime() < staleTime;
  }

  updateTrustScore(factors: Partial<TrustMetrics['factors']>): void {
    this.trustMetrics.factors = { ...this.trustMetrics.factors, ...factors };
    
    // Calculate trust score
    const factorWeights = {
      knownDevice: 20,
      locationConsistency: 15,
      behaviorConsistency: 20,
      securityCompliance: 25,
      certificateValidity: 10,
      noMalwareDetected: 10,
    };

    let score = 0;
    Object.entries(this.trustMetrics.factors).forEach(([factor, value]) => {
      if (value) score += factorWeights[factor as keyof typeof factorWeights];
    });

    this.trustMetrics.score = Math.min(100, score);
    this.trustMetrics.lastAssessment = new Date();
    this.trustMetrics.assessmentCount++;

    // Update trust level based on score
    if (score >= 90) this.trustLevel = 'verified';
    else if (score >= 75) this.trustLevel = 'high';
    else if (score >= 50) this.trustLevel = 'medium';
    else if (score >= 25) this.trustLevel = 'low';
    else this.trustLevel = 'untrusted';
  }

  markCompromised(reason: string): void {
    this.compromised = true;
    this.compromisedReason = reason;
    this.compromisedAt = new Date();
    this.trustLevel = 'untrusted';
    this.approved = false;
    this.active = false;
  }

  addLocation(locationData: {
    ipAddress: string;
    country: string;
    region: string;
    city: string;
    isp: string;
    suspicious?: boolean;
  }): void {
    if (!this.locations) {
      this.locations = [];
    }

    const existing = this.locations.find(loc => loc.ipAddress === locationData.ipAddress);
    if (existing) {
      existing.lastSeen = new Date();
      existing.count++;
      if (locationData.suspicious) existing.suspicious = true;
    } else {
      this.locations.push({
        ...locationData,
        firstSeen: new Date(),
        lastSeen: new Date(),
        count: 1,
        suspicious: locationData.suspicious || false,
      });
    }
  }

  addAuditEntry(entry: {
    action: string;
    details: string;
    ipAddress: string;
    riskScore: number;
    outcome: 'success' | 'failure' | 'blocked';
  }): void {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }

    this.auditTrail.push({
      timestamp: new Date(),
      action: entry.action as any,
      details: entry.details,
      ipAddress: entry.ipAddress,
      riskScore: entry.riskScore,
      outcome: entry.outcome,
    });

    // Keep only last 100 entries
    if (this.auditTrail.length > 100) {
      this.auditTrail = this.auditTrail.slice(-100);
    }
  }
}
