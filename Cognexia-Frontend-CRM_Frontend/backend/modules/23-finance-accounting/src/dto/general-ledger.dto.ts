/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * General Ledger Data Transfer Objects
 * 
 * Comprehensive DTOs for general ledger operations including journal entries,
 * posting rules, trial balance, and AI-powered financial intelligence
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
  IsUUID,
  IsDate,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  IsEmail,
  IsPositive,
  ArrayNotEmpty,
  IsDecimal,
  Matches,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============== ENUMS ==============

export enum EntryType {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  REVERSAL = 'reversal',
  ADJUSTMENT = 'adjustment',
  CLOSING = 'closing',
  OPENING = 'opening',
  RECURRING = 'recurring',
  ACCRUAL = 'accrual',
  ALLOCATION = 'allocation'
}

export enum PostingStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  REVERSED = 'reversed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  VOUCHER = 'voucher',
  BANK_STATEMENT = 'bank_statement',
  CONTRACT = 'contract',
  PURCHASE_ORDER = 'purchase_order',
  SALES_ORDER = 'sales_order',
  OTHER = 'other'
}

export enum BalanceType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense'
}

// ============== BASE DTOs ==============

export class SourceDocumentDto {
  @ApiProperty({ description: 'Document type', enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ description: 'Document number' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  documentNumber: string;

  @ApiProperty({ description: 'Document date' })
  @IsDateString()
  documentDate: string;

  @ApiPropertyOptional({ description: 'Document attachments', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class DimensionDto {
  @ApiPropertyOptional({ description: 'Cost center' })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiPropertyOptional({ description: 'Profit center' })
  @IsOptional()
  @IsString()
  profitCenter?: string;

  @ApiPropertyOptional({ description: 'Product' })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiPropertyOptional({ description: 'Customer' })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiPropertyOptional({ description: 'Supplier' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Project' })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({ description: 'Campaign' })
  @IsOptional()
  @IsString()
  campaign?: string;

  @ApiPropertyOptional({ description: 'Custom dimensions' })
  @IsOptional()
  @IsObject()
  customDimensions?: Record<string, string>;
}

export class TaxInformationDto {
  @ApiProperty({ description: 'Tax code' })
  @IsString()
  @IsNotEmpty()
  taxCode: string;

  @ApiProperty({ description: 'Tax rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

  @ApiProperty({ description: 'Tax amount' })
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @ApiProperty({ description: 'Taxable amount' })
  @IsNumber()
  @Min(0)
  taxableAmount: number;
}

export class ApprovalHistoryDto {
  @ApiProperty({ description: 'Approver user ID' })
  @IsString()
  @IsNotEmpty()
  approver: string;

  @ApiProperty({ description: 'Approval action' })
  @IsEnum(['APPROVED', 'REJECTED', 'RETURNED'])
  action: 'APPROVED' | 'REJECTED' | 'RETURNED';

  @ApiProperty({ description: 'Approval date' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  comments?: string;
}

export class ApprovalWorkflowDto {
  @ApiProperty({ description: 'Required approvers', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  requiredApprovals: string[];

  @ApiPropertyOptional({ description: 'Current approver' })
  @IsOptional()
  @IsString()
  currentApprover?: string;

  @ApiProperty({ description: 'Approval status' })
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

  @ApiProperty({ description: 'Approval history', type: [ApprovalHistoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalHistoryDto)
  approvalHistory: ApprovalHistoryDto[];
}

export class AIValidationDto {
  @ApiProperty({ description: 'AI confidence score (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore: number;

  @ApiPropertyOptional({ description: 'Anomaly flags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anomalyFlags?: string[];

  @ApiPropertyOptional({ description: 'AI suggestions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @ApiProperty({ description: 'Risk assessment' })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AuditTrailDto {
  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdDate: string;

  @ApiPropertyOptional({ description: 'Last modified by user ID' })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @ApiPropertyOptional({ description: 'Last modification date' })
  @IsOptional()
  @IsDateString()
  lastModifiedDate?: string;

  @ApiProperty({ description: 'Posting status', enum: PostingStatus })
  @IsEnum(PostingStatus)
  postingStatus: PostingStatus;

  @ApiPropertyOptional({ description: 'Posting reference' })
  @IsOptional()
  @IsString()
  postingReference?: string;

  @ApiPropertyOptional({ description: 'Reversal reference' })
  @IsOptional()
  @IsString()
  reversalReference?: string;
}

// ============== JOURNAL LINE DTOs ==============

export class JournalLineDto {
  @ApiProperty({ description: 'Line number' })
  @IsInt()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Account code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  accountCode: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  accountName: string;

  @ApiProperty({ description: 'Debit amount' })
  @IsNumber()
  @Min(0)
  debitAmount: number;

  @ApiProperty({ description: 'Credit amount' })
  @IsNumber()
  @Min(0)
  creditAmount: number;

  @ApiProperty({ description: 'Local currency debit amount' })
  @IsNumber()
  @Min(0)
  localCurrencyDebit: number;

  @ApiProperty({ description: 'Local currency credit amount' })
  @IsNumber()
  @Min(0)
  localCurrencyCredit: number;

  @ApiProperty({ description: 'Line description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({ description: 'Dimensions', type: DimensionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionDto)
  dimensions?: DimensionDto;

  @ApiPropertyOptional({ description: 'Tax information', type: TaxInformationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInformationDto)
  taxInformation?: TaxInformationDto;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  unitOfMeasure?: string;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  paymentTerms?: string;
}

// ============== JOURNAL ENTRY DTOs ==============

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Entry type', enum: EntryType })
  @IsEnum(EntryType)
  entryType: EntryType;

  @ApiProperty({ description: 'Transaction date' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ description: 'Posting date' })
  @IsDateString()
  postingDate: string;

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

  @ApiProperty({ description: 'Entry reference' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  reference: string;

  @ApiProperty({ description: 'Entry description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({ description: 'Source document', type: SourceDocumentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SourceDocumentDto)
  sourceDocument?: SourceDocumentDto;

  @ApiProperty({ description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be 3-letter ISO code' })
  currency: string;

  @ApiPropertyOptional({ description: 'Exchange rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @ApiPropertyOptional({ description: 'Business unit' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  businessUnit?: string;

  @ApiPropertyOptional({ description: 'Cost center' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  costCenter?: string;

  @ApiPropertyOptional({ description: 'Profit center' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  profitCenter?: string;

  @ApiPropertyOptional({ description: 'Project' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  project?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  department?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  location?: string;

  @ApiProperty({ description: 'Journal lines', type: [JournalLineDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  journalLines: JournalLineDto[];

  @ApiPropertyOptional({ description: 'Approval workflow', type: ApprovalWorkflowDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApprovalWorkflowDto)
  approvalWorkflow?: ApprovalWorkflowDto;
}

export class UpdateJournalEntryDto extends PartialType(CreateJournalEntryDto) {
  @ApiPropertyOptional({ description: 'AI validation results', type: AIValidationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIValidationDto)
  aiValidation?: AIValidationDto;
}

export class JournalEntryResponseDto extends CreateJournalEntryDto {
  @ApiProperty({ description: 'Entry ID' })
  @IsUUID()
  entryId: string;

  @ApiProperty({ description: 'Audit trail', type: AuditTrailDto })
  @ValidateNested()
  @Type(() => AuditTrailDto)
  auditTrail: AuditTrailDto;

  @ApiPropertyOptional({ description: 'AI validation', type: AIValidationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIValidationDto)
  aiValidation?: AIValidationDto;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDateString()
  updatedAt: string;
}

// ============== QUERY DTOs ==============

export class JournalEntryQueryDto {
  @ApiPropertyOptional({ description: 'Entry type filter' })
  @IsOptional()
  @IsEnum(EntryType)
  entryType?: EntryType;

  @ApiPropertyOptional({ description: 'Posting status filter' })
  @IsOptional()
  @IsEnum(PostingStatus)
  postingStatus?: PostingStatus;

  @ApiPropertyOptional({ description: 'From date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'To date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Period filter' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'Fiscal year filter' })
  @IsOptional()
  @IsString()
  fiscalYear?: string;

  @ApiPropertyOptional({ description: 'Account code filter' })
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional({ description: 'Business unit filter' })
  @IsOptional()
  @IsString()
  businessUnit?: string;

  @ApiPropertyOptional({ description: 'Cost center filter' })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiPropertyOptional({ description: 'Created by user filter' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  @IsIn(['transactionDate', 'postingDate', 'createdAt', 'updatedAt', 'reference'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ============== BULK OPERATIONS DTOs ==============

export class BulkJournalEntryOperationDto {
  @ApiProperty({ description: 'Journal entry IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID(undefined, { each: true })
  entryIds: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['POST', 'REVERSE', 'CANCEL', 'APPROVE', 'REJECT'])
  operation: 'POST' | 'REVERSE' | 'CANCEL' | 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Operation reason' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}

export class JournalEntryValidationDto {
  @ApiProperty({ description: 'Journal entry to validate', type: CreateJournalEntryDto })
  @ValidateNested()
  @Type(() => CreateJournalEntryDto)
  journalEntry: CreateJournalEntryDto;

  @ApiPropertyOptional({ description: 'Validation level' })
  @IsOptional()
  @IsEnum(['BASIC', 'STANDARD', 'COMPREHENSIVE'])
  validationLevel?: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE' = 'STANDARD';

  @ApiPropertyOptional({ description: 'Include AI validation' })
  @IsOptional()
  @IsBoolean()
  includeAIValidation?: boolean = true;
}

// ============== GENERAL LEDGER ANALYTICS DTOs ==============

export class GeneralLedgerAnalyticsDto {
  @ApiPropertyOptional({ description: 'Analysis period start' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Analysis period end' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Account types to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(AccountType, { each: true })
  accountTypes?: AccountType[];

  @ApiPropertyOptional({ description: 'Business units to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessUnits?: string[];

  @ApiPropertyOptional({ description: 'Include AI insights' })
  @IsOptional()
  @IsBoolean()
  includeAIInsights?: boolean = true;

  @ApiPropertyOptional({ description: 'Include variance analysis' })
  @IsOptional()
  @IsBoolean()
  includeVarianceAnalysis?: boolean = true;

  @ApiPropertyOptional({ description: 'Include trend analysis' })
  @IsOptional()
  @IsBoolean()
  includeTrendAnalysis?: boolean = true;
}
