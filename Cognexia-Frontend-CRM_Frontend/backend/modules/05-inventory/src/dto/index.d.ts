import { ItemCategory, ItemStatus, UnitOfMeasure, TransactionType, TransactionReason, AdjustmentReason } from '../enums';
export declare class CreateInventoryItemDto {
    name: string;
    sku: string;
    description?: string;
    category: ItemCategory;
    unitOfMeasure: UnitOfMeasure;
    unitCost: number;
    currentStock?: number;
    reorderLevel?: number;
    maxLevel?: number;
    initialLocation?: string;
    status?: ItemStatus;
    barcode?: string;
    location?: string;
    supplier?: string;
    leadTime?: number;
}
export declare class UpdateInventoryItemDto {
    name?: string;
    sku?: string;
    description?: string;
    category?: ItemCategory;
    unitOfMeasure?: UnitOfMeasure;
    unitCost?: number;
    status?: ItemStatus;
    barcode?: string;
    location?: string;
    supplier?: string;
    leadTime?: number;
}
export declare class StockTransactionDto {
    itemId: string;
    type: TransactionType;
    quantity: number;
    reason: TransactionReason;
    notes?: string;
    locationCode?: string;
    referenceId?: string;
    batchNumber?: string;
    expiryDate?: Date;
}
export declare class CycleCountDto {
    itemId: string;
    locationCode?: string;
    scheduledDate?: Date;
    notes?: string;
}
export declare class InventoryAdjustmentDto {
    itemId: string;
    adjustmentQuantity: number;
    reason: AdjustmentReason;
    notes?: string;
    referenceId?: string;
}
export declare class StockLocationDto {
    itemId: string;
    locationCode: string;
    quantity: number;
    isDefault?: boolean;
}
export declare class ReorderPointDto {
    itemId: string;
    reorderLevel: number;
    maxLevel?: number;
    isActive?: boolean;
}
export declare class InventoryReportDto {
    category?: ItemCategory;
    location?: string;
    lowStockOnly?: boolean;
    zeroStockOnly?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
}
//# sourceMappingURL=index.d.ts.map