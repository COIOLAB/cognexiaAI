import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeBaseApi } from '@/services/knowledgeBase.api';
import { toast } from 'sonner';
import type {
  KnowledgeBaseArticle,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleFilters,
} from '@/types/api.types';

const QUERY_KEYS = {
  articles: ['knowledge-base'] as const,
  article: (id: string) => ['knowledge-base', id] as const,
  stats: ['knowledge-base', 'stats'] as const,
  featured: ['knowledge-base', 'featured'] as const,
  search: (query: string) => ['knowledge-base', 'search', query] as const,
  related: (id: string) => ['knowledge-base', id, 'related'] as const,
};

// Get articles with filters
export const useGetArticles = (filters?: ArticleFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.articles, filters],
    queryFn: () => knowledgeBaseApi.getArticles(filters),
  });
};

// Get article by ID
export const useGetArticle = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.article(id),
    queryFn: () => knowledgeBaseApi.getArticleById(id),
    enabled: !!id,
  });
};

// Create article
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDto) => knowledgeBaseApi.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('Article created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create article');
    },
  });
};

// Update article
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleDto }) =>
      knowledgeBaseApi.updateArticle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.article(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('Article updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update article');
    },
  });
};

// Delete article
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('Article deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete article');
    },
  });
};

// Publish article
export const usePublishArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => knowledgeBaseApi.publishArticle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.article(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('Article published successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to publish article');
    },
  });
};

// Search articles
export const useSearchArticles = (query: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => knowledgeBaseApi.searchArticles(query),
    enabled: query.length > 2,
  });
};

// Get article statistics
export const useArticleStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => knowledgeBaseApi.getStats(),
  });
};

// Get featured articles
export const useFeaturedArticles = (limit?: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.featured, limit],
    queryFn: () => knowledgeBaseApi.getFeaturedArticles(limit),
  });
};

// Get related articles
export const useRelatedArticles = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.related(id),
    queryFn: () => knowledgeBaseApi.getRelatedArticles(id),
    enabled: !!id,
  });
};
