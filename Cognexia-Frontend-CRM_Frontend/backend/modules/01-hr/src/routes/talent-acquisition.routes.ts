// Industry 5.0 ERP Backend - Talent Acquisition Routes
// Comprehensive routing for recruitment, candidate management, and AI-powered hiring
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { TalentAcquisitionController } from '../controllers/talent-acquisition.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const talentAcquisitionController = new TalentAcquisitionController();

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

// ===== JOB REQUISITIONS =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/job-requisitions
 * @desc    Create job requisition
 * @access  HR Manager, Hiring Manager, Admin
 */
router.post(
  '/job-requisitions',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', required: true, minLength: 50, maxLength: 5000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', required: true, format: 'uuid' },
      positionId: { type: 'string', format: 'uuid' },
      employmentType: { 
        type: 'string', 
        required: true, 
        enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship'] 
      },
      location: {
        type: 'object',
        required: true,
        properties: {
          type: { type: 'string', enum: ['onsite', 'remote', 'hybrid'], required: true },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string', default: 'US' }
        }
      },
      compensation: {
        type: 'object',
        properties: {
          salaryMin: { type: 'number', min: 0 },
          salaryMax: { type: 'number', min: 0 },
          currency: { type: 'string', default: 'USD' },
          benefits: { type: 'array', items: { type: 'string' } }
        }
      },
      requirements: {
        type: 'object',
        properties: {
          experience: { type: 'string' },
          education: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          certifications: { type: 'array', items: { type: 'string' } }
        }
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
      expectedStartDate: { type: 'string', format: 'date' },
      openings: { type: 'number', required: true, min: 1, default: 1 },
      hiringManagerId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['draft', 'pending_approval', 'approved', 'posted', 'on_hold', 'closed'], default: 'draft' }
    }
  }),
  audit({ action: 'CREATE_JOB_REQUISITION', resource: 'job_requisition' }),
  talentAcquisitionController.createJobRequisition
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/job-requisitions
 * @desc    Get job requisitions with filtering
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/job-requisitions',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['draft', 'pending_approval', 'approved', 'posted', 'on_hold', 'closed'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      hiringManagerId: { type: 'string', format: 'uuid' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  talentAcquisitionController.getJobRequisitions
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/job-requisitions/:id
 * @desc    Get job requisition by ID
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/job-requisitions/:id',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeApplications: { type: 'boolean', default: false },
      includeAnalytics: { type: 'boolean', default: true }
    }
  }),
  talentAcquisitionController.getJobRequisition
);

/**
 * @route   PUT /api/v1/hr/talent-acquisition/job-requisitions/:id
 * @desc    Update job requisition
 * @access  HR Manager, Hiring Manager, Admin
 */
router.put(
  '/job-requisitions/:id',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      title: { type: 'string', minLength: 3, maxLength: 200 },
      description: { type: 'string', minLength: 50, maxLength: 5000 },
      compensation: { type: 'object' },
      requirements: { type: 'object' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      status: { type: 'string', enum: ['draft', 'pending_approval', 'approved', 'posted', 'on_hold', 'closed'] }
    }
  }),
  audit({ action: 'UPDATE_JOB_REQUISITION', resource: 'job_requisition' }),
  talentAcquisitionController.updateJobRequisition
);

/**
 * @route   POST /api/v1/hr/talent-acquisition/job-requisitions/:id/approve
 * @desc    Approve job requisition
 * @access  HR Manager, Admin
 */
router.post(
  '/job-requisitions/:id/approve',
  standardRateLimit,
  authorize(['hr:recruitment:approve', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      comments: { type: 'string', maxLength: 1000 },
      autoPost: { type: 'boolean', default: false }
    }
  }),
  audit({ action: 'APPROVE_JOB_REQUISITION', resource: 'job_requisition' }),
  talentAcquisitionController.approveJobRequisition
);

// ===== CANDIDATES =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/candidates
 * @desc    Add candidate
 * @access  HR Staff, Hiring Manager, Admin
 */
