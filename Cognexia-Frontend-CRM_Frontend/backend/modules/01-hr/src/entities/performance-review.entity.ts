// Industry 5.0 ERP Backend - Performance Review Entity
// TypeORM entity for employee performance reviews and evaluations
// Author: AI Assistant
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { EmployeeEntity } from './employee.entity';

@Entity('performance_reviews')
@Index(['organizationId', 'employeeId', 'reviewPeriodStart'])
@Index(['organizationId', 'reviewerId'])
@Index(['organizationId', 'status'])
@Index(['reviewType', 'reviewYear'])
export class PerformanceReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'uuid' })
  @Index()
  employeeId: string;

  @Column({ type: 'uuid' })
  @Index()
  reviewerId: string;

  // Review Period and Type
  @Column({ type: 'date' })
  @Index()
  reviewPeriodStart: Date;

  @Column({ type: 'date' })
  @Index()
  reviewPeriodEnd: Date;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  reviewType: string; // annual, mid_year, quarterly, probation, project_based

  @Column({ type: 'int' })
  @Index()
  reviewYear: number;

  @Column({ type: 'varchar', length: 50 })
  reviewCycle: string; // 2024-Q1, 2024-Annual, etc.

  // Review Status and Timeline
  @Column({ type: 'varchar', length: 50, default: 'not_started' })
  @Index()
  status: string; // not_started, in_progress, employee_submitted, manager_review, hr_review, completed, archived

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'boolean', default: false })
  isOverdue: boolean;

  // Overall Performance Rating
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  overallRating: number; // 1.00 to 5.00 scale

  @Column({ type: 'varchar', length: 50, nullable: true })
  overallRatingLabel: string; // exceeds_expectations, meets_expectations, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  performanceSummary: string;

  // Competency Ratings
  @Column({ type: 'jsonb', nullable: true })
  competencyRatings: Array<{
    competencyId: string;
    competencyName: string;
    rating: number;
    weight: number;
    comments: string;
    examples: string[];
    developmentNotes?: string;
  }>;

  // Goal Achievement
  @Column({ type: 'jsonb', nullable: true })
  goalAchievements: Array<{
    goalId: string;
    goalTitle: string;
    goalDescription: string;
    targetValue: number | string;
    actualValue: number | string;
    achievementPercentage: number;
    status: string; // exceeded, achieved, partially_achieved, not_achieved
    rating: number;
    comments: string;
    evidenceLinks?: string[];
  }>;

  // Review Feedback
  @Column({ type: 'jsonb', nullable: true })
  strengths: string[]; // key strengths identified

  @Column({ type: 'jsonb', nullable: true })
  developmentAreas: string[]; // areas for improvement

  @Column({ type: 'text', nullable: true })
  managerComments: string;

  @Column({ type: 'text', nullable: true })
  employeeComments: string;

  @Column({ type: 'text', nullable: true })
  hrComments: string;

  @Column({ type: 'text', nullable: true })
  additionalFeedback: string;

  // Development Planning
  @Column({ type: 'jsonb', nullable: true })
  developmentPlan: Array<{
    area: string;
    objective: string;
    actions: string[];
    resources: string[];
    targetDate: string;
    priority: string; // high, medium, low
    status: string; // planned, in_progress, completed, deferred
  }>;

  @Column({ type: 'jsonb', nullable: true })
  trainingRecommendations: Array<{
    trainingType: string;
    trainingName: string;
    description: string;
    priority: string;
    estimatedDuration: string;
    cost?: number;
  }>;

  // Skills Assessment
  @Column({ type: 'jsonb', nullable: true })
  skillsAssessment: Array<{
    skillName: string;
    currentLevel: number; // 1-5 scale
    targetLevel: number;
    importance: string; // critical, important, nice_to_have
    developmentPriority: string;
    notes: string;
  }>;

  // Career Development
  @Column({ type: 'jsonb', nullable: true })
  careerDiscussion: {
    currentRole: string;
    careerAspiration: string;
    nextRoleTarget?: string;
    timeFrameForPromotion?: string;
    skillGapsForPromotion: string[];
    mentorshipNeeds?: string[];
    lateralMoveInterest?: string[];
  };

  // 360 Feedback (if applicable)
  @Column({ type: 'jsonb', nullable: true })
  feedback360: Array<{
    feedbackerId: string;
    feedbackerName: string;
    feedbackerRole: string; // peer, direct_report, internal_customer, etc.
    relationship: string;
    rating: number;
    comments: string;
    strengths: string[];
    developmentAreas: string[];
    submittedDate: string;
  }>;

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: Array<{
    metricName: string;
    metricType: string; // kpi, objective, behavioral
    target: number | string;
    actual: number | string;
    unit: string;
    achievementPercentage: number;
    trend: string; // improving, stable, declining
    comparison: string; // above_avg, avg, below_avg
  }>;

  // Recognition and Achievements
  @Column({ type: 'jsonb', nullable: true })
  achievements: Array<{
    title: string;
    description: string;
    date: string;
    impact: string;
    recognition?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  awards: Array<{
    awardName: string;
    awardType: string;
    date: string;
    description: string;
    monetary?: number;
  }>;

  // Next Period Goals
  @Column({ type: 'jsonb', nullable: true })
  nextPeriodGoals: Array<{
    goalType: string; // performance, development, behavioral
    title: string;
    description: string;
    successCriteria: string[];
    targetDate: string;
    priority: string;
    metrics?: Array<{
      name: string;
      target: number | string;
      unit: string;
    }>;
  }>;

  // Compensation Review
  @Column({ type: 'boolean', default: false })
  includeCompensationReview: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  compensationRecommendation: string; // no_change, merit_increase, promotion, bonus

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  recommendedSalaryIncreasePercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  recommendedSalaryAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  recommendedBonusAmount: number;

  @Column({ type: 'text', nullable: true })
  compensationJustification: string;

  // Review Template and Customization
  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewTemplateId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewTemplateName: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>; // organization-specific fields

  // Review Participants
  @Column({ type: 'jsonb', nullable: true })
  reviewParticipants: Array<{
    userId: string;
    userName: string;
    role: string; // employee, manager, hr, peer, skip_manager
    participationType: string; // self_review, manager_review, peer_feedback
    status: string; // pending, completed, overdue
    submittedDate?: string;
  }>;

  // Approval Workflow
  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ type: 'boolean', default: false })
  requiresHRApproval: boolean;

  @Column({ type: 'boolean', default: false })
  requiresSkipManagerApproval: boolean;

  // Document Attachments
  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedBy: string;
    uploadedDate: string;
    description?: string;
  }>;

  // Previous Review Comparison
  @Column({ type: 'uuid', nullable: true })
  previousReviewId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  previousRating: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ratingTrend: string; // improved, maintained, declined

  // Performance Improvement Plan
  @Column({ type: 'boolean', default: false })
  isPIPRequired: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pipId: string; // reference to PIP if created

  @Column({ type: 'text', nullable: true })
  pipReason: string;

  // Review Settings
  @Column({ type: 'boolean', default: true })
  isVisibleToEmployee: boolean;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'date', nullable: true })
  archivedDate: Date;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Timestamps
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.performanceReviews)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.performanceReviewsAsReviewer)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: EmployeeEntity;

  @ManyToOne(() => PerformanceReviewEntity)
  @JoinColumn({ name: 'previousReviewId' })
  previousReview: PerformanceReviewEntity;
}
