// Industry 5.0 ERP Backend - Employee Engagement Service
// Business logic for employee surveys, feedback, and engagement analytics
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { EmployeeEngagementModel } from '../models/employee-engagement.model';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class EmployeeEngagementService {
  private engagementModel: EmployeeEngagementModel;

  constructor() {
    this.engagementModel = new EmployeeEngagementModel();
  }

  async createSurvey(organizationId: UUID, data: any): Promise<any> {
    try {
      this.validateSurveyData(data);

      const survey = await this.engagementModel.createSurvey(organizationId, data);
      logger.info(`Created survey: ${survey.title} (ID: ${survey.id})`);
      
      return survey;
    } catch (error) {
      logger.error('Error creating survey:', error);
      throw error;
    }
  }

  async submitSurveyResponse(organizationId: UUID, data: any): Promise<any> {
    try {
      // Check if employee already responded
      const existingResponse = await this.engagementModel.findSurveyResponse(data.surveyId, data.employeeId);
      if (existingResponse) {
        throw new HRError(HRErrorCodes.SURVEY_ALREADY_RESPONDED, 'Employee has already responded to this survey', 400);
      }

      const response = await this.engagementModel.createSurveyResponse(organizationId, data);
      logger.info(`Survey response submitted by employee ${data.employeeId} for survey ${data.surveyId}`);
      
      return response;
    } catch (error) {
      logger.error('Error submitting survey response:', error);
      throw error;
    }
  }

  async submitFeedback(organizationId: UUID, data: any): Promise<any> {
    try {
      this.validateFeedbackData(data);

      const feedback = await this.engagementModel.createFeedback(organizationId, data);
      logger.info(`Feedback submitted by employee ${data.submittedBy}`);
      
      return feedback;
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getEngagementScore(organizationId: UUID, filters?: any): Promise<any> {
    try {
      const score = await this.engagementModel.calculateEngagementScore(organizationId, filters);
      
      return {
        overallScore: score,
        benchmarks: await this.getEngagementBenchmarks(organizationId),
        recommendations: this.generateEngagementRecommendations(score),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error calculating engagement score:', error);
      throw error;
    }
  }

  async getSurveyResults(surveyId: UUID, organizationId: UUID): Promise<any> {
    try {
      return await this.engagementModel.getSurveyAnalytics(surveyId, organizationId);
    } catch (error) {
      logger.error(`Error getting survey results for ${surveyId}:`, error);
      throw error;
    }
  }

  async getEngagementTrends(organizationId: UUID, period: string): Promise<any> {
    try {
      return await this.engagementModel.getEngagementTrends(organizationId, period);
    } catch (error) {
      logger.error('Error getting engagement trends:', error);
      throw error;
    }
  }

  private async getEngagementBenchmarks(organizationId: UUID): Promise<any> {
    // Industry benchmarks, historical data, etc.
    return {
      industryAverage: 72,
      topPerformers: 85,
      previousPeriod: await this.engagementModel.getPreviousEngagementScore(organizationId)
    };
  }

  private generateEngagementRecommendations(score: number): string[] {
    const recommendations = [];

    if (score < 60) {
      recommendations.push('Critical: Immediate action needed to address engagement issues');
      recommendations.push('Conduct focus groups to identify root causes');
      recommendations.push('Review management practices and communication');
    } else if (score < 75) {
      recommendations.push('Implement regular feedback sessions');
      recommendations.push('Focus on professional development opportunities');
      recommendations.push('Improve work-life balance initiatives');
    } else {
      recommendations.push('Maintain current engagement levels');
      recommendations.push('Continue recognition programs');
      recommendations.push('Share best practices across teams');
    }

    return recommendations;
  }

  private validateSurveyData(data: any): void {
    if (!data.title || !data.questions || data.questions.length === 0) {
      throw new HRError(HRErrorCodes.INVALID_SURVEY_DATA, 'Survey must have title and questions', 400);
    }

    if (!data.startDate || !data.endDate) {
      throw new HRError(HRErrorCodes.INVALID_SURVEY_DATA, 'Survey dates are required', 400);
    }

    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new HRError(HRErrorCodes.INVALID_SURVEY_DATA, 'End date must be after start date', 400);
    }
  }

  private validateFeedbackData(data: any): void {
    if (!data.submittedBy || !data.content) {
      throw new HRError(HRErrorCodes.INVALID_FEEDBACK_DATA, 'Feedback must have content and submitter', 400);
    }

    if (data.content.length < 10) {
      throw new HRError(HRErrorCodes.INVALID_FEEDBACK_DATA, 'Feedback content too short', 400);
    }
  }
}