router.post(
  '/candidates',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    body: {
      firstName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      lastName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      email: { type: 'string', required: true, format: 'email' },
      phone: { type: 'string', required: true },
      resumeUrl: { type: 'string', format: 'uri' },
      linkedinUrl: { type: 'string', format: 'uri' },
      source: { 
        type: 'string', 
        enum: ['website', 'linkedin', 'referral', 'job_board', 'recruiter', 'career_fair', 'other'],
        default: 'website'
      },
      location: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string', default: 'US' }
        }
      },
      experience: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            company: { type: 'string', required: true },
            title: { type: 'string', required: true },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            current: { type: 'boolean', default: false }
          }
        }
      },
      skills: { type: 'array', items: { type: 'string' } },
      expectedSalary: { type: 'number', min: 0 },
      notes: { type: 'string', maxLength: 2000 }
    }
  }),
  audit({ action: 'ADD_CANDIDATE', resource: 'candidate' }),
  talentAcquisitionController.addCandidate
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/candidates
 * @desc    Get candidates with filtering and search
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/candidates',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      search: { type: 'string' },
      skills: { type: 'string' }, // comma-separated
      location: { type: 'string' },
      source: { type: 'string', enum: ['website', 'linkedin', 'referral', 'job_board', 'recruiter', 'career_fair', 'other'] },
      status: { type: 'string', enum: ['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'] },
      minSalary: { type: 'number', min: 0 },
      maxSalary: { type: 'number', min: 0 },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  talentAcquisitionController.getCandidates
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/candidates/:id
 * @desc    Get candidate by ID
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/candidates/:id',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeApplications: { type: 'boolean', default: true },
      includeScore: { type: 'boolean', default: true }
    }
  }),
  talentAcquisitionController.getCandidate
);

/**
 * @route   POST /api/v1/hr/talent-acquisition/candidates/:id/score
 * @desc    AI score candidate
 * @access  HR Staff, Hiring Manager, Admin
 */
router.post(
  '/candidates/:id/score',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      jobRequisitionId: { type: 'string', required: true, format: 'uuid' },
      forceRescore: { type: 'boolean', default: false }
    }
  }),
  audit({ action: 'SCORE_CANDIDATE', resource: 'candidate' }),
  talentAcquisitionController.scoreCandidate
);

// ===== APPLICATIONS =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/applications
 * @desc    Create job application
 * @access  HR Staff, Hiring Manager, Admin, Public (for external applications)
 */
router.post(
  '/applications',
  standardRateLimit,
  validateRequest({
    body: {
      candidateId: { type: 'string', required: true, format: 'uuid' },
      jobRequisitionId: { type: 'string', required: true, format: 'uuid' },
      coverLetter: { type: 'string', maxLength: 5000 },
      customResponses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string', required: true },
            answer: { type: 'string', required: true }
          }
        }
      },
      referredBy: { type: 'string', format: 'uuid' },
      source: { type: 'string', enum: ['direct', 'referral', 'job_board', 'social_media', 'other'] }
    }
  }),
  audit({ action: 'CREATE_APPLICATION', resource: 'job_application' }),
  talentAcquisitionController.createApplication
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/applications
 * @desc    Get job applications with filtering
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/applications',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      jobRequisitionId: { type: 'string', format: 'uuid' },
      candidateId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['submitted', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'] },
      stage: { type: 'string', enum: ['application', 'phone_screen', 'technical', 'onsite', 'final', 'offer', 'hired'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  talentAcquisitionController.getApplications
);

/**
 * @route   PUT /api/v1/hr/talent-acquisition/applications/:id/stage
 * @desc    Move application to next stage
 * @access  HR Staff, Hiring Manager, Admin
 */
router.put(
  '/applications/:id/stage',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      stage: { type: 'string', required: true, enum: ['application', 'phone_screen', 'technical', 'onsite', 'final', 'offer', 'hired', 'rejected'] },
      notes: { type: 'string', maxLength: 2000 },
      feedback: { type: 'string', maxLength: 2000 },
      reason: { type: 'string', maxLength: 500 } // for rejection
    }
  }),
  audit({ action: 'UPDATE_APPLICATION_STAGE', resource: 'job_application' }),
  talentAcquisitionController.updateApplicationStage
);

// ===== INTERVIEWS =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/interviews
 * @desc    Schedule interview
 * @access  HR Staff, Hiring Manager, Admin
 */
