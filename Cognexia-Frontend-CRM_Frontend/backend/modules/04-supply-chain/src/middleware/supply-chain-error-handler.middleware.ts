/**
 * Supply Chain Module - Advanced Error Handling Middleware
 * Industry 5.0 ERP - Supply Chain Management Error Handling
 */

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

export interface SupplyChainErrorContext {
  supplierId?: string;
  warehouseId?: string;
  shipmentId?: string;
  inventoryItemId?: string;
  orderId?: string;
  userId?: string;
  operation?: string;
  timestamp: Date;
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SupplyChainErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'SECURITY' | 'INTEGRATION' | 'LOGISTICS' | 'INVENTORY';
    timestamp: Date;
    requestId: string;
    context?: SupplyChainErrorContext;
    suggestions?: string[];
    documentation?: string;
  };
}

// Custom Supply Chain Exception Classes
export class SupplierNotFoundError extends Error {
  constructor(supplierId: string) {
    super(`Supplier with ID ${supplierId} not found`);
    this.name = 'SupplierNotFoundError';
  }
}

export class WarehouseCapacityExceededError extends Error {
  constructor(warehouseId: string, currentCapacity: number, maxCapacity: number) {
    super(`Warehouse ${warehouseId} capacity exceeded: ${currentCapacity}/${maxCapacity}`);
    this.name = 'WarehouseCapacityExceededError';
  }
}

export class InsufficientInventoryError extends Error {
  constructor(itemId: string, requested: number, available: number) {
    super(`Insufficient inventory for item ${itemId}: requested ${requested}, available ${available}`);
    this.name = 'InsufficientInventoryError';
  }
}

export class ShipmentTrackingError extends Error {
  constructor(shipmentId: string, reason: string) {
    super(`Shipment tracking failed for ${shipmentId}: ${reason}`);
    this.name = 'ShipmentTrackingError';
  }
}

export class SupplierComplianceViolationError extends Error {
  constructor(supplierId: string, violation: string) {
    super(`Supplier ${supplierId} compliance violation: ${violation}`);
    this.name = 'SupplierComplianceViolationError';
  }
}

export class LogisticsRouteOptimizationError extends Error {
  constructor(routeId: string, reason: string) {
    super(`Route optimization failed for ${routeId}: ${reason}`);
    this.name = 'LogisticsRouteOptimizationError';
  }
}

export class InventoryReorderError extends Error {
  constructor(itemId: string, currentStock: number, reorderPoint: number) {
    super(`Item ${itemId} below reorder point: ${currentStock} < ${reorderPoint}`);
    this.name = 'InventoryReorderError';
  }
}

export class DemandForecastingError extends Error {
  constructor(itemId: string, error: string) {
    super(`Demand forecasting failed for item ${itemId}: ${error}`);
    this.name = 'DemandForecastingError';
  }
}

export class BlockchainTraceabilityError extends Error {
  constructor(transactionId: string, error: string) {
    super(`Blockchain traceability failed for transaction ${transactionId}: ${error}`);
    this.name = 'BlockchainTraceabilityError';
  }
}

export class IoTSensorError extends Error {
  constructor(sensorId: string, error: string) {
    super(`IoT sensor ${sensorId} error: ${error}`);
    this.name = 'IoTSensorError';
  }
}

export class SupplyChainRiskError extends Error {
  constructor(riskType: string, severity: string, description: string) {
    super(`Supply chain risk detected - ${riskType} (${severity}): ${description}`);
    this.name = 'SupplyChainRiskError';
  }
}

export class LogisticsCapacityError extends Error {
  constructor(carrierName: string, requestedCapacity: number, availableCapacity: number) {
    super(`Logistics capacity exceeded for ${carrierName}: requested ${requestedCapacity}, available ${availableCapacity}`);
    this.name = 'LogisticsCapacityError';
  }
}

export class WarehouseOperationError extends Error {
  constructor(operation: string, warehouseId: string, error: string) {
    super(`Warehouse operation '${operation}' failed at ${warehouseId}: ${error}`);
    this.name = 'WarehouseOperationError';
  }
}

