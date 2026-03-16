import { IsString, IsEnum, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, Min, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceListType } from '../entities/price-list.entity';
import { DiscountType, DiscountApplicability } from '../entities/discount.entity';

export class PriceListItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxQuantity?: number;
}

export class CreatePriceListDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PriceListType)
  @IsOptional()
  type?: PriceListType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validTo?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListItemDto)
  prices: PriceListItemDto[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  customerIds?: string[];

  @IsBoolean()
  @IsOptional()
  isVolumePricing?: boolean;
}

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsEnum(DiscountApplicability)
  @IsOptional()
  applicability?: DiscountApplicability;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validTo?: Date;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  applicableProductIds?: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  applicableCategoryIds?: string[];

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchaseAmount?: number;
}

export class CalculatePriceDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  discountCode?: string;
}

export class BulkPriceCalculationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculatePriceDto)
  items: CalculatePriceDto[];

  @IsUUID()
  @IsOptional()
  customerId?: string;
}

export class ApplyDiscountDto {
  @IsString()
  code: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;
}

export class PriceBreakdownDto {
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  subtotal: number;
  discounts: {
    name: string;
    type: string;
    amount: number;
  }[];
  total: number;
}
