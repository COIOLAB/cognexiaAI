// Industry 5.0 ERP Backend - Message Queue Controller
// Managing message queue operations and messaging systems

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessageQueueService } from '../services/message-queue.service';
import { IntegrationSecurityGuard } from '../guards/integration-security.guard';

@ApiTags('Message Queue')
@Controller('api/message-queue')
@UseGuards(IntegrationSecurityGuard)
@ApiBearerAuth()
export class MessageQueueController {
  constructor(
    private readonly messageQueueService: MessageQueueService
  ) {}

  @Post('publish')
  @ApiOperation({ summary: 'Publish message to queue' })
  async publishMessage(
    @Body(ValidationPipe) messageDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const result = await this.messageQueueService.publishMessage(messageDto);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('queues')
  @ApiOperation({ summary: 'Get all message queues' })
  async getMessageQueues(
    @Query('status') status?: string,
    @Res() res: Response
  ) {
    try {
      const queues = await this.messageQueueService.getQueues({ status });
      res.status(HttpStatus.OK).json({
        success: true,
        data: queues,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('queues/:queueName/messages')
  @ApiOperation({ summary: 'Get messages from queue' })
  async getQueueMessages(
    @Param('queueName') queueName: string,
    @Query('limit') limit: number = 10,
    @Res() res: Response
  ) {
    try {
      const messages = await this.messageQueueService.getMessages(queueName, limit);
      res.status(HttpStatus.OK).json({
        success: true,
        data: messages,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
