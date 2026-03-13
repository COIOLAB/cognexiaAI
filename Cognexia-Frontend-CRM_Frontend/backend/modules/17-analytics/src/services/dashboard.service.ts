import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import {
  Dashboard,
  DashboardWidget,
  DashboardShare,
  DashboardView,
  DashboardLayout,
  VisualizationType,
  ProcessingStatus,
} from '../entities';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardDto,
  CreateDashboardWidgetDto,
  UpdateDashboardWidgetDto,
  DashboardWidgetDto,
  AnalyticsApiResponse,
  PaginatedAnalyticsResponse,
} from '../dto';

/**
 * Dashboard Service
 * Handles dashboard management, widgets, visualization, and sharing
 */
@Injectable()
export class DashboardService extends BaseAnalyticsService {
  private readonly layoutCache = new Map<string, any>();
  private readonly widgetCache = new Map<string, any>();
  private readonly realTimeConnections = new Map<string, Set<string>>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(DashboardWidget)
    private readonly widgetRepository: Repository<DashboardWidget>,
    @InjectRepository(DashboardShare)
    private readonly shareRepository: Repository<DashboardShare>,
    @InjectRepository(DashboardView)
    private readonly viewRepository: Repository<DashboardView>
  ) {
    super(entityManager);
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(
    createDashboardDto: CreateDashboardDto,
    userId: string
  ): Promise<AnalyticsApiResponse<DashboardDto>> {
    try {
      this.logOperation('CREATE_DASHBOARD', 'Dashboard');

      // Validate DTO
      const validatedDto = await this.validateDto(createDashboardDto, CreateDashboardDto);

      // Create dashboard entity
      const dashboard = this.dashboardRepository.create({
        ...validatedDto,
        ownerId: userId,
        layout: validatedDto.layout || DashboardLayout.GRID,
        isPublic: validatedDto.isPublic || false,
        settings: {
          autoRefresh: validatedDto.settings?.autoRefresh || false,
          refreshInterval: validatedDto.settings?.refreshInterval || 300,
          theme: validatedDto.settings?.theme || 'light',
          ...validatedDto.settings,
        },
        version: 1,
      });

      const savedDashboard = await this.dashboardRepository.save(dashboard);

      // Create default widgets if provided
      if (validatedDto.widgets && validatedDto.widgets.length > 0) {
        await this.createDashboardWidgets(savedDashboard.id, validatedDto.widgets);
      }

      const dashboardDto = await this.mapDashboardToDto(savedDashboard);

      this.logOperation('CREATE_DASHBOARD_SUCCESS', 'Dashboard', savedDashboard.id);

      return this.createResponse(
        dashboardDto,
        'Dashboard created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_DASHBOARD');
    }
  }

  /**
   * Get all dashboards with pagination and filtering
   */
  async getDashboards(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<DashboardDto>>> {
    try {
      this.logOperation('GET_DASHBOARDS', 'Dashboard');

      const queryBuilder = this.dashboardRepository
        .createQueryBuilder('dashboard')
        .leftJoinAndSelect('dashboard.widgets', 'widgets')
        .where('dashboard.ownerId = :userId OR dashboard.isPublic = :isPublic', {
          userId,
          isPublic: true,
        });

      // Apply additional filters
      this.applyFilters(queryBuilder, filters, 'dashboard');

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'dashboard.updatedAt', 'DESC');

      const [dashboards, total] = await queryBuilder.getManyAndCount();

      const dashboardDtos = await Promise.all(
        dashboards.map((dashboard) => this.mapDashboardToDto(dashboard))
      );

      const paginatedResponse = this.createPaginatedResponse(
        dashboardDtos,
        total,
        page,
        limit,
        filters
      );

      return this.createResponse(
        paginatedResponse,
        'Dashboards retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DASHBOARDS');
    }
  }

  /**
   * Get a specific dashboard by ID
   */
  async getDashboardById(
    id: string,
    userId: string
  ): Promise<AnalyticsApiResponse<DashboardDto>> {
    try {
      this.logOperation('GET_DASHBOARD_BY_ID', 'Dashboard', id);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id },
        relations: ['widgets'],
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${id} not found`);
      }

      // Check access permissions
      await this.checkDashboardAccess(dashboard, userId);

      // Record view
      await this.recordDashboardView(id, userId);

      const dashboardDto = await this.mapDashboardToDto(dashboard);

      return this.createResponse(
        dashboardDto,
        'Dashboard retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DASHBOARD_BY_ID');
    }
  }

  /**
   * Update a dashboard
   */
  async updateDashboard(
    id: string,
    updateDashboardDto: UpdateDashboardDto,
    userId: string
  ): Promise<AnalyticsApiResponse<DashboardDto>> {
    try {
      this.logOperation('UPDATE_DASHBOARD', 'Dashboard', id);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id },
        relations: ['widgets'],
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${id} not found`);
      }

      // Check permissions
      await this.checkDashboardWriteAccess(dashboard, userId);

      // Validate DTO
      const validatedDto = await this.validateDto(updateDashboardDto, UpdateDashboardDto);

      // Update dashboard
      Object.assign(dashboard, {
        ...validatedDto,
        version: dashboard.version + 1,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updatedDashboard = await this.dashboardRepository.save(dashboard);

      // Clear cache
      this.clearDashboardCache(id);

      const dashboardDto = await this.mapDashboardToDto(updatedDashboard);

      // Notify real-time subscribers
      await this.notifyDashboardUpdate(id, dashboardDto);

      this.logOperation('UPDATE_DASHBOARD_SUCCESS', 'Dashboard', id);

      return this.createResponse(
        dashboardDto,
        'Dashboard updated successfully'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_DASHBOARD');
    }
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(
    id: string,
    userId: string
  ): Promise<AnalyticsApiResponse<void>> {
    try {
      this.logOperation('DELETE_DASHBOARD', 'Dashboard', id);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id },
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${id} not found`);
      }

      // Check permissions
      if (dashboard.ownerId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this dashboard');
      }

      // Clear cache
      this.clearDashboardCache(id);

      // Disconnect real-time connections
      this.disconnectRealTimeConnections(id);

      // Soft delete
      await this.dashboardRepository.softRemove(dashboard);

      this.logOperation('DELETE_DASHBOARD_SUCCESS', 'Dashboard', id);

      return this.createResponse(
        undefined,
        'Dashboard deleted successfully'
      );
    } catch (error) {
      this.handleError(error, 'DELETE_DASHBOARD');
    }
  }

  /**
   * Create dashboard widget
   */
  async createWidget(
    dashboardId: string,
    createWidgetDto: CreateDashboardWidgetDto,
    userId: string
  ): Promise<AnalyticsApiResponse<DashboardWidgetDto>> {
    try {
      this.logOperation('CREATE_WIDGET', 'DashboardWidget');

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      await this.checkDashboardWriteAccess(dashboard, userId);

      // Validate DTO
      const validatedDto = await this.validateDto(createWidgetDto, CreateDashboardWidgetDto);

      // Create widget
      const widget = this.widgetRepository.create({
        ...validatedDto,
        dashboard,
        createdBy: userId,
        position: validatedDto.position || { x: 0, y: 0, width: 4, height: 4 },
      });

      const savedWidget = await this.widgetRepository.save(widget);

      // Update dashboard version
      dashboard.version += 1;
      dashboard.updatedAt = new Date();
      await this.dashboardRepository.save(dashboard);

      // Clear cache
      this.clearDashboardCache(dashboardId);

      const widgetDto = await this.mapWidgetToDto(savedWidget);

      // Notify real-time subscribers
      await this.notifyWidgetUpdate(dashboardId, 'create', widgetDto);

      this.logOperation('CREATE_WIDGET_SUCCESS', 'DashboardWidget', savedWidget.id);

      return this.createResponse(
        widgetDto,
        'Widget created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_WIDGET');
    }
  }

  /**
   * Update dashboard widget
   */
  async updateWidget(
    widgetId: string,
    updateWidgetDto: UpdateDashboardWidgetDto,
    userId: string
  ): Promise<AnalyticsApiResponse<DashboardWidgetDto>> {
    try {
      this.logOperation('UPDATE_WIDGET', 'DashboardWidget', widgetId);

      const widget = await this.widgetRepository.findOne({
        where: { id: widgetId },
        relations: ['dashboard'],
      });

      if (!widget) {
        throw new NotFoundException(`Widget with ID ${widgetId} not found`);
      }

      // Check permissions
      await this.checkDashboardWriteAccess(widget.dashboard, userId);

      // Validate DTO
      const validatedDto = await this.validateDto(updateWidgetDto, UpdateDashboardWidgetDto);

      // Update widget
      Object.assign(widget, {
        ...validatedDto,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updatedWidget = await this.widgetRepository.save(widget);

      // Update dashboard version
      widget.dashboard.version += 1;
      widget.dashboard.updatedAt = new Date();
      await this.dashboardRepository.save(widget.dashboard);

      // Clear cache
      this.clearDashboardCache(widget.dashboard.id);

      const widgetDto = await this.mapWidgetToDto(updatedWidget);

      // Notify real-time subscribers
      await this.notifyWidgetUpdate(widget.dashboard.id, 'update', widgetDto);

      this.logOperation('UPDATE_WIDGET_SUCCESS', 'DashboardWidget', widgetId);

      return this.createResponse(
        widgetDto,
        'Widget updated successfully'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_WIDGET');
    }
  }

  /**
   * Delete dashboard widget
   */
  async deleteWidget(
    widgetId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<void>> {
    try {
      this.logOperation('DELETE_WIDGET', 'DashboardWidget', widgetId);

      const widget = await this.widgetRepository.findOne({
        where: { id: widgetId },
        relations: ['dashboard'],
      });

      if (!widget) {
        throw new NotFoundException(`Widget with ID ${widgetId} not found`);
      }

      // Check permissions
      await this.checkDashboardWriteAccess(widget.dashboard, userId);

      const dashboardId = widget.dashboard.id;

      // Soft delete
      await this.widgetRepository.softRemove(widget);

      // Update dashboard version
      widget.dashboard.version += 1;
      widget.dashboard.updatedAt = new Date();
      await this.dashboardRepository.save(widget.dashboard);

      // Clear cache
      this.clearDashboardCache(dashboardId);

      // Notify real-time subscribers
      await this.notifyWidgetUpdate(dashboardId, 'delete', { id: widgetId });

      this.logOperation('DELETE_WIDGET_SUCCESS', 'DashboardWidget', widgetId);

      return this.createResponse(
        undefined,
        'Widget deleted successfully'
      );
    } catch (error) {
      this.handleError(error, 'DELETE_WIDGET');
    }
  }

  /**
   * Share dashboard
   */
  async shareDashboard(
    dashboardId: string,
    shareWith: string,
    permission: 'read' | 'write',
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('SHARE_DASHBOARD', 'DashboardShare');

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      if (dashboard.ownerId !== userId) {
        throw new ForbiddenException('Only the owner can share a dashboard');
      }

      // Check if already shared
      const existingShare = await this.shareRepository.findOne({
        where: { dashboardId, sharedWith: shareWith },
      });

      if (existingShare) {
        // Update existing share
        existingShare.permission = permission;
        existingShare.updatedAt = new Date();
        await this.shareRepository.save(existingShare);
      } else {
        // Create new share
        const share = this.shareRepository.create({
          dashboardId,
          sharedBy: userId,
          sharedWith: shareWith,
          permission,
        });
        await this.shareRepository.save(share);
      }

      this.logOperation('SHARE_DASHBOARD_SUCCESS', 'DashboardShare', dashboardId);

      return this.createResponse(
        { dashboardId, sharedWith: shareWith, permission },
        'Dashboard shared successfully'
      );
    } catch (error) {
      this.handleError(error, 'SHARE_DASHBOARD');
    }
  }

  /**
   * Get dashboard sharing information
   */
  async getDashboardShares(
    dashboardId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_DASHBOARD_SHARES', 'DashboardShare');

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      if (dashboard.ownerId !== userId) {
        throw new ForbiddenException('Only the owner can view dashboard shares');
      }

      const shares = await this.shareRepository.find({
        where: { dashboardId },
      });

      return this.createResponse(
        shares,
        'Dashboard shares retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DASHBOARD_SHARES');
    }
  }

  /**
   * Optimize dashboard layout
   */
  async optimizeLayout(
    dashboardId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('OPTIMIZE_LAYOUT', 'Dashboard', dashboardId);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
        relations: ['widgets'],
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      await this.checkDashboardWriteAccess(dashboard, userId);

      // Optimize layout
      const optimizedLayout = await this.calculateOptimizedLayout(dashboard);

      // Update widget positions
      await this.processBatch(
        dashboard.widgets,
        5,
        async (widgetBatch) => {
          const updates = widgetBatch.map((widget) => {
            const optimizedPosition = optimizedLayout.find(pos => pos.id === widget.id);
            if (optimizedPosition) {
              widget.position = optimizedPosition.position;
            }
            return this.widgetRepository.save(widget);
          });
          return Promise.all(updates);
        }
      );

      // Update dashboard version
      dashboard.version += 1;
      dashboard.updatedAt = new Date();
      await this.dashboardRepository.save(dashboard);

      // Clear cache
      this.clearDashboardCache(dashboardId);

      this.logOperation('OPTIMIZE_LAYOUT_SUCCESS', 'Dashboard', dashboardId);

      return this.createResponse(
        optimizedLayout,
        'Dashboard layout optimized successfully'
      );
    } catch (error) {
      this.handleError(error, 'OPTIMIZE_LAYOUT');
    }
  }

  /**
   * Get dashboard analytics and usage statistics
   */
  async getDashboardAnalytics(
    dashboardId: string,
    userId: string,
    days: number = 30
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_DASHBOARD_ANALYTICS', 'Dashboard', dashboardId);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      await this.checkDashboardAccess(dashboard, userId);

      // Get analytics data
      const analytics = await this.getDashboardUsageAnalytics(dashboardId, days);

      return this.createResponse(
        analytics,
        'Dashboard analytics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DASHBOARD_ANALYTICS');
    }
  }

  /**
   * Export dashboard
   */
  async exportDashboard(
    dashboardId: string,
    format: 'json' | 'pdf' | 'png',
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('EXPORT_DASHBOARD', 'Dashboard', dashboardId);

      const dashboard = await this.dashboardRepository.findOne({
        where: { id: dashboardId },
        relations: ['widgets'],
      });

      if (!dashboard) {
        throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
      }

      // Check permissions
      await this.checkDashboardAccess(dashboard, userId);

      // Export dashboard
      const exportData = await this.exportDashboardData(dashboard, format);

      this.logOperation('EXPORT_DASHBOARD_SUCCESS', 'Dashboard', dashboardId);

      return this.createResponse(
        exportData,
        `Dashboard exported successfully as ${format.toUpperCase()}`
      );
    } catch (error) {
      this.handleError(error, 'EXPORT_DASHBOARD');
    }
  }

  /**
   * Create dashboard widgets in batch
   */
  private async createDashboardWidgets(
    dashboardId: string,
    widgets: CreateDashboardWidgetDto[]
  ): Promise<DashboardWidget[]> {
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboardId },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }

    const createdWidgets = await Promise.all(
      widgets.map(async (widgetDto) => {
        const widget = this.widgetRepository.create({
          ...widgetDto,
          dashboard,
          position: widgetDto.position || { x: 0, y: 0, width: 4, height: 4 },
        });
        return this.widgetRepository.save(widget);
      })
    );

    return createdWidgets;
  }

  /**
   * Check dashboard access permissions
   */
  private async checkDashboardAccess(dashboard: Dashboard, userId: string): Promise<void> {
    if (dashboard.ownerId === userId || dashboard.isPublic) {
      return;
    }

    const share = await this.shareRepository.findOne({
      where: { dashboardId: dashboard.id, sharedWith: userId },
    });

    if (!share) {
      throw new ForbiddenException('You do not have permission to access this dashboard');
    }
  }

  /**
   * Check dashboard write access permissions
   */
  private async checkDashboardWriteAccess(dashboard: Dashboard, userId: string): Promise<void> {
    if (dashboard.ownerId === userId) {
      return;
    }

    const share = await this.shareRepository.findOne({
      where: { dashboardId: dashboard.id, sharedWith: userId, permission: 'write' },
    });

    if (!share) {
      throw new ForbiddenException('You do not have permission to modify this dashboard');
    }
  }

  /**
   * Record dashboard view
   */
  private async recordDashboardView(dashboardId: string, userId: string): Promise<void> {
    try {
      const view = this.viewRepository.create({
        dashboardId,
        viewedBy: userId,
        viewedAt: new Date(),
      });
      await this.viewRepository.save(view);
    } catch (error) {
      // Log but don't fail the request
      this.logger.warn(`Failed to record dashboard view: ${error.message}`);
    }
  }

  /**
   * Calculate optimized layout
   */
  private async calculateOptimizedLayout(dashboard: Dashboard): Promise<any[]> {
    // Mock layout optimization algorithm
    const widgets = dashboard.widgets || [];
    const optimized = [];
    
    let currentY = 0;
    const gridWidth = 12; // Assuming 12-column grid
    
    widgets.forEach((widget, index) => {
      const width = widget.position?.width || 4;
      const height = widget.position?.height || 4;
      
      // Simple packing algorithm
      const x = (index % Math.floor(gridWidth / width)) * width;
      const y = currentY + Math.floor(index / Math.floor(gridWidth / width)) * height;
      
      optimized.push({
        id: widget.id,
        position: { x, y, width, height },
      });
    });

    return optimized;
  }

  /**
   * Get dashboard usage analytics
   */
  private async getDashboardUsageAnalytics(dashboardId: string, days: number): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    // Mock analytics data
    return {
      totalViews: Math.floor(Math.random() * 1000) + 100,
      uniqueUsers: Math.floor(Math.random() * 50) + 10,
      averageSessionTime: Math.floor(Math.random() * 300) + 60, // seconds
      topWidgets: [
        { widgetId: 'widget1', views: Math.floor(Math.random() * 100) + 20 },
        { widgetId: 'widget2', views: Math.floor(Math.random() * 80) + 15 },
        { widgetId: 'widget3', views: Math.floor(Math.random() * 60) + 10 },
      ],
      dailyViews: Array.from({ length: days }, (_, i) => ({
        date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 1,
      })),
      peakHours: [
        { hour: 9, views: 45 },
        { hour: 14, views: 38 },
        { hour: 16, views: 42 },
      ],
    };
  }

  /**
   * Export dashboard data
   */
  private async exportDashboardData(dashboard: Dashboard, format: string): Promise<any> {
    const exportData = {
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      layout: dashboard.layout,
      settings: dashboard.settings,
      widgets: dashboard.widgets?.map(widget => ({
        id: widget.id,
        title: widget.title,
        type: widget.type,
        visualizationType: widget.visualizationType,
        configuration: widget.configuration,
        position: widget.position,
        dataSource: widget.dataSource,
      })),
      exportedAt: new Date(),
      format,
    };

    switch (format) {
      case 'json':
        return {
          content: JSON.stringify(exportData, null, 2),
          mimeType: 'application/json',
          filename: `dashboard-${dashboard.id}.json`,
        };
      case 'pdf':
        return {
          content: 'base64-encoded-pdf-content', // Mock
          mimeType: 'application/pdf',
          filename: `dashboard-${dashboard.id}.pdf`,
        };
      case 'png':
        return {
          content: 'base64-encoded-png-content', // Mock
          mimeType: 'image/png',
          filename: `dashboard-${dashboard.id}.png`,
        };
      default:
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Notify real-time subscribers of dashboard updates
   */
  private async notifyDashboardUpdate(dashboardId: string, data: any): Promise<void> {
    const connections = this.realTimeConnections.get(dashboardId);
    if (connections) {
      // This would integrate with WebSocket or Server-Sent Events
      this.logger.log(`Notifying ${connections.size} connections about dashboard ${dashboardId} update`);
    }
  }

  /**
   * Notify real-time subscribers of widget updates
   */
  private async notifyWidgetUpdate(
    dashboardId: string,
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const connections = this.realTimeConnections.get(dashboardId);
    if (connections) {
      this.logger.log(`Notifying ${connections.size} connections about widget ${action} on dashboard ${dashboardId}`);
    }
  }

  /**
   * Clear dashboard cache
   */
  private clearDashboardCache(dashboardId: string): void {
    const keysToDelete = [];
    for (const key of this.layoutCache.keys()) {
      if (key.includes(dashboardId)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.layoutCache.delete(key);
    }

    // Clear widget cache
    for (const key of this.widgetCache.keys()) {
      if (key.includes(dashboardId)) {
        this.widgetCache.delete(key);
      }
    }
  }

  /**
   * Disconnect real-time connections
   */
  private disconnectRealTimeConnections(dashboardId: string): void {
    if (this.realTimeConnections.has(dashboardId)) {
      this.realTimeConnections.delete(dashboardId);
      this.logger.log(`Disconnected all real-time connections for dashboard ${dashboardId}`);
    }
  }

  /**
   * Map dashboard entity to DTO
   */
  private async mapDashboardToDto(dashboard: Dashboard): Promise<DashboardDto> {
    const widgets = dashboard.widgets ? 
      await Promise.all(dashboard.widgets.map(widget => this.mapWidgetToDto(widget))) : 
      [];

    return {
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      layout: dashboard.layout,
      isPublic: dashboard.isPublic,
      settings: dashboard.settings,
      widgets,
      tags: dashboard.tags,
      ownerId: dashboard.ownerId,
      version: dashboard.version,
      createdAt: dashboard.createdAt,
      updatedAt: dashboard.updatedAt,
      lastModifiedBy: dashboard.lastModifiedBy,
    };
  }

  /**
   * Map widget entity to DTO
   */
  private async mapWidgetToDto(widget: DashboardWidget): Promise<DashboardWidgetDto> {
    return {
      id: widget.id,
      title: widget.title,
      description: widget.description,
      type: widget.type,
      visualizationType: widget.visualizationType,
      dataSource: widget.dataSource,
      configuration: widget.configuration,
      position: widget.position,
      settings: widget.settings,
      createdBy: widget.createdBy,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
      lastModifiedBy: widget.lastModifiedBy,
    };
  }
}
