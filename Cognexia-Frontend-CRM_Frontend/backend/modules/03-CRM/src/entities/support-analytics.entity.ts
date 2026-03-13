import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('support_analytics')
@Index(['organization_id', 'date'])
@Index(['date'])
export class SupportAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organization_id?: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'total_tickets', type: 'int', default: 0 })
  total_tickets: number;

  @Column({ name: 'tickets_created', type: 'int', default: 0 })
  tickets_created: number;

  @Column({ name: 'tickets_resolved', type: 'int', default: 0 })
  tickets_resolved: number;

  @Column({ name: 'tickets_escalated', type: 'int', default: 0 })
  tickets_escalated: number;

  @Column({ name: 'avg_first_response_time_minutes', type: 'int', nullable: true })
  avg_first_response_time_minutes?: number;

  @Column({ name: 'avg_resolution_time_minutes', type: 'int', nullable: true })
  avg_resolution_time_minutes?: number;

  @Column({ name: 'csat_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  csat_score?: number;

  @Column({ name: 'csat_responses', type: 'int', default: 0 })
  csat_responses: number;

  @Column({ type: 'json', nullable: true })
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };

  @Column({ type: 'json', nullable: true })
  top_categories: {
    category: string;
    count: number;
  }[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
