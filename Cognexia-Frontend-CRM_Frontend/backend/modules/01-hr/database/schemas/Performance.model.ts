// Industry 5.0 ERP Backend - Performance Management Entities
// TypeORM entities for performance reviews, goals, and competency management
// Author: AI Assistant
// Date: 2024

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, Min, Max, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Employee } from './Employee.model';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

export enum ReviewType {
  ANNUAL = 'annual',
  MID_YEAR = 'mid_year',
  QUARTERLY = 'quarterly',
  PROBATION = 'probation',
  PROJECT_BASED = 'project_based'
}

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('hr_performance_reviews')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'reviewerId'])
@Index(['organizationId', 'reviewType'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'startDate', 'endDate'])
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column('uuid')
  @Index()
  reviewerId: string;

  @Column({
    type: 'enum',
    enum: ReviewType
  })
  @IsEnum(ReviewType)
  reviewType: ReviewType;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.NOT_STARTED
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  // Review Period
  @Column({ type: 'date' })
  @IsDateString()
  startDate: Date;

  @Column({ type: 'date' })
  @IsDateString()
  endDate: Date;

  @Column({ type: 'varchar', length: 100 })
  periodName: string;

  // Ratings
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @Column({ type: 'jsonb', nullable: true })
  competencyRatings?: Array<{
    competencyId: string;
    competencyName: string;
    rating: number;
    weight: number;
    comments?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  goalAchievements?: Array<{
    goalId: string;
    goalTitle: string;
    targetValue: number;
    actualValue: number;
    achievementPercentage: number;
    comments?: string;
  }>;

  // Feedback
  @Column({ type: 'text', array: true, default: '{}' })
  strengths: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  developmentAreas: string[];

  @Column({ type: 'text', nullable: true })
  reviewerComments?: string;

  @Column({ type: 'text', nullable: true })
  employeeComments?: string;

  @Column({ type: 'text', nullable: true })
  managerComments?: string;

  @Column({ type: 'text', nullable: true })
  hrComments?: string;

  // Timeline
  @Column({ type: 'timestamp', nullable: true })
  submissionDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  // Development Plan
  @Column({ type: 'jsonb', nullable: true })
  developmentPlan?: {
    objectives: Array<{
      title: string;
      description: string;
      targetDate: Date;
      resources: string[];
    }>;
    trainingRecommendations: string[];
    mentorshipNeeds: string[];
    careerPath: string;
  };

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: Employee;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;

  @OneToMany(() => PerformanceGoal, goal => goal.review)
  goals: PerformanceGoal[];
}

@Entity('hr_performance_goals')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'category'])
@Index(['organizationId', 'targetDate'])
export class PerformanceGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column('uuid', { nullable: true })
  reviewId?: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  category: string;

  @Column({ type: 'date' })
  @IsDateString()
  targetDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetUnit?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED
  })
  @IsEnum(GoalStatus)
  status: GoalStatus;

  @Column({ type: 'text', nullable: true })
  progressNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  // Success Criteria
  @Column({ type: 'jsonb', nullable: true })
  successCriteria?: Array<{
    criterion: string;
    met: boolean;
    evidence?: string;
  }>;

  // Milestones
  @Column({ type: 'jsonb', nullable: true })
  milestones?: Array<{
    title: string;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
    notes?: string;
  }>;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => PerformanceReview, review => review.goals, { nullable: true })
  @JoinColumn({ name: 'reviewId' })
  review?: PerformanceReview;

  // Business Logic Methods
  updateProgress(newProgress: number, notes?: string): void {
    if (newProgress < 0 || newProgress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    this.progress = newProgress;
    if (notes) {
      this.progressNotes = notes;
    }
    this.lastUpdated = new Date();
    
    // Auto-update status based on progress
    if (newProgress === 0) {
      this.status = GoalStatus.NOT_STARTED;
    } else if (newProgress === 100) {
      this.status = GoalStatus.COMPLETED;
    } else if (newProgress >= 75) {
      this.status = GoalStatus.ON_TRACK;
    } else if (this.isOverdue()) {
      this.status = GoalStatus.AT_RISK;
    } else {
      this.status = GoalStatus.IN_PROGRESS;
    }
  }

  isOverdue(): boolean {
    return new Date() > new Date(this.targetDate) && this.status !== GoalStatus.COMPLETED;
  }

  calculateAchievementPercentage(): number {
    if (!this.targetValue || !this.currentValue) return this.progress;
    return Math.min(100, (this.currentValue / this.targetValue) * 100);
  }
}

@Entity('hr_competency_frameworks')
@Index(['organizationId', 'isActive'])
export class CompetencyFramework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  competencies: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    weight: number;
    proficiencyLevels: Array<{
      level: number;
      name: string;
      description: string;
      indicators: string[];
    }>;
  }>;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, default: '1.0' })
  version: string;

  // Applicable Job Roles
  @Column({ type: 'text', array: true, default: '{}' })
  applicableRoles: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  applicableDepartments: string[];

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}

@Entity('hr_360_feedback_cycles')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'subjectEmployeeId'])
export class Feedback360Cycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  subjectEmployeeId: string;

  @Column({ type: 'varchar', length: 200 })
  cycleName: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'jsonb' })
  feedbackProviders: Array<{
    providerId: string;
    relationship: 'supervisor' | 'peer' | 'subordinate' | 'customer' | 'other';
    status: 'invited' | 'in_progress' | 'completed';
    invitedAt: Date;
    completedAt?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  aggregatedResults?: {
    overallRating: number;
    competencyScores: Array<{
      competencyId: string;
      averageRating: number;
      ratingDistribution: number[];
    }>;
    strengthsThemes: string[];
    developmentThemes: string[];
  };

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectEmployeeId' })
  subjectEmployee: Employee;

  @OneToMany(() => Feedback360Response, response => response.cycle)
  responses: Feedback360Response[];
}

@Entity('hr_360_feedback_responses')
@Index(['cycleId', 'providerId'], { unique: true })
export class Feedback360Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  cycleId: string;

  @Column('uuid')
  @Index()
  providerId: string;

  @Column({ type: 'varchar', length: 50 })
  relationship: string;

  @Column({ type: 'jsonb' })
  competencyRatings: Array<{
    competencyId: string;
    rating: number;
    comments?: string;
  }>;

  @Column({ type: 'text', array: true, default: '{}' })
  strengths: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  developmentAreas: string[];

  @Column({ type: 'text', nullable: true })
  additionalComments?: string;

  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Feedback360Cycle, cycle => cycle.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleId' })
  cycle: Feedback360Cycle;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'providerId' })
  provider: Employee;
}
