import apiClient from '../lib/api-client';

export interface Territory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  users?: any[];
  hasCapacityLimit: boolean;
  maxLeadsPerUser?: number;
  totalLeadsAssigned: number;
  activeLeads: number;
  conversionRate: number;
  criteria?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerritoryDto {
  name: string;
  description?: string;
  active?: boolean;
  userIds?: string[];
  hasCapacityLimit?: boolean;
  maxLeadsPerUser?: number;
  criteria?: Record<string, any>;
}

export interface UpdateTerritoryDto {
  name?: string;
  description?: string;
  active?: boolean;
  userIds?: string[];
  hasCapacityLimit?: boolean;
  maxLeadsPerUser?: number;
  criteria?: Record<string, any>;
}

export interface AssignLeadToTerritoryDto {
  leadId: string;
  territoryId: string;
  forceReassignment?: boolean;
}

export interface BulkAssignLeadsDto {
  leadIds: string[];
  territoryId: string;
  forceReassignment?: boolean;
}

export interface RebalanceTerritoriesDto {
  territoryIds?: string[];
  strategy?: 'EVEN_DISTRIBUTION' | 'BY_CAPACITY' | 'BY_PERFORMANCE';
}

export interface TerritoryStats {
  territoryId: string;
  territoryName: string;
  totalLeadsAssigned: number;
  activeLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageLeadValue: number;
  userCount: number;
}

export interface TerritoryPerformance {
  territories: TerritoryStats[];
  summary: {
    totalTerritories: number;
    activeTerritories: number;
    totalUsers: number;
    totalLeadsAssigned: number;
    averageConversionRate: number;
  };
}

export interface TerritoryCoverage {
  coverage: Array<{
    territoryId: string;
    territoryName: string;
    active: boolean;
    userCount: number;
    hasCapacityLimit: boolean;
    maxLeadsPerUser: number | null;
    currentLoad: number;
    capacity: number | null;
    utilizationRate: string | null;
  }>;
  summary: {
    totalTerritories: number;
    activeTerritories: number;
    totalCapacity: number | string;
    currentLoad: number;
    overallUtilization: string;
    territoriesAtCapacity: number;
  };
}

export const territoryApi = {
  // Create Territory
  createTerritory: async (dto: CreateTerritoryDto): Promise<Territory> => {
    const response = await apiClient.post('/territories', dto);
    return response.data;
  },

  // Get All Territories
  getTerritories: async (): Promise<Territory[]> => {
    const response = await apiClient.get('/territories');
    return response.data;
  },

  // Get Territory by ID
  getTerritory: async (id: string): Promise<Territory> => {
    const response = await apiClient.get(`/territories/${id}`);
    return response.data;
  },

  // Update Territory
  updateTerritory: async (id: string, dto: UpdateTerritoryDto): Promise<Territory> => {
    const response = await apiClient.put(`/territories/${id}`, dto);
    return response.data;
  },

  // Delete Territory
  deleteTerritory: async (id: string): Promise<void> => {
    await apiClient.delete(`/territories/${id}`);
  },

  // Assign Lead to Territory
  assignLead: async (dto: AssignLeadToTerritoryDto): Promise<any> => {
    const response = await apiClient.post('/territories/assign', dto);
    return response.data;
  },

  // Bulk Assign Leads
  bulkAssignLeads: async (dto: BulkAssignLeadsDto): Promise<{ assigned: number; failed: number; total: number }> => {
    const response = await apiClient.post('/territories/assign/bulk', dto);
    return response.data;
  },

  // Rebalance Territories
  rebalanceTerritories: async (dto: RebalanceTerritoriesDto): Promise<{ reassigned: number }> => {
    const response = await apiClient.post('/territories/rebalance', dto);
    return response.data;
  },

  // Get Territory Stats
  getTerritoryStats: async (id: string): Promise<TerritoryStats> => {
    const response = await apiClient.get(`/territories/${id}/stats`);
    return response.data;
  },

  // Get Territory Performance
  getTerritoryPerformance: async (territoryId?: string): Promise<TerritoryPerformance> => {
    const response = await apiClient.get('/territories/analytics/performance', {
      params: { territoryId },
    });
    return response.data;
  },

  // Compare Territories
  compareTerritories: async (territoryIds: string[]): Promise<any> => {
    const response = await apiClient.get('/territories/analytics/comparison', {
      params: { territoryIds: territoryIds.join(',') },
    });
    return response.data;
  },

  // Get Territory Coverage
  getTerritoryCoverage: async (): Promise<TerritoryCoverage> => {
    const response = await apiClient.get('/territories/analytics/coverage');
    return response.data;
  },
};
