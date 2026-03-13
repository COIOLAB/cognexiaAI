import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkCenter } from './WorkCenter';

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  ULTRA_SECURE = 'ultra_secure',
  QUANTUM_SECURE = 'quantum_secure',
}

export enum ThreatLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  MITIGATED = 'mitigated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ComplianceFramework {
  NIST = 'nist',
  ISO27001 = 'iso27001',
  IEC62443 = 'iec62443',
  SOC2 = 'soc2',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  NERC_CIP = 'nerc_cip',
}

@Entity('cybersecurity')
@Index(['securityCode'], { unique: true })
@Index(['securityLevel'])
@Index(['threatLevel'])
@Index(['complianceFramework'])
@Index(['workCenterId'])
export class Cybersecurity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  securityCode: string;

  @Column({ length: 255 })
  securityName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SecurityLevel,
    default: SecurityLevel.MEDIUM,
  })
  securityLevel: SecurityLevel;

  @Column({
    type: 'enum',
    enum: ThreatLevel,
    default: ThreatLevel.LOW,
  })
  currentThreatLevel: ThreatLevel;

  @Column({
    type: 'enum',
    enum: ComplianceFramework,
    default: ComplianceFramework.NIST,
  })
  complianceFramework: ComplianceFramework;

  // Security Infrastructure
  @Column({ type: 'jsonb', nullable: true })
  securityInfrastructure: {
    firewalls: object[];
    intrusion: object[];
    antimalware: object[];
    encryption: object[];
    authentication: object[];
    authorization: object[];
    monitoring: object[];
    backup: object[];
  };

  // Network Security
  @Column({ type: 'jsonb', nullable: true })
  networkSecurity: {
    segmentation: boolean;
    vlans: object[];
    dmz: boolean;
    vpn: object[];
    idsIps: object[];
    ddosProtection: boolean;
    trafficAnalysis: boolean;
    zeroTrust: boolean;
  };

  // Endpoint Security
  @Column({ type: 'jsonb', nullable: true })
  endpointSecurity: {
    antivirus: boolean;
    edr: boolean; // Endpoint Detection and Response
    deviceControl: boolean;
    patchManagement: boolean;
    privilegedAccess: boolean;
    mobileDeviceManagement: boolean;
    ueba: boolean; // User and Entity Behavior Analytics
  };

  // Identity and Access Management
  @Column({ type: 'jsonb', nullable: true })
  identityManagement: {
    sso: boolean; // Single Sign-On
    mfa: boolean; // Multi-Factor Authentication
    pam: boolean; // Privileged Access Management
    rbac: boolean; // Role-Based Access Control
    identityFederation: boolean;
    biometricAuth: boolean;
    zeroTrustAccess: boolean;
  };

  // Data Protection
  @Column({ type: 'jsonb', nullable: true })
  dataProtection: {
    encryption: object;
    dlp: boolean; // Data Loss Prevention
    backup: object;
    archival: object;
    dataClassification: object;
    privacyControls: object;
    anonymization: boolean;
    pseudonymization: boolean;
  };

  // Industrial Control Systems Security
  @Column({ type: 'jsonb', nullable: true })
  icsSecurity: {
    scadaSecurity: boolean;
    plcSecurity: boolean;
    hmiSecurity: boolean;
    industrialFirewall: boolean;
    protocolSecurity: object[];
    airGap: boolean;
    fieldDeviceSecurity: boolean;
  };

  // IoT and Edge Security
  @Column({ type: 'jsonb', nullable: true })
  iotSecurity: {
    deviceAuthentication: boolean;
    edgeComputing: boolean;
    meshNetworks: boolean;
    deviceManagement: boolean;
    firmwareSecurity: boolean;
    communicationSecurity: boolean;
    trustAnchors: boolean;
  };

  // AI and Machine Learning Security
  @Column({ type: 'jsonb', nullable: true })
  aiSecurity: {
    modelSecurity: boolean;
    dataPrivacy: boolean;
    adversarialDefense: boolean;
    federated: boolean;
    explainableAI: boolean;
    biasDetection: boolean;
    modelVerification: boolean;
  };

  // Quantum Security
  @Column({ type: 'boolean', default: false })
  quantumSecurityEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumSecurity: {
    quantumKeyDistribution: boolean;
    postQuantumCryptography: boolean;
    quantumRandomGeneration: boolean;
    quantumEncryption: boolean;
    quantumAuthentication: boolean;
    quantumSigning: boolean;
  };

  // Blockchain Security
  @Column({ type: 'boolean', default: false })
  blockchainSecurityEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  blockchainSecurity: {
    smartContractSecurity: boolean;
    consensusProtection: boolean;
    walletSecurity: boolean;
    transactionVerification: boolean;
    immutableAudit: boolean;
    decentralizedIdentity: boolean;
  };

  // Threat Intelligence
  @Column({ type: 'jsonb', nullable: true })
  threatIntelligence: {
    feeds: string[];
    indicators: object[];
    attribution: object[];
    campaigns: object[];
    vulnerabilities: object[];
    mitreAttack: object[];
    threatHunting: boolean;
  };

  // Security Monitoring
  @Column({ type: 'jsonb', nullable: true })
  securityMonitoring: {
    siem: boolean; // Security Information and Event Management
    soar: boolean; // Security Orchestration, Automation and Response
    ueba: boolean; // User and Entity Behavior Analytics
    realTimeMonitoring: boolean;
    anomalyDetection: boolean;
    threatDetection: boolean;
    incidentResponse: boolean;
  };

  // Vulnerability Management
  @Column({ type: 'jsonb', nullable: true })
  vulnerabilityManagement: {
    scanning: boolean;
    assessment: object;
    penetrationTesting: boolean;
    redTeaming: boolean;
    bugBounty: boolean;
    patchManagement: object;
    riskAssessment: object;
  };

  // Incident Response
  @Column({ type: 'jsonb', nullable: true })
  incidentResponse: {
    playbooks: string[];
    team: object[];
    procedures: object[];
    communication: object;
    forensics: boolean;
    containment: object;
    recovery: object;
    lessonsLearned: object[];
  };

  // Security Awareness and Training
  @Column({ type: 'jsonb', nullable: true })
  securityTraining: {
    programs: string[];
    phishing: boolean;
    socialEngineering: boolean;
    compliance: object[];
    certifications: string[];
    metrics: object;
    simulations: boolean;
  };

  // Compliance and Governance
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    frameworks: string[];
    audits: object[];
    assessments: object[];
    certifications: string[];
    policies: string[];
    procedures: string[];
    metrics: object;
  };

  // Risk Management
  @Column({ type: 'jsonb', nullable: true })
  riskManagement: {
    riskRegister: object[];
    assessments: object[];
    mitigation: object[];
    monitoring: object;
    reporting: object;
    treatment: object[];
    appetite: object;
  };

  // Security Metrics and KPIs
  @Column({ type: 'jsonb', nullable: true })
  securityMetrics: {
    incidents: number;
    vulnerabilities: number;
    patchingRate: number;
    trainingCompletion: number;
    complianceScore: number;
    riskScore: number;
    maturityLevel: number;
  };

  // Active Threats and Incidents
  @Column({ type: 'jsonb', nullable: true })
  activeThreats: {
    threats: object[];
    incidents: object[];
    alerts: object[];
    investigations: object[];
    remediation: object[];
  };

  // Security Automation
  @Column({ type: 'jsonb', nullable: true })
  securityAutomation: {
    orchestration: boolean;
    playbooks: string[];
    workflows: object[];
    integration: object[];
    aiMl: boolean;
    responseAutomation: boolean;
  };

  // Business Continuity
  @Column({ type: 'jsonb', nullable: true })
  businessContinuity: {
    drp: boolean; // Disaster Recovery Plan
    bcp: boolean; // Business Continuity Plan
    backup: object;
    recovery: object;
    testing: object[];
    rto: number; // Recovery Time Objective
    rpo: number; // Recovery Point Objective
  };

  // Vendor and Third-Party Security
  @Column({ type: 'jsonb', nullable: true })
  vendorSecurity: {
    assessments: object[];
    contracts: object[];
    monitoring: boolean;
    riskManagement: object;
    compliance: object[];
    incidents: object[];
  };

  // Security Budget and Costs
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  annualSecurityBudget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  incidentCosts: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  complianceCosts: number;

  @Column({ type: 'jsonb', nullable: true })
  securityROI: {
    investments: number;
    avoidedCosts: number;
    productivity: number;
    reputation: number;
    compliance: number;
    roi: number;
  };

  // Security Architecture
  @Column({ type: 'jsonb', nullable: true })
  securityArchitecture: {
    principles: string[];
    patterns: string[];
    controls: object[];
    frameworks: string[];
    standards: string[];
    reference: object;
  };

  // Emerging Technologies Security
  @Column({ type: 'jsonb', nullable: true })
  emergingTechSecurity: {
    quantumComputing: boolean;
    artificialIntelligence: boolean;
    blockchain: boolean;
    iot: boolean;
    edge: boolean;
    cloud: boolean;
    containers: boolean;
    serverless: boolean;
  };

  // Security Culture
  @Column({ type: 'jsonb', nullable: true })
  securityCulture: {
    awareness: number; // percentage
    engagement: number; // percentage
    training: object;
    communication: object;
    leadership: object;
    metrics: object;
  };

  // Relationships
  @Column({ nullable: true })
  workCenterId: string;

  @ManyToOne(() => WorkCenter)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  @Column({ length: 100, nullable: true })
  lastAuditedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastAuditedAt: Date;

  // Methods
  getSecurityScore(): number {
    if (!this.securityMetrics) return 50;

    const metrics = this.securityMetrics;
    const weights = {
      complianceScore: 0.25,
      riskScore: 0.25,
      maturityLevel: 0.2,
      patchingRate: 0.15,
      trainingCompletion: 0.15,
    };

    let score = 0;
    score += (metrics.complianceScore || 0) * weights.complianceScore;
    score += (100 - (metrics.riskScore || 0)) * weights.riskScore; // Lower risk = higher score
    score += (metrics.maturityLevel || 0) * weights.maturityLevel;
    score += (metrics.patchingRate || 0) * weights.patchingRate;
    score += (metrics.trainingCompletion || 0) * weights.trainingCompletion;

    return Math.min(100, Math.max(0, score));
  }

  assessRiskLevel(): ThreatLevel {
    const activeIncidents = this.activeThreats?.incidents?.length || 0;
    const vulnerabilities = this.securityMetrics?.vulnerabilities || 0;
    const complianceScore = this.securityMetrics?.complianceScore || 100;

    if (activeIncidents > 5 || vulnerabilities > 20 || complianceScore < 60) {
      return ThreatLevel.CRITICAL;
    }
    if (activeIncidents > 3 || vulnerabilities > 10 || complianceScore < 70) {
      return ThreatLevel.SEVERE;
    }
    if (activeIncidents > 1 || vulnerabilities > 5 || complianceScore < 80) {
      return ThreatLevel.HIGH;
    }
    if (activeIncidents > 0 || vulnerabilities > 2 || complianceScore < 90) {
      return ThreatLevel.MODERATE;
    }
    if (vulnerabilities > 0 || complianceScore < 95) {
      return ThreatLevel.LOW;
    }
    return ThreatLevel.MINIMAL;
  }

  detectThreat(threatData: object): boolean {
    if (!this.securityMonitoring?.threatDetection) {
      return false;
    }

    const threat = {
      id: `THREAT-${Date.now()}`,
      timestamp: new Date(),
      severity: (threatData as any).severity || 'medium',
      type: (threatData as any).type || 'unknown',
      source: (threatData as any).source || 'automated',
      indicators: (threatData as any).indicators || [],
      status: 'detected',
    };

    if (!this.activeThreats) {
      this.activeThreats = { threats: [], incidents: [], alerts: [], investigations: [], remediation: [] };
    }

    this.activeThreats.threats.push(threat);

    // Update threat level
    this.currentThreatLevel = this.assessRiskLevel();

    return true;
  }

  createIncident(incidentData: object): string {
    const incident = {
      id: `INC-${Date.now()}`,
      timestamp: new Date(),
      status: IncidentStatus.DETECTED,
      severity: (incidentData as any).severity || 'medium',
      type: (incidentData as any).type || 'security',
      description: (incidentData as any).description || 'Security incident detected',
      assignedTo: (incidentData as any).assignedTo || null,
      response: [],
      timeline: [
        {
          timestamp: new Date(),
          action: 'incident_created',
          details: 'Security incident automatically created',
        }
      ],
    };

    if (!this.activeThreats) {
      this.activeThreats = { threats: [], incidents: [], alerts: [], investigations: [], remediation: [] };
    }

    this.activeThreats.incidents.push(incident);

    return incident.id;
  }

  respondToIncident(incidentId: string, responseAction: object): boolean {
    if (!this.activeThreats?.incidents) return false;

    const incident = this.activeThreats.incidents.find((inc: any) => inc.id === incidentId);
    if (!incident) return false;

    (incident as any).response.push({
      timestamp: new Date(),
      action: (responseAction as any).action || 'response',
      details: (responseAction as any).details || 'Response action taken',
      performedBy: (responseAction as any).performedBy || 'system',
    });

    (incident as any).timeline.push({
      timestamp: new Date(),
      action: 'response_action',
      details: `Response action: ${(responseAction as any).action}`,
    });

    return true;
  }

  runVulnerabilityAssessment(): object {
    const assessment = {
      timestamp: new Date(),
      scanType: 'comprehensive',
      vulnerabilities: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      },
      recommendations: [],
    };

    // Simulate vulnerability detection
    const mockVulnerabilities = [
      { severity: 'high', type: 'unpatched_software', cvss: 8.2 },
      { severity: 'medium', type: 'weak_password', cvss: 5.5 },
      { severity: 'low', type: 'information_disclosure', cvss: 3.1 },
    ];

    assessment.vulnerabilities = mockVulnerabilities;
    assessment.summary.high = 1;
    assessment.summary.medium = 1;
    assessment.summary.low = 1;
    assessment.summary.total = 3;

    assessment.recommendations = [
      'Update software to latest versions',
      'Implement stronger password policies',
      'Configure proper information handling',
    ];

    // Update metrics
    if (this.securityMetrics) {
      this.securityMetrics.vulnerabilities = assessment.summary.total;
    }

    return assessment;
  }

  implementQuantumSecurity(): boolean {
    if (this.quantumSecurityEnabled) return true;

    this.quantumSecurity = {
      quantumKeyDistribution: true,
      postQuantumCryptography: true,
      quantumRandomGeneration: true,
      quantumEncryption: true,
      quantumAuthentication: true,
      quantumSigning: true,
    };

    this.quantumSecurityEnabled = true;
    this.securityLevel = SecurityLevel.QUANTUM_SECURE;

    return true;
  }

  enableBlockchainSecurity(): boolean {
    if (this.blockchainSecurityEnabled) return true;

    this.blockchainSecurity = {
      smartContractSecurity: true,
      consensusProtection: true,
      walletSecurity: true,
      transactionVerification: true,
      immutableAudit: true,
      decentralizedIdentity: true,
    };

    this.blockchainSecurityEnabled = true;

    return true;
  }

  conductSecurityTraining(trainingType: string, participants: string[]): object {
    const training = {
      id: `TRAIN-${Date.now()}`,
      type: trainingType,
      participants: participants,
      startDate: new Date(),
      duration: 2, // hours
      completion: 0,
      effectiveness: 0,
      feedback: [],
    };

    if (!this.securityTraining) {
      this.securityTraining = {
        programs: [],
        phishing: false,
        socialEngineering: false,
        compliance: [],
        certifications: [],
        metrics: {},
        simulations: false,
      };
    }

    this.securityTraining.programs.push(training.id);

    return training;
  }

  calculateComplianceScore(): number {
    if (!this.compliance) return 0;

    const frameworks = this.compliance.frameworks || [];
    const audits = this.compliance.audits || [];
    const certifications = this.compliance.certifications || [];

    let score = 0;
    score += frameworks.length * 20; // 20 points per framework
    score += audits.length * 15; // 15 points per audit
    score += certifications.length * 25; // 25 points per certification

    // Deduct points for failed audits
    const failedAudits = audits.filter((audit: any) => audit.result === 'failed');
    score -= failedAudits.length * 30;

    return Math.min(100, Math.max(0, score));
  }

  generateSecurityReport(): object {
    return {
      securityCode: this.securityCode,
      securityName: this.securityName,
      securityLevel: this.securityLevel,
      threatLevel: this.currentThreatLevel,
      securityScore: this.getSecurityScore(),
      complianceScore: this.calculateComplianceScore(),
      activeThreats: this.activeThreats?.threats?.length || 0,
      activeIncidents: this.activeThreats?.incidents?.length || 0,
      vulnerabilities: this.securityMetrics?.vulnerabilities || 0,
      capabilities: {
        quantum: this.quantumSecurityEnabled,
        blockchain: this.blockchainSecurityEnabled,
        ai: !!this.aiSecurity,
        iot: !!this.iotSecurity,
        ics: !!this.icsSecurity,
      },
      metrics: this.securityMetrics,
      compliance: this.compliance,
      lastAudit: this.lastAuditedAt,
      budget: this.annualSecurityBudget,
      roi: this.securityROI,
      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.getSecurityScore() < 70) {
      recommendations.push('Improve overall security posture');
    }

    if (!this.quantumSecurityEnabled && this.securityLevel === SecurityLevel.CRITICAL) {
      recommendations.push('Consider implementing quantum security');
    }

    if (!this.blockchainSecurityEnabled) {
      recommendations.push('Evaluate blockchain security implementation');
    }

    if (this.currentThreatLevel === ThreatLevel.HIGH || this.currentThreatLevel === ThreatLevel.CRITICAL) {
      recommendations.push('Address high-priority security threats immediately');
    }

    if (this.calculateComplianceScore() < 80) {
      recommendations.push('Improve compliance framework implementation');
    }

    if (this.securityMetrics?.vulnerabilities && this.securityMetrics.vulnerabilities > 5) {
      recommendations.push('Implement comprehensive vulnerability management');
    }

    return recommendations;
  }

  auditSecurity(auditorId: string): object {
    const audit = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date(),
      auditor: auditorId,
      scope: 'comprehensive',
      findings: [],
      recommendations: [],
      score: this.getSecurityScore(),
      status: 'completed',
    };

    // Simulate audit findings
    if (this.getSecurityScore() < 80) {
      audit.findings.push('Security controls need strengthening');
    }

    if (!this.securityTraining?.programs?.length) {
      audit.findings.push('Security awareness training insufficient');
    }

    this.lastAuditedBy = auditorId;
    this.lastAuditedAt = new Date();

    return audit;
  }

  updateSecurityMetrics(metrics: object): void {
    this.securityMetrics = {
      ...this.securityMetrics,
      ...metrics,
    };

    // Update threat level based on new metrics
    this.currentThreatLevel = this.assessRiskLevel();
  }

  clone(newSecurityCode: string): Partial<Cybersecurity> {
    return {
      securityCode: newSecurityCode,
      securityName: `${this.securityName} (Copy)`,
      description: this.description,
      securityLevel: this.securityLevel,
      complianceFramework: this.complianceFramework,
      workCenterId: this.workCenterId,
      securityInfrastructure: this.securityInfrastructure,
      securityArchitecture: this.securityArchitecture,
      currentThreatLevel: ThreatLevel.LOW,
    };
  }
}
