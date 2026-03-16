import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import { EmailNotificationService } from '../services/email-notification.service';
import type { EmailTemplate } from '../services/email-notification.service';
import { NotificationSchedulerService } from '../services/notification-scheduler.service';

/**
 * Notification Controller
 * Handles email notification operations
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly notificationSchedulerService: NotificationSchedulerService,
  ) {}

  /**
   * Send Test Email
   * POST /notifications/test
   */
  @Post('test')
  @UserTypes(UserType.SUPER_ADMIN)
  async sendTestEmail(@Body() body: { email: string }) {
    await this.notificationSchedulerService.sendTestNotification(body.email);
    return {
      message: 'Test email sent successfully',
      data: { email: body.email },
    };
  }

  /**
   * Send Welcome Emails Batch
   * POST /notifications/welcome-batch/:organizationId
   */
  @Post('welcome-batch/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async sendWelcomeEmailBatch(@Param('organizationId') organizationId: string) {
    await this.notificationSchedulerService.sendWelcomeEmailBatch(organizationId);
    return {
      message: 'Welcome emails sent successfully',
      data: { organizationId },
    };
  }

  /**
   * Send Bulk Emails
   * POST /notifications/bulk
   */
  @Post('bulk')
  @UserTypes(UserType.SUPER_ADMIN)
  async sendBulkEmails(
    @Body()
    body: {
      recipients: { email: string; context: Record<string, any> }[];
      subject: string;
      template: EmailTemplate;
    },
  ) {
    const message = body.template.text || body.template.html || '';
    const result = await this.emailNotificationService.sendBulkEmail(
      body.recipients,
      body.subject,
      message,
    );
    return {
      message: 'Bulk emails processed',
      data: result,
    };
  }

  /**
   * Notify Organization Admins
   * POST /notifications/notify-admins/:organizationId
   */
  @Post('notify-admins/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN)
  async notifyOrganizationAdmins(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      subject: string;
      template: EmailTemplate;
      context: Record<string, any>;
    },
  ) {
    await this.emailNotificationService.notifyOrganizationAdmins(
      organizationId,
      body.subject,
      body.template,
      body.context,
    );
    return {
      message: 'Organization admins notified successfully',
      data: { organizationId },
    };
  }

  /**
   * Manual Trigger: Check Trial Endings
   * POST /notifications/triggers/trial-endings
   */
  @Post('triggers/trial-endings')
  @UserTypes(UserType.SUPER_ADMIN)
  async triggerTrialEndingsCheck() {
    await this.notificationSchedulerService.checkTrialEndings();
    return {
      message: 'Trial endings check triggered successfully',
    };
  }

  /**
   * Manual Trigger: Check Failed Payments
   * POST /notifications/triggers/failed-payments
   */
  @Post('triggers/failed-payments')
  @UserTypes(UserType.SUPER_ADMIN)
  async triggerFailedPaymentsCheck() {
    await this.notificationSchedulerService.checkFailedPayments();
    return {
      message: 'Failed payments check triggered successfully',
    };
  }

  /**
   * Manual Trigger: Check Seat Limits
   * POST /notifications/triggers/seat-limits
   */
  @Post('triggers/seat-limits')
  @UserTypes(UserType.SUPER_ADMIN)
  async triggerSeatLimitsCheck() {
    await this.notificationSchedulerService.checkSeatLimits();
    return {
      message: 'Seat limits check triggered successfully',
    };
  }

  /**
   * Manual Trigger: Check Subscription Renewals
   * POST /notifications/triggers/subscription-renewals
   */
  @Post('triggers/subscription-renewals')
  @UserTypes(UserType.SUPER_ADMIN)
  async triggerSubscriptionRenewalsCheck() {
    await this.notificationSchedulerService.checkSubscriptionRenewals();
    return {
      message: 'Subscription renewals check triggered successfully',
    };
  }

  /**
   * Manual Trigger: Send Monthly Usage Reports
   * POST /notifications/triggers/monthly-reports
   */
  @Post('triggers/monthly-reports')
  @UserTypes(UserType.SUPER_ADMIN)
  async triggerMonthlyReports() {
    await this.notificationSchedulerService.sendMonthlyUsageReport();
    return {
      message: 'Monthly usage reports sent successfully',
    };
  }

  /**
   * Get Available Email Templates
   * GET /notifications/templates
   */
  @Get('templates')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getEmailTemplates() {
    const templates = [
      'welcome',
      'trial_ending',
      'payment_failed',
      'seat_limit_reached',
      'subscription_renewal',
      'feature_announcement',
      'system_maintenance',
    ];
    return {
      message: 'Email templates retrieved successfully',
      data: { templates },
    };
  }

  @Get()
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN, UserType.ORG_USER)
  async getNotifications() {
    return {
      success: true,
      data: [{ id: 'notif-1', title: 'Test', read: false }],
    };
  }

  @Post('send')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async sendNotification(@Body() data: any) {
    return {
      success: true,
      message: 'Notification sent',
      timestamp: new Date(),
    };
  }

  @Put(':id/read')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN, UserType.ORG_USER)
  async markAsRead(@Param('id') id: string) {
    return {
      success: true,
      data: { id, read: true },
      message: 'Notification marked as read',
    };
  }

}
