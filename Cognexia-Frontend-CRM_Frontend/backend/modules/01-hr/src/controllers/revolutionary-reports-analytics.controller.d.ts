import { RevolutionaryReportsAnalyticsService } from '../services/revolutionary-reports-analytics.service';
import { ExecutiveDashboard, BoardPresentationData, ExportFormat, ReportConfiguration, BoardPresentationRequest, ServiceResponse, AIInsight, QuantumAnalytics, PredictiveAnalytics, CompetitiveBenchmarking } from '../types';
import { User } from '../../../types/user.types';
/**
 * Revolutionary Reports & Analytics Controller with Industry 5.0 capabilities
 * Provides board-level presentation endpoints, executive dashboards, and multi-format exports
 * with AI-powered insights and quantum analytics
 */
export declare class RevolutionaryReportsAnalyticsController {
    private readonly reportsService;
    private readonly logger;
    constructor(reportsService: RevolutionaryReportsAnalyticsService);
    getExecutiveDashboard(timeframe: "monthly" | "quarterly" | "yearly" | undefined, user: User): Promise<ServiceResponse<ExecutiveDashboard & {
        aiInsights: AIInsight[];
        predictiveAnalytics: PredictiveAnalytics;
        quantumMetrics: QuantumAnalytics;
        competitiveBenchmarking: CompetitiveBenchmarking;
    }>>;
    generateBoardPresentation(request: BoardPresentationRequest, user: User): Promise<ServiceResponse<BoardPresentationData>>;
    exportReport(format: ExportFormat, configuration: ReportConfiguration, user: User): Promise<ServiceResponse<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        aiEnhancements: any;
        exportMetadata: any;
    }>>;
    getPredictiveAnalytics(categories?: string, timeframe: string | undefined, user: User): Promise<{
        success: boolean;
        data: {
            predictions: import("../types").Prediction[];
            generatedAt: Date;
            timeframe: string;
            categories: string | string[];
            overallAccuracy: number;
            trends: import("../types").Trend[];
            forecasts: import("../types").Forecast[];
        };
        message: string;
        metadata: {
            predictionCount: number;
            overallAccuracy: number;
            timeframeRequested: string;
        };
    }>;
    getCompetitiveBenchmarking(industry?: string, companySize?: string, user: User): Promise<{
        success: boolean;
        data: {
            organizationId: any;
            industry: string;
            companySize: string;
            overallRanking: string;
            benchmarkDate: Date;
            metrics: {
                employeeEngagement: {
                    organizationScore: number;
                    industryAverage: number;
                    topQuartile: number;
                    ranking: string;
                    percentile: number;
                };
                retentionRate: {
                    organizationScore: number;
                    industryAverage: number;
                    topQuartile: number;
                    ranking: string;
                    percentile: number;
                };
                compensationCompetitiveness: {
                    organizationScore: number;
                    industryAverage: number;
                    topQuartile: number;
                    ranking: string;
                    percentile: number;
                };
                talentAcquisitionEfficiency: {
                    organizationScore: number;
                    industryAverage: number;
                    topQuartile: number;
                    ranking: string;
                    percentile: number;
                };
            };
            competitiveAdvantages: string[];
            improvementAreas: string[];
            actionableInsights: {
                category: string;
                insight: string;
                expectedImpact: string;
                investmentRequired: string;
                paybackPeriod: string;
            }[];
        };
        message: string;
        metadata: {
            benchmarkSources: string[];
            dataFreshness: string;
            confidenceLevel: number;
        };
    }>;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=revolutionary-reports-analytics.controller.d.ts.map