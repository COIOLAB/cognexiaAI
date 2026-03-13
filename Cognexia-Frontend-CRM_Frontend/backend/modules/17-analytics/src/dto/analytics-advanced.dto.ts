import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
  IsDate,
  ValidateNested,
  IsUUID,
  IsEmail,
  Min,
  Max,
  Length,
  IsUrl,
  IsJSON,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DataSourceType,
  AnalyticsType,
  VisualizationType,
  DashboardLayout,
  ReportFormat,
  ModelType,
  DataQuality,
  ProcessingStatus,
  AlertSeverity,
} from '../entities';

// ========================================
// REPORTING DTOs
// ========================================

export class CreateReportDto {
  @ApiProperty({
    description: 'Report name',
    example: 'Monthly Sales Report',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'Report description',
    example: 'Comprehensive monthly sales analysis and insights',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Report category',
    example: 'Sales',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @ApiProperty({
    description: 'Report format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiProperty({
    description: 'Report template configuration',
    example: {
      layout: 'standard',
      sections: [
        {
          type: 'chart',
          content: { queryId: 'abc-123' },
          styling: { width: '100%', height: '400px' }
        }
      ]
    },
  })
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Data queries for the report',
  })
  @IsOptional()
  @IsArray()
  dataQueries?: Array<{
    name: string;
    queryId: string;
    parameters?: Record<string, any>;
  }>;

  @ApiPropertyOptional({
    description: 'Report filters',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Report scheduling configuration',
  })
  @IsOptional()
  @IsObject()
  schedule?: {
    enabled: boolean;
    cronExpression?: string;
    timezone?: string;
    recipients?: string[];
    deliveryMethod?: string;
  };

