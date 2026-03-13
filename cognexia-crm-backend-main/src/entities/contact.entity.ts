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
import { CustomerInteraction } from './customer-interaction.entity';

export enum ContactType {
  PRIMARY = 'primary',
  DECISION_MAKER = 'decision_maker',
  INFLUENCER = 'influencer',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  END_USER = 'end_user',
  CHAMPION = 'champion',
  GATEKEEPER = 'gatekeeper',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DO_NOT_CONTACT = 'do_not_contact',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum ContactRole {
  CEO = 'ceo',
  CTO = 'cto',
  CFO = 'cfo',
  VP_SALES = 'vp_sales',
  VP_MARKETING = 'vp_marketing',
  VP_OPERATIONS = 'vp_operations',
  DIRECTOR = 'director',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  ANALYST = 'analyst',
  COORDINATOR = 'coordinator',
  SPECIALIST = 'specialist',
  CONSULTANT = 'consultant',
  OTHER = 'other',
}

@Entity('crm_contacts')
@Index(['email'], { unique: true })
@Index(['customerId'])
@Index(['status'])
@Index(['type'])
export class Contact {
  @ApiProperty({ description: 'Contact UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @ApiProperty({ description: 'Contact type', enum: ContactType })
  @Column({ type: 'simple-enum', enum: ContactType })
  type: ContactType;

  @ApiProperty({ description: 'Contact status', enum: ContactStatus })
  @Column({ type: 'simple-enum', enum: ContactStatus, default: ContactStatus.ACTIVE })
  status: ContactStatus;

  // Personal Information
  @ApiProperty({ description: 'First name' })
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Middle name' })
  @Column({ length: 100, nullable: true })
  middleName?: string;

  @ApiProperty({ description: 'Full name (computed)' })
  @Column({ length: 255 })
  fullName: string;

  @ApiProperty({ description: 'Job title' })
  @Column({ length: 150 })
  title: string;

  @ApiProperty({ description: 'Department' })
  @Column({ length: 100, nullable: true })
  department?: string;

  @ApiProperty({ description: 'Contact role', enum: ContactRole })
  @Column({ type: 'simple-enum', enum: ContactRole, nullable: true })
  role?: ContactRole;

  @ApiProperty({ description: 'Seniority level' })
  @Column({ length: 50, nullable: true })
  seniorityLevel?: string;

  @ApiProperty({ description: 'Reports to' })
  @Column({ length: 255, nullable: true })
  reportsTo?: string;

  // Contact Information
  @ApiProperty({ description: 'Primary email' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ description: 'Secondary email' })
  @Column({ length: 255, nullable: true })
  secondaryEmail?: string;

  @ApiProperty({ description: 'Work phone' })
  @Column({ length: 50, nullable: true })
  workPhone?: string;

  @ApiProperty({ description: 'Mobile phone' })
  @Column({ length: 50, nullable: true })
  mobilePhone?: string;

  @ApiProperty({ description: 'Home phone' })
  @Column({ length: 50, nullable: true })
  homePhone?: string;

  @ApiProperty({ description: 'Fax number' })
  @Column({ length: 50, nullable: true })
  fax?: string;

  @ApiProperty({ description: 'Work address', type: 'object' })
  @Column({ type: 'json', nullable: true })
  workAddress?: {
    street: string;
    suite?: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };

  @ApiProperty({ description: 'Personal address', type: 'object' })
  @Column({ type: 'json', nullable: true })
  personalAddress?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };

  // Social & Digital Presence
  @ApiProperty({ description: 'Social media profiles', type: 'object' })
  @Column({ type: 'json', nullable: true })
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
    website?: string;
    blog?: string;
  };

  // Professional Information
  @ApiProperty({ description: 'Years of experience' })
  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @ApiProperty({ description: 'Education background', type: 'object' })
  @Column({ type: 'json', nullable: true })
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: number;
    fieldOfStudy?: string;
    certifications?: string[];
  };

  @ApiProperty({ description: 'Skills and expertise' })
  @Column({ type: 'text', array: true, default: [] })
  skills: string[];

  @ApiProperty({ description: 'Interests and hobbies' })
  @Column({ type: 'text', array: true, default: [] })
  interests: string[];

  @ApiProperty({ description: 'Languages spoken' })
  @Column({ type: 'text', array: true, default: [] })
  languages: string[];

  // Influence & Decision Making
  @ApiProperty({ description: 'Decision making influence (1-10)' })
  @Column({ type: 'int', default: 5 })
  influence: number;

  @ApiProperty({ description: 'Budget authority' })
  @Column({ default: false })
  budgetAuthority: boolean;

  @ApiProperty({ description: 'Technical authority' })
  @Column({ default: false })
  technicalAuthority: boolean;

  @ApiProperty({ description: 'Purchasing authority' })
  @Column({ default: false })
  purchasingAuthority: boolean;

  // Communication Preferences
  @ApiProperty({ description: 'Communication preferences', type: 'object' })
  @Column({ type: 'json' })
  communicationPrefs: {
    preferredChannel: 'email' | 'phone' | 'linkedin' | 'video_call' | 'text';
    preferredTime: string;
    timezone: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    language: string;
    doNotCall: boolean;
    emailOptOut: boolean;
  };

  // Relationship Metrics
  @ApiProperty({ description: 'Relationship strength (1-10)' })
  @Column({ type: 'int', default: 1 })
  relationshipStrength: number;

  @ApiProperty({ description: 'Last interaction date' })
  @Column({ type: 'timestamp', nullable: true })
  lastInteractionDate?: Date;

  @ApiProperty({ description: 'Total interactions count' })
  @Column({ type: 'int', default: 0 })
  totalInteractions: number;

