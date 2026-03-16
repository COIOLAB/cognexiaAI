// Industry 5.0 ERP Backend - Benefits Administration Routes
// Comprehensive routing for benefits management, enrollment, claims, and analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { BenefitsController } from '../controllers/benefits.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const benefitsController = new BenefitsController();

// Apply authentication to all routes
router.use(authenticate);

// Rate limiting for API endpoints
const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // limit for sensitive operations
});

// ===== BENEFITS PLANS MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/benefits/plans
 * @desc    Create benefits plan
 * @access  HR Admin, Benefits Admin
 */
router.post(
  '/plans',
  strictRateLimit,
  authorize(['hr:benefits:admin', 'benefits_admin', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', required: true, minLength: 10, maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      category: { 
        type: 'string', 
        required: true, 
        enum: ['health', 'dental', 'vision', 'life_insurance', 'disability', 'retirement', 'wellness', 'other'] 
      },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['insurance', 'savings', 'reimbursement', 'time_off', 'wellness', 'education', 'other'] 
      },
      provider: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          contactInfo: { type: 'object' },
          website: { type: 'string', format: 'uri' },
          accountNumber: { type: 'string' }
        }
      },
      coverage: {
        type: 'object',
        properties: {
          eligibility: { type: 'object', required: true },
          waitingPeriod: { type: 'number', min: 0 }, // days
          maxCoverage: { type: 'number', min: 0 },
          deductible: { type: 'number', min: 0 },
          coPayment: { type: 'number', min: 0, max: 100 },
          outOfPocketMax: { type: 'number', min: 0 }
        }
      },
      cost: {
        type: 'object',
        properties: {
          employeeCost: { type: 'number', required: true, min: 0 },
          employerCost: { type: 'number', required: true, min: 0 },
          dependentCost: { type: 'number', min: 0 },
          frequency: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' }
        }
      },
      effectiveDate: { type: 'string', required: true, format: 'date' },
      expirationDate: { type: 'string', format: 'date' },
      isActive: { type: 'boolean', default: true },
      tags: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'CREATE_BENEFITS_PLAN', resource: 'benefits_plan' }),
  benefitsController.createPlan
);

/**
 * @route   GET /api/v1/hr/benefits/plans
 * @desc    Get benefits plans
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/plans',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      category: { type: 'string', enum: ['health', 'dental', 'vision', 'life_insurance', 'disability', 'retirement', 'wellness', 'other'] },
      type: { type: 'string', enum: ['insurance', 'savings', 'reimbursement', 'time_off', 'wellness', 'education', 'other'] },
      isActive: { type: 'boolean' },
      includeEmployeeEligible: { type: 'boolean', default: false },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsController.getPlans
);

/**
 * @route   GET /api/v1/hr/benefits/plans/:id
 * @desc    Get benefits plan details
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/plans/:id',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeEnrollments: { type: 'boolean', default: false },
      includeAnalytics: { type: 'boolean', default: false }
    }
  }),
  benefitsController.getPlan
);

/**
 * @route   PUT /api/v1/hr/benefits/plans/:id
 * @desc    Update benefits plan
 * @access  HR Admin, Benefits Admin
 */
router.put(
  '/plans/:id',
  strictRateLimit,
  authorize(['hr:benefits:admin', 'benefits_admin', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      name: { type: 'string', minLength: 3, maxLength: 200 },
      description: { type: 'string', minLength: 10, maxLength: 2000 },
      provider: { type: 'object' },
      coverage: { type: 'object' },
      cost: { type: 'object' },
      effectiveDate: { type: 'string', format: 'date' },
      expirationDate: { type: 'string', format: 'date' },
      isActive: { type: 'boolean' },
      tags: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'UPDATE_BENEFITS_PLAN', resource: 'benefits_plan' }),
  benefitsController.updatePlan
);

// ===== BENEFITS ENROLLMENT =====

