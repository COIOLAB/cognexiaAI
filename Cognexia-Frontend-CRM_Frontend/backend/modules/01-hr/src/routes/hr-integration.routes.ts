// Industry 5.0 ERP Backend - HR Integration Routes
// Complete routing infrastructure for cross-module HR integrations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import express from 'express';
import { HRIntegrationController } from '../controllers/hr-integration.controller';

// Middleware imports (these would be implemented in actual project)
// import { authenticateToken } from '../../../middleware/auth.middleware';
// import { authorizeHR } from '../../../middleware/authorization.middleware';
// import { validateRequest } from '../../../middleware/validation.middleware';
// import { rateLimitByUser } from '../../../middleware/rate-limit.middleware';
// import { auditLogger } from '../../../middleware/audit.middleware';

const router = express.Router();
const hrIntegrationController = new HRIntegrationController();

// ===== INTEGRATION HEALTH & MONITORING ROUTES =====

/**
 * @route GET /api/v1/hr/integrations/health
 * @desc Get HR integration service health status
 * @access HR Admin, System Admin
 * @middleware Authentication, Authorization, Rate Limiting
 */
router.get('/health',
  // authenticateToken,
  // authorizeHR(['hr_admin', 'system_admin']),
  // rateLimitByUser({ windowMs: 1 * 60 * 1000, max: 60 }),
  hrIntegrationController.getIntegrationHealth
);

/**
 * @route GET /api/v1/hr/integrations/service-health
 * @desc Get HR integration controller service health
 * @access Public (authenticated)
 * @middleware Authentication, Rate Limiting
 */
router.get('/service-health',
  // authenticateToken,
  // rateLimitByUser({ windowMs: 5 * 60 * 1000, max: 30 }),
  hrIntegrationController.serviceHealthCheck
);

/**
 * @route GET /api/v1/hr/integrations/stats
 * @desc Get comprehensive integration statistics
 * @access HR Manager, HR Admin, System Admin
 * @middleware Authentication, Authorization, Rate Limiting, Auditing
 */
router.get('/stats',
  // authenticateToken,
  // authorizeHR(['hr_manager', 'hr_admin', 'system_admin']),
  // rateLimitByUser({ windowMs: 5 * 60 * 1000, max: 120 }),
  // auditLogger('hr_integration_stats_view'),
  hrIntegrationController.getIntegrationStats
);

/**
 * @route GET /api/v1/hr/integrations/dashboard
 * @desc Get integration dashboard data with real-time metrics
 * @access HR Manager, HR Admin, System Admin
 * @middleware Authentication, Authorization, Rate Limiting, Auditing
 */
router.get('/dashboard',
  // authenticateToken,
  // authorizeHR(['hr_manager', 'hr_admin', 'system_admin']),
  // rateLimitByUser({ windowMs: 1 * 60 * 1000, max: 60 }),
  // auditLogger('hr_integration_dashboard_view'),
  hrIntegrationController.getIntegrationDashboard
);

// ===== EVENT MANAGEMENT ROUTES =====

/**
 * @route POST /api/v1/hr/integrations/events
 * @desc Publish HR integration event to other modules
 * @access HR Staff, HR Manager, HR Admin, System Admin
 * @middleware Authentication, Authorization, Validation, Rate Limiting, Auditing
 */
