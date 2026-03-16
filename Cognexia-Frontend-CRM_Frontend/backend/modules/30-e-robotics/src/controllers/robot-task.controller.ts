import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { RobotTaskService } from '../services/robot-task.service';
import { RobotAuthGuard } from '../guards/robot-auth.guard';
import { RobotRoleGuard } from '../guards/robot-role.guard';
import { TaskStatus, TaskType, TaskPriority } from '../entities/robot-task.entity';

@ApiTags('Robot Task Management')
@Controller('robotics/tasks')
@UseGuards(RobotAuthGuard, RobotRoleGuard)
@ApiBearerAuth()
export class RobotTaskController {
  private readonly logger = new Logger(RobotTaskController.name);

  constructor(
    private readonly taskService: RobotTaskService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tasks',
    description: 'Retrieve all tasks with optional filtering',
  })
  @ApiQuery({ name: 'fleetId', required: false })
  @ApiQuery({ name: 'robotId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  async getAllTasks(
    @Query('fleetId') fleetId?: string,
    @Query('robotId') robotId?: string,
    @Query('status') status?: TaskStatus,
    @Query('type') type?: TaskType,
    @Query('priority') priority?: TaskPriority,
  ) {
    try {
      const tasks = await this.taskService.findAll({
        fleetId,
        robotId,
        status,
        type,
        priority,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        data: tasks,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Retrieve detailed task information',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async getTaskById(@Param('id') id: string) {
    try {
      const task = await this.taskService.findById(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task details retrieved successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve task details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve task details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new task',
    description: 'Create a new task',
  })
  @ApiBody({ type: Object })
  async createTask(@Body() createTaskDto: any) {
    try {
      const task = await this.taskService.create(createTaskDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Task created successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to create task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Update task details and status',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: Object })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: any,
  ) {
    try {
      const task = await this.taskService.update(id, updateTaskDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task updated successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to update task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete task',
    description: 'Delete a task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async deleteTask(@Param('id') id: string) {
    try {
      await this.taskService.delete(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to delete task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update task status',
    description: 'Update task status and progress',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: Object })
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() statusUpdate: { status: TaskStatus; progress?: number; },
  ) {
    try {
      const task = await this.taskService.updateStatus(id, statusUpdate);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task status updated successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to update task status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/execution-log')
  @ApiOperation({
    summary: 'Get task execution log',
    description: 'Retrieve detailed execution history of the task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async getTaskExecutionLog(@Param('id') id: string) {
    try {
      const executionLog = await this.taskService.getExecutionLog(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task execution log retrieved successfully',
        data: executionLog,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve task execution log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve task execution log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/metrics')
  @ApiOperation({
    summary: 'Get task metrics',
    description: 'Retrieve performance metrics for the task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async getTaskMetrics(@Param('id') id: string) {
    try {
      const metrics = await this.taskService.getMetrics(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task metrics retrieved successfully',
        data: metrics,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve task metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve task metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/retry')
  @ApiOperation({
    summary: 'Retry failed task',
    description: 'Attempt to retry a failed task',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async retryTask(@Param('id') id: string) {
    try {
      const task = await this.taskService.retry(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Task retry initiated successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retry task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retry task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
