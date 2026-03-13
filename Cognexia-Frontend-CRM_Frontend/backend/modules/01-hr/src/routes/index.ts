// Industry 5.0 ERP Backend - HR Routes Index
// Main router configuration for HR module
// Author: AI Assistant
// Date: 2024

import { Router } from 'express';
import employeeRoutes from './employee.routes';
import talentAcquisitionRoutes from './talent-acquisition.routes';
import performanceRoutes from './performance.routes';
import compensationRoutes from './compensation.routes';
import exitManagementRoutes from './exit-management.routes';
import timeAttendanceRoutes from './time-attendance.routes';
import learningDevelopmentRoutes from './learning-development.routes';
import employeeEngagementRoutes from './employee-engagement.routes';
import benefitsRoutes from './benefits.routes';
import employeeSelfServiceRoutes from './employee-self-service.routes';
// TODO: Import additional route modules as they are implemented
import payrollRoutes from './payroll.routes';
import analyticsRoutes from './analytics.routes';
import settingsRoutes from './settings.routes';
import hrIntegrationRoutes from './hr-integration.routes';

const router = Router();

/**
 * HR Module Routes
 * Base path: /api/v1/hr
 */

// Employee Management
router.use('/employees', employeeRoutes);

// Talent Acquisition & Recruitment
router.use('/recruitment', talentAcquisitionRoutes);

// Performance Management
router.use('/performance', performanceRoutes);

// Compensation & Benefits
router.use('/compensation', compensationRoutes);

// Time & Attendance
router.use('/time-attendance', timeAttendanceRoutes);

// Learning & Development
router.use('/learning', learningDevelopmentRoutes);

// Employee Engagement
router.use('/engagement', employeeEngagementRoutes);

// Benefits Administration
router.use('/benefits', benefitsRoutes);

// Employee Self-Service Portal
router.use('/self-service', employeeSelfServiceRoutes);

// Exit Management
router.use('/exit', exitManagementRoutes);

// Payroll Management
router.use('/payroll', payrollRoutes);

// HR Analytics & Reports
router.use('/analytics', analyticsRoutes);

// HR Settings & Configuration
router.use('/settings', settingsRoutes);

// HR Cross-Module Integrations
router.use('/integrations', hrIntegrationRoutes);

/**
 * HR Module Health Check
 * GET /api/v1/hr/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    module: 'HR',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      employeeManagement: 'operational',
      talentAcquisition: 'operational',
      performance: 'operational',
      compensation: 'operational',
      timeAttendance: 'operational',
      learningDevelopment: 'operational',
      employeeEngagement: 'operational',
      benefitsAdministration: 'operational',
      employeeSelfService: 'operational',
      exitManagement: 'operational',
      payroll: 'operational',
      hrAnalytics: 'operational',
      hrSettings: 'operational',
      crossModuleIntegrations: 'operational'
    }
  });
});

/**
 * HR Module Information
 * GET /api/v1/hr/info
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    module: {
      name: 'Human Resource Management',
      version: '1.0.0',
      description: 'Comprehensive AI-powered HR ERP system',
      author: 'Industry 5.0 ERP Team',
      features: [
        'Employee Management',
        'Talent Acquisition (ATS)',
        'Performance Management',
        'Compensation & Benefits',
        'Learning & Development',
        'Time & Attendance',
        'Payroll Management',
        'Employee Engagement',
        'Exit Management',
        'AI-Powered Analytics',
        'Digital Employee Experience'
      ],
      endpoints: {
        employees: '/api/v1/hr/employees',
        recruitment: '/api/v1/hr/recruitment',
        performance: '/api/v1/hr/performance',
        compensation: '/api/v1/hr/compensation',
        timeAttendance: '/api/v1/hr/time-attendance',
        learning: '/api/v1/hr/learning',
        engagement: '/api/v1/hr/engagement',
        benefits: '/api/v1/hr/benefits',
        selfService: '/api/v1/hr/self-service',
        exit: '/api/v1/hr/exit',
        payroll: '/api/v1/hr/payroll',
        analytics: '/api/v1/hr/analytics',
        settings: '/api/v1/hr/settings',
        integrations: '/api/v1/hr/integrations'
      },
      documentation: '/api/v1/hr/docs',
      support: {
        email: 'hr-support@industry50.com',
        documentation: 'https://docs.industry50.com/hr',
        status: 'https://status.industry50.com'
      }
    }
  });
});

export default router;
