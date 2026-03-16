// Industry 5.0 ERP Backend - Learning & Development Controller
// AI-powered personalized learning with skill gap analysis, certification management, and advanced training analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { LearningDevelopmentService } from '../services/learning-development.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class LearningDevelopmentController {
  private learningDevelopmentService: LearningDevelopmentService;

  constructor() {
    this.learningDevelopmentService = new LearningDevelopmentService();
  }

  /**
   * Create training course
   * POST /api/v1/hr/learning/courses
   */
  createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const courseData = req.body;

      if (!courseData.title || !courseData.organizationId || !courseData.category) {
        res.status(400).json({
          success: false,
          message: 'Course title, organization ID, and category are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.createCourse({
        ...courseData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating course',
        error: error.message
      });
    }
  };

  /**
   * Get training courses
   * GET /api/v1/hr/learning/courses
   */
  getCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        category,
        level,
        status,
        skillId,
        instructorId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        category: category as string,
        level: level as string,
        status: status as string,
        skillId: skillId as UUID,
        instructorId: instructorId as UUID
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getCourses(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching courses',
        error: error.message
      });
    }
  };

  /**
   * Get course by ID
   * GET /api/v1/hr/learning/courses/:id
   */
  getCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeModules = true, includeEnrollments = false } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getCourseById(
        id as UUID,
        includeModules === 'true',
        includeEnrollments === 'true'
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching course',
        error: error.message
      });
    }
  };

  /**
   * Update course
   * PUT /api/v1/hr/learning/courses/:id
   */
  updateCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.updateCourse(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating course',
        error: error.message
      });
    }
  };

  /**
   * Delete course
   * DELETE /api/v1/hr/learning/courses/:id
   */
  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.deleteCourse(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting course',
        error: error.message
      });
    }
  };

  /**
   * Enroll employee in course
   * POST /api/v1/hr/learning/enrollments
   */
  enrollInCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, courseId, enrollmentType = 'voluntary' } = req.body;

      if (!employeeId || !courseId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and course ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.enrollInCourse(
        employeeId as UUID,
        courseId as UUID,
        enrollmentType,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enrolling in course',
        error: error.message
      });
    }
  };

  /**
   * Get course enrollments
   * GET /api/v1/hr/learning/enrollments
   */
  getCourseEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        courseId,
        status,
        organizationId,
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        courseId: courseId as UUID,
        status: status as string,
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getCourseEnrollments(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching course enrollments',
        error: error.message
      });
    }
  };

  /**
   * Get employee enrollments
   * GET /api/v1/hr/learning/employees/:employeeId/enrollments
   */
  getEmployeeEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { status, category, limit = 20, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:learning:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access employee enrollments',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        status: status as string,
        category: category as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getEmployeeEnrollments(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee enrollments',
        error: error.message
      });
    }
  };

  /**
   * Update enrollment progress
   * PUT /api/v1/hr/learning/enrollments/:id/progress
   */
  updateEnrollmentProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { progressPercentage, completedModules, timeSpent, notes } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.updateEnrollmentProgress(
        id as UUID,
        {
          progressPercentage,
          completedModules,
          timeSpent,
          notes,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating enrollment progress',
        error: error.message
      });
    }
  };

  /**
   * Complete course enrollment
   * POST /api/v1/hr/learning/enrollments/:id/complete
   */
  completeEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { finalScore, feedback, certificateRequested = true } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.completeEnrollment(
        id as UUID,
        {
          finalScore,
          feedback,
          certificateRequested,
          completedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while completing enrollment',
        error: error.message
      });
    }
  };

  /**
   * Create learning path
   * POST /api/v1/hr/learning/learning-paths
   */
  createLearningPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const learningPathData = req.body;

      if (!learningPathData.name || !learningPathData.organizationId || !learningPathData.courses?.length) {
        res.status(400).json({
          success: false,
          message: 'Learning path name, organization ID, and courses are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.createLearningPath({
        ...learningPathData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating learning path',
        error: error.message
      });
    }
  };

  /**
   * Get learning paths
   * GET /api/v1/hr/learning/learning-paths
   */
  getLearningPaths = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        skillId,
        level,
        status,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        skillId: skillId as UUID,
        level: level as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getLearningPaths(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching learning paths',
        error: error.message
      });
    }
  };

  /**
   * Enroll in learning path
   * POST /api/v1/hr/learning/learning-paths/:id/enroll
   */
  enrollInLearningPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, targetCompletionDate } = req.body;

      if (!id || !employeeId) {
        res.status(400).json({
          success: false,
          message: 'Learning path ID and employee ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.enrollInLearningPath(
        employeeId as UUID,
        id as UUID,
        targetCompletionDate ? new Date(targetCompletionDate) : undefined,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enrolling in learning path',
        error: error.message
      });
    }
  };

  /**
   * Skill gap analysis
   * POST /api/v1/hr/learning/skill-gap-analysis
   */
  performSkillGapAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, targetRoleId, departmentId, includeRecommendations = true } = req.body;

      if (!employeeId && !departmentId) {
        res.status(400).json({
          success: false,
          message: 'Either employee ID or department ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.performSkillGapAnalysis(
        employeeId as UUID,
        targetRoleId as UUID,
        departmentId as UUID,
        includeRecommendations,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while performing skill gap analysis',
        error: error.message
      });
    }
  };

  /**
   * Get employee skill matrix
   * GET /api/v1/hr/learning/employees/:employeeId/skills
   */
  getEmployeeSkillMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { category, includeAssessments = true } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:learning:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access employee skill matrix',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getEmployeeSkillMatrix(
        employeeId as UUID,
        category as string,
        includeAssessments === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee skill matrix',
        error: error.message
      });
    }
  };

  /**
   * Update employee skill assessment
   * PUT /api/v1/hr/learning/employees/:employeeId/skills/:skillId
   */
  updateEmployeeSkillAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, skillId } = req.params;
      const { proficiencyLevel, assessmentScore, certificationLevel, assessedBy, notes } = req.body;

      if (!employeeId || !skillId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and skill ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.updateEmployeeSkillAssessment(
        employeeId as UUID,
        skillId as UUID,
        {
          proficiencyLevel,
          assessmentScore,
          certificationLevel,
          assessedBy: assessedBy || req.user?.id,
          notes,
          assessmentDate: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating skill assessment',
        error: error.message
      });
    }
  };

  /**
   * Create certification
   * POST /api/v1/hr/learning/certifications
   */
  createCertification = async (req: Request, res: Response): Promise<void> => {
    try {
      const certificationData = req.body;

      if (!certificationData.name || !certificationData.organizationId || !certificationData.skillId) {
        res.status(400).json({
          success: false,
          message: 'Certification name, organization ID, and skill ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.createCertification({
        ...certificationData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating certification',
        error: error.message
      });
    }
  };

  /**
   * Get certifications
   * GET /api/v1/hr/learning/certifications
   */
  getCertifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        skillId,
        category,
        status,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        skillId: skillId as UUID,
        category: category as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getCertifications(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching certifications',
        error: error.message
      });
    }
  };

  /**
   * Award certification to employee
   * POST /api/v1/hr/learning/certifications/:id/award
   */
  awardCertification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, score, validUntil, notes } = req.body;

      if (!id || !employeeId) {
        res.status(400).json({
          success: false,
          message: 'Certification ID and employee ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.awardCertification(
        employeeId as UUID,
        id as UUID,
        {
          score,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          notes,
          awardedBy: req.user?.id,
          awardedDate: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while awarding certification',
        error: error.message
      });
    }
  };

  /**
   * Get employee certifications
   * GET /api/v1/hr/learning/employees/:employeeId/certifications
   */
  getEmployeeCertifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { status, skillId, expiringWithin } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:learning:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access employee certifications',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        status: status as string,
        skillId: skillId as UUID,
        expiringWithin: expiringWithin ? parseInt(expiringWithin as string) : undefined
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getEmployeeCertifications(
        employeeId as UUID,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee certifications',
        error: error.message
      });
    }
  };

  /**
   * Get personalized learning recommendations
   * GET /api/v1/hr/learning/employees/:employeeId/recommendations
   */
  getPersonalizedLearningRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { basedOn = 'skill_gaps', limit = 10, includeExternal = false } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:learning:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access learning recommendations',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getPersonalizedLearningRecommendations(
        employeeId as UUID,
        basedOn as string,
        parseInt(limit as string),
        includeExternal === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching learning recommendations',
        error: error.message
      });
    }
  };

  /**
   * Create learning goal
   * POST /api/v1/hr/learning/goals
   */
  createLearningGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const goalData = req.body;

      if (!goalData.employeeId || !goalData.title || !goalData.targetDate) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, title, and target date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.createLearningGoal({
        ...goalData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating learning goal',
        error: error.message
      });
    }
  };

  /**
   * Get learning goals
   * GET /api/v1/hr/learning/goals
   */
  getLearningGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        status,
        skillId,
        dueWithin,
        organizationId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        status: status as string,
        skillId: skillId as UUID,
        dueWithin: dueWithin ? parseInt(dueWithin as string) : undefined,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getLearningGoals(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching learning goals',
        error: error.message
      });
    }
  };

  /**
   * Update learning goal progress
   * PUT /api/v1/hr/learning/goals/:id/progress
   */
  updateLearningGoalProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { progress, milestones, notes } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Learning goal ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.updateLearningGoalProgress(
        id as UUID,
        {
          progress,
          milestones,
          notes,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating learning goal progress',
        error: error.message
      });
    }
  };

  /**
   * Generate learning analytics
   * GET /api/v1/hr/learning/analytics
   */
  getLearningAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        employeeId,
        startDate,
        endDate,
        analyticsType = 'overview'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        employeeId: employeeId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        analyticsType: analyticsType as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getLearningAnalytics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating learning analytics',
        error: error.message
      });
    }
  };

  /**
   * Get learning effectiveness metrics
   * GET /api/v1/hr/learning/effectiveness-metrics
   */
  getLearningEffectivenessMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        courseId,
        learningPathId,
        startDate,
        endDate,
        metricType = 'all'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        courseId: courseId as UUID,
        learningPathId: learningPathId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        metricType: metricType as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getLearningEffectivenessMetrics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching learning effectiveness metrics',
        error: error.message
      });
    }
  };

  /**
   * Generate ROI analysis for training
   * GET /api/v1/hr/learning/roi-analysis
   */
  getTrainingROIAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        courseId,
        departmentId,
        startDate,
        endDate,
        includeProjections = false
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        courseId: courseId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeProjections: includeProjections === 'true'
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getTrainingROIAnalysis(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating training ROI analysis',
        error: error.message
      });
    }
  };

  /**
   * AI-powered learning content recommendations
   * GET /api/v1/hr/learning/ai/content-recommendations
   */
  getAIContentRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        skillId,
        proficiencyLevel,
        learningStyle,
        limit = 10
      } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getAIContentRecommendations(
        employeeId as UUID,
        skillId as UUID,
        proficiencyLevel as string,
        learningStyle as string,
        parseInt(limit as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching AI content recommendations',
        error: error.message
      });
    }
  };

  /**
   * Predictive learning analytics
   * GET /api/v1/hr/learning/ai/predictive-analytics
   */
  getPredictiveLearningAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        employeeId,
        predictionType = 'completion',
        timeFrame = '3m'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.getPredictiveLearningAnalytics(
        organizationId as UUID,
        employeeId as UUID,
        predictionType as string,
        timeFrame as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating predictive learning analytics',
        error: error.message
      });
    }
  };

  /**
   * Learning path optimization
   * POST /api/v1/hr/learning/ai/optimize-learning-path
   */
  optimizeLearningPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { learningPathId, optimizationCriteria = 'time_efficiency' } = req.body;

      if (!learningPathId) {
        res.status(400).json({
          success: false,
          message: 'Learning path ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.optimizeLearningPath(
        learningPathId as UUID,
        optimizationCriteria,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while optimizing learning path',
        error: error.message
      });
    }
  };

  /**
   * Generate learning reports
   * GET /api/v1/hr/learning/reports/:reportType
   */
  generateLearningReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportType } = req.params;
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        format = 'json'
      } = req.query;

      if (!reportType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Report type and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        format: format as string
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.generateLearningReport(
        reportType,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating learning report',
        error: error.message
      });
    }
  };

  /**
   * Import learning data
   * POST /api/v1/hr/learning/import
   */
  importLearningData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, importType, organizationId } = req.body;

      if (!file || !importType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'File, import type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.learningDevelopmentService.importLearningData(
        file,
        importType,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing learning data',
        error: error.message
      });
    }
  };

  /**
   * Export learning data
   * GET /api/v1/hr/learning/export
   */
  exportLearningData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format,
        dataType,
        organizationId,
        startDate,
        endDate,
        employeeId
      } = req.query;

      if (!format || !dataType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Format, data type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        employeeId: employeeId as UUID
      };

      const result: ServiceResponse<any> = await this.learningDevelopmentService.exportLearningData(
        format as string,
        dataType as string,
        filters
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="learning-${dataType}.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting learning data',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.learningDevelopmentService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Learning & Development service health check failed',
        error: error.message
      });
    }
  };
}
