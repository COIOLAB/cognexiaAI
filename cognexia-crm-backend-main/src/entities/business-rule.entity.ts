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

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  ARCHIVED = 'ARCHIVED',
}

export enum RuleType {
  VALIDATION = 'VALIDATION',
  CALCULATION = 'CALCULATION',
  ASSIGNMENT = 'ASSIGNMENT',
  NOTIFICATION = 'NOTIFICATION',
  ESCALATION = 'ESCALATION',
  SCORING = 'SCORING',
  ROUTING = 'ROUTING',
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'matches_regex';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'set_field' | 'send_email' | 'send_notification' | 'create_task' | 'update_record' | 'call_webhook' | 'run_script';
  config: Record<string, any>;
}

@Entity('business_rules')
export class BusinessRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: RuleStatus,
    default: RuleStatus.ACTIVE,
  })
  status: RuleStatus;

  @Column({
    type: 'simple-enum',
    enum: RuleType,
  })
  rule_type: RuleType;

  @Column()
  entity_type: string;

  @Column('json')
  conditions: RuleCondition[];

  @Column('json')
  actions: RuleAction[];

  @Column({ default: 0 })
  priority: number;

  @Column({ default: false })
  stop_on_match: boolean;

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

  @Column({ type: 'timestamp', nullable: true })
  last_executed_at: Date;

  @Column({ type: 'float', default: 0 })
  average_execution_time_ms: number;

  @Column({ type: 'timestamp', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
