import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { Lead } from './lead.entity';
import { SalesQuote } from './sales-quote.entity';

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  DISCOVERY = 'discovery',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSING = 'closing',
  WON = 'won',
  LOST = 'lost',
}

export enum OpportunityType {
  NEW_BUSINESS = 'new_business',
  EXISTING_CUSTOMER = 'existing_customer',
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell',
  RENEWAL = 'renewal',
  EXPANSION = 'expansion',
}

export enum OpportunityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CompetitivePosition {
  LEADER = 'leader',
  CHALLENGER = 'challenger',
  FOLLOWER = 'follower',
  OUTSIDER = 'outsider',
}

@Entity('crm_opportunities')
@Index(['opportunityNumber'], { unique: true })
@Index(['stage'])
@Index(['salesRep'])
@Index(['expectedCloseDate'])
@Index(['value'])
export class Opportunity {
  @ApiProperty({ description: 'Opportunity UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @ApiProperty({ description: 'Unique opportunity number' })
  @Column({ unique: true, length: 50 })
  opportunityNumber: string;

  @ApiProperty({ description: 'Opportunity name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Opportunity description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Sales stage', enum: OpportunityStage })
  @Column({ type: 'simple-enum', enum: OpportunityStage, default: OpportunityStage.PROSPECTING })
  stage: OpportunityStage;

  @ApiProperty({ description: 'Opportunity type', enum: OpportunityType })
  @Column({ type: 'simple-enum', enum: OpportunityType })
  type: OpportunityType;

  @ApiProperty({ description: 'Priority level', enum: OpportunityPriority })
  @Column({ type: 'simple-enum', enum: OpportunityPriority, default: OpportunityPriority.MEDIUM })
  priority: OpportunityPriority;

  @ApiProperty({ description: 'Deal value' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Win probability (0-100)' })
  @Column({ type: 'int', default: 10 })
  probability: number;

  @ApiProperty({ description: 'Weighted value (value * probability)' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  weightedValue: number;

  @ApiProperty({ description: 'Expected close date' })
  @Column({ type: 'date' })
  expectedCloseDate: Date;

  @ApiProperty({ description: 'Actual close date' })
  @Column({ type: 'date', nullable: true })
  actualCloseDate?: Date;

  @ApiProperty({ description: 'Assigned sales representative' })
  @Column({ length: 255 })
  salesRep: string;

  @ApiProperty({ description: 'Sales team members', type: 'array', items: { type: 'string' } })
  @Column({ type: 'text', array: true, default: [] })
  salesTeam: string[];

  // Product Details
  @ApiProperty({ description: 'Products/services in opportunity', type: 'object' })
  @Column({ type: 'json' })
  products: {
    items: Array<{
      productId: string;
      productName: string;
      category: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      discount?: number;
      margin?: number;
    }>;
    subtotal: number;
    totalDiscount: number;
    tax: number;
    total: number;
  };

  // Customer Requirements
  @ApiProperty({ description: 'Customer requirements', type: 'object' })
  @Column({ type: 'json' })
  requirements: {
    functionalRequirements: string[];
    technicalRequirements: string[];
    businessRequirements: string[];
    complianceRequirements?: string[];
    integrationRequirements?: string[];
    supportRequirements?: string[];
  };

  // Decision Process
  @ApiProperty({ description: 'Decision making process', type: 'object' })
  @Column({ type: 'json' })
  decisionProcess: {
    decisionMakers: Array<{
      name: string;
      title: string;
      role: string;
      influence: 'high' | 'medium' | 'low';
      sentiment: 'positive' | 'neutral' | 'negative';
    }>;
    evaluationCriteria: string[];
    budgetApprovalProcess: string;
    timeframe: string;
    alternativesConsidered: string[];
  };

  // Competitive Analysis
  @ApiProperty({ description: 'Competitive landscape', type: 'object' })
  @Column({ type: 'json' })
  competitive: {
    mainCompetitors: string[];
    ourPosition: CompetitivePosition;
    competitiveAdvantages: string[];
    competitiveThreats: string[];
    winFactors: string[];
    loseFactors: string[];
    competitorAnalysis: Array<{
      competitor: string;
      strengths: string[];
      weaknesses: string[];
      pricing: string;
      probability: number;
    }>;
  };

  // Sales Activities
  @ApiProperty({ description: 'Sales activities timeline', type: 'object' })
  @Column({ type: 'json' })
  activities: {
    totalActivities: number;
    lastActivityDate: string;
    nextActivity: {
      type: string;
      date: string;
      description: string;
      owner: string;
    };
    milestones: Array<{
      name: string;
      date: string;
      status: 'completed' | 'pending' | 'overdue';
      description: string;
    }>;
  };

  // Financial Details
  @ApiProperty({ description: 'Financial information', type: 'object' })
  @Column({ type: 'json' })
  financials: {
    budget: number;
    paymentTerms: string;
    billingFrequency?: string;
    contractLength?: number;
    renewalPotential?: number;
    profitMargin: number;
    costOfSale: number;
    roi: number;
  };

  // Risk Assessment
  @ApiProperty({ description: 'Risk factors', type: 'object' })
  @Column({ type: 'json' })
  risks: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      probability: number;
      mitigation: string;
    }>;
    budgetRisk: number;
    timelineRisk: number;
    competitiveRisk: number;
    technicalRisk: number;
  };

  // AI Insights
  @ApiProperty({ description: 'AI-powered opportunity insights', type: 'object' })
  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    winProbabilityAI: number;
    recommendedActions: string[];
    nextBestStep: string;
    riskAnalysis: string[];
    competitiveIntelligence: string[];
    pricingRecommendations: string;
    closingStrategy: string;
    similarOpportunities: string[];
    predictedCloseDate: string;
    buyingSignals: string[];
  };

  // Communication History
  @ApiProperty({ description: 'Communication summary', type: 'object' })
  @Column({ type: 'json' })
  communications: {
    totalTouches: number;
    lastContact: string;
    preferredChannels: string[];
    responseRate: number;
    engagementScore: number;
    keyConversations: Array<{
      date: string;
      type: string;
      summary: string;
      outcome: string;
      nextSteps: string;
    }>;
  };

  @ApiProperty({ description: 'Lead source' })
  @Column({ length: 100, nullable: true })
  leadSource?: string;

  @ApiProperty({ description: 'Campaign attribution' })
  @Column({ length: 255, nullable: true })
  campaign?: string;

  @ApiProperty({ description: 'Opportunity tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Custom fields', type: 'object' })
  @Column({ type: 'json', nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Internal notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => Customer, (customer) => customer.opportunities)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'Associated customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead?: Lead;

  @ApiProperty({ description: 'Source lead ID' })
  @Column({ name: 'lead_id', nullable: true })
  leadId?: string;

  @OneToMany(() => SalesQuote, (quote) => quote.opportunity)
  quotes: SalesQuote[];

  // Methods
  calculateAge(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysToClose(): number {
    const now = new Date();
    const expectedDate =
      this.expectedCloseDate instanceof Date
        ? this.expectedCloseDate
        : new Date(this.expectedCloseDate as any);
    if (Number.isNaN(expectedDate.getTime())) {
      return 0;
    }
    return Math.floor((expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    return this.getDaysToClose() < 0 && !this.actualCloseDate;
  }

  updateWeightedValue(): void {
    this.weightedValue = (this.value * this.probability) / 100;
  }

  getStageProgress(): number {
    const stageOrder = Object.values(OpportunityStage);
    const currentIndex = stageOrder.indexOf(this.stage);
    return ((currentIndex + 1) / stageOrder.length) * 100;
  }

  isHighValue(): boolean {
    return this.value >= 100000;
  }

  getHealthScore(): number {
    let score = 0;

    // Age factor (newer opportunities are healthier)
    const age = this.calculateAge();
    if (age <= 30) score += 25;
    else if (age <= 60) score += 20;
    else if (age <= 90) score += 15;
    else score += 10;

    // Activity factor
    if (this.activities.totalActivities > 10) score += 25;
    else if (this.activities.totalActivities > 5) score += 20;
    else score += 10;

    // Probability factor
    if (this.probability >= 75) score += 30;
    else if (this.probability >= 50) score += 25;
    else if (this.probability >= 25) score += 15;
    else score += 10;

    // Risk factor
    const riskPenalty = this.risks.overallRisk === 'high' ? 10 :
      this.risks.overallRisk === 'medium' ? 5 : 0;
    score -= riskPenalty;

    return Math.max(0, Math.min(100, score));
  }

  getCompetitiveStrength(): 'strong' | 'moderate' | 'weak' {
    const advantageCount = this.competitive.competitiveAdvantages.length;
    const threatCount = this.competitive.competitiveThreats.length;

    if (advantageCount > threatCount && this.competitive.ourPosition === CompetitivePosition.LEADER) {
      return 'strong';
    } else if (advantageCount >= threatCount) {
      return 'moderate';
    }
    return 'weak';
  }

  needsAttention(): boolean {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(this.activities.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      this.isOverdue() ||
      daysSinceLastActivity > 7 ||
      this.risks.overallRisk === 'high' ||
      this.probability < 25
    );
  }

  getRecommendedActions(): string[] {
    const actions: string[] = [];

    if (this.isOverdue()) {
      actions.push('Update expected close date');
    }

    if (this.needsAttention()) {
      actions.push('Schedule follow-up activity');
    }

    if (this.competitive.competitiveThreats.length > 0) {
      actions.push('Address competitive threats');
    }

    if (this.probability < 25) {
      actions.push('Reassess opportunity qualification');
    }

    return actions;
  }

  moveToNextStage(): OpportunityStage {
    const stageOrder = Object.values(OpportunityStage);
    const currentIndex = stageOrder.indexOf(this.stage);

    if (currentIndex < stageOrder.length - 3) { // Exclude WON and LOST
      return stageOrder[currentIndex + 1];
    }

    return this.stage;
  }
}
