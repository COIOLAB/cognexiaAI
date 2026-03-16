import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SalesSequence } from '../entities/sales-sequence.entity';
import { SequenceEnrollment, EnrollmentStatus } from '../entities/sequence-enrollment.entity';
import { SequencePerformanceDto } from '../dto/sequence.dto';

@Injectable()
export class SequenceAnalyticsService {
  constructor(
    @InjectRepository(SalesSequence)
    private sequenceRepository: Repository<SalesSequence>,
    @InjectRepository(SequenceEnrollment)
    private enrollmentRepository: Repository<SequenceEnrollment>,
  ) {}

  async getSequencePerformance(
    sequenceId: string,
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<SequencePerformanceDto> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id: sequenceId, tenantId },
    });

    if (!sequence) {
      throw new Error('Sequence not found');
    }

    // Build date filter
    const dateFilter: any = { sequenceId, tenantId };
    if (startDate || endDate) {
      dateFilter.createdAt = Between(
        startDate ? new Date(startDate) : new Date(0),
        endDate ? new Date(endDate) : new Date(),
      );
    }

    // Get all enrollments
    const enrollments = await this.enrollmentRepository.find({
      where: dateFilter,
    });

    // Calculate metrics
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE).length;
    const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length;
    const exitedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.EXITED).length;

    // Calculate rates
    const totalEmailsSent = enrollments.reduce((sum, e) => sum + e.emailsSent, 0);
    const totalEmailsReplied = enrollments.reduce((sum, e) => sum + e.emailsReplied, 0);
    const totalMeetingsBooked = enrollments.filter(e => e.meetingBooked).length;

    const replyRate = totalEmailsSent > 0 ? (totalEmailsReplied / totalEmailsSent) * 100 : 0;
    const meetingBookedRate = totalEnrollments > 0 ? (totalMeetingsBooked / totalEnrollments) * 100 : 0;

    // Calculate conversion rate (completed or meetings booked)
    const converted = enrollments.filter(
      e => e.status === EnrollmentStatus.COMPLETED || e.meetingBooked || e.opportunityCreated
    ).length;
    const conversionRate = totalEnrollments > 0 ? (converted / totalEnrollments) * 100 : 0;

    // Calculate average steps completed
    const totalStepsCompleted = enrollments.reduce((sum, e) => sum + e.totalStepsExecuted, 0);
    const averageStepsCompleted = totalEnrollments > 0 ? totalStepsCompleted / totalEnrollments : 0;

    // Calculate average time to complete (in hours)
    const completedWithTime = enrollments.filter(e => e.completedAt && e.createdAt);
    const totalCompletionTime = completedWithTime.reduce((sum, e) => {
      const duration = e.completedAt.getTime() - e.createdAt.getTime();
      return sum + duration / (1000 * 60 * 60); // Convert to hours
    }, 0);
    const averageTimeToComplete = completedWithTime.length > 0 
      ? totalCompletionTime / completedWithTime.length 
      : 0;

    // Step performance analysis
    const stepPerformance = this.calculateStepPerformance(sequence, enrollments);

    // Exit reasons analysis
    const exitReasons = this.calculateExitReasons(enrollments);

    // Update sequence stats
    await this.sequenceRepository.update(sequenceId, {
      conversionRate: Math.round(conversionRate * 100) / 100,
      replyRate: Math.round(replyRate * 100) / 100,
      meetingBookedRate: Math.round(meetingBookedRate * 100) / 100,
    });

    return {
      sequenceId: sequence.id,
      sequenceName: sequence.name,
      status: sequence.status,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      exitedEnrollments,
      conversionRate: Math.round(conversionRate * 100) / 100,
      replyRate: Math.round(replyRate * 100) / 100,
      meetingBookedRate: Math.round(meetingBookedRate * 100) / 100,
      averageStepsCompleted: Math.round(averageStepsCompleted * 10) / 10,
      averageTimeToComplete: Math.round(averageTimeToComplete * 10) / 10,
      stepPerformance,
      exitReasons,
    };
  }

  private calculateStepPerformance(sequence: SalesSequence, enrollments: SequenceEnrollment[]): any[] {
    const stepStats = new Map<string, {
      stepId: string;
      stepName: string;
      stepType: string;
      totalExecutions: number;
      successCount: number;
      totalDelay: number;
    }>();

    // Initialize stats for each step
    sequence.steps.forEach(step => {
      stepStats.set(step.id, {
        stepId: step.id,
        stepName: step.name,
        stepType: step.type,
        totalExecutions: 0,
        successCount: 0,
        totalDelay: 0,
      });
    });

    // Aggregate step data from enrollments
    enrollments.forEach(enrollment => {
      enrollment.completedSteps.forEach(completedStep => {
        const stats = stepStats.get(completedStep.stepId);
        if (stats) {
          stats.totalExecutions++;
          if (completedStep.success) {
            stats.successCount++;
          }
        }
      });
    });

    // Calculate success rates
    return Array.from(stepStats.values()).map(stats => ({
      stepId: stats.stepId,
      stepName: stats.stepName,
      stepType: stats.stepType,
      totalExecutions: stats.totalExecutions,
      successRate: stats.totalExecutions > 0 
        ? Math.round((stats.successCount / stats.totalExecutions) * 100 * 100) / 100
        : 0,
      averageDelay: sequence.steps.find(s => s.id === stats.stepId)?.delay || 0,
    }));
  }

  private calculateExitReasons(enrollments: SequenceEnrollment[]): any[] {
    const exitedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.EXITED);
    
    if (exitedEnrollments.length === 0) {
      return [];
    }

    const reasonCounts = new Map<string, number>();

    exitedEnrollments.forEach(enrollment => {
      const reason = enrollment.exitReason || 'unknown';
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });

    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: Math.round((count / exitedEnrollments.length) * 100 * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getOverallSequenceStats(tenantId: string): Promise<any> {
    const sequences = await this.sequenceRepository.find({
      where: { tenantId },
    });

    const totalSequences = sequences.length;
    const activeSequences = sequences.filter(s => s.status === 'active').length;

    const totalEnrollments = sequences.reduce((sum, s) => sum + s.activeEnrollments + s.completedEnrollments + s.exitedEnrollments, 0);
    const totalActiveEnrollments = sequences.reduce((sum, s) => sum + s.activeEnrollments, 0);
    const totalCompletedEnrollments = sequences.reduce((sum, s) => sum + s.completedEnrollments, 0);

    const avgConversionRate = sequences.length > 0
      ? sequences.reduce((sum, s) => sum + Number(s.conversionRate), 0) / sequences.length
      : 0;

    const avgReplyRate = sequences.length > 0
      ? sequences.reduce((sum, s) => sum + Number(s.replyRate), 0) / sequences.length
      : 0;

    const topPerformingSequences = sequences
      .sort((a, b) => Number(b.conversionRate) - Number(a.conversionRate))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        conversionRate: s.conversionRate,
        activeEnrollments: s.activeEnrollments,
        completedEnrollments: s.completedEnrollments,
      }));

    return {
      totalSequences,
      activeSequences,
      totalEnrollments,
      totalActiveEnrollments,
      totalCompletedEnrollments,
      avgConversionRate: Math.round(avgConversionRate * 100) / 100,
      avgReplyRate: Math.round(avgReplyRate * 100) / 100,
      topPerformingSequences,
    };
  }

  async getEnrollmentTimeline(
    sequenceId: string,
    tenantId: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { sequenceId, tenantId },
      order: { createdAt: 'ASC' },
    });

    // Group enrollments by time period
    const timeline = new Map<string, {
      date: string;
      enrolled: number;
      completed: number;
      exited: number;
      active: number;
    }>();

    enrollments.forEach(enrollment => {
      const dateKey = this.getDateKey(enrollment.createdAt, groupBy);
      
      if (!timeline.has(dateKey)) {
        timeline.set(dateKey, {
          date: dateKey,
          enrolled: 0,
          completed: 0,
          exited: 0,
          active: 0,
        });
      }

      const stats = timeline.get(dateKey)!;
      stats.enrolled++;

      if (enrollment.status === EnrollmentStatus.COMPLETED) {
        stats.completed++;
      } else if (enrollment.status === EnrollmentStatus.EXITED) {
        stats.exited++;
      } else if (enrollment.status === EnrollmentStatus.ACTIVE) {
        stats.active++;
      }
    });

    return Array.from(timeline.values());
  }

  private getDateKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    
    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0];
      
      case 'week':
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      
      case 'month':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      default:
        return d.toISOString().split('T')[0];
    }
  }

  async compareSequences(sequenceIds: string[], tenantId: string): Promise<any> {
    const comparisons = await Promise.all(
      sequenceIds.map(id => this.getSequencePerformance(id, tenantId))
    );

    return {
      sequences: comparisons,
      summary: {
        bestConversionRate: comparisons.reduce((best, curr) => 
          curr.conversionRate > best.conversionRate ? curr : best
        ),
        bestReplyRate: comparisons.reduce((best, curr) => 
          curr.replyRate > best.replyRate ? curr : best
        ),
        bestMeetingRate: comparisons.reduce((best, curr) => 
          curr.meetingBookedRate > best.meetingBookedRate ? curr : best
        ),
      },
    };
  }
}
