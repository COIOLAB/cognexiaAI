import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesSequence, SequenceStatus, StepType, ExitCondition } from '../entities/sales-sequence.entity';
import { SequenceEnrollment, EnrollmentStatus, ExitReason, CompletedStep } from '../entities/sequence-enrollment.entity';
import { Lead } from '../entities/lead.entity';
import { ActivityType } from '../entities/activity.entity';
import { EmailSenderService } from './email-sender.service';
import { TaskService } from './task.service';
import { ActivityLoggerService } from './activity-logger.service';
import { CreateSequenceDto, UpdateSequenceDto, EnrollLeadDto } from '../dto/sequence.dto';

@Injectable()
export class SequenceEngineService {
  constructor(
    @InjectRepository(SalesSequence)
    private sequenceRepository: Repository<SalesSequence>,
    @InjectRepository(SequenceEnrollment)
    private enrollmentRepository: Repository<SequenceEnrollment>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private emailSenderService: EmailSenderService,
    private taskService: TaskService,
    private activityLogger: ActivityLoggerService,
  ) {}

  private getTenantColumn(repo: Repository<any>): 'tenantId' | 'organizationId' | null {
    const columns = repo.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('tenantId')) {
      return 'tenantId';
    }
    if (columns.includes('organizationId')) {
      return 'organizationId';
    }
    return null;
  }

  // ============ Sequence CRUD ============

  async createSequence(tenantId: string, userId: string, dto: CreateSequenceDto): Promise<SalesSequence> {
    // Assign IDs to steps if not provided
    const stepsWithIds = dto.steps.map((step, index) => ({
      ...step,
      id: step.id || `step_${index + 1}`,
      order: index,
    }));

    const sequence = this.sequenceRepository.create({
      ...dto,
      steps: stepsWithIds,
      tenantId,
      createdById: userId,
      status: SequenceStatus.DRAFT,
    });

    return this.sequenceRepository.save(sequence);
  }

  async findAll(tenantId: string): Promise<SalesSequence[]> {
    try {
      const sequences = await this.sequenceRepository.find({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });
      return sequences || [];
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, tenantId: string): Promise<SalesSequence> {
    try {
      const sequence = await this.sequenceRepository.findOne({
        where: { id, tenantId },
        relations: ['enrollments', 'enrollments.lead'],
      });

      return sequence || null;
    } catch (error) {
      return null;
    }
  }

  async updateSequence(id: string, tenantId: string, dto: UpdateSequenceDto): Promise<SalesSequence> {
    const sequence = await this.findOne(id, tenantId);
    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }
    
    // If updating steps and sequence has active enrollments, prevent changes
    if (dto.steps && sequence.activeEnrollments > 0) {
      throw new BadRequestException('Cannot modify steps while enrollments are active');
    }

    Object.assign(sequence, dto);
    return this.sequenceRepository.save(sequence);
  }

  async deleteSequence(id: string, tenantId: string): Promise<void> {
    const sequence = await this.findOne(id, tenantId);
    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }
    
    if (sequence.activeEnrollments > 0) {
      throw new BadRequestException('Cannot delete sequence with active enrollments');
    }

    await this.sequenceRepository.remove(sequence);
  }

  async activateSequence(id: string, tenantId: string): Promise<SalesSequence> {
    const sequence = await this.findOne(id, tenantId);
    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }
    sequence.status = SequenceStatus.ACTIVE;
    return this.sequenceRepository.save(sequence);
  }

  async pauseSequence(id: string, tenantId: string): Promise<SalesSequence> {
    const sequence = await this.findOne(id, tenantId);
    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }
    sequence.status = SequenceStatus.PAUSED;
    return this.sequenceRepository.save(sequence);
  }

  // ============ Enrollment Management ============

  async enrollLead(tenantId: string, userId: string, dto: EnrollLeadDto): Promise<SequenceEnrollment> {
    const sequence = await this.findOne(dto.sequenceId, tenantId);
    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }
    const leadQuery = this.leadRepository.createQueryBuilder('lead').where('lead.id = :id', { id: dto.leadId });
    const leadTenantColumn = this.getTenantColumn(this.leadRepository);
    if (leadTenantColumn) {
      leadQuery.andWhere(`lead.${leadTenantColumn} = :tenantId`, { tenantId });
    }
    const lead = await leadQuery.getOne();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (sequence.status !== SequenceStatus.ACTIVE) {
      throw new BadRequestException('Sequence is not active');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        leadId: dto.leadId,
        sequenceId: dto.sequenceId,
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]),
      },
    });

    if (existingEnrollment) {
      return existingEnrollment;
    }

    // Check re-enrollment rules
    if (sequence.preventReenrollment) {
      const previousEnrollment = await this.enrollmentRepository.findOne({
        where: { leadId: dto.leadId, sequenceId: dto.sequenceId },
        order: { createdAt: 'DESC' },
      });

      if (previousEnrollment) {
        if (sequence.reenrollmentDelayDays) {
          const daysSinceLastEnrollment = Math.floor(
            (Date.now() - previousEnrollment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastEnrollment < sequence.reenrollmentDelayDays) {
            throw new BadRequestException(
              `Cannot re-enroll. Must wait ${sequence.reenrollmentDelayDays} days since last enrollment`
            );
          }
        } else {
          throw new BadRequestException('Re-enrollment is not allowed for this sequence');
        }
      }
    }

    // Check enrollment limit
    if (sequence.limitEnrollments && sequence.maxEnrollments) {
      if (sequence.activeEnrollments >= sequence.maxEnrollments) {
        throw new BadRequestException('Sequence has reached maximum enrollments');
      }
    }

    // Create enrollment
    const firstStep = sequence.steps[0];
    const enrollment = this.enrollmentRepository.create({
      tenantId,
      sequenceId: dto.sequenceId,
      leadId: dto.leadId,
      status: EnrollmentStatus.ACTIVE,
      currentStepIndex: 0,
      currentStepId: firstStep?.id,
      nextStepAt: this.calculateNextStepTime(firstStep?.delay || 0),
      enrolledById: userId,
      enrollmentMetadata: dto.metadata,
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Update sequence stats
    await this.sequenceRepository.increment({ id: sequence.id }, 'activeEnrollments', 1);

    await this.activityLogger.logActivity(tenantId, userId, 'System', {
      activityType: ActivityType.STATUS_CHANGED,
      title: 'Sequence enrollment created',
      description: `Enrolled in sequence: ${sequence.name}`,
      relatedToId: dto.leadId,
      relatedToType: 'lead',
      metadata: { sequenceId: sequence.id, enrollmentId: savedEnrollment.id },
    });

    return savedEnrollment;
  }

  async unenrollLead(enrollmentId: string, tenantId: string, reason?: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, tenantId },
      relations: ['sequence'],
    });

    if (!enrollment) {
      return;
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      return;
    }

    enrollment.status = EnrollmentStatus.EXITED;
    enrollment.exitedAt = new Date();
    enrollment.exitReason = ExitReason.MANUAL_EXIT;
    enrollment.exitNotes = reason;

    await this.enrollmentRepository.save(enrollment);

    // Update sequence stats
    await this.sequenceRepository.decrement({ id: enrollment.sequenceId }, 'activeEnrollments', 1);
    await this.sequenceRepository.increment({ id: enrollment.sequenceId }, 'exitedEnrollments', 1);

    const actorId = enrollment.enrolledById;
    if (actorId) {
      await this.activityLogger.logActivity(tenantId, actorId, 'System', {
        activityType: ActivityType.STATUS_CHANGED,
        title: 'Sequence enrollment exited',
        description: `Exited sequence: ${enrollment.sequence.name}`,
        relatedToId: enrollment.leadId,
        relatedToType: 'lead',
        metadata: { reason: reason || 'Manual exit' },
      });
    }
  }

  async pauseEnrollment(enrollmentId: string, tenantId: string, reason?: string, durationHours?: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, tenantId },
    });

    if (!enrollment) {
      return;
    }

    enrollment.status = EnrollmentStatus.PAUSED;
    enrollment.pausedAt = new Date();
    enrollment.pauseReason = reason;

    if (durationHours) {
      enrollment.pausedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    }

    await this.enrollmentRepository.save(enrollment);
  }

  async resumeEnrollment(enrollmentId: string, tenantId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, tenantId },
    });

    if (!enrollment) {
      return;
    }

    if (enrollment.status !== EnrollmentStatus.PAUSED) {
      return;
    }

    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.pausedAt = null;
    enrollment.pausedUntil = null;
    enrollment.pauseReason = null;

    await this.enrollmentRepository.save(enrollment);
  }

  // ============ Step Execution Engine ============

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledSteps(): Promise<void> {
    const now = new Date();
    
    // Find enrollments ready for next step
    const readyEnrollments = await this.enrollmentRepository.find({
      where: {
        status: EnrollmentStatus.ACTIVE,
      },
      relations: ['sequence', 'lead'],
      take: 100, // Process in batches
    });

    const enrollmentsToProcess = readyEnrollments.filter(
      e => e.nextStepAt && e.nextStepAt <= now && e.sequence.status === SequenceStatus.ACTIVE
    );

    for (const enrollment of enrollmentsToProcess) {
      try {
        await this.executeNextStep(enrollment);
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        // Mark step as failed but don't stop the sequence
        await this.enrollmentRepository.update(enrollment.id, {
          totalStepsFailed: enrollment.totalStepsFailed + 1,
        });
      }
    }
  }

  private async executeNextStep(enrollment: SequenceEnrollment): Promise<void> {
    const { sequence, lead } = enrollment;
    const currentStep = sequence.steps[enrollment.currentStepIndex];

    if (!currentStep) {
      // Sequence completed
      await this.completeEnrollment(enrollment);
      return;
    }

    const stepResult: CompletedStep = {
      stepId: currentStep.id,
      stepOrder: currentStep.order,
      stepType: currentStep.type,
      executedAt: new Date(),
      success: false,
    };

    try {
      switch (currentStep.type) {
        case StepType.EMAIL:
          await this.executeEmailStep(enrollment, currentStep);
          stepResult.success = true;
          break;

        case StepType.TASK:
          await this.executeTaskStep(enrollment, currentStep);
          stepResult.success = true;
          break;

        case StepType.WAIT:
          // Just wait - success by default
          stepResult.success = true;
          break;

        case StepType.CONDITION:
          const nextStepIndex = await this.executeConditionStep(enrollment, currentStep);
          if (nextStepIndex !== null) {
            enrollment.currentStepIndex = nextStepIndex;
          }
          stepResult.success = true;
          break;
      }

      // Record completed step
      enrollment.completedSteps.push(stepResult);
      enrollment.totalStepsExecuted++;

      // Move to next step
      const nextStepIndex = enrollment.currentStepIndex + 1;
      const nextStep = sequence.steps[nextStepIndex];

      if (nextStep) {
        enrollment.currentStepIndex = nextStepIndex;
        enrollment.currentStepId = nextStep.id;
        enrollment.nextStepAt = this.calculateNextStepTime(nextStep.delay);
      } else {
        // No more steps - complete sequence
        await this.completeEnrollment(enrollment);
        return;
      }

      await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      stepResult.success = false;
      stepResult.error = error.message;
      enrollment.completedSteps.push(stepResult);
      enrollment.totalStepsFailed++;
      await this.enrollmentRepository.save(enrollment);
      throw error;
    }
  }

  private async executeEmailStep(enrollment: SequenceEnrollment, step: any): Promise<void> {
    const { lead } = enrollment;

    const leadEmail = (lead as any).contact?.email;
    if (!leadEmail) {
      throw new Error('Lead has no email address');
    }

    await this.emailSenderService.sendEmail(
      enrollment.tenantId,
      leadEmail,
      step.emailSubject || 'Follow-up',
      step.emailBody || ''
    );

    enrollment.emailsSent++;
  }

  private async executeTaskStep(enrollment: SequenceEnrollment, step: any): Promise<void> {
    await this.taskService.createTask(
      enrollment.tenantId,
      enrollment.enrolledById || 'system',
      {
        title: step.taskTitle || 'Follow up with lead',
        description: step.taskDescription,
        priority: step.taskPriority || 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        assignedTo: step.assignToSequenceOwner ? enrollment.sequence.createdById : null,
        relatedToType: 'lead',
        relatedToId: enrollment.leadId,
      }
    );

    enrollment.tasksCreated++;
  }

  private async executeConditionStep(enrollment: SequenceEnrollment, step: any): Promise<number | null> {
    const { lead } = enrollment;
    const fieldValue = lead[step.conditionField];
    
    let conditionMet = false;

    switch (step.conditionOperator) {
      case 'equals':
        conditionMet = fieldValue === step.conditionValue;
        break;
      case 'contains':
        conditionMet = String(fieldValue).includes(step.conditionValue);
        break;
      case 'greaterThan':
        conditionMet = Number(fieldValue) > Number(step.conditionValue);
        break;
      case 'lessThan':
        conditionMet = Number(fieldValue) < Number(step.conditionValue);
        break;
    }

    // Return the step index to jump to
    const targetStepId = conditionMet ? step.onTrue : step.onFalse;
    if (targetStepId) {
      const targetIndex = enrollment.sequence.steps.findIndex(s => s.id === targetStepId);
      return targetIndex >= 0 ? targetIndex : null;
    }

    return null;
  }

  private async completeEnrollment(enrollment: SequenceEnrollment): Promise<void> {
    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.completedAt = new Date();
    await this.enrollmentRepository.save(enrollment);

    // Update sequence stats
    await this.sequenceRepository.decrement({ id: enrollment.sequenceId }, 'activeEnrollments', 1);
    await this.sequenceRepository.increment({ id: enrollment.sequenceId }, 'completedEnrollments', 1);

    await this.activityLogger.logActivity(enrollment.tenantId, 'system', 'System', {
      activityType: ActivityType.STATUS_CHANGED,
      title: 'Sequence enrollment completed',
      description: `Completed sequence: ${enrollment.sequence.name}`,
      relatedToId: enrollment.leadId,
      relatedToType: 'lead',
    });
  }

  private calculateNextStepTime(delayMinutes: number): Date {
    return new Date(Date.now() + delayMinutes * 60 * 1000);
  }

  async checkExitConditions(enrollment: SequenceEnrollment): Promise<boolean> {
    const { sequence, lead } = enrollment;

    for (const condition of sequence.exitConditions || []) {
      let shouldExit = false;

      switch (condition) {
        case ExitCondition.REPLY_RECEIVED:
          shouldExit = enrollment.emailsReplied > 0;
          break;

        case ExitCondition.MEETING_BOOKED:
          shouldExit = enrollment.meetingBooked;
          break;

        case ExitCondition.STATUS_CHANGED:
          shouldExit = lead.status !== 'new';
          break;

        case ExitCondition.OPPORTUNITY_CREATED:
          shouldExit = enrollment.opportunityCreated;
          break;
      }

      if (shouldExit) {
        await this.unenrollLead(enrollment.id, enrollment.tenantId, `Exit condition met: ${condition}`);
        return true;
      }
    }

    return false;
  }
}
