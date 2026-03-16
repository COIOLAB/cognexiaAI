import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Product } from '../entities/product.entity';
import { PriceList } from '../entities/price-list.entity';
import { Discount, DiscountType, DiscountApplicability } from '../entities/discount.entity';
import { CalculatePriceDto, PriceBreakdownDto } from '../dto/pricing.dto';

@Injectable()
export class PricingEngineService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(PriceList)
    private priceListRepository: Repository<PriceList>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async calculatePrice(tenantId: string, dto: CalculatePriceDto): Promise<PriceBreakdownDto> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Start with base price
    let unitPrice = Number(product.basePrice);

    // Apply price list if customer-specific
    if (dto.customerId) {
      const priceListPrice = await this.getPriceListPrice(product.id, dto.customerId, dto.quantity, tenantId);
      if (priceListPrice) {
        unitPrice = priceListPrice;
      }
    }

    // Apply sale price if active
    if (product.isOnSale && product.salePrice) {
      const now = new Date();
      if (
        (!product.saleStartDate || now >= product.saleStartDate) &&
        (!product.saleEndDate || now <= product.saleEndDate)
      ) {
        unitPrice = Number(product.salePrice);
      }
    }

    const subtotal = unitPrice * dto.quantity;

    // Apply discounts
    const discounts = await this.getApplicableDiscounts(
      product,
      dto.quantity,
      subtotal,
      dto.customerId,
      dto.discountCode,
      tenantId
    );

    let totalDiscount = 0;
    const appliedDiscounts = [];

    for (const discount of discounts) {
      const discountAmount = this.calculateDiscountAmount(
        discount,
        subtotal - totalDiscount,
        dto.quantity
      );

      if (discountAmount > 0) {
        totalDiscount += discountAmount;
        appliedDiscounts.push({
          name: discount.name,
          type: discount.type,
          amount: discountAmount,
        });
      }
    }

    const total = Math.max(subtotal - totalDiscount, 0);

    return {
      productId: product.id,
      productName: product.name,
      quantity: dto.quantity,
      basePrice: Number(product.basePrice),
      unitPrice,
      subtotal,
      discounts: appliedDiscounts,
      total,
    };
  }

  async calculateBulkPrice(tenantId: string, items: CalculatePriceDto[], customerId?: string): Promise<{
    items: PriceBreakdownDto[];
    subtotal: number;
    totalDiscount: number;
    total: number;
  }> {
    const calculations = await Promise.all(
      items.map(item => this.calculatePrice(tenantId, { ...item, customerId }))
    );

    const subtotal = calculations.reduce((sum, calc) => sum + calc.subtotal, 0);
    const totalDiscount = calculations.reduce((sum, calc) =>
      sum + calc.discounts.reduce((d, disc) => d + disc.amount, 0), 0
    );
    const total = calculations.reduce((sum, calc) => sum + calc.total, 0);

    return {
      items: calculations,
      subtotal,
      totalDiscount,
      total,
    };
  }

  private async getPriceListPrice(
    productId: string,
    customerId: string,
    quantity: number,
    tenantId: string
  ): Promise<number | null> {
    const now = new Date();

    const priceLists = await this.priceListRepository.find({
      where: {
        tenantId,
        active: true,
      },
      order: { priority: 'DESC' },
    });

    for (const priceList of priceLists) {
      // Check date validity
      if (priceList.validFrom && now < priceList.validFrom) continue;
      if (priceList.validTo && now > priceList.validTo) continue;

      // Check customer applicability
      if (priceList.customerIds && !priceList.customerIds.includes(customerId)) continue;

      // Find price for this product
      const priceItem = priceList.prices.find(p => p.productId === productId);
      if (!priceItem) continue;

      // Check quantity range for volume pricing
      if (priceList.isVolumePricing) {
        if (priceItem.minQuantity && quantity < priceItem.minQuantity) continue;
        if (priceItem.maxQuantity && quantity > priceItem.maxQuantity) continue;
      }

      return priceItem.price;
    }

    return null;
  }

  private async getApplicableDiscounts(
    product: Product,
    quantity: number,
    subtotal: number,
    customerId: string | undefined,
    discountCode: string | undefined,
    tenantId: string
  ): Promise<Discount[]> {
    const now = new Date();
    const query = this.discountRepository.createQueryBuilder('discount')
      .where('discount.tenantId = :tenantId', { tenantId })
      .andWhere('discount.active = true');

    // Date range
    query.andWhere('(discount.validFrom IS NULL OR discount.validFrom <= :now)', { now });
    query.andWhere('(discount.validTo IS NULL OR discount.validTo >= :now)', { now });

    // Usage limits
    query.andWhere('(discount.maxUses IS NULL OR discount.currentUses < discount.maxUses)');

    const discounts = await query.getMany();

    return discounts.filter(discount => {
      // Check discount code
      if (discount.code && discount.code !== discountCode) return false;

      // Check minimum requirements
      if (discount.minPurchaseAmount && subtotal < Number(discount.minPurchaseAmount)) return false;
      if (discount.minQuantity && quantity < discount.minQuantity) return false;

      // Check applicability
      switch (discount.applicability) {
        case DiscountApplicability.SPECIFIC_PRODUCTS:
          if (!discount.applicableProductIds?.includes(product.id)) return false;
          break;
        case DiscountApplicability.CATEGORIES:
          if (!discount.applicableCategoryIds?.includes(product.categoryId)) return false;
          break;
      }

      // Check customer exclusions
      if (customerId && discount.excludedCustomerIds?.includes(customerId)) return false;

      return true;
    }).sort((a, b) => b.priority - a.priority);
  }

  private calculateDiscountAmount(discount: Discount, amount: number, quantity: number): number {
    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        return (amount * Number(discount.value)) / 100;

      case DiscountType.FIXED_AMOUNT:
        return Math.min(Number(discount.value), amount);

      case DiscountType.BUY_X_GET_Y:
        if (discount.buyXGetYConfig) {
          const { buyQuantity, getQuantity, getDiscount = 100 } = discount.buyXGetYConfig;
          const setsQualified = Math.floor(quantity / buyQuantity);
          const freeItems = setsQualified * getQuantity;
          const pricePerItem = amount / quantity;
          return (freeItems * pricePerItem * getDiscount) / 100;
        }
        return 0;

      case DiscountType.FREE_SHIPPING:
        // This would be handled separately in shipping calculation
        return 0;

      default:
        return 0;
    }
  }

  async applyDiscountCode(code: string, customerId: string | undefined, tenantId: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { code, tenantId, active: true },
    });

    if (!discount) {
      throw new Error('Invalid discount code');
    }

    // Validate discount
    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      throw new Error('Discount not yet valid');
    }
    if (discount.validTo && now > discount.validTo) {
      throw new Error('Discount has expired');
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      throw new Error('Discount usage limit reached');
    }

    return discount;
  }

  async incrementDiscountUsage(discountId: string): Promise<void> {
    await this.discountRepository.increment({ id: discountId }, 'currentUses', 1);
  }
}
