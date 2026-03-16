// Industry 5.0 ERP Backend - Benefits Administration Controller
// Comprehensive benefits management with AI-powered recommendations, enrollment automation, and predictive analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { BenefitsAdministrationService } from '../services/benefits-administration.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class BenefitsAdministrationController {
  private benefitsAdministrationService: BenefitsAdministrationService;

  constructor() {
    this.benefitsAdministrationService = new BenefitsAdministrationService();
  }

  /**
   * Create benefits plan
   * POST /api/v1/hr/benefits/plans
   */
  createBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const planData = req.body;

      if (!planData.name || !planData.organizationId || !planData.planType || !planData.provider) {
        res.status(400).json({
          success: false,
          message: 'Plan name, organization ID, plan type, and provider are required',
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
  getBenefitsPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        planType,
        status,
        providerId,
        eligibleEmployeeId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        planType: planType as string,
        status: status as string,
        providerId: providerId as UUID,
        eligibleEmployeeId: eligibleEmployeeId as UUID
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
  getBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeDetails = true, includeEnrollments = false } = req.query;

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
        includeDetails === 'true',
        includeEnrollments === 'true'
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
  updateBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
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
   * Enroll employee in benefits plan
   * POST /api/v1/hr/benefits/enrollments
   */
  enrollInBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollmentData = req.body;

      if (!enrollmentData.employeeId || !enrollmentData.planId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and plan ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.enrollInBenefitsPlan({
        ...enrollmentData,
        enrolledBy: req.user?.id,
        enrollmentDate: enrollmentData.enrollmentDate ? new Date(enrollmentData.enrollmentDate) : new Date()
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
   * Get employee enrollments
   * GET /api/v1/hr/benefits/enrollments
   */
  getEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        planId,
        planType,
        status,
        effectiveDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        planId: planId as UUID,
        planType: planType as string,
        status: status as string,
        effectiveDate: effectiveDate ? new Date(effectiveDate as string) : undefined
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
   * Update enrollment
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
   * Terminate enrollment
   * POST /api/v1/hr/benefits/enrollments/:id/terminate
   */
  terminateEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { terminationDate, reason, notes } = req.body;

      if (!id || !terminationDate || !reason) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID, termination date, and reason are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.terminateEnrollment(
        id as UUID,
        {
          terminationDate: new Date(terminationDate),
          reason,
          notes,
          terminatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while terminating enrollment',
        error: error.message
      });
    }
  };

  /**
   * Add dependents
   * POST /api/v1/hr/benefits/enrollments/:id/dependents
   */
  addDependents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { dependents } = req.body;

      if (!id || !dependents || !Array.isArray(dependents)) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID and dependents array are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.addDependents(
        id as UUID,
        dependents,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding dependents',
        error: error.message
      });
    }
  };

  /**
   * Remove dependent
   * DELETE /api/v1/hr/benefits/enrollments/:enrollmentId/dependents/:dependentId
   */
  removeDependent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enrollmentId, dependentId } = req.params;
      const { removalDate, reason } = req.body;

      if (!enrollmentId || !dependentId) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID and dependent ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.removeDependent(
        enrollmentId as UUID,
        dependentId as UUID,
        {
          removalDate: removalDate ? new Date(removalDate) : new Date(),
          reason,
          removedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing dependent',
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

      if (!claimData.enrollmentId || !claimData.claimType || !claimData.amount) {
        res.status(400).json({
          success: false,
          message: 'Enrollment ID, claim type, and amount are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.submitClaim({
        ...claimData,
        submittedBy: claimData.submittedBy || req.user?.id,
        submissionDate: new Date(),
        serviceDate: claimData.serviceDate ? new Date(claimData.serviceDate) : new Date()
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
   * Get claims
   * GET /api/v1/hr/benefits/claims
   */
  getClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        enrollmentId,
        claimType,
        status,
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        enrollmentId: enrollmentId as UUID,
        claimType: claimType as string,
        status: status as string,
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
   * Get claim by ID
   * GET /api/v1/hr/benefits/claims/:id
   */
  getClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeDocuments = true, includeHistory = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Claim ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getClaimById(
        id as UUID,
        includeDocuments === 'true',
        includeHistory === 'true'
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching claim',
        error: error.message
      });
    }
  };

  /**
   * Process claim
   * POST /api/v1/hr/benefits/claims/:id/process
   */
  processClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, approvedAmount, denialReason, notes, reviewerComments } = req.body;

      if (!id || !action) {
        res.status(400).json({
          success: false,
          message: 'Claim ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      if (action === 'deny' && !denialReason) {
        res.status(400).json({
          success: false,
          message: 'Denial reason is required when denying a claim',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.processClaim(
        id as UUID,
        {
          action,
          approvedAmount,
          denialReason,
          notes,
          reviewerComments,
          processedBy: req.user?.id,
          processedDate: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing claim',
        error: error.message
      });
    }
  };

  /**
   * Add claim documents
   * POST /api/v1/hr/benefits/claims/:id/documents
   */
  addClaimDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { documents } = req.body;

      if (!id || !documents || !Array.isArray(documents)) {
        res.status(400).json({
          success: false,
          message: 'Claim ID and documents array are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.addClaimDocuments(
        id as UUID,
        documents,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding claim documents',
        error: error.message
      });
    }
  };

  /**
   * Create benefits provider
   * POST /api/v1/hr/benefits/providers
   */
  createBenefitsProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const providerData = req.body;

      if (!providerData.name || !providerData.organizationId || !providerData.providerType) {
        res.status(400).json({
          success: false,
          message: 'Provider name, organization ID, and provider type are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.createBenefitsProvider({
        ...providerData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating benefits provider',
        error: error.message
      });
    }
  };

  /**
   * Get benefits providers
   * GET /api/v1/hr/benefits/providers
   */
  getBenefitsProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        providerType,
        status,
        includeContracts = false,
        limit = 20,
        offset = 0
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
        providerType: providerType as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsProviders(
        filters,
        includeContracts === 'true',
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits providers',
        error: error.message
      });
    }
  };

  /**
   * Update provider contract
   * PUT /api/v1/hr/benefits/providers/:id/contract
   */
  updateProviderContract = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const contractData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Provider ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.updateProviderContract(
        id as UUID,
        {
          ...contractData,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating provider contract',
        error: error.message
      });
    }
  };

  /**
   * Get benefits eligibility
   * GET /api/v1/hr/benefits/eligibility/:employeeId
   */
  getBenefitsEligibility = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { planType, asOfDate } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsEligibility(
        employeeId as UUID,
        planType as string,
        asOfDate ? new Date(asOfDate as string) : new Date()
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while checking benefits eligibility',
        error: error.message
      });
    }
  };

  /**
   * Calculate benefits costs
   * GET /api/v1/hr/benefits/costs/calculate
   */
  calculateBenefitsCosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        planIds,
        dependentCount,
        effectiveDate,
        coverageOptions
      } = req.query;

      if (!employeeId || !planIds) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and plan IDs are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const planIdArray = (planIds as string).split(',');
      const result: ServiceResponse<any> = await this.benefitsAdministrationService.calculateBenefitsCosts({
        employeeId: employeeId as UUID,
        planIds: planIdArray,
        dependentCount: dependentCount ? parseInt(dependentCount as string) : 0,
        effectiveDate: effectiveDate ? new Date(effectiveDate as string) : new Date(),
        coverageOptions: coverageOptions ? JSON.parse(coverageOptions as string) : {}
      });

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while calculating benefits costs',
        error: error.message
      });
    }
  };

  /**
   * Open enrollment period management
   * POST /api/v1/hr/benefits/open-enrollment
   */
  createOpenEnrollmentPeriod = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollmentPeriodData = req.body;

      if (!enrollmentPeriodData.organizationId || !enrollmentPeriodData.planYear || !enrollmentPeriodData.startDate || !enrollmentPeriodData.endDate) {
        res.status(400).json({
          success: false,
          message: 'Organization ID, plan year, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.createOpenEnrollmentPeriod({
        ...enrollmentPeriodData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating open enrollment period',
        error: error.message
      });
    }
  };

  /**
   * Get open enrollment periods
   * GET /api/v1/hr/benefits/open-enrollment
   */
  getOpenEnrollmentPeriods = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        planYear,
        status,
        current = false,
        limit = 10,
        offset = 0
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
        planYear: planYear ? parseInt(planYear as string) : undefined,
        status: status as string,
        current: current === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getOpenEnrollmentPeriods(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching open enrollment periods',
        error: error.message
      });
    }
  };

  /**
   * Process life events
   * POST /api/v1/hr/benefits/life-events
   */
  processLifeEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const lifeEventData = req.body;

      if (!lifeEventData.employeeId || !lifeEventData.eventType || !lifeEventData.eventDate) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, event type, and event date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.processLifeEvent({
        ...lifeEventData,
        eventDate: new Date(lifeEventData.eventDate),
        reportedBy: req.user?.id,
        reportedDate: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing life event',
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
        eventType,
        status,
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        eventType: eventType as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
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
   * Get benefits utilization analytics
   * GET /api/v1/hr/benefits/analytics/utilization
   */
  getBenefitsUtilizationAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        planType,
        startDate,
        endDate,
        segmentBy,
        includeComparisons = true
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
        planType: planType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        segmentBy: segmentBy as string,
        includeComparisons: includeComparisons === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsUtilizationAnalytics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits utilization analytics',
        error: error.message
      });
    }
  };

  /**
   * Get benefits cost analytics
   * GET /api/v1/hr/benefits/analytics/costs
   */
  getBenefitsCostAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        planYear,
        costType,
        trendAnalysis = true,
        forecastPeriods = 12
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
        planYear: planYear ? parseInt(planYear as string) : undefined,
        costType: costType as string,
        trendAnalysis: trendAnalysis === 'true',
        forecastPeriods: parseInt(forecastPeriods as string)
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsCostAnalytics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits cost analytics',
        error: error.message
      });
    }
  };

  /**
   * AI-powered benefits recommendations
   * GET /api/v1/hr/benefits/ai/recommendations
   */
  getBenefitsRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        organizationId,
        recommendationType = 'comprehensive',
        includePersonalizedOptions = true,
        limit = 10
      } = req.query;

      if (!employeeId && !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Either employee ID or organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        employeeId: employeeId as UUID,
        organizationId: organizationId as UUID,
        recommendationType: recommendationType as string,
        includePersonalizedOptions: includePersonalizedOptions === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsRecommendations(
        filters,
        parseInt(limit as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits recommendations',
        error: error.message
      });
    }
  };

  /**
   * Predict benefits trends
   * GET /api/v1/hr/benefits/ai/trends
   */
  predictBenefitsTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        trendType,
        timeframe = '12m',
        includeScenarios = true
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
        trendType: trendType as string,
        timeframe: timeframe as string,
        includeScenarios: includeScenarios === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.predictBenefitsTrends(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while predicting benefits trends',
        error: error.message
      });
    }
  };

  /**
   * Generate benefits reports
   * GET /api/v1/hr/benefits/reports/:reportType
   */
  generateBenefitsReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportType } = req.params;
      const {
        organizationId,
        planYear,
        format = 'json',
        includeCharts = true,
        includeDetails = true
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
        planYear: planYear ? parseInt(planYear as string) : undefined,
        format: format as string,
        includeCharts: includeCharts === 'true',
        includeDetails: includeDetails === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.generateBenefitsReport(
        reportType,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating benefits report',
        error: error.message
      });
    }
  };

  /**
   * Get benefits dashboard
   * GET /api/v1/hr/benefits/dashboard
   */
  getBenefitsDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        employeeId,
        planYear,
        widgets,
        refreshCache = false
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
      if (employeeId && req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:benefits:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access benefits dashboard',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        employeeId: employeeId as UUID,
        planYear: planYear ? parseInt(planYear as string) : undefined,
        widgets: widgets ? (widgets as string).split(',') : undefined,
        refreshCache: refreshCache === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.getBenefitsDashboard(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits dashboard',
        error: error.message
      });
    }
  };

  /**
   * Import benefits data
   * POST /api/v1/hr/benefits/import
   */
  importBenefitsData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, importType, organizationId, options } = req.body;

      if (!file || !importType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'File, import type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.importBenefitsData(
        file,
        importType,
        organizationId as UUID,
        options || {},
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing benefits data',
        error: error.message
      });
    }
  };

  /**
   * Export benefits data
   * GET /api/v1/hr/benefits/export
   */
  exportBenefitsData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format,
        dataType,
        organizationId,
        planYear,
        includePersonalData = false
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
        planYear: planYear ? parseInt(planYear as string) : undefined,
        includePersonalData: includePersonalData === 'true'
      };

      const result: ServiceResponse<any> = await this.benefitsAdministrationService.exportBenefitsData(
        format as string,
        dataType as string,
        filters
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="benefits-${dataType}.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting benefits data',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.benefitsAdministrationService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Benefits Administration service health check failed',
        error: error.message
      });
    }
  };
}
