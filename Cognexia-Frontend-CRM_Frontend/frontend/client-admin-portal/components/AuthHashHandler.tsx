'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';

/**
 * When user is redirected from auth-portal after login/register, tokens are in URL hash (#auth=...).
 * This component reads the hash, stores auth in the store and localStorage, then clears the hash.
 */
export function AuthHashHandler() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCurrentOrganization = useTenantStore((s) => s.setCurrentOrganization);
  const processed = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || processed.current) return;
    const hash = window.location.hash;
    if (!hash.startsWith('#auth=')) return;

    processed.current = true;
    try {
      const authParam = hash.substring(6);
      const decoded = decodeURIComponent(authParam);
      const authData = JSON.parse(decoded) as {
        accessToken: string;
        refreshToken: string;
        user: Record<string, unknown>;
      };

      const u = authData.user;
      const user = {
        id: String(u.id),
        email: String(u.email),
        firstName: String(u.firstName ?? u.first_name ?? ''),
        lastName: String(u.lastName ?? u.last_name ?? ''),
        role: String(u.role ?? u.userType ?? 'org_user'),
        permissions: Array.isArray(u.permissions) ? u.permissions as string[] : [],
        organizationId: String(u.organizationId ?? u.organization_id ?? ''),
        organizationName: String(u.organizationName ?? u.organization_name ?? ''),
        phoneNumber: u.phoneNumber != null ? String(u.phoneNumber) : undefined,
        avatar: u.avatar != null ? String(u.avatar) : undefined,
      };

      setAuth(user, authData.accessToken, authData.refreshToken);
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      if (user.organizationId) {
        localStorage.setItem('organizationId', user.organizationId);
        setCurrentOrganization({
          id: user.organizationId,
          name: user.organizationName,
          slug: user.organizationId,
          plan: 'pro',
          isActive: true,
        });
      }

      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) {
      console.error('[AuthHashHandler] Failed to parse #auth=', e);
      processed.current = false;
    }
  }, [setAuth, setCurrentOrganization]);

  return null;
}
