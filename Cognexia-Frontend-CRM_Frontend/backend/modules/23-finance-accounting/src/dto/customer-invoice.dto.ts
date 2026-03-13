/**
 * Customer Invoice DTOs - Data Transfer Objects
 * 
 * DTOs for customer invoices and accounts receivable, providing strongly typed
 * data structures for API requests and responses with validation and documentation.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, PCI-DSS, SOX
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID, 
  IsEnum, 
  IsNumber, 
  IsDecimal, 
  IsDateString,
  ValidateNested,
  IsArray,
  Min
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

// Enum definitions for validation
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIAL_PAID = 'partial_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export class BillingAddressDto {
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
}

export class InvoiceLineItemDto {
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

  @ApiProperty({ description: 'GL account for revenue recognition' })
  @IsString()
  @IsNotEmpty()
  glAccount: string;
}

export class CreateCustomerInvoiceDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Sales order ID', required: false })
  @IsOptional()
  @IsUUID()
  salesOrderId?: string;

  @ApiProperty({ description: 'Invoice date' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ description: 'Payment due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Payment terms' })
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

  @ApiProperty({ description: 'Billing address', type: BillingAddressDto })
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @ApiProperty({ description: 'Shipping address', type: BillingAddressDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  shippingAddress?: BillingAddressDto;

  @ApiProperty({ description: 'Invoice line items', type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];
}

export class UpdateCustomerInvoiceDto extends PartialType(CreateCustomerInvoiceDto) {}

export class CustomerInvoiceResponseDto extends CreateCustomerInvoiceDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Customer code' })
  @IsString()
  customerCode: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Outstanding amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  outstandingAmount: number;

  @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @ApiProperty({ description: 'Amount in base currency', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  baseAmount: number;

  @ApiProperty({ description: 'When invoice was sent', required: false })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiProperty({ description: 'When invoice was created' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'User who created the invoice' })
  @IsString()
  createdBy: string;
}

export class SendInvoiceDto {
  @ApiProperty({ description: 'Delivery method', enum: ['email', 'postal', 'portal', 'api'], default: 'email' })
  @IsOptional()
  @IsEnum(['email', 'postal', 'portal', 'api'])
  deliveryMethod?: string = 'email';

  @ApiProperty({ description: 'Email address to send to', required: false })
  @IsOptional()
  @IsString()
  emailAddress?: string;

  @ApiProperty({ description: 'Send copy to additional addresses', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccEmails?: string[];
}

export class PaymentApplicationDto {
  @ApiProperty({ description: 'Invoice ID to apply payment to' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ description: 'Amount to apply to this invoice', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  appliedAmount: number;

  @ApiProperty({ description: 'Write-off amount', type: 'number', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 0)
  writeOffAmount?: number;
}

export class ProcessCustomerPaymentDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Payment method', enum: ['cash', 'check', 'ach', 'wire', 'card', 'crypto', 'digital_wallet'] })
  @IsEnum(['cash', 'check', 'ach', 'wire', 'card', 'crypto', 'digital_wallet'])
  paymentMethod: string;

  @ApiProperty({ description: 'Payment date' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ description: 'Payment amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Transform(({ value }) => new Decimal(value).toNumber())
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currencyCode?: string = 'USD';

  @ApiProperty({ description: 'Payment reference' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ description: 'Bank account', required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiProperty({ description: 'Payment applications to invoices', type: [PaymentApplicationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentApplicationDto)
  appliedToInvoices?: PaymentApplicationDto[];
}

export class AgingReportRequestDto {
  @ApiProperty({ description: 'As of date for aging calculation' })
  @IsDateString()
  asOfDate: string;

  @ApiProperty({ description: 'Entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Specific customer ID for aging', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Currency code filter', required: false })
  @IsOptional()
  @IsString()
  currencyCode?: string;
}

export class AgingBucketDto {
  @ApiProperty({ description: 'Bucket name (e.g., Current, 1-30 Days)' })
  @IsString()
  bucketName: string;

  @ApiProperty({ description: 'Days from (inclusive)' })
  @IsNumber()
  daysFrom: number;

  @ApiProperty({ description: 'Days to (inclusive)' })
  @IsNumber()
  daysTo: number;

  @ApiProperty({ description: 'Total amount in this bucket', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  amount: number;

  @ApiProperty({ description: 'Percentage of total outstanding', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  percentage: number;

  @ApiProperty({ description: 'Number of invoices in this bucket' })
  @IsNumber()
  invoiceCount: number;

  @ApiProperty({ description: 'Number of customers in this bucket' })
  @IsNumber()
  customerCount: number;
}

export class CustomerAgingDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Total outstanding amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  totalOutstanding: number;

  @ApiProperty({ description: 'Current amount (not overdue)', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  current: number;

  @ApiProperty({ description: '1-30 days overdue', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  days1to30: number;

  @ApiProperty({ description: '31-60 days overdue', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  days31to60: number;

  @ApiProperty({ description: '61-90 days overdue', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  days61to90: number;

  @ApiProperty({ description: 'Over 90 days overdue', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  over90Days: number;

  @ApiProperty({ description: 'Customer credit limit', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  creditLimit: number;

  @ApiProperty({ description: 'Risk score (0-100)' })
  @IsNumber({ maxDecimalPlaces: 0 })
  riskScore: number;

  @ApiProperty({ description: 'Last payment date' })
  @IsDateString()
  lastPaymentDate: string;

  @ApiProperty({ description: 'Largest outstanding invoice', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  largestInvoice: number;
}

export class AgingReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  @IsUUID()
  reportId: string;

  @ApiProperty({ description: 'When report was generated' })
  @IsDateString()
  generatedAt: string;

  @ApiProperty({ description: 'As of date for the report' })
  @IsDateString()
  asOfDate: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'Report currency code' })
  @IsString()
  currencyCode: string;

  @ApiProperty({ description: 'Total outstanding amount', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  totalOutstanding: number;

  @ApiProperty({ description: 'Aging buckets breakdown', type: [AgingBucketDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgingBucketDto)
  agingBuckets: AgingBucketDto[];

  @ApiProperty({ description: 'Customer-wise aging details', type: [CustomerAgingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerAgingDto)
  customerAging: CustomerAgingDto[];
}
