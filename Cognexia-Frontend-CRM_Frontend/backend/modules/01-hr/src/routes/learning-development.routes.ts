// Industry 5.0 ERP Backend - Learning & Development Routes
// Comprehensive routing for training courses, skill development, and AI-powered learning
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { LearningDevelopmentController } from '../controllers/learning-development.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const learningDevelopmentController = new LearningDevelopmentController();

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

// ===== TRAINING COURSES =====

/**
 * @route   POST /api/v1/hr/learning/courses
 * @desc    Create training course
 * @access  HR Manager, L&D Manager, Admin
 */
router.post(
  '/courses',
  standardRateLimit,
  authorize(['hr:learning:write', 'ld_manager', 'admin']),
  validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', required: true, minLength: 50, maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      category: { 
        type: 'string', 
        required: true, 
        enum: ['technical', 'leadership', 'compliance', 'soft_skills', 'onboarding', 'certification', 'other'] 
      },
      skillAreas: { type: 'array', required: true, items: { type: 'string' } },
      level: { type: 'string', required: true, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      format: { 
        type: 'string', 
        required: true, 
        enum: ['online', 'in_person', 'hybrid', 'self_paced', 'instructor_led'] 
      },
      duration: { type: 'number', required: true, min: 1 }, // hours
      prerequisites: { type: 'array', items: { type: 'string' } },
      learningObjectives: { type: 'array', required: true, items: { type: 'string' } },
      content: {
        type: 'object',
        properties: {
          modules: { 
            type: 'array', 
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', required: true },
                description: { type: 'string' },
                duration: { type: 'number', min: 0.5 },
                resources: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          materials: { type: 'array', items: { type: 'string' } },
          assessments: { type: 'array', items: { type: 'object' } }
        }
      },
      maxEnrollments: { type: 'number', min: 1 },
      cost: { type: 'number', min: 0, default: 0 },
      instructorId: { type: 'string', format: 'uuid' },
      tags: { type: 'array', items: { type: 'string' } }
    }
  }),
  audit({ action: 'CREATE_COURSE', resource: 'training_course' }),
  learningDevelopmentController.createCourse
);

/**
 * @route   GET /api/v1/hr/learning/courses
 * @desc    Get training courses with filtering
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/courses',
  standardRateLimit,
  authorize(['employee', 'hr:learning:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      category: { type: 'string', enum: ['technical', 'leadership', 'compliance', 'soft_skills', 'onboarding', 'certification', 'other'] },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      format: { type: 'string', enum: ['online', 'in_person', 'hybrid', 'self_paced', 'instructor_led'] },
      skillArea: { type: 'string' },
      search: { type: 'string' },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  learningDevelopmentController.getCourses
);

/**
 * @route   GET /api/v1/hr/learning/courses/:id
 * @desc    Get course details
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/courses/:id',
  standardRateLimit,
  authorize(['employee', 'hr:learning:read', 'manager', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      includeEnrollments: { type: 'boolean', default: false },
      includeAnalytics: { type: 'boolean', default: true }
    }
  }),
  learningDevelopmentController.getCourse
);

// ===== ENROLLMENTS =====

/**
 * @route   POST /api/v1/hr/learning/enrollments
 * @desc    Enroll in course
 * @access  Employee, HR Staff, Manager, Admin
 */
