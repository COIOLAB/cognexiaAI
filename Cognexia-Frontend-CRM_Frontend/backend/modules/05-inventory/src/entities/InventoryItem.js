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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItem = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../enums");
const StockTransaction_1 = require("./StockTransaction");
const StockLocation_1 = require("./StockLocation");
const CycleCount_1 = require("./CycleCount");
const InventoryAdjustment_1 = require("./InventoryAdjustment");
const InventoryAlert_1 = require("./InventoryAlert");
const ReorderPoint_1 = require("./ReorderPoint");
let InventoryItem = class InventoryItem {
    // Business Logic Methods
    generateIdentifier() {
        if (!this.sku) {
            // Generate SKU if not provided
            const timestamp = Date.now().toString().slice(-6);
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            this.sku = `${this.category.substring(0, 3).toUpperCase()}${timestamp}${randomNum}`;
        }
        // Calculate available stock
        this.availableStock = this.currentStock - this.reservedStock;
        // Calculate total value
        this.totalValue = this.currentStock * this.averageCost;
    }
    // Helper Methods
    isLowStock() {
        if (!this.reorderLevel)
            return false;
        return this.currentStock <= this.reorderLevel;
    }
    isOutOfStock() {
        return this.currentStock <= 0;
    }
    isOverStock() {
        if (!this.maxLevel)
            return false;
        return this.currentStock >= this.maxLevel;
    }
    canFulfillQuantity(quantity) {
        return this.availableStock >= quantity;
    }
    getTurnoverRatio(annualUsage) {
        if (this.averageCost <= 0)
            return 0;
        return annualUsage / this.averageCost;
    }
    getDaysOfSupply(dailyUsage) {
        if (dailyUsage <= 0)
            return Infinity;
        return this.availableStock / dailyUsage;
    }
    getStockStatus() {
        if (this.isOutOfStock())
            return 'OUT_OF_STOCK';
        if (this.isOverStock())
            return 'OVERSTOCK';
        if (this.isLowStock())
            return 'LOW';
        return 'HEALTHY';
    }
    calculateEOQ(annualDemand, orderCost, holdingCost) {
        if (holdingCost <= 0)
            return 0;
        return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
    }
    updateAverageCost(newCost, quantity) {
        if (this.currentStock <= 0) {
            this.averageCost = newCost;
        }
        else {
            const totalCost = (this.currentStock * this.averageCost) + (quantity * newCost);
            const totalQuantity = this.currentStock + quantity;
            this.averageCost = totalCost / totalQuantity;
        }
    }
    reserve(quantity) {
        if (quantity > this.availableStock) {
            return false;
        }
        this.reservedStock += quantity;
        this.availableStock = this.currentStock - this.reservedStock;
        return true;
    }
    unreserve(quantity) {
        if (quantity > this.reservedStock) {
            return false;
        }
        this.reservedStock -= quantity;
        this.availableStock = this.currentStock - this.reservedStock;
        return true;
    }
    toJSON() {
        return {
            id: this.id,
            sku: this.sku,
            name: this.name,
            description: this.description,
            category: this.category,
            status: this.status,
            unitOfMeasure: this.unitOfMeasure,
            currentStock: this.currentStock,
            availableStock: this.availableStock,
            reservedStock: this.reservedStock,
            unitCost: this.unitCost,
            averageCost: this.averageCost,
            totalValue: this.totalValue,
            reorderLevel: this.reorderLevel,
            maxLevel: this.maxLevel,
            minLevel: this.minLevel,
            location: this.location,
            supplier: this.supplier,
            leadTime: this.leadTime,
            stockStatus: this.getStockStatus(),
            isLowStock: this.isLowStock(),
            isOutOfStock: this.isOutOfStock(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], InventoryItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.ItemCategory,
        default: enums_1.ItemCategory.RAW_MATERIAL
    }),
    __metadata("design:type", String)
], InventoryItem.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.ItemStatus,
        default: enums_1.ItemStatus.ACTIVE
    }),
    __metadata("design:type", String)
], InventoryItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.UnitOfMeasure,
        default: enums_1.UnitOfMeasure.PIECES
    }),
    __metadata("design:type", String)
], InventoryItem.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reservedStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "availableStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "averageCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "maxLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "minLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "leadTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "lastTransactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "lastCycleCountDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockTransaction_1.StockTransaction, transaction => transaction.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "stockTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockLocation_1.StockLocation, location => location.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "stockLocations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CycleCount_1.CycleCount, cycleCount => cycleCount.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "cycleCountRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InventoryAdjustment_1.InventoryAdjustment, adjustment => adjustment.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "adjustments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InventoryAlert_1.InventoryAlert, alert => alert.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "alerts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ReorderPoint_1.ReorderPoint, reorderPoint => reorderPoint.item, {
        cascade: true,
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Array)
], InventoryItem.prototype, "reorderPoints", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryItem.prototype, "generateIdentifier", null);
exports.InventoryItem = InventoryItem = __decorate([
    (0, typeorm_1.Entity)('inventory_items'),
    (0, typeorm_1.Index)(['sku'], { unique: true }),
    (0, typeorm_1.Index)(['category']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['currentStock'])
], InventoryItem);
//# sourceMappingURL=InventoryItem.js.map