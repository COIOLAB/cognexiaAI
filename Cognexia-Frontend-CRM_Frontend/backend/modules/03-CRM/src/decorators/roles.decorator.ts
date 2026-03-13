import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator for RBAC (Role-Based Access Control)
 * Used to specify which roles are allowed to access a route
 * 
 * @example
 * @Roles('admin', 'super_admin')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Multi-Tenant SaaS Role Constants
 */
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

/**
 * Convenience Decorators for Multi-Tenant SaaS
 */

/**
 * @RequiresSuperAdmin()
 * Only platform super admins can access this endpoint
 * Use for platform-wide management endpoints
 * 
 * @example
 * @RequiresSuperAdmin()
 * @Get('all-organizations')
 * getAllOrganizations() { ... }
 */
export const RequiresSuperAdmin = () => Roles(Role.SUPER_ADMIN);

/**
 * @RequiresOwner()
 * Organization owners and super admins can access
 * Use for sensitive organization management endpoints
 * 
 * @example
 * @RequiresOwner()
 * @Delete('organization')
 * deleteOrganization() { ... }
 */
export const RequiresOwner = () => Roles(Role.OWNER, Role.SUPER_ADMIN);

/**
 * @RequiresAdmin()
 * Organization admins, owners, and super admins can access
 * Use for administrative endpoints
 * 
 * @example
 * @RequiresAdmin()
 * @Post('users/invite')
 * inviteUser() { ... }
 */
export const RequiresAdmin = () => Roles(Role.ADMIN, Role.OWNER, Role.SUPER_ADMIN);

/**
 * @RequiresAuth()
 * Any authenticated user can access
 * Use for general authenticated endpoints
 * 
 * @example
 * @RequiresAuth()
 * @Get('profile')
 * getProfile() { ... }
 */
export const RequiresAuth = () => Roles(Role.USER, Role.ADMIN, Role.OWNER, Role.SUPER_ADMIN);
