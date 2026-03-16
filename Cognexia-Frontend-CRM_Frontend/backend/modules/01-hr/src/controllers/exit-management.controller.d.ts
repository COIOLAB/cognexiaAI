import { Request, Response } from 'express';
export declare class ExitManagementController {
    private exitManagementService;
    constructor();
    /**
     * Initiate exit process for an employee
     * POST /api/v1/hr/exit/initiate
     */
    initiateExitProcess(req: Request, res: Response): Promise<void>;
    /**
     * Conduct exit interview
     * POST /api/v1/hr/exit/interview
     */
    conductExitInterview(req: Request, res: Response): Promise<void>;
    /**
     * Create knowledge transfer plan
     * POST /api/v1/hr/exit/knowledge-transfer
     */
    createKnowledgeTransferPlan(req: Request, res: Response): Promise<void>;
    /**
     * Update offboarding status
     * PUT /api/v1/hr/exit/offboarding-status
     */
    updateOffboardingStatus(req: Request, res: Response): Promise<void>;
    /**
     * Get exit analytics
     * GET /api/v1/hr/exit/analytics
     */
    getExitAnalytics(req: Request, res: Response): Promise<void>;
    /**
     * Get turnover report
     * GET /api/v1/hr/exit/turnover-report
     */
    getTurnoverReport(req: Request, res: Response): Promise<void>;
    /**
     * Get exit record by ID
     * GET /api/v1/hr/exit/:id
     */
    getExitRecord(req: Request, res: Response): Promise<void>;
    /**
     * Get all exit records for organization
     * GET /api/v1/hr/exit
     */
    getExitRecords(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=exit-management.controller.d.ts.map