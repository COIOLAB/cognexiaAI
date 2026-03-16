import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

// ========================================
// ENUMS AND TYPES
// ========================================

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  STREAM = 'stream',
  IOT = 'iot',
  ERP = 'erp',
  MANUFACTURING = 'manufacturing',
  SENSORS = 'sensors',
  EXTERNAL = 'external',
  REAL_TIME = 'real_time',
}

export enum AnalyticsType {
  DESCRIPTIVE = 'descriptive',
  DIAGNOSTIC = 'diagnostic', 
  PREDICTIVE = 'predictive',
  PRESCRIPTIVE = 'prescriptive',
  COGNITIVE = 'cognitive',
  REAL_TIME = 'real_time',
  STREAMING = 'streaming',
  BATCH = 'batch',
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  SCATTER_PLOT = 'scatter_plot',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TABLE = 'table',
  KPI_CARD = 'kpi_card',
  HISTOGRAM = 'histogram',
  BOX_PLOT = 'box_plot',
  TREEMAP = 'treemap',
  SANKEY = 'sankey',
  NETWORK = 'network',
  GEOSPATIAL = 'geospatial',
  REALTIME_STREAM = 'realtime_stream',
  THREE_D = 'three_d',
  CUSTOM = 'custom',
}

export enum DashboardLayout {
  GRID = 'grid',
  FREEFORM = 'freeform',
  RESPONSIVE = 'responsive',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  FULL_SCREEN = 'full_screen',
  SPLIT_SCREEN = 'split_screen',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html',
  POWERPOINT = 'powerpoint',
  WORD = 'word',
  INTERACTIVE = 'interactive',
}

export enum ModelType {
  LINEAR_REGRESSION = 'linear_regression',
  LOGISTIC_REGRESSION = 'logistic_regression',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm',
  NEURAL_NETWORK = 'neural_network',
  DEEP_LEARNING = 'deep_learning',
  TIME_SERIES = 'time_series',
  ARIMA = 'arima',
  LSTM = 'lstm',
  TRANSFORMER = 'transformer',
  CLUSTERING = 'clustering',
  ANOMALY_DETECTION = 'anomaly_detection',
  RECOMMENDATION = 'recommendation',
  NATURAL_LANGUAGE = 'natural_language',
}

export enum DataQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

// ========================================
// DATA SOURCE ENTITIES
// ========================================

@Entity('analytics_data_sources')
@Index(['type', 'isActive'])
@Index(['createdAt'])
export class AnalyticsDataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DataSourceType,
    default: DataSourceType.DATABASE,
  })
  type: DataSourceType;

  @Column({ type: 'jsonb' })
  configuration: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    apiUrl?: string;
    apiKey?: string;
    filePath?: string;
    streamUrl?: string;
    connectionString?: string;
    customConfig?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  schema: {
    tables?: string[];
    fields?: Record<string, any>;
    relationships?: Record<string, any>;
    customSchema?: Record<string, any>;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isRealTime: boolean;

  @Column({ type: 'integer', default: 300 })
  refreshInterval: number; // seconds

  @Column({ type: 'jsonb', nullable: true })
  dataQualityMetrics: {
    completeness?: number;
    accuracy?: number;
    consistency?: number;
    timeliness?: number;
    validity?: number;
    uniqueness?: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSync: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextSync: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AnalyticsDataset, dataset => dataset.dataSource)
  datasets: AnalyticsDataset[];

  @OneToMany(() => DataPipeline, pipeline => pipeline.source)
  pipelines: DataPipeline[];
}

// ========================================
// DATA PIPELINE ENTITIES
// ========================================

