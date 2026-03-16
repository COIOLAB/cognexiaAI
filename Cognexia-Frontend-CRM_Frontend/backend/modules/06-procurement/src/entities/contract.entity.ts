import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index, 
  BeforeInsert, 
  BeforeUpdate,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Supplier } from './supplier.entity';

// Enums for Contract Management
export enum ContractStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

export enum ContractType {
  MASTER_SERVICES = 'master_services',
  PURCHASE_ORDER = 'purchase_order',
  BLANKET_ORDER = 'blanket_order',
  FRAMEWORK = 'framework',
  SLA = 'sla',
  NDA = 'nda',
  CONSULTING = 'consulting',
  LICENSING = 'licensing',
  MAINTENANCE = 'maintenance',
  SUBSCRIPTION = 'subscription'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  UNDER_REVIEW = 'under_review',
  REQUIRES_ACTION = 'requires_action'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONALLY_APPROVED = 'conditionally_approved'
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  IMMEDIATE = 'immediate',
  ADVANCE = 'advance',
  MILESTONE_BASED = 'milestone_based',
  PERFORMANCE_BASED = 'performance_based'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
  CNY = 'CNY',
  INR = 'INR'
}

// Complex embedded types
export interface ContractTerms {
  duration: {
    startDate: Date;
    endDate: Date;
    autoRenewal: boolean;
    renewalPeriod?: number; // in months
    noticePeriod: number; // days before expiry
  };
  pricing: {
    totalValue: number;
    currency: Currency;
    structure: 'fixed' | 'variable' | 'tiered' | 'cost_plus' | 'performance_based';
    escalationClause: boolean;
    escalationRate?: number;
    discounts?: Array<{
      type: 'volume' | 'early_payment' | 'loyalty' | 'seasonal';
      threshold: number;
      rate: number;
    }>;
  };
  deliverables: Array<{
    id: string;
    name: string;
    description: string;
    deliveryDate: Date;
    milestones?: Array<{
      name: string;
      date: Date;
      percentage: number;
      paymentTrigger: boolean;
    }>;
    acceptanceCriteria: string[];
    penalties?: {
      lateDelivery: number;
      qualityIssues: number;
    };
  }>;
  sla: {
    responseTime: number; // hours
    resolutionTime: number; // hours
    availabilityTarget: number; // percentage
    performanceMetrics: Array<{
      metric: string;
      target: number;
      unit: string;
      measurement: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    }>;
    penalties: {
      availabilityBelow: Array<{
        threshold: number;
        penalty: number;
      }>;
      performanceBelow: Array<{
        metric: string;
        threshold: number;
        penalty: number;
      }>;
    };
  };
  termination: {
    forCause: {
      allowed: boolean;
      noticePeriod: number; // days
      conditions: string[];
    };
    forConvenience: {
      allowed: boolean;
      noticePeriod: number; // days
      terminationFee?: number;
    };
  };
  intellectual_property: {
    ownership: 'client' | 'supplier' | 'shared';
    licenseGrants: string[];
    restrictions: string[];
    warranties: string[];
  };
  confidentiality: {
    duration: number; // years
    exceptions: string[];
    returnRequirements: string[];
  };
  liability: {
    limitation: {
      enabled: boolean;
      amount?: number;
      exclusions: string[];
    };
    indemnification: {
      mutual: boolean;
      scope: string[];
    };
    insurance: {
      required: boolean;
      minimumCoverage?: number;
      types: string[];
    };
  };
  governance: {
    meetingFrequency: 'weekly' | 'monthly' | 'quarterly' | 'as_needed';
    reportingRequirements: string[];
    escalationProcedures: Array<{
      level: number;
      role: string;
      timeframe: number; // hours
    }>;
    changeManagement: {
      process: string;
      approvalRequired: boolean;
      documentationRequired: boolean;
    };
  };
}

export interface ContractMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  deliverables: string[];
  paymentPercentage?: number;
  dependencies: string[];
  risks: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

export interface ContractPerformance {
  overall: {
    score: number; // 0-100
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: Date;
  };
  sla: {
    availability: number;
    responseTime: number;
    resolutionTime: number;
    qualityScore: number;
    complianceRate: number;
  };
  financial: {
    budgetVariance: number; // percentage
    invoiceAccuracy: number; // percentage
    paymentTimeliness: number; // percentage
    costSavings: number; // actual amount
  };
  delivery: {
    onTimeDelivery: number; // percentage
    qualityRating: number; // 1-5 scale
    milestoneCompletion: number; // percentage
    changeRequestRate: number; // percentage
  };
  relationship: {
    satisfactionScore: number; // 1-5 scale
    communicationEffectiveness: number; // 1-5 scale
    collaborationLevel: number; // 1-5 scale
    issueResolutionTime: number; // hours average
  };
}

