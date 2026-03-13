import { useAuthStore } from '@/stores/auth-store';

export function usePermissions() {
  const { user } = useAuthStore();
  return user?.permissions || [];
}

export function useHasPermission(permission: string) {
  const permissions = usePermissions();
  return permissions.includes(permission);
}

export function useHasRole(role: string) {
  const { user } = useAuthStore();
  return user?.role === role;
}

export function useHasAnyRole(roles: string[]) {
  const { user } = useAuthStore();
  return roles.includes(user?.role || '');
}
