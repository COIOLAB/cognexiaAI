import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum SnapshotType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('crm_analytics_snapshots')
@Index(['tenantId', 'snapshotDate', 'snapshotType'])
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'date' })
  snapshotDate: Date;

  @Column({ type: 'simple-enum', enum: SnapshotType })
  snapshotType: SnapshotType;

  // Analytics metrics
  @Column({ type: 'json' })
  metrics: {
    // Sales metrics
    totalRevenue?: number;
    newRevenue?: number;
    recurringRevenue?: number;
    averageDealSize?: number;
    dealsWon?: number;
    dealsLost?: number;
    winRate?: number;

    // Pipeline metrics
    pipelineValue?: number;
    pipelineCount?: number;
    averageSalesCycle?: number;
    conversionRate?: number;

    // Customer metrics
    totalCustomers?: number;
    newCustomers?: number;
    churnedCustomers?: number;
    activeCustomers?: number;
    customerLifetimeValue?: number;
    churnRate?: number;

    // Lead metrics
    totalLeads?: number;
    newLeads?: number;
    qualifiedLeads?: number;
    leadConversionRate?: number;

    // Activity metrics
    emailsSent?: number;
    emailOpenRate?: number;
    emailClickRate?: number;
    callsMade?: number;
    meetingsBooked?: number;
    tasksCompleted?: number;

    // Support metrics
    ticketsCreated?: number;
    ticketsResolved?: number;
    averageResponseTime?: number;
    averageResolutionTime?: number;
    customerSatisfaction?: number;

    // Custom metrics
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
