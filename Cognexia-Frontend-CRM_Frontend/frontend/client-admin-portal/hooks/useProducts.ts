import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/product.api';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '@/types/api.types';

const QUERY_KEY = 'products';

export const useGetProducts = (params?: ProductQueryDto) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => productApi.getProducts(params),
  });
};

export const useGetProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
};

export const useSearchProducts = (params: ProductQueryDto) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, 'search', params],
    queryFn: () => productApi.searchProducts(params),
    enabled: !!params.search || !!params.categoryId,
  });
};

export const useGetFeaturedProducts = (limit?: number) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, 'featured', limit],
    queryFn: () => productApi.getFeaturedProducts(limit),
  });
};

export const useGetOnSaleProducts = (limit?: number) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, 'on-sale', limit],
    queryFn: () => productApi.getOnSaleProducts(limit),
  });
};

export const useGetBestSellers = (limit?: number) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, 'best-sellers', limit],
    queryFn: () => productApi.getBestSellers(limit),
  });
};

export const useGetRecommendations = (productId: string, limit?: number) => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, productId, 'recommendations', limit],
    queryFn: () => productApi.getRecommendations(productId, limit),
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
