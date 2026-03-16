import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lead } from './lead.entity';
import { Opportunity } from './opportunity.entity';
import { Contact } from './contact.entity';
import { CustomerInteraction } from './customer-interaction.entity';
import { CustomerExperience } from './customer-experience.entity';
import { CustomerInsight } from './customer-insight.entity';
import { HolographicSession } from './holographic-session.entity';
import { SalesQuote } from './sales-quote.entity';

export enum CustomerType {
  B2B = 'b2b',
  B2C = 'b2c',
  B2B2C = 'b2b2c',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECT = 'prospect',
  CHURNED = 'churned',
  SUSPENDED = 'suspended',
}

export enum CustomerSize {
  STARTUP = 'startup',
  SMB = 'small_medium',
  ENTERPRISE = 'enterprise',
  LARGE_ENTERPRISE = 'large_enterprise',
  INDIVIDUAL = 'individual',
}

export enum CustomerTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum GrowthPotential {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('crm_customers')
@Index(['customerCode'], { unique: true })
@Index(['status'])
@Index(['customerType'])
@Index(['industry'])
export class Customer {
  @ApiProperty({ description: 'Customer UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique customer code' })
  @Column({ unique: true, length: 50 })
  customerCode: string;

  @ApiProperty({ description: 'Company or individual name' })
  @Column({ length: 255 })
  companyName: string;

  @ApiProperty({ description: 'Customer type', enum: CustomerType })
  @Column({ type: 'simple-enum', enum: CustomerType })
  customerType: CustomerType;

  @ApiProperty({ description: 'Customer status', enum: CustomerStatus })
  @Column({ type: 'simple-enum', enum: CustomerStatus, default: CustomerStatus.PROSPECT })
  status: CustomerStatus;

  @ApiProperty({ description: 'Industry sector' })
  @Column({ length: 100 })
  industry: string;

  @ApiProperty({ description: 'Company size', enum: CustomerSize })
  @Column({ type: 'simple-enum', enum: CustomerSize })
  size: CustomerSize;

  // Contact Information
  @ApiProperty({ description: 'Primary contact information', type: 'object' })
  @Column({ type: 'json' })
  primaryContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
    linkedin?: string;
    skype?: string;
  };

