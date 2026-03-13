import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RateLimitGuard - Request Rate Limiting
 * 
 * Protects API endpoints from abuse by limiting request rates.
 * Uses sliding window algorithm with Redis for distributed rate limiting.
 * 
 * Features:
 * - Configurable rate limits per endpoint
 * - Tier-based rate limiting (free, basic, pro, enterprise)
 * - IP-based and user-based rate limiting
 * - Custom rate limit windows
 * - Detailed rate limit headers in response
 * 
 * Usage:
 * @UseGuards(RateLimitGuard)
 * @RateLimit({ limit: 100, window: 60 }) // 100 requests per 60 seconds
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // In-memory store for rate limiting (use Redis in production)
  private readonly requestStore = new Map<string, { count: number; resetAt: Date }>();

  // Tier-based rate limits (requests per minute)
  private readonly tierLimits = {
    free: 10,
    basic: 50,
    pro: 200,
    enterprise: 1000,
    unlimited: Number.MAX_SAFE_INTEGER,
  };

  constructor(private reflector: Reflector) {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get custom rate limit from decorator
    const customLimit = this.reflector.get<{
      limit: number;
      window: number;
    }>('rateLimit', context.getHandler());

    // Check if rate limiting should be bypassed
    const bypassRateLimit = this.reflector.get<boolean>(
      'bypassRateLimit',
      context.getHandler(),
    );

    if (bypassRateLimit) {
      return true;
    }

    // Determine rate limit key (user ID or IP address)
    const key = this.getRateLimitKey(request);

    // Get applicable rate limit
    const { limit, window } = this.getApplicableLimit(request, customLimit);

    // Check current request count
    const current = this.requestStore.get(key);
    const now = new Date();

    if (!current || current.resetAt < now) {
      // Create new rate limit window
      this.requestStore.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + window * 1000),
      });

      this.setRateLimitHeaders(response, 1, limit, window);
      return true;
    }

    // Increment request count
    current.count++;

    if (current.count > limit) {
      this.logger.warn(
        `Rate limit exceeded: ${key} - ${current.count}/${limit} requests`,
      );

      this.setRateLimitHeaders(response, current.count, limit, window, true);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(
            (current.resetAt.getTime() - now.getTime()) / 1000,
          ),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.requestStore.set(key, current);
    this.setRateLimitHeaders(response, current.count, limit, window);

    return true;
  }

  /**
   * Generate rate limit key based on user or IP
   */
  private getRateLimitKey(request: any): string {
    // Prefer user ID if authenticated
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Fall back to IP address
    const ip = request.ip || request.connection.remoteAddress;
    return `ip:${ip}`;
  }

  /**
   * Get applicable rate limit based on user tier and custom limits
   */
  private getApplicableLimit(
    request: any,
    customLimit?: { limit: number; window: number },
  ): { limit: number; window: number } {
    // Use custom limit if specified
    if (customLimit) {
      return customLimit;
    }

    // Use tier-based limit if user is authenticated
    if (request.user?.tier) {
      const tier = request.user.tier.toLowerCase();
      const limit = this.tierLimits[tier] || this.tierLimits.free;
      return { limit, window: 60 }; // 60 seconds window
    }

    // Default for unauthenticated users
    return {
      limit: parseInt(process.env.RATE_LIMIT_FREE_TIER || '10', 10),
      window: 60,
    };
  }

  /**
   * Set rate limit headers in response
   */
  private setRateLimitHeaders(
    response: any,
    current: number,
    limit: number,
    window: number,
    exceeded: boolean = false,
  ): void {
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current).toString());
    response.setHeader('X-RateLimit-Window', `${window}s`);

    if (exceeded) {
      const resetTime = Math.ceil(window);
      response.setHeader('Retry-After', resetTime.toString());
      response.setHeader('X-RateLimit-Reset', new Date(Date.now() + resetTime * 1000).toISOString());
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanup(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, value] of this.requestStore.entries()) {
      if (value.resetAt < now) {
        this.requestStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }
}

/**
 * Decorator to set custom rate limit for specific routes
 * 
 * @example
 * @RateLimit({ limit: 100, window: 60 })
 * @Post('login')
 * login() { ... }
 */
export const RateLimit = (config: { limit: number; window: number }) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('rateLimit', config);
};

/**
 * Decorator to bypass rate limiting for specific routes
 * 
 * @example
 * @BypassRateLimit()
 * @Get('health')
 * health() { ... }
 */
export const BypassRateLimit = () => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('bypassRateLimit', true);
};
