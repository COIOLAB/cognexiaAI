// Industry 5.0 ERP Backend - Exit Management Service
// Business logic for employee offboarding, exit interviews, and knowledge transfer
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { ExitManagementModel } from '../models/exit-management.model';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class ExitManagementService {
  private exitModel: ExitManagementModel;

  constructor() {
    this.exitModel = new ExitManagementModel();
  }

  async initiateExitProcess(organizationId: UUID, data: any): Promise<any> {
    try {
      this.validateExitData(data);

      // Create exit record
      const exitRecord = await this.exitModel.createExitRecord(organizationId, data);
      
      // Generate offboarding checklist
      const checklist = await this.generateOffboardingChecklist(data.employeeId, organizationId);
      await this.exitModel.createOffboardingChecklist(exitRecord.id, checklist);

      // Schedule exit interview
      if (data.scheduleExitInterview) {
        await this.scheduleExitInterview(exitRecord.id, data.exitInterviewDate);
      }

      logger.info(`Exit process initiated for employee ${data.employeeId}`);
      return { exitRecord, checklist };
    } catch (error) {
      logger.error('Error initiating exit process:', error);
      throw error;
    }
  }

  async conductExitInterview(organizationId: UUID, data: any): Promise<any> {
    try {
      this.validateExitInterviewData(data);

      const interview = await this.exitModel.createExitInterview(organizationId, data);
      
      // Analyze sentiment and feedback
      const analysis = await this.analyzeExitFeedback(data.responses);
      await this.exitModel.updateExitInterview(interview.id, { analysis });

      logger.info(`Exit interview conducted for employee ${data.employeeId}`);
      return { interview, analysis };
    } catch (error) {
      logger.error('Error conducting exit interview:', error);
      throw error;
    }
  }

  async createKnowledgeTransferPlan(employeeId: UUID, successorId: UUID, organizationId: UUID): Promise<any> {
    try {
      // Get employee's responsibilities and projects
      const responsibilities = await this.exitModel.getEmployeeResponsibilities(employeeId);
      const projects = await this.exitModel.getEmployeeProjects(employeeId);

      const transferPlan = await this.exitModel.createKnowledgeTransferPlan(organizationId, {
        departingEmployeeId: employeeId,
        successorId,
        responsibilities,
        projects,
        timeline: this.generateTransferTimeline(responsibilities, projects)
      });

      logger.info(`Knowledge transfer plan created: ${employeeId} -> ${successorId}`);
      return transferPlan;
    } catch (error) {
      logger.error('Error creating knowledge transfer plan:', error);
      throw error;
    }
  }

  async updateOffboardingStatus(checklistId: UUID, itemId: UUID, completed: boolean, organizationId: UUID): Promise<any> {
    try {
      const checklist = await this.exitModel.updateChecklistItem(checklistId, itemId, completed);
      
      // Check if all items completed
      const completionStatus = await this.checkOffboardingCompletion(checklistId);
      if (completionStatus.allCompleted) {
        await this.exitModel.markOffboardingComplete(checklistId);
        logger.info(`Offboarding completed for checklist ${checklistId}`);
      }

      return { checklist, completionStatus };
    } catch (error) {
      logger.error('Error updating offboarding status:', error);
      throw error;
    }
  }

  async getExitAnalytics(organizationId: UUID, period?: string): Promise<any> {
    try {
      const analytics = await this.exitModel.getExitAnalytics(organizationId, period);
      
      return {
        ...analytics,
        insights: this.generateExitInsights(analytics),
        recommendations: this.generateRetentionRecommendations(analytics)
      };
    } catch (error) {
      logger.error('Error getting exit analytics:', error);
      throw error;
    }
  }

  async getTurnoverReport(organizationId: UUID, filters?: any): Promise<any> {
    try {
      return await this.exitModel.generateTurnoverReport(organizationId, filters);
    } catch (error) {
      logger.error('Error generating turnover report:', error);
      throw error;
    }
  }

  private async generateOffboardingChecklist(employeeId: UUID, organizationId: UUID): Promise<any[]> {
    // Standard offboarding checklist items
    const standardItems = [
      { task: 'Return company equipment', responsible: 'IT', dueDate: 'Last working day' },
      { task: 'Hand over access cards/keys', responsible: 'Security', dueDate: 'Last working day' },
      { task: 'Complete final timesheet', responsible: 'Employee', dueDate: 'Last working day' },
      { task: 'Conduct exit interview', responsible: 'HR', dueDate: 'Within 1 week' },
      { task: 'Update system access', responsible: 'IT', dueDate: 'Last working day' },
      { task: 'Process final payroll', responsible: 'Payroll', dueDate: 'Next pay cycle' },
      { task: 'Transfer knowledge/responsibilities', responsible: 'Manager', dueDate: 'Before last day' },
      { task: 'Update emergency contacts', responsible: 'HR', dueDate: 'Last working day' }
    ];

    // Customize based on employee role and department
    const employee = await this.exitModel.getEmployeeDetails(employeeId);
    if (employee.hasDirectReports) {
      standardItems.push({ task: 'Reassign direct reports', responsible: 'Manager', dueDate: 'Before last day' });
    }

    if (employee.hasSigningAuthority) {
      standardItems.push({ task: 'Transfer signing authority', responsible: 'Finance', dueDate: 'Before last day' });
    }

    return standardItems;
  }

  private async scheduleExitInterview(exitId: UUID, interviewDate?: Date): Promise<void> {
    // Schedule exit interview (integrate with calendar system)
    const scheduledDate = interviewDate || this.calculateDefaultInterviewDate();
    await this.exitModel.scheduleExitInterview(exitId, scheduledDate);
  }

  private calculateDefaultInterviewDate(): Date {
    // Default to 2 days before last working day
    const date = new Date();
    date.setDate(date.getDate() + 12); // Assuming 2 weeks notice
    return date;
  }

  private async analyzeExitFeedback(responses: any[]): Promise<any> {
    // Analyze exit interview responses for sentiment and themes
    const themes = this.extractFeedbackThemes(responses);
    const sentiment = this.analyzeSentiment(responses);
    
    return {
      themes,
      sentiment,
      riskFactors: this.identifyRiskFactors(responses),
      recommendedActions: this.generateActionItems(themes, sentiment)
    };
  }

  private extractFeedbackThemes(responses: any[]): string[] {
    // Simple theme extraction (could be enhanced with NLP)
    const themes = new Set<string>();
    
    responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('management') || text.includes('supervisor')) themes.add('Management');
      if (text.includes('workload') || text.includes('stress')) themes.add('Workload');
      if (text.includes('career') || text.includes('growth')) themes.add('Career Development');
      if (text.includes('compensation') || text.includes('salary')) themes.add('Compensation');
      if (text.includes('culture') || text.includes('environment')) themes.add('Work Environment');
    });

    return Array.from(themes);
  }

  private analyzeSentiment(responses: any[]): string {
    // Basic sentiment analysis (could be enhanced with AI)
    let positiveCount = 0;
    let negativeCount = 0;

    responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('good') || text.includes('great') || text.includes('excellent')) {
        positiveCount++;
      }
      if (text.includes('bad') || text.includes('poor') || text.includes('disappointed')) {
        negativeCount++;
      }
    });

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  private identifyRiskFactors(responses: any[]): string[] {
    const riskFactors = [];
    
    responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('toxic') || text.includes('harassment')) {
        riskFactors.push('Workplace Culture Risk');
      }
      if (text.includes('burnout') || text.includes('overwork')) {
        riskFactors.push('Employee Wellness Risk');
      }
      if (text.includes('unfair') || text.includes('discrimination')) {
        riskFactors.push('Fairness Risk');
      }
    });

    return riskFactors;
  }

  private generateActionItems(themes: string[], sentiment: string): string[] {
    const actions = [];
    
    if (themes.includes('Management')) {
      actions.push('Review management training programs');
    }
    if (themes.includes('Workload')) {
      actions.push('Assess team capacity and workload distribution');
    }
    if (themes.includes('Career Development')) {
      actions.push('Enhance career development opportunities');
    }
    if (sentiment === 'Negative') {
      actions.push('Conduct team satisfaction survey');
    }

    return actions;
  }

  private generateTransferTimeline(responsibilities: any[], projects: any[]): any[] {
    const timeline = [];
    const totalItems = responsibilities.length + projects.length;
    const weeksNeeded = Math.max(2, Math.ceil(totalItems / 3)); // At least 2 weeks

    responsibilities.forEach((resp, index) => {
      timeline.push({
        week: Math.ceil((index + 1) / 3),
        task: `Transfer responsibility: ${resp.name}`,
        type: 'responsibility'
      });
    });

    projects.forEach((project, index) => {
      timeline.push({
        week: Math.ceil((index + 1) / 2) + 1,
        task: `Handover project: ${project.name}`,
        type: 'project'
      });
    });

    return timeline.sort((a, b) => a.week - b.week);
  }

  private async checkOffboardingCompletion(checklistId: UUID): Promise<any> {
    return await this.exitModel.getOffboardingCompletionStatus(checklistId);
  }

  private generateExitInsights(analytics: any): string[] {
    const insights = [];
    
    if (analytics.turnoverRate > 15) {
      insights.push('High turnover rate detected - review retention strategies');
    }
    
    if (analytics.voluntaryExits > analytics.involuntaryExits * 2) {
      insights.push('Majority of exits are voluntary - focus on employee satisfaction');
    }

    if (analytics.topReasons?.includes('Management')) {
      insights.push('Management issues are a common exit reason - invest in leadership development');
    }

    return insights;
  }

  private generateRetentionRecommendations(analytics: any): string[] {
    const recommendations = [];
    
    recommendations.push('Implement regular stay interviews');
    recommendations.push('Enhance onboarding process');
    recommendations.push('Develop clear career progression paths');
    recommendations.push('Improve manager training programs');
    
    if (analytics.averageTenure < 18) {
      recommendations.push('Focus on early career employee retention');
    }

    return recommendations;
  }

  private validateExitData(data: any): void {
    if (!data.employeeId || !data.lastWorkingDay || !data.exitReason) {
      throw new HRError(HRErrorCodes.INVALID_EXIT_DATA, 'Missing required exit data', 400);
    }

    if (new Date(data.lastWorkingDay) <= new Date()) {
      throw new HRError(HRErrorCodes.INVALID_EXIT_DATA, 'Last working day must be in the future', 400);
    }
  }

  private validateExitInterviewData(data: any): void {
    if (!data.employeeId || !data.responses || data.responses.length === 0) {
      throw new HRError(HRErrorCodes.INVALID_EXIT_INTERVIEW_DATA, 'Missing required interview data', 400);
    }
  }
}
