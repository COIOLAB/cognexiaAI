import { useAuthStore } from '@/stores/auth-store';
import { hasAnyRoleAccess, hasPermissionAccess } from '@/lib/rbac';

export function usePermissions() {
  const { user } = useAuthStore();
  return user?.permissions || [];
}

export function useHasPermission(permission: string) {
  const { user } = useAuthStore();
  return hasPermissionAccess(user, permission);
}

export function useHasRole(role: string) {
  const { user } = useAuthStore();
  return hasAnyRoleAccess(user, [role]);
}

export function useHasAnyRole(roles: string[]) {
  const { user } = useAuthStore();
  return hasAnyRoleAccess(user, roles);
}
