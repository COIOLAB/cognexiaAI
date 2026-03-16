import { Repository, EntityManager } from 'typeorm';
interface BenefitPlan {
    id: string;
    name: string;
    type: BenefitType;
    category: BenefitCategory;
    provider: string;
    description: string;
    eligibilityRules: EligibilityRule[];
    costStructure: CostStructure;
    coverage: Coverage;
    aiOptimizationScore: number;
    quantumRiskAssessment: QuantumRiskProfile;
    active: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface EmployeeBenefitEnrollment {
    id: string;
    employeeId: string;
    benefitPlanId: string;
    enrollmentType: EnrollmentType;
    coverageLevel: CoverageLevel;
    dependents: Dependent[];
    premiums: PremiumStructure;
    deductions: DeductionStructure;
    effectiveDate: Date;
    endDate?: Date;
    status: EnrollmentStatus;
    aiRecommendations: AIBenefitRecommendation[];
    biometricOptimization: BiometricOptimization;
    blockchainVerification: BlockchainVerification;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
declare enum BenefitType {
    HEALTH_INSURANCE = "health_insurance",
    DENTAL_INSURANCE = "dental_insurance",
    VISION_INSURANCE = "vision_insurance",
    LIFE_INSURANCE = "life_insurance",
    DISABILITY_INSURANCE = "disability_insurance",
    RETIREMENT_401K = "retirement_401k",
    PENSION = "pension",
    FSA = "fsa",
    HSA = "hsa",
    COMMUTER_BENEFITS = "commuter_benefits",
    WELLNESS_PROGRAM = "wellness_program",
    TUITION_ASSISTANCE = "tuition_assistance",
    CHILDCARE_ASSISTANCE = "childcare_assistance",
    EMPLOYEE_ASSISTANCE = "employee_assistance",
    STOCK_OPTIONS = "stock_options",
    PAID_TIME_OFF = "paid_time_off",
    FLEXIBLE_WORK = "flexible_work"
}
declare enum BenefitCategory {
    INSURANCE = "insurance",
    RETIREMENT = "retirement",
    HEALTH_WELLNESS = "health_wellness",
    FINANCIAL = "financial",
    WORK_LIFE_BALANCE = "work_life_balance",
    PROFESSIONAL_DEVELOPMENT = "professional_development"
}
declare enum EnrollmentType {
    NEW_HIRE = "new_hire",
    ANNUAL_ENROLLMENT = "annual_enrollment",
    QUALIFYING_EVENT = "qualifying_event",
    MID_YEAR_CHANGE = "mid_year_change"
}
declare enum CoverageLevel {
    EMPLOYEE_ONLY = "employee_only",
    EMPLOYEE_SPOUSE = "employee_spouse",
    EMPLOYEE_CHILDREN = "employee_children",
    FAMILY = "family"
}
declare enum EnrollmentStatus {
    PENDING = "pending",
    ACTIVE = "active",
    INACTIVE = "inactive",
    TERMINATED = "terminated",
    SUSPENDED = "suspended"
}
interface EligibilityRule {
    condition: string;
    value: any;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
    aiValidated: boolean;
}
interface CostStructure {
    employerContribution: number;
    employeeContribution: number;
    costSharingRatio: number;
    aiOptimizedRates: boolean;
}
interface Coverage {
    annualMaximum?: number;
    deductible?: number;
    coInsurance?: number;
    copayments?: Record<string, number>;
    networkProviders?: string[];
    exclusions?: string[];
}
interface PremiumStructure {
    monthlyPremium: number;
    biweeklyPremium: number;
    annualPremium: number;
    employerPortion: number;
    employeePortion: number;
    taxAdvantaged: boolean;
}
interface DeductionStructure {
    preTaxDeductions: number;
    postTaxDeductions: number;
    rothContributions?: number;
    catchupContributions?: number;
}
interface Dependent {
    id: string;
    name: string;
    relationship: string;
    birthDate: Date;
    ssn?: string;
    biometricData?: BiometricProfile;
    aiHealthRiskScore?: number;
}
interface AIBenefitRecommendation {
    recommendationType: string;
    description: string;
    potentialSavings: number;
    confidenceScore: number;
    implementationPriority: 'low' | 'medium' | 'high' | 'urgent';
    quantumAnalysisScore: number;
}
interface BiometricOptimization {
    healthRiskScore: number;
    wellnessPrograms: string[];
    recommendedCoverage: string[];
    premiumDiscounts: number;
    aiPersonalizedPlan: boolean;
}
interface BlockchainVerification {
    transactionHash: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
    immutableRecord: boolean;
    smartContractAddress?: string;
}
interface QuantumRiskProfile {
    riskScore: number;
    volatilityIndex: number;
    predictiveAccuracy: number;
    optimizationRecommendations: string[];
}
interface BiometricProfile {
    bloodPressure?: string;
    cholesterol?: number;
    bmi?: number;
    smokingStatus?: boolean;
    exerciseFrequency?: number;
    stressLevel?: number;
    wellnessScore?: number;
}
interface COBRAAdministration {
    employeeId: string;
    qualifyingEvent: string;
    qualifyingEventDate: Date;
    notificationSent: boolean;
    notificationDate?: Date;
    electionDeadline: Date;
    electionMade?: boolean;
    coveragePeriod?: {
        startDate: Date;
        endDate: Date;
    };
    premiumAmount: number;
    paymentStatus: 'current' | 'delinquent' | 'terminated';
    aiComplianceMonitoring: boolean;
}
export declare class BenefitsAdministrationService {
    private readonly benefitPlanRepository;
    private readonly enrollmentRepository;
    private readonly entityManager;
    private readonly logger;
    constructor(benefitPlanRepository: Repository<BenefitPlan>, enrollmentRepository: Repository<EmployeeBenefitEnrollment>, entityManager: EntityManager);
    createBenefitPlan(planData: Partial<BenefitPlan>): Promise<BenefitPlan>;
    enrollEmployeeInBenefits(employeeId: string, enrollmentData: Partial<EmployeeBenefitEnrollment>): Promise<EmployeeBenefitEnrollment>;
    private optimizeBenefitPlan;
    private performQuantumRiskAnalysis;
    private generateAIBenefitRecommendations;
    private optimizeWithBiometrics;
    private initializeBlockchainVerification;
    private createBlockchainVerification;
    private calculateQuantumOptimizedPremiums;
    private validateEligibilityWithAI;
    private triggerEnrollmentWorkflows;
    initiateCOBRAProcess(employeeId: string, qualifyingEvent: string): Promise<COBRAAdministration>;
    private calculateCOBRAPremium;
    private sendCOBRANotification;
    getBenefitsUtilizationAnalytics(timeframe: string): Promise<any>;
    private generateUniqueId;
    getBenefitPlans(): Promise<BenefitPlan[]>;
    getEmployeeBenefits(employeeId: string): Promise<EmployeeBenefitEnrollment[]>;
    updateBenefitEnrollment(enrollmentId: string, updateData: Partial<EmployeeBenefitEnrollment>): Promise<EmployeeBenefitEnrollment>;
    healthCheck(): Promise<any>;
}
export {};
//# sourceMappingURL=benefits-administration.service.d.ts.map