/**
 * @route   POST /api/v1/hr/benefits/enrollments
 * @desc    Enroll in benefits plan
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', format: 'uuid' }, // optional, defaults to current user
      planId: { type: 'string', required: true, format: 'uuid' },
      coverageLevel: { type: 'string', enum: ['employee_only', 'employee_spouse', 'employee_children', 'family'], default: 'employee_only' },
      dependents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            relationship: { type: 'string', required: true, enum: ['spouse', 'child', 'domestic_partner'] },
            dateOfBirth: { type: 'string', required: true, format: 'date' },
            ssn: { type: 'string' }, // optional, encrypted
            gender: { type: 'string', enum: ['male', 'female', 'other'] }
          }
        }
      },
      beneficiaries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            relationship: { type: 'string', required: true },
            percentage: { type: 'number', required: true, min: 1, max: 100 },
            isPrimary: { type: 'boolean', default: false },
            contactInfo: { type: 'object' }
          }
        }
      },
      effectiveDate: { type: 'string', required: true, format: 'date' },
      employeeContribution: { type: 'number', min: 0 },
      payrollDeduction: { type: 'boolean', default: true },
      electionReason: { type: 'string', enum: ['new_hire', 'open_enrollment', 'life_event', 'special_enrollment'] },
      documents: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'ENROLL_BENEFITS', resource: 'benefits_enrollment' }),
  benefitsController.enrollInPlan
);

/**
 * @route   GET /api/v1/hr/benefits/enrollments
 * @desc    Get benefits enrollments
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      planId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['pending', 'active', 'terminated', 'suspended'] },
      category: { type: 'string', enum: ['health', 'dental', 'vision', 'life_insurance', 'disability', 'retirement', 'wellness', 'other'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsController.getEnrollments
);

/**
 * @route   PUT /api/v1/hr/benefits/enrollments/:id
 * @desc    Update benefits enrollment
 * @access  Employee (own), HR Staff, Admin
 */
router.put(
  '/enrollments/:id',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      coverageLevel: { type: 'string', enum: ['employee_only', 'employee_spouse', 'employee_children', 'family'] },
      dependents: { type: 'array' },
      beneficiaries: { type: 'array' },
      employeeContribution: { type: 'number', min: 0 },
      changeReason: { type: 'string', required: true, maxLength: 500 },
      effectiveDate: { type: 'string', format: 'date' },
      documents: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'UPDATE_BENEFITS_ENROLLMENT', resource: 'benefits_enrollment' }),
  benefitsController.updateEnrollment
);

// ===== BENEFITS CLAIMS =====

/**
 * @route   POST /api/v1/hr/benefits/claims
 * @desc    Submit benefits claim
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/claims',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      enrollmentId: { type: 'string', required: true, format: 'uuid' },
      claimType: { type: 'string', required: true, enum: ['medical', 'dental', 'vision', 'pharmacy', 'reimbursement', 'other'] },
      serviceDate: { type: 'string', required: true, format: 'date' },
      provider: {
        type: 'object',
        required: true,
        properties: {
          name: { type: 'string', required: true },
          taxId: { type: 'string' },
          address: { type: 'object' },
          phone: { type: 'string' }
        }
      },
      diagnosis: { type: 'string', maxLength: 500 },
      treatment: { type: 'string', maxLength: 1000 },
      totalAmount: { type: 'number', required: true, min: 0 },
      requestedAmount: { type: 'number', required: true, min: 0 },
      receipts: { type: 'array', required: true, items: { type: 'string' } },
      supportingDocuments: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string', maxLength: 1000 }
    }
  }),
  audit({ action: 'SUBMIT_BENEFITS_CLAIM', resource: 'benefits_claim' }),
  benefitsController.submitClaim
);

/**
 * @route   GET /api/v1/hr/benefits/claims
 * @desc    Get benefits claims
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/claims',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'denied', 'paid'] },
      claimType: { type: 'string', enum: ['medical', 'dental', 'vision', 'pharmacy', 'reimbursement', 'other'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsController.getClaims
);

/**
 * @route   PUT /api/v1/hr/benefits/claims/:id/status
 * @desc    Update claim status
 * @access  HR Staff, Benefits Admin, Admin
 */
