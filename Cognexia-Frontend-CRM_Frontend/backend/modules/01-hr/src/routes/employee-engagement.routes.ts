// Industry 5.0 ERP Backend - Employee Engagement Routes
// Comprehensive routing for engagement surveys, wellness programs, recognition, and AI-powered analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { EmployeeEngagementController } from '../controllers/employee-engagement.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const employeeEngagementController = new EmployeeEngagementController();

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

// ===== ENGAGEMENT SURVEYS =====

/**
 * @route   POST /api/v1/hr/engagement/surveys
 * @desc    Create new engagement survey
 * @access  HR Manager, Admin
 */
router.post(
  '/surveys',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['engagement', 'satisfaction', 'culture', 'onboarding', 'exit', 'custom'] 
      },
      questions: { 
        type: 'array', 
        required: true, 
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            questionText: { type: 'string', required: true },
            questionType: { type: 'string', required: true, enum: ['rating', 'multiple_choice', 'text', 'yes_no'] },
            options: { type: 'array' },
            required: { type: 'boolean', default: false }
          }
        }
      },
      targetAudience: {
        type: 'object',
        properties: {
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          roles: { type: 'array', items: { type: 'string' } },
          employeeIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
        }
      },
      scheduledStartDate: { type: 'string', format: 'date-time' },
      scheduledEndDate: { type: 'string', format: 'date-time' },
      anonymous: { type: 'boolean', default: true },
      reminderSettings: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
          customDays: { type: 'array', items: { type: 'number', min: 1, max: 30 } }
        }
      }
    }
  }),
  audit({ action: 'CREATE_SURVEY', resource: 'engagement_survey' }),
  employeeEngagementController.createSurvey
);

/**
 * @route   GET /api/v1/hr/engagement/surveys
 * @desc    Get engagement surveys with filtering
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/surveys',
  standardRateLimit,
  authorize(['hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      type: { type: 'string', enum: ['engagement', 'satisfaction', 'culture', 'onboarding', 'exit', 'custom'] },
      status: { type: 'string', enum: ['draft', 'active', 'completed', 'archived'] },
      departmentId: { type: 'string', format: 'uuid' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeEngagementController.getSurveys
);

/**
 * @route   GET /api/v1/hr/engagement/surveys/:id
 * @desc    Get specific survey by ID
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/surveys/:id',
  standardRateLimit,
  authorize(['hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeResponses: { type: 'boolean', default: false },
      includeAnalytics: { type: 'boolean', default: true }
    }
  }),
  employeeEngagementController.getSurvey
);

/**
 * @route   POST /api/v1/hr/engagement/surveys/:id/launch
 * @desc    Launch a survey
 * @access  HR Manager, Admin
 */
router.post(
  '/surveys/:id/launch',
  strictRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      targetEmployees: { 
        type: 'array', 
        items: { type: 'string', format: 'uuid' }
      },
      launchDate: { type: 'string', format: 'date-time' },
      reminderSchedule: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
          times: { type: 'array', items: { type: 'string', format: 'time' } }
        }
      }
    }
  }),
  audit({ action: 'LAUNCH_SURVEY', resource: 'engagement_survey' }),
  employeeEngagementController.launchSurvey
);

/**
 * @route   POST /api/v1/hr/engagement/surveys/:id/responses
 * @desc    Submit survey response
 * @access  Employee, Manager, Admin
 */
router.post(
  '/surveys/:id/responses',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      answers: { 
        type: 'array', 
        required: true, 
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string', required: true },
            answer: { required: true }, // Can be string, number, or array
            confidence: { type: 'number', min: 1, max: 5 }
          }
        }
      },
      anonymous: { type: 'boolean', default: false },
      completionTime: { type: 'number', min: 1 }, // seconds
      comments: { type: 'string', maxLength: 2000 }
    }
  }),
  audit({ action: 'SUBMIT_SURVEY_RESPONSE', resource: 'engagement_survey_response' }),
  employeeEngagementController.submitSurveyResponse
);

