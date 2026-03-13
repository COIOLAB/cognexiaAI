import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { Organization } from './organization.entity';

@Entity('product_demos_3d')
@Index(['productId', 'organizationId'])
export class ProductDemo3D {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'text', nullable: true })
  model3DUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  animations: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  interactiveFeatures: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
