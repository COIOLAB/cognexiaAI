'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/services/auth.api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshAccessToken = async () => {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) return;

      try {
        const response = await authApi.refreshToken({ refreshToken });
        if (response?.accessToken) {
          useAuthStore.getState().updateTokens(response.accessToken, refreshToken);
        }
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    };

    refreshAccessToken();
    const interval = setInterval(refreshAccessToken, 110000); // ~2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
