// Industry 5.0 ERP Backend - Revolutionary Compensation Routes
// Quantum-enhanced routing with AI-driven compensation endpoints
// World's most advanced compensation routing surpassing all enterprise solutions
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import express from 'express';
import { RevolutionaryCompensationController } from '../controllers/revolutionary-compensation.controller';
import { authMiddleware, requireRole } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimiter } from '../../../middleware/rate-limiter.middleware';
import { cacheMiddleware } from '../../../middleware/cache.middleware';
import { auditLogger } from '../../../middleware/audit-logger.middleware';
import { securityHeaders } from '../../../middleware/security.middleware';
import { requestLogger } from '../../../middleware/request-logger.middleware';
import { UserRole } from '../../../types/auth.types';
import {
  createCompensationPlanSchema,
  updateCompensationPlanSchema,
  createSalaryStructureSchema,
  createBenefitsPlanSchema,
  createBenefitsEnrollmentSchema,
  payEquityAnalysisSchema,
  paginationSchema
} from '../schemas/compensation.schema';

const router = express.Router();
const compensationController = new RevolutionaryCompensationController();

// Apply global middleware
router.use(securityHeaders);
router.use(requestLogger);
router.use(authMiddleware);

// =====================
// QUANTUM COMPENSATION PLANS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/plans:
 *   post:
 *     summary: Create Revolutionary Compensation Plan
 *     description: Creates a new compensation plan with AI optimization, blockchain verification, and quantum analytics
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompensationPlanRequest'
 *           examples:
 *             executiveCompensation:
 *               summary: Executive Compensation Plan
 *               value:
 *                 name: "C-Suite Executive Compensation 2024"
 *                 type: "executive"
 *                 baseSalary: 250000
 *                 bonusStructure:
 *                   performanceBased: true
 *                   percentOfBase: 50
 *                   maxBonus: 500000
 *                 equityStructure:
 *                   stockOptions: true
 *                   vestingPeriod: 48
 *                   grantFrequency: "annual"
 *                 benefits:
 *                   healthInsurance: true
 *                   retirementContribution: 15
 *                   executivePerks: true
 *                 effectiveDate: "2024-01-01T00:00:00Z"
 *                 description: "Comprehensive executive compensation package with performance incentives and equity participation"
 *             engineerCompensation:
 *               summary: Software Engineer Compensation Plan
 *               value:
 *                 name: "Software Engineer Compensation 2024"
 *                 type: "technical"
 *                 baseSalary: 95000
 *                 bonusStructure:
 *                   performanceBased: true
 *                   percentOfBase: 15
 *                 skillIncentives:
 *                   certificationBonus: 5000
 *                   specializedSkills: ["AI/ML", "Cloud Architecture", "DevOps"]
 *                 benefits:
 *                   healthInsurance: true
 *                   retirementContribution: 6
 *                   learningDevelopment: 3000
 *                 effectiveDate: "2024-01-01T00:00:00Z"
 *                 description: "Technical role compensation with skill-based incentives"
 *     responses:
 *       201:
 *         description: Revolutionary compensation plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "C-Suite Executive Compensation 2024"
 *                     aiOptimizations:
 *                       type: object
 *                       properties:
 *                         enhancementCount:
 *                           type: number
 *                           example: 5
 *                         optimizationScore:
 *                           type: number
 *                           example: 0.95
 *                     blockchainVerification:
 *                       type: object
 *                       properties:
 *                         verified:
 *                           type: boolean
 *                           example: true
 *                         hash:
 *                           type: string
 *                           example: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
 *                 message:
 *                   type: string
 *                   example: "Revolutionary compensation plan created successfully"
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     optimizationScore:
 *                       type: number
 *                       example: 0.95
 *                     blockchainVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Validation error or business rule violation
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Compensation plan already exists
 */
router.post(
  '/plans',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  validateRequest(createCompensationPlanSchema),
  auditLogger('CREATE_COMPENSATION_PLAN'),
  compensationController.createCompensationPlan.bind(compensationController)
);

/**
 * @swagger
 * /hr/revolutionary-compensation/plans/{id}:
 *   get:
 *     summary: Get Compensation Plan with Quantum Insights
 *     description: Retrieves a compensation plan with advanced quantum analytics and AI insights
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Compensation plan UUID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Compensation plan retrieved with quantum insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     quantumInsights:
 *                       type: object
 *                       properties:
 *                         optimizationScore:
 *                           type: number
 *                           example: 0.89
 *                         patternRecognition:
 *                           type: object
 *                           properties:
 *                             efficacyPrediction:
 *                               type: number
 *                               example: 0.92
 *                             retentionImpact:
 *                               type: string
 *                               example: "positive"
 *       404:
 *         description: Compensation plan not found
 */
router.get(
  '/plans/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.HR_MANAGER, UserRole.EMPLOYEE]),
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  compensationController.getCompensationPlan.bind(compensationController)
);

