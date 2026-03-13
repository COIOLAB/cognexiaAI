import { InventoryService } from '../services/InventoryService';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    createItem(createItemDto: any, req: any): Promise<import("../entities").InventoryItem>;
    getItems(query: any, req: any): Promise<{
        items: import("../entities").InventoryItem[];
        total: number;
        pages: number;
    }>;
    getItem(id: string): Promise<import("../entities").InventoryItem>;
    updateItem(id: string, updateItemDto: any, req: any): Promise<import("../entities").InventoryItem>;
    deleteItem(id: string): Promise<{
        message: string;
    }>;
    getStock(query: any): Promise<{
        transactions: import("../entities").StockTransaction[];
        total: number;
        pages: number;
    }>;
    adjustStock(adjustmentDto: any, req: any): Promise<import("../entities").InventoryAdjustment>;
    transferStock(transferDto: any, req: any): Promise<import("../entities").StockTransaction>;
    receiveStock(receiveDto: any, req: any): Promise<import("../entities").StockTransaction>;
    issueStock(issueDto: any, req: any): Promise<import("../entities").StockTransaction>;
    createCycleCount(cycleCountDto: any, req: any): Promise<import("../entities").CycleCount>;
    getCycleCounts(query: any): Promise<{
        message: string;
    }>;
    completeCycleCount(id: string, completeDto: any, req: any): Promise<import("../entities").CycleCount>;
    getAnalytics(query: any): Promise<any>;
    getAlerts(): Promise<import("../entities").InventoryAlert[]>;
    resolveAlert(id: string, req: any): Promise<import("../entities").InventoryAlert>;
    generateReport(reportDto: any): Promise<any>;
    createStockLocation(locationDto: any): Promise<import("../entities").StockLocation>;
    createReorderPoint(reorderPointDto: any): Promise<import("../entities").ReorderPoint>;
    getHealth(): Promise<any>;
}
//# sourceMappingURL=InventoryController.d.ts.map