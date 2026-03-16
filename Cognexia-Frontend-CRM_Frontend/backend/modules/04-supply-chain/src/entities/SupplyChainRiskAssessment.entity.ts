import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, Min, Max } from 'class-validator';
import { Supplier } from './Supplier.entity';

export enum RiskType {
  SUPPLIER_RISK = 'supplier_risk',
  OPERATIONAL_RISK = 'operational_risk',
  FINANCIAL_RISK = 'financial_risk',
  GEOPOLITICAL_RISK = 'geopolitical_risk',
  ENVIRONMENTAL_RISK = 'environmental_risk',
  CYBER_RISK = 'cyber_risk',
  REGULATORY_RISK = 'regulatory_risk',
  QUALITY_RISK = 'quality_risk',
  LOGISTICS_RISK = 'logistics_risk',
  DEMAND_RISK = 'demand_risk',
  SUPPLY_RISK = 'supply_risk',
  TECHNOLOGY_RISK = 'technology_risk',
}

export enum RiskSeverity {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical',
}

export enum RiskProbability {
  VERY_UNLIKELY = 'very_unlikely',
  UNLIKELY = 'unlikely',
  POSSIBLE = 'possible',
  LIKELY = 'likely',
  VERY_LIKELY = 'very_likely',
  CERTAIN = 'certain',
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  ASSESSING = 'assessing',
  ACTIVE = 'active',
  MITIGATING = 'mitigating',
  MONITORING = 'monitoring',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

@Entity('supply_chain_risk_assessments')
@Index(['type', 'severity', 'status'])
@Index(['supplierId', 'status'])
@Index(['identifiedDate', 'lastReviewDate'])
@Index(['riskScore'])
@Index(['createdAt', 'updatedAt'])
export class SupplyChainRiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  riskId: string;

