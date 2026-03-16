import { Request, Response } from 'express';
export declare class HRIntegrationController {
    private hrIntegrationService;
    constructor();
    /**
     * Get integration health status
     * GET /api/v1/hr/integrations/health
     */
    getIntegrationHealth: (req: Request, res: Response) => Promise<void>;
    /**
     * Get integration statistics
     * GET /api/v1/hr/integrations/stats
     */
    getIntegrationStats: (req: Request, res: Response) => Promise<void>;
    /**
     * Publish HR integration event
     * POST /api/v1/hr/integrations/events
     */
    publishIntegrationEvent: (req: Request, res: Response) => Promise<void>;
    /**
     * Get integration mappings
     * GET /api/v1/hr/integrations/mappings
     */
    getIntegrationMappings: (req: Request, res: Response) => Promise<void>;
    /**
     * Create new integration mapping
     * POST /api/v1/hr/integrations/mappings
     */
    createIntegrationMapping: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete integration mapping
     * DELETE /api/v1/hr/integrations/mappings/:mappingId
     */
    deleteIntegrationMapping: (req: Request, res: Response) => Promise<void>;
    /**
     * Get integration dashboard data
     * GET /api/v1/hr/integrations/dashboard
     */
    getIntegrationDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * Test integration connectivity
     * POST /api/v1/hr/integrations/test-connection
     */
    testIntegrationConnection: (req: Request, res: Response) => Promise<void>;
    /**
     * Calculate health score based on integration statistics
     */
    private calculateHealthScore;
    /**
     * Calculate integration efficiency
     */
    private calculateEfficiency;
    /**
     * Service health check
     * GET /api/v1/hr/integrations/service-health
     */
    serviceHealthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=hr-integration.controller.d.ts.map