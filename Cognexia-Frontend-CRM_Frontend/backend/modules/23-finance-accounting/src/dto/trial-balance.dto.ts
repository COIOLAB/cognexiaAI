/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Trial Balance Data Transfer Objects
 * 
 * Complete DTOs for trial balance operations with validation
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
  IsDateString,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum ReportingFormat {
  STANDARD = 'standard',
  COMPARATIVE = 'comparative',
  DETAILED = 'detailed',
  SUMMARY = 'summary',
  CONSOLIDATED = 'consolidated'
}

export enum ConsolidationLevel {
  LEGAL_ENTITY = 'legal_entity',
  BUSINESS_UNIT = 'business_unit',
  COST_CENTER = 'cost_center',
  CONSOLIDATED = 'consolidated',
  SEGMENT = 'segment'
}

export class TrialBalanceDimensionDto {
  @ApiPropertyOptional({ description: 'Cost centers to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  costCenter?: string[];

  @ApiPropertyOptional({ description: 'Profit centers to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profitCenter?: string[];

  @ApiPropertyOptional({ description: 'Business units to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessUnit?: string[];

  @ApiPropertyOptional({ description: 'Projects to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  project?: string[];
}

export class TrialBalanceAnalysisDto {
  @ApiPropertyOptional({ description: 'Include variance analysis' })
  @IsOptional()
  @IsBoolean()
  includeVarianceAnalysis?: boolean = false;

  @ApiPropertyOptional({ description: 'Include trend analysis' })
  @IsOptional()
  @IsBoolean()
  includeTrendAnalysis?: boolean = false;

  @ApiPropertyOptional({ description: 'Include anomaly detection' })
  @IsOptional()
  @IsBoolean()
  includeAnomalyDetection?: boolean = false;

  @ApiPropertyOptional({ description: 'Include risk assessment' })
  @IsOptional()
  @IsBoolean()
  includeRiskAssessment?: boolean = false;
}

export class CreateTrialBalanceDto {
  @ApiProperty({ description: 'As of date for trial balance' })
  @IsDateString()
  asOfDate: string;

  @ApiProperty({ description: 'Accounting period' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in YYYY-MM format' })
  period: string;

  @ApiProperty({ description: 'Fiscal year' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'Fiscal year must be YYYY format' })
  fiscalYear: string;

  @ApiPropertyOptional({ description: 'Include zero balance accounts' })
  @IsOptional()
  @IsBoolean()
  includeZeroBalances?: boolean = false;

  @ApiPropertyOptional({ description: 'Show account hierarchy' })
  @IsOptional()
  @IsBoolean()
  accountHierarchy?: boolean = true;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be 3-letter ISO code' })
  currency: string;

  @ApiPropertyOptional({ description: 'Consolidation level', enum: ConsolidationLevel })
  @IsOptional()
  @IsEnum(ConsolidationLevel)
  consolidationLevel?: ConsolidationLevel = ConsolidationLevel.LEGAL_ENTITY;

  @ApiPropertyOptional({ description: 'Dimension filters', type: TrialBalanceDimensionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrialBalanceDimensionDto)
  dimensions?: TrialBalanceDimensionDto;

  @ApiPropertyOptional({ description: 'Reporting format', enum: ReportingFormat })
  @IsOptional()
  @IsEnum(ReportingFormat)
  reportingFormat?: ReportingFormat = ReportingFormat.STANDARD;

  @ApiPropertyOptional({ description: 'AI analysis options', type: TrialBalanceAnalysisDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrialBalanceAnalysisDto)
  aiAnalysis?: TrialBalanceAnalysisDto;
}

export class TrialBalanceLineDto {
  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Account code' })
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ description: 'Account type' })
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @ApiProperty({ description: 'Opening balance' })
  @IsNumber()
  openingBalance: number;

  @ApiProperty({ description: 'Period debits' })
  @IsNumber()
  @Min(0)
  periodDebits: number;

  @ApiProperty({ description: 'Period credits' })
  @IsNumber()
  @Min(0)
  periodCredits: number;

  @ApiProperty({ description: 'Closing balance' })
  @IsNumber()
  closingBalance: number;

  @ApiPropertyOptional({ description: 'Parent account ID' })
  @IsOptional()
  @IsString()
  parentAccountId?: string;

  @ApiPropertyOptional({ description: 'Account level in hierarchy' })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;
}

export class TrialBalanceResponseDto {
  @ApiProperty({ description: 'Trial balance header information' })
  @ValidateNested()
  @Type(() => CreateTrialBalanceDto)
  header: CreateTrialBalanceDto;

  @ApiProperty({ description: 'Trial balance lines', type: [TrialBalanceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrialBalanceLineDto)
  lines: TrialBalanceLineDto[];

  @ApiProperty({ description: 'Total debits' })
  @IsNumber()
  @Min(0)
  totalDebits: number;

  @ApiProperty({ description: 'Total credits' })
  @IsNumber()
  @Min(0)
  totalCredits: number;

  @ApiProperty({ description: 'Balance variance (should be 0)' })
  @IsNumber()
  balanceVariance: number;

  @ApiProperty({ description: 'Is trial balance balanced' })
  @IsBoolean()
  isBalanced: boolean;

  @ApiProperty({ description: 'Generation timestamp' })
  @IsDateString()
  generatedAt: string;

  @ApiPropertyOptional({ description: 'AI insights' })
  @IsOptional()
  @IsObject()
  aiInsights?: {
    anomalies?: string[];
    recommendations?: string[];
    riskFactors?: string[];
    confidenceScore?: number;
  };
}

export class ComparativeTrialBalanceDto extends CreateTrialBalanceDto {
  @ApiProperty({ description: 'Comparison period' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Comparison period must be in YYYY-MM format' })
  comparisonPeriod: string;

  @ApiProperty({ description: 'Comparison fiscal year' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'Comparison fiscal year must be YYYY format' })
  comparisonFiscalYear: string;

  @ApiPropertyOptional({ description: 'Show variance columns' })
  @IsOptional()
  @IsBoolean()
  showVariance?: boolean = true;

  @ApiPropertyOptional({ description: 'Show percentage variance' })
  @IsOptional()
  @IsBoolean()
  showPercentageVariance?: boolean = true;
}

export class TrialBalanceQueryDto {
  @ApiPropertyOptional({ description: 'From date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'To date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Account type filter' })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiPropertyOptional({ description: 'Minimum balance filter' })
  @IsOptional()
  @IsNumber()
  minBalance?: number;

  @ApiPropertyOptional({ description: 'Include only posted entries' })
  @IsOptional()
  @IsBoolean()
  postedOnly?: boolean = true;
}
