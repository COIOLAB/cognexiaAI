// Industry 5.0 ERP Backend - Benefits Administration Routes
// Comprehensive routing for benefits plans, enrollments, claims, providers, and AI-powered analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { BenefitsAdministrationController } from '../controllers/benefits-administration.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const benefitsAdministrationController = new BenefitsAdministrationController();

// Apply authentication to all routes
router.use(authenticate);

// Rate limiting for API endpoints
const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // limit each IP to 20 requests per windowMs for sensitive operations
});

// ===== BENEFITS PLANS =====

/**
 * @route   POST /api/v1/hr/benefits/plans
 * @desc    Create new benefits plan
 * @access  HR Manager, Admin
 */
router.post(
  '/plans',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planType: { 
        type: 'string', 
        required: true, 
        enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'hsa', 'fsa', 'wellness', 'other'] 
      },
      provider: { 
        type: 'object', 
        required: true,
        properties: {
          providerId: { type: 'string', format: 'uuid' },
          providerName: { type: 'string', required: true },
          contactInfo: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              email: { type: 'string', format: 'email' },
              website: { type: 'string', format: 'uri' }
            }
          }
        }
      },
      coverage: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['individual', 'family', 'employee_spouse', 'employee_children'] },
          deductible: { type: 'number', min: 0 },
          coInsurance: { type: 'number', min: 0, max: 100 },
          copay: { type: 'number', min: 0 },
          outOfPocketMax: { type: 'number', min: 0 },
          networkType: { type: 'string', enum: ['ppo', 'hmo', 'epo', 'pos', 'hdhp'] },
          coverageDetails: { type: 'array', items: { type: 'string' } }
        }
      },
      costs: {
        type: 'object',
        properties: {
          employeeContribution: {
            type: 'object',
            properties: {
              individual: { type: 'number', min: 0 },
              family: { type: 'number', min: 0 },
              employeeSpouse: { type: 'number', min: 0 },
              employeeChildren: { type: 'number', min: 0 }
            }
          },
          employerContribution: {
            type: 'object',
            properties: {
              individual: { type: 'number', min: 0 },
              family: { type: 'number', min: 0 },
              employeeSpouse: { type: 'number', min: 0 },
              employeeChildren: { type: 'number', min: 0 }
            }
          },
          frequency: { type: 'string', enum: ['weekly', 'biweekly', 'monthly', 'annually'], default: 'biweekly' }
        }
      },
      eligibility: {
        type: 'object',
        properties: {
          employmentTypes: { type: 'array', items: { type: 'string' } },
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          minHoursPerWeek: { type: 'number', min: 0 },
          waitingPeriodDays: { type: 'number', min: 0, default: 0 },
          ageRestrictions: {
            type: 'object',
            properties: {
              minAge: { type: 'number', min: 0 },
              maxAge: { type: 'number', min: 0 }
            }
          }
        }
      },
      planYear: { type: 'number', required: true, min: 2024 },
      effectiveDate: { type: 'string', required: true, format: 'date' },
      terminationDate: { type: 'string', format: 'date' },
      documents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['sbc', 'spd', 'contract', 'certificate', 'brochure'] },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      },
      status: { type: 'string', enum: ['draft', 'active', 'inactive', 'terminated'], default: 'draft' }
    }
  }),
  audit({ action: 'CREATE_BENEFITS_PLAN', resource: 'benefits_plan' }),
  benefitsAdministrationController.createBenefitsPlan
);

/**
 * @route   GET /api/v1/hr/benefits/plans
 * @desc    Get benefits plans with filtering
 * @access  HR Staff, Employee, Manager, Admin
 */
router.get(
  '/plans',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      planType: { type: 'string', enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'hsa', 'fsa', 'wellness', 'other'] },
      status: { type: 'string', enum: ['draft', 'active', 'inactive', 'terminated'] },
      providerId: { type: 'string', format: 'uuid' },
      eligibleEmployeeId: { type: 'string', format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getBenefitsPlans
);

/**
 * @route   GET /api/v1/hr/benefits/plans/:id
 * @desc    Get specific benefits plan by ID
 * @access  HR Staff, Employee, Manager, Admin
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
      includeDetails: { type: 'boolean', default: true },
      includeEnrollments: { type: 'boolean', default: false }
    }
  }),
  benefitsAdministrationController.getBenefitsPlan
);

/**
 * @route   PUT /api/v1/hr/benefits/plans/:id
 * @desc    Update benefits plan
 * @access  HR Manager, Admin
 */
