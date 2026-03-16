import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('impersonation_sessions')
export class ImpersonationSession {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Super admin who is impersonating' })
  @Column('uuid')
  adminUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminUserId' })
  adminUser: User;

  @ApiProperty({ description: 'User being impersonated' })
  @Column('uuid')
  targetUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  @ApiProperty()
  @Column({ type: 'text' })
  reason: string;

  @ApiProperty()
  @Column()
  ipAddress: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
