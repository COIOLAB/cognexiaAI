import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('crm_sales_pipelines')
@Index(['name'], { unique: true })
export class SalesPipeline {
  @ApiProperty({ description: 'Pipeline UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Pipeline name' })
  @Column({ unique: true, length: 255 })
  name: string;

  @ApiProperty({ description: 'Pipeline stages', type: 'object' })
  @Column({ type: 'json' })
  stages: Array<{
    id: string;
    name: string;
    order: number;
    probability: number;
    description?: string;
    isClosedWon: boolean;
    isClosedLost: boolean;
  }>;

  @ApiProperty({ description: 'Default pipeline flag' })
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Pipeline active status' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;
}
