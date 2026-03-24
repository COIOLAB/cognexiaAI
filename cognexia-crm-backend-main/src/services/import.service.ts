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
import { Product } from '../entities/product.entity';
import { QuoteStatus, SalesQuote } from '../entities/sales-quote.entity';
import { validateDto } from '../utils/validation.util';
import { CreateCustomerDto } from '../dto/customer.dto';
import { CreateLeadDto } from '../dto/lead.dto';
import { CreateContactDto } from '../dto/contact.dto';
import { CreateProductDto } from '../dto/product.dto';
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
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(SalesQuote)
    private salesQuoteRepo: Repository<SalesQuote>,
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
    const importType = this.requireImportType(job.import_type);

    try {
      // Update status to processing
      job.status = ImportStatus.PROCESSING;
      await this.importJobRepo.save(job);

      // Parse file
      const data = await this.parseFile(job.file_path, job.file_name);
      job.total_rows = data.length;

      // Validate only mode
      if (job.options?.validateOnly) {
        const validation = await this.validateData(data, importType, job.mapping);
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
            const exists = await this.checkDuplicate(mapped, importType, job.organizationId);
            if (exists) continue;
          }

          // Import record
          await this.importRecord(mapped, importType, job.organizationId);
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
    const resolvedImportType = this.requireImportType(importType);

    for (let i = 0; i < data.length; i++) {
      try {
        const row = this.normalizeImportedData(
          this.mapRow(data[i], mapping),
          resolvedImportType,
        );

        // Validate based on type
        switch (resolvedImportType) {
          case ImportType.CUSTOMER:
            await validateDto(Object.assign(new CreateCustomerDto(), row));
            break;
          case ImportType.LEAD:
            await validateDto(Object.assign(new CreateLeadDto(), row));
            break;
          case ImportType.CONTACT:
            await validateDto(Object.assign(new CreateContactDto(), row));
            break;
          case ImportType.PRODUCT:
            await validateDto(Object.assign(new CreateProductDto(), row));
            break;
          case ImportType.OPPORTUNITY:
            this.validateRequiredFields(row, ['name', 'type', 'value', 'expectedCloseDate', 'salesRep']);
            break;
          case ImportType.QUOTE:
            this.validateQuotePayload(row);
            break;
          default:
            throw new Error(`Unsupported import type: ${resolvedImportType}`);
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
    const resolvedImportType = this.requireImportType(importType);
    const normalized = this.normalizeImportedData(data, resolvedImportType, organizationId);

    switch (resolvedImportType) {
      case ImportType.CUSTOMER:
        return !!(await this.customerRepo.findOne({
          where: { primaryContact: { path: ['email'], equals: normalized.email } as any, organizationId } as any,
        }));
      case ImportType.LEAD:
        return !!(await this.leadRepo.findOne({
          where: { contact: { path: ['email'], equals: normalized.email } as any, organizationId } as any,
        }));
      case ImportType.CONTACT:
        return !!(await this.contactRepo.findOne({
          where: { email: normalized.email } as any,
        }));
      case ImportType.OPPORTUNITY:
        return !!(normalized.opportunityNumber && await this.opportunityRepo.findOne({
          where: { opportunityNumber: normalized.opportunityNumber } as any,
        }));
      case ImportType.PRODUCT:
        return !!(normalized.sku && await this.productRepo.findOne({
          where: { sku: normalized.sku } as any,
        }));
      case ImportType.QUOTE:
        return !!(normalized.quoteNumber && await this.salesQuoteRepo.findOne({
          where: { quoteNumber: normalized.quoteNumber } as any,
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
    const resolvedImportType = this.requireImportType(importType);
    const normalized = this.normalizeImportedData(data, resolvedImportType, organizationId);

    switch (resolvedImportType) {
      case ImportType.CUSTOMER:
        await this.customerRepo.save(this.customerRepo.create(normalized as any));
        break;
      case ImportType.LEAD:
        await this.leadRepo.save(this.leadRepo.create(normalized as any));
        break;
      case ImportType.CONTACT:
        await this.contactRepo.save(this.contactRepo.create(normalized as any));
        break;
      case ImportType.OPPORTUNITY:
        await this.opportunityRepo.save(this.opportunityRepo.create(normalized as any));
        break;
      case ImportType.PRODUCT:
        await this.productRepo.save(this.productRepo.create(normalized as any));
        break;
      case ImportType.QUOTE:
        await this.salesQuoteRepo.save(this.salesQuoteRepo.create(normalized as any));
        break;
      default:
        throw new Error(`Unsupported import type: ${resolvedImportType}`);
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
    const resolvedImportType = this.requireImportType(importType);
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
      [ImportType.OPPORTUNITY]: [
        ['name', 'type', 'value', 'expectedCloseDate', 'salesRep', 'customerId', 'description'],
        ['Q2 Expansion', 'upsell', '25000', '2026-04-30', 'Alex Mercer', '00000000-0000-0000-0000-000000000001', 'Expansion opportunity'],
      ],
      [ImportType.PRODUCT]: [
        ['sku', 'name', 'basePrice', 'type', 'currency', 'quantityInStock', 'description', 'tags'],
        ['SKU-1001', 'Industrial Sensor', '499.99', 'physical', 'USD', '25', 'Condition monitoring sensor', 'iot,sensor,industry4'],
      ],
      [ImportType.QUOTE]: [
        ['quoteNumber', 'title', 'customerId', 'validUntil', 'status', 'lineItems', 'totals', 'notes'],
        [
          'QT-1001',
          'Automation Upgrade Proposal',
          '00000000-0000-0000-0000-000000000001',
          '2026-04-30',
          'draft',
          '[{\"productId\":\"item-1\",\"productName\":\"Industrial Sensor\",\"description\":\"Industrial Sensor\",\"quantity\":2,\"unitPrice\":499.99,\"discount\":0,\"taxRate\":18}]',
          '{\"subtotal\":999.98,\"discount\":0,\"tax\":179.9964,\"total\":1179.9764}',
          'Imported from legacy quote sheet',
        ],
      ],
    };

    return templates[resolvedImportType] || [[]];
  }

  private requireImportType(importType?: ImportType | null): ImportType {
    if (!importType) {
      throw new Error('Import type is missing for this legacy import job. Recreate the import and retry.');
    }

    return importType;
  }

  private normalizeImportedData(
    data: any,
    importType: ImportType,
    organizationId?: string,
  ): any {
    const normalized = { ...data };

    switch (importType) {
      case ImportType.CUSTOMER:
      case ImportType.LEAD:
      case ImportType.CONTACT:
      case ImportType.OPPORTUNITY:
        normalized.organizationId = normalized.organizationId || organizationId;
        return normalized;
      case ImportType.PRODUCT:
        normalized.tenantId = normalized.tenantId || normalized.organizationId || organizationId;
        if (normalized.basePrice !== undefined) normalized.basePrice = Number(normalized.basePrice);
        if (normalized.costPrice !== undefined) normalized.costPrice = Number(normalized.costPrice);
        if (normalized.quantityInStock !== undefined) normalized.quantityInStock = Number(normalized.quantityInStock);
        if (typeof normalized.tags === 'string') {
          normalized.tags = normalized.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }
        if (typeof normalized.imageUrls === 'string') {
          normalized.imageUrls = normalized.imageUrls.split(',').map((url: string) => url.trim()).filter(Boolean);
        }
        return normalized;
      case ImportType.QUOTE: {
        const lineItems = this.normalizeQuoteLineItems(normalized.lineItems);
        const totals = normalized.totals
          ? this.parseJsonField(normalized.totals, this.calculateQuoteTotals(lineItems))
          : this.calculateQuoteTotals(lineItems);
        return {
          quoteNumber: normalized.quoteNumber || normalized.quote_number,
          title: normalized.title,
          status: normalized.status || QuoteStatus.DRAFT,
          validUntil: normalized.validUntil || normalized.valid_until,
          lineItems,
          totals,
          terms: normalized.terms,
          notes: normalized.notes,
          createdBy: normalized.createdBy || normalized.created_by || 'import',
          updatedBy: normalized.updatedBy || normalized.updated_by || 'import',
          customerId: normalized.customerId || normalized.customer_id,
          opportunityId: normalized.opportunityId || normalized.opportunity_id || undefined,
        };
      }
      default:
        return normalized;
    }
  }

  private parseJsonField<T>(value: unknown, fallback?: T): T {
    if (value === undefined || value === null || value === '') {
      return fallback as T;
    }

    if (typeof value === 'string') {
      return JSON.parse(value) as T;
    }

    return value as T;
  }

  private normalizeQuoteLineItems(value: unknown): Array<{
    productId: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
  }> {
    const rawItems = this.parseJsonField<any[]>(value, []);

    return rawItems.map((item, index) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const discount = Number(item.discount || 0);
      const taxRate = Number(item.taxRate || 0);

      return {
        productId: item.productId || `item-${index + 1}`,
        productName: item.productName || item.description || `Item ${index + 1}`,
        description: item.description || item.productName || `Item ${index + 1}`,
        quantity,
        unitPrice,
        discount,
        taxRate,
        totalPrice: quantity * unitPrice - discount,
      };
    });
  }

  private calculateQuoteTotals(lineItems: Array<{
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>) {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
    );
    const discount = lineItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    const taxableAmount = subtotal - discount;
    const tax = lineItems.reduce((sum, item) => {
      const lineBase = Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0);
      return sum + (lineBase * Number(item.taxRate || 0)) / 100;
    }, 0);

    return {
      subtotal,
      discount,
      tax,
      total: taxableAmount + tax,
    };
  }

  private validateRequiredFields(data: Record<string, any>, fields: string[]) {
    const missingFields = fields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  private validateQuotePayload(data: Record<string, any>) {
    this.validateRequiredFields(data, ['title', 'customerId', 'validUntil']);
    if (!Array.isArray(data.lineItems) || data.lineItems.length === 0) {
      throw new Error('Quote imports require at least one line item');
    }
  }
}
