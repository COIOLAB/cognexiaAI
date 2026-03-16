import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThan, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Supplier, 
  SupplierStatus, 
  SupplierType,
  RiskLevel as SupplierRiskLevel
} from '../entities/supplier.entity';
import { 
  PurchaseOrder, 
  OrderStatus, 
  OrderType,
  Priority as OrderPriority,
  Currency
} from '../entities/purchase-order.entity';
import { 
  Contract, 
  ContractStatus, 
  ContractType,
  RiskLevel as ContractRiskLevel
} from '../entities/contract.entity';
import { 
  RFQ, 
  RFQStatus,
  RFQType
} from '../entities/rfq.entity';
import { AIProcurementIntelligenceService } from './ai-procurement-intelligence.service';
import { RealTimeMarketIntelligenceService } from './real-time-market-intelligence.service';

export interface DashboardMetrics {
  timestamp: Date;
  period: {
    startDate: Date;
    endDate: Date;
    type: 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  
  // Financial Metrics
  financial: {
    totalSpend: number;
    budgetUtilization: number; // percentage
    costSavings: number;
    costAvoidance: number;
    averageOrderValue: number;
    spendVariance: number; // percentage vs budget
    paymentCompliance: number; // percentage
    currency: Currency;
    
    // Spend Distribution
    spendByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    }>;
    
    spendBySupplier: Array<{
      supplierId: string;
      supplierName: string;
      amount: number;
      percentage: number;
      orders: number;
    }>;
    
    spendByDepartment: Array<{
      department: string;
      amount: number;
      percentage: number;
      budgetVariance: number;
    }>;
  };
  
  // Operational Metrics
  operational: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageProcessingTime: number; // hours
    automationRate: number; // percentage
    exceptionRate: number; // percentage
    
    // Cycle Times
    cycleTimes: {
      requisitionToOrder: number; // days
      orderToDelivery: number; // days
      invoiceToPayment: number; // days
      overallCycleTime: number; // days
    };
    
    // Volume Trends
    volumeTrends: Array<{
      date: Date;
      orders: number;
      value: number;
      suppliers: number;
    }>;
  };
  
  // Quality and Performance Metrics
  performance: {
    overallScore: number; // 0-100
    supplierPerformance: number; // 0-100
    deliveryPerformance: number; // percentage on-time
    qualityRating: number; // 0-100
    complianceRate: number; // percentage
    
    // SLA Metrics
    slaMetrics: {
      responseTime: {
        target: number;
        actual: number;
        compliance: number; // percentage
      };
      deliveryTime: {
        target: number;
        actual: number;
        compliance: number; // percentage
      };
      qualityStandards: {
        target: number;
        actual: number;
        compliance: number; // percentage
      };
    };
    
    // Performance by Category
    categoryPerformance: Array<{
      category: string;
      performanceScore: number;
      deliveryCompliance: number;
      qualityScore: number;
      riskLevel: string;
    }>;
  };
  
  // Risk Metrics
  risk: {
    overallRiskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    
    // Risk Categories
    riskBreakdown: {
      financial: number;
      operational: number;
      strategic: number;
      compliance: number;
      market: number;
    };
    
    // Risk by Supplier
    supplierRisks: Array<{
      supplierId: string;
      supplierName: string;
      riskScore: number;
      riskLevel: string;
      criticalFactors: string[];
    }>;
    
    // Risk Trends
    riskTrends: Array<{
      date: Date;
      overallRisk: number;
      mitigatedRisks: number;
      newRisks: number;
    }>;
  };
  
  // Supplier Metrics
  supplier: {
    totalSuppliers: number;
    activeSuppliers: number;
    strategicSuppliers: number;
    newSuppliers: number;
    supplierDiversity: {
      smallBusiness: number;
      minorityOwned: number;
      womenOwned: number;
      localSuppliers: number;
    };
    
    // Supplier Distribution
    suppliersByRegion: Array<{
      region: string;
      count: number;
      percentage: number;
      spend: number;
    }>;
    
    suppliersByType: Array<{
      type: SupplierType;
      count: number;
      percentage: number;
      averagePerformance: number;
    }>;
    
    // Supplier Health
    supplierHealth: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
      critical: number;
    };
  };
  
  // Contract Metrics
  contracts: {
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number; // within 90 days
    contractValue: number;
    averageContractValue: number;
    
    // Contract Performance
    contractPerformance: {
      excellent: number;
      good: number;
      satisfactory: number;
      needsImprovement: number;
      poor: number;
    };
    
    // Contract Types
    contractsByType: Array<{
      type: ContractType;
      count: number;
      value: number;
      averagePerformance: number;
    }>;
    
    // Renewal Pipeline
    renewalPipeline: Array<{
      quarter: string;
      contractsExpiring: number;
      totalValue: number;
      renewalProbability: number;
    }>;
  };
  
  // Market Intelligence
  market: {
    priceVolatility: number; // percentage
    marketTrends: Array<{
      category: string;
      trend: 'increasing' | 'stable' | 'decreasing';
      priceChange: number; // percentage
      supplyRisk: string;
    }>;
    
    // Competitive Position
    competitivePosition: {
      overall: 'leading' | 'competitive' | 'lagging';
      pricePosition: 'below_market' | 'market_rate' | 'above_market';
      qualityPosition: 'above_average' | 'average' | 'below_average';
    };
    
    // Opportunities
    opportunities: Array<{
      category: string;
      opportunity: string;
      potential: number;
      effort: 'low' | 'medium' | 'high';
      timeline: string;
    }>;
  };
  
  // Sustainability Metrics
  sustainability: {
    overallScore: number; // 0-100
    carbonFootprint: number; // tons CO2e
    sustainableSpend: number; // amount
    sustainableSpendPercentage: number;
    
    // ESG Metrics
    esgMetrics: {
      environmental: number;
      social: number;
      governance: number;
    };
    
    // Supplier Sustainability
    supplierSustainability: {
      certified: number;
      assessed: number;
      improving: number;
      compliant: number;
    };
    
    // Sustainability Initiatives
    initiatives: Array<{
      initiative: string;
      impact: number;
      progress: number; // percentage
      timeline: string;
    }>;
  };
}