/**
 * @route   GET /api/v1/hr/engagement/surveys/:id/responses
 * @desc    Get survey responses
 * @access  HR Manager, Admin
 */
router.get(
  '/surveys/:id/responses',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      departmentId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      includeAnonymous: { type: 'boolean', default: true },
      limit: { type: 'number', min: 1, max: 100, default: 50 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeEngagementController.getSurveyResponses
);

/**
 * @route   GET /api/v1/hr/engagement/surveys/:id/analytics
 * @desc    Get survey analytics
 * @access  HR Manager, Admin
 */
router.get(
  '/surveys/:id/analytics',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      analyticsType: { 
        type: 'string', 
        enum: ['basic', 'comprehensive', 'demographic', 'sentiment'], 
        default: 'comprehensive' 
      },
      segmentBy: { type: 'string', enum: ['department', 'role', 'tenure', 'age_group', 'location'] }
    }
  }),
  employeeEngagementController.getSurveyAnalytics
);

// ===== PULSE SURVEYS =====

/**
 * @route   POST /api/v1/hr/engagement/pulse-surveys
 * @desc    Create pulse survey
 * @access  HR Manager, Admin
 */
router.post(
  '/pulse-surveys',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      frequency: { 
        type: 'string', 
        required: true, 
        enum: ['weekly', 'biweekly', 'monthly', 'quarterly'] 
      },
      questions: { 
        type: 'array', 
        required: true, 
        maxItems: 5, // Pulse surveys should be short
        items: {
          type: 'object',
          properties: {
            questionText: { type: 'string', required: true },
            questionType: { type: 'string', required: true, enum: ['rating', 'yes_no'] },
            scale: { type: 'number', enum: [5, 7, 10], default: 5 }
          }
        }
      },
      autoLaunch: { type: 'boolean', default: true },
      targetDepartments: { type: 'array', items: { type: 'string', format: 'uuid' } }
    }
  }),
  audit({ action: 'CREATE_PULSE_SURVEY', resource: 'pulse_survey' }),
  employeeEngagementController.createPulseSurvey
);

/**
 * @route   GET /api/v1/hr/engagement/pulse-surveys/:id/results
 * @desc    Get pulse survey results with trend analysis
 * @access  HR Manager, Admin
 */
router.get(
  '/pulse-surveys/:id/results',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      departmentId: { type: 'string', format: 'uuid' },
      trendAnalysis: { type: 'boolean', default: true }
    }
  }),
  employeeEngagementController.getPulseSurveyResults
);

// ===== FEEDBACK MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/engagement/feedback
 * @desc    Submit feedback
 * @access  Employee, Manager, Admin
 */
router.post(
  '/feedback',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    body: {
      type: { 
        type: 'string', 
        required: true, 
        enum: ['suggestion', 'complaint', 'compliment', 'idea', 'general', 'anonymous_tip'] 
      },
      category: { 
        type: 'string', 
        enum: ['workplace', 'management', 'culture', 'benefits', 'processes', 'safety', 'other'] 
      },
      content: { type: 'string', required: true, minLength: 10, maxLength: 5000 },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
      anonymous: { type: 'boolean', default: false },
      employeeId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      attachments: { 
        type: 'array', 
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' },
            size: { type: 'number', max: 10485760 } // 10MB limit
          }
        }
      }
    }
  }),
  audit({ action: 'SUBMIT_FEEDBACK', resource: 'employee_feedback' }),
  employeeEngagementController.submitFeedback
);

/**
 * @route   GET /api/v1/hr/engagement/feedback
 * @desc    Get feedback with filtering and sentiment analysis
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/feedback',
  standardRateLimit,
  authorize(['hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      type: { type: 'string', enum: ['suggestion', 'complaint', 'compliment', 'idea', 'general', 'anonymous_tip'] },
      status: { type: 'string', enum: ['new', 'in_review', 'in_progress', 'resolved', 'closed'] },
      departmentId: { type: 'string', format: 'uuid' },
      sentimentFilter: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeEngagementController.getFeedback
);

// ===== RECOGNITION PROGRAMS =====

/**
 * @route   POST /api/v1/hr/engagement/recognition-programs
 * @desc    Create recognition program
 * @access  HR Manager, Admin
 */
