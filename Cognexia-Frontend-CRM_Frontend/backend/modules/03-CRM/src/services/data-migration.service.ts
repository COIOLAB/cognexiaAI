import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Contact } from '../entities/contact.entity';
import { DataMigrationJob, MigrationStatus, MigrationType } from '../entities/data-migration-job.entity';
import { ERPFieldMapping } from '../entities/erp-field-mapping.entity';
import { ERPConnection } from '../entities/erp-connection.entity';
import { logDebug, logError } from '../utils/logger.util';

export interface MigrationOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
  batchSize?: number;
  conflictResolution?: 'skip' | 'update' | 'error';
  createRelations?: boolean;
  continueOnError?: boolean;
}

export interface MigrationResult {
  jobId: string;
  status: MigrationStatus;
  totalRecords: number;
  processedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  errors: any[];
}

@Injectable()
export class DataMigrationService {
  constructor(
    @InjectRepository(DataMigrationJob)
    private migrationJobRepo: Repository<DataMigrationJob>,
    @InjectRepository(ERPFieldMapping)
    private mappingRepo: Repository<ERPFieldMapping>,
    @InjectRepository(ERPConnection)
    private connectionRepo: Repository<ERPConnection>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new migration job
   */
  async createMigrationJob(
    organizationId: string,
    userId: string,
    jobName: string,
    migrationType: MigrationType,
    targetEntity: string,
    options?: MigrationOptions,
    sourceSystem?: string,
    targetSystem?: string,
  ): Promise<DataMigrationJob> {
    const resolvedSourceSystem =
      sourceSystem ||
      (migrationType === MigrationType.IMPORT_CSV
        ? 'csv'
        : migrationType === MigrationType.IMPORT_EXCEL
          ? 'excel'
          : 'external');
    const resolvedTargetSystem = targetSystem || 'crm';
    const job = this.migrationJobRepo.create({
      organizationId,
      jobName,
      migrationType,
      targetEntity,
      status: MigrationStatus.PENDING,
      options,
      createdBy: userId,
      sourceSystem: resolvedSourceSystem,
      targetSystem: resolvedTargetSystem,
    });

    const saved = await this.migrationJobRepo.save(job);
    this.eventEmitter.emit('migration.job.created', { jobId: saved.id });
    return saved;
  }

  /**
   * Import data from CSV file
   */
  async importFromCSV(
    organizationId: string,
    userId: string,
    targetEntity: string,
    filePath: string,
    fieldMapping?: Record<string, string>,
    options?: MigrationOptions,
  ): Promise<MigrationResult> {
    const job = await this.createMigrationJob(
      organizationId,
      userId,
      `Import ${targetEntity} from CSV`,
      MigrationType.IMPORT_CSV,
      targetEntity,
      options,
      'csv',
      'crm',
    );

    job.sourcePath = filePath;
    job.fieldMapping = fieldMapping;
    await this.migrationJobRepo.save(job);

    // Start processing
    this.processImport(job.id).catch((error) => {
      logError('CSV import failed', error.stack, 'DataMigrationService');
    });

    return this.getJobResult(job.id);
  }

  /**
   * Import data from Excel file
   */
  async importFromExcel(
    organizationId: string,
    userId: string,
    targetEntity: string,
    filePath: string,
    fieldMapping?: Record<string, string>,
    options?: MigrationOptions,
  ): Promise<MigrationResult> {
    const job = await this.createMigrationJob(
      organizationId,
      userId,
      `Import ${targetEntity} from Excel`,
      MigrationType.IMPORT_EXCEL,
      targetEntity,
      options,
      'excel',
      'crm',
    );

    job.sourcePath = filePath;
    job.fieldMapping = fieldMapping;
    await this.migrationJobRepo.save(job);

    this.processImport(job.id).catch((error) => {
      logError('Excel import failed', error.stack, 'DataMigrationService');
    });

    return this.getJobResult(job.id);
  }

  /**
   * Sync data from ERP system
   */
  async syncFromERP(
    organizationId: string,
    userId: string,
    connectionId: string,
    targetEntity: string,
    options?: MigrationOptions,
  ): Promise<MigrationResult> {
    const connection = await this.connectionRepo.findOne({
      where: { id: connectionId, organizationId },
    });

    if (!connection) {
      throw new NotFoundException('ERP connection not found');
    }

    const job = await this.createMigrationJob(
      organizationId,
      userId,
      `Sync ${targetEntity} from ${connection.erpSystem}`,
      MigrationType.SYNC_FROM_ERP,
      targetEntity,
      options,
      connection.erpSystem,
      'crm',
    );

    // Get field mappings for this ERP system
    const mappings = await this.mappingRepo.find({
      where: { connectionId: connection.id } as any,
    });

    // Start ERP sync
    this.processERPSync(job.id, connection, mappings).catch((error) => {
      logError('ERP sync failed', error.stack, 'DataMigrationService');
    });

    return this.getJobResult(job.id);
  }

  /**
   * Process import job
   */
  private async processImport(jobId: string): Promise<void> {
    const job = await this.migrationJobRepo.findOne({ where: { id: jobId } });
    if (!job) return;

    try {
      job.status = MigrationStatus.RUNNING;
      job.startedAt = new Date();
      await this.migrationJobRepo.save(job);

      // Parse file
      const records = await this.parseFile(job.sourcePath, job.migrationType);
      job.totalRecords = records.length;
      await this.migrationJobRepo.save(job);

      // Process records
      const batchSize = job.options?.batchSize || 100;
      const errors = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, Math.min(i + batchSize, records.length));

        for (const record of batch) {
          try {
            // Map fields
            const mapped = this.mapFields(record, job.fieldMapping);

            // Validate
            if (job.options?.validateOnly) {
              await this.validateRecord(mapped, job.targetEntity);
              job.processedRecords++;
              continue;
            }

            // Check duplicates
            if (job.options?.skipDuplicates) {
              const exists = await this.checkDuplicate(mapped, job.targetEntity, job.organizationId);
              if (exists) {
                job.skippedRecords++;
                job.processedRecords++;
                continue;
              }
            }

            // Import record
            const result = await this.importRecord(mapped, job.targetEntity, job.organizationId);
            if (result.created) {
              job.createdRecords++;
            } else if (result.updated) {
              job.updatedRecords++;
            }

            job.processedRecords++;
          } catch (error) {
            job.failedRecords++;
            errors.push({
              row: i + batch.indexOf(record) + 1,
              error: error.message,
              data: record,
            });

            if (!job.options?.continueOnError) {
              throw error;
            }
          }
        }

        job.updateProgress();
        await this.migrationJobRepo.save(job);
      }

      // Complete job
      job.status = errors.length > 0 ? MigrationStatus.PARTIALLY_COMPLETED : MigrationStatus.COMPLETED;
      job.completedAt = new Date();
      job.validationErrors = errors;
      job.calculateDuration();
      await this.migrationJobRepo.save(job);

      this.eventEmitter.emit('migration.job.completed', { jobId: job.id });
    } catch (error) {
      job.status = MigrationStatus.FAILED;
      job.errorMessage = error.message;
      job.errorStack = error.stack;
      job.completedAt = new Date();
      await this.migrationJobRepo.save(job);

      this.eventEmitter.emit('migration.job.failed', { jobId: job.id, error: error.message });
    }
  }

  /**
   * Process ERP sync job
   */
  private async processERPSync(
    jobId: string,
    connection: ERPConnection,
    mappings: ERPFieldMapping[],
  ): Promise<void> {
    // Implementation would fetch data from ERP API and sync
    // Simplified version for now
    logDebug(`Starting ERP sync: ${jobId} - ${connection.erpSystem}`, 'DataMigrationService');
  }

  /**
   * Parse file based on type
   */
  private async parseFile(filePath: string, type: MigrationType): Promise<any[]> {
    if (type === MigrationType.IMPORT_CSV) {
      return this.parseCSV(filePath);
    } else if (type === MigrationType.IMPORT_EXCEL) {
      return this.parseExcel(filePath);
    }
    throw new BadRequestException('Unsupported file type');
  }

  /**
   * Parse CSV file
   */
  private async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Parse Excel file
   */
  private parseExcel(filePath: string): any[] {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  /**
   * Map fields using field mapping
   */
  private mapFields(record: any, mapping?: Record<string, string>): any {
    if (!mapping) return record;

    const mapped = {};
    for (const [sourceField, targetField] of Object.entries(mapping)) {
      if (record[sourceField] !== undefined) {
        mapped[targetField] = record[sourceField];
      }
    }
    return mapped;
  }

  /**
   * Validate record before import
   */
  private async validateRecord(record: any, entityType: string): Promise<boolean> {
    // Basic validation logic
    if (entityType === 'customer') {
      if (!record.companyName || !record.primaryContact?.email) {
        throw new BadRequestException('Missing required fields');
      }
    }
    return true;
  }

  /**
   * Check if record already exists (duplicate detection)
   */
  private async checkDuplicate(
    record: any,
    entityType: string,
    organizationId: string,
  ): Promise<boolean> {
    const repo = this.getRepository(entityType);
    
    if (entityType === 'customer' && record.external_id) {
      const existing = await repo.findOne({ where: { external_id: record.external_id, organizationId } as any });
      return !!existing;
    }

    return false;
  }

  /**
   * Import single record
   */
  private async importRecord(
    record: any,
    entityType: string,
    organizationId: string,
  ): Promise<{ created: boolean; updated: boolean }> {
    const repo = this.getRepository(entityType);
    
    record.organizationId = organizationId;
    const entity = repo.create(record as any);
    await repo.save(entity);

    return { created: true, updated: false };
  }

  /**
   * Get repository for entity type
   */
  private getRepository(entityType: string): Repository<any> {
    switch (entityType.toLowerCase()) {
      case 'customer':
        return this.customerRepo;
      case 'lead':
        return this.leadRepo;
      case 'opportunity':
        return this.opportunityRepo;
      case 'contact':
        return this.contactRepo;
      default:
        throw new BadRequestException('Invalid entity type');
    }
  }

  /**
   * Get job status and result
   */
  async getJobStatus(jobId: string): Promise<DataMigrationJob> {
    const job = await this.migrationJobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Migration job not found');
    }
    return job;
  }

  /**
   * Get job result summary
   */
  private async getJobResult(jobId: string): Promise<MigrationResult> {
    const job = await this.getJobStatus(jobId);
    return {
      jobId: job.id,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      createdRecords: job.createdRecords,
      updatedRecords: job.updatedRecords,
      failedRecords: job.failedRecords,
      errors: job.validationErrors || [],
    };
  }

  /**
   * Rollback migration
   */
  async rollbackMigration(jobId: string): Promise<boolean> {
    const job = await this.getJobStatus(jobId);

    if (!job.canRollback) {
      throw new BadRequestException('Job cannot be rolled back');
    }

    job.status = MigrationStatus.ROLLING_BACK;
    await this.migrationJobRepo.save(job);

    try {
      // Delete created records if IDs are stored
      if (job.rollbackData?.backupIds) {
        const repo = this.getRepository(job.targetEntity);
        await repo.delete({ id: In(job.rollbackData.backupIds) });
      }

      job.status = MigrationStatus.ROLLED_BACK;
      await this.migrationJobRepo.save(job);
      return true;
    } catch (error) {
      job.status = MigrationStatus.FAILED;
      job.errorMessage = `Rollback failed: ${error.message}`;
      await this.migrationJobRepo.save(job);
      return false;
    }
  }

  /**
   * List all migration jobs
   */
  async listJobs(organizationId: string, limit: number = 50): Promise<DataMigrationJob[]> {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    return this.migrationJobRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: safeLimit,
    });
  }

  /**
   * Cancel running job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJobStatus(jobId);

    if (job.status !== MigrationStatus.RUNNING && job.status !== MigrationStatus.PENDING) {
      throw new BadRequestException('Job cannot be cancelled');
    }

    job.status = MigrationStatus.CANCELLED;
    job.completedAt = new Date();
    await this.migrationJobRepo.save(job);

    return true;
  }
}
