import { UUID } from 'crypto';
import { CompensationPlan, BenefitsPlan, SalaryStructure, BenefitsEnrollment, CreateCompensationPlanRequest, CreateBenefitsPlanRequest, CreateSalaryStructureRequest, CreateBenefitsEnrollmentRequest, UpdateCompensationPlanRequest, PaginationOptions, PaginatedResponse, FilterOptions, ServiceResponse, QuantumAnalytics, PayEquityAnalysis, AIInsight, MarketDataAnalysis, BlockchainPayTransparency, SmartRecommendation } from '../types';
/**
 * Revolutionary Compensation Service with Industry 5.0 capabilities
 * Handles advanced compensation operations with AI-powered insights,
 * quantum analytics, and blockchain verification
 */
export declare class CompensationService {
    private compensationModel;
    private employeeModel;
    constructor();
    /**
     * Creates a new compensation plan with AI optimization and blockchain verification
     */
    createCompensationPlan(organizationId: UUID, data: CreateCompensationPlanRequest): Promise<ServiceResponse<CompensationPlan & {
        aiOptimizations?: any;
        marketIntelligence?: MarketDataAnalysis;
        blockchainVerification?: BlockchainPayTransparency;
        quantumInsights?: QuantumAnalytics;
    }>>;
    getCompensationPlanById(id: UUID, organizationId: UUID): Promise<ServiceResponse<CompensationPlan & {
        quantumInsights?: QuantumAnalytics;
    }>>;
    updateCompensationPlan(id: UUID, data: UpdateCompensationPlanRequest, organizationId: UUID): Promise<ServiceResponse<CompensationPlan>>;
    listCompensationPlans(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<ServiceResponse<PaginatedResponse<CompensationPlan>>>;
    /**
     * Performs revolutionary pay equity analysis with AI insights
     */
    analyzePayEquity(organizationId: UUID, analysisType: 'gender' | 'ethnicity' | 'department' | 'position' | 'comprehensive'): Promise<ServiceResponse<PayEquityAnalysis & {
        aiInsights: AIInsight[];
        revolutionaryRecommendations: SmartRecommendation[];
    }>>;
    createSalaryStructure(organizationId: UUID, data: CreateSalaryStructureRequest): Promise<ServiceResponse<SalaryStructure & {
        marketCompetitiveness?: any;
        quantumOptimization?: any;
    }>>;
    getSalaryStructureById(id: UUID, organizationId: UUID): Promise<ServiceResponse<SalaryStructure>>;
    createBenefitsPlan(organizationId: UUID, data: CreateBenefitsPlanRequest): Promise<ServiceResponse<BenefitsPlan & {
        blockchainVerification?: any;
        utilityScore?: number;
    }>>;
    createBenefitsEnrollment(organizationId: UUID, data: CreateBenefitsEnrollmentRequest): Promise<ServiceResponse<BenefitsEnrollment & {
        aiEligibilityAnalysis?: any;
        personalizedRecommendations?: any;
    }>>;
    getRevolutionaryCompensationAnalytics(organizationId: UUID, filters?: any): Promise<ServiceResponse<CompensationAnalytics & {
        aiInsights?: AIInsight[];
        predictiveModels?: any;
        payEquityMetrics?: any;
    }>>;
    private validateCompensationPlan;
    private validateSalaryStructure;
    private validateBenefitsPlan;
    private validateBenefitsEnrollment;
    private generateCompensationInsights;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=revolutionary-compensation.service.d.ts.map