router.post(
  '/recognition-programs',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['peer_to_peer', 'manager_to_employee', 'achievement_based', 'milestone', 'innovation'] 
      },
      criteria: { 
        type: 'object', 
        required: true,
        properties: {
          eligibility: { type: 'string', required: true },
          requirements: { type: 'array', items: { type: 'string' } },
          frequency: { type: 'string', enum: ['one_time', 'monthly', 'quarterly', 'annual'] }
        }
      },
      rewards: {
        type: 'object',
        properties: {
          types: { type: 'array', items: { type: 'string' } },
          levels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                level: { type: 'string', required: true },
                reward: { type: 'string', required: true },
                value: { type: 'number' }
              }
            }
          }
        }
      },
      budget: {
        type: 'object',
        properties: {
          annual: { type: 'number', min: 0 },
          perAward: { type: 'number', min: 0 }
        }
      },
      autoApproval: { type: 'boolean', default: false },
      publicRecognition: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'CREATE_RECOGNITION_PROGRAM', resource: 'recognition_program' }),
  employeeEngagementController.createRecognitionProgram
);

/**
 * @route   POST /api/v1/hr/engagement/recognition-programs/:id/nominations
 * @desc    Nominate employee for recognition
 * @access  Employee, Manager, Admin
 */
router.post(
  '/recognition-programs/:id/nominations',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      nomineeId: { type: 'string', required: true, format: 'uuid' },
      reason: { type: 'string', required: true, minLength: 20, maxLength: 2000 },
      supportingData: {
        type: 'object',
        properties: {
          achievements: { type: 'array', items: { type: 'string' } },
          metrics: { type: 'object' },
          testimonials: { type: 'array', items: { type: 'string' } },
          evidence: { 
            type: 'array', 
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['document', 'image', 'video', 'link'] },
                url: { type: 'string', format: 'uri' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      requestedAwardLevel: { type: 'string' },
      urgency: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
    }
  }),
  audit({ action: 'NOMINATE_FOR_RECOGNITION', resource: 'recognition_nomination' }),
  employeeEngagementController.nominateForRecognition
);

/**
 * @route   GET /api/v1/hr/engagement/recognition-programs/:id/nominations
 * @desc    Get recognition nominations
 * @access  HR Manager, Admin
 */
router.get(
  '/recognition-programs/:id/nominations',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'awarded'] },
      departmentId: { type: 'string', format: 'uuid' },
      nomineeId: { type: 'string', format: 'uuid' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  employeeEngagementController.getRecognitionNominations
);

/**
 * @route   POST /api/v1/hr/engagement/recognition-programs/:programId/nominations/:nominationId/award
 * @desc    Award recognition to nominated employee
 * @access  HR Manager, Admin
 */
router.post(
  '/recognition-programs/:programId/nominations/:nominationId/award',
  strictRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    params: {
      programId: { type: 'string', required: true, format: 'uuid' },
      nominationId: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      awardLevel: { type: 'string', required: true },
      reward: {
        type: 'object',
        properties: {
          type: { type: 'string', required: true },
          value: { type: 'number' },
          description: { type: 'string' }
        }
      },
      publicAnnouncement: { type: 'boolean', default: true },
      announcementChannels: { 
        type: 'array', 
        items: { type: 'string', enum: ['email', 'intranet', 'slack', 'teams', 'newsletter'] }
      },
      comments: { type: 'string', maxLength: 1000 },
      presentationDate: { type: 'string', format: 'date-time' }
    }
  }),
  audit({ action: 'AWARD_RECOGNITION', resource: 'recognition_award' }),
  employeeEngagementController.awardRecognition
);

