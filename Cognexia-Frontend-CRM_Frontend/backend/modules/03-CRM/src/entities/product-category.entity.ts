import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_categories')
@Tree('closure-table')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: true })
  active: boolean;

  // Hierarchical structure
  @TreeParent()
  parent: ProductCategory;

  @TreeChildren()
  children: ProductCategory[];

  // Products in this category
  @OneToMany(() => Product, product => product.category)
  products: Product[];

  // SEO
  @Column({ nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  iconUrl: string;

  // Additional metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
