import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

@Entity('erp_connections')
export class ERPConnection {
  @ApiProperty({ description: 'Connection UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @ApiProperty({ description: 'ERP system name' })
  @Column()
  systemName: string;

  @ApiProperty({ description: 'ERP system' })
  @Column({ nullable: true })
  erpSystem?: string;

  @ApiProperty({ description: 'Connection string' })
  @Column({ type: 'text' })
  connectionString: string;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
