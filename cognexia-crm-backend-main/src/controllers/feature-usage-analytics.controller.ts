import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureUsageAnalyticsService } from '../services/feature-usage-analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Feature Usage Analytics')
@ApiBearerAuth()
@Controller('feature-usage')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class FeatureUsageAnalyticsController {
  constructor(private readonly service: FeatureUsageAnalyticsService) {}

  @Get('adoption-rates')
  async getAdoptionRates() {
    return this.service.getFeatureAdoptionRates();
  }

  @Get('usage-by-tier')
  async getUsageByTier() {
    return this.service.getFeatureUsageByTier();
  }

  @Get('user-journey')
  async getUserJourney() {
    return this.service.getUserJourneyAnalytics();
  }
}