@Entity('analytics_data_pipelines')
@Index(['status', 'isActive'])
@Index(['scheduledAt'])
export class DataPipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  sourceId: string;

  @ManyToOne(() => AnalyticsDataSource, source => source.pipelines)
  @JoinColumn({ name: 'sourceId' })
  source: AnalyticsDataSource;

  @Column({ type: 'jsonb' })
  transformationRules: {
    filters?: Record<string, any>[];
    aggregations?: Record<string, any>[];
    joins?: Record<string, any>[];
    calculations?: Record<string, any>[];
    customTransformations?: Record<string, any>[];
  };

  @Column({ type: 'jsonb' })
  outputConfiguration: {
    destination: string;
    format: string;
    compression?: string;
    partitioning?: Record<string, any>;
    customConfig?: Record<string, any>;
  };

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isRealTime: boolean;

  @Column({ type: 'text', nullable: true })
  cronSchedule: string; // Cron expression for batch processing

  @Column({ type: 'timestamp', nullable: true })
  lastRun: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRun: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  executionMetrics: {
    recordsProcessed?: number;
    executionTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    errorCount?: number;
    warningCount?: number;
  };

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PipelineExecution, execution => execution.pipeline)
  executions: PipelineExecution[];
}

@Entity('analytics_pipeline_executions')
@Index(['status', 'startedAt'])
@Index(['pipelineId'])
export class PipelineExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pipelineId: string;

  @ManyToOne(() => DataPipeline, pipeline => pipeline.executions)
  @JoinColumn({ name: 'pipelineId' })
  pipeline: DataPipeline;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'integer', nullable: true })
  duration: number; // milliseconds

  @Column({ type: 'bigint', default: 0 })
  recordsProcessed: number;

  @Column({ type: 'integer', default: 0 })
  recordsSuccess: number;

  @Column({ type: 'integer', default: 0 })
  recordsFailed: number;

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    memoryUsage?: number;
    cpuUsage?: number;
    diskUsage?: number;
    networkUsage?: number;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  logs: {
    info?: string[];
    warnings?: string[];
    errors?: string[];
    debug?: string[];
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ========================================
// DATASET ENTITIES
// ========================================

@Entity('analytics_datasets')
@Index(['dataSourceId', 'isActive'])
@Index(['createdAt'])
@Unique(['name', 'dataSourceId'])
export class AnalyticsDataset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  dataSourceId: string;

  @ManyToOne(() => AnalyticsDataSource, source => source.datasets)
  @JoinColumn({ name: 'dataSourceId' })
  dataSource: AnalyticsDataSource;

  @Column({ type: 'jsonb' })
  schema: {
    fields: Array<{
      name: string;
      type: string;
      nullable: boolean;
      primaryKey?: boolean;
      foreignKey?: string;
      description?: string;
      format?: string;
      constraints?: Record<string, any>;
    }>;
    indexes?: string[];
    relationships?: Record<string, any>[];
    customSchema?: Record<string, any>;
  };

  @Column({ type: 'text' })
  query: string; // SQL query or transformation logic

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isCached: boolean;

  @Column({ type: 'integer', default: 3600 })
  cacheTimeout: number; // seconds

  @Column({ type: 'bigint', default: 0 })
  recordCount: number;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes: number;

  @Column({
    type: 'enum',
    enum: DataQuality,
    default: DataQuality.GOOD,
  })
  dataQuality: DataQuality;

  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AnalyticsQuery, query => query.dataset)
  queries: AnalyticsQuery[];

  @OneToMany(() => Dashboard, dashboard => dashboard.primaryDataset)
  dashboards: Dashboard[];
}

// ========================================
// DASHBOARD ENTITIES
// ========================================