  @ApiProperty({ description: 'Engagement score (0-100)' })
  @Column({ type: 'int', default: 0 })
  engagementScore: number;

  @ApiProperty({ description: 'Response rate percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  responseRate: number;

  // Personal Details
  @ApiProperty({ description: 'Birth date' })
  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @ApiProperty({ description: 'Anniversary date' })
  @Column({ type: 'date', nullable: true })
  anniversary?: Date;

  @ApiProperty({ description: 'Personal notes' })
  @Column({ type: 'text', nullable: true })
  personalNotes?: string;

  // AI Insights
  @ApiProperty({ description: 'AI-powered contact insights', type: 'object' })
  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    personalityType: string;
    communicationStyle: string;
    buyingBehavior: string;
    riskTolerance: 'low' | 'medium' | 'high';
    decisionMakingStyle: string;
    preferredApproach: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    churnRisk: number;
    upsellPotential: number;
    referralLikelihood: number;
  };

  // Marketing Attribution
  @ApiProperty({ description: 'Marketing attribution', type: 'object' })
  @Column({ type: 'json', nullable: true })
  marketingAttribution?: {
    source: string;
    campaign: string;
    medium: string;
    firstTouchPoint: string;
    lastTouchPoint: string;
    touchPoints: Array<{
      date: string;
      channel: string;
      campaign?: string;
      content?: string;
    }>;
  };

  // Email Marketing Data
  @ApiProperty({ description: 'Email marketing metrics', type: 'object' })
  @Column({ type: 'json', nullable: true })
  emailMetrics?: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    lastOpened?: string;
    lastClicked?: string;
    emailClient?: string;
  };

  @ApiProperty({ description: 'Contact tags' })
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
  @ManyToOne(() => Customer, (customer) => customer.contacts)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'Associated customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @OneToMany(() => CustomerInteraction, (interaction) => interaction.contact)
  interactions: CustomerInteraction[];

  // Methods
  getAge(): number | null {
    if (!this.birthDate) return null;

    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  updateFullName(): void {
    const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
    this.fullName = parts.join(' ');
  }

  isDecisionMaker(): boolean {
    return (
      this.type === ContactType.DECISION_MAKER ||
      this.budgetAuthority ||
      this.influence >= 8 ||
      this.role === ContactRole.CEO ||
      this.role === ContactRole.CTO ||
      this.role === ContactRole.CFO
    );
  }

  canInfluenceDecision(): boolean {
    return (
      this.influence >= 6 ||
      this.type === ContactType.INFLUENCER ||
      this.type === ContactType.CHAMPION ||
      this.technicalAuthority
    );
  }

  isEngaged(): boolean {
    return this.engagementScore >= 70 && this.responseRate >= 50;
  }

  needsAttention(): boolean {
    const daysSinceLastInteraction = this.lastInteractionDate
      ? Math.floor((Date.now() - this.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    return (
      daysSinceLastInteraction > 30 ||
      this.engagementScore < 30 ||
      this.responseRate < 20 ||
      this.relationshipStrength < 3
    );
  }

  getPreferredContactMethod(): string {
    if (this.communicationPrefs.doNotCall && this.communicationPrefs.emailOptOut) {
      return 'linkedin';
    }

    if (this.communicationPrefs.doNotCall) {
      return 'email';
    }

    return this.communicationPrefs.preferredChannel;
  }

  calculateEngagementScore(): number {
    let score = 0;

    // Response rate factor (40% weight)
    score += (this.responseRate / 100) * 40;

    // Interaction frequency factor (30% weight)
    if (this.totalInteractions > 20) score += 30;
    else if (this.totalInteractions > 10) score += 25;
    else if (this.totalInteractions > 5) score += 20;
    else if (this.totalInteractions > 0) score += 15;

    // Relationship strength factor (20% weight)
    score += (this.relationshipStrength / 10) * 20;

    // Recency factor (10% weight)
    const daysSinceLastInteraction = this.lastInteractionDate
      ? Math.floor((Date.now() - this.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastInteraction <= 7) score += 10;
    else if (daysSinceLastInteraction <= 30) score += 7;
    else if (daysSinceLastInteraction <= 90) score += 4;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  updateEngagementScore(): void {
    this.engagementScore = this.calculateEngagementScore();
  }

  hasUpcomingBirthday(days: number = 30): boolean {
    if (!this.birthDate) return false;

    const today = new Date();
    const thisYear = today.getFullYear();
    const birthday = new Date(thisYear, this.birthDate.getMonth(), this.birthDate.getDate());

    // If birthday has passed this year, check next year
    if (birthday < today) {
      birthday.setFullYear(thisYear + 1);
    }

    const daysUntilBirthday = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilBirthday <= days;
  }

  hasUpcomingAnniversary(days: number = 30): boolean {
    if (!this.anniversary) return false;

    const today = new Date();
    const thisYear = today.getFullYear();
    const anniversary = new Date(thisYear, this.anniversary.getMonth(), this.anniversary.getDate());

    // If anniversary has passed this year, check next year
    if (anniversary < today) {
      anniversary.setFullYear(thisYear + 1);
    }

    const daysUntilAnniversary = Math.floor((anniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilAnniversary <= days;
  }

  getNextTouchPointRecommendation(): string {
    if (this.hasUpcomingBirthday()) {
      return 'Send birthday wishes';
    }

    if (this.hasUpcomingAnniversary()) {
      return 'Send anniversary congratulations';
    }

    if (this.needsAttention()) {
      return 'Schedule reconnection call';
    }

    if (this.aiInsights?.upsellPotential && this.aiInsights.upsellPotential > 70) {
      return 'Present upsell opportunity';
    }

    return 'Regular check-in';
  }
}
