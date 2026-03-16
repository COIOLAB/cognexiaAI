import { Request, Response } from 'express';
export declare class EmployeeEngagementController {
    private employeeEngagementService;
    constructor();
    /**
     * Create engagement survey
     * POST /api/v1/hr/engagement/surveys
     */
    createSurvey: (req: Request, res: Response) => Promise<void>;
    /**
     * Get surveys
     * GET /api/v1/hr/engagement/surveys
     */
    getSurveys: (req: Request, res: Response) => Promise<void>;
    /**
     * Get survey by ID
     * GET /api/v1/hr/engagement/surveys/:id
     */
    getSurvey: (req: Request, res: Response) => Promise<void>;
    /**
     * Launch survey
     * POST /api/v1/hr/engagement/surveys/:id/launch
     */
    launchSurvey: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit survey response
     * POST /api/v1/hr/engagement/surveys/:id/responses
     */
    submitSurveyResponse: (req: Request, res: Response) => Promise<void>;
    /**
     * Get survey responses
     * GET /api/v1/hr/engagement/surveys/:id/responses
     */
    getSurveyResponses: (req: Request, res: Response) => Promise<void>;
    /**
     * Get survey analytics
     * GET /api/v1/hr/engagement/surveys/:id/analytics
     */
    getSurveyAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Create pulse survey
     * POST /api/v1/hr/engagement/pulse-surveys
     */
    createPulseSurvey: (req: Request, res: Response) => Promise<void>;
    /**
     * Get pulse survey results
     * GET /api/v1/hr/engagement/pulse-surveys/:id/results
     */
    getPulseSurveyResults: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit feedback
     * POST /api/v1/hr/engagement/feedback
     */
    submitFeedback: (req: Request, res: Response) => Promise<void>;
    /**
     * Get feedback
     * GET /api/v1/hr/engagement/feedback
     */
    getFeedback: (req: Request, res: Response) => Promise<void>;
    /**
     * Create recognition program
     * POST /api/v1/hr/engagement/recognition-programs
     */
    createRecognitionProgram: (req: Request, res: Response) => Promise<void>;
    /**
     * Nominate employee for recognition
     * POST /api/v1/hr/engagement/recognition-programs/:id/nominations
     */
    nominateForRecognition: (req: Request, res: Response) => Promise<void>;
    /**
     * Get recognition nominations
     * GET /api/v1/hr/engagement/recognition-programs/:id/nominations
     */
    getRecognitionNominations: (req: Request, res: Response) => Promise<void>;
    /**
     * Award recognition
     * POST /api/v1/hr/engagement/recognition-programs/:programId/nominations/:nominationId/award
     */
    awardRecognition: (req: Request, res: Response) => Promise<void>;
    /**
     * Create wellness program
     * POST /api/v1/hr/engagement/wellness-programs
     */
    createWellnessProgram: (req: Request, res: Response) => Promise<void>;
    /**
     * Enroll in wellness program
     * POST /api/v1/hr/engagement/wellness-programs/:id/enroll
     */
    enrollInWellnessProgram: (req: Request, res: Response) => Promise<void>;
    /**
     * Track wellness activity
     * POST /api/v1/hr/engagement/wellness-programs/:id/activities
     */
    trackWellnessActivity: (req: Request, res: Response) => Promise<void>;
    /**
     * Get wellness program stats
     * GET /api/v1/hr/engagement/wellness-programs/:id/stats
     */
    getWellnessProgramStats: (req: Request, res: Response) => Promise<void>;
    /**
     * Get engagement metrics
     * GET /api/v1/hr/engagement/metrics
     */
    getEngagementMetrics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get sentiment analysis
     * GET /api/v1/hr/engagement/sentiment-analysis
     */
    getSentimentAnalysis: (req: Request, res: Response) => Promise<void>;
    /**
     * Predict engagement risks
     * GET /api/v1/hr/engagement/ai/predict-risks
     */
    predictEngagementRisks: (req: Request, res: Response) => Promise<void>;
    /**
     * Get engagement recommendations
     * GET /api/v1/hr/engagement/ai/recommendations
     */
    getEngagementRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Create engagement action plan
     * POST /api/v1/hr/engagement/action-plans
     */
    createEngagementActionPlan: (req: Request, res: Response) => Promise<void>;
    /**
     * Track action plan progress
     * PUT /api/v1/hr/engagement/action-plans/:id/progress
     */
    trackActionPlanProgress: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate engagement reports
     * GET /api/v1/hr/engagement/reports/:reportType
     */
    generateEngagementReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Get engagement dashboard
     * GET /api/v1/hr/engagement/dashboard
     */
    getEngagementDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * Create team building activity
     * POST /api/v1/hr/engagement/team-building
     */
    createTeamBuildingActivity: (req: Request, res: Response) => Promise<void>;
    /**
     * RSVP to team building activity
     * POST /api/v1/hr/engagement/team-building/:id/rsvp
     */
    rsvpTeamBuildingActivity: (req: Request, res: Response) => Promise<void>;
    /**
     * Import engagement data
     * POST /api/v1/hr/engagement/import
     */
    importEngagementData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export engagement data
     * GET /api/v1/hr/engagement/export
     */
    exportEngagementData: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=employee-engagement.controller.d.ts.map