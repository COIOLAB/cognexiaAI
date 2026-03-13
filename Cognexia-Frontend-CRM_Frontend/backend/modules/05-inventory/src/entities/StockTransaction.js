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
exports.StockTransaction = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../enums");
const InventoryItem_1 = require("./InventoryItem");
let StockTransaction = class StockTransaction {
    // Business Logic Methods
    calculateTotalCost() {
        if (this.unitCost) {
            this.totalCost = this.quantity * this.unitCost;
        }
    }
    // Helper Methods
    isInbound() {
        return this.type === enums_1.TransactionType.INBOUND;
    }
    isOutbound() {
        return this.type === enums_1.TransactionType.OUTBOUND;
    }
    getTransactionValue() {
        return this.totalCost || 0;
    }
    isAdjustment() {
        return this.reason === enums_1.TransactionReason.ADJUSTMENT;
    }
    isCycleCount() {
        return this.reason === enums_1.TransactionReason.CYCLE_COUNT;
    }
    isPurchaseRelated() {
        return this.reason === enums_1.TransactionReason.PURCHASE;
    }
    isSaleRelated() {
        return this.reason === enums_1.TransactionReason.SALE;
    }
    isProductionRelated() {
        return this.reason === enums_1.TransactionReason.PRODUCTION;
    }
    getImpactDescription() {
        const direction = this.isInbound() ? 'increased' : 'decreased';
        const reason = this.reason.toLowerCase().replace('_', ' ');
        return `Stock ${direction} by ${this.quantity} due to ${reason}`;
    }
    toJSON() {
        return {
            id: this.id,
            itemId: this.itemId,
            type: this.type,
            quantity: this.quantity,
            balanceAfter: this.balanceAfter,
            reason: this.reason,
            locationCode: this.locationCode,
            batchNumber: this.batchNumber,
            serialNumber: this.serialNumber,
            expiryDate: this.expiryDate,
            notes: this.notes,
            referenceId: this.referenceId,
            performedBy: this.performedBy,
            unitCost: this.unitCost,
            totalCost: this.totalCost,
            documentNumber: this.documentNumber,
            supplierReference: this.supplierReference,
            customerReference: this.customerReference,
            createdAt: this.createdAt,
            isInbound: this.isInbound(),
            isOutbound: this.isOutbound(),
            transactionValue: this.getTransactionValue(),
            impactDescription: this.getImpactDescription()
        };
    }
};
exports.StockTransaction = StockTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockTransaction.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.TransactionType
    }),
    __metadata("design:type", String)
], StockTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockTransaction.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], StockTransaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.TransactionReason
    }),
    __metadata("design:type", String)
], StockTransaction.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], StockTransaction.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], StockTransaction.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockTransaction.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockTransaction.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "supplierReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockTransaction.prototype, "customerReference", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.stockTransactions, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], StockTransaction.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockTransaction.prototype, "calculateTotalCost", null);
exports.StockTransaction = StockTransaction = __decorate([
    (0, typeorm_1.Entity)('stock_transactions'),
    (0, typeorm_1.Index)(['itemId']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['reason']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['performedBy'])
], StockTransaction);
//# sourceMappingURL=StockTransaction.js.map