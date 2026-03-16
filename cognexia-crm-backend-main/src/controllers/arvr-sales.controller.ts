import { Controller, Post, Get, Put, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ARVRSalesService } from '../services/arvr-sales.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('arvr')
@UseGuards(JwtAuthGuard)
export class ARVRSalesController {
  constructor(private readonly service: ARVRSalesService) {}

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

  @Post('showrooms')
  async createShowroom(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createShowroom(data, organizationId);
  }

  @Get('test')
  async test() {
    return { status: 'ok', message: 'ARVR Controller is working!', timestamp: new Date() };
  }

  @Get('showrooms')
  async getShowrooms(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getShowrooms(organizationId);
  }

  @Get('showrooms/:id')
  async getShowroom(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getShowroom(id, organizationId);
  }

  @Post('sessions')
  async createSession(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createSession(data, organizationId);
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getSession(id, organizationId);
  }

  @Post('sessions/:sessionId/interactions')
  async createInteraction(
    @Param('sessionId') sessionId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createInteraction(sessionId, data, organizationId);
  }

  @Get('analytics')
  async getOverallAnalytics(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getOverallAnalytics(organizationId);
  }

  @Post('meetings')
  async scheduleMeeting(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.scheduleVirtualMeeting(data, organizationId);
  }

  @Get('meetings/:id')
  async getMeeting(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getMeeting(id, organizationId);
  }

  @Post('product-demos')
  async createDemo(@Body('productId') productId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createProductDemo(productId, organizationId);
  }

  @Post('configurator/initialize')
  async initConfigurator(@Body('productId') productId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.initialize3DConfigurator(productId, organizationId);
  }

  @Put('configurator/:id/customize')
  async customizeProduct(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.customizeProduct3D(data, organizationId);
  }

  @Get('analytics/:showroomId')
  async getAnalytics(@Param('showroomId') showroomId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getVRAnalytics(showroomId, organizationId);
  }
}
