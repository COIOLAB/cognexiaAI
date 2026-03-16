import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SequenceEnrollment } from './sequence-enrollment.entity';

export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum StepType {
  EMAIL = 'email',
  TASK = 'task',
  WAIT = 'wait',
  CONDITION = 'condition',
}

export enum ExitCondition {
  REPLY_RECEIVED = 'reply_received',
  MEETING_BOOKED = 'meeting_booked',
  STATUS_CHANGED = 'status_changed',
  OPPORTUNITY_CREATED = 'opportunity_created',
  MANUAL_EXIT = 'manual_exit',
}

export interface SequenceStep {
  id: string;
  order: number;
  type: StepType;
  name: string;
  delay: number; // Minutes to wait before executing
  
  // Email step config
  emailTemplateId?: string;
  emailSubject?: string;
  emailBody?: string;
  
  // Task step config
  taskTitle?: string;
  taskDescription?: string;
  taskPriority?: string;
  assignToSequenceOwner?: boolean;
  
  // Condition step config
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  onTrue?: string; // Next step ID if condition is true
  onFalse?: string; // Next step ID if condition is false
  
  // Exit conditions for this step
  exitConditions?: ExitCondition[];
}

@Entity('sales_sequences')
export class SalesSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: SequenceStatus,
    default: SequenceStatus.DRAFT,
  })
  status: SequenceStatus;

  @Column({ type: 'json' })
  steps: SequenceStep[];

  @Column({ default: 0 })
  activeEnrollments: number;

  @Column({ default: 0 })
  completedEnrollments: number;

  @Column({ default: 0 })
  exitedEnrollments: number;

  // Enrollment triggers
  @Column({ default: false })
  enrollOnLeadCreate: boolean;

  @Column({ default: false })
  enrollOnStatusChange: boolean;

  @Column({ type: 'simple-array', nullable: true })
  enrollOnStatuses: string[];

  @Column({ type: 'simple-array', nullable: true })
  enrollOnSources: string[];

  // Exit conditions (global for entire sequence)
  @Column({ type: 'simple-array', nullable: true })
  exitConditions: ExitCondition[];

  // Enrollment limits
  @Column({ default: false })
  limitEnrollments: boolean;

  @Column({ nullable: true })
  maxEnrollments: number;

  @Column({ default: false })
  preventReenrollment: boolean;

  @Column({ nullable: true })
  reenrollmentDelayDays: number;

  // Statistics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  replyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  meetingBookedRate: number;

  // Ownership
  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => SequenceEnrollment, enrollment => enrollment.sequence)
  enrollments: SequenceEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
