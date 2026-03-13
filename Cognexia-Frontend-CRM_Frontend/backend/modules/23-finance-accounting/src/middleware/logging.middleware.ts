/**
 * Logging Middleware - Request/Response Logging
 * 
 * Comprehensive logging middleware for capturing
 * HTTP requests, responses, and performance metrics
 * for monitoring and debugging.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    // Generate unique request ID
    const requestId = this.generateRequestId();
    req['requestId'] = requestId;

    this.logger.log(`Incoming ${method} ${originalUrl} - ID: ${requestId}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      const logLevel = statusCode >= 400 ? 'error' : 'log';
      const message = `${method} ${originalUrl} ${statusCode} ${contentLength || 0}b - ${duration}ms - ID: ${requestId}`;

      this.logger[logLevel](message, {
        method,
        url: originalUrl,
        statusCode,
        contentLength: contentLength || 0,
        duration,
        ip,
        userAgent,
        requestId,
        timestamp: new Date().toISOString(),
      });

      // Log slow requests
      if (duration > 1000) {
        this.logger.warn(`Slow request detected: ${message}`, {
          duration,
          threshold: 1000,
          requestId,
        });
      }
    });

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
