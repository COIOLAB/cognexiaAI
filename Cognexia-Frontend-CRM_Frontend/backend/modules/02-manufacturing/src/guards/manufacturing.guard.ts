import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const MANUFACTURING_PERMISSIONS = 'manufacturing_permissions';

export enum ManufacturingPermission {
  READ_PRODUCTION = 'read:production',
  WRITE_PRODUCTION = 'write:production',
  READ_QUALITY = 'read:quality',
  WRITE_QUALITY = 'write:quality',
  READ_MAINTENANCE = 'read:maintenance',
  WRITE_MAINTENANCE = 'write:maintenance',
  READ_ANALYTICS = 'read:analytics',
  MANAGE_EQUIPMENT = 'manage:equipment',
  MANAGE_SCHEDULE = 'manage:schedule',
  ADMIN_ACCESS = 'admin:manufacturing'
}

@Injectable()
export class ManufacturingGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<ManufacturingPermission[]>(
      MANUFACTURING_PERMISSIONS,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has required permissions
    const hasPermission = this.checkPermissions(user, requiredPermissions);
    
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }

  private checkPermissions(user: any, requiredPermissions: ManufacturingPermission[]): boolean {
    // If user has admin access, allow everything
    if (user.permissions?.includes(ManufacturingPermission.ADMIN_ACCESS)) {
      return true;
    }

    // Check if user has all required permissions
    return requiredPermissions.every(permission => 
      user.permissions?.includes(permission)
    );
  }
}

// Decorator to set required permissions
export const RequireManufacturingPermissions = (...permissions: ManufacturingPermission[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const reflector = new Reflector();
    reflector.set(MANUFACTURING_PERMISSIONS, permissions, descriptor?.value || target);
  };
};