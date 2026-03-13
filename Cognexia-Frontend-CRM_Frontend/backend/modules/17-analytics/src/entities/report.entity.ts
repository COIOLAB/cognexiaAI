import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum ReportType {
  OPERATIONAL = 'OPERATIONAL',
  PERFORMANCE = 'PERFORMANCE',
  QUALITY = 'QUALITY',
  MAINTENANCE = 'MAINTENANCE',
  COMPLIANCE = 'COMPLIANCE',
  FINANCIAL = 'FINANCIAL',
  SUSTAINABILITY = 'SUSTAINABILITY',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ReportFrequency {
  ONE_TIME = 'ONE_TIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportFrequency,
    default: ReportFrequency.ONE_TIME,
  })
  frequency: ReportFrequency;

  @Column('json')
  configuration: {
    dataSource: string;
    filters: any;
    timeRange: {
      start: Date;
      end: Date;
    };
    metrics: string[];
    dimensions: string[];
    aggregations: any;
    formatting: any;
  };

  @Column('json', { nullable: true })
  schedule: {
    startDate: Date;
    endDate?: Date;
    timeZone: string;
    recipients: string[];
    format: string;
    delivery: {
      method: string;
      config: any;
    };
  };

  @Column('json', { nullable: true })
  data: {
    content: any[];
    metrics: Record<string, any>;
    insights: any[];
  };

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column('json', { default: [] })
  executionHistory: Array<{
    timestamp: Date;
    status: string;
    message: string;
    details?: any;
  }>;

  @Column('json', { nullable: true })
  distribution: {
    recipients: string[];
    deliveryStatus: string;
    sentAt: Date;
    viewedBy: string[];
    analytics: {
      views: number;
      downloads: number;
      shares: number;
    };
  };

  @Column('json', { nullable: true })
  permissions: {
    owner: string;
    readers: string[];
    editors: string[];
    public: boolean;
  };

  @Column('json', { nullable: true })
  insights: Array<{
    type: string;
    description: string;
    importance: string;
    metrics: any;
    recommendations?: string[];
  }>;

  @Column('json', { nullable: true })
  visualization: {
    charts: any[];
    tables: any[];
    customElements: any[];
  };

  @Column({ type: 'timestamp', nullable: true })
  scheduledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

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
