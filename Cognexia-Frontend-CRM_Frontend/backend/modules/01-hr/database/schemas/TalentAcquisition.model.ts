// Industry 5.0 ERP Backend - Talent Acquisition Entities
// TypeORM entities for recruitment, job requisitions, candidates, and applications
// Author: AI Assistant
// Date: 2024

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Employee, EmploymentType } from './Employee.model';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

export enum RequisitionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  FILLED = 'filled',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  ASSESSMENT = 'assessment',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum ApplicationStage {
  APPLICATION_RECEIVED = 'application_received',
  INITIAL_SCREENING = 'initial_screening',
  PHONE_SCREENING = 'phone_screening',
  TECHNICAL_INTERVIEW = 'technical_interview',
  BEHAVIORAL_INTERVIEW = 'behavioral_interview',
  FINAL_INTERVIEW = 'final_interview',
  REFERENCE_CHECK = 'reference_check',
  BACKGROUND_CHECK = 'background_check',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined'
}

export enum InterviewType {
  PHONE_SCREENING = 'phone_screening',
  VIDEO_INTERVIEW = 'video_interview',
  IN_PERSON = 'in_person',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
  FINAL = 'final'
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum CandidateStatus {
  ACTIVE = 'active',
  INTERVIEWING = 'interviewing',
  OFFER_EXTENDED = 'offer_extended',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  ON_HOLD = 'on_hold'
}

export enum CandidateSource {
  DIRECT_APPLICATION = 'direct_application',
  EMPLOYEE_REFERRAL = 'employee_referral',
  RECRUITMENT_AGENCY = 'recruitment_agency',
  JOB_BOARD = 'job_board',
  SOCIAL_MEDIA = 'social_media',
  CAREER_FAIR = 'career_fair',
  UNIVERSITY = 'university',
  INTERNAL = 'internal'
}

export enum HiringDecision {
  HIRE = 'hire',
  NO_HIRE = 'no_hire',
  MAYBE = 'maybe',
  STRONG_HIRE = 'strong_hire',
  STRONG_NO_HIRE = 'strong_no_hire'
}

@Entity('hr_job_requisitions')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'department'])
@Index(['organizationId', 'priority'])
@Index(['organizationId', 'requesterId'])
export class JobRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  jobTitle: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  department: string;

  @Column({ type: 'varchar', length: 150 })
  location: string;

  @Column({
    type: 'enum',
    enum: EmploymentType
  })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  // Job Details
  @Column({ type: 'text' })
  jobDescription: string;

  @Column({ type: 'text', array: true, default: '{}' })
  requirements: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  responsibilities: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  qualifications: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  preferredSkills: string[];

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryRangeMin?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryRangeMax?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  benefitsPackage?: string;

  // Status and Timeline
  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.DRAFT
  })
  @IsEnum(RequisitionStatus)
  @Index()
  status: RequisitionStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM
  })
  @IsEnum(Priority)
  @Index()
  priority: Priority;

  @Column({ type: 'int', default: 1 })
  @IsNumber()
  @Min(1)
  requestedPositions: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  filledPositions: number;

  // Approval
  @Column('uuid')
  @Index()
  requesterId: string;

  @Column('uuid', { nullable: true })
  approverId?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments?: string;

  // Dates
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  targetStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: Date;

  @Column({ type: 'date', nullable: true })
  closedDate?: Date;

  // Hiring Manager Details
  @Column('uuid', { nullable: true })
  hiringManagerId?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  interviewerIds: string[];

  // Job Posting Information
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'text', array: true, default: '{}' })
  jobBoards: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalJobPostingUrl?: string;

  // Analytics
  @Column({ type: 'int', default: 0 })
  totalApplications: number;

  @Column({ type: 'int', default: 0 })
  qualifiedApplications: number;

  @Column({ type: 'int', default: 0 })
  interviewsScheduled: number;

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
  @JoinColumn({ name: 'requesterId' })
  requester: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  approver?: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'hiringManagerId' })
  hiringManager?: Employee;

  @OneToMany(() => JobApplication, application => application.requisition)
  applications: JobApplication[];

  // Business Logic Methods
  approve(approverId: string, comments?: string): void {
    if (this.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new Error('Only pending requisitions can be approved');
    }
    this.status = RequisitionStatus.APPROVED;
    this.approverId = approverId;
    this.approvalDate = new Date();
    if (comments) {
      this.approvalComments = comments;
    }
  }

  activate(): void {
    if (this.status !== RequisitionStatus.APPROVED) {
      throw new Error('Only approved requisitions can be activated');
    }
    this.status = RequisitionStatus.ACTIVE;
  }

  close(reason: 'filled' | 'cancelled'): void {
    this.status = reason === 'filled' ? RequisitionStatus.FILLED : RequisitionStatus.CANCELLED;
    this.closedDate = new Date();
  }

  get isActive(): boolean {
    return this.status === RequisitionStatus.ACTIVE;
  }

  get applicationRate(): number {
    return this.totalApplications > 0 ? (this.qualifiedApplications / this.totalApplications) * 100 : 0;
  }

  get daysOpen(): number {
    const endDate = this.closedDate || new Date();
    const startDate = new Date(this.createdAt);
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}

