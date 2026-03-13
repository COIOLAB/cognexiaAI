import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from './product.entity';

export enum BundleType {
  FIXED = 'fixed', // Fixed set of products
  FLEXIBLE = 'flexible', // Customer can choose from options
  SUBSCRIPTION = 'subscription', // Recurring bundle
}

export interface BundleItem {
  productId: string;
  quantity: number;
  optional?: boolean; // For flexible bundles
  discountPercentage?: number; // Item-specific discount
}

@Entity('product_bundles')
export class ProductBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  sku: string;

  @Column({
    type: 'simple-enum',
    enum: BundleType,
    default: BundleType.FIXED,
  })
  type: BundleType;

  @Column({ default: true })
  active: boolean;

  // Bundle items
  @Column({ type: 'json' })
  items: BundleItem[];

  // Products (denormalized for easier queries)
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'bundle_products',
    joinColumn: { name: 'bundleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bundlePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // Sum of individual prices

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ default: 'USD' })
  currency: string;

  // Flexible bundle options
  @Column({ nullable: true })
  minItemsRequired: number;

  @Column({ nullable: true })
  maxItemsAllowed: number;

  // Subscription (if type is SUBSCRIPTION)
  @Column({ nullable: true })
  subscriptionInterval: string; // monthly, quarterly, yearly

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subscriptionPrice: number;

  // Availability
  @Column({ nullable: true, type: 'timestamp' })
  availableFrom: Date;

  @Column({ nullable: true, type: 'timestamp' })
  availableTo: Date;

  // Inventory
  @Column({ default: true })
  trackInventory: boolean;

  @Column({ default: 0 })
  quantityInStock: number;

  // Images
  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  // Sales tracking
  @Column({ default: 0 })
  totalSold: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  // SEO
  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get savings(): number {
    if (this.originalPrice) {
      return Number(this.originalPrice) - Number(this.bundlePrice);
    }
    return 0;
  }

  get savingsPercentage(): number {
    if (this.originalPrice && this.originalPrice > 0) {
      return ((this.savings / Number(this.originalPrice)) * 100);
    }
    return 0;
  }
}
