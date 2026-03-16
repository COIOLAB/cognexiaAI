import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Contact } from '../entities/contact.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Account } from '../entities/account.entity';

/**
 * Salesforce Migration Service
 * 
 * Handles data migration from Salesforce to CognexiaAI CRM
 * Supports:
 * - OAuth authentication
 * - Bulk API queries
 * - Field mapping
 * - Incremental sync
 */

export interface SalesforceConfig {
  instanceUrl: string;
  accessToken: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface SalesforceMigrationOptions {
  organizationId: string;
  entities: ('Account' | 'Contact' | 'Lead' | 'Opportunity')[];
  fieldMapping?: Record<string, Record<string, string>>;
  batchSize?: number;
  skipErrors?: boolean;
  updateExisting?: boolean;
  incrementalSync?: boolean;
  lastSyncDate?: Date;
}

export interface SalesforceMigrationResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ entity: string; id: string; error: string }>;
  duration: number;
  summary: Record<string, number>;
}

@Injectable()
export class SalesforceMigrationService {
  private readonly logger = new Logger(SalesforceMigrationService.name);
  private axiosInstance: AxiosInstance;

  // Default field mappings (Salesforce -> CognexiaAI)
  private readonly defaultMappings = {
    Account: {
      Id: 'externalId',
      Name: 'name',
      Phone: 'phone',
      Website: 'website',
      Industry: 'industry',
      NumberOfEmployees: 'numberOfEmployees',
      AnnualRevenue: 'revenue',
      BillingStreet: 'address',
      BillingCity: 'city',
      BillingState: 'state',
      BillingPostalCode: 'zipCode',
      BillingCountry: 'country',
      Description: 'description',
      CreatedDate: 'createdAt',
      LastModifiedDate: 'updatedAt',
    },
    Contact: {
      Id: 'externalId',
      FirstName: 'firstName',
      LastName: 'lastName',
      Email: 'email',
      Phone: 'phone',
      MobilePhone: 'mobilePhone',
      Title: 'title',
      Department: 'department',
      MailingStreet: 'address',
      MailingCity: 'city',
      MailingState: 'state',
      MailingPostalCode: 'zipCode',
      MailingCountry: 'country',
      CreatedDate: 'createdAt',
      LastModifiedDate: 'updatedAt',
    },
    Lead: {
      Id: 'externalId',
      FirstName: 'firstName',
      LastName: 'lastName',
      Email: 'email',
      Phone: 'phone',
      Company: 'company',
      Title: 'title',
      Industry: 'industry',
      Status: 'status',
      Rating: 'rating',
      LeadSource: 'source',
      Street: 'address',
      City: 'city',
      State: 'state',
      PostalCode: 'zipCode',
      Country: 'country',
      Description: 'notes',
      CreatedDate: 'createdAt',
      LastModifiedDate: 'updatedAt',
    },
    Opportunity: {
      Id: 'externalId',
      Name: 'name',
      Amount: 'value',
      StageName: 'stage',
      Probability: 'probability',
      CloseDate: 'expectedCloseDate',
      Type: 'type',
      LeadSource: 'source',
      Description: 'description',
      CreatedDate: 'createdAt',
      LastModifiedDate: 'updatedAt',
    },
  };

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Initialize Salesforce connection
   */
  initializeConnection(config: SalesforceConfig): void {
    this.axiosInstance = axios.create({
      baseURL: `${config.instanceUrl}/services/data/v58.0`,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('Salesforce connection initialized');
  }

  /**
   * Migrate data from Salesforce
   */
  async migrate(
    config: SalesforceConfig,
    options: SalesforceMigrationOptions,
  ): Promise<SalesforceMigrationResult> {
    const startTime = Date.now();
    this.logger.log('Starting Salesforce migration');

    this.initializeConnection(config);

    let totalRecords = 0;
    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ entity: string; id: string; error: string }> = [];
    const summary: Record<string, number> = {};

    try {
      // Migrate each entity type
      for (const entity of options.entities) {
        this.logger.log(`Migrating ${entity} records...`);

        const result = await this.migrateEntity(entity, options);
        
        totalRecords += result.total;
        successCount += result.success;
        failureCount += result.failures;
        summary[entity] = result.success;
        
        if (result.errors.length > 0) {
          errors.push(...result.errors);
        }
      }

      const duration = Date.now() - startTime;

      this.logger.log(
        `Salesforce migration completed: ${successCount}/${totalRecords} records (${duration}ms)`,
      );

      return {
        success: failureCount === 0,
        totalRecords,
        successCount,
        failureCount,
        errors,
        duration,
        summary,
      };
    } catch (error) {
      this.logger.error(`Salesforce migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate specific entity from Salesforce
   */
  private async migrateEntity(
    entity: string,
    options: SalesforceMigrationOptions,
  ): Promise<{
    total: number;
    success: number;
    failures: number;
    errors: Array<{ entity: string; id: string; error: string }>;
  }> {
    const mapping = options.fieldMapping?.[entity] || this.defaultMappings[entity];
    const fields = Object.keys(mapping);
    
    // Build SOQL query
    let query = `SELECT ${fields.join(', ')} FROM ${entity}`;
    
    if (options.incrementalSync && options.lastSyncDate) {
      const lastSync = options.lastSyncDate.toISOString();
      query += ` WHERE LastModifiedDate > ${lastSync}`;
    }
    
    query += ' ORDER BY CreatedDate DESC';

    try {
      // Execute query
      const records = await this.queryAll(query);
      this.logger.log(`Retrieved ${records.length} ${entity} records from Salesforce`);

      // Import records
      const batchSize = options.batchSize || 100;
      let successCount = 0;
      let failureCount = 0;
      const errors: Array<{ entity: string; id: string; error: string }> = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        try {
          await this.dataSource.transaction(async (manager) => {
            for (const record of batch) {
              try {
                const mapped = this.mapSalesforceRecord(record, mapping, options.organizationId);
                await this.saveRecord(entity, mapped, options, manager);
                successCount++;
              } catch (error) {
                failureCount++;
                errors.push({
                  entity,
                  id: record.Id,
                  error: error.message,
                });

                if (!options.skipErrors) {
                  throw error;
                }
              }
            }
          });
        } catch (error) {
          this.logger.error(`Batch import failed for ${entity}: ${error.message}`);
          if (!options.skipErrors) {
            throw error;
          }
        }
      }

      return {
        total: records.length,
        success: successCount,
        failures: failureCount,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to migrate ${entity}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute SOQL query and retrieve all records
   */
  private async queryAll(query: string): Promise<any[]> {
    const allRecords: any[] = [];
    let done = false;
    let nextRecordsUrl: string | null = null;

    try {
      // Initial query
      const response = await this.axiosInstance.get('/query', {
        params: { q: query },
      });

      allRecords.push(...response.data.records);
      done = response.data.done;
      nextRecordsUrl = response.data.nextRecordsUrl;

      // Fetch remaining records
      while (!done && nextRecordsUrl) {
        const nextResponse = await this.axiosInstance.get(nextRecordsUrl);
        allRecords.push(...nextResponse.data.records);
        done = nextResponse.data.done;
        nextRecordsUrl = nextResponse.data.nextRecordsUrl;
      }

      return allRecords;
    } catch (error) {
      this.logger.error(`Salesforce query failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map Salesforce record to CognexiaAI format
   */
  private mapSalesforceRecord(
    record: any,
    mapping: Record<string, string>,
    organizationId: string,
  ): any {
    const mapped: any = {
      organizationId,
    };

    for (const [sfField, crmField] of Object.entries(mapping)) {
      if (record[sfField] !== undefined && record[sfField] !== null) {
        mapped[crmField] = this.transformValue(record[sfField], crmField);
      }
    }

    return mapped;
  }

  /**
   * Transform value based on field type
   */
  private transformValue(value: any, field: string): any {
    // Date fields
    if (field.includes('Date') || field.includes('At')) {
      return new Date(value);
    }

    // Numeric fields
    if (field === 'value' || field === 'revenue' || field === 'numberOfEmployees') {
      return parseFloat(value) || 0;
    }

    // Probability percentage
    if (field === 'probability') {
      return parseFloat(value) / 100; // Convert to decimal
    }

    return value;
  }

  /**
   * Save record to appropriate repository
   */
  private async saveRecord(
    entity: string,
    data: any,
    options: SalesforceMigrationOptions,
    manager: any,
  ): Promise<void> {
    let repo: any;
    let targetEntity: any;

    switch (entity) {
      case 'Account':
        repo = manager.getRepository(Account);
        targetEntity = Account;
        break;
      case 'Contact':
        repo = manager.getRepository(Contact);
        targetEntity = Contact;
        break;
      case 'Lead':
        repo = manager.getRepository(Lead);
        targetEntity = Lead;
        break;
      case 'Opportunity':
        repo = manager.getRepository(Opportunity);
        targetEntity = Opportunity;
        break;
      default:
        throw new Error(`Unsupported entity: ${entity}`);
    }

    // Check for existing record
    if (options.updateExisting && data.externalId) {
      const existing = await repo.findOne({
        where: {
          externalId: data.externalId,
          organizationId: options.organizationId,
        },
      });

      if (existing) {
        await repo.update(existing.id, data);
        return;
      }
    }

    // Create new record
    const record = repo.create(data as any);
    await repo.save(record);
  }

  /**
   * Test Salesforce connection
   */
  async testConnection(config: SalesforceConfig): Promise<boolean> {
    try {
      this.initializeConnection(config);
      const response = await this.axiosInstance.get('/');
      this.logger.log('Salesforce connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`Salesforce connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Salesforce metadata
   */
  async getMetadata(config: SalesforceConfig, entity: string): Promise<any> {
    try {
      this.initializeConnection(config);
      const response = await this.axiosInstance.get(`/sobjects/${entity}/describe`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${entity}: ${error.message}`);
      throw error;
    }
  }
}
