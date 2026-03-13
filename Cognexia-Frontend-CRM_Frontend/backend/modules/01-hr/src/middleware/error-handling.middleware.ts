/**
 * HR Module - Comprehensive Error Handling Middleware
 * Industry 5.0 ERP - Advanced Error Management System
 */

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
    requestId: string;
  };
  metadata: {
    module: 'HR';
    version: '1.0.0';
    environment: string;
  };
}

@Injectable()
export class HRErrorHandlingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HRErrorHandlingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Add request ID for tracking
    const requestId = this.generateRequestId();
    req.headers['x-request-id'] = requestId;

    // Override the default error handler
    const originalSend = res.json;
    res.json = function (body: any) {
      if (body && body.error) {
        // Transform error to standardized format
        const errorResponse = this.transformError(body.error, req, requestId);
        return originalSend.call(this, errorResponse);
      }
      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  private generateRequestId(): string {
    return `hr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformError(error: any, req: Request, requestId: string): ErrorResponse {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unknown error occurred';
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let details = null;

    // Handle different types of errors
    if (error instanceof QueryFailedError) {
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
      httpStatus = HttpStatus.BAD_REQUEST;
      details = {
        query: error.query,
        parameters: error.parameters,
        driverError: error.driverError?.message,
      };
    } else if (error instanceof EntityNotFoundError) {
      code = 'ENTITY_NOT_FOUND';
      message = 'Requested entity not found';
      httpStatus = HttpStatus.NOT_FOUND;
      details = {
        criteria: error.criteria,
      };
    } else if (error instanceof CannotCreateEntityIdMapError) {
      code = 'ENTITY_CREATION_ERROR';
      message = 'Cannot create entity identifier map';
      httpStatus = HttpStatus.BAD_REQUEST;
    } else if (error instanceof HttpException) {
      code = error.name;
      message = error.message;
      httpStatus = error.getStatus();
      details = error.getResponse();
    } else if (error.code) {
      // Handle custom application errors
      switch (error.code) {
        case 'EMPLOYEE_NOT_FOUND':
          code = 'EMPLOYEE_NOT_FOUND';
          message = 'Employee record not found';
          httpStatus = HttpStatus.NOT_FOUND;
          break;
        case 'INVALID_PAYROLL_DATA':
          code = 'INVALID_PAYROLL_DATA';
          message = 'Payroll data validation failed';
          httpStatus = HttpStatus.BAD_REQUEST;
          break;
        case 'COMPENSATION_CALCULATION_ERROR':
          code = 'COMPENSATION_CALCULATION_ERROR';
          message = 'Error calculating employee compensation';
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        case 'PERFORMANCE_REVIEW_LOCKED':
          code = 'PERFORMANCE_REVIEW_LOCKED';
          message = 'Performance review is locked and cannot be modified';
          httpStatus = HttpStatus.FORBIDDEN;
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          code = 'INSUFFICIENT_PERMISSIONS';
          message = 'Insufficient permissions to perform this action';
          httpStatus = HttpStatus.FORBIDDEN;
          break;
        case 'QUANTUM_SECURITY_VIOLATION':
          code = 'QUANTUM_SECURITY_VIOLATION';
          message = 'Quantum security protocols violated';
          httpStatus = HttpStatus.FORBIDDEN;
          break;
        default:
          code = error.code;
          message = error.message || message;
      }
    }

    // Log the error
    this.logger.error(`HR Module Error: ${code} - ${message}`, {
      requestId,
      path: req.path,
      method: req.method,
      error: error.stack || error,
      details,
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
      },
      metadata: {
        module: 'HR',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }
}

/**
 * Custom HR Exception Classes
 */
export class HRException extends HttpException {
  constructor(message: string, code: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ message, code }, status);
  }
}

export class EmployeeNotFoundException extends HRException {
  constructor(employeeId: string) {
    super(`Employee with ID ${employeeId} not found`, 'EMPLOYEE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

export class InvalidPayrollDataException extends HRException {
  constructor(errors: string[]) {
    super(`Payroll data validation failed: ${errors.join(', ')}`, 'INVALID_PAYROLL_DATA');
  }
}

export class CompensationCalculationException extends HRException {
  constructor(error: string) {
    super(`Compensation calculation failed: ${error}`, 'COMPENSATION_CALCULATION_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class PerformanceReviewLockedException extends HRException {
  constructor(reviewId: string) {
    super(`Performance review ${reviewId} is locked`, 'PERFORMANCE_REVIEW_LOCKED', HttpStatus.FORBIDDEN);
  }
}

export class InsufficientPermissionsException extends HRException {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`, 'INSUFFICIENT_PERMISSIONS', HttpStatus.FORBIDDEN);
  }
}

export class QuantumSecurityViolationException extends HRException {
  constructor(violation: string) {
    super(`Quantum security violation: ${violation}`, 'QUANTUM_SECURITY_VIOLATION', HttpStatus.FORBIDDEN);
  }
}

/**
 * Success Response Helper
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: {
    module: 'HR';
    version: '1.0.0';
    timestamp: string;
    requestId?: string;
  };
}

export function createSuccessResponse<T>(data: T, requestId?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      module: 'HR',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}
