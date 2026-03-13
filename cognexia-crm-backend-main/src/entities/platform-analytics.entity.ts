import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('platform_analytics_snapshots')
export class PlatformAnalyticsSnapshot {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  snapshotDate: Date;

  @ApiProperty({ description: 'Total active users across all organizations' })
  @Column({ type: 'int', default: 0 })
  totalActiveUsers: number;

  @ApiProperty({ description: 'Total organizations' })
  @Column({ type: 'int', default: 0 })
  totalOrganizations: number;

  @ApiProperty({ description: 'New users in the period' })
  @Column({ type: 'int', default: 0 })
  newUsers: number;

  @ApiProperty({ description: 'New organizations in the period' })
  @Column({ type: 'int', default: 0 })
  newOrganizations: number;

  @ApiProperty({ description: 'Monthly Recurring Revenue' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  mrr: number;

  @ApiProperty({ description: 'Annual Recurring Revenue' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  arr: number;

  @ApiProperty({ description: 'Churn rate percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  churnRate: number;

  @ApiProperty({ description: 'Organizations by tier' })
  @Column({ type: 'json', nullable: true })
  organizationsByTier: {
    basic: number;
    premium: number;
    advanced: number;
  };

  @ApiProperty({ description: 'API calls count' })
  @Column({ type: 'bigint', default: 0 })
  apiCallsCount: number;

  @ApiProperty({ description: 'Average API response time in ms' })
  @Column({ type: 'int', default: 0 })
  avgApiResponseTime: number;

  @ApiProperty({ description: 'Database performance metrics' })
  @Column({ type: 'json', nullable: true })
  databaseMetrics: {
    avgQueryTime: number;
    activeConnections: number;
    slowQueries: number;
  };

  @ApiProperty({ description: 'Storage usage in GB' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalStorageUsageGB: number;

  @ApiProperty({ description: 'Active sessions count' })
  @Column({ type: 'int', default: 0 })
  activeSessions: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