export interface AlertConfiguration {
  alertId: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'risk' | 'compliance' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Trigger Conditions
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    threshold: number | { min: number; max: number };
    duration?: number; // minutes
  };
  
  // Notification Settings
  notifications: {
    email: boolean;
    sms: boolean;
    dashboard: boolean;
    webhook?: string;
    recipients: string[];
  };
  
  // Action Triggers
  actions?: {
    autoExecute: boolean;
    actions: Array<{
      type: 'email' | 'workflow' | 'api_call' | 'escalation';
      configuration: Record<string, any>;
    }>;
  };
  
  isActive: boolean;
  createdBy: string;
  lastTriggered?: Date;
}

export interface DashboardAlert {
  alertId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  message: string;
  metric: {
    name: string;
    currentValue: number;
    threshold: number;
    variance: number;
  };
  affectedEntities: Array<{
    type: 'supplier' | 'contract' | 'order' | 'category';
    id: string;
    name: string;
  }>;
  recommendations: string[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface CustomReport {
  reportId: string;
  name: string;
  description: string;
  reportType: 'scheduled' | 'on_demand' | 'real_time';
  
  // Data Configuration
  dataConfig: {
    metrics: string[];
    dimensions: string[];
    filters: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    dateRange: {
      type: 'relative' | 'absolute';
      range: string | { start: Date; end: Date };
    };
    aggregation: {
      groupBy: string[];
      measures: Array<{
        field: string;
        function: 'sum' | 'avg' | 'count' | 'min' | 'max';
      }>;
    };
  };
  
  // Visualization Configuration
  visualization: {
    chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'table';
    layout: {
      width: number;
      height: number;
      position: { x: number; y: number };
    };
    styling: {
      colors: string[];
      theme: 'light' | 'dark';
      showLegend: boolean;
      showGrid: boolean;
    };
  };
  
  // Delivery Configuration
  delivery: {
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      time: string;
      timezone: string;
      recipients: string[];
    };
    format: 'pdf' | 'excel' | 'csv' | 'json';
    distribution: {
      email: boolean;
      portal: boolean;
      api: boolean;
    };
  };
  
  createdBy: string;
  isActive: boolean;
  lastGenerated?: Date;
}

export interface BenchmarkData {
  benchmarkId: string;
  category: string;
  region?: string;
  industry?: string;
  
