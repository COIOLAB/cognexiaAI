import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('custom_reports')
export class CustomReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'json' })
  query: { fields: string[]; filters: Record<string, any>; aggregations: Record<string, any> };

  @Column('uuid')
  createdBy: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'json', nullable: true })
  schedule: { frequency: string; recipients: string[] };

  @Column({ type: 'int', default: 0 })
  runCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
