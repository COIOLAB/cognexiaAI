import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum DashboardVisibility {
  PRIVATE = 'PRIVATE',
  TEAM = 'TEAM',
  ORGANIZATION = 'ORGANIZATION',
  PUBLIC = 'PUBLIC',
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'map';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    dataSource: string;
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    metric?: string;
    filters?: Record<string, any>;
    refreshInterval?: number;
  };
}

@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  owner_id: string;

  @Column({
    type: 'simple-enum',
    enum: DashboardVisibility,
    default: DashboardVisibility.PRIVATE,
  })
  visibility: DashboardVisibility;

  @Column('json')
  widgets: DashboardWidget[];

  @Column('json', { nullable: true })
  layout: { cols: number; rows: number };

  @Column({ default: 0 })
  view_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_viewed_at: Date;

  @Column({ default: false })
  is_template: boolean;

  @Column('simple-array', { nullable: true })
  shared_with: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
