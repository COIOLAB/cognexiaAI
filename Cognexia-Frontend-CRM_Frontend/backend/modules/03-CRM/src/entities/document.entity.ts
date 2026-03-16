import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';
import { DocumentVersion } from './document-version.entity';

export enum DocumentType {
  CONTRACT = 'contract',
  PROPOSAL = 'proposal',
  INVOICE = 'invoice',
  QUOTE = 'quote',
  AGREEMENT = 'agreement',
  NDA = 'nda',
  PRESENTATION = 'presentation',
  REPORT = 'report',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  SIGNED = 'signed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

@Entity('crm_documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ type: 'simple-enum', enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  // Storage information
  @Column({ name: 'storage_provider', default: 'supabase' })
  storageProvider: string; // 'supabase', 's3', 'azure', etc.

  @Column({ name: 'storage_path', nullable: true })
  storagePath: string; // Path/URL in storage

  @Column({ name: 'storage_bucket', nullable: true })
  storageBucket: string;

  // File information
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number; // In bytes

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_extension', length: 10 })
  fileExtension: string;

  // Relationships
  @Column({ name: 'entity_type', nullable: true })
  entityType: string; // 'customer', 'deal', 'lead', etc.

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  // Version control
  @Column({ name: 'current_version', default: 1 })
  currentVersion: number;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: {
    tags?: string[];
    category?: string;
    isConfidential?: boolean;
    accessLevel?: string;
    [key: string]: any;
  };

  // Expiry tracking
  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ default: false })
  isExpired: boolean;

  // Access control
  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'simple-array', nullable: true })
  sharedWith: string[]; // User IDs

  // Upload info
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;
}
