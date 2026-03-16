import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomReportingService } from '../services/custom-reporting.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Custom Reporting')
@ApiBearerAuth()
@Controller('custom-reports')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class CustomReportingController {
  constructor(private readonly service: CustomReportingService) {}

  @Get()
  async getAllReports() {
    return this.service.getAllReports();
  }

  @Post()
  async createReport(@Body() data: any) {
    return this.service.createReport(data);
  }

  @Post(':id/run')
  async runReport(@Param('id') id: string) {
    return this.service.runReport(id);
  }

  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return this.service.deleteReport(id);
  }
}
