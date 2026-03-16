import { Controller, Post, Get, Put, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HolographicExperienceService } from '../services/holographic-experience.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('holographic')
@UseGuards(JwtAuthGuard)
export class HolographicExperienceController {
  constructor(private readonly service: HolographicExperienceService) {}

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

  @Post('projections')
  async createProjection(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createProjection(data, organizationId);
  }

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getSession(sessionId, organizationId);
  }

  @Post('spatial-computing/start')
  async startSpatialSession(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.initializeSpatialSession(data, organizationId);
  }

  @Put('sessions/:id/interactions')
  async trackInteractions(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.trackSpatialInteractions(id, data, organizationId);
  }

  @Get('avatars/:customerId')
  async getAvatar(@Param('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.generateHolographicAvatar(customerId, organizationId);
  }

  @Post('multi-user/sync')
  async syncMultiUser(@Body('sessionId') sessionId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.synchronizeMultiUserSpace(sessionId, organizationId);
  }

  @Post('sessions')
  async createSession(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createSession(data, organizationId);
  }

  @Get('sessions/:id')
  async getSessionById(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getSession(id, organizationId);
  }

  @Put('sessions/:id')
  async updateSession(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.updateSession(id, data, organizationId);
  }

  @Post('sessions/:sessionId/gestures')
  async recordGesture(@Param('sessionId') sessionId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.recordGesture(sessionId, data, organizationId);
  }

  @Get('sessions/:sessionId/analytics')
  async getSessionAnalytics(@Param('sessionId') sessionId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getSessionAnalytics(sessionId, organizationId);
  }

  @Post('templates')
  async createTemplate(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createTemplate(data, organizationId);
  }
}
