import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Onboarding & Migration')
@ApiBearerAuth()
@Controller('onboarding')
// // @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get('progress')
  async getProgress() {
    return this.service.getOnboardingProgress();
  }

  @Post('bulk-import')
  async bulkImport(@Body('data') data: any[]) {
    return this.service.bulkImportOrganizations(Array.isArray(data) ? data : []);
  }

  @Post('migrate')
  async migrate(@Body('platform') platform: string, @Body('credentials') credentials: any) {
    return this.service.migrateFromPlatform(platform, credentials);
  }
}
