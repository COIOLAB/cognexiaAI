import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum DeliveryFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

@Entity('crm_report_schedules')
export class ReportSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ name: 'report_id' })
  reportId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'simple-enum', enum: ScheduleFrequency })
  frequency: ScheduleFrequency;

  @Column({ type: 'simple-enum', enum: DeliveryFormat, default: DeliveryFormat.PDF })
  format: DeliveryFormat;

  // Email recipients
  @Column({ type: 'simple-array' })
  recipients: string[];

  @Column({ type: 'time', nullable: true })
  scheduleTime: string; // e.g., '09:00:00'

  @Column({ type: 'int', nullable: true })
  dayOfWeek: number; // 0-6 for weekly

  @Column({ type: 'int', nullable: true })
  dayOfMonth: number; // 1-31 for monthly

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRunAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
