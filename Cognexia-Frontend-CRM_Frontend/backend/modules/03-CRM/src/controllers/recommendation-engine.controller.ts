import { Controller, Get, Post, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { RecommendationEngineService } from '../services/recommendation-engine.service';
import { UpdateRecommendationStatusDto } from '../dto/ai-predictive.dto';

@ApiTags('Recommendation Engine')
@Controller('recommendations')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class RecommendationEngineController {
  constructor(private readonly service: RecommendationEngineService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all recommendations' })
  async getRecommendations(@Query('organizationId') organizationId?: string) {
    return await this.service.getRecommendations(organizationId);
  }

  @Post('generate/:organizationId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Generate recommendations for organization' })
  async generateRecommendations(@Param('organizationId') organizationId: string) {
    return await this.service.generateRecommendations(organizationId);
  }

  @Put(':id/status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update recommendation status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateRecommendationStatusDto) {
    return await this.service.updateStatus(id, dto);
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get recommendation statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
