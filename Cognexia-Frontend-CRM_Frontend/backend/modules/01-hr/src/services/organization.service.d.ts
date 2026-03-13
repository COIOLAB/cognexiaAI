import { DataSource } from 'typeorm';
import { Organization, CreateOrganizationRequest, UpdateOrganizationRequest, OrganizationSettings, OrganizationStructure, OrganizationAnalytics, CompanyHierarchy, PaginationOptions, PaginatedResponse, FilterOptions, ServiceResponse } from '../types';
import { UUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '../../../core/services/cache.service';
import { AuditService } from '../../../core/services/audit.service';
export declare class OrganizationService {
    private dataSource;
    private eventEmitter;
    private cacheService;
    private auditService;
    private readonly logger;
    private readonly organizationModel;
    constructor(dataSource: DataSource, eventEmitter: EventEmitter2, cacheService: CacheService, auditService: AuditService);
    createOrganization(data: CreateOrganizationRequest, userId: UUID): Promise<ServiceResponse<Organization>>;
    updateOrganization(id: UUID, data: UpdateOrganizationRequest, userId: UUID): Promise<ServiceResponse<Organization>>;
    getOrganizationById(id: UUID, includeStructure?: boolean): Promise<ServiceResponse<Organization>>;
    getOrganizationByCode(code: string): Promise<ServiceResponse<Organization>>;
    listOrganizations(options: PaginationOptions & FilterOptions): Promise<ServiceResponse<PaginatedResponse<Organization>>>;
    getOrganizationStructure(organizationId: UUID): Promise<ServiceResponse<OrganizationStructure>>;
    getCompanyHierarchy(organizationId: UUID): Promise<ServiceResponse<CompanyHierarchy>>;
    getOrganizationAnalytics(organizationId: UUID): Promise<ServiceResponse<OrganizationAnalytics>>;
    updateOrganizationSettings(organizationId: UUID, settings: Partial<OrganizationSettings>, userId: UUID): Promise<ServiceResponse<OrganizationSettings>>;
    getOrganizationSettings(organizationId: UUID): Promise<ServiceResponse<OrganizationSettings>>;
    private validateOrganizationData;
    private validateUpdateData;
    private validateOrganizationSettings;
    private isValidEmail;
    private isValidUrl;
    private isValidTimeFormat;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=organization.service.d.ts.map