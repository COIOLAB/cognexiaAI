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
import { Tenant } from './tenant.entity';

export enum ReportType {
  SALES = 'sales',
  MARKETING = 'marketing',
  SUPPORT = 'support',
  PIPELINE = 'pipeline',
  CUSTOM = 'custom',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  FUNNEL = 'funnel',
  TABLE = 'table',
}

@Entity('crm_reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: ReportType, default: ReportType.CUSTOM })
  reportType: ReportType;

  @Column({ type: 'simple-enum', enum: ChartType, default: ChartType.TABLE })
  chartType: ChartType;

  // Report configuration (filters, columns, grouping, etc.)
  @Column({ type: 'json' })
  config: {
    entity: string; // 'lead', 'customer', 'deal', etc.
    columns: string[]; // Fields to display
    filters: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    groupBy?: string;
    orderBy?: { field: string; direction: 'ASC' | 'DESC' };
    limit?: number;
    aggregations?: Array<{
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }>;
  };

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @Column({ default: false })
  isPublic: boolean; // Visible to all users in tenant

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
