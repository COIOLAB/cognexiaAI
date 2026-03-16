import { OrganizationEntity } from './organization.entity';
import { EmployeeEntity } from './employee.entity';
import { CompensationPlanEntity } from './compensation-plan.entity';
export declare class EmployeeCompensationEntity {
    id: string;
    organizationId: string;
    employeeId: string;
    compensationPlanId: string;
    currentSalary: number;
    currency: string;
    payFrequency: string;
    hourlyRate: number;
    bonusTargetPercentage: number;
    bonusTargetAmount: number;
    lastBonusPaid: number;
    lastBonusDate: Date;
    isOvertimeEligible: boolean;
    overtimeMultiplier: number;
    maxOvertimeHoursPerWeek: number;
    hasCommission: boolean;
    commissionRate: number;
    commissionBase: number;
    commissionTiers: Array<{
        threshold: number;
        rate: number;
    }>;
    benefitsEnrollment: {
        healthInsurance?: {
            enrolled: boolean;
            plan: string;
            coverage: string;
            monthlyPremium: number;
            employeeContribution: number;
        };
        dentalInsurance?: {
            enrolled: boolean;
            plan: string;
            monthlyPremium: number;
        };
        visionInsurance?: {
            enrolled: boolean;
            plan: string;
            monthlyPremium: number;
        };
        retirement401k?: {
            enrolled: boolean;
            employeeContributionPercentage: number;
            employerMatchPercentage: number;
            vestingSchedule: string;
        };
        lifeInsurance?: {
            enrolled: boolean;
            coverageAmount: number;
            monthlyPremium: number;
        };
        disabilityInsurance?: {
            enrolled: boolean;
            coverageType: 'short_term' | 'long_term' | 'both';
            monthlyPremium: number;
        };
    };
    timeOffBalances: {
        paidTimeOff?: {
            accrualRate: number;
            currentBalance: number;
            maxBalance: number;
            carryoverLimit: number;
        };
        sickLeave?: {
            accrualRate: number;
            currentBalance: number;
            maxBalance: number;
        };
        personalDays?: {
            annualAllowance: number;
            currentBalance: number;
        };
        vacationDays?: {
            annualAllowance: number;
            currentBalance: number;
            carryoverLimit: number;
        };
    };
    allowances: Array<{
        type: string;
        amount: number;
        frequency: string;
        taxable: boolean;
        effectiveDate: string;
        endDate?: string;
    }>;
    equity: {
        hasEquity: boolean;
        equityType?: 'stock_options' | 'rsu' | 'espp';
        totalShares?: number;
        vestedShares?: number;
        unvestedShares?: number;
        strikePrice?: number;
        grantDate?: string;
        vestingSchedule?: string;
        expirationDate?: string;
    };
    performanceIncentives: Array<{
        type: string;
        description: string;
        targetValue: number;
        currentProgress: number;
        incentiveAmount: number;
        payoutDate?: string;
        status: string;
    }>;
    isActive: boolean;
    effectiveDate: Date;
    endDate: Date;
    changeReason: string;
    approvedById: string;
    approvedDate: Date;
    notes: string;
    previousSalary: number;
    salaryIncrease: number;
    salaryIncreasePercentage: number;
    taxClassification: string;
    payrollClass: string;
    isSubjectToWithholding: boolean;
    taxElections: {
        federalWithholding?: number;
        stateWithholding?: number;
        localWithholding?: number;
        exemptions?: number;
        filingStatus?: string;
    };
    costCenter: string;
    costAllocation: Array<{
        costCenter: string;
        percentage: number;
        department: string;
        project?: string;
    }>;
    customFields: Record<string, any>;
    settings: Record<string, any>;
    metadata: Record<string, any>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    organization: OrganizationEntity;
    employee: EmployeeEntity;
    compensationPlan: CompensationPlanEntity;
    approvedBy: EmployeeEntity;
}
//# sourceMappingURL=employee-compensation.entity.d.ts.map