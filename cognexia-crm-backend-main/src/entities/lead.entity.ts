import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  WORKING = 'working',
  NURTURING = 'nurturing',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE_FORM = 'website_form',
  LINKEDIN_CAMPAIGN = 'linkedin_campaign',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK_ADS = 'facebook_ads',
  EMAIL_CAMPAIGN = 'email_campaign',
  REFERRAL = 'referral',
  TRADE_SHOW = 'trade_show',
  WEBINAR = 'webinar',
  COLD_CALL = 'cold_call',
  INBOUND_CALL = 'inbound_call',
  CONTENT_MARKETING = 'content_marketing',
  PARTNER = 'partner',
  OTHER = 'other',
}

export enum LeadGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

export enum SalesStage {
  PROSPECTING = 'prospecting',
  DISCOVERY = 'discovery',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSING = 'closing',
  WON = 'won',
  LOST = 'lost',
}

export enum QualificationStatus {
  QUALIFIED = 'qualified',
  INVESTIGATING = 'investigating',
  UNKNOWN = 'unknown',
  NOT_QUALIFIED = 'not_qualified',
}

@Entity('crm_leads')
@Index(['leadNumber'], { unique: true })
@Index(['status'])
@Index(['source'])
@Index(['score'])
@Index(['assignedTo'])
@Index(['organizationId'])
export class Lead {
  @ApiProperty({ description: 'Lead UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @ApiProperty({ description: 'Unique lead number' })
  @Column({ unique: true, length: 50 })
  leadNumber: string;

  @ApiProperty({ description: 'Lead status', enum: LeadStatus })
  @Column({ type: 'simple-enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @ApiProperty({ description: 'Lead source', enum: LeadSource })
  @Column({ type: 'simple-enum', enum: LeadSource })
  source: LeadSource;

  @ApiProperty({ description: 'Lead score (0-100)' })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: 'Lead grade', enum: LeadGrade })
  @Column({ type: 'simple-enum', enum: LeadGrade, nullable: true })
  grade?: LeadGrade;

  // Contact Information
  @ApiProperty({ description: 'Contact details', type: 'object' })
  @Column({ type: 'json' })
  contact: {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone?: string;
    mobile?: string;
    company?: string;
    website?: string;
    linkedin?: string;
  };

  // Demographics
  @ApiProperty({ description: 'Company demographics', type: 'object' })
  @Column({ type: 'json' })
  demographics: {
    industry?: string;
    companySize?: string;
    annualRevenue?: number;
    location?: string;
    employeeCount?: number;
    foundedYear?: number;
    techStack?: string[];
  };

  // Behavioral Data
  @ApiProperty({ description: 'Lead behavior tracking', type: 'object' })
  @Column({ type: 'json' })
  behaviorData: {
    websiteVisits: number;
    pageViews: number;
    emailOpens: number;
    emailClicks: number;
    formSubmissions: number;
    contentDownloads: number;
    demoRequests: number;
    socialInteractions?: number;
    videoViews?: number;
    whitepaperDownloads?: number;
  };

  // Lead Scoring
  @ApiProperty({ description: 'Lead scoring breakdown', type: 'object' })
  @Column({ type: 'json' })
  leadScoring: {
    demographicScore: number;
    behaviorScore: number;
    engagementScore: number;
    totalScore: number;
    lastUpdated: string;
    scoringModel?: string;
    decayFactor?: number;
  };

  // BANT Qualification
  @ApiProperty({ description: 'BANT qualification', type: 'object' })
  @Column({ type: 'json' })
  qualification: {
    budget: QualificationStatus;
    authority: QualificationStatus;
    need: QualificationStatus;
    timeline: QualificationStatus;
    bantScore: number;
    qualifiedBy?: string;
    qualifiedDate?: string;
    notes?: string;
  };

  @ApiProperty({ description: 'Assigned sales representative' })
  @Column({ length: 255, nullable: true })
  assignedTo?: string;

  @ApiProperty({ description: 'Current sales stage', enum: SalesStage })
  @Column({ type: 'simple-enum', enum: SalesStage, default: SalesStage.PROSPECTING })
  salesStage: SalesStage;

  // Next Action
  @ApiProperty({ description: 'Next planned action', type: 'object' })
  @Column({ type: 'json', nullable: true })
  nextAction?: {
    type: string;
    scheduledDate: string;
    description: string;
    priority?: string;
    reminder?: boolean;
  };

  @ApiProperty({ description: 'Estimated deal value' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedValue?: number;

  @ApiProperty({ description: 'Conversion probability (0-100)' })
  @Column({ type: 'int', default: 0 })
  probability: number;

  @ApiProperty({ description: 'Expected close date' })
  @Column({ type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @ApiProperty({ description: 'Last contact date' })
  @Column({ type: 'timestamp', nullable: true })
  lastContactDate?: Date;

  @ApiProperty({ description: 'Number of follow-ups' })
  @Column({ type: 'int', default: 0 })
  followUpCount: number;

  // Conversion Tracking
  @ApiProperty({ description: 'Conversion details', type: 'object' })
  @Column({ type: 'json', nullable: true })
  conversionData?: {
    convertedDate?: string;
    convertedBy?: string;
    conversionValue?: number;
    conversionNote?: string;
    customerId?: string;
    opportunityId?: string;
  };

  // Campaign Attribution
  @ApiProperty({ description: 'Campaign tracking', type: 'object' })
  @Column({ type: 'json', nullable: true })
  campaignAttribution?: {
    campaignId?: string;
    campaignName?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    landingPage?: string;
    referrer?: string;
  };

  // AI Insights
  @ApiProperty({ description: 'AI-powered lead insights', type: 'object' })
  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    buyingSignals: string[];
    painPoints: string[];
    interests: string[];
    predictedBehavior: string;
    recommendedApproach: string;
    similarCustomers: string[];
    contentRecommendations: string[];
    nextBestAction: string;
    sentimentScore: number;
    urgencyLevel: string;
  };

  @ApiProperty({ description: 'Lead tags' })
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
  @ManyToOne(() => Customer, (customer) => customer.leads, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ApiProperty({ description: 'Associated customer ID' })
  @Column({ name: 'customer_id', nullable: true })
  customerId?: string;

  // Methods
  calculateAge(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  isQualified(): boolean {
    return (
      this.qualification.budget === QualificationStatus.QUALIFIED &&
      this.qualification.authority === QualificationStatus.QUALIFIED &&
      this.qualification.need === QualificationStatus.QUALIFIED &&
      this.qualification.timeline === QualificationStatus.QUALIFIED
    );
  }

  getOverallQualificationScore(): number {
    const statuses = [
      this.qualification.budget,
      this.qualification.authority,
      this.qualification.need,
      this.qualification.timeline,
    ];

    const qualifiedCount = statuses.filter(s => s === QualificationStatus.QUALIFIED).length;
    return (qualifiedCount / 4) * 100;
  }

  isHotLead(): boolean {
    return this.score >= 80 && this.probability >= 70;
  }

  isWarmLead(): boolean {
    return this.score >= 60 && this.score < 80;
  }

  isColdLead(): boolean {
    return this.score < 60;
  }

  getDaysInCurrentStage(): number {
    // This would need to be calculated based on stage history
    // For now, return days since last update as approximation
    const now = new Date();
    return Math.floor((now.getTime() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  shouldFollowUp(): boolean {
    if (!this.lastContactDate) return true;

    const daysSinceContact = Math.floor(
      (Date.now() - this.lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Follow up frequency based on score
    if (this.score >= 80) return daysSinceContact >= 3;
    if (this.score >= 60) return daysSinceContact >= 7;
    return daysSinceContact >= 14;
  }

  getLeadTemperature(): 'hot' | 'warm' | 'cold' {
    if (this.isHotLead()) return 'hot';
    if (this.isWarmLead()) return 'warm';
    return 'cold';
  }

  updateScore(demographicScore: number, behaviorScore: number, engagementScore: number): void {
    this.leadScoring = {
      demographicScore,
      behaviorScore,
      engagementScore,
      totalScore: demographicScore + behaviorScore + engagementScore,
      lastUpdated: new Date().toISOString(),
      scoringModel: 'default_v1',
    };

    this.score = this.leadScoring.totalScore;
    this.grade = this.calculateGrade();
  }

  private calculateGrade(): LeadGrade {
    if (this.score >= 90) return LeadGrade.A;
    if (this.score >= 80) return LeadGrade.B;
    if (this.score >= 60) return LeadGrade.C;
    if (this.score >= 40) return LeadGrade.D;
    return LeadGrade.F;
  }
}