router.put(
  '/plans/:id',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      name: { type: 'string', minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      coverage: { type: 'object' },
      costs: { type: 'object' },
      eligibility: { type: 'object' },
      effectiveDate: { type: 'string', format: 'date' },
      terminationDate: { type: 'string', format: 'date' },
      documents: { type: 'array' },
      status: { type: 'string', enum: ['draft', 'active', 'inactive', 'terminated'] }
    }
  }),
  audit({ action: 'UPDATE_BENEFITS_PLAN', resource: 'benefits_plan' }),
  benefitsAdministrationController.updateBenefitsPlan
);

// ===== ENROLLMENTS =====

/**
 * @route   POST /api/v1/hr/benefits/enrollments
 * @desc    Enroll employee in benefits plan
 * @access  HR Staff, Employee (self), Manager, Admin
 */
router.post(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', required: true, format: 'uuid' },
      planId: { type: 'string', required: true, format: 'uuid' },
      coverageType: { type: 'string', required: true, enum: ['individual', 'family', 'employee_spouse', 'employee_children'] },
      enrollmentDate: { type: 'string', format: 'date' },
      effectiveDate: { type: 'string', required: true, format: 'date' },
      endDate: { type: 'string', format: 'date' },
      dependents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            firstName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
            lastName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
            dateOfBirth: { type: 'string', required: true, format: 'date' },
            relationship: { 
              type: 'string', 
              required: true, 
              enum: ['spouse', 'child', 'domestic_partner', 'step_child', 'adopted_child'] 
            },
            ssn: { type: 'string', pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            isStudent: { type: 'boolean', default: false },
            isDisabled: { type: 'boolean', default: false }
          }
        }
      },
      beneficiaries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            firstName: { type: 'string', required: true },
            lastName: { type: 'string', required: true },
            relationship: { type: 'string', required: true },
            percentage: { type: 'number', required: true, min: 0, max: 100 },
            isPrimary: { type: 'boolean', default: true }
          }
        }
      },
      employeeContribution: { type: 'number', min: 0 },
      payrollDeductionFrequency: { type: 'string', enum: ['weekly', 'biweekly', 'monthly'], default: 'biweekly' },
      waiverReason: { type: 'string', maxLength: 500 },
      enrollmentSource: { type: 'string', enum: ['open_enrollment', 'new_hire', 'life_event', 'manual'], default: 'manual' },
      documents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      }
    }
  }),
  audit({ action: 'ENROLL_BENEFITS_PLAN', resource: 'benefits_enrollment' }),
  benefitsAdministrationController.enrollInBenefitsPlan
);

/**
 * @route   GET /api/v1/hr/benefits/enrollments
 * @desc    Get employee enrollments
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      planId: { type: 'string', format: 'uuid' },
      planType: { type: 'string', enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'hsa', 'fsa', 'wellness', 'other'] },
      status: { type: 'string', enum: ['active', 'pending', 'terminated', 'waived'] },
      effectiveDate: { type: 'string', format: 'date' },
      planYear: { type: 'number', min: 2020 },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getEnrollments
);

/**
 * @route   PUT /api/v1/hr/benefits/enrollments/:id
 * @desc    Update enrollment
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.put(
  '/enrollments/:id',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      coverageType: { type: 'string', enum: ['individual', 'family', 'employee_spouse', 'employee_children'] },
      effectiveDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      employeeContribution: { type: 'number', min: 0 },
      beneficiaries: { type: 'array' },
      status: { type: 'string', enum: ['active', 'pending', 'terminated', 'waived'] },
      changeReason: { type: 'string', maxLength: 500 }
    }
  }),
  audit({ action: 'UPDATE_ENROLLMENT', resource: 'benefits_enrollment' }),
  benefitsAdministrationController.updateEnrollment
);

/**
 * @route   POST /api/v1/hr/benefits/enrollments/:id/terminate
 * @desc    Terminate enrollment
 * @access  HR Staff, Manager, Admin
 */
