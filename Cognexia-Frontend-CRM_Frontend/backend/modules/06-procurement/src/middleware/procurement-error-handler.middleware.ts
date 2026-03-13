/**
 * Procurement Error Handling Middleware
 * Industry 5.0 ERP - Comprehensive Error Management
 * 
 * Advanced error handling with custom exceptions, detailed error responses,
 * audit logging, and intelligent error recovery suggestions.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

// Custom Exception Classes
export class ProcurementException extends HttpException {
  public readonly errorCode: string;
  public readonly details: any;
  public readonly suggestions: string[];
  public readonly context: any;

  constructor(
    message: string,
    errorCode: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
    suggestions?: string[],
    context?: any
  ) {
    super(message, status);
    this.errorCode = errorCode;
    this.details = details || {};
    this.suggestions = suggestions || [];
    this.context = context || {};
  }
}

// Specific Procurement Exceptions
export class RFQNotFoundException extends ProcurementException {
  constructor(rfqId: string) {
    super(
      `RFQ with ID '${rfqId}' not found`,
      'RFQ_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { rfqId },
      [
        'Verify the RFQ ID is correct',
        'Check if the RFQ has been deleted or archived',
        'Contact system administrator if the issue persists'
      ]
    );
  }
}

export class BudgetInsufficientException extends ProcurementException {
  constructor(requestedAmount: number, availableAmount: number, currency: string = 'USD') {
    super(
      `Insufficient budget: Requested ${currency} ${requestedAmount.toLocaleString()}, Available ${currency} ${availableAmount.toLocaleString()}`,
      'INSUFFICIENT_BUDGET',
      HttpStatus.PAYMENT_REQUIRED,
      { requestedAmount, availableAmount, currency, shortfall: requestedAmount - availableAmount },
      [
        'Request budget approval from department manager',
        'Reduce the requested amount to fit within available budget',
        'Split the request across multiple budget periods',
        'Consider alternative suppliers with lower costs'
      ]
    );
  }
}

export class SupplierNotQualifiedException extends ProcurementException {
  constructor(supplierId: string, missingQualifications: string[]) {
    super(
      `Supplier '${supplierId}' does not meet qualification requirements`,
      'SUPPLIER_NOT_QUALIFIED',
      HttpStatus.UNPROCESSABLE_ENTITY,
      { supplierId, missingQualifications },
      [
        'Complete supplier onboarding process',
        'Provide required certifications and documentation',
        'Contact procurement team for alternative suppliers',
        'Update supplier profile with current qualifications'
      ]
    );
  }
}

export class RFQDeadlineExpiredException extends ProcurementException {
  constructor(rfqId: string, deadline: Date) {
    super(
      `RFQ '${rfqId}' deadline has expired on ${deadline.toDateString()}`,
      'RFQ_DEADLINE_EXPIRED',
      HttpStatus.GONE,
      { rfqId, deadline, daysExpired: Math.floor((Date.now() - deadline.getTime()) / (1000 * 60 * 60 * 24)) },
      [
        'Create an amendment to extend the deadline',
        'Create a new RFQ with updated timeline',
        'Contact legal team for deadline extension options',
        'Review and update procurement timeline planning'
      ]
    );
  }
}

export class ContractStatusInvalidException extends ProcurementException {
  constructor(contractId: string, currentStatus: string, requiredStatus: string[]) {
    super(
      `Contract '${contractId}' status '${currentStatus}' is invalid for this operation. Required status: ${requiredStatus.join(' or ')}`,
      'CONTRACT_INVALID_STATUS',
      HttpStatus.CONFLICT,
      { contractId, currentStatus, requiredStatus },
      [
        `Update contract status to one of: ${requiredStatus.join(', ')}`,
        'Complete pending contract requirements',
        'Contact legal team for status validation',
        'Review contract workflow for proper sequence'
      ]
    );
  }
}

export class ApprovalWorkflowException extends ProcurementException {
  constructor(requestId: string, currentStage: string, issue: string) {
    super(
      `Approval workflow error for '${requestId}' at stage '${currentStage}': ${issue}`,
      'APPROVAL_WORKFLOW_ERROR',
      HttpStatus.CONFLICT,
      { requestId, currentStage, issue },
      [
        'Contact the assigned approver to complete their review',
        'Escalate to the next approval level if urgent',
        'Update request information if additional details are needed',
        'Review approval workflow configuration'
      ]
    );
  }
}

export class VendorComplianceException extends ProcurementException {
  constructor(vendorId: string, complianceIssues: string[]) {
    super(
      `Vendor '${vendorId}' has compliance violations: ${complianceIssues.join(', ')}`,
      'VENDOR_COMPLIANCE_VIOLATION',
      HttpStatus.FORBIDDEN,
      { vendorId, complianceIssues },
      [
        'Review vendor compliance documentation',
        'Request updated certifications from vendor',
        'Suspend vendor until compliance is restored',
        'Contact compliance team for resolution guidance'
      ]
    );
  }
}

export class ProcurementValidationException extends ProcurementException {
  constructor(field: string, value: any, validationRules: string[]) {
    super(
      `Validation failed for field '${field}' with value '${value}'`,
      'PROCUREMENT_VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
      { field, value, validationRules },
      [
        `Ensure '${field}' meets the following requirements: ${validationRules.join(', ')}`,
        'Review the field format and acceptable values',
        'Contact system administrator for validation rule clarification'
      ]
    );
  }
}

export class AIServiceUnavailableException extends ProcurementException {
  constructor(serviceName: string, operation: string) {
    super(
      `AI service '${serviceName}' is unavailable for operation '${operation}'`,
      'AI_SERVICE_UNAVAILABLE',
      HttpStatus.SERVICE_UNAVAILABLE,
      { serviceName, operation },
      [
        'Continue with manual processing',
        'Retry the operation after a few minutes',
        'Contact technical support if the issue persists',
        'Review fallback procedures for this operation'
      ]
    );
  }
}

export class BlockchainIntegrationException extends ProcurementException {
  constructor(operation: string, transactionId?: string) {
    super(
      `Blockchain integration failed for operation '${operation}'${transactionId ? ` (Transaction ID: ${transactionId})` : ''}`,
      'BLOCKCHAIN_INTEGRATION_ERROR',
      HttpStatus.BAD_GATEWAY,
      { operation, transactionId },
      [
        'The operation completed but blockchain recording failed',
        'Manual verification may be required',
        'Contact blockchain administrator',
        'Review transaction logs for details'
      ]
    );
  }
}

// Error Response Interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: any;
    suggestions: string[];
    timestamp: string;
    path: string;
    method: string;
    requestId: string;
    userId?: string;
    correlationId?: string;
  };
  meta: {
    version: string;
    environment: string;
    service: string;
    module: string;
  };
}

@Injectable()
@Catch()
export class ProcurementErrorHandlerMiddleware implements ExceptionFilter {
  private readonly logger = new Logger(ProcurementErrorHandlerMiddleware.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate correlation ID for tracking
    const correlationId = this.generateCorrelationId();
    const requestId = (request as any).requestId || this.generateRequestId();

    let errorResponse: ErrorResponse;

    if (exception instanceof ProcurementException) {
      errorResponse = this.handleProcurementException(exception, request, correlationId, requestId);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, request, correlationId, requestId);
    } else {
      errorResponse = this.handleUnknownException(exception, request, correlationId, requestId);
    }

    // Log error based on severity
    this.logError(errorResponse, exception);

    // Emit error event for monitoring and analytics
    this.emitErrorEvent(errorResponse, exception, request);

    // Send response
    response.status(this.getHttpStatus(exception)).json(errorResponse);
  }

  private handleProcurementException(
    exception: ProcurementException,
    request: Request,
    correlationId: string,
    requestId: string
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code: exception.errorCode,
        message: exception.message,
        details: exception.details,
        suggestions: exception.suggestions,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId,
        userId: this.extractUserId(request),
        correlationId
      },
      meta: {
        version: this.configService.get('APP_VERSION', '1.0.0'),
        environment: this.configService.get('NODE_ENV', 'development'),
        service: 'procurement-service',
        module: 'procurement'
      }
    };
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    correlationId: string,
    requestId: string
  ): ErrorResponse {
    const response = exception.getResponse();
    const errorDetails = typeof response === 'object' ? response : { message: response };

    return {
      success: false,
      error: {
        code: this.mapHttpStatusToErrorCode(exception.getStatus()),
        message: exception.message,
        details: errorDetails,
        suggestions: this.generateSuggestionsForHttpError(exception.getStatus()),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId,
        userId: this.extractUserId(request),
        correlationId
      },
      meta: {
        version: this.configService.get('APP_VERSION', '1.0.0'),
        environment: this.configService.get('NODE_ENV', 'development'),
        service: 'procurement-service',
        module: 'procurement'
      }
    };
  }

  private handleUnknownException(
    exception: unknown,
    request: Request,
    correlationId: string,
    requestId: string
  ): ErrorResponse {
    const message = exception instanceof Error ? exception.message : 'An unexpected error occurred';
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: this.configService.get('NODE_ENV') === 'production' 
          ? 'An internal server error occurred' 
          : message,
        details: this.configService.get('NODE_ENV') === 'production' 
          ? {} 
          : { stack: exception instanceof Error ? exception.stack : String(exception) },
        suggestions: [
          'Please try again in a few moments',
          'If the problem persists, contact technical support',
          'Provide the correlation ID when reporting this issue'
        ],
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId,
        userId: this.extractUserId(request),
        correlationId
      },
      meta: {
        version: this.configService.get('APP_VERSION', '1.0.0'),
        environment: this.configService.get('NODE_ENV', 'development'),
        service: 'procurement-service',
        module: 'procurement'
      }
    };
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logError(errorResponse: ErrorResponse, exception: unknown): void {
    const { error } = errorResponse;
    const logContext = {
      errorCode: error.code,
      correlationId: error.correlationId,
      requestId: error.requestId,
      userId: error.userId,
      path: error.path,
      method: error.method
    };

    // Log based on error severity
    if (this.isCriticalError(error.code)) {
      this.logger.error(
        `CRITICAL ERROR: ${error.message}`,
        exception instanceof Error ? exception.stack : String(exception),
        logContext
      );
    } else if (this.isWarningLevel(error.code)) {
      this.logger.warn(`WARNING: ${error.message}`, logContext);
    } else {
      this.logger.debug(`INFO: ${error.message}`, logContext);
    }
  }

  private emitErrorEvent(errorResponse: ErrorResponse, exception: unknown, request: Request): void {
    const eventData = {
      errorResponse,
      exception: {
        name: exception instanceof Error ? exception.constructor.name : 'UnknownException',
        message: exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params
      },
      user: this.extractUserInfo(request),
      timestamp: new Date().toISOString()
    };

    // Emit different events based on error type
    if (this.isCriticalError(errorResponse.error.code)) {
      this.eventEmitter.emit('procurement.error.critical', eventData);
    } else if (this.isBusinessError(errorResponse.error.code)) {
      this.eventEmitter.emit('procurement.error.business', eventData);
    } else {
      this.eventEmitter.emit('procurement.error.technical', eventData);
    }

    // General error event for monitoring
    this.eventEmitter.emit('procurement.error', eventData);
  }

  private mapHttpStatusToErrorCode(status: number): string {
    const statusMap: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      406: 'NOT_ACCEPTABLE',
      408: 'REQUEST_TIMEOUT',
      409: 'CONFLICT',
      410: 'GONE',
      411: 'LENGTH_REQUIRED',
      412: 'PRECONDITION_FAILED',
      413: 'PAYLOAD_TOO_LARGE',
      414: 'URI_TOO_LONG',
      415: 'UNSUPPORTED_MEDIA_TYPE',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      501: 'NOT_IMPLEMENTED',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    };

    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  private generateSuggestionsForHttpError(status: number): string[] {
    const suggestionMap: { [key: number]: string[] } = {
      400: [
        'Check the request format and required parameters',
        'Ensure all field values meet validation requirements',
        'Review the API documentation for correct usage'
      ],
      401: [
        'Provide valid authentication credentials',
        'Check if your session has expired',
        'Contact administrator for access permissions'
      ],
      403: [
        'Verify you have the required permissions',
        'Contact administrator to request access',
        'Check role-based access controls'
      ],
      404: [
        'Verify the requested resource exists',
        'Check the URL path and parameters',
        'Ensure the resource has not been deleted'
      ],
      409: [
        'Check for conflicting resource states',
        'Refresh data and try again',
        'Review business rule constraints'
      ],
      422: [
        'Review data validation requirements',
        'Check field formats and acceptable values',
        'Ensure all required fields are provided'
      ],
      429: [
        'Reduce request frequency',
        'Wait before retrying the operation',
        'Contact administrator about rate limits'
      ],
      500: [
        'Try the operation again',
        'Contact technical support if issue persists',
        'Provide error details when reporting'
      ],
      503: [
        'Service is temporarily unavailable',
        'Try again after a few minutes',
        'Check system status page'
      ]
    };

    return suggestionMap[status] || [
      'Try the operation again',
      'Contact technical support if the issue persists'
    ];
  }

  private isCriticalError(errorCode: string): boolean {
    const criticalErrors = [
      'INTERNAL_SERVER_ERROR',
      'DATABASE_CONNECTION_ERROR',
      'BLOCKCHAIN_INTEGRATION_ERROR',
      'AI_SERVICE_UNAVAILABLE',
      'SERVICE_UNAVAILABLE'
    ];
    return criticalErrors.includes(errorCode);
  }

  private isWarningLevel(errorCode: string): boolean {
    const warningErrors = [
      'INSUFFICIENT_BUDGET',
      'RFQ_DEADLINE_EXPIRED',
      'SUPPLIER_NOT_QUALIFIED',
      'VENDOR_COMPLIANCE_VIOLATION',
      'CONTRACT_INVALID_STATUS'
    ];
    return warningErrors.includes(errorCode);
  }

  private isBusinessError(errorCode: string): boolean {
    const businessErrors = [
      'RFQ_NOT_FOUND',
      'INSUFFICIENT_BUDGET',
      'SUPPLIER_NOT_QUALIFIED',
      'RFQ_DEADLINE_EXPIRED',
      'CONTRACT_INVALID_STATUS',
      'APPROVAL_WORKFLOW_ERROR',
      'VENDOR_COMPLIANCE_VIOLATION'
    ];
    return businessErrors.includes(errorCode);
  }

  private extractUserId(request: Request): string | undefined {
    // Extract user ID from JWT token or session
    const user = (request as any).user;
    return user?.id || user?.sub || undefined;
  }

  private extractUserInfo(request: Request): any {
    const user = (request as any).user;
    if (!user) return undefined;

    return {
      id: user.id || user.sub,
      email: user.email,
      role: user.role,
      department: user.department
    };
  }

  private generateCorrelationId(): string {
    return `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Error Factory Helper Class
@Injectable()
export class ProcurementErrorFactory {
  static rfqNotFound(rfqId: string): RFQNotFoundException {
    return new RFQNotFoundException(rfqId);
  }

  static insufficientBudget(requested: number, available: number, currency?: string): BudgetInsufficientException {
    return new BudgetInsufficientException(requested, available, currency);
  }

  static supplierNotQualified(supplierId: string, missingQualifications: string[]): SupplierNotQualifiedException {
    return new SupplierNotQualifiedException(supplierId, missingQualifications);
  }

  static rfqDeadlineExpired(rfqId: string, deadline: Date): RFQDeadlineExpiredException {
    return new RFQDeadlineExpiredException(rfqId, deadline);
  }

  static contractInvalidStatus(contractId: string, current: string, required: string[]): ContractStatusInvalidException {
    return new ContractStatusInvalidException(contractId, current, required);
  }

  static approvalWorkflowError(requestId: string, stage: string, issue: string): ApprovalWorkflowException {
    return new ApprovalWorkflowException(requestId, stage, issue);
  }

  static vendorComplianceViolation(vendorId: string, issues: string[]): VendorComplianceException {
    return new VendorComplianceException(vendorId, issues);
  }

  static validationError(field: string, value: any, rules: string[]): ProcurementValidationException {
    return new ProcurementValidationException(field, value, rules);
  }

  static aiServiceUnavailable(service: string, operation: string): AIServiceUnavailableException {
    return new AIServiceUnavailableException(service, operation);
  }

  static blockchainError(operation: string, txId?: string): BlockchainIntegrationException {
    return new BlockchainIntegrationException(operation, txId);
  }
}

// Validation Pipe with Custom Error Handling
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ProcurementValidationPipe extends ValidationPipe {
  protected flattenValidationErrors(validationErrors: ValidationError[]): string[] {
    const errors: string[] = [];
    
    validationErrors.forEach(error => {
      if (error.constraints) {
        Object.values(error.constraints).forEach(constraint => {
          errors.push(`${error.property}: ${constraint}`);
        });
      }
      
      if (error.children && error.children.length > 0) {
        errors.push(...this.flattenValidationErrors(error.children));
      }
    });
    
    return errors;
  }

  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const errors = this.flattenValidationErrors(validationErrors);
      const firstError = validationErrors[0];
      
      throw new ProcurementValidationException(
        firstError?.property || 'unknown',
        firstError?.value,
        errors
      );
    };
  }
}
