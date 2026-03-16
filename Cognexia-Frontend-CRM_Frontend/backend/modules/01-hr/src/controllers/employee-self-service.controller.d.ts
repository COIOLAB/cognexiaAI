import { Request, Response } from 'express';
export declare class EmployeeSelfServiceController {
    private employeeSelfServiceService;
    constructor();
    /**
     * Get employee profile
     * GET /api/v1/hr/self-service/profile
     */
    getEmployeeProfile: (req: Request, res: Response) => Promise<void>;
    /**
     * Update employee profile
     * PUT /api/v1/hr/self-service/profile
     */
    updateEmployeeProfile: (req: Request, res: Response) => Promise<void>;
    /**
     * Get personal documents
     * GET /api/v1/hr/self-service/documents
     */
    getPersonalDocuments: (req: Request, res: Response) => Promise<void>;
    /**
     * Upload personal document
     * POST /api/v1/hr/self-service/documents
     */
    uploadPersonalDocument: (req: Request, res: Response) => Promise<void>;
    /**
     * Request time off
     * POST /api/v1/hr/self-service/time-off
     */
    requestTimeOff: (req: Request, res: Response) => Promise<void>;
    /**
     * Get time off requests
     * GET /api/v1/hr/self-service/time-off
     */
    getTimeOffRequests: (req: Request, res: Response) => Promise<void>;
    /**
     * Cancel time off request
     * DELETE /api/v1/hr/self-service/time-off/:id
     */
    cancelTimeOffRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Get pay stubs
     * GET /api/v1/hr/self-service/pay-stubs
     */
    getPayStubs: (req: Request, res: Response) => Promise<void>;
    /**
     * Get tax documents
     * GET /api/v1/hr/self-service/tax-documents
     */
    getTaxDocuments: (req: Request, res: Response) => Promise<void>;
    /**
     * Update emergency contacts
     * PUT /api/v1/hr/self-service/emergency-contacts
     */
    updateEmergencyContacts: (req: Request, res: Response) => Promise<void>;
    /**
     * Get benefits summary
     * GET /api/v1/hr/self-service/benefits
     */
    getBenefitsSummary: (req: Request, res: Response) => Promise<void>;
    /**
     * Get time and attendance summary
     * GET /api/v1/hr/self-service/time-attendance
     */
    getTimeAttendanceSummary: (req: Request, res: Response) => Promise<void>;
    /**
     * Clock in/out
     * POST /api/v1/hr/self-service/time-clock
     */
    clockInOut: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit performance self-assessment
     * POST /api/v1/hr/self-service/performance/self-assessment
     */
    submitSelfAssessment: (req: Request, res: Response) => Promise<void>;
    /**
     * Get performance history
     * GET /api/v1/hr/self-service/performance/history
     */
    getPerformanceHistory: (req: Request, res: Response) => Promise<void>;
    /**
     * Get learning and development opportunities
     * GET /api/v1/hr/self-service/learning
     */
    getLearningOpportunities: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll in training course
     * POST /api/v1/hr/self-service/learning/enroll
     */
    enrollInTraining: (req: Request, res: Response) => Promise<void>;
    /**
     * Get personal analytics dashboard
     * GET /api/v1/hr/self-service/analytics
     */
    getPersonalAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit help desk ticket
     * POST /api/v1/hr/self-service/support/ticket
     */
    submitSupportTicket: (req: Request, res: Response) => Promise<void>;
    /**
     * Get support tickets
     * GET /api/v1/hr/self-service/support/tickets
     */
    getSupportTickets: (req: Request, res: Response) => Promise<void>;
    /**
     * Get AI-powered recommendations
     * GET /api/v1/hr/self-service/ai/recommendations
     */
    getPersonalRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Get career development suggestions
     * GET /api/v1/hr/self-service/career/suggestions
     */
    getCareerDevelopmentSuggestions: (req: Request, res: Response) => Promise<void>;
    /**
     * Get company directory
     * GET /api/v1/hr/self-service/directory
     */
    getCompanyDirectory: (req: Request, res: Response) => Promise<void>;
    /**
     * Get notifications
     * GET /api/v1/hr/self-service/notifications
     */
    getNotifications: (req: Request, res: Response) => Promise<void>;
    /**
     * Mark notification as read
     * PUT /api/v1/hr/self-service/notifications/:id/read
     */
    markNotificationRead: (req: Request, res: Response) => Promise<void>;
    /**
     * Update notification preferences
     * PUT /api/v1/hr/self-service/notification-preferences
     */
    updateNotificationPreferences: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=employee-self-service.controller.d.ts.map