router.put(
  '/claims/:id/status',
  strictRateLimit,
  authorize(['hr:benefits:admin', 'benefits_admin', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      status: { type: 'string', required: true, enum: ['under_review', 'approved', 'denied', 'paid'] },
      approvedAmount: { type: 'number', min: 0 },
      denialReason: { type: 'string', maxLength: 1000 },
      processorNotes: { type: 'string', maxLength: 1000 },
      paymentDate: { type: 'string', format: 'date' },
      checkNumber: { type: 'string' }
    }
  }),
  audit({ action: 'UPDATE_CLAIM_STATUS', resource: 'benefits_claim' }),
  benefitsController.updateClaimStatus
);

// ===== OPEN ENROLLMENT =====

/**
 * @route   POST /api/v1/hr/benefits/open-enrollment
 * @desc    Create open enrollment period
 * @access  HR Admin, Benefits Admin
 */
router.post(
  '/open-enrollment',
  strictRateLimit,
  authorize(['hr:benefits:admin', 'benefits_admin', 'admin']),
  validateRequest({
    body: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      startDate: { type: 'string', required: true, format: 'date' },
      endDate: { type: 'string', required: true, format: 'date' },
      planYear: { type: 'number', required: true, min: new Date().getFullYear() },
      availablePlans: { type: 'array', required: true, items: { type: 'string', format: 'uuid' } },
      eligibleEmployees: { type: 'array', items: { type: 'string', format: 'uuid' } },
      notifications: {
        type: 'object',
        properties: {
          reminderDays: { type: 'array', items: { type: 'number', min: 1 } },
          channels: { type: 'array', items: { type: 'string', enum: ['email', 'sms', 'portal'] } }
        }
      }
    }
  }),
  audit({ action: 'CREATE_OPEN_ENROLLMENT', resource: 'open_enrollment' }),
  benefitsController.createOpenEnrollment
);

/**
 * @route   GET /api/v1/hr/benefits/open-enrollment
 * @desc    Get open enrollment periods
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/open-enrollment',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['upcoming', 'active', 'closed'] },
      planYear: { type: 'number', min: 2020 }
    }
  }),
  benefitsController.getOpenEnrollments
);

// ===== LIFE EVENTS =====

/**
 * @route   POST /api/v1/hr/benefits/life-events
 * @desc    Report qualifying life event
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/life-events',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      eventType: { 
        type: 'string', 
        required: true, 
        enum: ['marriage', 'divorce', 'birth', 'adoption', 'death', 'job_change', 'address_change', 'loss_of_coverage', 'other'] 
      },
      eventDate: { type: 'string', required: true, format: 'date' },
      description: { type: 'string', required: true, maxLength: 1000 },
      affectedDependents: { type: 'array', items: { type: 'string' } },
      supportingDocuments: { type: 'array', items: { type: 'string' } },
      requestedChanges: { type: 'string', maxLength: 2000 }
    }
  }),
  audit({ action: 'REPORT_LIFE_EVENT', resource: 'life_event' }),
  benefitsController.reportLifeEvent
);

/**
 * @route   GET /api/v1/hr/benefits/life-events
 * @desc    Get life events
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/life-events',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['pending', 'approved', 'processed', 'rejected'] },
      eventType: { type: 'string', enum: ['marriage', 'divorce', 'birth', 'adoption', 'death', 'job_change', 'address_change', 'loss_of_coverage', 'other'] },
      limit: { type: 'number', min: 1, max: 50, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsController.getLifeEvents
);

// ===== ELIGIBILITY & COST CALCULATIONS =====

/**
 * @route   GET /api/v1/hr/benefits/eligibility/:employeeId
 * @desc    Check benefits eligibility for employee
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/eligibility/:employeeId',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    params: {
      employeeId: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      planId: { type: 'string', format: 'uuid' },
      effectiveDate: { type: 'string', format: 'date' }
    }
  }),
  benefitsController.checkEligibility
);

/**
 * @route   POST /api/v1/hr/benefits/cost-calculation
 * @desc    Calculate benefits cost
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/cost-calculation',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', required: true, format: 'uuid' },
      planId: { type: 'string', required: true, format: 'uuid' },
      coverageLevel: { type: 'string', required: true, enum: ['employee_only', 'employee_spouse', 'employee_children', 'family'] },
      dependentCount: { type: 'number', min: 0, max: 10, default: 0 },
      annualSalary: { type: 'number', min: 0 },
      effectiveDate: { type: 'string', format: 'date' }
    }
  }),
  benefitsController.calculateCost
);

// ===== ANALYTICS & REPORTS =====

/**
 * @route   GET /api/v1/hr/benefits/analytics/enrollment-summary
 * @desc    Get enrollment analytics
 * @access  HR Staff, Benefits Admin, Admin
 */
