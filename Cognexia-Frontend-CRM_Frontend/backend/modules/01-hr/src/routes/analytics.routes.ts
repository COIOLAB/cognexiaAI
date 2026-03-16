// Industry 5.0 ERP Backend - Advanced HR Analytics Routes
// Revolutionary analytics routing with AI insights, quantum computing, board presentations, and multi-format exports
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/authorization.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { rateLimit } from '../../../middleware/rate-limit.middleware';
import { audit } from '../../../middleware/audit.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply authentication to all routes
router.use(authenticate);

// Rate limiting for API endpoints
const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // limit for sensitive operations
});

const executiveRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10 // very strict for executive dashboard access
});

// ===== EXECUTIVE DASHBOARD =====

/**
 * @route   GET /api/v1/hr/analytics/executive-dashboard
 * @desc    Generate executive dashboard with AI insights and quantum analytics
 * @access  C-Level, Board Members, HR Director, System Admin
 */
router.get(
  '/executive-dashboard',
  executiveRateLimit,
  authorize(['ceo', 'cfo', 'chro', 'board_member', 'hr_director', 'system_admin']),
  validateRequest({
    query: {
      timeframe: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], default: 'quarterly' },
      organizationId: { type: 'string', format: 'uuid' },
      includeQuantumInsights: { type: 'boolean', default: true },
      includeAIRecommendations: { type: 'boolean', default: true },
      includeBenchmarking: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'ACCESS_EXECUTIVE_DASHBOARD', resource: 'executive_analytics' }),
  analyticsController.getExecutiveDashboard
);

/**
 * @route   POST /api/v1/hr/analytics/board-presentation
 * @desc    Generate board-level presentation with quantum analytics
 * @access  C-Level, Board Members, HR Director
 */
router.post(
  '/board-presentation',
  strictRateLimit,
  authorize(['ceo', 'cfo', 'chro', 'board_member', 'hr_director']),
  validateRequest({
    body: {
      organizationId: { type: 'string', format: 'uuid' },
      presentationType: { 
        type: 'string', 
        required: true, 
        enum: ['quarterly_review', 'annual_report', 'strategic_planning', 'crisis_response', 'custom'] 
      },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m', '24m'], default: '12m' },
      focusAreas: { 
        type: 'array', 
        items: { 
          type: 'string', 
          enum: ['workforce', 'talent', 'engagement', 'compliance', 'diversity', 'performance', 'costs'] 
        } 
      },
      exportFormat: { type: 'string', enum: ['ppt', 'pdf', 'excel'], default: 'ppt' },
      includeExecutiveSummary: { type: 'boolean', default: true },
      includeQuantumInsights: { type: 'boolean', default: true },
      includeActionItems: { type: 'boolean', default: true },
      customizations: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['corporate', 'modern', 'executive'], default: 'executive' },
          language: { type: 'string', default: 'en' },
          currency: { type: 'string', default: 'USD' }
        }
      }
    }
  }),
  audit({ action: 'GENERATE_BOARD_PRESENTATION', resource: 'board_presentation' }),
  analyticsController.generateBoardPresentation
);

/**
 * @route   GET /api/v1/hr/analytics/presentations/:id/export
 * @desc    Export presentation in multiple formats
 * @access  C-Level, Board Members, HR Director, HR Manager
 */
router.get(
  '/presentations/:id/export',
  standardRateLimit,
  authorize(['ceo', 'cfo', 'chro', 'board_member', 'hr_director', 'hr_manager']),
  validateRequest({
    params: {
      id: { type: 'string', required: true, format: 'uuid' }
    },
    query: {
      format: { type: 'string', enum: ['ppt', 'pdf', 'excel'], default: 'pdf' },
      includeCharts: { type: 'boolean', default: true },
      includeData: { type: 'boolean', default: true },
      watermark: { type: 'boolean', default: false },
      compression: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
    }
  }),
  audit({ action: 'EXPORT_PRESENTATION', resource: 'presentation_export' }),
  analyticsController.exportPresentation
);

// ===== WORKFORCE ANALYTICS =====

/**
 * @route   GET /api/v1/hr/analytics/workforce-analytics
 * @desc    Get comprehensive workforce analytics with AI predictions
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.get(
  '/workforce-analytics',
  standardRateLimit,
  authorize(['hr:analytics:read', 'manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m', '24m'], default: '12m' },
      departmentId: { type: 'string', format: 'uuid' },
      includePredictions: { type: 'boolean', default: true },
      includeComparisons: { type: 'boolean', default: true },
      granularity: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'monthly' }
    }
  }),
  analyticsController.getWorkforceAnalytics
);

/**
 * @route   GET /api/v1/hr/analytics/predictive-insights
 * @desc    Get predictive analytics and forecasting
 * @access  HR Manager, HR Director, Admin
 */
