import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Catalog } from './catalog.entity';
import { Product } from './product.entity';
import { Organization } from './organization.entity';

@Entity('catalog_products')
@Index(['catalogId', 'productId', 'organizationId'])
export class CatalogProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'catalog_id' })
  catalogId: string;

  @ManyToOne(() => Catalog, { nullable: false })
  @JoinColumn({ name: 'catalog_id' })
  catalog: Catalog;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'simple-json', nullable: true })
  customizations: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  pricing: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
