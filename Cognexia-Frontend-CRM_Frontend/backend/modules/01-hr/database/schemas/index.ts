// Industry 5.0 ERP Backend - HR Database Schemas Export
// Centralized export for all HR database entities
// Author: AI Assistant
// Date: 2024

// Employee Management
export * from './Employee.model';

// Performance Management
export * from './Performance.model';

// Talent Acquisition & Recruitment
export * from './TalentAcquisition.model';

// Compensation & Benefits
export * from './Compensation.model';

// Payroll & Exit Management
export * from './PayrollExit.model';

// HR Entity Categories for easy reference
export const HR_ENTITIES = {
  // Core Employee
  EMPLOYEE: 'Employee',
  
  // Performance Management
  PERFORMANCE_REVIEW: 'PerformanceReview',
  PERFORMANCE_GOAL: 'PerformanceGoal',
  COMPETENCY_FRAMEWORK: 'CompetencyFramework',
  FEEDBACK_360_CYCLE: 'Feedback360Cycle',
  FEEDBACK_360_RESPONSE: 'Feedback360Response',
  
  // Talent Acquisition
  JOB_REQUISITION: 'JobRequisition',
  CANDIDATE: 'Candidate',
  JOB_APPLICATION: 'JobApplication',
  INTERVIEW: 'Interview',
  
  // Compensation & Benefits
  COMPENSATION_PLAN: 'CompensationPlan',
  SALARY_STRUCTURE: 'SalaryStructure',
  BENEFITS_PLAN: 'BenefitsPlan',
  BENEFITS_ENROLLMENT: 'BenefitsEnrollment',
  EMPLOYEE_COMPENSATION: 'EmployeeCompensation',
  
  // Payroll
  PAYROLL_RUN: 'PayrollRun',
  PAYROLL_RECORD: 'PayrollRecord',
  TAX_RULE: 'TaxRule',
  
  // Exit Management
  EXIT_RECORD: 'ExitRecord',
  EXIT_INTERVIEW: 'ExitInterview',
  OFFBOARDING_CHECKLIST: 'OffboardingChecklist',
  KNOWLEDGE_TRANSFER_PLAN: 'KnowledgeTransferPlan'
} as const;

// HR Entity Relationships Map
export const HR_RELATIONSHIPS = {
  // Employee is central to most relationships
  Employee: {
    hasMany: [
      'PerformanceReview',
      'PerformanceGoal',
      'JobApplication',
      'Interview',
      'BenefitsEnrollment',
      'PayrollRecord',
      'ExitRecord'
    ],
    belongsTo: ['Organization'],
    relatedTo: ['Employee'] // Manager relationship
  },
  
  // Performance Management relationships
  PerformanceReview: {
    belongsTo: ['Employee', 'Organization'],
    hasMany: ['PerformanceGoal'],
    relatedTo: ['CompetencyFramework']
  },
  
  // Talent Acquisition relationships
  JobRequisition: {
    belongsTo: ['Organization', 'Employee'], // Requester
    hasMany: ['JobApplication']
  },
  
  JobApplication: {
    belongsTo: ['JobRequisition', 'Candidate'],
    hasMany: ['Interview']
  },
  
  // Compensation relationships
  CompensationPlan: {
    belongsTo: ['Organization'],
    hasMany: ['EmployeeCompensation']
  },
  
  BenefitsPlan: {
    belongsTo: ['Organization'],
    hasMany: ['BenefitsEnrollment']
  },
  
  // Payroll relationships
  PayrollRun: {
    belongsTo: ['Organization'],
    hasMany: ['PayrollRecord']
  },
  
  // Exit Management relationships
  ExitRecord: {
    belongsTo: ['Employee', 'Organization'],
    hasMany: ['ExitInterview', 'OffboardingChecklist', 'KnowledgeTransferPlan']
  }
} as const;

// Database Table Names (for raw queries if needed)
export const HR_TABLES = {
  EMPLOYEES: 'hr_employees',
  PERFORMANCE_REVIEWS: 'hr_performance_reviews',
  PERFORMANCE_GOALS: 'hr_performance_goals',
  COMPETENCY_FRAMEWORKS: 'hr_competency_frameworks',
  FEEDBACK_360_CYCLES: 'hr_360_feedback_cycles',
  FEEDBACK_360_RESPONSES: 'hr_360_feedback_responses',
  JOB_REQUISITIONS: 'hr_job_requisitions',
  CANDIDATES: 'hr_candidates',
  JOB_APPLICATIONS: 'hr_job_applications',
  INTERVIEWS: 'hr_interviews',
  COMPENSATION_PLANS: 'hr_compensation_plans',
  SALARY_STRUCTURES: 'hr_salary_structures',
  BENEFITS_PLANS: 'hr_benefits_plans',
  BENEFITS_ENROLLMENTS: 'hr_benefits_enrollments',
  EMPLOYEE_COMPENSATION: 'hr_employee_compensation',
  PAYROLL_RUNS: 'hr_payroll_runs',
  PAYROLL_RECORDS: 'hr_payroll_records',
  TAX_RULES: 'hr_tax_rules',
  EXIT_RECORDS: 'hr_exit_records',
  EXIT_INTERVIEWS: 'hr_exit_interviews',
  OFFBOARDING_CHECKLISTS: 'hr_offboarding_checklists',
  KNOWLEDGE_TRANSFER_PLANS: 'hr_knowledge_transfer_plans'
} as const;

// Common HR Database Operations
export const HR_OPERATIONS = {
  // Employee lifecycle operations
  EMPLOYEE_ONBOARDING: 'employee_onboarding',
  EMPLOYEE_PROMOTION: 'employee_promotion',
  EMPLOYEE_TRANSFER: 'employee_transfer',
  EMPLOYEE_TERMINATION: 'employee_termination',
  
  // Performance operations
  REVIEW_CYCLE_START: 'review_cycle_start',
  REVIEW_COMPLETION: 'review_completion',
  GOAL_SETTING: 'goal_setting',
  
  // Recruitment operations
  JOB_POSTING: 'job_posting',
  APPLICATION_SCREENING: 'application_screening',
  INTERVIEW_SCHEDULING: 'interview_scheduling',
  OFFER_EXTENSION: 'offer_extension',
  
  // Payroll operations
  PAYROLL_PROCESSING: 'payroll_processing',
  PAYROLL_APPROVAL: 'payroll_approval',
  PAYSLIP_GENERATION: 'payslip_generation',
  
  // Benefits operations
  BENEFITS_ENROLLMENT: 'benefits_enrollment',
  BENEFITS_CHANGE: 'benefits_change',
  OPEN_ENROLLMENT: 'open_enrollment'
} as const;

// HR Analytics Views (for reporting)
export const HR_ANALYTICS_VIEWS = {
  EMPLOYEE_METRICS: 'vw_employee_metrics',
  PERFORMANCE_DASHBOARD: 'vw_performance_dashboard',
  RECRUITMENT_FUNNEL: 'vw_recruitment_funnel',
  COMPENSATION_ANALYSIS: 'vw_compensation_analysis',
  PAYROLL_SUMMARY: 'vw_payroll_summary',
  TURNOVER_ANALYSIS: 'vw_turnover_analysis',
  BENEFITS_UTILIZATION: 'vw_benefits_utilization'
} as const;
