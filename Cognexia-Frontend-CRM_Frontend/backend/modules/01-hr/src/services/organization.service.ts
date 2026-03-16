// Industry 5.0 ERP Backend - Organization Service
// Business logic layer for organization management
// Enterprise-grade organization operations and analytics
// Author: AI Assistant
// Date: 2024

import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrganizationModel } from '../models/organization.model';
import { 
  Organization, 
  CreateOrganizationRequest, 
  UpdateOrganizationRequest,
  OrganizationSettings,
  OrganizationStructure,
  OrganizationAnalytics,
  CompanyHierarchy,
  PaginationOptions, 
  PaginatedResponse, 
  FilterOptions,
  ServiceResponse 
} from '../types';
import { UUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '../../../core/services/cache.service';
import { AuditService } from '../../../core/services/audit.service';
import { getErrorMessage, getErrorStack } from '../../../utils/error-handler.util';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  private readonly organizationModel: OrganizationModel;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    private cacheService: CacheService,
    private auditService: AuditService
  ) {
    this.organizationModel = new OrganizationModel(dataSource);
  }

  // =====================
  // CORE ORGANIZATION OPERATIONS
  // =====================

  async createOrganization(data: CreateOrganizationRequest, userId: UUID): Promise<ServiceResponse<Organization>> {
    try {
      this.logger.log(`Creating organization: ${data.name}`);

      // Validate organization data
      await this.validateOrganizationData(data);

      // Create organization
      const organization = await this.organizationModel.createOrganization(data);

      // Audit trail
      await this.auditService.log({
        entityType: 'Organization',
        entityId: organization.id,
        action: 'CREATE',
        userId,
        changes: data
      });

      // Emit organization created event
      this.eventEmitter.emit('organization.created', {
        organizationId: organization.id,
        userId,
        organization
      });

      // Cache organization
      await this.cacheService.set(`organization:${organization.id}`, organization, 3600);

      this.logger.log(`Organization created successfully: ${organization.id}`);

      return {
        success: true,
        data: organization,
        message: 'Organization created successfully'
      };

    } catch (error) {
      this.logger.error(`Error creating organization: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (getErrorMessage(error).includes('already exists')) {
        throw new ConflictException(getErrorMessage(error));
      }
      
      throw new BadRequestException('Failed to create organization');
    }
  }

  async updateOrganization(
    id: UUID, 
    data: UpdateOrganizationRequest, 
    userId: UUID
  ): Promise<ServiceResponse<Organization>> {
    try {
      this.logger.log(`Updating organization: ${id}`);

      // Check if organization exists
      const existingOrganization = await this.getOrganizationById(id);
      if (!existingOrganization.success) {
        throw new NotFoundException('Organization not found');
      }

      // Validate update data
      await this.validateUpdateData(data, id);

      // Update organization
      const updatedOrganization = await this.organizationModel.updateOrganization(id, data);

      // Audit trail
      await this.auditService.log({
        entityType: 'Organization',
        entityId: id,
        action: 'UPDATE',
        userId,
        changes: data,
        previousData: existingOrganization.data
      });

      // Emit organization updated event
      this.eventEmitter.emit('organization.updated', {
        organizationId: id,
        userId,
        previousData: existingOrganization.data,
        updatedData: updatedOrganization
      });

      // Update cache
      await this.cacheService.set(`organization:${id}`, updatedOrganization, 3600);
      await this.cacheService.delete(`organization:${id}:structure`);
      await this.cacheService.delete(`organization:${id}:analytics`);

      this.logger.log(`Organization updated successfully: ${id}`);

      return {
        success: true,
        data: updatedOrganization,
        message: 'Organization updated successfully'
      };

    } catch (error) {
      this.logger.error(`Error updating organization: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (getErrorMessage(error).includes('already exists')) {
        throw new ConflictException(getErrorMessage(error));
      }
      
      throw new BadRequestException('Failed to update organization');
    }
  }

  async getOrganizationById(id: UUID, includeStructure: boolean = false): Promise<ServiceResponse<Organization>> {
    try {
      this.logger.log(`Fetching organization: ${id}`);

      // Check cache first
      const cacheKey = `organization:${id}${includeStructure ? ':full' : ''}`;
      const cachedOrganization = await this.cacheService.get(cacheKey);
      if (cachedOrganization) {
        return {
          success: true,
          data: cachedOrganization,
          message: 'Organization retrieved successfully'
        };
      }

      // Fetch from database
      const organization = await this.organizationModel.findOrganizationById(id, includeStructure);
      
      if (!organization) {
        return {
          success: false,
          error: 'Organization not found',
          message: 'Organization not found'
        };
      }

      // Cache result
      await this.cacheService.set(cacheKey, organization, 3600);

      return {
        success: true,
        data: organization,
        message: 'Organization retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error fetching organization: ${getErrorMessage(error)}`, getErrorStack(error));
      throw new BadRequestException('Failed to fetch organization');
    }
  }

  async getOrganizationByCode(code: string): Promise<ServiceResponse<Organization>> {
    try {
      this.logger.log(`Fetching organization by code: ${code}`);

      // Check cache first
      const cacheKey = `organization:code:${code}`;
      const cachedOrganization = await this.cacheService.get(cacheKey);
      if (cachedOrganization) {
        return {
          success: true,
          data: cachedOrganization,
          message: 'Organization retrieved successfully'
        };
      }

      // Fetch from database
      const organization = await this.organizationModel.findOrganizationByCode(code);
      
      if (!organization) {
        return {
          success: false,
          error: 'Organization not found',
          message: 'Organization not found'
        };
      }

      // Cache result
      await this.cacheService.set(cacheKey, organization, 3600);

      return {
        success: true,
        data: organization,
        message: 'Organization retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error fetching organization by code: ${getErrorMessage(error)}`, getErrorStack(error));
      throw new BadRequestException('Failed to fetch organization');
    }
  }

  async listOrganizations(options: PaginationOptions & FilterOptions): Promise<ServiceResponse<PaginatedResponse<Organization>>> {
    try {
      this.logger.log(`Listing organizations with options: ${JSON.stringify(options)}`);

      // Generate cache key from options
      const cacheKey = `organizations:list:${Buffer.from(JSON.stringify(options)).toString('base64')}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          message: 'Organizations retrieved successfully'
        };
      }

      // Fetch from database
      const result = await this.organizationModel.listOrganizations(options);

      // Cache result for shorter time due to potential frequent updates
      await this.cacheService.set(cacheKey, result, 300);

      return {
        success: true,
        data: result,
        message: 'Organizations retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error listing organizations: ${getErrorMessage(error)}`, getErrorStack(error));
      throw new BadRequestException('Failed to list organizations');
    }
  }

  // =====================
  // ORGANIZATION STRUCTURE & HIERARCHY
  // =====================

  async getOrganizationStructure(organizationId: UUID): Promise<ServiceResponse<OrganizationStructure>> {
    try {
      this.logger.log(`Fetching organization structure: ${organizationId}`);

      // Check cache first
      const cacheKey = `organization:${organizationId}:structure`;
      const cachedStructure = await this.cacheService.get(cacheKey);
      if (cachedStructure) {
        return {
          success: true,
          data: cachedStructure,
          message: 'Organization structure retrieved successfully'
        };
      }

      // Verify organization exists
      const orgCheck = await this.getOrganizationById(organizationId);
      if (!orgCheck.success) {
        throw new NotFoundException('Organization not found');
      }

      // Fetch structure from database
      const structure = await this.organizationModel.getOrganizationStructure(organizationId);

      // Cache result
      await this.cacheService.set(cacheKey, structure, 1800); // 30 minutes

      return {
        success: true,
        data: structure,
        message: 'Organization structure retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error fetching organization structure: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to fetch organization structure');
    }
  }

  async getCompanyHierarchy(organizationId: UUID): Promise<ServiceResponse<CompanyHierarchy>> {
    try {
      this.logger.log(`Fetching company hierarchy: ${organizationId}`);

      // Check cache first
      const cacheKey = `organization:${organizationId}:hierarchy`;
      const cachedHierarchy = await this.cacheService.get(cacheKey);
      if (cachedHierarchy) {
        return {
          success: true,
          data: cachedHierarchy,
          message: 'Company hierarchy retrieved successfully'
        };
      }

      // Verify organization exists
      const orgCheck = await this.getOrganizationById(organizationId);
      if (!orgCheck.success) {
        throw new NotFoundException('Organization not found');
      }

      // Fetch hierarchy from database
      const hierarchy = await this.organizationModel.getCompanyHierarchy(organizationId);

      // Cache result
      await this.cacheService.set(cacheKey, hierarchy, 1800); // 30 minutes

      return {
        success: true,
        data: hierarchy,
        message: 'Company hierarchy retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error fetching company hierarchy: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to fetch company hierarchy');
    }
  }

  // =====================
  // ANALYTICS & REPORTING
  // =====================

  async getOrganizationAnalytics(organizationId: UUID): Promise<ServiceResponse<OrganizationAnalytics>> {
    try {
      this.logger.log(`Generating organization analytics: ${organizationId}`);

      // Check cache first
      const cacheKey = `organization:${organizationId}:analytics`;
      const cachedAnalytics = await this.cacheService.get(cacheKey);
      if (cachedAnalytics) {
        return {
          success: true,
          data: cachedAnalytics,
          message: 'Organization analytics retrieved successfully'
        };
      }

      // Verify organization exists
      const orgCheck = await this.getOrganizationById(organizationId);
      if (!orgCheck.success) {
        throw new NotFoundException('Organization not found');
      }

      // Generate analytics
      const analytics = await this.organizationModel.getOrganizationAnalytics(organizationId);

      // Cache result for 1 hour
      await this.cacheService.set(cacheKey, analytics, 3600);

      return {
        success: true,
        data: analytics,
        message: 'Organization analytics generated successfully'
      };

    } catch (error) {
      this.logger.error(`Error generating organization analytics: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to generate organization analytics');
    }
  }

  // =====================
  // SETTINGS MANAGEMENT
  // =====================

  async updateOrganizationSettings(
    organizationId: UUID, 
    settings: Partial<OrganizationSettings>, 
    userId: UUID
  ): Promise<ServiceResponse<OrganizationSettings>> {
    try {
      this.logger.log(`Updating organization settings: ${organizationId}`);

      // Verify organization exists
      const orgCheck = await this.getOrganizationById(organizationId);
      if (!orgCheck.success) {
        throw new NotFoundException('Organization not found');
      }

      // Validate settings
      this.validateOrganizationSettings(settings);

      // Get current settings for audit
      const currentSettings = await this.organizationModel.getOrganizationSettings(organizationId);

      // Update settings
      const updatedSettings = await this.organizationModel.updateOrganizationSettings(organizationId, settings);

      // Audit trail
      await this.auditService.log({
        entityType: 'OrganizationSettings',
        entityId: organizationId,
        action: 'UPDATE',
        userId,
        changes: settings,
        previousData: currentSettings
      });

      // Emit settings updated event
      this.eventEmitter.emit('organization.settings.updated', {
        organizationId,
        userId,
        previousSettings: currentSettings,
        updatedSettings
      });

      // Update cache
      await this.cacheService.delete(`organization:${organizationId}`);
      await this.cacheService.delete(`organization:${organizationId}:structure`);

      return {
        success: true,
        data: updatedSettings,
        message: 'Organization settings updated successfully'
      };

    } catch (error) {
      this.logger.error(`Error updating organization settings: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to update organization settings');
    }
  }

  async getOrganizationSettings(organizationId: UUID): Promise<ServiceResponse<OrganizationSettings>> {
    try {
      this.logger.log(`Fetching organization settings: ${organizationId}`);

      // Verify organization exists
      const orgCheck = await this.getOrganizationById(organizationId);
      if (!orgCheck.success) {
        throw new NotFoundException('Organization not found');
      }

      // Fetch settings
      const settings = await this.organizationModel.getOrganizationSettings(organizationId);

      return {
        success: true,
        data: settings,
        message: 'Organization settings retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error fetching organization settings: ${getErrorMessage(error)}`, getErrorStack(error));
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to fetch organization settings');
    }
  }

  // =====================
  // VALIDATION METHODS
  // =====================

  private async validateOrganizationData(data: CreateOrganizationRequest): Promise<void> {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Organization name is required');
    }

    if (data.name.length > 200) {
      throw new BadRequestException('Organization name cannot exceed 200 characters');
    }

    if (data.code && data.code.length > 10) {
      throw new BadRequestException('Organization code cannot exceed 10 characters');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (data.website && !this.isValidUrl(data.website)) {
      throw new BadRequestException('Invalid website URL format');
    }

    if (data.taxId && data.taxId.length > 50) {
      throw new BadRequestException('Tax ID cannot exceed 50 characters');
    }
  }

  private async validateUpdateData(data: UpdateOrganizationRequest, excludeId: UUID): Promise<void> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Organization name cannot be empty');
      }
      if (data.name.length > 200) {
        throw new BadRequestException('Organization name cannot exceed 200 characters');
      }
    }

    if (data.code !== undefined && data.code.length > 10) {
      throw new BadRequestException('Organization code cannot exceed 10 characters');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (data.website && !this.isValidUrl(data.website)) {
      throw new BadRequestException('Invalid website URL format');
    }
  }

  private validateOrganizationSettings(settings: Partial<OrganizationSettings>): void {
    if (settings.workingDays) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const invalidDays = settings.workingDays.filter((day: string) => !validDays.includes(day));
      if (invalidDays.length > 0) {
        throw new BadRequestException(`Invalid working days: ${invalidDays.join(', ')}`);
      }
    }

    if (settings.workingHours) {
      if (!settings.workingHours.start || !settings.workingHours.end) {
        throw new BadRequestException('Working hours must include both start and end times');
      }
      
      if (!this.isValidTimeFormat(settings.workingHours.start) || !this.isValidTimeFormat(settings.workingHours.end)) {
        throw new BadRequestException('Working hours must be in HH:MM format');
      }
    }

    if (settings.probationPeriodMonths && (settings.probationPeriodMonths < 1 || settings.probationPeriodMonths > 12)) {
      throw new BadRequestException('Probation period must be between 1 and 12 months');
    }

    if (settings.currency && settings.currency.length !== 3) {
      throw new BadRequestException('Currency must be a valid 3-letter ISO code');
    }
  }

  // =====================
  // UTILITY METHODS
  // =====================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  // =====================
  // HEALTH CHECK
  // =====================

  async healthCheck(): Promise<ServiceResponse<any>> {
    try {
      // Basic connectivity test
      const testResult = await this.organizationModel.listOrganizations({ page: 1, limit: 1 });
      
      return {
        success: true,
        data: {
          service: 'OrganizationService',
          status: 'healthy',
          timestamp: new Date(),
          totalOrganizations: testResult.total
        },
        message: 'Organization service is healthy'
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${getErrorMessage(error)}`, getErrorStack(error));
      throw new BadRequestException('Organization service health check failed');
    }
  }
}
