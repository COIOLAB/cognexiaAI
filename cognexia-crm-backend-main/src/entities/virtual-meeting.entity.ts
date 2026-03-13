import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('virtual_meetings')
@Index(['organizationId'])
export class VirtualMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'simple-json' })
  participants: string[];

  @Column({ type: 'text', nullable: true })
  vrEnvironment: string;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'simple-json', nullable: true })
  recordings: string[];

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
