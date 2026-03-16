// Industry 5.0 ERP Backend - Employee Self-Service Routes
// Comprehensive routing for employee portal, profile management, document access, and AI-powered assistance
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { EmployeeSelfServiceController } from '../controllers/employee-self-service.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const employeeSelfServiceController = new EmployeeSelfServiceController();

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

// ===== PROFILE MANAGEMENT =====

/**
 * @route   GET /api/v1/hr/self-service/profile
 * @desc    Get employee profile
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/profile',
  standardRateLimit,
  authorize(['employee', 'hr:employees:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' } // Optional: for HR/Admin access
    }
  }),
  employeeSelfServiceController.getEmployeeProfile
);

/**
 * @route   PUT /api/v1/hr/self-service/profile
 * @desc    Update employee profile
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.put(
  '/profile',
  standardRateLimit,
  authorize(['employee', 'hr:employees:write', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' } // Optional: for HR/Admin access
    },
    body: {
      contactInfo: {
        type: 'object',
        properties: {
          personalEmail: { type: 'string', format: 'email' },
          phone: { type: 'string' },
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
      emergencyContacts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            relationship: { type: 'string', required: true },
            phone: { type: 'string', required: true },
            isPrimary: { type: 'boolean', default: false }
          }
        }
      },
      personalDetails: {
        type: 'object',
        properties: {
          preferredName: { type: 'string' },
          pronouns: { type: 'string' },
          maritalStatus: { type: 'string', enum: ['single', 'married', 'domestic_partner', 'divorced', 'widowed'] }
        }
      },
      customFields: { type: 'object' }
    }
  }),
  audit({ action: 'UPDATE_EMPLOYEE_PROFILE', resource: 'employee_profile' }),
  employeeSelfServiceController.updateEmployeeProfile
);

// ===== DOCUMENT MANAGEMENT =====

/**
 * @route   GET /api/v1/hr/self-service/documents
 * @desc    Get personal documents
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/documents',
  standardRateLimit,
  authorize(['employee', 'hr:documents:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for HR/Admin access
      documentType: { type: 'string', enum: ['payslip', 'tax', 'contract', 'policy', 'certificate', 'other'] },
      category: { type: 'string' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getPersonalDocuments
);

/**
 * @route   POST /api/v1/hr/self-service/documents
 * @desc    Upload personal document
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.post(
  '/documents',
  standardRateLimit,
  authorize(['employee', 'hr:documents:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for HR/Admin access
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['w4', 'i9', 'direct_deposit', 'certification', 'license', 'medical', 'other'] 
      },
      fileUrl: { type: 'string', required: true, format: 'uri' },
      fileSize: { type: 'number', required: true, max: 20971520 }, // 20MB limit
      category: { type: 'string', default: 'personal' },
      expirationDate: { type: 'string', format: 'date' },
      metadata: { type: 'object' }
    }
  }),
  audit({ action: 'UPLOAD_PERSONAL_DOCUMENT', resource: 'personal_document' }),
  employeeSelfServiceController.uploadPersonalDocument
);

// ===== TIME OFF MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/self-service/time-off
 * @desc    Request time off
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.post(
  '/time-off',
  standardRateLimit,
  authorize(['employee', 'hr:time-off:write', 'manager', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for manager/admin access
      type: { 
        type: 'string', 
        required: true, 
        enum: ['vacation', 'sick_leave', 'personal', 'bereavement', 'jury_duty', 'unpaid', 'fmla'] 
      },
      startDate: { type: 'string', required: true, format: 'date-time' },
      endDate: { type: 'string', required: true, format: 'date-time' },
      isPartialDay: { type: 'boolean', default: false },
      partialDayType: { type: 'string', enum: ['morning', 'afternoon'] },
      reason: { type: 'string', maxLength: 1000 },
      comments: { type: 'string', maxLength: 1000 },
      attachments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      }
    }
  }),
  audit({ action: 'REQUEST_TIME_OFF', resource: 'time_off_request' }),
  employeeSelfServiceController.requestTimeOff
);

/**
 * @route   GET /api/v1/hr/self-service/time-off
 * @desc    Get time off requests and balances
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/time-off',
  standardRateLimit,
  authorize(['employee', 'hr:time-off:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for manager/admin access
      status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      includeBalances: { type: 'boolean', default: true },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getTimeOffRequests
);

/**
 * @route   DELETE /api/v1/hr/self-service/time-off/:id
 * @desc    Cancel time off request
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.delete(
  '/time-off/:id',
  standardRateLimit,
  authorize(['employee', 'hr:time-off:write', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      reason: { type: 'string', maxLength: 500, required: true }
    }
  }),
  audit({ action: 'CANCEL_TIME_OFF', resource: 'time_off_request' }),
  employeeSelfServiceController.cancelTimeOffRequest
);

// ===== PAYROLL & BENEFITS =====

/**
 * @route   GET /api/v1/hr/self-service/pay-stubs
 * @desc    Get pay stubs
 * @access  Employee (own), HR Staff, Admin
 */
