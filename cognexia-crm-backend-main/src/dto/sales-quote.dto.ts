import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export class QuoteLineItemDto {
  @ApiProperty({ description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price', minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

export class PaymentTermsDto {
  @ApiProperty({ description: 'Payment terms description' })
  @IsString()
  @IsNotEmpty()
  terms: string;

  @ApiProperty({ description: 'Due days', minimum: 0 })
  @IsNumber()
  @Min(0)
  dueDays: number;

  @ApiPropertyOptional({ description: 'Deposit percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  depositPercentage?: number;
}

export class CreateSalesQuoteDto {
  @ApiProperty({ description: 'Quote title', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Quote description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Line items', type: [QuoteLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems: QuoteLineItemDto[];

  @ApiProperty({ description: 'Valid until date' })
  @IsDateString()
  @IsNotEmpty()
  validUntil: string;

  @ApiProperty({ description: 'Payment terms', type: PaymentTermsDto })
  @ValidateNested()
  @Type(() => PaymentTermsDto)
  paymentTerms: PaymentTermsDto;

  @ApiProperty({ description: 'Associated customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ description: 'Associated opportunity ID' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSalesQuoteDto extends PartialType(CreateSalesQuoteDto) {
  @ApiPropertyOptional({ description: 'Quote status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}

export class SalesQuoteQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
