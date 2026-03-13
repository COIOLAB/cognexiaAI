import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { APIManagementService } from '../services/api-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('API Management')
@ApiBearerAuth()
@Controller('api-management')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class APIManagementController {
  constructor(private readonly service: APIManagementService) {}

  @Get('keys')
  async getAllAPIKeys() {
    return this.service.getAllAPIKeys();
  }

  @Post('keys')
  async createAPIKey(@Body() data: { organizationId: string; name: string; permissions: string[]; rateLimit: number }) {
    return this.service.createAPIKey(data.organizationId, data.name, data.permissions, data.rateLimit);
  }

  @Post('keys/:id/revoke')
  async revokeAPIKey(@Param('id') id: string) {
    return this.service.revokeAPIKey(id);
  }

  @Get('usage-stats')
  async getUsageStats() {
    return this.service.getAPIUsageStats();
  }

  @Get('endpoint-analytics')
  async getEndpointAnalytics() {
    return this.service.getEndpointAnalytics();
  }
}
