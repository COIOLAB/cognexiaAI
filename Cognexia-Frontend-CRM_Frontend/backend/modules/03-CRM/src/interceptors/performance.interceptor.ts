import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Performance Monitoring Interceptor
 * 
 * Tracks and logs:
 * - Request execution time
 * - Slow requests (configurable threshold)
 * - Memory usage
 * - Request patterns
 */

export interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  memoryBefore: number;
  memoryAfter: number;
  statusCode?: number;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly slowRequestThreshold = 1000; // 1 second
  private requestMetrics: PerformanceMetrics[] = [];
  private readonly maxMetricsSize = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url, path } = request;
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    return next.handle().pipe(
      tap({
        next: () => {
          this.logPerformance(
            method,
            path || url,
            startTime,
            startMemory,
            response.statusCode,
          );
        },
        error: () => {
          this.logPerformance(
            method,
            path || url,
            startTime,
            startMemory,
            response.statusCode || 500,
          );
        },
      }),
    );
  }

  private logPerformance(
    method: string,
    path: string,
    startTime: number,
    startMemory: number,
    statusCode: number,
  ): void {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    const metrics: PerformanceMetrics = {
      path,
      method,
      duration,
      timestamp: new Date(),
      memoryBefore: startMemory,
      memoryAfter: endMemory,
      statusCode,
    };

    // Store metrics
    this.requestMetrics.push(metrics);
    if (this.requestMetrics.length > this.maxMetricsSize) {
      this.requestMetrics.shift();
    }

    // Log slow requests
    if (duration > this.slowRequestThreshold) {
      this.logger.warn(
        `Slow request: ${method} ${path} - ${duration}ms (memory: ${this.formatBytes(memoryDelta)})`,
      );
    } else if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `${method} ${path} - ${duration}ms`,
      );
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.requestMetrics];
  }

  /**
   * Get slow requests
   */
  getSlowRequests(): PerformanceMetrics[] {
    return this.requestMetrics.filter(m => m.duration > this.slowRequestThreshold);
  }

  /**
   * Get average response time by path
   */
  getAverageResponseTime(): Map<string, { avg: number; count: number }> {
    const pathStats = new Map<string, { total: number; count: number }>();

    this.requestMetrics.forEach(metric => {
      const stats = pathStats.get(metric.path) || { total: 0, count: 0 };
      stats.total += metric.duration;
      stats.count += 1;
      pathStats.set(metric.path, stats);
    });

    const result = new Map<string, { avg: number; count: number }>();
    pathStats.forEach((stats, path) => {
      result.set(path, {
        avg: Math.round(stats.total / stats.count),
        count: stats.count,
      });
    });

    return result;
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.requestMetrics = [];
    this.logger.log('Performance metrics cleared');
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    const sign = bytes < 0 ? '-' : '';
    return sign + parseFloat((Math.abs(bytes) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
