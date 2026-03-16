import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import axios from 'axios';
import * as csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { Readable } from 'stream';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Contact } from '../entities/contact.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Account } from '../entities/account.entity';

/**
 * Universal CRM Migration Service
 * 
 * Supports migration from:
 * - Salesforce
 * - HubSpot
 * - Zoho CRM
 * - Microsoft Dynamics 365
 * - SAP CRM
 * - Oracle CRM
 * - Pipedrive
 * - Freshsales
 * - SugarCRM
 * - Insightly
 * - Copper
 * - Nimble
 * 
 * File formats:
 * - CSV
 * - Excel (XLSX, XLS)
 * - JSON
 * - XML
 */

export type CRMPlatform = 
  | 'salesforce'
  | 'hubspot'
  | 'zoho'
  | 'dynamics365'
  | 'sap'
  | 'oracle'
  | 'pipedrive'
  | 'freshsales'
  | 'sugarcrm'
  | 'insightly'
  | 'copper'
  | 'nimble'
  | 'custom';

export type FileFormat = 'csv' | 'xlsx' | 'xls' | 'json' | 'xml';

export type EntityType = 'customer' | 'lead' | 'contact' | 'opportunity' | 'account';

export interface UniversalMigrationConfig {
  organizationId: string;
  platform: CRMPlatform;
  fileFormat?: FileFormat;
  entityType: EntityType;
  
  // Authentication (for API-based migrations)
  apiKey?: string;
  accessToken?: string;
  instanceUrl?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  
  // Mapping configuration
  fieldMapping: Record<string, string>; // source field -> target field
  
  // Options
  batchSize?: number;
  skipErrors?: boolean;
  updateExisting?: boolean;
  uniqueField?: string;
  dryRun?: boolean;
  validateOnly?: boolean;
}

export interface MigrationResult {
  success: boolean;
  platform: CRMPlatform;
  entityType: EntityType;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: MigrationError[];
  warnings: string[];
  duration: number;
  summary: Record<string, any>;
}

export interface MigrationError {
  row: number;
  record: any;
  error: string;
  field?: string;
}

@Injectable()
export class UniversalCRMMigrationService {
  private readonly logger = new Logger(UniversalCRMMigrationService.name);

  // Platform-specific API endpoints
  private readonly platformEndpoints = {
    salesforce: '/services/data/v58.0',
    hubspot: 'https://api.hubapi.com',
    zoho: 'https://www.zohoapis.com/crm/v2',
    dynamics365: '/api/data/v9.0',
    pipedrive: 'https://api.pipedrive.com/v1',
    freshsales: 'https://api.freshsales.io/api',
    sugarcrm: '/rest/v11',
    insightly: 'https://api.insightly.com/v3.1',
    copper: 'https://api.prosperworks.com/developer_api/v1',
    nimble: 'https://api.nimble.com/api/v1',
  };

