// Industry 5.0 ERP Backend - Revolutionary Reports & Analytics Routes
// Comprehensive board-level reporting routes with AI-powered insights and multi-format exports
// World's most advanced HR reporting routes surpassing all enterprise solutions
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import express from 'express';
import { RevolutionaryReportsAnalyticsController } from '../controllers/revolutionary-reports-analytics.controller';
import { authMiddleware, requireRole } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimiter } from '../../../middleware/rate-limiter.middleware';
import { cacheMiddleware } from '../../../middleware/cache.middleware';
import { auditLogger } from '../../../middleware/audit-logger.middleware';
import { securityHeaders } from '../../../middleware/security.middleware';
import { requestLogger } from '../../../middleware/request-logger.middleware';
import { UserRole } from '../../../types/auth.types';
import {
  boardPresentationRequestSchema,
  reportConfigurationSchema,
  exportFormatSchema
} from '../schemas/reports.schema';

const router = express.Router();
const reportsController = new RevolutionaryReportsAnalyticsController();

// Apply global middleware
router.use(securityHeaders);
router.use(requestLogger);
router.use(authMiddleware);

// =====================
// EXECUTIVE DASHBOARD ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-reports/executive-dashboard:
 *   get:
 *     summary: Generate Revolutionary Executive Dashboard
 *     description: Creates comprehensive C-level dashboard with AI insights, quantum analytics, and predictive forecasting
 *     tags: [Revolutionary HR Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *           default: quarterly
 *         description: Analysis timeframe for the dashboard
 *     responses:
 *       200:
 *         description: Revolutionary executive dashboard generated successfully
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
 *                     keyMetrics:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: number
 *                           example: 2847
 *                           description: Current total employee count
 *                         employeeGrowthRate:
 *                           type: number
 *                           example: 12.5
 *                           description: Year-over-year employee growth percentage
 *                         retentionRate:
 *                           type: number
 *                           example: 89.3
 *                           description: Employee retention rate percentage
 *                         engagementScore:
 *                           type: number
 *                           example: 87.2
 *                           description: Overall employee engagement score
 *                         payEquityScore:
 *                           type: number
 *                           example: 0.82
 *                           description: Pay equity compliance score
 *                         diversityIndex:
 *                           type: number
 *                           example: 0.76
 *                           description: Organizational diversity index
 *                     visualizations:
 *                       type: object
 *                       description: Advanced charts and graphs for executive visualization
 *                       properties:
 *                         employeeTrendChart:
 *                           type: object
 *                           description: Employee growth and retention trend visualization
 *                         compensationHeatmap:
 *                           type: object
 *                           description: Compensation distribution heatmap by department and level
 *                         performanceMatrix:
 *                           type: object
 *                           description: 9-box performance vs potential matrix
 *                         talentFunnelChart:
 *                           type: object
 *                           description: Talent acquisition funnel visualization
 *                     aiInsights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: strategic_opportunity
 *                           summary:
 *                             type: string
 *                             example: "High-performing teams show 23% better engagement with flexible work arrangements"
 *                           confidenceScore:
 *                             type: number
 *                             example: 0.94
 *                           details:
 *                             type: string
 *                             description: Detailed AI analysis and reasoning
 *                           severity:
 *                             type: string
 *                             enum: [low, medium, high]
 *                           impactAreas:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: [employee_satisfaction, productivity, retention]
 *                           recommendations:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Expand flexible work policy", "Implement performance-based remote work criteria"]
 *                     predictiveAnalytics:
 *                       type: object
 *                       properties:
 *                         overallAccuracy:
 *                           type: number
 *                           example: 0.87
 *                         predictions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category:
 *                                 type: string
 *                                 example: employee_turnover
 *                               prediction:
 *                                 type: string
 *                                 example: "15% voluntary turnover expected in next 12 months"
 *                               confidence:
 *                                 type: number
 *                                 example: 0.84
 *                               factors:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 example: [compensation_competitiveness, manager_effectiveness]
 *                     quantumMetrics:
 *                       type: object
 *                       properties:
 *                         overallScore:
 *                           type: number
 *                           example: 0.92
 *                         quantumInsights:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               dimension:
 *                                 type: string
 *                                 example: organizational_resonance
 *                               score:
 *                                 type: number
 *                                 example: 0.89
 *                               interpretation:
 *                                 type: string
 *                                 example: "High alignment between employee values and organizational culture"
 *                 message:
 *                   type: string
 *                   example: "Revolutionary executive dashboard generated successfully"
 *             examples:
 *               quarterlyDashboard:
 *                 summary: Quarterly Executive Dashboard
 *                 value:
 *                   success: true
 *                   data:
 *                     keyMetrics:
 *                       totalEmployees: 2847
 *                       employeeGrowthRate: 12.5
 *                       retentionRate: 89.3
 *                       engagementScore: 87.2
 *                       payEquityScore: 0.82
 *                     aiInsights:
 *                       - type: "strategic_opportunity"
 *                         summary: "High-performing teams show 23% better engagement"
 *                         confidenceScore: 0.94
 *                         severity: "medium"
 *                   message: "Revolutionary executive dashboard generated successfully"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/executive-dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  requireRole([UserRole.CEO, UserRole.BOARD_MEMBER, UserRole.C_LEVEL, UserRole.HR_DIRECTOR, UserRole.SYSTEM_ADMIN]),
  cacheMiddleware({ ttl: 1800 }), // Cache for 30 minutes
  auditLogger('EXECUTIVE_DASHBOARD_GENERATION'),
  reportsController.getExecutiveDashboard.bind(reportsController)
);