router.post(
  '/enrollments/:id/terminate',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      terminationDate: { type: 'string', required: true, format: 'date' },
      reason: { 
        type: 'string', 
        required: true, 
        enum: ['termination_of_employment', 'end_of_cobra', 'voluntary_cancellation', 'non_payment', 'life_event', 'other'] 
      },
      notes: { type: 'string', maxLength: 1000 },
      cobraEligible: { type: 'boolean', default: false },
      finalContribution: { type: 'number', min: 0 }
    }
  }),
  audit({ action: 'TERMINATE_ENROLLMENT', resource: 'benefits_enrollment' }),
  benefitsAdministrationController.terminateEnrollment
);

/**
 * @route   POST /api/v1/hr/benefits/enrollments/:id/dependents
 * @desc    Add dependents to enrollment
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.post(
  '/enrollments/:id/dependents',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      dependents: {
        type: 'array',
        required: true,
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            firstName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
            lastName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
            dateOfBirth: { type: 'string', required: true, format: 'date' },
            relationship: { 
              type: 'string', 
              required: true, 
              enum: ['spouse', 'child', 'domestic_partner', 'step_child', 'adopted_child'] 
            },
            ssn: { type: 'string', pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            isStudent: { type: 'boolean', default: false },
            isDisabled: { type: 'boolean', default: false },
            effectiveDate: { type: 'string', format: 'date' }
          }
        }
      },
      lifeEventType: { 
        type: 'string', 
        enum: ['marriage', 'birth', 'adoption', 'domestic_partnership', 'other'] 
      },
      supportingDocuments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      }
    }
  }),
  audit({ action: 'ADD_DEPENDENTS', resource: 'benefits_dependent' }),
  benefitsAdministrationController.addDependents
);

/**
 * @route   DELETE /api/v1/hr/benefits/enrollments/:enrollmentId/dependents/:dependentId
 * @desc    Remove dependent from enrollment
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.delete(
  '/enrollments/:enrollmentId/dependents/:dependentId',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    params: {
      enrollmentId: { type: 'string', required: true, format: 'uuid' },
      dependentId: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      removalDate: { type: 'string', format: 'date' },
      reason: { 
        type: 'string', 
        enum: ['divorce', 'death', 'loss_of_dependency', 'age_out', 'voluntary', 'other'] 
      },
      notes: { type: 'string', maxLength: 500 }
    }
  }),
  audit({ action: 'REMOVE_DEPENDENT', resource: 'benefits_dependent' }),
  benefitsAdministrationController.removeDependent
);

// ===== CLAIMS MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/benefits/claims
 * @desc    Submit benefits claim
 * @access  HR Staff, Employee, Manager, Admin
 */
router.post(
  '/claims',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      enrollmentId: { type: 'string', required: true, format: 'uuid' },
      claimType: { 
        type: 'string', 
        required: true, 
        enum: ['medical', 'dental', 'vision', 'prescription', 'life', 'disability', 'reimbursement', 'other'] 
      },
      amount: { type: 'number', required: true, min: 0.01 },
      serviceDate: { type: 'string', format: 'date' },
      serviceEndDate: { type: 'string', format: 'date' },
      provider: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          npi: { type: 'string' },
          taxId: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' }
        }
      },
      patientName: { type: 'string', required: true },
      patientRelationship: { 
        type: 'string', 
        enum: ['employee', 'spouse', 'child', 'dependent'], 
        default: 'employee' 
      },
      diagnosis: {
        type: 'object',
        properties: {
          codes: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' }
        }
      },
      procedures: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            code: { type: 'string', required: true },
            description: { type: 'string' },
            amount: { type: 'number', min: 0 }
          }
        }
      },
      submittedBy: { type: 'string', format: 'uuid' },
      claimNumber: { type: 'string' },
      receiptNumbers: { type: 'array', items: { type: 'string' } },
      supportingDocuments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true, enum: ['receipt', 'eob', 'prescription', 'medical_record', 'other'] },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' },
            size: { type: 'number', max: 20971520 } // 20MB limit
          }
        }
      },
      notes: { type: 'string', maxLength: 1000 },
      priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' }
    }
  }),
  audit({ action: 'SUBMIT_CLAIM', resource: 'benefits_claim' }),
  benefitsAdministrationController.submitClaim
);

