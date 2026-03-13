import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdvancedFinancialService } from '../services/advanced-financial.service';

@ApiTags('Advanced Financial Analytics')
@Controller('financial-analytics')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class AdvancedFinancialController {
  constructor(private readonly service: AdvancedFinancialService) {}

  @Get('cohort-analysis')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get cohort analysis' })
  async getCohortAnalysis(@Query('type') type?: string) {
    return await this.service.getCohortAnalysis(type);
  }

  @Get('revenue-waterfall')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get revenue waterfall' })
  async getRevenueWaterfall(@Query('period') period: string) {
    return await this.service.getRevenueWaterfall(period);
  }

  @Get('unit-economics')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get unit economics' })
  async getUnitEconomics() {
    return await this.service.getUnitEconomics();
  }

  @Get('ltv-by-segment')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get LTV by segment' })
  async getLTVBySegment() {
    return await this.service.getLTVBySegment();
  }
}
