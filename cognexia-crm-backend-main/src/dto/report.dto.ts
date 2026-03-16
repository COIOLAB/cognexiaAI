import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ChartType } from '../entities/report.entity';
import { ScheduleFrequency, DeliveryFormat } from '../entities/report-schedule.entity';

export class ReportFilterDto {
  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty()
  @IsString()
  operator: string; // 'equals', 'contains', 'greaterThan', 'lessThan', 'between', etc.

  @ApiProperty()
  value: any;
}

export class ReportAggregationDto {
  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty({ enum: ['sum', 'avg', 'count', 'min', 'max'] })
  @IsEnum(['sum', 'avg', 'count', 'min', 'max'])
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export class ReportConfigDto {
  @ApiProperty({ description: 'Entity to report on' })
  @IsString()
  entity: string;

  @ApiProperty({ description: 'Columns to display', type: [String] })
  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @ApiPropertyOptional({ type: [ReportFilterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportFilterDto)
  filters?: ReportFilterDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ type: [ReportAggregationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportAggregationDto)
  aggregations?: ReportAggregationDto[];
}

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ enum: ChartType })
  @IsEnum(ChartType)
  chartType: ChartType;

  @ApiProperty({ type: ReportConfigDto })
  @ValidateNested()
  @Type(() => ReportConfigDto)
  config: ReportConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class UpdateReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ChartType })
  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @ApiPropertyOptional({ type: ReportConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportConfigDto)
  config?: ReportConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class CreateReportScheduleDto {
  @ApiProperty()
  @IsString()
  reportId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ScheduleFrequency })
  @IsEnum(ScheduleFrequency)
  frequency: ScheduleFrequency;

  @ApiProperty({ enum: DeliveryFormat })
  @IsEnum(DeliveryFormat)
  format: DeliveryFormat;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiPropertyOptional({ description: 'Time in HH:MM:SS format' })
  @IsOptional()
  @IsString()
  scheduleTime?: string;

  @ApiPropertyOptional({ description: 'Day of week (0-6) for weekly schedules' })
  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: 'Day of month (1-31) for monthly schedules' })
  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;
}

export class UpdateReportScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ScheduleFrequency })
  @IsOptional()
  @IsEnum(ScheduleFrequency)
  frequency?: ScheduleFrequency;

  @ApiPropertyOptional({ enum: DeliveryFormat })
  @IsOptional()
  @IsEnum(DeliveryFormat)
  format?: DeliveryFormat;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduleTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RunReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Override report config filters' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportFilterDto)
  additionalFilters?: ReportFilterDto[];
}

export class FunnelAnalysisDto {
  @ApiProperty({ description: 'Pipeline stage IDs in order' })
  @IsArray()
  @IsString({ each: true })
  stages: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CohortAnalysisDto {
  @ApiProperty({ enum: ['week', 'month', 'quarter'] })
  @IsEnum(['week', 'month', 'quarter'])
  cohortPeriod: 'week' | 'month' | 'quarter';

  @ApiProperty({ description: 'Metric to track (e.g., revenue, retention)' })
  @IsString()
  metric: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  periodsToShow?: number; // Number of periods after cohort creation to show
}

export class RevenueForecastDto {
  @ApiPropertyOptional({ description: 'Months to forecast', default: 6 })
  @IsOptional()
  @IsNumber()
  months?: number;

  @ApiPropertyOptional({ description: 'Include seasonal trends', default: true })
  @IsOptional()
  @IsBoolean()
  includeSeasonal?: boolean;

  @ApiPropertyOptional({ description: 'Confidence interval (0-1)', default: 0.95 })
  @IsOptional()
  @IsNumber()
  confidenceInterval?: number;
}
