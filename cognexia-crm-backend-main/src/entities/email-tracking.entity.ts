import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmailLog } from './email-log.entity';

export enum TrackingEvent {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('email_tracking')
export class EmailTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  email_log_id: string;

  @ManyToOne(() => EmailLog)
  @JoinColumn({ name: 'email_log_id' })
  emailLog: EmailLog;

  @Column({ type: 'simple-enum', enum: TrackingEvent })
  event_type: TrackingEvent;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  location: string; // City, Country from IP

  @Column({ nullable: true })
  device: string; // Mobile, Desktop, Tablet

  @Column({ nullable: true })
  clicked_url: string; // For click events

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  tracked_at: Date;
}
