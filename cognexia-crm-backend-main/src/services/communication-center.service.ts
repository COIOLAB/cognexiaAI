import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformAnnouncement, AnnouncementType, AnnouncementTarget } from '../entities/platform-announcement.entity';

@Injectable()
export class CommunicationCenterService {
  constructor(
    @InjectRepository(PlatformAnnouncement)
    private announcementRepository: Repository<PlatformAnnouncement>,
  ) {}

  async createAnnouncement(data: {
    title: string;
    message: string;
    type: AnnouncementType;
    targetType: AnnouncementTarget;
    targetOrganizations?: string[];
    targetTier?: string;
    expiresAt?: Date;
  }) {
    const announcement = this.announcementRepository.create(data as any);
    return this.announcementRepository.save(announcement);
  }

  async getAllAnnouncements() {
    return this.announcementRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateAnnouncement(id: string) {
    await this.announcementRepository.update({ id }, { isActive: false });
    return this.announcementRepository.findOne({ where: { id } });
  }

  async sendBulkEmail(data: { subject: string; body: string; recipientType: string; organizationIds?: string[] }) {
    // Mock email sending - integrate with SendGrid/AWS SES in production
    return {
      success: true,
      messageId: `msg-${Date.now()}`,
      recipientCount: data.organizationIds?.length || 100,
      sentAt: new Date(),
    };
  }
}
