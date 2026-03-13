// Industry 5.0 ERP Backend - Time & Attendance Management Routes
// Advanced time tracking with biometric integration, shift management, AI analytics, and quantum processing
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Router } from 'express';
import { TimeAttendanceController } from '../controllers/time-attendance.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const timeAttendanceController = new TimeAttendanceController();

/**
 * Time & Attendance Management Routes
 * Base path: /api/v1/hr/time-attendance
 */

// Authentication middleware
router.use(AuthMiddleware.authenticate);

/**
 * Clock In/Out Management
 */

// Employee clock in
// POST /api/v1/hr/time-attendance/clock-in
router.post('/clock-in', 
  AuthMiddleware.requirePermissions(['hr:attendance:clock', 'hr:employee:self']),
  timeAttendanceController.clockIn
);

// Employee clock out
// POST /api/v1/hr/time-attendance/clock-out
router.post('/clock-out', 
  AuthMiddleware.requirePermissions(['hr:attendance:clock', 'hr:employee:self']),
  timeAttendanceController.clockOut
);

// Break start
// POST /api/v1/hr/time-attendance/break-start
router.post('/break-start', 
  AuthMiddleware.requirePermissions(['hr:attendance:clock', 'hr:employee:self']),
  timeAttendanceController.startBreak
);

// Break end
// POST /api/v1/hr/time-attendance/break-end
router.post('/break-end', 
  AuthMiddleware.requirePermissions(['hr:attendance:clock', 'hr:employee:self']),
  timeAttendanceController.endBreak
);

// Get current attendance status
// GET /api/v1/hr/time-attendance/status/:employeeId
router.get('/status/:employeeId', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getAttendanceStatus
);

/**
 * Attendance Records Management
 */

// Get attendance records
// GET /api/v1/hr/time-attendance/records?employeeId=123&startDate=2024-01-01&endDate=2024-01-31
router.get('/records', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getAttendanceRecords
);

// Get employee attendance records (self-service)
// GET /api/v1/hr/time-attendance/employees/:employeeId/records
router.get('/employees/:employeeId/records', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getEmployeeAttendanceRecords
);

// Create manual attendance record
// POST /api/v1/hr/time-attendance/records
router.post('/records', 
  AuthMiddleware.requirePermissions(['hr:attendance:create']),
  timeAttendanceController.createAttendanceRecord
);

// Update attendance record
// PUT /api/v1/hr/time-attendance/records/:id
router.put('/records/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:update']),
  timeAttendanceController.updateAttendanceRecord
);

// Delete attendance record
// DELETE /api/v1/hr/time-attendance/records/:id
router.delete('/records/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:delete']),
  timeAttendanceController.deleteAttendanceRecord
);

// Approve/Reject attendance record
// POST /api/v1/hr/time-attendance/records/:id/approve
router.post('/records/:id/approve', 
  AuthMiddleware.requirePermissions(['hr:attendance:approve']),
  timeAttendanceController.approveAttendanceRecord
);

/**
 * Shift Management
 */

// Get shift schedules
// GET /api/v1/hr/time-attendance/shifts?departmentId=123&date=2024-01-15
router.get('/shifts', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getShiftSchedules
);

// Create shift schedule
// POST /api/v1/hr/time-attendance/shifts
router.post('/shifts', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.createShiftSchedule
);

// Update shift schedule
// PUT /api/v1/hr/time-attendance/shifts/:id
router.put('/shifts/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.updateShiftSchedule
);

// Delete shift schedule
// DELETE /api/v1/hr/time-attendance/shifts/:id
router.delete('/shifts/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.deleteShiftSchedule
);

// Get employee shift assignments
// GET /api/v1/hr/time-attendance/employees/:employeeId/shifts
router.get('/employees/:employeeId/shifts', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getEmployeeShifts
);

// Assign employee to shift
// POST /api/v1/hr/time-attendance/employees/:employeeId/shifts
router.post('/employees/:employeeId/shifts', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.assignEmployeeToShift
);

/**
 * Leave Management Integration
 */

// Submit leave request
// POST /api/v1/hr/time-attendance/leaves
router.post('/leaves', 
  AuthMiddleware.requirePermissions(['hr:attendance:leave', 'hr:employee:self']),
  timeAttendanceController.submitLeaveRequest
);

// Get leave requests
// GET /api/v1/hr/time-attendance/leaves?employeeId=123&status=pending
router.get('/leaves', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getLeaveRequests
);

// Get employee leave requests (self-service)
// GET /api/v1/hr/time-attendance/employees/:employeeId/leaves
router.get('/employees/:employeeId/leaves', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getEmployeeLeaveRequests
);

