// Inventory Module - Central Export File
// Industry 5.0 ERP System

// ===================== ENTITIES =====================
export {
  InventoryItem,
  StockTransaction,
  StockLocation,
  CycleCount,
  InventoryAdjustment,
  InventoryAlert,
  ReorderPoint
} from './entities';

// ===================== ENUMS =====================
export {
  ItemCategory,
  ItemStatus,
  UnitOfMeasure,
  TransactionType,
  TransactionReason,
  CycleCountStatus,
  AdjustmentReason,
  AlertType,
  AlertSeverity
} from './enums';

// ===================== DTOs =====================
export {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  StockTransactionDto,
  CycleCountDto,
  InventoryAdjustmentDto,
  InventoryReportDto,
  StockLocationDto,
  ReorderPointDto
} from './dto';

// ===================== SERVICES =====================
export { InventoryService } from './services/InventoryService';

// ===================== CONTROLLERS =====================
export { InventoryController } from './controllers/InventoryController';

// ===================== ROUTES =====================
export { default as inventoryRoutes } from './routes/inventory.routes';

// ===================== MIDDLEWARE =====================
export {
  validateInventoryItemExists,
  validateStockAvailability,
  validateSKUUniqueness,
  checkLowStockAlert,
  validateCycleCountAccess,
  validateAdjustmentPermissions,
  auditInventoryOperation,
  validateBulkOperationLimits,
  validateLocationCode,
  validateInventoryFileUpload,
  type InventoryRequest
} from './middleware/inventory.middleware';

// ===================== MODULE INFORMATION =====================
export const INVENTORY_MODULE_INFO = {
  name: 'Inventory Management',
  version: '1.0.0',
  description: 'Comprehensive inventory management system with real-time tracking, automated alerts, and advanced analytics',
  features: [
    'Real-time Stock Tracking',
    'Multi-location Management',
    'Automated Reorder Points',
    'Cycle Counting',
    'Stock Adjustments',
    'Inventory Analytics',
    'Low Stock Alerts',
    'ABC Analysis',
    'Demand Forecasting',
    'Bulk Operations',
    'Import/Export Capabilities',
    'Audit Trail',
    'Mobile Compatibility'
  ],
  permissions: [
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:delete',
    'inventory:stock_transaction',
    'inventory:cycle_count',
    'inventory:adjustment',
    'inventory:large_adjustment',
    'inventory:loss_adjustment',
    'inventory:bulk_update',
    'inventory:bulk_transaction',
    'inventory:import',
    'inventory:export',
    'inventory:analytics',
    'inventory:reports',
    'inventory:forecast',
    'inventory:optimization'
  ],
  routes: {
    base: '/api/inventory',
    endpoints: {
      items: '/items',
      transactions: '/transactions',
      cycleCounts: '/cycle-counts',
      adjustments: '/adjustments',
      locations: '/locations',
      reorderPoints: '/reorder-points',
      alerts: '/alerts',
      analytics: '/analytics',
      reports: '/reports',
      health: '/health',
      bulkOperations: {
        bulkUpdate: '/items/bulk-update',
        bulkTransactions: '/transactions/bulk'
      },
      importExport: {
        import: '/import',
        export: '/export'
      },
      advanced: {
        forecast: '/forecast/:itemId',
        reorderSuggestions: '/optimization/reorder-suggestions',
        abcAnalysis: '/optimization/abc-analysis'
      }
    }
  },
  entities: [
    'InventoryItem',
    'StockTransaction',
    'StockLocation',
    'CycleCount',
    'InventoryAdjustment',
    'InventoryAlert',
    'ReorderPoint'
  ],
  dependencies: [
    '@nestjs/common',
    '@nestjs/typeorm',
    'typeorm',
    'class-validator',
    'class-transformer'
  ]
};

// ===================== TYPE DEFINITIONS =====================
export interface InventoryModuleConfig {
  enableRealTimeTracking: boolean;
  enableAutomaticReordering: boolean;
  defaultReorderMultiplier: number;
  lowStockThresholdPercent: number;
  bulkOperationLimit: number;
  significantAdjustmentThreshold: number;
  enableAuditLogging: boolean;
  enableAlerts: boolean;
  alertCheckInterval: number; // in minutes
}

export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentTransactions: number;
  pendingCycleCounts: number;
  activeAlerts: number;
  averageTurnover: number;
}

