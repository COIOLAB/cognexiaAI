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
  Ip,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { FormService } from '../services/form.service';
import { CreateFormDto, UpdateFormDto, SubmitFormDto } from '../dto/form.dto';

@ApiTags('Lead Capture Forms')
@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  // ============ Admin: Form Management ============

  @Post()
  @ApiOperation({ summary: 'Create form' })
  @ApiResponse({ status: 201, description: 'Form created successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async createForm(@Request() req, @Body() dto: CreateFormDto) {
    return this.formService.createForm(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forms' })
  @ApiResponse({ status: 200, description: 'List of forms' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getForms(@Request() req) {
    return this.formService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form by ID' })
  @ApiResponse({ status: 200, description: 'Form details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getForm(@Request() req, @Param('id') id: string) {
    return this.formService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update form' })
  @ApiResponse({ status: 200, description: 'Form updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async updateForm(@Request() req, @Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.formService.updateForm(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form' })
  @ApiResponse({ status: 200, description: 'Form deleted successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async deleteForm(@Request() req, @Param('id') id: string) {
    await this.formService.deleteForm(id, req.user.tenantId);
    return { message: 'Form deleted successfully' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish form' })
  @ApiResponse({ status: 200, description: 'Form published successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async publishForm(@Request() req, @Param('id') id: string) {
    return this.formService.publishForm(id, req.user.tenantId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause form' })
  @ApiResponse({ status: 200, description: 'Form paused successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async pauseForm(@Request() req, @Param('id') id: string) {
    return this.formService.pauseForm(id, req.user.tenantId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate form' })
  @ApiResponse({ status: 201, description: 'Form duplicated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async duplicateForm(@Request() req, @Param('id') id: string) {
    return this.formService.duplicateForm(id, req.user.tenantId, req.user.sub);
  }

  // ============ Public: Form Submission ============

  @Get(':id/view')
  @ApiOperation({ summary: 'Track form view (public)' })
  @ApiResponse({ status: 200, description: 'View tracked' })
  async trackView(@Param('id') id: string) {
    await this.formService.trackFormView(id);
    return { message: 'View tracked' };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit form (public)' })
  @ApiResponse({ status: 201, description: 'Form submitted successfully' })
  async submitForm(
    @Param('id') id: string,
    @Body() dto: SubmitFormDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.formService.submitForm(id, dto, ip, userAgent || '');
    
    return {
      success: true,
      message: 'Form submitted successfully',
      submissionId: result.submission.id,
      leadId: result.lead?.id,
    };
  }

  // ============ Analytics & Submissions ============

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get form submissions' })
  @ApiResponse({ status: 200, description: 'List of form submissions' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getFormSubmissions(@Request() req, @Param('id') id: string) {
    return this.formService.getFormSubmissions(id, req.user.tenantId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get form analytics' })
  @ApiResponse({ status: 200, description: 'Form analytics data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getFormAnalytics(@Request() req, @Param('id') id: string) {
    return this.formService.getFormAnalytics(id, req.user.tenantId);
  }

  // ============ Embed & Integration ============

  @Get(':id/embed-code')
  @ApiOperation({ summary: 'Get embed code' })
  @ApiResponse({ status: 200, description: 'Embed code HTML' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getEmbedCode(@Request() req, @Param('id') id: string) {
    const form = await this.formService.findOne(id, req.user.tenantId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return {
      embedCode: form.embedCode,
      embedUrl: `${process.env.APP_URL}/forms/${form.id}/embed`,
      instructions: 'Copy and paste the embed code into your website HTML',
    };
  }

  @Get(':id/embed')
  @ApiOperation({ summary: 'Get embeddable form HTML (public)' })
  @ApiResponse({ status: 200, description: 'Form embed HTML' })
  async getEmbedForm(@Param('id') id: string) {
    // This would return a complete HTML page for iframe embedding
    // For now, returning form data - in production, you'd render HTML
    const form = await this.formService.findPublicById(id);
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return {
      formId: form.id,
      name: form.name,
      fields: form.fields,
      design: form.design,
      enableRecaptcha: form.enableRecaptcha,
      enableHoneypot: form.enableHoneypot,
    };
  }
}
