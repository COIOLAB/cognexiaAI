import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('deployments')
@Index(['environment', 'deployed_at'])
@Index(['status', 'deployed_at'])
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deployment_number', type: 'varchar', length: 50, unique: true })
  deployment_number: string;

  @Column({ type: 'varchar', length: 50 })
  environment: 'development' | 'staging' | 'production';

  @Column({ name: 'version_tag', type: 'varchar', length: 100 })
  version_tag: string;

  @Column({ name: 'git_commit_sha', type: 'varchar', length: 40 })
  git_commit_sha: string;

  @Column({ name: 'deployment_strategy', type: 'varchar', length: 50 })
  deployment_strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate';

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

  @Column({ name: 'rollout_percentage', type: 'int', default: 0 })
  rollout_percentage: number;

  @Column({ name: 'deployed_by', type: 'uuid' })
  deployed_by: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approved_by?: string;

  @Column({ name: 'deployed_at', type: 'timestamp' })
  deployed_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ type: 'json', nullable: true })
  changes: {
    type: 'feature' | 'bugfix' | 'hotfix' | 'refactor';
    description: string;
  }[];

  @Column({ name: 'health_check_status', type: 'varchar', length: 20, nullable: true })
  health_check_status?: 'passed' | 'failed' | 'warning';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ name: 'release_notes', type: 'text', nullable: true })
  release_notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
