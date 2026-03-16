/**
 * React Hooks for Procurement SDK
 * 
 * Custom React hooks for seamless integration with the Procurement API.
 * Provides type-safe, stateful hooks for common operations like data fetching,
 * real-time updates, and form handling.
 * 
 * @version 2.0.0
 * @author Industry 5.0 ERP Team
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ProcurementSDK, { 
  ProcurementSDKError, 
  AuthToken,
  PaginationParams,
  DateRangeFilter 
} from './procurement-sdk';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ProcurementSDKError | null;
  refetch: () => Promise<void>;
}

export interface UsePaginatedState<T> extends UseAsyncState<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export interface UseMutationState<T, P> {
  data: T | null;
  loading: boolean;
  error: ProcurementSDKError | null;
  mutate: (params: P) => Promise<T>;
  reset: () => void;
}

export interface UseRealtimeOptions {
  interval?: number;
  enabled?: boolean;
  onUpdate?: (data: any) => void;
  onError?: (error: ProcurementSDKError) => void;
}

// ============================================================================
// CONTEXT PROVIDER
// ============================================================================

import React, { createContext, useContext, ReactNode } from 'react';

interface ProcurementContextType {
  sdk: ProcurementSDK;
  auth: {
    token: AuthToken | null;
    setToken: (token: AuthToken | null) => void;
    isAuthenticated: boolean;
  };
}

const ProcurementContext = createContext<ProcurementContextType | null>(null);

export interface ProcurementProviderProps {
  children: ReactNode;
  sdk: ProcurementSDK;
}

export const ProcurementProvider: React.FC<ProcurementProviderProps> = ({ 
  children, 
  sdk 
}) => {
  const [token, setToken] = useState<AuthToken | null>(null);

  const setAuthToken = useCallback((newToken: AuthToken | null) => {
    setToken(newToken);
    if (newToken) {
      sdk.setAuthToken(newToken);
    } else {
      sdk.clearAuthToken();
    }
  }, [sdk]);

  const contextValue = useMemo(() => ({
    sdk,
    auth: {
      token,
      setToken: setAuthToken,
      isAuthenticated: sdk.isAuthenticated(),
    },
  }), [sdk, token, setAuthToken]);

  return (
    <ProcurementContext.Provider value={contextValue}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurementSDK = (): ProcurementContextType => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurementSDK must be used within a ProcurementProvider');
  }
  return context;
};

// ============================================================================
// GENERIC HOOKS
// ============================================================================

/**
 * Generic async data fetching hook
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProcurementSDKError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as ProcurementSDKError);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Generic mutation hook
 */
export function useMutation<T, P>(
  mutationFunction: (params: P) => Promise<T>
): UseMutationState<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProcurementSDKError | null>(null);

  const mutate = useCallback(async (params: P): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFunction(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err as ProcurementSDKError;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

/**
 * Paginated data hook
 */
export function usePaginated<T>(
  fetchFunction: (pagination: PaginationParams) => Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>,
  initialPage: number = 1,
  initialLimit: number = 20
): UsePaginatedState<T> {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const { data, loading, error, refetch } = useAsync(async () => {
    const result = await fetchFunction({ page, limit });
    setPagination({
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    });
    return result.items;
  }, [page, limit, fetchFunction]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      setPage(p => p + 1);
    }
  }, [pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      setPage(p => p - 1);
    }
  }, [pagination.hasPreviousPage]);

  return {
    data,
    loading,
    error,
    refetch,
    pagination,
    setPage,
    setLimit,
    nextPage,
    previousPage,
  };
}

/**
 * Real-time data hook with polling
 */
export function useRealtime<T>(
  fetchFunction: () => Promise<T>,
  options: UseRealtimeOptions = {}
): UseAsyncState<T> {
  const { interval = 30000, enabled = true, onUpdate, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProcurementSDKError | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      if (!loading) {
        setLoading(true);
        setError(null);
      }
      const result = await fetchFunction();
      setData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(result)) {
          onUpdate?.(result);
        }
        return result;
      });
    } catch (err) {
      const error = err as ProcurementSDKError;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, onUpdate, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData(); // Initial fetch
      
      intervalRef.current = setInterval(fetchData, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// SUPPLIER HOOKS
// ============================================================================

/**
 * Search suppliers with filters
 */
export function useSuppliers(filters?: any, pagination?: PaginationParams) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => sdk.searchSuppliers(filters, pagination),
    [filters, pagination]
  );
}

/**
 * Get supplier by ID
 */
export function useSupplier(supplierId: string | null) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => supplierId ? sdk.getSupplier(supplierId) : Promise.resolve(null),
    [supplierId]
  );
}

/**
 * Supplier onboarding mutation
 */
export function useSupplierOnboarding() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: { supplierData: any; onboardedBy?: string }) =>
    sdk.onboardSupplier(data.supplierData, data.onboardedBy)
  );
}

/**
 * Supplier performance report
 */
