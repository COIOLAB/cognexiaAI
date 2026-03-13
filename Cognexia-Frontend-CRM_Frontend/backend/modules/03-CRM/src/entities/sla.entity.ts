import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SLAPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SLAStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum EscalationLevel {
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
}

@Entity('slas')
export class SLA {
  @ApiProperty({ description: 'SLA UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'SLA name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Priority', enum: SLAPriority })
  @Column({ type: 'simple-enum', enum: SLAPriority })
  priority: SLAPriority;

  @ApiProperty({ description: 'Status', enum: SLAStatus })
  @Column({ type: 'simple-enum', enum: SLAStatus, default: SLAStatus.ACTIVE })
  status: SLAStatus;

  @ApiProperty({ description: 'Response time in minutes' })
  @Column({ default: 60 })
  responseTimeMinutes: number;

  @ApiProperty({ description: 'Resolution time in hours' })
  @Column({ default: 24 })
  resolutionTimeHours: number;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'SLA targets' })
  @Column({ type: 'json', nullable: true })
  sla_targets?: Record<string, any>;

  @ApiProperty({ description: 'Auto escalate' })
  @Column({ default: false })
  auto_escalate: boolean;

  @ApiProperty({ description: 'Escalation rules' })
  @Column({ type: 'json', nullable: true })
  escalation_rules?: any[];

  @ApiProperty({ description: 'Applicable priority' })
  @Column({ type: 'json', nullable: true })
  applicable_priority?: string[];

  @ApiProperty({ description: 'Applicable category' })
  @Column({ type: 'json', nullable: true })
  applicable_category?: string[];

  @ApiProperty({ description: 'Business hours only' })
  @Column({ default: false })
  business_hours_only: boolean;

  @ApiProperty({ description: 'Business hours' })
  @Column({ type: 'json', nullable: true })
  business_hours?: Record<string, any>;

  @ApiProperty({ description: 'Breach count' })
  @Column({ default: 0 })
  breach_count: number;

  @ApiProperty({ description: 'Breach actions' })
  @Column({ type: 'json', nullable: true })
  breach_actions?: any[];

  @ApiProperty({ description: 'Priority weight' })
  @Column({ default: 0 })
  priority_weight: number;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
