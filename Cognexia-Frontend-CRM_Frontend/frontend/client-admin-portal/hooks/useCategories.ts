import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/services/category.api';
import type {
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/api.types';

const QUERY_KEY = 'categories';

export const useGetCategories = () => {
  return useQuery<ProductCategory[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => categoryApi.getCategories(),
  });
};

export const useGetCategory = (id: string) => {
  return useQuery<ProductCategory>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useGetCategoryTree = () => {
  return useQuery<ProductCategory[]>({
    queryKey: [QUERY_KEY, 'tree'],
    queryFn: () => categoryApi.getCategoryTree(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
