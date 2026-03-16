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
exports.InventoryAlert = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../enums");
const InventoryItem_1 = require("./InventoryItem");
let InventoryAlert = class InventoryAlert {
    // Business Logic Methods
    calculateMetrics() {
        // Set first occurrence if not set
        if (!this.firstOccurrence) {
            this.firstOccurrence = new Date();
        }
        // Update last occurrence
        this.lastOccurrence = new Date();
        // Increment occurrence count
        this.occurrenceCount = (this.occurrenceCount || 0) + 1;
        // Determine business impact based on severity and cost
        this.businessImpact = this.calculateBusinessImpact();
        // Set due date if not set
        if (!this.dueDate) {
            this.dueDate = this.calculateDueDate();
        }
        // Determine if immediate action is required
        this.requiresImmedateAction = this.shouldRequireImmediateAction();
    }
    // Alert Management Methods
    acknowledge(userId) {
        if (this.status === enums_1.AlertStatus.ACTIVE) {
            this.status = enums_1.AlertStatus.ACKNOWLEDGED;
            this.assignedTo = userId;
            this.updatedAt = new Date();
        }
    }
    resolve(userId, notes, action) {
        this.status = enums_1.AlertStatus.RESOLVED;
        this.resolvedBy = userId;
        this.resolvedAt = new Date();
        this.isActive = false;
        if (notes)
            this.resolutionNotes = notes;
        if (action)
            this.resolutionAction = action;
    }
    dismiss(userId, reason) {
        this.status = enums_1.AlertStatus.DISMISSED;
        this.resolvedBy = userId;
        this.resolvedAt = new Date();
        this.isActive = false;
        if (reason)
            this.resolutionNotes = reason;
    }
    escalate(toUser, level) {
        this.isEscalated = true;
        this.escalatedAt = new Date();
        this.escalatedTo = toUser;
        this.assignedTo = toUser;
        if (level)
            this.escalationLevel = level;
        // Increase severity if escalating
        if (this.severity === enums_1.AlertSeverity.LOW) {
            this.severity = enums_1.AlertSeverity.MEDIUM;
        }
        else if (this.severity === enums_1.AlertSeverity.MEDIUM) {
            this.severity = enums_1.AlertSeverity.HIGH;
        }
    }
    snooze(hours) {
        if (this.status === enums_1.AlertStatus.ACTIVE) {
            this.status = enums_1.AlertStatus.SNOOZED;
            this.dueDate = new Date(Date.now() + (hours * 60 * 60 * 1000));
        }
    }
    reactivate() {
        if (this.status === enums_1.AlertStatus.SNOOZED || this.status === enums_1.AlertStatus.DISMISSED) {
            this.status = enums_1.AlertStatus.ACTIVE;
            this.isActive = true;
            this.dueDate = this.calculateDueDate();
        }
    }
    // Helper Methods
    isOverdue() {
        return this.dueDate ? new Date() > this.dueDate : false;
    }
    isResolved() {
        return this.status === enums_1.AlertStatus.RESOLVED;
    }
    isDismissed() {
        return this.status === enums_1.AlertStatus.DISMISSED;
    }
    isAcknowledged() {
        return this.status === enums_1.AlertStatus.ACKNOWLEDGED;
    }
    isSnoozed() {
        return this.status === enums_1.AlertStatus.SNOOZED;
    }
    canBeResolved() {
        return [enums_1.AlertStatus.ACTIVE, enums_1.AlertStatus.ACKNOWLEDGED, enums_1.AlertStatus.SNOOZED].includes(this.status);
    }
    canBeEscalated() {
        return this.status === enums_1.AlertStatus.ACTIVE && !this.isEscalated;
    }
    getAge() {
        return Date.now() - this.createdAt.getTime();
    }
    getAgeInHours() {
        return Math.floor(this.getAge() / (1000 * 60 * 60));
    }
    getAgeInDays() {
        return Math.floor(this.getAge() / (1000 * 60 * 60 * 24));
    }
    getTimeToResolve() {
        if (!this.resolvedAt)
            return null;
        return this.resolvedAt.getTime() - this.createdAt.getTime();
    }
    needsReminder() {
        if (!this.isActive || this.isResolved())
            return false;
        const lastReminder = this.lastReminderSent || this.createdAt;
        const hoursSinceLastReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
        // Send reminder based on severity
        const reminderInterval = this.getReminderInterval();
        return hoursSinceLastReminder >= reminderInterval;
    }
    getReminderInterval() {
        switch (this.severity) {
            case enums_1.AlertSeverity.CRITICAL: return 1; // Every hour
            case enums_1.AlertSeverity.HIGH: return 4; // Every 4 hours
            case enums_1.AlertSeverity.MEDIUM: return 12; // Every 12 hours
            case enums_1.AlertSeverity.LOW: return 24; // Every day
            default: return 24;
        }
    }
    sendReminder() {
        this.reminderCount++;
        this.lastReminderSent = new Date();
    }
    calculateBusinessImpact() {
        if (this.severity === enums_1.AlertSeverity.CRITICAL)
            return 'CRITICAL';
        if (this.severity === enums_1.AlertSeverity.HIGH)
            return 'HIGH';
        if (this.estimatedCostImpact && this.estimatedCostImpact > 10000)
            return 'HIGH';
        if (this.severity === enums_1.AlertSeverity.MEDIUM)
            return 'MEDIUM';
        return 'LOW';
    }
    calculateDueDate() {
        const now = new Date();
        let hours = 24; // Default 24 hours
        switch (this.severity) {
            case enums_1.AlertSeverity.CRITICAL:
                hours = 1;
                break;
            case enums_1.AlertSeverity.HIGH:
                hours = 4;
                break;
            case enums_1.AlertSeverity.MEDIUM:
                hours = 12;
                break;
            case enums_1.AlertSeverity.LOW:
                hours = 24;
                break;
        }
        return new Date(now.getTime() + (hours * 60 * 60 * 1000));
    }
    shouldRequireImmediateAction() {
        return this.severity === enums_1.AlertSeverity.CRITICAL ||
            this.type === enums_1.AlertType.STOCKOUT ||
            (this.estimatedCostImpact && this.estimatedCostImpact > 50000);
    }
    getAlertTypeDescription() {
        const typeMap = {
            [enums_1.AlertType.LOW_STOCK]: 'Low Stock Level',
            [enums_1.AlertType.STOCKOUT]: 'Stock Out',
            [enums_1.AlertType.OVERSTOCK]: 'Overstock',
            [enums_1.AlertType.REORDER_POINT]: 'Reorder Point Reached',
            [enums_1.AlertType.EXPIRED]: 'Expired Inventory',
            [enums_1.AlertType.NEAR_EXPIRY]: 'Near Expiry',
            [enums_1.AlertType.QUALITY_ISSUE]: 'Quality Issue',
            [enums_1.AlertType.PRICE_CHANGE]: 'Price Change',
            [enums_1.AlertType.DEMAND_SPIKE]: 'Demand Spike',
            [enums_1.AlertType.SLOW_MOVING]: 'Slow Moving',
            [enums_1.AlertType.OBSOLETE]: 'Obsolete Inventory',
            [enums_1.AlertType.COST_VARIANCE]: 'Cost Variance',
            [enums_1.AlertType.SYSTEM_ERROR]: 'System Error'
        };
        return typeMap[this.type] || this.type;
    }
    getSeverityColor() {
        const colorMap = {
            [enums_1.AlertSeverity.CRITICAL]: '#DC2626',
            [enums_1.AlertSeverity.HIGH]: '#EA580C',
            [enums_1.AlertSeverity.MEDIUM]: '#D97706',
            [enums_1.AlertSeverity.LOW]: '#65A30D'
        };
        return colorMap[this.severity] || '#6B7280';
    }
    getPriorityScore() {
        let score = 0;
        // Base score from severity
        switch (this.severity) {
            case enums_1.AlertSeverity.CRITICAL:
                score += 100;
                break;
            case enums_1.AlertSeverity.HIGH:
                score += 75;
                break;
            case enums_1.AlertSeverity.MEDIUM:
                score += 50;
                break;
            case enums_1.AlertSeverity.LOW:
                score += 25;
                break;
        }
        // Add score for business impact
        if (this.estimatedCostImpact) {
            score += Math.min(this.estimatedCostImpact / 1000, 50);
        }
        // Add score for age (older alerts get higher priority)
        score += Math.min(this.getAgeInHours(), 20);
        // Add score for overdue alerts
        if (this.isOverdue()) {
            score += 30;
        }
        return score;
    }
    toJSON() {
        return {
            id: this.id,
            itemId: this.itemId,
            type: this.type,
            typeDescription: this.getAlertTypeDescription(),
            severity: this.severity,
            severityColor: this.getSeverityColor(),
            status: this.status,
            title: this.title,
            description: this.description,
            recommendation: this.recommendation,
            threshold: this.threshold,
            currentValue: this.currentValue,
            locationCode: this.locationCode,
            warehouseCode: this.warehouseCode,
            category: this.category,
            alertData: this.alertData,
            alertConditions: this.alertConditions,
            triggeredBy: this.triggeredBy,
            assignedTo: this.assignedTo,
            resolvedBy: this.resolvedBy,
            resolvedAt: this.resolvedAt,
            resolutionNotes: this.resolutionNotes,
            resolutionAction: this.resolutionAction,
            isActive: this.isActive,
            isSystemGenerated: this.isSystemGenerated,
            requiresImmedateAction: this.requiresImmedateAction,
            isEscalated: this.isEscalated,
            escalatedAt: this.escalatedAt,
            escalatedTo: this.escalatedTo,
            escalationLevel: this.escalationLevel,
            dueDate: this.dueDate,
            reminderCount: this.reminderCount,
            lastReminderSent: this.lastReminderSent,
            notificationChannels: this.notificationChannels,
            businessImpact: this.businessImpact,
            estimatedCostImpact: this.estimatedCostImpact,
            department: this.department,
            costCenter: this.costCenter,
            project: this.project,
            occurrenceCount: this.occurrenceCount,
            firstOccurrence: this.firstOccurrence,
            lastOccurrence: this.lastOccurrence,
            age: this.getAge(),
            ageInHours: this.getAgeInHours(),
            ageInDays: this.getAgeInDays(),
            isOverdue: this.isOverdue(),
            needsReminder: this.needsReminder(),
            canBeResolved: this.canBeResolved(),
            canBeEscalated: this.canBeEscalated(),
            priorityScore: this.getPriorityScore(),
            timeToResolve: this.getTimeToResolve(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
exports.InventoryAlert = InventoryAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AlertType
    }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AlertSeverity
    }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.AlertStatus,
        default: enums_1.AlertStatus.ACTIVE
    }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "recommendation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryAlert.prototype, "threshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryAlert.prototype, "currentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "warehouseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InventoryAlert.prototype, "alertData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InventoryAlert.prototype, "alertConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "triggeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "resolutionAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], InventoryAlert.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAlert.prototype, "isSystemGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAlert.prototype, "requiresImmedateAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryAlert.prototype, "isEscalated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "escalatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "escalatedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "escalationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryAlert.prototype, "reminderCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "lastReminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InventoryAlert.prototype, "notificationChannels", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], InventoryAlert.prototype, "notificationHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "businessImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], InventoryAlert.prototype, "estimatedCostImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InventoryAlert.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryAlert.prototype, "occurrenceCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "firstOccurrence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "lastOccurrence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryAlert.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.alerts, {
        onDelete: 'CASCADE',
        nullable: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], InventoryAlert.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryAlert.prototype, "calculateMetrics", null);
exports.InventoryAlert = InventoryAlert = __decorate([
    (0, typeorm_1.Entity)('inventory_alerts'),
    (0, typeorm_1.Index)(['itemId']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['severity']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Index)(['resolvedAt'])
], InventoryAlert);
//# sourceMappingURL=InventoryAlert.js.map