router.get(
  '/predictive-insights',
  standardRateLimit,
  authorize(['hr_manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      predictionType: { 
        type: 'string', 
        enum: ['turnover', 'engagement', 'performance', 'skills_gap', 'hiring_needs', 'comprehensive'], 
        default: 'comprehensive' 
      },
      timeHorizon: { type: 'string', enum: ['3m', '6m', '12m', '24m'], default: '12m' },
      departmentId: { type: 'string', format: 'uuid' },
      confidenceLevel: { type: 'number', min: 0.5, max: 0.99, default: 0.85 },
      includeScenarios: { type: 'boolean', default: true }
    }
  }),
  analyticsController.getPredictiveInsights
);

// ===== QUANTUM ANALYTICS =====

/**
 * @route   GET /api/v1/hr/analytics/quantum-insights
 * @desc    Get quantum analytics with multi-dimensional analysis
 * @access  C-Level, Board Members, HR Director, System Admin
 */
router.get(
  '/quantum-insights',
  strictRateLimit,
  authorize(['ceo', 'cfo', 'chro', 'board_member', 'hr_director', 'system_admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      analysisType: { 
        type: 'string', 
        enum: ['pattern_recognition', 'correlation_analysis', 'optimization', 'risk_assessment', 'comprehensive'], 
        default: 'comprehensive' 
      },
      dimensions: { 
        type: 'string', 
        enum: ['performance', 'engagement', 'skills', 'culture', 'all'], 
        default: 'all' 
      },
      complexityLevel: { type: 'string', enum: ['basic', 'standard', 'advanced', 'quantum'], default: 'standard' },
      includeVisualization: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'ACCESS_QUANTUM_INSIGHTS', resource: 'quantum_analytics' }),
  analyticsController.getQuantumInsights
);

// ===== COMPETITIVE BENCHMARKING =====

/**
 * @route   GET /api/v1/hr/analytics/competitive-benchmarking
 * @desc    Get competitive benchmarking analysis
 * @access  C-Level, Board Members, HR Director, HR Manager
 */
router.get(
  '/competitive-benchmarking',
  standardRateLimit,
  authorize(['ceo', 'cfo', 'chro', 'board_member', 'hr_director', 'hr_manager']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      industry: { type: 'string' },
      companySize: { type: 'string', enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
      region: { type: 'string' },
      metrics: { 
        type: 'string', 
        enum: ['compensation', 'benefits', 'engagement', 'turnover', 'diversity', 'all'], 
        default: 'all' 
      },
      includeRecommendations: { type: 'boolean', default: true },
      confidentialityLevel: { type: 'string', enum: ['public', 'industry', 'peer'], default: 'industry' }
    }
  }),
  audit({ action: 'ACCESS_COMPETITIVE_BENCHMARKING', resource: 'competitive_analysis' }),
  analyticsController.getCompetitiveBenchmarking
);

// ===== REAL-TIME METRICS =====

/**
 * @route   GET /api/v1/hr/analytics/real-time-metrics
 * @desc    Get real-time HR metrics dashboard
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.get(
  '/real-time-metrics',
  standardRateLimit,
  authorize(['hr:analytics:read', 'manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      metricTypes: { 
        type: 'string', 
        enum: ['attendance', 'engagement', 'performance', 'hiring', 'all'], 
        default: 'all' 
      },
      refreshInterval: { type: 'number', min: 10, max: 300, default: 30 }, // seconds
      includeTrends: { type: 'boolean', default: true },
      alertThresholds: { type: 'boolean', default: true }
    }
  }),
  analyticsController.getRealTimeMetrics
);

// ===== CUSTOM REPORTS =====

/**
 * @route   POST /api/v1/hr/analytics/custom-report
 * @desc    Generate custom analytics report
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.post(
  '/custom-report',
  standardRateLimit,
  authorize(['hr:analytics:write', 'manager', 'hr_director', 'admin']),
  validateRequest({
    body: {
      organizationId: { type: 'string', format: 'uuid' },
      reportType: { type: 'string', required: true },
      reportName: { type: 'string', required: true, minLength: 3, maxLength: 100 },
      dataPoints: { type: 'array', required: true, minItems: 1, items: { type: 'string' } },
      filters: {
        type: 'object',
        properties: {
          dateRange: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' }
            }
          },
          departments: { type: 'array', items: { type: 'string', format: 'uuid' } },
          positions: { type: 'array', items: { type: 'string' } },
          employeeStatuses: { type: 'array', items: { type: 'string' } }
        }
      },
      visualizations: { type: 'array', items: { type: 'string' } },
      exportFormat: { type: 'string', enum: ['json', 'csv', 'excel', 'pdf'], default: 'json' },
      scheduledDelivery: {
        type: 'object',
        properties: {
          frequency: { type: 'string', enum: ['once', 'daily', 'weekly', 'monthly'] },
          recipients: { type: 'array', items: { type: 'string', format: 'email' } }
        }
      }
    }
  }),
  audit({ action: 'GENERATE_CUSTOM_REPORT', resource: 'custom_report' }),
  analyticsController.generateCustomReport
);

// ===== AI-POWERED RECOMMENDATIONS =====

/**
 * @route   GET /api/v1/hr/analytics/ai-recommendations
 * @desc    Get AI-powered recommendations for HR strategy
 * @access  HR Manager, HR Director, Admin
 */
