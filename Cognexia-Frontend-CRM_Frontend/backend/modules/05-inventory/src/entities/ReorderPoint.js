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
exports.ReorderPoint = void 0;
const typeorm_1 = require("typeorm");
const InventoryItem_1 = require("./InventoryItem");
let ReorderPoint = class ReorderPoint {
    // Methods
    shouldReorder(currentStock) {
        return currentStock <= this.reorderLevel;
    }
    calculateOptimalOrderQuantity() {
        return this.reorderQuantity;
    }
    getEstimatedDeliveryDate() {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + this.leadTimeDays);
        return deliveryDate;
    }
    isActive() {
        return this.status === 'active';
    }
    getStockoutRisk(currentStock) {
        const ratio = currentStock / this.reorderLevel;
        if (ratio > 1.5)
            return 'low';
        if (ratio > 1.0)
            return 'medium';
        if (ratio > 0.5)
            return 'high';
        return 'critical';
    }
    getCostEstimate(unitCost) {
        return this.reorderQuantity * unitCost;
    }
};
exports.ReorderPoint = ReorderPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReorderPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], ReorderPoint.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], ReorderPoint.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'reorder_level' }),
    __metadata("design:type", Number)
], ReorderPoint.prototype, "reorderLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'reorder_quantity' }),
    __metadata("design:type", Number)
], ReorderPoint.prototype, "reorderQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'safety_stock', default: 0 }),
    __metadata("design:type", Number)
], ReorderPoint.prototype, "safetyStock", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { name: 'lead_time_days', default: 7 }),
    __metadata("design:type", Number)
], ReorderPoint.prototype, "leadTimeDays", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, name: 'max_cost', nullable: true }),
    __metadata("design:type", Number)
], ReorderPoint.prototype, "maxCost", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, default: 'active' }),
    __metadata("design:type", String)
], ReorderPoint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ReorderPoint.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100, name: 'supplier_id', nullable: true }),
    __metadata("design:type", String)
], ReorderPoint.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { name: 'auto_order', default: false }),
    __metadata("design:type", Boolean)
], ReorderPoint.prototype, "autoOrder", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { name: 'last_ordered_at', nullable: true }),
    __metadata("design:type", Date)
], ReorderPoint.prototype, "lastOrderedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReorderPoint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ReorderPoint.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.reorderPoints, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'item_id' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], ReorderPoint.prototype, "item", void 0);
exports.ReorderPoint = ReorderPoint = __decorate([
    (0, typeorm_1.Entity)('reorder_points'),
    (0, typeorm_1.Index)(['itemId', 'organizationId'])
], ReorderPoint);
//# sourceMappingURL=ReorderPoint.js.map