import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { UserDashboardService } from '../services/user-dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto, DashboardQueryDto } from '../dto/dashboard.dto';

/**
 * Dashboard Controller
 * Provides endpoints for admin and user dashboards
 */
@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly userDashboardService: UserDashboardService,
  ) {}

  private resolveOrganizationId(req: any): string | undefined {
    const tenantHeader = req.headers?.['x-tenant-id'];
    const headerOrg =
      Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    return (
      req.user?.organizationId ||
      req.user?.tenantId ||
      req.user?.orgId ||
      headerOrg
    );
  }

  // ==================== ADMIN DASHBOARD ENDPOINTS ====================

  /**
   * Get Platform-Wide Metrics (Super Admin Only)
   */
  @Get('admin/platform-metrics')
  @UserTypes(UserType.SUPER_ADMIN)
  async getPlatformMetrics(@Request() req) {
    try {
      const metrics = await this.adminDashboardService.getPlatformMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Revenue Metrics (Super Admin Only)
   */
  @Get('admin/revenue-metrics')
  @UserTypes(UserType.SUPER_ADMIN)
  async getRevenueMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const metrics = await this.adminDashboardService.getRevenueMetrics(start, end);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Usage Metrics (Super Admin Only)
   */
  @Get('admin/usage-metrics')
  @UserTypes(UserType.SUPER_ADMIN)
  async getUsageMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const metrics = await this.adminDashboardService.getUsageMetrics(start, end);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Top Organizations by Revenue (Super Admin Only)
   */
  @Get('admin/top-organizations')
  @UserTypes(UserType.SUPER_ADMIN)
  async getTopOrganizations(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const organizations = await this.adminDashboardService.getTopOrganizations(limit);
      return {
        success: true,
        data: organizations,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Organization Health (Super Admin Only)
   */
  @Get('admin/organization-health/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN)
  async getOrganizationHealth(
    @Request() req,
    @Param('organizationId') organizationId: string,
  ) {
    try {
      const health = await this.adminDashboardService.getOrganizationHealth(organizationId);
      return {
        success: true,
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get Organizations at Risk (Super Admin Only)
   */
  @Get('admin/organizations-at-risk')
  @UserTypes(UserType.SUPER_ADMIN)
  async getOrganizationsAtRisk(@Request() req) {
    try {
      const organizations = await this.adminDashboardService.getOrganizationsAtRisk();
      return {
        success: true,
        data: organizations,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Growth Statistics (Super Admin Only)
   */
  @Get('admin/growth-statistics')
  @UserTypes(UserType.SUPER_ADMIN)
  async getGrowthStatistics(
    @Request() req,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    try {
      const statistics = await this.adminDashboardService.getGrowthStatistics(days);
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get System Health (Super Admin Only)
   */
  @Get('admin/system-health')
  @UserTypes(UserType.SUPER_ADMIN)
  async getSystemHealth(@Request() req) {
    try {
      const health = await this.adminDashboardService.getSystemHealth();
      return {
        success: true,
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Subscription Plan Distribution (Super Admin Only)
   */
  @Get('admin/plan-distribution')
  @UserTypes(UserType.SUPER_ADMIN)
  async getSubscriptionPlanDistribution(@Request() req) {
    try {
      const distribution = await this.adminDashboardService.getSubscriptionPlanDistribution();
      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== USER DASHBOARD ENDPOINTS ====================

  /**
   * Get User Dashboard Metrics
   */
  @Get('user/metrics')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getUserMetrics(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const metrics = await this.userDashboardService.getUserMetrics(organizationId);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get marketing analytics summary
   */
  @Get('user/marketing-metrics')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getMarketingMetrics(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const summary = await this.userDashboardService.getMarketingSummary(organizationId);
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get support SLA summary
   */
  @Get('user/support-sla')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getSupportSla(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const summary = await this.userDashboardService.getSupportSlaSummary(organizationId);
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get tier analytics for basic/premium/advanced
   */
  @Get('user/tier-analytics')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getTierAnalytics(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const analytics = await this.userDashboardService.getTierAnalytics(organizationId);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Sales Funnel
   */
  @Get('user/sales-funnel')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getSalesFunnel(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const funnel = await this.userDashboardService.getSalesFunnel(organizationId);
      return {
        success: true,
        data: funnel,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Recent Activities
   */
  @Get('user/recent-activities')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getRecentActivities(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const activities = await this.userDashboardService.getRecentActivities(organizationId, limit);
      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Performance Metrics
   */
  @Get('user/performance-metrics')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getPerformanceMetrics(
    @Request() req,
    @Query('period') period: 'day' | 'week' | 'month' = 'month',
  ) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const metrics = await this.userDashboardService.getPerformanceMetrics(organizationId, period);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Revenue Metrics
   */
  @Get('user/revenue-metrics')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getUserRevenueMetrics(@Request() req) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      if (!organizationId) {
        return {
          success: true,
          data: {
            mrr: 0,
            arr: 0,
            growth: 0,
            churnRate: 0,
            nrr: 0,
            clv: 0,
            cac: 0,
            ltv_cac_ratio: null,
            trend: [],
            segments: [],
          },
        };
      }

      const metrics = await this.userDashboardService.getRevenueMetrics(organizationId);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== CUSTOM DASHBOARDS ====================

  /**
   * Get all dashboards
   */
  @Get()
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER, UserType.SUPER_ADMIN)
  async getDashboards(@Request() req) {
    try {
      const userId = req.user.userId;
      const dashboards = await this.userDashboardService.getUserDashboards(userId);
      return {
        success: true,
        data: dashboards,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get User's Custom Dashboards
   */
  @Get('custom')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getUserDashboards(@Request() req) {
    try {
      const userId = req.user.userId;
      const dashboards = await this.userDashboardService.getUserDashboards(userId);
      return {
        success: true,
        data: dashboards,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create Custom Dashboard
   */
  @Post('custom')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async createDashboard(@Request() req, @Body() dto: CreateDashboardDto) {
    try {
      const userId = req.user.userId;
      const dashboard = await this.userDashboardService.createDashboard(
        userId,
        dto.name,
        dto.widgets,
      );
      return {
        success: true,
        message: 'Dashboard created successfully',
        data: dashboard,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get dashboard by ID
   */
  @Get(':id')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER, UserType.SUPER_ADMIN)
  async getDashboardById(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.userId;
      const dashboard = await this.userDashboardService.getDashboard(id, userId);
      
      if (!dashboard) {
        throw new HttpException(
          { success: false, message: 'Dashboard not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create dashboard (alias for POST /custom)
   */
  @Post()
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async createDashboardAlias(@Request() req, @Body() dto: CreateDashboardDto) {
    try {
      const userId = req.user.userId;
      const dashboard = await this.userDashboardService.createDashboard(
        userId,
        dto.name,
        dto.widgets,
      );
      return {
        success: true,
        message: 'Dashboard created successfully',
        data: dashboard,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get Dashboard by ID (alias)
   */
  @Get('custom/:id')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async getDashboard(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.userId;
      const dashboard = await this.userDashboardService.getDashboard(id, userId);
      
      if (!dashboard) {
        throw new HttpException(
          { success: false, message: 'Dashboard not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update Dashboard
   */
  @Put('custom/:id')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async updateDashboard(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    try {
      const userId = req.user.userId;
      const dashboard = await this.userDashboardService.updateDashboard(id, userId, dto as any);
      return {
        success: true,
        message: 'Dashboard updated successfully',
        data: dashboard,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete Dashboard
   */
  @Delete('custom/:id')
  @UserTypes(UserType.ORG_ADMIN, UserType.ORG_USER)
  async deleteDashboard(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.userId;
      await this.userDashboardService.deleteDashboard(id, userId);
      return {
        success: true,
        message: 'Dashboard deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
