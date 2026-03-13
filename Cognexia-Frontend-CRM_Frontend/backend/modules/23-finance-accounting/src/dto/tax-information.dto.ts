/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Tax Information Data Transfer Objects
 * 
 * Complete DTOs for tax calculations, compliance, and reporting
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOX, GAAP, IFRS, GST, VAT
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
  IsDecimal,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum TaxType {
  SALES_TAX = 'sales_tax',
  VAT = 'vat',
  GST = 'gst',
  INCOME_TAX = 'income_tax',
  CORPORATE_TAX = 'corporate_tax',
  WITHHOLDING_TAX = 'withholding_tax',
  CUSTOMS_DUTY = 'customs_duty',
  EXCISE_TAX = 'excise_tax',
  SERVICE_TAX = 'service_tax',
  PROPERTY_TAX = 'property_tax'
}

export enum TaxJurisdiction {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local',
  INTERNATIONAL = 'international',
  UNION_TERRITORY = 'union_territory',
  MUNICIPAL = 'municipal'
}

export enum TaxCalculationMethod {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  TIERED = 'tiered',
  COMPOUND = 'compound',
  REVERSE_CHARGE = 'reverse_charge',
  ZERO_RATE = 'zero_rate'
}

export enum TaxStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
  EXPIRED = 'expired'
}