export function useSupplierPerformanceReport(
  supplierId: string | null,
  dateRange?: DateRangeFilter
) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => supplierId 
      ? sdk.getSupplierPerformanceReport(supplierId, dateRange)
      : Promise.resolve(null),
    [supplierId, dateRange]
  );
}

/**
 * Supplier discovery
 */
export function useSupplierDiscovery() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: { requirements: any; excludeSuppliers?: string[] }) =>
    sdk.discoverSuppliers(data.requirements, data.excludeSuppliers)
  );
}

/**
 * Supplier analytics with real-time updates
 */
export function useSupplierAnalytics(
  timeframe?: string,
  realtime: boolean = false
) {
  const { sdk } = useProcurementSDK();
  
  const fetchFunction = useCallback(
    () => sdk.getSupplierAnalytics(timeframe),
    [sdk, timeframe]
  );
  
  return realtime 
    ? useRealtime(fetchFunction, { interval: 60000 })
    : useAsync(fetchFunction, [timeframe]);
}

// ============================================================================
// CONTRACT HOOKS
// ============================================================================

/**
 * Search contracts with filters
 */
export function useContracts(filters?: any, pagination?: PaginationParams) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => sdk.searchContracts(filters, pagination),
    [filters, pagination]
  );
}

/**
 * Get contract by ID
 */
export function useContract(contractId: string | null) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => contractId ? sdk.getContract(contractId) : Promise.resolve(null),
    [contractId]
  );
}

/**
 * Contract creation mutation
 */
export function useContractCreation() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: { contractData: any; createdBy?: string }) =>
    sdk.createContract(data.contractData, data.createdBy)
  );
}

/**
 * Contract analysis
 */
export function useContractAnalysis(contractId: string | null) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => contractId ? sdk.analyzeContract(contractId) : Promise.resolve(null),
    [contractId]
  );
}

/**
 * Contract renewal mutation
 */
export function useContractRenewal() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: { contractId: string; renewalData: any }) =>
    sdk.renewContract(data.contractId, data.renewalData)
  );
}

// ============================================================================
// PURCHASE ORDER HOOKS
// ============================================================================

/**
 * Autonomous purchase order processing
 */
export function useAutonomousPO() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((request: any) =>
    sdk.processAutonomousPO(request)
  );
}

/**
 * Batch purchase order processing
 */
export function useBatchPOs() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((requests: any[]) =>
    sdk.batchProcessPOs(requests)
  );
}

/**
 * Purchase order optimization
 */
export function usePOOptimization() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((purchaseOrderId: string) =>
    sdk.optimizePurchaseOrder(purchaseOrderId)
  );
}

/**
 * Consolidation opportunities
 */
export function useConsolidationOpportunities(
  department?: string,
  timeWindow?: number
) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => sdk.getConsolidationOpportunities(department, timeWindow),
    [department, timeWindow]
  );
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * Dashboard metrics with real-time updates
 */
export function useDashboardMetrics(
  options?: {
    timeframe?: string;
    refreshCache?: boolean;
    departments?: string[];
    categories?: string[];
  },
  realtime: boolean = true
) {
  const { sdk } = useProcurementSDK();
  
  const fetchFunction = useCallback(
    () => sdk.getDashboardMetrics(options),
    [sdk, options]
  );
  
  return realtime 
    ? useRealtime(fetchFunction, { 
        interval: 30000,
        onUpdate: (data) => console.log('Dashboard updated:', data)
      })
    : useAsync(fetchFunction, [options]);
}

/**
 * Dashboard alerts with real-time updates
 */
export function useDashboardAlerts(
  options?: {
    severity?: string;
    category?: string;
    unacknowledgedOnly?: boolean;
  }
) {
  const { sdk } = useProcurementSDK();
  
  return useRealtime(
    () => sdk.getDashboardAlerts(options),
    { 
      interval: 15000,
      onUpdate: (alerts) => {
        if (alerts.length > 0) {
          console.log('New alerts:', alerts);
          // Could trigger notifications here
        }
      }
    }
  );
}

/**
 * Custom report creation
 */
export function useCustomReportCreation() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((reportConfig: any) =>
    sdk.createCustomReport(reportConfig)
  );
}

/**
 * Export dashboard data
 */
export function useDashboardExport() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((exportOptions: any) =>
    sdk.exportDashboardData(exportOptions)
  );
}

// ============================================================================
// AI INTELLIGENCE HOOKS
// ============================================================================

/**
 * AI market intelligence
 */
export function useAIMarketIntelligence() {
  const { sdk } = useProcurementSDK();
  
  return useAsync(() => sdk.getAIMarketIntelligence());
}

/**
 * Demand forecast
 */
export function useDemandForecast(category?: string, timeHorizon?: number) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => sdk.getDemandForecast(category, timeHorizon),
    [category, timeHorizon]
  );
}

/**
 * AI supplier analysis
 */
export function useAISupplierAnalysis() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((supplierId: string) =>
    sdk.analyzeSupplierWithAI(supplierId)
  );
}

/**
 * Procurement insights with real-time updates
 */
