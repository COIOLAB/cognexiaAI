import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RBACGuard - Role-Based Access Control
 * 
 * Enforces role and permission-based access control on routes.
 * Works in conjunction with @Roles() and @Permissions() decorators.
 * 
 * Features:
 * - Role-based access (e.g., admin, manager, user)
 * - Permission-based access (e.g., 'customer:read', 'lead:write')
 * - Hierarchical role support
 * - Granular permission checking
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, RBACGuard)
 * @Roles('admin', 'manager')
 * @Permissions('customer:read', 'customer:write')
 */
@Injectable()
export class RBACGuard implements CanActivate {
  private readonly logger = new Logger(RBACGuard.name);

  // Role hierarchy: higher roles inherit permissions from lower roles
  private readonly roleHierarchy = {
    super_admin: 1000,
    admin: 900,
    manager: 800,
    team_lead: 700,
    sales_rep: 600,
    support_agent: 500,
    user: 400,
    guest: 100,
  };

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // If no roles or permissions required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Check roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = this.validateRoles(user, requiredRoles);
      if (!hasRole) {
        this.logger.warn(
          `Access denied for user ${user.id}: insufficient role. Required: ${requiredRoles.join(', ')}, Has: ${user.type}`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = await this.validatePermissions(
        user,
        requiredPermissions,
      );
      if (!hasPermission) {
        this.logger.warn(
          `Access denied for user ${user.id}: insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        );
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
    }

    return true;
  }

  /**
   * Validate if user has required roles
   * Supports hierarchical role checking
   */
  private validateRoles(user: any, requiredRoles: string[]): boolean {
    const userRole = user.type?.toLowerCase();
    const userRoleLevel = this.roleHierarchy[userRole] || 0;

    // Check if user has any of the required roles (or higher in hierarchy)
    return requiredRoles.some((role) => {
      const requiredRoleLevel = this.roleHierarchy[role.toLowerCase()] || 0;
      return userRoleLevel >= requiredRoleLevel;
    });
  }

  /**
   * Validate if user has required permissions
   * Format: 'resource:action' (e.g., 'customer:read', 'lead:write')
   */
  private async validatePermissions(
    user: any,
    requiredPermissions: string[],
  ): Promise<boolean> {
    // Super admin has all permissions
    if (user.type?.toLowerCase() === 'super_admin') {
      return true;
    }

    // Get user permissions from token or database
    const userPermissions: string[] = user.permissions || [];

    // Check if user has all required permissions
    return requiredPermissions.every((permission) => {
      // Exact match
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Wildcard match (e.g., 'customer:*' matches 'customer:read')
      const [resource] = permission.split(':');
      if (userPermissions.includes(`${resource}:*`)) {
        return true;
      }

      // Global wildcard
      if (userPermissions.includes('*:*')) {
        return true;
      }

      return false;
    });
  }
}

/**
 * Decorator to specify required roles for a route
 * 
 * @example
 * @Roles('admin', 'manager')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
export const Roles = (...roles: string[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('roles', roles);
};

/**
 * Decorator to specify required permissions for a route
 * 
 * @example
 * @Permissions('customer:read', 'customer:write')
 * @Put('customers/:id')
 * updateCustomer() { ... }
 */
export const Permissions = (...permissions: string[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('permissions', permissions);
};
