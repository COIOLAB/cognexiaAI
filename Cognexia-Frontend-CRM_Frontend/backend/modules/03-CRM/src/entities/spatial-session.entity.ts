import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

export enum SessionStatus {
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

@Entity('spatial_sessions')
@Index(['organizationId'])
export class SpatialSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 500 })
  sessionName: string;

  @Column({ type: 'simple-json' })
  participantIds: string[];

  @Column({ type: 'simple-enum', enum: SessionStatus, default: SessionStatus.INITIALIZING })
  status: SessionStatus;

  @Column({ type: 'simple-json', nullable: true })
  spatialEnvironment: Record<string, any>;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
