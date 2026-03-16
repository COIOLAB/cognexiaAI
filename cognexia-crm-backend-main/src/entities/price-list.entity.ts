import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PriceListType {
  STANDARD = 'standard',
  CUSTOMER_SPECIFIC = 'customer_specific',
  VOLUME = 'volume',
  PROMOTIONAL = 'promotional',
  SEASONAL = 'seasonal',
}

export interface PriceListItem {
  productId: string;
  price: number;
  minQuantity?: number;
  maxQuantity?: number;
}

@Entity('price_lists')
export class PriceList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: PriceListType,
    default: PriceListType.STANDARD,
  })
  type: PriceListType;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 1 })
  priority: number; // Higher priority = applied first

  // Date range
  @Column({ nullable: true, type: 'timestamp' })
  validFrom: Date;

  @Column({ nullable: true, type: 'timestamp' })
  validTo: Date;

  // Customer targeting
  @Column({ type: 'simple-array', nullable: true })
  customerIds: string[];

  @Column({ type: 'simple-array', nullable: true })
  customerSegments: string[];

  // Product prices
  @Column({ type: 'json' })
  prices: PriceListItem[];

  // Volume pricing
  @Column({ default: false })
  isVolumePricing: boolean;

  // Additional conditions
  @Column({ type: 'json', nullable: true })
  conditions: {
    minOrderValue?: number;
    maxOrderValue?: number;
    applicableCategories?: string[];
    excludedCategories?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