export function useProcurementInsights(realtime: boolean = true) {
  const { sdk } = useProcurementSDK();
  
  const fetchFunction = useCallback(
    () => sdk.getProcurementInsights(),
    [sdk]
  );
  
  return realtime 
    ? useRealtime(fetchFunction, { interval: 120000 }) // 2 minutes
    : useAsync(fetchFunction);
}

// ============================================================================
// BLOCKCHAIN HOOKS
// ============================================================================

/**
 * Blockchain recording
 */
export function useBlockchainRecording() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: {
    type: 'purchase-order' | 'contract';
    entityId: string;
  }) => {
    if (data.type === 'purchase-order') {
      return sdk.recordPurchaseOrderOnBlockchain(data.entityId);
    } else {
      return sdk.recordContractOnBlockchain(data.entityId);
    }
  });
}

/**
 * Data integrity verification
 */
export function useDataVerification() {
  const { sdk } = useProcurementSDK();
  
  return useMutation((data: {
    entityType: 'purchase-order' | 'contract';
    entityId: string;
  }) => sdk.verifyDataIntegrity(data.entityType, data.entityId));
}

/**
 * Blockchain transaction history
 */
export function useBlockchainHistory(
  entityType: 'purchase-order' | 'contract' | null,
  entityId: string | null
) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => entityType && entityId 
      ? sdk.getBlockchainHistory(entityType, entityId)
      : Promise.resolve(null),
    [entityType, entityId]
  );
}

// ============================================================================
// MARKET INTELLIGENCE HOOKS
// ============================================================================

/**
 * Market intelligence for a category
 */
export function useMarketIntelligence(
  category: string | null,
  region?: string,
  includeForecasting?: boolean
) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => category 
      ? sdk.getMarketIntelligence(category, region, includeForecasting)
      : Promise.resolve(null),
    [category, region, includeForecasting]
  );
}

/**
 * Market forecast
 */
export function useMarketForecast(
  category: string | null,
  region?: string,
  months?: number
) {
  const { sdk } = useProcurementSDK();
  
  return useAsync(
    () => category 
      ? sdk.getMarketForecast(category, region, months)
      : Promise.resolve(null),
    [category, region, months]
  );
}

/**
 * Market dashboard with real-time updates
 */
export function useMarketDashboard(
  categories?: string[],
  regions?: string[],
  realtime: boolean = true
) {
  const { sdk } = useProcurementSDK();
  
  const fetchFunction = useCallback(
    () => sdk.getMarketDashboard(categories, regions),
    [sdk, categories, regions]
  );
  
  return realtime 
    ? useRealtime(fetchFunction, { interval: 300000 }) // 5 minutes
    : useAsync(fetchFunction, [categories, regions]);
}

// ============================================================================
// SYSTEM HOOKS
// ============================================================================

/**
 * System health monitoring
 */
export function useSystemHealth(realtime: boolean = true) {
  const { sdk } = useProcurementSDK();
  
  const fetchFunction = useCallback(
    () => sdk.getSystemHealth(),
    [sdk]
  );
  
  return realtime 
    ? useRealtime(fetchFunction, { 
        interval: 60000,
        onError: (error) => console.error('System health check failed:', error)
      })
    : useAsync(fetchFunction);
}

/**
 * System configuration
 */
export function useSystemConfiguration() {
  const { sdk } = useProcurementSDK();
  
  return useAsync(() => sdk.getSystemConfiguration());
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Debounced search hook
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProcurementSDKError | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      setError(null);
      searchFunction(debouncedQuery)
        .then(setResults)
        .catch(setError)
        .finally(() => setLoading(false));
    } else {
      setResults(null);
    }
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
}

/**
 * Form state management hook
 */
export function useFormState<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    setFieldError,
    reset,
  };
}

export default {
  ProcurementProvider,
  useProcurementSDK,
  useAsync,
  useMutation,
  usePaginated,
  useRealtime,
  // Supplier hooks
  useSuppliers,
  useSupplier,
  useSupplierOnboarding,
  useSupplierPerformanceReport,
  useSupplierDiscovery,
  useSupplierAnalytics,
  // Contract hooks
  useContracts,
  useContract,
  useContractCreation,
  useContractAnalysis,
  useContractRenewal,
  // Purchase order hooks
  useAutonomousPO,
  useBatchPOs,
  usePOOptimization,
  useConsolidationOpportunities,
  // Analytics hooks
  useDashboardMetrics,
  useDashboardAlerts,
  useCustomReportCreation,
  useDashboardExport,
  // AI hooks
  useAIMarketIntelligence,
  useDemandForecast,
  useAISupplierAnalysis,
  useProcurementInsights,
  // Blockchain hooks
  useBlockchainRecording,
  useDataVerification,
  useBlockchainHistory,
  // Market intelligence hooks
  useMarketIntelligence,
  useMarketForecast,
  useMarketDashboard,
  // System hooks
  useSystemHealth,
  useSystemConfiguration,
  // Utility hooks
  useDebouncedSearch,
  useFormState,
};
