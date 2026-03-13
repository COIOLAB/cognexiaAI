import { Controller, Post, Get, Param, Body, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { LLMIntegrationService } from '../services/llm-integration.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('llm')
@UseGuards(JwtAuthGuard)
export class LLMIntegrationController {
  constructor(private readonly service: LLMIntegrationService) {}

  private getOrganizationId(req: any) {
    const organizationId =
      req.user?.organizationId ||
      req.user?.tenantId ||
      req.body?.organizationId ||
      req.query?.organizationId;
    if (!organizationId) {
      throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
    }
    return organizationId;
  }

  @Post('chat')
  async startChat(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.startConversation(data, organizationId);
  }

  @Post('chat/:conversationId/messages')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('message') message: string,
    @Body('role') role: string,
    @Req() req: any,
  ) {
    try {
      const organizationId = this.getOrganizationId(req);
      const result = await this.service.sendMessage(conversationId, message, role || 'user', organizationId);
      if (!result) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to send message', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getConversation(id, organizationId);
  }

  @Post('content-generation')
  async generateContent(@Body() data: any, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      return await this.service.generateContent(data?.prompt, data?.contentType, organizationId);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to generate content', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('analysis')
  async analyzeData(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.analyzeData(data.entityType, data.entityId, data.analysisType, organizationId);
  }

  @Post('sentiment')
  async analyzeSentiment(@Body('customerId') customerId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.analyzeSentiment(customerId, organizationId);
  }

  @Post('email-copy')
  async generateEmailCopy(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.generateEmailCopy(data, organizationId);
  }

  @Post('summarize')
  async summarizeText(@Body('text') text: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.summarizeText(text, organizationId);
  }

  @Get('models')
  async getModels(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getModels(organizationId);
  }
}