export interface StockMovement {
  itemId: string;
  itemName: string;
  sku: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  timestamp: Date;
  performedBy: string;
  balanceAfter: number;
}

export interface ReorderSuggestion {
  itemId: string;
  itemName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  suggestedOrderQuantity: number;
  estimatedStockoutDate: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  averageDailyUsage: number;
  leadTimeInDays: number;
}

export interface ABCClassification {
  class: 'A' | 'B' | 'C';
  items: Array<{
    itemId: string;
    itemName: string;
    sku: string;
    annualUsageValue: number;
    percentOfTotal: number;
  }>;
  totalValue: number;
  percentOfTotalValue: number;
  itemCount: number;
  percentOfTotalItems: number;
}

// ===================== UTILITY FUNCTIONS =====================
export const InventoryUtils = {
  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  calculateEOQ: (annualDemand: number, orderCost: number, holdingCost: number): number => {
    if (holdingCost <= 0) return 0;
    return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  },

  /**
   * Calculate reorder point
   */
  calculateReorderPoint: (avgDailyUsage: number, leadTimeInDays: number, safetyStock: number = 0): number => {
    return (avgDailyUsage * leadTimeInDays) + safetyStock;
  },

  /**
   * Calculate inventory turnover ratio
   */
  calculateTurnoverRatio: (costOfGoodsSold: number, averageInventoryValue: number): number => {
    if (averageInventoryValue <= 0) return 0;
    return costOfGoodsSold / averageInventoryValue;
  },

  /**
   * Calculate days of inventory outstanding
   */
  calculateDaysOfInventoryOutstanding: (averageInventoryValue: number, costOfGoodsSold: number): number => {
    if (costOfGoodsSold <= 0) return 0;
    return (averageInventoryValue * 365) / costOfGoodsSold;
  },

  /**
   * Format currency value
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Calculate variance percentage
   */
  calculateVariancePercent: (actual: number, expected: number): number => {
    if (expected === 0) return actual > 0 ? 100 : 0;
    return ((actual - expected) / expected) * 100;
  },

  /**
   * Generate SKU
   */
  generateSKU: (category: string, prefix: string = '', suffix: string = ''): string => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${category.toUpperCase()}${timestamp}${randomNum}${suffix}`.replace(/[^A-Z0-9]/g, '');
  }
};

// ===================== CONSTANTS =====================
export const INVENTORY_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MAX_BULK_OPERATION_SIZE: 100,
  DEFAULT_REORDER_MULTIPLIER: 2.5,
  LOW_STOCK_THRESHOLD_PERCENT: 20,
  SIGNIFICANT_ADJUSTMENT_THRESHOLD: 1000,
  MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  CACHE_TTL: {
    ANALYTICS: 300, // 5 minutes
    REPORTS: 600,   // 10 minutes
    ALERTS: 60      // 1 minute
  },
  ALERT_SEVERITIES: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  }
};

// ===================== ERROR TYPES =====================
export class InventoryModuleError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: any
  ) {
    super(message);
    this.name = 'InventoryModuleError';
  }
}

export class InsufficientStockError extends InventoryModuleError {
  constructor(itemId: string, requestedQuantity: number, availableQuantity: number) {
    super(
      `Insufficient stock for item ${itemId}. Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
      'INSUFFICIENT_STOCK',
      400,
      { itemId, requestedQuantity, availableQuantity }
    );
  }
}

export class SKUConflictError extends InventoryModuleError {
  constructor(sku: string, existingItemId: string) {
    super(
      `SKU '${sku}' already exists for item ${existingItemId}`,
      'SKU_CONFLICT',
      409,
      { sku, existingItemId }
    );
  }
}

export class InvalidAdjustmentError extends InventoryModuleError {
  constructor(reason: string) {
    super(
      `Invalid inventory adjustment: ${reason}`,
      'INVALID_ADJUSTMENT',
      400,
      { reason }
    );
  }
}

export const INVENTORY_MODULE_VERSION = '1.0.0';
export const INVENTORY_MODULE_NAME = 'Inventory Management System';

// Default export for module
export default {
  info: INVENTORY_MODULE_INFO,
  constants: INVENTORY_CONSTANTS,
  utils: InventoryUtils,
  version: INVENTORY_MODULE_VERSION,
  name: INVENTORY_MODULE_NAME
};
