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
exports.StockLocation = void 0;
const typeorm_1 = require("typeorm");
const InventoryItem_1 = require("./InventoryItem");
let StockLocation = class StockLocation {
    // Business Logic Methods
    updateAvailableQuantity() {
        this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
    }
    // Helper Methods
    hasStock() {
        return this.quantity > 0;
    }
    hasAvailableStock() {
        return this.availableQuantity > 0;
    }
    canFulfill(requestedQuantity) {
        return this.availableQuantity >= requestedQuantity;
    }
    isAtMinLevel() {
        if (!this.minQuantity)
            return false;
        return this.quantity <= this.minQuantity;
    }
    isAtMaxLevel() {
        if (!this.maxQuantity)
            return false;
        return this.quantity >= this.maxQuantity;
    }
    getUtilizationPercentage() {
        if (!this.maxQuantity || this.maxQuantity === 0)
            return 0;
        return (this.quantity / this.maxQuantity) * 100;
    }
    getFullLocationCode() {
        const parts = [this.locationCode];
        if (this.zone)
            parts.push(this.zone);
        if (this.aisle)
            parts.push(this.aisle);
        if (this.shelf)
            parts.push(this.shelf);
        if (this.bin)
            parts.push(this.bin);
        return parts.join('-');
    }
    getLocationHierarchy() {
        const hierarchy = [];
        if (this.warehouseName)
            hierarchy.push(this.warehouseName);
        if (this.locationName)
            hierarchy.push(this.locationName);
        if (this.zone)
            hierarchy.push(`Zone: ${this.zone}`);
        if (this.aisle)
            hierarchy.push(`Aisle: ${this.aisle}`);
        if (this.shelf)
            hierarchy.push(`Shelf: ${this.shelf}`);
        if (this.bin)
            hierarchy.push(`Bin: ${this.bin}`);
        return hierarchy.join(' > ');
    }
    hasEnvironmentalControls() {
        return !!(this.temperatureMin || this.temperatureMax || this.humidityMin || this.humidityMax);
    }
    isEnvironmentSuitable(temperature, humidity) {
        if (temperature !== undefined) {
            if (this.temperatureMin && temperature < this.temperatureMin)
                return false;
            if (this.temperatureMax && temperature > this.temperatureMax)
                return false;
        }
        if (humidity !== undefined) {
            if (this.humidityMin && humidity < this.humidityMin)
                return false;
            if (this.humidityMax && humidity > this.humidityMax)
                return false;
        }
        return true;
    }
    reserve(quantity) {
        if (quantity > this.availableQuantity)
            return false;
        this.reservedQuantity += quantity;
        this.updateAvailableQuantity();
        return true;
    }
    unreserve(quantity) {
        if (quantity > this.reservedQuantity)
            return false;
        this.reservedQuantity -= quantity;
        this.updateAvailableQuantity();
        return true;
    }
    adjustStock(quantity) {
        this.quantity = Math.max(0, this.quantity + quantity);
        this.updateAvailableQuantity();
    }
    getStockStatus() {
        if (this.quantity === 0)
            return 'EMPTY';
        if (this.maxQuantity) {
            const utilization = this.getUtilizationPercentage();
            if (utilization >= 100)
                return 'FULL';
            if (utilization >= 80)
                return 'HIGH';
            if (utilization >= 20)
                return 'NORMAL';
        }
        if (this.isAtMinLevel())
            return 'LOW';
        return 'NORMAL';
    }
    toJSON() {
        return {
            id: this.id,
            itemId: this.itemId,
            locationCode: this.locationCode,
            locationName: this.locationName,
            quantity: this.quantity,
            reservedQuantity: this.reservedQuantity,
            availableQuantity: this.availableQuantity,
            minQuantity: this.minQuantity,
            maxQuantity: this.maxQuantity,
            isDefault: this.isDefault,
            isActive: this.isActive,
            zone: this.zone,
            aisle: this.aisle,
            shelf: this.shelf,
            bin: this.bin,
            notes: this.notes,
            coordinates: this.coordinates,
            warehouseCode: this.warehouseCode,
            warehouseName: this.warehouseName,
            temperatureRange: this.temperatureMin || this.temperatureMax ? {
                min: this.temperatureMin,
                max: this.temperatureMax
            } : null,
            humidityRange: this.humidityMin || this.humidityMax ? {
                min: this.humidityMin,
                max: this.humidityMax
            } : null,
            fullLocationCode: this.getFullLocationCode(),
            locationHierarchy: this.getLocationHierarchy(),
            utilizationPercentage: this.getUtilizationPercentage(),
            stockStatus: this.getStockStatus(),
            hasStock: this.hasStock(),
            hasAvailableStock: this.hasAvailableStock(),
            hasEnvironmentalControls: this.hasEnvironmentalControls(),
            createdAt: this.createdAt,
            lastUpdated: this.lastUpdated
        };
    }
};
exports.StockLocation = StockLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockLocation.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], StockLocation.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StockLocation.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StockLocation.prototype, "reservedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StockLocation.prototype, "availableQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "minQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "maxQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StockLocation.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], StockLocation.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "aisle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "shelf", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "bin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], StockLocation.prototype, "coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "warehouseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "warehouseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "temperatureMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "temperatureMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "humidityMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockLocation.prototype, "humidityMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockLocation.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StockLocation.prototype, "lastUpdated", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryItem_1.InventoryItem, item => item.stockLocations, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", InventoryItem_1.InventoryItem)
], StockLocation.prototype, "item", void 0);
exports.StockLocation = StockLocation = __decorate([
    (0, typeorm_1.Entity)('stock_locations'),
    (0, typeorm_1.Index)(['itemId']),
    (0, typeorm_1.Index)(['locationCode']),
    (0, typeorm_1.Index)(['quantity']),
    (0, typeorm_1.Unique)(['itemId', 'locationCode'])
], StockLocation);
//# sourceMappingURL=StockLocation.js.map