// Industry 5.0 ERP Backend - Benefits Controller
// Comprehensive benefits management controller matching benefits.routes.ts interface
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { BenefitsAdministrationService } from '../services/benefits-administration.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class BenefitsController {
  private benefitsAdministrationService: BenefitsAdministrationService;

  constructor() {
    this.benefitsAdministrationService = new BenefitsAdministrationService();
  }

  /**
   * Create benefits plan
   * POST /api/v1/hr/benefits/plans
   */
  createPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const planData = req.body;

      if (!planData.name || !planData.organizationId || !planData.category) {
        res.status(400).json({
          success: false,
          message: 'Plan name, organization ID, and category are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.createBenefitsPlan({
        ...planData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating benefits plan',
        error: error.message
      });
    }
  };

  /**
   * Get benefits plans
   * GET /api/v1/hr/benefits/plans
   */
  getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        category,
        type,
        isActive,
        includeEmployeeEligible,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        planType: category as string,
        type: type as string,
        status: isActive === 'true' ? 'active' : undefined
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsPlans(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits plans',
        error: error.message
      });
    }
  };

  /**
   * Get benefits plan by ID
   * GET /api/v1/hr/benefits/plans/:id
   */
  getPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeEnrollments = false, includeAnalytics = false } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Benefits plan ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsPlanById(
        id as UUID,
        includeEnrollments === 'true',
        includeAnalytics === 'true'
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits plan',
        error: error.message
      });
    }
  };

  /**
   * Update benefits plan
   * PUT /api/v1/hr/benefits/plans/:id
   */
  updatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Benefits plan ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.updateBenefitsPlan(
        id as UUID,
        {
          ...updateData,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating benefits plan',
        error: error.message
      });
    }
  };

  /**
   * Enroll in benefits plan
   * POST /api/v1/hr/benefits/enrollments
   */
  enrollInPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollmentData = req.body;

      if (!enrollmentData.planId) {
        res.status(400).json({
          success: false,
          message: 'Plan ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.enrollInBenefitsPlan({
        ...enrollmentData,
        employeeId: enrollmentData.employeeId || req.user?.id,
        enrolledBy: req.user?.id,
        enrollmentDate: enrollmentData.effectiveDate ? new Date(enrollmentData.effectiveDate) : new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enrolling in benefits plan',
        error: error.message
      });
    }
  };

  /**
   * Get benefits enrollments
   * GET /api/v1/hr/benefits/enrollments
   */
  getEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        planId,
        status,
        category,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: (employeeId as UUID) || req.user?.id,
        planId: planId as UUID,
        status: status as string,
        category: category as string
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getEnrollments(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching enrollments',
        error: error.message
      });
    }
  };

  /**
   * Update benefits enrollment
   * PUT /api/v1/hr/benefits/enrollments/:id
   */
  updateEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.updateEnrollment(
        id as UUID,
        {
          ...updateData,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating enrollment',
        error: error.message
      });
    }
  };

  /**
   * Submit benefits claim
   * POST /api/v1/hr/benefits/claims
   */
  submitClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const claimData = req.body;

      if (!claimData.enrollmentId || !claimData.claimType || !claimData.serviceDate) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID, claim type, and service date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.submitClaim({
        ...claimData,
        employeeId: claimData.employeeId || req.user?.id,
        submittedBy: req.user?.id,
        submittedDate: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting claim',
        error: error.message
      });
    }
  };

  /**
   * Get benefits claims
   * GET /api/v1/hr/benefits/claims
   */
  getClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        status,
        claimType,
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: (employeeId as UUID) || req.user?.id,
        status: status as string,
        claimType: claimType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getClaims(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching claims',
        error: error.message
      });
    }
  };

  /**
   * Update claim status
   * PUT /api/v1/hr/benefits/claims/:id/status
   */
  updateClaimStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, approvedAmount, denialReason, processorNotes, paymentDate, checkNumber } = req.body;

      if (!id || !status) {
        res.status(400).json({
          success: false,
          message: 'Claim ID and status are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.updateClaimStatus(
        id as UUID,
        {
          status,
          approvedAmount,
          denialReason,
          processorNotes,
          paymentDate: paymentDate ? new Date(paymentDate) : undefined,
          checkNumber,
          processedBy: req.user?.id,
          processedDate: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating claim status',
        error: error.message
      });
    }
  };

  /**
   * Create open enrollment period
   * POST /api/v1/hr/benefits/open-enrollment
   */
  createOpenEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollmentData = req.body;

      if (!enrollmentData.organizationId || !enrollmentData.name || !enrollmentData.startDate || !enrollmentData.endDate) {
        res.status(400).json({
          success: false,
          message: 'Organization ID, name, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.createOpenEnrollment({
        ...enrollmentData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating open enrollment',
        error: error.message
      });
    }
  };

  /**
   * Get open enrollment periods
   * GET /api/v1/hr/benefits/open-enrollment
   */
  getOpenEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, status, planYear } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        status: status as string,
        planYear: planYear ? parseInt(planYear as string) : undefined
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getOpenEnrollments(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching open enrollments',
        error: error.message
      });
    }
  };

  /**
   * Report qualifying life event
   * POST /api/v1/hr/benefits/life-events
   */
  reportLifeEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventData = req.body;

      if (!eventData.eventType || !eventData.eventDate || !eventData.description) {
        res.status(400).json({
          success: false,
          message: 'Event type, event date, and description are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.reportLifeEvent({
        ...eventData,
        employeeId: eventData.employeeId || req.user?.id,
        reportedBy: req.user?.id,
        reportedDate: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while reporting life event',
        error: error.message
      });
    }
  };

  /**
   * Get life events
   * GET /api/v1/hr/benefits/life-events
   */
  getLifeEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        status,
        eventType,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: (employeeId as UUID) || req.user?.id,
        status: status as string,
        eventType: eventType as string
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getLifeEvents(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching life events',
        error: error.message
      });
    }
  };

  /**
   * Check benefits eligibility for employee
   * GET /api/v1/hr/benefits/eligibility/:employeeId
   */
  checkEligibility = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { planId, effectiveDate } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.checkEligibility(
        employeeId as UUID,
        planId as UUID,
        effectiveDate ? new Date(effectiveDate as string) : new Date()
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while checking eligibility',
        error: error.message
      });
    }
  };

  /**
   * Calculate benefits cost
   * POST /api/v1/hr/benefits/cost-calculation
   */
  calculateCost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, planId, coverageLevel, dependentCount = 0, annualSalary, effectiveDate } = req.body;

      if (!employeeId || !planId || !coverageLevel) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, plan ID, and coverage level are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.calculateCost({
        employeeId,
        planId,
        coverageLevel,
        dependentCount,
        annualSalary,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date()
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while calculating cost',
        error: error.message
      });
    }
  };

  /**
   * Get enrollment analytics
   * GET /api/v1/hr/benefits/analytics/enrollment-summary
   */
  getEnrollmentAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, planYear, category, departmentId } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getEnrollmentAnalytics({
        organizationId: organizationId as UUID,
        planYear: planYear ? parseInt(planYear as string) : undefined,
        category: category as string,
        departmentId: departmentId as UUID
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching enrollment analytics',
        error: error.message
      });
    }
  };

  /**
   * Get benefits cost analysis
   * GET /api/v1/hr/benefits/analytics/cost-analysis
   */
  getCostAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, period = 'year', planYear, includeProjections = false } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getCostAnalysis({
        organizationId: organizationId as UUID,
        period: period as string,
        planYear: planYear ? parseInt(planYear as string) : undefined,
        includeProjections: includeProjections === 'true'
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching cost analysis',
        error: error.message
      });
    }
  };

  /**
   * Generate benefits reports
   * GET /api/v1/hr/benefits/reports/:reportType
   */
  generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportType } = req.params;
      const { organizationId, startDate, endDate, format = 'json' } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.generateReport({
        reportType,
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        format: format as string
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating report',
        error: error.message
      });
    }
  };

  /**
   * Get AI-powered benefits recommendations
   * GET /api/v1/hr/benefits/ai/recommendations
   */
  getAIRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, recommendationType = 'enrollment', includeComparison = true } = req.query;

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getAIRecommendations({
        employeeId: (employeeId as UUID) || req.user?.id,
        recommendationType: recommendationType as string,
        includeComparison: includeComparison === 'true'
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching AI recommendations',
        error: error.message
      });
    }
  };

  /**
   * Get AI-powered plan comparison
   * GET /api/v1/hr/benefits/ai/plan-comparison
   */
  getAIPlanComparison = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, planIds, scenarios } = req.query;

      if (!planIds) {
        res.status(400).json({
          success: false,
          message: 'Plan IDs are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const planIdArray = (planIds as string).split(',');

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getAIPlanComparison({
        employeeId: (employeeId as UUID) || req.user?.id,
        planIds: planIdArray,
        scenarios: scenarios ? (scenarios as string).split(',') : []
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching plan comparison',
        error: error.message
      });
    }
  };

  /**
   * Health check endpoint
   * GET /api/v1/hr/benefits/health
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          service: 'Benefits Controller',
          status: 'healthy',
          features: {
            planManagement: 'operational',
            enrollment: 'operational',
            claimsProcessing: 'operational',
            analytics: 'operational',
            aiRecommendations: 'operational'
          },
          timestamp: new Date().toISOString()
        },
        message: 'Benefits Controller is fully operational'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Benefits Controller health check failed',
        message: 'Service health check failed',
        status: 500
      });
    }
  };
}