// Update leave request
// PUT /api/v1/hr/time-attendance/leaves/:id
router.put('/leaves/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:leave', 'hr:employee:self']),
  timeAttendanceController.updateLeaveRequest
);

// Approve/Reject leave request
// POST /api/v1/hr/time-attendance/leaves/:id/approve
router.post('/leaves/:id/approve', 
  AuthMiddleware.requirePermissions(['hr:attendance:approve']),
  timeAttendanceController.approveLeaveRequest
);

// Cancel leave request
// POST /api/v1/hr/time-attendance/leaves/:id/cancel
router.post('/leaves/:id/cancel', 
  AuthMiddleware.requirePermissions(['hr:attendance:leave', 'hr:employee:self']),
  timeAttendanceController.cancelLeaveRequest
);

// Get leave balance
// GET /api/v1/hr/time-attendance/employees/:employeeId/leave-balance
router.get('/employees/:employeeId/leave-balance', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getLeaveBalance
);

/**
 * Overtime Management
 */

// Request overtime
// POST /api/v1/hr/time-attendance/overtime
router.post('/overtime', 
  AuthMiddleware.requirePermissions(['hr:attendance:overtime', 'hr:employee:self']),
  timeAttendanceController.requestOvertime
);

// Get overtime records
// GET /api/v1/hr/time-attendance/overtime?employeeId=123&period=2024-01
router.get('/overtime', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getOvertimeRecords
);

// Approve overtime request
// POST /api/v1/hr/time-attendance/overtime/:id/approve
router.post('/overtime/:id/approve', 
  AuthMiddleware.requirePermissions(['hr:attendance:approve']),
  timeAttendanceController.approveOvertimeRequest
);

// Get employee overtime summary
// GET /api/v1/hr/time-attendance/employees/:employeeId/overtime-summary
router.get('/employees/:employeeId/overtime-summary', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getEmployeeOvertimeSummary
);

/**
 * Biometric Integration
 */

// Register biometric template
// POST /api/v1/hr/time-attendance/biometric/register
router.post('/biometric/register', 
  AuthMiddleware.requirePermissions(['hr:attendance:biometric']),
  timeAttendanceController.registerBiometric
);

// Verify biometric attendance
// POST /api/v1/hr/time-attendance/biometric/verify
router.post('/biometric/verify', 
  timeAttendanceController.verifyBiometricAttendance
);

// Get biometric devices status
// GET /api/v1/hr/time-attendance/biometric/devices
router.get('/biometric/devices', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.getBiometricDevices
);

// Sync biometric data
// POST /api/v1/hr/time-attendance/biometric/sync
router.post('/biometric/sync', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.syncBiometricData
);

/**
 * Geofencing & Location Tracking
 */

// Set geofence boundaries
// POST /api/v1/hr/time-attendance/geofence
router.post('/geofence', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.setGeofence
);

// Get geofence settings
// GET /api/v1/hr/time-attendance/geofence/:organizationId
router.get('/geofence/:organizationId', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getGeofence
);

// Clock in with location
// POST /api/v1/hr/time-attendance/clock-in-location
router.post('/clock-in-location', 
  AuthMiddleware.requirePermissions(['hr:attendance:clock', 'hr:employee:self']),
  timeAttendanceController.clockInWithLocation
);

// Get location-based attendance reports
// GET /api/v1/hr/time-attendance/location-reports
router.get('/location-reports', 
  AuthMiddleware.requirePermissions(['hr:attendance:reports']),
  timeAttendanceController.getLocationBasedReports
);

/**
 * Compliance & Policies
 */

// Get attendance policies
// GET /api/v1/hr/time-attendance/policies
router.get('/policies', 
  AuthMiddleware.requirePermissions(['hr:attendance:read']),
  timeAttendanceController.getAttendancePolicies
);

// Create attendance policy
// POST /api/v1/hr/time-attendance/policies
router.post('/policies', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.createAttendancePolicy
);

// Update attendance policy
// PUT /api/v1/hr/time-attendance/policies/:id
router.put('/policies/:id', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.updateAttendancePolicy
);

// Get compliance violations
// GET /api/v1/hr/time-attendance/violations?employeeId=123&type=late
router.get('/violations', 
  AuthMiddleware.requirePermissions(['hr:attendance:reports']),
  timeAttendanceController.getComplianceViolations
);

/**
 * Reports & Analytics
 */

// Generate attendance summary report
// GET /api/v1/hr/time-attendance/reports/summary
router.get('/reports/summary', 
  AuthMiddleware.requirePermissions(['hr:attendance:reports']),
  timeAttendanceController.getAttendanceSummaryReport
);

// Generate departmental attendance report
// GET /api/v1/hr/time-attendance/reports/department/:departmentId
router.get('/reports/department/:departmentId', 
  AuthMiddleware.requirePermissions(['hr:attendance:reports']),
  timeAttendanceController.getDepartmentalAttendanceReport
);

