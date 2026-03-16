import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('natural_language_queries')
@Index(['user_id', 'created_at'])
export class NaturalLanguageQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'query_text', type: 'text' })
  query_text: string;

  @Column({ name: 'generated_sql', type: 'text', nullable: true })
  generated_sql?: string;

  @Column({ name: 'query_interpretation', type: 'text', nullable: true })
  query_interpretation?: string;

  @Column({ type: 'json', nullable: true })
  results: any;

  @Column({ name: 'result_count', type: 'int', default: 0 })
  result_count: number;

  @Column({ name: 'execution_time_ms', type: 'int' })
  execution_time_ms: number;

  @Column({ name: 'success', type: 'boolean', default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'varchar', length: 20, default: 'query' })
  query_type: 'query' | 'report' | 'chart' | 'export';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
