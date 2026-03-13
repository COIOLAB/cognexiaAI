import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { HealthScoringV2Service } from '../services/health-scoring-v2.service';

@ApiTags('Health Scoring v2')
@Controller('health-v2')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class HealthScoringV2Controller {
  constructor(private readonly service: HealthScoringV2Service) {}

  @Post('calculate/:organizationId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Calculate AI-enhanced health score' })
  async calculateEnhancedScore(@Param('organizationId') organizationId: string) {
    return await this.service.calculateEnhancedScore(organizationId);
  }

  @Get('trends/:organizationId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get health trends' })
  async getHealthTrends(@Param('organizationId') organizationId: string) {
    return await this.service.getHealthTrends(organizationId);
  }

  @Get('compare/:organizationId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Compare to similar organizations' })
  async compareToSimilar(@Param('organizationId') organizationId: string) {
    return await this.service.compareToSimilar(organizationId);
  }
}
