import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
} from '@/services/quote.api';
import type {
  QuoteFilters,
  CreateQuoteDto,
  UpdateQuoteDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  QUOTES: 'quotes',
  QUOTE: 'quote',
  QUOTE_STATS: 'quote-stats',
};

/**
 * Fetch quotes with pagination and filters
 */
export const useQuotes = (filters: QuoteFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUOTES, filters],
    queryFn: () => getQuotes(filters),
  });
};

/**
 * Fetch single quote by ID
 */
export const useQuote = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUOTE, id],
    queryFn: () => getQuoteById(id),
    enabled: !!id,
  });
};

/**
 * Fetch quote statistics
 */
export const useQuoteStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUOTE_STATS],
    queryFn: getQuoteStats,
  });
};

/**
 * Create new quote mutation
 */
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuoteDto) => createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Update quote mutation
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteDto }) =>
      updateQuote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Delete quote mutation
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Send quote mutation
 */
export const useSendQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sendQuote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Accept quote mutation
 */
export const useAcceptQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptQuote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Reject quote mutation
 */
export const useRejectQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectQuote(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Convert quote to order mutation
 */
export const useConvertQuoteToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => convertQuoteToOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
      // Also invalidate orders cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Bulk delete quotes mutation
 */
export const useBulkDeleteQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteQuotes(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUOTE_STATS] });
    },
  });
};

/**
 * Export quotes mutation
 */
export const useExportQuotes = () => {
  return useMutation({
    mutationFn: (filters: QuoteFilters) => exportQuotes(filters),
  });
};
