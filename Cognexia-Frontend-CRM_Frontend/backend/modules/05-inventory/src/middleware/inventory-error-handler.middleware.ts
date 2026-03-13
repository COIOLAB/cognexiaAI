/**
 * Inventory Error Handling Middleware
 * Industry 5.0 ERP - Advanced Inventory Management Error Handler
 * 
 * Comprehensive error handling middleware specifically designed for inventory operations
 * with detailed error classification, contextual responses, and actionable suggestions.
 */

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  ServiceUnavailableException,
  ForbiddenException
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';

// =============== CUSTOM INVENTORY ERROR CLASSES ===============

export class InventoryBaseError extends HttpException {
  public readonly errorCode: string;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly category: string;
  public readonly suggestions: string[];
  public readonly relatedEntities: Record<string, any>;
  public readonly systemImpact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly userActions: string[];
  public readonly adminActions: string[];
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    category: string,
    suggestions: string[] = [],
    relatedEntities: Record<string, any> = {},
    systemImpact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW',
    userActions: string[] = [],
    adminActions: string[] = []
  ) {
    super(message, statusCode);
    this.errorCode = errorCode;
    this.severity = severity;
    this.category = category;
    this.suggestions = suggestions;
    this.relatedEntities = relatedEntities;
    this.systemImpact = systemImpact;
    this.userActions = userActions;
    this.adminActions = adminActions;
    this.timestamp = new Date();
  }
}

export class InventoryNotFoundError extends InventoryBaseError {
  constructor(
    itemIdentifier: string,
    itemType: 'ITEM' | 'LOCATION' | 'WAREHOUSE' | 'STOCK_MOVEMENT' | 'CYCLE_COUNT' = 'ITEM'
  ) {
    super(
      `${itemType.toLowerCase().replace('_', ' ')} '${itemIdentifier}' not found`,
      HttpStatus.NOT_FOUND,
      'INVENTORY_NOT_FOUND',
      'MEDIUM',
      'DATA_INTEGRITY',
      [
        `Verify the ${itemType.toLowerCase()} identifier '${itemIdentifier}' is correct`,
        `Check if the ${itemType.toLowerCase()} has been deleted or archived`,
        `Refresh your data and try again`,
        `Contact support if the ${itemType.toLowerCase()} should exist`
      ],
      { [itemType.toLowerCase()]: itemIdentifier },
      'LOW',
      [
        'Double-check the identifier',
        'Refresh the page',
        'Search for similar items'
      ],
      [
        'Check database consistency',
        'Review deletion logs',
        'Restore from backup if needed'
      ]
    );
  }
}

export class InsufficientStockError extends InventoryBaseError {
  constructor(
    sku: string,
    requestedQuantity: number,
    availableQuantity: number,
    locationId?: string
  ) {
    const locationInfo = locationId ? ` in location ${locationId}` : '';
    
    super(
      `Insufficient stock for item '${sku}': requested ${requestedQuantity}, available ${availableQuantity}${locationInfo}`,
      HttpStatus.CONFLICT,
      'INSUFFICIENT_STOCK',
      'HIGH',
      'STOCK_MANAGEMENT',
      [
        `Reduce the requested quantity to ${availableQuantity} or less`,
        'Check if stock is available in other locations',
        'Consider partial fulfillment',
        'Trigger emergency reorder process',
        'Review demand planning accuracy'
      ],
      {
        sku,
        requestedQuantity,
        availableQuantity,
        shortage: requestedQuantity - availableQuantity,
        locationId
      },
      'HIGH',
      [
        'Reduce order quantity',
        'Check other warehouses',
        'Request expedited delivery',
        'Consider alternatives'
      ],
      [
        'Review safety stock levels',
        'Analyze demand forecast accuracy',
        'Implement automatic reordering',
        'Optimize inventory levels'
      ]
    );
  }
}

