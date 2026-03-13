import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { ChurnPredictionQueryDto } from '../dto/ai-predictive.dto';

@ApiTags('Predictive Analytics')
@Controller('predictive-analytics')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class PredictiveAnalyticsController {
  constructor(private readonly service: PredictiveAnalyticsService) {}

  @Get('churn-predictions')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get churn predictions' })
  async getChurnPredictions(@Query() filters: ChurnPredictionQueryDto) {
    return await this.service.getChurnPredictions(filters);
  }

  @Post('predict-churn/:organizationId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Generate churn prediction for organization' })
  async predictChurn(@Param('organizationId') organizationId: string) {
    return await this.service.predictChurn(organizationId);
  }

  @Get('revenue-forecast')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get revenue forecasts' })
  async getRevenueForecast(
    @Query('type') type: string,
    @Query('months') months?: number,
  ) {
    return await this.service.getRevenueForecast(type, months);
  }

  @Get('churn-summary')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get churn prediction summary' })
  async getChurnSummary() {
    return await this.service.getChurnSummary();
  }
}
