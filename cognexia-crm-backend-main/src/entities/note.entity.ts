import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ nullable: true })
  created_by_name: string;

  @Column({ type: 'uuid', nullable: true })
  related_to_id: string;

  @Column({ nullable: true })
  related_to_type: string; // 'customer', 'lead', 'opportunity', 'task', etc.

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'json', nullable: true })
  mentions: string[]; // User IDs mentioned in the note

  @Column({ type: 'json', nullable: true })
  attachments: Array<{ fileName: string; fileUrl: string }>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
