import { DataSource } from 'typeorm';
import { OrganizationService } from './organization.service';
import { Department, CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentAnalytics, PaginationOptions, PaginatedResponse, FilterOptions, ServiceResponse, AIInsight, PredictiveAnalytics, NLPAnalysis, SmartRecommendation } from '../types';
import { UUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '../../../core/services/cache.service';
import { AuditService } from '../../../core/services/audit.service';
import { AIService } from '../../../core/services/ai.service';
import { MLService } from '../../../core/services/ml.service';
import { NLPService } from '../../../core/services/nlp.service';
import { Industry5Service } from '../../../core/services/industry5.service';
export declare class DepartmentService {
    private dataSource;
    private organizationService;
    private eventEmitter;
    private cacheService;
    private auditService;
    private aiService;
    private mlService;
    private nlpService;
    private industry5Service;
    private readonly logger;
    private readonly departmentModel;
    constructor(dataSource: DataSource, organizationService: OrganizationService, eventEmitter: EventEmitter2, cacheService: CacheService, auditService: AuditService, aiService: AIService, mlService: MLService, nlpService: NLPService, industry5Service: Industry5Service);
    createDepartment(organizationId: UUID, data: CreateDepartmentRequest, userId: UUID): Promise<ServiceResponse<Department & {
        aiInsights?: AIInsight[];
    }>>;
    updateDepartment(id: UUID, data: UpdateDepartmentRequest, userId: UUID): Promise<ServiceResponse<Department & {
        aiInsights?: AIInsight[];
    }>>;
    getDepartmentById(id: UUID, includeRelations?: boolean): Promise<ServiceResponse<Department & {
        aiInsights?: AIInsight[];
    }>>;
    listDepartments(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<ServiceResponse<PaginatedResponse<Department & {
        aiScore?: number;
    }>>>;
    getDepartmentAnalyticsWithAI(departmentId: UUID): Promise<ServiceResponse<DepartmentAnalytics & {
        aiInsights: AIInsight[];
        predictiveAnalytics: PredictiveAnalytics;
        nlpSentiment: NLPAnalysis;
        industry5Metrics: any;
    }>>;
    getSmartRecommendations(departmentId: UUID): Promise<ServiceResponse<SmartRecommendation[]>>;
    autoOptimizeDepartment(departmentId: UUID, userId: UUID): Promise<ServiceResponse<{
        optimizations: any[];
        improvements: string[];
        automatedActions: string[];
    }>>;
    getEmployeeWellbeingInsights(departmentId: UUID): Promise<ServiceResponse<any>>;
    private generateDepartmentAIInsights;
    private generatePredictiveInsights;
    private validateDepartmentDataWithML;
    private validateUpdateWithML;
    private enhanceSearchWithNLP;
    private executeOptimization;
    private optimizeBudgetAllocation;
    private adjustDepartmentStructure;
    private enhancePerformanceMetrics;
    private generateWellbeingRecommendations;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=department.service.d.ts.map