"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const enums_1 = require("../enums");
let InventoryService = InventoryService_1 = class InventoryService {
    constructor(inventoryItemRepository, stockTransactionRepository, stockLocationRepository, cycleCountRepository, inventoryAdjustmentRepository, inventoryAlertRepository, reorderPointRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.stockLocationRepository = stockLocationRepository;
        this.cycleCountRepository = cycleCountRepository;
        this.inventoryAdjustmentRepository = inventoryAdjustmentRepository;
        this.inventoryAlertRepository = inventoryAlertRepository;
        this.reorderPointRepository = reorderPointRepository;
        this.logger = new common_1.Logger(InventoryService_1.name);
    }
    // ===================== INVENTORY ITEMS =====================
    async createItem(createDto, userId) {
        try {
            // Check if item with same SKU exists
            const existingItem = await this.inventoryItemRepository.findOne({
                where: { sku: createDto.sku }
            });
            if (existingItem) {
                throw new common_1.ConflictException(`Item with SKU ${createDto.sku} already exists`);
            }
            const item = this.inventoryItemRepository.create({
                ...createDto,
                createdBy: userId,
                updatedBy: userId
            });
            const savedItem = await this.inventoryItemRepository.save(item);
            // Create initial stock location if specified
            if (createDto.initialLocation) {
                await this.createStockLocation({
                    itemId: savedItem.id,
                    locationCode: createDto.initialLocation,
                    quantity: createDto.currentStock || 0,
                    isDefault: true
                });
            }
            // Create reorder point if specified
            if (createDto.reorderLevel) {
                await this.createReorderPoint({
                    itemId: savedItem.id,
                    reorderLevel: createDto.reorderLevel,
                    maxLevel: createDto.maxLevel || createDto.reorderLevel * 3,
                    isActive: true
                });
            }
            this.logger.log(`Created inventory item: ${savedItem.sku}`);
            return savedItem;
        }
        catch (error) {
            this.logger.error(`Failed to create inventory item: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAllItems(page = 1, limit = 10, filters) {
        try {
            const queryBuilder = this.inventoryItemRepository.createQueryBuilder('item')
                .leftJoinAndSelect('item.stockLocations', 'locations')
                .leftJoinAndSelect('item.reorderPoints', 'reorderPoints')
                .leftJoinAndSelect('item.alerts', 'alerts');
            // Apply filters
            if (filters?.category) {
                queryBuilder.andWhere('item.category = :category', { category: filters.category });
            }
            if (filters?.status) {
                queryBuilder.andWhere('item.status = :status', { status: filters.status });
            }
            if (filters?.search) {
                queryBuilder.andWhere('(item.name ILIKE :search OR item.sku ILIKE :search OR item.description ILIKE :search)', { search: `%${filters.search}%` });
            }
            if (filters?.lowStock) {
                queryBuilder.andWhere('item.currentStock <= item.reorderLevel');
            }
            if (filters?.location) {
                queryBuilder.andWhere('locations.locationCode = :location', { location: filters.location });
            }
            // Apply pagination
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('item.updatedAt', 'DESC');
            const [items, total] = await queryBuilder.getManyAndCount();
            const pages = Math.ceil(total / limit);
            return { items, total, pages };
        }
        catch (error) {
            this.logger.error(`Failed to fetch inventory items: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findItemById(id) {
        try {
            const item = await this.inventoryItemRepository.findOne({
                where: { id },
                relations: [
                    'stockLocations',
                    'stockTransactions',
                    'cycleCountRecords',
                    'adjustments',
                    'alerts',
                    'reorderPoints'
                ]
            });
            if (!item) {
                throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
            }
            return item;
        }
        catch (error) {
            this.logger.error(`Failed to fetch inventory item ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateItem(id, updateDto, userId) {
        try {
            const item = await this.findItemById(id);
            // Check if SKU is being changed and if it conflicts
            if (updateDto.sku && updateDto.sku !== item.sku) {
                const existingItem = await this.inventoryItemRepository.findOne({
                    where: { sku: updateDto.sku }
                });
                if (existingItem) {
                    throw new common_1.ConflictException(`Item with SKU ${updateDto.sku} already exists`);
                }
            }
            Object.assign(item, {
                ...updateDto,
                updatedBy: userId,
                updatedAt: new Date()
            });
            const updatedItem = await this.inventoryItemRepository.save(item);
            this.logger.log(`Updated inventory item: ${updatedItem.sku}`);
            return updatedItem;
        }
        catch (error) {
            this.logger.error(`Failed to update inventory item ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteItem(id) {
        try {
            const item = await this.findItemById(id);
            if (item.currentStock > 0) {
                throw new common_1.BadRequestException('Cannot delete item with current stock. Adjust stock to zero first.');
            }
            await this.inventoryItemRepository.remove(item);
            this.logger.log(`Deleted inventory item: ${item.sku}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete inventory item ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    // ===================== STOCK TRANSACTIONS =====================
    async createStockTransaction(transactionDto, userId, queryRunner) {
        const manager = queryRunner ? queryRunner.manager : this.stockTransactionRepository.manager;
        try {
            const item = await manager.findOne(entities_1.InventoryItem, {
                where: { id: transactionDto.itemId }
            });
            if (!item) {
                throw new common_1.NotFoundException(`Inventory item with ID ${transactionDto.itemId} not found`);
            }
            // Validate transaction
            if (transactionDto.type === enums_1.TransactionType.OUTBOUND &&
                transactionDto.quantity > item.currentStock) {
                throw new common_1.BadRequestException('Insufficient stock for outbound transaction');
            }
            // Create transaction
            const transaction = manager.create(entities_1.StockTransaction, {
                ...transactionDto,
                performedBy: userId,
                balanceAfter: item.currentStock +
                    (transactionDto.type === enums_1.TransactionType.INBOUND ? transactionDto.quantity : -transactionDto.quantity)
            });
            const savedTransaction = await manager.save(entities_1.StockTransaction, transaction);
            // Update item stock
            const stockChange = transactionDto.type === enums_1.TransactionType.INBOUND ?
                transactionDto.quantity : -transactionDto.quantity;
            item.currentStock += stockChange;
            item.lastTransactionDate = new Date();
            item.updatedBy = userId;
            await manager.save(entities_1.InventoryItem, item);
            // Update stock location if specified
            if (transactionDto.locationCode) {
                await this.updateStockLocation(transactionDto.itemId, transactionDto.locationCode, stockChange, manager);
            }
            // Check for alerts
            await this.checkAndCreateAlerts(item.id, manager);
            this.logger.log(`Created stock transaction for item ${item.sku}: ${transactionDto.type} ${transactionDto.quantity}`);
            return savedTransaction;
        }
        catch (error) {
            this.logger.error(`Failed to create stock transaction: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStockTransactions(itemId, page = 1, limit = 10, filters) {
        try {
            const queryBuilder = this.stockTransactionRepository.createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.item', 'item');
            if (itemId) {
                queryBuilder.andWhere('transaction.itemId = :itemId', { itemId });
            }
            // Apply filters
            if (filters?.type) {
                queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
            }
            if (filters?.reason) {
                queryBuilder.andWhere('transaction.reason = :reason', { reason: filters.reason });
            }
            if (filters?.dateFrom && filters?.dateTo) {
                queryBuilder.andWhere('transaction.createdAt BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                });
            }
            if (filters?.location) {
                queryBuilder.andWhere('transaction.locationCode = :location', { location: filters.location });
            }
            // Apply pagination and ordering
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('transaction.createdAt', 'DESC');
            const [transactions, total] = await queryBuilder.getManyAndCount();
            const pages = Math.ceil(total / limit);
            return { transactions, total, pages };
        }
        catch (error) {
            this.logger.error(`Failed to fetch stock transactions: ${error.message}`, error.stack);
            throw error;
        }
    }
    // ===================== STOCK LOCATIONS =====================
    async createStockLocation(locationDto) {
        try {
            const location = this.stockLocationRepository.create(locationDto);
            const savedLocation = await this.stockLocationRepository.save(location);
            this.logger.log(`Created stock location: ${locationDto.locationCode} for item ${locationDto.itemId}`);
            return savedLocation;
        }
        catch (error) {
            this.logger.error(`Failed to create stock location: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateStockLocation(itemId, locationCode, quantityChange, manager) {
        const repository = manager ? manager.getRepository(entities_1.StockLocation) : this.stockLocationRepository;
        let location = await repository.findOne({
            where: { itemId, locationCode }
        });
        if (!location) {
            location = repository.create({
                itemId,
                locationCode,
                quantity: Math.max(0, quantityChange),
                isDefault: false
            });
        }
        else {
            location.quantity = Math.max(0, location.quantity + quantityChange);
            location.lastUpdated = new Date();
        }
        await repository.save(location);
    }
    // ===================== CYCLE COUNTS =====================
    async createCycleCount(cycleCountDto, userId) {
        try {
            const item = await this.findItemById(cycleCountDto.itemId);
            const cycleCount = this.cycleCountRepository.create({
                ...cycleCountDto,
                expectedQuantity: item.currentStock,
                createdBy: userId
            });
            const savedCycleCount = await this.cycleCountRepository.save(cycleCount);
            this.logger.log(`Created cycle count for item ${item.sku}`);
            return savedCycleCount;
        }
        catch (error) {
            this.logger.error(`Failed to create cycle count: ${error.message}`, error.stack);
            throw error;
        }
    }
    async completeCycleCount(id, actualQuantity, notes, userId) {
        try {
            const cycleCount = await this.cycleCountRepository.findOne({
                where: { id },
                relations: ['item']
            });
            if (!cycleCount) {
                throw new common_1.NotFoundException(`Cycle count with ID ${id} not found`);
            }
            if (cycleCount.status !== enums_1.CycleCountStatus.PENDING) {
                throw new common_1.BadRequestException('Cycle count is not in pending status');
            }
            cycleCount.actualQuantity = actualQuantity;
            cycleCount.variance = actualQuantity - cycleCount.expectedQuantity;
            cycleCount.status = enums_1.CycleCountStatus.COMPLETED;
            cycleCount.completedAt = new Date();
            cycleCount.completedBy = userId;
            cycleCount.notes = notes;
            const updatedCycleCount = await this.cycleCountRepository.save(cycleCount);
            // Create adjustment if there's variance
            if (cycleCount.variance !== 0) {
                await this.createInventoryAdjustment({
                    itemId: cycleCount.itemId,
                    adjustmentQuantity: cycleCount.variance,
                    reason: enums_1.AdjustmentReason.CYCLE_COUNT,
                    notes: `Cycle count adjustment: ${notes}`,
                    referenceId: cycleCount.id
                }, userId);
            }
            this.logger.log(`Completed cycle count for item ${cycleCount.item.sku} with variance: ${cycleCount.variance}`);
            return updatedCycleCount;
        }
        catch (error) {
            this.logger.error(`Failed to complete cycle count ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    // ===================== INVENTORY ADJUSTMENTS =====================
    async createInventoryAdjustment(adjustmentDto, userId) {
        const queryRunner = this.inventoryAdjustmentRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const item = await queryRunner.manager.findOne(entities_1.InventoryItem, {
                where: { id: adjustmentDto.itemId }
            });
            if (!item) {
                throw new common_1.NotFoundException(`Inventory item with ID ${adjustmentDto.itemId} not found`);
            }
            // Create adjustment record
            const adjustment = queryRunner.manager.create(entities_1.InventoryAdjustment, {
                ...adjustmentDto,
                quantityBefore: item.currentStock,
                quantityAfter: item.currentStock + adjustmentDto.adjustmentQuantity,
                performedBy: userId
            });
            const savedAdjustment = await queryRunner.manager.save(entities_1.InventoryAdjustment, adjustment);
            // Create corresponding stock transaction
            await this.createStockTransaction({
                itemId: adjustmentDto.itemId,
                type: adjustmentDto.adjustmentQuantity > 0 ? enums_1.TransactionType.INBOUND : enums_1.TransactionType.OUTBOUND,
                quantity: Math.abs(adjustmentDto.adjustmentQuantity),
                reason: enums_1.TransactionReason.ADJUSTMENT,
                notes: adjustmentDto.notes,
                referenceId: savedAdjustment.id
            }, userId, queryRunner);
            await queryRunner.commitTransaction();
            this.logger.log(`Created inventory adjustment for item ${item.sku}: ${adjustmentDto.adjustmentQuantity}`);
            return savedAdjustment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create inventory adjustment: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===================== REORDER POINTS =====================
    async createReorderPoint(reorderPointDto) {
        try {
            const reorderPoint = this.reorderPointRepository.create(reorderPointDto);
            const savedReorderPoint = await this.reorderPointRepository.save(reorderPoint);
            this.logger.log(`Created reorder point for item ${reorderPointDto.itemId}`);
            return savedReorderPoint;
        }
        catch (error) {
            this.logger.error(`Failed to create reorder point: ${error.message}`, error.stack);
            throw error;
        }
    }
    // ===================== ALERTS & NOTIFICATIONS =====================
    async checkAndCreateAlerts(itemId, manager) {
        const itemRepository = manager ? manager.getRepository(entities_1.InventoryItem) : this.inventoryItemRepository;
        const alertRepository = manager ? manager.getRepository(entities_1.InventoryAlert) : this.inventoryAlertRepository;
        const reorderRepository = manager ? manager.getRepository(entities_1.ReorderPoint) : this.reorderPointRepository;
        const item = await itemRepository.findOne({ where: { id: itemId } });
        const reorderPoint = await reorderRepository.findOne({
            where: { itemId, isActive: true }
        });
        if (!item || !reorderPoint)
            return;
        // Check for low stock alert
        if (item.currentStock <= reorderPoint.reorderLevel) {
            const existingAlert = await alertRepository.findOne({
                where: {
                    itemId,
                    type: enums_1.AlertType.LOW_STOCK,
                    isResolved: false
                }
            });
            if (!existingAlert) {
                const alert = alertRepository.create({
                    itemId,
                    type: enums_1.AlertType.LOW_STOCK,
                    severity: item.currentStock === 0 ? enums_1.AlertSeverity.CRITICAL : enums_1.AlertSeverity.HIGH,
                    message: `Item ${item.name} is running low. Current stock: ${item.currentStock}, Reorder level: ${reorderPoint.reorderLevel}`,
                    threshold: reorderPoint.reorderLevel,
                    currentValue: item.currentStock
                });
                await alertRepository.save(alert);
            }
        }
        // Check for overstock alert
        if (reorderPoint.maxLevel && item.currentStock >= reorderPoint.maxLevel) {
            const existingAlert = await alertRepository.findOne({
                where: {
                    itemId,
                    type: enums_1.AlertType.OVERSTOCK,
                    isResolved: false
                }
            });
            if (!existingAlert) {
                const alert = alertRepository.create({
                    itemId,
                    type: enums_1.AlertType.OVERSTOCK,
                    severity: enums_1.AlertSeverity.MEDIUM,
                    message: `Item ${item.name} is overstocked. Current stock: ${item.currentStock}, Max level: ${reorderPoint.maxLevel}`,
                    threshold: reorderPoint.maxLevel,
                    currentValue: item.currentStock
                });
                await alertRepository.save(alert);
            }
        }
    }
    async getActiveAlerts() {
        return this.inventoryAlertRepository.find({
            where: { isResolved: false },
            relations: ['item'],
            order: { createdAt: 'DESC' }
        });
    }
    async resolveAlert(id, userId) {
        const alert = await this.inventoryAlertRepository.findOne({ where: { id } });
        if (!alert) {
            throw new common_1.NotFoundException(`Alert with ID ${id} not found`);
        }
        alert.isResolved = true;
        alert.resolvedAt = new Date();
        alert.resolvedBy = userId;
        return this.inventoryAlertRepository.save(alert);
    }
    // ===================== ANALYTICS & REPORTS =====================
    async getInventoryAnalytics(period = 'month') {
        try {
            const endDate = new Date();
            const startDate = new Date();
            switch (period) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }
            // Total inventory value
            const totalValueResult = await this.inventoryItemRepository
                .createQueryBuilder('item')
                .select('SUM(item.currentStock * item.unitCost)', 'totalValue')
                .getRawOne();
            // Transaction volume
            const transactionVolumeResult = await this.stockTransactionRepository
                .createQueryBuilder('transaction')
                .select('SUM(transaction.quantity)', 'totalVolume')
                .where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .getRawOne();
            // Top moving items
            const topMovingItems = await this.stockTransactionRepository
                .createQueryBuilder('transaction')
                .leftJoin('transaction.item', 'item')
                .select('item.name', 'itemName')
                .addSelect('item.sku', 'itemSku')
                .addSelect('SUM(transaction.quantity)', 'totalQuantity')
                .where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy('item.id, item.name, item.sku')
                .orderBy('totalQuantity', 'DESC')
                .limit(10)
                .getRawMany();
            // Low stock items count
            const lowStockCount = await this.inventoryItemRepository
                .createQueryBuilder('item')
                .leftJoin('item.reorderPoints', 'reorderPoint', 'reorderPoint.isActive = true')
                .where('item.currentStock <= reorderPoint.reorderLevel')
                .getCount();
            // Category distribution
            const categoryDistribution = await this.inventoryItemRepository
                .createQueryBuilder('item')
                .select('item.category', 'category')
                .addSelect('COUNT(*)', 'itemCount')
                .addSelect('SUM(item.currentStock * item.unitCost)', 'categoryValue')
                .groupBy('item.category')
                .getRawMany();
            return {
                totalInventoryValue: parseFloat(totalValueResult?.totalValue) || 0,
                transactionVolume: parseInt(transactionVolumeResult?.totalVolume) || 0,
                lowStockItemsCount: lowStockCount,
                topMovingItems,
                categoryDistribution,
                period,
                dateRange: { startDate, endDate }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get inventory analytics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generateInventoryReport(reportDto) {
        try {
            const queryBuilder = this.inventoryItemRepository.createQueryBuilder('item')
                .leftJoinAndSelect('item.stockLocations', 'locations')
                .leftJoinAndSelect('item.reorderPoints', 'reorderPoints');
            // Apply filters
            if (reportDto.category) {
                queryBuilder.andWhere('item.category = :category', { category: reportDto.category });
            }
            if (reportDto.location) {
                queryBuilder.andWhere('locations.locationCode = :location', { location: reportDto.location });
            }
            if (reportDto.lowStockOnly) {
                queryBuilder.andWhere('item.currentStock <= reorderPoints.reorderLevel');
            }
            if (reportDto.zeroStockOnly) {
                queryBuilder.andWhere('item.currentStock = 0');
            }
            const items = await queryBuilder.getMany();
            const reportData = items.map(item => ({
                sku: item.sku,
                name: item.name,
                category: item.category,
                currentStock: item.currentStock,
                unitCost: item.unitCost,
                totalValue: item.currentStock * item.unitCost,
                reorderLevel: item.reorderPoints?.[0]?.reorderLevel || 0,
                stockStatus: this.getStockStatus(item),
                locations: item.stockLocations?.map(loc => ({
                    code: loc.locationCode,
                    quantity: loc.quantity
                })) || []
            }));
            const summary = {
                totalItems: reportData.length,
                totalValue: reportData.reduce((sum, item) => sum + item.totalValue, 0),
                lowStockItems: reportData.filter(item => item.stockStatus === 'LOW').length,
                outOfStockItems: reportData.filter(item => item.stockStatus === 'OUT_OF_STOCK').length,
                generatedAt: new Date(),
                filters: reportDto
            };
            return { summary, items: reportData };
        }
        catch (error) {
            this.logger.error(`Failed to generate inventory report: ${error.message}`, error.stack);
            throw error;
        }
    }
    getStockStatus(item) {
        if (item.currentStock === 0)
            return 'OUT_OF_STOCK';
        if (item.reorderPoints?.[0] && item.currentStock <= item.reorderPoints[0].reorderLevel)
            return 'LOW';
        return 'NORMAL';
    }
    // ===================== HEALTH CHECKS =====================
    async getHealthStatus() {
        try {
            const totalItems = await this.inventoryItemRepository.count();
            const lowStockItems = await this.inventoryItemRepository
                .createQueryBuilder('item')
                .leftJoin('item.reorderPoints', 'reorderPoint', 'reorderPoint.isActive = true')
                .where('item.currentStock <= reorderPoint.reorderLevel')
                .getCount();
            const activeAlerts = await this.inventoryAlertRepository.count({
                where: { isResolved: false }
            });
            const recentTransactions = await this.stockTransactionRepository.count({
                where: {
                    createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
                }
            });
            return {
                status: 'healthy',
                metrics: {
                    totalItems,
                    lowStockItems,
                    activeAlerts,
                    recentTransactions,
                    lowStockPercentage: totalItems > 0 ? Math.round((lowStockItems / totalItems) * 100) : 0
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`, error.stack);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    // ===================== ADDITIONAL METHODS FOR CONTROLLER SUPPORT =====================
    // Legacy method aliases for backward compatibility
    async getItems(options) {
        return this.findAllItems(options.page, options.limit, {
            category: options.category,
            status: options.status,
            search: options.search,
            lowStock: false,
            location: undefined
        });
    }
    async getItemById(id, organizationId) {
        return this.findItemById(id);
    }
    async getStock(options) {
        return this.getStockTransactions(options.itemId, 1, 50, {
            location: options.location
        });
    }
    async adjustStock(adjustmentData, organizationId, userId) {
        return this.createInventoryAdjustment(adjustmentData, userId || 'system');
    }
    async transferStock(transferData, organizationId, userId) {
        return this.createStockTransaction(transferData, userId || 'system');
    }
    async receiveStock(receiveData, organizationId, userId) {
        return this.createStockTransaction({
            ...receiveData,
            type: enums_1.TransactionType.INBOUND,
            reason: enums_1.TransactionReason.RECEIPT
        }, userId || 'system');
    }
    async issueStock(issueData, organizationId, userId) {
        return this.createStockTransaction({
            ...issueData,
            type: enums_1.TransactionType.OUTBOUND,
            reason: enums_1.TransactionReason.ISSUE
        }, userId || 'system');
    }
    async getCycleCounts(options) {
        try {
            const queryBuilder = this.cycleCountRepository.createQueryBuilder('cycleCount')
                .leftJoinAndSelect('cycleCount.item', 'item');
            if (options.status) {
                queryBuilder.andWhere('cycleCount.status = :status', { status: options.status });
            }
            if (options.location) {
                queryBuilder.andWhere('cycleCount.locationCode = :location', { location: options.location });
            }
            queryBuilder
                .skip((options.page - 1) * options.limit)
                .take(options.limit)
                .orderBy('cycleCount.createdAt', 'DESC');
            const [cycleCounts, total] = await queryBuilder.getManyAndCount();
            const pages = Math.ceil(total / options.limit);
            return { cycleCounts, total, pages };
        }
        catch (error) {
            this.logger.error(`Failed to fetch cycle counts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateCycleCountItem(countId, itemId, updateData, organizationId) {
        try {
            const cycleCount = await this.cycleCountRepository.findOne({
                where: { id: countId, itemId: itemId }
            });
            if (!cycleCount) {
                throw new common_1.NotFoundException(`Cycle count item not found`);
            }
            Object.assign(cycleCount, updateData);
            return await this.cycleCountRepository.save(cycleCount);
        }
        catch (error) {
            this.logger.error(`Failed to update cycle count item: ${error.message}`, error.stack);
            throw error;
        }
    }
    async approveCycleCount(id, organizationId, userId) {
        try {
            const cycleCount = await this.cycleCountRepository.findOne({ where: { id } });
            if (!cycleCount) {
                throw new common_1.NotFoundException(`Cycle count with ID ${id} not found`);
            }
            cycleCount.status = enums_1.CycleCountStatus.APPROVED;
            cycleCount.completedBy = userId || 'system';
            cycleCount.completedAt = new Date();
            return await this.cycleCountRepository.save(cycleCount);
        }
        catch (error) {
            this.logger.error(`Failed to approve cycle count: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getInventoryMetrics(options) {
        return this.getInventoryAnalytics(options.period || 'month');
    }
    async getInventoryDashboard(organizationId) {
        try {
            const analytics = await this.getInventoryAnalytics('month');
            const alerts = await this.getActiveAlerts();
            const health = await this.getHealthStatus();
            return {
                summary: {
                    totalItems: analytics.categoryDistribution?.reduce((sum, cat) => sum + parseInt(cat.itemCount), 0) || 0,
                    totalValue: analytics.totalInventoryValue,
                    lowStockItems: analytics.lowStockItemsCount,
                    activeAlerts: alerts.length
                },
                analytics,
                alerts: alerts.slice(0, 10), // Top 10 alerts
                health: health.status,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Failed to get inventory dashboard: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getLowStockAlerts(organizationId) {
        return this.inventoryAlertRepository.find({
            where: {
                type: enums_1.AlertType.LOW_STOCK,
                isResolved: false
            },
            relations: ['item'],
            order: { createdAt: 'DESC' }
        });
    }
    async getExpiringItems(daysAhead = 30, organizationId) {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);
            // This is a simplified version - in reality you'd need to track expiry dates
            // through stock transactions or item batches
            const items = await this.inventoryItemRepository
                .createQueryBuilder('item')
                .leftJoinAndSelect('item.stockTransactions', 'transaction')
                .where('transaction.expiryDate IS NOT NULL')
                .andWhere('transaction.expiryDate <= :futureDate', { futureDate })
                .andWhere('transaction.expiryDate > :now', { now: new Date() })
                .getMany();
            return items;
        }
        catch (error) {
            this.logger.error(`Failed to get expiring items: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Legacy method for backward compatibility with old signature
    async generateInventoryReportLegacy(reportType, filters, organizationId) {
        const reportDto = {
            category: filters?.category,
            location: filters?.location,
            lowStockOnly: filters?.lowStockOnly,
            zeroStockOnly: filters?.zeroStockOnly,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo
        };
        return this.generateInventoryReport(reportDto);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.InventoryItem)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.StockTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.StockLocation)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.CycleCount)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.InventoryAdjustment)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.InventoryAlert)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.ReorderPoint)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=InventoryService.js.map