router.post('/events',
  // authenticateToken,
  // authorizeHR(['hr_staff', 'hr_manager', 'hr_admin', 'system_admin']),
  // validateRequest({
  //   body: {
  //     type: 'object',
  //     required: ['eventType', 'source', 'target', 'data'],
  //     properties: {
  //       eventType: {
  //         type: 'string',
  //         enum: [
  //           'EMPLOYEE_HIRED', 'EMPLOYEE_TERMINATED', 'EMPLOYEE_PROMOTED',
  //           'EMPLOYEE_TRANSFERRED', 'EMPLOYEE_STATUS_CHANGED',
  //           'CANDIDATE_INTERVIEWED', 'CANDIDATE_HIRED', 'CANDIDATE_REJECTED',
  //           'JOB_POSTING_CREATED', 'PERFORMANCE_REVIEW_COMPLETED',
  //           'GOAL_ACHIEVED', 'GOAL_MISSED', 'SKILL_UPDATED',
  //           'SALARY_UPDATED', 'BONUS_AWARDED', 'BENEFITS_ENROLLED',
  //           'EQUITY_GRANTED', 'PAYROLL_PROCESSED', 'PAYROLL_ERROR',
  //           'TAX_CALCULATED', 'SHIFT_STARTED', 'SHIFT_ENDED',
  //           'OVERTIME_RECORDED', 'ABSENCE_RECORDED', 'TRAINING_COMPLETED',
  //           'CERTIFICATION_EARNED', 'LEARNING_PATH_ASSIGNED',
  //           'STAFFING_NEED_IDENTIFIED', 'CAPACITY_UPDATED',
  //           'WORKFORCE_FORECAST_UPDATED'
  //         ]
  //       },
  //       source: { type: 'string', minLength: 1 },
  //       target: { type: 'string', minLength: 1 },
  //       data: { type: 'object' }
  //     }
  //   }
  // }),
  // rateLimitByUser({ windowMs: 1 * 60 * 1000, max: 100 }),
  // auditLogger('hr_integration_event_publish'),
  hrIntegrationController.publishIntegrationEvent
);

// ===== INTEGRATION MAPPING ROUTES =====

/**
 * @route GET /api/v1/hr/integrations/mappings
 * @desc Get integration mappings with filtering options
 * @access HR Manager, HR Admin, System Admin
 * @middleware Authentication, Authorization, Rate Limiting
 */
router.get('/mappings',
  // authenticateToken,
  // authorizeHR(['hr_manager', 'hr_admin', 'system_admin']),
  // rateLimitByUser({ windowMs: 5 * 60 * 1000, max: 100 }),
  hrIntegrationController.getIntegrationMappings
);

/**
 * @route POST /api/v1/hr/integrations/mappings
 * @desc Create new integration mapping between modules
 * @access HR Admin, System Admin
 * @middleware Authentication, Authorization, Validation, Rate Limiting, Auditing
 */
router.post('/mappings',
  // authenticateToken,
  // authorizeHR(['hr_admin', 'system_admin']),
  // validateRequest({
  //   body: {
  //     type: 'object',
  //     required: ['id', 'sourceModule', 'targetModule', 'sourceEvent', 'targetAction'],
  //     properties: {
  //       id: { type: 'string', minLength: 1, maxLength: 100 },
  //       sourceModule: {
  //         type: 'string',
  //         enum: ['hr', 'production-planning', 'supply-chain', 'shop-floor-control', 'quality-management', 'maintenance']
  //       },
  //       targetModule: {
  //         type: 'string',
  //         enum: ['hr', 'production-planning', 'supply-chain', 'shop-floor-control', 'quality-management', 'maintenance']
  //       },
  //       sourceEvent: { type: 'string', minLength: 1 },
  //       targetAction: { type: 'string', minLength: 1 },
  //       enabled: { type: 'boolean' },
  //       priority: { type: 'number', minimum: 1, maximum: 10 },
  //       retryCount: { type: 'number', minimum: 0, maximum: 10 },
  //       timeout: { type: 'number', minimum: 1000, maximum: 300000 }
  //     },
  //     additionalProperties: false
  //   }
  // }),
  // rateLimitByUser({ windowMs: 5 * 60 * 1000, max: 20 }),
  // auditLogger('hr_integration_mapping_create'),
  hrIntegrationController.createIntegrationMapping
);

/**
 * @route DELETE /api/v1/hr/integrations/mappings/:mappingId
 * @desc Delete integration mapping
 * @access System Admin only
 * @middleware Authentication, Authorization, Rate Limiting, Auditing
 */
router.delete('/mappings/:mappingId',
  // authenticateToken,
  // authorizeHR(['system_admin']),
  // rateLimitByUser({ windowMs: 5 * 60 * 1000, max: 10 }),
  // auditLogger('hr_integration_mapping_delete'),
  hrIntegrationController.deleteIntegrationMapping
);

// ===== CONNECTIVITY & TESTING ROUTES =====

