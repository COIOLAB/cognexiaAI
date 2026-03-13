'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, setLoading, login } = useAuthStore();
  const hashProcessedRef = useRef(false);

  // Process hash auth SYNCHRONOUSLY before any child mounts (prevents 401 redirect race)
  if (typeof window !== 'undefined' && !hashProcessedRef.current) {
    const hash = window.location.hash;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout:18',message:'sync hash check',data:{hasHash:!!hash,hashPrefix:hash?.substring(0,10)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (hash.startsWith('#auth=')) {
      hashProcessedRef.current = true;
      try {
        const authParam = hash.substring(6);
        const decodedAuth = decodeURIComponent(authParam);
        const authData = JSON.parse(decodedAuth);
        // Store tokens immediately so any API calls from children have them
        localStorage.setItem('access_token', authData.accessToken);
        localStorage.setItem('refresh_token', authData.refreshToken);
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout:31',message:'sync tokens stored',data:{hasAccessToken:!!authData.accessToken},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
      } catch (_e) {
        hashProcessedRef.current = false;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout:34',message:'sync parse FAILED',data:{error:String(_e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      }
    }
  }

  useLayoutEffect(() => {
    // Check if auth tokens are passed via URL hash (from MFA redirect)
    const hash = window.location.hash;
    
    if (hash.startsWith('#auth=')) {
      try {
        const authParam = hash.substring(6); // Remove '#auth='
        const decodedAuth = decodeURIComponent(authParam);
        const authData = JSON.parse(decodedAuth);
        
        // Store in Zustand store (localStorage already set above)
        login(authData.user, authData.accessToken, authData.refreshToken);
        
        // Clean URL hash - keep current path (root / is the dashboard)
        const currentPath = window.location.pathname || '/';
        window.history.replaceState(null, '', currentPath);
        
        setLoading(false);
        return;
      } catch (error) {
        console.error('[AUTH] Failed to parse auth data from URL:', error);
      }
    }
    
    // Check if user is authenticated via localStorage
    const storedToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    console.log('[AUTH CHECK] Stored token:', !!storedToken);
    console.log('[AUTH CHECK] Stored refresh:', !!storedRefreshToken);
    console.log('[AUTH CHECK] Stored user:', !!storedUser);

    if (!storedToken) {
      // Don't redirect if we're in the middle of receiving auth via hash
      const hashPresent = typeof window !== 'undefined' && window.location.hash.startsWith('#auth=');
      if (hashPresent) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout:72',message:'no token but hash present, skip redirect',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        setLoading(false);
        return;
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout:77',message:'redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      setLoading(false);
      router.push('/login');
    } else {
      console.log('[AUTH CHECK] Token found in localStorage');
      setLoading(false);
    }
  }, [router, setLoading, login]);

  useEffect(() => {
    // Skip refresh when we just received tokens via hash (fresh login - access token is valid)
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#auth=')) {
      return;
    }

    const refreshAccessToken = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        if (data?.accessToken) {
          localStorage.setItem('access_token', data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
        }
      } catch {
        // Only redirect if we don't have a valid access token (avoid overriding fresh MFA login)
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
        if (!accessToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    };

    refreshAccessToken();
    const interval = setInterval(refreshAccessToken, 110000); // ~2 minutes
    return () => clearInterval(interval);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if tokens exist in localStorage as backup
  const hasToken = typeof window !== 'undefined' && 
    (localStorage.getItem('access_token') || localStorage.getItem('accessToken'));

  // Only block if not authenticated AND no token exists
  if (!isAuthenticated && !hasToken) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

