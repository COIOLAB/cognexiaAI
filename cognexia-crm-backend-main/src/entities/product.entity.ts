import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({
    type: 'simple-enum',
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  type: ProductType;

  @Column({
    type: 'simple-enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  msrp: number; // Manufacturer's Suggested Retail Price

  @Column({ default: 'USD' })
  currency: string;

  // Inventory
  @Column({ default: true })
  trackInventory: boolean;

  @Column({ default: 0 })
  quantityInStock: number;

  @Column({ default: 0 })
  quantityReserved: number;

  @Column({ default: 10 })
  lowStockThreshold: number;

  @Column({ default: false })
  allowBackorder: boolean;

  // Category
  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => ProductCategory, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  // Product Details
  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Physical Properties
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number; // in kg

  @Column({ nullable: true })
  weightUnit: string;

  @Column({ type: 'json', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  // Images and Media
  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  @Column({ nullable: true })
  primaryImageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  videoUrls: string[];

  // SEO
  @Column({ nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  metaKeywords: string[];

  @Column({ nullable: true, unique: true })
  slug: string;

  // Additional Metadata
  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>; // Custom attributes like color, size, etc.

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, any>;

  // Sales Tracking
  @Column({ default: 0 })
  totalSold: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  // Featured and Promotions
  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isOnSale: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ nullable: true, type: 'timestamp' })
  saleStartDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  saleEndDate: Date;

  // Related Products
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_related',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'relatedProductId', referencedColumnName: 'id' },
  })
  relatedProducts: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get availableQuantity(): number {
    return this.quantityInStock - this.quantityReserved;
  }

  get isLowStock(): boolean {
    return this.availableQuantity <= this.lowStockThreshold;
  }

  get isInStock(): boolean {
    return this.availableQuantity > 0;
  }

  get finalPrice(): number {
    if (this.isOnSale && this.salePrice) {
      const now = new Date();
      if (
        (!this.saleStartDate || now >= this.saleStartDate) &&
        (!this.saleEndDate || now <= this.saleEndDate)
      ) {
        return Number(this.salePrice);
      }
    }
    return Number(this.basePrice);
  }
}