@Entity('hr_candidates')
@Index(['organizationId', 'email'], { unique: true })
@Index(['organizationId', 'candidateStatus'])
@Index(['organizationId', 'source'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  // Professional Information
  @Column({ type: 'varchar', length: 200, nullable: true })
  currentJobTitle?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  currentCompany?: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  currentLocation?: string;

  @Column({ type: 'boolean', default: false })
  willingToRelocate: boolean;

  // Application Materials
  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  portfolioUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedInUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  githubUrl?: string;

  // Skills and Qualifications
  @Column({ type: 'text', array: true, default: '{}' })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  education?: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: number;
    gpa?: number;
  }>;

  @Column({ type: 'text', array: true, default: '{}' })
  certifications: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  languages: string[];

  // Status
  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.ACTIVE
  })
  @IsEnum(CandidateStatus)
  @Index()
  candidateStatus: CandidateStatus;

  @Column({
    type: 'enum',
    enum: CandidateSource
  })
  @IsEnum(CandidateSource)
  @Index()
  source: CandidateSource;

  @Column('uuid', { nullable: true })
  referredById?: string;

  // Communication
  @Column({ type: 'timestamp', nullable: true })
  lastContactDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  communicationHistory?: Array<{
    date: Date;
    type: 'email' | 'phone' | 'text' | 'in_person' | 'video_call';
    subject: string;
    notes: string;
    followUpRequired: boolean;
  }>;

  // Preferences
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectedSalary?: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  salaryCurrency?: string;

  @Column({ type: 'date', nullable: true })
  availableStartDate?: Date;

  @Column({ type: 'text', nullable: true })
  workPreferences?: string;

  // AI Analysis
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  aiMatchScore?: number;

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis?: {
    skillsMatch: number;
    experienceMatch: number;
    culturalFit: number;
    riskFactors: string[];
    recommendations: string[];
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

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'referredById' })
  referredBy?: Employee;

  @OneToMany(() => JobApplication, application => application.candidate)
  applications: JobApplication[];

  // Business Logic Methods
  updateStatus(status: CandidateStatus, notes?: string): void {
    this.candidateStatus = status;
    this.lastContactDate = new Date();
    
    if (notes) {
      if (!this.communicationHistory) {
        this.communicationHistory = [];
      }
      this.communicationHistory.push({
        date: new Date(),
        type: 'in_person',
        subject: `Status updated to ${status}`,
        notes,
        followUpRequired: false
      });
    }
  }

  addCommunication(type: string, subject: string, notes: string, followUpRequired = false): void {
    if (!this.communicationHistory) {
      this.communicationHistory = [];
    }
    this.communicationHistory.push({
      date: new Date(),
      type: type as any,
      subject,
      notes,
      followUpRequired
    });
    this.lastContactDate = new Date();
  }

  get totalApplications(): number {
    return this.applications?.length || 0;
  }

  get activeApplications(): number {
    return this.applications?.filter(app => 
      ![ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN].includes(app.status)
    ).length || 0;
  }
}

