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
import { Lead } from './lead.entity';
import { Contact } from './contact.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

@Entity('organizations')
@Index(['name'], { unique: true })
@Index(['email'], { unique: true })
export class Organization {
  @ApiProperty({ description: 'Organization UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Phone' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Address' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Website' })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({ description: 'Logo URL' })
  @Column({ nullable: true })
  logoUrl?: string;

  @ApiProperty({ description: 'Master organization ID' })
  @Column({ nullable: true })
  masterOrganizationId?: string;

  @ManyToOne('MasterOrganization', 'organizations')
  @JoinColumn({ name: 'masterOrganizationId' })
  masterOrganization: any;

  @ApiProperty({ description: 'Subscription plan ID' })
  @Column({ nullable: true })
  subscriptionPlanId?: string;

  @ManyToOne('SubscriptionPlan', 'organizations')
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan: any;

  @ApiProperty({ description: 'Organization status', enum: OrganizationStatus })
  @Column({ type: 'simple-enum', enum: OrganizationStatus, default: OrganizationStatus.TRIAL })
  status: OrganizationStatus;

  @ApiProperty({ description: 'Subscription status', enum: SubscriptionStatus })
  @Column({ type: 'simple-enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Trial ends at' })
  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt?: Date;

  @ApiProperty({ description: 'Max users' })
  @Column({ default: 5 })
  maxUsers: number;

  @ApiProperty({ description: 'Current user count' })
  @Column({ default: 0 })
  currentUserCount: number;

  @ApiProperty({ description: 'User tier configuration' })
  @Column({ type: 'json', nullable: true })
  userTierConfig?: {
    basic: { enabled: boolean; maxUsers: number };
    premium: { enabled: boolean; maxUsers: number };
    advanced: { enabled: boolean; maxUsers: number | null };
    activeTier: 'basic' | 'premium' | 'advanced';
  };

  @ApiProperty({ description: 'Contact person name' })
  @Column({ nullable: true })
  contactPersonName?: string;

  @ApiProperty({ description: 'Contact person email' })
  @Column({ nullable: true })
  contactPersonEmail?: string;

  @ApiProperty({ description: 'Contact person phone' })
  @Column({ nullable: true })
  contactPersonPhone?: string;

  @ApiProperty({ description: 'Stripe customer ID' })
  @Column({ nullable: true })
  stripeCustomerId?: string;

  @ApiProperty({ description: 'Stripe subscription ID' })
  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  @ApiProperty({ description: 'Next billing date' })
  @Column({ type: 'timestamp', nullable: true })
  nextBillingDate?: Date;

  @ApiProperty({ description: 'Monthly revenue' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Settings' })
  @Column({ type: 'json', nullable: true })
  settings?: any;

  @ApiProperty({ description: 'Branding' })
  @Column({ type: 'json', nullable: true })
  branding?: any;

  @ApiProperty({ description: 'Metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Billing type', enum: ['payment_gateway', 'enterprise_agreement'] })
  @Column({ type: 'varchar', default: 'payment_gateway' })
  billingType: 'payment_gateway' | 'enterprise_agreement';

  @ApiProperty({ description: 'Enterprise agreement details' })
  @Column({ type: 'json', nullable: true })
  enterpriseAgreement?: {
    contractNumber: string;
    contractStartDate: string;
    contractEndDate: string;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    agreedAmount: number;
    currency: string;
    paymentTerms: string;
    contractDocument?: string;
    notes?: string;
  };

  @ApiProperty({ description: 'Requires approval' })
  @Column({ default: false })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Approval status', enum: ['pending', 'approved', 'rejected'] })
  @Column({ type: 'varchar', nullable: true })
  approvalStatus?: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: 'Approved by user ID' })
  @Column({ nullable: true })
  approvedBy?: string;

  @ApiProperty({ description: 'Approved at' })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'Manual billing enabled' })
  @Column({ default: false })
  manualBillingEnabled: boolean;

  @ApiProperty({ description: 'Subscription end date' })
  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate?: Date;

  @ApiProperty({ description: 'Subscription start date' })
  @Column({ type: 'timestamp', nullable: true })
  subscriptionStartDate?: Date;

  @ApiProperty({ description: 'Last billing date' })
  @Column({ type: 'timestamp', nullable: true })
  lastBillingDate?: Date;

  @ApiProperty({ description: 'Deleted at' })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('BillingTransaction', 'organization')
  billingTransactions: any[];

  @OneToMany('UsageMetric', 'organization')
  usageMetrics: any[];

  @OneToMany(() => Lead, (lead) => lead.organization)
  leads: Lead[];

  @OneToMany(() => Contact, (contact) => contact.organization)
  contacts: Contact[];
}