// =====================
// BOARD PRESENTATION ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-reports/board-presentation:
 *   post:
 *     summary: Generate Board-Level Presentation
 *     description: Creates executive-quality board presentation with AI-crafted narratives, strategic insights, and actionable recommendations
 *     tags: [Revolutionary HR Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Q4 2024 HR Strategic Review"
 *                 description: Custom title for the board presentation
 *               timeframe:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *                 example: quarterly
 *                 description: Analysis timeframe for the presentation
 *               focusAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [overall_performance, strategic_initiatives, talent_optimization]
 *                 description: Key areas to focus on in the presentation
 *               includeExecutiveSummary:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include AI-generated executive summary
 *               includeStrategicRecommendations:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include strategic recommendations
 *               includeRiskAnalysis:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include risk analysis and mitigation
 *               presentationStyle:
 *                 type: string
 *                 enum: [executive, detailed, summary]
 *                 example: executive
 *                 description: Presentation style and level of detail
 *             required: [timeframe]
 *           examples:
 *             quarterlyReview:
 *               summary: Quarterly HR Strategic Review
 *               value:
 *                 title: "Q4 2024 HR Strategic Review"
 *                 timeframe: quarterly
 *                 focusAreas: [overall_performance, strategic_initiatives, talent_optimization]
 *                 includeExecutiveSummary: true
 *                 includeStrategicRecommendations: true
 *                 includeRiskAnalysis: true
 *                 presentationStyle: executive
 *             annualBoardReview:
 *               summary: Annual Board Review
 *               value:
 *                 title: "2024 Annual HR Performance Review"
 *                 timeframe: yearly
 *                 focusAreas: [overall_performance, strategic_initiatives, risk_management, competitive_analysis]
 *                 includeExecutiveSummary: true
 *                 includeStrategicRecommendations: true
 *                 includeRiskAnalysis: true
 *                 presentationStyle: detailed
 *     responses:
 *       200:
 *         description: Board presentation generated successfully
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
 *                     title:
 *                       type: string
 *                       example: "HR Strategic Review - QUARTERLY"
 *                     presentationDate:
 *                       type: string
 *                       format: date-time
 *                     slideCount:
 *                       type: number
 *                       example: 12
 *                     executiveHighlights:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Employee engagement increased by 87.2%", "AI-driven optimizations delivered 285.7% ROI"]
 *                     strategicRecommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           priority:
 *                             type: number
 *                           expectedImpact:
 *                             type: string
 *                           timeline:
 *                             type: string
 *                     aiNarrative:
 *                       type: object
 *                       properties:
 *                         executiveSummary:
 *                           type: string
 *                         keyInsights:
 *                           type: array
 *                           items:
 *                             type: string
 *                         qualityScore:
 *                           type: number
 *                           example: 0.96
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/board-presentation',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  requireRole([UserRole.CEO, UserRole.BOARD_MEMBER, UserRole.C_LEVEL, UserRole.HR_DIRECTOR, UserRole.SYSTEM_ADMIN]),
  validateRequest(boardPresentationRequestSchema),
  auditLogger('BOARD_PRESENTATION_GENERATION'),
  reportsController.generateBoardPresentation.bind(reportsController)
);

