import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AnnouncementType { INFO = 'info', WARNING = 'warning', URGENT = 'urgent' }
export enum AnnouncementTarget { ALL = 'all', TIER = 'tier', SPECIFIC = 'specific' }

@Entity('platform_announcements')
export class PlatformAnnouncement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: AnnouncementType, default: AnnouncementType.INFO })
  type: AnnouncementType;

  @Column({ type: 'enum', enum: AnnouncementTarget, default: AnnouncementTarget.ALL })
  targetType: AnnouncementTarget;

  @Column({ type: 'json', nullable: true })
  targetOrganizations: string[];

  @Column({ nullable: true })
  targetTier: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
