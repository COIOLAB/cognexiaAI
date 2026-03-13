import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { HolographicProjection } from './holographic-projection.entity';
import { Organization } from './organization.entity';

@Entity('interactive_holograms')
@Index(['hologramId', 'organizationId'])
export class InteractiveHologram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'hologram_id' })
  hologramId: string;

  @ManyToOne(() => HolographicProjection, { nullable: false })
  @JoinColumn({ name: 'hologram_id' })
  hologram: HolographicProjection;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  interactionType: string;

  @Column({ type: 'simple-json', nullable: true })
  gestureData: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  gazeTracking: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  emotionalResponse: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
