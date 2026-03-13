import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('contract_templates')
@Index(['organizationId'])
export class ContractTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text' })
  templateContent: string;

  @Column({ type: 'simple-json', nullable: true })
  variables: Record<string, any>;

  @Column({ type: 'varchar', length: 200, nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
