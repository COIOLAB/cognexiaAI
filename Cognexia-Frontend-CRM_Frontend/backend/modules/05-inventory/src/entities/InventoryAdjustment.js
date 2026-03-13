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
exports.InventoryAdjustment = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../enums");
const InventoryItem_1 = require("./InventoryItem");
let InventoryAdjustment = class InventoryAdjustment {
    // Business Logic Methods
    calculateValues() {
        // Calculate adjustment value
        if (this.unitCost) {
            this.adjustmentValue = this.adjustmentQuantity * this.unitCost;
        }
        // Calculate variance percentage
        if (this.quantityBefore !== 0) {
            this.variancePercentage = (this.adjustmentQuantity / this.quantityBefore) * 100;
        }
        else {
            this.variancePercentage = this.adjustmentQuantity > 0 ? 100 : 0;
        }
        // Determine if approval is required based on adjustment size or reason
        this.requiresApproval = this.shouldRequireApproval();
    }
    // Helper Methods
    isPositiveAdjustment() {
        return this.adjustmentQuantity > 0;
    }
    isNegativeAdjustment() {
        return this.adjustmentQuantity < 0;
    }
    isZeroAdjustment() {
        return this.adjustmentQuantity === 0;
    }
    getAdjustmentType() {
        if (this.adjustmentQuantity > 0)
            return 'INCREASE';
        if (this.adjustmentQuantity < 0)
            return 'DECREASE';
        return 'NO_CHANGE';
    }
    getAbsoluteAdjustment() {
        return Math.abs(this.adjustmentQuantity);
    }
    getAdjustmentValue() {
        return this.adjustmentValue || 0;
    }
    getAbsoluteAdjustmentValue() {
        return Math.abs(this.getAdjustmentValue());
    }
    isSignificantAdjustment(threshold = 10) {
        return Math.abs(this.variancePercentage || 0) > threshold;
    }
    isLargeValueAdjustment(threshold = 1000) {
        return this.getAbsoluteAdjustmentValue() > threshold;
    }
    shouldRequireApproval() {
        // Require approval for large adjustments
        if (this.isLargeValueAdjustment(5000))
            return true;
        // Require approval for significant percentage adjustments
        if (this.isSignificantAdjustment(25))
            return true;
        // Require approval for certain reasons
        const approvalRequiredReasons = [
            enums_1.AdjustmentReason.THEFT,
            enums_1.AdjustmentReason.DAMAGE,
            enums_1.AdjustmentReason.WRITE_OFF
        ];
        if (approvalRequiredReasons.includes(this.reason))
            return true;
        return false;
    }
    canBeApproved() {
        return this.requiresApproval && !this.isApproved && !this.approvedBy;
    }
    isPendingApproval() {
        return this.requiresApproval && !this.isApproved;
    }
    approve(approvedBy) {
        if (!this.canBeApproved()) {
            throw new Error('Adjustment cannot be approved');
        }
        this.approvedBy = approvedBy;
        this.approvedAt = new Date();
        this.isApproved = true;
    }
    getReasonDescription() {
        const reasonMap = {
            [enums_1.AdjustmentReason.CYCLE_COUNT]: 'Cycle Count Adjustment',
            [enums_1.AdjustmentReason.PHYSICAL_COUNT]: 'Physical Count Adjustment',
            [enums_1.AdjustmentReason.DAMAGE]: 'Damaged Inventory',
            [enums_1.AdjustmentReason.THEFT]: 'Theft/Loss',
            [enums_1.AdjustmentReason.EXPIRY]: 'Expired Inventory',
            [enums_1.AdjustmentReason.SYSTEM_ERROR]: 'System Error Correction',
            [enums_1.AdjustmentReason.RETURN]: 'Return Adjustment',
            [enums_1.AdjustmentReason.WRITE_OFF]: 'Inventory Write-off',
            [enums_1.AdjustmentReason.OTHER]: 'Other'
        };
        return reasonMap[this.reason] || this.reason;
    }
    getAdjustmentSummary() {
        const type = this.getAdjustmentType();
        const amount = this.getAbsoluteAdjustment();
        const reason = this.getReasonDescription();
        return `${type} of ${amount} units due to ${reason}`;
    }
    getPriority() {
        if (this.reason === enums_1.AdjustmentReason.THEFT)
            return 'CRITICAL';
        if (this.isLargeValueAdjustment(10000))
            return 'HIGH';
        if (this.isSignificantAdjustment(20))
            return 'MEDIUM';
        return 'LOW';
    }
    requiresInvestigation() {
        return this.reason === enums_1.AdjustmentReason.THEFT ||
            this.reason === enums_1.AdjustmentReason.SYSTEM_ERROR ||
            this.isSignificantAdjustment(30);
    }
    getFinancialImpact() {
        const value = this.getAdjustmentValue();
        if (value > 0)
            return 'POSITIVE';
        if (value < 0)
            return 'NEGATIVE';
        return 'NEUTRAL';
    }
    toJSON() {
        return {
            id: this.id,
            itemId: this.itemId,
            adjustmentQuantity: this.adjustmentQuantity,
            quantityBefore: this.quantityBefore,
            quantityAfter: this.quantityAfter,
            reason: this.reason,
            reasonDescription: this.getReasonDescription(),
            notes: this.notes,
            referenceId: this.referenceId,
            documentNumber: this.documentNumber,
            performedBy: this.performedBy,
            approvedBy: this.approvedBy,
            approvedAt: this.approvedAt,
            locationCode: this.locationCode,
            batchNumber: this.batchNumber,
            serialNumber: this.serialNumber,
            unitCost: this.unitCost,
            adjustmentValue: this.adjustmentValue,
            adjustmentMethod: this.adjustmentMethod,
            sourceTransaction: this.sourceTransaction,
            adjustmentDetails: this.adjustmentDetails,
            requiresApproval: this.requiresApproval,
            isApproved: this.isApproved,
            isSystemGenerated: this.isSystemGenerated,
            costCenter: this.costCenter,
            department: this.department,
            project: this.project,
            variancePercentage: this.variancePercentage,
            adjustmentType: this.getAdjustmentType(),
            absoluteAdjustment: this.getAbsoluteAdjustment(),
            absoluteAdjustmentValue: this.getAbsoluteAdjustmentValue(),
            isSignificant: this.isSignificantAdjustment(),
            isLargeValue: this.isLargeValueAdjustment(),
            priority: this.getPriority(),
            requiresInvestigation: this.requiresInvestigation(),
            financialImpact: this.getFinancialImpact(),
            adjustmentSummary: this.getAdjustmentSummary(),
            canBeApproved: this.canBeApproved(),
            isPendingApproval: this.isPendingApproval(),
            createdAt: this.createdAt
        };
    }
};
exports.InventoryAdjustment = InventoryAdjustment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "adjustmentQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "quantityBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "quantityAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AdjustmentReason
    }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAdjustment.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "adjustmentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "adjustmentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "sourceTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InventoryAdjustment.prototype, "adjustmentDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAdjustment.prototype, "requiresApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAdjustment.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAdjustment.prototype, "isSystemGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAdjustment.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], InventoryAdjustment.prototype, "variancePercentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryAdjustment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.adjustments, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], InventoryAdjustment.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryAdjustment.prototype, "calculateValues", null);
exports.InventoryAdjustment = InventoryAdjustment = __decorate([
    (0, typeorm_1.Entity)('inventory_adjustments'),
    (0, typeorm_1.Index)(['itemId']),
    (0, typeorm_1.Index)(['reason']),
    (0, typeorm_1.Index)(['performedBy']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['adjustmentQuantity'])
], InventoryAdjustment);
//# sourceMappingURL=InventoryAdjustment.js.map