@Entity('analytics_dashboards')
@Index(['isActive', 'createdAt'])
@Index(['category'])
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column('uuid', { nullable: true })
  primaryDatasetId: string;

  @ManyToOne(() => AnalyticsDataset, dataset => dataset.dashboards)
  @JoinColumn({ name: 'primaryDatasetId' })
  primaryDataset: AnalyticsDataset;

  @Column({
    type: 'enum',
    enum: DashboardLayout,
    default: DashboardLayout.GRID,
  })
  layout: DashboardLayout;

  @Column({ type: 'jsonb' })
  layoutConfiguration: {
    columns?: number;
    rows?: number;
    gridSize?: { width: number; height: number };
    breakpoints?: Record<string, any>;
    customLayout?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  filters: Array<{
    field: string;
    operator: string;
    value: any;
    label?: string;
    type?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  globalParameters: Record<string, any>;

  @Column({ type: 'integer', default: 300 })
  refreshInterval: number; // seconds

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: true })
  isRealTime: boolean;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    view?: string[];
    edit?: string[];
    admin?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  theme: {
    colorScheme?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    customStyles?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  exportOptions: {
    allowPdf?: boolean;
    allowExcel?: boolean;
    allowImage?: boolean;
    customExports?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastViewed: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DashboardWidget, widget => widget.dashboard, { cascade: true })
  widgets: DashboardWidget[];

  @OneToMany(() => DashboardShare, share => share.dashboard)
  shares: DashboardShare[];

  @OneToMany(() => DashboardView, view => view.dashboard)
  views: DashboardView[];
}

@Entity('analytics_dashboard_widgets')
@Index(['dashboardId', 'position'])
@Index(['type'])
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dashboardId: string;

  @ManyToOne(() => Dashboard, dashboard => dashboard.widgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboardId' })
  dashboard: Dashboard;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: VisualizationType,
  })
  type: VisualizationType;

  @Column('uuid', { nullable: true })
  queryId: string;

  @ManyToOne(() => AnalyticsQuery, query => query.widgets)
  @JoinColumn({ name: 'queryId' })
  query: AnalyticsQuery;

  @Column({ type: 'jsonb' })
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };

  @Column({ type: 'jsonb' })
  configuration: {
    chartType?: string;
    aggregation?: string;
    groupBy?: string[];
    orderBy?: string[];
    limit?: number;
    colors?: string[];
    axes?: Record<string, any>;
    legend?: Record<string, any>;
    tooltip?: Record<string, any>;
    animation?: Record<string, any>;
    interactivity?: Record<string, any>;
    customConfig?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  styling: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    customStyles?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  filters: Array<{
    field: string;
    operator: string;
    value: any;
  }>;

  @Column({ type: 'integer', default: 300 })
  refreshInterval: number; // seconds

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'jsonb', nullable: true })
  drillDownConfiguration: {
    enabled?: boolean;
    targetDashboard?: string;
    parameters?: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========================================
// ANALYTICS QUERY ENTITIES
// ========================================

@Entity('analytics_queries')
@Index(['datasetId', 'isActive'])
@Index(['type', 'createdAt'])
export class AnalyticsQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  datasetId: string;

  @ManyToOne(() => AnalyticsDataset, dataset => dataset.queries)
  @JoinColumn({ name: 'datasetId' })
  dataset: AnalyticsDataset;

  @Column({
    type: 'enum',
    enum: AnalyticsType,
    default: AnalyticsType.DESCRIPTIVE,
  })
  type: AnalyticsType;

  @Column({ type: 'text' })
  query: string; // SQL query or analysis definition

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  filters: Array<{
    field: string;
    operator: string;
    value: any;
    condition?: 'AND' | 'OR';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  aggregations: Array<{
    field: string;
    function: string; // SUM, AVG, COUNT, etc.
    alias?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  groupBy: string[];

  @Column({ type: 'jsonb', nullable: true })
  orderBy: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;

  @Column({ type: 'integer', nullable: true })
  limit: number;

  @Column({ type: 'boolean', default: false })
  isCached: boolean;

  @Column({ type: 'integer', default: 3600 })
  cacheTimeout: number; // seconds

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  executionMetrics: {
    averageExecutionTime?: number;
    lastExecutionTime?: number;
    executionCount?: number;
    errorCount?: number;
    lastError?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastExecuted: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DashboardWidget, widget => widget.query)
  widgets: DashboardWidget[];

  @OneToMany(() => QueryExecution, execution => execution.query)
  executions: QueryExecution[];
}

@Entity('analytics_query_executions')
@Index(['queryId', 'executedAt'])
@Index(['status'])
export class QueryExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  queryId: string;

  @ManyToOne(() => AnalyticsQuery, query => query.executions)
  @JoinColumn({ name: 'queryId' })
  query: AnalyticsQuery;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'timestamp' })
  executedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'integer', nullable: true })
  executionTime: number; // milliseconds

  @Column({ type: 'integer', default: 0 })
  resultCount: number;

  @Column({ type: 'jsonb', nullable: true })
  resultData: any[]; // Store small result sets

  @Column({ type: 'text', nullable: true })
  resultStorageLocation: string; // For large result sets

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    memoryUsage?: number;
    cpuUsage?: number;
    diskReads?: number;
    networkTraffic?: number;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ========================================