/**
 * @route   GET /api/v1/hr/benefits/claims
 * @desc    Get claims with filtering
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/claims',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      enrollmentId: { type: 'string', format: 'uuid' },
      claimType: { type: 'string', enum: ['medical', 'dental', 'vision', 'prescription', 'life', 'disability', 'reimbursement', 'other'] },
      status: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'partially_approved', 'denied', 'paid'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      minAmount: { type: 'number', min: 0 },
      maxAmount: { type: 'number', min: 0 },
      priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getClaims
);

/**
 * @route   GET /api/v1/hr/benefits/claims/:id
 * @desc    Get specific claim by ID
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/claims/:id',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeDocuments: { type: 'boolean', default: true },
      includeHistory: { type: 'boolean', default: true }
    }
  }),
  benefitsAdministrationController.getClaim
);

/**
 * @route   POST /api/v1/hr/benefits/claims/:id/process
 * @desc    Process claim (approve/deny)
 * @access  HR Manager, Claims Administrator, Admin
 */
router.post(
  '/claims/:id/process',
  strictRateLimit,
  authorize(['hr:benefits:write', 'claims:process', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      action: { type: 'string', required: true, enum: ['approve', 'partial_approve', 'deny', 'request_info'] },
      approvedAmount: { type: 'number', min: 0 },
      denialReason: { 
        type: 'string', 
        enum: ['not_covered', 'exceeded_benefit', 'incomplete_info', 'duplicate_claim', 'pre_existing', 'other'] 
      },
      denialDetails: { type: 'string', maxLength: 1000 },
      notes: { type: 'string', maxLength: 2000 },
      reviewerComments: { type: 'string', maxLength: 2000 },
      requestedInformation: { type: 'array', items: { type: 'string' } },
      paymentMethod: { type: 'string', enum: ['direct_deposit', 'check', 'debit_card'], default: 'direct_deposit' },
      estimatedPaymentDate: { type: 'string', format: 'date' }
    }
  }),
  audit({ action: 'PROCESS_CLAIM', resource: 'benefits_claim' }),
  benefitsAdministrationController.processClaim
);

/**
 * @route   POST /api/v1/hr/benefits/claims/:id/documents
 * @desc    Add documents to claim
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.post(
  '/claims/:id/documents',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      documents: {
        type: 'array',
        required: true,
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true, enum: ['receipt', 'eob', 'prescription', 'medical_record', 'other'] },
            name: { type: 'string', required: true, maxLength: 255 },
            url: { type: 'string', required: true, format: 'uri' },
            size: { type: 'number', max: 20971520 }, // 20MB limit
            description: { type: 'string', maxLength: 500 }
          }
        }
      }
    }
  }),
  audit({ action: 'ADD_CLAIM_DOCUMENTS', resource: 'benefits_claim_document' }),
  benefitsAdministrationController.addClaimDocuments
);

// ===== PROVIDERS MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/benefits/providers
 * @desc    Create benefits provider
 * @access  HR Manager, Admin
 */
router.post(
  '/providers',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 2, maxLength: 200 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      providerType: { 
        type: 'string', 
        required: true, 
        enum: ['health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability', 'retirement', 'wellness', 'third_party_admin', 'other'] 
      },
      contactInfo: {
        type: 'object',
        required: true,
        properties: {
          primaryContact: { type: 'string', required: true },
          phone: { type: 'string', required: true },
          email: { type: 'string', required: true, format: 'email' },
          website: { type: 'string', format: 'uri' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', required: true },
              city: { type: 'string', required: true },
              state: { type: 'string', required: true },
              zipCode: { type: 'string', required: true },
              country: { type: 'string', default: 'US' }
            }
          }
        }
      },
      credentials: {
        type: 'object',
        properties: {
          licenses: { type: 'array', items: { type: 'string' } },
          certifications: { type: 'array', items: { type: 'string' } },
          ratings: {
            type: 'object',
            properties: {
              amBest: { type: 'string' },
              moodys: { type: 'string' },
              sp: { type: 'string' }
            }
          }
        }
      },
      serviceAreas: { type: 'array', items: { type: 'string' } },
      specialties: { type: 'array', items: { type: 'string' } },
      status: { type: 'string', enum: ['active', 'inactive', 'pending', 'terminated'], default: 'active' }
    }
  }),
  audit({ action: 'CREATE_BENEFITS_PROVIDER', resource: 'benefits_provider' }),
  benefitsAdministrationController.createBenefitsProvider
);

