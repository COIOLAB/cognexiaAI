import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Workflow, WorkflowStatus, WorkflowStep, WorkflowTrigger } from '../entities/workflow.entity';
import { BusinessRule, RuleCondition } from '../entities/business-rule.entity';

export interface WorkflowDefinition {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: Omit<WorkflowStep, 'id'>[];
  created_by: string;
  tags?: string[];
}

export interface WorkflowExecutionContext {
  workflow_id: string;
  trigger_data: any;
  entity_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionResult {
  success: boolean;
  workflow_id: string;
  execution_id: string;
  steps_executed: number;
  steps_failed: number;
  execution_time_ms: number;
  errors?: string[];
  output?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class WorkflowBuilderService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(BusinessRule)
    private businessRuleRepository: Repository<BusinessRule>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new workflow
   */
  async createWorkflow(definition: WorkflowDefinition): Promise<Workflow> {
    // Validate workflow definition
    const validation = await this.validateWorkflowDefinition(definition);
    if (!validation.valid) {
      throw new BadRequestException(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate step IDs
    const steps = definition.steps.map((step, index) => ({
      ...step,
      id: `step_${index + 1}`,
    }));

    const workflow = this.workflowRepository.create({
      name: definition.name,
      description: definition.description,
      trigger: definition.trigger,
      steps,
      created_by: definition.created_by,
      status: WorkflowStatus.DRAFT,
      tags: definition.tags,
    });

    const saved = await this.workflowRepository.save(workflow);

    this.eventEmitter.emit('workflow.created', saved);

    return saved;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  /**
   * List workflows
   */
  async listWorkflows(): Promise<Workflow[]> {
    return this.workflowRepository.find({
      order: { updated_at: 'DESC' } as any,
    });
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<Workflow> {
    const workflow = await this.getWorkflowById(id);

    if (updates.steps) {
      const validation = await this.validateWorkflowDefinition({
        ...workflow,
        ...updates,
      } as WorkflowDefinition);

      if (!validation.valid) {
        throw new BadRequestException(`Workflow validation failed: ${validation.errors.join(', ')}`);
      }

      const steps = updates.steps.map((step, index) => ({
        ...step,
        id: `step_${index + 1}`,
      }));
      workflow.steps = steps;
    }

    Object.assign(workflow, updates);
    workflow.version += 1;

    const updated = await this.workflowRepository.save(workflow);

    this.eventEmitter.emit('workflow.updated', updated);

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    await this.workflowRepository.remove(workflow);
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(id: string): Promise<Workflow> {
    const workflow = await this.getWorkflowById(id);

    const validation = await this.validateWorkflow(workflow);
    if (!validation.valid) {
      throw new BadRequestException(`Cannot activate invalid workflow: ${validation.errors.join(', ')}`);
    }

    workflow.status = WorkflowStatus.ACTIVE;
    const updated = await this.workflowRepository.save(workflow);

    this.eventEmitter.emit('workflow.activated', updated);

    return updated;
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(id: string): Promise<Workflow> {
    const workflow = await this.getWorkflowById(id);
    workflow.status = WorkflowStatus.INACTIVE;

    const updated = await this.workflowRepository.save(workflow);

    this.eventEmitter.emit('workflow.deactivated', updated);

    return updated;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(context: WorkflowExecutionContext): Promise<WorkflowExecutionResult> {
    const workflow = await this.getWorkflowById(context.workflow_id);

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      throw new BadRequestException('Cannot execute inactive workflow');
    }

    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    let stepsExecuted = 0;
    let stepsFailed = 0;
    const errors: string[] = [];
    let currentStepId: string | null = workflow.steps[0]?.id || null;
    let executionData: any = { ...context.trigger_data };

    try {
      while (currentStepId) {
        const step = workflow.steps.find(s => s.id === currentStepId);
        if (!step) break;

        try {
          // Check step conditions
          if (step.conditions && step.conditions.length > 0) {
            const conditionsMet = this.evaluateConditions(step.conditions, executionData);
            if (!conditionsMet) {
              currentStepId = step.next_step_id;
              continue;
            }
          }

          // Execute step
          executionData = await this.executeWorkflowStep(step, executionData, context);
          stepsExecuted++;

          // Move to next step
          currentStepId = step.next_step_id;
        } catch (error) {
          stepsFailed++;
          errors.push(`Step ${step.name}: ${error.message}`);

          // Move to error handler step if defined
          if (step.error_step_id) {
            currentStepId = step.error_step_id;
          } else {
            throw error;
          }
        }
      }

      // Update workflow statistics
      workflow.execution_count++;
      workflow.success_count++;
      workflow.last_executed_at = new Date();
      const executionTime = Date.now() - startTime;
      workflow.average_execution_time_ms = 
        (workflow.average_execution_time_ms * (workflow.execution_count - 1) + executionTime) / workflow.execution_count;

      await this.workflowRepository.save(workflow);

      this.eventEmitter.emit('workflow.executed', {
        workflow_id: workflow.id,
        execution_id: executionId,
        success: true,
      });

      return {
        success: true,
        workflow_id: workflow.id,
        execution_id: executionId,
        steps_executed: stepsExecuted,
        steps_failed: stepsFailed,
        execution_time_ms: Date.now() - startTime,
        output: executionData,
      };
    } catch (error) {
      workflow.execution_count++;
      workflow.failure_count++;
      await this.workflowRepository.save(workflow);

      this.eventEmitter.emit('workflow.execution.failed', {
        workflow_id: workflow.id,
        execution_id: executionId,
        error: error.message,
      });

      return {
        success: false,
        workflow_id: workflow.id,
        execution_id: executionId,
        steps_executed: stepsExecuted,
        steps_failed: stepsFailed,
        execution_time_ms: Date.now() - startTime,
        errors: [...errors, error.message],
      };
    }
  }

  /**
   * Get workflow templates
   */
  async getWorkflowTemplates(): Promise<Workflow[]> {
    return await this.workflowRepository.find({
      where: { is_template: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Clone workflow
   */
  async cloneWorkflow(id: string, newName: string, userId: string): Promise<Workflow> {
    const original = await this.getWorkflowById(id);

    const cloned = this.workflowRepository.create({
      name: newName,
      description: `Cloned from: ${original.name}`,
      trigger: original.trigger,
      steps: original.steps,
      created_by: userId,
      status: WorkflowStatus.DRAFT,
      tags: original.tags,
    });

    return await this.workflowRepository.save(cloned);
  }

  /**
   * Search workflows
   */
  async searchWorkflows(criteria: {
    status?: WorkflowStatus;
    created_by?: string;
    tags?: string[];
  }): Promise<Workflow[]> {
    const query = this.workflowRepository.createQueryBuilder('workflow');

    if (criteria.status) {
      query.andWhere('workflow.status = :status', { status: criteria.status });
    }

    if (criteria.created_by) {
      query.andWhere('workflow.created_by = :created_by', { created_by: criteria.created_by });
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query.andWhere('workflow.tags && ARRAY[:...tags]', { tags: criteria.tags });
    }

    query.orderBy('workflow.created_at', 'DESC');

    return await query.getMany();
  }

  // ============= Private Helper Methods =============

  private async validateWorkflowDefinition(definition: WorkflowDefinition): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic fields
    if (!definition.name || definition.name.trim().length === 0) {
      errors.push('Workflow name is required');
    }

    if (!definition.trigger) {
      errors.push('Workflow trigger is required');
    }

    if (!definition.steps || definition.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    if (definition.steps) {
      const stepIds = new Set<string>();
      
      definition.steps.forEach((step, index) => {
        if (!step.name) {
          errors.push(`Step ${index + 1}: name is required`);
        }

        if (!step.type) {
          errors.push(`Step ${index + 1}: type is required`);
        }

        // Check for infinite loops
        if (step.next_step_id && stepIds.has(step.next_step_id)) {
          warnings.push(`Step ${index + 1}: potential infinite loop detected`);
        }

        stepIds.add(`step_${index + 1}`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async validateWorkflow(workflow: Workflow): Promise<ValidationResult> {
    return this.validateWorkflowDefinition({
      name: workflow.name,
      description: workflow.description,
      trigger: workflow.trigger,
      steps: workflow.steps,
      created_by: workflow.created_by,
      tags: workflow.tags,
    });
  }

  private evaluateConditions(conditions: any[], data: any): boolean {
    // Simplified condition evaluation
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(data, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'not_equals':
          if (fieldValue === condition.value) return false;
          break;
        case 'greater_than':
          if (fieldValue <= condition.value) return false;
          break;
        case 'less_than':
          if (fieldValue >= condition.value) return false;
          break;
        case 'contains':
          if (!String(fieldValue).includes(condition.value)) return false;
          break;
        default:
          break;
      }
    }

    return true;
  }

  private async executeWorkflowStep(step: WorkflowStep, data: any, context: WorkflowExecutionContext): Promise<any> {
    // Execute step based on type
    switch (step.type) {
      case 'CREATE_RECORD':
        return await this.executeCreateRecord(step, data);
      case 'UPDATE_RECORD':
        return await this.executeUpdateRecord(step, data);
      case 'SEND_EMAIL':
        return await this.executeSendEmail(step, data);
      case 'SEND_NOTIFICATION':
        return await this.executeSendNotification(step, data);
      case 'API_CALL':
        return await this.executeAPICall(step, data);
      case 'WAIT':
        return await this.executeWait(step, data);
      case 'CONDITION':
        return await this.executeCondition(step, data);
      default:
        return data;
    }
  }

  private async executeCreateRecord(step: WorkflowStep, data: any): Promise<any> {
    // Emit event for record creation
    this.eventEmitter.emit('workflow.step.create_record', {
      step,
      data,
    });
    return data;
  }

  private async executeUpdateRecord(step: WorkflowStep, data: any): Promise<any> {
    this.eventEmitter.emit('workflow.step.update_record', {
      step,
      data,
    });
    return data;
  }

  private async executeSendEmail(step: WorkflowStep, data: any): Promise<any> {
    this.eventEmitter.emit('workflow.step.send_email', {
      step,
      data,
    });
    return data;
  }

  private async executeSendNotification(step: WorkflowStep, data: any): Promise<any> {
    this.eventEmitter.emit('workflow.step.send_notification', {
      step,
      data,
    });
    return data;
  }

  private async executeAPICall(step: WorkflowStep, data: any): Promise<any> {
    // API call logic would go here
    return data;
  }

  private async executeWait(step: WorkflowStep, data: any): Promise<any> {
    const waitTime = step.config.wait_time_seconds || 0;
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    return data;
  }

  private async executeCondition(step: WorkflowStep, data: any): Promise<any> {
    return data;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
