import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SystemConfigurationService } from '../services/system-configuration.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('System Configuration')
@ApiBearerAuth()
@Controller('system-config')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class SystemConfigurationController {
  constructor(private readonly service: SystemConfigurationService) {}

  @Get('configs')
  async getAllConfigs() {
    return this.service.getAllConfigs();
  }

  @Get('configs/:key')
  async getConfig(@Param('key') key: string) {
    return this.service.getConfig(key);
  }

  @Put('configs/:key')
  async updateConfig(@Param('key') key: string, @Body('value') value: string) {
    return this.service.updateConfig(key, value);
  }

  @Get('feature-flags')
  async getAllFeatureFlags() {
    return this.service.getAllFeatureFlags();
  }

  @Put('feature-flags/:id')
  async updateFeatureFlag(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
    @Body('rolloutPercentage') rolloutPercentage?: number
  ) {
    return this.service.updateFeatureFlag(id, enabled, rolloutPercentage);
  }
}
