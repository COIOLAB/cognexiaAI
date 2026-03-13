import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanType {
  FREE = 'free',
  STARTER = 'starter',
  BUSINESS = 'business',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @ApiProperty({ description: 'Plan UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Plan name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Plan type', enum: PlanType })
  @Column({ type: 'simple-enum', enum: PlanType })
  planType: PlanType;

  @ApiProperty({ description: 'Price' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Billing interval', enum: BillingInterval })
  @Column({ type: 'simple-enum', enum: BillingInterval, default: BillingInterval.MONTHLY })
  billingInterval: BillingInterval;

  @ApiProperty({ description: 'Included users' })
  @Column({ default: 5 })
  includedUsers: number;

  @ApiProperty({ description: 'Trial days' })
  @Column({ default: 14 })
  trialDays: number;

  @ApiProperty({ description: 'Features' })
  @Column({ type: 'json' })
  features: string[];

  @ApiProperty({ description: 'Stripe price ID' })
  @Column({ nullable: true })
  stripePriceId?: string;

  @ApiProperty({ description: 'Currency' })
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Setup fee' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  setupFee: number;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order' })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Max users' })
  @Column({ nullable: true })
  maxUsers?: number;

  @ApiProperty({ description: 'Storage limit (GB)' })
  @Column({ nullable: true })
  storageLimit?: number;

  @ApiProperty({ description: 'API calls per month' })
  @Column({ nullable: true })
  apiCallsPerMonth?: number;

  @ApiProperty({ description: 'Price per additional user' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerAdditionalUser?: number;

  @ApiProperty({ description: 'Feature flags' })
  @Column({ type: 'json', nullable: true })
  featureFlags?: Record<string, boolean>;

  @ApiProperty({ description: 'Is popular' })
  @Column({ default: false })
  isPopular: boolean;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
