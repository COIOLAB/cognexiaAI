import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Document, DocumentStatus } from '../entities/document.entity';
import { DocumentVersion } from '../entities/document-version.entity';
import { UploadDocumentDto, UpdateDocumentDto, CreateDocumentVersionDto } from '../dto/document.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DocumentService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
  ) {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  async uploadDocument(
    tenantId: string,
    userId: string,
    dto: UploadDocumentDto,
    file: Express.Multer.File,
  ): Promise<Document> {
    const isDev = process.env.NODE_ENV !== 'production';

    if (!file && isDev) {
      const fallbackName = `${tenantId}/${Date.now()}_${dto.name || 'document'}.txt`;
      const bucket = 'local';
      const document = this.documentRepository.create({
        ...dto,
        tenantId,
        uploadedById: userId,
        fileName: `${dto.name || 'document'}.txt`,
        fileSize: 0,
        mimeType: 'text/plain',
        fileExtension: 'txt',
        storagePath: `https://example.com/${fallbackName}`,
        storageBucket: bucket,
        storageProvider: 'mock',
        currentVersion: 1,
      });

      const savedDoc = await this.documentRepository.save(document);
      await this.versionRepository.save({
        documentId: savedDoc.id,
        versionNumber: 1,
        storagePath: document.storagePath,
        fileSize: 0,
        changeNote: 'Initial upload (mock)',
        changes: { action: 'created' },
        createdById: userId,
      });

      return savedDoc;
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload to Supabase Storage
    const fileName = `${tenantId}/${Date.now()}_${file.originalname}`;
    const bucket = process.env.SUPABASE_BUCKET || 'crm-documents';

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Create document record
    const document = this.documentRepository.create({
      ...dto,
      tenantId,
      uploadedById: userId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileExtension: file.originalname.split('.').pop() || '',
      storagePath: urlData.publicUrl,
      storageBucket: bucket,
      storageProvider: 'supabase',
      currentVersion: 1,
    });

    const savedDoc = await this.documentRepository.save(document);

    // Create initial version
    await this.versionRepository.save({
      documentId: savedDoc.id,
      versionNumber: 1,
      storagePath: urlData.publicUrl,
      fileSize: file.size,
      changeNote: 'Initial upload',
      changes: { action: 'created' },
      createdById: userId,
    });

    return savedDoc;
  }

  async searchDocuments(tenantId: string, query: string): Promise<Document[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const term = `%${query.trim()}%`;
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.tenantId = :tenantId', { tenantId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('document.name ILIKE :term', { term })
            .orWhere('document.description ILIKE :term', { term })
            .orWhere('document.fileName ILIKE :term', { term });
        }),
      )
      .orderBy('document.updatedAt', 'DESC')
      .limit(50)
      .getMany();
  }

  async findAll(tenantId: string, userId?: string): Promise<Document[]> {
    try {
      const queryBuilder = this.documentRepository
        .createQueryBuilder('doc')
        .where('doc.tenantId = :tenantId', { tenantId })
        .andWhere('(doc.isPublic = true OR doc.uploadedById = :userId OR :userId = ANY(doc.sharedWith))', {
          userId,
        })
        .orderBy('doc.createdAt', 'DESC');

      const docs = await queryBuilder.getMany();
      return docs || [];
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, tenantId: string): Promise<Document> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id, tenantId },
        relations: ['versions'],
      });

      if (!document) {
        return null;
      }

      // Update last accessed
      await this.documentRepository.update(id, { lastAccessedAt: new Date() });

      return document;
    } catch (error) {
      return null;
    }
  }

  async updateDocument(
    id: string,
    tenantId: string,
    dto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.findOne(id, tenantId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    Object.assign(document, dto);
    return this.documentRepository.save(document);
  }

  async deleteDocument(id: string, tenantId: string): Promise<void> {
    try {
      const document = await this.findOne(id, tenantId);
      
      if (!document) {
        console.warn(`Document ${id} not found, treating as already deleted`);
        return; // Don't throw, just return
      }

      // Delete from storage (with error handling)
      try {
        if (document.storagePath && document.storageBucket) {
          const fileName = document.storagePath.split('/').pop();
          if (fileName) {
            await this.supabase.storage.from(document.storageBucket).remove([fileName]);
          }
        }
      } catch (storageError) {
        console.warn('Failed to delete document from storage:', storageError.message);
      }

      // Delete all versions from storage
      try {
        const versions = await this.versionRepository.find({ where: { documentId: id } });
        for (const version of versions) {
          const versionFileName = version.storagePath?.split('/').pop();
          if (versionFileName && document.storageBucket) {
            await this.supabase.storage
              .from(document.storageBucket)
              .remove([versionFileName]);
          }
        }
      } catch (versionError) {
        console.warn('Failed to delete document versions from storage:', versionError.message);
      }

      await this.documentRepository.remove(document);
    } catch (error) {
      console.error('Error deleting document:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async createVersion(
    documentId: string,
    tenantId: string,
    userId: string,
    dto: CreateDocumentVersionDto,
    file: Express.Multer.File,
  ): Promise<DocumentVersion> {
    const document = await this.findOne(documentId, tenantId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const isDev = process.env.NODE_ENV !== 'production';
    if (!file && isDev) {
      const version = this.versionRepository.create({
        documentId,
        versionNumber: document.currentVersion + 1,
        storagePath: `https://example.com/${tenantId}/${Date.now()}_v${document.currentVersion + 1}.txt`,
        fileSize: 0,
        changeNote: dto.changeNote || 'Mock version',
        changes: { action: 'updated' },
        createdById: userId,
      });

      await this.versionRepository.save(version);
      await this.documentRepository.update(documentId, {
        currentVersion: document.currentVersion + 1,
        storagePath: version.storagePath,
        fileSize: 0,
      });

      return version;
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload new version to storage
    const fileName = `${tenantId}/${Date.now()}_v${document.currentVersion + 1}_${file.originalname}`;
    const bucket = document.storageBucket;

    const { data: uploadData, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Create version record
    const version = this.versionRepository.create({
      documentId,
      versionNumber: document.currentVersion + 1,
      storagePath: urlData.publicUrl,
      fileSize: file.size,
      changeNote: dto.changeNote,
      changes: { action: 'updated' },
      createdById: userId,
    });

    await this.versionRepository.save(version);

    // Update document
    await this.documentRepository.update(documentId, {
      currentVersion: document.currentVersion + 1,
      storagePath: urlData.publicUrl,
      fileSize: file.size,
    });

    return version;
  }

  async getVersions(documentId: string, tenantId: string): Promise<DocumentVersion[]> {
    try {
      const document = await this.findOne(documentId, tenantId);
      if (!document) return [];
      
      const versions = await this.versionRepository.find({
        where: { documentId },
        order: { versionNumber: 'DESC' },
      });
      return versions || [];
    } catch (error) {
      return [];
    }
  }

  async restoreVersion(
    documentId: string,
    versionNumber: number,
    tenantId: string,
    userId: string,
  ): Promise<Document> {
    const document = await this.findOne(documentId, tenantId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const resolvedDocumentId = document.id || documentId;

    const version = await this.versionRepository.findOne({
      where: { documentId: resolvedDocumentId, versionNumber },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // Create a new version with restored content
    const newVersion = this.versionRepository.create({
      documentId: resolvedDocumentId,
      document,
      versionNumber: document.currentVersion + 1,
      storagePath: version.storagePath,
      fileSize: version.fileSize,
      changeNote: `Restored from version ${versionNumber}`,
      changes: { action: 'restored', fromVersion: versionNumber },
      createdById: userId,
    });

    await this.versionRepository.save(newVersion);

    // Update document
    await this.documentRepository.update(document.id, {
      currentVersion: document.currentVersion + 1,
      storagePath: version.storagePath,
      fileSize: version.fileSize,
    });

    return this.findOne(document.id, tenantId);
  }

  async downloadDocument(id: string, tenantId: string): Promise<{ url: string; fileName: string }> {
    const document = await this.findOne(id, tenantId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.storagePath) {
      throw new NotFoundException('Document file not found');
    }

    if (document.storageProvider === 'mock' || document.storageBucket === 'local') {
      return {
        url: document.storagePath,
        fileName: document.fileName,
      };
    }

    // Get signed URL for download
    const fileName = document.storagePath.split('/').pop();
    const { data, error } = await this.supabase.storage
      .from(document.storageBucket)
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (error) {
      throw new BadRequestException(`Download failed: ${error.message}`);
    }

    return {
      url: data.signedUrl,
      fileName: document.fileName,
    };
  }

  async shareDocument(
    id: string,
    tenantId: string,
    userIds: string[],
  ): Promise<Document> {
    const document = await this.findOne(id, tenantId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const ids = Array.isArray(userIds) ? userIds : [];
    if (ids.length === 0) {
      return document;
    }
    document.sharedWith = [...new Set([...(document.sharedWith || []), ...ids])];
    return this.documentRepository.save(document);
  }

  async unshareDocument(
    id: string,
    tenantId: string,
    userIds: string[],
  ): Promise<Document> {
    const document = await this.findOne(id, tenantId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const ids = Array.isArray(userIds) ? userIds : [];
    if (ids.length === 0) {
      return document;
    }
    document.sharedWith = (document.sharedWith || []).filter((uid) => !ids.includes(uid));
    return this.documentRepository.save(document);
  }

  // Cron job to check and mark expired documents
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredDocuments(): Promise<void> {
    const now = new Date();
    await this.documentRepository
      .createQueryBuilder()
      .update(Document)
      .set({ isExpired: true, status: DocumentStatus.EXPIRED })
      .where('expiryDate < :now', { now })
      .andWhere('isExpired = false')
      .execute();
  }

  async getDocumentsByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<Document[]> {
    return this.documentRepository.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