export class TaxRateDto {
  @ApiProperty({ description: 'Tax rate ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Tax rate percentage' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  rate: number;

  @ApiProperty({ description: 'Effective from date' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Minimum taxable amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minTaxableAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum taxable amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxTaxableAmount?: number;
}

export class TaxExemptionDto {
  @ApiProperty({ description: 'Exemption ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Exemption code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  code: string;

  @ApiProperty({ description: 'Exemption description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiProperty({ description: 'Exemption percentage' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  exemptionPercentage: number;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid to date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ description: 'Applicable products/services', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableItems?: string[];
}

export class TaxAuthorityDto {
  @ApiProperty({ description: 'Tax authority ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Authority name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Authority code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  code: string;

  @ApiProperty({ description: 'Tax jurisdiction', enum: TaxJurisdiction })
  @IsEnum(TaxJurisdiction)
  jurisdiction: TaxJurisdiction;

  @ApiPropertyOptional({ description: 'Contact information' })
  @IsOptional()
  @IsObject()
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };

  @ApiPropertyOptional({ description: 'Filing requirements' })
  @IsOptional()
  @IsObject()
  filingRequirements?: {
    frequency: string;
    dueDate: string;
    forms: string[];
  };
}

export class CreateTaxConfigurationDto {
  @ApiProperty({ description: 'Tax configuration name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Tax type', enum: TaxType })
  @IsEnum(TaxType)
  taxType: TaxType;

  @ApiProperty({ description: 'Tax code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Tax code must contain only uppercase letters, numbers, hyphens, and underscores' })
  taxCode: string;

  @ApiPropertyOptional({ description: 'Tax description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Tax jurisdiction', enum: TaxJurisdiction })
  @IsEnum(TaxJurisdiction)
  jurisdiction: TaxJurisdiction;

  @ApiProperty({ description: 'Calculation method', enum: TaxCalculationMethod })
  @IsEnum(TaxCalculationMethod)
  calculationMethod: TaxCalculationMethod;

  @ApiProperty({ description: 'Tax rates', type: [TaxRateDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TaxRateDto)
  taxRates: TaxRateDto[];

  @ApiProperty({ description: 'Tax authority', type: TaxAuthorityDto })
  @ValidateNested()
  @Type(() => TaxAuthorityDto)
  taxAuthority: TaxAuthorityDto;

  @ApiPropertyOptional({ description: 'Tax exemptions', type: [TaxExemptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxExemptionDto)
  exemptions?: TaxExemptionDto[];

  @ApiPropertyOptional({ description: 'Applicable GL accounts', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableAccounts?: string[];

  @ApiPropertyOptional({ description: 'Tax configuration is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Auto-calculate tax' })
  @IsOptional()
  @IsBoolean()
  autoCalculate?: boolean = true;

  @ApiPropertyOptional({ description: 'Requires tax certificate' })
  @IsOptional()
  @IsBoolean()
  requiresCertificate?: boolean = false;

  @ApiPropertyOptional({ description: 'Default GL account for tax liability' })
  @IsOptional()
  @IsString()
  defaultLiabilityAccount?: string;

  @ApiPropertyOptional({ description: 'Default GL account for tax expense' })
  @IsOptional()
  @IsString()
  defaultExpenseAccount?: string;
}

export class UpdateTaxConfigurationDto extends PartialType(CreateTaxConfigurationDto) {
  @ApiPropertyOptional({ description: 'Last modified date' })
  @IsOptional()
  @IsDateString()
  lastModifiedDate?: string;
}

export class TaxConfigurationResponseDto extends CreateTaxConfigurationDto {
  @ApiProperty({ description: 'Tax configuration ID' })
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

  @ApiProperty({ description: 'Configuration status', enum: TaxStatus })
  @IsEnum(TaxStatus)
  status: TaxStatus;
}

export class TaxCalculationDto {
  @ApiProperty({ description: 'Transaction amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  transactionAmount: number;

  @ApiProperty({ description: 'Tax configuration ID' })
  @IsString()
  @IsNotEmpty()
  taxConfigurationId: string;

  @ApiPropertyOptional({ description: 'Transaction date' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ description: 'Customer/vendor ID' })
  @IsOptional()
  @IsString()
  partyId?: string;

  @ApiPropertyOptional({ description: 'Product/service categories', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemCategories?: string[];

  @ApiPropertyOptional({ description: 'Tax exemption certificates', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exemptionCertificates?: string[];

  @ApiPropertyOptional({ description: 'Override tax rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  overrideTaxRate?: number;

  @ApiPropertyOptional({ description: 'Additional context for calculation' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class TaxCalculationResultDto {
  @ApiProperty({ description: 'Base amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  baseAmount: number;

  @ApiProperty({ description: 'Tax amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  taxAmount: number;

  @ApiProperty({ description: 'Total amount (base + tax)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Applied tax rate' })
  @IsNumber({ maxDecimalPlaces: 4 })
  appliedTaxRate: number;

  @ApiProperty({ description: 'Tax configuration used' })
  @IsString()
  @IsNotEmpty()
  taxConfigurationId: string;

  @ApiPropertyOptional({ description: 'Applied exemptions', type: [TaxExemptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxExemptionDto)
  appliedExemptions?: TaxExemptionDto[];

  @ApiPropertyOptional({ description: 'Tax calculation breakdown' })
  @IsOptional()
  @IsArray()
  breakdown?: {
    component: string;
    baseAmount: number;
    taxRate: number;
    taxAmount: number;
  }[];

  @ApiProperty({ description: 'Calculation timestamp' })
  @IsDateString()
  calculatedAt: string;

  @ApiPropertyOptional({ description: 'Validation warnings', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warnings?: string[];
}

export class TaxReportingDto {
  @ApiProperty({ description: 'Report period start' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Report period end' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Tax jurisdictions to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(TaxJurisdiction, { each: true })
  jurisdictions?: TaxJurisdiction[];

  @ApiPropertyOptional({ description: 'Tax types to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(TaxType, { each: true })
  taxTypes?: TaxType[];

  @ApiPropertyOptional({ description: 'Include exemptions in report' })
  @IsOptional()
  @IsBoolean()
  includeExemptions?: boolean = false;

  @ApiPropertyOptional({ description: 'Group by tax authority' })
  @IsOptional()
  @IsBoolean()
  groupByAuthority?: boolean = true;

  @ApiPropertyOptional({ description: 'Include detailed breakdown' })
  @IsOptional()
  @IsBoolean()
  includeBreakdown?: boolean = false;
}

export class TaxComplianceCheckDto {
  @ApiProperty({ description: 'Entity ID to check compliance for' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Compliance check date' })
  @IsDateString()
  checkDate: string;

  @ApiPropertyOptional({ description: 'Specific jurisdictions to check', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(TaxJurisdiction, { each: true })
  jurisdictions?: TaxJurisdiction[];

  @ApiPropertyOptional({ description: 'Check period in months' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  checkPeriodMonths?: number = 12;
}

export class TaxComplianceResultDto {
  @ApiProperty({ description: 'Overall compliance status' })
  @IsBoolean()
  isCompliant: boolean;

  @ApiProperty({ description: 'Compliance score (0-100)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  complianceScore: number;

  @ApiPropertyOptional({ description: 'Compliance issues found' })
  @IsOptional()
  @IsArray()
  issues?: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    jurisdiction: TaxJurisdiction;
    taxType: TaxType;
    description: string;
    recommendation: string;
  }[];

  @ApiPropertyOptional({ description: 'Missing filings' })
  @IsOptional()
  @IsArray()
  missingFilings?: {
    jurisdiction: TaxJurisdiction;
    taxType: TaxType;
    dueDate: string;
    amount: number;
  }[];

  @ApiProperty({ description: 'Compliance check timestamp' })
  @IsDateString()
  checkedAt: string;

  @ApiPropertyOptional({ description: 'Next review date' })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}
