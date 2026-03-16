// Industry 5.0 ERP Backend - HR Module Types
// TypeScript definitions for HR system
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';

// =====================
// BASE TYPES
// =====================

export interface BaseEntity {
  id: UUID;
  organizationId: UUID;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

// =====================
// EMPLOYEE TYPES
// =====================

export interface Employee extends BaseEntity {
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  displayName?: string;
  
  // Contact Information
  personalEmail?: string;
  workEmail: string;
  phoneNumber?: string;
  emergencyContact?: EmergencyContact;
  
  // Employment Details
  jobTitle: string;
  department: string;
  division?: string;
  location: string;
  managerId?: UUID;
  
  // Employment Status
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: Date;
  terminationDate?: Date;
  
  // Personal Information
  dateOfBirth?: Date;
  gender?: Gender;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  
  // Compensation
  baseSalary: number;
  currency: string;
  payGrade?: string;
  
  // System Access
  isActive: boolean;
  lastLoginAt?: Date;
  
  // Additional Data
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  profilePictureUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

// =====================
// ENUMS
// =====================

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  CONSULTANT = 'consultant',
  TEMPORARY = 'temporary'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated'
}

// =====================
// PERFORMANCE TYPES
// =====================

export interface PerformanceReview extends BaseEntity {
  employeeId: UUID;
  reviewerId: UUID;
  reviewPeriod: ReviewPeriod;
  reviewType: ReviewType;
  status: ReviewStatus;
  
  // Ratings
  overallRating: number;
  competencyRatings: CompetencyRating[];
  goalAchievements: GoalAchievement[];
  
  // Feedback
  strengths: string[];
  developmentAreas: string[];
  reviewerComments: string;
  employeeComments?: string;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  submissionDate?: Date;
  approvalDate?: Date;
}

export interface CompetencyRating {
  competencyId: UUID;
  competencyName: string;
  rating: number;
  weight: number;
  comments?: string;
}

export interface GoalAchievement {
  goalId: UUID;
  goalTitle: string;
  targetValue: number;
  actualValue: number;
  achievementPercentage: number;
  comments?: string;
}

export enum ReviewType {
  ANNUAL = 'annual',
  MID_YEAR = 'mid_year',
  QUARTERLY = 'quarterly',
  PROBATION = 'probation',
  PROJECT_BASED = 'project_based'
}

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ReviewPeriod {
  startDate: Date;
  endDate: Date;
  name: string;
}

// =====================
// TALENT ACQUISITION TYPES
// =====================

export interface JobRequisition extends BaseEntity {
  jobTitle: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  
  // Job Details
  jobDescription: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  
  // Compensation
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  currency: string;
  
  // Status and Timeline
  status: RequisitionStatus;
  priority: Priority;
  requestedPositions: number;
  filledPositions: number;
  
  // Approval
  requesterId: UUID;
  approverId?: UUID;
  approvalDate?: Date;
  
  // Dates
  targetStartDate?: Date;
  applicationDeadline?: Date;
  closedDate?: Date;
}

export interface JobApplication extends BaseEntity {
  requisitionId: UUID;
  candidateId: UUID;
  
  // Application Status
  status: ApplicationStatus;
  stage: ApplicationStage;
  
  // Application Details
  appliedDate: Date;
  resumePath?: string;
  coverLetterPath?: string;
  
  // Screening
  initialScreeningScore?: number;
  screeningNotes?: string;
  
  // Interview Process
  interviews: Interview[];
  
  // Decision
  finalDecision?: HiringDecision;
  decisionDate?: Date;
  decisionNotes?: string;
}

export interface Candidate extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  
  // Professional Information
  currentJobTitle?: string;
  currentCompany?: string;
  experienceYears?: number;
  
  // Application Materials
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  
  // Skills and Qualifications
  skills: string[];
  education: Education[];
  
  // Status
  candidateStatus: CandidateStatus;
  source: CandidateSource;
  
  // Communication
  lastContactDate?: Date;
  communicationHistory: CommunicationRecord[];
}

export interface Interview extends BaseEntity {
  applicationId: UUID;
  interviewerId: UUID;
  
  // Interview Details
  interviewType: InterviewType;
  scheduledDate: Date;
  duration: number;
  location?: string;
  meetingLink?: string;
  
  // Status
  status: InterviewStatus;
  
  // Evaluation
  overallRating?: number;
  technicalRating?: number;
  culturalFitRating?: number;
  communicationRating?: number;
  
  // Feedback
  strengths: string[];
  concerns: string[];
  recommendations: string;
  
  // AI Analysis
  aiAnalysisId?: UUID;
}

export interface Education {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  gpa?: number;
}

export interface CommunicationRecord {
  date: Date;
  type: CommunicationType;
  subject: string;
  notes: string;
  followUpRequired: boolean;
}

// =====================
// ENUMS FOR TALENT ACQUISITION
// =====================

export enum RequisitionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  FILLED = 'filled',
  CANCELLED = 'cancelled'
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  ASSESSMENT = 'assessment',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum ApplicationStage {
  APPLICATION_RECEIVED = 'application_received',
  INITIAL_SCREENING = 'initial_screening',
  PHONE_SCREENING = 'phone_screening',
  TECHNICAL_INTERVIEW = 'technical_interview',
  BEHAVIORAL_INTERVIEW = 'behavioral_interview',
  FINAL_INTERVIEW = 'final_interview',
  REFERENCE_CHECK = 'reference_check',
  BACKGROUND_CHECK = 'background_check',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined'
}

export enum InterviewType {
  PHONE_SCREENING = 'phone_screening',
  VIDEO_INTERVIEW = 'video_interview',
  IN_PERSON = 'in_person',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
  FINAL = 'final'
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum CandidateStatus {
  ACTIVE = 'active',
  INTERVIEWING = 'interviewing',
  OFFER_EXTENDED = 'offer_extended',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  ON_HOLD = 'on_hold'
}

export enum CandidateSource {
  DIRECT_APPLICATION = 'direct_application',
  EMPLOYEE_REFERRAL = 'employee_referral',
  RECRUITMENT_AGENCY = 'recruitment_agency',
  JOB_BOARD = 'job_board',
  SOCIAL_MEDIA = 'social_media',
  CAREER_FAIR = 'career_fair',
  UNIVERSITY = 'university',
  INTERNAL = 'internal'
}

export enum HiringDecision {
  HIRE = 'hire',
  NO_HIRE = 'no_hire',
  MAYBE = 'maybe',
  STRONG_HIRE = 'strong_hire',
  STRONG_NO_HIRE = 'strong_no_hire'
}

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  TEXT = 'text',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call'
}

