/**
 * RFQ (Request for Quotation) Data Transfer Objects
 * Industry 5.0 ERP - Comprehensive RFQ DTOs with Validation
 */

import {
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  Length,
  IsEmail,
  IsUrl,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsObject,
  IsDecimal
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// Enums
export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  CLOSED = 'closed',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum RFQType {
  GOODS = 'goods',
  SERVICES = 'services',
  CONSTRUCTION = 'construction',
  CONSULTING = 'consulting',
  MIXED = 'mixed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum BidStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  AWARDED = 'awarded',
  WITHDRAWN = 'withdrawn'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  INR = 'INR'
}

// Embedded DTOs
export class RFQItemDto {
  @ApiProperty({ description: 'Item name/title', example: 'Office Laptops' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Item description', example: 'High-performance laptops for office use' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiProperty({ description: 'Quantity required', example: 50 })
  @IsNumber()
  @Min(1)
  @Max(999999)
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'pieces' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  unit: string;

  @ApiPropertyOptional({ description: 'Estimated unit price', example: 1200.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedUnitPrice?: number;

  @ApiPropertyOptional({ description: 'Item specifications', type: 'object' })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Item category', example: 'Electronics' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  category?: string;

  @ApiPropertyOptional({ description: 'Brand preference', example: 'Dell, HP, Lenovo' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  brandPreference?: string;

  @ApiPropertyOptional({ description: 'Delivery requirements', example: 'Delivered to main office' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  deliveryRequirements?: string;
}

export class EvaluationCriteriaDto {
  @ApiProperty({ description: 'Criteria name', example: 'Price' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Criteria description', example: 'Total cost including delivery' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiProperty({ description: 'Weight percentage (0-100)', example: 40 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({ description: 'Scoring method', example: 'lowest_wins' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  scoringMethod?: string;
}

export class RFQDocumentDto {
  @ApiProperty({ description: 'Document title', example: 'Technical Specifications' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ description: 'Document type', example: 'specification' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  type: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiProperty({ description: 'File URL or path', example: '/documents/tech-spec.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 1024000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type', example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: 'Is document mandatory for bidding', example: true })
  @IsBoolean()
  isMandatory: boolean;
}

export class SupplierInvitationDto {
  @ApiProperty({ description: 'Supplier ID', format: 'uuid' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'Supplier name', example: 'ABC Electronics Ltd.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  supplierName: string;

  @ApiProperty({ description: 'Contact email', example: 'procurement@abc-electronics.com' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '+1-555-0123' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Invitation sent date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invitationSentDate?: Date;

  @ApiPropertyOptional({ description: 'Response status', example: 'pending' })
  @IsOptional()
  @IsString()
  responseStatus?: string;
}

// Main DTOs
export class CreateRFQDto {
  @ApiProperty({ description: 'RFQ title', example: 'Office Equipment Procurement 2024' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ description: 'RFQ description', example: 'Annual procurement of office equipment and supplies' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  description: string;

  @ApiProperty({ enum: RFQType, description: 'Type of RFQ' })
  @IsEnum(RFQType)
  type: RFQType;

  @ApiProperty({ enum: Priority, description: 'Priority level' })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ description: 'Items requested', type: [RFQItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RFQItemDto)
  items: RFQItemDto[];

  @ApiProperty({ description: 'Total estimated budget', example: 100000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalBudget: number;

  @ApiProperty({ enum: CurrencyCode, description: 'Currency code' })
  @IsEnum(CurrencyCode)
  currency: CurrencyCode;

  @ApiProperty({ description: 'Submission deadline', example: '2024-12-31T23:59:59Z' })
  @IsDate()
  @Type(() => Date)
  submissionDeadline: Date;

  @ApiPropertyOptional({ description: 'Expected delivery date', example: '2024-01-15T00:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedDeliveryDate?: Date;

  @ApiProperty({ description: 'Evaluation criteria', type: [EvaluationCriteriaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriteriaDto)
  evaluationCriteria: EvaluationCriteriaDto[];

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  @Length(0, 10000)
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Special requirements' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  specialRequirements?: string;

  @ApiProperty({ description: 'Department ID', format: 'uuid' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ description: 'Created by user ID', format: 'uuid' })
  @IsUUID()
  createdBy: string;

  @ApiPropertyOptional({ description: 'Project ID if applicable', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Budget code' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'Cost center' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  costCenter?: string;

  @ApiPropertyOptional({ description: 'GL account' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  glAccount?: string;

  @ApiPropertyOptional({ description: 'Invited suppliers', type: [SupplierInvitationDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SupplierInvitationDto)
  invitedSuppliers?: SupplierInvitationDto[];

  @ApiPropertyOptional({ description: 'Attached documents', type: [RFQDocumentDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RFQDocumentDto)
  documents?: RFQDocumentDto[];

  @ApiPropertyOptional({ description: 'Pre-bid conference date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  preBidConferenceDate?: Date;

  @ApiPropertyOptional({ description: 'Site visit required', example: false })
  @IsOptional()
  @IsBoolean()
  siteVisitRequired?: boolean;

  @ApiPropertyOptional({ description: 'Amendments allowed after publication', example: true })
  @IsOptional()
  @IsBoolean()
  amendmentsAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Auto-extend deadline if no bids', example: false })
  @IsOptional()
  @IsBoolean()
  autoExtendDeadline?: boolean;

  @ApiPropertyOptional({ description: 'Minimum number of bids required', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  minimumBids?: number;

  @ApiPropertyOptional({ description: 'Qualification criteria' })
  @IsOptional()
  @IsObject()
  qualificationCriteria?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Warranty requirements' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  warrantyRequirements?: string;

  @ApiPropertyOptional({ description: 'Delivery terms (Incoterms)' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  deliveryTerms?: string;

  @ApiPropertyOptional({ description: 'Compliance requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceRequirements?: string[];

  @ApiPropertyOptional({ description: 'Sustainability requirements' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  sustainabilityRequirements?: string;

  @ApiPropertyOptional({ description: 'Insurance requirements' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  insuranceRequirements?: string;

  @ApiPropertyOptional({ description: 'Security clearance required', example: false })
  @IsOptional()
  @IsBoolean()
  securityClearanceRequired?: boolean;

  @ApiPropertyOptional({ description: 'Confidentiality level', example: 'standard' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  confidentialityLevel?: string;
}

export class UpdateRFQDto extends PartialType(CreateRFQDto) {
  @ApiPropertyOptional({ description: 'Last modified by user ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  lastModifiedBy?: string;

  @ApiPropertyOptional({ description: 'Reason for update' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  updateReason?: string;

  @ApiPropertyOptional({ description: 'Amendment number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amendmentNumber?: number;
}

export class RFQFilterDto {
  @ApiPropertyOptional({ enum: RFQStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RFQStatus)
  status?: RFQStatus;

  @ApiPropertyOptional({ enum: RFQType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(RFQType)
  type?: RFQType;

  @ApiPropertyOptional({ enum: Priority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Filter by department ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by creator user ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Filter from date', example: '2024-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fromDate?: Date;

  @ApiPropertyOptional({ description: 'Filter to date', example: '2024-12-31' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  toDate?: Date;

  @ApiPropertyOptional({ description: 'Search term for title/description' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field', example: 'createdDate' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdDate';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Include archived RFQs', example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeArchived?: boolean = false;

  @ApiPropertyOptional({ description: 'Budget range minimum' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Budget range maximum' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ enum: CurrencyCode, description: 'Currency filter' })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;
}

export class BidDto {
  @ApiProperty({ description: 'Bid ID', format: 'uuid' })
  @IsUUID()
  bidId: string;

  @ApiProperty({ description: 'Supplier ID', format: 'uuid' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'Supplier name', example: 'ABC Electronics Ltd.' })
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty({ description: 'Total bid amount', example: 95000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiProperty({ enum: CurrencyCode, description: 'Currency code' })
  @IsEnum(CurrencyCode)
  currency: CurrencyCode;

  @ApiProperty({ enum: BidStatus, description: 'Bid status' })
  @IsEnum(BidStatus)
  status: BidStatus;

  @ApiProperty({ description: 'Submission date' })
  @IsDate()
  @Type(() => Date)
  submissionDate: Date;

  @ApiPropertyOptional({ description: 'Bid validity date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validityDate?: Date;

  @ApiPropertyOptional({ description: 'Delivery timeline in days', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryDays?: number;

  @ApiPropertyOptional({ description: 'Payment terms offered' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Warranty offered in months', example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({ description: 'Additional notes from supplier' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Compliance confirmations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceConfirmations?: string[];

  @ApiPropertyOptional({ description: 'Supporting documents' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RFQDocumentDto)
  documents?: RFQDocumentDto[];

  @ApiPropertyOptional({ description: 'Evaluation scores by criteria' })
  @IsOptional()
  @IsObject()
  evaluationScores?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Overall evaluation score (0-100)', example: 85.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  overallScore?: number;

  @ApiPropertyOptional({ description: 'Evaluator comments' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  evaluatorComments?: string;

  @ApiPropertyOptional({ description: 'Rejection reason if applicable' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Risk assessment score (0-100)', example: 25.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Technical compliance score (0-100)', example: 95.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  technicalScore?: number;

  @ApiPropertyOptional({ description: 'Commercial score (0-100)', example: 80.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commercialScore?: number;
}

export class RFQEvaluationDto {
  @ApiProperty({ description: 'Evaluator user ID', format: 'uuid' })
  @IsUUID()
  evaluatedBy: string;

  @ApiProperty({ description: 'Evaluation committee members', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID(undefined, { each: true })
  evaluationCommittee: string[];

  @ApiPropertyOptional({ description: 'Evaluation start date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  evaluationStartDate?: Date;

  @ApiProperty({ description: 'Evaluation completion date' })
  @IsDate()
  @Type(() => Date)
  evaluationCompletionDate: Date;

  @ApiPropertyOptional({ description: 'Evaluation methodology used' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  evaluationMethodology?: string;

  @ApiPropertyOptional({ description: 'Overall evaluation comments' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  overallComments?: string;

  @ApiProperty({ description: 'Enable auto-ranking based on scores', example: true })
  @IsBoolean()
  autoRanking: boolean;

  @ApiPropertyOptional({ description: 'Custom ranking if not using auto-ranking' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  customRanking?: string[];

  @ApiPropertyOptional({ description: 'Evaluation criteria weights adjustment' })
  @IsOptional()
  @IsObject()
  criteriaWeights?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Disqualified bids with reasons' })
  @IsOptional()
  @IsObject()
  disqualifiedBids?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Recommended supplier ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  recommendedSupplierId?: string;

  @ApiPropertyOptional({ description: 'Alternative suppliers in order of preference' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  alternativeSuppliers?: string[];

  @ApiPropertyOptional({ description: 'Cost-benefit analysis results' })
  @IsOptional()
  @IsObject()
  costBenefitAnalysis?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Risk assessment results' })
  @IsOptional()
  @IsObject()
  riskAssessment?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Value for money analysis' })
  @IsOptional()
  @IsObject()
  valueForMoneyAnalysis?: Record<string, any>;
}

export class RFQAwardDto {
  @ApiProperty({ description: 'Awarded supplier ID', format: 'uuid' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'Award decision maker user ID', format: 'uuid' })
  @IsUUID()
  awardedBy: string;

  @ApiProperty({ description: 'Award amount', example: 95000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  awardValue: number;

  @ApiProperty({ enum: CurrencyCode, description: 'Award currency' })
  @IsEnum(CurrencyCode)
  currency: CurrencyCode;

  @ApiProperty({ description: 'Award date' })
  @IsDate()
  @Type(() => Date)
  awardDate: Date;

  @ApiPropertyOptional({ description: 'Award conditions and terms' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  conditions?: string[];

  @ApiPropertyOptional({ description: 'Award justification' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  justification?: string;

  @ApiPropertyOptional({ description: 'Expected contract start date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  contractStartDate?: Date;

  @ApiPropertyOptional({ description: 'Expected contract end date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  contractEndDate?: Date;

  @ApiPropertyOptional({ description: 'Performance bond required', example: false })
  @IsOptional()
  @IsBoolean()
  performanceBondRequired?: boolean;

  @ApiPropertyOptional({ description: 'Performance bond percentage', example: 10.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  performanceBondPercentage?: number;

  @ApiPropertyOptional({ description: 'Advance payment percentage', example: 20.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  advancePaymentPercentage?: number;

  @ApiPropertyOptional({ description: 'Retention percentage', example: 5.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  retentionPercentage?: number;

  @ApiPropertyOptional({ description: 'Special instructions for the supplier' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Contract template to use' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  contractTemplate?: string;

  @ApiPropertyOptional({ description: 'Award approval chain', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMaxSize(5)
  approvalChain?: string[];

  @ApiPropertyOptional({ description: 'Auto-generate purchase order', example: true })
  @IsOptional()
  @IsBoolean()
  autoGeneratePO?: boolean;

  @ApiPropertyOptional({ description: 'Auto-generate contract', example: true })
  @IsOptional()
  @IsBoolean()
  autoGenerateContract?: boolean;
}

export class RFQPublishDto {
  @ApiProperty({ description: 'Published by user ID', format: 'uuid' })
  @IsUUID()
  publishedBy: string;

  @ApiPropertyOptional({ description: 'Send notifications to suppliers', example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean = true;

  @ApiPropertyOptional({ description: 'Publication channels' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publicationChannels?: string[];

  @ApiPropertyOptional({ description: 'Additional supplier emails to notify' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMaxSize(100)
  additionalNotifications?: string[];

  @ApiPropertyOptional({ description: 'Publication notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  publicationNotes?: string;

  @ApiPropertyOptional({ description: 'Embargo until date (for scheduled publication)' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  embargoUntil?: Date;
}

export class RFQAmendmentDto {
  @ApiProperty({ description: 'Amendment made by user ID', format: 'uuid' })
  @IsUUID()
  amendedBy: string;

  @ApiProperty({ description: 'Amendment title', example: 'Deadline Extension' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ description: 'Amendment description', example: 'Extended submission deadline by 7 days' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  description: string;

  @ApiProperty({ description: 'Changed fields and their new values' })
  @IsObject()
  changes: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reason for amendment' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  reason?: string;

  @ApiProperty({ description: 'Amendment effective date' })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiPropertyOptional({ description: 'Notify all invited suppliers', example: true })
  @IsOptional()
  @IsBoolean()
  notifySuppliers?: boolean = true;

  @ApiPropertyOptional({ description: 'Extend bid validity period', example: false })
  @IsOptional()
  @IsBoolean()
  extendBidValidity?: boolean = false;

  @ApiPropertyOptional({ description: 'Additional validity days if extending' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  additionalValidityDays?: number;

  @ApiPropertyOptional({ description: 'Amendment urgency level', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  urgency?: Priority = Priority.MEDIUM;
}

export class RFQResponseDto {
  @ApiProperty({ description: 'RFQ ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'RFQ number', example: 'RFQ-2024-001234' })
  rfqNumber: string;

  @ApiProperty({ description: 'RFQ title' })
  title: string;

  @ApiProperty({ description: 'RFQ description' })
  description: string;

  @ApiProperty({ enum: RFQStatus, description: 'Current status' })
  status: RFQStatus;

  @ApiProperty({ enum: RFQType, description: 'RFQ type' })
  type: RFQType;

  @ApiProperty({ enum: Priority, description: 'Priority level' })
  priority: Priority;

  @ApiProperty({ description: 'Total budget amount' })
  totalBudget: number;

  @ApiProperty({ enum: CurrencyCode, description: 'Currency code' })
  currency: CurrencyCode;

  @ApiProperty({ description: 'Creation date' })
  createdDate: Date;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Submission deadline' })
  submissionDeadline: Date;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  expectedDeliveryDate?: Date;

  @ApiProperty({ description: 'Number of items requested' })
  itemCount: number;

  @ApiProperty({ description: 'Number of suppliers invited' })
  suppliersInvited: number;

  @ApiProperty({ description: 'Number of bids received' })
  bidsReceived: number;

  @ApiPropertyOptional({ description: 'Days remaining until deadline' })
  daysToDeadline?: number;

  @ApiPropertyOptional({ description: 'Bid response rate percentage' })
  responseRate?: number;

  @ApiPropertyOptional({ description: 'Average bid amount' })
  averageBidAmount?: number;

  @ApiPropertyOptional({ description: 'Lowest bid amount' })
  lowestBidAmount?: number;

  @ApiPropertyOptional({ description: 'Highest bid amount' })
  highestBidAmount?: number;

  @ApiPropertyOptional({ description: 'Evaluation completion percentage' })
  evaluationProgress?: number;

  @ApiPropertyOptional({ description: 'Awarded supplier name' })
  awardedSupplier?: string;

  @ApiPropertyOptional({ description: 'Award value' })
  awardValue?: number;

  @ApiPropertyOptional({ description: 'Last modification date' })
  lastModifiedDate?: Date;

  @ApiPropertyOptional({ description: 'Amendment count' })
  amendmentCount?: number;

  @ApiProperty({ description: 'Items in the RFQ', type: [RFQItemDto] })
  items: RFQItemDto[];

  @ApiProperty({ description: 'Evaluation criteria', type: [EvaluationCriteriaDto] })
  evaluationCriteria: EvaluationCriteriaDto[];

  @ApiPropertyOptional({ description: 'Received bids', type: [BidDto] })
  bids?: BidDto[];

  @ApiPropertyOptional({ description: 'Department information' })
  department?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional({ description: 'Creator information' })
  creator?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'Project information if applicable' })
  project?: {
    id: string;
    name: string;
    code: string;
  };
}
