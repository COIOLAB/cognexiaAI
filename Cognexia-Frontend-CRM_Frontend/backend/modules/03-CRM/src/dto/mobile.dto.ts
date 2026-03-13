import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject, IsArray, Min, Max } from 'class-validator';
import { DevicePlatform } from '../entities/mobile-device.entity';
import { NotificationCategory, NotificationPriority } from '../entities/push-notification.entity';
import { SyncEntityType, SyncOperation } from '../entities/offline-sync.entity';
import { NotificationChannel, MessagingProvider } from '../types/messaging.types';

// =============== Device DTOs ===============

export class RegisterDeviceDto {
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsOptional()
  @IsString()
  platformVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsBoolean()
  isTablet?: boolean;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsObject()
  pushSettings?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsObject()
  offlineConfig?: Record<string, any>;

  @IsOptional()
  @IsObject()
  appPreferences?: Record<string, any>;
}

export class DeviceHeartbeatDto {
  @IsBoolean()
  isOnline: boolean;

  @IsOptional()
  @IsNumber()
  batteryLevel?: number;

  @IsOptional()
  @IsString()
  networkType?: string; // wifi, cellular, none

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

// =============== Push Notification DTOs ===============

export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, any>;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(MessagingProvider)
  provider?: MessagingProvider;

  @IsOptional()
  @IsString()
  toPhoneNumber?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  deepLink?: string;

  @IsOptional()
  @IsBoolean()
  sound?: boolean;

  @IsOptional()
  @IsBoolean()
  vibration?: boolean;

  @IsOptional()
  @IsString()
  deviceId?: string; // Specific device, or all user's devices if omitted

  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class NotificationStatusDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isClicked?: boolean;

  @IsOptional()
  @IsBoolean()
  isDismissed?: boolean;
}

export class RequestPhoneOtpDto {
  @IsString()
  phoneNumber: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  otp: string;
}

export class PairDeviceDto {
  @IsString()
  deviceId: string;

  @IsString()
  otp: string;
}

export class NotificationTemplateDto {
  @IsString()
  name: string;

  @IsString()
  locale: string;

  @IsString()
  titleTemplate: string;

  @IsString()
  bodyTemplate: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// =============== Offline Sync DTOs ===============

export class SyncItemDto {
  @IsEnum(SyncEntityType)
  entityType: SyncEntityType;

  @IsString()
  entityId: string;

  @IsEnum(SyncOperation)
  operation: SyncOperation;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  clientTimestamp?: string;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class BatchSyncDto {
  @IsArray()
  items: SyncItemDto[];

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsBoolean()
  resolveConflicts?: boolean;
}

export class SyncConflictResolutionDto {
  @IsString()
  syncId: string;

  @IsString()
  resolveWith: 'server' | 'client' | 'merged';

  @IsOptional()
  @IsObject()
  mergedData?: Record<string, any>;
}

export class SyncStatusQueryDto {
  @IsOptional()
  @IsEnum(SyncEntityType)
  entityType?: SyncEntityType;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  since?: string; // ISO timestamp

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// =============== Mobile Data DTOs ===============

export class MobileDataRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[]; // ['customers', 'leads', 'tasks']

  @IsOptional()
  @IsString()
  since?: string; // ISO timestamp for incremental sync

  @IsOptional()
  @IsBoolean()
  includeRelated?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class MobileSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// =============== App Settings DTOs ===============

export class AppPreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  timeFormat?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  notifications?: Record<string, boolean>;
}

// =============== Response DTOs ===============

export class SyncResponse {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  conflicts: number;
  items: Array<{
    syncId: string;
    entityType: string;
    entityId: string;
    status: string;
    serverId?: string;
    error?: string;
  }>;
}

export class MobileDataResponse {
  entities: Record<string, any[]>;
  timestamp: string;
  hasMore: boolean;
  nextToken?: string;
}
