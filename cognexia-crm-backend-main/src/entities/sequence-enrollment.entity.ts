import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesSequence } from './sales-sequence.entity';
import { Lead } from './lead.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  EXITED = 'exited',
  FAILED = 'failed',
}

export enum ExitReason {
  REPLY_RECEIVED = 'reply_received',
  MEETING_BOOKED = 'meeting_booked',
  STATUS_CHANGED = 'status_changed',
  OPPORTUNITY_CREATED = 'opportunity_created',
  MANUAL_EXIT = 'manual_exit',
  LEAD_UNRESPONSIVE = 'lead_unresponsive',
  SEQUENCE_COMPLETED = 'sequence_completed',
}

export interface CompletedStep {
  stepId: string;
  stepOrder: number;
  stepType: string;
  executedAt: Date;
  success: boolean;
  error?: string;
  metadata?: any;
}

@Entity('sequence_enrollments')
export class SequenceEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  sequenceId: string;

  @ManyToOne(() => SalesSequence, sequence => sequence.enrollments)
  @JoinColumn({ name: 'sequenceId' })
  sequence: SalesSequence;

  @Column()
  leadId: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({
    type: 'simple-enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ default: 0 })
  currentStepIndex: number;

  @Column({ nullable: true })
  currentStepId: string;

  @Column({ type: 'json', default: [] })
  completedSteps: CompletedStep[];

  @Column({ nullable: true, type: 'timestamp' })
  nextStepAt: Date;

  // Pause functionality
  @Column({ nullable: true, type: 'timestamp' })
  pausedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  pausedUntil: Date;

  @Column({ nullable: true })
  pauseReason: string;

  // Exit tracking
  @Column({ nullable: true, type: 'timestamp' })
  exitedAt: Date;

  @Column({
    type: 'simple-enum',
    enum: ExitReason,
    nullable: true,
  })
  exitReason: ExitReason;

  @Column({ nullable: true, type: 'text' })
  exitNotes: string;

  // Completion tracking
  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date;

  @Column({ default: 0 })
  totalStepsExecuted: number;

  @Column({ default: 0 })
  totalStepsFailed: number;

  // Performance metrics
  @Column({ default: 0 })
  emailsSent: number;

  @Column({ default: 0 })
  emailsOpened: number;

  @Column({ default: 0 })
  emailsClicked: number;

  @Column({ default: 0 })
  emailsReplied: number;

  @Column({ default: 0 })
  tasksCreated: number;

  @Column({ default: 0 })
  tasksCompleted: number;

  @Column({ default: false })
  meetingBooked: boolean;

  @Column({ default: false })
  opportunityCreated: boolean;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Enrollment metadata
  @Column({ nullable: true })
  enrolledById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'enrolledById' })
  enrolledBy: User;

  @Column({ type: 'json', nullable: true })
  enrollmentMetadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
