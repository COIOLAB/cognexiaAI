import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
  NUMBER = 'number',
  DATE = 'date',
}

@Entity('crm_form_fields')
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'simple-enum', enum: FieldType })
  type: FieldType;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'simple-array', nullable: true })
  options: string[]; // For select, checkbox, radio

  @Column({ type: 'json', nullable: true })
  validation: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };

  @Column({ name: 'is_custom', default: false })
  isCustom: boolean; // Template field vs custom

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