export class InventoryValidationError extends InventoryBaseError {
  constructor(
    fieldName: string,
    value: any,
    validationRule: string,
    expectedFormat?: string
  ) {
    const formatInfo = expectedFormat ? ` Expected format: ${expectedFormat}` : '';
    
    super(
      `Validation failed for field '${fieldName}': ${validationRule}.${formatInfo}`,
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      'MEDIUM',
      'DATA_VALIDATION',
      [
        `Correct the ${fieldName} field according to validation rules`,
        'Review the API documentation for correct field formats',
        'Use the provided format examples',
        'Validate input data before submitting'
      ],
      {
        fieldName,
        providedValue: value,
        validationRule,
        expectedFormat
      },
      'LOW',
      [
        'Check input format',
        'Review field requirements',
        'Use validation examples',
        'Try again with correct data'
      ],
      [
        'Review validation rules',
        'Update API documentation',
        'Improve user input validation',
        'Add better error messages'
      ]
    );
  }
}

export class StockMovementError extends InventoryBaseError {
  constructor(
    itemId: string,
    movementType: string,
    quantity: number,
    reason: string
  ) {
    super(
      `Stock movement failed for item ${itemId}: ${reason}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'STOCK_MOVEMENT_ERROR',
      'HIGH',
      'STOCK_OPERATIONS',
      [
        'Verify the item exists and is active',
        'Check if the location has sufficient capacity',
        'Ensure the movement type is valid for this item',
        'Review stock movement history for patterns',
        'Validate user permissions for this operation'
      ],
      {
        itemId,
        movementType,
        quantity,
        failureReason: reason
      },
      'MEDIUM',
      [
        'Check item status',
        'Verify location capacity',
        'Review movement details',
        'Contact warehouse manager'
      ],
      [
        'Investigate stock movement patterns',
        'Review system constraints',
        'Update business rules',
        'Improve validation logic'
      ]
    );
  }
}

export class LocationCapacityError extends InventoryBaseError {
  constructor(
    locationId: string,
    currentUtilization: number,
    maxCapacity: number,
    attemptedAddition: number
  ) {
    const utilizationPercentage = Math.round((currentUtilization / maxCapacity) * 100);
    
    super(
      `Location capacity exceeded: location ${locationId} is at ${utilizationPercentage}% capacity, cannot add ${attemptedAddition} more units`,
      HttpStatus.CONFLICT,
      'LOCATION_CAPACITY_EXCEEDED',
      'HIGH',
      'LOCATION_MANAGEMENT',
      [
        'Choose a different location with available capacity',
        'Consider partial placement across multiple locations',
        'Review and optimize current location utilization',
        'Request capacity expansion approval',
        'Implement dynamic slotting optimization'
      ],
      {
        locationId,
        currentUtilization,
        maxCapacity,
        utilizationPercentage,
        attemptedAddition,
        availableCapacity: maxCapacity - currentUtilization
      },
      'MEDIUM',
      [
        'Select alternative location',
        'Split across locations',
        'Optimize current placement',
        'Request capacity increase'
      ],
      [
        'Analyze capacity utilization trends',
        'Implement automatic optimization',
        'Review location sizing strategy',
        'Plan capacity expansions'
      ]
    );
  }
}

export class CycleCountDiscrepancyError extends InventoryBaseError {
  constructor(
    itemId: string,
    systemCount: number,
    physicalCount: number,
    tolerancePercentage: number
  ) {
    const discrepancyPercentage = Math.abs((physicalCount - systemCount) / systemCount) * 100;
    
    super(
      `Cycle count discrepancy exceeds tolerance: item ${itemId} shows ${discrepancyPercentage.toFixed(1)}% variance (tolerance: ${tolerancePercentage}%)`,
      HttpStatus.CONFLICT,
      'CYCLE_COUNT_DISCREPANCY',
      'HIGH',
      'CYCLE_COUNTING',
      [
        'Perform a recount to verify accuracy',
        'Investigate recent stock movements',
        'Check for unreported damages or theft',
        'Review receiving and shipping records',
        'Update system count after verification'
      ],
      {
        itemId,
        systemCount,
        physicalCount,
        variance: physicalCount - systemCount,
        discrepancyPercentage: Math.round(discrepancyPercentage * 100) / 100,
        tolerancePercentage
      },
      'HIGH',
      [
        'Initiate recount process',
        'Review recent transactions',
        'Check for damages',
        'Verify counting accuracy'
      ],
      [
        'Investigate root cause',
        'Review counting procedures',
        'Improve inventory tracking',
        'Adjust tolerance levels'
      ]
    );
  }
}

export class SupplierConnectivityError extends InventoryBaseError {
  constructor(supplierId: string, operation: string) {
    super(
      `Supplier connectivity error: unable to ${operation} with supplier ${supplierId}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      'SUPPLIER_CONNECTIVITY_ERROR',
      'CRITICAL',
      'EXTERNAL_INTEGRATION',
      [
        'Check network connectivity',
        'Verify supplier API credentials',
        'Try the operation again in a few minutes',
        'Use alternative communication method',
        'Contact supplier support'
      ],
      {
        supplierId,
        operation,
        retryable: true
      },
      'HIGH',
      [
        'Retry the operation',
        'Check connection status',
        'Use alternative method',
        'Contact supplier directly'
      ],
      [
        'Check system connectivity',
        'Review API configurations',
        'Implement retry mechanisms',
        'Set up monitoring alerts'
      ]
    );
  }
}