// =====================
// COMMON UTILITY TYPES
// =====================

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================
// API REQUEST/RESPONSE TYPES
// =====================

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  department: string;
  location: string;
  managerId?: UUID;
  employmentType: EmploymentType;
  baseSalary: number;
  hireDate: Date;
  personalInfo?: Partial<Pick<Employee, 'personalEmail' | 'phoneNumber' | 'dateOfBirth' | 'gender' | 'maritalStatus'>>;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  managerId?: UUID;
  baseSalary?: number;
  employmentStatus?: EmploymentStatus;
}

export interface CreateJobRequisitionRequest {
  jobTitle: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  jobDescription: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  requestedPositions: number;
  priority: Priority;
  targetStartDate?: Date;
  applicationDeadline?: Date;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  totalCount: number;
  filters: {
    departments: string[];
    locations: string[];
    employmentTypes: EmploymentType[];
    employmentStatuses: EmploymentStatus[];
  };
}

// =====================
// ERROR TYPES
// =====================

export interface HRError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export enum HRErrorCodes {
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_EMPLOYEE_DATA = 'INVALID_EMPLOYEE_DATA',
  DUPLICATE_EMPLOYEE_EMAIL = 'DUPLICATE_EMPLOYEE_EMAIL',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_MANAGER_ASSIGNMENT = 'INVALID_MANAGER_ASSIGNMENT',
  REQUISITION_NOT_FOUND = 'REQUISITION_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  CANDIDATE_NOT_FOUND = 'CANDIDATE_NOT_FOUND',
  INTERVIEW_SCHEDULING_CONFLICT = 'INTERVIEW_SCHEDULING_CONFLICT',
  PERFORMANCE_REVIEW_NOT_FOUND = 'PERFORMANCE_REVIEW_NOT_FOUND',
  INVALID_PERFORMANCE_REVIEW_DATA = 'INVALID_PERFORMANCE_REVIEW_DATA',
  COMPENSATION_PLAN_NOT_FOUND = 'COMPENSATION_PLAN_NOT_FOUND',
  COMPENSATION_PLAN_ALREADY_EXISTS = 'COMPENSATION_PLAN_ALREADY_EXISTS',
  INVALID_COMPENSATION_DATA = 'INVALID_COMPENSATION_DATA',
  SALARY_STRUCTURE_NOT_FOUND = 'SALARY_STRUCTURE_NOT_FOUND',
  SALARY_STRUCTURE_OVERLAP = 'SALARY_STRUCTURE_OVERLAP',
  BENEFITS_PLAN_NOT_FOUND = 'BENEFITS_PLAN_NOT_FOUND',
  BENEFITS_PLAN_ALREADY_EXISTS = 'BENEFITS_PLAN_ALREADY_EXISTS',
  BENEFITS_ENROLLMENT_NOT_FOUND = 'BENEFITS_ENROLLMENT_NOT_FOUND',
  BENEFITS_ENROLLMENT_EXISTS = 'BENEFITS_ENROLLMENT_EXISTS',
  BENEFITS_ENROLLMENT_NOT_ELIGIBLE = 'BENEFITS_ENROLLMENT_NOT_ELIGIBLE',
  PAYROLL_RUN_NOT_FOUND = 'PAYROLL_RUN_NOT_FOUND',
  PAYROLL_PERIOD_OVERLAP = 'PAYROLL_PERIOD_OVERLAP',
  INVALID_PAYROLL_STATUS = 'INVALID_PAYROLL_STATUS',
  INVALID_PAYROLL_DATA = 'INVALID_PAYROLL_DATA',
  EXIT_RECORD_NOT_FOUND = 'EXIT_RECORD_NOT_FOUND',
  INVALID_EXIT_DATA = 'INVALID_EXIT_DATA',
  INVALID_EXIT_INTERVIEW_DATA = 'INVALID_EXIT_INTERVIEW_DATA',
  EXIT_INTERVIEW_NOT_FOUND = 'EXIT_INTERVIEW_NOT_FOUND',
  OFFBOARDING_CHECKLIST_NOT_FOUND = 'OFFBOARDING_CHECKLIST_NOT_FOUND',
  KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND = 'KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// =====================
// COMPENSATION AND BENEFITS TYPES
// =====================

export interface EmployeeCompensation extends BaseEntity {
  employeeId: UUID;
  effectiveDate: Date;
  baseSalary: number;
  currency: string;
  payGrade?: string;
  salaryType: 'annual' | 'hourly';
  overtimeEligible: boolean;
  commissionEligible: boolean;
  bonusEligible: boolean;
  equityPackage?: EquityPackage;
  benefits: BenefitsPackage;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  notes?: string;
}

export interface EquityPackage {
  stockOptions?: number;
  vestingSchedule?: string;
  exercisePrice?: number;
  grantDate?: Date;
}

export interface BenefitsPackage {
  healthInsurance: boolean;
  dentalInsurance: boolean;
  visionInsurance: boolean;
  retirementPlan: boolean;
  paidTimeOff: number;
  sickLeave: number;
  lifeInsurance: boolean;
  disabilityInsurance: boolean;
  flexibleSpendingAccount: boolean;
}

export interface CompensationPlan extends BaseEntity {
  name: string;
  description: string;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
  payGrades: PayGrade[];
  bonusStructure?: BonusStructure;
  equityStructure?: EquityStructure;
  benefitsPackage: BenefitsPackage;
}

export interface PayGrade {
  grade: string;
  title: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
}

export interface BonusStructure {
  type: 'performance' | 'profit_sharing' | 'sign_on' | 'retention';
  frequency: 'annual' | 'quarterly' | 'monthly' | 'one_time';
  eligibility: string[];
  calculation: string;
  maxPercent: number;
}

export interface EquityStructure {
  type: 'stock_options' | 'rsu' | 'espp';
  eligibility: string[];
  vestingSchedule: string;
  maxGrant: number;
}

export interface SalaryStructure extends BaseEntity {
  name: string;
  description: string;
  location: string;
  department?: string;
  payGrades: PayGrade[];
  effectiveDate: Date;
  isActive: boolean;
}

export interface PayEquityAnalysis {
  analysisDate: Date;
  totalEmployees: number;
  genderPayGap: {
    overall: number;
    byLevel: { level: string; gap: number }[];
    byDepartment: { department: string; gap: number }[];
  };
  raceEthnicityGaps: {
    group: string;
    gap: number;
  }[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  complianceScore: number;
}

export interface MarketDataAnalysis {
  position: string;
  location: string;
  marketRate: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  internalRate: {
    min: number;
    avg: number;
    max: number;
  };
  competitiveRatio: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface BlockchainPayTransparency {
  transactionId: string;
  employeeId: UUID;
  payPeriod: string;
  grossPay: number;
  netPay: number;
  deductions: { type: string; amount: number }[];
  timestamp: Date;
  verified: boolean;
  auditTrail: string[];
}

// PERFORMANCE ANALYSIS TYPES
export interface FeedbackRecord extends BaseEntity {
  fromEmployeeId: UUID;
  toEmployeeId: UUID;
  feedbackType: '360' | 'peer' | 'manager' | 'direct_report' | 'self';
  reviewPeriod: string;
  competencyScores: { competency: string; score: number }[];
  narrativeFeedback: string;
  strengths: string[];
  developmentAreas: string[];
  isAnonymous: boolean;
}

export interface CompetencyAssessment extends BaseEntity {
  employeeId: UUID;
  competencyFrameworkId: UUID;
  assessmentDate: Date;
  assessorId: UUID;
  scores: { competencyId: UUID; score: number; evidence: string }[];
  overallScore: number;
  developmentPlan: string[];
  nextAssessmentDate: Date;
}

export interface DevelopmentPlan extends BaseEntity {
  employeeId: UUID;
  planPeriod: { startDate: Date; endDate: Date };
  goals: DevelopmentGoal[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number;
  lastUpdated: Date;
}

export interface DevelopmentGoal {
  id: UUID;
  title: string;
  description: string;
  category: 'skill' | 'knowledge' | 'behavior' | 'certification';
  priority: Priority;
  targetDate: Date;
  resources: string[];
  milestones: { title: string; dueDate: Date; completed: boolean }[];
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

export interface PerformanceMetrics {
  period: string;
  overallScore: number;
  goalAchievement: number;
  competencyScore: number;
  behavioralScore: number;
  trends: { metric: string; trend: 'up' | 'down' | 'stable'; value: number }[];
  benchmarks: { category: string; percentile: number }[];
  improvementAreas: string[];
}

// REQUEST TYPES
export interface CreateEmployeeCompensationRequest {
  employeeId: UUID;
  effectiveDate: Date;
  baseSalary: number;
  currency: string;
  payGrade?: string;
  salaryType: 'annual' | 'hourly';
  overtimeEligible: boolean;
  benefits: Partial<BenefitsPackage>;
  notes?: string;
}

export interface UpdateEmployeeCompensationRequest {
  baseSalary?: number;
  payGrade?: string;
  salaryType?: 'annual' | 'hourly';
  overtimeEligible?: boolean;
  benefits?: Partial<BenefitsPackage>;
  notes?: string;
}

export interface CreateCompensationPlanRequest {
  name: string;
  description: string;
  effectiveDate: Date;
  endDate?: Date;
  payGrades: PayGrade[];
  benefitsPackage: BenefitsPackage;
}

export interface UpdateCompensationPlanRequest {
  name?: string;
  description?: string;
  endDate?: Date;
  payGrades?: PayGrade[];
  benefitsPackage?: Partial<BenefitsPackage>;
}

export interface CreateFeedbackRequest {
  toEmployeeId: UUID;
  feedbackType: '360' | 'peer' | 'manager' | 'direct_report' | 'self';
  reviewPeriod: string;
  competencyScores: { competency: string; score: number }[];
  narrativeFeedback: string;
  strengths: string[];
  developmentAreas: string[];
  isAnonymous: boolean;
}

export interface Create360FeedbackRequest {
  employeeId: UUID;
  reviewPeriod: string;
  participants: {
    participantId: UUID;
    relationship: 'manager' | 'peer' | 'direct_report' | 'customer' | 'other';
  }[];
  competencies: string[];
  deadline: Date;
}

export interface CreateCandidateProfileRequest {
  email: string;
  skills: string[];
  experienceYears?: number;
  education: Education[];
  resumeUrl?: string;
  portfolioUrl?: string;
  source: CandidateSource;
}

// SERVICE INTERFACES
// =====================

export interface EmployeeService {
  create(organizationId: UUID, data: CreateEmployeeRequest): Promise<Employee>;
  getById(id: UUID): Promise<Employee | null>;
  getByEmail(email: string): Promise<Employee | null>;
  update(id: UUID, data: UpdateEmployeeRequest): Promise<Employee>;
  delete(id: UUID): Promise<void>;
  list(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<Employee>>;
  search(organizationId: UUID, searchOptions: SearchOptions): Promise<Employee[]>;
  getDirectReports(managerId: UUID): Promise<Employee[]>;
  getManagerHierarchy(employeeId: UUID): Promise<Employee[]>;
}

export interface TalentAcquisitionService {
  createRequisition(organizationId: UUID, data: CreateJobRequisitionRequest): Promise<JobRequisition>;
  getRequisitionById(id: UUID): Promise<JobRequisition | null>;
  listRequisitions(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<JobRequisition>>;
  updateRequisitionStatus(id: UUID, status: RequisitionStatus): Promise<JobRequisition>;
  
  createApplication(candidateData: Partial<Candidate>, requisitionId: UUID): Promise<JobApplication>;
  getApplicationById(id: UUID): Promise<JobApplication | null>;
  updateApplicationStatus(id: UUID, status: ApplicationStatus, stage: ApplicationStage): Promise<JobApplication>;
  
  scheduleInterview(applicationId: UUID, interviewData: Partial<Interview>): Promise<Interview>;
  submitInterviewFeedback(interviewId: UUID, feedback: Partial<Interview>): Promise<Interview>;
}

// =====================
// PERFORMANCE MANAGEMENT TYPES
// =====================

export interface PerformanceGoal extends BaseEntity {
  employeeId: UUID;
  reviewId?: UUID;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  targetValue?: number;
  currentValue?: number;
  targetUnit?: string;
  weight: number;
  progress: number;
  status: GoalStatus;
  progressNotes?: string;
  lastUpdated?: Date;
}

export interface CompetencyFramework extends BaseEntity {
  name: string;
  description?: string;
  competencies: Competency[];
  isActive: boolean;
  version: string;
}

export interface Competency {
  id: UUID;
  name: string;
  description: string;
  category: string;
  weight: number;
  proficiencyLevels: ProficiencyLevel[];
}

export interface ProficiencyLevel {
  level: number;
  name: string;
  description: string;
  indicators: string[];
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CreatePerformanceReviewRequest {
  employeeId: UUID;
  reviewerId: UUID;
  reviewType: ReviewType;
  reviewPeriod: ReviewPeriod;
}

export interface CreatePerformanceGoalRequest {
  employeeId: UUID;
  reviewId?: UUID;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  targetValue?: number;
  targetUnit?: string;
  weight: number;
}

// =====================
// COMPENSATION & BENEFITS TYPES (EXTENDED)
// =====================

export interface ExtendedCompensationPlan extends BaseEntity {
  name: string;
  description?: string;
  type: CompensationType;
  baseSalary?: number;
  currency: string;
  components: CompensationComponent[];
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  eligibilityCriteria?: any;
  approvedBy?: UUID;
  approvalDate?: Date;
}

export interface CompensationComponent {
  id: UUID;
  name: string;
  type: ComponentType;
  amount: number;
  percentage?: number;
  frequency: PaymentFrequency;
  isTaxable: boolean;
  isVariable: boolean;
  conditions?: string;
}

export interface ExtendedSalaryStructure extends BaseEntity {
  gradeLevel: number;
  gradeName: string;
  minSalary: number;
  midSalary?: number;
  maxSalary: number;
  currency: string;
  effectiveDate: Date;
  expiryDate?: Date;
  stepIncrement?: number;
  benefits?: string[];
  jobTitles?: string[];
}

export interface BenefitsPlan extends BaseEntity {
  name: string;
  description?: string;
  type: BenefitType;
  provider?: string;
  cost: number;
  employerContribution: number;
  employeeContribution: number;
  currency: string;
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  eligibilityCriteria?: any;
  benefitDetails: BenefitDetail[];
  enrollmentPeriod?: EnrollmentPeriod;
}

export interface BenefitDetail {
  coverage: string;
  limit?: number;
  deductible?: number;
  copay?: number;
  exclusions?: string[];
}

export interface EnrollmentPeriod {
  startDate: Date;
  endDate: Date;
  isOpenEnrollment: boolean;
}

export interface BenefitsEnrollment extends BaseEntity {
  employeeId: UUID;
  benefitsPlanId: UUID;
  enrollmentDate: Date;
  effectiveDate: Date;
  terminationDate?: Date;
  status: EnrollmentStatus;
  employeeContribution: number;
  dependents?: BenefitDependent[];
  elections?: BenefitElection[];
}

export interface BenefitDependent {
  id: UUID;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  ssn?: string;
  isActive: boolean;
}

export interface BenefitElection {
  coverageType: string;
  coverageLevel: string;
  amount?: number;
  beneficiaries?: Beneficiary[];
}

export interface Beneficiary {
  name: string;
  relationship: string;
  percentage: number;
  isPrimary: boolean;
}

// =====================
// COMPENSATION ENUMS
// =====================

export enum CompensationType {
  SALARY = 'salary',
  HOURLY = 'hourly',
  COMMISSION = 'commission',
  CONTRACT = 'contract',
  EQUITY = 'equity',
  BONUS = 'bonus'
}

export enum ComponentType {
  BASE_SALARY = 'base_salary',
  BONUS = 'bonus',
  COMMISSION = 'commission',
  ALLOWANCE = 'allowance',
  OVERTIME = 'overtime',
  EQUITY = 'equity',
  BENEFITS = 'benefits',
  DEDUCTION = 'deduction'
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ONE_TIME = 'one_time'
}

export enum BenefitType {
  HEALTH_INSURANCE = 'health_insurance',
  DENTAL_INSURANCE = 'dental_insurance',
  VISION_INSURANCE = 'vision_insurance',
  LIFE_INSURANCE = 'life_insurance',
  DISABILITY_INSURANCE = 'disability_insurance',
  RETIREMENT = 'retirement',
  PAID_TIME_OFF = 'paid_time_off',
  FLEXIBLE_SPENDING = 'flexible_spending',
  WELLNESS = 'wellness',
  TRANSPORTATION = 'transportation',
  EDUCATION = 'education',
  OTHER = 'other'
}

export enum BenefitStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
  DECLINED = 'declined'
}

// =====================
// COMPENSATION REQUEST TYPES
// =====================

export interface CreateExtendedCompensationPlanRequest {
  name: string;
  description?: string;
  type: CompensationType;
  baseSalary?: number;
  currency: string;
  components: Omit<CompensationComponent, 'id'>[];
  effectiveDate: Date;
  expiryDate?: Date;
  eligibilityCriteria?: any;
}

export interface CreateSalaryStructureRequest {
  gradeLevel: number;
  gradeName: string;
  minSalary: number;
  midSalary?: number;
  maxSalary: number;
  currency: string;
  effectiveDate: Date;
  expiryDate?: Date;
  stepIncrement?: number;
  benefits?: string[];
  jobTitles?: string[];
}

export interface CreateBenefitsPlanRequest {
  name: string;
  description?: string;
  type: BenefitType;
  provider?: string;
  cost: number;
  employerContribution: number;
  employeeContribution: number;
  currency: string;
  effectiveDate: Date;
  expiryDate?: Date;
  eligibilityCriteria?: any;
  benefitDetails: BenefitDetail[];
  enrollmentPeriod?: EnrollmentPeriod;
}

export interface CreateBenefitsEnrollmentRequest {
  employeeId: UUID;
  benefitsPlanId: UUID;
  enrollmentDate: Date;
  effectiveDate: Date;
  employeeContribution: number;
  dependents?: Omit<BenefitDependent, 'id'>[];
  elections?: BenefitElection[];
}

// =====================
// PAYROLL MANAGEMENT TYPES
// =====================

export interface PayrollRun extends BaseEntity {
  name: string;
  description?: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  status: PayrollStatus;
  totalEmployees?: number;
  totalGrossPay?: number;
  totalNetPay?: number;
  totalDeductions?: number;
  processedDate?: Date;
  approvedBy?: UUID;
  approvedDate?: Date;
}

export interface PayrollRecord extends BaseEntity {
  payrollRunId: UUID;
  employeeId: UUID;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  deductions: PayrollDeduction[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  payslipUrl?: string;
}

export interface PayrollDeduction {
  id: UUID;
  type: DeductionType;
  name: string;
  amount: number;
  isPreTax: boolean;
  description?: string;
}

export interface TaxRule extends BaseEntity {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  rate?: number;
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum DeductionType {
  TAX = 'tax',
  BENEFIT = 'benefit',
  LOAN = 'loan',
  ADVANCE = 'advance',
  OTHER = 'other'
}

// =====================
// EXIT MANAGEMENT TYPES
// =====================

export interface ExitRecord extends BaseEntity {
  employeeId: UUID;
  exitType: ExitType;
  exitReason: string;
  lastWorkingDay: Date;
  noticeDate: Date;
  exitInterviewScheduled: boolean;
  exitInterviewCompleted: boolean;
  offboardingCompleted: boolean;
  knowledgeTransferCompleted: boolean;
  status: ExitStatus;
}

export interface ExitInterview extends BaseEntity {
  exitId: UUID;
  employeeId: UUID;
  interviewDate: Date;
  interviewer: UUID;
  responses: ExitInterviewResponse[];
  analysis?: ExitAnalysis;
  completed: boolean;
}

export interface ExitInterviewResponse {
  id: UUID;
  questionId: string;
  question: string;
  answer: string;
  rating?: number;
}

export interface ExitAnalysis {
  themes: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  riskFactors: string[];
  recommendedActions: string[];
}

export interface OffboardingChecklist extends BaseEntity {
  exitId: UUID;
  items: OffboardingChecklistItem[];
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  allCompleted: boolean;
}

export interface OffboardingChecklistItem {
  id: UUID;
  task: string;
  responsible: string;
  dueDate: string;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
}

export interface KnowledgeTransferPlan extends BaseEntity {
  departingEmployeeId: UUID;
  successorId: UUID;
  responsibilities: TransferResponsibility[];
  projects: TransferProject[];
  timeline: TransferTimelineItem[];
  status: TransferStatus;
  completionPercentage: number;
}

export interface TransferResponsibility {
  id: UUID;
  name: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  transferred: boolean;
  transferDate?: Date;
}

export interface TransferProject {
  id: UUID;
  name: string;
  description: string;
  status: string;
  handedOver: boolean;
  handoverDate?: Date;
}

export interface TransferTimelineItem {
  week: number;
  task: string;
  type: 'responsibility' | 'project';
  completed: boolean;
}

export enum ExitType {
  VOLUNTARY = 'voluntary',
  INVOLUNTARY = 'involuntary',
  RETIREMENT = 'retirement',
  CONTRACT_END = 'contract_end'
}

export enum ExitStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  INTERVIEW_COMPLETED = 'interview_completed',
  OFFBOARDING_COMPLETED = 'offboarding_completed',
  COMPLETED = 'completed'
}

export enum TransferStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

// =========================
// EXIT MANAGEMENT REQUESTS
// =========================

export interface InitiateExitRequest {
  employeeId: UUID;
  exitType: ExitType;
  exitReason: string;
  lastWorkingDay: Date;
  noticeDate?: Date;
  scheduleExitInterview?: boolean;
  exitInterviewDate?: Date;
  notes?: string;
}

export interface ExitInterviewRequest {
  employeeId: UUID;
  interviewDate: Date;
  interviewer: UUID;
  responses: ExitInterviewResponse[];
}

export interface KnowledgeTransferRequest {
  departingEmployeeId: UUID;
  successorId: UUID;
  transferStartDate?: Date;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface ExitAnalyticsFilters {
  period?: 'month' | 'quarter' | 'year';
  department?: UUID;
  exitType?: ExitType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface TurnoverReportFilters {
  department?: UUID;
  position?: string;
  dateFrom?: Date;
  dateTo?: Date;
  exitType?: ExitType;
}

// =====================
// PAYROLL REQUEST TYPES
// =====================

export interface CreatePayrollRunRequest {
  name: string;
  description?: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  includeEmployeeIds?: UUID[];
  excludeEmployeeIds?: UUID[];
}

export interface CreatePayrollRecordRequest {
  payrollRunId: UUID;
  employeeId: UUID;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  deductions: PayrollDeduction[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
}

export interface CreateTaxRuleRequest {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  rate?: number;
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  effectiveDate: Date;
  expiryDate?: Date;
}

// =====================
// REVOLUTIONARY SERVICES TYPES
// =====================

// Executive Dashboard & Analytics Types
export interface ExecutiveDashboard {
  organizationId: UUID;
  timeframe: 'quarterly' | 'monthly' | 'yearly';
  generatedAt: Date;
  keyMetrics: {
    totalEmployees: number;
    employeeGrowthRate: number;
    averageTenure: number;
    retentionRate: number;
    engagementScore: number;
    diversityIndex: number;
    totalCompensationCost: number;
    averageCompensation: number;
    payEquityScore: number;
    performanceScore: number;
    goalCompletionRate: number;
    talentAcquisitionVelocity: number;
    costPerHire: number;
    timeToFill: number;
  };
  visualizations: {
    employeeTrendChart: any;
    compensationHeatmap: any;
    performanceMatrix: any;
    talentFunnelChart: any;
    diversityChart: any;
    retentionAnalysis: any;
    costAnalysisChart: any;
    productivityMetrics: any;
  };
  strategicInsights: AIInsight[];
  riskFactors: AIInsight[];
  opportunities: AIInsight[];
  recommendations: {
    title: string;
    description: string;
    priority: number;
    expectedImpact: string;
    timeline: string;
  }[];
}

export interface HRAnalyticsReport {
  id: UUID;
  title: string;
  reportType: string;
  organizationId: UUID;
  generatedAt: Date;
  data: any;
  insights: AIInsight[];
  metrics: Record<string, number>;
  visualizations: Record<string, any>;
}

export interface BoardPresentationData {
  organizationId: UUID;
  title: string;
  createdAt: Date;
  slides: PresentationSlide[];
  executiveSummary: string;
  keyInsights: string[];
  recommendations: string[];
}

export interface PresentationSlide {
  id: number;
  title: string;
  content: any;
  type: 'chart' | 'table' | 'text' | 'image';
}

export interface ReportConfiguration {
  id: UUID;
  name: string;
  type: string;
  parameters: Record<string, any>;
  schedule?: ScheduleConfig;
  recipients: string[];
  format: ExportFormat;
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
}

export interface ChartConfiguration {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  xAxis: string;
  yAxis: string;
  data: any[];
  options: Record<string, any>;
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  POWERPOINT = 'powerpoint',
  WORD = 'word',
  INTERACTIVE = 'interactive',
  VIDEO = 'video'
}

export interface ReportTemplate {
  id: UUID;
  name: string;
  description: string;
  type: string;
  template: any;
  variables: string[];
  isActive: boolean;
}

export interface AIInsight {
  id: UUID;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  details: string;
  confidence: number;
  generatedAt: Date;
  metadata?: Record<string, any>;
}

export interface QuantumAnalytics {
  overallScore: number;
  metrics: QuantumMetric[];
  predictions: QuantumPrediction[];
  correlations: QuantumCorrelation[];
}

export interface QuantumMetric {
  name: string;
  value: number;
  quantumScore: number;
  uncertainty: number;
}

export interface QuantumPrediction {
  metric: string;
  predictedValue: number;
  confidence: number;
  timeframe: string;
}

export interface QuantumCorrelation {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: number;
}

export interface NLPAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  keyTopics: string[];
  entities: NLPEntity[];
  summary: string;
  confidence: number;
}

export interface NLPEntity {
  text: string;
  type: string;
  confidence: number;
}

export interface PredictiveAnalytics {
  overallAccuracy: number;
  predictions: Prediction[];
  trends: Trend[];
  forecasts: Forecast[];
}

export interface Prediction {
  metric: string;
  value: number;
  confidence: number;
  timeframe: string;
}

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  strength: number;
  significance: number;
}

export interface Forecast {
  metric: string;
  period: string;
  values: number[];
  confidence: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Missing types for HR services
export interface SmartRecommendation {
  id: UUID;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  actionRequired: boolean;
  metadata?: Record<string, any>;
}

export interface SkillRequirement {
  id: UUID;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
  weight: number;
  category: string;
}

export interface JobFamily {
  id: UUID;
  name: string;
  description: string;
  category: string;
  level: number;
  parentId?: UUID;
  skills: SkillRequirement[];
}

export interface PositionBenchmark {
  id: UUID;
  positionId: UUID;
  industryAverage: number;
  marketRate: number;
  percentile: number;
  source: string;
  lastUpdated: Date;
}

export interface NeuroFeedbackData {
  id: UUID;
  employeeId: UUID;
  sessionType: string;
  cognitiveLoad: number;
  focusLevel: number;
  stressLevel: number;
  recommendations: string[];
  timestamp: Date;
}

export interface BiometricInsights {
  id: UUID;
  employeeId: UUID;
  heartRate: number;
  stressLevel: number;
  energyLevel: number;
  wellbeingScore: number;
  recommendations: string[];
  timestamp: Date;
}

export interface BlockchainVerification {
  id: UUID;
  transactionHash: string;
  verified: boolean;
  timestamp: Date;
  validatorId: string;
  metadata: Record<string, any>;
}

export interface VRTrainingModule {
  id: UUID;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  skills: string[];
  completionRate: number;
}

export interface ARWorkspaceOptimization {
  id: UUID;
  workspaceId: UUID;
  optimizations: {
    ergonomics: number;
    efficiency: number;
    safety: number;
  };
  recommendations: string[];
  implementation: string[];
}

export interface DigitalTwinAnalysis {
  id: UUID;
  entityId: UUID;
  entityType: string;
  predictions: any[];
  simulations: any[];
  optimizations: any[];
  confidence: number;
}

export interface EdgeAIProcessor {
  id: UUID;
  processorType: string;
  capabilities: string[];
  performance: {
    latency: number;
    throughput: number;
    accuracy: number;
  };
  status: 'online' | 'offline' | 'maintenance';
}

export interface HyperPersonalization {
  id: UUID;
  userId: UUID;
  preferences: Record<string, any>;
  behaviorPatterns: any[];
  recommendations: SmartRecommendation[];
  lastUpdated: Date;
}

// Performance related types
export interface PerformanceAnalytics {
  overallScore: number;
  metrics: PerformanceMetrics[];
  trends: Trend[];
  predictions: Prediction[];
  recommendations: SmartRecommendation[];
}

export interface AICoachingInsight {
  id: UUID;
  employeeId: UUID;
  insight: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  confidence: number;
}

export interface NeuroPerformanceProfile {
  id: UUID;
  employeeId: UUID;
  cognitivePatterns: any[];
  learningStyle: string;
  peakPerformanceTimes: string[];
  stressThreshold: number;
}

export interface QuantumPerformanceOptimization {
  id: UUID;
  optimizationType: string;
  parameters: Record<string, any>;
  expectedImpact: number;
  confidence: number;
  implementation: string[];
}

export interface BlockchainAchievementVerification {
  id: UUID;
  achievementId: UUID;
  employeeId: UUID;
  verified: boolean;
  transactionHash: string;
  validators: string[];
  timestamp: Date;
}

export interface RealTimePerformanceTracking {
  id: UUID;
  employeeId: UUID;
  metrics: Record<string, number>;
  alerts: Alert[];
  lastUpdated: Date;
  status: 'normal' | 'warning' | 'critical';
}

export interface MetaverseCoachingExperience {
  id: UUID;
  sessionId: UUID;
  employeeId: UUID;
  coachId: UUID;
  environment: string;
  duration: number;
  objectives: string[];
  outcomes: string[];
}

export interface BiometricPerformanceIndicators {
  id: UUID;
  employeeId: UUID;
  vitals: {
    heartRate: number;
    bloodPressure: number;
    oxygenSaturation: number;
  };
  cognitiveState: string;
  physicalState: string;
  recommendations: string[];
}

export interface HolisticWellbeingAssessment {
  id: UUID;
  employeeId: UUID;
  dimensions: {
    physical: number;
    mental: number;
    emotional: number;
    social: number;
    spiritual: number;
  };
  overallScore: number;
  recommendations: string[];
}

// Compensation Analytics placeholder
export interface CompensationAnalytics {
  overallScore: number;
  metrics: any[];
  trends: Trend[];
  predictions: Prediction[];
  benchmarks: any[];
}

// Board Presentation Data




// Request Types
export interface ReportsAnalyticsRequest {
  organizationId: UUID;
  timeframe?: 'monthly' | 'quarterly' | 'yearly';
  filters?: Record<string, any>;
  includeAI?: boolean;
}

export interface ExecutiveReportRequest {
  organizationId: UUID;
  timeframe: 'quarterly' | 'monthly' | 'yearly';
  focus?: string[];
  includeComparisons?: boolean;
}

export interface BoardPresentationRequest {
  organizationId: UUID;
  title: string;
  audience: 'board' | 'executives' | 'investors';
  focus: string[];
  includeFinancials: boolean;
  format: 'slides' | 'document' | 'dashboard';
}

export interface CustomReportRequest {
  organizationId: UUID;
  title: string;
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  format: ExportFormat;
  schedule?: ScheduleConfig;
}

// Analytics Types
export interface RealTimeMetrics {
  timestamp: Date;
  metrics: Record<string, number>;
  alerts: Alert[];
  status: 'healthy' | 'warning' | 'critical';
}

export interface Alert {
  id: UUID;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export interface CompetitiveBenchmarking {
  overallRanking: number;
  industryAverage: Record<string, number>;
  topPerformers: Record<string, number>;
  gaps: BenchmarkGap[];
  recommendations: string[];
}

export interface BenchmarkGap {
  metric: string;
  current: number;
  benchmark: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
}

export interface ROIAnalysis {
  totalInvestment: number;
  totalReturn: number;
  roiPercentage: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
  categories: ROICategory[];
}

export interface ROICategory {
  name: string;
  investment: number;
  return: number;
  roi: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  velocity: number;
  seasonality?: SeasonalPattern;
  projections: TrendProjection[];
}

export interface SeasonalPattern {
  pattern: 'monthly' | 'quarterly' | 'yearly';
  strength: number;
  peaks: number[];
  valleys: number[];
}

export interface TrendProjection {
  period: string;
  value: number;
  confidence: number;
}

export interface HeatmapData {
  dimensions: string[];
  data: HeatmapCell[];
  colorScale: ColorScale;
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
}

export interface ColorScale {
  min: string;
  max: string;
  steps?: string[];
}

export interface GeospatialAnalytics {
  regions: GeospatialRegion[];
  metrics: Record<string, number>;
  heatmap: any;
  clusters: GeospatialCluster[];
}

export interface GeospatialRegion {
  id: string;
  name: string;
  coordinates: number[];
  metrics: Record<string, number>;
}

export interface GeospatialCluster {
  center: number[];
  radius: number;
  points: number;
  metrics: Record<string, number>;
}

export interface SentimentAnalytics {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  categories: SentimentCategory[];
  trends: SentimentTrend[];
}

export interface SentimentCategory {
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  volume: number;
}

export interface SentimentTrend {
  period: string;
  sentiment: number;
  volume: number;
}

export interface PersonaAnalytics {
  personas: EmployeePersona[];
  segments: PersonaSegment[];
  insights: PersonaInsight[];
}

export interface EmployeePersona {
  id: string;
  name: string;
  characteristics: Record<string, any>;
  size: number;
  percentage: number;
}

export interface PersonaSegment {
  name: string;
  criteria: Record<string, any>;
  size: number;
  metrics: Record<string, number>;
}

export interface PersonaInsight {
  persona: string;
  insight: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface IndustryComparisons {
  industry: string;
  benchmarks: IndustryBenchmark[];
  rankings: IndustryRanking[];
  gaps: IndustryGap[];
}

export interface IndustryBenchmark {
  metric: string;
  industryAverage: number;
  topQuartile: number;
  organizationValue: number;
}

export interface IndustryRanking {
  metric: string;
  rank: number;
  percentile: number;
  total: number;
}

export interface IndustryGap {
  metric: string;
  gap: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PredictiveModeling {
  models: PredictiveModel[];
  accuracy: number;
  features: ModelFeature[];
  predictions: ModelPrediction[];
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: Date;
}

export interface ModelFeature {
  name: string;
  importance: number;
  type: 'numerical' | 'categorical' | 'text';
}

export interface ModelPrediction {
  model: string;
  target: string;
  value: number;
  confidence: number;
  factors: string[];
}

// Talent Acquisition Revolutionary Types
export interface CandidateProfile {
  id: UUID;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  professionalInfo: {
    currentRole?: string;
    experience: number;
    skills: string[];
    certifications: string[];
  };
  assessments: CandidateAssessment[];
  aiScore: number;
  matchScore?: number;
}

export interface Offer {
  id: UUID;
  candidateId: UUID;
  positionId: UUID;
  salary: number;
  benefits: string[];
  startDate: Date;
  status: OfferStatus;
  terms: OfferTerm[];
}

export enum OfferStatus {
  DRAFT = 'draft',
  EXTENDED = 'extended',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export interface OfferTerm {
  category: string;
  description: string;
  value: any;
}

export interface RecruitmentCampaign {
  id: UUID;
  name: string;
  positions: UUID[];
  channels: RecruitmentChannel[];
  budget: number;
  startDate: Date;
  endDate: Date;
  metrics: CampaignMetrics;
}

export interface RecruitmentChannel {
  type: string;
  name: string;
  cost: number;
  performance: ChannelPerformance;
}

export interface ChannelPerformance {
  applications: number;
  interviews: number;
  hires: number;
  costPerHire: number;
}

export interface CampaignMetrics {
  totalApplications: number;
  qualifiedApplications: number;
  interviews: number;
  offers: number;
  hires: number;
  costPerHire: number;
  timeToHire: number;
}

export interface CreateCandidateProfileRequest {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  professionalInfo: {
    currentRole?: string;
    experience: number;
    skills: string[];
    certifications?: string[];
  };
  resumeUrl?: string;
}

export interface CreateInterviewRequest {
  candidateId: UUID;
  positionId: UUID;
  interviewType: InterviewType;
  scheduledDate: Date;
  duration: number;
  interviewers: UUID[];
  location?: string;
  notes?: string;
}

export interface CreateOfferRequest {
  candidateId: UUID;
  positionId: UUID;
  salary: number;
  benefits: string[];
  startDate: Date;
  terms: OfferTerm[];
  expiryDate?: Date;
}

export interface CandidateAssessment {
  id: UUID;
  type: AssessmentType;
  score: number;
  maxScore: number;
  completedDate: Date;
  details: any;
}

export enum AssessmentType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  COGNITIVE = 'cognitive',
  PERSONALITY = 'personality',
  CULTURE_FIT = 'culture_fit'
}

export interface TalentPoolEntry {
  id: UUID;
  candidateId: UUID;
  source: string;
  addedDate: Date;
  status: 'active' | 'inactive';
  tags: string[];
  notes: string;
}

export interface RecruitmentAnalytics {
  period: string;
  totalPositions: number;
  totalApplications: number;
  hireRate: number;
  timeToHire: number;
  costPerHire: number;
  sourceEffectiveness: SourceEffectiveness[];
  diversityMetrics: DiversityMetrics;
}

export interface SourceEffectiveness {
  source: string;
  applications: number;
  hires: number;
  cost: number;
  effectiveness: number;
}

export interface DiversityMetrics {
  gender: Record<string, number>;
  ethnicity: Record<string, number>;
  age: Record<string, number>;
  education: Record<string, number>;
}

// AI and Advanced Analytics Types
export interface CandidateMatchingScore {
  candidateId: UUID;
  positionId: UUID;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  culturalFit: number;
  factors: MatchingFactor[];
}

export interface MatchingFactor {
  factor: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface RecruitmentPrediction {
  candidateId: UUID;
  positionId: UUID;
  successProbability: number;
  retentionProbability: number;
  performancePrediction: number;
  factors: string[];
}

export interface TalentMarketIntelligence {
  region: string;
  skills: SkillDemand[];
  salaryTrends: SalaryTrend[];
  competitionAnalysis: CompetitionAnalysis[];
}

export interface SkillDemand {
  skill: string;
  demand: 'low' | 'medium' | 'high';
  growth: number;
  averageSalary: number;
}

export interface SalaryTrend {
  position: string;
  currentSalary: number;
  trend: number;
  projectedSalary: number;
}

export interface CompetitionAnalysis {
  competitor: string;
  advantages: string[];
  disadvantages: string[];
  talentOverlap: number;
}

export interface BlockchainCredentialVerification {
  candidateId: UUID;
  credentials: BlockchainCredential[];
  verificationStatus: 'pending' | 'verified' | 'failed';
  blockchain: string;
  hash: string;
}

export interface BlockchainCredential {
  type: string;
  issuer: string;
  issueDate: Date;
  verified: boolean;
  blockchainId: string;
}

export interface NeuroPersonalityProfile {
  candidateId: UUID;
  traits: PersonalityTrait[];
  compatibility: number;
  strengths: string[];
  developmentAreas: string[];
  teamFit: TeamCompatibility;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  percentile: number;
  description: string;
}

export interface TeamCompatibility {
  teamId: UUID;
  compatibility: number;
  dynamics: string[];
  recommendations: string[];
}

export interface BiometricAssessment {
  candidateId: UUID;
  assessmentType: 'voice' | 'facial' | 'physiological';
  metrics: BiometricMetric[];
  stressLevel: number;
  authenticityScore: number;
  recommendations: string[];
}

export interface BiometricMetric {
  metric: string;
  value: number;
  normalRange: [number, number];
  interpretation: string;
}

export interface MetaverseInterviewExperience {
  sessionId: UUID;
  candidateId: UUID;
  interviewerId: UUID;
  environment: string;
  duration: number;
  interactions: VRInteraction[];
  immersionScore: number;
  performanceMetrics: VRPerformanceMetric[];
}

export interface VRInteraction {
  timestamp: Date;
  type: string;
  data: any;
  score?: number;
}

export interface VRPerformanceMetric {
  metric: string;
  value: number;
  benchmark: number;
  evaluation: 'poor' | 'average' | 'good' | 'excellent';
}

// Performance Management Revolutionary Types
export interface ReviewPeriod {
  start: Date;
  end: Date;
  name: string;
  type: ReviewType;
}

// Time & Attendance Missing Error Codes
export const HRErrorCodesExtension = {
  ...HRErrorCodes,
  ALREADY_CLOCKED_IN: 'ALREADY_CLOCKED_IN',
  NOT_CLOCKED_IN: 'NOT_CLOCKED_IN',
  LEAVE_REQUEST_OVERLAP: 'LEAVE_REQUEST_OVERLAP',
  INVALID_LEAVE_REQUEST: 'INVALID_LEAVE_REQUEST',
  INVALID_PERFORMANCE_DATA: 'INVALID_PERFORMANCE_DATA',
  INVALID_JOB_REQUISITION_DATA: 'INVALID_JOB_REQUISITION_DATA',
  INVALID_REQUISITION_DATA: 'INVALID_REQUISITION_DATA'
} as const;

// Add missing error codes to the enum
export enum HRErrorCodesComplete {
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_EMPLOYEE_DATA = 'INVALID_EMPLOYEE_DATA',
  DUPLICATE_EMPLOYEE_EMAIL = 'DUPLICATE_EMPLOYEE_EMAIL',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_MANAGER_ASSIGNMENT = 'INVALID_MANAGER_ASSIGNMENT',
  REQUISITION_NOT_FOUND = 'REQUISITION_NOT_FOUND',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  CANDIDATE_NOT_FOUND = 'CANDIDATE_NOT_FOUND',
  INTERVIEW_SCHEDULING_CONFLICT = 'INTERVIEW_SCHEDULING_CONFLICT',
  PERFORMANCE_REVIEW_NOT_FOUND = 'PERFORMANCE_REVIEW_NOT_FOUND',
  INVALID_PERFORMANCE_REVIEW_DATA = 'INVALID_PERFORMANCE_REVIEW_DATA',
  COMPENSATION_PLAN_NOT_FOUND = 'COMPENSATION_PLAN_NOT_FOUND',
  COMPENSATION_PLAN_ALREADY_EXISTS = 'COMPENSATION_PLAN_ALREADY_EXISTS',
  INVALID_COMPENSATION_DATA = 'INVALID_COMPENSATION_DATA',
  SALARY_STRUCTURE_NOT_FOUND = 'SALARY_STRUCTURE_NOT_FOUND',
  SALARY_STRUCTURE_OVERLAP = 'SALARY_STRUCTURE_OVERLAP',
  BENEFITS_PLAN_NOT_FOUND = 'BENEFITS_PLAN_NOT_FOUND',
  BENEFITS_PLAN_ALREADY_EXISTS = 'BENEFITS_PLAN_ALREADY_EXISTS',
  BENEFITS_ENROLLMENT_NOT_FOUND = 'BENEFITS_ENROLLMENT_NOT_FOUND',
  BENEFITS_ENROLLMENT_EXISTS = 'BENEFITS_ENROLLMENT_EXISTS',
  BENEFITS_ENROLLMENT_NOT_ELIGIBLE = 'BENEFITS_ENROLLMENT_NOT_ELIGIBLE',
  PAYROLL_RUN_NOT_FOUND = 'PAYROLL_RUN_NOT_FOUND',
  PAYROLL_PERIOD_OVERLAP = 'PAYROLL_PERIOD_OVERLAP',
  INVALID_PAYROLL_STATUS = 'INVALID_PAYROLL_STATUS',
  INVALID_PAYROLL_DATA = 'INVALID_PAYROLL_DATA',
  EXIT_RECORD_NOT_FOUND = 'EXIT_RECORD_NOT_FOUND',
  INVALID_EXIT_DATA = 'INVALID_EXIT_DATA',
  INVALID_EXIT_INTERVIEW_DATA = 'INVALID_EXIT_INTERVIEW_DATA',
  EXIT_INTERVIEW_NOT_FOUND = 'EXIT_INTERVIEW_NOT_FOUND',
  OFFBOARDING_CHECKLIST_NOT_FOUND = 'OFFBOARDING_CHECKLIST_NOT_FOUND',
  KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND = 'KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND',
  ALREADY_CLOCKED_IN = 'ALREADY_CLOCKED_IN',
  NOT_CLOCKED_IN = 'NOT_CLOCKED_IN',
  LEAVE_REQUEST_OVERLAP = 'LEAVE_REQUEST_OVERLAP',
  INVALID_LEAVE_REQUEST = 'INVALID_LEAVE_REQUEST',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  INVALID_JOB_REQUISITION_DATA = 'INVALID_JOB_REQUISITION_DATA',
  INVALID_REQUISITION_DATA = 'INVALID_REQUISITION_DATA',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
