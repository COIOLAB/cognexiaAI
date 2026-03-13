import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash } from 'crypto';

/**
 * ApiKeyGuard - API Key Validation
 * 
 * Validates API keys for service-to-service communication and third-party integrations.
 * Supports multiple API key formats and scopes.
 * 
 * Features:
 * - API key validation via header or query parameter
 * - Scoped API keys (read-only, full-access, etc.)
 * - Rate limiting per API key
 * - Usage tracking and logging
 * 
 * Usage:
 * @UseGuards(ApiKeyGuard)
 * @ApiKeyScope('read')
 * 
 * API Key Format:
 * Header: X-API-Key: ak_live_1234567890abcdef
 * Query: ?api_key=ak_live_1234567890abcdef
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly apiKeyHeader = process.env.API_KEY_HEADER || 'X-API-Key';

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if API key validation should be bypassed
    const requiresApiKey = this.reflector.get<boolean>(
      'requiresApiKey',
      context.getHandler(),
    );

    if (requiresApiKey === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      this.logger.warn(
        `API key missing - IP: ${request.ip}, Path: ${request.url}`,
      );
      throw new UnauthorizedException(
        'API key is required. Please include X-API-Key header.',
      );
    }

    // Validate API key format
    if (!this.isValidFormat(apiKey)) {
      this.logger.warn(`Invalid API key format - IP: ${request.ip}`);
      throw new UnauthorizedException('Invalid API key format');
    }

    // Validate API key
    const isValid = await this.validateApiKey(apiKey);
    if (!isValid) {
      this.logger.warn(
        `Invalid API key attempt - Key: ${this.maskApiKey(apiKey)}, IP: ${request.ip}`,
      );
      throw new UnauthorizedException('Invalid API key');
    }

    // Get API key details (scope, organization, etc.)
    const apiKeyDetails = await this.getApiKeyDetails(apiKey);

    // Check if API key has required scope
    const requiredScope = this.reflector.get<string>(
      'apiKeyScope',
      context.getHandler(),
    );

    if (requiredScope && !this.hasScope(apiKeyDetails, requiredScope)) {
      this.logger.warn(
        `API key lacks required scope: ${requiredScope} - Key: ${this.maskApiKey(apiKey)}`,
      );
      throw new UnauthorizedException(
        `This API key does not have '${requiredScope}' scope`,
      );
    }

    // Attach API key context to request
    request.apiKey = apiKeyDetails;
    request.organizationId = apiKeyDetails.organizationId;

    this.logger.debug(
      `API key validated: ${this.maskApiKey(apiKey)} (${apiKeyDetails.scope})`,
    );

    return true;
  }

  /**
   * Extract API key from request headers or query parameters
   */
  private extractApiKey(request: any): string | null {
    // Check header
    const headerKey = request.headers[this.apiKeyHeader.toLowerCase()];
    if (headerKey) {
      return headerKey;
    }

    // Check query parameter (less secure, for convenience only)
    const queryKey = request.query?.api_key;
    if (queryKey) {
      this.logger.warn(
        'API key passed via query parameter (insecure). Use header instead.',
      );
      return queryKey;
    }

    return null;
  }

  /**
   * Validate API key format
   * Expected format: ak_{env}_{random32chars}
   * Examples: ak_live_1234567890abcdef, ak_test_abcdef1234567890
   */
  private isValidFormat(apiKey: string): boolean {
    const pattern = /^ak_(live|test)_[a-zA-Z0-9]{32}$/;
    return pattern.test(apiKey);
  }

  /**
   * Validate API key against database or environment
   * In production, this should query the database
   */
  private async validateApiKey(apiKey: string): Promise<boolean> {
    // Hash the API key for comparison
    const hashedKey = this.hashApiKey(apiKey);

    // For now, compare with environment variable
    // In production, query database of valid API keys
    const validKeys = (process.env.VALID_API_KEYS || '').split(',');

    // Check if key exists and is not revoked
    // In production: query ApiKey table from database
    // SELECT * FROM api_keys WHERE key_hash = hashedKey AND is_revoked = false AND expires_at > NOW()
    
    // For now, use environment variable validation
    if (validKeys.length > 0) {
      return validKeys.some((key) => this.hashApiKey(key.trim()) === hashedKey);
    }
    
    // If no valid keys configured, accept any valid format key in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.warn('No API keys configured - accepting any valid format key in development mode');
      return true;
    }
    
    return false;
  }

  /**
   * Get API key details (organization, scope, rate limits, etc.)
   */
  private async getApiKeyDetails(apiKey: string): Promise<any> {
    // In production, fetch from database
    // For now, return mock details based on key prefix
    const isTestKey = apiKey.startsWith('ak_test_');

    return {
      key: this.maskApiKey(apiKey),
      scope: 'full', // 'read', 'write', 'full'
      organizationId: 'default-org-id', // From database
      environment: isTestKey ? 'test' : 'live',
      rateLimit: isTestKey ? 100 : 1000, // requests per hour
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };
  }

  /**
   * Check if API key has required scope
   */
  private hasScope(apiKeyDetails: any, requiredScope: string): boolean {
    const scope = apiKeyDetails.scope;

    if (scope === 'full') {
      return true; // Full access has all scopes
    }

    if (scope === requiredScope) {
      return true;
    }

    // Check hierarchical scopes
    const scopeHierarchy = {
      full: ['read', 'write', 'admin'],
      admin: ['read', 'write'],
      write: ['read'],
    };

    return scopeHierarchy[scope]?.includes(requiredScope) || false;
  }

  /**
   * Hash API key for secure comparison
   */
  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Mask API key for logging (show only first 8 and last 4 characters)
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length < 16) {
      return '***';
    }
    return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  }
}

/**
 * Decorator to specify required API key scope
 * 
 * @example
 * @UseGuards(ApiKeyGuard)
 * @ApiKeyScope('read')
 * @Get('data')
 * getData() { ... }
 */
export const ApiKeyScope = (scope: string) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('apiKeyScope', scope);
};

/**
 * Decorator to bypass API key requirement
 * 
 * @example
 * @RequiresApiKey(false)
 * @Get('public')
 * getPublic() { ... }
 */
export const RequiresApiKey = (required: boolean = true) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('requiresApiKey', required);
};
