import { UUID } from 'crypto';
import { ExecutiveDashboard, BoardPresentationData, ReportConfiguration, ExportFormat, AIInsight, QuantumAnalytics, NLPAnalysis, PredictiveAnalytics, ServiceResponse, BoardPresentationRequest, CompetitiveBenchmarking } from '../types';
import { EmployeeModel } from '../models/employee.model';
import { CompensationModel } from '../models/compensation.model';
import { PerformanceModel } from '../models/performance.model';
import { RevolutionaryCompensationService } from './revolutionary-compensation.service';
import { RevolutionaryTalentAcquisitionService } from './revolutionary-talent-acquisition.service';
import { RevolutionaryPerformanceService } from './revolutionary-performance.service';
/**
 * Revolutionary Reports & Analytics Service with Industry 5.0 capabilities
 * Generates AI-powered executive reports, board presentations, and comprehensive analytics
 * with multi-format exports and quantum-enhanced insights
 */
export declare class RevolutionaryReportsAnalyticsService {
    private employeeModel;
    private compensationModel;
    private performanceModel;
    private compensationService;
    private talentService;
    private performanceService;
    private readonly logger;
    constructor(employeeModel: EmployeeModel, compensationModel: CompensationModel, performanceModel: PerformanceModel, compensationService: RevolutionaryCompensationService, talentService: RevolutionaryTalentAcquisitionService, performanceService: RevolutionaryPerformanceService);
    /**
     * Generates comprehensive executive dashboard with AI-powered insights
     */
    generateExecutiveDashboard(organizationId: UUID, timeframe?: 'quarterly' | 'monthly' | 'yearly'): Promise<ServiceResponse<ExecutiveDashboard & {
        aiInsights: AIInsight[];
        predictiveAnalytics: PredictiveAnalytics;
        quantumMetrics: QuantumAnalytics;
        competitiveBenchmarking: CompetitiveBenchmarking;
    }>>;
    /**
     * Generates board-level presentation with AI-crafted narratives and insights
     */
    generateBoardPresentation(organizationId: UUID, request: BoardPresentationRequest): Promise<ServiceResponse<BoardPresentationData & {
        aiNarrative: NLPAnalysis;
        executiveSummary: string;
        keySlides: any[];
        appendix: any;
    }>>;
    /**
     * Exports reports in multiple formats with AI-enhanced content
     */
    exportReport(organizationId: UUID, reportData: any, format: ExportFormat, configuration: ReportConfiguration): Promise<ServiceResponse<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        aiEnhancements: any;
        exportMetadata: any;
    }>>;
    /**
     * Generates AI-enhanced PowerPoint presentation
     */
    private exportToPowerPoint;
    /**
     * Generates comprehensive PDF report with advanced visualizations
     */
    private exportToPDF;
    /**
     * Generates comprehensive Excel workbook with advanced analytics
     */
    private exportToExcel;
    private generateExecutiveAIInsights;
    private generatePredictiveExecutiveAnalytics;
    private generateQuantumExecutiveMetrics;
    private getEmployeeMetrics;
    private getCompensationAnalytics;
    private getPerformanceMetrics;
    private getTalentMetrics;
    private generateEmployeeTrendChart;
    private generateCompensationHeatmap;
    private generatePerformanceMatrix;
    private generateTalentFunnelChart;
    private calculatePriority;
    private estimateImpact;
    private estimateTimeline;
    private calculateROI;
    healthCheck(): Promise<ServiceResponse<any>>;
}
//# sourceMappingURL=revolutionary-reports-analytics.service.d.ts.map