// =====================
// MULTI-FORMAT EXPORT ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-reports/export/{format}:
 *   post:
 *     summary: Export Report in Multiple Formats
 *     description: Exports HR reports in various formats (PowerPoint, PDF, Excel, Word) with AI-enhanced content and executive-quality formatting
 *     tags: [Revolutionary HR Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [powerpoint, pdf, excel, word, interactive_dashboard, video_presentation]
 *         description: Export format for the report
 *         example: powerpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [executive_dashboard, board_presentation, custom_report]
 *                 example: board_presentation
 *                 description: Type of report to export
 *               timeframe:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *                 example: quarterly
 *                 description: Analysis timeframe for the report
 *               includeInteractiveElements:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include interactive elements (for supported formats)
 *               includeAINarrative:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include AI-generated narrative content
 *               includeQuantumInsights:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to include quantum analytics insights
 *               executiveTemplate:
 *                 type: string
 *                 enum: [modern, classic, minimalist]
 *                 example: modern
 *                 description: Template style for the export
 *               brandingOptions:
 *                 type: object
 *                 properties:
 *                   includeLogo:
 *                     type: boolean
 *                     example: true
 *                   colorScheme:
 *                     type: string
 *                     example: corporate_blue
 *                   customFooter:
 *                     type: string
 *                     example: "Confidential - Board Use Only"
 *                 description: Branding and customization options
 *             required: [reportType, timeframe]
 *           examples:
 *             powerPointExport:
 *               summary: PowerPoint Board Presentation Export
 *               value:
 *                 reportType: board_presentation
 *                 timeframe: quarterly
 *                 includeInteractiveElements: false
 *                 includeAINarrative: true
 *                 includeQuantumInsights: true
 *                 executiveTemplate: modern
 *                 brandingOptions:
 *                   includeLogo: true
 *                   colorScheme: corporate_blue
 *                   customFooter: "Confidential - Board Use Only"
 *             excelAnalyticsExport:
 *               summary: Excel Analytics Workbook Export
 *               value:
 *                 reportType: executive_dashboard
 *                 timeframe: quarterly
 *                 includeInteractiveElements: true
 *                 includeAINarrative: true
 *                 includeQuantumInsights: true
 *                 executiveTemplate: detailed
 *     responses:
 *       200:
 *         description: Report exported successfully
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
 *                     fileUrl:
 *                       type: string
 *                       example: "https://storage.company.com/reports/board-presentation-123456.pptx"
 *                       description: Download URL for the exported report
 *                     fileName:
 *                       type: string
 *                       example: "HR_Board_Presentation_2024-03-15.pptx"
 *                       description: Generated filename for the export
 *                     fileSize:
 *                       type: number
 *                       example: 15728640
 *                       description: File size in bytes
 *                     aiEnhancements:
 *                       type: object
 *                       properties:
 *                         narrativeGenerated:
 *                           type: boolean
 *                           example: true
 *                         insightsCount:
 *                           type: number
 *                           example: 24
 *                         chartsOptimized:
 *                           type: number
 *                           example: 12
 *                       description: AI enhancements applied to the export
 *                     exportMetadata:
 *                       type: object
 *                       properties:
 *                         format:
 *                           type: string
 *                           example: powerpoint
 *                         aiOptimized:
 *                           type: boolean
 *                           example: true
 *                         quantumEnhanced:
 *                           type: boolean
 *                           example: true
 *                         executiveReady:
 *                           type: boolean
 *                           example: true
 *                       description: Export metadata and processing information
 *                 message:
 *                   type: string
 *                   example: "Revolutionary report exported successfully in powerpoint format"
 *       400:
 *         description: Invalid export configuration
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/export/:format',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes (resource intensive)
  requireRole([UserRole.CEO, UserRole.BOARD_MEMBER, UserRole.C_LEVEL, UserRole.HR_DIRECTOR, UserRole.HR_ADMIN]),
  validateRequest(reportConfigurationSchema),
  auditLogger('REPORT_EXPORT'),
  reportsController.exportReport.bind(reportsController)
);

