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
// BASE RESPONSE INTERFACES
// ========================================

export interface AnalyticsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    version?: string;
    requestId?: string;
    pagination?: PaginationMetadata;
    filters?: Record<string, any>;
    customMetadata?: Record<string, any>;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  previousPage?: number;
}

export interface PaginatedAnalyticsResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  metadata?: Record<string, any>;
}

// ========================================
// DATA SOURCE DTOs
// ========================================

export class CreateDataSourceDto {
  @ApiProperty({
    description: 'Data source name',
    example: 'Production Database',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'Data source description',
    example: 'Main production database for manufacturing data',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of data source',
    enum: DataSourceType,
    example: DataSourceType.DATABASE,
  })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiProperty({
    description: 'Data source configuration',
    example: {
      host: 'localhost',
      port: 5432,
      database: 'production',
      username: 'analytics_user',
    },
  })
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Data source schema information',
  })
  @IsOptional()
  @IsObject()
  schema?: {
    tables?: string[];
    fields?: Record<string, any>;
    relationships?: Record<string, any>;
    customSchema?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Is data source active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is real-time data source',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRealTime?: boolean;

  @ApiPropertyOptional({
    description: 'Refresh interval in seconds',
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;
}

export class UpdateDataSourceDto {
  @ApiPropertyOptional({
    description: 'Data source name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Data source description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Data source configuration',
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Data source schema information',
  })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Is data source active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is real-time data source',
  })
  @IsOptional()
  @IsBoolean()
  isRealTime?: boolean;

  @ApiPropertyOptional({
    description: 'Refresh interval in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;
}

export class DataSourceDto {
  @ApiProperty({ description: 'Data source ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Data source name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Data source description' })
  description?: string;

  @ApiProperty({ 
    description: 'Data source type',
    enum: DataSourceType 
  })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiProperty({ description: 'Data source configuration' })
  @IsObject()
  configuration: Record<string, any>;

  @ApiPropertyOptional({ description: 'Data source schema' })
  schema?: Record<string, any>;

  @ApiProperty({ description: 'Is data source active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is real-time data source' })
  @IsBoolean()
  isRealTime: boolean;

  @ApiProperty({ description: 'Refresh interval in seconds' })
  @IsNumber()
  refreshInterval: number;

  @ApiPropertyOptional({ description: 'Data quality metrics' })
  dataQualityMetrics?: {
    completeness?: number;
    accuracy?: number;
    consistency?: number;
    timeliness?: number;
    validity?: number;
    uniqueness?: number;
  };

  @ApiPropertyOptional({ description: 'Last sync timestamp' })
  @IsOptional()
  @IsDate()
  lastSync?: Date;

  @ApiPropertyOptional({ description: 'Next sync timestamp' })
  @IsOptional()
  @IsDate()
  nextSync?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class TestDataSourceConnectionDto {
  @ApiProperty({
    description: 'Data source configuration for testing',
  })
  @IsObject()
  configuration: Record<string, any>;

  @ApiProperty({
    description: 'Data source type',
    enum: DataSourceType,
  })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiPropertyOptional({
    description: 'Connection timeout in seconds',
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  timeout?: number;
}

export class DataSourceConnectionResultDto {
  @ApiProperty({ description: 'Connection success status' })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({ description: 'Connection error message' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Connection latency in milliseconds' })
  latency?: number;

  @ApiPropertyOptional({ description: 'Available schemas/tables' })
  availableSchemas?: string[];

  @ApiPropertyOptional({ description: 'Connection metadata' })
  metadata?: Record<string, any>;
}

// ========================================
// DATASET DTOs
// ========================================

export class CreateDatasetDto {
  @ApiProperty({
    description: 'Dataset name',
    example: 'Sales Analytics',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'Dataset description',
    example: 'Comprehensive sales data for analytics',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Data source ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  dataSourceId: string;

  @ApiProperty({
    description: 'Dataset schema definition',
    example: {
      fields: [
        {
          name: 'sales_amount',
          type: 'decimal',
          nullable: false,
          description: 'Total sales amount'
        }
      ]
    },
  })
  @IsObject()
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

  @ApiProperty({
    description: 'SQL query or transformation logic',
    example: 'SELECT * FROM sales WHERE date >= CURRENT_DATE - INTERVAL 30 DAY',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Is dataset active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is dataset cached',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiPropertyOptional({
    description: 'Cache timeout in seconds',
    default: 3600,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  cacheTimeout?: number;

  @ApiPropertyOptional({
    description: 'Dataset tags',
    example: ['sales', 'revenue', 'monthly'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDatasetDto {
  @ApiPropertyOptional({
    description: 'Dataset name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Dataset description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Dataset schema definition',
  })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'SQL query or transformation logic',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Is dataset active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is dataset cached',
  })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiPropertyOptional({
    description: 'Cache timeout in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  cacheTimeout?: number;

  @ApiPropertyOptional({
    description: 'Dataset tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class DatasetDto {
  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dataset name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Dataset description' })
  description?: string;

  @ApiProperty({ description: 'Data source ID' })
  @IsUUID()
  dataSourceId: string;

  @ApiProperty({ description: 'Dataset schema' })
  @IsObject()
  schema: Record<string, any>;

  @ApiProperty({ description: 'SQL query or transformation logic' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Is dataset active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is dataset cached' })
  @IsBoolean()
  isCached: boolean;

  @ApiProperty({ description: 'Cache timeout in seconds' })
  @IsNumber()
  cacheTimeout: number;

  @ApiProperty({ description: 'Record count' })
  @IsNumber()
  recordCount: number;

  @ApiPropertyOptional({ description: 'Size in bytes' })
  sizeBytes?: number;

  @ApiProperty({ 
    description: 'Data quality level',
    enum: DataQuality 
  })
  @IsEnum(DataQuality)
  dataQuality: DataQuality;

  @ApiPropertyOptional({ description: 'Data quality metrics' })
  qualityMetrics?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
    customMetrics?: Record<string, any>;
  };

  @ApiPropertyOptional({ description: 'Last updated timestamp' })
  @IsOptional()
  @IsDate()
  lastUpdated?: Date;

  @ApiPropertyOptional({ description: 'Dataset tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class DataPreviewDto {
  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiPropertyOptional({
    description: 'Number of rows to preview',
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Columns to include in preview',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({
    description: 'Filters to apply',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export class DataPreviewResultDto {
  @ApiProperty({ description: 'Preview data rows' })
  @IsArray()
  data: Record<string, any>[];

  @ApiProperty({ description: 'Column metadata' })
  @IsArray()
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    description?: string;
  }>;

  @ApiProperty({ description: 'Total number of rows' })
  @IsNumber()
  totalRows: number;

  @ApiProperty({ description: 'Preview execution time in milliseconds' })
  @IsNumber()
  executionTime: number;

  @ApiPropertyOptional({ description: 'Data quality summary' })
  qualitySummary?: {
    completeness: number;
    nullValues: number;
    duplicates: number;
    outliers: number;
  };
}

// ========================================
// DASHBOARD DTOs
// ========================================

export class CreateDashboardDto {
  @ApiProperty({
    description: 'Dashboard name',
    example: 'Sales Performance Dashboard',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'Dashboard description',
    example: 'Comprehensive sales performance analytics dashboard',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Dashboard category',
    example: 'Sales',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Primary dataset ID',
  })
  @IsOptional()
  @IsUUID()
  primaryDatasetId?: string;

  @ApiProperty({
    description: 'Dashboard layout type',
    enum: DashboardLayout,
    example: DashboardLayout.GRID,
  })
  @IsEnum(DashboardLayout)
  layout: DashboardLayout;

  @ApiProperty({
    description: 'Layout configuration',
    example: {
      columns: 12,
      rows: 8,
      gridSize: { width: 1200, height: 800 }
    },
  })
  @IsObject()
  layoutConfiguration: {
    columns?: number;
    rows?: number;
    gridSize?: { width: number; height: number };
    breakpoints?: Record<string, any>;
    customLayout?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Global dashboard filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
    label?: string;
    type?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Global dashboard parameters',
  })
  @IsOptional()
  @IsObject()
  globalParameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Refresh interval in seconds',
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;

  @ApiPropertyOptional({
    description: 'Is dashboard public',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Is real-time dashboard',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRealTime?: boolean;

  @ApiPropertyOptional({
    description: 'Dashboard permissions',
  })
  @IsOptional()
  @IsObject()
  permissions?: {
    view?: string[];
    edit?: string[];
    admin?: string[];
  };

  @ApiPropertyOptional({
    description: 'Dashboard theme configuration',
  })
  @IsOptional()
  @IsObject()
  theme?: {
    colorScheme?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    customStyles?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Export options',
  })
  @IsOptional()
  @IsObject()
  exportOptions?: {
    allowPdf?: boolean;
    allowExcel?: boolean;
    allowImage?: boolean;
    customExports?: string[];
  };

  @ApiPropertyOptional({
    description: 'Dashboard tags',
    example: ['sales', 'performance', 'realtime'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDashboardDto {
  @ApiPropertyOptional({
    description: 'Dashboard name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Dashboard description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Dashboard category',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Dashboard layout type',
    enum: DashboardLayout,
  })
  @IsOptional()
  @IsEnum(DashboardLayout)
  layout?: DashboardLayout;

  @ApiPropertyOptional({
    description: 'Layout configuration',
  })
  @IsOptional()
  @IsObject()
  layoutConfiguration?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Global dashboard filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Global dashboard parameters',
  })
  @IsOptional()
  @IsObject()
  globalParameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Refresh interval in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;

  @ApiPropertyOptional({
    description: 'Is dashboard public',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Is real-time dashboard',
  })
  @IsOptional()
  @IsBoolean()
  isRealTime?: boolean;

  @ApiPropertyOptional({
    description: 'Dashboard permissions',
  })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Dashboard theme configuration',
  })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Export options',
  })
  @IsOptional()
  @IsObject()
  exportOptions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Dashboard tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class DashboardDto {
  @ApiProperty({ description: 'Dashboard ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dashboard name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Dashboard category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Primary dataset ID' })
  primaryDatasetId?: string;

  @ApiProperty({ 
    description: 'Dashboard layout type',
    enum: DashboardLayout 
  })
  @IsEnum(DashboardLayout)
  layout: DashboardLayout;

  @ApiProperty({ description: 'Layout configuration' })
  @IsObject()
  layoutConfiguration: Record<string, any>;

  @ApiPropertyOptional({ description: 'Global dashboard filters' })
  filters?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Global dashboard parameters' })
  globalParameters?: Record<string, any>;

  @ApiProperty({ description: 'Refresh interval in seconds' })
  @IsNumber()
  refreshInterval: number;

  @ApiProperty({ description: 'Is dashboard active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is dashboard public' })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ description: 'Is real-time dashboard' })
  @IsBoolean()
  isRealTime: boolean;

  @ApiPropertyOptional({ description: 'Dashboard permissions' })
  permissions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Dashboard theme configuration' })
  theme?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Export options' })
  exportOptions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Dashboard tags' })
  tags?: string[];

  @ApiProperty({ description: 'View count' })
  @IsNumber()
  viewCount: number;

  @ApiPropertyOptional({ description: 'Last viewed timestamp' })
  @IsOptional()
  @IsDate()
  lastViewed?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Dashboard widgets' })
  widgets?: DashboardWidgetDto[];
}

export class CreateDashboardWidgetDto {
  @ApiProperty({
    description: 'Widget title',
    example: 'Monthly Sales Trend',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({
    description: 'Widget description',
    example: 'Shows monthly sales trend over the last 12 months',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Widget visualization type',
    enum: VisualizationType,
    example: VisualizationType.LINE_CHART,
  })
  @IsEnum(VisualizationType)
  type: VisualizationType;

  @ApiPropertyOptional({
    description: 'Analytics query ID for widget data',
  })
  @IsOptional()
  @IsUUID()
  queryId?: string;

  @ApiProperty({
    description: 'Widget position and size',
    example: {
      x: 0,
      y: 0,
      width: 6,
      height: 4
    },
  })
  @IsObject()
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

  @ApiProperty({
    description: 'Widget configuration',
    example: {
      chartType: 'line',
      aggregation: 'sum',
      groupBy: ['month'],
      colors: ['#007bff', '#28a745']
    },
  })
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Widget styling options',
  })
  @IsOptional()
  @IsObject()
  styling?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    customStyles?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Widget-specific filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;

  @ApiPropertyOptional({
    description: 'Widget refresh interval in seconds',
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;

  @ApiPropertyOptional({
    description: 'Drill-down configuration',
  })
  @IsOptional()
  @IsObject()
  drillDownConfiguration?: {
    enabled?: boolean;
    targetDashboard?: string;
    parameters?: Record<string, any>;
  };
}

export class UpdateDashboardWidgetDto {
  @ApiPropertyOptional({
    description: 'Widget title',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Widget description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Widget visualization type',
    enum: VisualizationType,
  })
  @IsOptional()
  @IsEnum(VisualizationType)
  type?: VisualizationType;

  @ApiPropertyOptional({
    description: 'Analytics query ID for widget data',
  })
  @IsOptional()
  @IsUUID()
  queryId?: string;

  @ApiPropertyOptional({
    description: 'Widget position and size',
  })
  @IsOptional()
  @IsObject()
  position?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Widget configuration',
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Widget styling options',
  })
  @IsOptional()
  @IsObject()
  styling?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Widget-specific filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Widget refresh interval in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(86400)
  refreshInterval?: number;

  @ApiPropertyOptional({
    description: 'Is widget active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Is widget visible',
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Drill-down configuration',
  })
  @IsOptional()
  @IsObject()
  drillDownConfiguration?: Record<string, any>;
}

export class DashboardWidgetDto {
  @ApiProperty({ description: 'Widget ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Dashboard ID' })
  @IsUUID()
  dashboardId: string;

  @ApiProperty({ description: 'Widget title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Widget description' })
  description?: string;

  @ApiProperty({ 
    description: 'Widget visualization type',
    enum: VisualizationType 
  })
  @IsEnum(VisualizationType)
  type: VisualizationType;

  @ApiPropertyOptional({ description: 'Analytics query ID' })
  queryId?: string;

  @ApiProperty({ description: 'Widget position and size' })
  @IsObject()
  position: Record<string, any>;

  @ApiProperty({ description: 'Widget configuration' })
  @IsObject()
  configuration: Record<string, any>;

  @ApiPropertyOptional({ description: 'Widget styling options' })
  styling?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Widget-specific filters' })
  filters?: Array<Record<string, any>>;

  @ApiProperty({ description: 'Widget refresh interval in seconds' })
  @IsNumber()
  refreshInterval: number;

  @ApiProperty({ description: 'Is widget active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is widget visible' })
  @IsBoolean()
  isVisible: boolean;

  @ApiPropertyOptional({ description: 'Drill-down configuration' })
  drillDownConfiguration?: Record<string, any>;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Widget data' })
  data?: any;

  @ApiPropertyOptional({ description: 'Widget execution metadata' })
  executionMetadata?: {
    executionTime?: number;
    dataPoints?: number;
    lastRefresh?: Date;
    nextRefresh?: Date;
  };
}

// ========================================
// ANALYTICS QUERY DTOs
// ========================================

export class CreateAnalyticsQueryDto {
  @ApiProperty({
    description: 'Query name',
    example: 'Monthly Sales Analysis',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'Query description',
    example: 'Analyzes monthly sales trends and patterns',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Dataset ID for the query',
  })
  @IsUUID()
  datasetId: string;

  @ApiProperty({
    description: 'Type of analytics',
    enum: AnalyticsType,
    example: AnalyticsType.DESCRIPTIVE,
  })
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @ApiProperty({
    description: 'SQL query or analysis definition',
    example: 'SELECT DATE_TRUNC(\'month\', order_date) as month, SUM(total_amount) as revenue FROM orders GROUP BY month ORDER BY month',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Query parameters',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Query filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
    condition?: 'AND' | 'OR';
  }>;

  @ApiPropertyOptional({
    description: 'Aggregations to apply',
  })
  @IsOptional()
  @IsArray()
  aggregations?: Array<{
    field: string;
    function: string;
    alias?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Group by fields',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({
    description: 'Order by specification',
  })
  @IsOptional()
  @IsArray()
  orderBy?: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;

  @ApiPropertyOptional({
    description: 'Result limit',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Is query result cached',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiPropertyOptional({
    description: 'Cache timeout in seconds',
    default: 3600,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  cacheTimeout?: number;
}

export class UpdateAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Query name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Query description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of analytics',
    enum: AnalyticsType,
  })
  @IsOptional()
  @IsEnum(AnalyticsType)
  type?: AnalyticsType;

  @ApiPropertyOptional({
    description: 'SQL query or analysis definition',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Query parameters',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Query filters',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Aggregations to apply',
  })
  @IsOptional()
  @IsArray()
  aggregations?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Group by fields',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({
    description: 'Order by specification',
  })
  @IsOptional()
  @IsArray()
  orderBy?: Array<Record<string, any>>;

  @ApiPropertyOptional({
    description: 'Result limit',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Is query result cached',
  })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiPropertyOptional({
    description: 'Cache timeout in seconds',
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  cacheTimeout?: number;

  @ApiPropertyOptional({
    description: 'Is query active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AnalyticsQueryDto {
  @ApiProperty({ description: 'Query ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Query name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Query description' })
  description?: string;

  @ApiProperty({ description: 'Dataset ID' })
  @IsUUID()
  datasetId: string;

  @ApiProperty({ 
    description: 'Type of analytics',
    enum: AnalyticsType 
  })
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @ApiProperty({ description: 'SQL query or analysis definition' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Query parameters' })
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Query filters' })
  filters?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Aggregations' })
  aggregations?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Group by fields' })
  groupBy?: string[];

  @ApiPropertyOptional({ description: 'Order by specification' })
  orderBy?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Result limit' })
  limit?: number;

  @ApiProperty({ description: 'Is query result cached' })
  @IsBoolean()
  isCached: boolean;

  @ApiProperty({ description: 'Cache timeout in seconds' })
  @IsNumber()
  cacheTimeout: number;

  @ApiProperty({ description: 'Is query active' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Execution metrics' })
  executionMetrics?: {
    averageExecutionTime?: number;
    lastExecutionTime?: number;
    executionCount?: number;
    errorCount?: number;
    lastError?: string;
  };

  @ApiPropertyOptional({ description: 'Last executed timestamp' })
  @IsOptional()
  @IsDate()
  lastExecuted?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class ExecuteQueryDto {
  @ApiProperty({
    description: 'Query ID to execute',
  })
  @IsUUID()
  queryId: string;

  @ApiPropertyOptional({
    description: 'Runtime parameters to override query defaults',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Runtime filters to apply',
  })
  @IsOptional()
  @IsArray()
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;

  @ApiPropertyOptional({
    description: 'Override result limit',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Result offset for pagination',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Force fresh execution (skip cache)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;

  @ApiPropertyOptional({
    description: 'Execution timeout in seconds',
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(3600)
  timeout?: number;
}

export class QueryExecutionResultDto {
  @ApiProperty({ description: 'Execution ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Query ID' })
  @IsUUID()
  queryId: string;

  @ApiProperty({ 
    description: 'Execution status',
    enum: ProcessingStatus 
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiProperty({ description: 'Execution timestamp' })
  @IsDate()
  executedAt: Date;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Execution time in milliseconds' })
  executionTime?: number;

  @ApiProperty({ description: 'Number of result rows' })
  @IsNumber()
  resultCount: number;

  @ApiPropertyOptional({ description: 'Result data (for small results)' })
  resultData?: any[];

  @ApiPropertyOptional({ description: 'Storage location for large results' })
  resultStorageLocation?: string;

  @ApiPropertyOptional({ description: 'Execution metrics' })
  metrics?: {
    memoryUsage?: number;
    cpuUsage?: number;
    diskReads?: number;
    networkTraffic?: number;
  };

  @ApiPropertyOptional({ description: 'Error message if execution failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;
}

// ========================================
// MACHINE LEARNING DTOs
// ========================================

export class CreateMLModelDto {
  @ApiProperty({
    description: 'ML model name',
    example: 'Sales Forecasting Model',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    description: 'ML model description',
    example: 'LSTM model for predicting monthly sales based on historical data',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of ML model',
    enum: ModelType,
    example: ModelType.LSTM,
  })
  @IsEnum(ModelType)
  type: ModelType;

  @ApiProperty({
    description: 'Training dataset ID',
  })
  @IsUUID()
  trainingDatasetId: string;

  @ApiProperty({
    description: 'Model configuration',
    example: {
      algorithm: 'LSTM',
      hyperparameters: {
        learningRate: 0.001,
        epochs: 100,
        batchSize: 32
      },
      featureColumns: ['sales_amount', 'date', 'product_category'],
      targetColumn: 'future_sales'
    },
  })
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Model tags',
    example: ['forecasting', 'sales', 'lstm'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateMLModelDto {
  @ApiPropertyOptional({
    description: 'ML model name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({
    description: 'ML model description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Model configuration',
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Is model active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Model version',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Model tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class MLModelDto {
  @ApiProperty({ description: 'Model ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Model name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Model description' })
  description?: string;

  @ApiProperty({ 
    description: 'Model type',
    enum: ModelType 
  })
  @IsEnum(ModelType)
  type: ModelType;

  @ApiProperty({ description: 'Training dataset ID' })
  @IsUUID()
  trainingDatasetId: string;

  @ApiProperty({ description: 'Model configuration' })
  @IsObject()
  configuration: Record<string, any>;

  @ApiProperty({ 
    description: 'Model status',
    enum: ProcessingStatus 
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiPropertyOptional({ description: 'Training metrics' })
  trainingMetrics?: {
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

  @ApiPropertyOptional({ description: 'Validation metrics' })
  validationMetrics?: {
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

  @ApiPropertyOptional({ description: 'Model storage location' })
  modelStorageLocation?: string;

  @ApiPropertyOptional({ description: 'Training time in milliseconds' })
  trainingTime?: number;

  @ApiPropertyOptional({ description: 'Trained timestamp' })
  @IsOptional()
  @IsDate()
  trainedAt?: Date;

  @ApiPropertyOptional({ description: 'Last used timestamp' })
  @IsOptional()
  @IsDate()
  lastUsed?: Date;

  @ApiProperty({ description: 'Prediction count' })
  @IsNumber()
  predictionCount: number;

  @ApiProperty({ description: 'Is model active' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Model version' })
  version?: string;

  @ApiPropertyOptional({ description: 'Model tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class TrainMLModelDto {
  @ApiProperty({
    description: 'ML model ID to train',
  })
  @IsUUID()
  modelId: string;

  @ApiPropertyOptional({
    description: 'Override training configuration',
  })
  @IsOptional()
  @IsObject()
  trainingConfig?: {
    hyperparameters?: Record<string, any>;
    trainingRatio?: number;
    validationRatio?: number;
    testRatio?: number;
    customConfig?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Force retrain even if model exists',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRetrain?: boolean;

  @ApiPropertyOptional({
    description: 'Training timeout in seconds',
    default: 3600,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  timeout?: number;
}

export class CreateMLPredictionDto {
  @ApiProperty({
    description: 'ML model ID for prediction',
  })
  @IsUUID()
  modelId: string;

  @ApiProperty({
    description: 'Input data for prediction',
    example: {
      sales_amount: 15000,
      date: '2024-01-01',
      product_category: 'Electronics'
    },
  })
  @IsObject()
  inputData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Prediction metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MLPredictionDto {
  @ApiProperty({ description: 'Prediction ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Model ID' })
  @IsUUID()
  modelId: string;

  @ApiProperty({ description: 'Input data' })
  @IsObject()
  inputData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Prediction output' })
  outputData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Prediction confidence' })
  confidence?: number;

  @ApiProperty({ 
    description: 'Prediction status',
    enum: ProcessingStatus 
  })
  @IsEnum(ProcessingStatus)
  status: ProcessingStatus;

  @ApiPropertyOptional({ description: 'Processing time in milliseconds' })
  processingTime?: number;

  @ApiPropertyOptional({ description: 'Error message if prediction failed' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Prediction metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  createdAt: Date;
}

// Continue in next part...
