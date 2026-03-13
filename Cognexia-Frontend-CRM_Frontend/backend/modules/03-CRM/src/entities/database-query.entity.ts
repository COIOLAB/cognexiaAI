import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('database_queries')
@Index(['executed_by', 'executed_at'])
@Index(['query_type', 'status'])
export class DatabaseQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'executed_by', type: 'uuid' })
  executed_by: string;

  @Column({ name: 'query_type', type: 'varchar', length: 20 })
  query_type: 'select' | 'insert' | 'update' | 'delete' | 'other';

  @Column({ name: 'query_text', type: 'text' })
  query_text: string;

  @Column({ name: 'affected_tables', type: 'json' })
  affected_tables: string[];

  @Column({ name: 'rows_affected', type: 'int', nullable: true })
  rows_affected?: number;

  @Column({ name: 'execution_time_ms', type: 'int' })
  execution_time_ms: number;

  @Column({ type: 'varchar', length: 20 })
  status: 'success' | 'failed' | 'cancelled';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approved_by?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ name: 'executed_at', type: 'timestamp' })
  executed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