  // Benchmark Metrics
  metrics: {
    costBenchmark: {
      percentile25: number;
      percentile50: number;
      percentile75: number;
      ourPosition: number;
      percentileRank: number;
    };
    
    performanceBenchmark: {
      deliveryTime: {
        industry: number;
        ourPerformance: number;
        variance: number;
      };
      qualityScore: {
        industry: number;
        ourScore: number;
        variance: number;
      };
      supplierCount: {
        industry: number;
        ourCount: number;
        variance: number;
      };
    };
    
    processEfficiency: {
      cycleTime: {
        industry: number;
        ourTime: number;
        variance: number;
      };
      automationLevel: {
        industry: number;
        ourLevel: number;
        variance: number;
      };
      costPerTransaction: {
        industry: number;
        ourCost: number;
        variance: number;
      };
    };
  };
  
  // Improvement Opportunities
  opportunities: Array<{
    area: string;
    gap: number;
    potential: string;
    recommendations: string[];
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  
  lastUpdated: Date;
  dataSource: string;
}

@Injectable()
export class AnalyticsDashboardService {
  private readonly logger = new Logger(AnalyticsDashboardService.name);
  private readonly supabase: SupabaseClient;
  private dashboardCache: Map<string, any> = new Map();
  private alertConfigurations: Map<string, AlertConfiguration> = new Map();
  private activeAlerts: Map<string, DashboardAlert> = new Map();

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private aiIntelligenceService: AIProcurementIntelligenceService,
    private marketIntelligenceService: RealTimeMarketIntelligenceService,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(RFQ)
    private rfqRepository: Repository<RFQ>
  ) {
    // Initialize Supabase client
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_ANON_KEY')
    );