/**
 * @swagger
 * /hr/revolutionary-compensation/plans/{id}:
 *   put:
 *     summary: Update Compensation Plan with AI Change Impact Analysis
 *     description: Updates a compensation plan with AI-powered change impact analysis and optimization
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Compensation plan UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompensationPlanRequest'
 *     responses:
 *       200:
 *         description: Compensation plan updated successfully with optimization
 *       404:
 *         description: Compensation plan not found
 */
router.put(
  '/plans/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  validateRequest(updateCompensationPlanSchema),
  auditLogger('UPDATE_COMPENSATION_PLAN'),
  compensationController.updateCompensationPlan.bind(compensationController)
);

/**
 * @swagger
 * /hr/revolutionary-compensation/plans:
 *   get:
 *     summary: List Compensation Plans with AI Enhancement
 *     description: Retrieves paginated list of compensation plans with AI-enhanced filtering and insights
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for plan name or description
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [executive, management, technical, sales, operational, entry_level]
 *         description: Compensation type filter
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Active status filter
 *     responses:
 *       200:
 *         description: Compensation plans retrieved successfully with AI enhancement
 */
router.get(
  '/plans',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.HR_MANAGER, UserRole.EMPLOYEE]),
  validateRequest(paginationSchema, 'query'),
  cacheMiddleware({ ttl: 180 }), // Cache for 3 minutes
  compensationController.listCompensationPlans.bind(compensationController)
);

// =====================
// REVOLUTIONARY PAY EQUITY ANALYSIS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/analytics/pay-equity:
 *   post:
 *     summary: Revolutionary Pay Equity Analysis with AI
 *     description: Performs comprehensive pay equity analysis with AI insights, predictive risk assessment, and quantum metrics
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisType:
 *                 type: string
 *                 enum: [gender, ethnicity, department, position, comprehensive]
 *                 description: Type of pay equity analysis to perform
 *                 example: "comprehensive"
 *           examples:
 *             genderAnalysis:
 *               summary: Gender Pay Equity Analysis
 *               value:
 *                 analysisType: "gender"
 *             comprehensiveAnalysis:
 *               summary: Comprehensive Pay Equity Analysis
 *               value:
 *                 analysisType: "comprehensive"
 *     responses:
 *       200:
 *         description: Revolutionary pay equity analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     aiInsights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "pay_equity_gender"
 *                           summary:
 *                             type: string
 *                             example: "Gender pay gap detected in engineering department"
 *                           confidenceScore:
 *                             type: number
 *                             example: 0.93
 *                     revolutionaryRecommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "rec-001"
 *                           title:
 *                             type: string
 *                             example: "Engineering gender pay adjustment"
 *                           priority:
 *                             type: number
 *                             example: 8
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     analysisDepth:
 *                       type: string
 *                       example: "quantum-revolutionary"
 *                     equityScore:
 *                       type: number
 *                       example: 0.82
 */
router.post(
  '/analytics/pay-equity',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  validateRequest(payEquityAnalysisSchema),
  auditLogger('PAY_EQUITY_ANALYSIS'),
  compensationController.analyzePayEquity.bind(compensationController)
);

// =====================
// QUANTUM SALARY STRUCTURES ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/salary-structures:
 *   post:
 *     summary: Create Quantum-Optimized Salary Structure
 *     description: Creates a salary structure with quantum optimization and market competitiveness analysis
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalaryStructureRequest'
 *           examples:
 *             seniorEngineer:
 *               summary: Senior Software Engineer Salary Structure
 *               value:
 *                 gradeLevel: 8
 *                 title: "Senior Software Engineer"
 *                 minSalary: 110000
 *                 maxSalary: 160000
 *                 midSalary: 135000
 *                 currency: "USD"
 *                 effectiveDate: "2024-01-01T00:00:00Z"
 *                 location: "San Francisco, CA"
 *                 department: "Engineering"
 *                 skillRequirements: ["JavaScript", "Python", "Cloud Architecture"]
 *                 experienceRange: "5-8 years"
 *             executiveLevel:
 *               summary: Executive Level Salary Structure
 *               value:
 *                 gradeLevel: 15
 *                 title: "Vice President"
 *                 minSalary: 200000
 *                 maxSalary: 350000
 *                 midSalary: 275000
 *                 currency: "USD"
 *                 effectiveDate: "2024-01-01T00:00:00Z"
 *                 location: "Corporate HQ"
 *                 department: "Executive"
 *                 skillRequirements: ["Strategic Planning", "P&L Management", "Leadership"]
 *                 experienceRange: "15+ years"
 *     responses:
 *       201:
 *         description: Quantum-optimized salary structure created successfully
 */
router.post(
  '/salary-structures',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  validateRequest(createSalaryStructureSchema),
  auditLogger('CREATE_SALARY_STRUCTURE'),
  compensationController.createSalaryStructure.bind(compensationController)
);

