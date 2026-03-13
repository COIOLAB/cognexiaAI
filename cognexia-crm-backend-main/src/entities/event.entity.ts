import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EventType {
  MEETING = 'meeting',
  CALL = 'call',
  DEMO = 'demo',
  FOLLOWUP = 'followup',
  DEADLINE = 'deadline',
  OTHER = 'other',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: EventType, default: EventType.MEETING })
  event_type: EventType;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  meeting_link: string; // Zoom, Teams, etc.

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'json', nullable: true })
  attendees: Array<{ userId: string; email: string; status: string }>; // invited, accepted, declined

  @Column({ type: 'uuid', nullable: true })
  related_to_id: string;

  @Column({ nullable: true })
  related_to_type: string;

  @Column({ type: 'boolean', default: false })
  is_all_day: boolean;

  @Column({ type: 'int', nullable: true })
  reminder_minutes: number; // Minutes before event to send reminder

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
