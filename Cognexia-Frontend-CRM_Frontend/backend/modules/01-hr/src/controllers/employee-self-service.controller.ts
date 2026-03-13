// Industry 5.0 ERP Backend - Employee Self-Service Controller
// Comprehensive employee portal with AI-powered assistance, document management, and self-service capabilities
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { EmployeeSelfServiceService } from '../services/employee-self-service.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class EmployeeSelfServiceController {
  private employeeSelfServiceService: EmployeeSelfServiceService;

  constructor() {
    this.employeeSelfServiceService = new EmployeeSelfServiceService();
  }

  /**
   * Get employee profile
   * GET /api/v1/hr/self-service/profile
   */
  getEmployeeProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:employees:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access employee profile',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getEmployeeProfile(
        finalEmployeeId as UUID
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee profile',
        error: error.message
      });
    }
  };

  /**
   * Update employee profile
   * PUT /api/v1/hr/self-service/profile
   */
  updateEmployeeProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;
      const updateData = req.body;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:employees:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to update employee profile',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.updateEmployeeProfile(
        finalEmployeeId as UUID,
        {
          ...updateData,
          updatedBy: req.user?.id
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating employee profile',
        error: error.message
      });
    }
  };

  /**
   * Get personal documents
   * GET /api/v1/hr/self-service/documents
   */
  getPersonalDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, documentType, category, limit = 20, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:documents:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access personal documents',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        documentType: documentType as string,
        category: category as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getPersonalDocuments(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching personal documents',
        error: error.message
      });
    }
  };

  /**
   * Upload personal document
   * POST /api/v1/hr/self-service/documents
   */
  uploadPersonalDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const documentData = req.body;
      const employeeId = documentData.employeeId || req.user?.id;

      if (!employeeId || !documentData.name || !documentData.type || !documentData.fileUrl) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, document name, type, and file URL are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:documents:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to upload personal document',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.uploadPersonalDocument({
        ...documentData,
        employeeId: employeeId as UUID,
        uploadedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while uploading personal document',
        error: error.message
      });
    }
  };

  /**
   * Request time off
   * POST /api/v1/hr/self-service/time-off
   */
  requestTimeOff = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestData = req.body;
      const employeeId = requestData.employeeId || req.user?.id;

      if (!employeeId || !requestData.type || !requestData.startDate || !requestData.endDate) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, type, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:time-off:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to request time off',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.requestTimeOff({
        ...requestData,
        employeeId: employeeId as UUID,
        requestedBy: req.user?.id,
        requestDate: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while requesting time off',
        error: error.message
      });
    }
  };

  /**
   * Get time off requests
   * GET /api/v1/hr/self-service/time-off
   */
  getTimeOffRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, status, startDate, endDate, limit = 20, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:time-off:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view time off requests',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getTimeOffRequests(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching time off requests',
        error: error.message
      });
    }
  };

  /**
   * Cancel time off request
   * DELETE /api/v1/hr/self-service/time-off/:id
   */
  cancelTimeOffRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Request ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.cancelTimeOffRequest(
        id as UUID,
        {
          reason,
          cancelledBy: req.user?.id,
          cancelledAt: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while cancelling time off request',
        error: error.message
      });
    }
  };

  /**
   * Get pay stubs
   * GET /api/v1/hr/self-service/pay-stubs
   */
  getPayStubs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, year, payPeriod, limit = 12, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view pay stubs',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        year: year ? parseInt(year as string) : undefined,
        payPeriod: payPeriod as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getPayStubs(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching pay stubs',
        error: error.message
      });
    }
  };

  /**
   * Get tax documents
   * GET /api/v1/hr/self-service/tax-documents
   */
  getTaxDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, taxYear, documentType } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view tax documents',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        taxYear: taxYear ? parseInt(taxYear as string) : undefined,
        documentType: documentType as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getTaxDocuments(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching tax documents',
        error: error.message
      });
    }
  };

  /**
   * Update emergency contacts
   * PUT /api/v1/hr/self-service/emergency-contacts
   */
  updateEmergencyContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, contacts } = req.body;
      const finalEmployeeId = employeeId || req.user?.id;

      if (!finalEmployeeId || !contacts || !Array.isArray(contacts)) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and contacts array are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:employees:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to update emergency contacts',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.updateEmergencyContacts(
        finalEmployeeId as UUID,
        contacts,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating emergency contacts',
        error: error.message
      });
    }
  };

  /**
   * Get benefits summary
   * GET /api/v1/hr/self-service/benefits
   */
  getBenefitsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, planYear } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:benefits:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view benefits summary',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getBenefitsSummary(
        finalEmployeeId as UUID,
        planYear ? parseInt(planYear as string) : undefined
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching benefits summary',
        error: error.message
      });
    }
  };

  /**
   * Get time and attendance summary
   * GET /api/v1/hr/self-service/time-attendance
   */
  getTimeAttendanceSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, startDate, endDate, includeDetails = false } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view time and attendance summary',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeDetails: includeDetails === 'true'
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getTimeAttendanceSummary(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching time and attendance summary',
        error: error.message
      });
    }
  };

  /**
   * Clock in/out
   * POST /api/v1/hr/self-service/time-clock
   */
  clockInOut = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, action, location, notes } = req.body;
      const finalEmployeeId = employeeId || req.user?.id;

      if (!finalEmployeeId || !action) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:attendance:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to clock in/out',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.clockInOut({
        employeeId: finalEmployeeId as UUID,
        action,
        timestamp: new Date(),
        location,
        notes,
        recordedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing clock in/out',
        error: error.message
      });
    }
  };

  /**
   * Submit performance self-assessment
   * POST /api/v1/hr/self-service/performance/self-assessment
   */
  submitSelfAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
      const assessmentData = req.body;
      const employeeId = assessmentData.employeeId || req.user?.id;

      if (!employeeId || !assessmentData.reviewPeriodId || !assessmentData.responses) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, review period ID, and responses are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:performance:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to submit self-assessment',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.submitSelfAssessment({
        ...assessmentData,
        employeeId: employeeId as UUID,
        submittedBy: req.user?.id,
        submittedAt: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting self-assessment',
        error: error.message
      });
    }
  };

  /**
   * Get performance history
   * GET /api/v1/hr/self-service/performance/history
   */
  getPerformanceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, year, reviewType, limit = 10, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:performance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view performance history',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        year: year ? parseInt(year as string) : undefined,
        reviewType: reviewType as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getPerformanceHistory(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching performance history',
        error: error.message
      });
    }
  };

  /**
   * Get learning and development opportunities
   * GET /api/v1/hr/self-service/learning
   */
  getLearningOpportunities = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, category, skillArea, limit = 20, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:learning:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view learning opportunities',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        category: category as string,
        skillArea: skillArea as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getLearningOpportunities(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching learning opportunities',
        error: error.message
      });
    }
  };

  /**
   * Enroll in training course
   * POST /api/v1/hr/self-service/learning/enroll
   */
  enrollInTraining = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, employeeId, expectedCompletionDate } = req.body;
      const finalEmployeeId = employeeId || req.user?.id;

      if (!courseId || !finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Course ID and employee ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:learning:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to enroll in training',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.enrollInTraining({
        courseId: courseId as UUID,
        employeeId: finalEmployeeId as UUID,
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
        enrolledBy: req.user?.id,
        enrollmentDate: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while enrolling in training',
        error: error.message
      });
    }
  };

  /**
   * Get personal analytics dashboard
   * GET /api/v1/hr/self-service/analytics
   */
  getPersonalAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, period = '1y', widgets } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:analytics:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view personal analytics',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        period: period as string,
        widgets: widgets ? (widgets as string).split(',') : undefined
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getPersonalAnalytics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching personal analytics',
        error: error.message
      });
    }
  };

  /**
   * Submit help desk ticket
   * POST /api/v1/hr/self-service/support/ticket
   */
  submitSupportTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const ticketData = req.body;
      const employeeId = ticketData.employeeId || req.user?.id;

      if (!employeeId || !ticketData.subject || !ticketData.description || !ticketData.category) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, subject, description, and category are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.submitSupportTicket({
        ...ticketData,
        employeeId: employeeId as UUID,
        submittedBy: req.user?.id,
        submittedAt: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting support ticket',
        error: error.message
      });
    }
  };

  /**
   * Get support tickets
   * GET /api/v1/hr/self-service/support/tickets
   */
  getSupportTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, status, category, limit = 20, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:support:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view support tickets',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        status: status as string,
        category: category as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getSupportTickets(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching support tickets',
        error: error.message
      });
    }
  };

  /**
   * Get AI-powered recommendations
   * GET /api/v1/hr/self-service/ai/recommendations
   */
  getPersonalRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, category, limit = 10 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:recommendations:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view personal recommendations',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        category: category as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getPersonalRecommendations(
        filters,
        parseInt(limit as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching personal recommendations',
        error: error.message
      });
    }
  };

  /**
   * Get career development suggestions
   * GET /api/v1/hr/self-service/career/suggestions
   */
  getCareerDevelopmentSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, focusArea } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:career:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view career development suggestions',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getCareerDevelopmentSuggestions(
        finalEmployeeId as UUID,
        focusArea as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching career development suggestions',
        error: error.message
      });
    }
  };

  /**
   * Get company directory
   * GET /api/v1/hr/self-service/directory
   */
  getCompanyDirectory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { searchTerm, department, location, limit = 50, offset = 0 } = req.query;

      const filters = {
        searchTerm: searchTerm as string,
        department: department as string,
        location: location as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getCompanyDirectory(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching company directory',
        error: error.message
      });
    }
  };

  /**
   * Get notifications
   * GET /api/v1/hr/self-service/notifications
   */
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, type, status, limit = 20, offset = 0 } = req.query;
      const finalEmployeeId = (employeeId as UUID) || req.user?.id;

      if (!finalEmployeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:notifications:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to view notifications',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        employeeId: finalEmployeeId as UUID,
        type: type as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.getNotifications(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching notifications',
        error: error.message
      });
    }
  };

  /**
   * Mark notification as read
   * PUT /api/v1/hr/self-service/notifications/:id/read
   */
  markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.markNotificationRead(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while marking notification as read',
        error: error.message
      });
    }
  };

  /**
   * Update notification preferences
   * PUT /api/v1/hr/self-service/notification-preferences
   */
  updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, preferences } = req.body;
      const finalEmployeeId = employeeId || req.user?.id;

      if (!finalEmployeeId || !preferences) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and preferences are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:preferences:write')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to update notification preferences',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.employeeSelfServiceService.updateNotificationPreferences(
        finalEmployeeId as UUID,
        preferences,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating notification preferences',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.employeeSelfServiceService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Employee Self-Service health check failed',
        error: error.message
      });
    }
  };
}