/**
 * @swagger
 * /hr/revolutionary-compensation/salary-structures/{id}:
 *   get:
 *     summary: Get Salary Structure
 *     description: Retrieves a salary structure by ID
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary structure UUID
 *     responses:
 *       200:
 *         description: Salary structure retrieved successfully
 *       404:
 *         description: Salary structure not found
 */
router.get(
  '/salary-structures/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.HR_MANAGER, UserRole.EMPLOYEE]),
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  compensationController.getSalaryStructure.bind(compensationController)
);

// =====================
// BLOCKCHAIN-VERIFIED BENEFITS PLANS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/benefits-plans:
 *   post:
 *     summary: Create Blockchain-Verified Benefits Plan
 *     description: Creates a benefits plan with blockchain verification and AI effectiveness analysis
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBenefitsPlanRequest'
 *     responses:
 *       201:
 *         description: Blockchain-verified benefits plan created successfully
 */
router.post(
  '/benefits-plans',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.BENEFITS_MANAGER, UserRole.SYSTEM_ADMIN]),
  validateRequest(createBenefitsPlanSchema),
  auditLogger('CREATE_BENEFITS_PLAN'),
  compensationController.createBenefitsPlan.bind(compensationController)
);

// =====================
// AI-POWERED BENEFITS ENROLLMENT ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/benefits-enrollments:
 *   post:
 *     summary: Create AI-Optimized Benefits Enrollment
 *     description: Creates a benefits enrollment with AI eligibility determination and personalized recommendations
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBenefitsEnrollmentRequest'
 *     responses:
 *       201:
 *         description: AI-optimized benefits enrollment created successfully
 */
router.post(
  '/benefits-enrollments',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.BENEFITS_MANAGER, UserRole.EMPLOYEE]),
  validateRequest(createBenefitsEnrollmentSchema),
  auditLogger('CREATE_BENEFITS_ENROLLMENT'),
  compensationController.createBenefitsEnrollment.bind(compensationController)
);

// =====================
// REVOLUTIONARY ANALYTICS & INSIGHTS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/analytics/comprehensive:
 *   get:
 *     summary: Revolutionary Comprehensive Compensation Analytics
 *     description: Generates comprehensive compensation analytics with AI insights, predictive models, and pay equity metrics
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department filter
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Position filter
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date filter (ISO format)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date filter (ISO format)
 *     responses:
 *       200:
 *         description: Revolutionary compensation analytics generated successfully
 */
router.get(
  '/analytics/comprehensive',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  cacheMiddleware({ ttl: 600 }), // Cache for 10 minutes
  auditLogger('COMPREHENSIVE_ANALYTICS'),
  compensationController.getComprehensiveAnalytics.bind(compensationController)
);

// =====================
// ADVANCED INSIGHTS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/insights/turnover-prediction:
 *   get:
 *     summary: AI-Powered Turnover Prediction
 *     description: Generates AI-powered turnover predictions based on compensation data and patterns
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department filter
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Risk level filter
 *     responses:
 *       200:
 *         description: AI turnover predictions generated successfully
 */
router.get(
  '/insights/turnover-prediction',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  cacheMiddleware({ ttl: 900 }), // Cache for 15 minutes
  auditLogger('TURNOVER_PREDICTION_ANALYSIS'),
  compensationController.getTurnoverPrediction.bind(compensationController)
);

/**
 * @swagger
 * /hr/revolutionary-compensation/insights/cost-optimization:
 *   get:
 *     summary: AI Cost Optimization Insights
 *     description: Provides AI-powered cost optimization insights and recommendations for compensation and benefits
 *     tags: [Revolutionary Compensation & Benefits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cost optimization insights generated successfully
 */
router.get(
  '/insights/cost-optimization',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.HR_ADMIN, UserRole.COMPENSATION_MANAGER, UserRole.SYSTEM_ADMIN]),
  cacheMiddleware({ ttl: 1800 }), // Cache for 30 minutes
  auditLogger('COST_OPTIMIZATION_ANALYSIS'),
  compensationController.getCostOptimizationInsights.bind(compensationController)
);

// =====================
// SYSTEM HEALTH & STATUS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-compensation/health:
 *   get:
 *     summary: Revolutionary Compensation Service Health Check
 *     description: Checks the health status of the revolutionary compensation service and all its AI/quantum capabilities
 *     tags: [Revolutionary Compensation & Benefits]
 *     responses:
 *       200:
 *         description: Service health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                       example: "CompensationService"
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     features:
 *                       type: object
 *                       properties:
 *                         quantumAnalytics:
 *                           type: string
 *                           example: "operational"
 *                         aiInsights:
 *                           type: string
 *                           example: "operational"
 *                         blockchainVerification:
 *                           type: string
 *                           example: "operational"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get(
  '/health',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  compensationController.healthCheck.bind(compensationController)
);

export default router;
