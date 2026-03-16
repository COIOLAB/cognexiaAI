import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { DeveloperPortalService } from '../services/developer-portal.service';
import { CreateSandboxDto } from '../dto/developer-portal.dto';

@ApiTags('Developer Portal')
@Controller('developer-portal')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class DeveloperPortalController {
  constructor(private readonly service: DeveloperPortalService) {}

  @Get('sandboxes')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all sandboxes' })
  async getSandboxes(@Query('organizationId') organizationId?: string) {
    return await this.service.getSandboxes(organizationId);
  }

  @Post('sandboxes')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create sandbox' })
  async createSandbox(@Body() dto: CreateSandboxDto) {
    return await this.service.createSandbox(dto);
  }

  @Post('sandboxes/:id/seed')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Seed sandbox with data' })
  async seedData(@Param('id') id: string) {
    return await this.service.seedData(id);
  }

  @Post('sandboxes/:id/reset')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Reset sandbox' })
  async resetSandbox(@Param('id') id: string) {
    return await this.service.resetSandbox(id);
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get sandbox statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
