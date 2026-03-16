import { body, param, query } from 'express-validator';
import { ItemCategory, ItemStatus, UnitOfMeasure, TransactionType, TransactionReason } from '../enums';

export const createInventoryItemSchema = [
  body('name')
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Item name must be between 2 and 200 characters'),
  
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  
  body('category')
    .isIn(Object.values(ItemCategory))
    .withMessage('Invalid item category'),
  
  body('unitOfMeasure')
    .isIn(Object.values(UnitOfMeasure))
    .withMessage('Invalid unit of measure'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  
  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock must be a non-negative integer'),
  
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a non-negative number'),
  
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(Object.values(ItemStatus))
    .withMessage('Invalid item status'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

export const updateInventoryItemSchema = [
  param('id')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Item name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Item name must be between 2 and 200 characters'),
  
  body('sku')
    .optional()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  
  body('category')
    .optional()
    .isIn(Object.values(ItemCategory))
    .withMessage('Invalid item category'),
  
  body('unitOfMeasure')
    .optional()
    .isIn(Object.values(UnitOfMeasure))
    .withMessage('Invalid unit of measure'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  
  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock must be a non-negative integer'),
  
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a non-negative number'),
  
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(Object.values(ItemStatus))
    .withMessage('Invalid item status'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

export const createStockTransactionSchema = [
  body('itemId')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('type')
    .isIn(Object.values(TransactionType))
    .withMessage('Invalid transaction type'),
  
  body('reason')
    .isIn(Object.values(TransactionReason))
    .withMessage('Invalid transaction reason'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a non-negative number'),
  
  body('locationCode')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Location code cannot exceed 50 characters'),
  
  body('batchNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Batch number cannot exceed 100 characters'),
  
  body('serialNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

export const createCycleCountSchema = [
  body('name')
    .notEmpty()
    .withMessage('Cycle count name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Cycle count name must be between 2 and 200 characters'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item must be included in the cycle count'),
  
  body('items.*.itemId')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('items.*.expectedQuantity')
    .isInt({ min: 0 })
    .withMessage('Expected quantity must be a non-negative integer'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

export const updateCycleCountItemSchema = [
  param('countId')
    .isUUID()
    .withMessage('Invalid count ID format'),
  
  param('itemId')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('actualQuantity')
    .isInt({ min: 0 })
    .withMessage('Actual quantity must be a non-negative integer'),
  
  body('countedBy')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Counted by cannot exceed 100 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

export const getInventoryItemsSchema = [
  query('category')
    .optional()
    .isIn(Object.values(ItemCategory))
    .withMessage('Invalid item category'),
  
  query('status')
    .optional()
    .isIn(Object.values(ItemStatus))
    .withMessage('Invalid item status'),
  
  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('Low stock filter must be a boolean'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

export const getStockTransactionsSchema = [
  query('itemId')
    .optional()
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  query('type')
    .optional()
    .isIn(Object.values(TransactionType))
    .withMessage('Invalid transaction type'),
  
  query('reason')
    .optional()
    .isIn(Object.values(TransactionReason))
    .withMessage('Invalid transaction reason'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

export const itemIdParamSchema = [
  param('id')
    .isUUID()
    .withMessage('Invalid item ID format')
];

export const createReorderPointSchema = [
  body('itemId')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('reorderLevel')
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('reorderQuantity')
    .isInt({ min: 1 })
    .withMessage('Reorder quantity must be a positive integer'),
  
  body('safetyStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Safety stock must be a non-negative integer'),
  
  body('leadTimeDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Lead time days must be a positive integer'),
  
  body('supplierId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Supplier ID cannot exceed 100 characters'),
  
  body('autoOrder')
    .optional()
    .isBoolean()
    .withMessage('Auto order must be a boolean')
];

export const createAdjustmentSchema = [
  body('itemId')
    .isUUID()
    .withMessage('Invalid item ID format'),
  
  body('adjustmentQuantity')
    .isInt()
    .withMessage('Adjustment quantity must be an integer'),
  
  body('reason')
    .isIn(Object.values(TransactionReason))
    .withMessage('Invalid adjustment reason'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('approvedBy')
    .optional()
    .isUUID()
    .withMessage('Invalid approver ID format')
];

export const generateReportSchema = [
  body('reportType')
    .isIn(['stock_levels', 'transactions', 'valuation', 'aging', 'turnover', 'abc_analysis'])
    .withMessage('Invalid report type'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  
  body('format')
    .optional()
    .isIn(['json', 'csv', 'pdf', 'excel'])
    .withMessage('Invalid report format')
];
