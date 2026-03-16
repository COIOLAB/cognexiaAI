import { Request, Response } from 'express';
export declare class BenefitsAdministrationController {
    private benefitsAdministrationService;
    constructor();
    /**
     * Create benefits plan
     * POST /api/v1/hr/benefits/plans
     */
    createBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits plans
     * GET /api/v1/hr/benefits/plans
     */
    getBenefitsPlans: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits plan by ID
     * GET /api/v1/hr/benefits/plans/:id
     */
    getBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Update benefits plan
     * PUT /api/v1/hr/benefits/plans/:id
     */
    updateBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll employee in benefits plan
     * POST /api/v1/hr/benefits/enrollments
     */
    enrollInBenefitsPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee enrollments
     * GET /api/v1/hr/benefits/enrollments
     */
    getEnrollments: (req: Request, res: Response) => Promise<void>;
    /**
     * Update enrollment
     * PUT /api/v1/hr/benefits/enrollments/:id
     */
    updateEnrollment: (req: Request, res: Response) => Promise<void>;
    /**
     * Terminate enrollment
     * POST /api/v1/hr/benefits/enrollments/:id/terminate
     */
    terminateEnrollment: (req: Request, res: Response) => Promise<void>;
    /**
     * Add dependents
     * POST /api/v1/hr/benefits/enrollments/:id/dependents
     */
    addDependents: (req: Request, res: Response) => Promise<void>;
    /**
     * Remove dependent
     * DELETE /api/v1/hr/benefits/enrollments/:enrollmentId/dependents/:dependentId
     */
    removeDependent: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit benefits claim
     * POST /api/v1/hr/benefits/claims
     */
    submitClaim: (req: Request, res: Response) => Promise<void>;
    /**
     * Get claims
     * GET /api/v1/hr/benefits/claims
     */
    getClaims: (req: Request, res: Response) => Promise<void>;
    /**
     * Get claim by ID
     * GET /api/v1/hr/benefits/claims/:id
     */
    getClaim: (req: Request, res: Response) => Promise<void>;
    /**
     * Process claim
     * POST /api/v1/hr/benefits/claims/:id/process
     */
    processClaim: (req: Request, res: Response) => Promise<void>;
    /**
     * Add claim documents
     * POST /api/v1/hr/benefits/claims/:id/documents
     */
    addClaimDocuments: (req: Request, res: Response) => Promise<void>;
    /**
     * Create benefits provider
     * POST /api/v1/hr/benefits/providers
     */
    createBenefitsProvider: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits providers
     * GET /api/v1/hr/benefits/providers
     */
    getBenefitsProviders: (req: Request, res: Response) => Promise<void>;
    /**
     * Update provider contract
     * PUT /api/v1/hr/benefits/providers/:id/contract
     */
    updateProviderContract: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits eligibility
     * GET /api/v1/hr/benefits/eligibility/:employeeId
     */
    getBenefitsEligibility: (req: Request, res: Response) => Promise<void>;
    /**
     * Calculate benefits costs
     * GET /api/v1/hr/benefits/costs/calculate
     */
    calculateBenefitsCosts: (req: Request, res: Response) => Promise<void>;
    /**
     * Open enrollment period management
     * POST /api/v1/hr/benefits/open-enrollment
     */
    createOpenEnrollmentPeriod: (req: Request, res: Response) => Promise<void>;
    /**
     * Get open enrollment periods
     * GET /api/v1/hr/benefits/open-enrollment
     */
    getOpenEnrollmentPeriods: (req: Request, res: Response) => Promise<void>;
    /**
     * Process life events
     * POST /api/v1/hr/benefits/life-events
     */
    processLifeEvent: (req: Request, res: Response) => Promise<void>;
    /**
     * Get life events
     * GET /api/v1/hr/benefits/life-events
     */
    getLifeEvents: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits utilization analytics
     * GET /api/v1/hr/benefits/analytics/utilization
     */
    getBenefitsUtilizationAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits cost analytics
     * GET /api/v1/hr/benefits/analytics/costs
     */
    getBenefitsCostAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * AI-powered benefits recommendations
     * GET /api/v1/hr/benefits/ai/recommendations
     */
    getBenefitsRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Predict benefits trends
     * GET /api/v1/hr/benefits/ai/trends
     */
    predictBenefitsTrends: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate benefits reports
     * GET /api/v1/hr/benefits/reports/:reportType
     */
    generateBenefitsReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits dashboard
     * GET /api/v1/hr/benefits/dashboard
     */
    getBenefitsDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * Import benefits data
     * POST /api/v1/hr/benefits/import
     */
    importBenefitsData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export benefits data
     * GET /api/v1/hr/benefits/export
     */
    exportBenefitsData: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=benefits-administration.controller.d.ts.map