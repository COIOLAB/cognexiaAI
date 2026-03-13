import { UUID } from 'crypto';
import { CompensationPlan, BenefitsPlan, SalaryStructure, BenefitsEnrollment, CreateCompensationPlanRequest, CreateBenefitsPlanRequest, CreateSalaryStructureRequest, CreateBenefitsEnrollmentRequest, PaginationOptions, PaginatedResponse, FilterOptions } from '../types';
export declare class CompensationService {
    private compensationModel;
    constructor();
    createCompensationPlan(organizationId: UUID, data: CreateCompensationPlanRequest): Promise<CompensationPlan>;
    getCompensationPlanById(id: UUID, organizationId: UUID): Promise<CompensationPlan | null>;
    updateCompensationPlan(id: UUID, data: Partial<CompensationPlan>, organizationId: UUID): Promise<CompensationPlan>;
    listCompensationPlans(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<CompensationPlan>>;
    deactivateCompensationPlan(id: UUID, organizationId: UUID): Promise<CompensationPlan>;
    createSalaryStructure(organizationId: UUID, data: CreateSalaryStructureRequest): Promise<SalaryStructure>;
    getSalaryStructureById(id: UUID, organizationId: UUID): Promise<SalaryStructure | null>;
    updateSalaryStructure(id: UUID, data: Partial<SalaryStructure>, organizationId: UUID): Promise<SalaryStructure>;
    listSalaryStructures(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<SalaryStructure>>;
    createBenefitsPlan(organizationId: UUID, data: CreateBenefitsPlanRequest): Promise<BenefitsPlan>;
    getBenefitsPlanById(id: UUID, organizationId: UUID): Promise<BenefitsPlan | null>;
    updateBenefitsPlan(id: UUID, data: Partial<BenefitsPlan>, organizationId: UUID): Promise<BenefitsPlan>;
    listBenefitsPlans(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<BenefitsPlan>>;
    createBenefitsEnrollment(organizationId: UUID, data: CreateBenefitsEnrollmentRequest): Promise<BenefitsEnrollment>;
    updateBenefitsEnrollment(id: UUID, data: Partial<BenefitsEnrollment>, organizationId: UUID): Promise<BenefitsEnrollment>;
    listBenefitsEnrollments(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<BenefitsEnrollment>>;
    getEmployeeBenefits(employeeId: UUID, organizationId: UUID): Promise<BenefitsEnrollment[]>;
    getCompensationAnalytics(organizationId: UUID, filters?: any): Promise<any>;
    getBenefitsUtilization(organizationId: UUID): Promise<any>;
    getCompensationBenchmark(organizationId: UUID, jobTitle: string, location?: string): Promise<any>;
    private validateCompensationPlan;
    private validateSalaryStructure;
    private validateBenefitsPlan;
    private validateBenefitsEnrollment;
    private checkBenefitsEligibility;
    private generateCompensationInsights;
}
//# sourceMappingURL=compensation.service.d.ts.map