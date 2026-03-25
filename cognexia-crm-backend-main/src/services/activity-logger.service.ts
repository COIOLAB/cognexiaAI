import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from '../entities/activity.entity';
import { Note } from '../entities/note.entity';
import { CreateActivityDto, CreateNoteDto } from '../dto/activity.dto';
import { throwNotFound } from '../utils/error-handler.util';
import { AuditLogService } from './audit-log.service';
import { AuditAction, AuditLog } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ActivityLoggerService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditLogService: AuditLogService,
  ) { }

  /**
   * Log activity manually
   */
  async logActivity(
    organizationId: string,
    userId: string,
    userName: string,
    dto: CreateActivityDto,
  ): Promise<Activity> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: dto.activityType,
      title: dto.title,
      description: dto.description,
      performed_by: userId,
      performed_by_name: userName,
      related_to_id: dto.relatedToId,
      related_to_type: dto.relatedToType,
      metadata: dto.metadata,
      is_system_generated: false,
    });

    return this.activityRepo.save(activity);
  }

  /**
   * Log task created
   */
  async logTaskCreated(
    organizationId: string,
    userId: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: ActivityType.TASK_CREATED,
      title: `Created task: ${taskTitle}`,
      performed_by: userId,
      related_to_id: taskId,
      related_to_type: 'task',
      is_system_generated: true,
    });

    await this.activityRepo.save(activity);
  }

  /**
   * Log task completed
   */
  async logTaskCompleted(
    organizationId: string,
    userId: string,
    taskId: string,
    taskTitle: string,
  ): Promise<void> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: ActivityType.TASK_COMPLETED,
      title: `Completed task: ${taskTitle}`,
      performed_by: userId,
      related_to_id: taskId,
      related_to_type: 'task',
      is_system_generated: true,
    });

    await this.activityRepo.save(activity);
  }

  /**
   * Log event created
   */
  async logEventCreated(
    organizationId: string,
    userId: string,
    eventId: string,
    eventTitle: string,
    eventType: string,
  ): Promise<void> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: ActivityType.EVENT_CREATED,
      title: `Scheduled a ${eventType}: ${eventTitle}`,
      performed_by: userId,
      related_to_id: eventId,
      related_to_type: 'event',
      is_system_generated: true,
    });

    await this.activityRepo.save(activity);

    // Also log to Audit Log
    try {
      await this.auditLogService.log(
        organizationId,
        userId,
        AuditAction.CREATE,
        'event',
        eventId,
        `Scheduled ${eventType}: ${eventTitle}`,
        { eventTitle, eventType }
      );
    } catch (e) {
      console.error('Failed to log event creation to audit log:', e);
    }
  }

  /**
   * Log status change
   */
  async logStatusChanged(
    organizationId: string,
    userId: string,
    entityType: string,
    entityId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: ActivityType.STATUS_CHANGED,
      title: `Status changed from ${oldStatus} to ${newStatus}`,
      performed_by: userId,
      related_to_id: entityId,
      related_to_type: entityType,
      metadata: { oldStatus, newStatus },
      is_system_generated: true,
    });

    await this.activityRepo.save(activity);
  }

  /**
   * Log field update
   */
  async logFieldUpdated(
    organizationId: string,
    userId: string,
    entityType: string,
    entityId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
  ): Promise<void> {
    const activity = this.activityRepo.create({
      organizationId: organizationId,
      activity_type: ActivityType.FIELD_UPDATED,
      title: `Updated ${fieldName}`,
      description: `Changed from "${oldValue}" to "${newValue}"`,
      performed_by: userId,
      related_to_id: entityId,
      related_to_type: entityType,
      metadata: { fieldName, oldValue, newValue },
      is_system_generated: true,
    });

    await this.activityRepo.save(activity);
  }

  /**
   * Create note
   */
  async createNote(
    organizationId: string,
    userId: string,
    userName: string,
    dto: CreateNoteDto,
  ): Promise<Note> {
    const note = this.noteRepo.create({
      organizationId: organizationId,
      content: dto.content,
      created_by: userId,
      created_by_name: userName,
      related_to_id: dto.relatedToId,
      related_to_type: dto.relatedToType,
      is_pinned: dto.isPinned || false,
    });

    const savedNote = await this.noteRepo.save(note);

    // Also log as activity
    await this.logActivity(organizationId, userId, userName, {
      activityType: ActivityType.NOTE,
      title: 'Added a note',
      description: dto.content.substring(0, 100),
      relatedToId: dto.relatedToId,
      relatedToType: dto.relatedToType,
    });

    return savedNote;
  }

  /**
   * Get all activities with pagination
   */
  async getActivities(
    organizationId: string,
    query: any,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Activity[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { organizationId: organizationId };

      if (query.activityType) {
        where.activity_type = query.activityType;
      }
      if (query.relatedToType) {
        where.related_to_type = query.relatedToType;
      }
      if (query.relatedToId) {
        where.related_to_id = query.relatedToId;
      }
      if (query.performedBy) {
        where.performed_by = query.performedBy;
      }

      const [data, total] = await this.activityRepo.findAndCount({
        where,
        order: { created_at: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      });

      return { data: data || [], total: total || 0, page, limit };
    } catch (error) {
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Get team activities (manager + subordinates)
   */
  async getTeamActivities(
    managerId: string,
    organizationId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    try {
      const parsedLimit = Number(limit);
      const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;

      // Find all direct reports
      const subordinates = await this.userRepository.find({
        where: { managerId, organizationId },
        select: ['id', 'firstName', 'lastName', 'email'],
      });

      const teamIds = Array.from(new Set([managerId, ...subordinates.map((u) => u.id)]));

      const [activityRows, auditRows] = await Promise.all([
        this.activityRepo
          .createQueryBuilder('activity')
          .where('activity.organizationId = :organizationId', { organizationId })
          .andWhere('(activity.performed_by IN (:...teamIds) OR activity.related_to_id IN (:...teamIds))', { teamIds })
          .orderBy('activity.created_at', 'DESC')
          .take(safeLimit)
          .getMany(),
        this.auditLogRepo
          .createQueryBuilder('audit')
          .where('audit.organizationId = :organizationId', { organizationId })
          .andWhere('audit.user_id IN (:...teamIds)', { teamIds })
          .orderBy('audit.created_at', 'DESC')
          .take(safeLimit)
          .getMany(),
      ]);

      const managerNameMap = new Map<string, string>();
      subordinates.forEach((u) => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        managerNameMap.set(u.id, fullName || u.email || 'Team member');
      });

      const auditActivities: Activity[] = auditRows.map((log) => {
        const actorId = log.user_id || managerId;
        const inferredName =
          (log.metadata && typeof log.metadata === 'object' ? log.metadata.userName : undefined) ||
          managerNameMap.get(actorId) ||
          log.user_email ||
          'Team member';

        const titleFromMetadata =
          log.metadata && typeof log.metadata === 'object' ? log.metadata.description : undefined;

        return {
          id: `audit-${log.id}`,
          organizationId,
          activity_type: ActivityType.FIELD_UPDATED,
          title: titleFromMetadata || `${(log.action || 'update').toString().toUpperCase()} ${log.entity_type || 'record'}`,
          description: titleFromMetadata || '',
          performed_by: actorId,
          performed_by_name: inferredName,
          related_to_id: log.entity_id || null,
          related_to_type: log.entity_type || 'audit',
          metadata: {
            source: 'audit_log',
            action: log.action,
            status: log.status,
          },
          is_system_generated: true,
          created_at: log.created_at,
        } as Activity;
      });

      const merged = [...activityRows, ...auditActivities]
        .sort((a, b) => {
          const aTs = new Date((a as any).created_at || (a as any).createdAt || 0).getTime();
          const bTs = new Date((b as any).created_at || (b as any).createdAt || 0).getTime();
          return bTs - aTs;
        })
        .slice(0, safeLimit);

      return merged || [];
    } catch (error) {
      console.error('Failed to get team activities:', error);
      return [];
    }
  }

  /**
   * Get single activity by ID
   */
  async getActivity(
    activityId: string,
    organizationId: string,
  ): Promise<Activity> {
    try {
      const activity = await this.activityRepo.findOne({
        where: {
          id: activityId,
          organizationId: organizationId,
        },
      });

      return activity || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get activity timeline
   */
  async getActivityTimeline(
    organizationId: string,
    relatedToId: string,
    relatedToType: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    try {
      const activities = await this.activityRepo.find({
        where: {
          organizationId: organizationId,
          related_to_id: relatedToId,
          related_to_type: relatedToType,
        },
        order: { created_at: 'DESC' },
        take: limit,
      });
      return activities || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get notes for entity
   */
  async getNotesForEntity(
    organizationId: string,
    relatedToId: string,
    relatedToType: string,
  ): Promise<Note[]> {
    return this.noteRepo.find({
      where: {
        organizationId: organizationId,
        related_to_id: relatedToId,
        related_to_type: relatedToType,
      },
      order: { is_pinned: 'DESC', created_at: 'DESC' },
    });
  }

  /**
   * Update note
   */
  async updateNote(noteId: string, content: string): Promise<Note> {
    const note = await this.noteRepo.findOne({ where: { id: noteId } });
    if (!note) throwNotFound('Note');

    note.content = content;
    return this.noteRepo.save(note);
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string): Promise<void> {
    const note = await this.noteRepo.findOne({ where: { id: noteId } });
    if (!note) throwNotFound('Note');
    await this.noteRepo.remove(note);
  }

  /**
   * Pin/Unpin note
   */
  async togglePinNote(noteId: string): Promise<Note> {
    const note = await this.noteRepo.findOne({ where: { id: noteId } });
    if (!note) throwNotFound('Note');

    note.is_pinned = !note.is_pinned;
    return this.noteRepo.save(note);
  }
}
