import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('sandbox_environments')
@Index(['organizationId', 'status'])
export class SandboxEnvironment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ name: 'sandbox_url', type: 'varchar', length: 500 })
  sandbox_url: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'data_seed_status', type: 'varchar', length: 20, default: 'none' })
  data_seed_status: 'none' | 'seeding' | 'completed' | 'failed';

  @Column({ name: 'storage_used_mb', type: 'decimal', precision: 12, scale: 2, default: 0 })
  storage_used_mb: number;

  @Column({ name: 'api_calls_count', type: 'int', default: 0 })
  api_calls_count: number;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  last_accessed_at?: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ name: 'auto_reset', type: 'boolean', default: false })
  auto_reset: boolean;

  @Column({ type: 'json', nullable: true })
  configuration: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
