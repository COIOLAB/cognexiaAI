// Industry 5.0 ERP Backend - Revolutionary Reports & Analytics Validation Schemas
// Comprehensive validation schemas for board-level reporting and analytics endpoints
// World's most advanced HR reporting validation ensuring data integrity and security
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import Joi from 'joi';

// =====================
// BOARD PRESENTATION REQUEST SCHEMA
// =====================

export const boardPresentationRequestSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .optional()
    .description('Custom title for the board presentation'),

  timeframe: Joi.string()
    .valid('monthly', 'quarterly', 'yearly')
    .required()
    .description('Analysis timeframe for the presentation'),

  focusAreas: Joi.array()
    .items(
      Joi.string().valid(
        'overall_performance',
        'strategic_initiatives', 
        'talent_optimization',
        'risk_management',
        'competitive_analysis',
        'financial_metrics',
        'operational_efficiency',
        'employee_engagement',
        'diversity_inclusion',
        'compliance_governance',
        'innovation_metrics',
        'sustainability_metrics'
      )
    )
    .min(1)
    .max(8)
    .unique()
    .optional()
    .default(['overall_performance', 'strategic_initiatives', 'talent_optimization'])
    .description('Key areas to focus on in the presentation'),

  includeExecutiveSummary: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include AI-generated executive summary'),

  includeStrategicRecommendations: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include strategic recommendations'),

  includeRiskAnalysis: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include risk analysis and mitigation strategies'),

  includeCompetitiveInsights: Joi.boolean()
    .optional()
    .default(false)
    .description('Whether to include competitive benchmarking insights'),

  includeQuantumAnalytics: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include quantum analytics insights'),

  presentationStyle: Joi.string()
    .valid('executive', 'detailed', 'summary', 'strategic')
    .optional()
    .default('executive')
    .description('Presentation style and level of detail'),

  aiNarrativeComplexity: Joi.string()
    .valid('simple', 'moderate', 'complex', 'executive')
    .optional()
    .default('executive')
    .description('Complexity level for AI-generated narratives'),

  customBranding: Joi.object({
    companyLogo: Joi.boolean().optional().default(true),
    colorTheme: Joi.string().valid(
      'corporate_blue', 'professional_gray', 'modern_teal', 
      'executive_navy', 'innovation_purple', 'growth_green'
    ).optional().default('corporate_blue'),
    customFooter: Joi.string().max(100).optional(),
    confidentialityLevel: Joi.string().valid(
      'public', 'internal', 'confidential', 'restricted', 'board_only'
    ).optional().default('board_only')
  }).optional().description('Custom branding and styling options')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// REPORT CONFIGURATION SCHEMA
// =====================

