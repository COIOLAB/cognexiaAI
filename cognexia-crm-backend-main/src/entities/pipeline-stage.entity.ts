// PipelineStage is related to SalesPipeline - create a compatible export
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { SalesPipeline } from './sales-pipeline.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  pipelineId: string;

  @ManyToOne(() => SalesPipeline, pipeline => pipeline.stages)
  pipeline: SalesPipeline;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  probability: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
