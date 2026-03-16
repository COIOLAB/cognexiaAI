import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowTriggerType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  EVENT = 'EVENT',
  WEBHOOK = 'WEBHOOK',
  API = 'API',
}

export enum WorkflowActionType {
  CREATE_RECORD = 'CREATE_RECORD',
  UPDATE_RECORD = 'UPDATE_RECORD',
  DELETE_RECORD = 'DELETE_RECORD',
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  API_CALL = 'API_CALL',
  WAIT = 'WAIT',
  APPROVAL = 'APPROVAL',
  CONDITION = 'CONDITION',
  LOOP = 'LOOP',
  ASSIGNMENT = 'ASSIGNMENT',
  ESCALATION = 'ESCALATION',
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowActionType;
  order: number;
  config: Record<string, any>;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  next_step_id: string | null;
  error_step_id: string | null;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  entity: string;
  event: string;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  schedule?: string; // cron expression
  webhook_url?: string;
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column('json')
  trigger: WorkflowTrigger;

  @Column('json')
  steps: WorkflowStep[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column()
  created_by: string;

  @Column({ default: 0 })
  execution_count: number;

  @Column({ default: 0 })
  success_count: number;

  @Column({ default: 0 })
  failure_count: number;

  @Column({ type: 'float', default: 0 })
  average_execution_time_ms: number;

  @Column({ type: 'timestamp', nullable: true })
  last_executed_at: Date;

  @Column({ default: false })
  is_template: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ default: 1 })
  version: number;

  @Column('text', { nullable: true })
  version_notes: string;

  @Column('json', { nullable: true })
  error_handling: {
    retry_count: number;
    retry_delay_seconds: number;
    notify_on_failure: boolean;
    notification_recipients: string[];
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
