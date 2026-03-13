import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationCenterService } from '../services/communication-center.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Communication Center')
@ApiBearerAuth()
@Controller('communication')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class CommunicationCenterController {
  constructor(private readonly service: CommunicationCenterService) {}

  @Post('announcements')
  async createAnnouncement(@Body() data: any) {
    return this.service.createAnnouncement(data);
  }

  @Get('announcements')
  async getAllAnnouncements() {
    return this.service.getAllAnnouncements();
  }

  @Post('announcements/:id/deactivate')
  async deactivateAnnouncement(@Param('id') id: string) {
    return this.service.deactivateAnnouncement(id);
  }

  @Post('send-bulk-email')
  async sendBulkEmail(@Body() data: any) {
    return this.service.sendBulkEmail(data);
  }
}
