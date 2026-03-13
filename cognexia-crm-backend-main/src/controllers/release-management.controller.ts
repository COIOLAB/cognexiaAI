import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { ReleaseManagementService } from '../services/release-management.service';
import { CreateDeploymentDto, UpdateDeploymentDto } from '../dto/developer-portal.dto';

@ApiTags('Release Management')
@Controller('releases')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class ReleaseManagementController {
  constructor(private readonly service: ReleaseManagementService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all deployments' })
  async getDeployments(@Query('environment') environment?: string) {
    return await this.service.getDeployments(environment);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create deployment' })
  async createDeployment(@Body() dto: CreateDeploymentDto, @Request() req: any) {
    return await this.service.createDeployment(dto, req.user.id);
  }

  @Put(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update deployment' })
  async updateDeployment(@Param('id') id: string, @Body() dto: UpdateDeploymentDto) {
    return await this.service.updateDeployment(id, dto);
  }

  @Post(':id/rollback')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Rollback deployment' })
  async rollback(@Param('id') id: string) {
    return await this.service.rollback(id);
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get deployment statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