/**
 * @route   GET /api/v1/hr/benefits/providers
 * @desc    Get benefits providers
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/providers',
  standardRateLimit,
  authorize(['hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      providerType: { type: 'string', enum: ['health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability', 'retirement', 'wellness', 'third_party_admin', 'other'] },
      status: { type: 'string', enum: ['active', 'inactive', 'pending', 'terminated'] },
      serviceArea: { type: 'string' },
      includeContracts: { type: 'boolean', default: false },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getBenefitsProviders
);

/**
 * @route   PUT /api/v1/hr/benefits/providers/:id/contract
 * @desc    Update provider contract
 * @access  HR Manager, Admin
 */
router.put(
  '/providers/:id/contract',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      contractNumber: { type: 'string', maxLength: 100 },
      effectiveDate: { type: 'string', format: 'date' },
      expirationDate: { type: 'string', format: 'date' },
      autoRenewal: { type: 'boolean', default: false },
      renewalNotice: { type: 'number', min: 30, max: 365 }, // days
      terms: {
        type: 'object',
        properties: {
          paymentTerms: { type: 'string' },
          commissionStructure: { type: 'object' },
          serviceLevels: { type: 'array', items: { type: 'string' } },
          penalties: { type: 'array', items: { type: 'string' } }
        }
      },
      documents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true, enum: ['master_agreement', 'service_agreement', 'amendment', 'addendum'] },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' },
            version: { type: 'string' }
          }
        }
      },
      status: { type: 'string', enum: ['draft', 'active', 'expired', 'terminated'] }
    }
  }),
  audit({ action: 'UPDATE_PROVIDER_CONTRACT', resource: 'provider_contract' }),
  benefitsAdministrationController.updateProviderContract
);

// ===== ELIGIBILITY & CALCULATIONS =====

/**
 * @route   GET /api/v1/hr/benefits/eligibility/:employeeId
 * @desc    Get benefits eligibility for employee
 * @access  HR Staff, Employee (own), Manager, Admin
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
      planType: { type: 'string', enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'hsa', 'fsa', 'wellness', 'other'] },
      asOfDate: { type: 'string', format: 'date' },
      includeReasons: { type: 'boolean', default: true }
    }
  }),
  benefitsAdministrationController.getBenefitsEligibility
);

/**
 * @route   GET /api/v1/hr/benefits/costs/calculate
 * @desc    Calculate benefits costs for employee
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/costs/calculate',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', required: true, format: 'uuid' },
      planIds: { type: 'string', required: true }, // comma-separated UUIDs
      dependentCount: { type: 'number', min: 0, max: 10, default: 0 },
      effectiveDate: { type: 'string', format: 'date' },
      coverageOptions: { type: 'string' }, // JSON string
      includeBreakdown: { type: 'boolean', default: true }
    }
  }),
  benefitsAdministrationController.calculateBenefitsCosts
);

// ===== OPEN ENROLLMENT =====

/**
 * @route   POST /api/v1/hr/benefits/open-enrollment
 * @desc    Create open enrollment period
 * @access  HR Manager, Admin
 */
router.post(
  '/open-enrollment',
  standardRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    body: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      planYear: { type: 'number', required: true, min: 2024 },
      startDate: { type: 'string', required: true, format: 'date' },
      endDate: { type: 'string', required: true, format: 'date' },
      eligibleEmployees: {
        type: 'object',
        properties: {
          all: { type: 'boolean', default: true },
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          employmentTypes: { type: 'array', items: { type: 'string' } },
          newHiresOnly: { type: 'boolean', default: false }
        }
      },
      availablePlans: { type: 'array', items: { type: 'string', format: 'uuid' } },
      communicationPlan: {
        type: 'object',
        properties: {
          announcements: { type: 'array', items: { type: 'object' } },
          reminders: { type: 'array', items: { type: 'object' } },
          meetings: { type: 'array', items: { type: 'object' } }
        }
      },
      defaultSelections: {
        type: 'object',
        properties: {
          autoEnroll: { type: 'boolean', default: false },
          defaultPlans: { type: 'array', items: { type: 'string', format: 'uuid' } }
        }
      },
      requireDecisions: { type: 'boolean', default: true },
      allowWaivers: { type: 'boolean', default: true },
      status: { type: 'string', enum: ['planned', 'active', 'closed', 'cancelled'], default: 'planned' }
    }
  }),
  audit({ action: 'CREATE_OPEN_ENROLLMENT', resource: 'open_enrollment_period' }),
  benefitsAdministrationController.createOpenEnrollmentPeriod
);

