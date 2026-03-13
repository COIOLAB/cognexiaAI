import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum VisualizationType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  SCATTER_PLOT = 'SCATTER_PLOT',
  HEATMAP = 'HEATMAP',
  GAUGE = 'GAUGE',
  TABLE = 'TABLE',
  SANKEY = 'SANKEY',
  TREE_MAP = 'TREE_MAP',
  CUSTOM = 'CUSTOM',
}

export enum RefreshFrequency {
  REAL_TIME = 'REAL_TIME',
  MINUTE = 'MINUTE',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum DataAggregation {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  MEDIAN = 'MEDIAN',
  CUSTOM = 'CUSTOM',
}

@Entity('data_visualizations')
export class DataVisualization {
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
    enum: VisualizationType,
  })
  type: VisualizationType;

  @Column('json')
  configuration: {
    dataSource: string;
    dimensions: string[];
    measures: string[];
    filters: any;
    sorting: any;
    timeRange: {
      start: Date;
      end: Date;
      dynamicRange?: string;
    };
  };

  @Column('json')
  styling: {
    colors: string[];
    fonts: {
      family: string;
      size: number;
      color: string;
    };
    layout: {
      width: number;
      height: number;
      padding: any;
      responsive: boolean;
    };
    legend: {
      position: string;
      show: boolean;
    };
    axis: {
      x: any;
      y: any;
    };
  };

  @Column('json')
  dataProcessing: {
    aggregation: DataAggregation;
    calculations: any[];
    transformations: any[];
    customLogic?: string;
  };

  @Column({
    type: 'enum',
    enum: RefreshFrequency,
    default: RefreshFrequency.HOURLY,
  })
  refreshFrequency: RefreshFrequency;

  @Column('json', { nullable: true })
  interactivity: {
    drilldown: boolean;
    tooltip: {
      show: boolean;
      format: string;
    };
    zoom: boolean;
    pan: boolean;
    click: any;
    hover: any;
  };

  @Column('json', { nullable: true })
  analytics: {
    trendlines: boolean;
    forecasting: {
      enabled: boolean;
      method: string;
      periods: number;
    };
    annotations: any[];
    insights: {
      automatic: boolean;
      rules: any[];
    };
  };

  @Column('json', { nullable: true })
  data: {
    raw: any[];
    processed: any[];
    metadata: any;
    lastUpdated: Date;
  };

  @Column('json', { nullable: true })
  performance: {
    loadTime: number;
    renderTime: number;
    dataPoints: number;
    refreshCount: number;
    errorRate: number;
  };

  @Column('json', { nullable: true })
  exportOptions: {
    formats: string[];
    scheduling: {
      enabled: boolean;
      frequency: string;
      recipients: string[];
    };
  };

  @Column('json', { nullable: true })
  dependencies: {
    libraries: string[];
    dataServices: string[];
    apis: string[];
  };

  @Column('json', { nullable: true })
  permissions: {
    owner: string;
    viewers: string[];
    editors: string[];
    public: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastRefreshed: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRefresh: Date;

  @Column({ default: 'ACTIVE' })
  status: string;

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