export const reportConfigurationSchema = Joi.object({
  reportType: Joi.string()
    .valid('executive_dashboard', 'board_presentation', 'custom_report', 'analytics_deep_dive')
    .required()
    .description('Type of report to export'),

  timeframe: Joi.string()
    .valid('monthly', 'quarterly', 'yearly', 'custom')
    .required()
    .description('Analysis timeframe for the report'),

  customDateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  }).when('timeframe', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).description('Custom date range when timeframe is custom'),

  includeInteractiveElements: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include interactive elements for supported formats'),

  includeAINarrative: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include AI-generated narrative content'),

  includeQuantumInsights: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include quantum analytics insights'),

  includeMetaverseVisualizations: Joi.boolean()
    .optional()
    .default(false)
    .description('Whether to include metaverse-ready 3D visualizations'),

  includeBiometricAnalytics: Joi.boolean()
    .optional()
    .default(false)
    .description('Whether to include biometric intelligence insights'),

  includeBlockchainVerification: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include blockchain-verified data integrity markers'),

  executiveTemplate: Joi.string()
    .valid('modern', 'classic', 'minimalist', 'futuristic', 'corporate', 'innovative')
    .optional()
    .default('modern')
    .description('Template style for the export'),

  dataVisualizationLevel: Joi.string()
    .valid('basic', 'advanced', 'executive', 'revolutionary')
    .optional()
    .default('executive')
    .description('Level of data visualization sophistication'),

  aiInsightDepth: Joi.string()
    .valid('surface', 'intermediate', 'deep', 'revolutionary')
    .optional()
    .default('deep')
    .description('Depth of AI-generated insights and analysis'),

  brandingOptions: Joi.object({
    includeLogo: Joi.boolean().optional().default(true),
    colorScheme: Joi.string().valid(
      'corporate_blue', 'professional_gray', 'modern_teal',
      'executive_navy', 'innovation_purple', 'growth_green',
      'quantum_silver', 'ai_gold', 'futuristic_cyan'
    ).optional().default('corporate_blue'),
    customFooter: Joi.string().max(200).optional(),
    watermark: Joi.string().max(50).optional(),
    headerText: Joi.string().max(100).optional(),
    confidentialityMarking: Joi.string().valid(
      'none', 'internal', 'confidential', 'restricted', 'board_only', 'top_secret'
    ).optional().default('board_only')
  }).optional().description('Branding and customization options'),

  exportQuality: Joi.string()
    .valid('standard', 'high', 'ultra', 'presentation_ready')
    .optional()
    .default('presentation_ready')
    .description('Export quality and resolution settings'),

  languageSettings: Joi.object({
    primaryLanguage: Joi.string().valid(
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi'
    ).optional().default('en'),
    includeTranslations: Joi.boolean().optional().default(false),
    culturalAdaptation: Joi.boolean().optional().default(false)
  }).optional().description('Language and localization settings'),

  securityOptions: Joi.object({
    passwordProtection: Joi.boolean().optional().default(false),
    encryptionLevel: Joi.string().valid('none', 'standard', 'enterprise', 'quantum').optional().default('enterprise'),
    accessRestrictions: Joi.array().items(
      Joi.string().valid('view_only', 'no_print', 'no_copy', 'no_edit', 'expiration_date')
    ).optional(),
    auditTrail: Joi.boolean().optional().default(true)
  }).optional().description('Security and access control options')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// EXPORT FORMAT SCHEMA
// =====================

