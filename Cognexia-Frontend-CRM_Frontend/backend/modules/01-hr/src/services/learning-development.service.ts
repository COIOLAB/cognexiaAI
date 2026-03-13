// Industry 5.0 ERP Backend - Learning & Development Service
// Business logic for training, courses, and skill development
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { LearningDevelopmentModel } from '../models/learning-development.model';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class LearningDevelopmentService {
  private learningModel: LearningDevelopmentModel;

  constructor() {
    this.learningModel = new LearningDevelopmentModel();
  }

  async createCourse(organizationId: UUID, data: any): Promise<any> {
    try {
      this.validateCourseData(data);

      const course = await this.learningModel.createCourse(organizationId, data);
      logger.info(`Created course: ${course.title} (ID: ${course.id})`);
      
      return course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  async enrollEmployee(organizationId: UUID, data: any): Promise<any> {
    try {
      // Check if employee is already enrolled
      const existingEnrollment = await this.learningModel.findEnrollment(data.employeeId, data.courseId);
      if (existingEnrollment) {
        throw new HRError(HRErrorCodes.ALREADY_ENROLLED, 'Employee is already enrolled in this course', 400);
      }

      const enrollment = await this.learningModel.createEnrollment(organizationId, data);
      logger.info(`Enrolled employee ${data.employeeId} in course ${data.courseId}`);
      
      return enrollment;
    } catch (error) {
      logger.error('Error enrolling employee:', error);
      throw error;
    }
  }

  async updateProgress(enrollmentId: UUID, progress: number, organizationId: UUID): Promise<any> {
    try {
      if (progress < 0 || progress > 100) {
        throw new HRError(HRErrorCodes.INVALID_PROGRESS, 'Progress must be between 0 and 100', 400);
      }

      const enrollment = await this.learningModel.updateEnrollmentProgress(enrollmentId, progress);
      
      // If course completed, trigger completion logic
      if (progress === 100) {
        await this.handleCourseCompletion(enrollment);
      }

      return enrollment;
    } catch (error) {
      logger.error(`Error updating progress for enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  async getEmployeeSkills(employeeId: UUID, organizationId: UUID): Promise<any> {
    try {
      return await this.learningModel.getEmployeeSkills(employeeId, organizationId);
    } catch (error) {
      logger.error(`Error getting skills for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async getLearningAnalytics(organizationId: UUID): Promise<any> {
    try {
      return await this.learningModel.getLearningAnalytics(organizationId);
    } catch (error) {
      logger.error('Error getting learning analytics:', error);
      throw error;
    }
  }

  private async handleCourseCompletion(enrollment: any): Promise<void> {
    // Award certificates, update skills, trigger notifications, etc.
    logger.info(`Course completed by employee ${enrollment.employeeId}`);
  }

  private validateCourseData(data: any): void {
    if (!data.title || !data.category || !data.duration) {
      throw new HRError(HRErrorCodes.INVALID_COURSE_DATA, 'Missing required course data', 400);
    }

    if (data.duration <= 0) {
      throw new HRError(HRErrorCodes.INVALID_COURSE_DATA, 'Course duration must be positive', 400);
    }
  }
}
