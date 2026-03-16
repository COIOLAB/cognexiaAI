import { Controller, Get, Post, Query, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdvancedAuditService } from '../services/advanced-audit.service';

@ApiTags('Advanced Audit')
@Controller('audit')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class AdvancedAuditController {
  constructor(private readonly service: AdvancedAuditService) {}

  @Get('logs')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Search audit logs' })
  async searchLogs(@Query() filters: any) {
    return await this.service.searchLogs(filters);
  }

  @Get('user/:userId')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(@Param('userId') userId: string, @Query() dateRange?: any) {
    return await this.service.getUserActivity(userId, dateRange);
  }

  @Get('compliance/:standard')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Generate compliance report' })
  async generateComplianceReport(@Param('standard') standard: string) {
    return await this.service.generateComplianceReport(standard);
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get audit statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