    // Initialize alert configurations
    this.initializeDefaultAlerts();
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(
    timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month',
    options?: {
      refreshCache?: boolean;
      includePredictions?: boolean;
      includeComparisons?: boolean;
      departments?: string[];
      categories?: string[];
    }
  ): Promise<DashboardMetrics> {
    try {
      this.logger.log(`Generating dashboard metrics for ${timeframe}`);

      const cacheKey = `dashboard_metrics_${timeframe}_${JSON.stringify(options)}`;
      
      // Check cache if not forcing refresh
      if (!options?.refreshCache && this.dashboardCache.has(cacheKey)) {
        const cachedData = this.dashboardCache.get(cacheKey);
        if (cachedData.timestamp > new Date(Date.now() - 5 * 60 * 1000)) { // 5 minutes cache
          return cachedData.data;
        }
      }

      const { startDate, endDate } = this.getDateRange(timeframe);

      // Calculate financial metrics
      const financial = await this.calculateFinancialMetrics(startDate, endDate, options);

      // Calculate operational metrics
      const operational = await this.calculateOperationalMetrics(startDate, endDate, options);

      // Calculate performance metrics
      const performance = await this.calculatePerformanceMetrics(startDate, endDate, options);

      // Calculate risk metrics
      const risk = await this.calculateRiskMetrics(startDate, endDate, options);

      // Calculate supplier metrics
      const supplier = await this.calculateSupplierMetrics(startDate, endDate, options);

      // Calculate contract metrics
      const contracts = await this.calculateContractMetrics(startDate, endDate, options);

      // Get market intelligence
      const market = await this.getMarketMetrics(options);

      // Calculate sustainability metrics
      const sustainability = await this.calculateSustainabilityMetrics(startDate, endDate, options);

      const dashboardMetrics: DashboardMetrics = {
        timestamp: new Date(),
        period: { startDate, endDate, type: timeframe },
        financial,
        operational,
        performance,
        risk,
        supplier,
        contracts,
        market,
        sustainability,
      };

      // Cache results
      this.dashboardCache.set(cacheKey, {
        timestamp: new Date(),
        data: dashboardMetrics,
      });

      // Store metrics in Supabase for historical analysis
      await this.storeDashboardMetrics(dashboardMetrics);

      // Check for alerts
      await this.checkMetricAlerts(dashboardMetrics);

      this.logger.log('Dashboard metrics generated successfully');
      return dashboardMetrics;
    } catch (error) {
      this.logger.error('Dashboard metrics generation failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard alerts
   */
  async getDashboardAlerts(
    severity?: 'low' | 'medium' | 'high' | 'critical',
    category?: string,
    unacknowledgedOnly: boolean = false
  ): Promise<DashboardAlert[]> {
    try {
      this.logger.log('Fetching dashboard alerts');

      let alerts = Array.from(this.activeAlerts.values());

      // Apply filters
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }

      if (category) {
        alerts = alerts.filter(alert => alert.category === category);
      }

      if (unacknowledgedOnly) {
        alerts = alerts.filter(alert => !alert.acknowledged);
      }

      // Sort by severity and timestamp
      alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch dashboard alerts:', error);
      throw error;
    }
  }

  /**
   * Create custom report configuration
   */
  async createCustomReport(reportConfig: Omit<CustomReport, 'reportId' | 'createdBy' | 'isActive'>): Promise<CustomReport> {
    try {
      this.logger.log(`Creating custom report: ${reportConfig.name}`);

      const report: CustomReport = {
        ...reportConfig,
        reportId: `RPT-${Date.now()}`,
        createdBy: 'system', // Would come from authenticated user
        isActive: true,
      };

      // Validate report configuration
      await this.validateReportConfig(report);

      // Store report configuration
      await this.storeReportConfig(report);

      // If scheduled report, set up cron job
      if (report.reportType === 'scheduled' && report.delivery.schedule) {
        await this.scheduleReport(report);
      }

      this.logger.log(`Custom report created: ${report.reportId}`);
      return report;
    } catch (error) {
      this.logger.error('Custom report creation failed:', error);
      throw error;
    }
  }

  /**
   * Generate custom report data
   */
  async generateCustomReport(reportId: string): Promise<{
    reportId: string;
    generatedAt: Date;
    data: any[];
    metadata: {
      totalRows: number;
      executionTime: number;
      dataQuality: number;
    };
    visualizations?: any[];
  }> {
    try {
      this.logger.log(`Generating custom report: ${reportId}`);

      const startTime = Date.now();

      // Get report configuration
      const reportConfig = await this.getReportConfig(reportId);
      if (!reportConfig) {
        throw new Error('Report configuration not found');
      }

      // Execute data query
      const data = await this.executeReportQuery(reportConfig);

      // Generate visualizations if required
      const visualizations = await this.generateReportVisualizations(reportConfig, data);

      const executionTime = Date.now() - startTime;

      const result = {
        reportId,
        generatedAt: new Date(),
        data,
        metadata: {
          totalRows: data.length,
          executionTime,
          dataQuality: this.calculateDataQuality(data),
        },
        visualizations,
      };

      // Update last generated timestamp
      await this.updateReportLastGenerated(reportId);

      // Distribute report if configured
      if (reportConfig.delivery.distribution) {
        await this.distributeReport(reportConfig, result);
      }

      this.logger.log(`Custom report generated: ${reportId}`);
      return result;
    } catch (error) {
      this.logger.error('Custom report generation failed:', error);
      throw error;
    }
  }

  /**
   * Get industry benchmarks
   */
  async getBenchmarkData(
    category: string,
    region?: string,
    industry?: string
  ): Promise<BenchmarkData> {
    try {
      this.logger.log(`Fetching benchmark data for category: ${category}`);

      // Get our current metrics
      const ourMetrics = await this.getOurCategoryMetrics(category);

      // Get industry benchmarks (mock data - would integrate with real benchmark providers)
      const industryBenchmarks = await this.getIndustryBenchmarks(category, region, industry);

      // Calculate benchmark comparisons
      const benchmarkData = await this.calculateBenchmarkComparisons(ourMetrics, industryBenchmarks);

      // Identify improvement opportunities
      const opportunities = await this.identifyBenchmarkOpportunities(benchmarkData);

      const result: BenchmarkData = {
        benchmarkId: `BM-${category}-${Date.now()}`,
        category,
        region,
        industry,
        metrics: benchmarkData,
        opportunities,
        lastUpdated: new Date(),
        dataSource: 'Industry Analysis Platform',
      };

      // Store benchmark data
      await this.storeBenchmarkData(result);

      this.logger.log(`Benchmark data generated for category: ${category}`);
      return result;
    } catch (error) {
      this.logger.error('Benchmark data generation failed:', error);
      throw error;
    }
  }

  /**
   * Configure dashboard alert
   */
  async configureAlert(alertConfig: Omit<AlertConfiguration, 'alertId'>): Promise<AlertConfiguration> {
    try {
      this.logger.log(`Configuring alert: ${alertConfig.name}`);

      const alert: AlertConfiguration = {
        ...alertConfig,
        alertId: `ALT-${Date.now()}`,
      };

      // Validate alert configuration
      await this.validateAlertConfig(alert);

      // Store alert configuration
      this.alertConfigurations.set(alert.alertId, alert);
      await this.storeAlertConfig(alert);

      this.logger.log(`Alert configured: ${alert.alertId}`);
      return alert;
    } catch (error) {
      this.logger.error('Alert configuration failed:', error);
      throw error;
    }
  }

  /**
   * Continuous metrics monitoring and alerting
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorMetricsAndAlerts(): Promise<void> {
    try {
      this.logger.log('Monitoring metrics and checking alerts');

      // Get current metrics snapshot
      const currentMetrics = await this.getDashboardMetrics('day', { refreshCache: true });

      // Check all active alert configurations
      for (const [alertId, alertConfig] of this.alertConfigurations) {
        if (!alertConfig.isActive) continue;

        try {
          await this.evaluateAlert(alertConfig, currentMetrics);
        } catch (error) {
          this.logger.error(`Failed to evaluate alert ${alertId}:`, error);
        }
      }

      // Clean up old alerts
      await this.cleanupOldAlerts();

      this.logger.log('Metrics monitoring completed');
    } catch (error) {
      this.logger.error('Metrics monitoring failed:', error);
    }
  }

  /**
   * Generate scheduled reports
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports(): Promise<void> {
    try {
      this.logger.log('Processing scheduled reports');

      // Get scheduled reports due for generation
      const dueReports = await this.getDueScheduledReports();

      for (const report of dueReports) {
        try {
          await this.generateCustomReport(report.reportId);
        } catch (error) {
          this.logger.error(`Failed to generate scheduled report ${report.reportId}:`, error);
        }
      }

      this.logger.log('Scheduled reports processed');
    } catch (error) {
      this.logger.error('Scheduled reports processing failed:', error);
    }
  }

  /**
   * Export dashboard data in various formats
   */
  async exportDashboardData(
    format: 'excel' | 'pdf' | 'csv' | 'json',
    options: {
      timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year';
      sections?: string[];
      includeCharts?: boolean;
      template?: string;
    }
  ): Promise<{
    fileName: string;
    fileUrl: string;
    format: string;
    size: number;
    generatedAt: Date;
  }> {
    try {
      this.logger.log(`Exporting dashboard data in ${format} format`);

      // Get dashboard metrics
      const metrics = await this.getDashboardMetrics(options.timeframe || 'month');

      // Generate export file
      const exportResult = await this.generateExportFile(metrics, format, options);

      // Store file and generate URL
      const fileUrl = await this.storeExportFile(exportResult);

      const result = {
        fileName: exportResult.fileName,
        fileUrl,
        format,
        size: exportResult.size,
        generatedAt: new Date(),
      };

      this.logger.log(`Dashboard data exported: ${exportResult.fileName}`);
      return result;
    } catch (error) {
      this.logger.error('Dashboard data export failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private getDateRange(timeframe: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  private async calculateFinancialMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['financial']> {
    // Get purchase orders in date range
    const orders = await this.purchaseOrderRepository.find({
      where: {
        createdDate: Between(startDate, endDate),
        status: In([OrderStatus.COMPLETED, OrderStatus.DELIVERED]),
      },
      relations: ['supplier'],
    });

    const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalSpend / orders.length : 0;

    // Calculate spend by category
    const categorySpend = new Map<string, number>();
    orders.forEach(order => {
      order.lineItems?.forEach(item => {
        const current = categorySpend.get(item.category) || 0;
        categorySpend.set(item.category, current + item.totalPrice);
      });
    });

    const spendByCategory = Array.from(categorySpend.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalSpend) * 100,
      trend: 'stable' as const,
    }));

    // Calculate spend by supplier
    const supplierSpend = new Map<string, { amount: number; orders: number; name: string }>();
    orders.forEach(order => {
      const current = supplierSpend.get(order.supplierId) || { amount: 0, orders: 0, name: order.supplier?.companyName || 'Unknown' };
      supplierSpend.set(order.supplierId, {
        amount: current.amount + order.totalAmount,
        orders: current.orders + 1,
        name: current.name,
      });
    });

    const spendBySupplier = Array.from(supplierSpend.entries()).map(([supplierId, data]) => ({
      supplierId,
      supplierName: data.name,
      amount: data.amount,
      percentage: (data.amount / totalSpend) * 100,
      orders: data.orders,
    }));

    return {
      totalSpend,
      budgetUtilization: 85, // Mock data
      costSavings: totalSpend * 0.12, // Mock 12% savings
      costAvoidance: totalSpend * 0.08, // Mock 8% cost avoidance
      averageOrderValue,
      spendVariance: 3.2, // Mock variance
      paymentCompliance: 94.5, // Mock compliance rate
      currency: Currency.USD,
      spendByCategory,
      spendBySupplier,
      spendByDepartment: [], // Would be populated with actual data
    };
  }

  private async calculateOperationalMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['operational']> {
    const orders = await this.purchaseOrderRepository.find({
      where: { createdDate: Between(startDate, endDate) },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

    // Calculate average processing time
    const completedWithDates = orders.filter(o => 
      o.status === OrderStatus.COMPLETED && o.completedDate && o.createdDate
    );
    
    const averageProcessingTime = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, order) => {
          const processingTime = (order.completedDate!.getTime() - order.createdDate.getTime()) / (1000 * 60 * 60);
          return sum + processingTime;
        }, 0) / completedWithDates.length
      : 0;

    // Generate volume trends (simplified)
    const volumeTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(o => 
        o.createdDate.toDateString() === date.toDateString()
      );
      
      volumeTrends.push({
        date,
        orders: dayOrders.length,
        value: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        suppliers: new Set(dayOrders.map(o => o.supplierId)).size,
      });
    }

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      averageProcessingTime,
      automationRate: 68.5, // Mock automation rate
      exceptionRate: 8.2, // Mock exception rate
      cycleTimes: {
        requisitionToOrder: 2.3,
        orderToDelivery: 7.8,
        invoiceToPayment: 5.2,
        overallCycleTime: 15.3,
      },
      volumeTrends,
    };
  }

