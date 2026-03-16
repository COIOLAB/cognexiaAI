/**
 * Chart of Accounts DTOs - Data Transfer Objects
 * 
 * DTOs for chart of accounts management, providing strongly typed data structures
 * for API requests and responses with validation and documentation.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enum definitions for validation
export enum AccountType {
  ASSETS = 'ASSETS',
  LIABILITIES = 'LIABILITIES',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSES = 'EXPENSES',
  CONTRA = 'CONTRA',
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class ConsolidationMappingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  consolidationAccount: string;

  @ApiProperty()
  @IsString({ each: true })
  eliminationRules: string[];

  @ApiProperty()
  @IsString()
  intercompanyTreatment: string;
}

export class ReportingLinesDto {
  // ... (Add properties for reporting lines)
}

export class AccountDimensionsDto {
  // ... (Add properties for dimensions)
}

export class ValidationRulesDto {
  // ... (Add properties for validation rules)
}

export class AIConfigurationDto {
  // ... (Add properties for AI configuration)
}

export class CreateChartOfAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  parentAccountId?: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty()
  @IsString()
  accountCategory: string;

  @ApiProperty({ enum: NormalBalance })
  @IsEnum(NormalBalance)
  normalBalance: NormalBalance;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsBoolean()
  allowManualEntries: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsolidationMappingDto)
  consolidationMapping?: ConsolidationMappingDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportingLinesDto)
  reportingLines?: ReportingLinesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccountDimensionsDto)
  dimensions?: AccountDimensionsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationRulesDto)
  validationRules?: ValidationRulesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIConfigurationDto)
  aiConfiguration?: AIConfigurationDto;
}

export class UpdateChartOfAccountDto extends PartialType(CreateChartOfAccountDto) {}

export class ChartOfAccountResponseDto extends CreateChartOfAccountDto {
  @ApiProperty()
  @IsUUID()
  accountId: string;

  @ApiProperty()
  @IsNumber()
  hierarchyLevel: number;

  @ApiProperty()
  @IsString()
  fullPath: string;
}

