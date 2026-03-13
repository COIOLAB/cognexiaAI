import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentSignature, SignatureStatus, SignatureProvider } from '../entities/document-signature.entity';
import { Document, DocumentStatus } from '../entities/document.entity';
import { EmailSenderService } from './email-sender.service';
import { RequestSignatureDto, SignDocumentDto } from '../dto/document.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(DocumentSignature)
    private signatureRepository: Repository<DocumentSignature>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private emailSenderService: EmailSenderService,
  ) {}

  async requestSignature(
    tenantId: string,
    dto: RequestSignatureDto,
  ): Promise<DocumentSignature> {
    const document = await this.documentRepository.findOne({
      where: { id: dto.documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const signature = this.signatureRepository.create({
      ...dto,
      tenantId,
      status: SignatureStatus.PENDING,
    });

    const savedSignature = await this.signatureRepository.save(signature);

    // Send signature request email
    await this.sendSignatureRequest(savedSignature, document);

    // Update signature status
    await this.signatureRepository.update(savedSignature.id, {
      status: SignatureStatus.SENT,
    });

    return savedSignature;
  }

  private async sendSignatureRequest(
    signature: DocumentSignature,
    document: Document,
  ): Promise<void> {
    const signatureLink = `${process.env.APP_URL}/signature/${signature.id}`;

    await this.emailSenderService.sendEmail(
      signature.tenantId,
      signature.signerEmail,
      `Signature Request: ${document.name}`,
      `
        <h2>Document Signature Request</h2>
        <p>Hello ${signature.signerName},</p>
        <p>You have been requested to sign the following document:</p>
        <p><strong>${document.name}</strong></p>
        <p>Please click the link below to review and sign the document:</p>
        <p><a href="${signatureLink}">Review and Sign Document</a></p>
        <p>If you have any questions, please contact us.</p>
      `
    );
  }

  async trackView(signatureId: string): Promise<void> {
    await this.signatureRepository.update(signatureId, {
      status: SignatureStatus.VIEWED,
      viewedAt: new Date(),
    });
  }

  async signDocument(
    signatureId: string,
    dto: SignDocumentDto,
  ): Promise<DocumentSignature> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ['document'],
    });

    if (!signature) {
      throw new NotFoundException('Signature request not found');
    }

    if (signature.status === SignatureStatus.SIGNED) {
      throw new BadRequestException('Document already signed');
    }

    if (signature.status === SignatureStatus.EXPIRED) {
      throw new BadRequestException('Signature request expired');
    }

    // Update signature
    signature.signatureData = dto.signatureData;
    signature.ipAddress = dto.ipAddress;
    signature.signedAt = new Date();
    signature.status = SignatureStatus.SIGNED;

    await this.signatureRepository.save(signature);

    // Check if all signatures are complete
    await this.checkAllSignaturesComplete(signature.documentId, signature.tenantId);

    return signature;
  }

  private async checkAllSignaturesComplete(
    documentId: string,
    tenantId: string,
  ): Promise<void> {
    const signatures = await this.signatureRepository.find({
      where: { documentId, tenantId },
    });

    const allSigned = signatures.every((sig) => sig.status === SignatureStatus.SIGNED);

    if (allSigned) {
      await this.documentRepository.update(documentId, {
        status: DocumentStatus.SIGNED,
      });
    }
  }

  async declineSignature(
    signatureId: string,
    reason: string,
  ): Promise<DocumentSignature> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
    });

    if (!signature) {
      throw new NotFoundException('Signature request not found');
    }

    signature.status = SignatureStatus.DECLINED;
    signature.declinedAt = new Date();
    signature.declineReason = reason;

    return this.signatureRepository.save(signature);
  }

  async getDocumentSignatures(
    documentId: string,
    tenantId: string,
  ): Promise<DocumentSignature[]> {
    return this.signatureRepository.find({
      where: { documentId, tenantId },
      order: { signingOrder: 'ASC' },
    });
  }

  async getAuditTrail(documentId: string, tenantId: string): Promise<{ events: any[] }> {
    const signatures = await this.getDocumentSignatures(documentId, tenantId);

    const events = signatures.flatMap((signature) => {
      type SignatureEvent = {
        type: string;
        signatureId: string;
        signer: string;
        timestamp: Date;
        reason?: string;
      };
      const signatureEvents: SignatureEvent[] = [
        {
          type: 'requested',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.createdAt,
        },
      ];

      if (signature.status === SignatureStatus.SENT) {
        signatureEvents.push({
          type: 'sent',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.updatedAt,
        });
      }

      if (signature.viewedAt) {
        signatureEvents.push({
          type: 'viewed',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.viewedAt,
        });
      }

      if (signature.signedAt) {
        signatureEvents.push({
          type: 'signed',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.signedAt,
        });
      }

      if (signature.declinedAt) {
        signatureEvents.push({
          type: 'declined',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.declinedAt,
          reason: signature.declineReason,
        });
      }

      if (signature.lastReminderSentAt) {
        signatureEvents.push({
          type: 'reminder_sent',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.lastReminderSentAt,
        });
      }

      if (signature.status === SignatureStatus.EXPIRED && signature.expiresAt) {
        signatureEvents.push({
          type: 'expired',
          signatureId: signature.id,
          signer: signature.signerEmail,
          timestamp: signature.expiresAt,
        });
      }

      return signatureEvents;
    });

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { events };
  }

  async sendReminder(signatureId: string): Promise<void> {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ['document'],
    });

    if (!signature) {
      throw new NotFoundException('Signature request not found');
    }

    if (signature.status !== SignatureStatus.SENT && signature.status !== SignatureStatus.VIEWED) {
      return;
    }

    await this.sendSignatureRequest(signature, signature.document);

    await this.signatureRepository.update(signatureId, {
      lastReminderSentAt: new Date(),
      reminderCount: signature.reminderCount + 1,
    });
  }

  // Cron job to check expired signatures
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSignatures(): Promise<void> {
    const now = new Date();
    await this.signatureRepository
      .createQueryBuilder()
      .update(DocumentSignature)
      .set({ status: SignatureStatus.EXPIRED })
      .where('expiresAt < :now', { now })
      .andWhere('status NOT IN (:...statuses)', {
        statuses: [SignatureStatus.SIGNED, SignatureStatus.DECLINED, SignatureStatus.EXPIRED],
      })
      .execute();
  }

  // Integration with DocuSign (stub - requires DocuSign SDK)
  async sendToDocuSign(
    documentId: string,
    tenantId: string,
    recipients: { name: string; email: string }[],
  ): Promise<string> {
    // This is a stub - implement actual DocuSign integration
    // Install: npm install docusign-esign
    
    throw new BadRequestException('DocuSign integration not configured');
    
    // Example integration code:
    /*
    const docuSignClient = new DocuSign.ApiClient();
    docuSignClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
    docuSignClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    
    const envelopeDefinition = new DocuSign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Please sign this document';
    
    // Add document
    const doc = new DocuSign.Document();
    doc.documentBase64 = documentBase64;
    doc.name = 'Document';
    doc.fileExtension = 'pdf';
    doc.documentId = '1';
    envelopeDefinition.documents = [doc];
    
    // Add recipients
    const signer = new DocuSign.Signer();
    signer.email = recipient.email;
    signer.name = recipient.name;
    signer.recipientId = '1';
    signer.routingOrder = '1';
    
    envelopeDefinition.recipients = new DocuSign.Recipients();
    envelopeDefinition.recipients.signers = [signer];
    
    envelopeDefinition.status = 'sent';
    
    const envelopesApi = new DocuSign.EnvelopesApi(docuSignClient);
    const results = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
    
    return results.envelopeId;
    */
  }
}
