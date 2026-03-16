'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * When super admin is redirected from auth-portal after login, tokens are in URL hash (#auth=...).
 * This component reads the hash, stores auth in localStorage, then clears the hash.
 * It also validates that the user is actually a super admin.
 */
export function AuthHashHandler() {
  const router = useRouter();
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
        user: {
          id: string;
          email: string;
          firstName?: string;
          lastName?: string;
          userType?: string;
          roles?: string[];
          [key: string]: any;
        };
      };

      const user = authData.user;
      const isSuperAdmin = 
        user.userType === 'SUPER_ADMIN' || 
        user.userType === 'super_admin' || 
        user.roles?.includes('SUPER_ADMIN') || 
        user.roles?.includes('super_admin');

      // Security: Only allow super admin users
      if (!isSuperAdmin) {
        toast.error('Access denied. Super Admin credentials required.');
        const authPortalUrl = process.env.NEXT_PUBLIC_AUTH_PORTAL_URL || 'https://cognexiaai.com';
        window.location.href = authPortalUrl;
        return;
      }

      // Store auth data
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Clear hash from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      
      // Refresh to load dashboard with auth
      setTimeout(() => router.refresh(), 100);
    } catch (e) {
      console.error('[AuthHashHandler] Failed to parse #auth=', e);
      toast.error('Authentication failed. Please try again.');
      processed.current = false;
    }
  }, [router]);

  return null;
}
