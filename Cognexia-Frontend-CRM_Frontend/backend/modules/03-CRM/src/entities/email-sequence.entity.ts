import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface EmailSequenceStep {
  stepNumber: number;
  subject: string;
  template: string;
  delayDays: number; // Days after previous step
  delayHours?: number; // Additional hours
}

export enum SequenceTrigger {
  MANUAL = 'manual',
  LEAD_CREATED = 'lead_created',
  OPPORTUNITY_CREATED = 'opportunity_created',
  CUSTOMER_SIGNUP = 'customer_signup',
  FORM_SUBMISSION = 'form_submission',
}

@Entity('email_sequences')
export class EmailSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  steps: EmailSequenceStep[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'simple-enum', enum: SequenceTrigger, default: SequenceTrigger.MANUAL })
  trigger: SequenceTrigger;

  @Column({ type: 'json', nullable: true })
  trigger_conditions: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  active_subscribers: number;

  @Column({ type: 'int', default: 0 })
  completed_subscribers: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
