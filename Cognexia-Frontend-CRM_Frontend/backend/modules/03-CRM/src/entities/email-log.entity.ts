import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum EmailStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'uuid', nullable: true })
  campaign_id: string;

  @Column({ type: 'uuid', nullable: true })
  sequence_id: string;

  @Column({ nullable: true })
  from_email: string;

  @Column({ nullable: true })
  from_name: string;

  @Column()
  to_email: string;

  @Column({ nullable: true })
  to_name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body_html: string;

  @Column({ type: 'text', nullable: true })
  body_text: string;

  @Column({ type: 'simple-enum', enum: EmailStatus, default: EmailStatus.QUEUED })
  status: EmailStatus;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'json', nullable: true })
  headers: Record<string, string>;

  @Column({ nullable: true })
  message_id: string; // SMTP Message-ID

  @Column({ type: 'boolean', default: false })
  is_opened: boolean;

  @Column({ type: 'boolean', default: false })
  is_clicked: boolean;

  @Column({ type: 'int', default: 0 })
  open_count: number;

  @Column({ type: 'int', default: 0 })
  click_count: number;

  @Column({ type: 'timestamp', nullable: true })
  first_opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  first_clicked_at: Date;

  @CreateDateColumn()
  sent_at: Date;
}
