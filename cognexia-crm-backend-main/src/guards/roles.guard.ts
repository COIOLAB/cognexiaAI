import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../entities/user.entity';
import { AuthenticatedUser } from './jwt.strategy';

export const ROLES_KEY = 'roles';
export const USER_TYPES_KEY = 'userTypes';
export const PERMISSIONS_KEY = 'permissions';

/**
 * Roles Decorator
 * Restricts access to specific roles
 * 
 * @example
 * @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata(ROLES_KEY, roles);
};

/**
 * UserTypes Decorator
 * Restricts access to specific user types (super_admin, org_admin, org_user)
 * 
 * @example
 * @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
 */
export const UserTypes = (...userTypes: UserType[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata(USER_TYPES_KEY, userTypes);
};

/**
 * Permissions Decorator
 * Restricts access to specific permissions (resource:action format)
 * 
 * @example
 * @Permissions('users:create', 'users:update')
 */
export const Permissions = (...permissions: string[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata(PERMISSIONS_KEY, permissions);
};

/**
 * Roles Guard
 * Validates user roles, user types, and permissions
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private normalizeAccessValue(value?: string): string {
    return (value || '').trim().toLowerCase();
  }

  private expandRoleAliases(role: string): string[] {
    const normalizedRole = this.normalizeAccessValue(role);
    if (!normalizedRole) {
      return [];
    }

    const aliases = new Set<string>([normalizedRole]);
    const aliasMap: Record<string, string[]> = {
      super_admin: ['super_admin'],
      owner: ['org_admin', 'admin'],
      org_admin: ['admin', 'client_admin', 'owner'],
      admin: ['org_admin', 'client_admin', 'owner'],
      client_admin: ['org_admin', 'admin'],
      org_user: ['user', 'viewer'],
      user: ['org_user', 'viewer'],
      viewer: ['org_user', 'user'],
      manager: ['sales_manager', 'marketing_manager', 'support_manager'],
      sales_manager: [],
      marketing_manager: ['marketing', 'marketing_specialist'],
      marketing_specialist: ['marketing_manager'],
      marketing: ['marketing_manager', 'marketing_specialist'],
      support_manager: ['support_agent', 'customer_success'],
      support_agent: ['customer_success'],
      customer_success: ['support_agent'],
      finance: ['org_admin', 'admin'],
    };

    const mappedRoles = aliasMap[normalizedRole] || [];
    for (const mappedRole of mappedRoles) {
      aliases.add(this.normalizeAccessValue(mappedRole));
    }

    return [...aliases];
  }

  private buildExpandedRoleSet(roles: string[] = []): Set<string> {
    const expandedRoles = new Set<string>();

    for (const role of roles) {
      const aliases = this.expandRoleAliases(role);
      for (const alias of aliases) {
        expandedRoles.add(alias);
      }
    }

    return expandedRoles;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredUserTypes = this.reflector.getAllAndOverride<UserType[]>(USER_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no requirements specified, allow access
    if (!requiredRoles && !requiredUserTypes && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins have access to everything
    if (user.userType === UserType.SUPER_ADMIN) {
      return true;
    }

    // Check user types
    if (requiredUserTypes && requiredUserTypes.length > 0) {
      const hasUserType = requiredUserTypes.includes(user.userType);
      if (!hasUserType) {
        throw new ForbiddenException(
          `Access denied. Required user type: ${requiredUserTypes.join(', ')}`
        );
      }
    }

    // Check roles
    if (requiredRoles && requiredRoles.length > 0) {
      if (user.userType === UserType.ORG_ADMIN) {
        return true;
      }

      const requiredRoleSet = this.buildExpandedRoleSet(requiredRoles);
      const userRoleSet = this.buildExpandedRoleSet(user.roles || []);
      userRoleSet.add(this.normalizeAccessValue(user.userType));

      const hasRole = [...requiredRoleSet].some((requiredRole) => userRoleSet.has(requiredRole));
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied. Required role: ${requiredRoles.join(', ')}`
        );
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const normalizedRequiredPermissions = requiredPermissions.map((permission) => this.normalizeAccessValue(permission));
      const normalizedUserPermissions = (user.permissions || []).map((permission) => this.normalizeAccessValue(permission));
      const hasPermission = normalizedRequiredPermissions.some((permission) =>
        normalizedUserPermissions.includes(permission) || normalizedUserPermissions.includes('*')
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permission: ${requiredPermissions.join(', ')}`
        );
      }
    }

    return true;
  }
}
