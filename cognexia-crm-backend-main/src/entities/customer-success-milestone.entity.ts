import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('customer_success_milestones')
@Index(['organizationId', 'status'])
@Index(['milestone_type', 'completed_at'])
export class CustomerSuccessMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'milestone_type', type: 'varchar', length: 50 })
  milestone_type: 'onboarding' | 'activation' | 'first_value' | 'expansion' | 'advocacy';

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'target_date', type: 'date', nullable: true })
  target_date?: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completion_percentage: number;

  @Column({ type: 'json', nullable: true })
  checklist_items: {
    task: string;
    completed: boolean;
  }[];

  @Column({ name: 'assigned_csm', type: 'uuid', nullable: true })
  assigned_csm?: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
