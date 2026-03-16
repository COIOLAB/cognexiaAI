import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationWorkflowsService } from '../services/automation-workflows.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { WorkflowStatus } from '../entities/automation-workflow.entity';

@ApiTags('Automation Workflows')
@ApiBearerAuth()
@Controller('automation-workflows')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class AutomationWorkflowsController {
  constructor(private readonly service: AutomationWorkflowsService) {}

  @Get()
  async getAllWorkflows() {
    return this.service.getAllWorkflows();
  }

  @Post()
  async createWorkflow(@Body() data: any) {
    return this.service.createWorkflow(data);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: WorkflowStatus) {
    return this.service.updateWorkflowStatus(id, status);
  }

  @Post(':id/execute')
  async executeWorkflow(@Param('id') id: string) {
    return this.service.executeWorkflow(id);
  }

  @Get('stats')
  async getStats() {
    return this.service.getWorkflowStats();
  }
}
