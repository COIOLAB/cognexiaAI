/**
 * Budget DTOs - Data Transfer Objects
 * 
 * DTOs for budget management, providing strongly typed data structures for
 * API requests and responses with validation and documentation for financial
 * planning and control.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID, 
  IsEnum, 
  IsNumber, 
  IsDateString,
  ValidateNested,
  IsArray,
  IsBoolean,
  Min
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

// Enum definitions for validation
export enum BudgetType {
  OPERATING = 'OPERATING',
  CAPITAL = 'CAPITAL',
  CASH_FLOW = 'CASH_FLOW',
  PROJECT = 'PROJECT',
  DEPARTMENT = 'DEPARTMENT',
  STRATEGIC = 'STRATEGIC',
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  CLOSED = 'CLOSED',
}

export enum PeriodType {
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  ROLLING = 'ROLLING',
}

export class BudgetDimensionsDto {
  @ApiProperty({ description: 'Cost center', required: false })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiProperty({ description: 'Profit center', required: false })
  @IsOptional()
  @IsString()
  profitCenter?: string;

  @ApiProperty({ description: 'Business unit', required: false })
  @IsOptional()
  @IsString()
  businessUnit?: string;

  @ApiProperty({ description: 'Project ID', required: false })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;
}

export class CreateBudgetDto {
  @ApiProperty({ description: 'Budget name' })
  @IsString()
  @IsNotEmpty()
  budgetName: string;

  @ApiProperty({ description: 'Budget type', enum: BudgetType })
  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @ApiProperty({ description: 'Budget period identifier (e.g., 2024-Q1)' })
  @IsString()
  @IsNotEmpty()
  budgetPeriod: string;

  @ApiProperty({ description: 'Fiscal year' })
  @IsNumber()
  fiscalYear: number;

  @ApiProperty({ description: 'Period start date' })
  @IsDateString()
  periodStartDate: string;

  @ApiProperty({ description: 'Period end date' })
  @IsDateString()
  periodEndDate: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'Account ID' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Multi-dimensional budget allocations', type: BudgetDimensionsDto })
  @ValidateNested()
  @Type(() => BudgetDimensionsDto)
  dimensions: BudgetDimensionsDto;

  @ApiProperty({ description: 'Original budgeted amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  originalAmount: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string = 'USD';
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @ApiProperty({ description: 'Revised budget amount', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : undefined)
  revisedAmount?: number;
}

export class BudgetResponseDto extends CreateBudgetDto {
  @ApiProperty({ description: 'Budget ID' })
  @IsUUID()
  budgetId: string;

  @ApiProperty({ description: 'Account code' })
  @IsString()
  accountCode: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  accountName: string;

  @ApiProperty({ description: 'Revised budget amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  revisedAmount: number;

  @ApiProperty({ description: 'Actual spent/received amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  actualAmount: number;

  @ApiProperty({ description: 'Committed/encumbered amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  commitmentAmount: number;

  @ApiProperty({ description: 'Available budget amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  availableAmount: number;

  @ApiProperty({ description: 'Variance from budget', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  variance: number;

  @ApiProperty({ description: 'Variance percentage', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  variancePercent: number;

  @ApiProperty({ description: 'Budget status', enum: BudgetStatus })
  @IsEnum(BudgetStatus)
  status: BudgetStatus;

  @ApiProperty({ description: 'Budget version number' })
  @IsNumber()
  budgetVersion: number;

  @ApiProperty({ description: 'Is this the active version?' })
  @IsBoolean()
  isActive: boolean;
}

