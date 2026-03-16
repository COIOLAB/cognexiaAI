import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum MetricType {
  USER_COUNT = 'user_count',
  API_CALLS = 'api_calls',
  STORAGE = 'storage',
  STORAGE_USED = 'storage_used',
  EMAIL_SENT = 'email_sent',
  SMS_SENT = 'sms_sent',
}

export enum MetricInterval {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('usage_metrics')
@Index(['organizationId', 'metricType', 'recordedAt'])
export class UsageMetric {
  @ApiProperty({ description: 'Metric UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @Column({ type: 'simple-enum', enum: MetricType })
  metricType: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Recorded at' })
  @CreateDateColumn()
  recordedAt: Date;
}
