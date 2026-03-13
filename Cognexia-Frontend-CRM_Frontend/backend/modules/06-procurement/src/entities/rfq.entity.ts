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

// Enums for RFQ Management
export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNDER_EVALUATION = 'under_evaluation',
  EVALUATION_COMPLETE = 'evaluation_complete',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ON_HOLD = 'on_hold'
}

export enum RFQType {
  STANDARD = 'standard',
  COMPETITIVE = 'competitive',
  SOLE_SOURCE = 'sole_source',
  EMERGENCY = 'emergency',
  FRAMEWORK = 'framework',
  REVERSE_AUCTION = 'reverse_auction',
  TWO_STAGE = 'two_stage',
  NEGOTIATED = 'negotiated'
}

export enum BidStatus {
  INVITED = 'invited',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  CLARIFICATION_REQUESTED = 'clarification_requested',
  CLARIFICATION_RECEIVED = 'clarification_received',
  SHORTLISTED = 'shortlisted',
  AWARDED = 'awarded',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum EvaluationCriteria {
  PRICE = 'price',
  TECHNICAL = 'technical',
  EXPERIENCE = 'experience',
  QUALITY = 'quality',
  DELIVERY = 'delivery',
  SUSTAINABILITY = 'sustainability',
  INNOVATION = 'innovation',
  COMPLIANCE = 'compliance',
  RISK = 'risk',
  SUPPORT = 'support'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
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
export interface RFQRequirements {
  functional: Array<{
    id: string;
    requirement: string;
    priority: 'mandatory' | 'desirable' | 'optional';
    weight: number;
    evaluationCriteria: string[];
    acceptanceCriteria: string[];
  }>;
  technical: Array<{
    id: string;
    specification: string;
    parameters: Record<string, any>;
    compliance: 'mandatory' | 'preferred' | 'optional';
    testingRequired: boolean;
    documentation: string[];
  }>;
  quality: {
    standards: string[];
    certifications: string[];
    testingProtocols: string[];
    qualityMetrics: Array<{
      metric: string;
      target: number;
      unit: string;
      measurement: string;
    }>;
  };
  delivery: {
    timeline: {
      startDate: Date;
      endDate: Date;
      milestones: Array<{
        name: string;
        date: Date;
        deliverables: string[];
      }>;
    };
    location: {
      deliveryAddresses: Array<{
        name: string;
        address: string;
        contactPerson: string;
        instructions: string;
      }>;
      incoterms: string;
    };
    packaging: {
      requirements: string[];
      sustainability: boolean;
      customPackaging: boolean;
    };
  };
  commercial: {
    budgetRange: {
      min: number;
      max: number;
      currency: Currency;
    };
    paymentTerms: {
      preferredTerms: string[];
      advancePayment: boolean;
      milestonePayments: boolean;
      retentionPolicy: {
        enabled: boolean;
        percentage?: number;
        duration?: number;
      };
    };
    contractTerms: {
      duration: number; // months
      renewalOptions: boolean;
      terminationClauses: string[];
      warranties: string[];
      liabilities: string[];
    };
  };
  sustainability: {
    requirements: string[];
    certifications: string[];
    reporting: string[];
    targets: Array<{
      metric: string;
      target: number;
      unit: string;
    }>;
  };
  compliance: {
    regulations: string[];
    standards: string[];
    auditing: string[];
    documentation: string[];
  };
}

export interface BidEvaluation {
  bidId: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluationDate: Date;
  scores: Array<{
    criterion: EvaluationCriteria;
    weight: number;
    score: number; // 0-100
    comments: string;
    evidence: string[];
  }>;
  technicalEvaluation: {
    overallScore: number;
    compliance: 'fully_compliant' | 'mostly_compliant' | 'partially_compliant' | 'non_compliant';
    technicalRisks: Array<{
      risk: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
    recommendations: string[];
  };
  commercialEvaluation: {
    priceScore: number;
    valueForMoney: number;
    costBreakdown: Record<string, number>;
    paymentTermsScore: number;
    commercialRisks: string[];
  };
  overallScore: number;
  ranking: number;
  recommendation: 'award' | 'shortlist' | 'clarification' | 'reject';
  comments: string;
  conditions: string[];
}

export interface SupplierBid {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  bidStatus: BidStatus;
  submissionDate: Date;
  lastModifiedDate: Date;
  
  // Pricing Information
  pricing: {
    totalPrice: number;
    currency: Currency;
    breakdown: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
    }>;
    discounts: Array<{
      type: string;
      amount: number;
      conditions: string[];
    }>;
    taxes: {
      included: boolean;
      breakdown: Record<string, number>;
    };
    validityPeriod: number; // days
  };

  // Technical Response
  technical: {
    compliance: Record<string, 'yes' | 'no' | 'partial' | 'alternative'>;
    specifications: Record<string, any>;
    alternatives: Array<{
      requirement: string;
      alternative: string;
      benefit: string;
      impact: string;
    }>;
    documentation: string[];
  };

  // Delivery Proposal
  delivery: {
    timeline: {
      startDate: Date;
      endDate: Date;
      milestones: Array<{
        name: string;
        date: Date;
        deliverables: string[];
      }>;
    };
    methodology: string;
    resources: Array<{
      type: string;
      allocation: number;
      availability: string;
    }>;
    riskMitigation: string[];
  };

  // Commercial Terms
  commercial: {
    paymentTerms: string;
    warranties: string[];
    insurance: {
      coverage: number;
      types: string[];
      provider: string;
    };
    contractTerms: {
      proposedChanges: Array<{
        clause: string;
        change: string;
        reason: string;
      }>;
      acceptedTerms: string[];
      exceptions: string[];
    };
  };

  // Evaluation Results
  evaluation: BidEvaluation[];
  finalScore: number;
  ranking: number;
  awarded: boolean;
  awardDate?: Date;
  rejectionReason?: string;

  // AI Analysis
  aiAnalysis: {
    competitiveness: number; // 0-100
    riskAssessment: {
      technical: number;
      commercial: number;
      delivery: number;
      supplier: number;
    };
    recommendationScore: number;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Communication History
  communications: Array<{
    timestamp: Date;
    type: 'clarification' | 'negotiation' | 'update' | 'notification';
    from: string;
    to: string[];
    subject: string;
    content: string;
    attachments?: string[];
  }>;

  // Documents and Attachments
  documents: string[];
  attachments: string[];
}

export interface MarketIntelligence {
  category: string;
  region: string;
  analysisDate: Date;
  
  pricing: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    priceTrends: 'increasing' | 'stable' | 'decreasing';
    competitivePosition: string;
  };
  
  suppliers: {
    totalSuppliers: number;
    activeSuppliers: number;
    newEntrants: number;
    marketLeaders: string[];
    emergingPlayers: string[];
  };
  
  demand: {
    currentDemand: 'low' | 'medium' | 'high';
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    seasonality: boolean;
    forecastedDemand: Record<string, number>;
  };
  
  risks: {
    supplyRisks: string[];
    priceVolatility: number;
    geopoliticalRisks: string[];
    technologicalDisruption: string[];
  };
  
  opportunities: {
    costReduction: string[];
    qualityImprovement: string[];
    innovation: string[];
    sustainability: string[];
  };
}

@Entity('rfqs')
@Index(['rfqNumber'])
@Index(['status'])
@Index(['rfqType'])
@Index(['priority'])
@Index(['submissionDeadline'])
@Index(['totalBudget'])
@Index(['createdBy'])
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  rfqNumber: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: RFQStatus,
    default: RFQStatus.DRAFT
  })
  status: RFQStatus;

  @Column({
    type: 'enum',
    enum: RFQType,
    default: RFQType.STANDARD
  })
  rfqType: RFQType;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM
  })
  priority: Priority;

  // Timeline Management
  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'timestamp' })
  submissionDeadline: Date;

  @Column({ type: 'timestamp' })
  evaluationDeadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  awardDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualPublishDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEvaluationComplete: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualAwardDate: Date;

  // Budget and Financial
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalBudget: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reservePrice: number;

  // Requirements and Specifications
  @Column({ type: 'jsonb' })
  requirements: RFQRequirements;

  @Column({ type: 'text', array: true, default: [] })
  categories: string[];

  @Column({ type: 'text', array: true, default: [] })
  commodities: string[];

  // Supplier Management
  @Column({ type: 'text', array: true, default: [] })
  invitedSuppliers: string[];

  @Column({ type: 'int', default: 0 })
  invitedCount: number;

  @Column({ type: 'int', default: 0 })
  submittedCount: number;

  @Column({ type: 'int', default: 0 })
  evaluatedCount: number;

  // Bid Management
  @Column({ type: 'jsonb', nullable: true })
  bids: SupplierBid[];

  @Column({ length: 100, nullable: true })
  awardedSupplierId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  awardedValue: number;

  // Evaluation Configuration
  @Column({ type: 'jsonb' })
  evaluationCriteria: Array<{
    criterion: EvaluationCriteria;
    weight: number;
    description: string;
    scoringMethod: 'linear' | 'threshold' | 'qualitative';
    parameters: Record<string, any>;
  }>;

  @Column({ type: 'text', array: true, default: [] })
  evaluators: string[];

  @Column({ type: 'boolean', default: false })
  blindEvaluation: boolean;

  @Column({ type: 'boolean', default: false })
  consensusRequired: boolean;

  // AI and Analytics
  @Column({ type: 'jsonb', nullable: true })
  marketIntelligence: MarketIntelligence;

  @Column({ type: 'jsonb', nullable: true })
  aiRecommendations: {
    supplierRecommendations: Array<{
      supplierId: string;
      score: number;
      reasons: string[];
    }>;
    budgetOptimization: {
      recommendedBudget: number;
      confidenceLevel: number;
      factors: string[];
    };
    timelineOptimization: {
      recommendedTimeline: {
        submission: Date;
        evaluation: Date;
        award: Date;
      };
      risks: string[];
    };
    requirementOptimization: string[];
  };

  // Process Configuration
  @Column({ type: 'jsonb', nullable: true })
  processConfiguration: {
    allowClarifications: boolean;
    clarificationDeadline?: Date;
    allowAlternatives: boolean;
    requireTechnicalProposal: boolean;
    requireFinancialProposal: boolean;
    multipleAwards: boolean;
    negotiationAllowed: boolean;
    priceVisibility: 'hidden' | 'ranking' | 'full';
  };

  // Communication and Collaboration
  @Column({ type: 'jsonb', nullable: true })
  communications: Array<{
    id: string;
    timestamp: Date;
    type: 'announcement' | 'clarification' | 'amendment' | 'reminder' | 'award';
    recipients: string[];
    subject: string;
    content: string;
    attachments?: string[];
    acknowledgments: Array<{
      supplierId: string;
      acknowledged: boolean;
      timestamp?: Date;
    }>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  clarifications: Array<{
    id: string;
    supplierId: string;
    question: string;
    answer: string;
    timestamp: Date;
    answeredBy: string;
    answeredDate?: Date;
    public: boolean;
  }>;

  // Amendments and Changes
  @Column({ type: 'jsonb', nullable: true })
  amendments: Array<{
    amendmentNumber: number;
    date: Date;
    description: string;
    changes: Array<{
      section: string;
      oldValue: string;
      newValue: string;
      reason: string;
    }>;
    impactAssessment: {
      timeline: boolean;
      budget: boolean;
      requirements: boolean;
      suppliers: boolean;
    };
    notifiedSuppliers: string[];
    amendedBy: string;
  }>;

  // Document Management
  @Column({ type: 'text', array: true, default: [] })
  documentPaths: string[];

  @Column({ type: 'text', array: true, default: [] })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  documentRequirements: Array<{
    name: string;
    description: string;
    mandatory: boolean;
    format: string[];
    maxSize: number;
    template?: string;
  }>;

  // Security and Access
  @Column({ type: 'text', array: true, default: [] })
  accessControlList: string[];

  @Column({ type: 'boolean', default: false })
  confidential: boolean;

  @Column({ type: 'text', array: true, default: [] })
  ndaRequired: string[];

  // Analytics and Reporting
  @Column({ type: 'jsonb', nullable: true })
  analytics: {
    views: number;
    downloads: number;
    bidInterest: number;
    averageResponseTime: number;
    competitionLevel: 'low' | 'medium' | 'high';
    marketResponse: 'poor' | 'adequate' | 'good' | 'excellent';
  };

  // Integration and External Systems
  @Column({ type: 'jsonb', nullable: true })
  externalIntegrations: {
    erp?: {
      system: string;
      rfqId: string;
      lastSync: Date;
    };
    sourcing?: {
      platform: string;
      campaignId: string;
      lastSync: Date;
    };
    approval?: {
      system: string;
      workflowId: string;
      status: string;
    };
  };

  // Tags and Categorization
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Workflow and Approval
  @Column({ type: 'jsonb', nullable: true })
  workflowState: {
    currentStep: string;
    completedSteps: string[];
    pendingSteps: string[];
    assignedTo: string[];
    dueDate?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  approvalHistory: Array<{
    step: string;
    approver: string;
    decision: 'approved' | 'rejected' | 'returned';
    timestamp: Date;
    comments: string;
  }>;

  // Audit and History
  @Column({ length: 100 })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  lastModifiedBy: string;

  @Column({ length: 100, nullable: true })
  publishedBy: string;

  @Column({ length: 100, nullable: true })
  awardedBy: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  lastModifiedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAnalysisUpdate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMarketUpdate: Date;

  // Status flags
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emergencyProcurement: boolean;

  @Column({ type: 'boolean', default: false })
  strategicRFQ: boolean;

  @Column({ type: 'boolean', default: false })
  publicRFQ: boolean;

  // Lifecycle hooks
  @BeforeInsert()
  generateRFQNumber() {
    if (!this.rfqNumber) {
      const prefix = 'RFQ';
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      this.rfqNumber = `${prefix}-${year}-${timestamp}-${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateCounts() {
    if (this.bids) {
      this.submittedCount = this.bids.filter(bid => bid.bidStatus === BidStatus.SUBMITTED).length;
      this.evaluatedCount = this.bids.filter(bid => 
        bid.evaluation && bid.evaluation.length > 0
      ).length;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    const now = new Date();
    
    if (this.submissionDeadline <= now && this.status === RFQStatus.DRAFT) {
      throw new Error('Submission deadline cannot be in the past for draft RFQ');
    }

    if (this.evaluationDeadline <= this.submissionDeadline) {
      throw new Error('Evaluation deadline must be after submission deadline');
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateAnalytics() {
    if (!this.analytics) {
      this.analytics = {
        views: 0,
        downloads: 0,
        bidInterest: 0,
        averageResponseTime: 0,
        competitionLevel: 'medium',
        marketResponse: 'adequate',
      };
    }

    // Update competition level based on bid count
    if (this.submittedCount >= 5) {
      this.analytics.competitionLevel = 'high';
    } else if (this.submittedCount >= 3) {
      this.analytics.competitionLevel = 'medium';
    } else {
      this.analytics.competitionLevel = 'low';
    }

    // Update market response
    const responseRate = this.invitedCount > 0 ? (this.submittedCount / this.invitedCount) * 100 : 0;
    if (responseRate >= 80) {
      this.analytics.marketResponse = 'excellent';
    } else if (responseRate >= 60) {
      this.analytics.marketResponse = 'good';
    } else if (responseRate >= 40) {
      this.analytics.marketResponse = 'adequate';
    } else {
      this.analytics.marketResponse = 'poor';
    }
  }

  // Helper methods
  getDaysToDeadline(): number {
    const now = new Date();
    const deadline = new Date(this.submissionDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isExpired(): boolean {
    return new Date() > new Date(this.submissionDeadline);
  }

  getResponseRate(): number {
    return this.invitedCount > 0 ? (this.submittedCount / this.invitedCount) * 100 : 0;
  }

  getBudgetUtilization(): number {
    if (!this.awardedValue || this.totalBudget <= 0) return 0;
    return (this.awardedValue / this.totalBudget) * 100;
  }

  getRFQSummary(): string {
    return `${this.rfqType} RFQ for ${this.title} - Budget: ${this.currency} ${this.totalBudget.toLocaleString()} (${this.status})`;
  }

  canBePublished(): boolean {
    return this.status === RFQStatus.DRAFT && 
           this.requirements && 
           this.evaluationCriteria?.length > 0 &&
           this.invitedSuppliers?.length > 0 &&
           this.submissionDeadline > new Date();
  }

  canBeEvaluated(): boolean {
    return this.status === RFQStatus.PUBLISHED && 
           this.submittedCount > 0 &&
           new Date() >= new Date(this.submissionDeadline);
  }

  getWinningBid(): SupplierBid | undefined {
    return this.bids?.find(bid => bid.awarded === true);
  }

  getAverageScore(): number {
    if (!this.bids || this.bids.length === 0) return 0;
    const totalScore = this.bids.reduce((sum, bid) => sum + (bid.finalScore || 0), 0);
    return totalScore / this.bids.length;
  }

  getCompetitiveAnalysis(): {
    priceRange: { min: number; max: number };
    averagePrice: number;
    priceSpread: number;
    qualityRange: { min: number; max: number };
    recommendedChoice: string;
  } {
    if (!this.bids || this.bids.length === 0) {
      return {
        priceRange: { min: 0, max: 0 },
        averagePrice: 0,
        priceSpread: 0,
        qualityRange: { min: 0, max: 0 },
        recommendedChoice: 'No bids available',
      };
    }

    const prices = this.bids.map(bid => bid.pricing.totalPrice);
    const scores = this.bids.map(bid => bid.finalScore || 0);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceSpread = ((maxPrice - minPrice) / averagePrice) * 100;

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    const bestBid = this.bids.reduce((best, current) => 
      (current.finalScore || 0) > (best.finalScore || 0) ? current : best
    );

    return {
      priceRange: { min: minPrice, max: maxPrice },
      averagePrice,
      priceSpread,
      qualityRange: { min: minScore, max: maxScore },
      recommendedChoice: `${bestBid.supplierName} with score ${bestBid.finalScore}`,
    };
  }
}
