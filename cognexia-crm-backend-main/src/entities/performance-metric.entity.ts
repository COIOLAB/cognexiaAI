import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('performance_metrics')
@Index(['metric_name', 'recorded_at'])
@Index(['organizationId', 'recorded_at'])
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'metric_name', type: 'varchar', length: 100 })
  metric_name: string;

  @Column({ name: 'metric_type', type: 'varchar', length: 50 })
  metric_type: 'api_response_time' | 'database_query_time' | 'cpu_usage' | 'memory_usage' | 'disk_io' | 'network_io' | 'cache_hit_rate' | 'error_rate';

  @Column({ name: 'metric_value', type: 'decimal', precision: 15, scale: 2 })
  metric_value: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // ms, %, GB, etc.

  @Column({ name: 'organizationId', type: 'uuid', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint?: string;

  @Column({ name: 'additional_tags', type: 'json', nullable: true })
  additional_tags?: Record<string, string>;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recorded_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
