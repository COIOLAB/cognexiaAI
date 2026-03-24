import { IsString, IsEnum, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, Min, IsUUID, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus, ProductType } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  trackInventory?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityInStock?: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityInStock?: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;
}

export class ProductSearchDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreateBundleDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsArray()
  items: Array<{ productId: string; quantity: number }>;

  @IsNumber()
  @Min(0)
  bundlePrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercentage?: number;
}
