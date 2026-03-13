import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('InventoryMiddleware');

export interface InventoryRequest extends Request {
  inventoryItem?: InventoryItem;
  stockValidation?: {
    hasStock: boolean;
    availableQuantity: number;
    reservedQuantity: number;
  };
}

/**
 * Middleware to validate inventory item existence
 */
const validateInventoryItemExists = async (
  req: InventoryRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId, id } = req.params;
    const targetId = itemId || id;

    if (!targetId) {
      res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
      return;
    }

    const inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    const inventoryItem = await inventoryItemRepository.findOne({
      where: { id: targetId },
      relations: ['stockLocations', 'reorderPoints', 'alerts']
    });

    if (!inventoryItem) {
      res.status(404).json({
        success: false,
        message: `Inventory item with ID ${targetId} not found`
      });
      return;
    }

    req.inventoryItem = inventoryItem;
    next();
  } catch (error: any) {
    logger.error(`Error validating inventory item: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating inventory item'
    });
  }
};

/**
 * Middleware to validate stock availability for transactions
 */
const validateStockAvailability = async (
  req: InventoryRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, quantity, itemId } = req.body;

    // Only validate for outbound transactions
    if (type !== 'OUTBOUND') {
      next();
      return;
    }

    if (!itemId || !quantity) {
      res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required for stock validation'
      });
      return;
    }

    const inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    const inventoryItem = await inventoryItemRepository.findOne({
      where: { id: itemId },
      relations: ['stockLocations']
    });

    if (!inventoryItem) {
      res.status(404).json({
        success: false,
        message: `Inventory item with ID ${itemId} not found`
      });
      return;
    }

    const availableQuantity = inventoryItem.currentStock;
    const requestedQuantity = parseFloat(quantity);

    if (requestedQuantity > availableQuantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${availableQuantity}, Requested: ${requestedQuantity}`,
        data: {
          availableQuantity,
          requestedQuantity,
          shortage: requestedQuantity - availableQuantity
        }
      });
      return;
    }

    req.stockValidation = {
      hasStock: true,
      availableQuantity,
      reservedQuantity: 0 // Could be enhanced to track reserved inventory
    };

    next();
  } catch (error: any) {
    logger.error(`Error validating stock availability: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating stock'
    });
  }
};

/**
 * Middleware to validate SKU uniqueness
 */
const validateSKUUniqueness = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sku } = req.body;
    const { id } = req.params; // For updates

    if (!sku) {
      next();
      return;
    }

    const inventoryItemRepository = AppDataSource.getRepository(InventoryItem);
    
    // Build query conditions
    const whereConditions: any = { sku };
    
    // For updates, exclude the current item
    if (id) {
      whereConditions.id = { $ne: id };
    }

    const existingItem = await inventoryItemRepository.findOne({
      where: whereConditions
    });

    if (existingItem) {
      res.status(409).json({
        success: false,
        message: `An item with SKU '${sku}' already exists`,
        data: {
          existingItemId: existingItem.id,
          existingItemName: existingItem.name
        }
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error(`Error validating SKU uniqueness: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating SKU'
    });
  }
};

/**
 * Middleware to check low stock alerts
 */
const checkLowStockAlert = async (
  req: InventoryRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inventoryItem = req.inventoryItem;
    
    if (!inventoryItem || !inventoryItem.reorderPoints?.length) {
      next();
      return;
    }

    const activeReorderPoint = inventoryItem.reorderPoints.find(rp => rp.isActive);
    
    if (!activeReorderPoint) {
      next();
      return;
    }

    // Check if current stock is at or below reorder level
    if (inventoryItem.currentStock <= activeReorderPoint.reorderLevel) {
      logger.warn(`Low stock alert for item ${inventoryItem.sku}: ${inventoryItem.currentStock} <= ${activeReorderPoint.reorderLevel}`);
      
      // You could emit events here for notifications
      // EventEmitter.emit('lowStockAlert', inventoryItem);
    }

    next();
  } catch (error: any) {
    logger.error(`Error checking low stock alert: ${error.message}`, error.stack);
    next(); // Don't fail the request for alert checks
  }
};

