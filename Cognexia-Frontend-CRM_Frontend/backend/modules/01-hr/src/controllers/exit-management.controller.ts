// Industry 5.0 ERP Backend - Exit Management Controller
// HTTP request handlers for exit management operations
// Author: AI Assistant
// Date: 2024

import { Request, Response } from 'express';
import { UUID } from 'crypto';
import { ExitManagementService } from '../services/exit-management.service';
import { logger } from '../../../utils/logger';

export class ExitManagementController {
  private exitManagementService: ExitManagementService;

  constructor() {
    this.exitManagementService = new ExitManagementService();
  }

  /**
   * Initiate exit process for an employee
   * POST /api/v1/hr/exit/initiate
   */
  async initiateExitProcess(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const exitData = req.body;

      const result = await this.exitManagementService.initiateExitProcess(organizationId, exitData);

      res.status(201).json({
        success: true,
        message: 'Exit process initiated successfully',
        data: result
      });

      logger.info(`Exit process initiated for employee ${exitData.employeeId} by user ${req.user?.id}`);
    } catch (error) {
      logger.error('Error in initiateExitProcess:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to initiate exit process',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Conduct exit interview
   * POST /api/v1/hr/exit/interview
   */
  async conductExitInterview(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const interviewData = req.body;

      const result = await this.exitManagementService.conductExitInterview(organizationId, interviewData);

      res.status(201).json({
        success: true,
        message: 'Exit interview conducted successfully',
        data: result
      });

      logger.info(`Exit interview conducted for employee ${interviewData.employeeId} by user ${req.user?.id}`);
    } catch (error) {
      logger.error('Error in conductExitInterview:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to conduct exit interview',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Create knowledge transfer plan
   * POST /api/v1/hr/exit/knowledge-transfer
   */
  async createKnowledgeTransferPlan(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const { departingEmployeeId, successorId } = req.body;

      const transferPlan = await this.exitManagementService.createKnowledgeTransferPlan(
        departingEmployeeId,
        successorId,
        organizationId
      );

      res.status(201).json({
        success: true,
        message: 'Knowledge transfer plan created successfully',
        data: transferPlan
      });

      logger.info(`Knowledge transfer plan created: ${departingEmployeeId} -> ${successorId} by user ${req.user?.id}`);
    } catch (error) {
      logger.error('Error in createKnowledgeTransferPlan:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create knowledge transfer plan',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Update offboarding status
   * PUT /api/v1/hr/exit/offboarding-status
   */
  async updateOffboardingStatus(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const { checklistId, itemId, completed } = req.body;

      const result = await this.exitManagementService.updateOffboardingStatus(
        checklistId,
        itemId,
        completed,
        organizationId
      );

      res.status(200).json({
        success: true,
        message: 'Offboarding status updated successfully',
        data: result
      });

      logger.info(`Offboarding status updated for checklist ${checklistId} by user ${req.user?.id}`);
    } catch (error) {
      logger.error('Error in updateOffboardingStatus:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update offboarding status',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Get exit analytics
   * GET /api/v1/hr/exit/analytics
   */
  async getExitAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const { period } = req.query;

      const analytics = await this.exitManagementService.getExitAnalytics(
        organizationId,
        period as string
      );

      res.status(200).json({
        success: true,
        message: 'Exit analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      logger.error('Error in getExitAnalytics:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get exit analytics',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Get turnover report
   * GET /api/v1/hr/exit/turnover-report
   */
  async getTurnoverReport(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const filters = req.query;

      const report = await this.exitManagementService.getTurnoverReport(organizationId, filters);

      res.status(200).json({
        success: true,
        message: 'Turnover report generated successfully',
        data: report
      });
    } catch (error) {
      logger.error('Error in getTurnoverReport:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to generate turnover report',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Get exit record by ID
   * GET /api/v1/hr/exit/:id
   */
  async getExitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Implementation would call service method to get exit record by ID
      
      res.status(200).json({
        success: true,
        message: 'Exit record retrieved successfully',
        data: { id } // Placeholder
      });
    } catch (error) {
      logger.error('Error in getExitRecord:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get exit record',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  /**
   * Get all exit records for organization
   * GET /api/v1/hr/exit
   */
  async getExitRecords(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      const { page = 1, limit = 10, status, department } = req.query;

      // Implementation would call service method to get paginated exit records
      
      res.status(200).json({
        success: true,
        message: 'Exit records retrieved successfully',
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      });
    } catch (error) {
      logger.error('Error in getExitRecords:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get exit records',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }
}