router.post(
  '/interviews',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    body: {
      applicationId: { type: 'string', required: true, format: 'uuid' },
      type: { type: 'string', required: true, enum: ['phone', 'video', 'onsite', 'technical', 'panel'] },
      scheduledDate: { type: 'string', required: true, format: 'date-time' },
      duration: { type: 'number', required: true, min: 15, max: 480 }, // minutes
      interviewers: {
        type: 'array',
        required: true,
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            employeeId: { type: 'string', required: true, format: 'uuid' },
            role: { type: 'string', enum: ['primary', 'secondary', 'observer'], default: 'primary' }
          }
        }
      },
      location: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['onsite', 'video', 'phone'], required: true },
          address: { type: 'string' },
          meetingLink: { type: 'string', format: 'uri' },
          dialIn: { type: 'string' }
        }
      },
      instructions: { type: 'string', maxLength: 2000 },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', required: true },
            category: { type: 'string', enum: ['technical', 'behavioral', 'cultural', 'other'] }
          }
        }
      }
    }
  }),
  audit({ action: 'SCHEDULE_INTERVIEW', resource: 'interview' }),
  talentAcquisitionController.scheduleInterview
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/interviews
 * @desc    Get interviews with filtering
 * @access  HR Staff, Hiring Manager, Interviewer, Admin
 */
router.get(
  '/interviews',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'interviewer', 'admin']),
  validateRequest({
    query: {
      applicationId: { type: 'string', format: 'uuid' },
      interviewerId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'] },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  talentAcquisitionController.getInterviews
);

/**
 * @route   POST /api/v1/hr/talent-acquisition/interviews/:id/feedback
 * @desc    Submit interview feedback
 * @access  HR Staff, Interviewer, Admin
 */
router.post(
  '/interviews/:id/feedback',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'interviewer', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      overallRating: { type: 'number', required: true, min: 1, max: 5 },
      technicalRating: { type: 'number', min: 1, max: 5 },
      communicationRating: { type: 'number', min: 1, max: 5 },
      culturalFitRating: { type: 'number', min: 1, max: 5 },
      feedback: { type: 'string', required: true, maxLength: 5000 },
      strengths: { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      recommendation: { type: 'string', required: true, enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'] },
      notes: { type: 'string', maxLength: 2000 }
    }
  }),
  audit({ action: 'SUBMIT_INTERVIEW_FEEDBACK', resource: 'interview_feedback' }),
  talentAcquisitionController.submitInterviewFeedback
);

// ===== OFFERS =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/offers
 * @desc    Create job offer
 * @access  HR Manager, Hiring Manager, Admin
 */
router.post(
  '/offers',
  strictRateLimit,
  authorize(['hr:recruitment:offer', 'hiring_manager', 'admin']),
  validateRequest({
    body: {
      applicationId: { type: 'string', required: true, format: 'uuid' },
      positionTitle: { type: 'string', required: true },
      compensation: {
        type: 'object',
        required: true,
        properties: {
          baseSalary: { type: 'number', required: true, min: 0 },
          bonus: { type: 'number', min: 0 },
          equity: { type: 'number', min: 0 },
          benefits: { type: 'array', items: { type: 'string' } }
        }
      },
      startDate: { type: 'string', required: true, format: 'date' },
      expirationDate: { type: 'string', required: true, format: 'date' },
      employmentType: { type: 'string', required: true, enum: ['full_time', 'part_time', 'contract'] },
      workLocation: { type: 'string', enum: ['onsite', 'remote', 'hybrid'] },
      terms: { type: 'string', maxLength: 5000 },
      documents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', required: true, enum: ['offer_letter', 'contract', 'nda', 'other'] },
            name: { type: 'string', required: true },
            url: { type: 'string', required: true, format: 'uri' }
          }
        }
      }
    }
  }),
  audit({ action: 'CREATE_JOB_OFFER', resource: 'job_offer' }),
  talentAcquisitionController.createJobOffer
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/offers
 * @desc    Get job offers
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/offers',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      applicationId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'] },
      hiringManagerId: { type: 'string', format: 'uuid' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  talentAcquisitionController.getJobOffers
);

/**
 * @route   PUT /api/v1/hr/talent-acquisition/offers/:id/status
 * @desc    Update offer status (accept/reject/withdraw)
 * @access  HR Manager, Candidate (for accept/reject), Admin
 */
router.put(
  '/offers/:id/status',
  standardRateLimit,
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      status: { type: 'string', required: true, enum: ['accepted', 'rejected', 'withdrawn'] },
      reason: { type: 'string', maxLength: 1000 },
      counterOffer: {
        type: 'object',
        properties: {
          baseSalary: { type: 'number', min: 0 },
          startDate: { type: 'string', format: 'date' },
          terms: { type: 'string', maxLength: 2000 }
        }
      }
    }
  }),
  audit({ action: 'UPDATE_OFFER_STATUS', resource: 'job_offer' }),
  talentAcquisitionController.updateOfferStatus
);

