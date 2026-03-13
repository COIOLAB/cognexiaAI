import { CacheModuleOptions, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

/**
 * Cache Configuration for Performance Optimization
 * 
 * Implements multi-layer caching strategy:
 * - L1: In-memory cache (fast, limited capacity)
 * - L2: Redis distributed cache (shared across instances)
 */

export interface CacheConfig {
  // Redis connection
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    enableOfflineQueue: boolean;
    connectTimeout: number;
    maxRetriesPerRequest: number;
  };
  
  // Cache TTL settings (in seconds)
  ttl: {
    default: number;
    short: number;      // 1 minute - frequently changing data
    medium: number;     // 5 minutes - semi-static data
    long: number;       // 1 hour - rarely changing data
    veryLong: number;   // 24 hours - static data
    organizations: number;
    users: number;
    roles: number;
    permissions: number;
    subscriptionPlans: number;
    analytics: number;
    reports: number;
    publicData: number;
  };
  
  // Cache key patterns
  keys: {
    organization: (id: string) => string;
    user: (id: string) => string;
    role: (id: string) => string;
    permission: (id: string) => string;
    subscriptionPlan: (id: string) => string;
    analytics: (orgId: string, type: string) => string;
    report: (orgId: string, reportId: string) => string;
    list: (entity: string, orgId: string, page?: number) => string;
  };
  
  // Cache invalidation patterns
  invalidation: {
    organization: (id: string) => string[];
    user: (id: string, orgId: string) => string[];
    role: (id: string, orgId: string) => string[];
  };
}

/**
 * Get Cache Configuration
 */
export function getCacheConfig(): CacheConfig {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'crm:',
      enableOfflineQueue: true,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
    },
    
    ttl: {
      default: 300,           // 5 minutes
      short: 60,              // 1 minute
      medium: 300,            // 5 minutes
      long: 3600,             // 1 hour
      veryLong: 86400,        // 24 hours
      organizations: 3600,    // 1 hour
      users: 1800,            // 30 minutes
      roles: 3600,            // 1 hour
      permissions: 7200,      // 2 hours
      subscriptionPlans: 86400, // 24 hours (rarely changes)
      analytics: 300,         // 5 minutes
      reports: 1800,          // 30 minutes
      publicData: 86400,      // 24 hours
    },
    
    keys: {
      organization: (id: string) => `org:${id}`,
      user: (id: string) => `user:${id}`,
      role: (id: string) => `role:${id}`,
      permission: (id: string) => `perm:${id}`,
      subscriptionPlan: (id: string) => `plan:${id}`,
      analytics: (orgId: string, type: string) => `analytics:${orgId}:${type}`,
      report: (orgId: string, reportId: string) => `report:${orgId}:${reportId}`,
      list: (entity: string, orgId: string, page?: number) => 
        page !== undefined 
          ? `list:${entity}:${orgId}:page:${page}`
          : `list:${entity}:${orgId}`,
    },
    
    invalidation: {
      organization: (id: string) => [
        `org:${id}`,
        `list:*:${id}*`,
        `analytics:${id}:*`,
        `report:${id}:*`,
      ],
      user: (id: string, orgId: string) => [
        `user:${id}`,
        `list:user:${orgId}*`,
      ],
      role: (id: string, orgId: string) => [
        `role:${id}`,
        `list:role:${orgId}*`,
      ],
    },
  };
}

/**
 * Create NestJS Cache Module Options
 */
export async function createCacheModuleOptions(): Promise<CacheModuleOptions> {
  const config = getCacheConfig();
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  
  // In development, use in-memory cache if Redis is not available
  if (isDevelopment && !process.env.REDIS_HOST) {
    console.log('⚠️  Redis not configured, using in-memory cache (development only)');
    return {
      ttl: config.ttl.default * 1000, // Convert to milliseconds
      max: 1000, // Max items in memory
      isGlobal: true,
    };
  }
  
  // Production: Use Redis
  try {
    const store = await redisStore({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        connectTimeout: config.redis.connectTimeout,
      },
      password: config.redis.password,
      database: config.redis.db,
      keyPrefix: config.redis.keyPrefix,
    } as RedisClientOptions);
    
    return {
      store: store as unknown as CacheStore,
      ttl: config.ttl.default * 1000, // Convert to milliseconds
      isGlobal: true,
    };
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    
    // Fallback to in-memory cache
    console.log('⚠️  Falling back to in-memory cache');
    return {
      ttl: config.ttl.default * 1000,
      max: 1000,
      isGlobal: true,
    };
  }
}

/**
 * Validate cache environment variables
 */
export function validateCacheEnv(): void {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    const required = [
      'REDIS_HOST',
      'REDIS_PORT',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️  Missing cache environment variables (production): ${missing.join(', ')}`);
      console.warn('⚠️  Redis cache is recommended for production');
    }
  }
}

/**
 * Cache key builder utility
 */
export class CacheKeyBuilder {
  private static config = getCacheConfig();
  
  static organization(id: string): string {
    return this.config.keys.organization(id);
  }
  
  static user(id: string): string {
    return this.config.keys.user(id);
  }
  
  static role(id: string): string {
    return this.config.keys.role(id);
  }
  
  static permission(id: string): string {
    return this.config.keys.permission(id);
  }
  
  static subscriptionPlan(id: string): string {
    return this.config.keys.subscriptionPlan(id);
  }
  
  static analytics(orgId: string, type: string): string {
    return this.config.keys.analytics(orgId, type);
  }
  
  static report(orgId: string, reportId: string): string {
    return this.config.keys.report(orgId, reportId);
  }
  
  static list(entity: string, orgId: string, page?: number): string {
    return this.config.keys.list(entity, orgId, page);
  }
}

/**
 * Cache invalidation utility
 */
export class CacheInvalidator {
  private static config = getCacheConfig();
  
  static getOrganizationPatterns(id: string): string[] {
    return this.config.invalidation.organization(id);
  }
  
  static getUserPatterns(id: string, orgId: string): string[] {
    return this.config.invalidation.user(id, orgId);
  }
  
  static getRolePatterns(id: string, orgId: string): string[] {
    return this.config.invalidation.role(id, orgId);
  }
}
