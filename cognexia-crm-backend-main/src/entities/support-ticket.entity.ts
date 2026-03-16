import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_ON_CUSTOMER = 'waiting_on_customer',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketCategory {
  TECHNICAL_ISSUE = 'technical_issue',
  FEATURE_REQUEST = 'feature_request',
  BILLING_INQUIRY = 'billing_inquiry',
  ACCOUNT_MANAGEMENT = 'account_management',
  BUG_REPORT = 'bug_report',
  ONBOARDING_HELP = 'onboarding_help',
  API_SUPPORT = 'api_support',
  DATA_MIGRATION = 'data_migration',
  TRAINING_REQUEST = 'training_request',
  OTHER = 'other',
}

export enum TicketChannel {
  WEB = 'web',
  EMAIL = 'email',
  PHONE = 'phone',
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketNumber: string; // e.g., "TICK-2026-00001"

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  organizationName: string;

  @Column()
  submittedBy: string; // User ID who submitted ticket

  @Column({ nullable: true })
  submitterName: string;

  @Column({ nullable: true })
  submitterEmail: string;

  @Column({ nullable: true })
  submitterPhone: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: TicketCategory,
    default: TicketCategory.OTHER,
  })
  category: TicketCategory;

  @Column({
    type: 'simple-enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'simple-enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({
    type: 'simple-enum',
    enum: TicketChannel,
    default: TicketChannel.WEB,
  })
  channel: TicketChannel;

  @Column({ nullable: true })
  assignedTo: string; // Staff user ID

  @Column({ nullable: true })
  assignedToName: string;

  @Column({ type: 'jsonb', default: [] })
  messages: Array<{
    id: string;
    from: string; // User ID or 'system'
    fromName: string;
    message: string;
    timestamp: string;
    isInternal: boolean; // Internal notes not visible to customer
    attachments?: string[];
  }>;

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    browser?: string;
    os?: string;
    deviceType?: string;
    errorLogs?: string[];
    reproductionSteps?: string[];
    affectedFeatures?: string[];
    customerTier?: string;
  };

  @Column({ type: 'int', default: 0 })
  responseTime: number; // Time to first response (seconds)

  @Column({ type: 'int', default: 0 })
  resolutionTime: number; // Time to resolution (seconds)

  @Column({ type: 'timestamp', nullable: true })
  firstRespondedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'int', nullable: true, default: null })
  customerSatisfactionRating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  customerFeedback: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ nullable: true })
  escalatedTo: string; // Senior staff ID

  @Column({ type: 'text', nullable: true })
  escalationReason: string;

  @Column({ nullable: true })
  relatedTicketId: string; // Link to related tickets

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', nullable: true })
  resolutionSummary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
