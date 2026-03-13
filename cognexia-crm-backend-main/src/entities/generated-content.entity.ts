import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('generated_contents')
@Index(['contentType', 'organizationId'])
export class GeneratedContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 200 })
  contentType: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text' })
  generatedText: string;

  @Column({ type: 'varchar', length: 200 })
  model: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}