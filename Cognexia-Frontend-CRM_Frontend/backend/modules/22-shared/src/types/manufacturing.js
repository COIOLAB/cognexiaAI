// Manufacturing domain types and interfaces
export var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "PREVENTIVE";
    MaintenanceType["PREDICTIVE"] = "PREDICTIVE";
    MaintenanceType["CORRECTIVE"] = "CORRECTIVE";
    MaintenanceType["EMERGENCY"] = "EMERGENCY";
    MaintenanceType["ROUTINE"] = "ROUTINE";
})(MaintenanceType || (MaintenanceType = {}));
export var EquipmentType;
(function (EquipmentType) {
    EquipmentType["MACHINE"] = "MACHINE";
    EquipmentType["TOOL"] = "TOOL";
    EquipmentType["CONVEYOR"] = "CONVEYOR";
    EquipmentType["ROBOT"] = "ROBOT";
    EquipmentType["SENSOR"] = "SENSOR";
    EquipmentType["CONTROL_SYSTEM"] = "CONTROL_SYSTEM";
})(EquipmentType || (EquipmentType = {}));
export var ProductionOrderStatus;
(function (ProductionOrderStatus) {
    ProductionOrderStatus["DRAFT"] = "DRAFT";
    ProductionOrderStatus["PLANNED"] = "PLANNED";
    ProductionOrderStatus["RELEASED"] = "RELEASED";
    ProductionOrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProductionOrderStatus["COMPLETED"] = "COMPLETED";
    ProductionOrderStatus["CANCELLED"] = "CANCELLED";
    ProductionOrderStatus["ON_HOLD"] = "ON_HOLD";
})(ProductionOrderStatus || (ProductionOrderStatus = {}));
export var QualityStatus;
(function (QualityStatus) {
    QualityStatus["PASS"] = "PASS";
    QualityStatus["FAIL"] = "FAIL";
    QualityStatus["PENDING"] = "PENDING";
    QualityStatus["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
})(QualityStatus || (QualityStatus = {}));
export var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["CRITICAL"] = "CRITICAL";
})(Priority || (Priority = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (RiskLevel = {}));
export var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["SCHEDULED"] = "SCHEDULED";
    MaintenanceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MaintenanceStatus["COMPLETED"] = "COMPLETED";
    MaintenanceStatus["CANCELLED"] = "CANCELLED";
    MaintenanceStatus["OVERDUE"] = "OVERDUE";
})(MaintenanceStatus || (MaintenanceStatus = {}));
//# sourceMappingURL=manufacturing.js.map