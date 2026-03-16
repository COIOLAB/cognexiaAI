import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('avatar_videos')
export class AvatarVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  script: string;

  @Column({ type: 'varchar', length: 100 })
  avatarType: string;

  @Column({ type: 'varchar', length: 100 })
  voiceType: string;

  @Column({ type: 'varchar', length: 20 })
  language: string;

  @Column({ type: 'varchar', length: 500 })
  videoUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'integer' })
  duration: number;

  @Column({ type: 'jsonb' })
  specifications: any;

  @Column({ type: 'jsonb', nullable: true })
  personalization: any;

  @Column({ type: 'jsonb', nullable: true })
  quantumEnhancement: any;

  @Column({ type: 'jsonb', nullable: true })
  multiLanguageVersions: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  renderingTime: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
