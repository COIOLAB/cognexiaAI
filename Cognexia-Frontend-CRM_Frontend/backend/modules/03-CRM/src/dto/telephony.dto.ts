import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsObject, Min, Max } from 'class-validator';
import { CallDirection, CallStatus, CallDisposition } from '../entities/call.entity';
import { QueueStrategy } from '../entities/call-queue.entity';
import { PhoneNumberType, PhoneNumberCapability } from '../entities/phone-number.entity';
import { IVRActionType } from '../entities/ivr-menu.entity';

// =============== Call DTOs ===============

export class InitiateCallDto {
  @IsString()
  fromNumber: string;

  @IsString()
  toNumber: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateCallDto {
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsEnum(CallDisposition)
  disposition?: CallDisposition;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  talkDuration?: number;
}

export class CallSearchDto {
  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

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

export class TransferCallDto {
  @IsString()
  transferTo: string; // Phone number or queue ID

  @IsOptional()
  @IsBoolean()
  isWarmTransfer?: boolean; // Announce before transferring

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordCallDto {
  @IsOptional()
  @IsBoolean()
  recordFromStart?: boolean;

  @IsOptional()
  @IsBoolean()
  recordBothChannels?: boolean;

  @IsOptional()
  @IsString()
  transcribe?: string; // 'auto', 'manual', 'none'
}

// =============== Queue DTOs ===============

export class CreateQueueDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QueueStrategy)
  routingStrategy?: QueueStrategy;

  @IsOptional()
  @IsNumber()
  maxQueueSize?: number;

  @IsOptional()
  @IsNumber()
  maxWaitTime?: number;

  @IsOptional()
  @IsArray()
  agentIds?: string[];

  @IsOptional()
  @IsString()
  holdMusicUrl?: string;

  @IsOptional()
  @IsString()
  greetingMessageUrl?: string;

  @IsOptional()
  @IsObject()
  businessHours?: Record<string, any>;
}

export class UpdateQueueDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(QueueStrategy)
  routingStrategy?: QueueStrategy;

  @IsOptional()
  @IsNumber()
  maxQueueSize?: number;

  @IsOptional()
  @IsNumber()
  maxWaitTime?: number;

  @IsOptional()
  @IsString()
  holdMusicUrl?: string;
}

export class QueueStatsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class AddAgentToQueueDto {
  @IsArray()
  @IsString({ each: true })
  agentIds: string[];
}

// =============== Phone Number DTOs ===============

export class PurchasePhoneNumberDto {
  @IsString()
  phoneNumber: string;

  @IsEnum(PhoneNumberType)
  type: PhoneNumberType;

  @IsOptional()
  @IsString()
  friendlyName?: string;

  @IsString()
  providerId: string;

  @IsString()
  providerName: string;

  @IsArray()
  @IsEnum(PhoneNumberCapability, { each: true })
  capabilities: PhoneNumberCapability[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;
}

export class AssignPhoneNumberDto {
  @IsOptional()
  @IsString()
  queueId?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  ivrMenuId?: string;

  @IsOptional()
  @IsString()
  forwardToNumber?: string;
}

// =============== IVR DTOs ===============

export class IVROptionDto {
  @IsString()
  digit: string;

  @IsString()
  label: string;

  @IsEnum(IVRActionType)
  action: IVRActionType;

  @IsString()
  actionValue: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateIVRMenuDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  greetingMessageUrl?: string;

  @IsOptional()
  @IsString()
  greetingText?: string;

  @IsArray()
  options: IVROptionDto[];

  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @IsOptional()
  @IsBoolean()
  enableSpeechRecognition?: boolean;
}

export class UpdateIVRMenuDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  greetingMessageUrl?: string;

  @IsOptional()
  @IsArray()
  options?: IVROptionDto[];

  @IsOptional()
  @IsNumber()
  timeout?: number;
}

// =============== Analytics DTOs ===============

export class CallAnalyticsQuery {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsString()
  queueId?: string;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month' | 'agent' | 'queue';
}

export class CallAnalyticsResponse {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  averageTalkTime: number;
  averageWaitTime: number;
  totalDuration: number;
  callsByDay?: Record<string, number>;
  callsByAgent?: Record<string, number>;
  callsByQueue?: Record<string, number>;
  qualityMetrics?: {
    averageAudioQuality: number;
    callsWithGoodQuality: number;
    callsWithPoorQuality: number;
  };
  dispositionBreakdown?: Record<string, number>;
}

// =============== Recording DTOs ===============

export class RequestTranscriptionDto {
  @IsOptional()
  @IsBoolean()
  enableSpeakerDetection?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSentimentAnalysis?: boolean;

  @IsOptional()
  @IsBoolean()
  enableKeywordExtraction?: boolean;
}

export class RedactRecordingDto {
  @IsOptional()
  @IsBoolean()
  redactPCI?: boolean;

  @IsOptional()
  @IsBoolean()
  redactPII?: boolean;

  @IsOptional()
  @IsArray()
  customPatterns?: string[];
}
