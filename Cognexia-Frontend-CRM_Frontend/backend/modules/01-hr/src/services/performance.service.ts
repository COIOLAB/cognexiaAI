// Industry 5.0 ERP Backend - Performance Management Service
// Service for managing employee performance reviews and goal tracking
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { PerformanceReview, PerformanceGoal, CompetencyFramework, ReviewType, ReviewStatus, GoalStatus, CreatePerformanceReviewRequest, CreatePerformanceGoalRequest, PaginationOptions, PaginatedResponse, FilterOptions } from '../types';
import { PerformanceModel } from '../models';
import { HRError, HRErrorCodes, HRErrorFactory } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export interface PerformanceService {
  // Performance Reviews
  createReview(organizationId: UUID, data: CreatePerformanceReviewRequest): Promise<PerformanceReview>;
  getReviewById(id: UUID): Promise<PerformanceReview | null>;
  updateReview(id: UUID, data: Partial<PerformanceReview>): Promise<PerformanceReview>;
  listReviews(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceReview>>;
  submitReview(id: UUID, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview>;
  
  // Performance Goals
  createGoal(organizationId: UUID, data: CreatePerformanceGoalRequest): Promise<PerformanceGoal>;
  getGoalById(id: UUID): Promise<PerformanceGoal | null>;
  updateGoal(id: UUID, data: Partial<PerformanceGoal>): Promise<PerformanceGoal>;
  listGoals(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceGoal>>;
  updateGoalProgress(id: UUID, progress: number, notes?: string): Promise<PerformanceGoal>;
  
  // Competency Frameworks
  getCompetencyFramework(organizationId: UUID): Promise<CompetencyFramework[]>;
  createCompetencyFramework(organizationId: UUID, data: Partial<CompetencyFramework>): Promise<CompetencyFramework>;
  
  // Analytics
  getPerformanceAnalytics(organizationId: UUID, employeeId?: UUID): Promise<any>;
  getTeamPerformanceMetrics(managerId: UUID): Promise<any>;
}

export class PerformanceServiceImpl implements PerformanceService {
  private performanceModel: PerformanceModel;

  constructor() {
    this.performanceModel = new PerformanceModel();
  }

  /**
   * Creates a new performance review
   */
  async createReview(organizationId: UUID, data: CreatePerformanceReviewRequest): Promise<PerformanceReview> {
    try {
      // Validate review data
      this.validateReviewData(data);

      // Check for overlapping reviews
      const existingReviews = await this.performanceModel.findOverlappingReviews(
        data.employeeId,
        data.reviewPeriod.startDate,
        data.reviewPeriod.endDate
      );

      if (existingReviews.length > 0) {
        throw new HRError(HRErrorCodes.REVIEW_PERIOD_OVERLAP, 'Review period overlaps with existing review', 400);
      }

      const review = await this.performanceModel.createReview(organizationId, data);
      
      logger.info(`Performance review created: ${review.id}`, {
        reviewId: review.id,
        employeeId: data.employeeId,
        reviewType: data.reviewType
      });

      return review;
    } catch (error) {
      logger.error('Error creating performance review:', error);
      throw error instanceof HRError ? error : new HRError(HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA, error.message, 500);
    }
  }

  /**
   * Gets a performance review by ID
   */
  async getReviewById(id: UUID): Promise<PerformanceReview | null> {
    try {
      return await this.performanceModel.findReviewById(id);
    } catch (error) {
      logger.error(`Error getting performance review ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates a performance review
   */
  async updateReview(id: UUID, data: Partial<PerformanceReview>): Promise<PerformanceReview> {
    try {
      const existingReview = await this.performanceModel.findReviewById(id);
      if (!existingReview) {
        throw new HRError(HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND, 'Performance review not found', 404);
      }

      // Validate status transitions
      if (data.status && !this.isValidStatusTransition(existingReview.status, data.status)) {
        throw new HRError(
          HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA,
          `Invalid status transition from ${existingReview.status} to ${data.status}`,
          400
        );
      }

      const updatedReview = await this.performanceModel.updateReview(id, data);
      
      logger.info(`Performance review updated: ${id}`, {
        reviewId: id,
        updatedFields: Object.keys(data)
      });

      return updatedReview;
    } catch (error) {
      logger.error(`Error updating performance review ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lists performance reviews with pagination and filtering
   */
  async listReviews(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceReview>> {
    try {
      return await this.performanceModel.listReviews(organizationId, options);
    } catch (error) {
      logger.error('Error listing performance reviews:', error);
      throw error;
    }
  }

  /**
   * Submits a performance review for approval
   */
  async submitReview(id: UUID, reviewData: Partial<PerformanceReview>): Promise<PerformanceReview> {
    try {
      const review = await this.performanceModel.findReviewById(id);
      if (!review) {
        throw new HRError(HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND, 'Performance review not found', 404);
      }

      if (review.status !== ReviewStatus.IN_PROGRESS) {
        throw new HRError(
          HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA,
          'Only in-progress reviews can be submitted',
          400
        );
      }

      // Calculate overall rating if competency ratings provided
      let overallRating = reviewData.overallRating;
      if (!overallRating && reviewData.competencyRatings?.length) {
        overallRating = this.calculateOverallRating(reviewData.competencyRatings);
      }

      const updatedReview = await this.performanceModel.updateReview(id, {
        ...reviewData,
        overallRating,
        status: ReviewStatus.SUBMITTED,
        submissionDate: new Date()
      });

      logger.info(`Performance review submitted: ${id}`, {
        reviewId: id,
        overallRating
      });

      return updatedReview;
    } catch (error) {
      logger.error(`Error submitting performance review ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new performance goal
   */
  async createGoal(organizationId: UUID, data: CreatePerformanceGoalRequest): Promise<PerformanceGoal> {
    try {
      this.validateGoalData(data);

      const goal = await this.performanceModel.createGoal(organizationId, data);
      
      logger.info(`Performance goal created: ${goal.id}`, {
        goalId: goal.id,
        employeeId: data.employeeId,
        title: data.title
      });

      return goal;
    } catch (error) {
      logger.error('Error creating performance goal:', error);
      throw error instanceof HRError ? error : new HRError(HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA, error.message, 500);
    }
  }

  /**
   * Gets a performance goal by ID
   */
  async getGoalById(id: UUID): Promise<PerformanceGoal | null> {
    try {
      return await this.performanceModel.findGoalById(id);
    } catch (error) {
      logger.error(`Error getting performance goal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates a performance goal
   */
  async updateGoal(id: UUID, data: Partial<PerformanceGoal>): Promise<PerformanceGoal> {
    try {
      const existingGoal = await this.performanceModel.findGoalById(id);
      if (!existingGoal) {
        throw new HRError(HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND, 'Performance goal not found', 404);
      }

      const updatedGoal = await this.performanceModel.updateGoal(id, data);
      
      logger.info(`Performance goal updated: ${id}`, {
        goalId: id,
        updatedFields: Object.keys(data)
      });

      return updatedGoal;
    } catch (error) {
      logger.error(`Error updating performance goal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lists performance goals with pagination and filtering
   */
  async listGoals(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PerformanceGoal>> {
    try {
      return await this.performanceModel.listGoals(organizationId, options);
    } catch (error) {
      logger.error('Error listing performance goals:', error);
      throw error;
    }
  }

  /**
   * Updates goal progress
   */
  async updateGoalProgress(id: UUID, progress: number, notes?: string): Promise<PerformanceGoal> {
    try {
      const goal = await this.performanceModel.findGoalById(id);
      if (!goal) {
        throw new HRError(HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND, 'Performance goal not found', 404);
      }

      // Validate progress percentage
      if (progress < 0 || progress > 100) {
        throw new HRError(HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA, 'Progress must be between 0 and 100', 400);
      }

      // Determine status based on progress
      let status: GoalStatus = goal.status;
      if (progress === 100) {
        status = GoalStatus.COMPLETED;
      } else if (progress > 0) {
        status = GoalStatus.IN_PROGRESS;
      }

      const updatedGoal = await this.performanceModel.updateGoal(id, {
        progress,
        status,
        progressNotes: notes,
        lastUpdated: new Date()
      });

      logger.info(`Goal progress updated: ${id}`, {
        goalId: id,
        progress,
        status
      });

      return updatedGoal;
    } catch (error) {
      logger.error(`Error updating goal progress ${id}:`, error);
      throw error;
    }
  }

  /**
   * Gets competency framework for organization
   */
  async getCompetencyFramework(organizationId: UUID): Promise<CompetencyFramework[]> {
    try {
      return await this.performanceModel.getCompetencyFrameworks(organizationId);
    } catch (error) {
      logger.error(`Error getting competency frameworks for org ${organizationId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a competency framework
   */
  async createCompetencyFramework(organizationId: UUID, data: Partial<CompetencyFramework>): Promise<CompetencyFramework> {
    try {
      const framework = await this.performanceModel.createCompetencyFramework(organizationId, data);
      
      logger.info(`Competency framework created: ${framework.id}`, {
        frameworkId: framework.id,
        name: data.name
      });

      return framework;
    } catch (error) {
      logger.error('Error creating competency framework:', error);
      throw error;
    }
  }

  /**
   * Gets performance analytics
   */
  async getPerformanceAnalytics(organizationId: UUID, employeeId?: UUID): Promise<any> {
    try {
      return await this.performanceModel.getPerformanceAnalytics(organizationId, employeeId);
    } catch (error) {
      logger.error('Error getting performance analytics:', error);
      throw error;
    }
  }

  /**
   * Gets team performance metrics for a manager
   */
  async getTeamPerformanceMetrics(managerId: UUID): Promise<any> {
    try {
      return await this.performanceModel.getTeamPerformanceMetrics(managerId);
    } catch (error) {
      logger.error(`Error getting team performance metrics for manager ${managerId}:`, error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private validateReviewData(data: CreatePerformanceReviewRequest): void {
    const errors: string[] = [];

    if (!data.employeeId) errors.push('Employee ID is required');
    if (!data.reviewerId) errors.push('Reviewer ID is required');
    if (!data.reviewType) errors.push('Review type is required');
    if (!data.reviewPeriod?.startDate) errors.push('Review period start date is required');
    if (!data.reviewPeriod?.endDate) errors.push('Review period end date is required');
    
    if (data.reviewPeriod?.startDate && data.reviewPeriod?.endDate) {
      if (new Date(data.reviewPeriod.startDate) >= new Date(data.reviewPeriod.endDate)) {
        errors.push('Review period start date must be before end date');
      }
    }

    if (errors.length > 0) {
      throw new HRError(HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA, 'Invalid review data', 400, { errors });
    }
  }

  private validateGoalData(data: CreatePerformanceGoalRequest): void {
    const errors: string[] = [];

    if (!data.employeeId) errors.push('Employee ID is required');
    if (!data.title?.trim()) errors.push('Goal title is required');
    if (!data.description?.trim()) errors.push('Goal description is required');
    if (!data.targetDate) errors.push('Target date is required');
    if (data.targetValue !== undefined && data.targetValue < 0) errors.push('Target value must be non-negative');

    if (data.targetDate && new Date(data.targetDate) <= new Date()) {
      errors.push('Target date must be in the future');
    }

    if (errors.length > 0) {
      throw new HRError(HRErrorCodes.INVALID_PERFORMANCE_REVIEW_DATA, 'Invalid goal data', 400, { errors });
    }
  }

  private isValidStatusTransition(currentStatus: ReviewStatus, newStatus: ReviewStatus): boolean {
    const validTransitions: Record<ReviewStatus, ReviewStatus[]> = {
      [ReviewStatus.NOT_STARTED]: [ReviewStatus.IN_PROGRESS],
      [ReviewStatus.IN_PROGRESS]: [ReviewStatus.SUBMITTED, ReviewStatus.NOT_STARTED],
      [ReviewStatus.SUBMITTED]: [ReviewStatus.APPROVED, ReviewStatus.REJECTED, ReviewStatus.IN_PROGRESS],
      [ReviewStatus.APPROVED]: [],
      [ReviewStatus.REJECTED]: [ReviewStatus.IN_PROGRESS]
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private calculateOverallRating(competencyRatings: any[]): number {
    if (!competencyRatings.length) return 0;
    
    const weightedSum = competencyRatings.reduce((sum, rating) => {
      return sum + (rating.rating * (rating.weight || 1));
    }, 0);
    
    const totalWeight = competencyRatings.reduce((sum, rating) => sum + (rating.weight || 1), 0);
    
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }
}

// Additional types for Performance Management
export interface CreatePerformanceReviewRequest {
  employeeId: UUID;
  reviewerId: UUID;
  reviewType: ReviewType;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
    name: string;
  };
  competencyFrameworkId?: UUID;
  goals?: UUID[];
}

export interface CreatePerformanceGoalRequest {
  employeeId: UUID;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  targetValue?: number;
  targetUnit?: string;
  weight: number;
  reviewId?: UUID;
}

export interface PerformanceGoal {
  id: UUID;
  organizationId: UUID;
  employeeId: UUID;
  reviewId?: UUID;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  targetValue?: number;
  currentValue?: number;
  targetUnit?: string;
  weight: number;
  progress: number;
  status: GoalStatus;
  progressNotes?: string;
  lastUpdated?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetencyFramework {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  competencies: Competency[];
  isActive: boolean;
  version: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Competency {
  id: UUID;
  name: string;
  description: string;
  category: string;
  weight: number;
  behaviorIndicators: string[];
  proficiencyLevels: ProficiencyLevel[];
}

export interface ProficiencyLevel {
  level: number;
  name: string;
  description: string;
  behaviorExamples: string[];
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}
