// Industry 5.0 ERP Backend - Payroll Management Routes
// Advanced payroll processing with AI-powered tax optimization, blockchain verification, and quantum analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const payrollController = new PayrollController();

/**
 * Payroll Management Routes
 * Base path: /api/v1/hr/payroll
 */

// Authentication middleware
router.use(AuthMiddleware.authenticate);

/**
 * Payroll Run Management
 */

// Create new payroll run
// POST /api/v1/hr/payroll/runs
router.post('/runs', 
  AuthMiddleware.requirePermissions(['hr:payroll:create']),
  payrollController.createPayrollRun
);

// Get all payroll runs with filtering and pagination
// GET /api/v1/hr/payroll/runs?status=pending&period=2024-01&limit=20&offset=0
router.get('/runs', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getPayrollRuns
);

// Get specific payroll run details
// GET /api/v1/hr/payroll/runs/:id
router.get('/runs/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getPayrollRun
);

// Update payroll run (e.g., approve, process, finalize)
// PUT /api/v1/hr/payroll/runs/:id
router.put('/runs/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:update']),
  payrollController.updatePayrollRun
);

// Process payroll run (calculate salaries, taxes, deductions)
// POST /api/v1/hr/payroll/runs/:id/process
router.post('/runs/:id/process', 
  AuthMiddleware.requirePermissions(['hr:payroll:process']),
  payrollController.processPayrollRun
);

// Approve payroll run
// POST /api/v1/hr/payroll/runs/:id/approve
router.post('/runs/:id/approve', 
  AuthMiddleware.requirePermissions(['hr:payroll:approve']),
  payrollController.approvePayrollRun
);

// Finalize payroll run (generate pay slips, bank files)
// POST /api/v1/hr/payroll/runs/:id/finalize
router.post('/runs/:id/finalize', 
  AuthMiddleware.requirePermissions(['hr:payroll:finalize']),
  payrollController.finalizePayrollRun
);

// Delete payroll run (only if not processed)
// DELETE /api/v1/hr/payroll/runs/:id
router.delete('/runs/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:delete']),
  payrollController.deletePayrollRun
);

/**
 * Payroll Records Management
 */

// Get payroll records for a specific run
// GET /api/v1/hr/payroll/runs/:runId/records
router.get('/runs/:runId/records', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getPayrollRecords
);

// Get employee payroll record
// GET /api/v1/hr/payroll/employees/:employeeId/records
router.get('/employees/:employeeId/records', 
  AuthMiddleware.requirePermissions(['hr:payroll:read', 'hr:employee:self']),
  payrollController.getEmployeePayrollRecords
);

// Update individual payroll record
// PUT /api/v1/hr/payroll/records/:id
router.put('/records/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:update']),
  payrollController.updatePayrollRecord
);

// Get payroll record details with breakdown
// GET /api/v1/hr/payroll/records/:id
router.get('/records/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:read', 'hr:employee:self']),
  payrollController.getPayrollRecord
);

/**
 * Tax Management
 */

// Get tax rules and configurations
// GET /api/v1/hr/payroll/tax-rules
router.get('/tax-rules', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getTaxRules
);

// Create new tax rule
// POST /api/v1/hr/payroll/tax-rules
router.post('/tax-rules', 
  AuthMiddleware.requirePermissions(['hr:payroll:admin']),
  payrollController.createTaxRule
);

// Update tax rule
// PUT /api/v1/hr/payroll/tax-rules/:id
router.put('/tax-rules/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:admin']),
  payrollController.updateTaxRule
);

// Delete tax rule
// DELETE /api/v1/hr/payroll/tax-rules/:id
router.delete('/tax-rules/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:admin']),
  payrollController.deleteTaxRule
);

/**
 * Deduction Management
 */

// Get employee deductions
// GET /api/v1/hr/payroll/employees/:employeeId/deductions
router.get('/employees/:employeeId/deductions', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getEmployeeDeductions
);

// Add employee deduction
// POST /api/v1/hr/payroll/employees/:employeeId/deductions
router.post('/employees/:employeeId/deductions', 
  AuthMiddleware.requirePermissions(['hr:payroll:update']),
  payrollController.addEmployeeDeduction
);

// Update employee deduction
// PUT /api/v1/hr/payroll/deductions/:id
router.put('/deductions/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:update']),
  payrollController.updateEmployeeDeduction
);

// Remove employee deduction
// DELETE /api/v1/hr/payroll/deductions/:id
router.delete('/deductions/:id', 
  AuthMiddleware.requirePermissions(['hr:payroll:update']),
  payrollController.removeEmployeeDeduction
);

/**
 * Pay Slip Management
 */

// Generate pay slip for employee
// GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId
router.get('/employees/:employeeId/payslips/:payrollRecordId', 
  AuthMiddleware.requirePermissions(['hr:payroll:read', 'hr:employee:self']),
  payrollController.getPaySlip
);

