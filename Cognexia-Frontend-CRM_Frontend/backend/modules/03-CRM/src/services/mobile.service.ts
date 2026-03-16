import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';
import { MobileDevice, DeviceStatus } from '../entities/mobile-device.entity';
import { PushNotification, NotificationStatus, NotificationCategory } from '../entities/push-notification.entity';
import { OfflineSync, SyncStatus } from '../entities/offline-sync.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { NotificationProviderHealth, ProviderHealthStatus } from '../entities/notification-provider-health.entity';
import { PhoneVerification, PhoneVerificationStatus } from '../entities/phone-verification.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import {
  RegisterDeviceDto,
  UpdateDeviceDto,
  SendNotificationDto,
  BatchSyncDto,
  SyncResponse,
  NotificationTemplateDto,
} from '../dto/mobile.dto';
import { NotificationChannel, MessagingProvider } from '../types/messaging.types';

type MessagingSettings = {
  channel?: NotificationChannel | string;
  provider?: MessagingProvider | string;
  smsProvider?: MessagingProvider | string;
  whatsappProvider?: MessagingProvider | string;
  voiceProvider?: MessagingProvider | string;
  fallbackChannel?: NotificationChannel | string;
  routingRules?: Array<{
    name?: string;
    match?: {
      segment?: string;
      vip?: boolean;
      userType?: string;
      role?: string;
      tag?: string;
    };
    operator?: 'AND' | 'OR';
    conditions?: Array<{
      field: string;
      value: string | boolean;
    }>;
    groups?: Array<{
      operator?: 'AND' | 'OR';
      conditions?: Array<{
        field: string;
        value: string | boolean;
      }>;
    }>;
    channel?: NotificationChannel | string;
    provider?: MessagingProvider | string;
  }>;
  providerOrder?: Partial<Record<NotificationChannel | string, Array<MessagingProvider | string>>>;
  quietHours?: {
    start?: string; // HH:mm
    end?: string; // HH:mm
    timezone?: string; // IANA
  };
  escalation?: Array<{
    afterMinutes: number;
    channel: NotificationChannel | string;
    provider?: MessagingProvider | string;
  }>;
  credentials?: {
    twilio?: { accountSid?: string; authToken?: string };
    vonage?: {
      apiKey?: string;
      apiSecret?: string;
      applicationId?: string;
      privateKey?: string;
    };
    messagebird?: { accessKey?: string };
  };
  fromNumbers?: {
    sms?: string;
    whatsapp?: string;
    voice?: string;
  };
};

@Injectable()
export class MobileDeviceService {
  constructor(
    @InjectRepository(MobileDevice)
    private readonly deviceRepo: Repository<MobileDevice>,
    @InjectRepository(PhoneVerification)
    private readonly phoneVerificationRepo: Repository<PhoneVerification>,
  ) {}

  async registerDevice(user_id: string, tenantId: string, dto: RegisterDeviceDto): Promise<MobileDevice> {
    const deviceName = dto.deviceName || `${dto.platform || 'DEVICE'}-${dto.deviceId}`;

    // Check if device already registered
    let device = await this.deviceRepo.findOne({
      where: { deviceId: dto.deviceId, tenantId },
    });

    if (device) {
      // Update existing device
      Object.assign(device, { ...dto, deviceName });
      device.status = DeviceStatus.ACTIVE;
      device.registeredAt = new Date();
      device.lastSeen = new Date();
    } else {
      // Create new device
      device = this.deviceRepo.create({
        ...dto,
        deviceName,
        userId: user_id,
        tenantId,
        status: DeviceStatus.ACTIVE,
        registeredAt: new Date(),
        lastSeen: new Date(),
      });
    }

    return this.deviceRepo.save(device);
  }

