import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role } from './entities/Role.entity';
import { Permission } from './entities/Permission.entity';
import { User } from './entities/User.entity';
import { UserRole } from './entities/UserRole.entity';
import { RolePermission } from './entities/RolePermission.entity';
import * as crypto from 'crypto';

export interface RBACPolicy {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  rules: RBACRule[];
}

export interface RBACRule {
  id: string;
  resource: string;
  action: string;
  conditions?: RBACCondition[];
  effect: 'ALLOW' | 'DENY';
  priority: number;
}

export interface RBACCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  context?: string;
}

export interface AccessRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  requestTime?: Date;
  sessionId?: string;
  ipAddress?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  appliedRules: RBACRule[];
  conditions?: string[];
  expiresAt?: Date;
  audit: {
    requestId: string;
    timestamp: Date;
    evaluationTime: number;
  };
}

export interface HierarchicalRole {
  role: Role;
  parents: Role[];
  children: Role[];
  inheritedPermissions: Permission[];
}

@Injectable()
export class RBACService {
  private readonly logger = new Logger(RBACService.name);
  private policyCache: Map<string, RBACPolicy> = new Map();
  private roleHierarchy: Map<string, HierarchicalRole> = new Map();

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeRBAC();
  }

  private async initializeRBAC(): Promise<void> {
    try {
      await this.loadDefaultRoles();
      await this.loadDefaultPermissions();
      await this.buildRoleHierarchy();
      await this.loadPolicies();

      this.logger.log('RBAC system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RBAC system', error);
    }
  }

  // Core Access Control Methods
  async checkAccess(request: AccessRequest): Promise<AccessDecision> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // Get user roles
      const userRoles = await this.getUserRoles(request.userId);
      if (!userRoles.length) {
        return this.denyAccess(requestId, startTime, 'No roles assigned to user');
      }

      // Get effective permissions
      const effectivePermissions = await this.getEffectivePermissions(userRoles);

      // Check basic permission
      const hasPermission = this.hasBasicPermission(effectivePermissions, request.resource, request.action);
      if (!hasPermission) {
        return this.denyAccess(requestId, startTime, 'Insufficient permissions');
      }

      // Apply RBAC policies
      const policyDecision = await this.applyPolicies(request, userRoles);
      if (!policyDecision.allowed) {
        return policyDecision;
      }

      // Check contextual constraints
      const contextCheck = await this.checkContextualConstraints(request, userRoles);
      if (!contextCheck.allowed) {
        return contextCheck;
      }

      // Check temporal constraints
      const temporalCheck = await this.checkTemporalConstraints(request, userRoles);
      if (!temporalCheck.allowed) {
        return temporalCheck;
      }

      // Log successful access
      await this.logAccessEvent(request, true, 'Access granted');

      return {
        allowed: true,
        appliedRules: [],
        audit: {
          requestId,
          timestamp: new Date(),
          evaluationTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      this.logger.error('Error in access control evaluation', error);
      return this.denyAccess(requestId, startTime, 'Internal error during access evaluation');
    }
  }

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if role exists
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new Error('Role not found');
      }

      // Check if assignment already exists
      const existing = await this.userRoleRepository.findOne({
        where: { userId, roleId },
      });
      if (existing) {
        throw new Error('Role already assigned to user');
      }

      // Create role assignment
      const userRole = this.userRoleRepository.create({
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        isActive: true,
      });

      await this.userRoleRepository.save(userRole);

      // Clear user cache and rebuild hierarchy
      await this.rebuildUserRoleCache(userId);

      // Emit event
      this.eventEmitter.emit('rbac.role.assigned', {
        userId,
        roleId,
        assignedBy,
        timestamp: new Date(),
      });

      this.logger.log(`Role ${roleId} assigned to user ${userId} by ${assignedBy}`);
    } catch (error) {
      this.logger.error('Error assigning role', error);
      throw error;
    }
  }

  async revokeRole(userId: string, roleId: string, revokedBy: string): Promise<void> {
    try {
      const userRole = await this.userRoleRepository.findOne({
        where: { userId, roleId, isActive: true },
      });

      if (!userRole) {
        throw new Error('Role assignment not found');
      }

      // Deactivate role assignment
      userRole.isActive = false;
      userRole.revokedBy = revokedBy;
      userRole.revokedAt = new Date();

      await this.userRoleRepository.save(userRole);

      // Clear user cache and rebuild hierarchy
      await this.rebuildUserRoleCache(userId);

      // Emit event
      this.eventEmitter.emit('rbac.role.revoked', {
        userId,
        roleId,
        revokedBy,
        timestamp: new Date(),
      });

      this.logger.log(`Role ${roleId} revoked from user ${userId} by ${revokedBy}`);
    } catch (error) {
      this.logger.error('Error revoking role', error);
      throw error;
    }
  }

  // Role Management
  async createRole(roleData: {
    name: string;
    description?: string;
    parentRoles?: string[];
    permissions?: string[];
    metadata?: Record<string, any>;
  }): Promise<Role> {
    try {
      const role = this.roleRepository.create({
        id: crypto.randomUUID(),
        name: roleData.name,
        description: roleData.description,
        metadata: roleData.metadata || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.roleRepository.save(role);

      // Assign parent roles if specified
      if (roleData.parentRoles?.length) {
        await this.assignParentRoles(role.id, roleData.parentRoles);
      }

      // Assign permissions if specified
      if (roleData.permissions?.length) {
        await this.assignPermissionsToRole(role.id, roleData.permissions);
      }

      // Rebuild hierarchy
      await this.buildRoleHierarchy();

      this.eventEmitter.emit('rbac.role.created', role);

      return role;
    } catch (error) {
      this.logger.error('Error creating role', error);
      throw error;
    }
  }

  async createPermission(permissionData: {
    name: string;
    resource: string;
    action: string;
    description?: string;
    conditions?: RBACCondition[];
    metadata?: Record<string, any>;
  }): Promise<Permission> {
    try {
      const permission = this.permissionRepository.create({
        id: crypto.randomUUID(),
        name: permissionData.name,
        resource: permissionData.resource,
        action: permissionData.action,
        description: permissionData.description,
        conditions: permissionData.conditions || [],
        metadata: permissionData.metadata || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.permissionRepository.save(permission);

      this.eventEmitter.emit('rbac.permission.created', permission);

      return permission;
    } catch (error) {
      this.logger.error('Error creating permission', error);
      throw error;
    }
  }

  // Query Methods
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const userRoles = await this.userRoleRepository.find({
        where: { userId, isActive: true },
        relations: ['role'],
      });

      return userRoles.map(ur => ur.role);
    } catch (error) {
      this.logger.error('Error getting user roles', error);
      throw error;
    }
  }

  async getEffectivePermissions(roles: Role[]): Promise<Permission[]> {
    try {
      const permissionIds = new Set<string>();

      for (const role of roles) {
        // Get direct permissions
        const rolePermissions = await this.rolePermissionRepository.find({
          where: { roleId: role.id, isActive: true },
          relations: ['permission'],
        });

        rolePermissions.forEach(rp => permissionIds.add(rp.permission.id));

        // Get inherited permissions from role hierarchy
        const hierarchicalRole = this.roleHierarchy.get(role.id);
        if (hierarchicalRole) {
          hierarchicalRole.inheritedPermissions.forEach(p => permissionIds.add(p.id));
        }
      }

      const permissions = await this.permissionRepository.findByIds(Array.from(permissionIds));
      return permissions.filter(p => p.isActive);
    } catch (error) {
      this.logger.error('Error getting effective permissions', error);
      throw error;
    }
  }

  async getRolesByResource(resource: string): Promise<Role[]> {
    try {
      const permissions = await this.permissionRepository.find({
        where: { resource, isActive: true },
      });

      const roleIds = new Set<string>();
      for (const permission of permissions) {
        const rolePermissions = await this.rolePermissionRepository.find({
          where: { permissionId: permission.id, isActive: true },
        });
        rolePermissions.forEach(rp => roleIds.add(rp.roleId));
      }

      return await this.roleRepository.findByIds(Array.from(roleIds));
    } catch (error) {
      this.logger.error('Error getting roles by resource', error);
      throw error;
    }
  }

  // Private Helper Methods
  private async loadDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'SuperAdmin',
        description: 'Full system access with all permissions',
        level: 'SYSTEM',
      },
      {
        name: 'InventoryManager',
        description: 'Full inventory management permissions',
        level: 'MANAGER',
      },
      {
        name: 'WarehouseManager',
        description: 'Warehouse operations management',
        level: 'MANAGER',
      },
      {
        name: 'InventoryAnalyst',
        description: 'Inventory analytics and reporting',
        level: 'ANALYST',
      },
      {
        name: 'WarehouseOperator',
        description: 'Basic warehouse operations',
        level: 'OPERATOR',
      },
      {
        name: 'QualityController',
        description: 'Quality control and assurance',
        level: 'SPECIALIST',
      },
      {
        name: 'Auditor',
        description: 'Audit and compliance access',
        level: 'AUDITOR',
      },
      {
        name: 'Viewer',
        description: 'Read-only access to inventory data',
        level: 'VIEWER',
      },
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.roleRepository.findOne({ where: { name: roleData.name } });
      if (!existing) {
        const role = this.roleRepository.create({
          id: crypto.randomUUID(),
          name: roleData.name,
          description: roleData.description,
          metadata: { level: roleData.level },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.roleRepository.save(role);
      }
    }
  }

  private async loadDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Inventory Items
      { name: 'Create Inventory Item', resource: 'inventory_items', action: 'create' },
      { name: 'Read Inventory Item', resource: 'inventory_items', action: 'read' },
      { name: 'Update Inventory Item', resource: 'inventory_items', action: 'update' },
      { name: 'Delete Inventory Item', resource: 'inventory_items', action: 'delete' },
      { name: 'List Inventory Items', resource: 'inventory_items', action: 'list' },

      // Stock Movements
      { name: 'Create Stock Movement', resource: 'stock_movements', action: 'create' },
      { name: 'Read Stock Movement', resource: 'stock_movements', action: 'read' },
      { name: 'Update Stock Movement', resource: 'stock_movements', action: 'update' },
      { name: 'List Stock Movements', resource: 'stock_movements', action: 'list' },

      // Locations
      { name: 'Create Location', resource: 'locations', action: 'create' },
      { name: 'Read Location', resource: 'locations', action: 'read' },
      { name: 'Update Location', resource: 'locations', action: 'update' },
      { name: 'Delete Location', resource: 'locations', action: 'delete' },
      { name: 'List Locations', resource: 'locations', action: 'list' },

      // Analytics
      { name: 'View Analytics', resource: 'analytics', action: 'read' },
      { name: 'Generate Reports', resource: 'analytics', action: 'generate' },
      { name: 'Export Data', resource: 'analytics', action: 'export' },

      // System
      { name: 'System Administration', resource: 'system', action: 'admin' },
      { name: 'User Management', resource: 'users', action: 'manage' },
      { name: 'Role Management', resource: 'roles', action: 'manage' },
      { name: 'Audit Access', resource: 'audit', action: 'read' },
    ];

    for (const permData of defaultPermissions) {
      const existing = await this.permissionRepository.findOne({
        where: { name: permData.name },
      });
      if (!existing) {
        const permission = this.permissionRepository.create({
          id: crypto.randomUUID(),
          name: permData.name,
          resource: permData.resource,
          action: permData.action,
          description: `${permData.action} access to ${permData.resource}`,
          conditions: [],
          metadata: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.permissionRepository.save(permission);
      }
    }
  }

  private async buildRoleHierarchy(): Promise<void> {
    // Implementation for role hierarchy building
  }

  private async loadPolicies(): Promise<void> {
    // Implementation for policy loading
  }

  private hasBasicPermission(permissions: Permission[], resource: string, action: string): boolean {
    return permissions.some(p => p.resource === resource && p.action === action);
  }

  private async applyPolicies(request: AccessRequest, roles: Role[]): Promise<AccessDecision> {
    // Implementation for policy application
    return {
      allowed: true,
      appliedRules: [],
      audit: {
        requestId: crypto.randomUUID(),
        timestamp: new Date(),
        evaluationTime: 0,
      },
    };
  }

  private async checkContextualConstraints(request: AccessRequest, roles: Role[]): Promise<AccessDecision> {
    // Implementation for contextual constraint checking
    return {
      allowed: true,
      appliedRules: [],
      audit: {
        requestId: crypto.randomUUID(),
        timestamp: new Date(),
        evaluationTime: 0,
      },
    };
  }

  private async checkTemporalConstraints(request: AccessRequest, roles: Role[]): Promise<AccessDecision> {
    // Implementation for temporal constraint checking
    return {
      allowed: true,
      appliedRules: [],
      audit: {
        requestId: crypto.randomUUID(),
        timestamp: new Date(),
        evaluationTime: 0,
      },
    };
  }

  private denyAccess(requestId: string, startTime: number, reason: string): AccessDecision {
    return {
      allowed: false,
      reason,
      appliedRules: [],
      audit: {
        requestId,
        timestamp: new Date(),
        evaluationTime: Date.now() - startTime,
      },
    };
  }

  private async logAccessEvent(request: AccessRequest, success: boolean, reason: string): Promise<void> {
    // Implementation for access event logging
  }

  private async rebuildUserRoleCache(userId: string): Promise<void> {
    // Implementation for user role cache rebuilding
  }

  private async assignParentRoles(roleId: string, parentRoleIds: string[]): Promise<void> {
    // Implementation for parent role assignment
  }

  private async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    // Implementation for permission to role assignment
  }
}
