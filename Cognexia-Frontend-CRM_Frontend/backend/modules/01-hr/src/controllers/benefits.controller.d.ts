import { Request, Response } from 'express';
export declare class BenefitsController {
    private benefitsAdministrationService;
    constructor();
    /**
     * Create benefits plan
     * POST /api/v1/hr/benefits/plans
     */
    createPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits plans
     * GET /api/v1/hr/benefits/plans
     */
    getPlans: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits plan by ID
     * GET /api/v1/hr/benefits/plans/:id
     */
    getPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Update benefits plan
     * PUT /api/v1/hr/benefits/plans/:id
     */
    updatePlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll in benefits plan
     * POST /api/v1/hr/benefits/enrollments
     */
    enrollInPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits enrollments
     * GET /api/v1/hr/benefits/enrollments
     */
    getEnrollments: (req: Request, res: Response) => Promise<void>;
    /**
     * Update benefits enrollment
     * PUT /api/v1/hr/benefits/enrollments/:id
     */
    updateEnrollment: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit benefits claim
     * POST /api/v1/hr/benefits/claims
     */
    submitClaim: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits claims
     * GET /api/v1/hr/benefits/claims
     */
    getClaims: (req: Request, res: Response) => Promise<void>;
    /**
     * Update claim status
     * PUT /api/v1/hr/benefits/claims/:id/status
     */
    updateClaimStatus: (req: Request, res: Response) => Promise<void>;
    /**
     * Create open enrollment period
     * POST /api/v1/hr/benefits/open-enrollment
     */
    createOpenEnrollment: (req: Request, res: Response) => Promise<void>;
    /**
     * Get open enrollment periods
     * GET /api/v1/hr/benefits/open-enrollment
     */
    getOpenEnrollments: (req: Request, res: Response) => Promise<void>;
    /**
     * Report qualifying life event
     * POST /api/v1/hr/benefits/life-events
     */
    reportLifeEvent: (req: Request, res: Response) => Promise<void>;
    /**
     * Get life events
     * GET /api/v1/hr/benefits/life-events
     */
    getLifeEvents: (req: Request, res: Response) => Promise<void>;
    /**
     * Check benefits eligibility for employee
     * GET /api/v1/hr/benefits/eligibility/:employeeId
     */
    checkEligibility: (req: Request, res: Response) => Promise<void>;
    /**
     * Calculate benefits cost
     * POST /api/v1/hr/benefits/cost-calculation
     */
    calculateCost: (req: Request, res: Response) => Promise<void>;
    /**
     * Get enrollment analytics
     * GET /api/v1/hr/benefits/analytics/enrollment-summary
     */
    getEnrollmentAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits cost analysis
     * GET /api/v1/hr/benefits/analytics/cost-analysis
     */
    getCostAnalysis: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate benefits reports
     * GET /api/v1/hr/benefits/reports/:reportType
     */
    generateReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Get AI-powered benefits recommendations
     * GET /api/v1/hr/benefits/ai/recommendations
     */
    getAIRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Get AI-powered plan comparison
     * GET /api/v1/hr/benefits/ai/plan-comparison
     */
    getAIPlanComparison: (req: Request, res: Response) => Promise<void>;
    /**
     * Health check endpoint
     * GET /api/v1/hr/benefits/health
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=benefits.controller.d.ts.map