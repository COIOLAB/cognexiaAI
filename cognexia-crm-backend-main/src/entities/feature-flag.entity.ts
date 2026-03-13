import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ type: 'int', default: 100 })
  rolloutPercentage: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  targetOrganizations: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
