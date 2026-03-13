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

/**
 * Lead API Service
 * Handles all lead-related API calls for CRM module
 */

// Get all leads with optional filters
export const getLeads = async (filters?: LeadFilters): Promise<PaginatedApiResponse<Lead>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.minScore) params.append('minScore', filters.minScore.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
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
  const response = await apiClient.post<ApiResponse<Lead>>('/crm/leads', data);
  return response.data;
};

// Update existing lead
export const updateLead = async (id: string, data: UpdateLeadDto): Promise<ApiResponse<Lead>> => {
  const response = await apiClient.put<ApiResponse<Lead>>(`/crm/leads/${id}`, data);
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
  
  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.minScore) params.append('minScore', filters.minScore.toString());
    if (filters.search) params.append('search', filters.search);
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
