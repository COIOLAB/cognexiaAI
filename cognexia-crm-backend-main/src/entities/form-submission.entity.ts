import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Form } from './form.entity';
import { Lead } from './lead.entity';
import { Tenant } from './tenant.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  CONVERTED = 'converted', // Converted to lead
  SPAM = 'spam',
  ARCHIVED = 'archived',
}

@Entity('crm_form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Form, (form) => form.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column({ name: 'form_id' })
  formId: string;

  // Submission data
  @Column({ type: 'json' })
  data: { [key: string]: any };

  @Column({ type: 'simple-enum', enum: SubmissionStatus, default: SubmissionStatus.PENDING })
  status: SubmissionStatus;

  // Lead created from submission
  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'lead_id', nullable: true })
  leadId: string;

  // Tracking info
  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'referrer', type: 'text', nullable: true })
  referrer: string;

  @Column({ name: 'utm_source', nullable: true })
  utmSource: string;

  @Column({ name: 'utm_medium', nullable: true })
  utmMedium: string;

  @Column({ name: 'utm_campaign', nullable: true })
  utmCampaign: string;

  @Column({ name: 'utm_content', nullable: true })
  utmContent: string;

  @Column({ name: 'utm_term', nullable: true })
  utmTerm: string;

  // Spam detection
  @Column({ name: 'spam_score', type: 'decimal', precision: 3, scale: 2, default: 0 })
  spamScore: number;

  @Column({ name: 'is_spam', default: false })
  isSpam: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
