"use strict";
// Manufacturing Industry 5.0 Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionOrderStatus = exports.QualityStatus = exports.EquipmentStatus = exports.ManufacturingProcessType = void 0;
var ManufacturingProcessType;
(function (ManufacturingProcessType) {
    ManufacturingProcessType["DISCRETE"] = "DISCRETE";
    ManufacturingProcessType["CONTINUOUS"] = "CONTINUOUS";
    ManufacturingProcessType["BATCH"] = "BATCH";
    ManufacturingProcessType["HYBRID"] = "HYBRID";
})(ManufacturingProcessType || (exports.ManufacturingProcessType = ManufacturingProcessType = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["OPERATIONAL"] = "OPERATIONAL";
    EquipmentStatus["MAINTENANCE"] = "MAINTENANCE";
    EquipmentStatus["BREAKDOWN"] = "BREAKDOWN";
    EquipmentStatus["IDLE"] = "IDLE";
    EquipmentStatus["SETUP"] = "SETUP";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
var QualityStatus;
(function (QualityStatus) {
    QualityStatus["PASS"] = "PASS";
    QualityStatus["FAIL"] = "FAIL";
    QualityStatus["REWORK"] = "REWORK";
    QualityStatus["PENDING"] = "PENDING";
})(QualityStatus || (exports.QualityStatus = QualityStatus = {}));
var ProductionOrderStatus;
(function (ProductionOrderStatus) {
    ProductionOrderStatus["PLANNED"] = "PLANNED";
    ProductionOrderStatus["RELEASED"] = "RELEASED";
    ProductionOrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProductionOrderStatus["COMPLETED"] = "COMPLETED";
    ProductionOrderStatus["CANCELLED"] = "CANCELLED";
    ProductionOrderStatus["ON_HOLD"] = "ON_HOLD";
})(ProductionOrderStatus || (exports.ProductionOrderStatus = ProductionOrderStatus = {}));
//# sourceMappingURL=manufacturing.js.map