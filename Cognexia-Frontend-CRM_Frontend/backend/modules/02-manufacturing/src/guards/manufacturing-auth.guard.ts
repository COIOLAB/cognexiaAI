import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export enum ManufacturingRole {
  SUPER_ADMIN = 'super_admin',
  PLANT_MANAGER = 'plant_manager',
  PRODUCTION_MANAGER = 'production_manager',
  QUALITY_MANAGER = 'quality_manager',
  MAINTENANCE_MANAGER = 'maintenance_manager',
  FLOOR_SUPERVISOR = 'floor_supervisor',
  PRODUCTION_ENGINEER = 'production_engineer',
  QUALITY_ENGINEER = 'quality_engineer',
  MAINTENANCE_ENGINEER = 'maintenance_engineer',
  MACHINE_OPERATOR = 'machine_operator',
  QUALITY_INSPECTOR = 'quality_inspector',
  MAINTENANCE_TECHNICIAN = 'maintenance_technician',
  VIEWER = 'viewer'
}

export enum ManufacturingPermission {
  // Work Center Permissions
  CREATE_WORK_CENTER = 'create_work_center',
  VIEW_WORK_CENTER = 'view_work_center',
  UPDATE_WORK_CENTER = 'update_work_center',
  DELETE_WORK_CENTER = 'delete_work_center',
  MANAGE_WORK_CENTER = 'manage_work_center',

  // Production Line Permissions
  CREATE_PRODUCTION_LINE = 'create_production_line',
  VIEW_PRODUCTION_LINE = 'view_production_line',
  UPDATE_PRODUCTION_LINE = 'update_production_line',
  DELETE_PRODUCTION_LINE = 'delete_production_line',
  OPERATE_PRODUCTION_LINE = 'operate_production_line',
  EMERGENCY_STOP_PRODUCTION_LINE = 'emergency_stop_production_line',

  // Production Order Permissions
  CREATE_PRODUCTION_ORDER = 'create_production_order',
  VIEW_PRODUCTION_ORDER = 'view_production_order',
  UPDATE_PRODUCTION_ORDER = 'update_production_order',
  DELETE_PRODUCTION_ORDER = 'delete_production_order',
  APPROVE_PRODUCTION_ORDER = 'approve_production_order',
  RELEASE_PRODUCTION_ORDER = 'release_production_order',
  CLOSE_PRODUCTION_ORDER = 'close_production_order',

  // Work Order Permissions
  CREATE_WORK_ORDER = 'create_work_order',
  VIEW_WORK_ORDER = 'view_work_order',
  UPDATE_WORK_ORDER = 'update_work_order',
  DELETE_WORK_ORDER = 'delete_work_order',
  EXECUTE_WORK_ORDER = 'execute_work_order',
  COMPLETE_WORK_ORDER = 'complete_work_order',

  // Bill of Materials Permissions
  CREATE_BOM = 'create_bom',
  VIEW_BOM = 'view_bom',
  UPDATE_BOM = 'update_bom',
  DELETE_BOM = 'delete_bom',
  APPROVE_BOM = 'approve_bom',

  // Routing Permissions
  CREATE_ROUTING = 'create_routing',
  VIEW_ROUTING = 'view_routing',
  UPDATE_ROUTING = 'update_routing',
  DELETE_ROUTING = 'delete_routing',
  APPROVE_ROUTING = 'approve_routing',

  // Quality Control Permissions
  CREATE_QUALITY_CHECK = 'create_quality_check',
  VIEW_QUALITY_CHECK = 'view_quality_check',
  UPDATE_QUALITY_CHECK = 'update_quality_check',
  DELETE_QUALITY_CHECK = 'delete_quality_check',
  APPROVE_QUALITY_CHECK = 'approve_quality_check',
  REJECT_QUALITY_CHECK = 'reject_quality_check',

  // Digital Twin Permissions
  CREATE_DIGITAL_TWIN = 'create_digital_twin',
  VIEW_DIGITAL_TWIN = 'view_digital_twin',
  UPDATE_DIGITAL_TWIN = 'update_digital_twin',
  DELETE_DIGITAL_TWIN = 'delete_digital_twin',
  SIMULATE_DIGITAL_TWIN = 'simulate_digital_twin',
  SYNC_DIGITAL_TWIN = 'sync_digital_twin',

  // IoT Device Permissions
  CREATE_IOT_DEVICE = 'create_iot_device',
  VIEW_IOT_DEVICE = 'view_iot_device',
  UPDATE_IOT_DEVICE = 'update_iot_device',
  DELETE_IOT_DEVICE = 'delete_iot_device',
  CONFIGURE_IOT_DEVICE = 'configure_iot_device',
  CALIBRATE_IOT_DEVICE = 'calibrate_iot_device',

