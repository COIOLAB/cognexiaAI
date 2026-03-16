// Industry 5.0 ERP Backend - Payroll Management Controller
// Advanced payroll processing with AI-powered tax optimization, blockchain verification, and quantum analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class PayrollController {
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
  }

  /**
   * Create new payroll run
   * POST /api/v1/hr/payroll/runs
   */
  createPayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, period, payrollType, employeeIds, description } = req.body;

      if (!organizationId || !period || !payrollType) {
        res.status(400).json({
          success: false,
          message: 'Organization ID, period, and payroll type are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.createPayrollRun({
        organizationId,
        period,
        payrollType,
        employeeIds: employeeIds || [],
        description: description || '',
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating payroll run',
        error: error.message
      });
    }
  };

  /**
   * Get all payroll runs with filtering and pagination
   * GET /api/v1/hr/payroll/runs
   */
  getPayrollRuns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        organizationId, 
        status, 
        period, 
        payrollType,
        limit = 20, 
        offset = 0 
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        status: status as string,
        period: period as string,
        payrollType: payrollType as string
      };

      const result: ServiceResponse<any> = await this.payrollService.getPayrollRuns(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payroll runs',
        error: error.message
      });
    }
  };

  /**
   * Get specific payroll run details
   * GET /api/v1/hr/payroll/runs/:id
   */
  getPayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getPayrollRunById(id as UUID);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payroll run',
        error: error.message
      });
    }
  };

  /**
   * Update payroll run
   * PUT /api/v1/hr/payroll/runs/:id
   */
  updatePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.updatePayrollRun(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating payroll run',
        error: error.message
      });
    }
  };

  /**
   * Process payroll run (calculate salaries, taxes, deductions)
   * POST /api/v1/hr/payroll/runs/:id/process
   */
  processPayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { forceReprocess = false } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.processPayrollRun(
        id as UUID,
        req.user?.id as UUID,
        forceReprocess
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing payroll run',
        error: error.message
      });
    }
  };

  /**
   * Approve payroll run
   * POST /api/v1/hr/payroll/runs/:id/approve
   */
  approvePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.approvePayrollRun(
        id as UUID,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving payroll run',
        error: error.message
      });
    }
  };

  /**
   * Finalize payroll run (generate pay slips, bank files)
   * POST /api/v1/hr/payroll/runs/:id/finalize
   */
  finalizePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { generatePaySlips = true, generateBankFile = true } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.finalizePayrollRun(
        id as UUID,
        req.user?.id as UUID,
        { generatePaySlips, generateBankFile }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while finalizing payroll run',
        error: error.message
      });
    }
  };

  /**
   * Delete payroll run (only if not processed)
   * DELETE /api/v1/hr/payroll/runs/:id
   */
  deletePayrollRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.deletePayrollRun(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting payroll run',
        error: error.message
      });
    }
  };

  /**
   * Get payroll records for a specific run
   * GET /api/v1/hr/payroll/runs/:runId/records
   */
  getPayrollRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { runId } = req.params;
      const { limit = 50, offset = 0, departmentId, status } = req.query;

      if (!runId) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        departmentId: departmentId as UUID,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.payrollService.getPayrollRecordsByRun(
        runId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payroll records',
        error: error.message
      });
    }
  };

  /**
   * Get employee payroll records
   * GET /api/v1/hr/payroll/employees/:employeeId/records
   */
  getEmployeePayrollRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { limit = 12, offset = 0, year, status } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check if user can access this employee's payroll data
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access payroll records',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        year: year ? parseInt(year as string) : undefined,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.payrollService.getEmployeePayrollRecords(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee payroll records',
        error: error.message
      });
    }
  };

  /**
   * Update individual payroll record
   * PUT /api/v1/hr/payroll/records/:id
   */
  updatePayrollRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.updatePayrollRecord(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating payroll record',
        error: error.message
      });
    }
  };

  /**
   * Get payroll record details with breakdown
   * GET /api/v1/hr/payroll/records/:id
   */
  getPayrollRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeBreakdown = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getPayrollRecordById(
        id as UUID,
        includeBreakdown === 'true'
      );

      // Check access permissions for employee's own data
      if (result.data?.employeeId && req.user?.id === result.data.employeeId) {
        res.status(result.success ? 200 : 404).json(result);
        return;
      }

      // Check HR permissions
      if (!req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access payroll record',
          error: 'FORBIDDEN'
        });
        return;
      }

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payroll record',
        error: error.message
      });
    }
  };

  /**
   * Get tax rules and configurations
   * GET /api/v1/hr/payroll/tax-rules
   */
  getTaxRules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, taxType, status, limit = 50, offset = 0 } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        taxType: taxType as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.payrollService.getTaxRules(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching tax rules',
        error: error.message
      });
    }
  };

  /**
   * Create new tax rule
   * POST /api/v1/hr/payroll/tax-rules
   */
  createTaxRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const taxRuleData = req.body;

      const result: ServiceResponse<any> = await this.payrollService.createTaxRule({
        ...taxRuleData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating tax rule',
        error: error.message
      });
    }
  };

  /**
   * Update tax rule
   * PUT /api/v1/hr/payroll/tax-rules/:id
   */
  updateTaxRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tax rule ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.updateTaxRule(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating tax rule',
        error: error.message
      });
    }
  };

  /**
   * Delete tax rule
   * DELETE /api/v1/hr/payroll/tax-rules/:id
   */
  deleteTaxRule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Tax rule ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.deleteTaxRule(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting tax rule',
        error: error.message
      });
    }
  };

  /**
   * Get employee deductions
   * GET /api/v1/hr/payroll/employees/:employeeId/deductions
   */
  getEmployeeDeductions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { status, deductionType } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        status: status as string,
        deductionType: deductionType as string
      };

      const result: ServiceResponse<any> = await this.payrollService.getEmployeeDeductions(
        employeeId as UUID,
        filters
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee deductions',
        error: error.message
      });
    }
  };

  /**
   * Add employee deduction
   * POST /api/v1/hr/payroll/employees/:employeeId/deductions
   */
  addEmployeeDeduction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const deductionData = req.body;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.addEmployeeDeduction(
        employeeId as UUID,
        { ...deductionData, createdBy: req.user?.id }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding employee deduction',
        error: error.message
      });
    }
  };

  /**
   * Update employee deduction
   * PUT /api/v1/hr/payroll/deductions/:id
   */
  updateEmployeeDeduction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Deduction ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.updateEmployeeDeduction(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating employee deduction',
        error: error.message
      });
    }
  };

  /**
   * Remove employee deduction
   * DELETE /api/v1/hr/payroll/deductions/:id
   */
  removeEmployeeDeduction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Deduction ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.removeEmployeeDeduction(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing employee deduction',
        error: error.message
      });
    }
  };

  /**
   * Generate pay slip for employee
   * GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId
   */
  getPaySlip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, payrollRecordId } = req.params;

      if (!employeeId || !payrollRecordId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and Payroll Record ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access pay slip',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.generatePaySlip(
        employeeId as UUID,
        payrollRecordId as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating pay slip',
        error: error.message
      });
    }
  };

  /**
   * Download pay slip PDF
   * GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/download
   */
  downloadPaySlip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, payrollRecordId } = req.params;

      if (!employeeId || !payrollRecordId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and Payroll Record ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:payroll:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to download pay slip',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.downloadPaySlipPDF(
        employeeId as UUID,
        payrollRecordId as UUID
      );

      if (result.success && result.data?.fileBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="payslip-${payrollRecordId}.pdf"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while downloading pay slip',
        error: error.message
      });
    }
  };

  /**
   * Email pay slip to employee
   * POST /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/email
   */
  emailPaySlip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, payrollRecordId } = req.params;
      const { customMessage } = req.body;

      if (!employeeId || !payrollRecordId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and Payroll Record ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.emailPaySlip(
        employeeId as UUID,
        payrollRecordId as UUID,
        req.user?.id as UUID,
        customMessage
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while emailing pay slip',
        error: error.message
      });
    }
  };

  /**
   * Generate bank file for payroll run
   * POST /api/v1/hr/payroll/runs/:runId/bank-file
   */
  generateBankFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { runId } = req.params;
      const { bankFormat = 'NEFT', includeHeader = true } = req.body;

      if (!runId) {
        res.status(400).json({
          success: false,
          message: 'Payroll run ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.generateBankFile(
        runId as UUID,
        bankFormat,
        includeHeader
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating bank file',
        error: error.message
      });
    }
  };

  /**
   * Get employee bank details
   * GET /api/v1/hr/payroll/employees/:employeeId/bank-details
   */
  getEmployeeBankDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getEmployeeBankDetails(
        employeeId as UUID
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee bank details',
        error: error.message
      });
    }
  };

  /**
   * Update employee bank details
   * PUT /api/v1/hr/payroll/employees/:employeeId/bank-details
   */
  updateEmployeeBankDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const bankDetails = req.body;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions - employee can update their own details
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:payroll:update')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to update bank details',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.updateEmployeeBankDetails(
        employeeId as UUID,
        { ...bankDetails, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating employee bank details',
        error: error.message
      });
    }
  };

  /**
   * Generate statutory reports (PF, ESI, TDS)
   * GET /api/v1/hr/payroll/reports/statutory
   */
  getStatutoryReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, period, organizationId, format = 'json' } = req.query;

      if (!type || !period || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Type, period, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.generateStatutoryReport(
        type as string,
        period as string,
        organizationId as UUID,
        format as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating statutory report',
        error: error.message
      });
    }
  };

  /**
   * Generate payroll summary report
   * GET /api/v1/hr/payroll/reports/summary
   */
  getPayrollSummaryReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { runId, organizationId, period } = req.query;

      if (!runId && (!organizationId || !period)) {
        res.status(400).json({
          success: false,
          message: 'Either run ID or organization ID with period is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getPayrollSummaryReport(
        runId as UUID,
        organizationId as UUID,
        period as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating payroll summary report',
        error: error.message
      });
    }
  };

  /**
   * Generate cost center report
   * GET /api/v1/hr/payroll/reports/cost-center
   */
  getCostCenterReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period, organizationId, costCenterId } = req.query;

      if (!period || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Period and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getCostCenterReport(
        period as string,
        organizationId as UUID,
        costCenterId as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating cost center report',
        error: error.message
      });
    }
  };

  /**
   * Generate tax report
   * GET /api/v1/hr/payroll/reports/tax
   */
  getTaxReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, year, organizationId } = req.query;

      if (!year || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Year and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getTaxReport(
        parseInt(year as string),
        organizationId as UUID,
        employeeId as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating tax report',
        error: error.message
      });
    }
  };

  /**
   * Get payroll analytics and insights
   * GET /api/v1/hr/payroll/analytics
   */
  getPayrollAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period, type, organizationId } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getPayrollAnalytics(
        organizationId as UUID,
        period as string,
        type as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payroll analytics',
        error: error.message
      });
    }
  };

  /**
   * AI-powered payroll anomaly detection
   * GET /api/v1/hr/payroll/anomalies
   */
  detectPayrollAnomalies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { runId, organizationId, threshold = 0.8 } = req.query;

      if (!runId && !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Either run ID or organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.detectPayrollAnomalies(
        runId as UUID,
        organizationId as UUID,
        parseFloat(threshold as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while detecting payroll anomalies',
        error: error.message
      });
    }
  };

  /**
   * Predictive payroll cost analysis
   * GET /api/v1/hr/payroll/predictions/cost
   */
  predictPayrollCosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { months, organizationId, includeVariables = true } = req.query;

      if (!months || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Months and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.predictPayrollCosts(
        organizationId as UUID,
        parseInt(months as string),
        includeVariables === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while predicting payroll costs',
        error: error.message
      });
    }
  };

  /**
   * Tax optimization suggestions
   * GET /api/v1/hr/payroll/employees/:employeeId/tax-optimization
   */
  getTaxOptimizationSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { financialYear } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getTaxOptimizationSuggestions(
        employeeId as UUID,
        financialYear as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting tax optimization suggestions',
        error: error.message
      });
    }
  };

  /**
   * Verify payroll record on blockchain
   * POST /api/v1/hr/payroll/records/:id/blockchain-verify
   */
  verifyPayrollOnBlockchain = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Payroll record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.verifyPayrollOnBlockchain(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying payroll on blockchain',
        error: error.message
      });
    }
  };

  /**
   * Get blockchain transaction history for payroll
   * GET /api/v1/hr/payroll/blockchain/history
   */
  getBlockchainPayrollHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, organizationId, limit = 50, offset = 0 } = req.query;

      if (!employeeId && !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Either employee ID or organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.getBlockchainPayrollHistory(
        employeeId as UUID,
        organizationId as UUID,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching blockchain payroll history',
        error: error.message
      });
    }
  };

  /**
   * Import payroll data from Excel/CSV
   * POST /api/v1/hr/payroll/import
   */
  importPayrollData = async (req: Request, res: Response): Promise<void> => {
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

      const result: ServiceResponse<any> = await this.payrollService.importPayrollData(
        file,
        importType,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing payroll data',
        error: error.message
      });
    }
  };

  /**
   * Export payroll data to Excel/CSV
   * GET /api/v1/hr/payroll/export
   */
  exportPayrollData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { format, runId, organizationId, period } = req.query;

      if (!format || (!runId && (!organizationId || !period))) {
        res.status(400).json({
          success: false,
          message: 'Format and either run ID or organization ID with period are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.payrollService.exportPayrollData(
        format as string,
        runId as UUID,
        organizationId as UUID,
        period as string
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="payroll-export.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting payroll data',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.payrollService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Payroll service health check failed',
        error: error.message
      });
    }
  };
}
