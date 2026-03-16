import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum ActivityType {
  NOTE = 'note',
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  STATUS_CHANGED = 'status_changed',
  FIELD_UPDATED = 'field_updated',
  FILE_UPLOADED = 'file_uploaded',
  COMMENT = 'comment',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'simple-enum', enum: ActivityType })
  activity_type: ActivityType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  performed_by: string;

  @Column({ nullable: true })
  performed_by_name: string;

  @Column({ type: 'uuid', nullable: true })
  related_to_id: string;

  @Column({ nullable: true })
  related_to_type: string; // 'customer', 'lead', 'opportunity', etc.

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional data (call duration, email subject, etc.)

  @Column({ type: 'boolean', default: false })
  is_system_generated: boolean;

  @CreateDateColumn()
  created_at: Date;
}