export class IoTDeviceError extends InventoryBaseError {
  constructor(
    deviceId: string,
    errorType: 'OFFLINE' | 'SENSOR_MALFUNCTION' | 'DATA_CORRUPTION' | 'CALIBRATION_REQUIRED'
  ) {
    const errorMessages = {
      OFFLINE: `IoT device ${deviceId} is offline and not responding`,
      SENSOR_MALFUNCTION: `Sensor malfunction detected on device ${deviceId}`,
      DATA_CORRUPTION: `Data corruption detected from device ${deviceId}`,
      CALIBRATION_REQUIRED: `Device ${deviceId} requires calibration`
    };

    const suggestions = {
      OFFLINE: [
        'Check device power supply',
        'Verify network connectivity',
        'Restart the device',
        'Check for physical obstructions'
      ],
      SENSOR_MALFUNCTION: [
        'Run device diagnostics',
        'Check sensor connections',
        'Replace faulty sensors',
        'Contact technical support'
      ],
      DATA_CORRUPTION: [
        'Restart data collection',
        'Clear device memory',
        'Update device firmware',
        'Review data transmission logs'
      ],
      CALIBRATION_REQUIRED: [
        'Schedule calibration maintenance',
        'Use backup sensors temporarily',
        'Follow calibration procedures',
        'Document calibration results'
      ]
    };

    super(
      errorMessages[errorType],
      HttpStatus.SERVICE_UNAVAILABLE,
      `IOT_DEVICE_${errorType}`,
      'HIGH',
      'IOT_MONITORING',
      suggestions[errorType],
      {
        deviceId,
        errorType,
        requiresPhysicalIntervention: ['OFFLINE', 'SENSOR_MALFUNCTION', 'CALIBRATION_REQUIRED'].includes(errorType)
      },
      'MEDIUM',
      [
        'Check device status',
        'Restart if possible',
        'Contact maintenance',
        'Use alternative methods'
      ],
      [
        'Schedule maintenance',
        'Check device logs',
        'Update device firmware',
        'Implement preventive maintenance'
      ]
    );
  }
}

