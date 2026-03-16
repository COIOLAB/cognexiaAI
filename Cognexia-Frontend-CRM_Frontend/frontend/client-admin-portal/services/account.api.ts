import apiClient from '@/lib/api-client';
import { 
  Account, 
  CreateAccountDto, 
  UpdateAccountDto, 
  AccountFilters,
  ApiResponse, 
  PaginatedApiResponse 
} from '@/types/api.types';

/**
 * Account API Service
 * Handles all account-related API calls for CRM module
 */

// Get all accounts with optional filters
export const getAccounts = async (filters?: AccountFilters): Promise<PaginatedApiResponse<Account>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.owner) params.append('owner', filters.owner);
    if (filters.parentAccount) params.append('parentAccount', filters.parentAccount);
    if (filters.minRevenue) params.append('minRevenue', filters.minRevenue.toString());
    if (filters.maxRevenue) params.append('maxRevenue', filters.maxRevenue.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }

  const response = await apiClient.get<PaginatedApiResponse<Account>>(`/crm/accounts?${params}`);
  return response.data;
};

// Get single account by ID
export const getAccountById = async (id: string): Promise<ApiResponse<Account>> => {
  const response = await apiClient.get<ApiResponse<Account>>(`/crm/accounts/${id}`);
  return response.data;
};

// Create new account
export const createAccount = async (data: CreateAccountDto): Promise<ApiResponse<Account>> => {
  const response = await apiClient.post<ApiResponse<Account>>('/crm/accounts', data);
  return response.data;
};

// Update existing account
export const updateAccount = async (id: string, data: UpdateAccountDto): Promise<ApiResponse<Account>> => {
  const response = await apiClient.put<ApiResponse<Account>>(`/crm/accounts/${id}`, data);
  return response.data;
};

// Delete account
export const deleteAccount = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/crm/accounts/${id}`);
  return response.data;
};

// Get account hierarchy (parent and child accounts)
export const getAccountHierarchy = async (id: string): Promise<ApiResponse<{
  parent?: Account;
  children: Account[];
  siblings: Account[];
}>> => {
  const response = await apiClient.get<ApiResponse<{
    parent?: Account;
    children: Account[];
    siblings: Account[];
  }>>(`/crm/accounts/${id}/hierarchy`);
  return response.data;
};

// Get account customers
export const getAccountCustomers = async (id: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/crm/accounts/${id}/customers`);
  return response.data;
};

// Get account opportunities
export const getAccountOpportunities = async (id: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/crm/accounts/${id}/opportunities`);
  return response.data;
};

// Bulk delete accounts
export const bulkDeleteAccounts = async (ids: string[]): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/crm/accounts/bulk-delete', { ids });
  return response.data;
};

// Export accounts to CSV
export const exportAccounts = async (filters?: AccountFilters): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.owner) params.append('owner', filters.owner);
    if (filters.search) params.append('search', filters.search);
  }

  const response = await apiClient.get(`/crm/accounts/export?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Get account statistics
export const getAccountStats = async (): Promise<ApiResponse<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byIndustry: Record<string, number>;
  totalRevenue: number;
  averageRevenue: number;
  averagePriorityScore: number;
}>> => {
  const response = await apiClient.get<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    totalRevenue: number;
    averageRevenue: number;
    averagePriorityScore: number;
  }>>('/crm/accounts/stats');
  return response.data;
};
