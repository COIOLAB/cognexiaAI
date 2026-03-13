/**
 * Manufacturing Module - Advanced Error Handling Middleware
 * Industry 5.0 ERP - Manufacturing Operations Error Management
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

export interface ManufacturingErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
    requestId: string;
    module: 'MANUFACTURING';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  metadata: {
    version: '2.0.0';
    environment: string;
    workCenter?: string;
    productionLine?: string;
  };
}

@Injectable()
export class ManufacturingErrorHandlingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ManufacturingErrorHandlingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = this.generateRequestId();
    req.headers['x-manufacturing-request-id'] = requestId;

    // Enhanced error handling for manufacturing operations
    const originalSend = res.json;
    res.json = function (body: any) {
      if (body && body.error) {
        const errorResponse = this.transformManufacturingError(body.error, req, requestId);
        return originalSend.call(this, errorResponse);
      }
      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  private generateRequestId(): string {
    return `mfg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformManufacturingError(error: any, req: Request, requestId: string): ManufacturingErrorResponse {
    let code = 'MANUFACTURING_UNKNOWN_ERROR';
    let message = 'An unknown manufacturing error occurred';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let details = null;

    // Manufacturing-specific error handling
    if (error.code) {
      switch (error.code) {
        // Production Order Errors
        case 'PRODUCTION_ORDER_NOT_FOUND':
          code = 'PRODUCTION_ORDER_NOT_FOUND';
          message = 'Production order not found';
          severity = 'HIGH';
          httpStatus = HttpStatus.NOT_FOUND;
          break;
        
        case 'INVALID_PRODUCTION_SCHEDULE':
          code = 'INVALID_PRODUCTION_SCHEDULE';
          message = 'Production schedule validation failed';
          severity = 'HIGH';
          httpStatus = HttpStatus.BAD_REQUEST;
          break;

        // Work Center Errors
        case 'WORK_CENTER_OFFLINE':
          code = 'WORK_CENTER_OFFLINE';
          message = 'Work center is currently offline';
          severity = 'CRITICAL';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        case 'WORK_CENTER_CAPACITY_EXCEEDED':
          code = 'WORK_CENTER_CAPACITY_EXCEEDED';
          message = 'Work center capacity has been exceeded';
          severity = 'HIGH';
          httpStatus = HttpStatus.CONFLICT;
          break;

        // Quality Control Errors
        case 'QUALITY_CHECK_FAILED':
          code = 'QUALITY_CHECK_FAILED';
          message = 'Quality control check failed';
          severity = 'CRITICAL';
          httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
          details = {
            qualityMetrics: error.qualityMetrics,
            thresholds: error.thresholds,
          };
          break;

        // Material Errors
        case 'INSUFFICIENT_MATERIALS':
          code = 'INSUFFICIENT_MATERIALS';
          message = 'Insufficient materials for production';
          severity = 'HIGH';
          httpStatus = HttpStatus.CONFLICT;
          details = {
            requiredMaterials: error.requiredMaterials,
            availableMaterials: error.availableMaterials,
          };
          break;

        case 'MATERIAL_EXPIRED':
          code = 'MATERIAL_EXPIRED';
          message = 'Material has expired and cannot be used';
          severity = 'MEDIUM';
          httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
          break;

        // Equipment Errors
        case 'EQUIPMENT_MALFUNCTION':
          code = 'EQUIPMENT_MALFUNCTION';
          message = 'Equipment malfunction detected';
          severity = 'CRITICAL';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          details = {
            equipmentId: error.equipmentId,
            malfunctionType: error.malfunctionType,
            diagnostics: error.diagnostics,
          };
          break;

        case 'MAINTENANCE_REQUIRED':
          code = 'MAINTENANCE_REQUIRED';
          message = 'Equipment maintenance is required';
          severity = 'HIGH';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        // IoT and Sensor Errors
        case 'SENSOR_DATA_INVALID':
          code = 'SENSOR_DATA_INVALID';
          message = 'Invalid sensor data received';
          severity = 'MEDIUM';
          httpStatus = HttpStatus.BAD_REQUEST;
          break;

        case 'IOT_CONNECTION_LOST':
          code = 'IOT_CONNECTION_LOST';
          message = 'IoT device connection lost';
          severity = 'HIGH';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        // Safety Errors
        case 'SAFETY_VIOLATION':
          code = 'SAFETY_VIOLATION';
          message = 'Safety protocol violation detected';
          severity = 'CRITICAL';
          httpStatus = HttpStatus.FORBIDDEN;
          details = {
            violationType: error.violationType,
            location: error.location,
            timestamp: error.timestamp,
          };
          break;

        // Process Errors
        case 'PROCESS_DEVIATION':
          code = 'PROCESS_DEVIATION';
          message = 'Manufacturing process deviation detected';
          severity = 'HIGH';
          httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
          details = {
            processId: error.processId,
            expectedValues: error.expectedValues,
            actualValues: error.actualValues,
          };
          break;

        // Digital Twin Errors
        case 'DIGITAL_TWIN_SYNC_FAILED':
          code = 'DIGITAL_TWIN_SYNC_FAILED';
          message = 'Digital twin synchronization failed';
          severity = 'MEDIUM';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        // AI/ML Errors
        case 'AI_PREDICTION_FAILED':
          code = 'AI_PREDICTION_FAILED';
          message = 'AI prediction model failed';
          severity = 'MEDIUM';
          httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        default:
          code = error.code;
          message = error.message || message;
      }
    }

    // Handle TypeORM errors
    if (error instanceof QueryFailedError) {
      code = 'MANUFACTURING_DATABASE_ERROR';
      message = 'Manufacturing database operation failed';
      severity = 'HIGH';
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      details = {
        constraint: error.driverError?.constraint,
        table: error.driverError?.table,
      };
    }

    // Log error with manufacturing context
    this.logger.error(`Manufacturing Error: ${code} - ${message}`, {
      requestId,
      path: req.path,
      method: req.method,
      error: error.stack || error,
      details,
      severity,
      workCenter: req.headers['x-work-center'],
      productionLine: req.headers['x-production-line'],
    });

    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId,
        module: 'MANUFACTURING',
        severity,
      },
      metadata: {
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        workCenter: req.headers['x-work-center'] as string,
        productionLine: req.headers['x-production-line'] as string,
      },
    };
  }
}

/**
 * Manufacturing Exception Classes
 */
