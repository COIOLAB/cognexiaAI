import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { ImportJob, ImportStatus, ImportType } from '../entities/import-job.entity';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Contact } from '../entities/contact.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { validateDto } from '../utils/validation.util';
import { CreateCustomerDto } from '../dto/customer.dto';
import { CreateLeadDto } from '../dto/lead.dto';
import { CreateContactDto } from '../dto/contact.dto';
import { logError, logDebug } from '../utils/logger.util';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportJob)
    private importJobRepo: Repository<ImportJob>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Opportunity)
    private opportunityRepo: Repository<Opportunity>,
  ) { }

  /**
   * Create import job
   */
  async createImportJob(
    organizationId: string,
    userId: string,
    importType: ImportType,
    fileName: string,
    filePath: string,
    options: any,
    mapping?: Record<string, string>,
  ): Promise<ImportJob> {
    const job = this.importJobRepo.create({
      organizationId: organizationId,
      user_id: userId,
      import_type: importType,
      file_name: fileName,
      file_path: filePath,
      mapping,
      options,
      status: ImportStatus.PENDING,
    });

    return this.importJobRepo.save(job);
  }

  /**
   * Process import job
   */
  async processImportJob(jobId: string): Promise<void> {
    const job = await this.importJobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new Error('Import job not found');

    try {
      // Update status to processing
      job.status = ImportStatus.PROCESSING;
      await this.importJobRepo.save(job);

      // Parse file
      const data = await this.parseFile(job.file_path, job.file_name);
      job.total_rows = data.length;

      // Validate only mode
      if (job.options?.validateOnly) {
        const validation = await this.validateData(data, job.import_type, job.mapping);
        job.errors = validation.errors;
        job.status = validation.isValid ? ImportStatus.COMPLETED : ImportStatus.FAILED;
        await this.importJobRepo.save(job);
        return;
      }

      // Process rows
      const errors = [];
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          const mapped = this.mapRow(row, job.mapping);

          // Check duplicates
          if (job.options?.skipDuplicates) {
            const exists = await this.checkDuplicate(mapped, job.import_type, job.organizationId);
            if (exists) continue;
          }

          // Import record
          await this.importRecord(mapped, job.import_type, job.organizationId);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push({
            row: i + 1,
            error: error.message,
            data: data[i],
          });
        }

        job.processed_rows = i + 1;
        if (i % 100 === 0) {
          await this.importJobRepo.save(job);
        }
      }

      // Update final status
      job.successful_rows = successCount;
      job.failed_rows = failedCount;
      job.errors = errors;
      job.status = failedCount > 0 ? ImportStatus.PARTIALLY_COMPLETED : ImportStatus.COMPLETED;
      job.completed_at = new Date();
      await this.importJobRepo.save(job);

    } catch (error) {
      logError('Import job failed', error.stack, 'ImportService');
      job.status = ImportStatus.FAILED;
      job.errors = [{ row: 0, error: error.message }];
      await this.importJobRepo.save(job);
    }
  }

  /**
   * Parse CSV/Excel file
   */
  private async parseFile(filePath: string, fileName: string): Promise<any[]> {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      return this.parseCSV(filePath);
    } else if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
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
  private async parseExcel(filePath: string): Promise<any[]> {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  /**
   * Map row to entity fields
   */
  private mapRow(row: any, mapping?: Record<string, string>): any {
    if (!mapping) return row;

    const mapped = {};
    for (const [csvColumn, entityField] of Object.entries(mapping)) {
      if (row[csvColumn] !== undefined) {
        mapped[entityField] = row[csvColumn];
      }
    }
    return mapped;
  }

  /**
   * Validate import data
   */
  private async validateData(
    data: any[],
    importType: ImportType,
    mapping?: Record<string, string>,
  ): Promise<{ isValid: boolean; errors: any[] }> {
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = this.mapRow(data[i], mapping);

        // Validate based on type
        switch (importType) {
          case ImportType.CUSTOMER:
            await validateDto(Object.assign(new CreateCustomerDto(), row));
            break;
          case ImportType.LEAD:
            await validateDto(Object.assign(new CreateLeadDto(), row));
            break;
          case ImportType.CONTACT:
            await validateDto(Object.assign(new CreateContactDto(), row));
            break;
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          field: error.property || 'unknown',
          error: error.message || 'Validation failed',
          value: data[i],
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for duplicate records
   */
  private async checkDuplicate(
    data: any,
    importType: ImportType,
    organizationId: string,
  ): Promise<boolean> {
    switch (importType) {
      case ImportType.CUSTOMER:
        return !!(await this.customerRepo.findOne({
          where: { primaryContact: { path: ['email'], equals: data.email } as any, organizationId } as any,
        }));
      case ImportType.LEAD:
        return !!(await this.leadRepo.findOne({
          where: { contact: { path: ['email'], equals: data.email } as any, organizationId } as any,
        }));
      case ImportType.CONTACT:
        return !!(await this.contactRepo.findOne({
          where: { email: data.email } as any,
        }));
      default:
        return false;
    }
  }

  /**
   * Import single record
   */
  private async importRecord(
    data: any,
    importType: ImportType,
    organizationId: string,
  ): Promise<void> {
    data.organizationId = organizationId;

    switch (importType) {
      case ImportType.CUSTOMER:
        await this.customerRepo.save(this.customerRepo.create(data as any));
        break;
      case ImportType.LEAD:
        await this.leadRepo.save(this.leadRepo.create(data as any));
        break;
      case ImportType.CONTACT:
        await this.contactRepo.save(this.contactRepo.create(data as any));
        break;
      case ImportType.OPPORTUNITY:
        await this.opportunityRepo.save(this.opportunityRepo.create(data as any));
        break;
    }
  }

  /**
   * Get import job status
   */
  async getImportJob(jobId: string): Promise<ImportJob> {
    return this.importJobRepo.findOne({ where: { id: jobId } });
  }

  /**
   * List import jobs
   */
  async listImportJobs(organizationId: string, limit: number = 50): Promise<ImportJob[]> {
    return this.importJobRepo.find({
      where: { organizationId: organizationId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Generate import template
   */
  async generateTemplate(importType: ImportType): Promise<string[][]> {
    const templates = {
      [ImportType.CUSTOMER]: [
        ['name', 'email', 'phone', 'company', 'industry', 'website', 'address'],
        ['John Doe', 'john@example.com', '+1234567890', 'Acme Inc', 'Technology', 'acme.com', '123 Main St'],
      ],
      [ImportType.LEAD]: [
        ['first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 'source'],
        ['Jane', 'Smith', 'jane@example.com', '+1234567890', 'Tech Corp', 'CEO', 'Website'],
      ],
      [ImportType.CONTACT]: [
        ['first_name', 'last_name', 'email', 'phone', 'title', 'department'],
        ['Bob', 'Johnson', 'bob@example.com', '+1234567890', 'Manager', 'Sales'],
      ],
    };

    return templates[importType] || [[]];
  }
}
