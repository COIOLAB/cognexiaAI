// Industry 5.0 ERP Backend - Employee Controller
// HTTP request handlers for employee management
// Author: AI Assistant
// Date: 2024

import { Request, Response, NextFunction } from 'express';
import { UUID } from 'crypto';
import { EmployeeServiceImpl } from '../services/employee.service';
import { CreateEmployeeRequest, UpdateEmployeeRequest, PaginationOptions, FilterOptions, SearchOptions } from '../types';
import { HRError, formatErrorResponse, HRErrorCodes } from '../utils/error.util';
import { validateEmployeeData, sanitizeEmployeeData, maskSensitiveData } from '../utils/employee.util';
import { logger } from '../../../utils/logger';

export class EmployeeController {
  private employeeService: EmployeeServiceImpl;

  constructor() {
    this.employeeService = new EmployeeServiceImpl();
  }

  /**
   * Creates a new employee
   * POST /api/v1/hr/employees
   */
  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      if (!organizationId) {
        const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Organization ID not found', 401);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Validate input data
      const validation = validateEmployeeData(req.body);
      if (!validation.isValid) {
        const error = new HRError(
          HRErrorCodes.INVALID_EMPLOYEE_DATA, 
          'Invalid employee data', 
          400, 
          { errors: validation.errors }
        );
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Sanitize data
      const sanitizedData = sanitizeEmployeeData(req.body) as CreateEmployeeRequest;

      // Create employee
      const employee = await this.employeeService.create(organizationId, sanitizedData);

      // Log successful creation (with masked data)
      logger.info('Employee created successfully', { 
        employeeId: employee.id,
        createdBy: req.user?.id,
        data: maskSensitiveData(employee)
      });

      res.status(201).json({
        success: true,
        data: employee,
        message: 'Employee created successfully'
      });

    } catch (error) {
      logger.error('Error creating employee:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Gets an employee by ID
   * GET /api/v1/hr/employees/:id
   */
  async getEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as UUID;
      
      if (!employeeId) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Employee ID is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const employee = await this.employeeService.getById(employeeId);

      if (!employee) {
        const error = new HRError(HRErrorCodes.EMPLOYEE_NOT_FOUND, 'Employee not found', 404);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      res.status(200).json({
        success: true,
        data: employee
      });

    } catch (error) {
      logger.error('Error getting employee:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Updates an employee
   * PUT /api/v1/hr/employees/:id
   */
  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as UUID;
      
      if (!employeeId) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Employee ID is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Validate input data (partial validation for updates)
      const validation = validateEmployeeData({ ...req.body, workEmail: req.body.workEmail || 'temp@temp.com' });
      if (!validation.isValid && req.body.workEmail) {
        const error = new HRError(
          HRErrorCodes.INVALID_EMPLOYEE_DATA, 
          'Invalid employee data', 
          400, 
          { errors: validation.errors }
        );
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Sanitize data
      const sanitizedData = sanitizeEmployeeData(req.body) as UpdateEmployeeRequest;

      // Update employee
      const employee = await this.employeeService.update(employeeId, sanitizedData);

      // Log successful update
      logger.info('Employee updated successfully', { 
        employeeId: employee.id,
        updatedBy: req.user?.id,
        changes: Object.keys(req.body)
      });

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Employee updated successfully'
      });

    } catch (error) {
      logger.error('Error updating employee:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Deletes an employee (soft delete)
   * DELETE /api/v1/hr/employees/:id
   */
  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as UUID;
      
      if (!employeeId) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Employee ID is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      await this.employeeService.delete(employeeId);

      // Log successful deletion
      logger.info('Employee deleted successfully', { 
        employeeId,
        deletedBy: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting employee:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Lists employees with pagination and filtering
   * GET /api/v1/hr/employees
   */
  async listEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      if (!organizationId) {
        const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Organization ID not found', 401);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
      const sortBy = req.query.sortBy as string || 'created_at';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

      // Parse filters
      const filters: FilterOptions = {};
      if (req.query.department) filters.department = req.query.department as string;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.employmentStatus) filters.employmentStatus = req.query.employmentStatus as string;
      if (req.query.employmentType) filters.employmentType = req.query.employmentType as string;
      if (req.query.managerId) filters.managerId = req.query.managerId as UUID;

      const options: PaginationOptions & FilterOptions = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...filters
      };

      const result = await this.employeeService.list(organizationId, options);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: {
          applied: filters,
          available: {
            departments: [], // TODO: Get from database
            locations: [],   // TODO: Get from database
            employmentTypes: Object.values(req.body.EmploymentType || {}),
            employmentStatuses: Object.values(req.body.EmploymentStatus || {})
          }
        }
      });

    } catch (error) {
      logger.error('Error listing employees:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Searches employees
   * GET /api/v1/hr/employees/search
   */
  async searchEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user?.organizationId as UUID;
      if (!organizationId) {
        const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Organization ID not found', 401);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Search query is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const searchOptions: SearchOptions = {
        query: query.trim(),
        fields: req.query.fields ? (req.query.fields as string).split(',') : undefined,
        fuzzy: req.query.fuzzy === 'true'
      };

      const employees = await this.employeeService.search(organizationId, searchOptions);

      res.status(200).json({
        success: true,
        data: employees,
        query: searchOptions.query,
        resultCount: employees.length
      });

    } catch (error) {
      logger.error('Error searching employees:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Gets direct reports for a manager
   * GET /api/v1/hr/employees/:id/direct-reports
   */
  async getDirectReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const managerId = req.params.id as UUID;
      
      if (!managerId) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Manager ID is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const directReports = await this.employeeService.getDirectReports(managerId);

      res.status(200).json({
        success: true,
        data: directReports,
        managerId,
        count: directReports.length
      });

    } catch (error) {
      logger.error('Error getting direct reports:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Gets manager hierarchy for an employee
   * GET /api/v1/hr/employees/:id/manager-hierarchy
   */
  async getManagerHierarchy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params.id as UUID;
      
      if (!employeeId) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Employee ID is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const hierarchy = await this.employeeService.getManagerHierarchy(employeeId);

      res.status(200).json({
        success: true,
        data: hierarchy,
        employeeId,
        hierarchyDepth: hierarchy.length
      });

    } catch (error) {
      logger.error('Error getting manager hierarchy:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }

  /**
   * Gets employee by email
   * GET /api/v1/hr/employees/by-email/:email
   */
  async getEmployeeByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.params.email as string;
      
      if (!email) {
        const error = new HRError(HRErrorCodes.INVALID_EMPLOYEE_DATA, 'Email is required', 400);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      const employee = await this.employeeService.getByEmail(email);

      if (!employee) {
        const error = new HRError(HRErrorCodes.EMPLOYEE_NOT_FOUND, 'Employee not found', 404);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      res.status(200).json({
        success: true,
        data: employee
      });

    } catch (error) {
      logger.error('Error getting employee by email:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json(formatErrorResponse(error));
      } else {
        next(error);
      }
    }
  }
}

// Export a singleton instance
export const employeeController = new EmployeeController();
