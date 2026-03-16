import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export interface ManufacturingEndpointLimits {
  // Critical Operations - Strict limits
  emergencyStop: RateLimitConfig;
  productionOrderRelease: RateLimitConfig;
  qualityApproval: RateLimitConfig;
  
  // Production Operations - Moderate limits
  workOrderExecution: RateLimitConfig;
  productionLineControl: RateLimitConfig;
  iotDeviceControl: RateLimitConfig;
  
  // Data Operations - Relaxed limits
  analytics: RateLimitConfig;
  reporting: RateLimitConfig;
  dataExport: RateLimitConfig;
  
  // General Operations
  default: RateLimitConfig;
}

const DEFAULT_MANUFACTURING_LIMITS: ManufacturingEndpointLimits = {
  emergencyStop: {
    windowMs: 60000, // 1 minute
    maxRequests: 5,
    message: 'Too many emergency stop requests. Please wait before trying again.',
  },
  
  productionOrderRelease: {
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    message: 'Too many production order operations. Please wait before trying again.',
  },
  
  qualityApproval: {
    windowMs: 60000, // 1 minute
    maxRequests: 20,
    message: 'Too many quality approval requests. Please wait before trying again.',
  },
  
  workOrderExecution: {
    windowMs: 60000, // 1 minute
    maxRequests: 50,
    message: 'Too many work order operations. Please wait before trying again.',
  },
  
  productionLineControl: {
    windowMs: 60000, // 1 minute
    maxRequests: 30,
    message: 'Too many production line control requests. Please wait before trying again.',
  },
  
  iotDeviceControl: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    message: 'Too many IoT device operations. Please wait before trying again.',
  },
  
  analytics: {
    windowMs: 60000, // 1 minute
    maxRequests: 200,
    message: 'Too many analytics requests. Please wait before trying again.',
  },
  
  reporting: {
    windowMs: 60000, // 1 minute
    maxRequests: 50,
    message: 'Too many report generation requests. Please wait before trying again.',
  },
  
  dataExport: {
    windowMs: 300000, // 5 minutes
    maxRequests: 10,
    message: 'Too many data export requests. Please wait before trying again.',
  },
  
  default: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please wait before trying again.',
  },
};