  private async calculatePerformanceMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['performance']> {
    const orders = await this.purchaseOrderRepository.find({
      where: { 
        createdDate: Between(startDate, endDate),
        status: In([OrderStatus.COMPLETED, OrderStatus.DELIVERED]),
      },
    });

    // Calculate delivery performance
    const onTimeDeliveries = orders.filter(order => {
      if (!order.deliveryInfo?.requestedDate || !order.deliveryInfo?.actualDeliveryDate) return false;
      return order.deliveryInfo.actualDeliveryDate <= order.deliveryInfo.requestedDate;
    }).length;

    const deliveryPerformance = orders.length > 0 ? (onTimeDeliveries / orders.length) * 100 : 0;

    return {
      overallScore: 82.4,
      supplierPerformance: 85.7,
      deliveryPerformance,
      qualityRating: 88.3,
      complianceRate: 91.2,
      slaMetrics: {
        responseTime: {
          target: 24,
          actual: 18.5,
          compliance: 95.2,
        },
        deliveryTime: {
          target: 168,
          actual: 156.8,
          compliance: 87.3,
        },
        qualityStandards: {
          target: 95,
          actual: 88.3,
          compliance: 92.9,
        },
      },
      categoryPerformance: [], // Would be populated with actual data
    };
  }

  private async calculateRiskMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['risk']> {
    const suppliers = await this.supplierRepository.find({
      where: { status: SupplierStatus.ACTIVE },
    });

    const contracts = await this.contractRepository.find({
      where: { status: ContractStatus.ACTIVE },
    });

    // Calculate overall risk score
    const supplierRisks = suppliers.map(supplier => ({
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      riskScore: supplier.riskScore || 0,
      riskLevel: supplier.riskLevel?.toLowerCase() || 'medium',
      criticalFactors: supplier.riskFactors || [],
    }));

    const averageSupplierRisk = supplierRisks.length > 0 
      ? supplierRisks.reduce((sum, s) => sum + s.riskScore, 0) / supplierRisks.length
      : 0;

    const contractRisks = contracts.map(c => c.riskScore || 0);
    const averageContractRisk = contractRisks.length > 0 
      ? contractRisks.reduce((sum, r) => sum + r, 0) / contractRisks.length
      : 0;

    const overallRiskScore = (averageSupplierRisk + averageContractRisk) / 2;

    return {
      overallRiskScore,
      riskLevel: overallRiskScore >= 70 ? 'critical' : 
                overallRiskScore >= 50 ? 'high' :
                overallRiskScore >= 30 ? 'medium' : 'low',
      riskBreakdown: {
        financial: 35.2,
        operational: 42.8,
        strategic: 28.6,
        compliance: 15.9,
        market: 38.4,
      },
      supplierRisks,
      riskTrends: [], // Would be populated with historical data
    };
  }

