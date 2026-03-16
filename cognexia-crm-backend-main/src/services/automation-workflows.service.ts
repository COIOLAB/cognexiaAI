import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationWorkflow, WorkflowStatus } from '../entities/automation-workflow.entity';

@Injectable()
export class AutomationWorkflowsService {
  constructor(
    @InjectRepository(AutomationWorkflow)
    private workflowRepository: Repository<AutomationWorkflow>,
  ) {}

  async getAllWorkflows() {
    return this.workflowRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createWorkflow(data: {
    name: string;
    description?: string;
    trigger: any;
    actions: any[];
  }) {
    const workflow = this.workflowRepository.create(data as any);
    return this.workflowRepository.save(workflow);
  }

  async updateWorkflowStatus(id: string, status: WorkflowStatus) {
    await this.workflowRepository.update({ id }, { status });
    return this.workflowRepository.findOne({ where: { id } });
  }

  async executeWorkflow(id: string) {
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) throw new Error('Workflow not found');

    // Execute workflow logic here
    workflow.executionCount++;
    workflow.lastExecutedAt = new Date();
    return this.workflowRepository.save(workflow);
  }

  async getWorkflowStats() {
    const all = await this.workflowRepository.find();
    return {
      total: all.length,
      active: all.filter(w => w.status === WorkflowStatus.ACTIVE).length,
      totalExecutions: all.reduce((sum, w) => sum + w.executionCount, 0),
    };
  }
}