router.get(
  '/pay-stubs',
  strictRateLimit,
  authorize(['employee', 'hr:payroll:read', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for admin access
      year: { type: 'number', min: 2020 },
      payPeriod: { type: 'string', format: 'date' },
      limit: { type: 'number', min: 1, max: 50, default: 12 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getPayStubs
);

/**
 * @route   GET /api/v1/hr/self-service/tax-documents
 * @desc    Get tax documents (W-2, 1099, etc.)
 * @access  Employee (own), HR Staff, Admin
 */
router.get(
  '/tax-documents',
  strictRateLimit,
  authorize(['employee', 'hr:payroll:read', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for admin access
      taxYear: { type: 'number', required: true, min: 2020 },
      documentType: { type: 'string', enum: ['w2', '1099', 'w4', '1095c'] }
    }
  }),
  employeeSelfServiceController.getTaxDocuments
);

/**
 * @route   GET /api/v1/hr/self-service/benefits
 * @desc    Get benefits summary
 * @access  Employee (own), HR Staff, Admin
 */
router.get(
  '/benefits',
  standardRateLimit,
  authorize(['employee', 'hr:benefits:read', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for admin access
      planYear: { type: 'number', min: 2020 }
    }
  }),
  employeeSelfServiceController.getBenefitsSummary
);

// ===== TIME & ATTENDANCE =====

/**
 * @route   GET /api/v1/hr/self-service/time-attendance
 * @desc    Get time and attendance summary
 * @access  Employee (own), Manager, Admin
 */
router.get(
  '/time-attendance',
  standardRateLimit,
  authorize(['employee', 'hr:attendance:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' }, // Optional: for manager/admin access
      startDate: { type: 'string', required: true, format: 'date' },
      endDate: { type: 'string', required: true, format: 'date' },
      includeDetails: { type: 'boolean', default: false }
    }
  }),
  employeeSelfServiceController.getTimeAttendanceSummary
);

/**
 * @route   POST /api/v1/hr/self-service/time-clock
 * @desc    Clock in or out
 * @access  Employee
 */
router.post(
  '/time-clock',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    body: {
      action: { type: 'string', required: true, enum: ['clock_in', 'clock_out', 'start_break', 'end_break'] },
      location: {
        type: 'object',
        properties: {
          latitude: { type: 'number', required: true },
          longitude: { type: 'number', required: true }
        }
      },
      notes: { type: 'string', maxLength: 200 }
    }
  }),
  audit({ action: 'TIME_CLOCK', resource: 'time_entry' }),
  employeeSelfServiceController.clockInOut
);

// ===== PERFORMANCE & DEVELOPMENT =====

/**
 * @route   POST /api/v1/hr/self-service/performance/self-assessment
 * @desc    Submit performance self-assessment
 * @access  Employee (own)
 */
router.post(
  '/performance/self-assessment',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    body: {
      reviewPeriodId: { type: 'string', required: true, format: 'uuid' },
      responses: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string', required: true },
            rating: { type: 'number', min: 1, max: 5 },
            comments: { type: 'string', maxLength: 2000 }
          }
        }
      },
      goalsForNextPeriod: { type: 'array', items: { type: 'string' } },
      overallComments: { type: 'string', maxLength: 5000 }
    }
  }),
  audit({ action: 'SUBMIT_SELF_ASSESSMENT', resource: 'performance_assessment' }),
  employeeSelfServiceController.submitSelfAssessment
);

/**
 * @route   GET /api/v1/hr/self-service/performance/history
 * @desc    Get own performance history
 * @access  Employee (own)
 */
router.get(
  '/performance/history',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      year: { type: 'number', min: 2020 },
      reviewType: { type: 'string', enum: ['annual', 'mid_year', 'project', 'probationary'] },
      limit: { type: 'number', min: 1, max: 10, default: 5 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getPerformanceHistory
);

/**
 * @route   GET /api/v1/hr/self-service/learning
 * @desc    Get learning and development opportunities
 * @access  Employee
 */
router.get(
  '/learning',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      category: { type: 'string', enum: ['course', 'certification', 'mentorship', 'seminar'] },
      skillArea: { type: 'string' },
      deliveryMethod: { type: 'string', enum: ['online', 'in_person', 'hybrid'] },
      limit: { type: 'number', min: 1, max: 50, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getLearningOpportunities
);

/**
 * @route   POST /api/v1/hr/self-service/learning/enroll
 * @desc    Enroll in training course
 * @access  Employee
 */
router.post(
  '/learning/enroll',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    body: {
      courseId: { type: 'string', required: true, format: 'uuid' },
      expectedCompletionDate: { type: 'string', format: 'date' },
      justification: { type: 'string', maxLength: 1000 },
      managerApprovalNeeded: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'ENROLL_TRAINING', resource: 'training_enrollment' }),
  employeeSelfServiceController.enrollInTraining
);

// ===== SUPPORT & RESOURCES =====

/**
 * @route   POST /api/v1/hr/self-service/support/ticket
 * @desc    Submit help desk ticket
 * @access  Employee
 */
router.post(
  '/support/ticket',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    body: {
      subject: { type: 'string', required: true, minLength: 5, maxLength: 200 },
      description: { type: 'string', required: true, minLength: 20, maxLength: 5000 },
      category: { 
        type: 'string', 
        required: true, 
        enum: ['payroll', 'benefits', 'it', 'policy', 'personal_info', 'other'] 
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
      attachments: {
        type: 'array',
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      }
    }
  }),
  audit({ action: 'SUBMIT_SUPPORT_TICKET', resource: 'support_ticket' }),
  employeeSelfServiceController.submitSupportTicket
);

