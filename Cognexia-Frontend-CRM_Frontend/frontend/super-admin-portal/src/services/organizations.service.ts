import apiClient, { PaginatedResponse } from '@/lib/api-client';

/**
 * Organization Types
 */
export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  subscriptionTier: 'basic' | 'premium' | 'advanced' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trial';
  userCount: number;
  adminEmail: string;
  createdAt: string;
  updatedAt: string;
  settings?: OrganizationSettings;
  metrics?: OrganizationMetrics;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
  maxUsers?: number;
  features?: string[];
}

export interface OrganizationMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  mrr: number;
  lastActivityAt: string;
  apiCalls30d: number;
  storage: number;
}

export interface CreateOrganizationDto {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  subscriptionTier: 'basic' | 'premium' | 'advanced' | 'enterprise';
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationDto {
  name?: string;
  subdomain?: string;
  status?: 'active' | 'suspended' | 'trial' | 'inactive';
  subscriptionTier?: 'basic' | 'premium' | 'advanced' | 'enterprise';
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'trial';
  settings?: Partial<OrganizationSettings>;
}

export interface OrganizationFilters {
  search?: string;
  status?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Organizations Service
 */
class OrganizationsService {
  private readonly baseUrl = '/super-admin/organizations';

  /**
   * Get all organizations with pagination and filters
   */
  async getAll(filters?: OrganizationFilters): Promise<PaginatedResponse<Organization>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.subscriptionTier) params.append('subscriptionTier', filters.subscriptionTier);
      if (filters.subscriptionStatus) params.append('subscriptionStatus', filters.subscriptionStatus);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await apiClient.get<PaginatedResponse<Organization>>(url);
    return response.data;
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization> {
    const response = await apiClient.get<{ data: Organization }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  /**
   * Create new organization
   */
  async create(data: CreateOrganizationDto): Promise<Organization> {
    const response = await apiClient.post<{ data: Organization }>(this.baseUrl, data);
    return response.data.data;
  }

  /**
   * Update organization
   */
  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    const response = await apiClient.patch<{ data: Organization }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete organization
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Suspend organization
   */
  async suspend(id: string, reason?: string): Promise<Organization> {
    const response = await apiClient.post<{ data: Organization }>(
      `${this.baseUrl}/${id}/suspend`,
      { reason }
    );
    return response.data.data;
  }

  /**
   * Activate organization
   */
  async activate(id: string): Promise<Organization> {
    const response = await apiClient.post<{ data: Organization }>(`${this.baseUrl}/${id}/activate`);
    return response.data.data;
  }

  /**
   * Get organization metrics
   */
  async getMetrics(id: string): Promise<OrganizationMetrics> {
    const response = await apiClient.get<{ data: OrganizationMetrics }>(
      `${this.baseUrl}/${id}/metrics`
    );
    return response.data.data;
  }

  /**
   * Get organization users
   */
  async getUsers(id: string, page = 1, limit = 10): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `${this.baseUrl}/${id}/users?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Export organizations to CSV
   */
  async exportToCsv(filters?: OrganizationFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.subscriptionTier) params.append('subscriptionTier', filters.subscriptionTier);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    
    return response.data;
  }
}

// Export singleton instance
export const organizationsService = new OrganizationsService();
