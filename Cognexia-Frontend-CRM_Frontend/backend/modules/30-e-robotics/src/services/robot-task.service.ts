import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotTask, TaskStatus } from '../entities/robot-task.entity';

@Injectable()
export class RobotTaskService {
  private readonly logger = new Logger(RobotTaskService.name);

  constructor(
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
  ) {}

  async findAll(filters: {
    fleetId?: string;
    robotId?: string;
    status?: TaskStatus;
    type?: string;
    priority?: string;
  }) {
    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.fleet', 'fleet');

    if (filters.fleetId) {
      query.andWhere('task.fleetId = :fleetId', { fleetId: filters.fleetId });
    }

    if (filters.robotId) {
      query.andWhere('task.assignedRobotId = :robotId', { robotId: filters.robotId });
    }

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.type) {
      query.andWhere('task.type = :type', { type: filters.type });
    }

    if (filters.priority) {
      query.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    query.orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await query.getManyAndCount();

    return {
      tasks,
      total,
      metrics: {
        pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        failed: tasks.filter(t => t.status === TaskStatus.FAILED).length,
      },
    };
  }

  async findById(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['fleet'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async create(createTaskDto: any) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      status: TaskStatus.PENDING,
      progress: 0,
      executionHistory: [{
        timestamp: new Date(),
        status: TaskStatus.PENDING,
        message: 'Task created',
      }],
    });

    return await this.taskRepository.save(task);
  }

  async update(id: string, updateTaskDto: any) {
    const task = await this.findById(id);
    const updatedTask = Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(updatedTask);
  }

  async delete(id: string) {
    const task = await this.findById(id);
    await this.taskRepository.softRemove(task);
  }

  async updateStatus(id: string, statusUpdate: { status: TaskStatus; progress?: number }) {
    const task = await this.findById(id);
    
    // Update task status
    task.status = statusUpdate.status;
    if (statusUpdate.progress !== undefined) {
      task.progress = statusUpdate.progress;
    }

    // Update timestamps based on status
    switch (statusUpdate.status) {
      case TaskStatus.IN_PROGRESS:
        if (!task.startedAt) {
          task.startedAt = new Date();
        }
        break;
      case TaskStatus.COMPLETED:
        task.completedAt = new Date();
        task.progress = 100;
        break;
      case TaskStatus.FAILED:
        task.completedAt = new Date();
        break;
    }

    // Add to execution history
    task.executionHistory.push({
      timestamp: new Date(),
      status: statusUpdate.status,
      progress: statusUpdate.progress || task.progress,
      message: `Task status updated to ${statusUpdate.status}`,
    });

    return await this.taskRepository.save(task);
  }

  async getExecutionLog(id: string) {
    const task = await this.findById(id);
    
    return {
      taskId: task.id,
      taskName: task.name,
      currentStatus: task.status,
      progress: task.progress,
      timeline: task.executionHistory,
      metrics: {
        totalDuration: task.completedAt ? 
          (task.completedAt.getTime() - task.startedAt.getTime()) / 1000 : 
          ((new Date()).getTime() - task.startedAt?.getTime()) / 1000,
        attempts: task.executionHistory.filter(h => h.status === TaskStatus.IN_PROGRESS).length,
        failures: task.executionHistory.filter(h => h.status === TaskStatus.FAILED).length,
      },
    };
  }

  async getMetrics(id: string) {
    const task = await this.findById(id);
    
    // Calculate various metrics
    const duration = task.completedAt ? 
      (task.completedAt.getTime() - task.startedAt.getTime()) / 1000 :
      task.startedAt ? ((new Date()).getTime() - task.startedAt.getTime()) / 1000 : 0;

    const isCompleted = task.status === TaskStatus.COMPLETED;
    const attempts = task.executionHistory.filter(h => h.status === TaskStatus.IN_PROGRESS).length;
    const failures = task.executionHistory.filter(h => h.status === TaskStatus.FAILED).length;

    return {
      taskId: task.id,
      taskType: task.type,
      status: task.status,
      metrics: {
        duration,
        progress: task.progress,
        attempts,
        failures,
        successRate: attempts > 0 ? ((attempts - failures) / attempts) * 100 : 0,
        completionTime: isCompleted ? duration : null,
        efficiency: task.metrics?.efficiency || null,
        accuracy: task.metrics?.accuracy || null,
        qualityScore: task.metrics?.qualityScore || null,
      },
      resourceUtilization: {
        energyUsed: task.metrics?.energyUsed || 0,
        distance: task.metrics?.distance || 0,
        robotUtilization: duration / (60 * 60), // hours
      },
      qualityMetrics: task.qualityChecks?.map(check => ({
        checkPoint: check.checkPoint,
        result: check.result,
        timestamp: check.timestamp,
      })) || [],
      timeline: task.executionHistory.map(entry => ({
        timestamp: entry.timestamp,
        status: entry.status,
        progress: entry.progress,
      })),
    };
  }

  async retry(id: string) {
    const task = await this.findById(id);

    if (task.status !== TaskStatus.FAILED) {
      throw new Error('Only failed tasks can be retried');
    }

    // Reset task status and progress
    task.status = TaskStatus.PENDING;
    task.progress = 0;
    task.startedAt = null;
    task.completedAt = null;

    // Add retry attempt to history
    task.executionHistory.push({
      timestamp: new Date(),
      status: TaskStatus.PENDING,
      progress: 0,
      message: 'Task retry initiated',
    });

    // Clear any failure details from previous attempt
    task.failureDetails = null;

    return await this.taskRepository.save(task);
  }
}
