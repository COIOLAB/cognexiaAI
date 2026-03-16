import { Controller, Get, Post, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { AnomalyDetectionService } from '../services/anomaly-detection.service';

@ApiTags('Anomaly Detection')
@Controller('anomalies')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class AnomalyDetectionController {
  constructor(private readonly service: AnomalyDetectionService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all anomalies' })
  async getAnomalies(@Query() filters: any) {
    return await this.service.getAnomalies(filters);
  }

  @Post('detect')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Run anomaly detection' })
  async detectAnomalies() {
    return await this.service.detectAnomalies();
  }

  @Put(':id/resolve')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Resolve anomaly' })
  async resolveAnomaly(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
    @Body('userId') userId: string,
  ) {
    return await this.service.resolveAnomaly(id, resolution, userId);
  }

  @Get('dashboard')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get anomaly dashboard' })
  async getDashboard() {
    return await this.service.getDashboard();
  }
}