router.get(
  '/analytics/enrollment-summary',
  standardRateLimit,
  authorize(['hr:benefits:read', 'benefits_admin', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planYear: { type: 'number', min: 2020, max: new Date().getFullYear() + 2 },
      category: { type: 'string', enum: ['health', 'dental', 'vision', 'life_insurance', 'disability', 'retirement', 'wellness', 'other'] },
      departmentId: { type: 'string', format: 'uuid' }
    }
  }),
  benefitsController.getEnrollmentAnalytics
);

/**
 * @route   GET /api/v1/hr/benefits/analytics/cost-analysis
 * @desc    Get benefits cost analysis
 * @access  HR Manager, Finance, Benefits Admin, Admin
 */
router.get(
  '/analytics/cost-analysis',
  standardRateLimit,
  authorize(['hr:benefits:read', 'finance', 'benefits_admin', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      period: { type: 'string', enum: ['month', 'quarter', 'year'], default: 'year' },
      planYear: { type: 'number', min: 2020, max: new Date().getFullYear() + 2 },
      includeProjections: { type: 'boolean', default: false }
    }
  }),
  benefitsController.getCostAnalysis
);

/**
 * @route   GET /api/v1/hr/benefits/reports/:reportType
 * @desc    Generate benefits reports
 * @access  HR Staff, Benefits Admin, Admin
 */
router.get(
  '/reports/:reportType',
  standardRateLimit,
  authorize(['hr:benefits:read', 'benefits_admin', 'admin']),
  validateRequest({
    params: {
      reportType: { 
        type: 'string', 
        required: true,
        enum: ['enrollment_report', 'claims_summary', 'cost_report', 'utilization_report', 'compliance_report'] 
      }
    },
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      format: { type: 'string', enum: ['json', 'csv', 'excel'], default: 'json' }
    }
  }),
  benefitsController.generateReport
);

// ===== AI-POWERED FEATURES =====

/**
 * @route   GET /api/v1/hr/benefits/ai/recommendations
 * @desc    Get AI-powered benefits recommendations
 * @access  Employee, HR Staff, Benefits Admin, Admin
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'benefits_admin', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      recommendationType: { type: 'string', enum: ['enrollment', 'cost_optimization', 'plan_comparison', 'utilization'], default: 'enrollment' },
      includeComparison: { type: 'boolean', default: true }
    }
  }),
  benefitsController.getAIRecommendations
);

/**
 * @route   GET /api/v1/hr/benefits/ai/plan-comparison
 * @desc    Get AI-powered plan comparison
 * @access  Employee, HR Staff, Benefits Admin, Admin
 */
router.get(
  '/ai/plan-comparison',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'benefits_admin', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      planIds: { type: 'string', required: true }, // comma-separated plan IDs
      scenarios: { type: 'string' } // comma-separated scenarios
    }
  }),
  benefitsController.getAIPlanComparison
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/benefits/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  benefitsController.healthCheck
);

export default router;
