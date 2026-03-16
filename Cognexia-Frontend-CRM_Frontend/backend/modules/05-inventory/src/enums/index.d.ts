export declare enum ItemCategory {
    RAW_MATERIAL = "RAW_MATERIAL",
    WORK_IN_PROGRESS = "WORK_IN_PROGRESS",
    FINISHED_GOODS = "FINISHED_GOODS",
    MAINTENANCE = "MAINTENANCE",
    CONSUMABLES = "CONSUMABLES",
    PACKAGING = "PACKAGING",
    TOOLING = "TOOLING"
}
export declare enum ItemStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DISCONTINUED = "DISCONTINUED",
    OBSOLETE = "OBSOLETE"
}
export declare enum UnitOfMeasure {
    PIECES = "PCS",
    KILOGRAMS = "KG",
    GRAMS = "G",
    LITERS = "L",
    MILLILITERS = "ML",
    METERS = "M",
    CENTIMETERS = "CM",
    MILLIMETERS = "MM",
    SQUARE_METERS = "SQM",
    CUBIC_METERS = "CBM",
    BOXES = "BOX",
    PALLETS = "PLT",
    ROLLS = "ROLL",
    SHEETS = "SHT"
}
export declare enum TransactionType {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND"
}
export declare enum TransactionReason {
    PURCHASE = "PURCHASE",
    PRODUCTION = "PRODUCTION",
    SALE = "SALE",
    TRANSFER = "TRANSFER",
    ADJUSTMENT = "ADJUSTMENT",
    CYCLE_COUNT = "CYCLE_COUNT",
    RETURN = "RETURN",
    DAMAGE = "DAMAGE",
    THEFT = "THEFT",
    EXPIRY = "EXPIRY"
}
export declare enum CycleCountStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum AdjustmentReason {
    CYCLE_COUNT = "CYCLE_COUNT",
    PHYSICAL_COUNT = "PHYSICAL_COUNT",
    DAMAGE = "DAMAGE",
    THEFT = "THEFT",
    EXPIRY = "EXPIRY",
    SYSTEM_ERROR = "SYSTEM_ERROR",
    RETURN = "RETURN",
    WRITE_OFF = "WRITE_OFF",
    OTHER = "OTHER"
}
export declare enum AlertType {
    LOW_STOCK = "LOW_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    STOCKOUT = "STOCKOUT",
    OVERSTOCK = "OVERSTOCK",
    EXPIRY_WARNING = "EXPIRY_WARNING",
    EXPIRED = "EXPIRED",
    NEAR_EXPIRY = "NEAR_EXPIRY",
    NEGATIVE_STOCK = "NEGATIVE_STOCK",
    REORDER_POINT = "REORDER_POINT",
    QUALITY_ISSUE = "QUALITY_ISSUE",
    PRICE_CHANGE = "PRICE_CHANGE",
    DEMAND_SPIKE = "DEMAND_SPIKE",
    SLOW_MOVING = "SLOW_MOVING",
    OBSOLETE = "OBSOLETE",
    COST_VARIANCE = "COST_VARIANCE",
    SYSTEM_ERROR = "SYSTEM_ERROR"
}
export declare enum AlertSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum AlertStatus {
    ACTIVE = "ACTIVE",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    DISMISSED = "DISMISSED",
    SNOOZED = "SNOOZED",
    EXPIRED = "EXPIRED"
}
//# sourceMappingURL=index.d.ts.map