import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedApiResponse,
  SalesQuote,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteFilters,
  QuoteStats,
} from '@/types/api.types';

const BASE_URL = '/crm/sales/quotes';

/**
 * Get all quotes with pagination and filters
 */
export const getQuotes = async (
  filters: QuoteFilters = {}
): Promise<PaginatedApiResponse<SalesQuote>> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data } = await apiClient.get<PaginatedApiResponse<SalesQuote>>(
    `${BASE_URL}?${params.toString()}`
  );
  return data;
};

/**
 * Get quote by ID
 */
export const getQuoteById = async (id: string): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.get<ApiResponse<SalesQuote>>(`${BASE_URL}/${id}`);
  return data;
};

/**
 * Create new quote
 */
export const createQuote = async (quoteData: CreateQuoteDto): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.post<ApiResponse<SalesQuote>>(BASE_URL, quoteData);
  return data;
};

/**
 * Update quote
 */
export const updateQuote = async (
  id: string,
  quoteData: UpdateQuoteDto
): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.put<ApiResponse<SalesQuote>>(`${BASE_URL}/${id}`, quoteData);
  return data;
};

/**
 * Delete quote
 */
export const deleteQuote = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  return data;
};

/**
 * Send quote to customer
 */
export const sendQuote = async (id: string): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.post<ApiResponse<SalesQuote>>(`${BASE_URL}/${id}/send`);
  return data;
};

/**
 * Accept quote
 */
export const acceptQuote = async (id: string): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.post<ApiResponse<SalesQuote>>(`${BASE_URL}/${id}/accept`);
  return data;
};

/**
 * Reject quote
 */
export const rejectQuote = async (
  id: string,
  reason?: string
): Promise<ApiResponse<SalesQuote>> => {
  const { data } = await apiClient.post<ApiResponse<SalesQuote>>(`${BASE_URL}/${id}/reject`, {
    reason,
  });
  return data;
};

/**
 * Convert quote to order
 */
export const convertQuoteToOrder = async (
  id: string
): Promise<ApiResponse<{ quoteId: string; orderId: string }>> => {
  const { data } = await apiClient.post<ApiResponse<{ quoteId: string; orderId: string }>>(
    `${BASE_URL}/${id}/convert`
  );
  return data;
};

/**
 * Get quote statistics
 */
export const getQuoteStats = async (): Promise<ApiResponse<QuoteStats>> => {
  const { data } = await apiClient.get<ApiResponse<QuoteStats>>(`${BASE_URL}/stats`);
  return data;
};

/**
 * Bulk delete quotes
 */
export const bulkDeleteQuotes = async (ids: string[]): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.post<ApiResponse<void>>(`${BASE_URL}/bulk-delete`, { ids });
  return data;
};

/**
 * Export quotes to CSV
 */
export const exportQuotes = async (filters: QuoteFilters = {}): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.customerId) params.append('customerId', filters.customerId);

  const { data } = await apiClient.get(`${BASE_URL}/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return data;
};

export default {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  convertQuoteToOrder,
  getQuoteStats,
  bulkDeleteQuotes,
  exportQuotes,
};