router.get(
  '/ai-recommendations',
  standardRateLimit,
  authorize(['hr_manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      focusArea: { 
        type: 'string', 
        enum: ['retention', 'engagement', 'performance', 'diversity', 'skills', 'comprehensive'], 
        default: 'comprehensive' 
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m'], default: '6m' },
      includeImplementationPlan: { type: 'boolean', default: true },
      includeROIEstimates: { type: 'boolean', default: true }
    }
  }),
  analyticsController.getAIRecommendations
);

// ===== SENTIMENT ANALYSIS =====

/**
 * @route   GET /api/v1/hr/analytics/sentiment-analysis
 * @desc    Get employee sentiment and engagement trends
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.get(
  '/sentiment-analysis',
  standardRateLimit,
  authorize(['hr:analytics:read', 'manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      timeframe: { type: 'string', enum: ['3m', '6m', '12m', '24m'], default: '12m' },
      departmentId: { type: 'string', format: 'uuid' },
      analysisDepth: { type: 'string', enum: ['basic', 'standard', 'deep'], default: 'standard' },
      includeTopics: { type: 'boolean', default: true },
      includeTrendAnalysis: { type: 'boolean', default: true },
      sourceTypes: { 
        type: 'string', 
        enum: ['surveys', 'feedback', 'exit_interviews', 'all'], 
        default: 'all' 
      }
    }
  }),
  analyticsController.getSentimentAnalysis
);

// ===== TALENT ANALYTICS =====

/**
 * @route   GET /api/v1/hr/analytics/talent-analytics
 * @desc    Get comprehensive talent analytics
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.get(
  '/talent-analytics',
  standardRateLimit,
  authorize(['hr:analytics:read', 'manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      analysisType: { 
        type: 'string', 
        enum: ['skills', 'performance', 'potential', 'retention', 'succession', 'comprehensive'], 
        default: 'comprehensive' 
      },
      includeSkillMapping: { type: 'boolean', default: true },
      includeSuccessionPlanning: { type: 'boolean', default: true },
      includeRetentionAnalysis: { type: 'boolean', default: true },
      includePotentialAssessment: { type: 'boolean', default: true },
      timeframe: { type: 'string', enum: ['6m', '12m', '24m'], default: '12m' }
    }
  }),
  analyticsController.getTalentAnalytics
);

// ===== DIVERSITY, EQUITY & INCLUSION =====

/**
 * @route   GET /api/v1/hr/analytics/dei-analytics
 * @desc    Get diversity, equity, and inclusion analytics
 * @access  HR Staff, Manager, HR Director, Admin
 */
router.get(
  '/dei-analytics',
  standardRateLimit,
  authorize(['hr:analytics:read', 'manager', 'hr_director', 'admin']),
  validateRequest({
    query: {
      organizationId: { type: 'string', format: 'uuid' },
      timeframe: { type: 'string', enum: ['6m', '12m', '24m'], default: '12m' },
      includePayEquity: { type: 'boolean', default: true },
      includeRepresentation: { type: 'boolean', default: true },
      includeInclusion: { type: 'boolean', default: true },
      includeProgression: { type: 'boolean', default: true },
      departmentId: { type: 'string', format: 'uuid' },
      benchmarkComparison: { type: 'boolean', default: true },
      complianceCheck: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'ACCESS_DEI_ANALYTICS', resource: 'dei_analytics' }),
  analyticsController.getDEIAnalytics
);

// ===== SCHEDULED REPORTS =====

/**
 * @route   POST /api/v1/hr/analytics/schedule-report
 * @desc    Schedule automated report delivery
 * @access  HR Manager, HR Director, Admin
 */
router.post(
  '/schedule-report',
  strictRateLimit,
  authorize(['hr_manager', 'hr_director', 'admin']),
  validateRequest({
    body: {
      reportId: { type: 'string', required: true, format: 'uuid' },
      schedule: {
        type: 'object',
        required: true,
        properties: {
          frequency: { type: 'string', required: true, enum: ['daily', 'weekly', 'monthly', 'quarterly'] },
          dayOfWeek: { type: 'number', min: 0, max: 6 }, // for weekly
          dayOfMonth: { type: 'number', min: 1, max: 31 }, // for monthly
          time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' } // HH:MM format
        }
      },
      recipients: { 
        type: 'array', 
        required: true, 
        minItems: 1,
        items: { type: 'string', format: 'email' } 
      },
      format: { type: 'string', enum: ['pdf', 'excel', 'both'], default: 'pdf' },
      includeAttachments: { type: 'boolean', default: true }
    }
  }),
  audit({ action: 'SCHEDULE_REPORT', resource: 'scheduled_report' }),
  analyticsController.scheduleReport
);

// ===== ANALYTICS HEALTH CHECK =====

/**
 * @route   GET /api/v1/hr/analytics/health
 * @desc    Health check for analytics service
 * @access  Public (internal monitoring)
 */
router.get(
  '/health',
  analyticsController.healthCheck
);

export default router;