// =====================
// ADVANCED ANALYTICS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-reports/predictive-analytics:
 *   get:
 *     summary: Get AI-Powered Predictive Analytics
 *     description: Retrieves comprehensive predictive analytics including turnover predictions, performance forecasts, and strategic recommendations
 *     tags: [Revolutionary HR Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categories
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of prediction categories (e.g., "employee_turnover,performance_trends")
 *         example: "employee_turnover,performance_trends,compensation_costs"
 *       - in: query
 *         name: timeframe
 *         required: false
 *         schema:
 *           type: string
 *           enum: [6months, 1year, 2years]
 *           default: 1year
 *         description: Prediction timeframe
 *         example: 1year
 *     responses:
 *       200:
 *         description: Predictive analytics generated successfully
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
 *                     overallAccuracy:
 *                       type: number
 *                       example: 0.87
 *                     predictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: employee_turnover
 *                           prediction:
 *                             type: string
 *                             example: "15% voluntary turnover expected in next 12 months"
 *                           confidence:
 *                             type: number
 *                             example: 0.84
 *                           factors:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: [compensation_competitiveness, manager_effectiveness, career_progression]
 *                           timeline:
 *                             type: string
 *                             example: "12 months"
 *                           mitigationActions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Enhanced retention programs", "Manager training on engagement"]
 *                 message:
 *                   type: string
 *                   example: "Predictive analytics generated successfully"
 */
router.get(
  '/predictive-analytics',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
  requireRole([UserRole.CEO, UserRole.BOARD_MEMBER, UserRole.C_LEVEL, UserRole.HR_DIRECTOR, UserRole.DATA_ANALYST]),
  cacheMiddleware({ ttl: 900 }), // Cache for 15 minutes
  auditLogger('PREDICTIVE_ANALYTICS_ACCESS'),
  reportsController.getPredictiveAnalytics.bind(reportsController)
);

/**
 * @swagger
 * /hr/revolutionary-reports/competitive-benchmarking:
 *   get:
 *     summary: Get Competitive Benchmarking Analysis
 *     description: Provides comprehensive competitive analysis comparing HR metrics against industry benchmarks and competitors
 *     tags: [Revolutionary HR Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: industry
 *         required: false
 *         schema:
 *           type: string
 *         description: Industry sector for benchmarking comparison
 *         example: technology
 *       - in: query
 *         name: companySize
 *         required: false
 *         schema:
 *           type: string
 *           enum: [startup, small, medium, large, enterprise]
 *         description: Company size category for peer comparison
 *         example: large
 *     responses:
 *       200:
 *         description: Competitive benchmarking analysis generated successfully
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
 *                     overallRanking:
 *                       type: string
 *                       example: top_quartile
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         employeeEngagement:
 *                           type: object
 *                           properties:
 *                             organizationScore:
 *                               type: number
 *                               example: 87.2
 *                             industryAverage:
 *                               type: number
 *                               example: 72.5
 *                             ranking:
 *                               type: string
 *                               example: above_average
 *                             percentile:
 *                               type: number
 *                               example: 78
 *                     competitiveAdvantages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Industry-leading talent acquisition", "Above-average retention rates"]
 *                     improvementAreas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Compensation competitiveness", "Learning and development programs"]
 *                 message:
 *                   type: string
 *                   example: "Competitive benchmarking analysis generated successfully"
 */
router.get(
  '/competitive-benchmarking',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  requireRole([UserRole.CEO, UserRole.BOARD_MEMBER, UserRole.C_LEVEL, UserRole.HR_DIRECTOR]),
  cacheMiddleware({ ttl: 1800 }), // Cache for 30 minutes
  auditLogger('COMPETITIVE_BENCHMARKING_ACCESS'),
  reportsController.getCompetitiveBenchmarking.bind(reportsController)
);

// =====================
// SYSTEM HEALTH & STATUS ROUTES
// =====================

/**
 * @swagger
 * /hr/revolutionary-reports/health:
 *   get:
 *     summary: Revolutionary Reports Service Health Check
 *     description: Checks the health status of the reports and analytics service with all AI/quantum capabilities
 *     tags: [Revolutionary HR Reports & Analytics]
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
 *                       example: "RevolutionaryReportsAnalyticsService"
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     features:
 *                       type: object
 *                       properties:
 *                         executiveDashboards:
 *                           type: string
 *                           example: operational
 *                         boardPresentations:
 *                           type: string
 *                           example: operational
 *                         aiNarratives:
 *                           type: string
 *                           example: operational
 *                         multiFormatExports:
 *                           type: string
 *                           example: operational
 *                         quantumAnalytics:
 *                           type: string
 *                           example: operational
 *                     exportFormats:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [powerpoint, pdf, excel, word, interactive_dashboard, video_presentation]
 *                     aiCapabilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [nlp_narratives, predictive_analytics, quantum_insights, competitive_intelligence]
 *                 message:
 *                   type: string
 *                   example: "Revolutionary Reports & Analytics Service is fully operational"
 */
router.get(
  '/health',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  reportsController.healthCheck.bind(reportsController)
);

export default router;