  // Default field mappings for each platform
  private readonly platformMappings: Record<CRMPlatform, Record<EntityType, Record<string, string>>> = {
    salesforce: {
      lead: { FirstName: 'firstName', LastName: 'lastName', Email: 'email', Company: 'company', Phone: 'phone', Status: 'status' },
      contact: { FirstName: 'firstName', LastName: 'lastName', Email: 'email', Phone: 'phone', Title: 'title' },
      account: { Name: 'name', Phone: 'phone', Website: 'website', Industry: 'industry' },
      opportunity: { Name: 'name', Amount: 'value', StageName: 'stage', CloseDate: 'expectedCloseDate' },
      customer: { Name: 'name', Email: 'email', Phone: 'phone' },
    },
    hubspot: {
      lead: { firstname: 'firstName', lastname: 'lastName', email: 'email', company: 'company', phone: 'phone' },
      contact: { firstname: 'firstName', lastname: 'lastName', email: 'email', phone: 'phone', jobtitle: 'title' },
      account: { name: 'name', phone: 'phone', domain: 'website', industry: 'industry' },
      opportunity: { dealname: 'name', amount: 'value', dealstage: 'stage', closedate: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    zoho: {
      lead: { First_Name: 'firstName', Last_Name: 'lastName', Email: 'email', Company: 'company', Phone: 'phone', Lead_Status: 'status' },
      contact: { First_Name: 'firstName', Last_Name: 'lastName', Email: 'email', Phone: 'phone', Title: 'title' },
      account: { Account_Name: 'name', Phone: 'phone', Website: 'website', Industry: 'industry' },
      opportunity: { Deal_Name: 'name', Amount: 'value', Stage: 'stage', Closing_Date: 'expectedCloseDate' },
      customer: { Name: 'name', Email: 'email', Phone: 'phone' },
    },
    dynamics365: {
      lead: { firstname: 'firstName', lastname: 'lastName', emailaddress1: 'email', companyname: 'company', telephone1: 'phone' },
      contact: { firstname: 'firstName', lastname: 'lastName', emailaddress1: 'email', telephone1: 'phone', jobtitle: 'title' },
      account: { name: 'name', telephone1: 'phone', websiteurl: 'website', industrycode: 'industry' },
      opportunity: { name: 'name', estimatedvalue: 'value', stepname: 'stage', estimatedclosedate: 'expectedCloseDate' },
      customer: { name: 'name', emailaddress1: 'email', telephone1: 'phone' },
    },
    sap: {
      lead: { FirstName: 'firstName', LastName: 'lastName', Email: 'email', AccountName: 'company', Phone: 'phone' },
      contact: { FirstName: 'firstName', LastName: 'lastName', Email: 'email', Phone: 'phone', Title: 'title' },
      account: { AccountName: 'name', Phone: 'phone', WebAddress: 'website', Industry: 'industry' },
      opportunity: { Description: 'name', ExpectedValue: 'value', Status: 'stage', ExpectedClosingDate: 'expectedCloseDate' },
      customer: { Name: 'name', Email: 'email', Phone: 'phone' },
    },
    oracle: {
      lead: { FirstName: 'firstName', LastName: 'lastName', EmailAddress: 'email', PrimaryOrganizationName: 'company', PhoneNumber: 'phone' },
      contact: { FirstName: 'firstName', LastName: 'lastName', EmailAddress: 'email', PhoneNumber: 'phone', Title: 'title' },
      account: { OrganizationName: 'name', PhoneNumber: 'phone', URL: 'website', IndustryType: 'industry' },
      opportunity: { Name: 'name', Revenue: 'value', SalesStage: 'stage', CloseDate: 'expectedCloseDate' },
      customer: { Name: 'name', Email: 'email', PhoneNumber: 'phone' },
    },
    pipedrive: {
      lead: { first_name: 'firstName', last_name: 'lastName', email: 'email', organization_name: 'company', phone: 'phone' },
      contact: { first_name: 'firstName', last_name: 'lastName', email: 'email', phone: 'phone' },
      account: { name: 'name', phone: 'phone', website: 'website' },
      opportunity: { title: 'name', value: 'value', stage_id: 'stage', expected_close_date: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    freshsales: {
      lead: { first_name: 'firstName', last_name: 'lastName', email: 'email', company_name: 'company', work_number: 'phone' },
      contact: { first_name: 'firstName', last_name: 'lastName', email: 'email', work_number: 'phone', job_title: 'title' },
      account: { name: 'name', phone: 'phone', website: 'website', industry: 'industry' },
      opportunity: { name: 'name', amount: 'value', deal_stage_id: 'stage', expected_close: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    sugarcrm: {
      lead: { first_name: 'firstName', last_name: 'lastName', email1: 'email', account_name: 'company', phone_work: 'phone' },
      contact: { first_name: 'firstName', last_name: 'lastName', email1: 'email', phone_work: 'phone', title: 'title' },
      account: { name: 'name', phone_office: 'phone', website: 'website', industry: 'industry' },
      opportunity: { name: 'name', amount: 'value', sales_stage: 'stage', date_closed: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    insightly: {
      lead: { FIRST_NAME: 'firstName', LAST_NAME: 'lastName', EMAIL: 'email', ORGANISATION_NAME: 'company', PHONE: 'phone' },
      contact: { FIRST_NAME: 'firstName', LAST_NAME: 'lastName', EMAIL: 'email', PHONE: 'phone', TITLE: 'title' },
      account: { ORGANISATION_NAME: 'name', PHONE: 'phone', WEBSITE: 'website' },
      opportunity: { OPPORTUNITY_NAME: 'name', BID_AMOUNT: 'value', STAGE: 'stage', FORECAST_CLOSE_DATE: 'expectedCloseDate' },
      customer: { NAME: 'name', EMAIL: 'email', PHONE: 'phone' },
    },
    copper: {
      lead: { first_name: 'firstName', last_name: 'lastName', email: 'email', company_name: 'company', phone_number: 'phone' },
      contact: { first_name: 'firstName', last_name: 'lastName', email: 'email', phone_number: 'phone', title: 'title' },
      account: { name: 'name', phone_number: 'phone', website: 'website' },
      opportunity: { name: 'name', monetary_value: 'value', pipeline_stage_id: 'stage', close_date: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    nimble: {
      lead: { first_name: 'firstName', last_name: 'lastName', email: 'email', company_name: 'company', phone: 'phone' },
      contact: { first_name: 'firstName', last_name: 'lastName', email: 'email', phone: 'phone', title: 'title' },
      account: { name: 'name', phone: 'phone', website: 'website' },
      opportunity: { name: 'name', value: 'value', stage: 'stage', expected_close_date: 'expectedCloseDate' },
      customer: { name: 'name', email: 'email', phone: 'phone' },
    },
    custom: {
      lead: {},
      contact: {},
      account: {},
      opportunity: {},
      customer: {},
    },
  };

  constructor(
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Opportunity) private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Account) private readonly accountRepo: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Migrate data from any CRM platform
   */
  async migrate(config: UniversalMigrationConfig): Promise<MigrationResult> {
    const startTime = Date.now();
    this.logger.log(`Starting ${config.platform} migration for ${config.entityType}`);

    try {
      // Get field mapping
      const mapping = config.fieldMapping || 
                     this.platformMappings[config.platform]?.[config.entityType] || 
                     {};

      // Validate mapping
      if (Object.keys(mapping).length === 0) {
        throw new Error(`No field mapping provided for ${config.platform} ${config.entityType}`);
      }

      const result: MigrationResult = {
        success: true,
        platform: config.platform,
        entityType: config.entityType,
        totalRecords: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        errors: [],
        warnings: [],
        duration: 0,
        summary: {},
      };

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate from file (CSV, Excel, JSON, XML)
   */
  async migrateFromFile(
    filePath: string,
    config: UniversalMigrationConfig,
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    let records: any[] = [];

    // Detect file format if not specified
    if (!config.fileFormat) {
      config.fileFormat = this.detectFileFormat(filePath);
    }

    // Parse file based on format
    switch (config.fileFormat) {
      case 'csv':
        records = await this.parseCSV(filePath);
        break;
      case 'xlsx':
      case 'xls':
        records = await this.parseExcel(filePath);
        break;
      case 'json':
        records = await this.parseJSON(filePath);
        break;
      case 'xml':
        records = await this.parseXML(filePath);
        break;
      default:
        throw new Error(`Unsupported file format: ${config.fileFormat}`);
    }

    this.logger.log(`Parsed ${records.length} records from ${config.fileFormat} file`);

    // Import records
    return await this.importRecords(records, config, startTime);
  }

  /**
   * Migrate from buffer (for file uploads)
   */
  async migrateFromBuffer(
    buffer: Buffer,
    format: FileFormat,
    config: UniversalMigrationConfig,
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    let records: any[] = [];

    switch (format) {
      case 'csv':
        records = await this.parseCSVFromBuffer(buffer);
        break;
      case 'xlsx':
      case 'xls':
        records = await this.parseExcelFromBuffer(buffer);
        break;
      case 'json':
        records = JSON.parse(buffer.toString());
        break;
      default:
        throw new Error(`Unsupported format for buffer: ${format}`);
    }

    return await this.importRecords(records, config, startTime);
  }

  /**
   * Parse CSV file
   */
  private async parseCSV(filePath: string): Promise<any[]> {
    const records: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => records.push(row))
        .on('end', () => resolve(records))
        .on('error', reject);
    });
  }

  /**
   * Parse CSV from buffer
   */
  private async parseCSVFromBuffer(buffer: Buffer): Promise<any[]> {
    const records: any[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (row) => records.push(row))
        .on('end', () => resolve(records))
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
   * Parse Excel from buffer
   */
  private async parseExcelFromBuffer(buffer: Buffer): Promise<any[]> {
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  /**
   * Parse JSON file
   */
  private async parseJSON(filePath: string): Promise<any[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Parse XML file
   * 
   * NOTE: XML parsing is not currently implemented.
   * To enable XML file imports:
   * 
   * 1. Install xml2js package:
   *    npm install xml2js @types/xml2js
   * 
   * 2. Add import at the top of this file:
   *    import * as xml2js from 'xml2js';
   * 
   * 3. Replace this method with:
   *    private async parseXML(filePath: string): Promise<any[]> {
   *      const content = fs.readFileSync(filePath, 'utf-8');
   *      const parser = new xml2js.Parser({ explicitArray: false });
   *      const result = await parser.parseStringPromise(content);
   *      
   *      // Extract records based on your XML structure
   *      // Example: if XML has <records><record>...</record></records>
   *      return Array.isArray(result.records?.record) 
   *        ? result.records.record 
   *        : [result.records?.record].filter(Boolean);
   *    }
   */
  private async parseXML(filePath: string): Promise<any[]> {
    throw new Error(
      'XML parsing is not yet enabled. Install xml2js package and implement parseXML method. See method comments for implementation details.'
    );
  }

  /**
   * Detect file format from extension
   */
  private detectFileFormat(filePath: string): FileFormat {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return 'csv';
    if (ext === 'xlsx') return 'xlsx';
    if (ext === 'xls') return 'xls';
    if (ext === 'json') return 'json';
    if (ext === 'xml') return 'xml';
    throw new Error(`Unknown file format: ${ext}`);
  }

  /**
   * Import records with validation and error handling
   */
  private async importRecords(
    records: any[],
    config: UniversalMigrationConfig,
    startTime: number,
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      platform: config.platform,
      entityType: config.entityType,
      totalRecords: records.length,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
      warnings: [],
      duration: 0,
      summary: {},
    };

    const batchSize = config.batchSize || 100;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      if (config.dryRun) {
        this.logger.log(`[DRY RUN] Would import batch ${i / batchSize + 1} (${batch.length} records)`);
        result.successCount += batch.length;
        continue;
      }

      try {
        await this.dataSource.transaction(async (manager) => {
          for (let j = 0; j < batch.length; j++) {
            const rowNumber = i + j + 1;
            const record = batch[j];

            try {
              const mapped = this.mapRecord(record, config.fieldMapping);
              mapped.organizationId = config.organizationId;

              // Check for existing record
              if (config.updateExisting && config.uniqueField) {
                const existing = await this.findExisting(
                  config.entityType,
                  config.uniqueField,
                  mapped[config.uniqueField],
                  config.organizationId,
                );

                if (existing) {
                  await this.updateRecord(config.entityType, existing.id, mapped, manager);
                  result.successCount++;
                  continue;
                }
              }

              // Create new record
              await this.createRecord(config.entityType, mapped, manager);
              result.successCount++;
            } catch (error) {
              result.failureCount++;
              result.errors.push({
                row: rowNumber,
                record,
                error: error.message,
              });

              if (!config.skipErrors) {
                throw error;
              }
            }
          }
        });
      } catch (error) {
        this.logger.error(`Batch import failed: ${error.message}`);
        if (!config.skipErrors) {
          throw error;
        }
      }
    }

    result.success = result.failureCount === 0;
    result.duration = Date.now() - startTime;
    result.summary = {
      [config.entityType]: result.successCount,
      errors: result.failureCount,
    };

    return result;
  }

  /**
   * Map source record to target schema
   */
  private mapRecord(source: any, mapping: Record<string, string>): any {
    const mapped: any = {};

    for (const [sourceField, targetField] of Object.entries(mapping)) {
      if (source[sourceField] !== undefined) {
        mapped[targetField] = this.transformValue(source[sourceField], targetField);
      }
    }

    return mapped;
  }

  /**
   * Transform value based on field type
   */
  private transformValue(value: any, field: string): any {
    if (value === null || value === undefined || value === '') return null;

    if (field.includes('Date') || field.includes('At')) {
      return new Date(value);
    }

    if (field === 'value' || field === 'revenue' || field === 'numberOfEmployees') {
      return parseFloat(value) || 0;
    }

    return value;
  }

  /**
   * Find existing record
   */
  private async findExisting(
    entityType: EntityType,
    field: string,
    value: any,
    organizationId: string,
  ): Promise<any> {
    const repo = this.getRepository(entityType);
    return repo.findOne({ where: { [field]: value, organizationId } as any });
  }

  /**
   * Create new record
   */
  private async createRecord(entityType: EntityType, data: any, manager: any): Promise<any> {
    const repo = manager.getRepository(this.getEntityClass(entityType));
    const entity = repo.create(data as any);
    return repo.save(entity);
  }

  /**
   * Update existing record
   */
  private async updateRecord(
    entityType: EntityType,
    id: string,
    data: any,
    manager: any,
  ): Promise<any> {
    const repo = manager.getRepository(this.getEntityClass(entityType));
    await repo.update(id, data);
    return repo.findOne({ where: { id } as any });
  }

  /**
   * Get repository for entity type
   */
  private getRepository(entityType: EntityType): Repository<any> {
    const repos = {
      customer: this.customerRepo,
      lead: this.leadRepo,
      contact: this.contactRepo,
      opportunity: this.opportunityRepo,
      account: this.accountRepo,
    };
    return repos[entityType];
  }

  /**
   * Get entity class for entity type
   */
  private getEntityClass(entityType: EntityType): any {
    const classes = {
      customer: Customer,
      lead: Lead,
      contact: Contact,
      opportunity: Opportunity,
      account: Account,
    };
    return classes[entityType];
  }

  /**
   * Get default mapping for platform and entity
   */
  getDefaultMapping(platform: CRMPlatform, entityType: EntityType): Record<string, string> {
    return this.platformMappings[platform]?.[entityType] || {};
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): CRMPlatform[] {
    return Object.keys(this.platformMappings) as CRMPlatform[];
  }

  /**
   * Get supported file formats
   */
  getSupportedFormats(): FileFormat[] {
    return ['csv', 'xlsx', 'xls', 'json', 'xml'];
  }
}
