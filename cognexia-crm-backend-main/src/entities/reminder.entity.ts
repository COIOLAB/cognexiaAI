import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ReminderType {
  TASK = 'task',
  EVENT = 'event',
  FOLLOWUP = 'followup',
  CUSTOM = 'custom',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'simple-enum', enum: ReminderType })
  reminder_type: ReminderType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'timestamp' })
  remind_at: Date;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'uuid', nullable: true })
  related_to_id: string;

  @Column({ nullable: true })
  related_to_type: string;

  @Column({ type: 'json', nullable: true })
  notification_channels: string[]; // 'email', 'push', 'sms'

  @CreateDateColumn()
  created_at: Date;
}
