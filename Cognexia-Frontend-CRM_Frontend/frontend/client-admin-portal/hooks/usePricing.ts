import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { priceListApi, discountApi, pricingApi } from '@/services/pricing.api';
import type {
  PriceList,
  CreatePriceListDto,
  UpdatePriceListDto,
  Discount,
  CreateDiscountDto,
  UpdateDiscountDto,
  CalculatePriceDto,
  PriceCalculationResult,
} from '@/types/api.types';

const PRICE_LIST_KEY = 'priceLists';
const DISCOUNT_KEY = 'discounts';
const PRICING_KEY = 'pricing';

// Price List Hooks
export const useGetPriceLists = () => {
  return useQuery<PriceList[]>({
    queryKey: [PRICE_LIST_KEY],
    queryFn: () => priceListApi.getPriceLists(),
  });
};

export const useGetActivePriceLists = () => {
  return useQuery<PriceList[]>({
    queryKey: [PRICE_LIST_KEY, 'active'],
    queryFn: () => priceListApi.getActivePriceLists(),
  });
};

export const useGetPriceList = (id: string) => {
  return useQuery<PriceList>({
    queryKey: [PRICE_LIST_KEY, id],
    queryFn: () => priceListApi.getPriceListById(id),
    enabled: !!id,
  });
};

export const useCreatePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceListDto) => priceListApi.createPriceList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_LIST_KEY] });
    },
  });
};

export const useUpdatePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePriceListDto }) =>
      priceListApi.updatePriceList(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRICE_LIST_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRICE_LIST_KEY, variables.id] });
    },
  });
};

export const useDeletePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => priceListApi.deletePriceList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_LIST_KEY] });
    },
  });
};

// Discount Hooks
export const useGetDiscounts = () => {
  return useQuery<Discount[]>({
    queryKey: [DISCOUNT_KEY],
    queryFn: () => discountApi.getDiscounts(),
  });
};

export const useGetActiveDiscounts = () => {
  return useQuery<Discount[]>({
    queryKey: [DISCOUNT_KEY, 'active'],
    queryFn: () => discountApi.getActiveDiscounts(),
  });
};

export const useGetDiscount = (id: string) => {
  return useQuery<Discount>({
    queryKey: [DISCOUNT_KEY, id],
    queryFn: () => discountApi.getDiscountById(id),
    enabled: !!id,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountDto) => discountApi.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY] });
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
      discountApi.updateDiscount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY, variables.id] });
    },
  });
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountApi.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_KEY] });
    },
  });
};

export const useValidateDiscountCode = () => {
  return useMutation({
    mutationFn: ({ code, customerId, cartTotal }: { code: string; customerId?: string; cartTotal?: number }) =>
      discountApi.validateDiscountCode(code, customerId, cartTotal),
  });
};

// Pricing Calculation Hooks
export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: (data: CalculatePriceDto) => pricingApi.calculatePrice(data),
  });
};

export const useCalculateBulkPrice = () => {
  return useMutation({
    mutationFn: ({ items, customerId }: { items: CalculatePriceDto[]; customerId?: string }) =>
      pricingApi.calculateBulkPrice(items, customerId),
  });
};

export const useApplyDiscount = () => {
  return useMutation({
    mutationFn: ({ code, customerId }: { code: string; customerId?: string }) =>
      pricingApi.applyDiscount(code, customerId),
  });
};
