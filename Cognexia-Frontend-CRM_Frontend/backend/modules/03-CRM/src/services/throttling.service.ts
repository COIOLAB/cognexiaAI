import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { UsageMetric, MetricType } from '../entities/usage-metric.entity';

export enum ThrottleType {
  GLOBAL = 'global',
  PER_ORGANIZATION = 'per_organization',
  PER_USER = 'per_user',
  PER_IP = 'per_ip',
  PER_ENDPOINT = 'per_endpoint',
}

export interface ThrottleConfig {
  type: ThrottleType;
  limit: number;
  windowSeconds: number;
  blockDurationSeconds?: number;
}

export interface ThrottleResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface ThrottleStats {
  totalRequests: number;
  blockedRequests: number;
  uniqueIPs: number;
  topOffenders: { identifier: string; requests: number }[];
}

/**
 * Throttling Service
 * Advanced rate limiting with multiple strategies
 * 
 * NOTE: For production, consider using Redis for distributed rate limiting
 * npm install ioredis @nestjs/throttler
 */
@Injectable()
export class ThrottlingService {
  private readonly logger = new Logger(ThrottlingService.name);
  private readonly requestLog: Map<string, { count: number; resetTime: Date; blocked: boolean }> = new Map();
  private readonly blockedKeys: Map<string, Date> = new Map();

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(UsageMetric)
    private usageMetricRepository: Repository<UsageMetric>,
  ) {
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check Throttle
   */
  async checkThrottle(
    identifier: string,
    config: ThrottleConfig,
  ): Promise<ThrottleResult> {
    const key = this.generateKey(config.type, identifier);
    const now = new Date();

    // Check if blocked
    const blockExpiry = this.blockedKeys.get(key);
    if (blockExpiry && blockExpiry > now) {
      const retryAfter = Math.ceil((blockExpiry.getTime() - now.getTime()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockExpiry,
        retryAfter,
      };
    }

    // Get or create entry
    let entry = this.requestLog.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new window
      const resetTime = new Date(now.getTime() + config.windowSeconds * 1000);
      entry = {
        count: 1,
        resetTime,
        blocked: false,
      };
      this.requestLog.set(key, entry);

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetTime,
      };
    }

    // Check limit
    if (entry.count >= config.limit) {
      // Block if configured
      if (config.blockDurationSeconds) {
        const blockUntil = new Date(now.getTime() + config.blockDurationSeconds * 1000);
        this.blockedKeys.set(key, blockUntil);
        this.logger.warn(`Blocked ${key} until ${blockUntil.toISOString()}`);
      }

      entry.blocked = true;
      const retryAfter = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    this.requestLog.set(key, entry);

    return {
      allowed: true,
      remaining: config.limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Check Organization Throttle
   */
  async checkOrganizationThrottle(organizationId: string): Promise<ThrottleResult> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(),
        retryAfter: 0,
      };
    }

    // Check if organization is suspended
    if (!organization.isActive) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(),
        retryAfter: 0,
      };
    }

    // Default: 1000 requests per hour per organization
    return this.checkThrottle(organizationId, {
      type: ThrottleType.PER_ORGANIZATION,
      limit: 1000,
      windowSeconds: 3600, // 1 hour
    });
  }

  /**
   * Check User Throttle
   */
  async checkUserThrottle(userId: string, organizationId: string): Promise<ThrottleResult> {
    // Default: 100 requests per minute per user
    return this.checkThrottle(`${organizationId}:${userId}`, {
      type: ThrottleType.PER_USER,
      limit: 100,
      windowSeconds: 60, // 1 minute
    });
  }

  /**
   * Check IP Throttle
   */
  async checkIPThrottle(ipAddress: string): Promise<ThrottleResult> {
    // Default: 500 requests per hour per IP
    return this.checkThrottle(ipAddress, {
      type: ThrottleType.PER_IP,
      limit: 500,
      windowSeconds: 3600, // 1 hour
      blockDurationSeconds: 300, // Block for 5 minutes if exceeded
    });
  }

  /**
   * Check Endpoint Throttle
   */
  async checkEndpointThrottle(
    organizationId: string,
    endpoint: string,
  ): Promise<ThrottleResult> {
    // Default: 200 requests per minute per endpoint
    return this.checkThrottle(`${organizationId}:${endpoint}`, {
      type: ThrottleType.PER_ENDPOINT,
      limit: 200,
      windowSeconds: 60, // 1 minute
    });
  }

  /**
   * Check Global Throttle
   */
  async checkGlobalThrottle(): Promise<ThrottleResult> {
    // Default: 10,000 requests per minute globally
    return this.checkThrottle('global', {
      type: ThrottleType.GLOBAL,
      limit: 10000,
      windowSeconds: 60, // 1 minute
    });
  }

  /**
   * Reset Throttle
   */
  async resetThrottle(identifier: string, type: ThrottleType): Promise<void> {
    const key = this.generateKey(type, identifier);
    this.requestLog.delete(key);
    this.blockedKeys.delete(key);
    this.logger.log(`Reset throttle for ${key}`);
  }

  /**
   * Block Identifier
   */
  async blockIdentifier(
    identifier: string,
    type: ThrottleType,
    durationSeconds: number,
  ): Promise<void> {
    const key = this.generateKey(type, identifier);
    const blockUntil = new Date(Date.now() + durationSeconds * 1000);
    this.blockedKeys.set(key, blockUntil);
    this.logger.warn(`Manually blocked ${key} until ${blockUntil.toISOString()}`);
  }

  /**
   * Unblock Identifier
   */
  async unblockIdentifier(identifier: string, type: ThrottleType): Promise<void> {
    const key = this.generateKey(type, identifier);
    this.blockedKeys.delete(key);
    this.logger.log(`Unblocked ${key}`);
  }

  /**
   * Get Throttle Stats
   */
  async getThrottleStats(type?: ThrottleType): Promise<ThrottleStats> {
    let entries = Array.from(this.requestLog.entries());

    if (type) {
      const prefix = `throttle:${type}:`;
      entries = entries.filter(([key]) => key.startsWith(prefix));
    }

    const totalRequests = entries.reduce((sum, [, entry]) => sum + entry.count, 0);
    const blockedRequests = entries.filter(([, entry]) => entry.blocked).length;

    // Get unique IPs (if tracking IP throttle)
    const ipEntries = entries.filter(([key]) => key.startsWith('throttle:per_ip:'));
    const uniqueIPs = ipEntries.length;

    // Get top offenders
    const topOffenders = entries
      .map(([key, entry]) => ({
        identifier: key.replace(/^throttle:[^:]+:/, ''),
        requests: entry.count,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalRequests,
      blockedRequests,
      uniqueIPs,
      topOffenders,
    };
  }

  /**
   * Get Current Limits
   */
  async getCurrentLimits(
    identifier: string,
    type: ThrottleType,
  ): Promise<{ current: number; limit: number; resetTime: Date }> {
    const key = this.generateKey(type, identifier);
    const entry = this.requestLog.get(key);

    if (!entry) {
      return {
        current: 0,
        limit: this.getDefaultLimit(type),
        resetTime: new Date(),
      };
    }

    return {
      current: entry.count,
      limit: this.getDefaultLimit(type),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Check if Identifier is Blocked
   */
  async isBlocked(identifier: string, type: ThrottleType): Promise<boolean> {
    const key = this.generateKey(type, identifier);
    const blockExpiry = this.blockedKeys.get(key);
    
    if (!blockExpiry) return false;
    
    if (blockExpiry < new Date()) {
      this.blockedKeys.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get Blocked Identifiers
   */
  async getBlockedIdentifiers(): Promise<{ identifier: string; unblockAt: Date }[]> {
    const now = new Date();
    const blocked: { identifier: string; unblockAt: Date }[] = [];

    for (const [key, unblockAt] of this.blockedKeys.entries()) {
      if (unblockAt > now) {
        blocked.push({
          identifier: key,
          unblockAt,
        });
      }
    }

    return blocked.sort((a, b) => a.unblockAt.getTime() - b.unblockAt.getTime());
  }

  /**
   * Generate Key
   */
  private generateKey(type: ThrottleType, identifier: string): string {
    return `throttle:${type}:${identifier}`;
  }

  /**
   * Get Default Limit
   */
  private getDefaultLimit(type: ThrottleType): number {
    switch (type) {
      case ThrottleType.GLOBAL:
        return 10000;
      case ThrottleType.PER_ORGANIZATION:
        return 1000;
      case ThrottleType.PER_USER:
        return 100;
      case ThrottleType.PER_IP:
        return 500;
      case ThrottleType.PER_ENDPOINT:
        return 200;
      default:
        return 100;
    }
  }

  /**
   * Cleanup Expired Entries
   */
  private cleanup(): void {
    const now = new Date();
    let cleanedLog = 0;
    let cleanedBlocked = 0;

    // Cleanup request log
    for (const [key, entry] of this.requestLog.entries()) {
      if (entry.resetTime < now) {
        this.requestLog.delete(key);
        cleanedLog++;
      }
    }

    // Cleanup blocked keys
    for (const [key, unblockAt] of this.blockedKeys.entries()) {
      if (unblockAt < now) {
        this.blockedKeys.delete(key);
        cleanedBlocked++;
      }
    }

    if (cleanedLog > 0 || cleanedBlocked > 0) {
      this.logger.debug(
        `Cleaned up ${cleanedLog} expired throttle entries and ${cleanedBlocked} expired blocks`,
      );
    }
  }

  /**
   * Export Throttle Data (for monitoring/debugging)
   */
  async exportThrottleData(): Promise<{
    activeThrottles: { key: string; count: number; resetTime: Date }[];
    blockedKeys: { key: string; unblockAt: Date }[];
  }> {
    const activeThrottles = Array.from(this.requestLog.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime,
    }));

    const blockedKeys = Array.from(this.blockedKeys.entries()).map(([key, unblockAt]) => ({
      key,
      unblockAt,
    }));

    return { activeThrottles, blockedKeys };
  }
}
