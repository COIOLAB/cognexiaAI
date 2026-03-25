import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event, EventType } from '../entities/event.entity';
import { ActivityLoggerService } from './activity-logger.service';

import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsArray()
  attendees?: Array<{ userId: string; email: string; status: string }>;

  @IsOptional()
  @IsString()
  relatedToId?: string;

  @IsOptional()
  @IsString()
  relatedToType?: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsNumber()
  reminderMinutes?: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsArray()
  attendees?: Array<{ userId: string; email: string; status: string }>;

  @IsOptional()
  @IsString()
  relatedToId?: string;

  @IsOptional()
  @IsString()
  relatedToType?: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsNumber()
  reminderMinutes?: number;
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private activityLoggerService: ActivityLoggerService,
  ) {}

  async createEvent(
    organizationId: string,
    createdBy: string,
    dto: CreateEventDto,
  ): Promise<Event> {
    const event = this.eventRepository.create({
      organizationId,
      created_by: createdBy,
      title: dto.title,
      description: dto.description,
      event_type: dto.eventType || EventType.MEETING,
      start_time: new Date(dto.startTime),
      end_time: new Date(dto.endTime),
      location: dto.location,
      meeting_link: dto.meetingLink,
      attendees: dto.attendees,
      related_to_id: dto.relatedToId,
      related_to_type: dto.relatedToType,
      is_all_day: dto.isAllDay || false,
      reminder_minutes: dto.reminderMinutes,
    });
    const savedEvent = await this.eventRepository.save(event);

    await this.activityLoggerService.logEventCreated(
      organizationId,
      createdBy,
      savedEvent.id,
      savedEvent.title,
      savedEvent.event_type
    );

    return savedEvent;
  }

  async getEvents(
    organizationId: string,
    query: {
      startDate?: string;
      endDate?: string;
      event_type?: EventType;
      limit?: number;
      page?: number;
    } = {},
  ): Promise<{ data: Event[]; total: number }> {
    const { startDate, endDate, event_type, limit = 50, page = 1 } = query;

    const where: any = { organizationId };
    if (event_type) where.event_type = event_type;
    if (startDate && endDate) {
      where.start_time = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.eventRepository.findAndCount({
      where,
      order: { start_time: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total };
  }

  async getEventById(id: string, organizationId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, organizationId },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(
    id: string,
    organizationId: string,
    dto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.getEventById(id, organizationId);
    
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.eventType !== undefined) event.event_type = dto.eventType;
    if (dto.startTime !== undefined) event.start_time = new Date(dto.startTime);
    if (dto.endTime !== undefined) event.end_time = new Date(dto.endTime);
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.meetingLink !== undefined) event.meeting_link = dto.meetingLink;
    if (dto.attendees !== undefined) event.attendees = dto.attendees;
    if (dto.relatedToId !== undefined) event.related_to_id = dto.relatedToId;
    if (dto.relatedToType !== undefined) event.related_to_type = dto.relatedToType;
    if (dto.isAllDay !== undefined) event.is_all_day = dto.isAllDay;
    if (dto.reminderMinutes !== undefined) event.reminder_minutes = dto.reminderMinutes;

    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: string, organizationId: string): Promise<void> {
    const event = await this.getEventById(id, organizationId);
    await this.eventRepository.remove(event);
  }

  async getUpcomingEvents(organizationId: string, limit = 10): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { organizationId },
      order: { start_time: 'ASC' },
      take: limit,
    });
  }

  async getEventStats(
    organizationId: string,
  ): Promise<{ total: number; meetings: number; calls: number; demos: number }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [total, meetings, calls, demos] = await Promise.all([
      this.eventRepository.count({ where: { organizationId, start_time: Between(startOfMonth, endOfMonth) } }),
      this.eventRepository.count({ where: { organizationId, event_type: EventType.MEETING, start_time: Between(startOfMonth, endOfMonth) } }),
      this.eventRepository.count({ where: { organizationId, event_type: EventType.CALL, start_time: Between(startOfMonth, endOfMonth) } }),
      this.eventRepository.count({ where: { organizationId, event_type: EventType.DEMO, start_time: Between(startOfMonth, endOfMonth) } }),
    ]);

    return { total, meetings, calls, demos };
  }
}
