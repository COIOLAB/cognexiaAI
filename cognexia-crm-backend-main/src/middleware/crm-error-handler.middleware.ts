/**
 * CRM Module - Advanced Error Handling Middleware
 * Industry 5.0 ERP - Customer Relationship Management Error Management
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

export interface CRMErrorContext {
  customerId?: string;
  leadId?: string;
  opportunityId?: string;
  accountId?: string;
  userId?: string;
  operation?: string;
  timestamp: Date;
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CRMErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'SECURITY' | 'INTEGRATION';
    timestamp: Date;
    requestId: string;
    context?: CRMErrorContext;
    suggestions?: string[];
    documentation?: string;
  };
}

// Custom CRM Exception Classes
export class CustomerNotFoundError extends Error {
  constructor(customerId: string) {
    super(`Customer with ID ${customerId} not found`);
    this.name = 'CustomerNotFoundError';
  }
}

export class LeadNotFoundError extends Error {
  constructor(leadId: string) {
    super(`Lead with ID ${leadId} not found`);
    this.name = 'LeadNotFoundError';
  }
}

export class OpportunityNotFoundError extends Error {
  constructor(opportunityId: string) {
    super(`Opportunity with ID ${opportunityId} not found`);
    this.name = 'OpportunityNotFoundError';
  }
}

export class InvalidSalesStageError extends Error {
  constructor(stage: string) {
    super(`Invalid sales stage: ${stage}`);
    this.name = 'InvalidSalesStageError';
  }
}

export class DuplicateCustomerError extends Error {
  constructor(email: string) {
    super(`Customer with email ${email} already exists`);
    this.name = 'DuplicateCustomerError';
  }
}

export class InvalidLeadScoreError extends Error {
  constructor(score: number) {
    super(`Invalid lead score: ${score}. Must be between 0 and 100`);
    this.name = 'InvalidLeadScoreError';
  }
}

export class SalesQuotaExceededError extends Error {
  constructor(limit: number) {
    super(`Sales quota exceeded. Maximum allowed: ${limit}`);
    this.name = 'SalesQuotaExceededError';
  }
}

export class CustomerSegmentationError extends Error {
  constructor(criteria: string) {
    super(`Customer segmentation failed for criteria: ${criteria}`);
    this.name = 'CustomerSegmentationError';
  }
}

export class AIModelNotAvailableError extends Error {
  constructor(modelName: string) {
    super(`AI model '${modelName}' is not available or failed to initialize`);
    this.name = 'AIModelNotAvailableError';
  }
}

export class QuantumComputingError extends Error {
  constructor(operation: string) {
    super(`Quantum computing operation failed: ${operation}`);
    this.name = 'QuantumComputingError';
  }
}

export class ARVRSessionError extends Error {
  constructor(sessionId: string, reason: string) {
    super(`AR/VR session ${sessionId} failed: ${reason}`);
    this.name = 'ARVRSessionError';
  }
}

export class CustomerEngagementError extends Error {
  constructor(customerId: string, channel: string) {
    super(`Customer engagement failed for customer ${customerId} on channel ${channel}`);
    this.name = 'CustomerEngagementError';
  }
}

export class SecurityComplianceError extends Error {
  constructor(rule: string) {
    super(`Security compliance violation: ${rule}`);
    this.name = 'SecurityComplianceError';
  }
}

export class CustomerDataPrivacyError extends Error {
  constructor(customerId: string, violation: string) {
    super(`Customer data privacy violation for ${customerId}: ${violation}`);
    this.name = 'CustomerDataPrivacyError';
  }
}

@Injectable()
export class CRMErrorHandlerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CRMErrorHandlerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Add request ID to request for tracking
    req['requestId'] = requestId;
    
    // Capture original end function
    const originalEnd = res.end;
    
    // Override end function to capture response details
    (res.end as any) = function(chunk?: any, encoding?: BufferEncoding, cb?: (() => void)) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log successful requests
      if (res.statusCode < 400) {
        console.log(`CRM Request completed: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - RequestId: ${requestId}`);
      }
      
      return originalEnd.call(this, chunk, encoding as any, cb);
    };

    next();
  }

  private generateRequestId(): string {
    return `crm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

@Injectable()
export class CRMGlobalErrorHandler {
  private readonly logger = new Logger(CRMGlobalErrorHandler.name);

  handleError(error: any, context: Partial<CRMErrorContext> = {}): CRMErrorResponse {
    const timestamp = new Date();
    const requestId = context.requestId || this.generateRequestId();
    
    const errorContext: CRMErrorContext = {
      timestamp,
      requestId,
      ...context,
    };

    let errorResponse: CRMErrorResponse;

    // Handle specific CRM errors
    if (error instanceof CustomerNotFoundError) {
      errorResponse = this.createErrorResponse(
        'CUSTOMER_NOT_FOUND',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.NOT_FOUND,
        errorContext,
        ['Verify customer ID', 'Check if customer was recently deleted', 'Use customer search to find similar records'],
        '/api/docs/customers#customer-not-found'
      );
    } else if (error instanceof LeadNotFoundError) {
      errorResponse = this.createErrorResponse(
        'LEAD_NOT_FOUND',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.NOT_FOUND,
        errorContext,
        ['Verify lead ID', 'Check lead conversion status', 'Search for similar leads'],
        '/api/docs/leads#lead-not-found'
      );
    } else if (error instanceof OpportunityNotFoundError) {
      errorResponse = this.createErrorResponse(
        'OPPORTUNITY_NOT_FOUND',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.NOT_FOUND,
        errorContext,
        ['Verify opportunity ID', 'Check if opportunity was closed', 'Review opportunity pipeline'],
        '/api/docs/opportunities#opportunity-not-found'
      );
    } else if (error instanceof InvalidSalesStageError) {
      errorResponse = this.createErrorResponse(
        'INVALID_SALES_STAGE',
        error.message,
        'MEDIUM',
        'VALIDATION',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Use valid sales stages: PROSPECTING, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST', 'Check sales process configuration'],
        '/api/docs/sales#sales-stages'
      );
    } else if (error instanceof DuplicateCustomerError) {
      errorResponse = this.createErrorResponse(
        'DUPLICATE_CUSTOMER',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.CONFLICT,
        errorContext,
        ['Use unique email addresses', 'Update existing customer instead', 'Check for data deduplication'],
        '/api/docs/customers#duplicate-prevention'
      );
    } else if (error instanceof InvalidLeadScoreError) {
      errorResponse = this.createErrorResponse(
        'INVALID_LEAD_SCORE',
        error.message,
        'LOW',
        'VALIDATION',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Lead scores must be between 0 and 100', 'Use decimal values for precision', 'Consider lead scoring methodology'],
        '/api/docs/leads#lead-scoring'
      );
    } else if (error instanceof SalesQuotaExceededError) {
      errorResponse = this.createErrorResponse(
        'SALES_QUOTA_EXCEEDED',
        error.message,
        'HIGH',
        'BUSINESS',
        HttpStatus.FORBIDDEN,
        errorContext,
        ['Request quota increase', 'Review current quota usage', 'Contact sales administrator'],
        '/api/docs/sales#quota-management'
      );
    } else if (error instanceof CustomerSegmentationError) {
      errorResponse = this.createErrorResponse(
        'CUSTOMER_SEGMENTATION_FAILED',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Review segmentation criteria', 'Check customer data completeness', 'Use valid segmentation attributes'],
        '/api/docs/customers#segmentation'
      );
    } else if (error instanceof AIModelNotAvailableError) {
      errorResponse = this.createErrorResponse(
        'AI_MODEL_UNAVAILABLE',
        error.message,
        'HIGH',
        'SYSTEM',
        HttpStatus.SERVICE_UNAVAILABLE,
        errorContext,
        ['Check AI service status', 'Use fallback methods', 'Contact system administrator'],
        '/api/docs/ai#model-availability'
      );
    } else if (error instanceof QuantumComputingError) {
      errorResponse = this.createErrorResponse(
        'QUANTUM_COMPUTING_ERROR',
        error.message,
        'HIGH',
        'SYSTEM',
        HttpStatus.SERVICE_UNAVAILABLE,
        errorContext,
        ['Quantum computing service is experimental', 'Use classical algorithms as fallback', 'Check quantum service status'],
        '/api/docs/quantum#error-handling'
      );
    } else if (error instanceof ARVRSessionError) {
      errorResponse = this.createErrorResponse(
        'ARVR_SESSION_ERROR',
        error.message,
        'MEDIUM',
        'SYSTEM',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Check AR/VR device compatibility', 'Ensure stable internet connection', 'Update AR/VR software'],
        '/api/docs/arvr#session-management'
      );
    } else if (error instanceof CustomerEngagementError) {
      errorResponse = this.createErrorResponse(
        'CUSTOMER_ENGAGEMENT_ERROR',
        error.message,
        'MEDIUM',
        'BUSINESS',
        HttpStatus.BAD_REQUEST,
        errorContext,
        ['Verify customer contact preferences', 'Check communication channel status', 'Review engagement rules'],
        '/api/docs/engagement#channel-errors'
      );
    } else if (error instanceof SecurityComplianceError) {
      errorResponse = this.createErrorResponse(
        'SECURITY_COMPLIANCE_VIOLATION',
        error.message,
        'CRITICAL',
        'SECURITY',
        HttpStatus.FORBIDDEN,
        errorContext,
        ['Review security policies', 'Check user permissions', 'Contact security team'],
        '/api/docs/security#compliance'
      );
    } else if (error instanceof CustomerDataPrivacyError) {
      errorResponse = this.createErrorResponse(
        'CUSTOMER_DATA_PRIVACY_VIOLATION',
        error.message,
        'CRITICAL',
        'SECURITY',
        HttpStatus.FORBIDDEN,
        errorContext,
        ['Review data privacy policies', 'Check customer consent', 'Contact privacy officer'],
        '/api/docs/privacy#data-protection'
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
        'An unexpected error occurred',
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
    category: 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'SECURITY' | 'INTEGRATION',
    httpStatus: number,
    context: CRMErrorContext,
    suggestions: string[] = [],
    documentation?: string
  ): CRMErrorResponse {
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

  private logError(originalError: any, errorResponse: CRMErrorResponse): void {
    const { error } = errorResponse;
    
    const logContext = {
      errorCode: error.code,
      severity: error.severity,
      category: error.category,
      requestId: error.requestId,
      customerId: error.context?.customerId,
      operation: error.context?.operation,
      timestamp: error.timestamp,
      originalMessage: originalError.message,
      stack: originalError.stack,
    };

    // Log based on severity
    switch (error.severity) {
      case 'CRITICAL':
        this.logger.error(`CRITICAL CRM ERROR: ${error.message}`, originalError.stack, logContext);
        break;
      case 'HIGH':
        this.logger.error(`HIGH SEVERITY CRM ERROR: ${error.message}`, logContext);
        break;
      case 'MEDIUM':
        this.logger.warn(`MEDIUM SEVERITY CRM ERROR: ${error.message}`, logContext);
        break;
      case 'LOW':
        this.logger.log(`LOW SEVERITY CRM ERROR: ${error.message}`, logContext);
        break;
    }

    // Additional logging for security and compliance errors
    if (error.category === 'SECURITY') {
      this.logger.error(`SECURITY VIOLATION in CRM: ${error.message}`, {
        ...logContext,
        userAgent: error.context?.userAgent,
        ipAddress: error.context?.ipAddress,
      });
    }

    // Additional logging for business critical errors
    if (error.severity === 'CRITICAL' && error.category === 'BUSINESS') {
      this.logger.error(`BUSINESS CRITICAL ERROR in CRM: ${error.message}`, logContext);
    }
  }

  private generateRequestId(): string {
    return `crm-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Success Response Helper
export class CRMSuccessResponse {
  static create<T>(data: T, message?: string, metadata?: any) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
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
      message: message || 'Data retrieved successfully',
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
