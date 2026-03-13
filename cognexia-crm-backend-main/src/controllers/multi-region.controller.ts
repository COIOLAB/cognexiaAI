import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MultiRegionService } from '../services/multi-region.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Multi-Region Management')
@ApiBearerAuth()
@Controller('multi-region')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class MultiRegionController {
  constructor(private readonly service: MultiRegionService) {}

  @Get('organizations-by-region')
  async getOrganizationsByRegion() {
    return this.service.getOrganizationsByRegion();
  }

  @Get('compliance')
  async getRegionalCompliance() {
    return this.service.getRegionalCompliance();
  }

  @Get('performance')
  async getRegionalPerformance() {
    return this.service.getRegionalPerformance();
  }
}