/**
 * @route   GET /api/v1/hr/benefits/open-enrollment
 * @desc    Get open enrollment periods
 * @access  HR Staff, Employee, Manager, Admin
 */
router.get(
  '/open-enrollment',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      status: { type: 'string', enum: ['planned', 'active', 'closed', 'cancelled'] },
      current: { type: 'boolean', default: false },
      includeStats: { type: 'boolean', default: false },
      limit: { type: 'number', min: 1, max: 50, default: 10 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getOpenEnrollmentPeriods
);

// ===== LIFE EVENTS =====

/**
 * @route   POST /api/v1/hr/benefits/life-events
 * @desc    Process life event
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.post(
  '/life-events',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', required: true, format: 'uuid' },
      eventType: { 
        type: 'string', 
        required: true, 
        enum: ['marriage', 'divorce', 'birth', 'adoption', 'death', 'employment_change', 'salary_change', 'address_change', 'medicare_eligibility', 'other'] 
      },
      eventDate: { type: 'string', required: true, format: 'date' },
      description: { type: 'string', maxLength: 1000 },
      affectedPersons: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            relationship: { type: 'string', required: true },
            ssn: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' }
          }
        }
      },
      requestedChanges: {
        type: 'object',
        properties: {
          enrollments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          terminations: { type: 'array', items: { type: 'string', format: 'uuid' } },
          dependentChanges: { type: 'array', items: { type: 'object' } },
          beneficiaryChanges: { type: 'array', items: { type: 'object' } }
        }
      },
      supportingDocuments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true, enum: ['marriage_certificate', 'divorce_decree', 'birth_certificate', 'death_certificate', 'court_order', 'other'] },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      },
      effectiveDate: { type: 'string', format: 'date' },
      reportedBy: { type: 'string', format: 'uuid' },
      urgency: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' }
    }
  }),
  audit({ action: 'PROCESS_LIFE_EVENT', resource: 'benefits_life_event' }),
  benefitsAdministrationController.processLifeEvent
);

/**
 * @route   GET /api/v1/hr/benefits/life-events
 * @desc    Get life events
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/life-events',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      eventType: { type: 'string', enum: ['marriage', 'divorce', 'birth', 'adoption', 'death', 'employment_change', 'salary_change', 'address_change', 'medicare_eligibility', 'other'] },
      status: { type: 'string', enum: ['pending', 'approved', 'denied', 'processed'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      urgency: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  benefitsAdministrationController.getLifeEvents
);

// ===== ANALYTICS & REPORTS =====

/**
 * @route   GET /api/v1/hr/benefits/analytics/utilization
 * @desc    Get benefits utilization analytics
 * @access  HR Manager, Admin
 */
router.get(
  '/analytics/utilization',
  standardRateLimit,
  authorize(['hr:benefits:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planType: { type: 'string', enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'hsa', 'fsa', 'wellness', 'other'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      segmentBy: { type: 'string', enum: ['department', 'age_group', 'salary_band', 'employment_type', 'location'] },
      includeComparisons: { type: 'boolean', default: true },
      includeProjections: { type: 'boolean', default: false }
    }
  }),
  benefitsAdministrationController.getBenefitsUtilizationAnalytics
);

/**
 * @route   GET /api/v1/hr/benefits/analytics/costs
 * @desc    Get benefits cost analytics
 * @access  HR Manager, Admin
 */
router.get(
  '/analytics/costs',
  standardRateLimit,
  authorize(['hr:benefits:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      costType: { type: 'string', enum: ['employer', 'employee', 'total', 'claims'] },
      trendAnalysis: { type: 'boolean', default: true },
      forecastPeriods: { type: 'number', min: 1, max: 36, default: 12 },
      includeComparisons: { type: 'boolean', default: true }
    }
  }),
  benefitsAdministrationController.getBenefitsCostAnalytics
);

