import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum OnboardingType {
  STANDARD = 'standard',
  QUICK_START = 'quick_start',
  GUIDED = 'guided',
  CUSTOM = 'custom',
  USER = 'user',
  ORGANIZATION = 'organization',
}

export enum OnboardingStepType {
  WELCOME = 'welcome',
  PROFILE_SETUP = 'profile_setup',
  ORGANIZATION_SETUP = 'organization_setup',
  TEAM_SETUP = 'team_setup',
  TEAM_INVITATION = 'team_invitation',
  PREFERENCES = 'preferences',
  FEATURES_TOUR = 'features_tour',
  DASHBOARD_TOUR = 'dashboard_tour',
  FIRST_DATA = 'first_data',
  FIRST_CUSTOMER = 'first_customer',
  FIRST_OPPORTUNITY = 'first_opportunity',
  FIRST_TICKET = 'first_ticket',
  COMPLETE = 'complete',
}

@Entity('onboarding_sessions')
export class OnboardingSession {
  @ApiProperty({ description: 'Session UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @ApiProperty({ description: 'User ID' })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty({ description: 'Type', enum: OnboardingType })
  @Column({ type: 'simple-enum', enum: OnboardingType })
  type: OnboardingType;

  @ApiProperty({ description: 'Status', enum: OnboardingStatus })
  @Column({ type: 'simple-enum', enum: OnboardingStatus, default: OnboardingStatus.NOT_STARTED })
  status: OnboardingStatus;

  @ApiProperty({ description: 'Steps' })
  @Column({ type: 'json', default: [] })
  steps: any[];

  @ApiProperty({ description: 'Current step index' })
  @Column({ default: 0 })
  currentStepIndex: number;

  @ApiProperty({ description: 'Completed steps' })
  @Column({ default: 0 })
  completedSteps: number;

  @ApiProperty({ description: 'Total steps' })
  @Column({ default: 5 })
  totalSteps: number;

  @ApiProperty({ description: 'Progress percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Checklist' })
  @Column({ type: 'json', nullable: true })
  checklist?: any[];

  @ApiProperty({ description: 'Industry' })
  @Column({ nullable: true })
  industry?: string;

  @ApiProperty({ description: 'Company size' })
  @Column({ nullable: true })
  companySize?: string;

  @ApiProperty({ description: 'Primary use case' })
  @Column({ nullable: true })
  primaryUseCase?: string;

  @ApiProperty({ description: 'Interested features' })
  @Column({ type: 'json', nullable: true })
  interestedFeatures?: string[];

  @ApiProperty({ description: 'User responses' })
  @Column({ type: 'json', nullable: true })
  userResponses?: Record<string, any>;

  @ApiProperty({ description: 'Time spent (minutes)' })
  @Column({ default: 0 })
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Started at' })
  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Completed at' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Last activity at' })
  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @ApiProperty({ description: 'Session count' })
  @Column({ default: 0 })
  sessionCount: number;

  @ApiProperty({ description: 'Auto advance' })
  @Column({ default: true })
  autoAdvance: boolean;

  @ApiProperty({ description: 'Skipped steps count' })
  @Column({ default: 0 })
  skippedStepsCount: number;

  @ApiProperty({ description: 'Metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Show tips' })
  @Column({ default: true })
  showTips: boolean;

  @ApiProperty({ description: 'Send reminders' })
  @Column({ default: true })
  sendReminders: boolean;

  @ApiProperty({ description: 'Help requested' })
  @Column({ default: false })
  helpRequested: boolean;

  @ApiProperty({ description: 'Help requested at' })
  @Column({ type: 'timestamp', nullable: true })
  helpRequestedAt?: Date;

  @ApiProperty({ description: 'Abandoned at' })
  @Column({ type: 'timestamp', nullable: true })
  abandonedAt?: Date;

  @ApiProperty({ description: 'Abandonment reason' })
  @Column({ type: 'text', nullable: true })
  abandonmentReason?: string;

  @ApiProperty({ description: 'Feedback rating' })
  @Column({ nullable: true })
  feedbackRating?: number;

  @ApiProperty({ description: 'Feedback notes' })
  @Column({ type: 'text', nullable: true })
  feedbackNotes?: string;

  @ApiProperty({ description: 'Reward claimed' })
  @Column({ default: false })
  rewardClaimed: boolean;

  @ApiProperty({ description: 'Reward type' })
  @Column({ nullable: true })
  rewardType?: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
