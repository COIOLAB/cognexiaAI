/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Dimension Data Transfer Objects
 * 
 * Complete DTOs for chart of accounts dimensions and multi-dimensional reporting
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOX, GAAP, IFRS
 */

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum DimensionType {
  COST_CENTER = 'cost_center',
  PROJECT = 'project',
  DEPARTMENT = 'department',
  LOCATION = 'location',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  PRODUCT = 'product',
  REGION = 'region',
  BUSINESS_UNIT = 'business_unit',
  CUSTOM = 'custom'
}

export enum DimensionDataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum'
}

export enum DimensionSource {
  MANUAL = 'manual',
  SYSTEM = 'system',
  INTEGRATION = 'integration',
  CALCULATED = 'calculated'
}

export class DimensionValidationDto {
  @ApiPropertyOptional({ description: 'Minimum length for string values' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minLength?: number;

  @ApiPropertyOptional({ description: 'Maximum length for string values' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum value for numeric types' })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum value for numeric types' })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Regular expression pattern' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Allowed values for enum type', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedValues?: string[];

  @ApiPropertyOptional({ description: 'Required field flag' })
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  @ApiPropertyOptional({ description: 'Unique value constraint' })
  @IsOptional()
  @IsBoolean()
  unique?: boolean = false;
}

export class DimensionHierarchyDto {
  @ApiPropertyOptional({ description: 'Parent dimension ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Hierarchy level (0 = root)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number = 0;

  @ApiPropertyOptional({ description: 'Full path from root' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'Has child dimensions' })
  @IsOptional()
  @IsBoolean()
  hasChildren?: boolean = false;

  @ApiPropertyOptional({ description: 'Sort order within level' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}

export class DimensionSecurityDto {
  @ApiPropertyOptional({ description: 'Restricted access flag' })
  @IsOptional()
  @IsBoolean()
  restricted?: boolean = false;

  @ApiPropertyOptional({ description: 'Allowed user IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedUsers?: string[];

  @ApiPropertyOptional({ description: 'Allowed role IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @ApiPropertyOptional({ description: 'Data classification level' })
  @IsOptional()
  @IsString()
  classificationLevel?: string;

  @ApiPropertyOptional({ description: 'Audit required for changes' })
  @IsOptional()
  @IsBoolean()
  auditRequired?: boolean = false;
}

export class DimensionIntegrationDto {
  @ApiPropertyOptional({ description: 'Source system identifier' })
  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @ApiPropertyOptional({ description: 'External ID in source system' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Last sync timestamp' })
  @IsOptional()
  @IsDateString()
  lastSyncDate?: string;

  @ApiPropertyOptional({ description: 'Sync frequency in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  syncFrequency?: number;

  @ApiPropertyOptional({ description: 'Auto sync enabled' })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean = false;

  @ApiPropertyOptional({ description: 'Mapping configuration' })
  @IsOptional()
  @IsObject()
  mappingConfig?: Record<string, any>;
}

export class CreateDimensionDto {
  @ApiProperty({ description: 'Dimension code (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Code must contain only uppercase letters, numbers, and underscores' })
  code: string;

  @ApiProperty({ description: 'Dimension name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Dimension type', enum: DimensionType })
  @IsEnum(DimensionType)
  type: DimensionType;

  @ApiProperty({ description: 'Data type', enum: DimensionDataType })
  @IsEnum(DimensionDataType)
  dataType: DimensionDataType;

  @ApiPropertyOptional({ description: 'Dimension description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Default value' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Data source', enum: DimensionSource })
  @IsOptional()
  @IsEnum(DimensionSource)
  source?: DimensionSource = DimensionSource.MANUAL;

  @ApiPropertyOptional({ description: 'Validation rules', type: DimensionValidationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionValidationDto)
  validation?: DimensionValidationDto;

  @ApiPropertyOptional({ description: 'Hierarchy settings', type: DimensionHierarchyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionHierarchyDto)
  hierarchy?: DimensionHierarchyDto;

  @ApiPropertyOptional({ description: 'Security settings', type: DimensionSecurityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionSecurityDto)
  security?: DimensionSecurityDto;

  @ApiPropertyOptional({ description: 'Integration settings', type: DimensionIntegrationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionIntegrationDto)
  integration?: DimensionIntegrationDto;

  @ApiPropertyOptional({ description: 'Dimension is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Allow manual entry' })
  @IsOptional()
  @IsBoolean()
  allowManualEntry?: boolean = true;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Custom properties' })
  @IsOptional()
  @IsObject()
  customProperties?: Record<string, any>;
}

export class UpdateDimensionDto extends PartialType(CreateDimensionDto) {
  @ApiPropertyOptional({ description: 'Last modified date' })
  @IsOptional()
  @IsDateString()
  lastModifiedDate?: string;
}

export class DimensionResponseDto extends CreateDimensionDto {
  @ApiProperty({ description: 'Dimension ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'Last update date' })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiPropertyOptional({ description: 'Last modified by user ID' })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @ApiPropertyOptional({ description: 'Usage count in transactions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  usageCount?: number = 0;
}

export class DimensionValueDto {
  @ApiProperty({ description: 'Dimension value ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Dimension ID this value belongs to' })
  @IsString()
  @IsNotEmpty()
  dimensionId: string;

  @ApiProperty({ description: 'Value code (unique within dimension)' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Value description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: 'Parent value ID for hierarchical dimensions' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Hierarchy level' })
  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number = 0;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid to date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ description: 'Value is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Additional attributes' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'Last update date' })
  @IsDateString()
  updatedAt: string;
}

export class CreateDimensionValueDto {
  @ApiProperty({ description: 'Value code (unique within dimension)' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Value description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: 'Parent value ID for hierarchical dimensions' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid to date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ description: 'Value is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Additional attributes' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class UpdateDimensionValueDto extends PartialType(CreateDimensionValueDto) {}

export class DimensionAssignmentDto {
  @ApiProperty({ description: 'Transaction ID or account ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Entity type (transaction, account, etc.)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Dimension assignments as key-value pairs' })
  @IsObject()
  dimensions: Record<string, string>;

  @ApiPropertyOptional({ description: 'Assignment effective from' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Assignment effective to' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class DimensionReportingDto {
  @ApiProperty({ description: 'Report dimensions to include', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  dimensions: string[];

  @ApiPropertyOptional({ description: 'Dimension filters' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, string[]>;

  @ApiPropertyOptional({ description: 'Grouping dimensions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @ApiPropertyOptional({ description: 'Date range for report' })
  @IsOptional()
  @IsObject()
  dateRange?: {
    from: string;
    to: string;
  };

  @ApiPropertyOptional({ description: 'Include inactive values' })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean = false;
}
