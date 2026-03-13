import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { WorkflowBuilderService, WorkflowExecutionContext, WorkflowDefinition } from '../services/workflow-builder.service';
import { WorkflowActionType, WorkflowTriggerType } from '../entities/workflow.entity';

@ApiTags('Workflows')
@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowBuilderService) {}

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  @ApiResponse({ status: 200, description: 'Workflow list' })
  @Roles('admin', 'manager')
  async listWorkflows() {
    const workflows = await this.workflowService.listWorkflows();
    return { success: true, data: workflows };
  }

  @Post()
  @ApiOperation({ summary: 'Create workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created' })
  @Roles('admin', 'manager')
  async createWorkflow(@Body() body: WorkflowDefinition, @Req() req: any) {
    const createdBy = (body as any)?.createdBy || (body as any)?.created_by || req?.user?.id || req?.user?.userId || 'system';
    const workflow = await this.workflowService.createWorkflow({
      name: body?.name || `Workflow ${Date.now()}`,
      description: body?.description,
      trigger: body?.trigger || {
        type: WorkflowTriggerType.MANUAL,
        entity: 'generic',
        event: 'manual',
        conditions: [],
      },
      steps: body?.steps?.length
        ? body.steps
        : [
            {
              name: 'Initial step',
              type: WorkflowActionType.WAIT,
              order: 1,
              config: { wait_time_seconds: 0 },
              conditions: [],
              next_step_id: null,
              error_step_id: null,
            },
          ],
      created_by: createdBy,
      tags: body?.tags,
    });
    return { success: true, data: workflow };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved' })
  @Roles('admin', 'manager', 'viewer')
  async getWorkflow(@Param('id') id: string) {
    try {
      const workflow = await this.workflowService.getWorkflowById(id);
      return { success: true, data: workflow };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated' })
  @Roles('admin', 'manager')
  async updateWorkflow(@Param('id') id: string, @Body() body: Partial<WorkflowDefinition>) {
    try {
      const workflow = await this.workflowService.updateWorkflow(id, body);
      return { success: true, data: workflow };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted' })
  @Roles('admin', 'manager')
  async deleteWorkflow(@Param('id') id: string) {
    try {
      await this.workflowService.deleteWorkflow(id);
      return { success: true, message: 'Workflow deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message };
      }
      throw error;
    }
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  @ApiResponse({ status: 200, description: 'Workflow execution result' })
  @Roles('admin', 'manager')
  async executeWorkflow(@Param('id') id: string, @Body() body: Partial<WorkflowExecutionContext>) {
    try {
      const result = await this.workflowService.executeWorkflow({
        workflow_id: id,
        trigger_data: body?.trigger_data || {},
        entity_id: body?.entity_id,
        user_id: body?.user_id,
        metadata: body?.metadata,
      });
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw error;
    }
  }
}