router.post(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:learning:write', 'manager', 'admin']),
  validateRequest({
    body: {
      courseId: { type: 'string', required: true, format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' }, // defaults to current user
      enrollmentType: { type: 'string', enum: ['self', 'manager_assigned', 'mandatory', 'recommended'], default: 'self' },
      targetCompletionDate: { type: 'string', format: 'date' },
      goals: { type: 'array', items: { type: 'string' } },
      managerApprovalNeeded: { type: 'boolean', default: false }
    }
  }),
  audit({ action: 'ENROLL_COURSE', resource: 'course_enrollment' }),
  learningDevelopmentController.enrollInCourse
);

/**
 * @route   GET /api/v1/hr/learning/enrollments
 * @desc    Get course enrollments
 * @access  Employee (own), HR Staff, Manager, Admin
 */
router.get(
  '/enrollments',
  standardRateLimit,
  authorize(['employee', 'hr:learning:read', 'manager', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      courseId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['enrolled', 'in_progress', 'completed', 'withdrawn', 'failed'] },
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  learningDevelopmentController.getEnrollments
);

/**
 * @route   PUT /api/v1/hr/learning/enrollments/:id/progress
 * @desc    Update learning progress
 * @access  Employee (own), Instructor, Admin
 */
router.put(
  '/enrollments/:id/progress',
  standardRateLimit,
  authorize(['employee', 'instructor', 'admin']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    body: {
      completedModules: { type: 'array', items: { type: 'string' } },
      progressPercentage: { type: 'number', min: 0, max: 100 },
      timeSpent: { type: 'number', min: 0 }, // minutes
      assessmentScores: { 
        type: 'array',
        items: {
          type: 'object',
          properties: {
            assessmentId: { type: 'string', required: true },
            score: { type: 'number', required: true, min: 0, max: 100 },
            attempts: { type: 'number', min: 1 }
          }
        }
      },
      notes: { type: 'string', maxLength: 1000 }
    }
  }),
  audit({ action: 'UPDATE_LEARNING_PROGRESS', resource: 'learning_progress' }),
  learningDevelopmentController.updateLearningProgress
);

// ===== LEARNING PATHS =====

/**
 * @route   POST /api/v1/hr/learning/learning-paths
 * @desc    Create learning path
 * @access  HR Manager, L&D Manager, Admin
 */
router.post(
  '/learning-paths',
  standardRateLimit,
  authorize(['hr:learning:write', 'ld_manager', 'admin']),
  validateRequest({
    body: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', required: true, maxLength: 2000 },
      organizationId: { type: 'string', required: true, format: 'uuid' },
      targetRole: { type: 'string' },
      skillAreas: { type: 'array', required: true, items: { type: 'string' } },
      level: { type: 'string', required: true, enum: ['beginner', 'intermediate', 'advanced'] },
      courses: {
        type: 'array',
        required: true,
        minItems: 2,
        items: {
          type: 'object',
          properties: {
            courseId: { type: 'string', required: true, format: 'uuid' },
            order: { type: 'number', required: true, min: 1 },
            mandatory: { type: 'boolean', default: true },
            prerequisites: { type: 'array', items: { type: 'string', format: 'uuid' } }
          }
        }
      },
      estimatedDuration: { type: 'number', min: 1 }, // hours
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], default: 'medium' }
    }
  }),
  audit({ action: 'CREATE_LEARNING_PATH', resource: 'learning_path' }),
  learningDevelopmentController.createLearningPath
);

/**
 * @route   GET /api/v1/hr/learning/learning-paths
 * @desc    Get learning paths
 * @access  Employee, HR Staff, Manager, Admin
 */
router.get(
  '/learning-paths',
  standardRateLimit,
  authorize(['employee', 'hr:learning:read', 'manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      targetRole: { type: 'string' },
      skillArea: { type: 'string' },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      limit: { type: 'number', min: 1, max: 50, default: 20 },
      offset: { type: 'number', min: 0, default: 0 }
    }
  }),
  learningDevelopmentController.getLearningPaths
);

// ===== SKILLS & CERTIFICATIONS =====

/**
 * @route   GET /api/v1/hr/learning/skills/gap-analysis
 * @desc    Get skill gap analysis
 * @access  Employee (own), Manager (direct reports), HR Staff, Admin
 */
router.get(
  '/skills/gap-analysis',
  standardRateLimit,
  authorize(['employee', 'manager', 'hr:learning:read', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      targetRole: { type: 'string' },
      skillCategories: { type: 'string' } // comma-separated
    }
  }),
  learningDevelopmentController.getSkillGapAnalysis
);

/**
 * @route   GET /api/v1/hr/learning/skills/matrix
 * @desc    Get employee skill matrix
 * @access  Manager, HR Staff, Admin
 */
router.get(
  '/skills/matrix',
  standardRateLimit,
  authorize(['manager', 'hr:learning:read', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      skillCategories: { type: 'string' }, // comma-separated
      includeGaps: { type: 'boolean', default: true }
    }
  }),
  learningDevelopmentController.getEmployeeSkillMatrix
);

/**
 * @route   POST /api/v1/hr/learning/certifications
 * @desc    Award certification
 * @access  Instructor, HR Manager, Admin
 */
router.post(
  '/certifications',
  standardRateLimit,
  authorize(['instructor', 'hr:learning:write', 'admin']),
  validateRequest({
    body: {
      employeeId: { type: 'string', required: true, format: 'uuid' },
      courseId: { type: 'string', format: 'uuid' },
      certificationType: { type: 'string', required: true, enum: ['completion', 'proficiency', 'mastery', 'external'] },
      certificationName: { type: 'string', required: true },
      issuedDate: { type: 'string', format: 'date', default: new Date().toISOString() },
      expirationDate: { type: 'string', format: 'date' },
      score: { type: 'number', min: 0, max: 100 },
      credentials: { type: 'string' },
      verificationUrl: { type: 'string', format: 'uri' }
    }
  }),
  audit({ action: 'AWARD_CERTIFICATION', resource: 'certification' }),
  learningDevelopmentController.awardCertification
);