export const exportFormatSchema = Joi.object({
  format: Joi.string()
    .valid(
      'powerpoint', 'pdf', 'excel', 'word', 
      'interactive_dashboard', 'video_presentation',
      'web_report', 'json_data', 'csv_export',
      'metaverse_experience', 'ar_visualization'
    )
    .required()
    .description('Export format for the report'),

  formatSpecificOptions: Joi.object({
    // PowerPoint specific options
    slideTransitions: Joi.boolean().when('..format', { is: 'powerpoint', then: Joi.optional().default(true) }),
    speakerNotes: Joi.boolean().when('..format', { is: 'powerpoint', then: Joi.optional().default(true) }),
    animatedCharts: Joi.boolean().when('..format', { is: 'powerpoint', then: Joi.optional().default(true) }),

    // PDF specific options
    bookmarks: Joi.boolean().when('..format', { is: 'pdf', then: Joi.optional().default(true) }),
    hyperlinks: Joi.boolean().when('..format', { is: 'pdf', then: Joi.optional().default(true) }),
    annotations: Joi.boolean().when('..format', { is: 'pdf', then: Joi.optional().default(false) }),

    // Excel specific options
    pivotTables: Joi.boolean().when('..format', { is: 'excel', then: Joi.optional().default(true) }),
    macros: Joi.boolean().when('..format', { is: 'excel', then: Joi.optional().default(false) }),
    chartSheets: Joi.boolean().when('..format', { is: 'excel', then: Joi.optional().default(true) }),

    // Word specific options
    tableOfContents: Joi.boolean().when('..format', { is: 'word', then: Joi.optional().default(true) }),
    crossReferences: Joi.boolean().when('..format', { is: 'word', then: Joi.optional().default(true) }),
    styleGuide: Joi.string().when('..format', { is: 'word', then: Joi.valid('corporate', 'academic', 'executive').optional().default('executive') }),

    // Interactive Dashboard specific options
    realTimeUpdates: Joi.boolean().when('..format', { is: 'interactive_dashboard', then: Joi.optional().default(true) }),
    userInteractivity: Joi.string().when('..format', { is: 'interactive_dashboard', then: Joi.valid('basic', 'advanced', 'full').optional().default('advanced') }),
    responsiveDesign: Joi.boolean().when('..format', { is: 'interactive_dashboard', then: Joi.optional().default(true) }),

    // Video Presentation specific options
    voiceNarration: Joi.boolean().when('..format', { is: 'video_presentation', then: Joi.optional().default(true) }),
    backgroundMusic: Joi.boolean().when('..format', { is: 'video_presentation', then: Joi.optional().default(false) }),
    videoQuality: Joi.string().when('..format', { is: 'video_presentation', then: Joi.valid('720p', '1080p', '4k').optional().default('1080p') })
  }).optional().description('Format-specific customization options')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// DASHBOARD REQUEST SCHEMA
// =====================

export const dashboardRequestSchema = Joi.object({
  timeframe: Joi.string()
    .valid('weekly', 'monthly', 'quarterly', 'yearly', 'custom')
    .optional()
    .default('quarterly')
    .description('Analysis timeframe for the dashboard'),

  customDateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  }).when('timeframe', {
    is: 'custom',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).description('Custom date range when timeframe is custom'),

  departments: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .description('Specific departments to include in analysis'),

  kpiCategories: Joi.array()
    .items(
      Joi.string().valid(
        'employee_metrics', 'performance_indicators', 'financial_metrics',
        'engagement_scores', 'retention_rates', 'diversity_metrics',
        'compensation_analytics', 'talent_acquisition', 'learning_development',
        'compliance_metrics', 'innovation_indicators', 'sustainability_scores'
      )
    )
    .min(1)
    .max(12)
    .unique()
    .optional()
    .default(['employee_metrics', 'performance_indicators', 'engagement_scores'])
    .description('Categories of KPIs to include in dashboard'),

  includeAIInsights: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include AI-generated insights'),

  includePredictiveAnalytics: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include predictive analytics'),

  includeQuantumMetrics: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include quantum-enhanced metrics'),

  visualizationPreferences: Joi.object({
    chartTypes: Joi.array().items(
      Joi.string().valid(
        'bar_charts', 'line_graphs', 'pie_charts', 'scatter_plots',
        'heatmaps', 'treemaps', 'gauge_charts', 'radar_charts',
        'sankey_diagrams', 'network_graphs', 'quantum_visualizations'
      )
    ).optional(),
    colorPalette: Joi.string().valid(
      'corporate', 'modern', 'vibrant', 'monochrome', 'quantum', 'ai_enhanced'
    ).optional().default('corporate'),
    interactivityLevel: Joi.string().valid('static', 'basic', 'interactive', 'immersive').optional().default('interactive')
  }).optional().description('Visualization preferences and settings')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// PREDICTIVE ANALYTICS REQUEST SCHEMA
// =====================

export const predictiveAnalyticsRequestSchema = Joi.object({
  categories: Joi.array()
    .items(
      Joi.string().valid(
        'employee_turnover', 'performance_trends', 'compensation_costs',
        'recruitment_success', 'engagement_fluctuations', 'skills_gaps',
        'leadership_effectiveness', 'diversity_progress', 'compliance_risks',
        'innovation_capacity', 'organizational_health', 'market_competitiveness'
      )
    )
    .min(1)
    .max(12)
    .unique()
    .optional()
    .default(['employee_turnover', 'performance_trends', 'engagement_fluctuations'])
    .description('Categories of predictions to generate'),

  predictionTimeframe: Joi.string()
    .valid('3months', '6months', '1year', '2years', '5years')
    .optional()
    .default('1year')
    .description('Timeframe for predictions'),

  confidenceThreshold: Joi.number()
    .min(0.1)
    .max(1.0)
    .optional()
    .default(0.7)
    .description('Minimum confidence threshold for predictions'),

  includeScenarioAnalysis: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include scenario analysis (best/worst/likely cases)'),

  includeActionableInsights: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include actionable insights and recommendations'),

  includeRiskAssessment: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include risk assessment and mitigation strategies'),

  aiModelComplexity: Joi.string()
    .valid('basic', 'advanced', 'deep_learning', 'quantum_enhanced')
    .optional()
    .default('advanced')
    .description('Complexity level of AI models to use for predictions')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// COMPETITIVE BENCHMARKING REQUEST SCHEMA
// =====================

export const competitiveBenchmarkingRequestSchema = Joi.object({
  industry: Joi.string()
    .valid(
      'technology', 'finance', 'healthcare', 'manufacturing', 'retail',
      'consulting', 'education', 'government', 'energy', 'telecommunications',
      'pharmaceuticals', 'aerospace', 'automotive', 'media', 'real_estate'
    )
    .optional()
    .description('Industry sector for benchmarking comparison'),

  companySize: Joi.string()
    .valid('startup', 'small', 'medium', 'large', 'enterprise', 'multinational')
    .optional()
    .description('Company size category for peer comparison'),

  geographicScope: Joi.string()
    .valid('local', 'regional', 'national', 'international', 'global')
    .optional()
    .default('national')
    .description('Geographic scope for benchmarking'),

  benchmarkingAreas: Joi.array()
    .items(
      Joi.string().valid(
        'compensation_packages', 'employee_benefits', 'retention_rates',
        'engagement_scores', 'diversity_metrics', 'learning_development',
        'performance_management', 'talent_acquisition', 'workplace_culture',
        'innovation_metrics', 'sustainability_practices', 'digital_transformation'
      )
    )
    .min(1)
    .max(12)
    .unique()
    .optional()
    .default(['compensation_packages', 'retention_rates', 'engagement_scores'])
    .description('Areas to benchmark against competitors'),

  includeMarketTrends: Joi.boolean()
    .optional()
    .default(true)
    .description('Whether to include market trends analysis'),

  includeCompetitorProfiles: Joi.boolean()
    .optional()
    .default(false)
    .description('Whether to include anonymous competitor profiles'),

  confidentialityLevel: Joi.string()
    .valid('public_data_only', 'industry_reports', 'partner_networks', 'comprehensive')
    .optional()
    .default('industry_reports')
    .description('Level of data sources for benchmarking')
}).options({
  stripUnknown: true,
  abortEarly: false
});

// =====================
// COMMON VALIDATION HELPERS
// =====================

export const commonValidation = {
  // Date range validation helper
  dateRangeValidator: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    timezone: Joi.string().optional().default('UTC')
  }),

  // User role validation helper
  authorizedRoles: Joi.array().items(
    Joi.string().valid(
      'CEO', 'BOARD_MEMBER', 'C_LEVEL', 'HR_DIRECTOR', 
      'HR_ADMIN', 'DATA_ANALYST', 'SYSTEM_ADMIN'
    )
  ).min(1),

  // File format validation helper
  supportedFormats: Joi.string().valid(
    'powerpoint', 'pdf', 'excel', 'word', 'interactive_dashboard', 
    'video_presentation', 'web_report', 'json_data', 'csv_export'
  ),

  // Pagination validation helper
  paginationValidator: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
  })
};

// Export all validation schemas
export default {
  boardPresentationRequestSchema,
  reportConfigurationSchema,
  exportFormatSchema,
  dashboardRequestSchema,
  predictiveAnalyticsRequestSchema,
  competitiveBenchmarkingRequestSchema,
  commonValidation
};