  @ApiPropertyOptional({
    description: 'Report tags',
    example: ['sales', 'monthly', 'executive'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateReportDto {
  @ApiPropertyOptional({
    description: 'Report name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Report description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Report category',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Report format',
    enum: ReportFormat,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({
    description: 'Report template configuration',
  })
  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Data queries for the report',
  })
  @IsOptional()
  @IsArray()
  dataQueries?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Report filters',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Report scheduling configuration',
  })
  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Is report active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is report scheduled',
  })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @ApiPropertyOptional({
    description: 'Report tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ReportDto {
  @ApiProperty({ description: 'Report ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Report name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Report description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Report category' })
  category?: string;

  @ApiProperty({ 
    description: 'Report format',
    enum: ReportFormat 
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiProperty({ description: 'Report template configuration' })
  @IsObject()
  template: Record<string, any>;

  @ApiPropertyOptional({ description: 'Data queries for the report' })
  dataQueries?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Report filters' })
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Report scheduling configuration' })
  schedule?: Record<string, any>;

  @ApiProperty({ description: 'Is report active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is report scheduled' })
  @IsBoolean()
  isScheduled: boolean;

  @ApiPropertyOptional({ description: 'Last generated timestamp' })
  @IsOptional()
  @IsDate()
  lastGenerated?: Date;

  @ApiPropertyOptional({ description: 'Next generation timestamp' })
  @IsOptional()
  @IsDate()
  nextGeneration?: Date;

  @ApiProperty({ description: 'Generation count' })
  @IsNumber()
  generationCount: number;

  @ApiPropertyOptional({ description: 'Report tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Report ID to generate',
  })
  @IsUUID()
  reportId: string;

  @ApiPropertyOptional({
    description: 'Runtime parameters for report generation',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Runtime filters to apply',
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Date range for the report',
  })
  @IsOptional()
  @IsObject()
  dateRange?: {
    startDate: string;
    endDate: string;
  };

  @ApiPropertyOptional({
    description: 'Force fresh data generation (skip cache)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;

  @ApiPropertyOptional({
    description: 'Report generation timeout in seconds',
    default: 600,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  timeout?: number;
}

export class ReportGenerationDto {
  @ApiProperty({ description: 'Generation ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Report ID' })
  @IsUUID()
  reportId: string;

  @ApiProperty({ 
    description: 'Generation status',
    enum: ProcessingStatus 
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiProperty({ description: 'Generated timestamp' })
  @IsDate()
  generatedAt: Date;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'File location' })
  fileLocation?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSizeBytes?: number;

  @ApiPropertyOptional({ description: 'Generation time in milliseconds' })
  generationTime?: number;

  @ApiPropertyOptional({ description: 'Error message if generation failed' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Generation metadata' })
  metadata?: {
    parameters?: Record<string, any>;
    dataRange?: {
      startDate: Date;
      endDate: Date;
    };
    recordCount?: number;
    customMetadata?: Record<string, any>;
  };

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;
}

// ========================================
// INSIGHTS DTOs
// ========================================

export class CreateInsightDto {
  @ApiProperty({
    description: 'Insight title',
    example: 'Sales Spike Detected',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  title: string;

  @ApiProperty({
    description: 'Insight description',
    example: 'An unusual increase in sales was detected in the electronics category',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of analytics that generated this insight',
    enum: AnalyticsType,
    example: AnalyticsType.DIAGNOSTIC,
  })
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @ApiPropertyOptional({
    description: 'Dataset ID related to this insight',
  })
  @IsOptional()
  @IsUUID()
  datasetId?: string;

  @ApiProperty({
    description: 'Insight data and metrics',
    example: {
      metrics: { salesIncrease: 25.5, period: 'last_7_days' },
      trends: { direction: 'up', confidence: 0.95 },
      recommendations: ['Increase inventory', 'Investigate cause']
    },
  })
  @IsObject()
  data: {
    metrics?: Record<string, any>;
    trends?: Record<string, any>;
    anomalies?: Record<string, any>;
    predictions?: Record<string, any>;
    recommendations?: string[];
    customData?: Record<string, any>;
  };

  @ApiProperty({
    description: 'Insight priority level',
    enum: AlertSeverity,
    example: AlertSeverity.MEDIUM,
  })
  @IsEnum(AlertSeverity)
  priority: AlertSeverity;

  @ApiProperty({
    description: 'Confidence level of the insight (0-1)',
    example: 0.85,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiPropertyOptional({
    description: 'Is this insight actionable',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActionable?: boolean;

  @ApiPropertyOptional({
    description: 'Suggested actions',
  })
  @IsOptional()
  @IsArray()
  suggestedActions?: Array<{
    action: string;
    description: string;
    impact?: string;
    effort?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Insight validity period',
  })
  @IsOptional()
  @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional({
    description: 'Insight tags',
    example: ['sales', 'anomaly', 'electronics'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class AnalyticsInsightDto {
  @ApiProperty({ description: 'Insight ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Insight title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Insight description' })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Analytics type',
    enum: AnalyticsType 
  })
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @ApiPropertyOptional({ description: 'Dataset ID' })
  datasetId?: string;

  @ApiProperty({ description: 'Insight data and metrics' })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ 
    description: 'Insight priority',
    enum: AlertSeverity 
  })
  @IsEnum(AlertSeverity)
  priority: AlertSeverity;

  @ApiProperty({ description: 'Confidence level (0-1)' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ description: 'Is insight actionable' })
  @IsBoolean()
  isActionable: boolean;

  @ApiPropertyOptional({ description: 'Suggested actions' })
  suggestedActions?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Valid until timestamp' })
  @IsOptional()
  @IsDate()
  validUntil?: Date;

  @ApiProperty({ description: 'Is insight active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'View count' })
  @IsNumber()
  viewCount: number;

  @ApiPropertyOptional({ description: 'Insight tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

// ========================================
// ANOMALY DETECTION DTOs
// ========================================

export class CreateAnomalyDto {
  @ApiProperty({
    description: 'Dataset ID where anomaly was detected',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Anomaly title',
    example: 'Unusual CPU Spike',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  title: string;

  @ApiProperty({
    description: 'Anomaly description',
    example: 'CPU usage exceeded normal patterns by 200% for 30 minutes',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Anomaly severity level',
    enum: AlertSeverity,
    example: AlertSeverity.HIGH,
  })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({
    description: 'Anomaly score (0-1)',
    example: 0.92,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  anomalyScore: number;

  @ApiPropertyOptional({
    description: 'Confidence level (0-1)',
    example: 0.88,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceLevel?: number;

  @ApiProperty({
    description: 'Detection algorithm and data',
    example: {
      algorithm: 'IsolationForest',
      threshold: 0.1,
      actualValue: 85.2,
      expectedValue: 25.5,
      deviation: 59.7
    },
  })
  @IsObject()
  detectionData: {
    algorithm?: string;
    threshold?: number;
    actualValue?: any;
    expectedValue?: any;
    deviation?: number;
    contextData?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Affected metrics',
  })
  @IsOptional()
  @IsArray()
  affectedMetrics?: Array<{
    metric: string;
    impact: string;
    value: any;
  }>;

  @ApiPropertyOptional({
    description: 'Root cause analysis',
  })
  @IsOptional()
  @IsObject()
  rootCauseAnalysis?: {
    causes?: string[];
    correlations?: Record<string, any>;
    recommendations?: string[];
  };
}

export class UpdateAnomalyDto {
  @ApiPropertyOptional({
    description: 'Anomaly status',
    enum: ProcessingStatus,
  })
  @IsOptional()
  @IsEnum(ProcessingStatus)
  status?: ProcessingStatus;

  @ApiPropertyOptional({
    description: 'Resolution timestamp',
  })
  @IsOptional()
  @IsDate()
  resolvedAt?: Date;

  @ApiPropertyOptional({
    description: 'Resolution note',
  })
  @IsOptional()
  @IsString()
  resolutionNote?: string;

  @ApiPropertyOptional({
    description: 'Is this a false positive',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFalsePositive?: boolean;

  @ApiPropertyOptional({
    description: 'Root cause analysis',
  })
  @IsOptional()
  @IsObject()
  rootCauseAnalysis?: Record<string, any>;
}

export class AnomalyDto {
  @ApiProperty({ description: 'Anomaly ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiProperty({ description: 'Anomaly title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Anomaly description' })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Anomaly severity',
    enum: AlertSeverity 
  })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Anomaly score (0-1)' })
  @IsNumber()
  anomalyScore: number;

  @ApiPropertyOptional({ description: 'Confidence level (0-1)' })
  confidenceLevel?: number;

  @ApiProperty({ description: 'Detection algorithm and data' })
  @IsObject()
  detectionData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Affected metrics' })
  affectedMetrics?: Array<Record<string, any>>;

  @ApiProperty({ 
    description: 'Anomaly status',
    enum: ProcessingStatus 
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiProperty({ description: 'Detection timestamp' })
  @IsDate()
  detectedAt: Date;

  @ApiPropertyOptional({ description: 'Resolution timestamp' })
  @IsOptional()
  @IsDate()
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'Resolution note' })
  resolutionNote?: string;

  @ApiProperty({ description: 'Is false positive' })
  @IsBoolean()
  isFalsePositive: boolean;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  rootCauseAnalysis?: Record<string, any>;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

// ========================================
// FILTER AND SEARCH DTOs
// ========================================

export class AnalyticsFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Search query',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Date range filter',
  })
  @IsOptional()
  @IsObject()
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };

  @ApiPropertyOptional({
    description: 'Status filter',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Tags filter',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Custom filters',
  })
  @IsOptional()
  @IsObject()
  customFilters?: Record<string, any>;
}

export class DataExplorationDto {
  @ApiProperty({
    description: 'Dataset ID to explore',
  })
  @IsUUID()
  datasetId: string;

  @ApiPropertyOptional({
    description: 'Columns to explore',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({
    description: 'Sample size for exploration',
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  sampleSize?: number;

  @ApiPropertyOptional({
    description: 'Statistical analysis to perform',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  analysisTypes?: string[]; // ['descriptive', 'correlation', 'distribution']

  @ApiPropertyOptional({
    description: 'Grouping column for analysis',
  })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({
    description: 'Filters to apply during exploration',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export class DataExplorationResultDto {
  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiProperty({ description: 'Summary statistics' })
  @IsObject()
  summary: {
    totalRows: number;
    totalColumns: number;
    nullValues: number;
    duplicateRows: number;
    dataTypes: Record<string, string>;
  };

  @ApiProperty({ description: 'Column statistics' })
  @IsArray()
  columnStatistics: Array<{
    column: string;
    dataType: string;
    nullCount: number;
    uniqueCount: number;
    mean?: number;
    median?: number;
    mode?: any;
    min?: any;
    max?: any;
    standardDeviation?: number;
    distribution?: any;
  }>;

  @ApiPropertyOptional({ description: 'Correlation matrix' })
  correlationMatrix?: Record<string, Record<string, number>>;

  @ApiPropertyOptional({ description: 'Data quality insights' })
  qualityInsights?: Array<{
    type: string;
    severity: string;
    description: string;
    affectedColumns: string[];
    recommendation: string;
  }>;

  @ApiPropertyOptional({ description: 'Suggested visualizations' })
  suggestedVisualizations?: Array<{
    type: VisualizationType;
    columns: string[];
    description: string;
    suitabilityScore: number;
  }>;

  @ApiProperty({ description: 'Exploration execution time' })
  @IsNumber()
  executionTime: number;

  @ApiProperty({ description: 'Generated timestamp' })
  @IsDate()
  generatedAt: Date;
}

// ========================================
// ADVANCED ANALYTICS DTOs
// ========================================

export class TimeSeriesAnalysisDto {
  @ApiProperty({
    description: 'Dataset ID for time series analysis',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Date/time column name',
    example: 'timestamp',
  })
  @IsString()
  @IsNotEmpty()
  timeColumn: string;

  @ApiProperty({
    description: 'Value column(s) for analysis',
    example: ['sales_amount', 'quantity'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  valueColumns: string[];

  @ApiPropertyOptional({
    description: 'Time series frequency',
    example: 'daily',
  })
  @IsOptional()
  @IsString()
  frequency?: string; // 'hourly', 'daily', 'weekly', 'monthly'

  @ApiPropertyOptional({
    description: 'Seasonal period length',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  seasonalPeriod?: number;

  @ApiPropertyOptional({
    description: 'Forecast horizon',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastHorizon?: number;

  @ApiPropertyOptional({
    description: 'Analysis components to include',
    example: ['trend', 'seasonality', 'forecast', 'anomalies'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  components?: string[];
}

export class TimeSeriesResultDto {
  @ApiProperty({ description: 'Analysis ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiProperty({ description: 'Time series decomposition' })
  @IsObject()
  decomposition: {
    trend: Array<{ timestamp: Date; value: number }>;
    seasonal: Array<{ timestamp: Date; value: number }>;
    residual: Array<{ timestamp: Date; value: number }>;
  };

  @ApiPropertyOptional({ description: 'Forecast results' })
  forecast?: {
    predictions: Array<{ timestamp: Date; value: number; confidence: { lower: number; upper: number } }>;
    metrics: {
      mae: number;
      mse: number;
      rmse: number;
      mape: number;
    };
  };

  @ApiPropertyOptional({ description: 'Detected anomalies' })
  anomalies?: Array<{
    timestamp: Date;
    value: number;
    anomalyScore: number;
    description: string;
  }>;

  @ApiPropertyOptional({ description: 'Statistical insights' })
  insights?: Array<{
    type: string;
    description: string;
    significance: number;
  }>;

  @ApiProperty({ description: 'Analysis execution time' })
  @IsNumber()
  executionTime: number;

  @ApiProperty({ description: 'Analysis timestamp' })
  @IsDate()
  analyzedAt: Date;
}

export class StatisticalTestDto {
  @ApiProperty({
    description: 'Dataset ID for statistical testing',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Type of statistical test',
    example: 't_test',
  })
  @IsString()
  @IsNotEmpty()
  testType: string; // 't_test', 'chi_square', 'anova', 'correlation', etc.

  @ApiProperty({
    description: 'Column(s) for the test',
    example: ['group_a_values', 'group_b_values'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  columns: string[];

  @ApiPropertyOptional({
    description: 'Grouping column for group comparisons',
  })
  @IsOptional()
  @IsString()
  groupingColumn?: string;

  @ApiPropertyOptional({
    description: 'Significance level (alpha)',
    default: 0.05,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Max(0.1)
  alpha?: number;

  @ApiPropertyOptional({
    description: 'Alternative hypothesis',
    example: 'two-sided',
  })
  @IsOptional()
  @IsString()
  alternative?: string; // 'two-sided', 'greater', 'less'

  @ApiPropertyOptional({
    description: 'Additional test parameters',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class StatisticalTestResultDto {
  @ApiProperty({ description: 'Test ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiProperty({ description: 'Test type' })
  @IsString()
  testType: string;

  @ApiProperty({ description: 'Test statistic value' })
  @IsNumber()
  testStatistic: number;

  @ApiProperty({ description: 'P-value' })
  @IsNumber()
  pValue: number;

  @ApiPropertyOptional({ description: 'Confidence interval' })
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number;
  };

  @ApiProperty({ description: 'Test conclusion' })
  @IsObject()
  conclusion: {
    isSignificant: boolean;
    description: string;
    recommendation: string;
  };

  @ApiPropertyOptional({ description: 'Effect size' })
  effectSize?: {
    measure: string;
    value: number;
    interpretation: string;
  };

  @ApiPropertyOptional({ description: 'Additional test results' })
  additionalResults?: Record<string, any>;

  @ApiProperty({ description: 'Test execution time' })
  @IsNumber()
  executionTime: number;

  @ApiProperty({ description: 'Test timestamp' })
  @IsDate()
  testedAt: Date;
}

// ========================================
// REAL-TIME ANALYTICS DTOs
// ========================================

export class RealTimeStreamDto {
  @ApiProperty({
    description: 'Stream name',
    example: 'production-metrics',
  })
  @IsString()
  @IsNotEmpty()
  streamName: string;

  @ApiProperty({
    description: 'Data source for the stream',
  })
  @IsUUID()
  dataSourceId: string;

  @ApiPropertyOptional({
    description: 'Stream configuration',
  })
  @IsOptional()
  @IsObject()
  configuration?: {
    batchSize?: number;
    windowSize?: number;
    aggregationFunction?: string;
    filters?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Real-time transformations',
  })
  @IsOptional()
  @IsArray()
  transformations?: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;
}

export class RealTimeMetricsDto {
  @ApiProperty({ description: 'Stream name' })
  @IsString()
  streamName: string;

  @ApiProperty({ description: 'Current data points' })
  @IsArray()
  dataPoints: Array<{
    timestamp: Date;
    values: Record<string, any>;
    metadata?: Record<string, any>;
  }>;

  @ApiProperty({ description: 'Stream statistics' })
  @IsObject()
  statistics: {
    totalEvents: number;
    eventsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    lastUpdateTime: Date;
  };

  @ApiPropertyOptional({ description: 'Real-time alerts' })
  alerts?: Array<{
    type: string;
    severity: AlertSeverity;
    message: string;
    triggeredAt: Date;
  }>;

  @ApiProperty({ description: 'Metrics timestamp' })
  @IsDate()
  timestamp: Date;
}
