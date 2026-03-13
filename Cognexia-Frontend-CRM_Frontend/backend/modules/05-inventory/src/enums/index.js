"use strict";
// Inventory Module Enums Index
// Re-export all enums from the inventory module
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertStatus = exports.AlertSeverity = exports.AlertType = exports.AdjustmentReason = exports.CycleCountStatus = exports.TransactionReason = exports.TransactionType = exports.UnitOfMeasure = exports.ItemStatus = exports.ItemCategory = void 0;
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["RAW_MATERIAL"] = "RAW_MATERIAL";
    ItemCategory["WORK_IN_PROGRESS"] = "WORK_IN_PROGRESS";
    ItemCategory["FINISHED_GOODS"] = "FINISHED_GOODS";
    ItemCategory["MAINTENANCE"] = "MAINTENANCE";
    ItemCategory["CONSUMABLES"] = "CONSUMABLES";
    ItemCategory["PACKAGING"] = "PACKAGING";
    ItemCategory["TOOLING"] = "TOOLING";
})(ItemCategory || (exports.ItemCategory = ItemCategory = {}));
var ItemStatus;
(function (ItemStatus) {
    ItemStatus["ACTIVE"] = "ACTIVE";
    ItemStatus["INACTIVE"] = "INACTIVE";
    ItemStatus["DISCONTINUED"] = "DISCONTINUED";
    ItemStatus["OBSOLETE"] = "OBSOLETE";
})(ItemStatus || (exports.ItemStatus = ItemStatus = {}));
var UnitOfMeasure;
(function (UnitOfMeasure) {
    UnitOfMeasure["PIECES"] = "PCS";
    UnitOfMeasure["KILOGRAMS"] = "KG";
    UnitOfMeasure["GRAMS"] = "G";
    UnitOfMeasure["LITERS"] = "L";
    UnitOfMeasure["MILLILITERS"] = "ML";
    UnitOfMeasure["METERS"] = "M";
    UnitOfMeasure["CENTIMETERS"] = "CM";
    UnitOfMeasure["MILLIMETERS"] = "MM";
    UnitOfMeasure["SQUARE_METERS"] = "SQM";
    UnitOfMeasure["CUBIC_METERS"] = "CBM";
    UnitOfMeasure["BOXES"] = "BOX";
    UnitOfMeasure["PALLETS"] = "PLT";
    UnitOfMeasure["ROLLS"] = "ROLL";
    UnitOfMeasure["SHEETS"] = "SHT";
})(UnitOfMeasure || (exports.UnitOfMeasure = UnitOfMeasure = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["INBOUND"] = "INBOUND";
    TransactionType["OUTBOUND"] = "OUTBOUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionReason;
(function (TransactionReason) {
    TransactionReason["PURCHASE"] = "PURCHASE";
    TransactionReason["PRODUCTION"] = "PRODUCTION";
    TransactionReason["SALE"] = "SALE";
    TransactionReason["TRANSFER"] = "TRANSFER";
    TransactionReason["ADJUSTMENT"] = "ADJUSTMENT";
    TransactionReason["CYCLE_COUNT"] = "CYCLE_COUNT";
    TransactionReason["RETURN"] = "RETURN";
    TransactionReason["DAMAGE"] = "DAMAGE";
    TransactionReason["THEFT"] = "THEFT";
    TransactionReason["EXPIRY"] = "EXPIRY";
})(TransactionReason || (exports.TransactionReason = TransactionReason = {}));
var CycleCountStatus;
(function (CycleCountStatus) {
    CycleCountStatus["PENDING"] = "PENDING";
    CycleCountStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CycleCountStatus["COMPLETED"] = "COMPLETED";
    CycleCountStatus["CANCELLED"] = "CANCELLED";
})(CycleCountStatus || (exports.CycleCountStatus = CycleCountStatus = {}));
var AdjustmentReason;
(function (AdjustmentReason) {
    AdjustmentReason["CYCLE_COUNT"] = "CYCLE_COUNT";
    AdjustmentReason["PHYSICAL_COUNT"] = "PHYSICAL_COUNT";
    AdjustmentReason["DAMAGE"] = "DAMAGE";
    AdjustmentReason["THEFT"] = "THEFT";
    AdjustmentReason["EXPIRY"] = "EXPIRY";
    AdjustmentReason["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    AdjustmentReason["RETURN"] = "RETURN";
    AdjustmentReason["WRITE_OFF"] = "WRITE_OFF";
    AdjustmentReason["OTHER"] = "OTHER";
})(AdjustmentReason || (exports.AdjustmentReason = AdjustmentReason = {}));
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "LOW_STOCK";
    AlertType["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    AlertType["STOCKOUT"] = "STOCKOUT";
    AlertType["OVERSTOCK"] = "OVERSTOCK";
    AlertType["EXPIRY_WARNING"] = "EXPIRY_WARNING";
    AlertType["EXPIRED"] = "EXPIRED";
    AlertType["NEAR_EXPIRY"] = "NEAR_EXPIRY";
    AlertType["NEGATIVE_STOCK"] = "NEGATIVE_STOCK";
    AlertType["REORDER_POINT"] = "REORDER_POINT";
    AlertType["QUALITY_ISSUE"] = "QUALITY_ISSUE";
    AlertType["PRICE_CHANGE"] = "PRICE_CHANGE";
    AlertType["DEMAND_SPIKE"] = "DEMAND_SPIKE";
    AlertType["SLOW_MOVING"] = "SLOW_MOVING";
    AlertType["OBSOLETE"] = "OBSOLETE";
    AlertType["COST_VARIANCE"] = "COST_VARIANCE";
    AlertType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "LOW";
    AlertSeverity["MEDIUM"] = "MEDIUM";
    AlertSeverity["HIGH"] = "HIGH";
    AlertSeverity["CRITICAL"] = "CRITICAL";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AlertStatus["RESOLVED"] = "RESOLVED";
    AlertStatus["DISMISSED"] = "DISMISSED";
    AlertStatus["SNOOZED"] = "SNOOZED";
    AlertStatus["EXPIRED"] = "EXPIRED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
//# sourceMappingURL=index.js.map