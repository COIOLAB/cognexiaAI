import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { Tenant } from './tenant.entity';

export enum SignatureStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum SignatureProvider {
  DOCUSIGN = 'docusign',
  HELLOSIGN = 'hellosign',
  ADOBE_SIGN = 'adobe_sign',
  INTERNAL = 'internal',
}

@Entity('crm_document_signatures')
export class DocumentSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: string;

  // Signer information
  @Column({ name: 'signer_name' })
  signerName: string;

  @Column({ name: 'signer_email' })
  signerEmail: string;

  @Column({ name: 'signer_role', nullable: true })
  signerRole: string; // 'client', 'vendor', 'approver', etc.

  @Column({ name: 'signing_order', default: 1 })
  signingOrder: number;

  // Signature status
  @Column({ type: 'simple-enum', enum: SignatureStatus, default: SignatureStatus.PENDING })
  status: SignatureStatus;

  // E-signature provider
  @Column({ type: 'simple-enum', enum: SignatureProvider, default: SignatureProvider.INTERNAL })
  provider: SignatureProvider;

  @Column({ name: 'provider_envelope_id', nullable: true })
  providerEnvelopeId: string; // External provider's envelope/request ID

  @Column({ name: 'provider_signature_id', nullable: true })
  providerSignatureId: string;

  // Signature data
  @Column({ type: 'text', nullable: true })
  signatureData: string; // Base64 encoded signature image

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  declinedAt: Date;

  @Column({ type: 'text', nullable: true })
  declineReason: string;

  // Reminder tracking
  @Column({ type: 'timestamp', nullable: true })
  lastReminderSentAt: Date;

  @Column({ default: 0 })
  reminderCount: number;

  // Expiry
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
