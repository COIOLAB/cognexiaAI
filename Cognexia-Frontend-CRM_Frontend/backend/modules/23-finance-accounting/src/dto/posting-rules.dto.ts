/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Posting Rules Data Transfer Objects
 * 
 * Complete DTOs for posting rules and automated posting operations
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

export enum SourceModule {
  AP = 'ap',
  AR = 'ar',
  INVENTORY = 'inventory',
  PAYROLL = 'payroll',
  ASSETS = 'assets',
  BANKING = 'banking',
  SALES = 'sales',
  PURCHASE = 'purchase',
  MANUFACTURING = 'manufacturing',
  MAINTENANCE = 'maintenance'
}

export enum PostingFrequency {
  REAL_TIME = 'real_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export enum DebitCreditIndicator {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  CONDITIONAL = 'CONDITIONAL'
}

export class PostingConditionsDto {
  @ApiPropertyOptional({ description: 'Account filters', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accountFilters?: string[];

  @ApiPropertyOptional({ description: 'Amount range filter' })
  @IsOptional()
  @IsObject()
  amountRange?: {
    min: number;
    max: number;
  };

  @ApiPropertyOptional({ description: 'Date range filter' })
  @IsOptional()
  @IsObject()
  dateRange?: {
    from: string;
    to: string;
  };

  @ApiPropertyOptional({ description: 'Dimension filters' })
  @IsOptional()
  @IsObject()
  dimensionFilters?: Record<string, string[]>;

  @ApiPropertyOptional({ description: 'Business rules', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessRules?: string[];

  @ApiPropertyOptional({ description: 'Custom conditions' })
  @IsOptional()
  @IsString()
  customConditions?: string;
}

export class AccountMappingDto {
  @ApiProperty({ description: 'Source field from transaction' })
  @IsString()
  @IsNotEmpty()
  sourceField: string;

  @ApiProperty({ description: 'Target GL account' })
  @IsString()
  @IsNotEmpty()
  targetAccount: string;

  @ApiProperty({ description: 'Debit or Credit indicator', enum: DebitCreditIndicator })
  @IsEnum(DebitCreditIndicator)
  debitCredit: DebitCreditIndicator;

  @ApiPropertyOptional({ description: 'Amount calculation formula' })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiPropertyOptional({ description: 'Mapping conditions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({ description: 'Priority order' })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}

export class DimensionMappingDto {
  @ApiProperty({ description: 'Source dimension field' })
  @IsString()
  @IsNotEmpty()
  sourceDimension: string;

  @ApiProperty({ description: 'Target dimension field' })
  @IsString()
  @IsNotEmpty()
  targetDimension: string;

  @ApiPropertyOptional({ description: 'Default value if source is empty' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Validation rules', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validationRules?: string[];

  @ApiPropertyOptional({ description: 'Transformation rule' })
  @IsOptional()
  @IsString()
  transformationRule?: string;
}

export class PostingTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  templateName: string;

  @ApiProperty({ description: 'Journal entry type' })
  @IsString()
  @IsNotEmpty()
  journalEntryType: string;

  @ApiProperty({ description: 'Template description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiProperty({ description: 'Account mappings', type: [AccountMappingDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AccountMappingDto)
  accountMappings: AccountMappingDto[];

  @ApiPropertyOptional({ description: 'Dimension mappings', type: [DimensionMappingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionMappingDto)
  dimensionMappings?: DimensionMappingDto[];

  @ApiPropertyOptional({ description: 'Template priority' })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}

export class ScheduledPostingDto {
  @ApiPropertyOptional({ description: 'Enable scheduled posting' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = false;

  @ApiPropertyOptional({ description: 'Posting frequency', enum: PostingFrequency })
  @IsOptional()
  @IsEnum(PostingFrequency)
  frequency?: PostingFrequency;

  @ApiPropertyOptional({ description: 'Execution time (HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:mm format' })
  executionTime?: string;

  @ApiPropertyOptional({ description: 'Execution days for weekly frequency', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  executionDays?: number[];

  @ApiPropertyOptional({ description: 'Month day for monthly frequency' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  monthDay?: number;
}

export class AutomationSettingsDto {
  @ApiPropertyOptional({ description: 'Auto post entries' })
  @IsOptional()
  @IsBoolean()
  autoPost?: boolean = false;

  @ApiPropertyOptional({ description: 'Requires approval before posting' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean = true;

  @ApiPropertyOptional({ description: 'Approval threshold amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvalThreshold?: number;

  @ApiPropertyOptional({ description: 'Approver user IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approvers?: string[];

  @ApiPropertyOptional({ description: 'Scheduled posting settings', type: ScheduledPostingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduledPostingDto)
  scheduledPosting?: ScheduledPostingDto;

  @ApiPropertyOptional({ description: 'Enable retry on failure' })
  @IsOptional()
  @IsBoolean()
  retryOnFailure?: boolean = true;

  @ApiPropertyOptional({ description: 'Maximum retry attempts' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  maxRetryAttempts?: number = 3;
}

export class AIOptimizationDto {
  @ApiPropertyOptional({ description: 'Enable machine learning' })
  @IsOptional()
  @IsBoolean()
  learningEnabled?: boolean = false;

  @ApiPropertyOptional({ description: 'Use adaptive rules' })
  @IsOptional()
  @IsBoolean()
  adaptiveRules?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable anomaly detection' })
  @IsOptional()
  @IsBoolean()
  anomalyDetection?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable pattern recognition' })
  @IsOptional()
  @IsBoolean()
  patternRecognition?: boolean = false;

  @ApiPropertyOptional({ description: 'AI confidence threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number = 0.8;
}

export class CreatePostingRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  ruleName: string;

  @ApiProperty({ description: 'Source module', enum: SourceModule })
  @IsEnum(SourceModule)
  sourceModule: SourceModule;

  @ApiProperty({ description: 'Source transaction type' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  sourceTransactionType: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Posting conditions', type: PostingConditionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PostingConditionsDto)
  conditions?: PostingConditionsDto;

  @ApiProperty({ description: 'Posting template', type: PostingTemplateDto })
  @ValidateNested()
  @Type(() => PostingTemplateDto)
  postingTemplate: PostingTemplateDto;

  @ApiPropertyOptional({ description: 'Automation settings', type: AutomationSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AutomationSettingsDto)
  automationSettings?: AutomationSettingsDto;

  @ApiPropertyOptional({ description: 'AI optimization settings', type: AIOptimizationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIOptimizationDto)
  aiOptimization?: AIOptimizationDto;

  @ApiPropertyOptional({ description: 'Rule is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Rule priority' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number = 50;
}

export class UpdatePostingRuleDto extends PartialType(CreatePostingRuleDto) {
  @ApiPropertyOptional({ description: 'Last modified date' })
  @IsOptional()
  @IsDateString()
  lastModifiedDate?: string;
}

export class PostingRuleResponseDto extends CreatePostingRuleDto {
  @ApiProperty({ description: 'Rule ID' })
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

  @ApiPropertyOptional({ description: 'Usage statistics' })
  @IsOptional()
  @IsObject()
  usageStats?: {
    timesExecuted: number;
    lastExecuted?: string;
    successRate: number;
    averageProcessingTime: number;
  };
}

export class PostingRuleExecutionDto {
  @ApiProperty({ description: 'Source transaction data' })
  @IsObject()
  sourceTransaction: Record<string, any>;

  @ApiProperty({ description: 'Rule ID to execute' })
  @IsString()
  @IsNotEmpty()
  ruleId: string;

  @ApiPropertyOptional({ description: 'Override auto-posting' })
  @IsOptional()
  @IsBoolean()
  overrideAutoPost?: boolean;

  @ApiPropertyOptional({ description: 'Additional context' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class PostingRuleTestDto extends PostingRuleExecutionDto {
  @ApiPropertyOptional({ description: 'Test mode - do not save entries' })
  @IsOptional()
  @IsBoolean()
  testMode?: boolean = true;

  @ApiPropertyOptional({ description: 'Return detailed execution trace' })
  @IsOptional()
  @IsBoolean()
  returnTrace?: boolean = true;
}
