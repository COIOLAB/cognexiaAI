import { Controller, Get, Post, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { CustomerSuccessService } from '../services/customer-success.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../dto/customer-success.dto';

@ApiTags('Customer Success')
@Controller('customer-success')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class CustomerSuccessController {
  constructor(private readonly service: CustomerSuccessService) {}

  @Get('milestones')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get customer success milestones' })
  async getMilestones(@Query('organizationId') organizationId?: string) {
    return await this.service.getMilestones(organizationId);
  }

  @Post('milestones')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create milestone' })
  async createMilestone(@Body() dto: CreateMilestoneDto) {
    return await this.service.createMilestone(dto);
  }

  @Put('milestones/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update milestone' })
  async updateMilestone(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return await this.service.updateMilestone(id, dto);
  }

  @Get('progress')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get progress overview' })
  async getProgressOverview() {
    return await this.service.getProgressOverview();
  }
}
