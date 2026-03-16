/**
 * CRM Guards - Security and Access Control
 * 
 * This module exports all guards used for API protection and access control.
 * Guards are executed in the order they are applied to routes.
 * 
 * Recommended Guard Order:
 * 1. JwtAuthGuard - Validates authentication
 * 2. TenantGuard - Validates multi-tenant isolation
 * 3. RBACGuard - Validates role/permission-based access
 * 4. ResourceOwnerGuard - Validates resource ownership
 * 5. RateLimitGuard - Protects against abuse
 * 
 * @example
 * @UseGuards(JwtAuthGuard, TenantGuard, RBACGuard)
 * @Roles('admin', 'manager')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */

// Core Guards
export { JwtAuthGuard, Public } from './jwt-auth.guard';
export { TenantGuard, BypassTenant } from './tenant.guard';
export {
  RBACGuard,
  Roles,
  Permissions,
} from './rbac.guard';
export {
  ResourceOwnerGuard,
  CheckResourceOwner,
} from './resource-owner.guard';

// API Protection Guards
export {
  ApiKeyGuard,
  ApiKeyScope,
  RequiresApiKey,
} from './api-key.guard';
export {
  RateLimitGuard,
  RateLimit,
  BypassRateLimit,
} from './rate-limit.guard';

// Legacy Roles Guard
export {
  RolesGuard,
  Roles as LegacyRoles,
  UserTypes,
  Permissions as LegacyPermissions,
} from './roles.guard';