/**
 * @route   GET /api/v1/hr/benefits/ai/recommendations
 * @desc    Get AI-powered benefits recommendations
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      organizationId: { type: 'string', format: 'uuid' },
      recommendationType: { 
        type: 'string', 
        enum: ['enrollment', 'cost_optimization', 'coverage_gaps', 'comprehensive'], 
        default: 'comprehensive' 
      },
      includePersonalizedOptions: { type: 'boolean', default: true },
      considerLifeEvents: { type: 'boolean', default: true },
      limit: { type: 'number', min: 1, max: 20, default: 10 }
    }
  }),
  benefitsAdministrationController.getBenefitsRecommendations
);

/**
 * @route   GET /api/v1/hr/benefits/ai/trends
 * @desc    Predict benefits trends
 * @access  HR Manager, Admin
 */
router.get(
  '/ai/trends',
  strictRateLimit,
  authorize(['hr:benefits:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      trendType: { 
        type: 'string', 
        enum: ['cost', 'utilization', 'enrollment', 'satisfaction', 'risk'], 
        default: 'cost' 
      },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m', '24m'], default: '12m' },
      includeScenarios: { type: 'boolean', default: true },
      confidenceLevel: { type: 'number', min: 0.8, max: 0.99, default: 0.95 }
    }
  }),
  benefitsAdministrationController.predictBenefitsTrends
);

/**
 * @route   GET /api/v1/hr/benefits/reports/:reportType
 * @desc    Generate benefits reports
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/reports/:reportType',
  standardRateLimit,
  authorize(['hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    params: {
      reportType: { 
        type: 'string', 
        required: true,
        enum: ['enrollment_summary', 'cost_analysis', 'utilization_report', 'compliance_report', 'provider_performance', 'claims_summary', 'open_enrollment_stats'] 
      }
    },
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      format: { type: 'string', enum: ['json', 'csv', 'excel', 'pdf'], default: 'json' },
      includeCharts: { type: 'boolean', default: true },
      includeDetails: { type: 'boolean', default: true },
      filterCriteria: { type: 'string' } // JSON string for complex filters
    }
  }),
  benefitsAdministrationController.generateBenefitsReport
);

/**
 * @route   GET /api/v1/hr/benefits/dashboard
 * @desc    Get benefits dashboard data
 * @access  HR Staff, Employee (own), Manager, Admin
 */
router.get(
  '/dashboard',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      widgets: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { 
          type: 'string', 
          enum: ['enrollment_status', 'cost_summary', 'claims_status', 'provider_info', 'upcoming_deadlines', 'recommendations', 'utilization_summary'] 
        }
      },
      refreshCache: { type: 'boolean', default: false },
      includeAlerts: { type: 'boolean', default: true }
    }
  }),
  benefitsAdministrationController.getBenefitsDashboard
);

// ===== DATA MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/benefits/import
 * @desc    Import benefits data
 * @access  HR Manager, Admin
 */
router.post(
  '/import',
  strictRateLimit,
  authorize(['hr:benefits:write', 'admin']),
  validateRequest({
    body: {
      file: { type: 'string', required: true }, // Base64 or file reference
      importType: { 
        type: 'string', 
        required: true,
        enum: ['plans', 'enrollments', 'claims', 'providers', 'eligibility', 'life_events'] 
      },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      options: {
        type: 'object',
        properties: {
          skipValidation: { type: 'boolean', default: false },
          updateExisting: { type: 'boolean', default: false },
          batchSize: { type: 'number', min: 10, max: 1000, default: 100 },
          dryRun: { type: 'boolean', default: false }
        }
      }
    }
  }),
  audit({ action: 'IMPORT_BENEFITS_DATA', resource: 'benefits_data_import' }),
  benefitsAdministrationController.importBenefitsData
);

/**
 * @route   GET /api/v1/hr/benefits/export
 * @desc    Export benefits data
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/export',
  strictRateLimit,
  authorize(['hr:benefits:read', 'admin']),
  validateRequest({
    query: {
      format: { type: 'string', required: true, enum: ['csv', 'excel', 'json'] },
      dataType: { 
        type: 'string', 
        required: true,
        enum: ['plans', 'enrollments', 'claims', 'providers', 'analytics', 'all'] 
      },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      planYear: { type: 'number', min: 2020 },
      includePersonalData: { type: 'boolean', default: false },
      filterCriteria: { type: 'string' }, // JSON string for complex filters
      anonymize: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'EXPORT_BENEFITS_DATA', resource: 'benefits_data_export' }),
  benefitsAdministrationController.exportBenefitsData
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/benefits/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  benefitsAdministrationController.healthCheck
);

export default router;
