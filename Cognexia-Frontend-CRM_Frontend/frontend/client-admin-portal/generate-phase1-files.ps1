# Phase 1 File Generation Script
Write-Host "🚀 Generating Phase 1 Files..." -ForegroundColor Green

$baseDir = "C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\client-admin-portal"

# Create custom hooks
@"
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
"@ | Out-File -FilePath "$baseDir\hooks\useDebounce.ts" -Encoding UTF8

@"
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
"@ | Out-File -FilePath "$baseDir\hooks\useLocalStorage.ts" -Encoding UTF8

@"
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
"@ | Out-File -FilePath "$baseDir\hooks\useMediaQuery.ts" -Encoding UTF8

@"
import { useState, useCallback } from 'react';

export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
"@ | Out-File -FilePath "$baseDir\hooks\useDisclosure.ts" -Encoding UTF8

@"
import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}
"@ | Out-File -FilePath "$baseDir\hooks\useClickOutside.ts" -Encoding UTF8

# Create RBAC hooks
@"
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
"@ | Out-File -FilePath "$baseDir\hooks\useRBAC.ts" -Encoding UTF8

# Create Protected Route wrapper
@"
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className=`"flex items-center justify-center min-h-screen`">
        <div className=`"animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full`" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
"@ | Out-File -FilePath "$baseDir\components\ProtectedRoute.tsx" -Encoding UTF8

Write-Host "✅ Phase 1 hooks and components created!" -ForegroundColor Green
Write-Host "📦 Files generated in: $baseDir" -ForegroundColor Cyan
"@ 