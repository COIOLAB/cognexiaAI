// Inventory Module DTOs Index
// Data Transfer Objects for inventory operations

import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCategory, ItemStatus, UnitOfMeasure, TransactionType, TransactionReason, CycleCountStatus, AdjustmentReason } from '../enums';

export class CreateInventoryItemDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ItemCategory)
  category: ItemCategory;

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLevel?: number;

  @IsOptional()
  @IsString()
  initialLocation?: string;

  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTime?: number;
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTime?: number;
}

export class StockTransactionDto {
  @IsString()
  itemId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsEnum(TransactionReason)
  reason: TransactionReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @Type(() => Date)
  expiryDate?: Date;
}

export class CycleCountDto {
  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @Type(() => Date)
  scheduledDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class InventoryAdjustmentDto {
  @IsString()
  itemId: string;

  @IsNumber()
  adjustmentQuantity: number;

  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class StockLocationDto {
  @IsString()
  itemId: string;

  @IsString()
  locationCode: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ReorderPointDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLevel?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class InventoryReportDto {
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  zeroStockOnly?: boolean;

  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;
}
