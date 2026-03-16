/**
 * Audit Middleware - Financial Transaction Auditing
 * 
 * Comprehensive audit middleware for capturing and logging
 * all financial transactions and user activities for
 * compliance and security monitoring.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const user = req['user'];

    // Log request
    this.logger.log({
      type: 'REQUEST',
      method,
      url: originalUrl,
      ip,
      userAgent,
      userId: user?.userId || user?.id,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    });

    // Capture response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      this.logger.log({
        type: 'RESPONSE',
        method,
        url: originalUrl,
        statusCode,
        duration,
        ip,
        userId: user?.userId || user?.id,
        timestamp: new Date().toISOString(),
      });

      // Log financial operations specifically
      if (this.isFinancialOperation(originalUrl)) {
        this.logFinancialActivity(req, res, duration);
      }
    });

    next();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isFinancialOperation(url: string): boolean {
    const financialPaths = [
      '/journal-entries',
      '/invoices',
      '/payments',
      '/budgets',
      '/reports',
      '/transactions',
    ];
    
    return financialPaths.some(path => url.includes(path));
  }

  private logFinancialActivity(req: Request, res: Response, duration: number) {
    const user = req['user'];
    
    this.logger.log({
      type: 'FINANCIAL_ACTIVITY',
      operation: req.method,
      endpoint: req.originalUrl,
      userId: user?.userId || user?.id,
      userRole: user?.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      duration,
      requestBody: this.sanitizeRequestBody(req.body),
      timestamp: new Date().toISOString(),
    });
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    // Remove sensitive information
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'pin'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
