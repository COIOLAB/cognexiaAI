/**
 * Advanced Procurement Analytics Controller
 * Industry 5.0 ERP - AI-Powered Procurement Intelligence
 * 
 * Comprehensive procurement analytics with AI insights, predictive modeling,
 * KPI monitoring, and strategic intelligence for procurement optimization.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  Logger,
  Res,
  StreamableFile
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiProduces
} from '@nestjs/swagger';
import { Response } from 'express';

// Import Services
import { AIProcurementAnalyticsService } from '../services/ai-procurement-analytics.service';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { KPIMonitoringService } from '../services/kpi-monitoring.service';
import { SpendAnalysisService } from '../services/spend-analysis.service';
import { SupplierPerformanceAnalyticsService } from '../services/supplier-performance-analytics.service';
import { RiskAnalyticsService } from '../services/risk-analytics.service';
import { ComplianceAnalyticsService } from '../services/compliance-analytics.service';
import { MarketIntelligenceService } from '../services/market-intelligence.service';
import { ReportGenerationService } from '../services/report-generation.service';

// Import DTOs
import { 
  AnalyticsFilterDto,
  SpendAnalysisDto,
  SupplierAnalyticsDto,
  RiskAnalyticsDto,
  PredictiveModelDto,
  CustomReportDto
} from '../dto/analytics.dto';

// Import Guards and Interceptors
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuditInterceptor } from '../guards/audit.interceptor';

@ApiTags('Procurement Analytics & Intelligence')
@ApiBearerAuth()
@Controller('procurement/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProcurementAnalyticsController {
  private readonly logger = new Logger(ProcurementAnalyticsController.name);

  constructor(
    private readonly aiAnalyticsService: AIProcurementAnalyticsService,
    private readonly predictiveService: PredictiveAnalyticsService,
    private readonly kpiService: KPIMonitoringService,
    private readonly spendAnalysisService: SpendAnalysisService,
    private readonly supplierAnalyticsService: SupplierPerformanceAnalyticsService,
    private readonly riskAnalyticsService: RiskAnalyticsService,
    private readonly complianceAnalyticsService: ComplianceAnalyticsService,
    private readonly marketIntelligenceService: MarketIntelligenceService,
    private readonly reportService: ReportGenerationService
  ) {}

  // =============== EXECUTIVE DASHBOARD ===============

  @Get('dashboard/executive')
  @ApiOperation({ summary: 'Get executive procurement dashboard with AI insights' })
  @ApiResponse({ status: 200, description: 'Executive dashboard retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 30d, 90d, 1y)' })
  async getExecutiveDashboard(
    @Query('period') period: string = '90d'
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      this.logger.log(`Generating executive dashboard for period: ${period}`);

      const [
        kpiMetrics,
        spendOverview,
        supplierMetrics,
        riskMetrics,
        complianceMetrics,
        marketInsights,
        predictiveInsights,
        aiRecommendations
      ] = await Promise.all([
        this.kpiService.getExecutiveKPIs(period),
        this.spendAnalysisService.getSpendOverview(period),
        this.supplierAnalyticsService.getSupplierMetrics(period),
        this.riskAnalyticsService.getRiskOverview(period),
        this.complianceAnalyticsService.getComplianceOverview(period),
        this.marketIntelligenceService.getMarketOverview(period),
        this.predictiveService.getPredictiveInsights(period),
        this.aiAnalyticsService.generateExecutiveRecommendations(period)
      ]);

      return {
        success: true,
        data: {
          period,
          lastUpdated: new Date(),
          kpiMetrics,
          spendOverview,
          supplierMetrics,
          riskMetrics,
          complianceMetrics,
          marketInsights,
          predictiveInsights,
          aiRecommendations,
          summary: {
            totalSpend: spendOverview.totalSpend,
            costSavings: spendOverview.costSavings,
            supplierCount: supplierMetrics.totalSuppliers,
            riskLevel: riskMetrics.overallRiskLevel,
            complianceScore: complianceMetrics.overallScore
          }
        },
        message: 'Executive dashboard retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating executive dashboard:', error);
      throw error;
    }
  }

  @Get('dashboard/operational')
  @ApiOperation({ summary: 'Get operational procurement dashboard' })
  @ApiResponse({ status: 200, description: 'Operational dashboard retrieved successfully' })
  async getOperationalDashboard(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const operationalMetrics = await this.generateOperationalMetrics(filterDto);

      return {
        success: true,
        data: operationalMetrics,
        message: 'Operational dashboard retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating operational dashboard:', error);
      throw error;
    }
  }

  // =============== SPEND ANALYSIS ===============

  @Get('spend-analysis')
  @ApiOperation({ summary: 'Get comprehensive spend analysis with AI insights' })
  @ApiResponse({ status: 200, description: 'Spend analysis retrieved successfully' })
  async getSpendAnalysis(
    @Query() spendAnalysisDto: SpendAnalysisDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const [
        spendByCategory,
        spendBySupplier,
        spendTrends,
        spendOptimization,
        benchmarkComparison,
        aiInsights
      ] = await Promise.all([
        this.spendAnalysisService.getSpendByCategory(spendAnalysisDto),
        this.spendAnalysisService.getSpendBySupplier(spendAnalysisDto),
        this.spendAnalysisService.getSpendTrends(spendAnalysisDto),
        this.spendAnalysisService.identifyOptimizationOpportunities(spendAnalysisDto),
        this.spendAnalysisService.getBenchmarkComparison(spendAnalysisDto),
        this.aiAnalyticsService.generateSpendAnalysisInsights(spendAnalysisDto)
      ]);

      return {
        success: true,
        data: {
          spendByCategory,
          spendBySupplier,
          spendTrends,
          spendOptimization,
          benchmarkComparison,
          aiInsights,
          summary: {
            totalSpend: spendByCategory.reduce((sum, cat) => sum + cat.amount, 0),
            topCategory: spendByCategory[0]?.name,
            topSupplier: spendBySupplier[0]?.name,
            potentialSavings: spendOptimization.totalPotentialSavings
          }
        },
        message: 'Spend analysis retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating spend analysis:', error);
      throw error;
    }
  }

  @Get('spend-analysis/category/:categoryId')
  @ApiOperation({ summary: 'Get detailed category spend analysis' })
  @ApiResponse({ status: 200, description: 'Category spend analysis retrieved successfully' })
  async getCategorySpendAnalysis(
    @Query('categoryId') categoryId: string,
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const categoryAnalysis = await this.spendAnalysisService.getCategoryDetailedAnalysis(categoryId, filterDto);

      return {
        success: true,
        data: categoryAnalysis,
        message: 'Category spend analysis retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error generating category analysis for ${categoryId}:`, error);
      throw error;
    }
  }

  // =============== SUPPLIER PERFORMANCE ANALYTICS ===============

  @Get('suppliers/performance')
  @ApiOperation({ summary: 'Get supplier performance analytics with AI scoring' })
  @ApiResponse({ status: 200, description: 'Supplier performance analytics retrieved successfully' })
  async getSupplierPerformanceAnalytics(
    @Query() supplierAnalyticsDto: SupplierAnalyticsDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const [
        performanceMetrics,
        performanceTrends,
        supplierRankings,
        riskAssessment,
        complianceMetrics,
        aiScoring
      ] = await Promise.all([
        this.supplierAnalyticsService.getPerformanceMetrics(supplierAnalyticsDto),
        this.supplierAnalyticsService.getPerformanceTrends(supplierAnalyticsDto),
        this.supplierAnalyticsService.getSupplierRankings(supplierAnalyticsDto),
        this.riskAnalyticsService.getSupplierRiskMetrics(supplierAnalyticsDto),
        this.complianceAnalyticsService.getSupplierCompliance(supplierAnalyticsDto),
        this.aiAnalyticsService.generateSupplierScoring(supplierAnalyticsDto)
      ]);

      return {
        success: true,
        data: {
          performanceMetrics,
          performanceTrends,
          supplierRankings,
          riskAssessment,
          complianceMetrics,
          aiScoring,
          insights: await this.aiAnalyticsService.generateSupplierInsights(supplierAnalyticsDto)
        },
        message: 'Supplier performance analytics retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating supplier performance analytics:', error);
      throw error;
    }
  }

  @Get('suppliers/:supplierId/360-view')
  @ApiOperation({ summary: 'Get 360-degree supplier view with comprehensive analytics' })
  @ApiResponse({ status: 200, description: 'Supplier 360-view retrieved successfully' })
  async getSupplier360View(
    @Query('supplierId') supplierId: string,
    @Query('period') period: string = '1y'
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const supplier360View = await this.supplierAnalyticsService.getSupplier360View(supplierId, period);

      return {
        success: true,
        data: supplier360View,
        message: 'Supplier 360-view retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`Error generating 360-view for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  // =============== RISK ANALYTICS ===============

  @Get('risk-analytics')
  @ApiOperation({ summary: 'Get comprehensive risk analytics with predictive modeling' })
  @ApiResponse({ status: 200, description: 'Risk analytics retrieved successfully' })
  async getRiskAnalytics(
    @Query() riskAnalyticsDto: RiskAnalyticsDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const [
        riskOverview,
        riskTrends,
        riskByCategory,
        supplierRisks,
        geopoliticalRisks,
        financialRisks,
        operationalRisks,
        predictiveRisks
      ] = await Promise.all([
        this.riskAnalyticsService.getRiskOverview(riskAnalyticsDto),
        this.riskAnalyticsService.getRiskTrends(riskAnalyticsDto),
        this.riskAnalyticsService.getRiskByCategory(riskAnalyticsDto),
        this.riskAnalyticsService.getSupplierRiskAnalysis(riskAnalyticsDto),
        this.riskAnalyticsService.getGeopoliticalRisks(riskAnalyticsDto),
        this.riskAnalyticsService.getFinancialRisks(riskAnalyticsDto),
        this.riskAnalyticsService.getOperationalRisks(riskAnalyticsDto),
        this.predictiveService.predictRiskTrends(riskAnalyticsDto)
      ]);

      return {
        success: true,
        data: {
          riskOverview,
          riskTrends,
          riskByCategory,
          supplierRisks,
          geopoliticalRisks,
          financialRisks,
          operationalRisks,
          predictiveRisks,
          mitigationStrategies: await this.riskAnalyticsService.generateMitigationStrategies(riskAnalyticsDto),
          aiRecommendations: await this.aiAnalyticsService.generateRiskRecommendations(riskAnalyticsDto)
        },
        message: 'Risk analytics retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating risk analytics:', error);
      throw error;
    }
  }

  // =============== COMPLIANCE ANALYTICS ===============

  @Get('compliance-analytics')
  @ApiOperation({ summary: 'Get compliance analytics and monitoring' })
  @ApiResponse({ status: 200, description: 'Compliance analytics retrieved successfully' })
  async getComplianceAnalytics(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const complianceAnalytics = await this.complianceAnalyticsService.getComprehensiveCompliance(filterDto);

      return {
        success: true,
        data: complianceAnalytics,
        message: 'Compliance analytics retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating compliance analytics:', error);
      throw error;
    }
  }

  // =============== PREDICTIVE ANALYTICS ===============

  @Get('predictive/demand-forecasting')
  @ApiOperation({ summary: 'Get demand forecasting with AI predictions' })
  @ApiResponse({ status: 200, description: 'Demand forecasting retrieved successfully' })
  async getDemandForecasting(
    @Query() predictiveDto: PredictiveModelDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const demandForecast = await this.predictiveService.generateDemandForecast(predictiveDto);

      return {
        success: true,
        data: demandForecast,
        message: 'Demand forecasting retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating demand forecast:', error);
      throw error;
    }
  }

  @Get('predictive/price-predictions')
  @ApiOperation({ summary: 'Get price predictions and market trends' })
  @ApiResponse({ status: 200, description: 'Price predictions retrieved successfully' })
  async getPricePredictions(
    @Query() predictiveDto: PredictiveModelDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const pricePredictions = await this.predictiveService.generatePricePredictions(predictiveDto);

      return {
        success: true,
        data: pricePredictions,
        message: 'Price predictions retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating price predictions:', error);
      throw error;
    }
  }

  @Get('predictive/supplier-performance')
  @ApiOperation({ summary: 'Get predictive supplier performance analysis' })
  @ApiResponse({ status: 200, description: 'Predictive supplier analysis retrieved successfully' })
  async getPredictiveSupplierAnalysis(
    @Query() predictiveDto: PredictiveModelDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const supplierPredictions = await this.predictiveService.predictSupplierPerformance(predictiveDto);

      return {
        success: true,
        data: supplierPredictions,
        message: 'Predictive supplier analysis retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating supplier predictions:', error);
      throw error;
    }
  }

  // =============== MARKET INTELLIGENCE ===============

  @Get('market-intelligence')
  @ApiOperation({ summary: 'Get market intelligence and competitive analysis' })
  @ApiResponse({ status: 200, description: 'Market intelligence retrieved successfully' })
  async getMarketIntelligence(
    @Query('categories') categories: string,
    @Query('regions') regions: string,
    @Query('period') period: string = '90d'
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const marketIntelligence = await this.marketIntelligenceService.getComprehensiveMarketIntelligence({
        categories: categories?.split(',') || [],
        regions: regions?.split(',') || [],
        period
      });

      return {
        success: true,
        data: marketIntelligence,
        message: 'Market intelligence retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating market intelligence:', error);
      throw error;
    }
  }

  // =============== KPI MONITORING ===============

  @Get('kpis')
  @ApiOperation({ summary: 'Get comprehensive KPI monitoring dashboard' })
  @ApiResponse({ status: 200, description: 'KPI dashboard retrieved successfully' })
  async getKPIDashboard(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const kpiDashboard = await this.kpiService.getComprehensiveKPIDashboard(filterDto);

      return {
        success: true,
        data: kpiDashboard,
        message: 'KPI dashboard retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating KPI dashboard:', error);
      throw error;
    }
  }

  @Get('kpis/trends')
  @ApiOperation({ summary: 'Get KPI trends and performance analysis' })
  @ApiResponse({ status: 200, description: 'KPI trends retrieved successfully' })
  async getKPITrends(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const kpiTrends = await this.kpiService.getKPITrends(filterDto);

      return {
        success: true,
        data: kpiTrends,
        message: 'KPI trends retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating KPI trends:', error);
      throw error;
    }
  }

  // =============== CUSTOM REPORTS ===============

  @Post('reports/custom')
  @ApiOperation({ summary: 'Generate custom procurement report' })
  @ApiResponse({ status: 200, description: 'Custom report generated successfully' })
  @HttpCode(HttpStatus.OK)
  async generateCustomReport(
    @Body() customReportDto: CustomReportDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const customReport = await this.reportService.generateCustomReport(customReportDto);

      return {
        success: true,
        data: customReport,
        message: 'Custom report generated successfully'
      };

    } catch (error) {
      this.logger.error('Error generating custom report:', error);
      throw error;
    }
  }

  @Get('reports/executive-summary')
  @ApiOperation({ summary: 'Generate executive summary report' })
  @ApiResponse({ status: 200, description: 'Executive summary report generated successfully' })
  @ApiProduces('application/pdf')
  async generateExecutiveSummaryReport(
    @Query('period') period: string = '90d',
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      const report = await this.reportService.generateExecutiveSummaryReport(period);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="procurement-executive-summary-${period}.pdf"`
      });

      return new StreamableFile(report);

    } catch (error) {
      this.logger.error('Error generating executive summary report:', error);
      throw error;
    }
  }

  @Get('reports/spend-analysis')
  @ApiOperation({ summary: 'Generate comprehensive spend analysis report' })
  @ApiResponse({ status: 200, description: 'Spend analysis report generated successfully' })
  @ApiProduces('application/pdf')
  async generateSpendAnalysisReport(
    @Query() spendAnalysisDto: SpendAnalysisDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      const report = await this.reportService.generateSpendAnalysisReport(spendAnalysisDto);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="spend-analysis-report.pdf"`
      });

      return new StreamableFile(report);

    } catch (error) {
      this.logger.error('Error generating spend analysis report:', error);
      throw error;
    }
  }

  @Get('reports/supplier-performance')
  @ApiOperation({ summary: 'Generate supplier performance report' })
  @ApiResponse({ status: 200, description: 'Supplier performance report generated successfully' })
  @ApiProduces('application/pdf')
  async generateSupplierPerformanceReport(
    @Query() supplierAnalyticsDto: SupplierAnalyticsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      const report = await this.reportService.generateSupplierPerformanceReport(supplierAnalyticsDto);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="supplier-performance-report.pdf"`
      });

      return new StreamableFile(report);

    } catch (error) {
      this.logger.error('Error generating supplier performance report:', error);
      throw error;
    }
  }

  // =============== AI INSIGHTS & RECOMMENDATIONS ===============

  @Get('ai-insights/optimization')
  @ApiOperation({ summary: 'Get AI-powered procurement optimization insights' })
  @ApiResponse({ status: 200, description: 'AI optimization insights retrieved successfully' })
  async getAIOptimizationInsights(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const aiInsights = await this.aiAnalyticsService.generateOptimizationInsights(filterDto);

      return {
        success: true,
        data: aiInsights,
        message: 'AI optimization insights retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating AI optimization insights:', error);
      throw error;
    }
  }

  @Get('ai-insights/strategic')
  @ApiOperation({ summary: 'Get strategic AI recommendations for procurement' })
  @ApiResponse({ status: 200, description: 'Strategic AI recommendations retrieved successfully' })
  async getStrategicAIRecommendations(
    @Query() filterDto: AnalyticsFilterDto
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const strategicRecommendations = await this.aiAnalyticsService.generateStrategicRecommendations(filterDto);

      return {
        success: true,
        data: strategicRecommendations,
        message: 'Strategic AI recommendations retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error generating strategic AI recommendations:', error);
      throw error;
    }
  }

  // =============== REAL-TIME MONITORING ===============

  @Get('realtime/alerts')
  @ApiOperation({ summary: 'Get real-time procurement alerts and notifications' })
  @ApiResponse({ status: 200, description: 'Real-time alerts retrieved successfully' })
  async getRealtimeAlerts(): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const realtimeAlerts = await this.aiAnalyticsService.getRealtimeAlerts();

      return {
        success: true,
        data: realtimeAlerts,
        message: 'Real-time alerts retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error retrieving real-time alerts:', error);
      throw error;
    }
  }

  @Get('realtime/performance')
  @ApiOperation({ summary: 'Get real-time procurement performance metrics' })
  @ApiResponse({ status: 200, description: 'Real-time performance metrics retrieved successfully' })
  async getRealtimePerformance(): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const realtimePerformance = await this.kpiService.getRealtimePerformanceMetrics();

      return {
        success: true,
        data: realtimePerformance,
        message: 'Real-time performance metrics retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Error retrieving real-time performance:', error);
      throw error;
    }
  }

  // =============== HELPER METHODS (PRIVATE) ===============

  private async generateOperationalMetrics(filterDto: AnalyticsFilterDto): Promise<any> {
    // Implementation for generating operational metrics
    const [
      processMetrics,
      workflowMetrics,
      efficiencyMetrics,
      bottleneckAnalysis
    ] = await Promise.all([
      this.kpiService.getProcessMetrics(filterDto),
      this.kpiService.getWorkflowMetrics(filterDto),
      this.kpiService.getEfficiencyMetrics(filterDto),
      this.aiAnalyticsService.identifyBottlenecks(filterDto)
    ]);

    return {
      processMetrics,
      workflowMetrics,
      efficiencyMetrics,
      bottleneckAnalysis,
      recommendations: await this.aiAnalyticsService.generateOperationalRecommendations(filterDto)
    };
  }
}
