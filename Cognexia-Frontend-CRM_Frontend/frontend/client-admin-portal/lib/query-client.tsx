'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Default options for React Query
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time - data is fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Cache time - unused data is garbage collected after 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry failed requests 3 times with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for 5xx errors or network errors
      return failureCount < 3;
    },
    
    // Exponential backoff delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus in production only
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch on mount for better UX
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once for network errors only
    retry: (failureCount, error: any) => {
      // Never retry mutations on HTTP errors
      if (error?.response) {
        return false;
      }
      // Retry once for network errors
      return failureCount < 1;
    },
    
    // Global error handler for mutations
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'An error occurred';
      toast.error(message);
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query Provider Component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Utility functions for cache management

/**
 * Invalidate all queries for a specific entity
 */
export function invalidateEntity(entity: string) {
  queryClient.invalidateQueries({ queryKey: [entity] });
}

/**
 * Invalidate specific entity by ID
 */
export function invalidateEntityById(entity: string, id: string) {
  queryClient.invalidateQueries({ queryKey: [entity, id] });
}

/**
 * Optimistically update entity in cache
 */
export function optimisticallyUpdateEntity<T>(
  entity: string,
  id: string,
  updater: (old: T | undefined) => T
) {
  queryClient.setQueryData<T>([entity, id], updater);
}

/**
 * Optimistically add entity to list cache
 */
export function optimisticallyAddToList<T>(
  entity: string,
  newItem: T,
  filters?: any
) {
  const queryKey = filters ? [entity, filters] : [entity];
  
  queryClient.setQueryData<{ data: T[]; total: number }>(
    queryKey,
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: [newItem, ...old.data],
        total: old.total + 1,
      };
    }
  );
}

/**
 * Optimistically remove entity from list cache
 */
export function optimisticallyRemoveFromList<T extends { id: string }>(
  entity: string,
  id: string,
  filters?: any
) {
  const queryKey = filters ? [entity, filters] : [entity];
  
  queryClient.setQueryData<{ data: T[]; total: number }>(
    queryKey,
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.filter((item) => item.id !== id),
        total: old.total - 1,
      };
    }
  );
}

/**
 * Prefetch entity data
 */
export async function prefetchEntity(
  entity: string,
  id: string,
  fetcher: () => Promise<any>
) {
  await queryClient.prefetchQuery({
    queryKey: [entity, id],
    queryFn: fetcher,
  });
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  queryClient.clear();
}
