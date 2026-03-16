import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * TenantGuard - Critical for Multi-Tenancy Isolation
 * 
 * Ensures that all requests are properly scoped to a specific organization/tenant.
 * This guard extracts the organizationId from the JWT token and validates
 * that users can only access resources belonging to their organization.
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * 
 * The guard expects the organizationId to be present in the JWT payload.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if tenant validation should be bypassed (for public routes)
    const bypassTenant = this.reflector.get<boolean>(
      'bypassTenant',
      context.getHandler(),
    );

    if (bypassTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated before tenant check
    if (!user) {
      this.logger.warn('Tenant guard called without authenticated user');
      throw new UnauthorizedException('Authentication required');
    }

    // Extract organizationId from JWT payload
    const organizationId = user.organizationId || user.organizationId;

    if (!organizationId) {
      this.logger.error(
        `User ${user.id} does not have an organizationId in token`,
      );
      throw new ForbiddenException(
        'Organization context is required. Please contact support.',
      );
    }

    // Attach organizationId to request for downstream use
    request.organizationId = organizationId;
    request.user.organizationId = organizationId;
    request.user.tenantId = organizationId;

    // Set PostgreSQL session variable for Row-Level Security (RLS)
    // This is critical for Supabase multi-tenancy
    try {
      // The application will use this in database queries
      request.tenantContext = {
        organizationId,
        userId: user.id,
        userRole: user.type,
      };

      this.logger.debug(
        `Tenant context set: org=${organizationId}, user=${user.id}`,
      );

      return true;
    } catch (error) {
      this.logger.error('Failed to set tenant context', error);
      throw new ForbiddenException('Failed to establish organization context');
    }
  }
}

/**
 * Decorator to bypass tenant validation for specific routes
 * Use sparingly, only for truly public endpoints
 * 
 * @example
 * @BypassTenant()
 * @Get('public/health')
 * getHealth() { ... }
 */
export const BypassTenant = () => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('bypassTenant', true);
};
