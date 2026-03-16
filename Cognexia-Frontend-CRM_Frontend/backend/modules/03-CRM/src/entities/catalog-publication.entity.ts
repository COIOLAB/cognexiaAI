import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Catalog } from './catalog.entity';
import { Organization } from './organization.entity';

@Entity('catalog_publications')
@Index(['catalogId', 'organizationId'])
export class CatalogPublication {
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

  @Column({ type: 'varchar', length: 100 })
  publishedBy: string;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'varchar', length: 200 })
  channel: string;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
