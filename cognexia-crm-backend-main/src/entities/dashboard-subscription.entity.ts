import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { Organization } from './organization.entity';

@Entity('dashboard_subscriptions')
@Index(['userId', 'organizationId'])
export class DashboardSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 100 })
  userId: string;

  @Column({ name: 'dashboard_id' })
  dashboardId: string;

  @ManyToOne(() => Dashboard, { nullable: false })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: Dashboard;

  @Column({ type: 'simple-json', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}