export class ManufacturingException extends HttpException {
  constructor(
    message: string, 
    code: string, 
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ) {
    super({ message, code, severity }, status);
  }
}

export class ProductionOrderNotFoundException extends ManufacturingException {
  constructor(orderId: string) {
    super(
      `Production order ${orderId} not found`, 
      'PRODUCTION_ORDER_NOT_FOUND', 
      HttpStatus.NOT_FOUND,
      'HIGH'
    );
  }
}

export class WorkCenterOfflineException extends ManufacturingException {
  constructor(workCenterId: string) {
    super(
      `Work center ${workCenterId} is offline`, 
      'WORK_CENTER_OFFLINE', 
      HttpStatus.SERVICE_UNAVAILABLE,
      'CRITICAL'
    );
  }
}

export class QualityCheckFailedException extends ManufacturingException {
  constructor(checkId: string, failureReason: string) {
    super(
      `Quality check ${checkId} failed: ${failureReason}`, 
      'QUALITY_CHECK_FAILED', 
      HttpStatus.UNPROCESSABLE_ENTITY,
      'CRITICAL'
    );
  }
}

export class InsufficientMaterialsException extends ManufacturingException {
  constructor(materialId: string, required: number, available: number) {
    super(
      `Insufficient materials: ${materialId} (required: ${required}, available: ${available})`, 
      'INSUFFICIENT_MATERIALS', 
      HttpStatus.CONFLICT,
      'HIGH'
    );
  }
}

export class EquipmentMalfunctionException extends ManufacturingException {
  constructor(equipmentId: string, malfunctionType: string) {
    super(
      `Equipment malfunction: ${equipmentId} - ${malfunctionType}`, 
      'EQUIPMENT_MALFUNCTION', 
      HttpStatus.SERVICE_UNAVAILABLE,
      'CRITICAL'
    );
  }
}

export class SafetyViolationException extends ManufacturingException {
  constructor(violationType: string, location: string) {
    super(
      `Safety violation: ${violationType} at ${location}`, 
      'SAFETY_VIOLATION', 
      HttpStatus.FORBIDDEN,
      'CRITICAL'
    );
  }
}

/**
 * Manufacturing Success Response Helper
 */
export interface ManufacturingSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: {
    module: 'MANUFACTURING';
    version: '2.0.0';
    timestamp: string;
    requestId?: string;
    workCenter?: string;
    productionLine?: string;
    performanceMetrics?: {
      processingTime: number;
      efficiency: number;
      qualityScore: number;
    };
  };
}

export function createManufacturingSuccessResponse<T>(
  data: T, 
  requestId?: string,
  performanceMetrics?: {
    processingTime: number;
    efficiency: number;
    qualityScore: number;
  }
): ManufacturingSuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      module: 'MANUFACTURING',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      requestId,
      performanceMetrics,
    },
  };
}
