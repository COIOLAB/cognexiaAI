import apiClient from '@/lib/api-client';
import { 
  Lead, 
  CreateLeadDto, 
  UpdateLeadDto, 
  LeadFilters,
  QualifyLeadDto,
  ConvertLeadDto,
  ApiResponse, 
  PaginatedApiResponse 
} from '@/types/api.types';
import { useTenantStore } from '../stores/tenant-store';

const orgId = () => {
  try {
    return useTenantStore.getState().currentOrganization?.id || localStorage.getItem('organizationId') || undefined;
  } catch {
    return undefined;
  }
};

/**
 * Lead API Service
 * Handles all lead-related API calls for CRM module
 */

// Get all leads with optional filters
export const getLeads = async (filters?: LeadFilters): Promise<PaginatedApiResponse<Lead>> => {
  const params = new URLSearchParams();
  
  const effectiveFilters = { ...filters, organizationId: filters?.organizationId ?? orgId() };

  if (effectiveFilters) {
    if (effectiveFilters.page) params.append('page', effectiveFilters.page.toString());
    if (effectiveFilters.limit) params.append('limit', effectiveFilters.limit.toString());
    if (effectiveFilters.status) params.append('status', effectiveFilters.status);
    if (effectiveFilters.source) params.append('source', effectiveFilters.source);
    if (effectiveFilters.assignedTo) params.append('assignedTo', effectiveFilters.assignedTo);
    if (effectiveFilters.minScore) params.append('score', effectiveFilters.minScore.toString());
    if (effectiveFilters.search) params.append('search', effectiveFilters.search);
    if (effectiveFilters.sortBy) params.append('sortBy', effectiveFilters.sortBy);
    if (effectiveFilters.sortOrder) params.append('sortOrder', effectiveFilters.sortOrder);
    if (effectiveFilters.organizationId) params.append('organizationId', effectiveFilters.organizationId);
  }

  const response = await apiClient.get<PaginatedApiResponse<Lead>>(`/crm/leads?${params}`);
  return response.data;
};

// Get single lead by ID
export const getLeadById = async (id: string): Promise<ApiResponse<Lead>> => {
  const response = await apiClient.get<ApiResponse<Lead>>(`/crm/leads/${id}`);
  return response.data;
};

// Create new lead
export const createLead = async (data: CreateLeadDto): Promise<ApiResponse<Lead>> => {
  const response = await apiClient.post<ApiResponse<Lead>>('/crm/leads', {
    ...data,
    organizationId: data.organizationId ?? orgId(),
  });
  return response.data;
};

// Update existing lead
export const updateLead = async (id: string, data: UpdateLeadDto): Promise<ApiResponse<Lead>> => {
  const response = await apiClient.put<ApiResponse<Lead>>(`/crm/leads/${id}`, {
    ...data,
    organizationId: data.organizationId ?? orgId(),
  });
  return response.data;
};

// Delete lead
export const deleteLead = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/crm/leads/${id}`);
  return response.data;
};

// Qualify lead
export const qualifyLead = async (id: string, data: QualifyLeadDto): Promise<ApiResponse<Lead>> => {
  const response = await apiClient.post<ApiResponse<Lead>>(`/crm/leads/${id}/qualify`, data);
  return response.data;
};

// Convert lead to customer/opportunity
export const convertLead = async (id: string, data: ConvertLeadDto): Promise<ApiResponse<{
  customer?: { id: string };
  opportunity?: { id: string };
}>> => {
  const response = await apiClient.post<ApiResponse<{
    customer?: { id: string };
    opportunity?: { id: string };
  }>>(`/crm/leads/${id}/convert`, data);
  return response.data;
};

// Get lead scoring breakdown
export const getLeadScore = async (id: string): Promise<ApiResponse<{
  totalScore: number;
  breakdown: {
    engagement: number;
    demographics: number;
    behavior: number;
    firmographics: number;
  };
}>> => {
  const response = await apiClient.get<ApiResponse<{
    totalScore: number;
    breakdown: {
      engagement: number;
      demographics: number;
      behavior: number;
      firmographics: number;
    };
  }>>(`/crm/leads/${id}/score`);
  return response.data;
};

// Bulk delete leads
export const bulkDeleteLeads = async (ids: string[]): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/crm/leads/bulk-delete', { ids });
  return response.data;
};

// Export leads to CSV
export const exportLeads = async (filters?: LeadFilters): Promise<Blob> => {
  const params = new URLSearchParams();
  
  const effectiveFilters = { ...filters, organizationId: filters?.organizationId ?? orgId() };

  if (effectiveFilters) {
    if (effectiveFilters.status) params.append('status', effectiveFilters.status);
    if (effectiveFilters.source) params.append('source', effectiveFilters.source);
    if (effectiveFilters.assignedTo) params.append('assignedTo', effectiveFilters.assignedTo);
    if (effectiveFilters.minScore) params.append('score', effectiveFilters.minScore.toString());
    if (effectiveFilters.search) params.append('search', effectiveFilters.search);
    if (effectiveFilters.organizationId) params.append('organizationId', effectiveFilters.organizationId);
  }

  const response = await apiClient.get(`/crm/leads/export?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Import leads from CSV
export const importLeads = async (file: File): Promise<ApiResponse<{
  imported: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{
    imported: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  }>>('/crm/leads/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get lead statistics
export const getLeadStats = async (): Promise<ApiResponse<{
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  averageScore: number;
  conversionRate: number;
}>> => {
  const response = await apiClient.get<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    averageScore: number;
    conversionRate: number;
  }>>('/crm/leads/stats');
  return response.data;
};
