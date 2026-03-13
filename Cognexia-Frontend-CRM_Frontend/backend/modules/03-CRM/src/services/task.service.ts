import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dto/task.dto';
import { ActivityLoggerService } from './activity-logger.service';
import { throwNotFound } from '../utils/error-handler.util';
import { createPaginatedResult } from '../utils/pagination.util';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private activityLogger: ActivityLoggerService,
  ) {}

  /**
   * Create task
   */
  async createTask(
    organizationId: string,
    userId: string,
    dto: CreateTaskDto,
  ): Promise<Task> {
    const task = this.taskRepo.create({
      organization_id: organizationId,
      created_by: userId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigned_to: dto.assignedTo,
      related_to_id: dto.relatedToId,
      related_to_type: dto.relatedToType,
      due_date: dto.dueDate ? new Date(dto.dueDate) : null,
      tags: dto.tags,
    });

    const savedTask = await this.taskRepo.save(task);

    // Log activity
    await this.activityLogger.logTaskCreated(
      organizationId,
      userId,
      savedTask.id,
      savedTask.title,
    );

    return savedTask;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throwNotFound('Task');

    const oldStatus = task.status;
    Object.assign(task, dto);

    if (dto.dueDate) {
      task.due_date = new Date(dto.dueDate);
    }

    // Mark completed
    if (dto.status === TaskStatus.COMPLETED && oldStatus !== TaskStatus.COMPLETED) {
      task.completed_at = new Date();
      await this.activityLogger.logTaskCompleted(
        task.organization_id,
        userId,
        task.id,
        task.title,
      );
    }

    const savedTask = await this.taskRepo.save(task);

    // Log status change
    if (dto.status && dto.status !== oldStatus) {
      await this.activityLogger.logStatusChanged(
        task.organization_id,
        userId,
        'task',
        task.id,
        oldStatus,
        dto.status,
      );
    }

    return savedTask;
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throwNotFound('Task');
    return task;
  }

  /**
   * List tasks
   */
  async listTasks(
    organizationId: string,
    query: TaskQueryDto,
    page: number = 1,
    limit: number = 20,
  ) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const where: any = { organization_id: organizationId };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.relatedToId) where.related_to_id = query.relatedToId;
    if (query.relatedToType) where.related_to_type = query.relatedToType;

    const [tasks, total] = await this.taskRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return createPaginatedResult(tasks, safePage, safeLimit, total);
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throwNotFound('Task');
    await this.taskRepo.remove(task);
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(
    organizationId: string,
    userId: string,
    status?: TaskStatus,
  ): Promise<Task[]> {
    const where: any = {
      organization_id: organizationId,
      assigned_to: userId,
    };

    if (status) where.status = status;

    return this.taskRepo.find({
      where,
      order: { due_date: 'ASC', priority: 'DESC' },
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(organizationId: string): Promise<Task[]> {
    return this.taskRepo
      .createQueryBuilder('task')
      .where('task.organization_id = :organizationId', { organizationId })
      .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .andWhere('task.due_date < :now', { now: new Date() })
      .orderBy('task.due_date', 'ASC')
      .getMany();
  }

  /**
   * Get task statistics
   */
  async getTaskStats(organizationId: string, userId?: string) {
    const where: any = { organization_id: organizationId };
    if (userId) where.assignedTo = userId;

    const total = await this.taskRepo.count({ where });
    const completed = await this.taskRepo.count({
      where: { ...where, status: TaskStatus.COMPLETED },
    });
    const inProgress = await this.taskRepo.count({
      where: { ...where, status: TaskStatus.IN_PROGRESS },
    });
    const overdue = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.organization_id = :organizationId', { organizationId })
      .andWhere(userId ? 'task.assignedTo = :userId' : '1=1', { userId })
      .andWhere('task.status != :completed', { completed: TaskStatus.COMPLETED })
      .andWhere('task.due_date < :now', { now: new Date() })
      .getCount();

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}