/**
 * Middleware to validate cycle count permissions and status
 */
const validateCycleCountAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Cycle count ID is required'
      });
      return;
    }

    // Additional validation logic can be added here
    // For example, checking if the user has permissions to access specific locations
    // or if the cycle count is in a valid status for the requested operation

    next();
  } catch (error: any) {
    logger.error(`Error validating cycle count access: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating cycle count access'
    });
  }
};

/**
 * Middleware to validate adjustment permissions
 */
const validateAdjustmentPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { adjustmentQuantity, reason } = req.body;
    const user = (req as any).user;

    // Check for significant adjustments that might need additional approval
    const significantAdjustmentThreshold = 1000; // This could be configurable
    
    if (Math.abs(adjustmentQuantity) > significantAdjustmentThreshold) {
      // Check if user has permission for large adjustments
      if (!user?.permissions?.includes('inventory:large_adjustment')) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions for large inventory adjustments',
          data: {
            requestedAdjustment: adjustmentQuantity,
            threshold: significantAdjustmentThreshold,
            requiredPermission: 'inventory:large_adjustment'
          }
        });
        return;
      }
    }

    // Additional validation based on reason
    if (reason === 'DAMAGE' || reason === 'THEFT') {
      if (!user?.permissions?.includes('inventory:loss_adjustment')) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions for loss-related adjustments',
          data: {
            reason,
            requiredPermission: 'inventory:loss_adjustment'
          }
        });
        return;
      }
    }

    next();
  } catch (error: any) {
    logger.error(`Error validating adjustment permissions: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating adjustment permissions'
    });
  }
};

/**
 * Middleware to log inventory transactions for audit purposes
 */
const auditInventoryOperation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    const operation = req.method;
    const endpoint = req.path;
    const data = {
      userId: user?.id,
      operation,
      endpoint,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Log to audit service (implementation depends on your audit system)
    logger.log(`Inventory operation audit: ${JSON.stringify(data)}`);
    
    next();
  } catch (error: any) {
    logger.error(`Error in audit middleware: ${error.message}`, error.stack);
    next(); // Don't fail the request for audit logging
  }
};

/**
 * Middleware to validate bulk operation limits
 */
const validateBulkOperationLimits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, transactions } = req.body;
    const bulkLimit = 100; // Configurable limit

    const itemCount = items?.length || transactions?.length || 0;

    if (itemCount > bulkLimit) {
      res.status(400).json({
        success: false,
        message: `Bulk operation limit exceeded. Maximum ${bulkLimit} items allowed per request`,
        data: {
          requestedCount: itemCount,
          limit: bulkLimit
        }
      });
      return;
    }

    if (itemCount === 0) {
      res.status(400).json({
        success: false,
        message: 'No items provided for bulk operation'
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error(`Error validating bulk operation limits: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating bulk operation'
    });
  }
};

/**
 * Middleware to validate location codes
 */
const validateLocationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationCode } = req.body;

    if (!locationCode) {
      next();
      return;
    }

    // Basic location code format validation
    const locationCodePattern = /^[A-Z0-9]{2,10}$/;
    
    if (!locationCodePattern.test(locationCode)) {
      res.status(400).json({
        success: false,
        message: 'Invalid location code format. Must be 2-10 alphanumeric characters',
        data: {
          providedCode: locationCode,
          expectedFormat: 'Uppercase letters and numbers, 2-10 characters'
        }
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error(`Error validating location code: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating location code'
    });
  }
};

/**
 * Middleware to handle inventory file upload validation
 */
const validateInventoryFileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = (req as any).file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    // Validate file type
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type. Only CSV and Excel files are allowed',
        data: {
          receivedType: file.mimetype,
          allowedTypes: allowedMimeTypes
        }
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: 'File size exceeds limit',
        data: {
          receivedSize: file.size,
          maxSize,
          maxSizeMB: maxSize / (1024 * 1024)
        }
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error(`Error validating file upload: ${error.message}`, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating file upload'
    });
  }
};

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
  validateInventoryFileUpload
};
