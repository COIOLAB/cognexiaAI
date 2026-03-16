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
 * HubSpot Migration Service
 * 
 * Handles data migration from HubSpot to CognexiaAI CRM
 * Supports:
 * - API key or OAuth authentication
 * - Batch data retrieval
 * - Field mapping
 * - Incremental sync
 */

export interface HubSpotConfig {
  apiKey?: string;
  accessToken?: string;
  portalId?: string;
}

export interface HubSpotMigrationOptions {
  organizationId: string;
  entities: ('companies' | 'contacts' | 'deals')[];
  fieldMapping?: Record<string, Record<string, string>>;
  batchSize?: number;
  skipErrors?: boolean;
  updateExisting?: boolean;
  incrementalSync?: boolean;
  lastSyncDate?: Date;
}

export interface HubSpotMigrationResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ entity: string; id: string; error: string }>;
  duration: number;
  summary: Record<string, number>;
}

@Injectable()
export class HubSpotMigrationService {
  private readonly logger = new Logger(HubSpotMigrationService.name);
  private axiosInstance: AxiosInstance;

  // Default field mappings (HubSpot -> CognexiaAI)
  private readonly defaultMappings = {
    companies: {
      hs_object_id: 'externalId',
      name: 'name',
      phone: 'phone',
      domain: 'website',
      industry: 'industry',
      numberofemployees: 'numberOfEmployees',
      annualrevenue: 'revenue',
      address: 'address',
      city: 'city',
      state: 'state',
      zip: 'zipCode',
      country: 'country',
      description: 'description',
      createdate: 'createdAt',
      hs_lastmodifieddate: 'updatedAt',
    },
    contacts: {
      hs_object_id: 'externalId',
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email',
      phone: 'phone',
      mobilephone: 'mobilePhone',
      jobtitle: 'title',
      company: 'company',
      address: 'address',
      city: 'city',
      state: 'state',
      zip: 'zipCode',
      country: 'country',
      createdate: 'createdAt',
      lastmodifieddate: 'updatedAt',
    },
    deals: {
      hs_object_id: 'externalId',
      dealname: 'name',
      amount: 'value',
      dealstage: 'stage',
      pipeline: 'pipeline',
      closedate: 'expectedCloseDate',
      dealtype: 'type',
      description: 'description',
      createdate: 'createdAt',
      hs_lastmodifieddate: 'updatedAt',
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
   * Initialize HubSpot connection
   */
  initializeConnection(config: HubSpotConfig): void {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.hubapi.com',
      headers,
    });

    this.logger.log('HubSpot connection initialized');
  }

  /**
   * Migrate data from HubSpot
   */
  async migrate(
    config: HubSpotConfig,
    options: HubSpotMigrationOptions,
  ): Promise<HubSpotMigrationResult> {
    const startTime = Date.now();
    this.logger.log('Starting HubSpot migration');

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
        `HubSpot migration completed: ${successCount}/${totalRecords} records (${duration}ms)`,
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
      this.logger.error(`HubSpot migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate specific entity from HubSpot
   */
  private async migrateEntity(
    entity: string,
    options: HubSpotMigrationOptions,
  ): Promise<{
    total: number;
    success: number;
    failures: number;
    errors: Array<{ entity: string; id: string; error: string }>;
  }> {
    const mapping = options.fieldMapping?.[entity] || this.defaultMappings[entity];
    const properties = Object.keys(mapping);

    try {
      // Fetch records from HubSpot
      const records = await this.fetchAll(entity, properties, options);
      this.logger.log(`Retrieved ${records.length} ${entity} records from HubSpot`);

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
                const mapped = this.mapHubSpotRecord(record, mapping, options.organizationId);
                await this.saveRecord(entity, mapped, options, manager);
                successCount++;
              } catch (error) {
                failureCount++;
                errors.push({
                  entity,
                  id: record.id,
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
   * Fetch all records from HubSpot with pagination
   */
  private async fetchAll(
    entity: string,
    properties: string[],
    options: HubSpotMigrationOptions,
  ): Promise<any[]> {
    const allRecords: any[] = [];
    let after: string | undefined;
    const limit = 100;

    try {
      do {
        const params: any = {
          properties: properties.join(','),
          limit,
        };

        if (after) {
          params.after = after;
        }

        // Filter for incremental sync
        if (options.incrementalSync && options.lastSyncDate) {
          params.filterGroups = JSON.stringify([
            {
              filters: [
                {
                  propertyName: 'hs_lastmodifieddate',
                  operator: 'GTE',
                  value: options.lastSyncDate.getTime().toString(),
                },
              ],
            },
          ]);
        }

        const response = await this.axiosInstance.get(
          `/crm/v3/objects/${entity}`,
          { params },
        );

        allRecords.push(...response.data.results);
        after = response.data.paging?.next?.after;
      } while (after);

      return allRecords;
    } catch (error) {
      this.logger.error(`HubSpot fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map HubSpot record to CognexiaAI format
   */
  private mapHubSpotRecord(
    record: any,
    mapping: Record<string, string>,
    organizationId: string,
  ): any {
    const mapped: any = {
      organizationId,
    };

    // HubSpot stores data in properties object
    const properties = record.properties || {};

    for (const [hsField, crmField] of Object.entries(mapping)) {
      const value = hsField === 'hs_object_id' ? record.id : properties[hsField];
      
      if (value !== undefined && value !== null && value !== '') {
        mapped[crmField] = this.transformValue(value, crmField);
      }
    }

    return mapped;
  }

  /**
   * Transform value based on field type
   */
  private transformValue(value: any, field: string): any {
    // Date fields (HubSpot uses milliseconds timestamp)
    if (field.includes('Date') || field.includes('At')) {
      const timestamp = parseInt(value);
      return isNaN(timestamp) ? new Date(value) : new Date(timestamp);
    }

    // Numeric fields
    if (field === 'value' || field === 'revenue' || field === 'numberOfEmployees') {
      return parseFloat(value) || 0;
    }

    return value;
  }

  /**
   * Save record to appropriate repository
   */
  private async saveRecord(
    entity: string,
    data: any,
    options: HubSpotMigrationOptions,
    manager: any,
  ): Promise<void> {
    let repo: any;
    let targetEntity: any;

    // Map HubSpot entities to CognexiaAI entities
    switch (entity) {
      case 'companies':
        repo = manager.getRepository(Account);
        targetEntity = Account;
        break;
      case 'contacts':
        repo = manager.getRepository(Contact);
        targetEntity = Contact;
        break;
      case 'deals':
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
   * Test HubSpot connection
   */
  async testConnection(config: HubSpotConfig): Promise<boolean> {
    try {
      this.initializeConnection(config);
      const response = await this.axiosInstance.get('/crm/v3/objects/contacts', {
        params: { limit: 1 },
      });
      this.logger.log('HubSpot connection test successful');
      return true;
    } catch (error) {
      this.logger.error(`HubSpot connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get HubSpot object schema
   */
  async getSchema(config: HubSpotConfig, entity: string): Promise<any> {
    try {
      this.initializeConnection(config);
      const response = await this.axiosInstance.get(`/crm/v3/schemas/${entity}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get schema for ${entity}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available properties for entity
   */
  async getProperties(config: HubSpotConfig, entity: string): Promise<any[]> {
    try {
      this.initializeConnection(config);
      const response = await this.axiosInstance.get(`/crm/v3/properties/${entity}`);
      return response.data.results;
    } catch (error) {
      this.logger.error(`Failed to get properties for ${entity}: ${error.message}`);
      throw error;
    }
  }
}
