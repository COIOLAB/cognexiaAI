// Industry 5.0 ERP Backend - Procurement Module
// Purchase Requisition Request DTOs - Comprehensive validation and transformation
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNumber,
  IsPositive,
  IsUUID,
  MaxLength,
  MinLength,
  ArrayMinSize,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { RequisitionStatus, PriorityLevel, RequisitionType } from '../../entities/purchase-requisition.entity';

// ==================== LINE ITEM DTOs ====================

export class CreateLineItemDto {
  @ApiProperty({ description: 'Product or service ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Product or service code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productCode?: string;

  @ApiProperty({ description: 'Line item description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Requested quantity' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unitOfMeasurement: string;

  @ApiPropertyOptional({ description: 'Estimated unit price' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  estimatedPrice?: number;

  @ApiPropertyOptional({ description: 'Suggested vendor ID' })
  @IsOptional()
  @IsUUID()
  suggestedVendorId?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Technical specifications' })
  @IsOptional()
  specifications?: any;

  @ApiPropertyOptional({ description: 'Quality requirements' })
  @IsOptional()
  qualityRequirements?: any;

  @ApiPropertyOptional({ description: 'Compliance requirements' })
  @IsOptional()
  complianceRequirements?: any;
}

export class UpdateLineItemDto extends CreateLineItemDto {
  @ApiPropertyOptional({ description: 'Line item ID for updates' })
  @IsOptional()
  @IsUUID()
  id?: string;
}

// ==================== APPROVAL DTOs ====================

export class ApprovalDto {
  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Approval delegation' })
  @IsOptional()
  @IsUUID()
  delegatedTo?: string;
}

export class RejectionDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Suggestions for improvement' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  suggestions?: string;
}

// ==================== MAIN REQUISITION DTOs ====================

export class CreatePurchaseRequisitionDto {
  @ApiPropertyOptional({ description: 'Custom requisition number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  requisitionNumber?: string;

  @ApiProperty({ description: 'Requisition title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ 
    description: 'Requisition type',
    enum: RequisitionType,
    enumName: 'RequisitionType'
  })
  @IsEnum(RequisitionType)
  type: RequisitionType;

  @ApiProperty({ 
    description: 'Priority level',
    enum: PriorityLevel,
    enumName: 'PriorityLevel'
  })
  @IsEnum(PriorityLevel)
  priority: PriorityLevel;

  @ApiProperty({ description: 'Requesting department' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({ description: 'Requester user ID' })
  @IsUUID()
  requesterId: string;

  @ApiProperty({ description: 'Required delivery date' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  requiredDate: Date;

  @ApiProperty({ description: 'Business justification' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(2000)
  justification: string;

  @ApiPropertyOptional({ description: 'Budget code or cost center' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'Project ID if applicable' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Preferred vendor ID' })
  @IsOptional()
  @IsUUID()
  preferredVendorId?: string;

  @ApiProperty({ 
    description: 'Line items',
    type: [CreateLineItemDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems: CreateLineItemDto[];

  @ApiPropertyOptional({ description: 'Special delivery instructions' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryInstructions?: string;

  @ApiPropertyOptional({ description: 'Special terms and conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'ESG requirements' })
  @IsOptional()
  esgRequirements?: any;

  @ApiPropertyOptional({ description: 'Risk assessment notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  riskNotes?: string;

  @ApiPropertyOptional({ description: 'Enable auto-approval if criteria met' })
  @IsOptional()
  @IsBoolean()
  autoApprovalEligible?: boolean;

  @ApiPropertyOptional({ description: 'Auto-convert to PO when approved' })
  @IsOptional()
  @IsBoolean()
  autoConvertToPO?: boolean;
}

export class UpdatePurchaseRequisitionDto {
  @ApiPropertyOptional({ description: 'Requisition title' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Priority level',
    enum: PriorityLevel,
    enumName: 'PriorityLevel'
  })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Required delivery date' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  requiredDate?: Date;

  @ApiPropertyOptional({ description: 'Business justification' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  justification?: string;

  @ApiPropertyOptional({ description: 'Budget code or cost center' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'Preferred vendor ID' })
  @IsOptional()
  @IsUUID()
  preferredVendorId?: string;

  @ApiPropertyOptional({ 
    description: 'Updated line items',
    type: [UpdateLineItemDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLineItemDto)
  lineItems?: UpdateLineItemDto[];

  @ApiPropertyOptional({ description: 'Special delivery instructions' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryInstructions?: string;

  @ApiPropertyOptional({ description: 'Special terms and conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Risk assessment notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  riskNotes?: string;
}

// ==================== QUERY DTOs ====================

export class RequisitionQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: RequisitionStatus,
    enumName: 'RequisitionStatus'
  })
  @IsOptional()
  @IsEnum(RequisitionStatus)
  status?: RequisitionStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by type',
    enum: RequisitionType,
    enumName: 'RequisitionType'
  })
  @IsOptional()
  @IsEnum(RequisitionType)
  type?: RequisitionType;

  @ApiPropertyOptional({ 
    description: 'Filter by priority',
    enum: PriorityLevel,
    enumName: 'PriorityLevel'
  })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiPropertyOptional({ description: 'Filter by department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by requester ID' })
  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @ApiPropertyOptional({ description: 'Search text (title, description, requisition number)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

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

// ==================== BULK OPERATIONS DTOs ====================

export class BulkRequisitionApprovalDto {
  @ApiProperty({ 
    description: 'Array of requisition IDs to approve',
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  requisitionIds: string[];

  @ApiPropertyOptional({ description: 'Comments for all approvals' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Delegate approval to another user' })
  @IsOptional()
  @IsUUID()
  delegatedTo?: string;
}

export class BulkRequisitionRejectionDto {
  @ApiProperty({ 
    description: 'Array of requisition IDs to reject',
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  requisitionIds: string[];

  @ApiProperty({ description: 'Rejection reason for all requisitions' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Suggestions for improvement' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  suggestions?: string;
}

// ==================== AI ANALYTICS DTOs ====================

export class RequisitionAnalysisRequestDto {
  @ApiPropertyOptional({ description: 'Analysis type to perform' })
  @IsOptional()
  @IsEnum(['risk', 'budget', 'vendor', 'compliance', 'all'])
  analysisType?: 'risk' | 'budget' | 'vendor' | 'compliance' | 'all';

  @ApiPropertyOptional({ description: 'Include historical data analysis' })
  @IsOptional()
  @IsBoolean()
  includeHistorical?: boolean;

  @ApiPropertyOptional({ description: 'Include market intelligence' })
  @IsOptional()
  @IsBoolean()
  includeMarketData?: boolean;
}

export class VendorSuggestionRequestDto {
  @ApiPropertyOptional({ description: 'Maximum number of vendor suggestions', minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  maxSuggestions?: number;

  @ApiPropertyOptional({ description: 'Include performance scores' })
  @IsOptional()
  @IsBoolean()
  includeScores?: boolean;

  @ApiPropertyOptional({ description: 'Include risk assessment' })
  @IsOptional()
  @IsBoolean()
  includeRiskAssessment?: boolean;
}

export class BudgetOptimizationRequestDto {
  @ApiPropertyOptional({ description: 'Target savings percentage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  targetSavingsPercent?: number;

  @ApiPropertyOptional({ description: 'Consider alternative products' })
  @IsOptional()
  @IsBoolean()
  considerAlternatives?: boolean;

  @ApiPropertyOptional({ description: 'Maintain quality threshold' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityThreshold?: number;
}
