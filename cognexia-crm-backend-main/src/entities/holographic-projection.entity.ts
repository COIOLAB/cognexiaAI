import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { Organization } from './organization.entity';

export enum ProjectionType {
  VOLUMETRIC = 'VOLUMETRIC',
  LIGHT_FIELD = 'LIGHT_FIELD',
  HOLOGRAPHIC_DISPLAY = 'HOLOGRAPHIC_DISPLAY',
  MIXED_REALITY = 'MIXED_REALITY',
}

@Entity('holographic_projections')
@Index(['customerId', 'organizationId'])
export class HolographicProjection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'simple-enum', enum: ProjectionType })
  projectionType: ProjectionType;

  @Column({ type: 'simple-json', nullable: true })
  volumetricData: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  spatialCoordinates: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  model3DUrl: string;

  @Column({ type: 'int', default: 0 })
  viewerCount: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