// Download pay slip PDF
// GET /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/download
router.get('/employees/:employeeId/payslips/:payrollRecordId/download', 
  AuthMiddleware.requirePermissions(['hr:payroll:read', 'hr:employee:self']),
  payrollController.downloadPaySlip
);

// Email pay slip to employee
// POST /api/v1/hr/payroll/employees/:employeeId/payslips/:payrollRecordId/email
router.post('/employees/:employeeId/payslips/:payrollRecordId/email', 
  AuthMiddleware.requirePermissions(['hr:payroll:process']),
  payrollController.emailPaySlip
);

/**
 * Banking and Direct Deposit
 */

// Generate bank file for payroll run
// POST /api/v1/hr/payroll/runs/:runId/bank-file
router.post('/runs/:runId/bank-file', 
  AuthMiddleware.requirePermissions(['hr:payroll:finalize']),
  payrollController.generateBankFile
);

// Get employee bank details
// GET /api/v1/hr/payroll/employees/:employeeId/bank-details
router.get('/employees/:employeeId/bank-details', 
  AuthMiddleware.requirePermissions(['hr:payroll:read']),
  payrollController.getEmployeeBankDetails
);

// Update employee bank details
// PUT /api/v1/hr/payroll/employees/:employeeId/bank-details
router.put('/employees/:employeeId/bank-details', 
  AuthMiddleware.requirePermissions(['hr:payroll:update', 'hr:employee:self']),
  payrollController.updateEmployeeBankDetails
);

/**
 * Compliance and Reporting
 */

// Generate statutory reports (PF, ESI, TDS)
// GET /api/v1/hr/payroll/reports/statutory?type=pf&period=2024-01
router.get('/reports/statutory', 
  AuthMiddleware.requirePermissions(['hr:payroll:reports']),
  payrollController.getStatutoryReports
);

// Generate payroll summary report
// GET /api/v1/hr/payroll/reports/summary?runId=123
router.get('/reports/summary', 
  AuthMiddleware.requirePermissions(['hr:payroll:reports']),
  payrollController.getPayrollSummaryReport
);

// Generate cost center report
// GET /api/v1/hr/payroll/reports/cost-center?period=2024-01
router.get('/reports/cost-center', 
  AuthMiddleware.requirePermissions(['hr:payroll:reports']),
  payrollController.getCostCenterReport
);

// Generate tax report
// GET /api/v1/hr/payroll/reports/tax?employeeId=123&year=2024
router.get('/reports/tax', 
  AuthMiddleware.requirePermissions(['hr:payroll:reports']),
  payrollController.getTaxReport
);

/**
 * Advanced Analytics and AI Features
 */

// Get payroll analytics and insights
// GET /api/v1/hr/payroll/analytics?period=2024&type=trend
router.get('/analytics', 
  AuthMiddleware.requirePermissions(['hr:payroll:analytics']),
  payrollController.getPayrollAnalytics
);

// AI-powered payroll anomaly detection
// GET /api/v1/hr/payroll/anomalies?runId=123
router.get('/anomalies', 
  AuthMiddleware.requirePermissions(['hr:payroll:analytics']),
  payrollController.detectPayrollAnomalies
);

// Predictive payroll cost analysis
// GET /api/v1/hr/payroll/predictions/cost?months=6
router.get('/predictions/cost', 
  AuthMiddleware.requirePermissions(['hr:payroll:analytics']),
  payrollController.predictPayrollCosts
);

// Tax optimization suggestions
// GET /api/v1/hr/payroll/employees/:employeeId/tax-optimization
router.get('/employees/:employeeId/tax-optimization', 
  AuthMiddleware.requirePermissions(['hr:payroll:analytics']),
  payrollController.getTaxOptimizationSuggestions
);

/**
 * Blockchain Integration
 */

// Verify payroll record on blockchain
// POST /api/v1/hr/payroll/records/:id/blockchain-verify
router.post('/records/:id/blockchain-verify', 
  AuthMiddleware.requirePermissions(['hr:payroll:blockchain']),
  payrollController.verifyPayrollOnBlockchain
);

// Get blockchain transaction history for payroll
// GET /api/v1/hr/payroll/blockchain/history?employeeId=123
router.get('/blockchain/history', 
  AuthMiddleware.requirePermissions(['hr:payroll:blockchain']),
  payrollController.getBlockchainPayrollHistory
);

/**
 * Import/Export Operations
 */

// Import payroll data from Excel/CSV
// POST /api/v1/hr/payroll/import
router.post('/import', 
  AuthMiddleware.requirePermissions(['hr:payroll:import']),
  payrollController.importPayrollData
);

// Export payroll data to Excel/CSV
// GET /api/v1/hr/payroll/export?format=excel&runId=123
router.get('/export', 
  AuthMiddleware.requirePermissions(['hr:payroll:export']),
  payrollController.exportPayrollData
);

/**
 * Health Check
 */
router.get('/health', payrollController.healthCheck);

export default router;
