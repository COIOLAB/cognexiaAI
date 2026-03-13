// Industry 5.0 ERP Backend - Supply Chain Module
// Supplier DTOs - Comprehensive data transfer objects for supplier operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsDateString,
  ArrayMinSize,
  IsDecimal,
  Length,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { 
  SupplierTier, 
  SupplierType, 
  ComplianceStatus 
} from '../entities/Supplier.entity';

// ==================== BASE SUPPLIER DTOs ====================

export class ContactPersonDto {
  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Is primary contact' })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CertificationDto {
  @ApiProperty({ description: 'Certification name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Issuing organization' })
  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @ApiProperty({ description: 'Issue date' })
  @IsDateString()
  issuedDate: Date;

  @ApiProperty({ description: 'Expiry date' })
  @IsDateString()
  expiryDate: Date;

  @ApiProperty({ description: 'Certificate number' })
  @IsString()
  @IsNotEmpty()
  certificateNumber: string;

  @ApiProperty({ 
    description: 'Certificate status',
    enum: ['active', 'expired', 'suspended']
  })
  @IsEnum(['active', 'expired', 'suspended'])
  status: 'active' | 'expired' | 'suspended';
}

export class CapabilityDto {
  @ApiProperty({ description: 'Capability category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Subcategory' })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ description: 'Capability description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Capacity amount' })
  @IsNumber()
  @Min(0)
  capacity: number;

  @ApiProperty({ description: 'Capacity unit' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Lead time in days' })
  @IsNumber()
  @Min(0)
  leadTime: number;
}

export class SustainabilityGoalDto {
  @ApiProperty({ description: 'Sustainability metric' })
  @IsString()
  @IsNotEmpty()
  metric: string;

  @ApiProperty({ description: 'Target value' })
  @IsNumber()
  target: number;

  @ApiProperty({ description: 'Current value' })
  @IsNumber()
  currentValue: number;

  @ApiProperty({ description: 'Target achievement date' })
  @IsDateString()
  targetDate: Date;
}

export class SustainabilityMetricsDto {
  @ApiProperty({ description: 'Carbon footprint (CO2 equivalent)' })
  @IsNumber()
  @Min(0)
  carbonFootprint: number;

  @ApiProperty({ description: 'Waste reduction percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  wasteReduction: number;

  @ApiProperty({ description: 'Energy efficiency rating' })
  @IsNumber()
  @Min(0)
  @Max(100)
  energyEfficiency: number;

  @ApiProperty({ description: 'Overall sustainability score' })
  @IsNumber()
  @Min(0)
  @Max(100)
  sustainabilityScore: number;

  @ApiPropertyOptional({ description: 'Sustainability certifications' })
  @IsArray()
  @IsOptional()
  certifications?: string[];

  @ApiPropertyOptional({ 
    description: 'Sustainability goals',
    type: [SustainabilityGoalDto]
  })
  @ValidateNested({ each: true })
  @Type(() => SustainabilityGoalDto)
  @IsOptional()
  goals?: SustainabilityGoalDto[];
}

export class IoTDeviceDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Device type' })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({ description: 'Device location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ 
    description: 'Device status',
    enum: ['active', 'inactive', 'maintenance']
  })
  @IsEnum(['active', 'inactive', 'maintenance'])
  status: 'active' | 'inactive' | 'maintenance';

  @ApiPropertyOptional({ description: 'Last data received timestamp' })
  @IsDateString()
  @IsOptional()
  lastDataReceived?: Date;
}

export class BlockchainProfileDto {
  @ApiProperty({ description: 'Blockchain wallet address' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'Digital identity' })
  @IsString()
  @IsNotEmpty()
  digitalIdentity: string;

  @ApiPropertyOptional({ description: 'Smart contract address' })
  @IsString()
  @IsOptional()
  smartContractAddress?: string;

  @ApiProperty({ 
    description: 'Verification status',
    enum: ['verified', 'pending', 'failed']
  })
  @IsEnum(['verified', 'pending', 'failed'])
  verificationStatus: 'verified' | 'pending' | 'failed';

  @ApiPropertyOptional({ description: 'Last sync timestamp' })
  @IsDateString()
  @IsOptional()
  lastSyncTimestamp?: Date;
}

// ==================== CREATE SUPPLIER DTO ====================