// MACHINE LEARNING ENTITIES
// ========================================

@Entity('analytics_ml_models')
@Index(['type', 'status'])
@Index(['createdAt'])
export class MLModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ModelType,
  })
  type: ModelType;

  @Column('uuid')
  trainingDatasetId: string;

  @ManyToOne(() => AnalyticsDataset)
  @JoinColumn({ name: 'trainingDatasetId' })
  trainingDataset: AnalyticsDataset;

  @Column({ type: 'jsonb' })
  configuration: {
    algorithm?: string;
    hyperparameters?: Record<string, any>;
    featureColumns?: string[];
    targetColumn?: string;
    trainingRatio?: number;
    validationRatio?: number;
    testRatio?: number;
    crossValidation?: {
      enabled: boolean;
      folds?: number;
    };
    customConfig?: Record<string, any>;
  };

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'jsonb', nullable: true })
  trainingMetrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
    r2Score?: number;
    auc?: number;
    confusionMatrix?: number[][];
    featureImportance?: Record<string, number>;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  validationMetrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
    r2Score?: number;
    auc?: number;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'text', nullable: true })
  modelStorageLocation: string; // File path or cloud storage URL

  @Column({ type: 'integer', nullable: true })
  trainingTime: number; // milliseconds

  @Column({ type: 'timestamp', nullable: true })
  trainedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed: Date;

  @Column({ type: 'integer', default: 0 })
  predictionCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MLPrediction, prediction => prediction.model)
  predictions: MLPrediction[];
}

@Entity('analytics_ml_predictions')
@Index(['modelId', 'createdAt'])
@Index(['status'])
export class MLPrediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  modelId: string;

  @ManyToOne(() => MLModel, model => model.predictions)
  @JoinColumn({ name: 'modelId' })
  model: MLModel;

  @Column({ type: 'jsonb' })
  inputData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  outputData: Record<string, any>;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'integer', nullable: true })
  processingTime: number; // milliseconds

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

// ========================================
// REPORTING ENTITIES
// ========================================

@Entity('analytics_reports')
@Index(['category', 'isActive'])
@Index(['scheduledAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.PDF,
  })
  format: ReportFormat;

  @Column({ type: 'jsonb' })
  template: {
    layout?: string;
    sections?: Array<{
      type: string;
      content: any;
      styling?: Record<string, any>;
    }>;
    styling?: Record<string, any>;
    customTemplate?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  dataQueries: Array<{
    name: string;
    queryId: string;
    parameters?: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    enabled: boolean;
    cronExpression?: string;
    timezone?: string;
    recipients?: string[];
    deliveryMethod?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastGenerated: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextGeneration: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'integer', default: 0 })
  generationCount: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReportGeneration, generation => generation.report)
  generations: ReportGeneration[];
}

@Entity('analytics_report_generations')
@Index(['reportId', 'generatedAt'])
@Index(['status'])
export class ReportGeneration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reportId: string;

  @ManyToOne(() => Report, report => report.generations)
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'timestamp' })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  fileLocation: string; // File path or cloud storage URL

  @Column({ type: 'integer', nullable: true })
  fileSizeBytes: number;

  @Column({ type: 'integer', nullable: true })
  generationTime: number; // milliseconds

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    parameters?: Record<string, any>;
    dataRange?: {
      startDate: Date;
      endDate: Date;
    };
    recordCount?: number;
    customMetadata?: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;
}