// ===== ANALYTICS & REPORTS =====

/**
 * @route   GET /api/v1/hr/talent-acquisition/analytics/pipeline
 * @desc    Get recruitment pipeline analytics
 * @access  HR Manager, Admin
 */
router.get(
  '/analytics/pipeline',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      jobRequisitionId: { type: 'string', format: 'uuid' }
    }
  }),
  talentAcquisitionController.getPipelineAnalytics
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/analytics/metrics
 * @desc    Get recruitment metrics
 * @access  HR Manager, Admin
 */
router.get(
  '/analytics/metrics',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      period: { type: 'string', enum: ['1m', '3m', '6m', '1y'], default: '3m' },
      includeComparisons: { type: 'boolean', default: true }
    }
  }),
  talentAcquisitionController.getRecruitmentMetrics
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/reports/:reportType
 * @desc    Generate recruitment reports
 * @access  HR Manager, Admin
 */
router.get(
  '/reports/:reportType',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'admin']),
  validateRequest({
    params: {
      reportType: { 
        type: 'string', 
        required: true,
        enum: ['pipeline_summary', 'time_to_hire', 'cost_per_hire', 'source_effectiveness', 'interviewer_performance'] 
      }
    },
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      format: { type: 'string', enum: ['json', 'csv', 'excel'], default: 'json' }
    }
  }),
  talentAcquisitionController.generateRecruitmentReport
);

// ===== AI FEATURES =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/ai/parse-resume
 * @desc    AI-powered resume parsing
 * @access  HR Staff, Hiring Manager, Admin
 */
router.post(
  '/ai/parse-resume',
  standardRateLimit,
  authorize(['hr:recruitment:write', 'hiring_manager', 'admin']),
  validateRequest({
    body: {
      resumeUrl: { type: 'string', required: true, format: 'uri' },
      candidateId: { type: 'string', format: 'uuid' }
    }
  }),
  audit({ action: 'PARSE_RESUME', resource: 'resume_parsing' }),
  talentAcquisitionController.parseResume
);

/**
 * @route   GET /api/v1/hr/talent-acquisition/ai/recommendations
 * @desc    Get AI-powered candidate recommendations
 * @access  HR Manager, Hiring Manager, Admin
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      jobRequisitionId: { type: 'string', required: true, format: 'uuid' },
      limit: { type: 'number', min: 1, max: 20, default: 10 },
      minScore: { type: 'number', min: 0, max: 100, default: 70 }
    }
  }),
  talentAcquisitionController.getCandidateRecommendations
);

// ===== REFERRALS =====

/**
 * @route   POST /api/v1/hr/talent-acquisition/referrals
 * @desc    Submit employee referral
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/referrals',
  standardRateLimit,
  authorize(['employee', 'hr:recruitment:write', 'manager', 'admin']),
  validateRequest({
    body: {
      jobRequisitionId: { type: 'string', required: true, format: 'uuid' },
      referredBy: { type: 'string', format: 'uuid' }, // defaults to current user
      candidateInfo: {
        type: 'object',
        required: true,
        properties: {
          firstName: { type: 'string', required: true },
          lastName: { type: 'string', required: true },
          email: { type: 'string', required: true, format: 'email' },
          phone: { type: 'string' },
          resumeUrl: { type: 'string', format: 'uri' }
        }
      },
      relationship: { type: 'string', required: true, maxLength: 200 },
      notes: { type: 'string', maxLength: 1000 }
    }
  }),
  audit({ action: 'SUBMIT_REFERRAL', resource: 'employee_referral' }),
  talentAcquisitionController.submitReferral
);

// ===== DASHBOARD =====

/**
 * @route   GET /api/v1/hr/talent-acquisition/dashboard
 * @desc    Get recruitment dashboard data
 * @access  HR Staff, Hiring Manager, Admin
 */
router.get(
  '/dashboard',
  standardRateLimit,
  authorize(['hr:recruitment:read', 'hiring_manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      period: { type: 'string', enum: ['1m', '3m', '6m', '1y'], default: '3m' },
      widgets: {
        type: 'string',
        transform: (val: string) => val.split(','),
        items: { 
          type: 'string', 
          enum: ['pipeline', 'metrics', 'interviews', 'offers', 'recent_activities'] 
        }
      }
    }
  }),
  talentAcquisitionController.getRecruitmentDashboard
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/talent-acquisition/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  talentAcquisitionController.healthCheck
);

export default router;
