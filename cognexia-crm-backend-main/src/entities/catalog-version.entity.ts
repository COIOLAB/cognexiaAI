import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Catalog } from './catalog.entity';
import { Organization } from './organization.entity';

@Entity('catalog_versions')
@Index(['catalogId', 'organizationId'])
export class CatalogVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'catalog_id' })
  catalogId: string;

  @ManyToOne(() => Catalog, { nullable: false })
  @JoinColumn({ name: 'catalog_id' })
  catalog: Catalog;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'text', nullable: true })
  changes: string;

  @Column({ type: 'varchar', length: 100 })
  createdBy: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