export class SupplyChainIntegrationError extends Error {
  constructor(system: string, operation: string, error: string) {
    super(`Integration with ${system} failed during ${operation}: ${error}`);
    this.name = 'SupplyChainIntegrationError';
  }
}

@Injectable()
export class SupplyChainErrorHandlerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SupplyChainErrorHandlerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Add request ID to request for tracking
    req['requestId'] = requestId;
    
    // Capture original end function
    const originalEnd = res.end;
    
    // Override end function to capture response details
    res.end = function(chunk?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log successful requests
      if (res.statusCode < 400) {
        console.log(`Supply Chain Request completed: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - RequestId: ${requestId}`);
      }
      
      originalEnd.call(this, chunk);
    };

    next();
  }

  private generateRequestId(): string {
    return `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

@Injectable()
export class SupplyChainGlobalErrorHandler {
  private readonly logger = new Logger(SupplyChainGlobalErrorHandler.name);

  handleError(error: any, context: Partial<SupplyChainErrorContext> = {}): SupplyChainErrorResponse {
    const timestamp = new Date();
    const requestId = context.requestId || this.generateRequestId();
    
    const errorContext: SupplyChainErrorContext = {
      timestamp,
      requestId,
      ...context,
    };

    let errorResponse: SupplyChainErrorResponse;

    // Handle specific Supply Chain errors
    if (error instanceof SupplierNotFoundError) {
      errorResponse = this.createErrorResponse(
        'SUPPLIER_NOT_FOUND',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.NOT_FOUND,
        errorContext,
        ['Verify supplier ID', 'Check if supplier was recently deactivated', 'Use supplier search to find active suppliers'],
        '/api/docs/suppliers#supplier-not-found'
      );
    } else if (error instanceof WarehouseCapacityExceededError) {
      errorResponse = this.createErrorResponse(
        'WAREHOUSE_CAPACITY_EXCEEDED',
        error.message,
        'HIGH',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Use alternative warehouse', 'Optimize current warehouse layout', 'Increase warehouse capacity'],
        '/api/docs/warehouse#capacity-management'
      );
    } else if (error instanceof InsufficientInventoryError) {
      errorResponse = this.createErrorResponse(
        'INSUFFICIENT_INVENTORY',
        error.message,
        'HIGH',
        'INVENTORY',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Check alternative suppliers', 'Adjust order quantity', 'Review reorder points'],
        '/api/docs/inventory#stock-management'
      );
    } else if (error instanceof ShipmentTrackingError) {
      errorResponse = this.createErrorResponse(
        'SHIPMENT_TRACKING_ERROR',
        error.message,
        'MEDIUM',
        'LOGISTICS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Verify shipment ID', 'Check carrier system status', 'Contact logistics provider'],
        '/api/docs/logistics#tracking-issues'
      );
    } else if (error instanceof SupplierComplianceViolationError) {
      errorResponse = this.createErrorResponse(
        'SUPPLIER_COMPLIANCE_VIOLATION',
        error.message,
        'CRITICAL',
        'SECURITY',
        HttpStatus.FORBIDDEN,
        errorContext,
        ['Review supplier compliance requirements', 'Contact supplier for corrective action', 'Consider alternative suppliers'],
        '/api/docs/compliance#supplier-violations'
      );
    } else if (error instanceof LogisticsRouteOptimizationError) {
      errorResponse = this.createErrorResponse(
        'ROUTE_OPTIMIZATION_FAILED',
        error.message,
        'MEDIUM',
        'LOGISTICS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Use manual route planning', 'Check route constraints', 'Verify optimization parameters'],
        '/api/docs/logistics#route-optimization'
      );
    } else if (error instanceof InventoryReorderError) {
      errorResponse = this.createErrorResponse(
        'INVENTORY_REORDER_ALERT',
        error.message,
        'HIGH',
        'INVENTORY',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Create purchase order immediately', 'Check supplier availability', 'Consider safety stock adjustments'],
        '/api/docs/inventory#reorder-management'
      );
    } else if (error instanceof DemandForecastingError) {
      errorResponse = this.createErrorResponse(
        'DEMAND_FORECASTING_ERROR',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Use historical averages', 'Check data quality', 'Adjust forecasting parameters'],
        '/api/docs/planning#demand-forecasting'
      );
    } else if (error instanceof BlockchainTraceabilityError) {
      errorResponse = this.createErrorResponse(
        'BLOCKCHAIN_TRACEABILITY_ERROR',
        error.message,
        'HIGH',
        'INTEGRATION',
        HttpStatus.SERVICE_UNAVAILABLE,
        errorContext,
        ['Check blockchain network status', 'Use alternative traceability methods', 'Contact blockchain provider'],
        '/api/docs/blockchain#traceability-issues'
      );
    } else if (error instanceof IoTSensorError) {
      errorResponse = this.createErrorResponse(
        'IOT_SENSOR_ERROR',
        error.message,
        'MEDIUM',
        'INTEGRATION',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Check sensor connectivity', 'Calibrate sensor', 'Use backup sensors'],
        '/api/docs/iot#sensor-troubleshooting'
      );
    } else if (error instanceof SupplyChainRiskError) {
      errorResponse = this.createErrorResponse(
        'SUPPLY_CHAIN_RISK_DETECTED',
        error.message,
        'CRITICAL',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Activate contingency plans', 'Review risk mitigation strategies', 'Contact risk management team'],
        '/api/docs/risk#risk-management'
      );
    } else if (error instanceof LogisticsCapacityError) {
      errorResponse = this.createErrorResponse(
        'LOGISTICS_CAPACITY_EXCEEDED',
        error.message,
        'HIGH',
        'LOGISTICS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Use alternative carriers', 'Split shipments', 'Adjust delivery schedules'],
        '/api/docs/logistics#capacity-management'
      );
    } else if (error instanceof WarehouseOperationError) {
      errorResponse = this.createErrorResponse(
        'WAREHOUSE_OPERATION_ERROR',
        error.message,
        'HIGH',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Check warehouse system status', 'Verify operation parameters', 'Contact warehouse management'],
        '/api/docs/warehouse#operation-errors'
      );
    } else if (error instanceof SupplyChainIntegrationError) {
      errorResponse = this.createErrorResponse(
        'INTEGRATION_ERROR',
        error.message,
        'HIGH',
        'INTEGRATION',
        HttpStatus.SERVICE_UNAVAILABLE,
        errorContext,
        ['Check system connectivity', 'Verify API credentials', 'Use manual processes as backup'],
        '/api/docs/integration#system-integration'
      );
    }
    // Handle TypeORM database errors
    else if (error instanceof QueryFailedError) {
      if (error.message.includes('duplicate key')) {
        errorResponse = this.createErrorResponse(
          'DUPLICATE_RECORD',
          'Record with this information already exists',
          'MEDIUM',
          'VALIDATION',
          HttpStatus.CONFLICT,
          errorContext,
          ['Check for existing records', 'Use unique identifiers', 'Update existing record instead'],
          '/api/docs/database#duplicate-records'
        );
      } else if (error.message.includes('foreign key constraint')) {
        errorResponse = this.createErrorResponse(
          'FOREIGN_KEY_CONSTRAINT',
          'Referenced record does not exist',
          'MEDIUM',
          'VALIDATION',
          HttpStatus.BAD_REQUEST,
          errorContext,
          ['Verify referenced record exists', 'Create referenced record first', 'Check relationship constraints'],
          '/api/docs/database#foreign-keys'
        );
      } else {
        errorResponse = this.createErrorResponse(
          'DATABASE_ERROR',
          'Database operation failed',
          'HIGH',
          'SYSTEM',
          HttpStatus.INTERNAL_SERVER_ERROR,
          errorContext,
          ['Check database connectivity', 'Verify data format', 'Contact system administrator'],
          '/api/docs/database#error-handling'
        );
      }
    } else if (error instanceof EntityNotFoundError) {
      errorResponse = this.createErrorResponse(
        'ENTITY_NOT_FOUND',
        'Requested record not found',
        'MEDIUM',
        'BUSINESS',
        HttpStatus.NOT_FOUND,
        errorContext,
        ['Verify record ID', 'Check if record was deleted', 'Use search to find similar records'],
        '/api/docs/entities#not-found'
      );
    }
    // Handle HTTP exceptions
    else if (error instanceof HttpException) {
      errorResponse = this.createErrorResponse(
        'HTTP_EXCEPTION',
        error.message,
        'MEDIUM',
        'SYSTEM',
        error.getStatus(),
        errorContext,
        ['Check request format', 'Verify required parameters', 'Review API documentation'],
        '/api/docs/errors#http-exceptions'
      );
    }
    // Handle validation errors
    else if (error.name === 'ValidationError') {
      errorResponse = this.createErrorResponse(
        'VALIDATION_ERROR',
        'Input validation failed',
        'LOW',
        'VALIDATION',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Check input format', 'Verify required fields', 'Review validation rules'],
        '/api/docs/validation#error-handling'
      );
    }
    // Handle generic errors
    else {
      errorResponse = this.createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred in supply chain operations',
        'CRITICAL',
        'SYSTEM',
        HttpStatus.INTERNAL_SERVER_ERROR,
        errorContext,
        ['Try again later', 'Contact support if issue persists', 'Check system status'],
        '/api/docs/errors#internal-errors'
      );
    }

    // Log error with context
    this.logError(error, errorResponse);

    return errorResponse;
  }

  private createErrorResponse(
    code: string,
    message: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    category: 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'SECURITY' | 'INTEGRATION' | 'LOGISTICS' | 'INVENTORY',
    httpStatus: number,
    context: SupplyChainErrorContext,
    suggestions: string[] = [],
    documentation?: string
  ): SupplyChainErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        severity,
        category,
        timestamp: context.timestamp,
        requestId: context.requestId,
        context,
        suggestions,
        documentation,
      },
    };
  }

  private logError(originalError: any, errorResponse: SupplyChainErrorResponse): void {
    const { error } = errorResponse;
    
    const logContext = {
      errorCode: error.code,
      severity: error.severity,
      category: error.category,
      requestId: error.requestId,
      supplierId: error.context?.supplierId,
      warehouseId: error.context?.warehouseId,
      operation: error.context?.operation,
      timestamp: error.timestamp,
      originalMessage: originalError.message,
      stack: originalError.stack,
    };

    // Log based on severity
    switch (error.severity) {
      case 'CRITICAL':
        this.logger.error(`CRITICAL SUPPLY CHAIN ERROR: ${error.message}`, originalError.stack, logContext);
        break;
      case 'HIGH':
        this.logger.error(`HIGH SEVERITY SUPPLY CHAIN ERROR: ${error.message}`, logContext);
        break;
      case 'MEDIUM':
        this.logger.warn(`MEDIUM SEVERITY SUPPLY CHAIN ERROR: ${error.message}`, logContext);
        break;
      case 'LOW':
        this.logger.log(`LOW SEVERITY SUPPLY CHAIN ERROR: ${error.message}`, logContext);
        break;
    }

    // Additional logging for critical supply chain events
    if (error.category === 'LOGISTICS' || error.category === 'INVENTORY') {
      this.logger.warn(`SUPPLY CHAIN OPERATIONAL ISSUE: ${error.message}`, logContext);
    }

    // Additional logging for security and compliance errors
    if (error.category === 'SECURITY') {
      this.logger.error(`SECURITY VIOLATION in Supply Chain: ${error.message}`, {
        ...logContext,
        userAgent: error.context?.userAgent,
        ipAddress: error.context?.ipAddress,
      });
    }
  }

  private generateRequestId(): string {
    return `sc-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Success Response Helper
export class SupplyChainSuccessResponse {
  static create<T>(data: T, message?: string, metadata?: any) {
    return {
      success: true,
      message: message || 'Supply chain operation completed successfully',
      data,
      metadata: {
        timestamp: new Date(),
        ...metadata,
      },
    };
  }

  static createWithPagination<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ) {
    return {
      success: true,
      message: message || 'Supply chain data retrieved successfully',
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      metadata: {
        timestamp: new Date(),
      },
    };
  }
}