@Entity('hr_job_applications')
@Index(['organizationId', 'requisitionId'])
@Index(['organizationId', 'candidateId'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'stage'])
@Index(['organizationId', 'appliedDate'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  requisitionId: string;

  @Column('uuid')
  @Index()
  candidateId: string;

  // Application Status
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED
  })
  @IsEnum(ApplicationStatus)
  @Index()
  status: ApplicationStatus;

  @Column({
    type: 'enum',
    enum: ApplicationStage,
    default: ApplicationStage.APPLICATION_RECEIVED
  })
  @IsEnum(ApplicationStage)
  @Index()
  stage: ApplicationStage;

  // Application Details
  @Column({ type: 'timestamp' })
  @Index()
  appliedDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumePath?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverLetterPath?: string;

  @Column({ type: 'text', nullable: true })
  coverLetterText?: string;

  @Column({ type: 'jsonb', nullable: true })
  applicationAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;

  // Screening
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  initialScreeningScore?: number;

  @Column({ type: 'text', nullable: true })
  screeningNotes?: string;

  @Column('uuid', { nullable: true })
  screenedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  screeningDate?: Date;

  // Decision
  @Column({
    type: 'enum',
    enum: HiringDecision,
    nullable: true
  })
  @IsOptional()
  @IsEnum(HiringDecision)
  finalDecision?: HiringDecision;

  @Column({ type: 'timestamp', nullable: true })
  decisionDate?: Date;

  @Column({ type: 'text', nullable: true })
  decisionNotes?: string;

  @Column('uuid', { nullable: true })
  decidedBy?: string;

  // Offer Details
  @Column({ type: 'jsonb', nullable: true })
  offerDetails?: {
    salary: number;
    currency: string;
    startDate: Date;
    benefits: string[];
    terms: string[];
    offerExpiry: Date;
  };

  @Column({ type: 'timestamp', nullable: true })
  offerSentDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  offerResponseDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  offerResponse?: 'accepted' | 'declined' | 'countered';

  // Timeline and Progress
  @Column({ type: 'jsonb', nullable: true })
  stageHistory?: Array<{
    stage: ApplicationStage;
    status: ApplicationStatus;
    date: Date;
    notes?: string;
    userId?: string;
  }>;

  @Column({ type: 'int', default: 0 })
  totalInterviews: number;

  @Column({ type: 'int', default: 0 })
  completedInterviews: number;

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

  @ManyToOne(() => JobRequisition, requisition => requisition.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisitionId' })
  requisition: JobRequisition;

  @ManyToOne(() => Candidate, candidate => candidate.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'screenedBy' })
  screener?: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'decidedBy' })
  decisionMaker?: Employee;

  @OneToMany(() => Interview, interview => interview.application)
  interviews: Interview[];

  // Business Logic Methods
  updateStage(newStage: ApplicationStage, newStatus: ApplicationStatus, userId?: string, notes?: string): void {
    // Record stage history
    if (!this.stageHistory) {
      this.stageHistory = [];
    }
    this.stageHistory.push({
      stage: this.stage,
      status: this.status,
      date: new Date(),
      notes,
      userId
    });

    this.stage = newStage;
    this.status = newStatus;
  }

  makeDecision(decision: HiringDecision, userId: string, notes?: string): void {
    this.finalDecision = decision;
    this.decisionDate = new Date();
    this.decidedBy = userId;
    if (notes) {
      this.decisionNotes = notes;
    }

    // Update status based on decision
    if (decision === HiringDecision.HIRE || decision === HiringDecision.STRONG_HIRE) {
      this.status = ApplicationStatus.OFFER;
      this.stage = ApplicationStage.OFFER_EXTENDED;
    } else if (decision === HiringDecision.NO_HIRE || decision === HiringDecision.STRONG_NO_HIRE) {
      this.status = ApplicationStatus.REJECTED;
    }
  }

  sendOffer(offerDetails: any): void {
    this.offerDetails = offerDetails;
    this.offerSentDate = new Date();
    this.status = ApplicationStatus.OFFER;
    this.stage = ApplicationStage.OFFER_EXTENDED;
  }

  respondToOffer(response: 'accepted' | 'declined' | 'countered'): void {
    this.offerResponse = response;
    this.offerResponseDate = new Date();
    
    if (response === 'accepted') {
      this.status = ApplicationStatus.HIRED;
      this.stage = ApplicationStage.OFFER_ACCEPTED;
    } else if (response === 'declined') {
      this.stage = ApplicationStage.OFFER_DECLINED;
    }
  }

  get daysInProcess(): number {
    const endDate = this.decisionDate || new Date();
    return Math.floor((endDate.getTime() - new Date(this.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  get interviewCompletionRate(): number {
    return this.totalInterviews > 0 ? (this.completedInterviews / this.totalInterviews) * 100 : 0;
  }
}

@Entity('hr_interviews')
@Index(['organizationId', 'applicationId'])
@Index(['organizationId', 'interviewerId'])
@Index(['organizationId', 'scheduledDate'])
@Index(['organizationId', 'status'])
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  applicationId: string;

  @Column('uuid')
  @Index()
  interviewerId: string;

  // Interview Details
  @Column({
    type: 'enum',
    enum: InterviewType
  })
  @IsEnum(InterviewType)
  interviewType: InterviewType;

  @Column({ type: 'timestamp' })
  @Index()
  scheduledDate: Date;

  @Column({ type: 'int', default: 60 })
  @IsNumber()
  @Min(15)
  @Max(480)
  duration: number; // in minutes

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meetingLink?: string;

  @Column({ type: 'text', nullable: true })
  agenda?: string;

  // Status
  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED
  })
  @IsEnum(InterviewStatus)
  @Index()
  status: InterviewStatus;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime?: Date;

  // Evaluation
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  technicalRating?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  culturalFitRating?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  // Feedback
  @Column({ type: 'text', array: true, default: '{}' })
  strengths: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  concerns: string[];

  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  @Column({ type: 'text', nullable: true })
  detailedFeedback?: string;

  // Questions and Responses
  @Column({ type: 'jsonb', nullable: true })
  questions?: Array<{
    question: string;
    candidateResponse: string;
    interviewerNotes?: string;
    rating?: number;
  }>;

  // Decision
  @Column({
    type: 'enum',
    enum: HiringDecision,
    nullable: true
  })
  @IsOptional()
  @IsEnum(HiringDecision)
  recommendation?: HiringDecision;

  // AI Analysis
  @Column('uuid', { nullable: true })
  aiAnalysisId?: string;

  @Column({ type: 'jsonb', nullable: true })
  aiInsights?: {
    sentimentScore: number;
    keyTopics: string[];
    redFlags: string[];
    positiveIndicators: string[];
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

  @ManyToOne(() => JobApplication, application => application.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: JobApplication;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interviewerId' })
  interviewer: Employee;

  // Business Logic Methods
  start(): void {
    if (this.status !== InterviewStatus.SCHEDULED) {
      throw new Error('Can only start scheduled interviews');
    }
    this.status = InterviewStatus.IN_PROGRESS;
    this.actualStartTime = new Date();
  }

  complete(feedback: Partial<Interview>): void {
    if (this.status !== InterviewStatus.IN_PROGRESS) {
      throw new Error('Can only complete in-progress interviews');
    }
    
    this.status = InterviewStatus.COMPLETED;
    this.actualEndTime = new Date();
    
    // Update feedback fields
    Object.assign(this, feedback);
  }

  reschedule(newDate: Date, reason?: string): void {
    this.scheduledDate = newDate;
    this.status = InterviewStatus.RESCHEDULED;
    
    // Could add reschedule history tracking here
  }

  cancel(reason?: string): void {
    this.status = InterviewStatus.CANCELLED;
    // Could add cancellation reason tracking here
  }

  get actualDuration(): number | null {
    if (!this.actualStartTime || !this.actualEndTime) return null;
    return Math.floor((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60));
  }

  get isOverdue(): boolean {
    return new Date() > new Date(this.scheduledDate) && this.status === InterviewStatus.SCHEDULED;
  }

  calculateCompositeScore(): number | null {
    const ratings = [
      this.technicalRating,
      this.culturalFitRating,
      this.communicationRating
    ].filter(rating => rating !== null && rating !== undefined);
    
    if (ratings.length === 0) return null;
    
    return ratings.reduce((sum, rating) => sum + rating!, 0) / ratings.length;
  }
}
