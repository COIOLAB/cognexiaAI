import { InventoryItem } from './InventoryItem';
export declare class ReorderPoint {
    id: string;
    itemId: string;
    organizationId: string;
    reorderLevel: number;
    reorderQuantity: number;
    safetyStock: number;
    leadTimeDays: number;
    maxCost?: number;
    status: 'active' | 'inactive' | 'suspended';
    notes?: string;
    supplierId?: string;
    autoOrder: boolean;
    lastOrderedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    item: InventoryItem;
    shouldReorder(currentStock: number): boolean;
    calculateOptimalOrderQuantity(): number;
    getEstimatedDeliveryDate(): Date;
    isActive(): boolean;
    getStockoutRisk(currentStock: number): 'low' | 'medium' | 'high' | 'critical';
    getCostEstimate(unitCost: number): number;
}
//# sourceMappingURL=ReorderPoint.d.ts.map