interface RequestLog {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

@Injectable()
export class ManufacturingRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ManufacturingRateLimitMiddleware.name);
  private readonly requestMap = new Map<string, RequestLog>();
  private readonly limits: ManufacturingEndpointLimits;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    // Load configuration from environment or use defaults
    this.limits = this.loadConfiguration();
    
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const rateLimitConfig = this.getRateLimitConfig(req);
    const key = this.generateKey(req, rateLimitConfig);
    
    const now = Date.now();
    let requestLog = this.requestMap.get(key);

    // Initialize or reset if window has expired
    if (!requestLog || now >= requestLog.resetTime) {
      requestLog = {
        count: 0,
        resetTime: now + rateLimitConfig.windowMs,
      };
    }

    // Check if currently blocked
    if (requestLog.blockedUntil && now < requestLog.blockedUntil) {
      const remainingTime = Math.ceil((requestLog.blockedUntil - now) / 1000);
      this.logger.warn(`Request blocked for ${req.ip} on ${req.path}. Remaining block time: ${remainingTime}s`);
      
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        error: 'Too Many Requests',
        message: rateLimitConfig.message || 'Rate limit exceeded',
        retryAfter: remainingTime,
        limit: rateLimitConfig.maxRequests,
        windowMs: rateLimitConfig.windowMs,
      });
      return;
    }

    // Increment request count
    requestLog.count += 1;

    // Check if limit exceeded
    if (requestLog.count > rateLimitConfig.maxRequests) {
      const blockDuration = this.calculateBlockDuration(requestLog.count, rateLimitConfig.maxRequests);
      requestLog.blockedUntil = now + blockDuration;
      
      this.logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}. Count: ${requestLog.count}/${rateLimitConfig.maxRequests}. Blocked for ${blockDuration/1000}s`);
      
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        error: 'Too Many Requests',
        message: rateLimitConfig.message || 'Rate limit exceeded',
        retryAfter: Math.ceil(blockDuration / 1000),
        limit: rateLimitConfig.maxRequests,
        windowMs: rateLimitConfig.windowMs,
      });
      
      this.requestMap.set(key, requestLog);
      return;
    }

    // Update the map and continue
    this.requestMap.set(key, requestLog);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, rateLimitConfig.maxRequests - requestLog.count).toString(),
      'X-RateLimit-Reset': new Date(requestLog.resetTime).toISOString(),
      'X-RateLimit-Window': rateLimitConfig.windowMs.toString(),
    });

    // Log if approaching limit
    if (requestLog.count > rateLimitConfig.maxRequests * 0.8) {
      this.logger.warn(`Approaching rate limit for ${req.ip} on ${req.path}. Count: ${requestLog.count}/${rateLimitConfig.maxRequests}`);
    }

    next();
  }

  private getRateLimitConfig(req: Request): RateLimitConfig {
    const path = req.path.toLowerCase();
    const method = req.method.toLowerCase();

    // Emergency operations
    if (path.includes('emergency-stop') || path.includes('shutdown')) {
      return this.limits.emergencyStop;
    }

    // Production order operations
    if (path.includes('production-order') && (method === 'post' || method === 'put')) {
      if (path.includes('release') || path.includes('approve') || path.includes('close')) {
        return this.limits.productionOrderRelease;
      }
    }

    // Quality operations
    if (path.includes('quality') && (path.includes('approve') || path.includes('reject'))) {
      return this.limits.qualityApproval;
    }

    // Work order operations
    if (path.includes('work-order') && (method === 'post' || method === 'put')) {
      if (path.includes('execute') || path.includes('complete')) {
        return this.limits.workOrderExecution;
      }
    }

    // Production line control
    if (path.includes('production-line') && method === 'put') {
      if (path.includes('start') || path.includes('stop') || path.includes('control')) {
        return this.limits.productionLineControl;
      }
    }

    // IoT device control
    if (path.includes('iot-device') && method === 'put') {
      if (path.includes('control') || path.includes('configure') || path.includes('calibrate')) {
        return this.limits.iotDeviceControl;
      }
    }

    // Analytics operations
    if (path.includes('analytics') || path.includes('metrics')) {
      return this.limits.analytics;
    }

    // Reporting operations
    if (path.includes('report') || path.includes('dashboard')) {
      return this.limits.reporting;
    }

    // Data export operations
    if (path.includes('export') || (method === 'get' && path.includes('download'))) {
      return this.limits.dataExport;
    }

    // Default rate limiting
    return this.limits.default;
  }

  private generateKey(req: Request, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    // Create a composite key based on IP, user ID, and endpoint pattern
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req['user']?.sub || 'anonymous';
    const endpoint = this.normalizeEndpoint(req.path);
    
    return `manufacturing:${ip}:${userId}:${endpoint}`;
  }

  private normalizeEndpoint(path: string): string {
    // Normalize path by removing IDs and parameters
    return path
      .toLowerCase()
      .replace(/\/[0-9a-f-]{36}/g, '/:id') // Replace UUIDs
      .replace(/\/\d+/g, '/:id') // Replace numeric IDs
      .replace(/\?.*$/, '') // Remove query parameters
      .slice(0, 100); // Limit length
  }

  private calculateBlockDuration(currentCount: number, maxRequests: number): number {
    // Progressive blocking: longer blocks for more severe violations
    const excessFactor = currentCount / maxRequests;
    
    if (excessFactor <= 1.5) {
      return 30000; // 30 seconds
    } else if (excessFactor <= 2) {
      return 60000; // 1 minute
    } else if (excessFactor <= 3) {
      return 180000; // 3 minutes
    } else if (excessFactor <= 5) {
      return 300000; // 5 minutes
    } else {
      return 600000; // 10 minutes
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, requestLog] of this.requestMap.entries()) {
      // Remove expired entries (including those no longer blocked)
      if (now >= requestLog.resetTime && (!requestLog.blockedUntil || now >= requestLog.blockedUntil)) {
        this.requestMap.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  private loadConfiguration(): ManufacturingEndpointLimits {
    // Load from configuration service with fallbacks to defaults
    return {
      emergencyStop: {
        windowMs: this.configService.get('manufacturing.rateLimit.emergencyStop.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.emergencyStop.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.emergencyStop.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.emergencyStop.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.emergencyStop.message') ?? DEFAULT_MANUFACTURING_LIMITS.emergencyStop.message,
      },
      productionOrderRelease: {
        windowMs: this.configService.get('manufacturing.rateLimit.productionOrderRelease.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.productionOrderRelease.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.productionOrderRelease.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.productionOrderRelease.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.productionOrderRelease.message') ?? DEFAULT_MANUFACTURING_LIMITS.productionOrderRelease.message,
      },
      qualityApproval: {
        windowMs: this.configService.get('manufacturing.rateLimit.qualityApproval.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.qualityApproval.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.qualityApproval.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.qualityApproval.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.qualityApproval.message') ?? DEFAULT_MANUFACTURING_LIMITS.qualityApproval.message,
      },
      workOrderExecution: {
        windowMs: this.configService.get('manufacturing.rateLimit.workOrderExecution.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.workOrderExecution.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.workOrderExecution.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.workOrderExecution.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.workOrderExecution.message') ?? DEFAULT_MANUFACTURING_LIMITS.workOrderExecution.message,
      },
      productionLineControl: {
        windowMs: this.configService.get('manufacturing.rateLimit.productionLineControl.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.productionLineControl.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.productionLineControl.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.productionLineControl.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.productionLineControl.message') ?? DEFAULT_MANUFACTURING_LIMITS.productionLineControl.message,
      },
      iotDeviceControl: {
        windowMs: this.configService.get('manufacturing.rateLimit.iotDeviceControl.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.iotDeviceControl.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.iotDeviceControl.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.iotDeviceControl.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.iotDeviceControl.message') ?? DEFAULT_MANUFACTURING_LIMITS.iotDeviceControl.message,
      },
      analytics: {
        windowMs: this.configService.get('manufacturing.rateLimit.analytics.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.analytics.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.analytics.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.analytics.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.analytics.message') ?? DEFAULT_MANUFACTURING_LIMITS.analytics.message,
      },
      reporting: {
        windowMs: this.configService.get('manufacturing.rateLimit.reporting.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.reporting.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.reporting.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.reporting.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.reporting.message') ?? DEFAULT_MANUFACTURING_LIMITS.reporting.message,
      },
      dataExport: {
        windowMs: this.configService.get('manufacturing.rateLimit.dataExport.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.dataExport.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.dataExport.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.dataExport.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.dataExport.message') ?? DEFAULT_MANUFACTURING_LIMITS.dataExport.message,
      },
      default: {
        windowMs: this.configService.get('manufacturing.rateLimit.default.windowMs') ?? DEFAULT_MANUFACTURING_LIMITS.default.windowMs,
        maxRequests: this.configService.get('manufacturing.rateLimit.default.maxRequests') ?? DEFAULT_MANUFACTURING_LIMITS.default.maxRequests,
        message: this.configService.get('manufacturing.rateLimit.default.message') ?? DEFAULT_MANUFACTURING_LIMITS.default.message,
      },
    };
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
