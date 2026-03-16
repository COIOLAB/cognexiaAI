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
exports.CycleCount = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../enums");
const InventoryItem_1 = require("./InventoryItem");
let CycleCount = class CycleCount {
    // Business Logic Methods
    calculateVariance() {
        if (this.actualQuantity !== undefined && this.actualQuantity !== null) {
            this.variance = this.actualQuantity - this.expectedQuantity;
            if (this.expectedQuantity !== 0) {
                this.variancePercentage = (this.variance / this.expectedQuantity) * 100;
            }
            else {
                this.variancePercentage = this.actualQuantity > 0 ? 100 : 0;
            }
            if (this.unitCost) {
                this.varianceValue = this.variance * this.unitCost;
            }
        }
    }
    // Helper Methods
    isPending() {
        return this.status === enums_1.CycleCountStatus.PENDING;
    }
    isInProgress() {
        return this.status === enums_1.CycleCountStatus.IN_PROGRESS;
    }
    isCompleted() {
        return this.status === enums_1.CycleCountStatus.COMPLETED;
    }
    isCancelled() {
        return this.status === enums_1.CycleCountStatus.CANCELLED;
    }
    hasVariance() {
        return this.variance !== 0;
    }
    hasPositiveVariance() {
        return this.variance > 0;
    }
    hasNegativeVariance() {
        return this.variance < 0;
    }
    isSignificantVariance(threshold = 5) {
        return Math.abs(this.variancePercentage) > threshold;
    }
    getDaysOverdue() {
        if (!this.scheduledDate || this.isCompleted())
            return 0;
        const today = new Date();
        const scheduled = new Date(this.scheduledDate);
        const diffTime = today.getTime() - scheduled.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
    isOverdue() {
        return this.getDaysOverdue() > 0;
    }
    getCountDuration() {
        if (!this.startedAt || !this.completedAt)
            return null;
        const duration = this.completedAt.getTime() - this.startedAt.getTime();
        return Math.round(duration / (1000 * 60)); // Return duration in minutes
    }
    getVarianceSeverity() {
        const absVariancePercent = Math.abs(this.variancePercentage);
        if (absVariancePercent === 0)
            return 'NONE';
        if (absVariancePercent < 2)
            return 'LOW';
        if (absVariancePercent < 5)
            return 'MEDIUM';
        if (absVariancePercent < 10)
            return 'HIGH';
        return 'CRITICAL';
    }
    getPriority() {
        if (this.isOverdue()) {
            const daysOverdue = this.getDaysOverdue();
            if (daysOverdue > 30)
                return 'URGENT';
            if (daysOverdue > 7)
                return 'HIGH';
            return 'MEDIUM';
        }
        return 'LOW';
    }
    canBeCompleted() {
        return this.isPending() || this.isInProgress();
    }
    canBeCancelled() {
        return this.isPending() || this.isInProgress();
    }
    needsApproval() {
        return this.isCompleted() && this.hasVariance() && !this.approvedBy;
    }
    complete(actualQuantity, countedBy, notes) {
        this.actualQuantity = actualQuantity;
        this.countedBy = countedBy;
        this.completedBy = countedBy;
        this.completedAt = new Date();
        this.status = enums_1.CycleCountStatus.COMPLETED;
        if (notes) {
            this.notes = notes;
        }
        this.calculateVariance();
    }
    start(countedBy) {
        this.status = enums_1.CycleCountStatus.IN_PROGRESS;
        this.countedBy = countedBy;
        this.startedAt = new Date();
    }
    cancel(reason) {
        this.status = enums_1.CycleCountStatus.CANCELLED;
        if (reason) {
            this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
        }
    }
    approve(approvedBy) {
        this.approvedBy = approvedBy;
    }
    scheduleRecount(reason) {
        this.requiresRecount = true;
        this.recountReason = reason;
        this.countAttempt += 1;
    }
    toJSON() {
        return {
            id: this.id,
            itemId: this.itemId,
            locationCode: this.locationCode,
            status: this.status,
            expectedQuantity: this.expectedQuantity,
            actualQuantity: this.actualQuantity,
            variance: this.variance,
            variancePercentage: this.variancePercentage,
            varianceValue: this.varianceValue,
            scheduledDate: this.scheduledDate,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            createdBy: this.createdBy,
            countedBy: this.countedBy,
            completedBy: this.completedBy,
            approvedBy: this.approvedBy,
            notes: this.notes,
            countType: this.countType,
            countSequence: this.countSequence,
            countReason: this.countReason,
            batchNumber: this.batchNumber,
            serialNumber: this.serialNumber,
            expiryDate: this.expiryDate,
            countMethod: this.countMethod,
            deviceUsed: this.deviceUsed,
            countDetails: this.countDetails,
            requiresRecount: this.requiresRecount,
            isRecounted: this.isRecounted,
            recountReason: this.recountReason,
            countAttempt: this.countAttempt,
            hasVariance: this.hasVariance(),
            hasPositiveVariance: this.hasPositiveVariance(),
            hasNegativeVariance: this.hasNegativeVariance(),
            varianceSeverity: this.getVarianceSeverity(),
            priority: this.getPriority(),
            isOverdue: this.isOverdue(),
            daysOverdue: this.getDaysOverdue(),
            countDuration: this.getCountDuration(),
            needsApproval: this.needsApproval(),
            canBeCompleted: this.canBeCompleted(),
            canBeCancelled: this.canBeCancelled(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
exports.CycleCount = CycleCount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CycleCount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CycleCount.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.CycleCountStatus,
        default: enums_1.CycleCountStatus.PENDING
    }),
    __metadata("design:type", String)
], CycleCount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], CycleCount.prototype, "expectedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CycleCount.prototype, "actualQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], CycleCount.prototype, "variance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, default: 0 }),
    __metadata("design:type", Number)
], CycleCount.prototype, "variancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CycleCount.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CycleCount.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CycleCount.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], CycleCount.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "countedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "completedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "countType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], CycleCount.prototype, "countSequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "countReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CycleCount.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CycleCount.prototype, "unitCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CycleCount.prototype, "varianceValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "countMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "deviceUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CycleCount.prototype, "countDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CycleCount.prototype, "requiresRecount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CycleCount.prototype, "isRecounted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CycleCount.prototype, "recountReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], CycleCount.prototype, "countAttempt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CycleCount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CycleCount.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.cycleCountRecords, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], CycleCount.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CycleCount.prototype, "calculateVariance", null);
exports.CycleCount = CycleCount = __decorate([
    (0, typeorm_1.Entity)('cycle_counts'),
    (0, typeorm_1.Index)(['itemId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['scheduledDate']),
    (0, typeorm_1.Index)(['createdBy']),
    (0, typeorm_1.Index)(['completedAt'])
], CycleCount);
//# sourceMappingURL=CycleCount.js.map