  private async calculateSupplierMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['supplier']> {
    const suppliers = await this.supplierRepository.find();
    const activeSuppliers = suppliers.filter(s => s.status === SupplierStatus.ACTIVE);
    const strategicSuppliers = suppliers.filter(s => s.strategicSupplier);
    const newSuppliers = suppliers.filter(s => 
      s.createdDate >= startDate && s.createdDate <= endDate
    );

    // Calculate supplier distribution by region
    const regionCounts = new Map<string, { count: number; spend: number }>();
    activeSuppliers.forEach(supplier => {
      const current = regionCounts.get(supplier.region) || { count: 0, spend: 0 };
      regionCounts.set(supplier.region, {
        count: current.count + 1,
        spend: current.spend + (supplier.totalSpend || 0),
      });
    });

    const totalSupplierSpend = activeSuppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);

    const suppliersByRegion = Array.from(regionCounts.entries()).map(([region, data]) => ({
      region,
      count: data.count,
      percentage: (data.count / activeSuppliers.length) * 100,
      spend: data.spend,
    }));

    // Calculate supplier health distribution
    const supplierHealth = {
      excellent: suppliers.filter(s => (s.overallScore || 0) >= 90).length,
      good: suppliers.filter(s => (s.overallScore || 0) >= 80 && (s.overallScore || 0) < 90).length,
      average: suppliers.filter(s => (s.overallScore || 0) >= 70 && (s.overallScore || 0) < 80).length,
      poor: suppliers.filter(s => (s.overallScore || 0) >= 60 && (s.overallScore || 0) < 70).length,
      critical: suppliers.filter(s => (s.overallScore || 0) < 60).length,
    };

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: activeSuppliers.length,
      strategicSuppliers: strategicSuppliers.length,
      newSuppliers: newSuppliers.length,
      supplierDiversity: {
        smallBusiness: 45, // Mock data
        minorityOwned: 23,
        womenOwned: 31,
        localSuppliers: 67,
      },
      suppliersByRegion,
      suppliersByType: [], // Would be populated with actual data
      supplierHealth,
    };
  }

  private async calculateContractMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['contracts']> {
    const contracts = await this.contractRepository.find();
    const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE);
    
    // Contracts expiring within 90 days
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const expiringContracts = activeContracts.filter(c => 
      c.expiryDate <= ninetyDaysFromNow
    );

    const totalContractValue = activeContracts.reduce((sum, c) => sum + c.totalValue, 0);
    const averageContractValue = activeContracts.length > 0 ? totalContractValue / activeContracts.length : 0;

    // Contract performance distribution
    const contractPerformance = {
      excellent: contracts.filter(c => c.getPerformanceRating() === 'excellent').length,
      good: contracts.filter(c => c.getPerformanceRating() === 'good').length,
      satisfactory: contracts.filter(c => c.getPerformanceRating() === 'satisfactory').length,
      needsImprovement: contracts.filter(c => c.getPerformanceRating() === 'needs_improvement').length,
      poor: contracts.filter(c => c.getPerformanceRating() === 'poor').length,
    };

    return {
      totalContracts: contracts.length,
      activeContracts: activeContracts.length,
      expiringContracts: expiringContracts.length,
      contractValue: totalContractValue,
      averageContractValue,
      contractPerformance,
      contractsByType: [], // Would be populated with actual data
      renewalPipeline: [], // Would be populated with actual data
    };
  }

  private async getMarketMetrics(options?: any): Promise<DashboardMetrics['market']> {
    // Get market intelligence from the market service
    const categories = ['Electronics', 'Software', 'Services']; // Mock categories
    
    const marketTrends = [];
    for (const category of categories) {
      try {
        const intelligence = await this.marketIntelligenceService.getMarketIntelligence(category);
        marketTrends.push({
          category,
          trend: intelligence.pricing.priceTrends,
          priceChange: Math.random() * 20 - 10, // Mock price change
          supplyRisk: intelligence.risks.supplyRisks[0] || 'Low',
        });
      } catch (error) {
        // Use mock data if market intelligence fails
        marketTrends.push({
          category,
          trend: 'stable' as const,
          priceChange: Math.random() * 10 - 5,
          supplyRisk: 'Medium',
        });
      }
    }

    return {
      priceVolatility: 12.5,
      marketTrends,
      competitivePosition: {
        overall: 'competitive',
        pricePosition: 'market_rate',
        qualityPosition: 'above_average',
      },
      opportunities: [], // Would be populated with actual opportunities
    };
  }

  private async calculateSustainabilityMetrics(startDate: Date, endDate: Date, options?: any): Promise<DashboardMetrics['sustainability']> {
    const suppliers = await this.supplierRepository.find({
      where: { status: SupplierStatus.ACTIVE },
    });

    // Mock sustainability calculations
    const sustainableSuppliers = suppliers.filter(s => 
      s.sustainabilityMetrics && s.sustainabilityMetrics.esgScore >= 70
    );

    const totalSpend = suppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);
    const sustainableSpend = sustainableSuppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);

    return {
      overallScore: 73.2,
      carbonFootprint: 1250.8,
      sustainableSpend,
      sustainableSpendPercentage: (sustainableSpend / totalSpend) * 100,
      esgMetrics: {
        environmental: 75.4,
        social: 68.9,
        governance: 82.1,
      },
      supplierSustainability: {
        certified: sustainableSuppliers.length,
        assessed: suppliers.length,
        improving: Math.floor(suppliers.length * 0.65),
        compliant: Math.floor(suppliers.length * 0.78),
      },
      initiatives: [], // Would be populated with actual initiatives
    };
  }

  // Additional helper methods with mock implementations
  private async checkMetricAlerts(metrics: DashboardMetrics): Promise<void> {}
  private async storeDashboardMetrics(metrics: DashboardMetrics): Promise<void> {}
  private async validateReportConfig(report: CustomReport): Promise<void> {}
  private async storeReportConfig(report: CustomReport): Promise<void> {}
  private async scheduleReport(report: CustomReport): Promise<void> {}
  private async getReportConfig(reportId: string): Promise<CustomReport | null> { return null; }
  private async executeReportQuery(config: CustomReport): Promise<any[]> { return []; }
  private async generateReportVisualizations(config: CustomReport, data: any[]): Promise<any[]> { return []; }
  private calculateDataQuality(data: any[]): number { return 95.5; }
  private async updateReportLastGenerated(reportId: string): Promise<void> {}
  private async distributeReport(config: CustomReport, result: any): Promise<void> {}
  private async getOurCategoryMetrics(category: string): Promise<any> { return {}; }
  private async getIndustryBenchmarks(category: string, region?: string, industry?: string): Promise<any> { return {}; }
  private async calculateBenchmarkComparisons(ourMetrics: any, industryBenchmarks: any): Promise<any> { return {}; }
  private async identifyBenchmarkOpportunities(benchmarkData: any): Promise<any[]> { return []; }
  private async storeBenchmarkData(data: BenchmarkData): Promise<void> {}
  private async validateAlertConfig(alert: AlertConfiguration): Promise<void> {}
  private async storeAlertConfig(alert: AlertConfiguration): Promise<void> {}
  private async evaluateAlert(config: AlertConfiguration, metrics: DashboardMetrics): Promise<void> {}
  private async cleanupOldAlerts(): Promise<void> {}
  private async getDueScheduledReports(): Promise<CustomReport[]> { return []; }
  private async generateExportFile(metrics: DashboardMetrics, format: string, options: any): Promise<any> { return {}; }
  private async storeExportFile(exportResult: any): Promise<string> { return 'http://example.com/file.pdf'; }
  
  private initializeDefaultAlerts(): void {
    // Initialize default alert configurations
    const defaultAlerts: AlertConfiguration[] = [
      {
        alertId: 'budget-overrun',
        name: 'Budget Overrun Alert',
        description: 'Alert when budget utilization exceeds threshold',
        category: 'financial',
        severity: 'high',
        conditions: {
          metric: 'financial.budgetUtilization',
          operator: 'gt',
          threshold: 90,
        },
        notifications: {
          email: true,
          sms: false,
          dashboard: true,
          recipients: ['procurement@company.com'],
        },
        isActive: true,
        createdBy: 'system',
      },
      {
        alertId: 'supplier-risk',
        name: 'High Supplier Risk Alert',
        description: 'Alert when supplier risk score is critical',
        category: 'risk',
        severity: 'critical',
        conditions: {
          metric: 'risk.overallRiskScore',
          operator: 'gt',
          threshold: 80,
        },
        notifications: {
          email: true,
          sms: true,
          dashboard: true,
          recipients: ['risk@company.com', 'procurement@company.com'],
        },
        isActive: true,
        createdBy: 'system',
      },
    ];

    defaultAlerts.forEach(alert => {
      this.alertConfigurations.set(alert.alertId, alert);
    });
  }
}
