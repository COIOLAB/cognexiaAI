import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { IntegrationHubService, IntegrationConfig } from '../services/integration-hub.service';

@ApiTags('Integration Hub')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IntegrationHubController {
  constructor(private readonly integrationHubService: IntegrationHubService) {}

  @Get()
  @ApiOperation({ summary: 'List integration health statuses' })
  @ApiResponse({ status: 200, description: 'Integration status list' })
  @Roles('admin', 'manager')
  async listStatuses() {
    const statuses = await this.integrationHubService.getAllIntegrationStatuses();
    return {
      success: true,
      data: statuses,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register an integration' })
  @ApiResponse({ status: 201, description: 'Integration registered' })
  @Roles('admin', 'manager')
  async register(@Body() body: { name: string; config: IntegrationConfig }) {
    const name = body?.name || body?.config?.name || 'default';
    await this.integrationHubService.registerIntegration(name, body?.config || ({} as IntegrationConfig));
    return {
      success: true,
      message: 'Integration registered',
    };
  }

  @Post(':name/sync')
  @ApiOperation({ summary: 'Sync an entity with an integration' })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  @Roles('admin', 'manager')
  async sync(@Param('name') name: string, @Body() body: { entity: string; data: any }) {
    const result = await this.integrationHubService.syncEntity(
      name,
      body?.entity || 'default',
      body?.data || {},
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':name/health')
  @ApiOperation({ summary: 'Get integration health' })
  @ApiResponse({ status: 200, description: 'Integration health' })
  @Roles('admin', 'manager')
  async getHealth(@Param('name') name: string) {
    const status = await this.integrationHubService.getIntegrationHealth(name);
    return {
      success: true,
      data: status,
    };
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Remove an integration' })
  @ApiResponse({ status: 200, description: 'Integration removed' })
  @Roles('admin', 'manager')
  async remove(@Param('name') name: string) {
    await this.integrationHubService.removeIntegration(name);
    return {
      success: true,
      message: 'Integration removed',
    };
  }
}
