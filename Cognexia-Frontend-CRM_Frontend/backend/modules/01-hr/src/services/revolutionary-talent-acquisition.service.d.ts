import { UUID } from 'crypto';
import { JobRequisition, CandidateProfile, Interview, CreateJobRequisitionRequest, CreateCandidateProfileRequest, CreateInterviewRequest, CandidateAssessment, RecruitmentAnalytics, ServiceResponse, AIInsight, QuantumAnalytics, PredictiveAnalytics, CandidateMatchingScore, RecruitmentPrediction, TalentMarketIntelligence, BlockchainCredentialVerification, NeuroPersonalityProfile, BiometricAssessment, MetaverseInterviewExperience } from '../types';
/**
 * Revolutionary Talent Acquisition Service with Industry 5.0 capabilities
 * Handles advanced recruitment operations with AI-powered candidate matching,
 * quantum analytics, and blockchain credential verification
 */
export declare class RevolutionaryTalentAcquisitionService {
    private readonly logger;
    private talentAcquisitionModel;
    private employeeModel;
    constructor();
    /**
     * Creates a job requisition with AI optimization and market intelligence
     */
    createJobRequisition(organizationId: UUID, data: CreateJobRequisitionRequest): Promise<ServiceResponse<JobRequisition & {
        aiOptimizations?: any;
        marketIntelligence?: TalentMarketIntelligence;
        quantumJobMatching?: QuantumAnalytics;
    }>>;
    /**
     * Creates a candidate profile with AI-powered skill analysis and quantum matching
     */
    createCandidateProfile(data: CreateCandidateProfileRequest): Promise<ServiceResponse<CandidateProfile & {
        aiSkillAnalysis?: any;
        quantumMatching?: CandidateMatchingScore[];
        blockchainVerification?: BlockchainCredentialVerification;
        neuroPersonalityProfile?: NeuroPersonalityProfile;
    }>>;
    /**
     * Creates an interview with metaverse experience and AI assessment
     */
    createInterview(data: CreateInterviewRequest): Promise<ServiceResponse<Interview & {
        metaverseExperience?: MetaverseInterviewExperience;
        aiAssessment?: CandidateAssessment;
        biometricAnalysis?: BiometricAssessment;
        realTimeInsights?: AIInsight[];
    }>>;
    /**
     * Generates comprehensive recruitment analytics with AI predictions
     */
    getRecruitmentAnalytics(organizationId: UUID, filters?: any): Promise<ServiceResponse<RecruitmentAnalytics & {
        aiPredictions?: RecruitmentPrediction[];
        talentMarketInsights?: TalentMarketIntelligence;
        diversityMetrics?: any;
        costOptimization?: any;
    }>>;
    /**
     * Generates quantum-enhanced candidate recommendations for job requisitions
     */
    getQuantumCandidateRecommendations(jobRequisitionId: UUID): Promise<ServiceResponse<{
        recommendations: CandidateMatchingScore[];
        quantumInsights: QuantumAnalytics;
        diversityBalance: any;
        predictiveSuccess: PredictiveAnalytics;
    }>>;
    private validateJobRequisition;
    private validateCandidateProfile;
    private isValidEmail;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=revolutionary-talent-acquisition.service.d.ts.map