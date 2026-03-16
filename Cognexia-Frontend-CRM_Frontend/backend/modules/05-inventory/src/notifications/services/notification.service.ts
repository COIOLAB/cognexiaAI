import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory,
  NotificationContent,
  NotificationMetadata,
} from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { User } from '../../rbac/entities/User.entity';

import { NotificationTemplateService } from './notification-template.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationAnalyticsService } from './notification-analytics.service';

export interface CreateNotificationDto {
  type: NotificationType | NotificationType[];
  category: NotificationCategory;
  priority?: NotificationPriority;
  recipientId?: string;
  recipientIds?: string[];
  content: NotificationContent;
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  metadata?: Partial<NotificationMetadata>;
  tags?: string[];
  batchId?: string;
  isTest?: boolean;
}

export interface BulkNotificationDto extends CreateNotificationDto {
  recipientIds: string[];
  segmentIds?: string[];
  excludeIds?: string[];
  throttle?: {
    rate: number; // notifications per minute
    interval: number; // seconds between batches
  };
}

export interface NotificationFilters {
  type?: NotificationType[];
  status?: NotificationStatus[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  recipientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  isTest?: boolean;
}

export interface NotificationStats {
  total: number;
  byStatus: Record<NotificationStatus, number>;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  failureRate: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('email-notifications') private emailQueue: Queue,
    @InjectQueue('sms-notifications') private smsQueue: Queue,
    @InjectQueue('push-notifications') private pushQueue: Queue,
    @InjectQueue('webhook-notifications') private webhookQueue: Queue,
    @InjectQueue('realtime-notifications') private realtimeQueue: Queue,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private templateService: NotificationTemplateService,
    private preferencesService: NotificationPreferencesService,
    private auditService: NotificationAuditService,
    private analyticsService: NotificationAnalyticsService,
  ) {}

