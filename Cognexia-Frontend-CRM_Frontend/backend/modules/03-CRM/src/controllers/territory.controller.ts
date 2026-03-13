import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { TerritoryManagerService } from '../services/territory-manager.service';
import {
  CreateTerritoryDto,
  UpdateTerritoryDto,
  AssignLeadToTerritoryDto,
  BulkAssignLeadsDto,
  RebalanceTerritoriesDto,
  TerritoryPerformanceDto,
} from '../dto/territory.dto';

@ApiTags('Territories')
@Controller('territories')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TerritoryController {
  constructor(private readonly territoryManager: TerritoryManagerService) {}

  // ============ Territory CRUD ============

  @Post()
  @ApiOperation({ summary: 'Create territory' })
  @ApiResponse({ status: 201, description: 'Territory created successfully' })
  async createTerritory(@Request() req, @Body() dto: CreateTerritoryDto) {
    try {
      return await this.territoryManager.createTerritory(req.user.tenantId, dto);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create territory', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all territories' })
  @ApiResponse({ status: 200, description: 'List of territories' })
  async getTerritories(@Request() req) {
    return this.territoryManager.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get territory by ID' })
  @ApiResponse({ status: 200, description: 'Territory details' })
  async getTerritory(@Request() req, @Param('id') id: string) {
    return this.territoryManager.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update territory' })
  @ApiResponse({ status: 200, description: 'Territory updated successfully' })
  async updateTerritory(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTerritoryDto,
  ) {
    return this.territoryManager.updateTerritory(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete territory' })
  @ApiResponse({ status: 200, description: 'Territory deleted successfully' })
  async deleteTerritory(@Request() req, @Param('id') id: string) {
    await this.territoryManager.deleteTerritory(id, req.user.tenantId);
    return { message: 'Territory deleted successfully' };
  }

  // ============ Lead Assignment ============

  @Post('assign')
  @ApiOperation({ summary: 'Assign lead to territory' })
  @ApiResponse({ status: 200, description: 'Lead assigned successfully' })
  async assignLead(@Request() req, @Body() dto: AssignLeadToTerritoryDto) {
    return this.territoryManager.assignLead(
      dto.leadId,
      req.user.tenantId,
      dto.territoryId,
      dto.forceReassignment,
    );
  }

  @Post('assign/bulk')
  @ApiOperation({ summary: 'Bulk assign leads to territory' })
  @ApiResponse({ status: 200, description: 'Leads assigned successfully' })
  async bulkAssignLeads(@Request() req, @Body() dto: BulkAssignLeadsDto) {
    const result = await this.territoryManager.bulkAssignLeads(
      dto.leadIds,
      req.user.tenantId,
      dto.territoryId,
      dto.forceReassignment,
    );

    return {
      success: true,
      assigned: result.assigned,
      failed: result.failed,
      total: dto.leadIds.length,
    };
  }

  @Post('rebalance')
  @ApiOperation({ summary: 'Rebalance leads across territories' })
  @ApiResponse({ status: 200, description: 'Territories rebalanced successfully' })
  async rebalanceTerritories(@Request() req, @Body() dto: RebalanceTerritoriesDto) {
    const result = await this.territoryManager.rebalanceTerritories(
      req.user.tenantId,
      dto.territoryIds,
      dto.strategy,
    );

    return {
      success: true,
      reassigned: result.reassigned,
      message: `Successfully reassigned ${result.reassigned} leads`,
    };
  }

  // ============ Territory Analytics ============

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get territory statistics' })
  @ApiResponse({ status: 200, description: 'Territory statistics' })
  async getTerritoryStats(@Request() req, @Param('id') id: string) {
    return this.territoryManager.getTerritoryStats(id, req.user.tenantId);
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get territory performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics' })
  async getTerritoryPerformance(
    @Request() req,
    @Query() query: TerritoryPerformanceDto,
  ) {
    const territories = await this.territoryManager.findAll(req.user.tenantId);

    if (query.territoryId) {
      const stats = await this.territoryManager.getTerritoryStats(
        query.territoryId,
        req.user.tenantId,
      );
      return { territories: [stats] };
    }

    // Get stats for all territories
    const allStats = await Promise.all(
      territories.map(t => this.territoryManager.getTerritoryStats(t.id, req.user.tenantId))
    );

    return {
      territories: allStats,
      summary: {
        totalTerritories: territories.length,
        activeTerritories: territories.filter(t => t.active).length,
        totalUsers: territories.reduce((sum, t) => sum + (t.users?.length || 0), 0),
        totalLeadsAssigned: territories.reduce((sum, t) => sum + t.totalLeadsAssigned, 0),
        averageConversionRate:
          territories.length > 0
            ? territories.reduce((sum, t) => sum + Number(t.conversionRate), 0) /
              territories.length
            : 0,
      },
    };
  }

  @Get('analytics/comparison')
  @ApiOperation({ summary: 'Compare territory performance' })
  @ApiResponse({ status: 200, description: 'Territory comparison data' })
  async compareTerritories(
    @Request() req,
    @Query('territoryIds') territoryIds: string,
  ) {
    const ids = territoryIds.split(',');
    const comparisons = await Promise.all(
      ids.map(id => this.territoryManager.getTerritoryStats(id, req.user.tenantId))
    );

    // Find best performers
    const bestConversion = comparisons.reduce((best, curr) =>
      curr.conversionRate > best.conversionRate ? curr : best
    );

    const mostLeads = comparisons.reduce((best, curr) =>
      curr.totalLeadsAssigned > best.totalLeadsAssigned ? curr : best
    );

    return {
      comparisons,
      insights: {
        bestConversion: {
          territoryId: bestConversion.territoryId,
          territoryName: bestConversion.territoryName,
          conversionRate: bestConversion.conversionRate,
        },
        mostLeads: {
          territoryId: mostLeads.territoryId,
          territoryName: mostLeads.territoryName,
          totalLeads: mostLeads.totalLeadsAssigned,
        },
      },
    };
  }

  @Get('analytics/coverage')
  @ApiOperation({ summary: 'Get territory coverage analysis' })
  @ApiResponse({ status: 200, description: 'Coverage analysis' })
  async getTerritoryyCoverage(@Request() req) {
    const territories = await this.territoryManager.findAll(req.user.tenantId);

    const coverage = territories.map(t => ({
      territoryId: t.id,
      territoryName: t.name,
      active: t.active,
      userCount: t.users?.length || 0,
      hasCapacityLimit: t.hasCapacityLimit,
      maxLeadsPerUser: t.maxLeadsPerUser,
      currentLoad: t.activeLeads,
      capacity: t.hasCapacityLimit
        ? (t.users?.length || 0) * (t.maxLeadsPerUser || 0)
        : null,
      utilizationRate: t.hasCapacityLimit
        ? ((t.activeLeads / ((t.users?.length || 1) * (t.maxLeadsPerUser || 1))) * 100).toFixed(2)
        : null,
    }));

    const totalCapacity = coverage.reduce(
      (sum, t) => sum + (t.capacity || 0),
      0
    );
    const totalLoad = coverage.reduce((sum, t) => sum + t.currentLoad, 0);

    return {
      coverage,
      summary: {
        totalTerritories: territories.length,
        activeTerritories: territories.filter(t => t.active).length,
        totalCapacity: totalCapacity > 0 ? totalCapacity : 'Unlimited',
        currentLoad: totalLoad,
        overallUtilization:
          totalCapacity > 0
            ? ((totalLoad / totalCapacity) * 100).toFixed(2) + '%'
            : 'N/A',
        territoriesAtCapacity: coverage.filter(
          t => t.capacity && t.currentLoad >= t.capacity
        ).length,
      },
    };
  }
}
