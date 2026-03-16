import { UUID } from 'crypto';
import { CompensationService } from '../services/revolutionary-compensation.service';
import { CreateCompensationPlanRequest, UpdateCompensationPlanRequest, CreateBenefitsPlanRequest, CreateSalaryStructureRequest, CreateBenefitsEnrollmentRequest, ServiceResponse, CompensationPlan, BenefitsPlan, SalaryStructure, BenefitsEnrollment, PayEquityAnalysis, CompensationAnalytics, AIInsight, QuantumAnalytics, SmartRecommendation } from '../types';
import { User } from '../../../types/user.types';
/**
 * Revolutionary Compensation Controller with Industry 5.0 capabilities
 * Provides quantum-enhanced compensation management API endpoints
 * with AI-powered insights and blockchain verification
 */
export declare class RevolutionaryCompensationController {
    private readonly compensationService;
    private readonly logger;
    constructor(compensationService: CompensationService);
    createCompensationPlan(createPlanDto: CreateCompensationPlanRequest, user: User): Promise<ServiceResponse<CompensationPlan & {
        aiOptimizations?: any;
        marketIntelligence?: any;
        blockchainVerification?: any;
        quantumInsights?: any;
    }>>;
    getCompensationPlan(id: UUID, user: User): Promise<ServiceResponse<CompensationPlan & {
        quantumInsights?: QuantumAnalytics;
    }>>;
    updateCompensationPlan(id: UUID, updatePlanDto: UpdateCompensationPlanRequest, user: User): Promise<ServiceResponse<CompensationPlan>>;
    listCompensationPlans(page: number | undefined, limit: number | undefined, search?: string, type?: string, active?: boolean, user: User): Promise<ServiceResponse<import("../types").PaginatedResponse<CompensationPlan>>>;
    analyzePayEquity(analysisType: 'gender' | 'ethnicity' | 'department' | 'position' | 'comprehensive', user: User): Promise<ServiceResponse<PayEquityAnalysis & {
        aiInsights: AIInsight[];
        revolutionaryRecommendations: SmartRecommendation[];
    }>>;
    createSalaryStructure(createStructureDto: CreateSalaryStructureRequest, user: User): Promise<ServiceResponse<SalaryStructure & {
        marketCompetitiveness?: any;
        quantumOptimization?: any;
    }>>;
    getSalaryStructure(id: UUID, user: User): Promise<ServiceResponse<SalaryStructure>>;
    createBenefitsPlan(createPlanDto: CreateBenefitsPlanRequest, user: User): Promise<ServiceResponse<BenefitsPlan & {
        blockchainVerification?: any;
        utilityScore?: number;
    }>>;
    createBenefitsEnrollment(createEnrollmentDto: CreateBenefitsEnrollmentRequest, user: User): Promise<ServiceResponse<BenefitsEnrollment & {
        aiEligibilityAnalysis?: any;
        personalizedRecommendations?: any;
    }>>;
    getComprehensiveAnalytics(department?: string, position?: string, dateFrom?: string, dateTo?: string, user: User): Promise<ServiceResponse<CompensationAnalytics & {
        aiInsights?: AIInsight[];
        predictiveModels?: any;
        payEquityMetrics?: any;
    }>>;
    healthCheck(): Promise<ServiceResponse<any>>;
    getTurnoverPrediction(department?: string, riskLevel?: string, user: User): Promise<{
        success: boolean;
        data: {
            overallRisk: string;
            departmentRisks: {
                engineering: {
                    risk: string;
                    probability: number;
                    factors: string[];
                };
                marketing: {
                    risk: string;
                    probability: number;
                    factors: string[];
                };
                operations: {
                    risk: string;
                    probability: number;
                    factors: string[];
                };
            };
            recommendations: {
                department: string;
                action: string;
                priority: string;
                expectedImpact: string;
            }[];
            predictiveAccuracy: number;
        };
        message: string;
        metadata: {
            predictiveModel: string;
            accuracy: number;
            dataPoints: number;
            lastUpdated: string;
        };
    }>;
    getCostOptimizationInsights(user: User): Promise<{
        success: boolean;
        data: {
            totalPotentialSavings: number;
            optimizationOpportunities: {
                area: string;
                potentialSavings: number;
                impact: string;
                description: string;
                timeframe: string;
            }[];
            riskAssessment: {
                retentionRisk: string;
                moralRisk: string;
                complianceRisk: string;
            };
        };
        message: string;
        metadata: {
            analysisDepth: string;
            confidenceLevel: number;
            basedOnDataPoints: number;
            lastUpdated: string;
        };
    }>;
}
//# sourceMappingURL=revolutionary-compensation.controller.d.ts.map