export class QuantumOptimizationError extends InventoryBaseError {
  constructor(optimizationType: string, reason: string) {
    super(
      `Quantum optimization failed for ${optimizationType}: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'QUANTUM_OPTIMIZATION_ERROR',
      'HIGH',
      'QUANTUM_COMPUTING',
      [
        'Retry the optimization with different parameters',
        'Use classical optimization as fallback',
        'Check quantum simulator availability',
        'Reduce problem complexity',
        'Contact quantum computing support'
      ],
      {
        optimizationType,
        failureReason: reason,
        fallbackAvailable: true
      },
      'MEDIUM',
      [
        'Try again later',
        'Use classical optimization',
        'Reduce complexity',
        'Contact support'
      ],
      [
        'Check quantum system status',
        'Review optimization parameters',
        'Implement fallback mechanisms',
        'Monitor quantum performance'
      ]
    );
  }
}

export class AIModelError extends InventoryBaseError {
  constructor(modelName: string, operation: string, reason: string) {
    super(
      `AI model error in ${modelName} during ${operation}: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'AI_MODEL_ERROR',
      'HIGH',
      'AI_INTELLIGENCE',
      [
        'Retry the operation',
        'Use historical data patterns',
        'Switch to backup model',
        'Review input data quality',
        'Contact AI support team'
      ],
      {
        modelName,
        operation,
        failureReason: reason,
        backupAvailable: true
      },
      'MEDIUM',
      [
        'Retry operation',
        'Use backup methods',
        'Check data quality',
        'Contact support'
      ],
      [
        'Check model health',
        'Retrain model if needed',
        'Review input data',
        'Implement model monitoring'
      ]
    );
  }
}

// =============== ERROR HANDLER MIDDLEWARE ===============