// ===== AI-POWERED FEATURES =====

/**
 * @route   GET /api/v1/hr/learning/ai/recommendations
 * @desc    Get personalized learning recommendations
 * @access  Employee (own), Manager (direct reports), HR Staff, Admin
 */
router.get(
  '/ai/recommendations',
  standardRateLimit,
  authorize(['employee', 'manager', 'hr:learning:read', 'admin']),
  validateRequest({
    query: {
      employeeId: { type: 'string', format: 'uuid' },
      recommendationType: { 
        type: 'string', 
        enum: ['skill_based', 'role_based', 'career_path', 'trending', 'comprehensive'], 
        default: 'comprehensive' 
      },
      skillFocus: { type: 'string' },
      limit: { type: 'number', min: 1, max: 20, default: 10 }
    }
  }),
  learningDevelopmentController.getPersonalizedLearningRecommendations
);

/**
 * @route   GET /api/v1/hr/learning/ai/content-recommendations
 * @desc    Get AI content recommendations for courses
 * @access  L&D Manager, Instructor, Admin
 */
router.get(
  '/ai/content-recommendations',
  standardRateLimit,
  authorize(['ld_manager', 'instructor', 'admin']),
  validateRequest({
    query: {
      courseId: { type: 'string', format: 'uuid' },
      skillArea: { type: 'string' },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      contentType: { type: 'string', enum: ['articles', 'videos', 'exercises', 'assessments', 'all'], default: 'all' },
      limit: { type: 'number', min: 1, max: 20, default: 10 }
    }
  }),
  learningDevelopmentController.getAIContentRecommendations
);

/**
 * @route   GET /api/v1/hr/learning/ai/predictive-analytics
 * @desc    Get predictive learning analytics
 * @access  HR Manager, L&D Manager, Admin
 */
router.get(
  '/ai/predictive-analytics',
  standardRateLimit,
  authorize(['hr:learning:read', 'ld_manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      analysisType: { 
        type: 'string', 
        enum: ['completion_prediction', 'skill_development', 'career_progression', 'roi_forecast'], 
        default: 'comprehensive' 
      },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m'], default: '6m' },
      departmentId: { type: 'string', format: 'uuid' }
    }
  }),
  learningDevelopmentController.getPredictiveLearningAnalytics
);

// ===== ANALYTICS & REPORTS =====

/**
 * @route   GET /api/v1/hr/learning/analytics/progress
 * @desc    Get learning progress analytics
 * @access  Manager, HR Staff, L&D Manager, Admin
 */
router.get(
  '/analytics/progress',
  standardRateLimit,
  authorize(['manager', 'hr:learning:read', 'ld_manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      courseId: { type: 'string', format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' }
    }
  }),
  learningDevelopmentController.getLearningProgressAnalytics
);

/**
 * @route   GET /api/v1/hr/learning/analytics/roi
 * @desc    Get learning ROI analysis
 * @access  HR Manager, L&D Manager, Admin
 */
router.get(
  '/analytics/roi',
  standardRateLimit,
  authorize(['hr:learning:read', 'ld_manager', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      courseId: { type: 'string', format: 'uuid' },
      departmentId: { type: 'string', format: 'uuid' },
      period: { type: 'string', enum: ['3m', '6m', '12m'], default: '6m' },
      includeProjections: { type: 'boolean', default: true }
    }
  }),
  learningDevelopmentController.getLearningROIAnalysis
);

/**
 * @route   GET /api/v1/hr/learning/reports/:reportType
 * @desc    Generate learning reports
 * @access  HR Staff, L&D Manager, Admin
 */
router.get(
  '/reports/:reportType',
  standardRateLimit,
  authorize(['hr:learning:read', 'ld_manager', 'admin']),
  validateRequest({
    params: {
      reportType: { 
        type: 'string', 
        required: true,
        enum: ['completion_summary', 'skill_development', 'certification_report', 'roi_analysis', 'engagement_metrics'] 
      }
    },
    query: {
      organizationId: { type: 'string', required: true, format: 'uuid' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      format: { type: 'string', enum: ['json', 'csv', 'excel'], default: 'json' }
    }
  }),
  learningDevelopmentController.generateLearningReport
);

// ===== HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/learning/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get(
  '/health',
  learningDevelopmentController.healthCheck
);

export default router;
