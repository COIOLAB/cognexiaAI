import { Request, Response, NextFunction } from 'express';
export declare class EmployeeController {
    private employeeService;
    constructor();
    /**
     * Creates a new employee
     * POST /api/v1/hr/employees
     */
    createEmployee(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gets an employee by ID
     * GET /api/v1/hr/employees/:id
     */
    getEmployee(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Updates an employee
     * PUT /api/v1/hr/employees/:id
     */
    updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Deletes an employee (soft delete)
     * DELETE /api/v1/hr/employees/:id
     */
    deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Lists employees with pagination and filtering
     * GET /api/v1/hr/employees
     */
    listEmployees(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Searches employees
     * GET /api/v1/hr/employees/search
     */
    searchEmployees(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gets direct reports for a manager
     * GET /api/v1/hr/employees/:id/direct-reports
     */
    getDirectReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gets manager hierarchy for an employee
     * GET /api/v1/hr/employees/:id/manager-hierarchy
     */
    getManagerHierarchy(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gets employee by email
     * GET /api/v1/hr/employees/by-email/:email
     */
    getEmployeeByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const employeeController: EmployeeController;
//# sourceMappingURL=employee.controller.d.ts.map