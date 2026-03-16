import { Controller, Post, Get, Put, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { RealTimeAnalyticsService } from '../services/real-time-analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('real-time')
@UseGuards(JwtAuthGuard)
export class RealTimeAnalyticsController {
  constructor(private readonly service: RealTimeAnalyticsService) {}

  private getOrganizationId(req: any) {
    const organizationId =
      req.user?.organizationId ||
      req.user?.tenantId ||
      req.body?.organizationId ||
      req.query?.organizationId;
    if (!organizationId) {
      throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
    }
    return organizationId;
  }

  @Get('metrics/live')
  async getLiveMetrics(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getLiveMetrics(organizationId);
  }

  @Post('events')
  async publishEvent(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.publishEvent(data, organizationId);
  }

  @Get('dashboard/:dashboardId')
  async getDashboard(@Param('dashboardId') dashboardId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getDashboardData(dashboardId, organizationId);
  }

  @Post('alerts')
  async createAlert(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createAlert(data, organizationId);
  }

  @Get('alerts')
  async getAlerts(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getAlerts(organizationId);
  }

  @Put('alerts/:id')
  async updateAlert(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.updateAlert(id, data, organizationId);
  }

  @Get('customer-activity/live')
  async getLiveActivity(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getLiveCustomerActivity(organizationId);
  }

  @Get('conversions/live')
  async getLiveConversions() {
    return this.service.getLiveConversions();
  }
}
