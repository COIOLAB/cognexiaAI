// Industry 5.0 ERP Backend - Procurement Module
// Bidding & RFQ Request DTOs - Comprehensive validation and transformation
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
  IsObject,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { RFQStatus, RFQType } from '../../entities/rfq.entity';
import { BidStatus } from '../../entities/bid.entity';

// ==================== RFQ LINE ITEM DTOs ====================

export class CreateRFQLineItemDto {
  @ApiProperty({ description: 'Item sequence number within RFQ' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sequenceNumber: number;

  @ApiProperty({ description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ description: 'Product or service code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  productCode?: string;

  @ApiPropertyOptional({ description: 'Category classification' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ description: 'Requested quantity' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unitOfMeasurement: string;

  @ApiPropertyOptional({ description: 'Estimated unit price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  estimatedUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Technical specifications' })
  @IsOptional()
  @IsObject()
  specifications?: any;

  @ApiPropertyOptional({ description: 'Quality requirements' })
  @IsOptional()
  @IsObject()
  qualityRequirements?: any;

  @ApiPropertyOptional({ description: 'Delivery requirements' })
  @IsOptional()
  @IsObject()
  deliveryRequirements?: any;

  @ApiPropertyOptional({ description: 'Compliance requirements' })
  @IsOptional()
  @IsObject()
  complianceRequirements?: any;

  @ApiPropertyOptional({ description: 'Item-specific terms' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  itemTerms?: string;
}

// ==================== RFQ EVALUATION CRITERIA DTOs ====================

export class EvaluationCriterionDto {
  @ApiProperty({ description: 'Criterion name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Criterion description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Weight percentage (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({ 
    description: 'Evaluation type',
    enum: ['QUANTITATIVE', 'QUALITATIVE', 'BINARY', 'SCORE']
  })
  @IsOptional()
  @IsEnum(['QUANTITATIVE', 'QUALITATIVE', 'BINARY', 'SCORE'])
  evaluationType?: string;

  @ApiPropertyOptional({ description: 'Scoring method details' })
  @IsOptional()
  @IsObject()
  scoringMethod?: {
    minValue?: number;
    maxValue?: number;
    scale?: string;
    criteria?: string[];
  };

  @ApiPropertyOptional({ description: 'Whether this is mandatory' })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}

// ==================== RFQ CREATION DTOs ====================

export class CreateRFQDto {
  @ApiProperty({ description: 'RFQ title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Detailed RFQ description' })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ 
    description: 'RFQ type',
    enum: RFQType,
    enumName: 'RFQType'
  })
  @IsEnum(RFQType)
  type: RFQType;

  @ApiProperty({ description: 'Bid submission deadline' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Expected award date' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  expectedAwardDate?: Date;

  @ApiProperty({ description: 'General requirements and specifications' })
  @IsObject()
  requirements: {
    deliveryLocation?: string;
    deliveryDate?: Date;
    paymentTerms?: string;
    warrantyRequirements?: string;
    insuranceRequirements?: object;
    securityRequirements?: string[];
    environmentalRequirements?: string[];
  };

  @ApiProperty({ 
    description: 'RFQ line items',
    type: [CreateRFQLineItemDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRFQLineItemDto)
  lineItems: CreateRFQLineItemDto[];

  @ApiProperty({ 
    description: 'Evaluation criteria',
    type: [EvaluationCriterionDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriterionDto)
  evaluationCriteria: EvaluationCriterionDto[];

  @ApiPropertyOptional({ description: 'Pre-qualified vendor IDs to invite' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  targetVendors?: string[];

  @ApiPropertyOptional({ description: 'Minimum vendor qualification requirements' })
  @IsOptional()
  @IsObject()
  vendorQualificationCriteria?: {
    minimumExperience?: number;
    requiredCertifications?: string[];
    minimumRevenue?: number;
    geographicalRestrictions?: string[];
    securityClearance?: string;
  };

  @ApiPropertyOptional({ description: 'Budget range (for guidance only)' })
  @IsOptional()
  @IsObject()
  budgetRange?: {
    minimum?: number;
    maximum?: number;
    currency?: string;
    isBinding?: boolean;
  };

  @ApiPropertyOptional({ description: 'Procurement contact information' })
  @IsOptional()
  @IsObject()
  contactInfo?: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };

  @ApiPropertyOptional({ description: 'Special instructions for bidders' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Allow partial bids' })
  @IsOptional()
  @IsBoolean()
  allowPartialBids?: boolean;

  @ApiPropertyOptional({ description: 'Allow alternative proposals' })
  @IsOptional()
  @IsBoolean()
  allowAlternativeProposals?: boolean;

  @ApiPropertyOptional({ description: 'Require technical proposal' })
  @IsOptional()
  @IsBoolean()
  requireTechnicalProposal?: boolean;

  @ApiPropertyOptional({ description: 'Require commercial proposal' })
  @IsOptional()
  @IsBoolean()
  requireCommercialProposal?: boolean;
}

// ==================== BID LINE ITEM DTOs ====================

export class CreateBidLineItemDto {
  @ApiProperty({ description: 'Reference to RFQ line item sequence number' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  rfqLineItemSequence: number;

  @ApiProperty({ description: 'Bid unit price' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Bid quantity (if different from RFQ)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  bidQuantity?: number;

  @ApiPropertyOptional({ description: 'Extended price (quantity × unit price)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  extendedPrice?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Item-specific notes or alternatives' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Compliance confirmation' })
  @IsOptional()
  @IsBoolean()
  meetsSpecifications?: boolean;

  @ApiPropertyOptional({ description: 'Alternative proposal details' })
  @IsOptional()
  @IsObject()
  alternativeProposal?: {
    description: string;
    specifications: any;
    benefits: string[];
    costImpact: number;
  };
}

// ==================== BID SUBMISSION DTOs ====================

export class CreateBidDto {
  @ApiProperty({ description: 'RFQ ID this bid is responding to' })
  @IsUUID()
  rfqId: string;

  @ApiProperty({ description: 'Bidding vendor ID' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Total bid amount' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @ApiProperty({ description: 'Bid validity period in days' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  validityPeriod: number;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a valid ISO 4217 code' })
  currency: string;

  @ApiProperty({ 
    description: 'Bid line items',
    type: [CreateBidLineItemDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBidLineItemDto)
  lineItems: CreateBidLineItemDto[];

  @ApiPropertyOptional({ description: 'Technical proposal document' })
  @IsOptional()
  @IsObject()
  technicalProposal?: {
    executiveSummary?: string;
    technicalApproach?: string;
    methodology?: string;
    timeline?: any;
    resources?: any;
    qualityAssurance?: string;
    riskMitigation?: string;
    attachments?: string[];
  };

  @ApiPropertyOptional({ description: 'Commercial proposal details' })
  @IsOptional()
  @IsObject()
  commercialProposal?: {
    pricingStructure?: string;
    paymentSchedule?: string;
    discounts?: any[];
    additionalCosts?: any[];
    financialTerms?: string;
    warranties?: string;
    maintenanceOptions?: any;
  };

  @ApiPropertyOptional({ description: 'Proposed terms and conditions' })
  @IsOptional()
  @IsObject()
  terms?: {
    deliveryTerms?: string;
    paymentTerms?: string;
    warrantyTerms?: string;
    liabilityLimits?: string;
    intellectualProperty?: string;
    terminationClause?: string;
    disputeResolution?: string;
  };

  @ApiPropertyOptional({ description: 'Vendor qualifications and experience' })
  @IsOptional()
  @IsObject()
  vendorQualifications?: {
    relevantExperience?: string;
    pastPerformance?: any[];
    teamQualifications?: any[];
    certifications?: string[];
    references?: any[];
    securityClearances?: string[];
  };

  @ApiPropertyOptional({ description: 'Compliance declarations' })
  @IsOptional()
  @IsObject()
  complianceDeclarations?: {
    meetsAllRequirements?: boolean;
    exceptions?: string[];
    certifications?: string[];
    environmentalCompliance?: boolean;
    securityCompliance?: boolean;
  };

  @ApiPropertyOptional({ description: 'Additional notes or comments' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalNotes?: string;
}

// ==================== QUERY DTOs ====================

export class RFQQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: RFQStatus,
    enumName: 'RFQStatus'
  })
  @IsOptional()
  @IsEnum(RFQStatus)
  status?: RFQStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by type',
    enum: RFQType,
    enumName: 'RFQType'
  })
  @IsOptional()
  @IsEnum(RFQType)
  type?: RFQType;

  @ApiPropertyOptional({ description: 'Search text (title, description, RFQ number)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by issue date start' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by issue date end' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by due date start' })
  @IsOptional()
  @IsDateString()
  dueDateStart?: string;

  @ApiPropertyOptional({ description: 'Filter by due date end' })
  @IsOptional()
  @IsDateString()
  dueDateEnd?: string;

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

export class BidQueryDto {
  @ApiPropertyOptional({ description: 'Filter by RFQ ID' })
  @IsOptional()
  @IsUUID()
  rfqId?: string;

  @ApiPropertyOptional({ description: 'Filter by vendor ID' })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: BidStatus,
    enumName: 'BidStatus'
  })
  @IsOptional()
  @IsEnum(BidStatus)
  status?: BidStatus;

  @ApiPropertyOptional({ description: 'Filter by minimum bid amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum bid amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxAmount?: number;

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

// ==================== VENDOR INVITATION DTOs ====================

export class VendorInvitationDto {
  @ApiProperty({ 
    description: 'Array of vendor IDs to invite',
    type: [String],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  vendorIds: string[];

  @ApiPropertyOptional({ description: 'Personal invitation message' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  invitationMessage?: string;

  @ApiPropertyOptional({ description: 'Special instructions for invited vendors' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Invitation expiry date' })
  @IsOptional()
  @IsDateString()
  invitationExpiryDate?: string;
}

// ==================== BID EVALUATION DTOs ====================

export class BidEvaluationDto {
  @ApiProperty({ description: 'Technical score (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  technicalScore: number;

  @ApiProperty({ description: 'Commercial score (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commercialScore: number;

  @ApiPropertyOptional({ description: 'Compliance score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore?: number;

  @ApiPropertyOptional({ description: 'Overall weighted score (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;

  @ApiPropertyOptional({ description: 'Detailed evaluation comments' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  evaluationComments?: string;

  @ApiPropertyOptional({ description: 'Evaluator ID' })
  @IsOptional()
  @IsUUID()
  evaluatorId?: string;

  @ApiPropertyOptional({ description: 'Evaluation date' })
  @IsOptional()
  @IsDateString()
  evaluationDate?: string;

  @ApiPropertyOptional({ description: 'Strengths identified' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiPropertyOptional({ description: 'Weaknesses identified' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weaknesses?: string[];

  @ApiPropertyOptional({ description: 'Recommendation' })
  @IsOptional()
  @IsEnum(['AWARD', 'REJECT', 'NEGOTIATE', 'REQUEST_CLARIFICATION'])
  recommendation?: string;
}

// ==================== BID AWARD DTOs ====================

export class BidAwardDto {
  @ApiPropertyOptional({ description: 'Award reason and justification' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  reason?: string;

  @ApiPropertyOptional({ description: 'Award conditions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({ description: 'Expected contract start date' })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @ApiPropertyOptional({ description: 'Next steps and timeline' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  nextSteps?: string;
}

// ==================== BID COMPARISON DTOs ====================

export class BidComparisonDto {
  @ApiProperty({ 
    description: 'Array of bid IDs to compare',
    type: [String],
    minItems: 2,
    maxItems: 10
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  bidIds: string[];

  @ApiPropertyOptional({ description: 'Comparison criteria to focus on' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comparisonCriteria?: string[];

  @ApiPropertyOptional({ description: 'Include detailed technical analysis' })
  @IsOptional()
  @IsBoolean()
  includeTechnicalAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Include risk analysis' })
  @IsOptional()
  @IsBoolean()
  includeRiskAnalysis?: boolean;
}