// Generate tardiness report
// GET /api/v1/hr/time-attendance/reports/tardiness
router.get('/reports/tardiness', 
  AuthMiddleware.requirePermissions(['hr:attendance:reports']),
  timeAttendanceController.getTardinessReport
);

// Generate productivity insights
// GET /api/v1/hr/time-attendance/analytics/productivity
router.get('/analytics/productivity', 
  AuthMiddleware.requirePermissions(['hr:attendance:analytics']),
  timeAttendanceController.getProductivityInsights
);

/**
 * AI-Powered Features
 */

// Predict attendance patterns
// GET /api/v1/hr/time-attendance/ai/predict-patterns
router.get('/ai/predict-patterns', 
  AuthMiddleware.requirePermissions(['hr:attendance:analytics']),
  timeAttendanceController.predictAttendancePatterns
);

// Detect anomalous behavior
// GET /api/v1/hr/time-attendance/ai/anomaly-detection
router.get('/ai/anomaly-detection', 
  AuthMiddleware.requirePermissions(['hr:attendance:analytics']),
  timeAttendanceController.detectAttendanceAnomalies
);

// Get work-life balance insights
// GET /api/v1/hr/time-attendance/ai/work-life-balance/:employeeId
router.get('/ai/work-life-balance/:employeeId', 
  AuthMiddleware.requirePermissions(['hr:attendance:analytics', 'hr:employee:self']),
  timeAttendanceController.getWorkLifeBalanceInsights
);

// Generate optimal shift recommendations
// GET /api/v1/hr/time-attendance/ai/shift-optimization
router.get('/ai/shift-optimization', 
  AuthMiddleware.requirePermissions(['hr:attendance:analytics']),
  timeAttendanceController.getShiftOptimizationRecommendations
);

/**
 * Blockchain Integration
 */

// Verify attendance record on blockchain
// POST /api/v1/hr/time-attendance/blockchain/verify/:recordId
router.post('/blockchain/verify/:recordId', 
  AuthMiddleware.requirePermissions(['hr:attendance:blockchain']),
  timeAttendanceController.verifyAttendanceOnBlockchain
);

// Get blockchain attendance history
// GET /api/v1/hr/time-attendance/blockchain/history/:employeeId
router.get('/blockchain/history/:employeeId', 
  AuthMiddleware.requirePermissions(['hr:attendance:blockchain']),
  timeAttendanceController.getBlockchainAttendanceHistory
);

/**
 * Mobile App Integration
 */

// Mobile check-in with selfie verification
// POST /api/v1/hr/time-attendance/mobile/check-in
router.post('/mobile/check-in', 
  AuthMiddleware.requirePermissions(['hr:attendance:mobile']),
  timeAttendanceController.mobileCheckIn
);

// Get mobile attendance dashboard
// GET /api/v1/hr/time-attendance/mobile/dashboard/:employeeId
router.get('/mobile/dashboard/:employeeId', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getMobileAttendanceDashboard
);

/**
 * Integration & Import/Export
 */

// Import attendance data from CSV/Excel
// POST /api/v1/hr/time-attendance/import
router.post('/import', 
  AuthMiddleware.requirePermissions(['hr:attendance:import']),
  timeAttendanceController.importAttendanceData
);

// Export attendance data
// GET /api/v1/hr/time-attendance/export?format=excel&period=2024-01
router.get('/export', 
  AuthMiddleware.requirePermissions(['hr:attendance:export']),
  timeAttendanceController.exportAttendanceData
);

// Sync with external time clock systems
// POST /api/v1/hr/time-attendance/sync/external
router.post('/sync/external', 
  AuthMiddleware.requirePermissions(['hr:attendance:admin']),
  timeAttendanceController.syncWithExternalSystems
);

/**
 * Notifications & Alerts
 */

// Get attendance notifications
// GET /api/v1/hr/time-attendance/notifications/:employeeId
router.get('/notifications/:employeeId', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.getAttendanceNotifications
);

// Mark notification as read
// PUT /api/v1/hr/time-attendance/notifications/:id/read
router.put('/notifications/:id/read', 
  AuthMiddleware.requirePermissions(['hr:attendance:read', 'hr:employee:self']),
  timeAttendanceController.markNotificationAsRead
);

// Set attendance alert preferences
// POST /api/v1/hr/time-attendance/alert-preferences
router.post('/alert-preferences', 
  AuthMiddleware.requirePermissions(['hr:attendance:settings', 'hr:employee:self']),
  timeAttendanceController.setAttendanceAlertPreferences
);

/**
 * Health Check
 */
router.get('/health', timeAttendanceController.healthCheck);

export default router;
