import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WhiteLabelService } from '../services/white-label.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('White-Label Management')
@ApiBearerAuth()
@Controller('white-label')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class WhiteLabelController {
  constructor(private readonly service: WhiteLabelService) {}

  @Get('configs')
  async getAllConfigs() {
    return this.service.getAllConfigs();
  }

  @Get('configs/:organizationId')
  async getConfig(@Param('organizationId') organizationId: string) {
    return this.service.getConfig(organizationId);
  }

  @Put('configs/:organizationId')
  async updateConfig(@Param('organizationId') organizationId: string, @Body() data: any) {
    return this.service.createOrUpdateConfig(organizationId, data);
  }

  @Delete('configs/:organizationId')
  async deleteConfig(@Param('organizationId') organizationId: string) {
    return this.service.deleteConfig(organizationId);
  }

  @Get('stats')
  async getStats() {
    return this.service.getWhiteLabelStats();
  }
}
