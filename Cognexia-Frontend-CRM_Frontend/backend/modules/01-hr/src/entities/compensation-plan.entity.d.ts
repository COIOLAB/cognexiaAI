import { OrganizationEntity } from './organization.entity';
import { EmployeeCompensationEntity } from './employee-compensation.entity';
export declare class CompensationPlanEntity {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    jobTitle: string;
    department: string;
    level: string;
    jobFamily: string;
    payGrade: string;
    baseSalary: {
        min: number;
        max: number;
        midpoint?: number;
        currency: string;
    };
    bonusStructure: {
        type: 'percentage' | 'fixed' | 'performance_based' | 'commission';
        percentage?: number;
        fixedAmount?: number;
        maxAmount?: number;
        minAmount?: number;
        targetAmount?: number;
        performanceMultipliers?: Array<{
            rating: string;
            multiplier: number;
        }>;
        commissionRate?: number;
        commissionTiers?: Array<{
            threshold: number;
            rate: number;
        }>;
    };
    benefits: {
        healthInsurance?: boolean;
        dentalInsurance?: boolean;
        visionInsurance?: boolean;
        lifeInsurance?: boolean;
        disabilityInsurance?: boolean;
        retirement401k?: boolean;
        retirementMatching?: number;
        paidTimeOff?: number;
        sickLeave?: number;
        maternityLeave?: number;
        paternityLeave?: number;
        flexibleSpending?: boolean;
        healthSavingsAccount?: boolean;
        tuitionReimbursement?: boolean;
        gymMembership?: boolean;
        parkingAllowance?: boolean;
        mealAllowance?: number;
        transportationAllowance?: number;
        phoneAllowance?: number;
        internetAllowance?: number;
        homeOfficeAllowance?: number;
    };
    allowances: Array<{
        type: string;
        amount: number;
        currency: string;
        frequency: string;
        taxable: boolean;
    }>;
    equity: {
        hasEquity: boolean;
        equityType?: 'stock_options' | 'rsu' | 'espp';
        sharesOrOptions?: number;
        strikePrice?: number;
        vestingSchedule?: string;
        vestingPeriodMonths?: number;
        cliffMonths?: number;
    };
    performanceIncentives: Array<{
        type: string;
        description: string;
        targetValue: number;
        incentiveAmount: number;
        frequency: string;
    }>;
    workArrangements: {
        remoteWorkAllowed: boolean;
        flexibleHours: boolean;
        compressedWorkWeek: boolean;
        jobSharing: boolean;
        sabbaticalEligible: boolean;
    };
    locationAdjustments: Array<{
        location: string;
        adjustmentType: 'percentage' | 'fixed';
        adjustmentValue: number;
        effectiveDate: string;
    }>;
    isActive: boolean;
    isTemplate: boolean;
    effectiveDate: Date;
    expiryDate: Date;
    lastReviewDate: Date;
    nextReviewDate: Date;
    status: string;
    approvedById: string;
    approvedDate: Date;
    approvalNotes: string;
    marketData: {
        benchmarkSource: string;
        benchmarkDate: string;
        percentile: number;
        marketMin: number;
        marketMax: number;
        marketMedian: number;
        currency: string;
    };
    totalCompensationMin: number;
    totalCompensationMax: number;
    totalCompensationMidpoint: number;
    annualCostPerEmployee: number;
    currentEmployeeCount: number;
    maxEmployees: number;
    customBenefits: Record<string, any>;
    complianceRules: Record<string, any>;
    settings: Record<string, any>;
    metadata: Record<string, any>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    organization: OrganizationEntity;
    employeeCompensations: EmployeeCompensationEntity[];
}
//# sourceMappingURL=compensation-plan.entity.d.ts.map