export class CreateSupplierDto {
  @ApiProperty({ description: 'Unique supplier code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  supplierCode: string;

  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Legal name' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  legalName?: string;

  @ApiProperty({ 
    description: 'Supplier tier',
    enum: SupplierTier
  })
  @IsEnum(SupplierTier)
  tier: SupplierTier;

  @ApiProperty({ 
    description: 'Supplier type',
    enum: SupplierType
  })
  @IsEnum(SupplierType)
  type: SupplierType;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Alternative phone number' })
  @IsPhoneNumber()
  @IsOptional()
  alternatePhone?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsUrl()
  @IsOptional()
  website?: string;

  // Address Information
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  state: string;

  @ApiProperty({ description: 'ZIP/Postal code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  zipCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  country: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Financial Information
  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'DUNS number' })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  dunsNumber?: string;

  @ApiProperty({ 
    description: 'Payment terms',
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'immediate'],
    default: 'net_30'
  })
  @IsEnum(['net_15', 'net_30', 'net_45', 'net_60', 'immediate'])
  @IsOptional()
  paymentTerms?: string;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Discount rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountRate?: number;

  // Capabilities and Categories
  @ApiPropertyOptional({ 
    description: 'Supplier capabilities',
    type: [CapabilityDto]
  })
  @ValidateNested({ each: true })
  @Type(() => CapabilityDto)
  @IsOptional()
  capabilities?: CapabilityDto[];

  @ApiPropertyOptional({ description: 'Product categories' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productCategories?: string[];

  @ApiPropertyOptional({ description: 'Service offerings' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceOfferings?: string[];

  @ApiPropertyOptional({ description: 'Maximum order value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumOrderValue?: number;

  @ApiPropertyOptional({ description: 'Minimum order value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumOrderValue?: number;

  // Certifications
  @ApiPropertyOptional({ 
    description: 'Supplier certifications',
    type: [CertificationDto]
  })
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  @IsOptional()
  certifications?: CertificationDto[];

  // Contact Persons
  @ApiPropertyOptional({ 
    description: 'Contact persons',
    type: [ContactPersonDto]
  })
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  @IsOptional()
  contactPersons?: ContactPersonDto[];

  // Sustainability
  @ApiPropertyOptional({ 
    description: 'Sustainability metrics',
    type: SustainabilityMetricsDto
  })
  @ValidateNested()
  @Type(() => SustainabilityMetricsDto)
  @IsOptional()
  sustainabilityMetrics?: SustainabilityMetricsDto;

  // IoT Integration
  @ApiPropertyOptional({ 
    description: 'IoT devices',
    type: [IoTDeviceDto]
  })
  @ValidateNested({ each: true })
  @Type(() => IoTDeviceDto)
  @IsOptional()
  iotDevices?: IoTDeviceDto[];

  // Blockchain
  @ApiPropertyOptional({ 
    description: 'Blockchain profile',
    type: BlockchainProfileDto
  })
  @ValidateNested()
  @Type(() => BlockchainProfileDto)
  @IsOptional()
  blockchainProfile?: BlockchainProfileDto;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== UPDATE SUPPLIER DTO ====================

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiPropertyOptional({ description: 'Reason for update' })
  @IsString()
  @IsOptional()
  updateReason?: string;

  @ApiPropertyOptional({ description: 'Quality rating (1-5)' })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Delivery rating (1-5)' })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  deliveryRating?: number;

  @ApiPropertyOptional({ description: 'Service rating (1-5)' })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  serviceRating?: number;

  @ApiPropertyOptional({ description: 'On-time delivery percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  onTimeDeliveryPercentage?: number;

  @ApiPropertyOptional({ 
    description: 'Compliance status',
    enum: ComplianceStatus
  })
  @IsEnum(ComplianceStatus)
  @IsOptional()
  complianceStatus?: ComplianceStatus;
}

// ==================== QUERY SUPPLIER DTO ====================

export class SupplierQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by supplier tier',
    enum: SupplierTier
  })
  @IsEnum(SupplierTier)
  @IsOptional()
  tier?: SupplierTier;

  @ApiPropertyOptional({ 
    description: 'Filter by supplier type',
    enum: SupplierType
  })
  @IsEnum(SupplierType)
  @IsOptional()
  type?: SupplierType;

  @ApiPropertyOptional({ 
    description: 'Filter by compliance status',
    enum: ComplianceStatus
  })
  @IsEnum(ComplianceStatus)
  @IsOptional()
  complianceStatus?: ComplianceStatus;

  @ApiPropertyOptional({ description: 'Search by name or supplier code' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Minimum quality rating' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  minQualityRating?: number;

  @ApiPropertyOptional({ description: 'Minimum delivery rating' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  minDeliveryRating?: number;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by product categories' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productCategories?: string[];

  @ApiPropertyOptional({ 
    description: 'Sort field',
    enum: ['name', 'createdAt', 'qualityRating', 'deliveryRating', 'overallRating']
  })
  @IsEnum(['name', 'createdAt', 'qualityRating', 'deliveryRating', 'overallRating'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['ASC', 'DESC']
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

// ==================== PERFORMANCE DTOs ====================

export class PerformanceMetricDto {
  @ApiProperty({ description: 'Metric name' })
  @IsString()
  @IsNotEmpty()
  metricName: string;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Metric unit' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Measurement date' })
  @IsDateString()
  measurementDate: Date;

  @ApiPropertyOptional({ description: 'Benchmark value' })
  @IsNumber()
  @IsOptional()
  benchmark?: number;

  @ApiPropertyOptional({ description: 'Notes about measurement' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SupplierPerformanceUpdateDto {
  @ApiProperty({ 
    description: 'Performance metrics',
    type: [PerformanceMetricDto]
  })
  @ValidateNested({ each: true })
  @Type(() => PerformanceMetricDto)
  @ArrayMinSize(1)
  metrics: PerformanceMetricDto[];

  @ApiPropertyOptional({ description: 'Overall feedback' })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ description: 'Evaluation period start' })
  @IsDateString()
  periodStart: Date;

  @ApiProperty({ description: 'Evaluation period end' })
  @IsDateString()
  periodEnd: Date;

  @ApiPropertyOptional({ description: 'Performance incidents' })
  @IsArray()
  @IsOptional()
  incidents?: any[];

  @ApiPropertyOptional({ description: 'Achievements during period' })
  @IsArray()
  @IsOptional()
  achievements?: any[];
}

// ==================== RISK ASSESSMENT DTOs ====================

export class RiskFactorDto {
  @ApiProperty({ description: 'Risk factor name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Risk level (1-10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  level: number;

  @ApiProperty({ description: 'Risk description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Probability (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  probability: number;

  @ApiProperty({ description: 'Impact (1-10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  impact: number;

  @ApiPropertyOptional({ description: 'Mitigation strategy' })
  @IsString()
  @IsOptional()
  mitigationStrategy?: string;
}

export class SupplierRiskAssessmentDto {
  @ApiProperty({ 
    description: 'Risk factors',
    type: [RiskFactorDto]
  })
  @ValidateNested({ each: true })
  @Type(() => RiskFactorDto)
  @ArrayMinSize(1)
  riskFactors: RiskFactorDto[];

  @ApiProperty({ description: 'Assessment date' })
  @IsDateString()
  assessmentDate: Date;

  @ApiProperty({ description: 'Assessor name' })
  @IsString()
  @IsNotEmpty()
  assessorName: string;

  @ApiProperty({ 
    description: 'Overall risk rating',
    enum: ['low', 'medium', 'high', 'critical']
  })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  overallRiskRating: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional({ description: 'Assessment notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Next assessment due date' })
  @IsDateString()
  @IsOptional()
  nextAssessmentDate?: Date;
}

// ==================== BULK OPERATIONS DTOs ====================

export class BulkSupplierItemDto {
  @ApiPropertyOptional({ description: 'Supplier ID (for updates)' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Supplier data' })
  @ValidateNested()
  @Type(() => CreateSupplierDto)
  data: CreateSupplierDto;
}

export class BulkSupplierOperationDto {
  @ApiProperty({ 
    description: 'Bulk operation type',
    enum: ['create', 'update', 'import']
  })
  @IsEnum(['create', 'update', 'import'])
  operation: 'create' | 'update' | 'import';

  @ApiProperty({ 
    description: 'Suppliers data',
    type: [BulkSupplierItemDto]
  })
  @ValidateNested({ each: true })
  @Type(() => BulkSupplierItemDto)
  @ArrayMinSize(1)
  suppliers: BulkSupplierItemDto[];

  @ApiPropertyOptional({ description: 'Validation mode (strict/lenient)' })
  @IsEnum(['strict', 'lenient'])
  @IsOptional()
  validationMode?: 'strict' | 'lenient';

  @ApiPropertyOptional({ description: 'Skip duplicates' })
  @IsBoolean()
  @IsOptional()
  skipDuplicates?: boolean;

  @ApiPropertyOptional({ description: 'Operation notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ==================== RESPONSE DTOs ====================

export class SupplierResponseDto extends CreateSupplierDto {
  @ApiProperty({ description: 'Supplier UUID' })
  id: string;

  @ApiProperty({ description: 'Overall rating (1-5)' })
  overallRating: number;

  @ApiProperty({ description: 'Quality rating (1-5)' })
  qualityRating: number;

  @ApiProperty({ description: 'Delivery rating (1-5)' })
  deliveryRating: number;

  @ApiProperty({ description: 'Service rating (1-5)' })
  serviceRating: number;

  @ApiProperty({ description: 'Cost competitiveness rating' })
  costCompetitiveness: number;

  @ApiProperty({ description: 'On-time delivery percentage' })
  onTimeDeliveryPercentage: number;

  @ApiProperty({ description: 'Is supplier active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy?: string;
}

export class BulkOperationResultDto {
  @ApiProperty({ description: 'Total processed items' })
  totalProcessed: number;

  @ApiProperty({ description: 'Successfully processed items' })
  successCount: number;

  @ApiProperty({ description: 'Failed items count' })
  failureCount: number;

  @ApiProperty({ description: 'Processing errors' })
  errors: Array<{
    index: number;
    supplierCode: string;
    error: string;
  }>;

  @ApiProperty({ description: 'Processing warnings' })
  warnings: Array<{
    index: number;
    supplierCode: string;
    warning: string;
  }>;

  @ApiProperty({ description: 'Operation completion time' })
  processedAt: Date;
}

export default {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierQueryDto,
  SupplierPerformanceUpdateDto,
  SupplierRiskAssessmentDto,
  BulkSupplierOperationDto,
  SupplierResponseDto,
  BulkOperationResultDto
};
