import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MobileAdminService } from '../services/mobile-admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Mobile Admin')
@ApiBearerAuth()
@Controller('mobile-admin')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class MobileAdminController {
  constructor(private readonly service: MobileAdminService) {}

  @Get('notification-templates')
  async getTemplates() {
    return this.service.getAllNotificationTemplates();
  }

  @Post('send-notification')
  async sendNotification(@Body('templateId') templateId: string, @Body('recipients') recipients: string[]) {
    return this.service.sendPushNotification(templateId, recipients);
  }

  @Get('stats')
  async getStats() {
    return this.service.getMobileAppStats();
  }
}
