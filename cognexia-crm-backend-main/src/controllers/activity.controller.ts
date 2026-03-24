import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaskService } from '../services/task.service';
import { ActivityLoggerService } from '../services/activity-logger.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
} from '../dto/task.dto';
import {
  CreateActivityDto,
  CreateNoteDto,
  ActivityQueryDto,
} from '../dto/activity.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';

@ApiTags('Activity & Tasks')
@Controller('activity')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ActivityController {
  constructor(
    private readonly taskService: TaskService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  // ========== TASKS ==========

  @Post('tasks')
  @ApiOperation({ summary: 'Create task' })
  async createTask(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.taskService.createTask(
      req.user.organizationId,
      req.user.id,
      dto,
    );
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List tasks' })
  async listTasks(
    @Query() query: TaskQueryDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Req() req: any,
  ) {
    return this.taskService.listTasks(
      req.user.organizationId,
      query,
      page,
      limit,
    );
  }

  @Get('tasks/my')
  @ApiOperation({ summary: 'Get my tasks' })
  async getMyTasks(@Query('status') status: string, @Req() req: any) {
    return this.taskService.getTasksByAssignee(
      req.user.organizationId,
      req.user.id,
      status as any,
    );
  }

  @Get('tasks/overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  async getOverdueTasks(@Req() req: any) {
    return this.taskService.getOverdueTasks(req.user.organizationId);
  }

  @Get('tasks/stats')
  @ApiOperation({ summary: 'Get task statistics' })
  async getTaskStats(@Query('userId') userId: string, @Req() req: any) {
    return this.taskService.getTaskStats(
      req.user.organizationId,
      userId || req.user.id,
    );
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  async getTask(@Param('id') id: string) {
    return this.taskService.getTask(id);
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.taskService.updateTask(id, req.user.id, dto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  async deleteTask(@Param('id') id: string) {
    await this.taskService.deleteTask(id);
    return { message: 'Task deleted successfully' };
  }

  // ========== ACTIVITIES ==========

  @Post('log')
  @ApiOperation({ summary: 'Log activity manually' })
  async logActivity(@Body() dto: CreateActivityDto, @Req() req: any) {
    return this.activityLogger.logActivity(
      req.user.organizationId,
      req.user.id,
      req.user.name || 'User',
      dto,
    );
  }

  @Get('team')
  @ApiOperation({ summary: 'Get team activity timeline' })
  async getTeamActivities(
    @Query('limit') limit: number = 50,
    @Req() req: any,
  ) {
    return this.activityLogger.getTeamActivities(
      req.user.id,
      req.user.organizationId,
      limit,
    );
  }

  @Get('timeline/:entityType/:entityId')
  @ApiOperation({ summary: 'Get activity timeline for entity' })
  async getTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit: number = 50,
    @Req() req: any,
  ) {
    return this.activityLogger.getActivityTimeline(
      req.user.organizationId,
      entityId,
      entityType,
      limit,
    );
  }

  // ========== NOTES ==========

  @Post('notes')
  @ApiOperation({ summary: 'Create note' })
  async createNote(@Body() dto: CreateNoteDto, @Req() req: any) {
    return this.activityLogger.createNote(
      req.user.organizationId,
      req.user.id,
      req.user.name || 'User',
      dto,
    );
  }

  @Get('notes/:entityType/:entityId')
  @ApiOperation({ summary: 'Get notes for entity' })
  async getNotes(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Req() req: any,
  ) {
    return this.activityLogger.getNotesForEntity(
      req.user.organizationId,
      entityId,
      entityType,
    );
  }

  @Put('notes/:id')
  @ApiOperation({ summary: 'Update note' })
  async updateNote(@Param('id') id: string, @Body('content') content: string) {
    return this.activityLogger.updateNote(id, content);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Delete note' })
  async deleteNote(@Param('id') id: string) {
    await this.activityLogger.deleteNote(id);
    return { message: 'Note deleted successfully' };
  }

  @Post('notes/:id/pin')
  @ApiOperation({ summary: 'Pin/unpin note' })
  async togglePinNote(@Param('id') id: string) {
    return this.activityLogger.togglePinNote(id);
  }
}