export interface AIContractInsights {
  riskAnalysis: {
    overallRiskScore: number;
    riskFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      likelihood: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
    complianceRisks: string[];
    financialRisks: string[];
    operationalRisks: string[];
  };
  optimization: {
    costSavingOpportunities: Array<{
      area: string;
      potentialSaving: number;
      implementation: string;
      effort: 'low' | 'medium' | 'high';
    }>;
    termOptimization: Array<{
      clause: string;
      currentTerm: string;
      suggestedTerm: string;
      benefit: string;
    }>;
    performanceImprovements: string[];
  };
  predictions: {
    renewalProbability: number; // percentage
    performanceForecast: {
      nextQuarter: number;
      nextYear: number;
    };
    riskTrend: 'improving' | 'stable' | 'deteriorating';
    recommendedActions: string[];
  };
  marketComparison: {
    pricingPosition: 'below_market' | 'market_rate' | 'above_market';
    termComparison: 'favorable' | 'standard' | 'unfavorable';
    suggestionScore: number;
    benchmarkData: {
      averageValue: number;
      averageDuration: number;
      commonTerms: string[];
    };
  };
}

export interface BlockchainIntegration {
  enabled: boolean;
  contractHash?: string;
  smartContractAddress?: string;
  transactionHistory: Array<{
    transactionId: string;
    timestamp: Date;
    type: 'creation' | 'amendment' | 'milestone' | 'payment' | 'completion';
    details: Record<string, any>;
    verified: boolean;
  }>;
  immutableClauses: string[]; // Clauses that cannot be changed
  autoExecutionRules: Array<{
    trigger: string;
    condition: string;
    action: string;
    status: 'active' | 'inactive' | 'triggered';
  }>;
}

export interface ComplianceTracking {
  regulations: Array<{
    name: string;
    jurisdiction: string;
    requirements: string[];
    complianceLevel: ComplianceStatus;
    lastAudit: Date;
    nextReview: Date;
    documents: string[];
  }>;
  certifications: Array<{
    name: string;
    issuingBody: string;
    validFrom: Date;
    validTo: Date;
    status: 'active' | 'expired' | 'pending_renewal';
    documentPath: string;
  }>;
  auditTrail: Array<{
    timestamp: Date;
    user: string;
    action: string;
    section: string;
    oldValue?: string;
    newValue?: string;
    reason: string;
  }>;
  riskAssessment: {
    lastAssessed: Date;
    nextAssessment: Date;
    overallRisk: RiskLevel;
    categories: Array<{
      category: string;
      risk: RiskLevel;
      factors: string[];
      mitigation: string[];
    }>;
  };
}

