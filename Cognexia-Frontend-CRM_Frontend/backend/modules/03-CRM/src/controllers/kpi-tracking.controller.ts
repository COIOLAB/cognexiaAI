import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KPITrackingService } from '../services/kpi-tracking.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('KPI Tracking')
@ApiBearerAuth()
@Controller('kpi-goals')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class KPITrackingController {
  constructor(private readonly service: KPITrackingService) {}

  @Get()
  async getAllGoals() {
    return this.service.getAllGoals();
  }

  @Post()
  async createGoal(@Body() data: any) {
    return this.service.createGoal(data);
  }

  @Put(':id/progress')
  async updateProgress(@Param('id') id: string, @Body('currentValue') currentValue: number) {
    return this.service.updateGoalProgress(id, currentValue);
  }

  @Get('progress')
  async getProgress() {
    return this.service.getGoalProgress();
  }
}