  // Address Information
  @ApiProperty({ description: 'Customer address', type: 'object' })
  @Column({ type: 'json' })
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
    region: string;
    latitude?: number;
    longitude?: number;
  };

  // Demographics
  @ApiProperty({ description: 'Customer demographics', type: 'object' })
  @Column({ type: 'json' })
  demographics: {
    foundedYear?: number;
    employeeCount?: number;
    annualRevenue?: number;
    website?: string;
    taxId?: string;
    duns?: string;
    sicCode?: string;
    naicsCode?: string;
  };

  // Preferences
  @ApiProperty({ description: 'Customer preferences', type: 'object' })
  @Column({ type: 'json' })
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    communicationChannels: string[];
    marketingOptIn: boolean;
    newsletterOptIn: boolean;
    eventInvitations: boolean;
    privacySettings: {
      dataSharing: boolean;
      analytics: boolean;
      marketing: boolean;
    };
  };

  // Sales Metrics
  @ApiProperty({ description: 'Sales performance metrics', type: 'object' })
  @Column({ type: 'json' })
  salesMetrics: {
    totalRevenue: number;
    lastOrderDate?: string;
    lastOrderValue?: number;
    averageOrderValue: number;
    orderFrequency?: string;
    paymentTerms: string;
    creditLimit?: number;
    outstandingBalance?: number;
    discountRate?: number;
  };

  // Relationship Metrics
  @ApiProperty({ description: 'Customer relationship metrics', type: 'object' })
  @Column({ type: 'json' })
  relationshipMetrics: {
    customerSince: string;
    loyaltyScore: number;
    satisfactionScore: number;
    npsScore: number;
    lastInteractionDate?: string;
    interactionFrequency?: string;
    preferredSalesRep?: string;
    accountManager?: string;
    supportTickets?: number;
    escalations?: number;
  };

  // Segmentation
  @ApiProperty({ description: 'Customer segmentation data', type: 'object' })
  @Column({ type: 'json' })
  segmentation: {
    segment: string;
    tier: CustomerTier;
    riskLevel: RiskLevel;
    growthPotential: GrowthPotential;
    competitiveThreats?: string[];
    strategicValue?: number;
    churnProbability?: number;
    upsellProbability?: number;
    crosssellOpportunities?: string[];
  };

  // Social Media
  @ApiProperty({ description: 'Social media presence', type: 'object' })
  @Column({ type: 'json', nullable: true })
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };

  // AI & Analytics
  @ApiProperty({ description: 'AI-powered insights', type: 'object' })
  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    behaviorProfile: string;
    purchasePattern: string;
    churnRisk: number;
    nextBestAction: string;
    recommendedProducts: string[];
    sentimentScore: number;
    engagementScore: number;
    influencerScore?: number;
  };

  // Compliance & Legal
  @ApiProperty({ description: 'Compliance information', type: 'object' })
  @Column({ type: 'json', nullable: true })
  compliance?: {
    gdprConsent: boolean;
    ccpaConsent?: boolean;
    dataRetentionPeriod?: number;
    complianceNotes?: string;
    lastAuditDate?: string;
    certifications?: string[];
  };

  @ApiProperty({ description: 'Customer tags' })
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
  @OneToMany(() => Lead, (lead) => lead.customer)
  leads: Lead[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.customer)
  opportunities: Opportunity[];

  @OneToMany(() => Contact, (contact) => contact.customer)
  contacts: Contact[];

  @OneToMany(() => CustomerInteraction, (interaction) => interaction.customer)
  interactions: CustomerInteraction[];

  @OneToMany(() => SalesQuote, (quote) => quote.customer)
  quotes: SalesQuote[];

  @OneToMany(() => CustomerExperience, (experience) => experience.customer)
  experiences: CustomerExperience[];

  @OneToMany(() => CustomerInsight, (insight) => insight.customer)
  insights: CustomerInsight[];

  @OneToMany(() => HolographicSession, (session) => session.customer)
  holographicSessions: HolographicSession[];

  // Methods
  calculateLifetimeValue(): number {
    return this.salesMetrics.totalRevenue || 0;
  }

  getHealthScore(): number {
    const satisfactionWeight = 0.3;
    const loyaltyWeight = 0.3;
    const npsWeight = 0.2;
    const engagementWeight = 0.2;

    const satisfaction = this.relationshipMetrics.satisfactionScore || 0;
    const loyalty = this.relationshipMetrics.loyaltyScore || 0;
    const nps = (this.relationshipMetrics.npsScore + 100) / 20; // Convert NPS to 0-10 scale
    const engagement = this.aiInsights?.engagementScore || 0;

    return (
      satisfaction * satisfactionWeight +
      loyalty * loyaltyWeight +
      nps * npsWeight +
      engagement * engagementWeight
    );
  }

  isHighValue(): boolean {
    return (
      this.salesMetrics.totalRevenue > 100000 ||
      this.segmentation.tier === CustomerTier.PLATINUM ||
      this.segmentation.tier === CustomerTier.DIAMOND
    );
  }

  getChurnRisk(): RiskLevel {
    const churnProbability = this.segmentation.churnProbability || 0;
    
    if (churnProbability > 0.8) return RiskLevel.CRITICAL;
    if (churnProbability > 0.6) return RiskLevel.HIGH;
    if (churnProbability > 0.3) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  getDaysSinceLastInteraction(): number {
    if (!this.relationshipMetrics.lastInteractionDate) return Infinity;
    
    const lastInteraction = new Date(this.relationshipMetrics.lastInteractionDate);
    const now = new Date();
    return Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
  }

  getPreferredCommunicationChannels(): string[] {
    return this.preferences.communicationChannels || ['email'];
  }

  shouldReceiveMarketing(): boolean {
    return this.preferences.marketingOptIn && this.status === CustomerStatus.ACTIVE;
  }
}
