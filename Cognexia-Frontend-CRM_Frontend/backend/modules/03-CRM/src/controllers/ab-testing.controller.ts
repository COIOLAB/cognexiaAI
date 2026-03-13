import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ABTestingService } from '../services/ab-testing.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('A/B Testing')
@ApiBearerAuth()
@Controller('ab-tests')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class ABTestingController {
  constructor(private readonly service: ABTestingService) {}

  @Get()
  async getAllTests() {
    return this.service.getAllTests();
  }

  @Post()
  async createTest(@Body() data: any) {
    return this.service.createTest(data);
  }

  @Post(':id/start')
  async startTest(@Param('id') id: string) {
    return this.service.startTest(id);
  }

  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.service.getTestResults(id);
  }
}