// ========================================
// ANALYTICS INSIGHTS ENTITIES
// ========================================

@Entity('analytics_insights')
@Index(['type', 'createdAt'])
@Index(['priority'])
export class AnalyticsInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AnalyticsType,
  })
  type: AnalyticsType;

  @Column('uuid', { nullable: true })
  datasetId: string;

  @ManyToOne(() => AnalyticsDataset)
  @JoinColumn({ name: 'datasetId' })
  dataset: AnalyticsDataset;

  @Column({ type: 'jsonb' })
  data: {
    metrics?: Record<string, any>;
    trends?: Record<string, any>;
    anomalies?: Record<string, any>;
    predictions?: Record<string, any>;
    recommendations?: string[];
    customData?: Record<string, any>;
  };

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  priority: AlertSeverity;

  @Column({ type: 'float', default: 0.5 })
  confidence: number;

  @Column({ type: 'boolean', default: false })
  isActionable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  suggestedActions: Array<{
    action: string;
    description: string;
    impact?: string;
    effort?: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========================================
// ANOMALY DETECTION ENTITIES
// ========================================

@Entity('analytics_anomalies')
@Index(['severity', 'detectedAt'])
@Index(['datasetId'])
@Index(['status'])
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  datasetId: string;

  @ManyToOne(() => AnalyticsDataset)
  @JoinColumn({ name: 'datasetId' })
  dataset: AnalyticsDataset;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
  })
  severity: AlertSeverity;

  @Column({ type: 'float' })
  anomalyScore: number;

  @Column({ type: 'float', nullable: true })
  confidenceLevel: number;

  @Column({ type: 'jsonb' })
  detectionData: {
    algorithm?: string;
    threshold?: number;
    actualValue?: any;
    expectedValue?: any;
    deviation?: number;
    contextData?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  affectedMetrics: Array<{
    metric: string;
    impact: string;
    value: any;
  }>;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'timestamp' })
  detectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNote: string;

  @Column({ type: 'boolean', default: false })
  isFalsePositive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rootCauseAnalysis: {
    causes?: string[];
    correlations?: Record<string, any>;
    recommendations?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========================================
// SHARING AND COLLABORATION ENTITIES
// ========================================

@Entity('analytics_dashboard_shares')
@Index(['dashboardId', 'sharedWith'])
@Index(['expiresAt'])
export class DashboardShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dashboardId: string;

  @ManyToOne(() => Dashboard, dashboard => dashboard.shares)
  @JoinColumn({ name: 'dashboardId' })
  dashboard: Dashboard;

  @Column({ length: 100 })
  sharedWith: string; // email or user ID

  @Column({ type: 'jsonb' })
  permissions: {
    view: boolean;
    edit: boolean;
    share: boolean;
    export: boolean;
    comment: boolean;
  };

  @Column({ type: 'text', nullable: true })
  shareToken: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('analytics_dashboard_views')
@Index(['dashboardId', 'viewedAt'])
@Index(['userId'])
export class DashboardView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dashboardId: string;

  @ManyToOne(() => Dashboard, dashboard => dashboard.views)
  @JoinColumn({ name: 'dashboardId' })
  dashboard: Dashboard;

  @Column({ length: 100 })
  userId: string;

  @Column({ type: 'timestamp' })
  viewedAt: Date;

  @Column({ type: 'integer', nullable: true })
  viewDuration: number; // seconds

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    deviceType?: string;
    screenResolution?: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}

// ========================================
// CONFIGURATION ENTITIES
// ========================================

@Entity('analytics_configuration')
@Index(['category', 'isActive'])
export class AnalyticsConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 200 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
