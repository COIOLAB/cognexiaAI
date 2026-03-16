import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ProcurementUser } from '../strategies/jwt.strategy';

export type ProcurementRole = 
  | 'admin'
  | 'procurement_admin'
  | 'procurement_manager'
  | 'senior_buyer'
  | 'buyer'
  | 'requester'
  | 'viewer'
  | 'it_procurement'
  | 'facilities_procurement'
  | 'capital_procurement'
  | 'finance_approver'
  | 'legal_approver';

export type ProcurementPermission =
  | 'create_purchase_order'
  | 'approve_purchase_order'
  | 'view_purchase_orders'
  | 'edit_purchase_order'
  | 'cancel_purchase_order'
  | 'create_contract'
  | 'approve_contract'
  | 'view_contracts'
  | 'edit_contract'
  | 'renew_contract'
  | 'terminate_contract'
  | 'onboard_supplier'
  | 'approve_supplier'
  | 'view_suppliers'
  | 'edit_supplier'
  | 'deactivate_supplier'
  | 'create_rfq'
  | 'respond_to_rfq'
  | 'view_rfq'
  | 'approve_rfq'
  | 'view_analytics'
  | 'export_data'
  | 'manage_categories'
  | 'blockchain_operations'
  | 'ai_optimization'
  | 'system_administration';

export interface RolePermissionMap {
  [key: string]: ProcurementPermission[];
}

// Define comprehensive role-permission mapping
const ROLE_PERMISSIONS: RolePermissionMap = {
  admin: [
    'create_purchase_order',
    'approve_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'cancel_purchase_order',
    'create_contract',
    'approve_contract',
    'view_contracts',
    'edit_contract',
    'renew_contract',
    'terminate_contract',
    'onboard_supplier',
    'approve_supplier',
    'view_suppliers',
    'edit_supplier',
    'deactivate_supplier',
    'create_rfq',
    'respond_to_rfq',
    'view_rfq',
    'approve_rfq',
    'view_analytics',
    'export_data',
    'manage_categories',
    'blockchain_operations',
    'ai_optimization',
    'system_administration',
  ],
  procurement_admin: [
    'create_purchase_order',
    'approve_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'cancel_purchase_order',
    'create_contract',
    'approve_contract',
    'view_contracts',
    'edit_contract',
    'renew_contract',
    'terminate_contract',
    'onboard_supplier',
    'approve_supplier',
    'view_suppliers',
    'edit_supplier',
    'deactivate_supplier',
    'create_rfq',
    'view_rfq',
    'approve_rfq',
    'view_analytics',
    'export_data',
    'manage_categories',
    'blockchain_operations',
    'ai_optimization',
  ],
  procurement_manager: [
    'create_purchase_order',
    'approve_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'create_contract',
    'view_contracts',
    'edit_contract',
    'renew_contract',
    'onboard_supplier',
    'view_suppliers',
    'edit_supplier',
    'create_rfq',
    'view_rfq',
    'view_analytics',
    'export_data',
    'ai_optimization',
  ],
  senior_buyer: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'edit_supplier',
    'create_rfq',
    'view_rfq',
    'view_analytics',
    'ai_optimization',
  ],
  buyer: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'create_rfq',
    'view_rfq',
    'view_analytics',
  ],
  requester: [
    'create_purchase_order',
    'view_purchase_orders',
    'view_suppliers',
    'view_rfq',
  ],
  viewer: [
    'view_purchase_orders',
    'view_contracts',
    'view_suppliers',
    'view_rfq',
    'view_analytics',
  ],
  it_procurement: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'create_rfq',
    'view_rfq',
  ],
  facilities_procurement: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'create_rfq',
    'view_rfq',
  ],
  capital_procurement: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'create_rfq',
    'view_rfq',
  ],
  finance_approver: [
    'approve_purchase_order',
    'view_purchase_orders',
    'approve_contract',
    'view_contracts',
    'view_analytics',
  ],
  legal_approver: [
    'approve_contract',
    'view_contracts',
    'edit_contract',
    'terminate_contract',
  ],
};

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ProcurementRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<ProcurementPermission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true; // No role/permission requirements
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ProcurementUser;

    if (!user) {
      this.logger.warn('No user found in request for role check');
      throw new ForbiddenException('Authentication required');
    }

    const hasRole = this.validateRoles(user, requiredRoles);
    const hasPermission = this.validatePermissions(user, requiredPermissions);

    const endpoint = `${request.method} ${request.url}`;

    if (!hasRole || !hasPermission) {
      this.logger.warn(
        `Access denied for user ${user.email} to ${endpoint}. ` +
        `Required roles: [${requiredRoles?.join(', ') || 'none'}], ` +
        `Required permissions: [${requiredPermissions?.join(', ') || 'none'}], ` +
        `User roles: [${user.roles.join(', ')}]`
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    this.logger.log(
      `Access granted for user ${user.email} to ${endpoint} ` +
      `(roles: ${user.roles.join(', ')})`
    );

    return true;
  }

  private validateRoles(user: ProcurementUser, requiredRoles?: ProcurementRole[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some(role => user.roles.includes(role));
  }

  private validatePermissions(user: ProcurementUser, requiredPermissions?: ProcurementPermission[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get all permissions for user's roles
    const userPermissions = this.getUserPermissions(user);

    // Check if user has all required permissions
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission) || user.permissions.includes(permission)
    );
  }

  private getUserPermissions(user: ProcurementUser): ProcurementPermission[] {
    const permissions: Set<ProcurementPermission> = new Set();

    // Add role-based permissions
    user.roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    // Add explicit user permissions
    user.permissions.forEach(permission => {
      if (this.isValidPermission(permission)) {
        permissions.add(permission as ProcurementPermission);
      }
    });

    return Array.from(permissions);
  }

  private isValidPermission(permission: string): permission is ProcurementPermission {
    const validPermissions = Object.values(ROLE_PERMISSIONS).flat();
    return validPermissions.includes(permission as ProcurementPermission);
  }
}

// Decorators for role and permission requirements
export const Roles = (...roles: ProcurementRole[]) => SetMetadata('roles', roles);
export const Permissions = (...permissions: ProcurementPermission[]) => SetMetadata('permissions', permissions);

// Common role combinations
export const RequireAdmin = () => Roles('admin', 'procurement_admin');
export const RequireManager = () => Roles('admin', 'procurement_admin', 'procurement_manager');
export const RequireBuyer = () => Roles('admin', 'procurement_admin', 'procurement_manager', 'senior_buyer', 'buyer');
export const RequireApprover = () => Roles('admin', 'procurement_admin', 'procurement_manager', 'finance_approver');

// Common permission combinations
export const RequireCreatePO = () => Permissions('create_purchase_order');
export const RequireApprovePO = () => Permissions('approve_purchase_order');
export const RequireViewAnalytics = () => Permissions('view_analytics');
export const RequireBlockchainOps = () => Permissions('blockchain_operations');
export const RequireAIOptimization = () => Permissions('ai_optimization');
