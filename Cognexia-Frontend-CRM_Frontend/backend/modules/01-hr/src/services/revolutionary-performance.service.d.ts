import { UUID } from 'crypto';
import { PerformanceReview, PerformanceGoal, FeedbackRecord, CreatePerformanceReviewRequest, CreatePerformanceGoalRequest, Create360FeedbackRequest, ServiceResponse, AIInsight, QuantumAnalytics, PredictiveAnalytics, AICoachingInsight, NeuroPerformanceProfile, QuantumPerformanceOptimization, BlockchainAchievementVerification, RealTimePerformanceTracking, MetaverseCoachingExperience, BiometricPerformanceIndicators, HolisticWellbeingAssessment } from '../types';
/**
 * Revolutionary Performance Management Service with Industry 5.0 capabilities
 * Handles advanced performance operations with AI coaching,
 * quantum analytics, and blockchain achievement verification
 */
export declare class RevolutionaryPerformanceService {
    private readonly logger;
    private performanceModel;
    private employeeModel;
    constructor();
    /**
     * Creates a performance review with AI analysis and quantum insights
     */
    createPerformanceReview(organizationId: UUID, data: CreatePerformanceReviewRequest): Promise<ServiceResponse<PerformanceReview & {
        aiAnalysis?: any;
        quantumInsights?: QuantumPerformanceOptimization;
        blockchainVerification?: BlockchainAchievementVerification;
        coachingRecommendations?: AICoachingInsight[];
    }>>;
    /**
     * Creates performance goals with AI optimization and quantum alignment
     */
    createPerformanceGoal(organizationId: UUID, data: CreatePerformanceGoalRequest): Promise<ServiceResponse<PerformanceGoal & {
        aiOptimization?: any;
        quantumAlignment?: QuantumAnalytics;
        smartMilestones?: any;
        predictiveSuccess?: PredictiveAnalytics;
    }>>;
    /**
     * Creates 360-degree feedback with AI sentiment analysis and quantum insights
     */
    create360Feedback(organizationId: UUID, data: Create360FeedbackRequest): Promise<ServiceResponse<FeedbackRecord & {
        sentimentAnalysis?: any;
        quantumInsights?: QuantumAnalytics;
        biasDetection?: any;
        actionableInsights?: AIInsight[];
    }>>;
    /**
     * Provides real-time performance tracking with biometric indicators and AI coaching
     */
    getRealTimePerformanceTracking(employeeId: UUID): Promise<ServiceResponse<RealTimePerformanceTracking & {
        biometricIndicators?: BiometricPerformanceIndicators;
        aiCoachingInsights?: AICoachingInsight[];
        wellbeingAssessment?: HolisticWellbeingAssessment;
        neuroProfile?: NeuroPerformanceProfile;
    }>>;
    /**
     * Creates immersive metaverse coaching sessions with AI mentors
     */
    createMetaverseCoachingSession(employeeId: UUID, coachingObjective: string): Promise<ServiceResponse<MetaverseCoachingExperience & {
        aiMentorProfile?: any;
        sessionPlan?: any;
        predictedOutcomes?: PredictiveAnalytics;
    }>>;
    private validatePerformanceReview;
    private validatePerformanceGoal;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=revolutionary-performance.service.d.ts.map