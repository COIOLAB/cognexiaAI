import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PRODUCTION_LINE_ACCESS = 'production_line_access';

export enum ProductionLineRole {
  OPERATOR = 'operator',
  SUPERVISOR = 'supervisor',
  MANAGER = 'manager',
  MAINTENANCE = 'maintenance',
  QUALITY_INSPECTOR = 'quality_inspector'
}

@Injectable()
export class ProductionLineGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ProductionLineRole[]>(
      PRODUCTION_LINE_ACCESS,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // No specific roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required for production line access');
    }

    // Check if user has access to production line
    const hasAccess = this.checkProductionLineAccess(user, requiredRoles);
    
    if (!hasAccess) {
      throw new ForbiddenException(
        `Insufficient production line access. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    // Additional safety checks for production line access
    if (!this.validateSafetyRequirements(user)) {
      throw new ForbiddenException('Safety requirements not met for production line access');
    }

    return true;
  }

  private checkProductionLineAccess(user: any, requiredRoles: ProductionLineRole[]): boolean {
    // Check if user has manager role (can access everything)
    if (user.productionRoles?.includes(ProductionLineRole.MANAGER)) {
      return true;
    }

    // Check if user has any of the required roles
    return requiredRoles.some(role => 
      user.productionRoles?.includes(role)
    );
  }

  private validateSafetyRequirements(user: any): boolean {
    // Check safety training completion
    if (!user.safetyTraining?.completed) {
      return false;
    }

    // Check if safety training is current (within last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (new Date(user.safetyTraining.completedDate) < oneYearAgo) {
      return false;
    }

    // Check if user has required safety certifications
    const requiredCertifications = ['BASIC_SAFETY', 'EQUIPMENT_OPERATION'];
    const userCertifications = user.certifications || [];
    
    return requiredCertifications.every(cert => 
      userCertifications.includes(cert)
    );
  }
}

// Decorator to set required production line roles
export const RequireProductionLineAccess = (...roles: ProductionLineRole[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const reflector = new Reflector();
    reflector.set(PRODUCTION_LINE_ACCESS, roles, descriptor?.value || target);
  };
};