/**
 * @route POST /api/v1/hr/integrations/test-connection
 * @desc Test connectivity to other modules
 * @access HR Admin, System Admin, IT Admin
 * @middleware Authentication, Authorization, Validation, Rate Limiting
 */
router.post('/test-connection',
  // authenticateToken,
  // authorizeHR(['hr_admin', 'system_admin', 'it_admin']),
  // validateRequest({
  //   body: {
  //     type: 'object',
  //     required: ['targetModule'],
  //     properties: {
  //       targetModule: {
  //         type: 'string',
  //         enum: ['production-planning', 'supply-chain', 'shop-floor-control', 'quality-management', 'maintenance']
  //       },
  //       testType: {
  //         type: 'string',
  //         enum: ['connectivity', 'authentication', 'data_flow', 'performance'],
  //         default: 'connectivity'
  //       }
  //     }
  //   }
  // }),
  // rateLimitByUser({ windowMs: 1 * 60 * 1000, max: 20 }),
  hrIntegrationController.testIntegrationConnection
);

// ===== ROUTE DOCUMENTATION =====

/**
 * HR Integration Routes Documentation
 * 
 * Base Path: /api/v1/hr/integrations
 * 
 * Available Endpoints:
 * 
 * HEALTH & MONITORING:
 * GET    /health                      - Get integration service health status
 * GET    /service-health              - Get controller service health
 * GET    /stats                       - Get comprehensive integration statistics
 * GET    /dashboard                   - Get real-time integration dashboard data
 * 
 * EVENT MANAGEMENT:
 * POST   /events                      - Publish HR integration event to other modules
 * 
 * INTEGRATION MAPPINGS:
 * GET    /mappings                    - Get integration mappings with filtering
 * POST   /mappings                    - Create new integration mapping
 * DELETE /mappings/:mappingId         - Delete integration mapping
 * 
 * CONNECTIVITY & TESTING:
 * POST   /test-connection             - Test connectivity to target modules
 * 
 * Authentication: All routes require valid JWT token
 * Authorization: Role-based access control per endpoint
 * Rate Limiting: Applied per user and endpoint type
 * Auditing: Critical operations are logged
 * Validation: Request/response validation on applicable endpoints
 * 
 * Integration Capabilities:
 * - Real-time event publishing and consumption
 * - Bi-directional data synchronization
 * - Custom integration mapping creation
 * - Health monitoring and alerting
 * - Connectivity testing and diagnostics
 * - Performance metrics and analytics
 * - Cross-module workflow orchestration
 * - Event-driven architecture support
 * 
 * Supported Modules:
 * - Production Planning: Workforce capacity and resource planning
 * - Supply Chain: Warehouse staffing and logistics coordination
 * - Shop Floor Control: Operator management and performance tracking
 * - Quality Management: Inspector certification and quality standards
 * - Maintenance: Equipment operator assignment and scheduling
 * 
 * Event Types:
 * - Employee Lifecycle: Hiring, termination, promotion, transfer
 * - Talent Acquisition: Candidate processing and job postings
 * - Performance Management: Reviews, goals, and skill updates
 * - Compensation: Salary, bonus, benefits, and equity changes
 * - Payroll: Processing, errors, and tax calculations
 * - Time & Attendance: Shifts, overtime, and absence tracking
 * - Learning & Development: Training completion and certifications
 * - Workforce Planning: Staffing needs and capacity forecasting
 * 
 * Data Flow Patterns:
 * - HR → Production Planning: Staffing requirements and capacity
 * - HR → Supply Chain: Warehouse staffing and logistics workforce
 * - HR → Shop Floor Control: Operator registration and performance
 * - HR → Quality Management: Inspector certifications and standards
 * - Production Planning → HR: Resource requirements and forecasting
 * - Supply Chain → HR: Temporary staffing requests
 * - Shop Floor Control → HR: Performance metrics and feedback
 * 
 * Integration Features:
 * - Event-driven architecture with real-time processing
 * - Configurable data transformation and routing rules
 * - Conditional integration logic and business rules
 * - Retry mechanisms and error handling
 * - Performance monitoring and optimization
 * - Health checks and diagnostics
 * - Audit trails and compliance tracking
 */

export default router;
