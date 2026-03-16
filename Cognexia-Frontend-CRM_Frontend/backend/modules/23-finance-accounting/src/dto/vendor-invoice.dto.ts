/**
 * Vendor Invoice DTOs - Data Transfer Objects
 * 
 * DTOs for vendor invoices and accounts payable, providing strongly typed
 * data structures for API requests and responses with validation and documentation.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID, 
  IsEnum, 
  IsNumber, 
  IsDateString,
  ValidateNested,
  IsArray,
  IsBoolean,
  Min,
  Max
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

// Enum definitions for validation
export enum VendorInvoiceStatus {
  RECEIVED = 'received',
  MATCHED = 'matched',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_ADDITIONAL_APPROVAL = 'requires_additional_approval',
}

export enum PaymentMethod {
  CHECK = 'check',
  ACH = 'ach',
  WIRE = 'wire',
  CARD = 'card',
  CRYPTO = 'crypto',
  DIGITAL_WALLET = 'digital_wallet',
}

export class RemitToAddressDto {
  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country code' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Contact name', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Contact phone', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class VendorInvoiceLineItemDto {
  @ApiProperty({ description: 'Line number' })
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ description: 'Product ID', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Product code', required: false })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ description: 'Line item description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Quantity', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  quantity: number;

  @ApiProperty({ description: 'Unit price', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  unitPrice: number;

  @ApiProperty({ description: 'Line total amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  lineTotal: number;

  @ApiProperty({ description: 'Tax amount for this line', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  taxAmount?: number;

  @ApiProperty({ description: 'Discount amount for this line', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  discountAmount?: number;

  @ApiProperty({ description: 'GL account for expense recognition' })
  @IsString()
  @IsNotEmpty()
  glAccount: string;

  @ApiProperty({ description: 'Cost center', required: false })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiProperty({ description: 'Project ID', required: false })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'PO line ID for matching', required: false })
  @IsOptional()
  @IsUUID()
  poLineId?: string;

  @ApiProperty({ description: 'Whether goods/services were receipted' })
  @IsBoolean()
  receipted: boolean;

  @ApiProperty({ description: 'Receipted quantity', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  receiptedQuantity?: number;
}

export class CreateVendorInvoiceDto {
  @ApiProperty({ description: 'Vendor invoice number' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({ description: 'Vendor ID' })
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ description: 'Related purchase order ID', required: false })
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @ApiProperty({ description: 'Purchase order number', required: false })
  @IsOptional()
  @IsString()
  purchaseOrderNumber?: string;

  @ApiProperty({ description: 'Invoice date from vendor' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ description: 'When invoice was received' })
  @IsDateString()
  receivedDate: string;

  @ApiProperty({ description: 'Payment due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Payment terms from vendor' })
  @IsString()
  @IsNotEmpty()
  paymentTerms: string;

  @ApiProperty({ description: 'Subtotal amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  subtotal: number;

  @ApiProperty({ description: 'Total tax amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  taxAmount: number;

  @ApiProperty({ description: 'Total discount amount', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  discountAmount?: number;

  @ApiProperty({ description: 'Total invoice amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  totalAmount: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string = 'USD';

  @ApiProperty({ description: 'Exchange rate to base currency', type: 'number', default: 1 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 1)
  exchangeRate?: number = 1;

  @ApiProperty({ description: 'Invoice description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'External reference number', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ description: 'Vendor remit-to address', type: RemitToAddressDto })
  @ValidateNested()
  @Type(() => RemitToAddressDto)
  remitToAddress: RemitToAddressDto;

  @ApiProperty({ description: 'Invoice line items', type: [VendorInvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorInvoiceLineItemDto)
  lineItems: VendorInvoiceLineItemDto[];
}

export class UpdateVendorInvoiceDto extends PartialType(CreateVendorInvoiceDto) {}

export class VendorInvoiceResponseDto extends CreateVendorInvoiceDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ description: 'Vendor code' })
  @IsString()
  vendorCode: string;

  @ApiProperty({ description: 'Vendor name' })
  @IsString()
  vendorName: string;

  @ApiProperty({ description: 'Outstanding amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  outstandingAmount: number;

  @ApiProperty({ description: 'Invoice processing status', enum: VendorInvoiceStatus })
  @IsEnum(VendorInvoiceStatus)
  status: VendorInvoiceStatus;

  @ApiProperty({ description: 'Approval workflow status', enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  approvalStatus: ApprovalStatus;

  @ApiProperty({ description: 'Amount in base currency', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  baseAmount: number;

  @ApiProperty({ description: 'When invoice was approved', required: false })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiProperty({ description: 'User who approved the invoice', required: false })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ description: 'When invoice was created' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'User who created the invoice' })
  @IsString()
  createdBy: string;
}

export class MatchInvoiceDto {
  @ApiProperty({ description: 'Invoice ID to match' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Purchase order ID to match against', required: false })
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @ApiProperty({ description: 'Receipt ID to match against', required: false })
  @IsOptional()
  @IsUUID()
  receiptId?: string;

  @ApiProperty({ description: 'Price variance tolerance percentage', type: 'number', default: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  priceTolerancePercent?: number = 5;

  @ApiProperty({ description: 'Quantity variance tolerance percentage', type: 'number', default: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  quantityTolerancePercent?: number = 5;

  @ApiProperty({ description: 'Force match despite variances' })
  @IsOptional()
  @IsBoolean()
  forceMatch?: boolean = false;
}

export class ApprovalStepDto {
  @ApiProperty({ description: 'Step number in approval workflow' })
  @IsNumber()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ description: 'Type of approver', enum: ['user', 'role', 'amount_threshold'] })
  @IsEnum(['user', 'role', 'amount_threshold'])
  approverType: string;

  @ApiProperty({ description: 'Approver ID (user ID, role name, etc.)' })
  @IsString()
  @IsNotEmpty()
  approverId: string;

  @ApiProperty({ description: 'Approver name for display' })
  @IsString()
  @IsNotEmpty()
  approverName: string;

  @ApiProperty({ description: 'Approval threshold amounts', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  threshold?: {
    minAmount?: number;
    maxAmount?: number;
  };
}

export class ApproveVendorInvoiceDto {
  @ApiProperty({ description: 'Invoice ID to approve' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Approval comments', required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'Delegate to another approver', required: false })
  @IsOptional()
  @IsUUID()
  delegateTo?: string;
}

export class RejectVendorInvoiceDto {
  @ApiProperty({ description: 'Invoice ID to reject' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Detailed rejection comments', required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'Return to vendor for correction' })
  @IsOptional()
  @IsBoolean()
  returnToVendor?: boolean = false;
}

export class ProcessVendorPaymentDto {
  @ApiProperty({ description: 'Invoice ID to pay' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment date' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ description: 'Payment amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  amount: number;

  @ApiProperty({ description: 'Payment reference' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ description: 'Bank account to pay from', required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiProperty({ description: 'Early payment discount taken', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  discountTaken?: number;
}

export class MatchingResultDto {
  @ApiProperty({ description: 'PO matching status' })
  @IsEnum(['not_matched', 'partially_matched', 'fully_matched', 'over_matched'])
  poMatchStatus: string;

  @ApiProperty({ description: 'Receipt matching status' })
  @IsEnum(['not_matched', 'partially_matched', 'fully_matched', 'over_matched'])
  receiptMatchStatus: string;

  @ApiProperty({ description: 'AI confidence score for matching', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1)
  aiConfidence: number;

  @ApiProperty({ description: 'When matching was performed', required: false })
  @IsOptional()
  @IsDateString()
  matchedAt?: string;

  @ApiProperty({ description: 'User who performed matching', required: false })
  @IsOptional()
  @IsString()
  matchedBy?: string;
}

export class VendorInvoiceAnalyticsDto {
  @ApiProperty({ description: 'Total invoices processed' })
  @IsNumber()
  totalInvoices: number;

  @ApiProperty({ description: 'Total amount processed', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  totalAmount: number;

  @ApiProperty({ description: 'Average processing time in hours', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Automation rate percentage', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  automationRate: number;

  @ApiProperty({ description: 'Exception rate percentage', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  exceptionRate: number;

  @ApiProperty({ description: 'On-time payment rate percentage', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  onTimePaymentRate: number;
}

export class OCRResultsDto {
  @ApiProperty({ description: 'Document ID for OCR processing' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'OCR confidence score', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({ description: 'Extracted fields from OCR' })
  extractedFields: Record<string, any>;

  @ApiProperty({ description: 'When OCR was processed' })
  @IsDateString()
  processedAt: string;
}
