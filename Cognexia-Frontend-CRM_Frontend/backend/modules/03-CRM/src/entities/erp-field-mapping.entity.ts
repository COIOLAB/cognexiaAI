import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ERPSystem {
  ODOO = 'odoo',
  SAP = 'sap',
  ORACLE = 'oracle',
  CUSTOM = 'custom',
}

@Entity('erp_field_mappings')
export class ERPFieldMapping {
  @ApiProperty({ description: 'Mapping UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Connection ID' })
  @Column()
  connectionId: string;

  @ApiProperty({ description: 'Source field' })
  @Column()
  sourceField: string;

  @ApiProperty({ description: 'Target field' })
  @Column()
  targetField: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;
}
