import { Request, Response } from 'express';
export declare class SettingsController {
    constructor();
    /**
     * Get organization HR settings
     * GET /api/v1/hr/settings/organization
     */
    getOrganizationSettings: (req: Request, res: Response) => Promise<void>;
    /**
     * Update organization HR settings
     * PUT /api/v1/hr/settings/organization
     */
    updateOrganizationSettings: (req: Request, res: Response) => Promise<void>;
    /**
     * Get HR workflows
     * GET /api/v1/hr/settings/workflows
     */
    getWorkflows: (req: Request, res: Response) => Promise<void>;
    /**
     * Create HR workflow
     * POST /api/v1/hr/settings/workflows
     */
    createWorkflow: (req: Request, res: Response) => Promise<void>;
    /**
     * Get approval chains
     * GET /api/v1/hr/settings/approval-chains
     */
    getApprovalChains: (req: Request, res: Response) => Promise<void>;
    /**
     * Get notification templates
     * GET /api/v1/hr/settings/notification-templates
     */
    getNotificationTemplates: (req: Request, res: Response) => Promise<void>;
    /**
     * Get custom fields configuration
     * GET /api/v1/hr/settings/custom-fields
     */
    getCustomFields: (req: Request, res: Response) => Promise<void>;
    /**
     * Get integration configurations
     * GET /api/v1/hr/settings/integrations
     */
    getIntegrations: (req: Request, res: Response) => Promise<void>;
    /**
     * Get compliance settings
     * GET /api/v1/hr/settings/compliance
     */
    getComplianceSettings: (req: Request, res: Response) => Promise<void>;
    /**
     * Get system preferences
     * GET /api/v1/hr/settings/system-preferences
     */
    getSystemPreferences: (req: Request, res: Response) => Promise<void>;
    /**
     * Get backup settings and status
     * GET /api/v1/hr/settings/backup
     */
    getBackupSettings: (req: Request, res: Response) => Promise<void>;
    /**
     * Health check for settings service
     * GET /api/v1/hr/settings/health
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=settings.controller.d.ts.map