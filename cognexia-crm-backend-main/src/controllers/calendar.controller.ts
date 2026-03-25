import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CalendarService, CreateEventDto, UpdateEventDto } from '../services/calendar.service';
import { EventType } from '../entities/event.entity';

@Controller('crm/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  private getOrgId(req: any): string {
    return req.user?.organizationId;
  }

  /** Normalize entity snake_case to camelCase for the frontend */
  private mapEvent(e: any) {
    if (!e) return e;
    return {
      id: e.id,
      organizationId: e.organizationId,
      title: e.title,
      description: e.description,
      eventType: e.event_type || e.eventType,
      startTime: e.start_time || e.startTime,
      endTime: e.end_time || e.endTime,
      location: e.location,
      meetingLink: e.meeting_link || e.meetingLink,
      createdBy: e.created_by || e.createdBy,
      attendees: e.attendees,
      relatedToId: e.related_to_id || e.relatedToId,
      relatedToType: e.related_to_type || e.relatedToType,
      isAllDay: e.is_all_day ?? e.isAllDay ?? false,
      reminderMinutes: e.reminder_minutes ?? e.reminderMinutes,
      createdAt: e.created_at || e.createdAt,
      updatedAt: e.updated_at || e.updatedAt,
    };
  }

  /**
   * Create a new calendar event
   * POST /crm/calendar/events
   */
  @Post('events')
  async createEvent(@Request() req, @Body() dto: CreateEventDto) {
    try {
      const organizationId = this.getOrgId(req);
      const createdBy = req.user?.userId;
      const event = await this.calendarService.createEvent(organizationId, createdBy, dto);
      return { success: true, data: this.mapEvent(event) };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all events for the organization
   * GET /crm/calendar/events
   */
  @Get('events')
  async getEvents(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('event_type') event_type?: EventType,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      const organizationId = this.getOrgId(req);
      const result = await this.calendarService.getEvents(organizationId, {
        startDate,
        endDate,
        event_type,
        limit,
        page,
      });
      return { success: true, data: result.data.map(e => this.mapEvent(e)), total: result.total };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get upcoming events
   * GET /crm/calendar/events/upcoming
   */
  @Get('events/upcoming')
  async getUpcomingEvents(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    try {
      const organizationId = this.getOrgId(req);
      const data = await this.calendarService.getUpcomingEvents(organizationId, limit);
      return { success: true, data: data.map(e => this.mapEvent(e)) };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get this month's event stats
   * GET /crm/calendar/events/stats
   */
  @Get('events/stats')
  async getEventStats(@Request() req) {
    try {
      const organizationId = this.getOrgId(req);
      const data = await this.calendarService.getEventStats(organizationId);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single event by ID
   * GET /crm/calendar/events/:id
   */
  @Get('events/:id')
  async getEventById(@Request() req, @Param('id') id: string) {
    try {
      const organizationId = this.getOrgId(req);
      const event = await this.calendarService.getEventById(id, organizationId);
      return { success: true, data: this.mapEvent(event) };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an event
   * PUT /crm/calendar/events/:id
   */
  @Put('events/:id')
  async updateEvent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    try {
      const organizationId = this.getOrgId(req);
      const event = await this.calendarService.updateEvent(id, organizationId, dto);
      return { success: true, data: this.mapEvent(event) };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an event
   * DELETE /crm/calendar/events/:id
   */
  @Delete('events/:id')
  async deleteEvent(@Request() req, @Param('id') id: string) {
    try {
      const organizationId = this.getOrgId(req);
      await this.calendarService.deleteEvent(id, organizationId);
      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
