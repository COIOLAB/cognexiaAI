import { Request, Response } from 'express';
export declare class AnalyticsController {
    private revolutionaryReportsService;
    constructor();
    /**
     * Generate Executive Dashboard with AI insights and quantum analytics
     * GET /api/v1/hr/analytics/executive-dashboard
     */
    getExecutiveDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate Board Presentation with quantum analytics and AI insights
     * POST /api/v1/hr/analytics/board-presentation
     */
    generateBoardPresentation: (req: Request, res: Response) => Promise<void>;
    /**
     * Export presentation in multiple formats (PPT, PDF, Excel)
     * GET /api/v1/hr/analytics/presentations/:id/export
     */
    exportPresentation: (req: Request, res: Response) => Promise<void>;
    /**
     * Get comprehensive workforce analytics with AI predictions
     * GET /api/v1/hr/analytics/workforce-analytics
     */
    getWorkforceAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get predictive analytics and forecasting
     * GET /api/v1/hr/analytics/predictive-insights
     */
    getPredictiveInsights: (req: Request, res: Response) => Promise<void>;
    /**
     * Get quantum analytics with multi-dimensional analysis
     * GET /api/v1/hr/analytics/quantum-insights
     */
    getQuantumInsights: (req: Request, res: Response) => Promise<void>;
    /**
     * Get competitive benchmarking analysis
     * GET /api/v1/hr/analytics/competitive-benchmarking
     */
    getCompetitiveBenchmarking: (req: Request, res: Response) => Promise<void>;
    /**
     * Get real-time HR metrics dashboard
     * GET /api/v1/hr/analytics/real-time-metrics
     */
    getRealTimeMetrics: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate custom analytics report
     * POST /api/v1/hr/analytics/custom-report
     */
    generateCustomReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Get AI-powered recommendations for HR strategy
     * GET /api/v1/hr/analytics/ai-recommendations
     */
    getAIRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee sentiment and engagement trends
     * GET /api/v1/hr/analytics/sentiment-analysis
     */
    getSentimentAnalysis: (req: Request, res: Response) => Promise<void>;
    /**
     * Get comprehensive talent analytics
     * GET /api/v1/hr/analytics/talent-analytics
     */
    getTalentAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Get diversity, equity, and inclusion analytics
     * GET /api/v1/hr/analytics/dei-analytics
     */
    getDEIAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * Health check for analytics service
     * GET /api/v1/hr/analytics/health
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map