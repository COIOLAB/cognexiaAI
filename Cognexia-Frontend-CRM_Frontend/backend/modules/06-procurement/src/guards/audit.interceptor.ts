// Industry 5.0 ERP Backend - Procurement Module
// Audit Interceptor - Comprehensive automatic audit logging
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ProcurementUser } from '../strategies/jwt.strategy';
import { AuditLoggingService } from '../services/audit-logging.service';

export interface AuditConfig {
  enabled?: boolean;
  level?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  maskSensitiveData?: boolean;
  sensitiveFields?: string[];
  requiresApproval?: boolean;
  trackDataAccess?: boolean;
  customTags?: string[];
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  // Default sensitive fields to mask in logs
  private readonly defaultSensitiveFields = [
    'password',
    'secret',
    'apiKey',
    'token',
    'ssn',
    'creditCard',
    'bankAccount',
    'signature',
    'privateKey',
    'wallet',
    'pin',
    'cvv',
  ];

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditLoggingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const user = request.user as ProcurementUser;

    // Get audit configuration from metadata
    const auditConfig = this.reflector.get<AuditConfig>('auditConfig', context.getHandler()) || 
                       { enabled: true, level: 'BASIC' };

    if (!auditConfig.enabled) {
      return next.handle();
    }

    const startTime = Date.now();
    const endpoint = `${request.method} ${request.url}`;
    const controllerClass = context.getClass().name;
    const handlerName = context.getHandler().name;

    // Extract operation details
    const operationContext = this.extractOperationContext(request, auditConfig);

    // Log request start
    this.logger.debug(`Audit: Request started - ${endpoint} by ${user?.email || 'anonymous'}`);

