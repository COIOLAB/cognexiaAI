import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';
import { FormSubmission } from './form-submission.entity';

export enum FormStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('crm_forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: FormStatus, default: FormStatus.DRAFT })
  status: FormStatus;

  // Form configuration
  @Column({ type: 'json' })
  fields: Array<{
    id: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select, radio
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
      message?: string;
    };
    mapping?: string; // Lead field to map to (e.g., 'firstName', 'email')
  }>;

  // Lead routing
  @Column({ type: 'json', nullable: true })
  routing: {
    assignToUserId?: string;
    assignmentRules?: Array<{
      condition: string; // Field name
      operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
      assignToUserId: string;
    }>;
    defaultAssignee?: string;
    notifyOnSubmission?: string[]; // User IDs to notify
  };

  // Design & branding
  @Column({ type: 'json', nullable: true })
  design: {
    theme?: 'light' | 'dark';
    primaryColor?: string;
    buttonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    logoUrl?: string;
  };

  // Spam protection
  @Column({ name: 'enable_recaptcha', default: false })
  enableRecaptcha: boolean;

  @Column({ name: 'enable_honeypot', default: true })
  enableHoneypot: boolean;

  @Column({ name: 'limit_submissions_per_ip', default: true })
  limitSubmissionsPerIp: boolean;

  @Column({ name: 'max_submissions_per_ip', default: 5 })
  maxSubmissionsPerIp: number;

  // Embed settings
  @Column({ name: 'embed_code', type: 'text', nullable: true })
  embedCode: string;

  @Column({ name: 'allowed_domains', type: 'simple-array', nullable: true })
  allowedDomains: string[];

  // Analytics
  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'submission_count', default: 0 })
  submissionCount: number;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @OneToMany(() => FormSubmission, (submission) => submission.form)
  submissions: FormSubmission[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
