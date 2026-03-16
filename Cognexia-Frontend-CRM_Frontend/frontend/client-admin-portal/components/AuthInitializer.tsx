'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Initializes the auth store from localStorage on app mount.
 * This ensures authentication state is available before any protected routes are checked.
 */
export function AuthInitializer() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initAuth();
  }, [initAuth]);

  return null;
}
