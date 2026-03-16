import { Request, Response } from 'express';
export declare class PayrollController {
    private payrollService;
    constructor();
    /**
     * Create new payroll run
     * POST /api/v1/hr/payroll/runs
     */
    createPayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Get all payroll runs with filtering and pagination
     * GET /api/v1/hr/payroll/runs
     */
    getPayrollRuns: (req: Request, res: Response) => Promise<void>;
    /**
     * Get specific payroll run details
     * GET /api/v1/hr/payroll/runs/:id
     */
    getPayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Update payroll run
     * PUT /api/v1/hr/payroll/runs/:id
     */
    updatePayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Process payroll run (calculate salaries, taxes, deductions)
     * POST /api/v1/hr/payroll/runs/:id/process
     */
    processPayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Approve payroll run
     * POST /api/v1/hr/payroll/runs/:id/approve
     */
    approvePayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Finalize payroll run (generate pay slips, bank files)
     * POST /api/v1/hr/payroll/runs/:id/finalize
     */
    finalizePayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete payroll run (only if not processed)
     * DELETE /api/v1/hr/payroll/runs/:id
     */
    deletePayrollRun: (req: Request, res: Response) => Promise<void>;
    /**
     * Get payroll records for a specific run
     * GET /api/v1/hr/payroll/runs/:runId/records
     */
    getPayrollRecords: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee payroll records
     * GET /api/v1/hr/payroll/employees/:employeeId/records
     */
    getEmployeePayrollRecords: (req: Request, res: Response) => Promise<void>;
    /**
     * Update individual payroll record
     * PUT /api/v1/hr/payroll/records/:id
     */
    updatePayrollRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Get payroll record details with breakdown
     * GET /api/v1/hr/payroll/records/:id
     */
    getPayrollRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Get tax rules and configurations
     * GET /api/v1/hr/payroll/tax-rules
     */
    getTaxRules: (req: Request, res: Response) => Promise<void>;
    /**
     * Create new tax rule
     * POST /api/v1/hr/payroll/tax-rules
     */
    createTaxRule: (req: Request, res: Response) => Promise<void>;
    /**
     * Update tax rule
     * PUT /api/v1/hr/payroll/tax-rules/:id
     */
    updateTaxRule: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete tax rule
     * DELETE /api/v1/hr/payroll/tax-rules/:id
     */
    deleteTaxRule: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee deductions
     * GET /api/v1/hr/payroll/employees/:employeeId/deductions
     */
    getEmployeeDeductions: (req: Request, res: Response) => Promise<void>;
    /**
     * Add employee deduction
     * POST /api/v1/hr/payroll/employees/:employeeId/deductions
     */
    addEmployeeDeduction: (req: Request, res: Response) => Promise<void>;
    /**
     * Update employee deduction
     * PUT /api/v1/hr/payroll/deductions/:id
     */
    updateEmployeeDeduction: (req: Request, res: Response) => Promise<void>;
    /**
     * Remove employee deduction
     * DELETE /api/v1/hr/payroll/deductions/:id
     */
    removeEmployeeDeduction: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate pay slip for employee
     * GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId
     */
    getPaySlip: (req: Request, res: Response) => Promise<void>;
    /**
     * Download pay slip PDF
     * GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/download
     */
    downloadPaySlip: (req: Request, res: Response) => Promise<void>;
    /**
     * Email pay slip to employee
     * POST /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/email
     */
    emailPaySlip: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate bank file for payroll run
     * POST /api/v1/hr/payroll/runs/:runId/bank-file
     */
    generateBankFile: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee bank details
     * GET /api/v1/hr/payroll/employees/:employeeId/bank-details
     */
    getEmployeeBankDetails: (req: Request, res: Response) => Promise<void>;
    /**
     * Update employee bank details
     * PUT /api/v1/hr/payroll/employees/:employeeId/bank-details
     */
    updateEmployeeBankDetails: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate statutory reports (PF, ESI, TDS)
     * GET /api/v1/hr/payroll/reports/statutory
     */
    getStatutoryReports: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate payroll summary report
     * GET /api/v1/hr/payroll/reports/summary
     */
    getPayrollSummaryReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate cost center report
     * GET /api/v1/hr/payroll/reports/cost-center
     */
    getCostCenterReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate tax report
     * GET /api/v1/hr/payroll/reports/tax
     */
    getTaxReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Get payroll analytics and insights
     * GET /api/v1/hr/payroll/analytics
     */
    getPayrollAnalytics: (req: Request, res: Response) => Promise<void>;
    /**
     * AI-powered payroll anomaly detection
     * GET /api/v1/hr/payroll/anomalies
     */
    detectPayrollAnomalies: (req: Request, res: Response) => Promise<void>;
    /**
     * Predictive payroll cost analysis
     * GET /api/v1/hr/payroll/predictions/cost
     */
    predictPayrollCosts: (req: Request, res: Response) => Promise<void>;
    /**
     * Tax optimization suggestions
     * GET /api/v1/hr/payroll/employees/:employeeId/tax-optimization
     */
    getTaxOptimizationSuggestions: (req: Request, res: Response) => Promise<void>;
    /**
     * Verify payroll record on blockchain
     * POST /api/v1/hr/payroll/records/:id/blockchain-verify
     */
    verifyPayrollOnBlockchain: (req: Request, res: Response) => Promise<void>;
    /**
     * Get blockchain transaction history for payroll
     * GET /api/v1/hr/payroll/blockchain/history
     */
    getBlockchainPayrollHistory: (req: Request, res: Response) => Promise<void>;
    /**
     * Import payroll data from Excel/CSV
     * POST /api/v1/hr/payroll/import
     */
    importPayrollData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export payroll data to Excel/CSV
     * GET /api/v1/hr/payroll/export
     */
    exportPayrollData: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=payroll.controller.d.ts.map