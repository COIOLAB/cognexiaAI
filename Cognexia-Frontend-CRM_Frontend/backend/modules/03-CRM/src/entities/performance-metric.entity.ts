import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('performance_metrics')
@Index(['metric_name', 'recorded_at'])
@Index(['organization_id', 'recorded_at'])
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

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organization_id?: string;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint?: string;

  @Column({ name: 'additional_tags', type: 'json', nullable: true })
  additional_tags?: Record<string, string>;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recorded_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
