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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { CallService } from '../services/call.service';
import { CallQueueService } from '../services/call-queue.service';
import { CallAnalyticsService } from '../services/call-analytics.service';
import {
  InitiateCallDto,
  UpdateCallDto,
  CallSearchDto,
  TransferCallDto,
  CreateQueueDto,
  UpdateQueueDto,
  AddAgentToQueueDto,
  CallAnalyticsQuery,
} from '../dto/telephony.dto';
import { CallDisposition } from '../entities/call.entity';

@ApiTags('Calls')
@Controller('calls')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a new call' })
  @ApiResponse({ status: 201, description: 'Call initiated successfully' })
  async initiateCall(@Request() req, @Body() dto: InitiateCallDto) {
    return this.callService.initiateCall(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search calls' })
  @ApiResponse({ status: 200, description: 'List of calls' })
  async searchCalls(@Request() req, @Query() dto: CallSearchDto) {
    return this.callService.searchCalls(req.user.tenantId, dto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent calls' })
  @ApiResponse({ status: 200, description: 'Recent calls' })
  async getRecentCalls(@Request() req, @Query('limit') limit?: number) {
    return this.callService.getRecentCalls(req.user.tenantId, limit);
  }

  @Get('missed')
  @ApiOperation({ summary: 'Get missed calls' })
  @ApiResponse({ status: 200, description: 'Missed calls' })
  async getMissedCalls(@Request() req, @Query('agentId') agentId?: string) {
    return this.callService.getMissedCalls(req.user.tenantId, agentId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get call statistics' })
  @ApiResponse({ status: 200, description: 'Call statistics' })
  async getCallStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.callService.getCallStatistics(
      req.user.tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get calls by customer' })
  @ApiResponse({ status: 200, description: 'Customer calls' })
  async getCallsByCustomer(@Request() req, @Param('customerId') customerId: string) {
    return this.callService.getCallsByCustomer(customerId, req.user.tenantId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get calls by agent' })
  @ApiResponse({ status: 200, description: 'Agent calls' })
  async getCallsByAgent(
    @Request() req,
    @Param('agentId') agentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.callService.getCallsByAgent(
      agentId,
      req.user.tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get call by ID' })
  @ApiResponse({ status: 200, description: 'Call details' })
  async getCall(@Request() req, @Param('id') id: string) {
    return this.callService.findCallById(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update call' })
  @ApiResponse({ status: 200, description: 'Call updated successfully' })
  async updateCall(@Request() req, @Param('id') id: string, @Body() dto: UpdateCallDto) {
    return this.callService.updateCall(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete call' })
  @ApiResponse({ status: 200, description: 'Call deleted successfully' })
  async deleteCall(@Request() req, @Param('id') id: string) {
    await this.callService.deleteCall(id, req.user.tenantId);
    return { message: 'Call deleted successfully' };
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Answer a call' })
  @ApiResponse({ status: 200, description: 'Call answered' })
  async answerCall(@Request() req, @Param('id') id: string, @Body('agentId') agentId: string) {
    return this.callService.answerCall(id, req.user.tenantId, agentId);
  }

  @Post(':id/hangup')
  @ApiOperation({ summary: 'Hangup a call' })
  @ApiResponse({ status: 200, description: 'Call ended' })
  async hangupCall(@Request() req, @Param('id') id: string, @Body('disposition') disposition?: CallDisposition) {
    return this.callService.hangupCall(id, req.user.tenantId, disposition);
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Put call on hold' })
  @ApiResponse({ status: 200, description: 'Call on hold' })
  async holdCall(@Request() req, @Param('id') id: string) {
    return this.callService.holdCall(id, req.user.tenantId);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume call from hold' })
  @ApiResponse({ status: 200, description: 'Call resumed' })
  async resumeCall(@Request() req, @Param('id') id: string) {
    return this.callService.resumeCall(id, req.user.tenantId);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer call' })
  @ApiResponse({ status: 200, description: 'Call transferred' })
  async transferCall(@Request() req, @Param('id') id: string, @Body() dto: TransferCallDto) {
    return this.callService.transferCall(id, req.user.tenantId, dto);
  }

  @Post(':id/missed')
  @ApiOperation({ summary: 'Mark call as missed' })
  @ApiResponse({ status: 200, description: 'Call marked as missed' })
  async markAsMissed(@Request() req, @Param('id') id: string) {
    return this.callService.markAsMissed(id, req.user.tenantId);
  }
}

@ApiTags('Call Queues')
@Controller('call-queues')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CallQueueController {
  constructor(private readonly queueService: CallQueueService) {}

  @Post()
  @ApiOperation({ summary: 'Create call queue' })
  @ApiResponse({ status: 201, description: 'Queue created successfully' })
  async createQueue(@Request() req, @Body() dto: CreateQueueDto) {
    return this.queueService.createQueue(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all queues' })
  @ApiResponse({ status: 200, description: 'List of queues' })
  async getAllQueues(@Request() req) {
    return this.queueService.findAllQueues(req.user.tenantId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available queues' })
  @ApiResponse({ status: 200, description: 'Available queues' })
  async getAvailableQueues(@Request() req) {
    return this.queueService.getAvailableQueues(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get queue by ID' })
  @ApiResponse({ status: 200, description: 'Queue details' })
  async getQueue(@Request() req, @Param('id') id: string) {
    return this.queueService.findQueueById(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update queue' })
  @ApiResponse({ status: 200, description: 'Queue updated successfully' })
  async updateQueue(@Request() req, @Param('id') id: string, @Body() dto: UpdateQueueDto) {
    return this.queueService.updateQueue(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete queue' })
  @ApiResponse({ status: 200, description: 'Queue deleted successfully' })
  async deleteQueue(@Request() req, @Param('id') id: string) {
    await this.queueService.deleteQueue(id, req.user.tenantId);
    return { message: 'Queue deleted successfully' };
  }

  @Post(':id/agents')
  @ApiOperation({ summary: 'Add agents to queue' })
  @ApiResponse({ status: 200, description: 'Agents added to queue' })
  async addAgents(@Request() req, @Param('id') id: string, @Body() dto: AddAgentToQueueDto) {
    return this.queueService.addAgentsToQueue(id, req.user.tenantId, dto.agentIds);
  }

  @Delete(':id/agents/:agentId')
  @ApiOperation({ summary: 'Remove agent from queue' })
  @ApiResponse({ status: 200, description: 'Agent removed from queue' })
  async removeAgent(@Request() req, @Param('id') id: string, @Param('agentId') agentId: string) {
    return this.queueService.removeAgentFromQueue(id, req.user.tenantId, agentId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStatistics(@Request() req, @Param('id') id: string) {
    return this.queueService.getQueueStatistics(id, req.user.tenantId);
  }
}

@ApiTags('Call Analytics')
@Controller('call-analytics')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CallAnalyticsController {
  constructor(private readonly analyticsService: CallAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get call analytics' })
  @ApiResponse({ status: 200, description: 'Call analytics data' })
  async getAnalytics(@Request() req, @Query() query: CallAnalyticsQuery) {
    return this.analyticsService.getAnalytics(req.user.tenantId, query);
  }

  @Get('agent/:agentId/performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  @ApiResponse({ status: 200, description: 'Agent performance data' })
  async getAgentPerformance(
    @Request() req,
    @Param('agentId') agentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAgentPerformance(
      req.user.tenantId,
      agentId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get call trends' })
  @ApiResponse({ status: 200, description: 'Call trends data' })
  async getCallTrends(@Request() req, @Query('days') days?: number) {
    return this.analyticsService.getCallTrends(req.user.tenantId, days);
  }
}
