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
import { SequenceEngineService } from '../services/sequence-engine.service';
import { SequenceAnalyticsService } from '../services/sequence-analytics.service';
import {
  CreateSequenceDto,
  UpdateSequenceDto,
  EnrollLeadDto,
  BulkEnrollLeadsDto,
  UnenrollLeadDto,
  PauseEnrollmentDto,
  ResumeEnrollmentDto,
  SequenceAnalyticsDto,
  EnrollmentListDto,
} from '../dto/sequence.dto';

@ApiTags('Sales Sequences')
@Controller('sequences')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class SequenceController {
  constructor(
    private readonly sequenceEngine: SequenceEngineService,
    private readonly sequenceAnalytics: SequenceAnalyticsService,
  ) {}

  // ============ Sequence CRUD ============

  @Post()
  @ApiOperation({ summary: 'Create sales sequence' })
  @ApiResponse({ status: 201, description: 'Sequence created successfully' })
  async createSequence(@Request() req, @Body() dto: CreateSequenceDto) {
    return this.sequenceEngine.createSequence(req.user.tenantId || req.user.organizationId, req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sequences' })
  @ApiResponse({ status: 200, description: 'List of sequences' })
  async getSequences(@Request() req) {
    return this.sequenceEngine.findAll(req.user.tenantId || req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sequence by ID' })
  @ApiResponse({ status: 200, description: 'Sequence details' })
  async getSequence(@Request() req, @Param('id') id: string) {
    return this.sequenceEngine.findOne(id, req.user.tenantId || req.user.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sequence' })
  @ApiResponse({ status: 200, description: 'Sequence updated successfully' })
  async updateSequence(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSequenceDto,
  ) {
    return this.sequenceEngine.updateSequence(id, req.user.tenantId || req.user.organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sequence' })
  @ApiResponse({ status: 200, description: 'Sequence deleted successfully' })
  async deleteSequence(@Request() req, @Param('id') id: string) {
    await this.sequenceEngine.deleteSequence(id, req.user.tenantId || req.user.organizationId);
    return { message: 'Sequence deleted successfully' };
  }

  // ============ Sequence Status Management ============

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate sequence' })
  @ApiResponse({ status: 200, description: 'Sequence activated' })
  async activateSequence(@Request() req, @Param('id') id: string) {
    return this.sequenceEngine.activateSequence(id, req.user.tenantId || req.user.organizationId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause sequence' })
  @ApiResponse({ status: 200, description: 'Sequence paused' })
  async pauseSequence(@Request() req, @Param('id') id: string) {
    return this.sequenceEngine.pauseSequence(id, req.user.tenantId || req.user.organizationId);
  }

  // ============ Enrollment Management ============

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll lead in sequence' })
  @ApiResponse({ status: 201, description: 'Lead enrolled successfully' })
  async enrollLead(@Request() req, @Body() dto: EnrollLeadDto) {
    if (!dto?.leadId || !dto?.sequenceId) {
      return { success: false, message: 'leadId and sequenceId are required', data: null };
    }
    return this.sequenceEngine.enrollLead(
      req.user.tenantId || req.user.organizationId,
      req.user.sub,
      dto,
    );
  }

  @Post('enroll/bulk')
  @ApiOperation({ summary: 'Bulk enroll leads in sequence' })
  @ApiResponse({ status: 201, description: 'Leads enrolled successfully' })
  async bulkEnrollLeads(@Request() req, @Body() dto: BulkEnrollLeadsDto) {
    if (!dto?.sequenceId || !dto?.leadIds || dto.leadIds.length === 0) {
      return { success: false, enrolled: 0, failed: 0, total: 0, message: 'sequenceId and leadIds are required' };
    }
    const results = await Promise.allSettled(
      dto.leadIds.map(leadId =>
        this.sequenceEngine.enrollLead(req.user.tenantId || req.user.organizationId, req.user.sub, {
          leadId,
          sequenceId: dto.sequenceId,
          metadata: dto.metadata,
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      enrolled: succeeded,
      failed,
      total: dto.leadIds.length,
    };
  }

  @Post('unenroll')
  @ApiOperation({ summary: 'Unenroll lead from sequence' })
  @ApiResponse({ status: 200, description: 'Lead unenrolled successfully' })
  async unenrollLead(@Request() req, @Body() dto: UnenrollLeadDto) {
    if (!dto?.enrollmentId) {
      return { success: false, message: 'enrollmentId is required', data: null };
    }
    await this.sequenceEngine.unenrollLead(
      dto.enrollmentId,
      req.user.tenantId || req.user.organizationId,
      dto.reason,
    );
    return { success: true, message: 'Lead unenrolled successfully' };
  }

  @Post('enrollment/:id/pause')
  @ApiOperation({ summary: 'Pause enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment paused' })
  async pauseEnrollment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: PauseEnrollmentDto,
  ) {
    await this.sequenceEngine.pauseEnrollment(
      id,
      req.user.tenantId || req.user.organizationId,
      dto.reason,
      dto.pauseDurationHours,
    );
    return { message: 'Enrollment paused successfully' };
  }

  @Post('enrollment/:id/resume')
  @ApiOperation({ summary: 'Resume enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment resumed' })
  async resumeEnrollment(@Request() req, @Param('id') id: string) {
    await this.sequenceEngine.resumeEnrollment(id, req.user.tenantId || req.user.organizationId);
    return { message: 'Enrollment resumed successfully' };
  }

  // ============ Analytics ============

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get sequence performance analytics' })
  @ApiResponse({ status: 200, description: 'Sequence analytics data' })
  async getSequenceAnalytics(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.sequenceAnalytics.getSequencePerformance(
      id,
      req.user.tenantId || req.user.organizationId,
      startDate,
      endDate,
    );
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get enrollment timeline' })
  @ApiResponse({ status: 200, description: 'Enrollment timeline data' })
  async getEnrollmentTimeline(
    @Request() req,
    @Param('id') id: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.sequenceAnalytics.getEnrollmentTimeline(
      id,
      req.user.tenantId || req.user.organizationId,
      groupBy || 'day',
    );
  }

  @Get('analytics/overall')
  @ApiOperation({ summary: 'Get overall sequence statistics' })
  @ApiResponse({ status: 200, description: 'Overall stats' })
  async getOverallStats(@Request() req) {
    return this.sequenceAnalytics.getOverallSequenceStats(req.user.tenantId || req.user.organizationId);
  }

  @Post('analytics/compare')
  @ApiOperation({ summary: 'Compare multiple sequences' })
  @ApiResponse({ status: 200, description: 'Comparison data' })
  async compareSequences(
    @Request() req,
    @Body() body: { sequenceIds: string[] },
  ) {
    return this.sequenceAnalytics.compareSequences(body.sequenceIds, req.user.tenantId || req.user.organizationId);
  }
}