    return next.handle().pipe(
      tap((responseData) => {
        // Log successful operation
        this.logSuccessfulOperation(
          request,
          response,
          responseData,
          user,
          auditConfig,
          operationContext,
          startTime,
          controllerClass,
          handlerName
        );
      }),
      catchError((error) => {
        // Log failed operation
        this.logFailedOperation(
          request,
          response,
          error,
          user,
          auditConfig,
          operationContext,
          startTime,
          controllerClass,
          handlerName
        );
        throw error;
      })
    );
  }

  private async logSuccessfulOperation(
    request: Request,
    response: Response,
    responseData: any,
    user: ProcurementUser | undefined,
    config: AuditConfig,
    operationContext: any,
    startTime: number,
    controllerClass: string,
    handlerName: string
  ): Promise<void> {
    try {
      const duration = Date.now() - startTime;
      const action = this.determineAuditAction(request.method, handlerName);

      const auditEntry = {
        entityType: operationContext.entityType || 'UNKNOWN',
        entityId: operationContext.entityId || 'bulk',
        action: this.mapToAuditAction(action),
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers['user-agent'],
        details: this.buildAuditDetails(request, responseData, config, operationContext, duration),
        severity: this.mapToAuditSeverity(this.determineSeverity(action, operationContext)),
        tags: this.buildAuditTags(config, controllerClass, handlerName, operationContext),
      };

      await this.auditService.logAction(auditEntry);

      // Log high-impact operations
      if (operationContext.isHighImpact) {
        this.logger.warn(
          `High-impact operation completed: ${action} by ${user?.email} - ` +
          `Entity: ${operationContext.entityType}:${operationContext.entityId}`
        );
      }

      // Log performance warnings
      if (duration > 5000) { // 5 seconds
        this.logger.warn(
          `Slow operation detected: ${request.method} ${request.url} took ${duration}ms`
        );
      }
    } catch (error) {
      this.logger.error('Failed to log successful operation audit', error.stack);
    }
  }

  private async logFailedOperation(
    request: Request,
    response: Response,
    error: any,
    user: ProcurementUser | undefined,
    config: AuditConfig,
    operationContext: any,
    startTime: number,
    controllerClass: string,
    handlerName: string
  ): Promise<void> {
    try {
      const duration = Date.now() - startTime;
      const action = this.determineAuditAction(request.method, handlerName);

      const auditEntry = {
        entityType: operationContext.entityType || 'UNKNOWN',
        entityId: operationContext.entityId || 'error',
        action: this.mapToAuditAction(action),
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers['user-agent'],
        details: {
          ...this.buildAuditDetails(request, null, config, operationContext, duration),
          error: {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode || 500,
            stack: config.level === 'COMPREHENSIVE' ? error.stack : undefined,
          },
          success: false,
        },
        severity: this.mapToAuditSeverity('HIGH'),
        tags: [...this.buildAuditTags(config, controllerClass, handlerName, operationContext), 'error'],
      };

      await this.auditService.logAction(auditEntry);

      // Always log errors
      this.logger.error(
        `Operation failed: ${action} by ${user?.email || 'anonymous'} - ` +
        `Error: ${error.message} - Entity: ${operationContext.entityType}:${operationContext.entityId}`
      );
    } catch (auditError) {
      this.logger.error('Failed to log failed operation audit', auditError.stack);
    }
  }

  private extractOperationContext(request: Request, config: AuditConfig): any {
    const body = request.body || {};
    const params = request.params || {};
    const query = request.query || {};

    // Determine entity type from URL pattern
    const entityType = this.extractEntityTypeFromURL(request.url);

    // Determine entity ID from params or body
    const entityId = params.id || body.id || body.vendorId || body.requisitionId || 
                    body.rfqId || body.contractId || params.vendorId || params.requisitionId ||
                    'unknown';

    // Determine if this is a high-impact operation
    const isHighImpact = this.isHighImpactOperation(request, body);

    // Extract financial information
    const financialContext = this.extractFinancialContext(body);

    // Extract data volume information
    const dataContext = this.extractDataContext(body, query);

    return {
      entityType,
      entityId,
      isHighImpact,
      financialContext,
      dataContext,
      httpMethod: request.method,
      endpoint: request.url,
    };
  }

  private extractEntityTypeFromURL(url: string): string {
    if (url.includes('/vendors')) return 'VENDOR';
    if (url.includes('/requisitions')) return 'REQUISITION';
    if (url.includes('/rfq')) return 'RFQ';
    if (url.includes('/bid')) return 'BID';
    if (url.includes('/contract')) return 'CONTRACT';
    if (url.includes('/purchase-order')) return 'PURCHASE_ORDER';
    if (url.includes('/analytics')) return 'ANALYTICS';
    if (url.includes('/blockchain')) return 'BLOCKCHAIN';
    if (url.includes('/ai')) return 'AI_OPERATION';
    return 'PROCUREMENT_GENERAL';
  }

  private isHighImpactOperation(request: Request, body: any): boolean {
    // Financial thresholds
    const highValueThreshold = 100000;
    const totalValue = body.totalAmount || body.totalValue || body.amount || 0;

    // High-impact criteria
    const highImpactConditions = [
      totalValue > highValueThreshold,
      request.method === 'DELETE',
      request.url.includes('/approve'),
      request.url.includes('/reject'),
      request.url.includes('/award'),
      request.url.includes('/blockchain'),
      request.url.includes('/ai'),
      body.requiresApproval === true,
      body.isEmergencyPurchase === true,
      body.isCriticalSupplier === true,
    ];

    return highImpactConditions.some(condition => condition);
  }

  private extractFinancialContext(body: any): any {
    return {
      totalAmount: body.totalAmount || body.totalValue || body.amount,
      currency: body.currency || 'USD',
      budgetCode: body.budgetCode,
      departmentBudget: body.departmentBudget,
      isEmergencyPurchase: body.isEmergencyPurchase,
      paymentTerms: body.paymentTerms,
    };
  }

  private extractDataContext(body: any, query: any): any {
    return {
      recordCount: this.getRecordCount(body),
      dataSize: this.estimateDataSize(body),
      containsPII: body.containsPII,
      dataClassification: body.dataClassification,
      processingLocation: body.processingLocation,
      exportFormat: query.format || body.format,
    };
  }

  private getRecordCount(data: any): number {
    if (Array.isArray(data)) return data.length;
    if (data.items && Array.isArray(data.items)) return data.items.length;
    if (data.lineItems && Array.isArray(data.lineItems)) return data.lineItems.length;
    if (data.vendors && Array.isArray(data.vendors)) return data.vendors.length;
    return 1;
  }

  private estimateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private buildAuditDetails(
    request: Request,
    responseData: any,
    config: AuditConfig,
    operationContext: any,
    duration: number
  ): any {
    const details: any = {
      httpMethod: request.method,
      endpoint: request.url,
      duration,
      timestamp: new Date().toISOString(),
      operationContext,
      success: responseData !== null,
    };

    // Add request body based on configuration
    if (config.logRequestBody && config.level !== 'BASIC') {
      details.requestBody = config.maskSensitiveData ? 
        this.maskSensitiveData(request.body, config.sensitiveFields) : 
        request.body;
    }

    // Add response data based on configuration
    if (config.logResponseBody && config.level === 'COMPREHENSIVE' && responseData) {
      // Only log metadata for large responses
      if (this.estimateDataSize(responseData) > 10000) {
        details.responseMetadata = {
          dataType: typeof responseData,
          recordCount: this.getRecordCount(responseData),
          hasData: !!responseData,
        };
      } else {
        details.responseBody = config.maskSensitiveData ? 
          this.maskSensitiveData(responseData, config.sensitiveFields) : 
          responseData;
      }
    }

    // Add headers if comprehensive logging
    if (config.level === 'COMPREHENSIVE') {
      details.requestHeaders = this.sanitizeHeaders(request.headers);
    }

    return details;
  }

  private maskSensitiveData(data: any, customFields?: string[]): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = [
      ...this.defaultSensitiveFields,
      ...(customFields || [])
    ];

    const masked = JSON.parse(JSON.stringify(data));

    const maskValue = (obj: any, key: string) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '***MASKED***';
      }
    };

    const traverse = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          maskValue(obj, key);
          if (typeof obj[key] === 'object') {
            traverse(obj[key]);
          }
        });
      }
    };

    traverse(masked);
    return masked;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    delete sanitized['x-auth-token'];

    return sanitized;
  }

  private buildAuditTags(
    config: AuditConfig,
    controllerClass: string,
    handlerName: string,
    operationContext: any
  ): string[] {
    const tags = [
      controllerClass.toLowerCase().replace('controller', ''),
      handlerName,
      operationContext.httpMethod.toLowerCase(),
    ];

    // Add entity-specific tags
    if (operationContext.entityType) {
      tags.push(operationContext.entityType.toLowerCase());
    }

    // Add financial tags
    if (operationContext.financialContext?.totalAmount) {
      tags.push('financial');
      if (operationContext.financialContext.totalAmount > 50000) {
        tags.push('high-value');
      }
    }

    // Add data privacy tags
    if (operationContext.dataContext?.containsPII) {
      tags.push('pii');
    }

    if (operationContext.dataContext?.dataClassification) {
      tags.push(`classification-${operationContext.dataContext.dataClassification.toLowerCase()}`);
    }

    // Add high-impact tag
    if (operationContext.isHighImpact) {
      tags.push('high-impact');
    }

    // Add custom tags from configuration
    if (config.customTags) {
      tags.push(...config.customTags);
    }

    return tags;
  }

  private determineAuditAction(httpMethod: string, handlerName: string): any {
    // Map HTTP methods and handler names to audit actions
    if (handlerName.includes('create')) return 'CREATE';
    if (handlerName.includes('update') || handlerName.includes('edit')) return 'UPDATE';
    if (handlerName.includes('delete') || handlerName.includes('remove')) return 'DELETE';
    if (handlerName.includes('approve')) return 'APPROVE';
    if (handlerName.includes('reject')) return 'REJECT';
    if (handlerName.includes('submit')) return 'SUBMIT';
    if (handlerName.includes('cancel')) return 'CANCEL';
    if (handlerName.includes('export')) return 'EXPORT';
    if (handlerName.includes('import')) return 'IMPORT';
    if (handlerName.includes('analyze')) return 'ANALYZE';

    // Default based on HTTP method
    switch (httpMethod.toUpperCase()) {
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      case 'GET': return 'VIEW';
      default: return 'UNKNOWN';
    }
  }

  private determineSeverity(action: string, operationContext: any): string {
    // Critical operations
    if (['DELETE', 'APPROVE', 'REJECT'].includes(action)) {
      return 'HIGH';
    }

    // High-value operations
    if (operationContext.isHighImpact) {
      return 'HIGH';
    }

    // Financial operations
    if (operationContext.financialContext?.totalAmount > 25000) {
      return 'MEDIUM';
    }

    // Data operations
    if (operationContext.dataContext?.containsPII) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private mapToAuditAction(action: string): any {
    // Import the AuditAction enum from the entity
    const { AuditAction } = require('../entities/audit-log.entity');
    
    const actionMap = {
      'CREATE': AuditAction.CREATE,
      'UPDATE': AuditAction.UPDATE,
      'DELETE': AuditAction.DELETE,
      'VIEW': AuditAction.VIEW,
      'APPROVE': AuditAction.APPROVE,
      'REJECT': AuditAction.REJECT,
      'SUBMIT': AuditAction.SUBMIT,
      'CANCEL': AuditAction.CANCEL,
      'EXPORT': AuditAction.EXPORT,
      'IMPORT': AuditAction.IMPORT,
      'ANALYZE': AuditAction.ANALYZE,
    };

    return actionMap[action] || AuditAction.VIEW;
  }

  private mapToAuditSeverity(severity: string): any {
    // Import the AuditSeverity enum from the entity
    const { AuditSeverity } = require('../entities/audit-log.entity');
    
    const severityMap = {
      'LOW': AuditSeverity.LOW,
      'MEDIUM': AuditSeverity.MEDIUM,
      'HIGH': AuditSeverity.HIGH,
      'CRITICAL': AuditSeverity.CRITICAL,
    };

    return severityMap[severity] || AuditSeverity.LOW;
  }

  private getClientIP(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.ip ||
      'unknown'
    ).split(',')[0].trim();
  }
}