// ===== WELLNESS PROGRAMS =====

/**
 * @route   POST /api/v1/hr/engagement/wellness-programs
 * @desc    Create wellness program
 * @access  HR Manager, Admin
 */
router.post(
  '/wellness-programs',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['fitness', 'mental_health', 'nutrition', 'preventive_care', 'work_life_balance', 'comprehensive'] 
      },
      duration: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          ongoing: { type: 'boolean', default: false }
        }
      },
      activities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            type: { type: 'string', required: true },
            description: { type: 'string' },
            points: { type: 'number', min: 0 },
            frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'as_needed'] }
          }
        }
      },
      incentives: {
        type: 'object',
        properties: {
          pointsSystem: { type: 'boolean', default: false },
          rewards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pointsRequired: { type: 'number', required: true },
                reward: { type: 'string', required: true },
                value: { type: 'number' }
              }
            }
          },
          leaderboard: { type: 'boolean', default: false }
        }
      },
      eligibility: {
        type: 'object',
        properties: {
          allEmployees: { type: 'boolean', default: true },
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          roles: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }),
  audit({ action: 'CREATE_WELLNESS_PROGRAM', resource: 'wellness_program' }),
  employeeEngagementController.createWellnessProgram
);

/**
 * @route   POST /api/v1/hr/engagement/wellness-programs/:id/enroll
 * @desc    Enroll in wellness program
 * @access  Employee, Manager, Admin
 */
router.post(
  '/wellness-programs/:id/enroll',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      goals: {
        type: 'object',
        properties: {
          primary: { type: 'string', required: true },
          secondary: { type: 'array', items: { type: 'string' } },
          targetMetrics: { type: 'object' }
        }
      },
      preferences: {
        type: 'object',
        properties: {
          activityTypes: { type: 'array', items: { type: 'string' } },
          notifications: { type: 'boolean', default: true },
          privacy: { type: 'string', enum: ['public', 'team', 'private'], default: 'team' }
        }
      },
      healthAssessment: {
        type: 'object',
        properties: {
          currentLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          medicalClearance: { type: 'boolean', default: false },
          restrictions: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }),
  audit({ action: 'ENROLL_WELLNESS_PROGRAM', resource: 'wellness_enrollment' }),
  employeeEngagementController.enrollInWellnessProgram
);

/**
 * @route   POST /api/v1/hr/engagement/wellness-programs/:id/activities
 * @desc    Track wellness activity
 * @access  Employee, Manager, Admin
 */
router.post(
  '/wellness-programs/:id/activities',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      activityType: { type: 'string', required: true },
      duration: { type: 'number', min: 1 }, // minutes
      metrics: {
        type: 'object',
        properties: {
          distance: { type: 'number' },
          calories: { type: 'number' },
          steps: { type: 'number' },
          heartRate: { type: 'number' },
          intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
          customMetrics: { type: 'object' }
        }
      },
      notes: { type: 'string', maxLength: 500 },
      mood: { type: 'string', enum: ['excellent', 'good', 'average', 'poor', 'terrible'] },
      verification: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: ['self_report', 'device_sync', 'photo', 'checkin'] },
          evidence: { type: 'string', format: 'uri' }
        }
      }
    }
  }),
  audit({ action: 'TRACK_WELLNESS_ACTIVITY', resource: 'wellness_activity' }),
  employeeEngagementController.trackWellnessActivity
);

