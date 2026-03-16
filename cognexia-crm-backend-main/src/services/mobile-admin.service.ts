import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushNotificationTemplate } from '../entities/push-notification-template.entity';

@Injectable()
export class MobileAdminService {
  constructor(
    @InjectRepository(PushNotificationTemplate)
    private notificationRepository: Repository<PushNotificationTemplate>,
  ) {}

  async getAllNotificationTemplates() {
    return this.notificationRepository.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  async sendPushNotification(templateId: string, recipients: string[]) {
    const template = await this.notificationRepository.findOne({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    // Mock push notification sending
    return {
      success: true,
      sent: recipients.length,
      failed: 0,
      messageId: `push-${Date.now()}`,
    };
  }

  async getMobileAppStats() {
    return {
      totalDownloads: 15000,
      activeUsers: 8500,
      avgSessionDuration: 8.5, // minutes
      pushNotificationsEnabled: 6200,
      platform: {
        ios: 9000,
        android: 6000,
      },
    };
  }
}
