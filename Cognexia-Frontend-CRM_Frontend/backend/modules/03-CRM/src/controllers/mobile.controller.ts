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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { MobileDeviceService, PushNotificationService, OfflineSyncService } from '../services/mobile.service';
import {
  RegisterDeviceDto,
  UpdateDeviceDto,
  DeviceHeartbeatDto,
  SendNotificationDto,
  BulkNotificationDto,
  BatchSyncDto,
  SyncConflictResolutionDto,
  AppPreferencesDto,
  RequestPhoneOtpDto,
  VerifyPhoneOtpDto,
  PairDeviceDto,
  NotificationTemplateDto,
} from '../dto/mobile.dto';

@ApiTags('Mobile Devices')
@Controller('mobile/devices')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MobileDeviceController {
  constructor(private readonly deviceService: MobileDeviceService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register mobile device' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  async registerDevice(@Request() req, @Body() dto: RegisterDeviceDto) {
    return this.deviceService.registerDevice(req.user.id, req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user devices' })
  @ApiResponse({ status: 200, description: 'List of user devices' })
  async getUserDevices(@Request() req) {
    return this.deviceService.getUserDevices(req.user.id, req.user.tenantId);
  }

  @Put(':deviceId')
  @ApiOperation({ summary: 'Update device' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  async updateDevice(@Request() req, @Param('deviceId') deviceId: string, @Body() dto: UpdateDeviceDto) {
    return this.deviceService.updateDevice(deviceId, req.user.tenantId, dto);
  }

  @Post(':deviceId/heartbeat')
  @ApiOperation({ summary: 'Update device heartbeat' })
  @ApiResponse({ status: 200, description: 'Heartbeat updated' })
  async updateHeartbeat(@Request() req, @Param('deviceId') deviceId: string, @Body() dto: DeviceHeartbeatDto) {
    await this.deviceService.updateHeartbeat(deviceId, req.user.tenantId, {
      isOnline: dto.isOnline,
      batteryLevel: dto.batteryLevel,
      networkType: dto.networkType,
    });
    return { message: 'Heartbeat updated' };
  }

  @Delete(':deviceId')
  @ApiOperation({ summary: 'Deregister device' })
  @ApiResponse({ status: 200, description: 'Device deregistered' })
  async deregisterDevice(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.deregisterDevice(deviceId, req.user.tenantId);
    return { message: 'Device deregistered successfully' };
  }

  @Post(':deviceId/token')
  @ApiOperation({ summary: 'Refresh push token' })
  @ApiResponse({ status: 200, description: 'Push token updated' })
  async refreshPushToken(
    @Request() req,
    @Param('deviceId') deviceId: string,
    @Body('pushToken') pushToken: string,
    @Body('pushTokenExpiresAt') pushTokenExpiresAt?: string,
  ) {
    return this.deviceService.refreshPushToken(
      deviceId,
      req.user.tenantId,
      pushToken,
      pushTokenExpiresAt ? new Date(pushTokenExpiresAt) : undefined,
    );
  }

  @Post(':deviceId/pair')
  @ApiOperation({ summary: 'Pair device using OTP' })
  @ApiResponse({ status: 200, description: 'Device paired successfully' })
  async pairDevice(@Request() req, @Param('deviceId') deviceId: string, @Body() dto: PairDeviceDto) {
    return this.deviceService.pairDevice(req.user.id, req.user.tenantId, deviceId, dto.otp);
  }
}

@ApiTags('Push Notifications')
@Controller('mobile/notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PushNotificationController {
  constructor(private readonly notificationService: PushNotificationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send push notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(@Request() req, @Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(req.user.tenantId, dto);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Notifications sent successfully' })
  async sendBulkNotifications(@Request() req, @Body() dto: BulkNotificationDto) {
    const count = await this.notificationService.sendBulkNotifications(
      req.user.tenantId,
      dto.userIds,
      dto.title,
      dto.body,
      dto.category,
      dto.data,
    );
    return { message: `${count} notifications sent` };
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getUserNotifications(@Request() req, @Query('limit') limit?: number) {
    return this.notificationService.getUserNotifications(req.user.id, req.user.tenantId, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id, req.user.tenantId);
    return { count };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Mark notification as clicked' })
  @ApiResponse({ status: 200, description: 'Notification marked as clicked' })
  async markAsClicked(@Request() req, @Param('id') id: string) {
    await this.notificationService.markAsClicked(id, req.user.tenantId);
    return { message: 'Notification marked as clicked' };
  }

  @Post(':id/delivered')
  @ApiOperation({ summary: 'Mark notification as delivered' })
  @ApiResponse({ status: 200, description: 'Notification marked as delivered' })
  async markAsDelivered(@Request() req, @Param('id') id: string) {
    await this.notificationService.markAsDelivered(id, req.user.tenantId);
    return { message: 'Notification marked as delivered' };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id, req.user.tenantId);
    return { message: 'All notifications marked as read' };
  }
}

@ApiTags('Mobile Settings')
@Controller('mobile')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MobileSettingsController {
  constructor(private readonly notificationService: PushNotificationService) {}

  @Post('phone/otp/request')
  @ApiOperation({ summary: 'Request phone verification OTP' })
  async requestPhoneOtp(@Request() req, @Body() dto: RequestPhoneOtpDto) {
    return this.notificationService.requestPhoneOtp(req.user.id, req.user.tenantId, dto.phoneNumber);
  }

  @Post('phone/otp/verify')
  @ApiOperation({ summary: 'Verify phone OTP' })
  async verifyPhoneOtp(@Request() req, @Body() dto: VerifyPhoneOtpDto) {
    return this.notificationService.verifyPhoneOtp(req.user.id, req.user.tenantId, dto.phoneNumber, dto.otp);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates' })
  async listTemplates(@Request() req) {
    return this.notificationService.listTemplates(req.user.tenantId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create notification template' })
  async createTemplate(@Request() req, @Body() dto: NotificationTemplateDto) {
    return this.notificationService.createTemplate(req.user.tenantId, dto);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update notification template' })
  async updateTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: NotificationTemplateDto,
  ) {
    return this.notificationService.updateTemplate(req.user.tenantId, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete notification template' })
  async deleteTemplate(@Request() req, @Param('id') id: string) {
    await this.notificationService.deleteTemplate(req.user.tenantId, id);
    return { message: 'Template deleted' };
  }

  @Get('providers/health')
  @ApiOperation({ summary: 'Get provider health status' })
  async getProviderHealth(@Request() req) {
    return this.notificationService.getProviderHealth(req.user.tenantId);
  }

  @Post('providers/health/refresh')
  @ApiOperation({ summary: 'Refresh provider health status' })
  async refreshProviderHealth(@Request() req) {
    return this.notificationService.refreshProviderHealth(req.user.tenantId);
  }
}

@ApiTags('Mobile Webhooks')
@Controller('mobile/webhooks')
export class MobileWebhookController {
  constructor(private readonly notificationService: PushNotificationService) {}

  @Post('twilio')
  async handleTwilioWebhook(@Body() body: any) {
    await this.notificationService.handleReceipt('TWILIO', body);
    return { success: true };
  }

  @Post('vonage')
  async handleVonageWebhook(@Body() body: any) {
    await this.notificationService.handleReceipt('VONAGE', body);
    return { success: true };
  }

  @Post('messagebird')
  async handleMessageBirdWebhook(@Body() body: any) {
    await this.notificationService.handleReceipt('MESSAGEBIRD', body);
    return { success: true };
  }
}

@ApiTags('Offline Sync')
@Controller('mobile/sync')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class OfflineSyncController {
  constructor(private readonly syncService: OfflineSyncService) {}

  @Post('batch')
  @ApiOperation({ summary: 'Process batch sync' })
  @ApiResponse({ status: 200, description: 'Batch sync processed' })
  async processBatchSync(@Request() req, @Body() dto: BatchSyncDto, @Query('deviceId') deviceId: string) {
    return this.syncService.processBatchSync(req.user.id, deviceId, req.user.tenantId, dto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending syncs' })
  @ApiResponse({ status: 200, description: 'Pending syncs' })
  async getPendingSyncs(@Request() req, @Query('deviceId') deviceId: string) {
    return this.syncService.getPendingSyncs(req.user.id, deviceId, req.user.tenantId);
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Get sync conflicts' })
  @ApiResponse({ status: 200, description: 'Sync conflicts' })
  async getConflicts(@Request() req) {
    return this.syncService.getConflicts(req.user.id, req.user.tenantId);
  }

  @Post('conflicts/resolve')
  @ApiOperation({ summary: 'Resolve sync conflict' })
  @ApiResponse({ status: 200, description: 'Conflict resolved' })
  async resolveConflict(@Request() req, @Body() dto: SyncConflictResolutionDto) {
    return this.syncService.resolveConflict(dto.syncId, req.user.tenantId, dto.resolveWith, dto.mergedData);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get sync statistics' })
  @ApiResponse({ status: 200, description: 'Sync statistics' })
  async getSyncStatistics(@Request() req) {
    return this.syncService.getSyncStatistics(req.user.id, req.user.tenantId);
  }
}