/**
 * @route   GET /api/v1/hr/engagement/wellness-programs/:id/stats
 * @desc    Get wellness program statistics
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/wellness-programs/:id/stats',
  standardRateLimit,
  authorize(['employee', 'hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      period: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' },
      includeComparison: { type: 'boolean', default: true },
      metrics: { 
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['participation', 'progress', 'achievements', 'leaderboard'] }
      }
    }
  }),
  employeeEngagementController.getWellnessProgramStats
);

// ===== ENGAGEMENT METRICS & ANALYTICS =====

/**
 * @route   GET /api/v1/hr/engagement/metrics
 * @desc    Get comprehensive engagement metrics
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/metrics',
  standardRateLimit,
  authorize(['hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      period: { type: 'string', enum: ['1m', '3m', '6m', '1y'], default: '3m' },
      metricTypes: { 
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['engagement_score', 'satisfaction', 'sentiment', 'participation', 'recognition', 'wellness'] }
      },
      segmentation: { 
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['department', 'role', 'tenure', 'age_group', 'location'] }
      }
    }
  }),
  employeeEngagementController.getEngagementMetrics
);

/**
 * @route   GET /api/v1/hr/engagement/sentiment-analysis
 * @desc    Get AI-powered sentiment analysis
 * @access  HR Manager, Admin
 */
router.get(
  '/sentiment-analysis',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      analysisType: { 
        type: 'string', 
        enum: ['basic', 'comprehensive', 'trend', 'comparative'], 
        default: 'comprehensive' 
      },
      includeKeywords: { type: 'boolean', default: true },
      sources: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['surveys', 'feedback', 'reviews', 'comments'] }
      }
    }
  }),
  employeeEngagementController.getSentimentAnalysis
);

/**
 * @route   GET /api/v1/hr/engagement/ai/predict-risks
 * @desc    AI-powered engagement risk prediction
 * @access  HR Manager, Admin
 */
router.get(
  '/ai/predict-risks',
  strictRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      riskTypes: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['turnover', 'burnout', 'disengagement', 'performance_decline', 'absenteeism'] }
      },
      timeFrame: { type: 'string', enum: ['1m', '3m', '6m', '1y'], default: '3m' },
      confidenceThreshold: { type: 'number', min: 0.1, max: 1.0, default: 0.7 }
    }
  }),
  employeeEngagementController.predictEngagementRisks
);

/**
 * @route   GET /api/v1/hr/engagement/ai/recommendations
 * @desc    Get AI-powered engagement recommendations
 * @access  HR Manager, Admin
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      basedOn: { 
        type: 'string', 
        enum: ['surveys', 'feedback', 'metrics', 'comprehensive'], 
        default: 'comprehensive' 
      },
      categories: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { type: 'string', enum: ['programs', 'recognition', 'wellness', 'communication', 'development'] }
      },
      limit: { type: 'number', min: 1, max: 20, default: 10 },
      priority: { type: 'string', enum: ['high', 'medium', 'low', 'all'], default: 'all' }
    }
  }),
  employeeEngagementController.getEngagementRecommendations
);

// ===== ACTION PLANS =====

/**
 * @route   POST /api/v1/hr/engagement/action-plans
 * @desc    Create engagement action plan
 * @access  HR Manager, Admin
 */
router.post(
  '/action-plans',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 5, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      scope: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['organization', 'department', 'team', 'individual'], required: true },
          targetIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
        }
      },
      objectives: {
        type: 'array',
        required: true,
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            description: { type: 'string', required: true },
            targetValue: { type: 'number' },
            currentValue: { type: 'number' },
            unit: { type: 'string' },
            deadline: { type: 'string', format: 'date' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
          }
        }
      },
      initiatives: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            description: { type: 'string' },
            type: { type: 'string', enum: ['survey', 'program', 'policy', 'training', 'communication', 'event'] },
            budget: { type: 'number', min: 0 },
            timeline: {
              type: 'object',
              properties: {
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
                milestones: { type: 'array', items: { type: 'string' } }
              }
            },
            assignedTo: { type: 'string', format: 'uuid' }
          }
        }
      },
      budget: {
        type: 'object',
        properties: {
          total: { type: 'number', min: 0 },
          allocated: { type: 'number', min: 0 },
          categories: { type: 'object' }
        }
      },
      timeline: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date', required: true },
          endDate: { type: 'string', format: 'date', required: true },
          reviewFrequency: { type: 'string', enum: ['weekly', 'biweekly', 'monthly', 'quarterly'] }
        }
      }
    }
  }),
  audit({ action: 'CREATE_ACTION_PLAN', resource: 'engagement_action_plan' }),
  employeeEngagementController.createEngagementActionPlan
);