@Injectable()
export class InventoryErrorHandlerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(InventoryErrorHandlerMiddleware.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Set up error handling for the current request
    const originalJson = res.json;
    
    res.json = function(body: any) {
      if (res.statusCode >= 400) {
        const errorResponse = InventoryErrorHandlerMiddleware.enhanceErrorResponse(
          body,
          req,
          res.statusCode
        );
        return originalJson.call(this, errorResponse);
      }
      return originalJson.call(this, body);
    };

    // Handle unhandled promise rejections
    const handleError = (error: Error) => {
      const enhancedError = this.processInventoryError(error, req);
      this.logError(enhancedError, req);
      this.emitErrorEvent(enhancedError, req);
      
      if (!res.headersSent) {
        const errorResponse = this.buildErrorResponse(enhancedError, req);
        res.status(enhancedError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR)
           .json(errorResponse);
      }
    };

    // Override next to handle errors
    const originalNext = next;
    const enhancedNext = (error?: any) => {
      if (error) {
        handleError(error);
        return;
      }
      originalNext();
    };

    try {
      next = enhancedNext;
      originalNext();
    } catch (error) {
      handleError(error);
    }
  }

  private processInventoryError(error: Error, req: Request): InventoryBaseError {
    // If it's already an InventoryBaseError, return it
    if (error instanceof InventoryBaseError) {
      return error;
    }

    // Process different types of standard errors
    if (error instanceof BadRequestException) {
      return new InventoryValidationError(
        'request',
        req.body,
        error.message,
        'Valid request format'
      );
    }

    if (error instanceof NotFoundException) {
      const resourceMatch = error.message.match(/(\w+)\s+['"]([^'"]+)['"]/);
      if (resourceMatch) {
        return new InventoryNotFoundError(resourceMatch[2], resourceMatch[1].toUpperCase() as any);
      }
      return new InventoryNotFoundError('unknown', 'ITEM');
    }

    if (error instanceof ConflictException) {
      return new StockMovementError(
        'unknown',
        'unknown',
        0,
        error.message
      );
    }

    // Handle database errors
    if (error.name === 'QueryFailedError') {
      return this.processDatabaseError(error as any, req);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return this.processValidationError(error as any, req);
    }

    // Default error processing
    return new InventoryBaseError(
      error.message || 'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'UNKNOWN_ERROR',
      'HIGH',
      'SYSTEM',
      [
        'Try the operation again',
        'Check your input data',
        'Contact support if the issue persists',
        'Review system logs for more details'
      ],
      { originalError: error.name },
      'MEDIUM',
      [
        'Retry the operation',
        'Check input data',
        'Contact support'
      ],
      [
        'Check system logs',
        'Review error patterns',
        'Implement additional monitoring',
        'Update error handling'
      ]
    );
  }

  private processDatabaseError(error: any, req: Request): InventoryBaseError {
    const { code, detail, constraint } = error;

    switch (code) {
      case '23503': // Foreign key violation
        return new InventoryValidationError(
          constraint || 'foreign_key',
          req.body,
          'Referenced entity does not exist',
          'Valid entity ID'
        );

      case '23505': // Unique violation
        return new InventoryValidationError(
          constraint || 'unique_field',
          req.body,
          'Value already exists',
          'Unique value'
        );

      case '23514': // Check constraint violation
        return new InventoryValidationError(
          constraint || 'constraint',
          req.body,
          'Value violates business rule',
          'Valid value according to constraints'
        );

      default:
        return new InventoryBaseError(
          'Database operation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          'DATABASE_ERROR',
          'HIGH',
          'DATABASE',
          [
            'Check data integrity',
            'Verify input values',
            'Contact database administrator',
            'Review database constraints'
          ],
          { code, detail, constraint },
          'HIGH',
          [
            'Check input data',
            'Try again later',
            'Contact support'
          ],
          [
            'Check database health',
            'Review constraints',
            'Optimize queries',
            'Monitor database performance'
          ]
        );
    }
  }

  private processValidationError(error: any, req: Request): InventoryBaseError {
    const validationErrors = error.errors || [];
    const firstError = validationErrors[0] || {};

    return new InventoryValidationError(
      firstError.property || 'unknown',
      firstError.value,
      Object.values(firstError.constraints || {}).join(', '),
      'See API documentation'
    );
  }

  private buildErrorResponse(error: InventoryBaseError, req: Request) {
    const baseResponse = {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        severity: error.severity,
        category: error.category,
        timestamp: error.timestamp.toISOString(),
        systemImpact: error.systemImpact,
        suggestions: error.suggestions,
        userActions: error.userActions,
        adminActions: error.adminActions,
        relatedEntities: error.relatedEntities,
        requestId: req.headers['x-request-id'] || this.generateRequestId(),
        endpoint: req.path,
        method: req.method
      },
      retryable: this.isRetryableError(error),
      documentation: this.getDocumentationLink(error.category),
      supportInfo: this.getSupportInfo(error.severity)
    };

    // Add development details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      (baseResponse.error as any).stack = error.stack;
      (baseResponse.error as any).originalError = error.cause;
    }

    return baseResponse;
  }

  private isRetryableError(error: InventoryBaseError): boolean {
    const retryableCodes = [
      'SUPPLIER_CONNECTIVITY_ERROR',
      'IOT_DEVICE_OFFLINE',
      'QUANTUM_OPTIMIZATION_ERROR',
      'AI_MODEL_ERROR'
    ];
    return retryableCodes.includes(error.errorCode);
  }

  private getDocumentationLink(category: string): string {
    const docLinks = {
      'DATA_VALIDATION': '/docs/api/validation',
      'STOCK_MANAGEMENT': '/docs/inventory/stock-management',
      'LOCATION_MANAGEMENT': '/docs/inventory/location-management',
      'CYCLE_COUNTING': '/docs/inventory/cycle-counting',
      'EXTERNAL_INTEGRATION': '/docs/integrations/suppliers',
      'IOT_MONITORING': '/docs/iot/monitoring',
      'QUANTUM_COMPUTING': '/docs/quantum/optimization',
      'AI_INTELLIGENCE': '/docs/ai/intelligence',
      'STOCK_OPERATIONS': '/docs/inventory/operations',
      'DATA_INTEGRITY': '/docs/data/integrity',
      'DATABASE': '/docs/troubleshooting/database',
      'SYSTEM': '/docs/troubleshooting/system'
    };
    return docLinks[category] || '/docs';
  }

  private getSupportInfo(severity: string): object {
    const supportLevels = {
      'LOW': {
        channel: 'self-service',
        expectedResponse: '24-48 hours',
        escalation: false
      },
      'MEDIUM': {
        channel: 'support-ticket',
        expectedResponse: '4-8 hours',
        escalation: false
      },
      'HIGH': {
        channel: 'priority-support',
        expectedResponse: '1-2 hours',
        escalation: true
      },
      'CRITICAL': {
        channel: 'emergency-support',
        expectedResponse: '15-30 minutes',
        escalation: true
      }
    };
    return supportLevels[severity] || supportLevels['MEDIUM'];
  }

  private logError(error: InventoryBaseError, req: Request): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.errorCode}] ${error.message}`;
    const logContext = {
      errorCode: error.errorCode,
      severity: error.severity,
      category: error.category,
      systemImpact: error.systemImpact,
      endpoint: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      relatedEntities: error.relatedEntities,
      requestId: req.headers['x-request-id']
    };

    switch (logLevel) {
      case 'error':
        this.logger.error(logMessage, error.stack, logContext);
        break;
      case 'warn':
        this.logger.warn(logMessage, logContext);
        break;
      case 'log':
        this.logger.log(logMessage, logContext);
        break;
    }
  }

  private getLogLevel(severity: string): 'error' | 'warn' | 'log' {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warn';
      case 'LOW':
      default:
        return 'log';
    }
  }

  private emitErrorEvent(error: InventoryBaseError, req: Request): void {
    this.eventEmitter.emit('inventory.error.occurred', {
      errorCode: error.errorCode,
      severity: error.severity,
      category: error.category,
      systemImpact: error.systemImpact,
      endpoint: req.path,
      method: req.method,
      timestamp: error.timestamp,
      relatedEntities: error.relatedEntities,
      retryable: this.isRetryableError(error)
    });
  }

  private generateRequestId(): string {
    return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Static method to enhance standard error responses
  static enhanceErrorResponse(body: any, req: Request, statusCode: number) {
    if (!body.error) {
      return body;
    }

    return {
      ...body,
      requestId: req.headers['x-request-id'] || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      method: req.method,
      retryable: statusCode >= 500,
      documentation: '/docs/api',
      supportInfo: {
        channel: statusCode >= 500 ? 'priority-support' : 'support-ticket',
        expectedResponse: statusCode >= 500 ? '1-2 hours' : '4-8 hours'
      }
    };
  }
}

// =============== ERROR FACTORY FOR EASY CREATION ===============

export class InventoryErrorFactory {
  static createNotFound(identifier: string, type: string = 'ITEM'): InventoryNotFoundError {
    return new InventoryNotFoundError(identifier, type as any);
  }

  static createInsufficientStock(
    sku: string,
    requested: number,
    available: number,
    locationId?: string
  ): InsufficientStockError {
    return new InsufficientStockError(sku, requested, available, locationId);
  }

  static createValidationError(
    field: string,
    value: any,
    rule: string,
    expectedFormat?: string
  ): InventoryValidationError {
    return new InventoryValidationError(field, value, rule, expectedFormat);
  }

  static createStockMovementError(
    itemId: string,
    movementType: string,
    quantity: number,
    reason: string
  ): StockMovementError {
    return new StockMovementError(itemId, movementType, quantity, reason);
  }

  static createLocationCapacityError(
    locationId: string,
    current: number,
    max: number,
    attempted: number
  ): LocationCapacityError {
    return new LocationCapacityError(locationId, current, max, attempted);
  }

  static createCycleCountDiscrepancy(
    itemId: string,
    systemCount: number,
    physicalCount: number,
    tolerance: number
  ): CycleCountDiscrepancyError {
    return new CycleCountDiscrepancyError(itemId, systemCount, physicalCount, tolerance);
  }

  static createSupplierConnectivityError(
    supplierId: string,
    operation: string
  ): SupplierConnectivityError {
    return new SupplierConnectivityError(supplierId, operation);
  }

  static createIoTDeviceError(
    deviceId: string,
    errorType: 'OFFLINE' | 'SENSOR_MALFUNCTION' | 'DATA_CORRUPTION' | 'CALIBRATION_REQUIRED'
  ): IoTDeviceError {
    return new IoTDeviceError(deviceId, errorType);
  }

  static createQuantumOptimizationError(
    optimizationType: string,
    reason: string
  ): QuantumOptimizationError {
    return new QuantumOptimizationError(optimizationType, reason);
  }

  static createAIModelError(
    modelName: string,
    operation: string,
    reason: string
  ): AIModelError {
    return new AIModelError(modelName, operation, reason);
  }
}
