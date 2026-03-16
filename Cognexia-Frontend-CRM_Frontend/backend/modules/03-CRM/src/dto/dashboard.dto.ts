import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum DashboardType {
  PERSONAL = 'personal',
  TEAM = 'team',
  ORGANIZATIONAL = 'organizational',
  EXECUTIVE = 'executive',
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  LIST = 'list',
  MAP = 'map',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
}

export class WidgetLayoutDto {
  @ApiProperty({ description: 'X position in grid', minimum: 0 })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({ description: 'Y position in grid', minimum: 0 })
  @IsNumber()
  @Min(0)
  y: number;

  @ApiProperty({ description: 'Width in grid units', minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  width: number;

  @ApiProperty({ description: 'Height in grid units', minimum: 1 })
  @IsNumber()
  @Min(1)
  height: number;
}

export class DashboardWidgetDto {
  @ApiProperty({ description: 'Widget ID (unique within dashboard)' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Widget title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Widget type', enum: WidgetType })
  @IsEnum(WidgetType)
  type: WidgetType;

  @ApiPropertyOptional({ description: 'Chart type (if widget type is CHART)', enum: ChartType })
  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @ApiProperty({ description: 'Data source query/configuration' })
  @IsObject()
  dataSource: Record<string, any>;

  @ApiProperty({ description: 'Widget layout', type: WidgetLayoutDto })
  @ValidateNested()
  @Type(() => WidgetLayoutDto)
  layout: WidgetLayoutDto;

  @ApiPropertyOptional({ description: 'Widget-specific configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Refresh interval in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refreshInterval?: number;
}

export class CreateDashboardDto {
  @ApiProperty({ description: 'Dashboard name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Dashboard type', enum: DashboardType })
  @IsEnum(DashboardType)
  type: DashboardType;

  @ApiProperty({ description: 'Dashboard widgets', type: [DashboardWidgetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardWidgetDto)
  widgets: DashboardWidgetDto[];

  @ApiPropertyOptional({ description: 'Is dashboard default for user' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiPropertyOptional({ description: 'Is dashboard public (visible to others in organization)' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {}

export class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Filter by dashboard type', enum: DashboardType })
  @IsOptional()
  @IsEnum(DashboardType)
  type?: DashboardType;

  @ApiPropertyOptional({ description: 'Filter by public/private' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class DashboardDataRequestDto {
  @ApiProperty({ description: 'Widget ID' })
  @IsString()
  @IsNotEmpty()
  widgetId: string;

  @ApiPropertyOptional({ description: 'Start date for data range' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for data range' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Additional filters' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
