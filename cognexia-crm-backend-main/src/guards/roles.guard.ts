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

      const userRolesLower = user.roles ? user.roles.map(r => r.toLowerCase()) : [];
      const hasRole = requiredRoles.some(role => userRolesLower.includes(role.toLowerCase()));
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied. Required role: ${requiredRoles.join(', ')}`
        );
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission =>
        user.permissions.includes(permission)
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
