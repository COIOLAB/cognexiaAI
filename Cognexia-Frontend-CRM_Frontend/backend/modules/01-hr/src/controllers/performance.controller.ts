// Industry 5.0 ERP Backend - Performance Management Controller
// HTTP controllers for performance reviews, goals, and competency frameworks
// Author: AI Assistant
// Date: 2024

import { Request, Response } from 'express';
import { UUID } from 'crypto';
import { PerformanceService } from '../services/performance.service';
import { CreatePerformanceReviewRequest, CreatePerformanceGoalRequest, PaginationOptions, FilterOptions, CompetencyFramework } from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class PerformanceController {
  private performanceService: PerformanceService;

  constructor() {
    this.performanceService = new PerformanceService();
  }

  // =====================
  // PERFORMANCE REVIEWS
  // =====================

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const reviewData: CreatePerformanceReviewRequest = req.body;

      const review = await this.performanceService.createReview(organizationId, reviewData);

      logger.info(`Created performance review ${review.id} for employee ${reviewData.employeeId}`);
      res.status(201).json({
        success: true,
        data: review,
        message: 'Performance review created successfully'
      });
    } catch (error) {
      logger.error('Error in createReview:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const review = await this.performanceService.getReviewById(id as UUID, organizationId);

      if (!review) {
        res.status(404).json({
          success: false,
          error: HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND,
          message: 'Performance review not found'
        });
        return;
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('Error in getReview:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData = req.body;

      const review = await this.performanceService.updateReview(id as UUID, updateData, organizationId);

      logger.info(`Updated performance review ${id}`);
      res.json({
        success: true,
        data: review,
        message: 'Performance review updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateReview:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        employeeId: req.query.employeeId as UUID,
        reviewerId: req.query.reviewerId as UUID,
        status: req.query.status as string,
        reviewType: req.query.reviewType as string
      };

      const result = await this.performanceService.listReviews(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listReviews:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  submitReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const { submittedBy } = req.body;

      const review = await this.performanceService.submitReview(id as UUID, submittedBy as UUID, organizationId);

      logger.info(`Submitted performance review ${id}`);
      res.json({
        success: true,
        data: review,
        message: 'Performance review submitted successfully'
      });
    } catch (error) {
      logger.error('Error in submitReview:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  approveReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const { approvedBy } = req.body;

      const review = await this.performanceService.approveReview(id as UUID, approvedBy as UUID, organizationId);

      logger.info(`Approved performance review ${id}`);
      res.json({
        success: true,
        data: review,
        message: 'Performance review approved successfully'
      });
    } catch (error) {
      logger.error('Error in approveReview:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // PERFORMANCE GOALS
  // =====================

  createGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const goalData: CreatePerformanceGoalRequest = req.body;

      const goal = await this.performanceService.createGoal(organizationId, goalData);

      logger.info(`Created performance goal ${goal.id} for employee ${goalData.employeeId}`);
      res.status(201).json({
        success: true,
        data: goal,
        message: 'Performance goal created successfully'
      });
    } catch (error) {
      logger.error('Error in createGoal:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const goal = await this.performanceService.getGoalById(id as UUID, organizationId);

      if (!goal) {
        res.status(404).json({
          success: false,
          error: HRErrorCodes.PERFORMANCE_REVIEW_NOT_FOUND,
          message: 'Performance goal not found'
        });
        return;
      }

      res.json({
        success: true,
        data: goal
      });
    } catch (error) {
      logger.error('Error in getGoal:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData = req.body;

      const goal = await this.performanceService.updateGoal(id as UUID, updateData, organizationId);

      logger.info(`Updated performance goal ${id}`);
      res.json({
        success: true,
        data: goal,
        message: 'Performance goal updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateGoal:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        employeeId: req.query.employeeId as UUID,
        reviewId: req.query.reviewId as UUID,
        status: req.query.status as string,
        category: req.query.category as string
      };

      const result = await this.performanceService.listGoals(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listGoals:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateGoalProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const { progress, currentValue, notes } = req.body;

      const goal = await this.performanceService.updateGoalProgress(
        id as UUID, 
        progress, 
        currentValue, 
        notes, 
        organizationId
      );

      logger.info(`Updated progress for goal ${id} to ${progress}%`);
      res.json({
        success: true,
        data: goal,
        message: 'Goal progress updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateGoalProgress:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // COMPETENCY FRAMEWORKS
  // =====================

  getCompetencyFrameworks = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;

      const frameworks = await this.performanceService.getCompetencyFrameworks(organizationId);

      res.json({
        success: true,
        data: frameworks
      });
    } catch (error) {
      logger.error('Error in getCompetencyFrameworks:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  createCompetencyFramework = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const frameworkData: Partial<CompetencyFramework> = req.body;

      const framework = await this.performanceService.createCompetencyFramework(organizationId, frameworkData);

      logger.info(`Created competency framework ${framework.id}`);
      res.status(201).json({
        success: true,
        data: framework,
        message: 'Competency framework created successfully'
      });
    } catch (error) {
      logger.error('Error in createCompetencyFramework:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // PERFORMANCE ANALYTICS
  // =====================

  getPerformanceAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const employeeId = req.query.employeeId as UUID;

      const analytics = await this.performanceService.getPerformanceAnalytics(organizationId, employeeId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error in getPerformanceAnalytics:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getTeamPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { managerId } = req.params;

      const metrics = await this.performanceService.getTeamPerformanceMetrics(managerId as UUID);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Error in getTeamPerformanceMetrics:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };
}
