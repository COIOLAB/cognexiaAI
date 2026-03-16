import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsType {
  PRODUCTION = 'production',
  QUALITY = 'quality',
  OEE = 'oee',
  DOWNTIME = 'downtime',
  EFFICIENCY = 'efficiency',
  COST = 'cost',
  ENERGY = 'energy',
  MAINTENANCE = 'maintenance',
  INVENTORY = 'inventory',
  SAFETY = 'safety'
}

export enum TimeFrame {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  STDDEV = 'stddev'
}

export enum GroupBy {
  WORK_CENTER = 'work_center',
  PRODUCTION_LINE = 'production_line',
  PRODUCT = 'product',
  SHIFT = 'shift',
  OPERATOR = 'operator',
  DATE = 'date',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export class AnalyticsQueryDto {
  @ApiProperty({ 
    description: 'Type of analytics to query',
    enum: AnalyticsType
  })
  @IsEnum(AnalyticsType)
  analyticsType: AnalyticsType;

  @ApiProperty({ 
    description: 'Time frame for the query',
    enum: TimeFrame
  })
  @IsEnum(TimeFrame)
  timeFrame: TimeFrame;

  @ApiPropertyOptional({ description: 'Start date for custom time frame' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom time frame' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Aggregation type',
    enum: AggregationType,
    default: AggregationType.SUM
  })
  @IsOptional()
  @IsEnum(AggregationType)
  aggregation?: AggregationType = AggregationType.SUM;

  @ApiPropertyOptional({ 
    description: 'Group results by',
    enum: GroupBy,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(GroupBy, { each: true })
  groupBy?: GroupBy[];

  @ApiPropertyOptional({ description: 'Work center IDs to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workCenterIds?: string[];

  @ApiPropertyOptional({ description: 'Production line IDs to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productionLineIds?: string[];

  @ApiPropertyOptional({ description: 'Product codes to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productCodes?: string[];

  @ApiPropertyOptional({ description: 'Production order IDs to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productionOrderIds?: string[];

  @ApiPropertyOptional({ description: 'Shift names to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shifts?: string[];

  @ApiPropertyOptional({ description: 'Operator IDs to filter by' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  operatorIds?: string[];

  @ApiPropertyOptional({ description: 'Specific metrics to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({ 
    description: 'Minimum threshold for filtering results',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minThreshold?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum threshold for filtering results',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxThreshold?: number;

  @ApiPropertyOptional({ 
    description: 'Include trend analysis',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrend?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Include comparison with previous period',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeComparison?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Include forecasting',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeForecast?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Include anomaly detection',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAnomalies?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    minimum: 1,
    maximum: 1000,
    default: 50
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Additional filters as key-value pairs' })
  @IsOptional()
  filters?: Record<string, any>;
}
