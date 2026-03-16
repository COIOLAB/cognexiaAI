import apiClient from '@/lib/api-client';
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

const PRICE_LIST_URL = '/price-lists';
const DISCOUNT_URL = '/discounts';
const PRICING_URL = '/pricing';

export const priceListApi = {
  async getPriceLists(): Promise<PriceList[]> {
    const response = await apiClient.get(PRICE_LIST_URL);
    return response.data;
  },

  async getActivePriceLists(): Promise<PriceList[]> {
    const response = await apiClient.get(`${PRICE_LIST_URL}/active`);
    return response.data;
  },

  async getPriceListById(id: string): Promise<PriceList> {
    const response = await apiClient.get(`${PRICE_LIST_URL}/${id}`);
    return response.data;
  },

  async createPriceList(data: CreatePriceListDto): Promise<PriceList> {
    const response = await apiClient.post(PRICE_LIST_URL, data);
    return response.data;
  },

  async updatePriceList(id: string, data: UpdatePriceListDto): Promise<PriceList> {
    const response = await apiClient.put(`${PRICE_LIST_URL}/${id}`, data);
    return response.data;
  },

  async deletePriceList(id: string): Promise<void> {
    await apiClient.delete(`${PRICE_LIST_URL}/${id}`);
  },
};

export const discountApi = {
  async getDiscounts(): Promise<Discount[]> {
    const response = await apiClient.get(DISCOUNT_URL);
    return response.data;
  },

  async getActiveDiscounts(): Promise<Discount[]> {
    const response = await apiClient.get(`${DISCOUNT_URL}/active`);
    return response.data;
  },

  async getDiscountById(id: string): Promise<Discount> {
    const response = await apiClient.get(`${DISCOUNT_URL}/${id}`);
    return response.data;
  },

  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    const response = await apiClient.post(DISCOUNT_URL, data);
    return response.data;
  },

  async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Discount> {
    const response = await apiClient.put(`${DISCOUNT_URL}/${id}`, data);
    return response.data;
  },

  async deleteDiscount(id: string): Promise<void> {
    await apiClient.delete(`${DISCOUNT_URL}/${id}`);
  },

  async validateDiscountCode(code: string, customerId?: string, cartTotal?: number): Promise<any> {
    const response = await apiClient.post(`${DISCOUNT_URL}/validate-code`, {
      code,
      customerId,
      cartTotal,
    });
    return response.data;
  },
};

export const pricingApi = {
  async calculatePrice(data: CalculatePriceDto): Promise<PriceCalculationResult> {
    const response = await apiClient.post(`${PRICING_URL}/calculate`, data);
    return response.data;
  },

  async calculateBulkPrice(items: CalculatePriceDto[], customerId?: string): Promise<PriceCalculationResult[]> {
    const response = await apiClient.post(`${PRICING_URL}/calculate-bulk`, {
      items,
      customerId,
    });
    return response.data;
  },

  async applyDiscount(code: string, customerId?: string): Promise<any> {
    const response = await apiClient.post(`${PRICING_URL}/apply-discount`, {
      code,
      customerId,
    });
    return response.data;
  },
};
