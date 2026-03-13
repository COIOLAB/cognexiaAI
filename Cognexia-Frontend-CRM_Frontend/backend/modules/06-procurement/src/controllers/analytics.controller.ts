// Industry 5.0 ERP Backend - Procurement Module
// AnalyticsController - Comprehensive procurement analytics and reporting
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { PurchaseRequisition } from '../entities/purchase-requisition.entity';
import { Vendor } from '../entities/vendor.entity';
import { RFQ } from '../entities/rfq.entity';
import { Bid } from '../entities/bid.entity';
import { Contract } from '../entities/contract.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { SupplierPerformanceMetric } from '../entities/supplier-performance-metric.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Services
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';
import { BiddingService } from '../services/bidding.service';
import { AuditLoggingService } from '../services/audit-logging.service';

// Guards
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcurementPermissionGuard } from '../guards/procurement-permission.guard';

interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  department?: string;
  category?: string;
  vendorId?: string;
  userId?: string;
}

interface DashboardMetrics {
  totalSpend: number;
  savingsAchieved: number;
  activeRequisitions: number;
  pendingApprovals: number;
  averageProcessingTime: number;
  complianceScore: number;
  topVendors: any[];
  spendByCategory: any[];
  monthlyTrends: any[];
}

@ApiTags('Procurement Analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProcurementPermissionGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly requisitionRepository: Repository<PurchaseRequisition>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(SupplierPerformanceMetric)
    private readonly performanceRepository: Repository<SupplierPerformanceMetric>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly analyticsService: AnalyticsDashboardService,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly requisitionService: PurchaseRequisitionService,
    private readonly biddingService: BiddingService,
    private readonly auditService: AuditLoggingService,
  ) {}

  // ==================== DASHBOARD ANALYTICS ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive procurement dashboard metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getDashboardMetrics(@Query() filters: AnalyticsFilters): Promise<DashboardMetrics> {
    try {
      this.logger.log('Generating comprehensive dashboard metrics');

      // Get metrics from different services
      const [
        requisitionMetrics,
        biddingMetrics,
        vendorMetrics,
        spendAnalysis,
        complianceMetrics,
      ] = await Promise.all([
        this.requisitionService.getRequisitionMetrics(filters),
        this.biddingService.getBiddingMetrics(filters),
        this.getVendorPerformanceMetrics(filters),
        this.getSpendAnalysis(filters),
        this.getComplianceMetrics(filters),
      ]);

      const dashboardMetrics: DashboardMetrics = {
        totalSpend: spendAnalysis.totalSpend || 0,
        savingsAchieved: biddingMetrics.financialMetrics?.savingsAchieved || 0,
        activeRequisitions: requisitionMetrics.byStatus?.PENDING_APPROVAL || 0,
        pendingApprovals: requisitionMetrics.byStatus?.PENDING_APPROVAL || 0,
        averageProcessingTime: requisitionMetrics.avgProcessingTime || 0,
        complianceScore: complianceMetrics.overallScore || 0,
        topVendors: vendorMetrics.topPerformers || [],
        spendByCategory: spendAnalysis.byCategory || [],
        monthlyTrends: spendAnalysis.monthlyTrends || [],
      };

      return dashboardMetrics;
    } catch (error) {
      this.logger.error('Error generating dashboard metrics', error.stack);
      throw new HttpException('Failed to generate dashboard metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get key performance indicators' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Query() filters: AnalyticsFilters) {
    try {
      this.logger.log('Calculating procurement KPIs');

      const kpis = await this.analyticsService.calculateKPIs(filters);

      return {
        filters,
        kpis,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error calculating KPIs', error.stack);
      throw new HttpException('Failed to calculate KPIs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== SPEND ANALYSIS ====================

  @Get('spend')
  @ApiOperation({ summary: 'Get comprehensive spend analysis' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'groupBy', required: false })
  @ApiResponse({ status: 200, description: 'Spend analysis retrieved successfully' })
  async getSpendAnalysis(@Query() filters: AnalyticsFilters & { groupBy?: string }) {
    try {
      this.logger.log('Generating spend analysis');

      // Calculate total spend from purchase orders
      const purchaseOrders = await this.purchaseOrderRepository.find();
      const totalSpend = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

      // Group spend by category, vendor, or department
      const groupBy = filters.groupBy || 'category';
      let spendBreakdown = {};
      let monthlyTrends = {};

      switch (groupBy) {
        case 'vendor':
          spendBreakdown = await this.getSpendByVendor(filters);
          break;
        case 'department':
          spendBreakdown = await this.getSpendByDepartment(filters);
          break;
        default:
          spendBreakdown = await this.getSpendByCategory(filters);
      }

      // Calculate monthly trends
      monthlyTrends = await this.getMonthlySpendTrends(filters);

      const analysis = {
        totalSpend,
        currency: 'USD', // This should come from system configuration
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        breakdown: spendBreakdown,
        monthlyTrends,
        topSpenders: await this.getTopSpenders(filters),
        savingsOpportunities: await this.identifySavingsOpportunities(filters),
        benchmarks: await this.getSpendBenchmarks(filters),
      };

      return analysis;
    } catch (error) {
      this.logger.error('Error generating spend analysis', error.stack);
      throw new HttpException('Failed to generate spend analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('spend/forecast')
  @ApiOperation({ summary: 'Get AI-powered spend forecast' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Spend forecast retrieved successfully' })
  async getSpendForecast(@Query('months') months: number = 6) {
    try {
      this.logger.log(`Generating ${months}-month spend forecast`);

      const forecast = await this.aiService.generateSpendForecast(months);

      return {
        forecastPeriod: months,
        forecast,
        generatedAt: new Date(),
        confidence: forecast.confidence || 0,
        methodology: 'AI-powered predictive analysis',
      };
    } catch (error) {
      this.logger.error('Error generating spend forecast', error.stack);
      throw new HttpException('Failed to generate spend forecast', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== VENDOR ANALYTICS ====================

  @Get('vendors/performance')
  @ApiOperation({ summary: 'Get vendor performance analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiResponse({ status: 200, description: 'Vendor performance analytics retrieved successfully' })
  async getVendorPerformanceMetrics(@Query() filters: AnalyticsFilters) {
    try {
      this.logger.log('Generating vendor performance analytics');

      const queryBuilder = this.performanceRepository.createQueryBuilder('metric')
        .leftJoinAndSelect('metric.vendor', 'vendor');

      // Apply filters
      if (filters.startDate) {
        queryBuilder.andWhere('metric.measurementDate >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        queryBuilder.andWhere('metric.measurementDate <= :endDate', { endDate: filters.endDate });
      }
      if (filters.vendorId) {
        queryBuilder.andWhere('metric.vendorId = :vendorId', { vendorId: filters.vendorId });
      }

      const metrics = await queryBuilder.getMany();

      // Calculate aggregated metrics
      const analytics = {
        totalVendors: new Set(metrics.map(m => m.vendorId)).size,
        averagePerformanceScore: this.calculateAverageScore(metrics, 'overallScore'),
        averageQualityScore: this.calculateAverageScore(metrics, 'qualityScore'),
        averageDeliveryScore: this.calculateAverageScore(metrics, 'deliveryScore'),
        topPerformers: await this.getTopPerformingVendors(metrics),
        performanceTrends: this.calculatePerformanceTrends(metrics),
        riskAnalysis: await this.getVendorRiskAnalysis(filters),
        complianceScore: this.calculateVendorCompliance(metrics),
      };

      return analytics;
    } catch (error) {
      this.logger.error('Error generating vendor performance analytics', error.stack);
      throw new HttpException('Failed to generate vendor performance analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vendors/comparison')
  @ApiOperation({ summary: 'Compare vendor performance' })
  @ApiResponse({ status: 200, description: 'Vendor comparison retrieved successfully' })
  async compareVendors(@Query('vendorIds') vendorIds: string) {
    try {
      const ids = vendorIds.split(',');
      this.logger.log(`Comparing vendors: ${ids.join(', ')}`);

      const comparison = await this.aiService.compareVendors(ids);

      return {
        vendorIds: ids,
        comparison,
        comparedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error comparing vendors', error.stack);
      throw new HttpException('Failed to compare vendors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== COMPLIANCE & AUDIT ANALYTICS ====================

  @Get('compliance')
  @ApiOperation({ summary: 'Get compliance analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Compliance analytics retrieved successfully' })
  async getComplianceMetrics(@Query() filters: AnalyticsFilters) {
    try {
      this.logger.log('Generating compliance analytics');

      const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = filters.endDate || new Date();

      const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);

      const metrics = {
        overallScore: this.calculateComplianceScore(complianceReport),
        violationCount: complianceReport.complianceViolations?.length || 0,
        auditTrailCompleteness: this.calculateAuditCompleteness(complianceReport),
        securityScore: this.calculateSecurityScore(complianceReport),
        dataIntegrityScore: complianceReport.dataIntegrityChecks?.issuesFound === 0 ? 100 : 80,
        recommendations: complianceReport.recommendations || [],
        trends: await this.getComplianceTrends(filters),
        criticalIssues: this.identifyCriticalComplianceIssues(complianceReport),
      };

      return metrics;
    } catch (error) {
      this.logger.error('Error generating compliance metrics', error.stack);
      throw new HttpException('Failed to generate compliance metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('audit/activity')
  @ApiOperation({ summary: 'Get audit activity analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Audit activity analytics retrieved successfully' })
  async getAuditActivity(@Query() filters: AnalyticsFilters) {
    try {
      this.logger.log('Generating audit activity analytics');

      const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = filters.endDate || new Date();

      const analytics = await this.auditService.getAuditAnalytics(startDate, endDate);

      return {
        filters: { startDate, endDate },
        analytics,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating audit activity analytics', error.stack);
      throw new HttpException('Failed to generate audit activity analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  @Get('predictions/demand')
  @ApiOperation({ summary: 'Get demand prediction analytics' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Demand predictions retrieved successfully' })
  async getDemandPredictions(
    @Query('category') category?: string,
    @Query('months') months: number = 3,
  ) {
    try {
      this.logger.log('Generating demand predictions');

      const predictions = await this.aiService.predictDemand({
        category,
        forecastPeriod: months,
      });

      return {
        category,
        forecastPeriod: months,
        predictions,
        generatedAt: new Date(),
        confidence: predictions.confidence || 0,
      };
    } catch (error) {
      this.logger.error('Error generating demand predictions', error.stack);
      throw new HttpException('Failed to generate demand predictions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('predictions/risks')
  @ApiOperation({ summary: 'Get risk prediction analytics' })
  @ApiResponse({ status: 200, description: 'Risk predictions retrieved successfully' })
  async getRiskPredictions() {
    try {
      this.logger.log('Generating risk predictions');

      const riskAnalysis = await this.aiService.analyzeProcurementRisks();

      return {
        riskAnalysis,
        generatedAt: new Date(),
        recommendations: riskAnalysis.recommendations || [],
      };
    } catch (error) {
      this.logger.error('Error generating risk predictions', error.stack);
      throw new HttpException('Failed to generate risk predictions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== CUSTOM REPORTS ====================

  @Post('reports/custom')
  @ApiOperation({ summary: 'Generate custom analytical report' })
  @ApiResponse({ status: 200, description: 'Custom report generated successfully' })
  async generateCustomReport(@Body() reportConfig: any) {
    try {
      this.logger.log('Generating custom analytical report');

      const report = await this.analyticsService.generateCustomReport(reportConfig);

      return {
        reportConfig,
        report,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating custom report', error.stack);
      throw new HttpException('Failed to generate custom report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export analytics data' })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'format', required: false })
  @ApiResponse({ status: 200, description: 'Analytics data exported successfully' })
  async exportAnalytics(
    @Query('type') type: string,
    @Query('format') format: string = 'JSON',
    @Query() filters: AnalyticsFilters,
  ) {
    try {
      this.logger.log(`Exporting ${type} analytics in ${format} format`);

      let data: any;

      switch (type) {
        case 'spend':
          data = await this.getSpendAnalysis(filters);
          break;
        case 'vendors':
          data = await this.getVendorPerformanceMetrics(filters);
          break;
        case 'compliance':
          data = await this.getComplianceMetrics(filters);
          break;
        case 'dashboard':
          data = await this.getDashboardMetrics(filters);
          break;
        default:
          throw new HttpException('Invalid export type', HttpStatus.BAD_REQUEST);
      }

      const exportData = {
        type,
        format,
        filters,
        data,
        exportedAt: new Date(),
        recordCount: Array.isArray(data) ? data.length : 1,
      };

      return exportData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error exporting analytics', error.stack);
      throw new HttpException('Failed to export analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== HELPER METHODS ====================

  private async getSpendByCategory(filters: AnalyticsFilters): Promise<any> {
    // Implementation would group purchase orders by category
    return {};
  }

  private async getSpendByVendor(filters: AnalyticsFilters): Promise<any> {
    // Implementation would group purchase orders by vendor
    return {};
  }

  private async getSpendByDepartment(filters: AnalyticsFilters): Promise<any> {
    // Implementation would group purchase orders by department
    return {};
  }

  private async getMonthlySpendTrends(filters: AnalyticsFilters): Promise<any> {
    // Implementation would calculate monthly spend trends
    return {};
  }

  private async getTopSpenders(filters: AnalyticsFilters): Promise<any[]> {
    // Implementation would identify top spending entities
    return [];
  }

  private async identifySavingsOpportunities(filters: AnalyticsFilters): Promise<any[]> {
    // Implementation would use AI to identify cost savings opportunities
    return [];
  }

  private async getSpendBenchmarks(filters: AnalyticsFilters): Promise<any> {
    // Implementation would provide industry benchmarks
    return {};
  }

  private calculateAverageScore(metrics: SupplierPerformanceMetric[], field: string): number {
    if (!metrics.length) return 0;
    const sum = metrics.reduce((total, metric) => total + (metric[field] || 0), 0);
    return Math.round((sum / metrics.length) * 100) / 100;
  }

  private async getTopPerformingVendors(metrics: SupplierPerformanceMetric[]): Promise<any[]> {
    const vendorScores = new Map();
    
    metrics.forEach(metric => {
      const vendorId = metric.vendorId;
      if (!vendorScores.has(vendorId)) {
        vendorScores.set(vendorId, { totalScore: 0, count: 0 });
      }
      const vendor = vendorScores.get(vendorId);
      vendor.totalScore += metric.overallScore || 0;
      vendor.count++;
    });

    return Array.from(vendorScores.entries())
      .map(([vendorId, data]) => ({
        vendorId,
        averageScore: Math.round((data.totalScore / data.count) * 100) / 100,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
  }

  private calculatePerformanceTrends(metrics: SupplierPerformanceMetric[]): any {
    // Implementation would calculate performance trends over time
    return {};
  }

  private async getVendorRiskAnalysis(filters: AnalyticsFilters): Promise<any> {
    // Implementation would analyze vendor risks
    return { highRiskVendors: 0, mediumRiskVendors: 0, lowRiskVendors: 0 };
  }

  private calculateVendorCompliance(metrics: SupplierPerformanceMetric[]): number {
    // Implementation would calculate compliance score
    return 85; // Placeholder
  }

  private calculateComplianceScore(report: any): number {
    const totalActions = report.totalActions || 1;
    const violations = report.complianceViolations?.length || 0;
    return Math.max(0, Math.round(((totalActions - violations) / totalActions) * 100));
  }

  private calculateAuditCompleteness(report: any): number {
    // Implementation would calculate audit trail completeness
    return 95; // Placeholder
  }

  private calculateSecurityScore(report: any): number {
    const securityEvents = report.securityEvents?.length || 0;
    const totalActions = report.totalActions || 1;
    return Math.max(0, Math.round(((totalActions - securityEvents) / totalActions) * 100));
  }

  private async getComplianceTrends(filters: AnalyticsFilters): Promise<any> {
    // Implementation would calculate compliance trends
    return {};
  }

  private identifyCriticalComplianceIssues(report: any): any[] {
    // Implementation would identify critical compliance issues
    return [];
  }
}
