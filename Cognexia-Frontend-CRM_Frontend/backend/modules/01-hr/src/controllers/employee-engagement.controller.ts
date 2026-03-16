// Industry 5.0 ERP Backend - Employee Engagement Controller
// AI-powered engagement with pulse surveys, sentiment analysis, wellness programs, recognition systems, and predictive analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { EmployeeEngagementService } from '../services/employee-engagement.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class EmployeeEngagementController {
  private employeeEngagementService: EmployeeEngagementService;

  constructor() {
    this.employeeEngagementService = new EmployeeEngagementService();
  }

  /**
   * Create engagement survey
   * POST /api/v1/hr/engagement/surveys
   */
  createSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
      const surveyData = req.body;

      if (!surveyData.title || !surveyData.organizationId || !surveyData.questions?.length) {
        res.status(400).json({
          success: false,
          message: 'Survey title, organization ID, and questions are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createSurvey({
        ...surveyData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating survey',
        error: error.message
      });
    }
  };

  /**
   * Get surveys
   * GET /api/v1/hr/engagement/surveys
   */
  getSurveys = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        type,
        status,
        departmentId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        type: type as string,
        status: status as string,
        departmentId: departmentId as UUID
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getSurveys(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching surveys',
        error: error.message
      });
    }
  };

  /**
   * Get survey by ID
   * GET /api/v1/hr/engagement/surveys/:id
   */
  getSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeResponses = false, includeAnalytics = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Survey ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.getSurveyById(
        id as UUID,
        includeResponses === 'true',
        includeAnalytics === 'true'
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching survey',
        error: error.message
      });
    }
  };

  /**
   * Launch survey
   * POST /api/v1/hr/engagement/surveys/:id/launch
   */
  launchSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { targetEmployees, launchDate, reminderSchedule } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Survey ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.launchSurvey(
        id as UUID,
        {
          targetEmployees,
          launchDate: launchDate ? new Date(launchDate) : new Date(),
          reminderSchedule,
          launchedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while launching survey',
        error: error.message
      });
    }
  };

  /**
   * Submit survey response
   * POST /api/v1/hr/engagement/surveys/:id/responses
   */
  submitSurveyResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, answers, anonymous = false } = req.body;

      if (!id || !answers || !Array.isArray(answers)) {
        res.status(400).json({
          success: false,
          message: 'Survey ID and answers are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.employeeEngagementService.submitSurveyResponse(
        id as UUID,
        {
          employeeId: anonymous ? null : finalEmployeeId,
          answers,
          anonymous,
          submittedAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting survey response',
        error: error.message
      });
    }
  };

  /**
   * Get survey responses
   * GET /api/v1/hr/engagement/surveys/:id/responses
   */
  getSurveyResponses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { departmentId, employeeId, includeAnonymous = true, limit = 50, offset = 0 } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Survey ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        departmentId: departmentId as UUID,
        employeeId: employeeId as UUID,
        includeAnonymous: includeAnonymous === 'true'
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getSurveyResponses(
        id as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching survey responses',
        error: error.message
      });
    }
  };

  /**
   * Get survey analytics
   * GET /api/v1/hr/engagement/surveys/:id/analytics
   */
  getSurveyAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { analyticsType = 'comprehensive', segmentBy } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Survey ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.getSurveyAnalytics(
        id as UUID,
        analyticsType as string,
        segmentBy as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching survey analytics',
        error: error.message
      });
    }
  };

  /**
   * Create pulse survey
   * POST /api/v1/hr/engagement/pulse-surveys
   */
  createPulseSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
      const pulseSurveyData = req.body;

      if (!pulseSurveyData.organizationId || !pulseSurveyData.frequency) {
        res.status(400).json({
          success: false,
          message: 'Organization ID and frequency are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createPulseSurvey({
        ...pulseSurveyData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating pulse survey',
        error: error.message
      });
    }
  };

  /**
   * Get pulse survey results
   * GET /api/v1/hr/engagement/pulse-surveys/:id/results
   */
  getPulseSurveyResults = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate, departmentId, trendAnalysis = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Pulse survey ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        departmentId: departmentId as UUID,
        trendAnalysis: trendAnalysis === 'true'
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getPulseSurveyResults(
        id as UUID,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching pulse survey results',
        error: error.message
      });
    }
  };

  /**
   * Submit feedback
   * POST /api/v1/hr/engagement/feedback
   */
  submitFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const feedbackData = req.body;

      if (!feedbackData.type || !feedbackData.content) {
        res.status(400).json({
          success: false,
          message: 'Feedback type and content are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.submitFeedback({
        ...feedbackData,
        submittedBy: feedbackData.anonymous ? null : (feedbackData.employeeId || req.user?.id),
        submittedAt: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting feedback',
        error: error.message
      });
    }
  };

  /**
   * Get feedback
   * GET /api/v1/hr/engagement/feedback
   */
  getFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        type,
        status,
        departmentId,
        sentimentFilter,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        type: type as string,
        status: status as string,
        departmentId: departmentId as UUID,
        sentimentFilter: sentimentFilter as string
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getFeedback(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching feedback',
        error: error.message
      });
    }
  };

  /**
   * Create recognition program
   * POST /api/v1/hr/engagement/recognition-programs
   */
  createRecognitionProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      const programData = req.body;

      if (!programData.name || !programData.organizationId || !programData.criteria) {
        res.status(400).json({
          success: false,
          message: 'Program name, organization ID, and criteria are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createRecognitionProgram({
        ...programData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating recognition program',
        error: error.message
      });
    }
  };

  /**
   * Nominate employee for recognition
   * POST /api/v1/hr/engagement/recognition-programs/:id/nominations
   */
  nominateForRecognition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nomineeId, reason, supportingData } = req.body;

      if (!id || !nomineeId || !reason) {
        res.status(400).json({
          success: false,
          message: 'Program ID, nominee ID, and reason are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.nominateForRecognition(
        id as UUID,
        {
          nomineeId: nomineeId as UUID,
          nominatedBy: req.user?.id as UUID,
          reason,
          supportingData,
          nominatedAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while nominating for recognition',
        error: error.message
      });
    }
  };

  /**
   * Get recognition nominations
   * GET /api/v1/hr/engagement/recognition-programs/:id/nominations
   */
  getRecognitionNominations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, departmentId, limit = 20, offset = 0 } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Program ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        status: status as string,
        departmentId: departmentId as UUID
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getRecognitionNominations(
        id as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching recognition nominations',
        error: error.message
      });
    }
  };

  /**
   * Award recognition
   * POST /api/v1/hr/engagement/recognition-programs/:programId/nominations/:nominationId/award
   */
  awardRecognition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { programId, nominationId } = req.params;
      const { awardLevel, reward, publicAnnouncement = true, comments } = req.body;

      if (!programId || !nominationId) {
        res.status(400).json({
          success: false,
          message: 'Program ID and nomination ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.awardRecognition(
        programId as UUID,
        nominationId as UUID,
        {
          awardLevel,
          reward,
          publicAnnouncement,
          comments,
          awardedBy: req.user?.id,
          awardedAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while awarding recognition',
        error: error.message
      });
    }
  };

  /**
   * Create wellness program
   * POST /api/v1/hr/engagement/wellness-programs
   */
  createWellnessProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      const programData = req.body;

      if (!programData.name || !programData.organizationId || !programData.type) {
        res.status(400).json({
          success: false,
          message: 'Program name, organization ID, and type are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createWellnessProgram({
        ...programData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating wellness program',
        error: error.message
      });
    }
  };

  /**
   * Enroll in wellness program
   * POST /api/v1/hr/engagement/wellness-programs/:id/enroll
   */
  enrollInWellnessProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, goals, preferences } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Wellness program ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.employeeEngagementService.enrollInWellnessProgram(
        finalEmployeeId as UUID,
        id as UUID,
        {
          goals,
          preferences,
          enrolledAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enrolling in wellness program',
        error: error.message
      });
    }
  };

  /**
   * Track wellness activity
   * POST /api/v1/hr/engagement/wellness-programs/:id/activities
   */
  trackWellnessActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, activityType, duration, metrics, notes } = req.body;

      if (!id || !activityType) {
        res.status(400).json({
          success: false,
          message: 'Wellness program ID and activity type are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.employeeEngagementService.trackWellnessActivity(
        finalEmployeeId as UUID,
        id as UUID,
        {
          activityType,
          duration,
          metrics,
          notes,
          recordedAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while tracking wellness activity',
        error: error.message
      });
    }
  };

  /**
   * Get wellness program stats
   * GET /api/v1/hr/engagement/wellness-programs/:id/stats
   */
  getWellnessProgramStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, period = '30d', includeComparison = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Wellness program ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions for individual employee stats
      if (employeeId && req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:engagement:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access wellness stats',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.getWellnessProgramStats(
        id as UUID,
        employeeId as UUID,
        period as string,
        includeComparison === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching wellness program stats',
        error: error.message
      });
    }
  };

  /**
   * Get engagement metrics
   * GET /api/v1/hr/engagement/metrics
   */
  getEngagementMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        employeeId,
        period = '3m',
        metricTypes
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
        period: period as string,
        metricTypes: metricTypes ? (metricTypes as string).split(',') : undefined
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getEngagementMetrics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching engagement metrics',
        error: error.message
      });
    }
  };

  /**
   * Get sentiment analysis
   * GET /api/v1/hr/engagement/sentiment-analysis
   */
  getSentimentAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        analysisType = 'comprehensive',
        includeKeywords = true
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
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        analysisType: analysisType as string,
        includeKeywords: includeKeywords === 'true'
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getSentimentAnalysis(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while performing sentiment analysis',
        error: error.message
      });
    }
  };

  /**
   * Predict engagement risks
   * GET /api/v1/hr/engagement/ai/predict-risks
   */
  predictEngagementRisks = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        employeeId,
        riskTypes,
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

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        employeeId: employeeId as UUID,
        riskTypes: riskTypes ? (riskTypes as string).split(',') : undefined,
        timeFrame: timeFrame as string
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.predictEngagementRisks(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while predicting engagement risks',
        error: error.message
      });
    }
  };

  /**
   * Get engagement recommendations
   * GET /api/v1/hr/engagement/ai/recommendations
   */
  getEngagementRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        employeeId,
        basedOn = 'comprehensive',
        limit = 10
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
        basedOn: basedOn as string
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getEngagementRecommendations(
        filters,
        parseInt(limit as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching engagement recommendations',
        error: error.message
      });
    }
  };

  /**
   * Create engagement action plan
   * POST /api/v1/hr/engagement/action-plans
   */
  createEngagementActionPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const actionPlanData = req.body;

      if (!actionPlanData.title || !actionPlanData.organizationId || !actionPlanData.objectives?.length) {
        res.status(400).json({
          success: false,
          message: 'Action plan title, organization ID, and objectives are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createEngagementActionPlan({
        ...actionPlanData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating engagement action plan',
        error: error.message
      });
    }
  };

  /**
   * Track action plan progress
   * PUT /api/v1/hr/engagement/action-plans/:id/progress
   */
  trackActionPlanProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { completedObjectives, progress, metrics, notes } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Action plan ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.trackActionPlanProgress(
        id as UUID,
        {
          completedObjectives,
          progress,
          metrics,
          notes,
          updatedBy: req.user?.id,
          updatedAt: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while tracking action plan progress',
        error: error.message
      });
    }
  };

  /**
   * Generate engagement reports
   * GET /api/v1/hr/engagement/reports/:reportType
   */
  generateEngagementReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportType } = req.params;
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        format = 'json',
        includeComparisons = true
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
        format: format as string,
        includeComparisons: includeComparisons === 'true'
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.generateEngagementReport(
        reportType,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating engagement report',
        error: error.message
      });
    }
  };

  /**
   * Get engagement dashboard
   * GET /api/v1/hr/engagement/dashboard
   */
  getEngagementDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        employeeId,
        period = '3m',
        widgets
      } = req.query;

      if (!organizationId && !employeeId) {
        res.status(400).json({
          success: false,
          message: 'Either organization ID or employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions for individual employee dashboard
      if (employeeId && req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:engagement:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access engagement dashboard',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        employeeId: employeeId as UUID,
        period: period as string,
        widgets: widgets ? (widgets as string).split(',') : undefined
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.getEngagementDashboard(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching engagement dashboard',
        error: error.message
      });
    }
  };

  /**
   * Create team building activity
   * POST /api/v1/hr/engagement/team-building
   */
  createTeamBuildingActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const activityData = req.body;

      if (!activityData.name || !activityData.organizationId || !activityData.scheduledDate) {
        res.status(400).json({
          success: false,
          message: 'Activity name, organization ID, and scheduled date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeEngagementService.createTeamBuildingActivity({
        ...activityData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating team building activity',
        error: error.message
      });
    }
  };

  /**
   * RSVP to team building activity
   * POST /api/v1/hr/engagement/team-building/:id/rsvp
   */
  rsvpTeamBuildingActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeId, response, dietaryRequirements, notes } = req.body;

      if (!id || !response) {
        res.status(400).json({
          success: false,
          message: 'Activity ID and response are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.employeeEngagementService.rsvpTeamBuildingActivity(
        finalEmployeeId as UUID,
        id as UUID,
        {
          response,
          dietaryRequirements,
          notes,
          respondedAt: new Date()
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while RSVPing to team building activity',
        error: error.message
      });
    }
  };

  /**
   * Import engagement data
   * POST /api/v1/hr/engagement/import
   */
  importEngagementData = async (req: Request, res: Response): Promise<void> => {
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

      const result: ServiceResponse<any> = await this.employeeEngagementService.importEngagementData(
        file,
        importType,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing engagement data',
        error: error.message
      });
    }
  };

  /**
   * Export engagement data
   * GET /api/v1/hr/engagement/export
   */
  exportEngagementData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format,
        dataType,
        organizationId,
        startDate,
        endDate,
        departmentId
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
        departmentId: departmentId as UUID
      };

      const result: ServiceResponse<any> = await this.employeeEngagementService.exportEngagementData(
        format as string,
        dataType as string,
        filters
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="engagement-${dataType}.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting engagement data',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.employeeEngagementService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Employee Engagement service health check failed',
        error: error.message
      });
    }
  };
}