@Entity('contracts')
@Index(['contractNumber'])
@Index(['supplierId'])
@Index(['status'])
@Index(['contractType'])
@Index(['expiryDate'])
@Index(['totalValue'])
@Index(['riskLevel'])
@Index(['complianceStatus'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  contractNumber: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT
  })
  status: ContractStatus;

  @Column({
    type: 'enum',
    enum: ContractType
  })
  contractType: ContractType;

  // Supplier relationship
  @Column({ nullable: false })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.contracts, { eager: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  // Contract Dates
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  lastRenewalDate: Date;

  // Financial Information
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  paymentTerms: PaymentTerms;

  // Contract Management
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING
  })
  approvalStatus: ApprovalStatus;

  @Column({ length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate: Date;

  @Column({ length: 100, nullable: true })
  contractOwner: string;

  @Column({ length: 100, nullable: true })
  businessOwner: string;

  @Column({ length: 100, nullable: true })
  legalContact: string;

  // Risk and Compliance
  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM
  })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.UNDER_REVIEW
  })
  complianceStatus: ComplianceStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  complianceScore: number;

  // Contract Terms (JSON)
  @Column({ type: 'jsonb' })
  terms: ContractTerms;

  // Performance and Insights
  @Column({ type: 'jsonb', nullable: true })
  milestones: ContractMilestone[];

  @Column({ type: 'jsonb', nullable: true })
  performance: ContractPerformance;

  @Column({ type: 'jsonb', nullable: true })
  aiInsights: AIContractInsights;

  // Blockchain Integration
  @Column({ type: 'jsonb', nullable: true })
  blockchainData: BlockchainIntegration;

  // Compliance and Audit
  @Column({ type: 'jsonb', nullable: true })
  complianceData: ComplianceTracking;

  // Document Management
  @Column({ type: 'text', array: true, default: [] })
  documentPaths: string[];

  @Column({ type: 'text', array: true, default: [] })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  documentVersions: Array<{
    version: string;
    path: string;
    uploadedBy: string;
    uploadedDate: Date;
    changes: string;
  }>;

  // Communication and Collaboration
  @Column({ type: 'jsonb', nullable: true })
  communications: Array<{
    id: string;
    timestamp: Date;
    type: 'email' | 'meeting' | 'call' | 'document' | 'notification';
    participants: string[];
    subject: string;
    content: string;
    attachments?: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  changeRequests: Array<{
    id: string;
    requestDate: Date;
    requestedBy: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
    approvedBy?: string;
    approvedDate?: Date;
    implementedDate?: Date;
    cost?: number;
  }>;

  // Notifications and Alerts
  @Column({ type: 'boolean', default: true })
  alertsEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  alertSettings: {
    expiryWarning: number; // days before expiry
    milestoneReminders: boolean;
    performanceAlerts: boolean;
    complianceAlerts: boolean;
    renewalReminders: number; // days before renewal
  };

  @Column({ type: 'jsonb', nullable: true })
  activeAlerts: Array<{
    id: string;
    type: 'expiry' | 'milestone' | 'performance' | 'compliance' | 'renewal';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    createdDate: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedDate?: Date;
  }>;

  // Integration and External Systems
  @Column({ type: 'jsonb', nullable: true })
  externalIntegrations: {
    erp?: {
      system: string;
      contractId: string;
      lastSync: Date;
    };
    legal?: {
      system: string;
      contractId: string;
      lastSync: Date;
    };
    financial?: {
      system: string;
      contractId: string;
      lastSync: Date;
    };
  };

  // Tags and Categories
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'text', array: true, default: [] })
  categories: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Workflow and Process
  @Column({ type: 'jsonb', nullable: true })
  workflowState: {
    currentStep: string;
    completedSteps: string[];
    pendingSteps: string[];
    assignedTo: string[];
    dueDate?: Date;
  };

  // Audit and History
  @Column({ length: 100 })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  lastModifiedBy: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  lastModifiedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastPerformanceUpdate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRiskAssessment: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastComplianceCheck: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAIAnalysis: Date;

  // Status flags
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  autoRenewal: boolean;

  @Column({ type: 'boolean', default: false })
  criticalContract: boolean;

  @Column({ type: 'boolean', default: false })
  masterAgreement: boolean;

  @Column({ type: 'boolean', default: false })
  hasSubcontracts: boolean;

  // Lifecycle hooks
  @BeforeInsert()
  generateContractNumber() {
    if (!this.contractNumber) {
      const prefix = this.contractType.toUpperCase().slice(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.contractNumber = `${prefix}-${timestamp}-${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateAmounts() {
    this.remainingAmount = this.totalValue - this.spentAmount;
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateDates() {
    this.lastModifiedDate = new Date();
    
    // Set expiry date if not provided
    if (!this.expiryDate && this.endDate) {
      this.expiryDate = this.endDate;
    }

    // Set next review date (quarterly by default)
    if (!this.nextReviewDate) {
      this.nextReviewDate = new Date();
      this.nextReviewDate.setMonth(this.nextReviewDate.getMonth() + 3);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateRiskScore() {
    // Basic risk calculation based on multiple factors
    let riskScore = 0;
    
    // Contract value risk
    if (this.totalValue > 1000000) riskScore += 30;
    else if (this.totalValue > 500000) riskScore += 20;
    else if (this.totalValue > 100000) riskScore += 10;

    // Duration risk
    const duration = Math.abs(new Date(this.endDate).getTime() - new Date(this.startDate).getTime());
    const years = duration / (1000 * 60 * 60 * 24 * 365);
    if (years > 3) riskScore += 20;
    else if (years > 1) riskScore += 10;

    // Contract type risk
    if (['CONSULTING', 'LICENSING'].includes(this.contractType)) riskScore += 15;
    if (['MASTER_SERVICES', 'FRAMEWORK'].includes(this.contractType)) riskScore += 10;

    // Compliance status risk
    if (this.complianceStatus === ComplianceStatus.NON_COMPLIANT) riskScore += 25;
    else if (this.complianceStatus === ComplianceStatus.REQUIRES_ACTION) riskScore += 15;

    this.riskScore = Math.min(riskScore, 100);

    // Set risk level based on score
    if (this.riskScore >= 70) this.riskLevel = RiskLevel.CRITICAL;
    else if (this.riskScore >= 50) this.riskLevel = RiskLevel.HIGH;
    else if (this.riskScore >= 30) this.riskLevel = RiskLevel.MEDIUM;
    else this.riskLevel = RiskLevel.LOW;
  }

  // Helper methods
  getDaysToExpiry(): number {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(days: number = 30): boolean {
    return this.getDaysToExpiry() <= days && this.getDaysToExpiry() > 0;
  }

  isExpired(): boolean {
    return new Date() > new Date(this.expiryDate);
  }

  getUtilizationPercentage(): number {
    return this.totalValue > 0 ? (this.spentAmount / this.totalValue) * 100 : 0;
  }

  getContractSummary(): string {
    return `${this.contractType} contract with ${this.supplier?.companyName || 'Unknown Supplier'} worth ${this.currency} ${this.totalValue.toLocaleString()} (${this.status})`;
  }

  canBeRenewed(): boolean {
    return this.autoRenewal || 
           (this.status === ContractStatus.ACTIVE && this.isExpiringSoon(90)) ||
           this.performance?.overall.score >= 80;
  }

  requiresApproval(): boolean {
    return this.totalValue > 100000 || 
           this.riskLevel === RiskLevel.HIGH || 
           this.riskLevel === RiskLevel.CRITICAL ||
           this.contractType === ContractType.MASTER_SERVICES;
  }

  getPerformanceRating(): 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor' | 'unknown' {
    if (!this.performance?.overall.score) return 'unknown';
    
    const score = this.performance.overall.score;
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }
}