// Decorator for configuring audit behavior
export const ConfigureAudit = (config: AuditConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('auditConfig', config, descriptor.value);
    return descriptor;
  };
};

// Pre-configured audit levels
export const BasicAudit = () => ConfigureAudit({
  enabled: true,
  level: 'BASIC',
  logRequestBody: false,
  logResponseBody: false,
  maskSensitiveData: true
});

export const DetailedAudit = () => ConfigureAudit({
  enabled: true,
  level: 'DETAILED',
  logRequestBody: true,
  logResponseBody: false,
  maskSensitiveData: true,
  trackDataAccess: true
});

export const ComprehensiveAudit = () => ConfigureAudit({
  enabled: true,
  level: 'COMPREHENSIVE',
  logRequestBody: true,
  logResponseBody: true,
  maskSensitiveData: true,
  trackDataAccess: true,
  requiresApproval: true
});

export const HighSecurityAudit = () => ConfigureAudit({
  enabled: true,
  level: 'COMPREHENSIVE',
  logRequestBody: true,
  logResponseBody: true,
  maskSensitiveData: true,
  sensitiveFields: ['signature', 'privateKey', 'wallet', 'seed', 'mnemonic'],
  trackDataAccess: true,
  customTags: ['high-security', 'blockchain', 'ai']
});

export const NoAudit = () => ConfigureAudit({
  enabled: false
});
