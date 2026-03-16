import { UUID } from 'crypto';
import { PayrollRun, PayrollRecord, TaxRule, CreatePayrollRunRequest, CreateTaxRuleRequest, PaginationOptions, PaginatedResponse, FilterOptions } from '../types';
export declare class PayrollService {
    private payrollModel;
    constructor();
    createPayrollRun(organizationId: UUID, data: CreatePayrollRunRequest): Promise<PayrollRun>;
    processPayrollRun(id: UUID, organizationId: UUID): Promise<PayrollRun>;
    approvePayrollRun(id: UUID, approvedBy: UUID, organizationId: UUID): Promise<PayrollRun>;
    getPayrollRunById(id: UUID, organizationId: UUID): Promise<PayrollRun | null>;
    listPayrollRuns(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PayrollRun>>;
    getPayrollRecord(id: UUID, organizationId: UUID): Promise<PayrollRecord | null>;
    listPayrollRecords(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<PayrollRecord>>;
    getEmployeePayrollHistory(employeeId: UUID, organizationId: UUID, year?: number): Promise<PayrollRecord[]>;
    createTaxRule(organizationId: UUID, data: CreateTaxRuleRequest): Promise<TaxRule>;
    getTaxRulesForPayroll(organizationId: UUID): Promise<TaxRule[]>;
    private processEmployeePayroll;
    private calculateGrossPay;
    private calculateDeductions;
    private calculateTaxes;
    private applyTaxRule;
    private getWorkingDaysInPeriod;
    private getEmployeeCompensation;
    private getEmployeeAttendance;
    getPayrollAnalytics(organizationId: UUID, filters?: any): Promise<any>;
    private validatePayrollRun;
    private validateTaxRule;
}
//# sourceMappingURL=payroll.service.d.ts.map