import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_SHIPPING = 'free_shipping',
}

export enum DiscountApplicability {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  CATEGORIES = 'categories',
  CART_TOTAL = 'cart_total',
}

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true, nullable: true })
  code: string; // Coupon code (nullable for auto-applied discounts)

  @Column({
    type: 'simple-enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  type: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number; // Percentage or fixed amount

  @Column({
    type: 'simple-enum',
    enum: DiscountApplicability,
    default: DiscountApplicability.ALL_PRODUCTS,
  })
  applicability: DiscountApplicability;

  @Column({ default: true })
  active: boolean;

  // Date range
  @Column({ nullable: true, type: 'timestamp' })
  validFrom: Date;

  @Column({ nullable: true, type: 'timestamp' })
  validTo: Date;

  // Applicable products/categories
  @Column({ type: 'simple-array', nullable: true })
  applicableProductIds: string[];

  @Column({ type: 'simple-array', nullable: true })
  applicableCategoryIds: string[];

  // Usage limits
  @Column({ nullable: true })
  maxUses: number;

  @Column({ default: 0 })
  currentUses: number;

  @Column({ nullable: true })
  maxUsesPerCustomer: number;

  // Minimum requirements
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number;

  @Column({ nullable: true })
  minQuantity: number;

  // Buy X Get Y configuration
  @Column({ type: 'json', nullable: true })
  buyXGetYConfig: {
    buyQuantity: number;
    getQuantity: number;
    getProductId?: string; // If different product
    getDiscount?: number; // Percentage off the "get" items
  };

  // Stacking rules
  @Column({ default: true })
  canCombineWithOtherDiscounts: boolean;

  @Column({ type: 'simple-array', nullable: true })
  excludedDiscountIds: string[];

  // Priority
  @Column({ default: 1 })
  priority: number;

  // Customer targeting
  @Column({ type: 'simple-array', nullable: true })
  customerSegments: string[];

  @Column({ type: 'simple-array', nullable: true })
  excludedCustomerIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
