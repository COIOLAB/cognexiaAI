import apiClient from '@/lib/api-client';
import { 
  Opportunity, 
  CreateOpportunityDto, 
  UpdateOpportunityDto, 
  OpportunityFilters,
  OpportunityStage,
  ApiResponse, 
  PaginatedApiResponse 
} from '@/types/api.types';

/**
 * Opportunity API Service
 * Handles all opportunity-related API calls for CRM module
 */

const BASE_URL = '/crm/sales/opportunities';

// Get all opportunities with optional filters
export const getOpportunities = async (filters?: OpportunityFilters): Promise<PaginatedApiResponse<Opportunity>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.assignedTo) params.append('salesRep', filters.assignedTo);
    if (filters.minAmount) params.append('minValue', filters.minAmount.toString());
  }

  const response = await apiClient.get<PaginatedApiResponse<Opportunity>>(`${BASE_URL}?${params}`);
  return response.data;
};

// Get single opportunity by ID
export const getOpportunityById = async (id: string): Promise<ApiResponse<Opportunity>> => {
  const response = await apiClient.get<ApiResponse<Opportunity>>(`${BASE_URL}/${id}`);
  return response.data;
};

// Create new opportunity
export const createOpportunity = async (data: CreateOpportunityDto): Promise<ApiResponse<Opportunity>> => {
  const response = await apiClient.post<ApiResponse<Opportunity>>(BASE_URL, data);
  return response.data;
};

// Update existing opportunity
export const updateOpportunity = async (id: string, data: UpdateOpportunityDto): Promise<ApiResponse<Opportunity>> => {
  const response = await apiClient.put<ApiResponse<Opportunity>>(`${BASE_URL}/${id}`, data);
  return response.data;
};

// Delete opportunity
export const deleteOpportunity = async (_id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${_id}`);
  return response.data;
};

// Update opportunity stage
export const updateOpportunityStage = async (id: string, stage: OpportunityStage): Promise<ApiResponse<Opportunity>> => {
  const response = await apiClient.put<ApiResponse<Opportunity>>(`${BASE_URL}/${id}/stage`, { stage });
  return response.data;
};

// Get pipeline visualization data
export const getOpportunityPipeline = async (): Promise<ApiResponse<{
  stages: Array<{
    stage: OpportunityStage;
    count: number;
    totalValue: number;
    weightedValue: number;
    opportunities: Opportunity[];
  }>;
  totalValue: number;
  totalWeightedValue: number;
}>> => {
  const response = await apiClient.get<ApiResponse<{
    stages: Array<{
      stage: OpportunityStage;
      count: number;
      totalValue: number;
      weightedValue: number;
      opportunities: Opportunity[];
    }>;
    totalValue: number;
    totalWeightedValue: number;
  }>>('/crm/sales/pipeline');
  return response.data;
};

// Bulk delete opportunities
export const bulkDeleteOpportunities = async (_ids: string[]): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(`${BASE_URL}/bulk-delete`, { ids: _ids });
  return response.data;
};

// Export opportunities to CSV
export const exportOpportunities = async (filters?: OpportunityFilters): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.assignedTo) params.append('salesRep', filters.assignedTo);
    if (filters.minAmount) params.append('minValue', filters.minAmount.toString());
    if (filters.search) params.append('search', filters.search);
  }

  const response = await apiClient.get(`${BASE_URL}/export?${params}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Get opportunity statistics
export const getOpportunityStats = async (): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/crm/sales/metrics');
  return response.data;
};

// Get win/loss analysis
export const getWinLossAnalysis = async (): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/crm/sales/metrics');
  return response.data;
};
