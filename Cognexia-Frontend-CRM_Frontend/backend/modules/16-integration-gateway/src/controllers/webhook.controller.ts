// Industry 5.0 ERP Backend - Webhook Controller
// Managing webhook subscriptions, events, and callbacks

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { WebhookService } from '../services/webhook.service';
import { IntegrationSecurityGuard } from '../guards/integration-security.guard';

@ApiTags('Webhooks')
@Controller('api/webhooks')
@UseGuards(IntegrationSecurityGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService
  ) {}

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create webhook subscription' })
  async createWebhookSubscription(
    @Body(ValidationPipe) subscriptionDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const subscription = await this.webhookService.createSubscription(subscriptionDto, req.user);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: subscription,
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

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all webhook subscriptions' })
  async getWebhookSubscriptions(
    @Query('active') active?: boolean,
    @Query('event') event?: string,
    @Res() res: Response
  ) {
    try {
      const subscriptions = await this.webhookService.getSubscriptions({ active, event });
      res.status(HttpStatus.OK).json({
        success: true,
        data: subscriptions,
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

  @Post('events/:event')
  @ApiOperation({ summary: 'Trigger webhook event' })
  async triggerWebhookEvent(
    @Param('event') event: string,
    @Body() eventData: any,
    @Res() res: Response
  ) {
    try {
      const result = await this.webhookService.triggerEvent(event, eventData);
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

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Delete webhook subscription' })
  async deleteWebhookSubscription(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      await this.webhookService.deleteSubscription(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Webhook subscription deleted successfully',
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
}