/**
 * @route   GET /api/v1/hr/self-service/support/tickets
 * @desc    Get own support tickets
 * @access  Employee (own)
 */
router.get(
  '/support/tickets',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      status: { type: 'string', enum: ['open', 'in_progress', 'closed', 'on_hold'] },
      category: { type: 'string', enum: ['payroll', 'benefits', 'it', 'policy', 'personal_info', 'other'] },
      limit: { type: 'number', min: 1, max: 50, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getSupportTickets
);

/**
 * @route   GET /api/v1/hr/self-service/directory
 * @desc    Get company directory
 * @access  Employee, Manager, Admin
 */
router.get(
  '/directory',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    query: {
      searchTerm: { type: 'string' },
      department: { type: 'string' },
      location: { type: 'string' },
      limit: { type: 'number', min: 1, max: 200, default: 50 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getCompanyDirectory
);

// ===== NOTIFICATIONS & PREFERENCES =====

/**
 * @route   GET /api/v1/hr/self-service/notifications
 * @desc    Get notifications
 * @access  Employee (own)
 */
router.get(
  '/notifications',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      type: { type: 'string', enum: ['action_required', 'information', 'alert', 'update'] },
      status: { type: 'string', enum: ['read', 'unread'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeSelfServiceController.getNotifications
);

/**
 * @route   PUT /api/v1/hr/self-service/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Employee (own)
 */
router.put(
  '/notifications/:id/read',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    }
  }),
  employeeSelfServiceController.markNotificationRead
);

/**
 * @route   PUT /api/v1/hr/self-service/notification-preferences
 * @desc    Update notification preferences
 * @access  Employee (own)
 */
router.put(
  '/notification-preferences',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    body: {
      preferences: {
        type: 'object',
        required: true,
        properties: {
          channels: {
            type: 'object',
            properties: {
              email: { type: 'boolean', default: true },
              sms: { type: 'boolean', default: false },
              push: { type: 'boolean', default: true }
            }
          },
          categories: {
            type: 'object',
            properties: {
              payroll: { type: 'boolean', default: true },
              benefits: { type: 'boolean', default: true },
              timeOff: { type: 'boolean', default: true },
              performance: { type: 'boolean', default: true },
              learning: { type: 'boolean', default: true },
              companyNews: { type: 'boolean', default: true }
            }
          }
        }
      }
    }
  }),
  audit({ action: 'UPDATE_NOTIFICATION_PREFERENCES', resource: 'notification_preferences' }),
  employeeSelfServiceController.updateNotificationPreferences
);

// ===== AI-POWERED ASSISTANCE =====

/**
 * @route   GET /api/v1/hr/self-service/ai/recommendations
 * @desc    Get AI-powered personal recommendations
 * @access  Employee (own)
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      category: { 
        type: 'string', 
        enum: ['learning', 'career', 'benefits', 'wellness', 'engagement', 'all'],
        default: 'all'
      },
      limit: { type: 'number', min: 1, max: 20, default: 10 }
    }
  }),
  employeeSelfServiceController.getPersonalRecommendations
);

/**
 * @route   GET /api/v1/hr/self-service/career/suggestions
 * @desc    Get AI-powered career development suggestions
 * @access  Employee (own)
 */
router.get(
  '/career/suggestions',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      focusArea: { 
        type: 'string', 
        enum: ['skill_development', 'next_role', 'mentorship', 'project_opportunities'] 
      }
    }
  }),
  employeeSelfServiceController.getCareerDevelopmentSuggestions
);

// ===== DASHBOARD & ANALYTICS =====

/**
 * @route   GET /api/v1/hr/self-service/analytics
 * @desc    Get personal analytics dashboard
 * @access  Employee (own)
 */
router.get(
  '/analytics',
  standardRateLimit,
  authorize(['employee']),
  validateRequest({
    query: {
      period: { type: 'string', enum: ['3m', '6m', '1y', 'all_time'], default: '1y' },
      widgets: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { 
          type: 'string', 
          enum: ['time_off_balance', 'pay_summary', 'performance_snapshot', 'learning_progress', 'engagement_score', 'benefits_overview'] 
        }
      },
      refreshCache: { type: 'boolean', default: false }
    }
  }),
  employeeSelfServiceController.getPersonalAnalytics
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/self-service/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  employeeSelfServiceController.healthCheck
);

export default router;
