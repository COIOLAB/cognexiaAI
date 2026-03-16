import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountHierarchy,
  getAccountCustomers,
  getAccountOpportunities,
  bulkDeleteAccounts,
  exportAccounts,
  getAccountStats,
} from '@/services/account.api';
import {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  AccountFilters,
} from '@/types/api.types';

/**
 * Account Hooks
 * React Query hooks for account management
 */

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters?: AccountFilters) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
  stats: () => [...accountKeys.all, 'stats'] as const,
  hierarchy: (id: string) => [...accountKeys.all, 'hierarchy', id] as const,
  customers: (id: string) => [...accountKeys.all, 'customers', id] as const,
  opportunities: (id: string) => [...accountKeys.all, 'opportunities', id] as const,
};

// Get paginated accounts with filters
export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => getAccounts(filters),
    staleTime: 30000,
  });
};

// Get single account by ID
export const useAccount = (id: string) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
};

// Get account statistics
export const useAccountStats = () => {
  return useQuery({
    queryKey: accountKeys.stats(),
    queryFn: getAccountStats,
    staleTime: 60000,
  });
};

// Get account hierarchy
export const useAccountHierarchy = (id: string) => {
  return useQuery({
    queryKey: accountKeys.hierarchy(id),
    queryFn: () => getAccountHierarchy(id),
    enabled: !!id,
  });
};

// Get account customers
export const useAccountCustomers = (id: string) => {
  return useQuery({
    queryKey: accountKeys.customers(id),
    queryFn: () => getAccountCustomers(id),
    enabled: !!id,
  });
};

// Get account opportunities
export const useAccountOpportunities = (id: string) => {
  return useQuery({
    queryKey: accountKeys.opportunities(id),
    queryFn: () => getAccountOpportunities(id),
    enabled: !!id,
  });
};

// Create new account
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountDto) => createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create account');
    },
  });
};

// Update existing account
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDto }) =>
      updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      toast.success('Account updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update account');
    },
  });
};

// Delete account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete account');
    },
  });
};

// Bulk delete accounts
export const useBulkDeleteAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAccounts(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.stats() });
      toast.success(`${ids.length} accounts deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete accounts');
    },
  });
};

// Export accounts to CSV
export const useExportAccounts = () => {
  return useMutation({
    mutationFn: (filters?: AccountFilters) => exportAccounts(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Accounts exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export accounts');
    },
  });
};