  /**
   * Create and send a single notification
   */
  async create(dto: CreateNotificationDto, userId?: string): Promise<Notification> {
    try {
      // Validate input
      this.validateCreateDto(dto);

      // Handle multiple types
      if (Array.isArray(dto.type)) {
        return await this.createMultiTypeNotification(dto, userId);
      }

      // Get recipient user
      const recipient = await this.getRecipientUser(dto.recipientId!);
      if (!recipient) {
        throw new BadRequestException('Recipient not found');
      }

      // Check user preferences
      const canSend = await this.preferencesService.canSendNotification(
        recipient.id,
        dto.type,
        dto.category
      );

      if (!canSend && !dto.isTest) {
        this.logger.warn(`Notification blocked by user preferences: ${recipient.id}`);
        return null;
      }

      // Process template if provided
      let content = dto.content;
      if (dto.templateId) {
        content = await this.templateService.processTemplate(
          dto.templateId,
          dto.templateData || {},
          recipient
        );
      }

      // Create notification
      const notification = await this.createNotificationEntity(dto, recipient, content);

      // Save to database
      const savedNotification = await this.notificationRepository.save(notification);

      // Queue for delivery
      await this.queueNotification(savedNotification);

      // Emit event
      this.eventEmitter.emit('notification.created', {
        notification: savedNotification,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(
        savedNotification.id,
        'created',
        { dto },
        userId
      );

      this.logger.log(`Notification created: ${savedNotification.id}`);
      return savedNotification;

    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  /**
   * Create bulk notifications
   */
  async createBulk(dto: BulkNotificationDto, userId?: string): Promise<{
    batchId: string;
    totalNotifications: number;
    queuedNotifications: number;
    skippedNotifications: number;
  }> {
    try {
      const batchId = dto.batchId || crypto.randomUUID();
      let totalNotifications = 0;
      let queuedNotifications = 0;
      let skippedNotifications = 0;

      // Get recipients
      let recipientIds = dto.recipientIds || [];

      // Add segment recipients if provided
      if (dto.segmentIds?.length) {
        const segmentRecipients = await this.getSegmentRecipients(dto.segmentIds);
        recipientIds = [...new Set([...recipientIds, ...segmentRecipients])];
      }

      // Remove excluded recipients
      if (dto.excludeIds?.length) {
        recipientIds = recipientIds.filter(id => !dto.excludeIds.includes(id));
      }

      totalNotifications = recipientIds.length;

      // Process in batches to avoid overwhelming the system
      const batchSize = this.configService.get('NOTIFICATION_BATCH_SIZE', 100);
      const batches = this.chunkArray(recipientIds, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        // Create notifications for this batch
        const notifications: Notification[] = [];
        
        for (const recipientId of batch) {
          try {
            const recipient = await this.getRecipientUser(recipientId);
            if (!recipient) {
              skippedNotifications++;
              continue;
            }

            // Check preferences
            const types = Array.isArray(dto.type) ? dto.type : [dto.type];
            let hasValidType = false;

            for (const type of types) {
              const canSend = await this.preferencesService.canSendNotification(
                recipientId,
                type,
                dto.category
              );

              if (canSend || dto.isTest) {
                // Process template if provided
                let content = dto.content;
                if (dto.templateId) {
                  content = await this.templateService.processTemplate(
                    dto.templateId,
                    dto.templateData || {},
                    recipient
                  );
                }

                const notificationDto: CreateNotificationDto = {
                  ...dto,
                  type,
                  recipientId,
                  batchId,
                };

                const notification = await this.createNotificationEntity(
                  notificationDto,
                  recipient,
                  content
                );
                notifications.push(notification);
                hasValidType = true;
              }
            }

            if (!hasValidType) {
              skippedNotifications++;
            }

          } catch (error) {
            this.logger.error(`Failed to create notification for recipient ${recipientId}`, error);
            skippedNotifications++;
          }
        }

        // Bulk save notifications
        if (notifications.length > 0) {
          const savedNotifications = await this.notificationRepository.save(notifications);
          
          // Queue notifications with throttling
          if (dto.throttle) {
            await this.queueNotificationsWithThrottle(savedNotifications, dto.throttle);
          } else {
            await Promise.all(
              savedNotifications.map(notification => this.queueNotification(notification))
            );
          }

          queuedNotifications += savedNotifications.length;
        }

        // Add delay between batches if specified
        if (dto.throttle?.interval && i < batches.length - 1) {
          await this.sleep(dto.throttle.interval * 1000);
        }
      }

      // Emit bulk creation event
      this.eventEmitter.emit('notification.bulk_created', {
        batchId,
        totalNotifications,
        queuedNotifications,
        skippedNotifications,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(
        null,
        'bulk_created',
        { batchId, totalNotifications, queuedNotifications, skippedNotifications },
        userId
      );

      this.logger.log(`Bulk notifications created: ${queuedNotifications}/${totalNotifications}`);

      return {
        batchId,
        totalNotifications,
        queuedNotifications,
        skippedNotifications,
      };

    } catch (error) {
      this.logger.error('Failed to create bulk notifications', error);
      throw error;
    }
  }

  /**
   * Get notifications with filtering and pagination
   */
  async findMany(
    filters: NotificationFilters = {},
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

      // Apply filters
      if (filters.type?.length) {
        queryBuilder.andWhere('notification.type IN (:...types)', { types: filters.type });
      }

      if (filters.status?.length) {
        queryBuilder.andWhere('notification.status IN (:...statuses)', { statuses: filters.status });
      }

      if (filters.category?.length) {
        queryBuilder.andWhere('notification.category IN (:...categories)', { categories: filters.category });
      }

      if (filters.priority?.length) {
        queryBuilder.andWhere('notification.priority IN (:...priorities)', { priorities: filters.priority });
      }

      if (filters.recipientId) {
        queryBuilder.andWhere('notification.recipientId = :recipientId', { recipientId: filters.recipientId });
      }

      if (filters.dateFrom) {
        queryBuilder.andWhere('notification.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
      }

      if (filters.dateTo) {
        queryBuilder.andWhere('notification.createdAt <= :dateTo', { dateTo: filters.dateTo });
      }

      if (filters.tags?.length) {
        queryBuilder.andWhere('notification.tags && :tags', { tags: filters.tags });
      }

      if (filters.isTest !== undefined) {
        queryBuilder.andWhere('notification.isTest = :isTest', { isTest: filters.isTest });
      }

      // Add sorting
      queryBuilder.orderBy(`notification.${sortBy}`, sortOrder);

      // Add pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // Execute query
      const [notifications, total] = await queryBuilder.getManyAndCount();

      return {
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

    } catch (error) {
      this.logger.error('Failed to fetch notifications', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async findById(id: string): Promise<Notification | null> {
    try {
      return await this.notificationRepository.findOne({
        where: { id },
        relations: ['recipient', 'template', 'auditTrail'],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch notification ${id}`, error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId?: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new BadRequestException('Notification not found');
      }

      notification.markAsRead();
      const updatedNotification = await this.notificationRepository.save(notification);

      // Emit event
      this.eventEmitter.emit('notification.read', {
        notification: updatedNotification,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(id, 'marked_as_read', {}, userId);

      return updatedNotification;

    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${id}`, error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  async cancel(id: string, userId?: string): Promise<Notification> {
    try {
      const notification = await this.findById(id);
      if (!notification) {
        throw new BadRequestException('Notification not found');
      }

      if (notification.status === NotificationStatus.SENT || 
          notification.status === NotificationStatus.DELIVERED) {
        throw new BadRequestException('Cannot cancel already sent notification');
      }

      notification.status = NotificationStatus.CANCELLED;
      const updatedNotification = await this.notificationRepository.save(notification);

      // Remove from queues
      await this.removeFromQueues(id);

      // Emit event
      this.eventEmitter.emit('notification.cancelled', {
        notification: updatedNotification,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(id, 'cancelled', {}, userId);

      return updatedNotification;

    } catch (error) {
      this.logger.error(`Failed to cancel notification: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(filters: NotificationFilters = {}): Promise<NotificationStats> {
    try {
      return await this.analyticsService.getNotificationStats(filters);
    } catch (error) {
      this.logger.error('Failed to get notification stats', error);
      throw error;
    }
  }

  /**
   * Cleanup old notifications (scheduled task)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldNotifications(): Promise<void> {
    try {
      const retentionDays = this.configService.get('NOTIFICATION_RETENTION_DAYS', 90);
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const result = await this.notificationRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .andWhere('status IN (:...finalStatuses)', {
          finalStatuses: [
            NotificationStatus.DELIVERED,
            NotificationStatus.READ,
            NotificationStatus.FAILED,
            NotificationStatus.CANCELLED,
            NotificationStatus.EXPIRED,
          ],
        })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} old notifications`);

    } catch (error) {
      this.logger.error('Failed to cleanup old notifications', error);
    }
  }

  /**
   * Process failed notifications for retry
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    try {
      const failedNotifications = await this.notificationRepository.find({
        where: {
          status: NotificationStatus.FAILED,
        },
        take: 100, // Process in batches
      });

      let retriedCount = 0;

      for (const notification of failedNotifications) {
        if (notification.canRetry()) {
          await this.queueNotification(notification);
          retriedCount++;
        }
      }

      if (retriedCount > 0) {
        this.logger.log(`Retried ${retriedCount} failed notifications`);
      }

    } catch (error) {
      this.logger.error('Failed to retry failed notifications', error);
    }
  }

  // Private helper methods
  private validateCreateDto(dto: CreateNotificationDto): void {
    if (!dto.recipientId && !dto.recipientIds?.length) {
      throw new BadRequestException('Recipient ID or IDs must be provided');
    }

    if (!dto.content && !dto.templateId) {
      throw new BadRequestException('Content or template ID must be provided');
    }
  }

  private async createMultiTypeNotification(dto: CreateNotificationDto, userId?: string): Promise<Notification> {
    const types = dto.type as NotificationType[];
    const notifications: Notification[] = [];

    const recipient = await this.getRecipientUser(dto.recipientId!);
    if (!recipient) {
      throw new BadRequestException('Recipient not found');
    }

    for (const type of types) {
      const canSend = await this.preferencesService.canSendNotification(
        recipient.id,
        type,
        dto.category
      );

      if (canSend || dto.isTest) {
        const singleDto = { ...dto, type };
        const notification = await this.createNotificationEntity(singleDto, recipient, dto.content);
        notifications.push(notification);
      }
    }

    if (notifications.length === 0) {
      throw new BadRequestException('No valid notification types for recipient');
    }

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Queue all notifications
    await Promise.all(
      savedNotifications.map(notification => this.queueNotification(notification))
    );

    // Return the first notification (primary one)
    return savedNotifications[0];
  }

  private async createNotificationEntity(
    dto: CreateNotificationDto,
    recipient: User,
    content: NotificationContent
  ): Promise<Notification> {
    const notification = new Notification();
    
    notification.type = dto.type as NotificationType;
    notification.category = dto.category;
    notification.priority = dto.priority || NotificationPriority.NORMAL;
    notification.recipientId = recipient.id;
    notification.content = content;
    notification.templateId = dto.templateId;
    notification.scheduledAt = dto.scheduledAt;
    notification.batchId = dto.batchId;
    notification.isTest = dto.isTest || false;
    notification.tags = dto.tags;
    
    // Set recipient contact info based on type
    switch (notification.type) {
      case NotificationType.EMAIL:
        notification.recipientEmail = recipient.email;
        break;
      case NotificationType.SMS:
        notification.recipientPhone = recipient.phoneNumber;
        break;
      case NotificationType.PUSH:
        // Device token would be retrieved from user device registrations
        break;
    }

    // Set metadata
    notification.metadata = {
      source: 'inventory-management',
      correlationId: dto.metadata?.correlationId || crypto.randomUUID(),
      tags: dto.tags || [],
      customData: dto.metadata?.customData || {},
      analytics: {
        trackOpens: true,
        trackClicks: true,
        trackConversions: false,
        ...dto.metadata?.analytics,
      },
      scheduling: {
        retryCount: 0,
        maxRetries: 3,
        ...dto.metadata?.scheduling,
      },
      personalization: {
        language: recipient.preferredLanguage || 'en',
        locale: recipient.locale || 'en-US',
        ...dto.metadata?.personalization,
      },
    };

    return notification;
  }

  private async queueNotification(notification: Notification): Promise<void> {
    const jobOptions = {
      delay: notification.scheduledAt ? 
        Math.max(0, notification.scheduledAt.getTime() - Date.now()) : 0,
      attempts: notification.maxRetries,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 50,
      removeOnFail: 20,
    };

    const jobData = {
      notificationId: notification.id,
      type: notification.type,
      priority: notification.priority,
    };

    switch (notification.type) {
      case NotificationType.EMAIL:
        await this.emailQueue.add('send-email', jobData, jobOptions);
        break;
      case NotificationType.SMS:
        await this.smsQueue.add('send-sms', jobData, jobOptions);
        break;
      case NotificationType.PUSH:
        await this.pushQueue.add('send-push', jobData, jobOptions);
        break;
      case NotificationType.WEBHOOK:
        await this.webhookQueue.add('send-webhook', jobData, jobOptions);
        break;
      case NotificationType.WEBSOCKET:
      case NotificationType.IN_APP:
        await this.realtimeQueue.add('send-realtime', jobData, jobOptions);
        break;
      default:
        this.logger.warn(`Unknown notification type: ${notification.type}`);
    }
  }

  private async queueNotificationsWithThrottle(
    notifications: Notification[],
    throttle: { rate: number; interval: number }
  ): Promise<void> {
    const batchSize = Math.ceil(throttle.rate / (60 / throttle.interval));
    const batches = this.chunkArray(notifications, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      await Promise.all(
        batch.map(notification => this.queueNotification(notification))
      );

      if (i < batches.length - 1) {
        await this.sleep(throttle.interval * 1000);
      }
    }
  }

  private async getRecipientUser(recipientId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: recipientId },
    });
  }

  private async getSegmentRecipients(segmentIds: string[]): Promise<string[]> {
    // This would integrate with a user segmentation service
    // For now, return empty array
    return [];
  }

  private async removeFromQueues(notificationId: string): Promise<void> {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.pushQueue,
      this.webhookQueue,
      this.realtimeQueue,
    ];

    for (const queue of queues) {
      const jobs = await queue.getJobs(['waiting', 'delayed', 'active']);
      const jobsToRemove = jobs.filter(job => job.data.notificationId === notificationId);
      
      for (const job of jobsToRemove) {
        await job.remove();
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