/**
 * @route   PUT /api/v1/hr/engagement/action-plans/:id/progress
 * @desc    Update action plan progress
 * @access  HR Manager, Plan Owner, Admin
 */
router.put(
  '/action-plans/:id/progress',
  standardRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      completedObjectives: { 
        type: 'array', 
        items: {
          type: 'object',
          properties: {
            objectiveId: { type: 'string', required: true },
            currentValue: { type: 'number' },
            status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'on_hold'] },
            completionDate: { type: 'string', format: 'date' }
          }
        }
      },
      progress: {
        type: 'object',
        properties: {
          overallProgress: { type: 'number', min: 0, max: 100 },
          initiativesProgress: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                initiativeId: { type: 'string', required: true },
                progress: { type: 'number', min: 0, max: 100 },
                status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'] },
                issues: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      metrics: {
        type: 'object',
        properties: {
          kpis: { type: 'object' },
          achievements: { type: 'array', items: { type: 'string' } },
          challenges: { type: 'array', items: { type: 'string' } }
        }
      },
      notes: { type: 'string', maxLength: 2000 },
      nextSteps: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'UPDATE_ACTION_PLAN_PROGRESS', resource: 'engagement_action_plan' }),
  employeeEngagementController.trackActionPlanProgress
);

// ===== REPORTS & DASHBOARD =====

/**
 * @route   GET /api/v1/hr/engagement/reports/:reportType
 * @desc    Generate engagement reports
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/reports/:reportType',
  standardRateLimit,
  authorize(['hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    params: {
      reportType: { 
        type: 'string', 
        required: true,
        enum: ['engagement_overview', 'survey_analysis', 'recognition_summary', 'wellness_report', 'sentiment_trends', 'action_plan_status'] 
      }
    },
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      format: { type: 'string', enum: ['json', 'csv', 'excel', 'pdf'], default: 'json' },
      includeComparisons: { type: 'boolean', default: true },
      granularity: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'monthly' }
    }
  }),
  employeeEngagementController.generateEngagementReport
);

/**
 * @route   GET /api/v1/hr/engagement/dashboard
 * @desc    Get engagement dashboard data
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/dashboard',
  standardRateLimit,
  authorize(['employee', 'hr:engagement:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      period: { type: 'string', enum: ['1m', '3m', '6m', '1y'], default: '3m' },
      widgets: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { 
          type: 'string', 
          enum: ['engagement_score', 'survey_status', 'recognition', 'wellness', 'feedback', 'action_plans', 'trends'] 
        }
      },
      refreshCache: { type: 'boolean', default: false }
    }
  }),
  employeeEngagementController.getEngagementDashboard
);

// ===== TEAM BUILDING =====

/**
 * @route   POST /api/v1/hr/engagement/team-building
 * @desc    Create team building activity
 * @access  HR Staff, Manager, Admin
 */
