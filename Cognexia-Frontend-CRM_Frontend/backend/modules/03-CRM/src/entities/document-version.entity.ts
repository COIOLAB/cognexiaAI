import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from './user.entity';

@Entity('crm_document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, (doc) => doc.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column({ name: 'storage_path' })
  storagePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ type: 'text', nullable: true })
  changeNote: string;

  @Column({ type: 'json', nullable: true })
  changes: {
    action: string; // 'created', 'updated', 'restored'
    modifiedFields?: string[];
    [key: string]: any;
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
