import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationHealthService } from '../services/organization-health.service';
import {
  GetHealthScoresQueryDto,
  OrganizationHealthDto,
  HealthSummaryDto,
  InactiveOrganizationDto,
} from '../dto/organization-health.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { OrganizationHealthScore } from '../entities/organization-health.entity';

@ApiTags('Organization Health')
@ApiBearerAuth()
@Controller('organization-health')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class OrganizationHealthController {
  constructor(private readonly healthService: OrganizationHealthService) {}

  @Get('scores')
  @ApiOperation({ summary: 'Get organization health scores with filters' })
  @ApiResponse({ status: 200, type: [OrganizationHealthDto] })
  async getHealthScores(@Query() query: GetHealthScoresQueryDto): Promise<OrganizationHealthDto[]> {
    return this.healthService.getHealthScores(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get health summary statistics' })
  @ApiResponse({ status: 200, type: HealthSummaryDto })
  async getHealthSummary(): Promise<HealthSummaryDto> {
    return this.healthService.getHealthSummary();
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Get inactive organizations' })
  @ApiResponse({ status: 200, type: [InactiveOrganizationDto] })
  async getInactiveOrganizations(): Promise<InactiveOrganizationDto[]> {
    return this.healthService.getInactiveOrganizations();
  }

  @Post('calculate/:organizationId')
  @ApiOperation({ summary: 'Manually trigger health score calculation for an organization' })
  @ApiResponse({ status: 200, type: OrganizationHealthScore })
  async calculateHealthScore(@Param('organizationId') organizationId: string): Promise<OrganizationHealthScore> {
    return this.healthService.calculateHealthScore(organizationId);
  }

  @Post('recalculate-all')
  @ApiOperation({ summary: 'Manually trigger recalculation for all organizations' })
  @ApiResponse({ status: 200 })
  async recalculateAll() {
    await this.healthService.recalculateAllHealthScores();
    return { message: 'Health score recalculation started' };
  }
}
