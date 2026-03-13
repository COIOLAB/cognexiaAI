import { Request, Response } from 'express';
export declare class TalentAcquisitionController {
    private talentAcquisitionService;
    constructor();
    /**
     * Create job requisition
     * POST /api/v1/hr/recruitment/job-requisitions
     */
    createJobRequisition: (req: Request, res: Response) => Promise<void>;
    /**
     * Get job requisitions
     * GET /api/v1/hr/recruitment/job-requisitions
     */
    getJobRequisitions: (req: Request, res: Response) => Promise<void>;
    /**
     * Get job requisition by ID
     * GET /api/v1/hr/recruitment/job-requisitions/:id
     */
    getJobRequisition: (req: Request, res: Response) => Promise<void>;
    /**
     * Update job requisition
     * PUT /api/v1/hr/recruitment/job-requisitions/:id
     */
    updateJobRequisition: (req: Request, res: Response) => Promise<void>;
    /**
     * Approve/Reject job requisition
     * POST /api/v1/hr/recruitment/job-requisitions/:id/approve
     */
    approveJobRequisition: (req: Request, res: Response) => Promise<void>;
    /**
     * Create candidate profile
     * POST /api/v1/hr/recruitment/candidates
     */
    createCandidate: (req: Request, res: Response) => Promise<void>;
    /**
     * Get candidates
     * GET /api/v1/hr/recruitment/candidates
     */
    getCandidates: (req: Request, res: Response) => Promise<void>;
    /**
     * Get candidate by ID
     * GET /api/v1/hr/recruitment/candidates/:id
     */
    getCandidate: (req: Request, res: Response) => Promise<void>;
    /**
     * Update candidate profile
     * PUT /api/v1/hr/recruitment/candidates/:id
     */
    updateCandidate: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit job application
     * POST /api/v1/hr/recruitment/applications
     */
    submitJobApplication: (req: Request, res: Response) => Promise<void>;
    /**
     * Get job applications
     * GET /api/v1/hr/recruitment/applications
     */
    getJobApplications: (req: Request, res: Response) => Promise<void>;
    /**
     * Update job application stage
     * PUT /api/v1/hr/recruitment/applications/:id/stage
     */
    updateApplicationStage: (req: Request, res: Response) => Promise<void>;
    /**
     * Schedule interview
     * POST /api/v1/hr/recruitment/interviews
     */
    scheduleInterview: (req: Request, res: Response) => Promise<void>;
    /**
     * Get interviews
     * GET /api/v1/hr/recruitment/interviews
     */
    getInterviews: (req: Request, res: Response) => Promise<void>;
    /**
     * Update interview
     * PUT /api/v1/hr/recruitment/interviews/:id
     */
    updateInterview: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit interview feedback
     * POST /api/v1/hr/recruitment/interviews/:id/feedback
     */
    submitInterviewFeedback: (req: Request, res: Response) => Promise<void>;
    /**
     * Get interview feedback
     * GET /api/v1/hr/recruitment/interviews/:id/feedback
     */
    getInterviewFeedback: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate job offer
     * POST /api/v1/hr/recruitment/offers
     */
    generateJobOffer: (req: Request, res: Response) => Promise<void>;
    /**
     * Get job offers
     * GET /api/v1/hr/recruitment/offers
     */
    getJobOffers: (req: Request, res: Response) => Promise<void>;
    /**
     * Update job offer status
     * PUT /api/v1/hr/recruitment/offers/:id/status
     */
    updateOfferStatus: (req: Request, res: Response) => Promise<void>;
    /**
     * Parse resume with AI
     * POST /api/v1/hr/recruitment/resume/parse
     */
    parseResume: (req: Request, res: Response) => Promise<void>;
    /**
     * AI-powered candidate scoring
     * POST /api/v1/hr/recruitment/candidates/:id/score
     */
    scoreCandidateWithAI: (req: Request, res: Response) => Promise<void>;
    /**
     * Get candidate recommendations
     * GET /api/v1/hr/recruitment/job-requisitions/:id/candidate-recommendations
     */
    getCandidateRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Talent pool management
     * POST /api/v1/hr/recruitment/talent-pool
     */
    addToTalentPool: (req: Request, res: Response) => Promise<void>;
    /**
     * Get talent pool candidates
     * GET /api/v1/hr/recruitment/talent-pool
     */
    getTalentPoolCandidates: (req: Request, res: Response) => Promise<void>;
    /**
     * Employee referral program
     * POST /api/v1/hr/recruitment/referrals
     */
    submitEmployeeReferral: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee referrals
     * GET /api/v1/hr/recruitment/referrals
     */
    getEmployeeReferrals: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate recruitment analytics
     * GET /api/v1/hr/recruitment/analytics
     */
    getRecruitmentAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Diversity and inclusion metrics
     * GET /api/v1/hr/recruitment/diversity-metrics
     */
    getDiversityMetrics: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate hiring funnel report
     * GET /api/v1/hr/recruitment/reports/hiring-funnel
     */
    getHiringFunnelReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Source effectiveness analysis
     * GET /api/v1/hr/recruitment/reports/source-effectiveness
     */
    getSourceEffectivenessReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Time-to-hire analysis
     * GET /api/v1/hr/recruitment/reports/time-to-hire
     */
    getTimeToHireReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Cost-per-hire analysis
     * GET /api/v1/hr/recruitment/reports/cost-per-hire
     */
    getCostPerHireReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Quality of hire tracking
     * GET /api/v1/hr/recruitment/reports/quality-of-hire
     */
    getQualityOfHireReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Predictive hiring analytics
     * GET /api/v1/hr/recruitment/ai/predictive-analytics
     */
    getPredictiveHiringAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Candidate experience feedback
     * POST /api/v1/hr/recruitment/candidate-feedback
     */
    submitCandidateExperienceFeedback: (req: Request, res: Response) => Promise<void>;
    /**
     * Get candidate experience metrics
     * GET /api/v1/hr/recruitment/candidate-experience-metrics
     */
    getCandidateExperienceMetrics: (req: Request, res: Response) => Promise<void>;
    /**
     * Import/Export operations
     * POST /api/v1/hr/recruitment/import
     */
    importRecruitmentData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export recruitment data
     * GET /api/v1/hr/recruitment/export
     */
    exportRecruitmentData: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=talent-acquisition.controller.d.ts.map