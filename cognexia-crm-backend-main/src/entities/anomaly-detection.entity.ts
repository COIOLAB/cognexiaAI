import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('anomaly_detections')
@Index(['organizationId', 'detected_at'])
@Index(['anomaly_type', 'severity'])
@Index(['status'])
export class AnomalyDetection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId', type: 'uuid', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ name: 'anomaly_type', type: 'varchar', length: 50 })
  anomaly_type: 'usage_spike' | 'usage_drop' | 'performance_degradation' | 'error_rate_spike' | 'revenue_anomaly' | 'security_threat';

  @Column({ type: 'varchar', length: 20 })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'metric_name', type: 'varchar', length: 100 })
  metric_name: string;

  @Column({ name: 'expected_value', type: 'decimal', precision: 15, scale: 2 })
  expected_value: number;

  @Column({ name: 'actual_value', type: 'decimal', precision: 15, scale: 2 })
  actual_value: number;

  @Column({ name: 'deviation_percentage', type: 'decimal', precision: 5, scale: 2 })
  deviation_percentage: number;

  @Column({ type: 'json', nullable: true })
  context_data: any;

  @Column({ name: 'auto_resolved', type: 'boolean', default: false })
  auto_resolved: boolean;

  @Column({ name: 'resolution_action', type: 'text', nullable: true })
  resolution_action?: string;

  @Column({ type: 'varchar', length: 20, default: 'detected' })
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolved_at?: Date;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolved_by?: string;

  @Column({ name: 'detected_at', type: 'timestamp' })
  detected_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
