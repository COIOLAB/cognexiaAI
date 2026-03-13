import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operator',
  // Manufacturing specific roles
  MANUFACTURING_MANAGER = 'manufacturing_manager',
  PRODUCTION_PLANNER = 'production_planner',
  QUALITY_INSPECTOR = 'quality_inspector',
  MAINTENANCE_TECHNICIAN = 'maintenance_technician',
  SAFETY_SUPERVISOR = 'safety_supervisor',
  DIGITAL_TWIN_ENGINEER = 'digital_twin_engineer',
  // Security roles
  SECURITY_ANALYST = 'security_analyst',
  CYBERSECURITY_MANAGER = 'cybersecurity_manager',
  COMPLIANCE_OFFICER = 'compliance_officer',
  AUDITOR = 'auditor',
  RISK_MANAGER = 'risk_manager',
  HR_MANAGER = 'hr_manager',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => {
      if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes(role);
      }
      return user.role === role;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${user.roles || user.role || 'none'}`,
      );
    }

    return true;
  }
}
