// Industry 5.0 ERP Backend - Payroll Management Service
// Business logic for payroll processing, calculations, and payslip generation
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { PayrollModel } from '../models/payroll.model';
import { 
  PayrollRun, 
  PayrollRecord, 
  PayrollDeduction,
  TaxRule,
  CreatePayrollRunRequest,
  CreateTaxRuleRequest,
  PaginationOptions,
  PaginatedResponse,
  FilterOptions,
  PayrollStatus,
  DeductionType
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class PayrollService {
  private payrollModel: PayrollModel;

  constructor() {
    this.payrollModel = new PayrollModel();
  }

  // =====================
  // PAYROLL RUNS
  // =====================

  async createPayrollRun(organizationId: UUID, data: CreatePayrollRunRequest): Promise<PayrollRun> {
    try {
      // Validate payroll run data
      this.validatePayrollRun(data);

      // Check for overlapping payroll runs
      const overlapping = await this.payrollModel.findOverlappingPayrollRuns(
        organizationId,
        data.payPeriodStart,
        data.payPeriodEnd
      );

      if (overlapping.length > 0) {
        throw new HRError(
          HRErrorCodes.PAYROLL_PERIOD_OVERLAP,
          'Payroll run already exists for this period',
          400
        );
      }

      // Create payroll run
      const payrollRun = await this.payrollModel.createPayrollRun(organizationId, data);
      logger.info(`Created payroll run ${payrollRun.id} for period ${data.payPeriodStart} to ${data.payPeriodEnd}`);

      return payrollRun;

    } catch (error) {
      logger.error('Error creating payroll run:', error);
      throw error;
    }
  }

  async processPayrollRun(id: UUID, organizationId: UUID): Promise<PayrollRun> {
    try {
      const payrollRun = await this.getPayrollRunById(id, organizationId);
      if (!payrollRun) {
        throw new HRError(HRErrorCodes.PAYROLL_RUN_NOT_FOUND, 'Payroll run not found', 404);
      }

      if (payrollRun.status !== PayrollStatus.DRAFT) {
        throw new HRError(
          HRErrorCodes.INVALID_PAYROLL_STATUS,
          'Payroll run can only be processed from draft status',
          400
        );
      }

      // Get employees eligible for this payroll run
      const employees = await this.payrollModel.getEligibleEmployees(organizationId, payrollRun);

      // Process each employee's payroll
      for (const employee of employees) {
        await this.processEmployeePayroll(employee, payrollRun, organizationId);
      }

      // Update payroll run status
      const updatedRun = await this.payrollModel.updatePayrollRun(id, {
        status: PayrollStatus.PROCESSED,
        processedDate: new Date()
      });

      logger.info(`Processed payroll run ${id} for ${employees.length} employees`);
      return updatedRun;

    } catch (error) {
      logger.error(`Error processing payroll run ${id}:`, error);
      throw error;
    }
  }

  async approvePayrollRun(id: UUID, approvedBy: UUID, organizationId: UUID): Promise<PayrollRun> {
    try {
      const payrollRun = await this.getPayrollRunById(id, organizationId);
      if (!payrollRun) {
        throw new HRError(HRErrorCodes.PAYROLL_RUN_NOT_FOUND, 'Payroll run not found', 404);
      }

      if (payrollRun.status !== PayrollStatus.PROCESSED) {
        throw new HRError(
          HRErrorCodes.INVALID_PAYROLL_STATUS,
          'Payroll run must be processed before approval',
          400
        );
      }

      const updatedRun = await this.payrollModel.updatePayrollRun(id, {
        status: PayrollStatus.APPROVED,
        approvedBy,
        approvedDate: new Date()
      });

      logger.info(`Approved payroll run ${id} by user ${approvedBy}`);
      return updatedRun;

    } catch (error) {
      logger.error(`Error approving payroll run ${id}:`, error);
      throw error;
    }
  }

  async getPayrollRunById(id: UUID, organizationId: UUID): Promise<PayrollRun | null> {
    try {
      const payrollRun = await this.payrollModel.findPayrollRunById(id);
      
      if (!payrollRun || payrollRun.organizationId !== organizationId) {
        return null;
      }

      return payrollRun;
    } catch (error) {
      logger.error(`Error getting payroll run ${id}:`, error);
      throw error;
    }
  }

  async listPayrollRuns(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PayrollRun>> {
    try {
      return await this.payrollModel.listPayrollRuns(organizationId, options);
    } catch (error) {
      logger.error('Error listing payroll runs:', error);
      throw error;
    }
  }

  // =====================
  // PAYROLL RECORDS
  // =====================

  async getPayrollRecord(id: UUID, organizationId: UUID): Promise<PayrollRecord | null> {
    try {
      const record = await this.payrollModel.findPayrollRecordById(id);
      
      if (!record || record.organizationId !== organizationId) {
        return null;
      }

      return record;
    } catch (error) {
      logger.error(`Error getting payroll record ${id}:`, error);
      throw error;
    }
  }

  async listPayrollRecords(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PayrollRecord>> {
    try {
      return await this.payrollModel.listPayrollRecords(organizationId, options);
    } catch (error) {
      logger.error('Error listing payroll records:', error);
      throw error;
    }
  }

  async getEmployeePayrollHistory(employeeId: UUID, organizationId: UUID, year?: number): Promise<PayrollRecord[]> {
    try {
      return await this.payrollModel.findEmployeePayrollHistory(employeeId, organizationId, year);
    } catch (error) {
      logger.error(`Error getting payroll history for employee ${employeeId}:`, error);
      throw error;
    }
  }

  // =====================
  // TAX RULES
  // =====================

  async createTaxRule(organizationId: UUID, data: CreateTaxRuleRequest): Promise<TaxRule> {
    try {
      this.validateTaxRule(data);

      const taxRule = await this.payrollModel.createTaxRule(organizationId, data);
      logger.info(`Created tax rule ${taxRule.id}: ${data.name}`);

      return taxRule;

    } catch (error) {
      logger.error('Error creating tax rule:', error);
      throw error;
    }
  }

  async getTaxRulesForPayroll(organizationId: UUID): Promise<TaxRule[]> {
    try {
      return await this.payrollModel.getActiveTaxRules(organizationId);
    } catch (error) {
      logger.error('Error getting tax rules:', error);
      throw error;
    }
  }

  // =====================
  // PAYROLL CALCULATIONS
  // =====================

  private async processEmployeePayroll(employee: any, payrollRun: PayrollRun, organizationId: UUID): Promise<PayrollRecord> {
    try {
      // Get employee's compensation data
      const compensation = await this.getEmployeeCompensation(employee.id, organizationId);
      
      // Get time and attendance data for the pay period
      const attendance = await this.getEmployeeAttendance(employee.id, payrollRun.payPeriodStart, payrollRun.payPeriodEnd);

      // Calculate gross pay
      const grossPay = this.calculateGrossPay(compensation, attendance, payrollRun);

      // Get applicable deductions
      const deductions = await this.calculateDeductions(employee, grossPay, organizationId);

      // Calculate taxes
      const taxes = await this.calculateTaxes(employee, grossPay, organizationId);

      // Calculate net pay
      const totalDeductions = [...deductions, ...taxes].reduce((sum, d) => sum + d.amount, 0);
      const netPay = grossPay - totalDeductions;

      // Create payroll record
      const payrollRecord = await this.payrollModel.createPayrollRecord(organizationId, {
        payrollRunId: payrollRun.id,
        employeeId: employee.id,
        grossPay,
        netPay,
        totalDeductions,
        deductions: [...deductions, ...taxes],
        payPeriodStart: payrollRun.payPeriodStart,
        payPeriodEnd: payrollRun.payPeriodEnd,
        payDate: payrollRun.payDate
      });

      logger.info(`Processed payroll for employee ${employee.id}: Gross ${grossPay}, Net ${netPay}`);
      return payrollRecord;

    } catch (error) {
      logger.error(`Error processing payroll for employee ${employee.id}:`, error);
      throw error;
    }
  }

  private calculateGrossPay(compensation: any, attendance: any, payrollRun: PayrollRun): number {
    let grossPay = 0;

    if (compensation.type === 'salary') {
      // Monthly salary calculation
      const monthlyPay = compensation.baseSalary / 12;
      const daysInPeriod = this.getWorkingDaysInPeriod(payrollRun.payPeriodStart, payrollRun.payPeriodEnd);
      const workingDaysInMonth = 22; // Standard working days per month
      
      grossPay = (monthlyPay / workingDaysInMonth) * Math.min(attendance.workedDays || daysInPeriod, daysInPeriod);
      
      // Add overtime if applicable
      if (attendance.overtimeHours > 0) {
        const hourlyRate = monthlyPay / (workingDaysInMonth * 8);
        grossPay += attendance.overtimeHours * hourlyRate * 1.5; // 1.5x overtime rate
      }
    } else if (compensation.type === 'hourly') {
      grossPay = (attendance.workedHours || 0) * compensation.hourlyRate;
      
      // Add overtime
      if (attendance.overtimeHours > 0) {
        grossPay += attendance.overtimeHours * compensation.hourlyRate * 1.5;
      }
    }

    // Add bonuses and allowances
    if (compensation.components) {
      for (const component of compensation.components) {
        if (component.type === 'bonus' || component.type === 'allowance') {
          grossPay += component.amount;
        }
      }
    }

    return Math.round(grossPay * 100) / 100; // Round to 2 decimal places
  }

  private async calculateDeductions(employee: any, grossPay: number, organizationId: UUID): Promise<PayrollDeduction[]> {
    const deductions: PayrollDeduction[] = [];

    // Get employee's benefit enrollments
    const benefits = await this.payrollModel.getEmployeeBenefitDeductions(employee.id, organizationId);
    
    for (const benefit of benefits) {
      deductions.push({
        id: benefit.id,
        type: DeductionType.BENEFIT,
        name: benefit.name,
        amount: benefit.employeeContribution,
        isPreTax: benefit.isPreTax || false
      });
    }

    // Add other standard deductions (loan repayments, etc.)
    const otherDeductions = await this.payrollModel.getEmployeeOtherDeductions(employee.id);
    deductions.push(...otherDeductions);

    return deductions;
  }

  private async calculateTaxes(employee: any, grossPay: number, organizationId: UUID): Promise<PayrollDeduction[]> {
    const taxes: PayrollDeduction[] = [];
    const taxRules = await this.getTaxRulesForPayroll(organizationId);

    for (const rule of taxRules) {
      const taxAmount = this.applyTaxRule(grossPay, rule);
      if (taxAmount > 0) {
        taxes.push({
          id: rule.id,
          type: DeductionType.TAX,
          name: rule.name,
          amount: taxAmount,
          isPreTax: false
        });
      }
    }

    return taxes;
  }

  private applyTaxRule(grossPay: number, rule: TaxRule): number {
    if (rule.type === 'percentage') {
      if (grossPay >= (rule.minAmount || 0) && grossPay <= (rule.maxAmount || Infinity)) {
        return grossPay * (rule.rate / 100);
      }
    } else if (rule.type === 'fixed') {
      if (grossPay >= (rule.minAmount || 0)) {
        return rule.fixedAmount || 0;
      }
    }

    return 0;
  }

  private getWorkingDaysInPeriod(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  private async getEmployeeCompensation(employeeId: UUID, organizationId: UUID): Promise<any> {
    // This would typically fetch from employee and compensation tables
    // For now, returning a mock structure
    return {
      type: 'salary',
      baseSalary: 60000,
      hourlyRate: null,
      components: []
    };
  }

  private async getEmployeeAttendance(employeeId: UUID, startDate: Date, endDate: Date): Promise<any> {
    // This would typically fetch from time & attendance system
    // For now, returning a mock structure
    const workingDays = this.getWorkingDaysInPeriod(startDate, endDate);
    return {
      workedDays: workingDays,
      workedHours: workingDays * 8,
      overtimeHours: 0
    };
  }

  // =====================
  // ANALYTICS
  // =====================

  async getPayrollAnalytics(organizationId: UUID, filters?: any): Promise<any> {
    try {
      return await this.payrollModel.getPayrollAnalytics(organizationId, filters);
    } catch (error) {
      logger.error('Error getting payroll analytics:', error);
      throw error;
    }
  }

  // =====================
  // VALIDATION METHODS
  // =====================

  private validatePayrollRun(data: CreatePayrollRunRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Payroll run name is required', 400);
    }

    if (!data.payPeriodStart || !data.payPeriodEnd) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Pay period dates are required', 400);
    }

    if (new Date(data.payPeriodStart) >= new Date(data.payPeriodEnd)) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Pay period end date must be after start date', 400);
    }

    if (!data.payDate) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Pay date is required', 400);
    }

    if (new Date(data.payDate) < new Date(data.payPeriodEnd)) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Pay date must be after pay period end date', 400);
    }
  }

  private validateTaxRule(data: CreateTaxRuleRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Tax rule name is required', 400);
    }

    if (!data.type || !['percentage', 'fixed'].includes(data.type)) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Valid tax rule type is required', 400);
    }

    if (data.type === 'percentage' && (!data.rate || data.rate < 0 || data.rate > 100)) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Valid tax rate (0-100) is required for percentage type', 400);
    }

    if (data.type === 'fixed' && (!data.fixedAmount || data.fixedAmount < 0)) {
      throw new HRError(HRErrorCodes.INVALID_PAYROLL_DATA, 'Valid fixed amount is required for fixed type', 400);
    }
  }
}
