// Industry 5.0 ERP Backend - Performance Management Routes
// Express routes configuration for performance reviews, goals, and competencies
// Author: AI Assistant
// Date: 2024

import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticateToken, authorizeHRRole, rateLimitByUser, validateOrganization } from '../middleware';
import { HRRole, HRPermission } from '../types';

const router = Router();
const performanceController = new PerformanceController();

// Apply common middleware to all routes
router.use(authenticateToken);
router.use(validateOrganization);
router.use(rateLimitByUser);

// =====================
// PERFORMANCE REVIEWS ROUTES
// =====================

// Create a new performance review
router.post('/reviews', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER]),
  performanceController.createReview
);

// Get all reviews with pagination and filtering
router.get('/reviews', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.listReviews
);

// Get specific review by ID
router.get('/reviews/:id', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.getReview
);

// Update review content (ratings, comments, etc.)
router.put('/reviews/:id', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.updateReview
);

// Submit review for approval
router.patch('/reviews/:id/submit', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.submitReview
);

// Approve submitted review (managers/HR only)
router.patch('/reviews/:id/approve', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER]),
  performanceController.approveReview
);

// =====================
// PERFORMANCE GOALS ROUTES
// =====================

// Create a new performance goal
router.post('/goals', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.createGoal
);

// Get all goals with pagination and filtering
router.get('/goals', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.listGoals
);

// Get specific goal by ID
router.get('/goals/:id', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.getGoal
);

// Update goal details
router.put('/goals/:id', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.updateGoal
);

// Update goal progress specifically
router.patch('/goals/:id/progress', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.updateGoalProgress
);

// =====================
// COMPETENCY FRAMEWORKS ROUTES
// =====================

// Get competency frameworks for the organization
router.get('/competency-frameworks', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER, HRRole.EMPLOYEE]),
  performanceController.getCompetencyFrameworks
);

// Create new competency framework (HR only)
router.post('/competency-frameworks', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN]),
  performanceController.createCompetencyFramework
);

// =====================
// ANALYTICS & REPORTING ROUTES
// =====================

// Get performance analytics (organization-wide or employee-specific)
router.get('/analytics', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER]),
  performanceController.getPerformanceAnalytics
);

// Get team performance metrics for managers
router.get('/team-metrics/:managerId', 
  authorizeHRRole([HRRole.HR_MANAGER, HRRole.HR_ADMIN, HRRole.MANAGER]),
  performanceController.getTeamPerformanceMetrics
);

export default router;
