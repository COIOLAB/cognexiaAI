import { Repository, QueryRunner } from 'typeorm';
import { InventoryItem, StockTransaction, StockLocation, CycleCount, InventoryAdjustment, InventoryAlert, ReorderPoint } from '../entities';
import { CreateInventoryItemDto, UpdateInventoryItemDto, StockTransactionDto, CycleCountDto, InventoryAdjustmentDto, InventoryReportDto, StockLocationDto, ReorderPointDto } from '../dto';
import { TransactionType, TransactionReason, ItemCategory } from '../enums';
export declare class InventoryService {
    private readonly inventoryItemRepository;
    private readonly stockTransactionRepository;
    private readonly stockLocationRepository;
    private readonly cycleCountRepository;
    private readonly inventoryAdjustmentRepository;
    private readonly inventoryAlertRepository;
    private readonly reorderPointRepository;
    private readonly logger;
    constructor(inventoryItemRepository: Repository<InventoryItem>, stockTransactionRepository: Repository<StockTransaction>, stockLocationRepository: Repository<StockLocation>, cycleCountRepository: Repository<CycleCount>, inventoryAdjustmentRepository: Repository<InventoryAdjustment>, inventoryAlertRepository: Repository<InventoryAlert>, reorderPointRepository: Repository<ReorderPoint>);
    createItem(createDto: CreateInventoryItemDto, userId: string): Promise<InventoryItem>;
    findAllItems(page?: number, limit?: number, filters?: {
        category?: ItemCategory;
        status?: string;
        lowStock?: boolean;
        location?: string;
        search?: string;
    }): Promise<{
        items: InventoryItem[];
        total: number;
        pages: number;
    }>;
    findItemById(id: string): Promise<InventoryItem>;
    updateItem(id: string, updateDto: UpdateInventoryItemDto, userId: string): Promise<InventoryItem>;
    deleteItem(id: string): Promise<void>;
    createStockTransaction(transactionDto: StockTransactionDto, userId: string, queryRunner?: QueryRunner): Promise<StockTransaction>;
    getStockTransactions(itemId?: string, page?: number, limit?: number, filters?: {
        type?: TransactionType;
        reason?: TransactionReason;
        dateFrom?: Date;
        dateTo?: Date;
        location?: string;
    }): Promise<{
        transactions: StockTransaction[];
        total: number;
        pages: number;
    }>;
    createStockLocation(locationDto: StockLocationDto): Promise<StockLocation>;
    private updateStockLocation;
    createCycleCount(cycleCountDto: CycleCountDto, userId: string): Promise<CycleCount>;
    completeCycleCount(id: string, actualQuantity: number, notes: string, userId: string): Promise<CycleCount>;
    createInventoryAdjustment(adjustmentDto: InventoryAdjustmentDto, userId: string): Promise<InventoryAdjustment>;
    createReorderPoint(reorderPointDto: ReorderPointDto): Promise<ReorderPoint>;
    private checkAndCreateAlerts;
    getActiveAlerts(): Promise<InventoryAlert[]>;
    resolveAlert(id: string, userId: string): Promise<InventoryAlert>;
    getInventoryAnalytics(period?: 'week' | 'month' | 'quarter' | 'year'): Promise<any>;
    generateInventoryReport(reportDto: InventoryReportDto): Promise<any>;
    private getStockStatus;
    getHealthStatus(): Promise<any>;
    getItems(options: {
        page: number;
        limit: number;
        category?: string;
        status?: string;
        search?: string;
        organizationId?: string;
    }): Promise<{
        items: InventoryItem[];
        total: number;
        pages: number;
    }>;
    getItemById(id: string, organizationId?: string): Promise<InventoryItem>;
    getStock(options: {
        itemId?: string;
        location?: string;
        status?: string;
        organizationId?: string;
    }): Promise<{
        transactions: StockTransaction[];
        total: number;
        pages: number;
    }>;
    adjustStock(adjustmentData: any, organizationId?: string, userId?: string): Promise<InventoryAdjustment>;
    transferStock(transferData: any, organizationId?: string, userId?: string): Promise<StockTransaction>;
    receiveStock(receiveData: any, organizationId?: string, userId?: string): Promise<StockTransaction>;
    issueStock(issueData: any, organizationId?: string, userId?: string): Promise<StockTransaction>;
    getCycleCounts(options: {
        page: number;
        limit: number;
        status?: string;
        location?: string;
        organizationId?: string;
    }): Promise<{
        cycleCounts: CycleCount[];
        total: number;
        pages: number;
    }>;
    updateCycleCountItem(countId: string, itemId: string, updateData: any, organizationId?: string): Promise<CycleCount>;
    approveCycleCount(id: string, organizationId?: string, userId?: string): Promise<CycleCount>;
    getInventoryMetrics(options: {
        period?: string;
        category?: string;
        location?: string;
        organizationId?: string;
    }): Promise<any>;
    getInventoryDashboard(organizationId?: string): Promise<any>;
    getLowStockAlerts(organizationId?: string): Promise<InventoryAlert[]>;
    getExpiringItems(daysAhead?: number, organizationId?: string): Promise<InventoryItem[]>;
    generateInventoryReportLegacy(reportType: string, filters?: any, organizationId?: string): Promise<any>;
}
//# sourceMappingURL=InventoryService.d.ts.map