  // Analytics Permissions
  VIEW_ANALYTICS = 'view_analytics',
  CREATE_REPORTS = 'create_reports',
  EXPORT_DATA = 'export_data',
  VIEW_REAL_TIME_DATA = 'view_real_time_data',

  // Security Permissions
  MANAGE_SECURITY = 'manage_security',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  EMERGENCY_SHUTDOWN = 'emergency_shutdown',

  // System Permissions
  SYSTEM_ADMIN = 'system_admin',
  BACKUP_DATA = 'backup_data',
  RESTORE_DATA = 'restore_data'
}

const ROLE_PERMISSIONS: Record<ManufacturingRole, ManufacturingPermission[]> = {
  [ManufacturingRole.SUPER_ADMIN]: Object.values(ManufacturingPermission),
  
  [ManufacturingRole.PLANT_MANAGER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.UPDATE_WORK_CENTER,
    ManufacturingPermission.MANAGE_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.UPDATE_PRODUCTION_LINE,
    ManufacturingPermission.CREATE_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.UPDATE_PRODUCTION_ORDER,
    ManufacturingPermission.APPROVE_PRODUCTION_ORDER,
    ManufacturingPermission.RELEASE_PRODUCTION_ORDER,
    ManufacturingPermission.CLOSE_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.CREATE_REPORTS,
    ManufacturingPermission.EXPORT_DATA,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
    ManufacturingPermission.VIEW_AUDIT_LOGS,
    ManufacturingPermission.EMERGENCY_SHUTDOWN,
  ],

  [ManufacturingRole.PRODUCTION_MANAGER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.OPERATE_PRODUCTION_LINE,
    ManufacturingPermission.CREATE_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.UPDATE_PRODUCTION_ORDER,
    ManufacturingPermission.RELEASE_PRODUCTION_ORDER,
    ManufacturingPermission.CREATE_WORK_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.UPDATE_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
    ManufacturingPermission.EMERGENCY_STOP_PRODUCTION_LINE,
  ],

  [ManufacturingRole.QUALITY_MANAGER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.CREATE_QUALITY_CHECK,
    ManufacturingPermission.VIEW_QUALITY_CHECK,
    ManufacturingPermission.UPDATE_QUALITY_CHECK,
    ManufacturingPermission.DELETE_QUALITY_CHECK,
    ManufacturingPermission.APPROVE_QUALITY_CHECK,
    ManufacturingPermission.REJECT_QUALITY_CHECK,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.APPROVE_BOM,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.CREATE_REPORTS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.MAINTENANCE_MANAGER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.UPDATE_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.UPDATE_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.CREATE_WORK_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.UPDATE_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.UPDATE_IOT_DEVICE,
    ManufacturingPermission.CONFIGURE_IOT_DEVICE,
    ManufacturingPermission.CALIBRATE_IOT_DEVICE,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
    ManufacturingPermission.EMERGENCY_STOP_PRODUCTION_LINE,
  ],

  [ManufacturingRole.FLOOR_SUPERVISOR]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.OPERATE_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.UPDATE_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.UPDATE_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.COMPLETE_WORK_ORDER,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_QUALITY_CHECK,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
    ManufacturingPermission.EMERGENCY_STOP_PRODUCTION_LINE,
  ],

  [ManufacturingRole.PRODUCTION_ENGINEER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.UPDATE_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.UPDATE_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.CREATE_BOM,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.UPDATE_BOM,
    ManufacturingPermission.CREATE_ROUTING,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.UPDATE_ROUTING,
    ManufacturingPermission.CREATE_DIGITAL_TWIN,
    ManufacturingPermission.VIEW_DIGITAL_TWIN,
    ManufacturingPermission.UPDATE_DIGITAL_TWIN,
    ManufacturingPermission.SIMULATE_DIGITAL_TWIN,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.QUALITY_ENGINEER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.CREATE_QUALITY_CHECK,
    ManufacturingPermission.VIEW_QUALITY_CHECK,
    ManufacturingPermission.UPDATE_QUALITY_CHECK,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.UPDATE_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.CONFIGURE_IOT_DEVICE,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.MAINTENANCE_ENGINEER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.UPDATE_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.UPDATE_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.CREATE_WORK_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.UPDATE_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.CREATE_IOT_DEVICE,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.UPDATE_IOT_DEVICE,
    ManufacturingPermission.CONFIGURE_IOT_DEVICE,
    ManufacturingPermission.CALIBRATE_IOT_DEVICE,
    ManufacturingPermission.VIEW_ANALYTICS,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.MACHINE_OPERATOR]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.OPERATE_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.COMPLETE_WORK_ORDER,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
    ManufacturingPermission.EMERGENCY_STOP_PRODUCTION_LINE,
  ],

  [ManufacturingRole.QUALITY_INSPECTOR]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.CREATE_QUALITY_CHECK,
    ManufacturingPermission.VIEW_QUALITY_CHECK,
    ManufacturingPermission.UPDATE_QUALITY_CHECK,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.MAINTENANCE_TECHNICIAN]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.EXECUTE_WORK_ORDER,
    ManufacturingPermission.COMPLETE_WORK_ORDER,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.CONFIGURE_IOT_DEVICE,
    ManufacturingPermission.CALIBRATE_IOT_DEVICE,
    ManufacturingPermission.VIEW_REAL_TIME_DATA,
  ],

  [ManufacturingRole.VIEWER]: [
    ManufacturingPermission.VIEW_WORK_CENTER,
    ManufacturingPermission.VIEW_PRODUCTION_LINE,
    ManufacturingPermission.VIEW_PRODUCTION_ORDER,
    ManufacturingPermission.VIEW_WORK_ORDER,
    ManufacturingPermission.VIEW_BOM,
    ManufacturingPermission.VIEW_ROUTING,
    ManufacturingPermission.VIEW_QUALITY_CHECK,
    ManufacturingPermission.VIEW_IOT_DEVICE,
    ManufacturingPermission.VIEW_ANALYTICS,
  ],
};

