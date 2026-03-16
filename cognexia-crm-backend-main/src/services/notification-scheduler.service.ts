import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { EmailNotificationService } from './email-notification.service';

/**
 * Notification Scheduler Service
 * Handles automated email notifications based on scheduled tasks
 * 
 * NOTE: Requires @nestjs/schedule package
 * npm install @nestjs/schedule
 */
@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailNotificationService: EmailNotificationService,
  ) {}

  private wrapMessage(message: string): string {
    return `<p>${message}</p>`;
  }

  /**
   * Check Trial Endings (Daily at 9 AM)
   * Notify organizations with trials ending in 7, 3, and 1 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkTrialEndings(): Promise<void> {
    this.logger.log('Running trial endings check...');

    try {
      const today = new Date();
      const warningDays = [7, 3, 1];

      for (const days of warningDays) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const organizations = await this.organizationRepository.find({
          where: {
            subscriptionStatus: SubscriptionStatus.TRIAL,
            subscriptionEndDate: Between(targetDate, nextDay),
            isActive: true,
          },
        });

        for (const org of organizations) {
          const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
          
          for (const admin of admins) {
            await this.emailNotificationService.sendTrialEndingEmail(admin, org, days);
          }

          this.logger.log(`Sent trial ending notification (${days} days) to ${org.name}`);
        }
      }

      this.logger.log('Trial endings check completed');
    } catch (error) {
      this.logger.error('Failed to check trial endings', error);
    }
  }

  /**
   * Check Payment Method Expiry (Daily at 10 AM)
   * Notify organizations with payment methods expiring soon
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkPaymentMethodExpiry(): Promise<void> {
    this.logger.log('Running payment method expiry check...');

    try {
      const today = new Date();
      const in30Days = new Date(today);
      in30Days.setDate(in30Days.getDate() + 30);

      // Check organizations with active subscriptions
      const organizations = await this.organizationRepository.find({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          isActive: true,
        },
      });

      for (const org of organizations) {
        if (org.stripeCustomerId) {
          // Check metadata for payment method expiry
          const paymentMethodExpiry = org.metadata?.paymentMethodExpiry;
          
          if (paymentMethodExpiry) {
            const expiryDate = new Date(paymentMethodExpiry);
            const daysUntilExpiry = Math.ceil(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Notify if expiring within 30 days
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
              const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
              
              for (const admin of admins) {
                await this.emailNotificationService.sendPaymentMethodExpiring(
                  admin,
                  org,
                  org.metadata?.paymentMethodLast4 || '****',
                  expiryDate,
                );
              }

              this.logger.log(`Sent payment method expiry warning to ${org.name}`);
            }
          }
        }
      }

      this.logger.log('Payment method expiry check completed');
    } catch (error) {
      this.logger.error('Failed to check payment method expiry', error);
    }
  }

  /**
   * Check Failed Payments (Every 6 Hours)
   * Send reminders for organizations with past_due status
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async checkFailedPayments(): Promise<void> {
    this.logger.log('Running failed payments check...');

    try {
      const organizations = await this.organizationRepository.find({
        where: {
          subscriptionStatus: SubscriptionStatus.PAST_DUE,
          isActive: true,
        },
      });

      for (const org of organizations) {
        const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
        
        for (const admin of admins) {
          await this.emailNotificationService.sendPaymentFailed(
            admin,
            org,
            org.monthlyRevenue,
            'Payment method declined',
          );
        }

        this.logger.log(`Sent payment failed reminder to ${org.name}`);
      }

      this.logger.log('Failed payments check completed');
    } catch (error) {
      this.logger.error('Failed to check failed payments', error);
    }
  }

  /**
   * Check Seat Limits (Daily at 11 AM)
   * Notify organizations approaching or at seat limits
   */
  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async checkSeatLimits(): Promise<void> {
    this.logger.log('Running seat limits check...');

    try {
      const organizations = await this.organizationRepository
        .createQueryBuilder('org')
        .where('org.userCount >= org.maxUsers * 0.9') // 90% or more
        .andWhere('org.isActive = :isActive', { isActive: true })
        .getMany();

      for (const org of organizations) {
        // Only notify if at or very close to limit
        if (org.currentUserCount >= org.maxUsers * 0.95) {
          const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
          
          for (const admin of admins) {
            await this.emailNotificationService.sendSeatLimitReached(admin, org);
          }

          this.logger.log(`Sent seat limit notification to ${org.name}`);
        }
      }

      this.logger.log('Seat limits check completed');
    } catch (error) {
      this.logger.error('Failed to check seat limits', error);
    }
  }

  /**
   * Check Subscription Renewals (Daily at 8 AM)
   * Send renewal reminders for upcoming billing dates
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkSubscriptionRenewals(): Promise<void> {
    this.logger.log('Running subscription renewals check...');

    try {
      const today = new Date();
      const in3Days = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);
      in3Days.setHours(0, 0, 0, 0);

      const in4Days = new Date(in3Days);
      in4Days.setDate(in4Days.getDate() + 1);

      const organizations = await this.organizationRepository.find({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          nextBillingDate: Between(in3Days, in4Days),
          isActive: true,
        },
      });

      for (const org of organizations) {
        const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
        
        for (const admin of admins) {
          const userName = `${admin.firstName} ${admin.lastName}`.trim();
          const renewalDate = org.nextBillingDate?.toLocaleDateString() || 'soon';
          const message = `Hi ${userName}, your subscription for ${org.name} renews on ${renewalDate}.`;
          await this.emailNotificationService.sendEmail(
            admin.email,
            'Upcoming Subscription Renewal',
            this.wrapMessage(message),
          );
        }

        this.logger.log(`Sent renewal reminder to ${org.name}`);
      }

      this.logger.log('Subscription renewals check completed');
    } catch (error) {
      this.logger.error('Failed to check subscription renewals', error);
    }
  }

  /**
   * Check Inactive Users (Weekly on Monday at 9 AM)
   * Send re-engagement emails to inactive users
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async checkInactiveUsers(): Promise<void> {
    this.logger.log('Running inactive users check...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const inactiveUsers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.lastLoginAt < :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .andWhere('user.userType != :superAdmin', { superAdmin: 'super_admin' })
        .limit(100) // Limit to prevent email overload
        .getMany();

      for (const user of inactiveUsers) {
        const org = await this.organizationRepository.findOne({
          where: { id: user.organizationId },
        });

        if (org) {
          const userName = `${user.firstName} ${user.lastName}`.trim();
          const loginUrl = `${process.env.APP_URL}/login`;
          const message = `Hi ${userName}, we noticed you haven't logged in recently. Visit ${loginUrl} to see what's new at ${org.name}.`;
          await this.emailNotificationService.sendEmail(
            user.email,
            'We Miss You! Come Back to CognexiaAI',
            this.wrapMessage(message),
          );
        }
      }

      this.logger.log(`Sent re-engagement emails to ${inactiveUsers.length} users`);
    } catch (error) {
      this.logger.error('Failed to check inactive users', error);
    }
  }

  /**
   * Send Monthly Usage Report (First day of month at 9 AM)
   */
  @Cron('0 9 1 * *') // At 9 AM on the 1st day of every month
  async sendMonthlyUsageReport(): Promise<void> {
    this.logger.log('Sending monthly usage reports...');

    try {
      const organizations = await this.organizationRepository.find({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          isActive: true,
        },
      });

      for (const org of organizations) {
        const admins = await this.emailNotificationService.getOrganizationAdmins(org.id);
        
        // Generate comprehensive usage statistics
        const usageStats = {
          activeUsers: org.currentUserCount,
          totalUsers: org.maxUsers,
          usagePercentage: org.maxUsers > 0 ? Math.round((org.currentUserCount / org.maxUsers) * 100) : 0,
          storageUsed: org.metadata?.storageUsedMB || 0,
          storageLimit: org.metadata?.storageLimit || 10240, // 10GB default
          storagePercentage: 0,
          apiCalls: org.metadata?.monthlyApiCalls || 0,
          apiLimit: org.metadata?.apiCallsLimit || 100000,
          apiPercentage: 0,
          topFeatures: org.metadata?.topFeatures || ['CRM', 'Sales', 'Analytics'],
        };

        // Calculate percentages
        usageStats.storagePercentage = usageStats.storageLimit > 0
          ? Math.round((usageStats.storageUsed / usageStats.storageLimit) * 100)
          : 0;
        usageStats.apiPercentage = usageStats.apiLimit > 0
          ? Math.round((usageStats.apiCalls / usageStats.apiLimit) * 100)
          : 0;

        for (const admin of admins) {
          const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
          const message = `Monthly usage report for ${org.name} (${monthLabel}). Active users: ${usageStats.activeUsers}/${usageStats.totalUsers}.`;
          await this.emailNotificationService.sendEmail(
            admin.email,
            `Monthly Usage Report - ${org.name}`,
            this.wrapMessage(message),
          );
        }

        // Reset monthly metrics for next period
        org.metadata = {
          ...org.metadata,
          monthlyApiCalls: 0,
          previousMonthApiCalls: usageStats.apiCalls,
          lastReportSentAt: new Date().toISOString(),
        };
        await this.organizationRepository.save(org);

        this.logger.log(`Sent monthly usage report to ${org.name}`);
      }

      this.logger.log('Monthly usage reports completed');
    } catch (error) {
      this.logger.error('Failed to send monthly usage reports', error);
    }
  }

  /**
   * Clean Up Expired Invitations (Daily at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanUpExpiredInvitations(): Promise<void> {
    this.logger.log('Cleaning up expired invitations...');

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.userRepository
        .createQueryBuilder()
        .delete()
        .where('invitationSentAt < :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('invitationAcceptedAt IS NULL')
        .andWhere('isActive = :isActive', { isActive: false })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} expired invitations`);
    } catch (error) {
      this.logger.error('Failed to clean up expired invitations', error);
    }
  }

  /**
   * Manual trigger: Send test notification
   */
  async sendTestNotification(email: string): Promise<void> {
    this.logger.log(`Sending test notification to ${email}`);

    await this.emailNotificationService.sendEmail(
      email,
      'Test Notification - CognexiaAI',
      this.wrapMessage('This is a test notification from the CognexiaAI notification system.'),
    );
  }

  /**
   * Manual trigger: Send welcome email batch
   */
  async sendWelcomeEmailBatch(organizationId: string): Promise<void> {
    this.logger.log(`Sending welcome emails for organization ${organizationId}`);

    const users = await this.userRepository.find({
      where: {
        organizationId,
        isActive: true,
      },
    });

    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      this.logger.error(`Organization ${organizationId} not found`);
      return;
    }

    for (const user of users) {
      await this.emailNotificationService.sendWelcomeEmail(user, org);
    }

    this.logger.log(`Sent welcome emails to ${users.length} users`);
  }
}
