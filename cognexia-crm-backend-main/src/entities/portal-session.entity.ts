import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PortalUser } from './portal-user.entity';

@Entity('crm_portal_sessions')
export class PortalSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PortalUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portal_user_id' })
  portalUser: PortalUser;

  @Column({ name: 'portal_user_id' })
  portalUserId: string;

  @Column({ name: 'session_token', unique: true })
  sessionToken: string;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