export const RequirePermissions = (...permissions: ManufacturingPermission[]) =>
  Reflector.createDecorator<ManufacturingPermission[]>({ permissions });

export const RequireRoles = (...roles: ManufacturingRole[]) =>
  Reflector.createDecorator<ManufacturingRole[]>({ roles });

@Injectable()
export class ManufacturingAuthGuard implements CanActivate {
  private readonly logger = new Logger(ManufacturingAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if authentication is required
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Extract and validate JWT token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('No authentication token provided');
      throw new UnauthorizedException('Authentication token required');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch (error) {
      this.logger.warn(`Invalid authentication token: ${error.message}`);
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Check role-based access
    const requiredRoles = this.reflector.getAllAndOverride<ManufacturingRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const userRole = payload.role as ManufacturingRole;
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        this.logger.warn(`User ${payload.sub} with role ${userRole} attempted to access endpoint requiring roles: ${requiredRoles.join(', ')}`);
        throw new ForbiddenException('Insufficient role privileges');
      }
    }

    // Check permission-based access
    const requiredPermissions = this.reflector.getAllAndOverride<ManufacturingPermission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = this.getUserPermissions(userRole, payload.permissions || []);
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(permission => 
          !userPermissions.includes(permission)
        );
        this.logger.warn(`User ${payload.sub} lacks required permissions: ${missingPermissions.join(', ')}`);
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check manufacturing-specific constraints
    const workCenterId = request.params?.workCenterId || request.body?.workCenterId;
    const productionLineId = request.params?.productionLineId || request.body?.productionLineId;

    if (workCenterId || productionLineId) {
      const hasAccessToResource = await this.checkResourceAccess(
        payload.sub,
        userRole,
        workCenterId,
        productionLineId
      );

      if (!hasAccessToResource) {
        this.logger.warn(`User ${payload.sub} denied access to resource: workCenter=${workCenterId}, productionLine=${productionLineId}`);
        throw new ForbiddenException('Access denied to manufacturing resource');
      }
    }

    // Log successful authorization
    this.logger.log(`User ${payload.sub} (${userRole}) authorized for ${request.method} ${request.url}`);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getUserPermissions(role: ManufacturingRole, additionalPermissions: string[] = []): ManufacturingPermission[] {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    const userAdditionalPermissions = additionalPermissions
      .filter(permission => Object.values(ManufacturingPermission).includes(permission as ManufacturingPermission))
      .map(permission => permission as ManufacturingPermission);
    
    return [...new Set([...rolePermissions, ...userAdditionalPermissions])];
  }

  private async checkResourceAccess(
    userId: string,
    userRole: ManufacturingRole,
    workCenterId?: string,
    productionLineId?: string
  ): Promise<boolean> {
    // Super admin and plant manager have access to all resources
    if ([ManufacturingRole.SUPER_ADMIN, ManufacturingRole.PLANT_MANAGER].includes(userRole)) {
      return true;
    }

    // TODO: Implement resource-based access control
    // This would typically check user assignments to specific work centers or production lines
    // For now, we allow access based on role permissions
    return true;
  }
}