  @Column({ length: 200 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column({
    type: 'enum',
    enum: RiskType,
  })
  type: RiskType;

  @Column({
    type: 'enum',
    enum: RiskSeverity,
  })
  severity: RiskSeverity;

  @Column({
    type: 'enum',
    enum: RiskProbability,
  })
  probability: RiskProbability;

  @Column({
    type: 'enum',
    enum: RiskStatus,
    default: RiskStatus.IDENTIFIED,
  })
  status: RiskStatus;

  // Risk Scoring
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Min(0)
  @Max(100)
  riskScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Min(0)
  @Max(10)
  impactScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Min(0)
  @Max(10)
  likelihoodScore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedFinancialImpact: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Risk Context
  @Column('uuid', { nullable: true })
  supplierId: string;

  @Column({ type: 'json', nullable: true })
  affectedAreas: Array<{
    area: string;
    impact: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
  }>;

  @Column({ type: 'json', nullable: true })
  affectedProducts: Array<{
    productCode: string;
    productName: string;
    impact: string;
    alternativesAvailable: boolean;
  }>;

  @Column({ type: 'json', nullable: true })
  affectedProcesses: string[];

  // Geographic and Environmental Context
  @Column({ type: 'json', nullable: true })
  geographicScope: Array<{
    country: string;
    region: string;
    facility: string;
    riskLevel: string;
  }>;

  @Column({ type: 'json', nullable: true })
  environmentalFactors: Array<{
    factor: string;
    description: string;
    severity: string;
    trend: 'improving' | 'stable' | 'worsening';
  }>;

  // AI-Enhanced Risk Analytics
  @Column({ type: 'json', nullable: true })
  aiRiskAnalysis: {
    predictiveRiskScore: number;
    riskTrend: 'increasing' | 'stable' | 'decreasing';
    seasonalFactors: Array<{
      season: string;
      riskMultiplier: number;
      historicalEvents: string[];
    }>;
    correlatedRisks: Array<{
      riskId: string;
      correlationStrength: number;
      description: string;
    }>;
    earlyWarningSignals: Array<{
      indicator: string;
      currentValue: number;
      threshold: number;
      trend: string;
    }>;
    riskPropagationMap: Array<{
      nodeId: string;
      nodeType: 'supplier' | 'product' | 'process' | 'region';
      propagationProbability: number;
      impactMagnitude: number;
    }>;
  };

  // Timeline and Progression
  @Column({ type: 'timestamp' })
  identifiedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstOccurrenceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOccurrenceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedResolutionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  // Risk Triggers and Indicators
  @Column({ type: 'json', nullable: true })
  riskTriggers: Array<{
    trigger: string;
    description: string;
    monitoringMethod: string;
    threshold: string;
    currentStatus: string;
  }>;

  @Column({ type: 'json', nullable: true })
  keyRiskIndicators: Array<{
    indicator: string;
    unit: string;
    targetValue: number;
    warningThreshold: number;
    criticalThreshold: number;
    currentValue: number;
    lastUpdated: Date;
    dataSource: string;
  }>;

  // Mitigation Strategies
  @Column({ type: 'json', nullable: true })
  mitigationStrategies: Array<{
    strategyId: string;
    name: string;
    description: string;
    type: 'preventive' | 'detective' | 'corrective' | 'directive';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'planned' | 'in_progress' | 'implemented' | 'failed';
    estimatedCost: number;
    expectedEffectiveness: number; // 0-100%
    implementationDate: Date;
    responsible: string;
    dependencies: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  contingencyPlans: Array<{
    planId: string;
    name: string;
    description: string;
    triggerConditions: string[];
    actions: Array<{
      step: number;
      action: string;
      responsible: string;
      timeframe: string;
      resources: string[];
    }>;
    alternativeSuppliers: string[];
    estimatedRecoveryTime: string;
    businessContinuityImpact: string;
  }>;

  // Historical Analysis
  @Column({ type: 'json', nullable: true })
  historicalOccurrences: Array<{
    date: Date;
    description: string;
    actualImpact: number;
    duration: string;
    rootCause: string;
    lessonsLearned: string[];
    mitigationEffectiveness: number;
  }>;

  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    detectionTime: number; // hours
    resolutionTime: number; // hours
    mitigationEffectiveness: number; // percentage
    recurrenceRate: number; // percentage
    costOfRiskMaterialization: number;
    preventionInvestment: number;
  };

  // Stakeholder Impact
  @Column({ type: 'json', nullable: true })
  stakeholderImpact: Array<{
    stakeholder: string;
    impactType: string;
    severity: string;
    communicationPlan: string;
    expectations: string[];
  }>;

  // Regulatory and Compliance
  @Column({ type: 'json', nullable: true })
  regulatoryImplications: {
    applicableRegulations: string[];
    complianceRequirements: string[];
    reportingObligations: string[];
    potentialPenalties: string[];
  };

  // Communication and Escalation
  @Column({ type: 'json', nullable: true })
  escalationMatrix: Array<{
    riskLevel: string;
    timeframe: string;
    escalationPath: Array<{
      role: string;
      person: string;
      contactInfo: string;
      requiredActions: string[];
    }>;
  }>;

  @Column({ type: 'json', nullable: true })
  communicationLog: Array<{
    date: Date;
    type: 'notification' | 'update' | 'escalation' | 'resolution';
    recipient: string;
    message: string;
    response: string;
    followUpRequired: boolean;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  identifiedBy: string;

  @Column({ length: 50, nullable: true })
  owner: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => Supplier, (supplier) => supplier.riskAssessments, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  // Computed Properties
  get riskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.riskScore <= 20) return 'low';
    if (this.riskScore <= 40) return 'medium';
    if (this.riskScore <= 70) return 'high';
    return 'critical';
  }

  get isOverdue(): boolean {
    return this.nextReviewDate ? new Date() > this.nextReviewDate : false;
  }

  get daysToNextReview(): number {
    if (!this.nextReviewDate) return 0;
    const today = new Date();
    const reviewDate = new Date(this.nextReviewDate);
    const diffTime = reviewDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get mitigationProgress(): number {
    if (!this.mitigationStrategies || this.mitigationStrategies.length === 0) return 0;
    const completedStrategies = this.mitigationStrategies.filter(s => s.status === 'implemented');
    return (completedStrategies.length / this.mitigationStrategies.length) * 100;
  }

  get requiresEscalation(): boolean {
    return this.riskLevel === 'critical' && this.status === 'active';
  }

  // Methods
  calculateRiskScore(): void {
    // Risk Score = (Impact Score * Likelihood Score) * 10
    this.riskScore = (this.impactScore * this.likelihoodScore) * 10;
  }

  updateStatus(newStatus: RiskStatus, updatedBy: string, notes?: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy;
    this.lastReviewDate = new Date();
    
    if (notes) {
      this.notes = (this.notes || '') + `\n${new Date().toISOString()}: Status changed to ${newStatus} by ${updatedBy}. ${notes}`;
    }
  }

  addMitigationStrategy(strategy: any): void {
    if (!this.mitigationStrategies) {
      this.mitigationStrategies = [];
    }
    strategy.strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.mitigationStrategies.push(strategy);
  }

  updateMitigationStrategy(strategyId: string, updates: Partial<any>): void {
    const strategy = this.mitigationStrategies?.find(s => s.strategyId === strategyId);
    if (strategy) {
      Object.assign(strategy, updates);
    }
  }

  addContingencyPlan(plan: any): void {
    if (!this.contingencyPlans) {
      this.contingencyPlans = [];
    }
    plan.planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.contingencyPlans.push(plan);
  }

  logCommunication(communication: any): void {
    if (!this.communicationLog) {
      this.communicationLog = [];
    }
    communication.date = new Date();
    this.communicationLog.push(communication);
  }

  scheduleNextReview(days: number): void {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    this.nextReviewDate = nextReview;
  }

  escalate(reason: string, escalatedBy: string): void {
    this.status = RiskStatus.ESCALATED;
    this.updatedBy = escalatedBy;
    
    this.logCommunication({
      type: 'escalation',
      recipient: 'management',
      message: `Risk escalated: ${reason}`,
      response: 'pending',
      followUpRequired: true,
    });
  }
}