router.post(
  '/team-building',
  standardRateLimit,
  authorize(['hr:engagement:write', 'manager', 'admin']),
  validateRequest({
    body: {
      name: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      type: { 
        type: 'string', 
        required: true, 
        enum: ['workshop', 'outdoor', 'virtual', 'social', 'volunteer', 'competition', 'retreat'] 
      },
      scheduledDate: { type: 'string', required: true, format: 'date-time' },
      duration: { type: 'number', min: 30 }, // minutes
      location: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['physical', 'virtual', 'hybrid'] },
          address: { type: 'string' },
          virtualLink: { type: 'string', format: 'uri' },
          capacity: { type: 'number', min: 1 }
        }
      },
      targetAudience: {
        type: 'object',
        properties: {
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          teams: { type: 'array', items: { type: 'string', format: 'uuid' } },
          roles: { type: 'array', items: { type: 'string' } },
          specificEmployees: { type: 'array', items: { type: 'string', format: 'uuid' } }
        }
      },
      budget: {
        type: 'object',
        properties: {
          total: { type: 'number', min: 0 },
          perPerson: { type: 'number', min: 0 },
          categories: { type: 'object' }
        }
      },
      requirements: {
        type: 'object',
        properties: {
          rsvpRequired: { type: 'boolean', default: true },
          rsvpDeadline: { type: 'string', format: 'date-time' },
          maxParticipants: { type: 'number', min: 1 },
          prerequisites: { type: 'array', items: { type: 'string' } }
        }
      },
      catering: {
        type: 'object',
        properties: {
          provided: { type: 'boolean', default: false },
          type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'drinks'] },
          dietaryOptions: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }),
  audit({ action: 'CREATE_TEAM_BUILDING_ACTIVITY', resource: 'team_building_activity' }),
  employeeEngagementController.createTeamBuildingActivity
);

/**
 * @route   POST /api/v1/hr/engagement/team-building/:id/rsvp
 * @desc    RSVP to team building activity
 * @access  Employee, Manager, Admin
 */
router.post(
  '/team-building/:id/rsvp',
  standardRateLimit,
  authorize(['employee', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      employeeId: { type: 'string', format: 'uuid' },
      response: { type: 'string', required: true, enum: ['attending', 'not_attending', 'maybe'] },
      dietaryRequirements: { 
        type: 'array', 
        items: { type: 'string', enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher', 'other'] }
      },
      customDietaryNotes: { type: 'string', maxLength: 500 },
      accessibilityNeeds: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string', maxLength: 500 },
      guestCount: { type: 'number', min: 0, max: 5, default: 0 },
      transportation: { type: 'string', enum: ['own', 'carpool', 'company_bus', 'public'] }
    }
  }),
  audit({ action: 'RSVP_TEAM_BUILDING', resource: 'team_building_rsvp' }),
  employeeEngagementController.rsvpTeamBuildingActivity
);

// ===== DATA MANAGEMENT =====

/**
 * @route   POST /api/v1/hr/engagement/import
 * @desc    Import engagement data
 * @access  HR Manager, Admin
 */
router.post(
  '/import',
  strictRateLimit,
  authorize(['hr:engagement:write', 'admin']),
  validateRequest({
    body: {
      file: { type: 'string', required: true }, // Base64 or file reference
      importType: { 
        type: 'string', 
        required: true,
        enum: ['survey_responses', 'feedback', 'recognition_data', 'wellness_activities', 'historical_metrics'] 
      },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      options: {
        type: 'object',
        properties: {
          skipDuplicates: { type: 'boolean', default: true },
          updateExisting: { type: 'boolean', default: false },
          validateData: { type: 'boolean', default: true },
          batchSize: { type: 'number', min: 10, max: 1000, default: 100 }
        }
      }
    }
  }),
  audit({ action: 'IMPORT_ENGAGEMENT_DATA', resource: 'engagement_data_import' }),
  employeeEngagementController.importEngagementData
);

/**
 * @route   GET /api/v1/hr/engagement/export
 * @desc    Export engagement data
 * @access  HR Staff, Manager, Admin
 */
router.get(
  '/export',
  strictRateLimit,
  authorize(['hr:engagement:read', 'admin']),
  validateRequest({
    query: {
      format: { type: 'string', required: true, enum: ['csv', 'excel', 'json'] },
      dataType: { 
        type: 'string', 
        required: true,
        enum: ['surveys', 'feedback', 'recognition', 'wellness', 'metrics', 'all'] 
      },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      departmentId: { type: 'string', format: 'uuid' },
      includePersonalData: { type: 'boolean', default: false },
      anonymize: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'EXPORT_ENGAGEMENT_DATA', resource: 'engagement_data_export' }),
  employeeEngagementController.exportEngagementData
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/engagement/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  employeeEngagementController.healthCheck
);

export default router;
