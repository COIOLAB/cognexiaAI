import { api } from '@/lib/api';
import type {
  KnowledgeBaseArticle,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleFilters,
  ArticleStats,
} from '@/types/api.types';

const KB_BASE = '/crm/support/knowledge-base';

export const knowledgeBaseApi = {
  // Get articles with filters
  getArticles: async (filters?: ArticleFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<{ data: KnowledgeBaseArticle[]; total: number }>(
      `${KB_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get article by ID
  getArticleById: async (id: string) => {
    const { data } = await api.get<KnowledgeBaseArticle>(`${KB_BASE}/${id}`);
    return data;
  },

  // Create article
  createArticle: async (articleData: CreateArticleDto) => {
    const { data } = await api.post<KnowledgeBaseArticle>(KB_BASE, articleData);
    return data;
  },

  // Update article
  updateArticle: async (id: string, articleData: UpdateArticleDto) => {
    const { data } = await api.put<KnowledgeBaseArticle>(`${KB_BASE}/${id}`, articleData);
    return data;
  },

  // Delete article
  deleteArticle: async (id: string) => {
    const { data } = await api.delete(`${KB_BASE}/${id}`);
    return data;
  },

  // Publish article
  publishArticle: async (id: string) => {
    const { data } = await api.post<KnowledgeBaseArticle>(`${KB_BASE}/${id}/publish`);
    return data;
  },

  // Search articles
  searchArticles: async (query: string) => {
    const { data } = await api.get<{ data: KnowledgeBaseArticle[] }>(
      `${KB_BASE}/search?q=${encodeURIComponent(query)}`
    );
    return data;
  },

  // Rate article (helpful/not helpful)
  rateArticle: async (id: string, isHelpful: boolean) => {
    const { data } = await api.post<KnowledgeBaseArticle>(`${KB_BASE}/${id}/rate`, {
      isHelpful,
    });
    return data;
  },

  // Increment view count
  incrementViewCount: async (id: string) => {
    const { data } = await api.post<KnowledgeBaseArticle>(`${KB_BASE}/${id}/view`);
    return data;
  },

  // Get related articles
  getRelatedArticles: async (id: string) => {
    const { data } = await api.get<{ data: KnowledgeBaseArticle[] }>(
      `${KB_BASE}/${id}/related`
    );
    return data;
  },

  // Get article statistics
  getStats: async () => {
    const { data } = await api.get<ArticleStats>(`${KB_BASE}/stats`);
    return data;
  },

  // Get featured articles
  getFeaturedArticles: async (limit: number = 5) => {
    const { data } = await api.get<{ data: KnowledgeBaseArticle[] }>(
      `${KB_BASE}/featured?limit=${limit}`
    );
    return data;
  },
};
