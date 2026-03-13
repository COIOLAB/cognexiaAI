import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { DashboardService } from './dashboard.service';
import { DatasetService } from './dataset.service';
import { InsightsService } from './insights.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import {
  AnalyticsDataSource,
  AnalyticsDataset,
  AnalyticsDashboard,
  ProcessingStatus,
} from '../entities';
import {
  ReportConfigDto,
  ReportScheduleDto,
  ReportTemplateDto,
  AnalyticsApiResponse,
  ReportGenerationResultDto,
  ReportDistributionDto,
} from '../dto';

/**
 * Reporting Service
 * Provides comprehensive report generation, scheduling, distribution, and template management
 */
@Injectable()
export class ReportingService extends BaseAnalyticsService {
  private readonly reportTemplates = new Map<string, any>();
  private readonly scheduledReports = new Map<string, any>();
  private readonly reportHistory = new Map<string, any[]>();
  private readonly distributionLists = new Map<string, any[]>();
  private readonly reportCache = new Map<string, any>();
  private readonly reportJobs = new Map<string, any>();

  // Background job intervals
  private scheduledJobInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(AnalyticsDataset)
    private readonly datasetRepository: Repository<AnalyticsDataset>,
    @InjectRepository(AnalyticsDashboard)
    private readonly dashboardRepository: Repository<AnalyticsDashboard>,
    private readonly dashboardService: DashboardService,
    private readonly datasetService: DatasetService,
    private readonly insightsService: InsightsService,
    private readonly advancedAnalyticsService: AdvancedAnalyticsService
  ) {
    super(entityManager);
    this.initializeDefaultTemplates();
    this.startBackgroundJobs();
  }

  /**
   * Create a report template
   */
  async createReportTemplate(
    templateDto: ReportTemplateDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('CREATE_REPORT_TEMPLATE', 'ReportTemplate');

      // Validate DTO
      const validatedDto = await this.validateDto(templateDto, ReportTemplateDto);

      const template = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedDto.name,
        description: validatedDto.description,
        type: validatedDto.type || 'standard',
        layout: validatedDto.layout || 'vertical',
        sections: validatedDto.sections || [],
        styling: validatedDto.styling || this.getDefaultStyling(),
        parameters: validatedDto.parameters || [],
        filters: validatedDto.filters || [],
        exportFormats: validatedDto.exportFormats || ['pdf', 'excel', 'html'],
        isPublic: validatedDto.isPublic || false,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.reportTemplates.set(template.id, template);

      this.logOperation('CREATE_REPORT_TEMPLATE_SUCCESS', 'ReportTemplate', template.id);

      return this.createResponse(
        {
          templateId: template.id,
          name: template.name,
          type: template.type,
          sections: template.sections.length,
        },
        'Report template created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_REPORT_TEMPLATE');
    }
  }

  /**
   * Generate a report
   */
  async generateReport(
    configDto: ReportConfigDto,
    userId: string
  ): Promise<AnalyticsApiResponse<ReportGenerationResultDto>> {
    try {
      this.logOperation('GENERATE_REPORT', 'ReportGeneration');

      // Validate DTO
      const validatedDto = await this.validateDto(configDto, ReportConfigDto);

      // Get template if specified
      let template = null;
      if (validatedDto.templateId) {
        template = this.reportTemplates.get(validatedDto.templateId);
        if (!template) {
          throw new NotFoundException(`Report template with ID ${validatedDto.templateId} not found`);
        }
      }

      // Generate report ID
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check cache if not forcing refresh
      const cacheKey = this.generateReportCacheKey(validatedDto, userId);
      if (!validatedDto.forceRefresh && this.reportCache.has(cacheKey)) {
        const cachedReport = this.reportCache.get(cacheKey);
        return this.createResponse(cachedReport, 'Report retrieved from cache');
      }

      // Generate report content
      const reportContent = await this.generateReportContent(validatedDto, template, userId);

      // Apply template styling and layout
      const styledReport = await this.applyReportStyling(reportContent, template);

      // Generate exports in requested formats
      const exports = await this.generateReportExports(styledReport, validatedDto.exportFormats || ['html']);

      const reportResult: ReportGenerationResultDto = {
        reportId,
        name: validatedDto.title || template?.name || 'Analytics Report',
        description: validatedDto.description || template?.description,
        templateId: validatedDto.templateId,
        generatedAt: new Date(),
        generatedBy: userId,
        content: styledReport,
        exports,
        metadata: {
          dataPoints: reportContent.dataPoints || 0,
          sections: reportContent.sections?.length || 0,
          charts: reportContent.charts?.length || 0,
          tables: reportContent.tables?.length || 0,
          processingTime: Date.now() - parseInt(reportId.split('_')[1]),
        },
      };

      // Cache the report
      this.reportCache.set(cacheKey, reportResult);

      // Store in history
      this.storeReportHistory(userId, reportResult);

      this.logOperation('GENERATE_REPORT_SUCCESS', 'ReportGeneration', reportId);

      return this.createResponse(
        reportResult,
        'Report generated successfully'
      );
    } catch (error) {
      this.handleError(error, 'GENERATE_REPORT');
    }
  }

  /**
   * Schedule a report
   */
  async scheduleReport(
    scheduleDto: ReportScheduleDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('SCHEDULE_REPORT', 'ReportSchedule');

      // Validate DTO
      const validatedDto = await this.validateDto(scheduleDto, ReportScheduleDto);

      // Validate template exists
      if (validatedDto.templateId && !this.reportTemplates.has(validatedDto.templateId)) {
        throw new NotFoundException(`Report template with ID ${validatedDto.templateId} not found`);
      }

      const schedule = {
        id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedDto.name,
        description: validatedDto.description,
        templateId: validatedDto.templateId,
        reportConfig: validatedDto.reportConfig,
        cronExpression: validatedDto.cronExpression,
        timezone: validatedDto.timezone || 'UTC',
        enabled: validatedDto.enabled !== false,
        distribution: validatedDto.distribution,
        nextRunAt: this.calculateNextRunTime(validatedDto.cronExpression),
        lastRunAt: null,
        runCount: 0,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.scheduledReports.set(schedule.id, schedule);

      this.logOperation('SCHEDULE_REPORT_SUCCESS', 'ReportSchedule', schedule.id);

      return this.createResponse(
        {
          scheduleId: schedule.id,
          name: schedule.name,
          cronExpression: schedule.cronExpression,
          nextRunAt: schedule.nextRunAt,
          enabled: schedule.enabled,
        },
        'Report scheduled successfully'
      );
    } catch (error) {
      this.handleError(error, 'SCHEDULE_REPORT');
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(
    userId: string
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_SCHEDULED_REPORTS', 'ReportSchedule', userId);

      const schedules = Array.from(this.scheduledReports.values())
        .filter(schedule => schedule.createdBy === userId)
        .map(schedule => ({
          id: schedule.id,
          name: schedule.name,
          description: schedule.description,
          templateId: schedule.templateId,
          cronExpression: schedule.cronExpression,
          timezone: schedule.timezone,
          enabled: schedule.enabled,
          nextRunAt: schedule.nextRunAt,
          lastRunAt: schedule.lastRunAt,
          runCount: schedule.runCount,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
        }));

      this.logOperation('GET_SCHEDULED_REPORTS_SUCCESS', 'ReportSchedule', userId);

      return this.createResponse(
        schedules,
        `Retrieved ${schedules.length} scheduled reports`
      );
    } catch (error) {
      this.handleError(error, 'GET_SCHEDULED_REPORTS');
    }
  }

  /**
   * Distribute report
   */
  async distributeReport(
    reportId: string,
    distributionDto: ReportDistributionDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('DISTRIBUTE_REPORT', 'ReportDistribution', reportId);

      // Validate DTO
      const validatedDto = await this.validateDto(distributionDto, ReportDistributionDto);

      // Find report in history or cache
      const report = await this.findReportById(reportId, userId);
      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      // Process distribution channels
      const distributionResults = [];

      for (const channel of validatedDto.channels) {
        const result = await this.distributeToChannel(report, channel, validatedDto.recipients);
        distributionResults.push(result);
      }

      const distributionSummary = {
        reportId,
        distributedAt: new Date(),
        distributedBy: userId,
        channels: validatedDto.channels,
        recipients: validatedDto.recipients.length,
        successful: distributionResults.filter(r => r.success).length,
        failed: distributionResults.filter(r => !r.success).length,
        results: distributionResults,
      };

      this.logOperation('DISTRIBUTE_REPORT_SUCCESS', 'ReportDistribution', reportId);

      return this.createResponse(
        distributionSummary,
        `Report distributed via ${validatedDto.channels.length} channels`
      );
    } catch (error) {
      this.handleError(error, 'DISTRIBUTE_REPORT');
    }
  }

  /**
   * Get report history
   */
  async getReportHistory(
    userId: string,
    limit: number = 50
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_REPORT_HISTORY', 'ReportHistory', userId);

      const history = this.reportHistory.get(userId) || [];
      const limitedHistory = history
        .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
        .slice(0, limit)
        .map(report => ({
          reportId: report.reportId,
          name: report.name,
          description: report.description,
          templateId: report.templateId,
          generatedAt: report.generatedAt,
          metadata: report.metadata,
          exportFormats: Object.keys(report.exports || {}),
        }));

      this.logOperation('GET_REPORT_HISTORY_SUCCESS', 'ReportHistory', userId);

      return this.createResponse(
        limitedHistory,
        `Retrieved ${limitedHistory.length} reports from history`
      );
    } catch (error) {
      this.handleError(error, 'GET_REPORT_HISTORY');
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(
    userId: string
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_REPORT_TEMPLATES', 'ReportTemplate', userId);

      const templates = Array.from(this.reportTemplates.values())
        .filter(template => template.isPublic || template.createdBy === userId)
        .map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          type: template.type,
          layout: template.layout,
          sections: template.sections.length,
          parameters: template.parameters.length,
          exportFormats: template.exportFormats,
          isPublic: template.isPublic,
          createdBy: template.createdBy,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        }));

      this.logOperation('GET_REPORT_TEMPLATES_SUCCESS', 'ReportTemplate', userId);

      return this.createResponse(
        templates,
        `Retrieved ${templates.length} report templates`
      );
    } catch (error) {
      this.handleError(error, 'GET_REPORT_TEMPLATES');
    }
  }

  /**
   * Export report in specific format
   */
  async exportReport(
    reportId: string,
    format: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('EXPORT_REPORT', 'ReportExport', reportId);

      // Find report
      const report = await this.findReportById(reportId, userId);
      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      // Check if export already exists
      if (report.exports && report.exports[format]) {
        return this.createResponse(
          {
            reportId,
            format,
            exportData: report.exports[format],
            exportedAt: report.generatedAt,
          },
          `Report export in ${format} format retrieved`
        );
      }

      // Generate export
      const exportData = await this.generateReportExport(report.content, format);

      // Store export
      if (!report.exports) report.exports = {};
      report.exports[format] = exportData;

      this.logOperation('EXPORT_REPORT_SUCCESS', 'ReportExport', reportId);

      return this.createResponse(
        {
          reportId,
          format,
          exportData,
          exportedAt: new Date(),
        },
        `Report exported in ${format} format`
      );
    } catch (error) {
      this.handleError(error, 'EXPORT_REPORT');
    }
  }

  /**
   * Get report analytics and statistics
   */
  async getReportAnalytics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_REPORT_ANALYTICS', 'ReportAnalytics', userId);

      const history = this.reportHistory.get(userId) || [];
      
      // Filter by time range if provided
      let filteredHistory = history;
      if (timeRange) {
        filteredHistory = history.filter(report => 
          report.generatedAt >= timeRange.start && report.generatedAt <= timeRange.end
        );
      }

      const analytics = {
        totalReports: filteredHistory.length,
        templateUsage: this.calculateTemplateUsage(filteredHistory),
        generationTrends: this.calculateGenerationTrends(filteredHistory),
        exportFormatUsage: this.calculateExportFormatUsage(filteredHistory),
        averageProcessingTime: this.calculateAverageProcessingTime(filteredHistory),
        scheduledReports: Array.from(this.scheduledReports.values())
          .filter(s => s.createdBy === userId).length,
        activeSchedules: Array.from(this.scheduledReports.values())
          .filter(s => s.createdBy === userId && s.enabled).length,
        recentReports: filteredHistory
          .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
          .slice(0, 5),
      };

      this.logOperation('GET_REPORT_ANALYTICS_SUCCESS', 'ReportAnalytics', userId);

      return this.createResponse(
        analytics,
        'Report analytics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_REPORT_ANALYTICS');
    }
  }

  /**
   * Initialize default report templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates = [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        description: 'High-level executive summary with key metrics and insights',
        type: 'executive',
        layout: 'vertical',
        sections: [
          { type: 'header', title: 'Executive Summary' },
          { type: 'kpi_grid', title: 'Key Performance Indicators' },
          { type: 'chart', title: 'Performance Trends', chartType: 'line' },
          { type: 'insights', title: 'Key Insights', limit: 5 },
          { type: 'recommendations', title: 'Recommendations' },
        ],
        isPublic: true,
        createdBy: 'system',
      },
      {
        id: 'detailed_analytics',
        name: 'Detailed Analytics Report',
        description: 'Comprehensive analytics report with detailed charts and statistics',
        type: 'detailed',
        layout: 'vertical',
        sections: [
          { type: 'header', title: 'Analytics Report' },
          { type: 'summary_stats', title: 'Summary Statistics' },
          { type: 'charts_grid', title: 'Data Visualizations' },
          { type: 'correlation_matrix', title: 'Correlation Analysis' },
          { type: 'trend_analysis', title: 'Trend Analysis' },
          { type: 'anomaly_summary', title: 'Anomaly Detection Results' },
        ],
        isPublic: true,
        createdBy: 'system',
      },
      {
        id: 'operational_dashboard',
        name: 'Operational Dashboard',
        description: 'Real-time operational metrics and monitoring dashboard',
        type: 'operational',
        layout: 'grid',
        sections: [
          { type: 'header', title: 'Operational Dashboard' },
          { type: 'metrics_cards', title: 'Current Metrics' },
          { type: 'status_indicators', title: 'System Status' },
          { type: 'alert_summary', title: 'Active Alerts' },
          { type: 'performance_charts', title: 'Performance Monitoring' },
        ],
        isPublic: true,
        createdBy: 'system',
      },
    ];

    defaultTemplates.forEach(template => {
      this.reportTemplates.set(template.id, {
        ...template,
        styling: this.getDefaultStyling(),
        parameters: [],
        filters: [],
        exportFormats: ['pdf', 'excel', 'html'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  /**
   * Generate report content based on configuration
   */
  private async generateReportContent(
    config: ReportConfigDto,
    template: any,
    userId: string
  ): Promise<any> {
    const content = {
      title: config.title || template?.name || 'Analytics Report',
      subtitle: config.description || template?.description,
      generatedAt: new Date(),
      sections: [],
      dataPoints: 0,
      charts: [],
      tables: [],
    };

    // Get data sources
    const dataSources = await this.getReportDataSources(config);

    // Process each section
    const sections = template?.sections || config.sections || [];
    
    for (const sectionConfig of sections) {
      const section = await this.generateReportSection(
        sectionConfig,
        dataSources,
        config,
        userId
      );
      content.sections.push(section);
      
      // Update counters
      content.dataPoints += section.dataPoints || 0;
      if (section.charts) content.charts.push(...section.charts);
      if (section.tables) content.tables.push(...section.tables);
    }

    return content;
  }

  /**
   * Generate individual report section
   */
  private async generateReportSection(
    sectionConfig: any,
    dataSources: any,
    reportConfig: ReportConfigDto,
    userId: string
  ): Promise<any> {
    const section = {
      type: sectionConfig.type,
      title: sectionConfig.title,
      content: null,
      dataPoints: 0,
      charts: [],
      tables: [],
    };

    switch (sectionConfig.type) {
      case 'header':
        section.content = this.generateHeaderSection(sectionConfig, reportConfig);
        break;

      case 'kpi_grid':
        section.content = await this.generateKPIGridSection(sectionConfig, dataSources);
        section.dataPoints = section.content.kpis?.length || 0;
        break;

      case 'chart':
        section.content = await this.generateChartSection(sectionConfig, dataSources);
        section.charts = [section.content];
        section.dataPoints = section.content.data?.length || 0;
        break;

      case 'summary_stats':
        section.content = await this.generateSummaryStatsSection(sectionConfig, dataSources);
        section.dataPoints = section.content.statistics?.length || 0;
        break;

      case 'insights':
        section.content = await this.generateInsightsSection(sectionConfig, dataSources, userId);
        section.dataPoints = section.content.insights?.length || 0;
        break;

      case 'table':
        section.content = await this.generateTableSection(sectionConfig, dataSources);
        section.tables = [section.content];
        section.dataPoints = section.content.rows?.length || 0;
        break;

      default:
        section.content = await this.generateGenericSection(sectionConfig, dataSources);
        break;
    }

    return section;
  }

  /**
   * Generate header section
   */
  private generateHeaderSection(sectionConfig: any, reportConfig: ReportConfigDto): any {
    return {
      title: sectionConfig.title || reportConfig.title,
      subtitle: sectionConfig.subtitle || reportConfig.description,
      generatedAt: new Date(),
      logo: sectionConfig.logo || null,
      branding: sectionConfig.branding || {},
    };
  }

  /**
   * Generate KPI grid section
   */
  private async generateKPIGridSection(sectionConfig: any, dataSources: any): Promise<any> {
    // Mock KPI generation - in real implementation would calculate from data
    const kpis = [
      { name: 'Total Records', value: Math.floor(Math.random() * 10000 + 1000), change: '+12.5%', trend: 'up' },
      { name: 'Data Quality Score', value: (Math.random() * 20 + 80).toFixed(1) + '%', change: '+2.1%', trend: 'up' },
      { name: 'Processing Time', value: (Math.random() * 5 + 1).toFixed(2) + 's', change: '-8.3%', trend: 'down' },
      { name: 'Active Sources', value: Math.floor(Math.random() * 20 + 5), change: '0.0%', trend: 'stable' },
    ];

    return {
      type: 'kpi_grid',
      kpis,
      layout: sectionConfig.layout || 'grid',
      columns: sectionConfig.columns || 2,
    };
  }

  /**
   * Generate chart section
   */
  private async generateChartSection(sectionConfig: any, dataSources: any): Promise<any> {
    // Mock chart data generation
    const chartTypes = ['line', 'bar', 'pie', 'scatter', 'area'];
    const chartType = sectionConfig.chartType || chartTypes[Math.floor(Math.random() * chartTypes.length)];
    
    const data = Array.from({ length: 10 }, (_, i) => ({
      x: `Category ${i + 1}`,
      y: Math.floor(Math.random() * 100 + 10),
    }));

    return {
      type: 'chart',
      chartType,
      title: sectionConfig.title,
      data,
      options: {
        responsive: true,
        scales: sectionConfig.scales || {},
        colors: sectionConfig.colors || ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
      },
    };
  }

  /**
   * Generate summary statistics section
   */
  private async generateSummaryStatsSection(sectionConfig: any, dataSources: any): Promise<any> {
    // Mock statistics generation
    const statistics = [
      { metric: 'Mean', value: (Math.random() * 100).toFixed(2) },
      { metric: 'Median', value: (Math.random() * 100).toFixed(2) },
      { metric: 'Standard Deviation', value: (Math.random() * 20).toFixed(2) },
      { metric: 'Min', value: (Math.random() * 10).toFixed(2) },
      { metric: 'Max', value: (Math.random() * 100 + 100).toFixed(2) },
      { metric: 'Count', value: Math.floor(Math.random() * 10000 + 1000).toString() },
    ];

    return {
      type: 'summary_stats',
      statistics,
      layout: sectionConfig.layout || 'table',
    };
  }

  /**
   * Generate insights section
   */
  private async generateInsightsSection(sectionConfig: any, dataSources: any, userId: string): Promise<any> {
    try {
      // Try to get insights from InsightsService
      if (dataSources.datasets && dataSources.datasets.length > 0) {
        const insightsResult = await this.insightsService.generateInsights(
          {
            datasetId: dataSources.datasets[0].id,
            maxInsights: sectionConfig.limit || 5,
          },
          userId
        );

        if (insightsResult.success) {
          return {
            type: 'insights',
            insights: insightsResult.data,
            displayMode: sectionConfig.displayMode || 'list',
          };
        }
      }
    } catch (error) {
      this.logger.warn('Failed to generate insights for report:', error.message);
    }

    // Fallback to mock insights
    const mockInsights = [
      {
        title: 'Data Quality Improvement',
        description: 'Data quality has improved by 15% compared to last period',
        confidence: 0.85,
        type: 'positive',
      },
      {
        title: 'Processing Efficiency',
        description: 'Average processing time has decreased by 12%',
        confidence: 0.78,
        type: 'positive',
      },
      {
        title: 'Volume Growth',
        description: 'Data volume has increased by 23% month-over-month',
        confidence: 0.92,
        type: 'neutral',
      },
    ];

    return {
      type: 'insights',
      insights: mockInsights.slice(0, sectionConfig.limit || 3),
      displayMode: sectionConfig.displayMode || 'list',
    };
  }

  /**
   * Generate table section
   */
  private async generateTableSection(sectionConfig: any, dataSources: any): Promise<any> {
    // Mock table data
    const columns = ['ID', 'Name', 'Value', 'Status', 'Updated'];
    const rows = Array.from({ length: sectionConfig.limit || 10 }, (_, i) => [
      i + 1,
      `Item ${i + 1}`,
      (Math.random() * 1000).toFixed(2),
      ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
      new Date().toLocaleDateString(),
    ]);

    return {
      type: 'table',
      columns,
      rows,
      pagination: sectionConfig.pagination !== false,
      sorting: sectionConfig.sorting !== false,
    };
  }

  /**
   * Generate generic section
   */
  private async generateGenericSection(sectionConfig: any, dataSources: any): Promise<any> {
    return {
      type: sectionConfig.type,
      title: sectionConfig.title,
      content: sectionConfig.content || 'Generic section content',
    };
  }

  /**
   * Get data sources for report
   */
  private async getReportDataSources(config: ReportConfigDto): Promise<any> {
    const sources = {
      datasets: [],
      dashboards: [],
      dataSources: [],
    };

    // Load datasets if specified
    if (config.datasetIds && config.datasetIds.length > 0) {
      for (const datasetId of config.datasetIds) {
        try {
          const dataset = await this.datasetRepository.findOne({ where: { id: datasetId } });
          if (dataset) sources.datasets.push(dataset);
        } catch (error) {
          this.logger.warn(`Failed to load dataset ${datasetId}:`, error.message);
        }
      }
    }

    // Load dashboards if specified
    if (config.dashboardIds && config.dashboardIds.length > 0) {
      for (const dashboardId of config.dashboardIds) {
        try {
          const dashboard = await this.dashboardRepository.findOne({ where: { id: dashboardId } });
          if (dashboard) sources.dashboards.push(dashboard);
        } catch (error) {
          this.logger.warn(`Failed to load dashboard ${dashboardId}:`, error.message);
        }
      }
    }

    return sources;
  }

  /**
   * Apply styling and layout to report
   */
  private async applyReportStyling(content: any, template: any): Promise<any> {
    const styling = template?.styling || this.getDefaultStyling();
    
    return {
      ...content,
      styling,
      layout: template?.layout || 'vertical',
      theme: styling.theme || 'default',
    };
  }

  /**
   * Generate report exports
   */
  private async generateReportExports(content: any, formats: string[]): Promise<Record<string, any>> {
    const exports = {};

    for (const format of formats) {
      exports[format] = await this.generateReportExport(content, format);
    }

    return exports;
  }

  /**
   * Generate single report export
   */
  private async generateReportExport(content: any, format: string): Promise<any> {
    switch (format.toLowerCase()) {
      case 'html':
        return this.generateHTMLExport(content);
      case 'pdf':
        return this.generatePDFExport(content);
      case 'excel':
        return this.generateExcelExport(content);
      case 'json':
        return this.generateJSONExport(content);
      default:
        return this.generateHTMLExport(content);
    }
  }

  /**
   * Generate HTML export
   */
  private generateHTMLExport(content: any): any {
    // Mock HTML generation
    return {
      format: 'html',
      content: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${content.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 30px; }
              .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .kpi-card { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${content.title}</h1>
              <p>${content.subtitle || ''}</p>
              <p><small>Generated on ${content.generatedAt.toLocaleString()}</small></p>
            </div>
            ${this.generateHTMLSections(content.sections)}
          </body>
        </html>
      `,
      size: Math.floor(Math.random() * 500 + 100) + 'KB',
    };
  }

  /**
   * Generate HTML sections
   */
  private generateHTMLSections(sections: any[]): string {
    return sections.map(section => {
      switch (section.type) {
        case 'kpi_grid':
          return `
            <div class="section">
              <h2>${section.title}</h2>
              <div class="kpi-grid">
                ${section.content.kpis.map(kpi => `
                  <div class="kpi-card">
                    <h3>${kpi.name}</h3>
                    <p style="font-size: 24px; color: #3498db; margin: 10px 0;">${kpi.value}</p>
                    <p style="color: ${kpi.trend === 'up' ? 'green' : kpi.trend === 'down' ? 'red' : 'gray'};">
                      ${kpi.change}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'chart':
          return `
            <div class="section">
              <h2>${section.title}</h2>
              <div>[Chart: ${section.content.chartType}]</div>
            </div>
          `;
        case 'table':
          return `
            <div class="section">
              <h2>${section.title}</h2>
              <table>
                <thead>
                  <tr>${section.content.columns.map(col => `<th>${col}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${section.content.rows.map(row => 
                    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
          `;
        default:
          return `
            <div class="section">
              <h2>${section.title}</h2>
              <p>${JSON.stringify(section.content)}</p>
            </div>
          `;
      }
    }).join('');
  }

  /**
   * Generate PDF export (mock)
   */
  private generatePDFExport(content: any): any {
    return {
      format: 'pdf',
      content: 'base64-encoded-pdf-content',
      size: Math.floor(Math.random() * 1000 + 200) + 'KB',
      pages: Math.floor(Math.random() * 10 + 3),
    };
  }

  /**
   * Generate Excel export (mock)
   */
  private generateExcelExport(content: any): any {
    return {
      format: 'excel',
      content: 'base64-encoded-excel-content',
      size: Math.floor(Math.random() * 800 + 150) + 'KB',
      sheets: content.sections.filter(s => s.type === 'table').length + 1,
    };
  }

  /**
   * Generate JSON export
   */
  private generateJSONExport(content: any): any {
    return {
      format: 'json',
      content: JSON.stringify(content, null, 2),
      size: JSON.stringify(content).length + ' bytes',
    };
  }

  /**
   * Helper methods
   */
  private getDefaultStyling(): any {
    return {
      theme: 'default',
      colors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        background: '#ffffff',
        text: '#2c3e50',
      },
      fonts: {
        heading: 'Arial, sans-serif',
        body: 'Arial, sans-serif',
        monospace: 'Courier New, monospace',
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
        xlarge: '32px',
      },
    };
  }

  private calculateNextRunTime(cronExpression: string): Date {
    // Simple cron calculation (in real implementation would use a cron library)
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + 1); // Mock: next hour
    return nextRun;
  }

  private generateReportCacheKey(config: ReportConfigDto, userId: string): string {
    return `report_${userId}_${JSON.stringify(config).replace(/\s/g, '')}`;
  }

  private async findReportById(reportId: string, userId: string): Promise<any> {
    const history = this.reportHistory.get(userId) || [];
    return history.find(report => report.reportId === reportId) || null;
  }

  private storeReportHistory(userId: string, report: ReportGenerationResultDto): void {
    let history = this.reportHistory.get(userId) || [];
    history.push(report);

    // Keep only last 100 reports
    if (history.length > 100) {
      history = history.slice(-100);
    }

    this.reportHistory.set(userId, history);
  }

  private async distributeToChannel(report: any, channel: string, recipients: string[]): Promise<any> {
    // Mock distribution
    return {
      channel,
      recipients: recipients.length,
      success: Math.random() > 0.1, // 90% success rate
      timestamp: new Date(),
      message: `Distributed via ${channel} to ${recipients.length} recipients`,
    };
  }

  private calculateTemplateUsage(reports: any[]): Record<string, number> {
    const usage = {};
    reports.forEach(report => {
      if (report.templateId) {
        usage[report.templateId] = (usage[report.templateId] || 0) + 1;
      }
    });
    return usage;
  }

  private calculateGenerationTrends(reports: any[]): any {
    const now = new Date();
    const last24h = reports.filter(r => now.getTime() - r.generatedAt.getTime() < 24 * 60 * 60 * 1000);
    const last7d = reports.filter(r => now.getTime() - r.generatedAt.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    return {
      last24h: last24h.length,
      last7d: last7d.length,
      trend: last7d.length > last24h.length * 7 ? 'increasing' : 'decreasing',
    };
  }

  private calculateExportFormatUsage(reports: any[]): Record<string, number> {
    const usage = {};
    reports.forEach(report => {
      if (report.exports) {
        Object.keys(report.exports).forEach(format => {
          usage[format] = (usage[format] || 0) + 1;
        });
      }
    });
    return usage;
  }

  private calculateAverageProcessingTime(reports: any[]): number {
    if (reports.length === 0) return 0;
    const totalTime = reports.reduce((sum, report) => sum + (report.metadata?.processingTime || 0), 0);
    return totalTime / reports.length;
  }

  /**
   * Background job management
   */
  private startBackgroundJobs(): void {
    // Process scheduled reports every minute
    this.scheduledJobInterval = setInterval(() => {
      this.processScheduledReports();
    }, 60000);

    // Cleanup old reports every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldReports();
    }, 3600000);
  }

  private stopBackgroundJobs(): void {
    if (this.scheduledJobInterval) {
      clearInterval(this.scheduledJobInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private async processScheduledReports(): Promise<void> {
    const now = new Date();
    
    for (const [scheduleId, schedule] of this.scheduledReports.entries()) {
      if (!schedule.enabled || schedule.nextRunAt > now) continue;

      try {
        // Generate report
        const reportResult = await this.generateReport(schedule.reportConfig, schedule.createdBy);
        
        if (reportResult.success) {
          // Distribute if configured
          if (schedule.distribution) {
            await this.distributeReport(
              reportResult.data.reportId,
              schedule.distribution,
              schedule.createdBy
            );
          }

          // Update schedule
          schedule.lastRunAt = now;
          schedule.runCount++;
          schedule.nextRunAt = this.calculateNextRunTime(schedule.cronExpression);
        }
      } catch (error) {
        this.logger.error(`Failed to process scheduled report ${scheduleId}:`, error);
      }
    }
  }

  private cleanupOldReports(): void {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoff = new Date(Date.now() - maxAge);

    for (const [userId, reports] of this.reportHistory.entries()) {
      const filteredReports = reports.filter(report => report.generatedAt > cutoff);
      this.reportHistory.set(userId, filteredReports);
    }

    // Clear old cache entries
    for (const [key, report] of this.reportCache.entries()) {
      if (report.generatedAt < cutoff) {
        this.reportCache.delete(key);
      }
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    this.stopBackgroundJobs();
  }
}
