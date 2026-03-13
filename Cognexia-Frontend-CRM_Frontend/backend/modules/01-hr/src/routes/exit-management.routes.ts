// Industry 5.0 ERP Backend - Exit Management Routes
// RESTful API endpoints for exit management operations
// Author: AI Assistant
// Date: 2024

import { Router } from 'express';
import { ExitManagementController } from '../controllers/exit-management.controller';
import { authenticateToken } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';

const router = Router();
const exitController = new ExitManagementController();

// Apply authentication to all exit management routes
router.use(authenticateToken);

/**
 * Exit Management Routes
 * Base path: /api/v1/hr/exit
 */

/**
 * @route   POST /api/v1/hr/exit/initiate
 * @desc    Initiate exit process for an employee
 * @access  HR Manager, HR Admin
 * @body    InitiateExitRequest
 */
router.post('/initiate',
  authorize(['hr_manager', 'hr_admin']),
  validateRequest('initiateExit'),
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  exitController.initiateExitProcess.bind(exitController)
);

/**
 * @route   POST /api/v1/hr/exit/interview
 * @desc    Conduct exit interview
 * @access  HR Manager, HR Admin, Interviewer
 * @body    ExitInterviewRequest
 */
router.post('/interview',
  authorize(['hr_manager', 'hr_admin', 'manager']),
  validateRequest('exitInterview'),
  rateLimit({ windowMs: 60000, max: 5 }), // 5 requests per minute
  exitController.conductExitInterview.bind(exitController)
);

/**
 * @route   POST /api/v1/hr/exit/knowledge-transfer
 * @desc    Create knowledge transfer plan
 * @access  HR Manager, HR Admin, Manager
 * @body    KnowledgeTransferRequest
 */
router.post('/knowledge-transfer',
  authorize(['hr_manager', 'hr_admin', 'manager']),
  validateRequest('knowledgeTransfer'),
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  exitController.createKnowledgeTransferPlan.bind(exitController)
);

/**
 * @route   PUT /api/v1/hr/exit/offboarding-status
 * @desc    Update offboarding checklist status
 * @access  HR Manager, HR Admin, Manager
 * @body    { checklistId, itemId, completed }
 */
router.put('/offboarding-status',
  authorize(['hr_manager', 'hr_admin', 'manager', 'employee']),
  validateRequest('offboardingStatus'),
  rateLimit({ windowMs: 60000, max: 20 }), // 20 requests per minute
  exitController.updateOffboardingStatus.bind(exitController)
);

/**
 * @route   GET /api/v1/hr/exit/analytics
 * @desc    Get exit analytics and insights
 * @access  HR Manager, HR Admin, Executive
 * @query   { period?: string }
 */
router.get('/analytics',
  authorize(['hr_manager', 'hr_admin', 'executive']),
  rateLimit({ windowMs: 60000, max: 30 }), // 30 requests per minute
  exitController.getExitAnalytics.bind(exitController)
);

/**
 * @route   GET /api/v1/hr/exit/turnover-report
 * @desc    Generate turnover report
 * @access  HR Manager, HR Admin, Executive
 * @query   TurnoverReportFilters
 */
router.get('/turnover-report',
  authorize(['hr_manager', 'hr_admin', 'executive']),
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  exitController.getTurnoverReport.bind(exitController)
);

/**
 * @route   GET /api/v1/hr/exit/:id
 * @desc    Get exit record by ID
 * @access  HR Manager, HR Admin, Manager
 * @param   id - Exit record UUID
 */
router.get('/:id',
  authorize(['hr_manager', 'hr_admin', 'manager']),
  rateLimit({ windowMs: 60000, max: 100 }), // 100 requests per minute
  exitController.getExitRecord.bind(exitController)
);

/**
 * @route   GET /api/v1/hr/exit
 * @desc    Get paginated list of exit records
 * @access  HR Manager, HR Admin
 * @query   { page?, limit?, status?, department? }
 */
router.get('/',
  authorize(['hr_manager', 'hr_admin']),
  rateLimit({ windowMs: 60000, max: 100 }), // 100 requests per minute
  exitController.getExitRecords.bind(exitController)
);

/**
 * Route-specific middleware for request logging
 */
router.use((req, res, next) => {
  console.log(`Exit Management Route: ${req.method} ${req.path} - User: ${req.user?.id} - Org: ${req.user?.organizationId}`);
  next();
});

export default router;