  async updateDevice(deviceId: string, tenantId: string, dto: UpdateDeviceDto): Promise<MobileDevice> {
    const device = await this.deviceRepo.findOne({
      where: { deviceId, tenantId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const shouldUpdateToken = dto.pushToken && dto.pushToken !== device.pushToken;
    Object.assign(device, dto);
    device.lastSeen = new Date();
    if (shouldUpdateToken) {
      device.pushTokenUpdatedAt = new Date();
    }

    return this.deviceRepo.save(device);
  }

  async updateHeartbeat(
    deviceId: string,
    tenantId: string,
    payload: { isOnline: boolean; batteryLevel?: number; networkType?: string },
  ): Promise<void> {
    await this.deviceRepo.update(
      { deviceId, tenantId },
      {
        isOnline: payload.isOnline,
        lastSeen: new Date(),
        batteryLevel: payload.batteryLevel,
        networkType: payload.networkType,
      },
    );
  }

  async getUserDevices(user_id: string, tenantId: string): Promise<MobileDevice[]> {
    try {
      const devices = await this.deviceRepo.find({
        where: { userId: user_id, tenantId },
        order: { lastSeen: 'DESC' },
      });
      return devices || [];
    } catch (error) {
      return [];
    }
  }

  async deregisterDevice(deviceId: string, tenantId: string): Promise<void> {
    await this.deviceRepo.update(
      { deviceId, tenantId },
      { status: DeviceStatus.DEREGISTERED, isOnline: false },
    );
  }

  async refreshPushToken(
    deviceId: string,
    tenantId: string,
    pushToken: string,
    pushTokenExpiresAt?: Date,
  ): Promise<MobileDevice> {
    const device = await this.deviceRepo.findOne({ where: { deviceId, tenantId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    device.pushToken = pushToken;
    device.pushTokenUpdatedAt = new Date();
    if (pushTokenExpiresAt) {
      device.pushTokenExpiresAt = pushTokenExpiresAt;
    }
    device.lastSeen = new Date();
    return this.deviceRepo.save(device);
  }

  async pairDevice(user_id: string, tenantId: string, deviceId: string, otp: string): Promise<MobileDevice> {
    const verification = await this.phoneVerificationRepo.findOne({
      where: { tenantId, userId: user_id, status: PhoneVerificationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    if (!verification) {
      throw new BadRequestException('No active OTP verification found');
    }
    if (verification.expiresAt < new Date()) {
      verification.status = PhoneVerificationStatus.EXPIRED;
      await this.phoneVerificationRepo.save(verification);
      throw new BadRequestException('OTP has expired');
    }

    const matches = await bcrypt.compare(otp, verification.otpHash);
    if (!matches) {
      verification.attempts += 1;
      await this.phoneVerificationRepo.save(verification);
      throw new BadRequestException('Invalid OTP');
    }

    const device = await this.deviceRepo.findOne({ where: { deviceId, tenantId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    device.isTrusted = true;
    device.trustedAt = new Date();
    device.trustMethod = 'OTP';
    await this.deviceRepo.save(device);

    return device;
  }
}

@Injectable()
export class PushNotificationService {
  constructor(
    @InjectRepository(PushNotification)
    private readonly notificationRepo: Repository<PushNotification>,
    @InjectRepository(MobileDevice)
    private readonly deviceRepo: Repository<MobileDevice>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NotificationTemplate)
    private readonly templateRepo: Repository<NotificationTemplate>,
    @InjectRepository(NotificationProviderHealth)
    private readonly providerHealthRepo: Repository<NotificationProviderHealth>,
    @InjectRepository(PhoneVerification)
    private readonly phoneVerificationRepo: Repository<PhoneVerification>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async sendNotification(tenantId: string, dto: SendNotificationDto): Promise<PushNotification> {
    if (!dto.userId) {
      throw new BadRequestException('userId is required');
    }

    const messagingSettings = await this.getMessagingSettings(tenantId);
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resolvedTemplate = dto.templateId
      ? await this.resolveTemplate(tenantId, dto.templateId, dto.templateVariables || {}, dto)
      : { title: dto.title, body: dto.body, channel: dto.channel };
    if (!resolvedTemplate.title || !resolvedTemplate.body) {
      throw new BadRequestException('Notification title and body are required');
    }

    const routing = user.preferences?.notificationRouting || {};
    const ruleRouting = this.resolveRoutingRule(user, messagingSettings);
    const preferredChannel = dto.channel || ruleRouting?.channel || routing?.preferredChannel;
    const channel = this.resolveChannel(preferredChannel, messagingSettings);
    const provider = this.resolveProvider(
      channel,
      dto.provider || ruleRouting?.provider || routing?.provider,
      messagingSettings,
    );

    const notification = this.notificationRepo.create({
      ...dto,
      title: resolvedTemplate.title,
      body: resolvedTemplate.body,
      channel,
      category: dto.category || NotificationCategory.ALERT,
      tenantId,
      status: NotificationStatus.PENDING,
      isScheduled: false,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      metadata: {
        ...(dto.metadata || {}),
        channel,
        provider,
        templateId: dto.templateId,
      },
    });

    const scheduledFor = this.resolveScheduledTime(notification, messagingSettings);
    if (scheduledFor) {
      notification.isScheduled = true;
      notification.scheduledFor = scheduledFor;
      const savedScheduled = await this.notificationRepo.save(notification);
      await this.createAuditLog(tenantId, dto.userId, savedScheduled.id, 'Notification scheduled');
      return savedScheduled;
    }

    const saved = await this.notificationRepo.save(notification);
    await this.createAuditLog(tenantId, dto.userId, saved.id, 'Notification queued');

    if (channel === NotificationChannel.HYBRID) {
      await this.sendHybrid(saved, tenantId, dto, messagingSettings);
      return (await this.notificationRepo.findOne({ where: { id: saved.id, tenantId } })) || saved;
    }

    if (channel === NotificationChannel.PUSH) {
      await this.sendPush(saved.id, tenantId, dto.userId);
      await this.createAuditLog(tenantId, dto.userId, saved.id, 'Push notification sent');
      return (await this.notificationRepo.findOne({ where: { id: saved.id, tenantId } })) || saved;
    }

    await this.sendExternalMessage(saved.id, tenantId, dto, channel, provider, messagingSettings);
    await this.createAuditLog(tenantId, dto.userId, saved.id, 'External notification sent');

    return saved;
  }

  async sendBulkNotifications(tenantId: string, userIds: string[], title: string, body: string, category: string, data?: Record<string, any>): Promise<number> {
    const notifications = userIds.map(userId =>
      this.notificationRepo.create({
        userId,
        tenantId,
        title,
        body,
        category: category as any,
        data,
        status: NotificationStatus.PENDING,
      }),
    );

    const saved = await this.notificationRepo.save(notifications);
    return saved.length;
  }

  async markAsSent(notificationId: string, tenantId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, tenantId },
      {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    );
  }

  private async sendPush(notificationId: string, tenantId: string, user_id: string): Promise<void> {
    const hasDevice = await this.deviceRepo
      .createQueryBuilder('device')
      .where('device.tenantId = :tenantId', { tenantId })
      .andWhere('device.userId = :userId', { userId: user_id })
      .andWhere('device.status = :status', { status: DeviceStatus.ACTIVE })
      .andWhere('device.pushToken IS NOT NULL')
      .getCount();

    if (!hasDevice) {
      await this.notificationRepo.update(
        { id: notificationId, tenantId },
        {
          status: NotificationStatus.FAILED,
          errorMessage: 'No active devices registered for push delivery.',
        },
      );
      return;
    }

    await this.markAsSent(notificationId, tenantId);
  }

  private async sendHybrid(
    notification: PushNotification,
    tenantId: string,
    dto: SendNotificationDto,
    settings: MessagingSettings,
  ): Promise<void> {
    const hasPushDevice = await this.deviceRepo
      .createQueryBuilder('device')
      .where('device.tenantId = :tenantId', { tenantId })
      .andWhere('device.userId = :userId', { user_id: dto.userId })
      .andWhere('device.status = :status', { status: DeviceStatus.ACTIVE })
      .andWhere('device.pushToken IS NOT NULL')
      .getCount();

    if (hasPushDevice) {
      await this.sendPush(notification.id, tenantId, dto.userId);
      const updated = await this.notificationRepo.findOne({ where: { id: notification.id, tenantId } });
      if (updated?.status === NotificationStatus.SENT) {
        return;
      }
    }

    const fallbackChannel = this.resolveChannel(
      settings.fallbackChannel || NotificationChannel.SMS,
      { ...settings, channel: NotificationChannel.SMS },
    );
    const fallbackProvider = this.resolveProvider(fallbackChannel, dto.provider, settings);
    await this.sendExternalMessage(notification.id, tenantId, dto, fallbackChannel, fallbackProvider, settings);
  }

  private async sendExternalMessage(
    notificationId: string,
    tenantId: string,
    dto: SendNotificationDto,
    channel: NotificationChannel,
    provider: MessagingProvider,
    settings: MessagingSettings,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    const recipientPhone = dto.toPhoneNumber || user?.phoneNumber;

    if (!recipientPhone) {
      await this.notificationRepo.update(
        { id: notificationId, tenantId },
        {
          status: NotificationStatus.FAILED,
          errorMessage: 'Recipient phone number is required for SMS/WhatsApp/Voice delivery.',
        },
      );
      return;
    }

    const allowUnverified = Boolean(dto.metadata?.allowUnverifiedPhone);
    const phoneRequiredChannels = [
      NotificationChannel.SMS,
      NotificationChannel.WHATSAPP,
      NotificationChannel.VOICE,
    ];
    if (
      phoneRequiredChannels.includes(channel) &&
      !allowUnverified &&
      !(await this.isPhoneVerified(tenantId, dto.userId, recipientPhone))
    ) {
      await this.notificationRepo.update(
        { id: notificationId, tenantId },
        {
          status: NotificationStatus.FAILED,
          errorMessage: 'Phone number is not verified for SMS/WhatsApp/Voice delivery.',
        },
      );
      return;
    }

    const messageText = [dto.title, dto.body].filter(Boolean).join('\n');
    const fromNumber = this.getFromNumber(channel, settings);

    const providers = this.resolveProviderOrder(channel, provider, settings);
    let lastError: string | undefined;

    for (const candidate of providers) {
      const isHealthy = await this.isProviderHealthy(tenantId, candidate, channel);
      if (!isHealthy) {
        lastError = `${candidate} is unhealthy`;
        continue;
      }

      try {
        const result = await this.dispatchProviderMessage(
          candidate,
          channel,
          recipientPhone,
          fromNumber,
          messageText,
          settings,
        );
        await this.notificationRepo.update(
          { id: notificationId, tenantId },
          {
            status: NotificationStatus.SENT,
            sentAt: new Date(),
            providerId: result.providerId,
            providerResponse: result.providerResponse,
          },
        );
        await this.updateProviderHealth(tenantId, candidate, channel, true);
        return;
      } catch (error: any) {
        lastError = error?.message || 'Failed to deliver message.';
        await this.updateProviderHealth(tenantId, candidate, channel, false, lastError);
      }
    }

    await this.notificationRepo.update(
      { id: notificationId, tenantId },
      {
        status: NotificationStatus.FAILED,
        errorMessage: lastError || 'Failed to deliver message.',
      },
    );

    if (settings.escalation?.length) {
      const next = settings.escalation[0];
      const scheduledFor = new Date(Date.now() + next.afterMinutes * 60 * 1000);
      const escalationNotification = this.notificationRepo.create({
        tenantId,
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        category: dto.category,
        channel: this.resolveChannel(next.channel, settings),
        status: NotificationStatus.PENDING,
        isScheduled: true,
        scheduledFor,
        metadata: {
          escalationFrom: notificationId,
          escalationChannel: next.channel,
          escalationProvider: next.provider,
        },
      });
      await this.notificationRepo.save(escalationNotification);
    }
  }

  private async dispatchProviderMessage(
    provider: MessagingProvider,
    channel: NotificationChannel,
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    if (provider === MessagingProvider.TWILIO) {
      return this.sendViaTwilio(channel, to, from, body, settings);
    }

    if (provider === MessagingProvider.VONAGE) {
      if (channel === NotificationChannel.SMS) {
        return this.sendViaVonageSms(to, from, body, settings);
      }
      if (channel === NotificationChannel.WHATSAPP) {
        return this.sendViaVonageWhatsApp(to, from, body, settings);
      }
      if (channel === NotificationChannel.VOICE) {
        return this.sendViaVonageVoice(to, from, body, settings);
      }
    }

    if (provider === MessagingProvider.MESSAGEBIRD) {
      if (channel === NotificationChannel.SMS) {
        return this.sendViaMessageBirdSms(to, from, body, settings);
      }
      if (channel === NotificationChannel.WHATSAPP) {
        return this.sendViaMessageBirdWhatsApp(to, from, body, settings);
      }
      if (channel === NotificationChannel.VOICE) {
        return this.sendViaMessageBirdVoice(to, from, body, settings);
      }
    }

    throw new BadRequestException('Unsupported messaging provider.');
  }

  private async sendViaTwilio(
    channel: NotificationChannel,
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const accountSid = settings.credentials?.twilio?.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = settings.credentials?.twilio?.authToken || process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new BadRequestException('Twilio credentials are not configured.');
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;

    if (channel === NotificationChannel.VOICE) {
      if (!from) {
        throw new BadRequestException('Twilio voice from number is not configured.');
      }
      const twiml = `<Response><Say>${body}</Say></Response>`;
      const response = await axios.post(
        `${baseUrl}/Calls.json`,
        new URLSearchParams({
          To: to,
          From: from,
          Twiml: twiml,
        }),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return {
        providerId: response.data?.sid,
        providerResponse: JSON.stringify(response.data),
      };
    }

    if (!from) {
      throw new BadRequestException('Twilio from number is not configured.');
    }

    const formattedTo = channel === NotificationChannel.WHATSAPP && !to.startsWith('whatsapp:')
      ? `whatsapp:${to}`
      : to;
    const formattedFrom = channel === NotificationChannel.WHATSAPP && !from.startsWith('whatsapp:')
      ? `whatsapp:${from}`
      : from;

    const response = await axios.post(
      `${baseUrl}/Messages.json`,
      new URLSearchParams({
        To: formattedTo,
        From: formattedFrom,
        Body: body,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return {
      providerId: response.data?.sid,
      providerResponse: JSON.stringify(response.data),
    };
  }

  private async sendViaVonageSms(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const apiKey = settings.credentials?.vonage?.apiKey || process.env.VONAGE_API_KEY;
    const apiSecret = settings.credentials?.vonage?.apiSecret || process.env.VONAGE_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new BadRequestException('Vonage credentials are not configured.');
    }

    const response = await axios.post(
      'https://rest.nexmo.com/sms/json',
      {
        api_key: apiKey,
        api_secret: apiSecret,
        to,
        from: from || 'CognexiaAI',
        text: body,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const message = response.data?.messages?.[0];
    if (message?.status !== '0') {
      throw new BadRequestException(message?.['error-text'] || 'Vonage SMS delivery failed.');
    }

    return {
      providerId: message?.['message-id'],
      providerResponse: JSON.stringify(response.data),
    };
  }

  private async sendViaVonageWhatsApp(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const { token, applicationId } = this.getVonageJwtToken(settings);
    if (!from) {
      throw new BadRequestException('Vonage WhatsApp from number is not configured.');
    }

    const response = await axios.post(
      'https://api.nexmo.com/v1/messages',
      {
        from: { type: 'whatsapp', number: from },
        to: { type: 'whatsapp', number: to },
        message: { content: { type: 'text', text: body } },
        application_id: applicationId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      providerId: response.data?.message_uuid?.[0],
      providerResponse: JSON.stringify(response.data),
    };
  }

  private async sendViaVonageVoice(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const { token } = this.getVonageJwtToken(settings);
    if (!from) {
      throw new BadRequestException('Vonage voice from number is not configured.');
    }

    const response = await axios.post(
      'https://api.nexmo.com/v1/calls',
      {
        to: [{ type: 'phone', number: to }],
        from: { type: 'phone', number: from },
        ncco: [{ action: 'talk', text: body }],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      providerId: response.data?.uuid,
      providerResponse: JSON.stringify(response.data),
    };
  }

  private getVonageJwtToken(settings: MessagingSettings): { token: string; applicationId: string } {
    const applicationId =
      settings.credentials?.vonage?.applicationId || process.env.VONAGE_APPLICATION_ID;
    const privateKey =
      settings.credentials?.vonage?.privateKey || process.env.VONAGE_PRIVATE_KEY;
    if (!applicationId || !privateKey) {
      throw new BadRequestException('Vonage application credentials are not configured.');
    }

    const normalizedKey = privateKey.replace(/\\n/g, '\n');
    const token = jwt.sign({}, normalizedKey, {
      algorithm: 'RS256',
      issuer: applicationId,
      subject: applicationId,
      expiresIn: '15m',
    });

    return { token, applicationId };
  }

  private async sendViaMessageBirdSms(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const accessKey =
      settings.credentials?.messagebird?.accessKey || process.env.MESSAGEBIRD_ACCESS_KEY;
    if (!accessKey) {
      throw new BadRequestException('MessageBird access key is not configured.');
    }

    const response = await axios.post(
      'https://rest.messagebird.com/messages',
      {
        recipients: [to],
        originator: from || process.env.MESSAGEBIRD_SMS_ORIGINATOR || 'CognexiaAI',
        body,
      },
      {
        headers: {
          Authorization: `AccessKey ${accessKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      providerId: response.data?.id,
      providerResponse: JSON.stringify(response.data),
    };
  }

  private async sendViaMessageBirdWhatsApp(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const accessKey =
      settings.credentials?.messagebird?.accessKey || process.env.MESSAGEBIRD_ACCESS_KEY;
    const channelId = from || process.env.MESSAGEBIRD_WHATSAPP_CHANNEL_ID;
    if (!accessKey) {
      throw new BadRequestException('MessageBird access key is not configured.');
    }
    if (!channelId) {
      throw new BadRequestException('MessageBird WhatsApp channel ID is not configured.');
    }

    const response = await axios.post(
      'https://conversations.messagebird.com/v1/conversations',
      {
        to,
        type: 'whatsapp',
        channelId,
        content: {
          type: 'text',
          text: body,
        },
      },
      {
        headers: {
          Authorization: `AccessKey ${accessKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      providerId: response.data?.id,
      providerResponse: JSON.stringify(response.data),
    };
  }

  private async sendViaMessageBirdVoice(
    to: string,
    from: string | undefined,
    body: string,
    settings: MessagingSettings,
  ): Promise<{ providerId?: string; providerResponse?: string }> {
    const accessKey =
      settings.credentials?.messagebird?.accessKey || process.env.MESSAGEBIRD_ACCESS_KEY;
    const source = from || process.env.MESSAGEBIRD_VOICE_SOURCE;
    if (!accessKey) {
      throw new BadRequestException('MessageBird access key is not configured.');
    }
    if (!source) {
      throw new BadRequestException('MessageBird voice source is not configured.');
    }

    const response = await axios.post(
      'https://voice.messagebird.com/calls',
      {
        source,
        destination: to,
        callFlow: {
          title: 'CRM Notification',
          steps: [
            {
              action: 'say',
              options: {
                payload: body,
                voice: 'female',
                language: 'en-US',
              },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `AccessKey ${accessKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      providerId: response.data?.id,
      providerResponse: JSON.stringify(response.data),
    };
  }

  private resolveChannel(
    channel: NotificationChannel | string | undefined,
    settings: MessagingSettings,
  ): NotificationChannel {
    const fallback = settings.channel || NotificationChannel.PUSH;
    const value = channel || fallback;
    const normalized = String(value).toUpperCase();
    return (NotificationChannel as any)[normalized] || NotificationChannel.PUSH;
  }

  private resolveProvider(
    channel: NotificationChannel,
    provider: MessagingProvider | string | undefined,
    settings: MessagingSettings,
  ): MessagingProvider {
    const mapping = {
      [NotificationChannel.SMS]: settings.smsProvider,
      [NotificationChannel.WHATSAPP]: settings.whatsappProvider,
      [NotificationChannel.VOICE]: settings.voiceProvider,
      [NotificationChannel.PUSH]: settings.provider,
      [NotificationChannel.HYBRID]: settings.provider,
    } as Record<string, string | undefined>;

    const value = provider || mapping[channel] || settings.provider || MessagingProvider.TWILIO;
    const normalized = String(value).toUpperCase();
    return (MessagingProvider as any)[normalized] || MessagingProvider.TWILIO;
  }

  private getFromNumber(channel: NotificationChannel, settings: MessagingSettings): string | undefined {
    const overrides = settings.fromNumbers || {};
    if (channel === NotificationChannel.SMS) {
      return (
        overrides.sms ||
        process.env.TWILIO_SMS_FROM ||
        process.env.VONAGE_SMS_FROM ||
        process.env.MESSAGEBIRD_SMS_ORIGINATOR
      );
    }
    if (channel === NotificationChannel.WHATSAPP) {
      return (
        overrides.whatsapp ||
        process.env.TWILIO_WHATSAPP_FROM ||
        process.env.VONAGE_WHATSAPP_FROM ||
        process.env.MESSAGEBIRD_WHATSAPP_CHANNEL_ID
      );
    }
    if (channel === NotificationChannel.VOICE) {
      return (
        overrides.voice ||
        process.env.TWILIO_VOICE_FROM ||
        process.env.VONAGE_VOICE_FROM ||
        process.env.MESSAGEBIRD_VOICE_SOURCE
      );
    }
    return undefined;
  }

  private async getMessagingSettings(tenantId: string): Promise<MessagingSettings> {
    const organization = await this.organizationRepo.findOne({ where: { id: tenantId } });
    const settings = organization?.settings || {};
    return settings.messaging || {};
  }

  private resolveProviderOrder(
    channel: NotificationChannel,
    preferred: MessagingProvider,
    settings: MessagingSettings,
  ): MessagingProvider[] {
    const explicit = settings.providerOrder?.[channel] || [];
    const normalized = explicit
      .map((value) => (MessagingProvider as any)[String(value).toUpperCase()] || undefined)
      .filter(Boolean) as MessagingProvider[];
    const list = [preferred, ...normalized].filter(Boolean) as MessagingProvider[];
    return Array.from(new Set(list));
  }

  private async isProviderHealthy(
    tenantId: string,
    provider: MessagingProvider,
    channel: NotificationChannel,
  ): Promise<boolean> {
    const record = await this.providerHealthRepo.findOne({
      where: { tenantId, provider, channel },
    });
    return !record || record.status !== ProviderHealthStatus.DOWN;
  }

  private async updateProviderHealth(
    tenantId: string,
    provider: MessagingProvider,
    channel: NotificationChannel,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    let record = await this.providerHealthRepo.findOne({
      where: { tenantId, provider, channel },
    });

    if (!record) {
      record = this.providerHealthRepo.create({
        tenantId,
        provider,
        channel,
        status: success ? ProviderHealthStatus.HEALTHY : ProviderHealthStatus.DEGRADED,
        failureCount: success ? 0 : 1,
        lastError: success ? null : errorMessage,
        lastCheckedAt: new Date(),
      });
    } else {
      record.lastCheckedAt = new Date();
      if (success) {
        record.failureCount = 0;
        record.status = ProviderHealthStatus.HEALTHY;
        record.lastError = null;
      } else {
        record.failureCount += 1;
        record.status = record.failureCount >= 3 ? ProviderHealthStatus.DOWN : ProviderHealthStatus.DEGRADED;
        record.lastError = errorMessage || record.lastError;
      }
    }

    await this.providerHealthRepo.save(record);
  }

  private resolveScheduledTime(notification: PushNotification, settings: MessagingSettings): Date | null {
    if (notification.scheduledFor) {
      return notification.scheduledFor;
    }

    const quiet = settings.quietHours;
    if (!quiet?.start || !quiet?.end) {
      return null;
    }

    const now = new Date();
    const [startHour, startMin] = quiet.start.split(':').map((v) => Number(v));
    const [endHour, endMin] = quiet.end.split(':').map((v) => Number(v));
    const start = new Date(now);
    start.setHours(startHour || 0, startMin || 0, 0, 0);
    const end = new Date(now);
    end.setHours(endHour || 0, endMin || 0, 0, 0);

    const withinQuiet =
      start <= end ? now >= start && now <= end : now >= start || now <= end;

    if (!withinQuiet) {
      return null;
    }

    if (start <= end) {
      end.setDate(end.getDate() + 0);
      return end;
    }

    end.setDate(end.getDate() + 1);
    return end;
  }

  private async resolveTemplate(
    tenantId: string,
    templateId: string,
    variables: Record<string, any>,
    dto: SendNotificationDto,
  ): Promise<{ title: string; body: string; channel?: NotificationChannel }> {
    const template = await this.templateRepo.findOne({ where: { id: templateId, tenantId } });
    if (!template) {
      throw new NotFoundException('Notification template not found');
    }
    const title = this.applyTemplateVariables(template.titleTemplate, variables);
    const body = this.applyTemplateVariables(template.bodyTemplate, variables);
    return { title, body, channel: template.channel || dto.channel };
  }

  private applyTemplateVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
      const value = variables[key];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  private resolveRoutingRule(
    user: User,
    settings: MessagingSettings,
  ): { channel?: NotificationChannel | string; provider?: MessagingProvider | string } | null {
    const rules = settings.routingRules || [];
    if (!rules.length) return null;

    const segment =
      user.preferences?.segment ||
      user.metadata?.segment ||
      user.metadata?.customerSegment;
    const vip = Boolean(user.preferences?.vip ?? user.metadata?.vip);
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const tags = Array.isArray(user.metadata?.tags) ? user.metadata?.tags : [];

    for (const rule of rules) {
      const operator = String(rule.operator || 'AND').toUpperCase();
      const groups = rule.groups || [];
      const conditions = rule.conditions || [];

      if (groups.length > 0) {
        const groupResults = groups.map((group) =>
          this.evaluateConditions(group.conditions || [], group.operator || 'AND', {
            segment,
            vip,
            userType: user.userType,
            roles,
            tags,
          }),
        );
        const matched =
          operator === 'OR'
            ? groupResults.some(Boolean)
            : groupResults.every(Boolean);
        if (!matched) {
          continue;
        }
      } else if (conditions.length > 0) {
        const matched = this.evaluateConditions(conditions, operator, {
          segment,
          vip,
          userType: user.userType,
          roles,
          tags,
        });
        if (!matched) {
          continue;
        }
      } else {
        const match = rule.match || {};
        if (match.segment && String(match.segment) !== String(segment)) {
          continue;
        }
        if (typeof match.vip === 'boolean' && match.vip !== vip) {
          continue;
        }
        if (match.userType && String(match.userType) !== String(user.userType)) {
          continue;
        }
        if (match.role && !roles.includes(match.role)) {
          continue;
        }
        if (match.tag && !tags.includes(match.tag)) {
          continue;
        }
      }
      return { channel: rule.channel, provider: rule.provider };
    }

    return null;
  }

  private evaluateConditions(
    conditions: Array<{ field: string; value: string | boolean }>,
    operator: string,
    context: {
      segment?: string;
      vip: boolean;
      userType: string;
      roles: string[];
      tags: string[];
    },
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }
    const results = conditions.map((condition) =>
      this.evaluateRoutingCondition(condition, context),
    );
    return operator === 'OR' ? results.some(Boolean) : results.every(Boolean);
  }

  private evaluateRoutingCondition(
    condition: { field: string; value: string | boolean },
    context: {
      segment?: string;
      vip: boolean;
      userType: string;
      roles: string[];
      tags: string[];
    },
  ): boolean {
    const field = String(condition.field || '').toLowerCase();
    const value = condition.value;
    if (field === 'segment') {
      return value !== undefined && String(value) === String(context.segment || '');
    }
    if (field === 'vip') {
      const boolValue =
        typeof value === 'boolean'
          ? value
          : String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes';
      return context.vip === boolValue;
    }
    if (field === 'usertype') {
      return value !== undefined && String(value) === String(context.userType);
    }
    if (field === 'role') {
      return value !== undefined && context.roles.includes(String(value));
    }
    if (field === 'tag') {
      return value !== undefined && context.tags.includes(String(value));
    }
    return false;
  }

  @Cron('*/1 * * * *')
  async processScheduledNotifications(): Promise<void> {
    const due = await this.notificationRepo.find({
      where: {
        status: NotificationStatus.PENDING,
        isScheduled: true,
      },
      order: { scheduledFor: 'ASC' },
      take: 50,
    });

    const now = new Date();
    for (const notification of due) {
      if (notification.scheduledFor && notification.scheduledFor > now) {
        continue;
      }
      const dto: SendNotificationDto = {
        userId: notification.userId,
        title: notification.title,
        body: notification.body,
        category: notification.category,
        channel: notification.channel,
        deviceId: notification.deviceId,
        toPhoneNumber: undefined,
      };
      await this.notificationRepo.update(
        { id: notification.id },
        { isScheduled: false },
      );
      await this.sendNotification(notification.tenantId, dto);
    }
  }

  @Cron('*/2 * * * *')
  async processRetryQueue(): Promise<void> {
    const failed = await this.notificationRepo.find({
      where: {
        status: NotificationStatus.FAILED,
      },
      take: 50,
    });

    for (const notification of failed) {
      if (notification.retryCount >= notification.maxRetries) {
        continue;
      }

      notification.retryCount += 1;
      notification.status = NotificationStatus.PENDING;
      notification.isScheduled = true;
      notification.scheduledFor = new Date(Date.now() + notification.retryCount * 60 * 1000);
      await this.notificationRepo.save(notification);
    }
  }

  @Cron('*/5 * * * *')
  async refreshProviderHealthCron(): Promise<void> {
    const organizations = await this.organizationRepo.find();
    for (const org of organizations) {
      await this.refreshProviderHealth(org.id);
    }
  }

  async refreshProviderHealth(tenantId: string): Promise<any[]> {
    const channels = [
      NotificationChannel.SMS,
      NotificationChannel.WHATSAPP,
      NotificationChannel.VOICE,
    ];
    const providers = Object.values(MessagingProvider);

    const results: NotificationProviderHealth[] = [];
    for (const channel of channels) {
      for (const provider of providers) {
        const healthy = this.checkCredentials(provider, await this.getMessagingSettings(tenantId));
        await this.updateProviderHealth(
          tenantId,
          provider,
          channel,
          healthy,
          healthy ? undefined : 'Missing credentials',
        );
        const record = await this.providerHealthRepo.findOne({ where: { tenantId, provider, channel } });
        if (record) {
          results.push(record);
        }
      }
    }
    return results;
  }

  async getProviderHealth(tenantId: string): Promise<NotificationProviderHealth[]> {
    return this.providerHealthRepo.find({ where: { tenantId } });
  }

  async handleReceipt(provider: string, payload: any): Promise<void> {
    const normalized = String(provider).toUpperCase();
    let providerId: string | undefined;
    let status: NotificationStatus | undefined;

    if (normalized === 'TWILIO') {
      providerId = payload?.MessageSid || payload?.SmsSid || payload?.CallSid;
      status = this.mapReceiptStatus(payload?.MessageStatus || payload?.CallStatus);
    } else if (normalized === 'VONAGE') {
      providerId = payload?.message_uuid || payload?.uuid || payload?.messageId;
      status = this.mapReceiptStatus(payload?.status);
    } else if (normalized === 'MESSAGEBIRD') {
      providerId = payload?.id;
      status = this.mapReceiptStatus(payload?.status || payload?.message?.status);
    }

    if (!providerId || !status) {
      return;
    }

    const notification = await this.notificationRepo.findOne({ where: { providerId } });
    if (!notification) {
      return;
    }

    await this.notificationRepo.update(
      { id: notification.id },
      {
        status,
        deliveredAt: status === NotificationStatus.DELIVERED ? new Date() : notification.deliveredAt,
      },
    );
  }

  private mapReceiptStatus(status: string | undefined): NotificationStatus | undefined {
    if (!status) return undefined;
    const normalized = String(status).toUpperCase();
    if (['DELIVERED', 'DELIVERED_OK', 'SENT'].includes(normalized)) {
      return NotificationStatus.DELIVERED;
    }
    if (['FAILED', 'UNDELIVERED', 'REJECTED', 'ERROR'].includes(normalized)) {
      return NotificationStatus.FAILED;
    }
    return NotificationStatus.SENT;
  }

  async listTemplates(tenantId: string): Promise<NotificationTemplate[]> {
    return this.templateRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async createTemplate(tenantId: string, dto: NotificationTemplateDto): Promise<NotificationTemplate> {
    const template = this.templateRepo.create({ ...dto, tenantId });
    return this.templateRepo.save(template);
  }

  async updateTemplate(
    tenantId: string,
    id: string,
    dto: NotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepo.findOne({ where: { id, tenantId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async deleteTemplate(tenantId: string, id: string): Promise<void> {
    await this.templateRepo.delete({ id, tenantId });
  }

  async requestPhoneOtp(user_id: string, tenantId: string, phoneNumber: string): Promise<{ message: string }> {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const verification = this.phoneVerificationRepo.create({
      userId: user_id,
      tenantId,
      phoneNumber,
      otpHash,
      expiresAt,
    });
    await this.phoneVerificationRepo.save(verification);

    const sendDto: SendNotificationDto = {
      userId: user_id,
      title: 'Your verification code',
      body: `Your OTP is ${otp}`,
      category: NotificationCategory.SYSTEM,
      channel: NotificationChannel.SMS,
      toPhoneNumber: phoneNumber,
      metadata: {
        allowUnverifiedPhone: true,
        purpose: 'phone_verification',
      },
    };
    await this.sendNotification(tenantId, sendDto);

    return { message: 'OTP sent' };
  }

  async verifyPhoneOtp(
    user_id: string,
    tenantId: string,
    phoneNumber: string,
    otp: string,
  ): Promise<{ message: string }> {
    const verification = await this.phoneVerificationRepo.findOne({
      where: { tenantId, userId: user_id, phoneNumber, status: PhoneVerificationStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    if (!verification) {
      throw new BadRequestException('OTP not found');
    }
    if (verification.expiresAt < new Date()) {
      verification.status = PhoneVerificationStatus.EXPIRED;
      await this.phoneVerificationRepo.save(verification);
      throw new BadRequestException('OTP expired');
    }
    const matches = await bcrypt.compare(otp, verification.otpHash);
    if (!matches) {
      verification.attempts += 1;
      await this.phoneVerificationRepo.save(verification);
      throw new BadRequestException('Invalid OTP');
    }

    verification.status = PhoneVerificationStatus.VERIFIED;
    verification.verifiedAt = new Date();
    await this.phoneVerificationRepo.save(verification);

    await this.userRepo.update({ id: user_id }, { phoneNumber });
    await this.createAuditLog(tenantId, user_id, verification.id, 'Phone number verified');

    return { message: 'Phone number verified' };
  }

  private checkCredentials(provider: MessagingProvider, settings: MessagingSettings): boolean {
    const credentials = settings.credentials || {};
    if (provider === MessagingProvider.TWILIO) {
      return Boolean(
        credentials.twilio?.accountSid ||
          process.env.TWILIO_ACCOUNT_SID
      );
    }
    if (provider === MessagingProvider.VONAGE) {
      return Boolean(
        credentials.vonage?.apiKey ||
          process.env.VONAGE_API_KEY
      );
    }
    if (provider === MessagingProvider.MESSAGEBIRD) {
      return Boolean(
        credentials.messagebird?.accessKey ||
          process.env.MESSAGEBIRD_ACCESS_KEY
      );
    }
    return false;
  }

  private async isPhoneVerified(
    tenantId: string,
    user_id: string,
    phoneNumber: string,
  ): Promise<boolean> {
    const verification = await this.phoneVerificationRepo.findOne({
      where: {
        tenantId,
        userId: user_id,
        phoneNumber,
        status: PhoneVerificationStatus.VERIFIED,
      },
      order: { verifiedAt: 'DESC' },
    });

    return Boolean(verification);
  }

  private async createAuditLog(
    tenantId: string,
    user_id: string,
    entity_id: string,
    description: string,
  ): Promise<void> {
    const log = this.auditLogRepo.create({
      organization_id: tenantId,
      user_id: user_id,
      action: AuditAction.CREATE,
      entity_type: AuditEntityType.DOCUMENT,
      entity_id: entity_id,
      metadata: { source: 'mobile', description },
    });
    await this.auditLogRepo.save(log);
  }

  async markAsDelivered(notificationId: string, tenantId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, tenantId },
      {
        status: NotificationStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    );
  }

  async markAsClicked(notificationId: string, tenantId: string): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, tenantId },
      {
        status: NotificationStatus.CLICKED,
        clickedAt: new Date(),
        isRead: true,
      },
    );
  }

  async getUserNotifications(user_id: string, tenantId: string, limit: number = 50): Promise<PushNotification[]> {
    try {
      const notifications = await this.notificationRepo.find({
        where: { userId: user_id, tenantId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
      return notifications || [];
    } catch (error) {
      return [];
    }
  }

  async getUnreadCount(user_id: string, tenantId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId: user_id, tenantId, isRead: false },
    });
  }

  async markAllAsRead(user_id: string, tenantId: string): Promise<void> {
    await this.notificationRepo.update(
      { userId: user_id, tenantId, isRead: false },
      { isRead: true },
    );
  }
}

@Injectable()
export class OfflineSyncService {
  constructor(
    @InjectRepository(OfflineSync)
    private readonly syncRepo: Repository<OfflineSync>,
  ) {}

  async processBatchSync(user_id: string, deviceId: string, tenantId: string, dto: BatchSyncDto): Promise<SyncResponse> {
    const batchId = dto.batchId || `batch_${Date.now()}`;
    const results = [];

    for (const item of dto.items) {
      try {
        const syncItem = this.syncRepo.create({
          userId: user_id,
          deviceId,
          tenantId,
          entityType: item.entityType,
          entityId: item.entityId,
          operation: item.operation,
          data: item.data,
          clientTimestamp: item.clientTimestamp ? new Date(item.clientTimestamp) : new Date(),
          version: item.version || 1,
          priority: item.priority || 5,
          batchId,
          status: SyncStatus.PENDING,
        });

        const saved = await this.syncRepo.save(syncItem);

        // Process sync (simplified - in production would integrate with actual entity services)
        await this.processSync(saved.id, tenantId);

        results.push({
          syncId: saved.id,
          entity_type: item.entityType,
          entity_id: item.entityId,
          status: 'completed',
          serverId: item.entityId,
        });
      } catch (error) {
        results.push({
          syncId: '',
          entity_type: item.entityType,
          entity_id: item.entityId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    const syncedItems = results.filter(r => r.status === 'completed').length;
    const failedItems = results.filter(r => r.status === 'failed').length;

    return {
      success: failedItems === 0,
      syncedItems,
      failedItems,
      conflicts: 0,
      items: results,
    };
  }

  async processSync(syncId: string, tenantId: string): Promise<void> {
    const sync = await this.syncRepo.findOne({
      where: { id: syncId, tenantId },
    });

    if (!sync) {
      throw new NotFoundException('Sync item not found');
    }

    sync.status = SyncStatus.IN_PROGRESS;
    sync.syncStartedAt = new Date();
    await this.syncRepo.save(sync);

    // Simplified sync logic - in production would integrate with entity services
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 50));

      sync.status = SyncStatus.COMPLETED;
      sync.syncCompletedAt = new Date();
      await this.syncRepo.save(sync);
    } catch (error) {
      sync.status = SyncStatus.FAILED;
      sync.errorMessage = error.message;
      sync.retryCount++;
      await this.syncRepo.save(sync);
    }
  }

  async getPendingSyncs(user_id: string, deviceId: string, tenantId: string): Promise<OfflineSync[]> {
    return this.syncRepo.find({
      where: {
        userId: user_id,
        deviceId,
        tenantId,
        status: In([SyncStatus.PENDING, SyncStatus.FAILED]),
      },
      order: { priority: 'ASC', createdAt: 'ASC' },
    });
  }

  async getConflicts(user_id: string, tenantId: string): Promise<OfflineSync[]> {
    return this.syncRepo.find({
      where: {
        userId: user_id,
        tenantId,
        status: SyncStatus.CONFLICT,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async resolveConflict(syncId: string, tenantId: string, resolveWith: 'server' | 'client' | 'merged', mergedData?: Record<string, any>): Promise<OfflineSync> {
    const sync = await this.syncRepo.findOne({
      where: { id: syncId, tenantId },
    });

    if (!sync) {
      throw new NotFoundException('Sync item not found');
    }

    sync.hasConflict = false;
    sync.resolvedBy = resolveWith;
    sync.resolvedAt = new Date();

    if (resolveWith === 'merged' && mergedData) {
      sync.data = mergedData;
    }

    sync.status = SyncStatus.PENDING;

    return this.syncRepo.save(sync);
  }

  async getSyncStatistics(user_id: string, tenantId: string): Promise<{
    totalSyncs: number;
    pendingSyncs: number;
    completedSyncs: number;
    failedSyncs: number;
    conflicts: number;
  }> {
    const [total, pending, completed, failed, conflicts] = await Promise.all([
      this.syncRepo.count({ where: { userId: user_id, tenantId } }),
      this.syncRepo.count({ where: { userId: user_id, tenantId, status: SyncStatus.PENDING } }),
      this.syncRepo.count({ where: { userId: user_id, tenantId, status: SyncStatus.COMPLETED } }),
      this.syncRepo.count({ where: { userId: user_id, tenantId, status: SyncStatus.FAILED } }),
      this.syncRepo.count({ where: { userId: user_id, tenantId, status: SyncStatus.CONFLICT } }),
    ]);

    return {
      totalSyncs: total,
      pendingSyncs: pending,
      completedSyncs: completed,
      failedSyncs: failed,
      conflicts,
    };
  }
}
