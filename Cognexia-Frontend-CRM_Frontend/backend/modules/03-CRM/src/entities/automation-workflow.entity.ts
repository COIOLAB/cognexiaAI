import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WorkflowStatus { ACTIVE = 'active', PAUSED = 'paused', DISABLED = 'disabled' }

@Entity('automation_workflows')
export class AutomationWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'json' })
  trigger: { type: string; conditions: Record<string, any> };

  @Column({ type: 'json' })
  actions: Array<{ type: string; params: Record<string, any> }>;

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.ACTIVE })
  status: WorkflowStatus;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
