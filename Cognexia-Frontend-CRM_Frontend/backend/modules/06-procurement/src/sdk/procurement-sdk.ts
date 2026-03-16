/**
 * Procurement Module TypeScript SDK
 * 
 * A comprehensive SDK for integrating with the Industry 5.0 Procurement API.
 * Provides type-safe methods for all procurement operations including
 * supplier management, autonomous purchase orders, smart contracts,
 * analytics, AI intelligence, and blockchain integration.
 * 
 * @version 2.0.0
 * @author Industry 5.0 ERP Team
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Re-export all DTOs for convenience
export * from '../dto/requests';
export * from '../dto/responses';

// Configuration and Authentication
export interface ProcurementSDKConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Request Options
export interface RequestOptions extends AxiosRequestConfig {
  retries?: number;
  skipAuth?: boolean;
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

// Common Filters
export interface DateRangeFilter {
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface DepartmentFilter {
  departments?: string[];
}

export interface CategoryFilter {
  categories?: string[];
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ProcurementSDKError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ProcurementSDKError';
  }
}

export class AuthenticationError extends ProcurementSDKError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ProcurementSDKError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ProcurementSDKError {
  constructor(
    message: string = 'Validation failed',
    public validationErrors?: string[]
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ProcurementSDKError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ProcurementSDKError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// MAIN SDK CLASS
// ============================================================================

export class ProcurementSDK {
  private client: AxiosInstance;
  private authToken: AuthToken | null = null;
  private config: Required<ProcurementSDKConfig>;

  constructor(config: ProcurementSDKConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      debug: false,
      ...config,
    } as Required<ProcurementSDKConfig>;

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ProcurementSDK/2.0.0',
      },
    });

    this.setupInterceptors();
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Set authentication token
   */
  setAuthToken(token: AuthToken): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    if (!this.authToken) return false;
    if (!this.authToken.expiresAt) return true;
    return new Date() < this.authToken.expiresAt;
  }

  // ============================================================================
  // SYSTEM HEALTH & STATUS
  // ============================================================================

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<any> {
    return this.request('GET', '/procurement/health');
  }

  /**
   * Get system operational status
   */
  async getSystemStatus(): Promise<any> {
    return this.request('GET', '/procurement/status');
  }

  /**
   * Get system configuration
   */
  async getSystemConfiguration(): Promise<any> {
    return this.request('GET', '/procurement/configuration');
  }

  /**
   * Get high-level metrics summary
   */
  async getMetricsSummary(): Promise<any> {
    return this.request('GET', '/procurement/metrics/summary');
  }

  // ============================================================================
  // SUPPLIER MANAGEMENT
  // ============================================================================

  /**
   * Search suppliers with advanced filters
   */
  async searchSuppliers(filters?: any, pagination?: PaginationParams): Promise<any> {
    const params = { ...filters, ...pagination };
    return this.request('GET', '/procurement/suppliers', { params });
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(supplierId: string): Promise<any> {
    return this.request('GET', `/procurement/suppliers/${supplierId}`);
  }

  /**
   * Onboard a new supplier
   */
  async onboardSupplier(supplierData: any, onboardedBy?: string): Promise<any> {
    const params = onboardedBy ? { onboardedBy } : {};
    return this.request('POST', '/procurement/suppliers', { 
      data: supplierData,
      params 
    });
  }

  /**
   * Update supplier information
   */
  async updateSupplier(supplierId: string, supplierData: any): Promise<any> {
    return this.request('PUT', `/procurement/suppliers/${supplierId}`, { 
      data: supplierData 
    });
  }

  /**
   * Generate supplier performance report
   */
  async getSupplierPerformanceReport(
    supplierId: string, 
    dateRange?: DateRangeFilter
  ): Promise<any> {
    const params = dateRange ? {
      startDate: dateRange.startDate?.toString(),
      endDate: dateRange.endDate?.toString(),
    } : {};
    return this.request('GET', `/procurement/suppliers/${supplierId}/performance`, { params });
  }

  /**
   * Discover suppliers based on requirements
   */
  async discoverSuppliers(requirements: any, excludeSuppliers?: string[]): Promise<any> {
    const params = excludeSuppliers ? { excludeSuppliers } : {};
    return this.request('POST', '/procurement/suppliers/discover', { 
      data: requirements,
      params 
    });
  }

  /**
   * Get supplier analytics dashboard
   */
  async getSupplierAnalytics(timeframe?: string): Promise<any> {
    const params = timeframe ? { timeframe } : {};
    return this.request('GET', '/procurement/suppliers/analytics', { params });
  }

  // ============================================================================
  // CONTRACT MANAGEMENT
  // ============================================================================

  /**
   * Search contracts with advanced filters
   */
  async searchContracts(filters?: any, pagination?: PaginationParams): Promise<any> {
    const params = { ...filters, ...pagination };
    return this.request('GET', '/procurement/contracts', { params });
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string): Promise<any> {
    return this.request('GET', `/procurement/contracts/${contractId}`);
  }

  /**
   * Create new contract
   */
  async createContract(contractData: any, createdBy?: string): Promise<any> {
    const params = createdBy ? { createdBy } : {};
    return this.request('POST', '/procurement/contracts', { 
      data: contractData,
      params 
    });
  }

  /**
   * Update contract
   */
  async updateContract(contractId: string, contractData: any): Promise<any> {
    return this.request('PUT', `/procurement/contracts/${contractId}`, { 
      data: contractData 
    });
  }

  /**
   * Analyze contract using AI
   */
  async analyzeContract(contractId: string): Promise<any> {
    return this.request('GET', `/procurement/contracts/${contractId}/analyze`);
  }

  /**
   * Renew contract
   */
  async renewContract(contractId: string, renewalData: any): Promise<any> {
    return this.request('POST', `/procurement/contracts/${contractId}/renew`, { 
      data: renewalData 
    });
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(timeframe?: string): Promise<any> {
    const params = timeframe ? { timeframe } : {};
    return this.request('GET', '/procurement/contracts/analytics', { params });
  }

  /**
   * Enable blockchain integration for contract
   */
  async enableContractBlockchain(contractId: string, blockchainConfig: any): Promise<any> {
    return this.request('POST', `/procurement/contracts/${contractId}/blockchain`, { 
      data: blockchainConfig 
    });
  }

  // ============================================================================
  // AUTONOMOUS PURCHASE ORDERS
  // ============================================================================

  /**
   * Process autonomous purchase order request
   */
  async processAutonomousPO(request: any): Promise<any> {
    return this.request('POST', '/procurement/purchase-orders/autonomous', { 
      data: request 
    });
  }

  /**
   * Batch process multiple PO requests
   */
  async batchProcessPOs(requests: any[]): Promise<any> {
    return this.request('POST', '/procurement/purchase-orders/batch', { 
      data: requests 
    });
  }

  /**
   * Optimize existing purchase order
   */
  async optimizePurchaseOrder(purchaseOrderId: string): Promise<any> {
    return this.request('PUT', `/procurement/purchase-orders/${purchaseOrderId}/optimize`);
  }

  /**
   * Optimize pricing for purchase order
   */
  async optimizePricing(
    purchaseOrderId: string, 
    strategy?: 'aggressive' | 'balanced' | 'conservative'
  ): Promise<any> {
    const params = strategy ? { strategy } : {};
    return this.request(
      'PUT', 
      `/procurement/purchase-orders/${purchaseOrderId}/pricing/optimize`,
      { params }
    );
  }

  /**
   * Get consolidation opportunities
   */
  async getConsolidationOpportunities(
    department?: string,
    timeWindow?: number
  ): Promise<any> {
    const params: any = {};
    if (department) params.department = department;
    if (timeWindow) params.timeWindow = timeWindow;
    return this.request('GET', '/procurement/purchase-orders/consolidation', { params });
  }

  /**
   * Get autonomous processing analytics
   */
  async getAutonomousProcessingAnalytics(timeframe?: string): Promise<any> {
    const params = timeframe ? { timeframe } : {};
    return this.request('GET', '/procurement/purchase-orders/analytics', { params });
  }

  // ============================================================================
  // ANALYTICS DASHBOARD
  // ============================================================================

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(options?: {
    timeframe?: string;
    refreshCache?: boolean;
    departments?: string[];
    categories?: string[];
  }): Promise<any> {
    return this.request('GET', '/procurement/analytics/dashboard', { 
      params: options 
    });
  }

  /**
   * Get dashboard alerts
   */
  async getDashboardAlerts(options?: {
    severity?: string;
    category?: string;
    unacknowledgedOnly?: boolean;
  }): Promise<any> {
    return this.request('GET', '/procurement/analytics/alerts', { 
      params: options 
    });
  }

  /**
   * Create custom report configuration
   */
  async createCustomReport(reportConfig: any): Promise<any> {
    return this.request('POST', '/procurement/analytics/reports', { 
      data: reportConfig 
    });
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(reportId: string): Promise<any> {
    return this.request('GET', `/procurement/analytics/reports/${reportId}/generate`);
  }

  /**
   * Get benchmark data
   */
  async getBenchmarkData(
    category: string,
    region?: string,
    industry?: string
  ): Promise<any> {
    const params: any = {};
    if (region) params.region = region;
    if (industry) params.industry = industry;
    return this.request('GET', `/procurement/analytics/benchmarks/${category}`, { params });
  }

  /**
   * Export dashboard data
   */
  async exportDashboardData(exportOptions: any): Promise<any> {
    return this.request('POST', '/procurement/analytics/export', { 
      data: exportOptions 
    });
  }

  // ============================================================================
  // AI PROCUREMENT INTELLIGENCE
  // ============================================================================

  /**
   * Get AI-powered market intelligence
   */
  async getAIMarketIntelligence(): Promise<any> {
    return this.request('GET', '/procurement/ai/market-intelligence');
  }

  /**
   * Get AI demand forecast
   */
  async getDemandForecast(category?: string, timeHorizon?: number): Promise<any> {
    const params: any = {};
    if (category) params.category = category;
    if (timeHorizon) params.timeHorizon = timeHorizon;
    return this.request('GET', '/procurement/ai/demand-forecast', { params });
  }

  /**
   * Analyze supplier using AI
   */
  async analyzeSupplierWithAI(supplierId: string): Promise<any> {
    return this.request('GET', `/procurement/ai/suppliers/${supplierId}/analyze`);
  }

  /**
   * Get AI optimization for purchase order
   */
  async optimizePurchaseOrderWithAI(purchaseOrderId: string): Promise<any> {
    return this.request('GET', `/procurement/ai/purchase-orders/${purchaseOrderId}/optimize`);
  }

  /**
   * Get comprehensive AI procurement insights
   */
  async getProcurementInsights(): Promise<any> {
    return this.request('GET', '/procurement/ai/insights');
  }

  // ============================================================================
  // BLOCKCHAIN INTEGRATION
  // ============================================================================

  /**
   * Record purchase order on blockchain
   */
  async recordPurchaseOrderOnBlockchain(purchaseOrderId: string): Promise<any> {
    return this.request('POST', `/procurement/blockchain/purchase-orders/${purchaseOrderId}/record`);
  }

  /**
   * Record contract on blockchain
   */
  async recordContractOnBlockchain(contractId: string): Promise<any> {
    return this.request('POST', `/procurement/blockchain/contracts/${contractId}/record`);
  }

  /**
   * Verify data integrity against blockchain
   */
  async verifyDataIntegrity(
    entityType: 'purchase-order' | 'contract',
    entityId: string
  ): Promise<any> {
    return this.request('GET', `/procurement/blockchain/verify/${entityType}/${entityId}`);
  }

  /**
   * Get blockchain transaction history
   */
  async getBlockchainHistory(
    entityType: 'purchase-order' | 'contract',
    entityId: string
  ): Promise<any> {
    return this.request('GET', `/procurement/blockchain/history/${entityType}/${entityId}`);
  }

  // ============================================================================
  // MARKET INTELLIGENCE
  // ============================================================================

  /**
   * Get real-time market intelligence
   */
  async getMarketIntelligence(
    category: string,
    region?: string,
    includeForecasting?: boolean
  ): Promise<any> {
    const params: any = {};
    if (region) params.region = region;
    if (includeForecasting) params.includeForecasting = includeForecasting;
    return this.request('GET', `/procurement/market/intelligence/${category}`, { params });
  }

  /**
   * Generate market forecast
   */
  async getMarketForecast(
    category: string,
    region?: string,
    months?: number
  ): Promise<any> {
    const params: any = {};
    if (region) params.region = region;
    if (months) params.months = months;
    return this.request('GET', `/procurement/market/forecast/${category}`, { params });
  }

  /**
   * Get competitive intelligence
   */
  async getCompetitiveIntelligence(category: string, region?: string): Promise<any> {
    const params = region ? { region } : {};
    return this.request('GET', `/procurement/market/competitive/${category}`, { params });
  }

  /**
   * Assess supply risk
   */
  async assessSupplyRisk(
    category: string,
    region?: string,
    timeHorizon?: 'short' | 'medium' | 'long'
  ): Promise<any> {
    const params: any = {};
    if (region) params.region = region;
    if (timeHorizon) params.timeHorizon = timeHorizon;
    return this.request('GET', `/procurement/market/risks/${category}`, { params });
  }

  /**
   * Get market intelligence dashboard
   */
  async getMarketDashboard(categories?: string[], regions?: string[]): Promise<any> {
    const params: any = {};
    if (categories) params.categories = categories;
    if (regions) params.regions = regions;
    return this.request('GET', '/procurement/market/dashboard', { params });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add API key if provided
        if (this.config.apiKey) {
          config.headers = {
            ...config.headers,
            'X-API-Key': this.config.apiKey,
          };
        }

        // Add auth token if available
        if (this.authToken && !config.headers['skip-auth']) {
          config.headers.Authorization = `Bearer ${this.authToken.accessToken}`;
        }

        // Debug logging
        if (this.config.debug) {
          console.log('Request:', config.method?.toUpperCase(), config.url, config.data);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          console.log('Response:', response.status, response.data);
        }
        return response;
      },
      (error) => {
        const customError = this.createCustomError(error);
        if (this.config.debug) {
          console.error('Error:', customError);
        }
        return Promise.reject(customError);
      }
    );
  }

  private createCustomError(error: any): ProcurementSDKError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || 'Unknown error occurred';

      switch (status) {
        case 401:
          return new AuthenticationError(message);
        case 403:
          return new AuthorizationError(message);
        case 404:
          return new NotFoundError(message);
        case 400:
          return new ValidationError(message, data?.errors);
        case 429:
          return new RateLimitError(message);
        default:
          return new ProcurementSDKError(
            message,
            'HTTP_ERROR',
            status,
            error
          );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new ProcurementSDKError(
        'Request timeout',
        'TIMEOUT',
        undefined,
        error
      );
    }

    if (error.code === 'ECONNREFUSED') {
      return new ProcurementSDKError(
        'Connection refused',
        'CONNECTION_ERROR',
        undefined,
        error
      );
    }

    return new ProcurementSDKError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }

  private async request(
    method: string,
    url: string,
    options: RequestOptions = {}
  ): Promise<any> {
    const { retries = this.config.retries, ...axiosConfig } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse = await this.client({
          method,
          url,
          ...axiosConfig,
        });
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Don't retry on certain status codes
        if (error instanceof AuthenticationError || 
            error instanceof AuthorizationError ||
            error instanceof ValidationError ||
            error instanceof NotFoundError) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a new ProcurementSDK instance
 */
export function createProcurementSDK(config: ProcurementSDKConfig): ProcurementSDK {
  return new ProcurementSDK(config);
}

/**
 * Type guard for ProcurementSDKError
 */
export function isProcurementSDKError(error: any): error is ProcurementSDKError {
  return error instanceof ProcurementSDKError;
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format dates consistently
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default ProcurementSDK;
