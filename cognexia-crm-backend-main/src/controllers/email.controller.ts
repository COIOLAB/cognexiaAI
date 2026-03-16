import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { EmailCampaignService } from '../services/email-campaign.service';
import { EmailSenderService } from '../services/email-sender.service';
import { CreateEmailCampaignDto, UpdateEmailCampaignDto, SendEmailDto } from '../dto/email.dto';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';
import { TenantGuard, BypassTenant } from '../guards/tenant.guard';
import { TrackingEvent } from '../entities/email-tracking.entity';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EmailController {
  constructor(
    private readonly campaignService: EmailCampaignService,
    private readonly senderService: EmailSenderService,
  ) {}

  @Post('campaigns')
  @ApiOperation({ summary: 'Create email campaign' })
  async createCampaign(@Body() dto: CreateEmailCampaignDto, @Req() req: any) {
    return this.campaignService.createCampaign(
      req.user.organizationId,
      req.user.id,
      dto,
    );
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List email campaigns' })
  async listCampaigns(@Req() req: any) {
    return this.campaignService.listCampaigns(req.user.organizationId);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign details' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaignStats(id);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateEmailCampaignDto,
  ) {
    return this.campaignService.updateCampaign(id, dto);
  }

  @Post('campaigns/:id/send')
  @ApiOperation({ summary: 'Send campaign' })
  async sendCampaign(@Param('id') id: string) {
    await this.campaignService.sendCampaign(id);
    return { message: 'Campaign sent successfully' };
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  async deleteCampaign(@Param('id') id: string) {
    await this.campaignService.deleteCampaign(id);
    return { message: 'Campaign deleted' };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send single email' })
  async sendEmail(@Body() dto: SendEmailDto, @Req() req: any) {
    return this.senderService.sendEmail(
      req.user.organizationId,
      dto.toEmail,
      dto.subject,
      dto.bodyHtml,
      {
        toName: dto.toName,
        variables: dto.variables,
      },
    );
  }

  @Get('track/open/:token')
  @ApiOperation({ summary: 'Track email open' })
  @Public()
  @BypassTenant()
  async trackOpen(
    @Param('token') token: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Track the open event
    // In real implementation, decode token to get email log ID
    const emailLogId = token; // Simplified
    
    await this.senderService.trackEvent(emailLogId, TrackingEvent.OPENED, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    
    res.setHeader('Content-Type', 'image/gif');
    res.send(pixel);
  }

  @Get('track/click/:token')
  @ApiOperation({ summary: 'Track email click' })
  @Public()
  @BypassTenant()
  async trackClick(
    @Param('token') token: string,
    @Query('url') url: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Track the click event
    const emailLogId = token; // Simplified
    
    await this.senderService.trackEvent(emailLogId, TrackingEvent.CLICKED, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      clickedUrl: url,
    });

    // Redirect to original URL
    res.redirect(url);
  }
}
