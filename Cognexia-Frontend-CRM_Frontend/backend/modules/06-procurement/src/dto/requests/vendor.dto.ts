// Industry 5.0 ERP Backend - Procurement Module
// Vendor Request DTOs - Comprehensive validation and transformation
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsEmail,
  IsUrl,
  IsNumber,
  IsPositive,
  IsUUID,
  MaxLength,
  MinLength,
  ArrayMinSize,
  IsBoolean,
  Min,
  Max,
  IsPhoneNumber,
  IsDateString,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { VendorStatus, VendorType, VendorSize, QualificationStatus, PerformanceRating } from '../../entities/vendor.entity';

// ==================== ADDRESS DTOs ====================

export class CreateAddressDto {
  @ApiProperty({ description: 'Address type (e.g., HEADQUARTERS, BILLING, SHIPPING)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ description: 'Street address line 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Street address line 2' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'State or Province' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'Postal or ZIP code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a valid ISO 3166-1 alpha-2 code' })
  country: string;

  @ApiPropertyOptional({ description: 'Whether this is the primary address' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// ==================== CONTACT DTOs ====================

export class CreateContactDto {
  @ApiProperty({ description: 'Contact type (e.g., PRIMARY, BILLING, TECHNICAL)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ description: 'Contact person full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Job title or position' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber(null)
  @MaxLength(50)
  phone: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsPhoneNumber(null)
  @MaxLength(50)
  mobile?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Whether this is the primary contact' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// ==================== MAIN VENDOR DTOs ====================

export class CreateVendorDto {
  @ApiProperty({ description: 'Unique vendor code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Vendor code must contain only uppercase letters, numbers, hyphens, and underscores' })
  vendorCode: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  companyName: string;

  @ApiPropertyOptional({ description: 'Legal entity name (if different from company name)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiProperty({ 
    description: 'Vendor type',
    enum: VendorType,
    enumName: 'VendorType'
  })
  @IsEnum(VendorType)
  type: VendorType;

  @ApiProperty({ 
    description: 'Company size classification',
    enum: VendorSize,
    enumName: 'VendorSize'
  })
  @IsEnum(VendorSize)
  size: VendorSize;

  @ApiPropertyOptional({ description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'DUNS number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9]{9}$/, { message: 'DUNS number must be 9 digits' })
  dunsNumber?: string;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'Year company was established' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearEstablished?: number;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Annual revenue (in USD)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  annualRevenue?: number;

  @ApiProperty({ 
    description: 'Company addresses',
    type: [CreateAddressDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];

  @ApiProperty({ 
    description: 'Contact persons',
    type: [CreateContactDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts: CreateContactDto[];

  @ApiProperty({ description: 'Vendor capabilities and services offered' })
  @IsObject()
  capabilities: {
    categories: string[];
    services: string[];
    certifications: string[];
    specializations: string[];
  };

  @ApiPropertyOptional({ description: 'Payment terms (e.g., NET30, NET60)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Credit limit in USD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Insurance information' })
  @IsOptional()
  @IsObject()
  insuranceInfo?: {
    generalLiability?: number;
    professionalLiability?: number;
    workersCompensation?: number;
    expiryDate?: Date;
  };

  @ApiPropertyOptional({ description: 'Diversity and inclusion attributes' })
  @IsOptional()
  @IsObject()
  diversityInfo?: {
    isMinorityOwned?: boolean;
    isWomanOwned?: boolean;
    isVeteranOwned?: boolean;
    isSmallBusiness?: boolean;
    certifyingBodies?: string[];
  };

  @ApiPropertyOptional({ description: 'ESG (Environmental, Social, Governance) ratings' })
  @IsOptional()
  @IsObject()
  esgMetrics?: {
    environmentalScore?: number;
    socialScore?: number;
    governanceScore?: number;
    overallRating?: string;
    certifications?: string[];
  };

  @ApiPropertyOptional({ description: 'Preferred communication methods' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCommunication?: string[];

  @ApiPropertyOptional({ description: 'Time zone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timeZone?: string;

  @ApiPropertyOptional({ description: 'Languages supported' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

export class UpdateVendorDto {
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName?: string;

  @ApiPropertyOptional({ description: 'Legal entity name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ 
    description: 'Vendor type',
    enum: VendorType,
    enumName: 'VendorType'
  })
  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;

  @ApiPropertyOptional({ 
    description: 'Company size classification',
    enum: VendorSize,
    enumName: 'VendorSize'
  })
  @IsOptional()
  @IsEnum(VendorSize)
  size?: VendorSize;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Annual revenue (in USD)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  annualRevenue?: number;

  @ApiPropertyOptional({ 
    description: 'Updated addresses',
    type: [CreateAddressDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];

  @ApiPropertyOptional({ 
    description: 'Updated contacts',
    type: [CreateContactDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts?: CreateContactDto[];

  @ApiPropertyOptional({ description: 'Updated capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: {
    categories?: string[];
    services?: string[];
    certifications?: string[];
    specializations?: string[];
  };

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Credit limit in USD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Insurance information' })
  @IsOptional()
  @IsObject()
  insuranceInfo?: object;

  @ApiPropertyOptional({ description: 'ESG metrics' })
  @IsOptional()
  @IsObject()
  esgMetrics?: object;
}

// ==================== QUERY DTOs ====================

export class VendorQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: VendorStatus,
    enumName: 'VendorStatus'
  })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by type',
    enum: VendorType,
    enumName: 'VendorType'
  })
  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;

  @ApiPropertyOptional({ 
    description: 'Filter by size',
    enum: VendorSize,
    enumName: 'VendorSize'
  })
  @IsOptional()
  @IsEnum(VendorSize)
  size?: VendorSize;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Search text (company name, vendor code)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum performance rating' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minPerformanceRating?: number;

  @ApiPropertyOptional({ description: 'Filter by diversity certification' })
  @IsOptional()
  @IsBoolean()
  isDiversityOwned?: boolean;

  @ApiPropertyOptional({ description: 'Filter by ESG rating' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  esgRating?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

// ==================== STATUS MANAGEMENT DTOs ====================

export class VendorStatusUpdateDto {
  @ApiProperty({ 
    description: 'New vendor status',
    enum: VendorStatus,
    enumName: 'VendorStatus'
  })
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason?: string;

  @ApiPropertyOptional({ description: 'Effective date of status change' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class VendorSuspensionDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Suspension duration in days' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Conditions for reactivation' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reactivationConditions?: string;
}

// ==================== QUALIFICATION DTOs ====================

export class VendorQualificationDto {
  @ApiProperty({ 
    description: 'Qualification status',
    enum: QualificationStatus,
    enumName: 'QualificationStatus'
  })
  @IsEnum(QualificationStatus)
  status: QualificationStatus;

  @ApiPropertyOptional({ description: 'Qualification score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({ description: 'Qualification comments' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Required certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiPropertyOptional({ description: 'Qualification expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

// ==================== PERFORMANCE DTOs ====================

export class VendorPerformanceUpdateDto {
  @ApiProperty({ description: 'Overall performance score (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Delivery score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  deliveryScore?: number;

  @ApiPropertyOptional({ description: 'Service score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  serviceScore?: number;

  @ApiPropertyOptional({ description: 'Cost competitiveness score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  costScore?: number;

  @ApiPropertyOptional({ description: 'Performance review comments' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewComments?: string;

  @ApiPropertyOptional({ description: 'Measurement period start date' })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Measurement period end date' })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}

// ==================== COMPARISON DTOs ====================

export class VendorComparisonDto {
  @ApiProperty({ 
    description: 'Array of vendor IDs to compare',
    type: [String],
    minItems: 2,
    maxItems: 10
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  vendorIds: string[];

  @ApiPropertyOptional({ description: 'Comparison criteria' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteria?: string[];

  @ApiPropertyOptional({ description: 'Include performance history' })
  @IsOptional()
  @IsBoolean()
  includePerformanceHistory?: boolean;

  @ApiPropertyOptional({ description: 'Include financial analysis' })
  @IsOptional()
  @IsBoolean()
  includeFinancialAnalysis?: boolean;
}
