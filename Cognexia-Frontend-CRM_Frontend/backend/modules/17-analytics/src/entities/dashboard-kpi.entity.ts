import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum KPIPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum KPITrend {
  INCREASING = 'INCREASING',
  DECREASING = 'DECREASING',
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
}

@Entity('dashboard_kpis')
export class DashboardKPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: KPIPriority,
    default: KPIPriority.MEDIUM,
  })
  priority: KPIPriority;

  @Column('decimal', { precision: 15, scale: 2 })
  currentValue: number;

  @Column('decimal', { precision: 15, scale: 2 })
  targetValue: number;

  @Column('decimal', { precision: 15, scale: 2 })
  warningThreshold: number;

  @Column('decimal', { precision: 15, scale: 2 })
  criticalThreshold: number;

  @Column('json')
  metadata: {
    unit: string;
    format: string;
    source: string;
    frequency: string;
    lastUpdated: Date;
  };

  @Column('json', { nullable: true })
  historicalData: Array<{
    timestamp: Date;
    value: number;
  }>;

  @Column({
    type: 'enum',
    enum: KPITrend,
    default: KPITrend.STABLE,
  })
  trend: KPITrend;

  @Column('json', { nullable: true })
  analysis: {
    performance: number;
    volatility: number;
    seasonality: boolean;
    anomalies: number;
    predictedValue: number;
    confidence: number;
  };

  @Column('json', { nullable: true })
  thresholds: {
    warning: {
      lower?: number;
      upper?: number;
    };
    critical: {
      lower?: number;
      upper?: number;
    };
  };

  @Column('json', { nullable: true })
  visualization: {
    type: string;
    options: any;
    colors: string[];
  };

  @Column('json', { nullable: true })
  alerts: Array<{
    timestamp: Date;
    type: string;
    message: string;
    value: number;
    threshold: number;
  }>;

  @Column('json', { nullable: true })
  dependencies: {
    upstream: string[];
    downstream: string[];
    correlations: Array<{
      kpiId: string;
      correlation: number;
    }>;
  };

  @Column('timestamp')
  timestamp: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;
}
