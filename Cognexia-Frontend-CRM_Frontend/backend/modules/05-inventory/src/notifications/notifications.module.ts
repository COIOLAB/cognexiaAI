import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Services
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { PushNotificationService } from './services/push-notification.service';
import { WebSocketService } from './services/websocket.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { NotificationAuditService } from './services/notification-audit.service';
import { RealTimeNotificationService } from './services/realtime-notification.service';
import { EventDrivenNotificationService } from './services/event-driven-notification.service';
import { NotificationDeliveryService } from './services/notification-delivery.service';
import { NotificationAnalyticsService } from './services/notification-analytics.service';

// Controllers
import { NotificationController } from './controllers/notification.controller';
import { NotificationPreferencesController } from './controllers/notification-preferences.controller';
import { NotificationTemplateController } from './controllers/notification-template.controller';
import { WebSocketGateway } from './gateways/websocket.gateway';

// Entities
import { Notification } from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationAudit } from './entities/notification-audit.entity';
import { NotificationSubscription } from './entities/notification-subscription.entity';
import { NotificationChannel } from './entities/notification-channel.entity';
import { NotificationRule } from './entities/notification-rule.entity';

// Processors
import { EmailProcessor } from './processors/email.processor';
import { SMSProcessor } from './processors/sms.processor';
import { PushNotificationProcessor } from './processors/push-notification.processor';
import { WebhookProcessor } from './processors/webhook.processor';

// Event Listeners
import { InventoryEventListener } from './listeners/inventory-event.listener';
import { SecurityEventListener } from './listeners/security-event.listener';
import { SystemEventListener } from './listeners/system-event.listener';

// Providers
import { NotificationProviderFactory } from './providers/notification-provider.factory';
import { SendGridEmailProvider } from './providers/sendgrid.provider';
import { TwilioSMSProvider } from './providers/twilio.provider';
import { FirebasePushProvider } from './providers/firebase.provider';
import { SlackProvider } from './providers/slack.provider';
import { TeamsProvider } from './providers/teams.provider';
import { WebhookProvider } from './providers/webhook.provider';

// Interceptors and Guards
import { NotificationThrottleInterceptor } from './interceptors/notification-throttle.interceptor';
import { NotificationAuthGuard } from './guards/notification-auth.guard';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Notification,
      NotificationTemplate,
      NotificationPreference,
      NotificationAudit,
      NotificationSubscription,
      NotificationChannel,
      NotificationRule,
    ]),
    BullModule.registerQueue(
      { name: 'email-notifications' },
      { name: 'sms-notifications' },
      { name: 'push-notifications' },
      { name: 'webhook-notifications' },
      { name: 'realtime-notifications' },
    ),
  ],
  controllers: [
    NotificationController,
    NotificationPreferencesController,
    NotificationTemplateController,
  ],
  providers: [
    // Core Services
    NotificationService,
    EmailService,
    SMSService,
    PushNotificationService,
    WebSocketService,
    NotificationTemplateService,
    NotificationPreferencesService,
    NotificationAuditService,
    RealTimeNotificationService,
    EventDrivenNotificationService,
    NotificationDeliveryService,
    NotificationAnalyticsService,

    // Gateways
    WebSocketGateway,

    // Queue Processors
    EmailProcessor,
    SMSProcessor,
    PushNotificationProcessor,
    WebhookProcessor,

    // Event Listeners
    InventoryEventListener,
    SecurityEventListener,
    SystemEventListener,

    // Providers Factory and Implementations
    NotificationProviderFactory,
    SendGridEmailProvider,
    TwilioSMSProvider,
    FirebasePushProvider,
    SlackProvider,
    TeamsProvider,
    WebhookProvider,

    // Interceptors and Guards
    NotificationThrottleInterceptor,
    NotificationAuthGuard,
  ],
  exports: [
    NotificationService,
    EmailService,
    SMSService,
    PushNotificationService,
    WebSocketService,
    NotificationTemplateService,
    NotificationPreferencesService,
    RealTimeNotificationService,
    EventDrivenNotificationService,
    NotificationDeliveryService,
    NotificationAnalyticsService,
    WebSocketGateway,
  ],
})
export class NotificationsModule {}
