import { EmployeeEntity } from './employee.entity';
import { DepartmentEntity } from './department.entity';
import { CompensationPlanEntity } from './compensation-plan.entity';
import { PayrollRunEntity } from './payroll-run.entity';
export declare class OrganizationEntity {
    id: string;
    name: string;
    code: string;
    description: string;
    type: string;
    industry: string;
    country: string;
    currency: string;
    taxId: string;
    website: string;
    logoUrl: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
    isActive: boolean;
    timezone: string;
    locale: string;
    weekStartDay: string;
    standardWorkWeekHours: number;
    standardPtodays: number;
    settings: Record<string, any>;
    metadata: Record<string, any>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    employees: EmployeeEntity[];
    departments: DepartmentEntity[];
    compensationPlans: CompensationPlanEntity[];
    payrollRuns: PayrollRunEntity[];
}
//# sourceMappingURL=organization.entity.d.ts.map