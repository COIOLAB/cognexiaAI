import { Request, Response } from 'express';
export declare class TimeAttendanceController {
    private timeAttendanceService;
    constructor();
    /**
     * Employee clock in
     * POST /api/v1/hr/time-attendance/clock-in
     */
    clockIn: (req: Request, res: Response) => Promise<void>;
    /**
     * Employee clock out
     * POST /api/v1/hr/time-attendance/clock-out
     */
    clockOut: (req: Request, res: Response) => Promise<void>;
    /**
     * Start break
     * POST /api/v1/hr/time-attendance/break-start
     */
    startBreak: (req: Request, res: Response) => Promise<void>;
    /**
     * End break
     * POST /api/v1/hr/time-attendance/break-end
     */
    endBreak: (req: Request, res: Response) => Promise<void>;
    /**
     * Get current attendance status
     * GET /api/v1/hr/time-attendance/status/:employeeId
     */
    getAttendanceStatus: (req: Request, res: Response) => Promise<void>;
    /**
     * Get attendance records
     * GET /api/v1/hr/time-attendance/records
     */
    getAttendanceRecords: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee attendance records (self-service)
     * GET /api/v1/hr/time-attendance/employees/:employeeId/records
     */
    getEmployeeAttendanceRecords: (req: Request, res: Response) => Promise<void>;
    /**
     * Create manual attendance record
     * POST /api/v1/hr/time-attendance/records
     */
    createAttendanceRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Update attendance record
     * PUT /api/v1/hr/time-attendance/records/:id
     */
    updateAttendanceRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete attendance record
     * DELETE /api/v1/hr/time-attendance/records/:id
     */
    deleteAttendanceRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Approve/Reject attendance record
     * POST /api/v1/hr/time-attendance/records/:id/approve
     */
    approveAttendanceRecord: (req: Request, res: Response) => Promise<void>;
    /**
     * Get shift schedules
     * GET /api/v1/hr/time-attendance/shifts
     */
    getShiftSchedules: (req: Request, res: Response) => Promise<void>;
    /**
     * Create shift schedule
     * POST /api/v1/hr/time-attendance/shifts
     */
    createShiftSchedule: (req: Request, res: Response) => Promise<void>;
    /**
     * Update shift schedule
     * PUT /api/v1/hr/time-attendance/shifts/:id
     */
    updateShiftSchedule: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete shift schedule
     * DELETE /api/v1/hr/time-attendance/shifts/:id
     */
    deleteShiftSchedule: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee shift assignments
     * GET /api/v1/hr/time-attendance/employees/:employeeId/shifts
     */
    getEmployeeShifts: (req: Request, res: Response) => Promise<void>;
    /**
     * Assign employee to shift
     * POST /api/v1/hr/time-attendance/employees/:employeeId/shifts
     */
    assignEmployeeToShift: (req: Request, res: Response) => Promise<void>;
    /**
     * Submit leave request
     * POST /api/v1/hr/time-attendance/leaves
     */
    submitLeaveRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Get leave requests
     * GET /api/v1/hr/time-attendance/leaves
     */
    getLeaveRequests: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee leave requests (self-service)
     * GET /api/v1/hr/time-attendance/employees/:employeeId/leaves
     */
    getEmployeeLeaveRequests: (req: Request, res: Response) => Promise<void>;
    /**
     * Update leave request
     * PUT /api/v1/hr/time-attendance/leaves/:id
     */
    updateLeaveRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Approve/Reject leave request
     * POST /api/v1/hr/time-attendance/leaves/:id/approve
     */
    approveLeaveRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Cancel leave request
     * POST /api/v1/hr/time-attendance/leaves/:id/cancel
     */
    cancelLeaveRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Get leave balance
     * GET /api/v1/hr/time-attendance/employees/:employeeId/leave-balance
     */
    getLeaveBalance: (req: Request, res: Response) => Promise<void>;
    /**
     * Request overtime
     * POST /api/v1/hr/time-attendance/overtime
     */
    requestOvertime: (req: Request, res: Response) => Promise<void>;
    /**
     * Get overtime records
     * GET /api/v1/hr/time-attendance/overtime
     */
    getOvertimeRecords: (req: Request, res: Response) => Promise<void>;
    /**
     * Approve overtime request
     * POST /api/v1/hr/time-attendance/overtime/:id/approve
     */
    approveOvertimeRequest: (req: Request, res: Response) => Promise<void>;
    /**
     * Get employee overtime summary
     * GET /api/v1/hr/time-attendance/employees/:employeeId/overtime-summary
     */
    getEmployeeOvertimeSummary: (req: Request, res: Response) => Promise<void>;
    /**
     * Register biometric template
     * POST /api/v1/hr/time-attendance/biometric/register
     */
    registerBiometric: (req: Request, res: Response) => Promise<void>;
    /**
     * Verify biometric attendance
     * POST /api/v1/hr/time-attendance/biometric/verify
     */
    verifyBiometricAttendance: (req: Request, res: Response) => Promise<void>;
    /**
     * Get biometric devices status
     * GET /api/v1/hr/time-attendance/biometric/devices
     */
    getBiometricDevices: (req: Request, res: Response) => Promise<void>;
    /**
     * Sync biometric data
     * POST /api/v1/hr/time-attendance/biometric/sync
     */
    syncBiometricData: (req: Request, res: Response) => Promise<void>;
    /**
     * Set geofence boundaries
     * POST /api/v1/hr/time-attendance/geofence
     */
    setGeofence: (req: Request, res: Response) => Promise<void>;
    /**
     * Get geofence settings
     * GET /api/v1/hr/time-attendance/geofence/:organizationId
     */
    getGeofence: (req: Request, res: Response) => Promise<void>;
    /**
     * Clock in with location
     * POST /api/v1/hr/time-attendance/clock-in-location
     */
    clockInWithLocation: (req: Request, res: Response) => Promise<void>;
    /**
     * Get location-based attendance reports
     * GET /api/v1/hr/time-attendance/location-reports
     */
    getLocationBasedReports: (req: Request, res: Response) => Promise<void>;
    /**
     * Get attendance policies
     * GET /api/v1/hr/time-attendance/policies
     */
    getAttendancePolicies: (req: Request, res: Response) => Promise<void>;
    /**
     * Create attendance policy
     * POST /api/v1/hr/time-attendance/policies
     */
    createAttendancePolicy: (req: Request, res: Response) => Promise<void>;
    /**
     * Update attendance policy
     * PUT /api/v1/hr/time-attendance/policies/:id
     */
    updateAttendancePolicy: (req: Request, res: Response) => Promise<void>;
    /**
     * Get compliance violations
     * GET /api/v1/hr/time-attendance/violations
     */
    getComplianceViolations: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate attendance summary report
     * GET /api/v1/hr/time-attendance/reports/summary
     */
    getAttendanceSummaryReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate departmental attendance report
     * GET /api/v1/hr/time-attendance/reports/department/:departmentId
     */
    getDepartmentalAttendanceReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate tardiness report
     * GET /api/v1/hr/time-attendance/reports/tardiness
     */
    getTardinessReport: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate productivity insights
     * GET /api/v1/hr/time-attendance/analytics/productivity
     */
    getProductivityInsights: (req: Request, res: Response) => Promise<void>;
    /**
     * Predict attendance patterns
     * GET /api/v1/hr/time-attendance/ai/predict-patterns
     */
    predictAttendancePatterns: (req: Request, res: Response) => Promise<void>;
    /**
     * Detect anomalous behavior
     * GET /api/v1/hr/time-attendance/ai/anomaly-detection
     */
    detectAttendanceAnomalies: (req: Request, res: Response) => Promise<void>;
    /**
     * Get work-life balance insights
     * GET /api/v1/hr/time-attendance/ai/work-life-balance/:employeeId
     */
    getWorkLifeBalanceInsights: (req: Request, res: Response) => Promise<void>;
    /**
     * Generate optimal shift recommendations
     * GET /api/v1/hr/time-attendance/ai/shift-optimization
     */
    getShiftOptimizationRecommendations: (req: Request, res: Response) => Promise<void>;
    /**
     * Verify attendance record on blockchain
     * POST /api/v1/hr/time-attendance/blockchain/verify/:recordId
     */
    verifyAttendanceOnBlockchain: (req: Request, res: Response) => Promise<void>;
    /**
     * Get blockchain attendance history
     * GET /api/v1/hr/time-attendance/blockchain/history/:employeeId
     */
    getBlockchainAttendanceHistory: (req: Request, res: Response) => Promise<void>;
    /**
     * Mobile check-in with selfie verification
     * POST /api/v1/hr/time-attendance/mobile/check-in
     */
    mobileCheckIn: (req: Request, res: Response) => Promise<void>;
    /**
     * Get mobile attendance dashboard
     * GET /api/v1/hr/time-attendance/mobile/dashboard/:employeeId
     */
    getMobileAttendanceDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * Import attendance data from CSV/Excel
     * POST /api/v1/hr/time-attendance/import
     */
    importAttendanceData: (req: Request, res: Response) => Promise<void>;
    /**
     * Export attendance data
     * GET /api/v1/hr/time-attendance/export
     */
    exportAttendanceData: (req: Request, res: Response) => Promise<void>;
    /**
     * Sync with external time clock systems
     * POST /api/v1/hr/time-attendance/sync/external
     */
    syncWithExternalSystems: (req: Request, res: Response) => Promise<void>;
    /**
     * Get attendance notifications
     * GET /api/v1/hr/time-attendance/notifications/:employeeId
     */
    getAttendanceNotifications: (req: Request, res: Response) => Promise<void>;
    /**
     * Mark notification as read
     * PUT /api/v1/hr/time-attendance/notifications/:id/read
     */
    markNotificationAsRead: (req: Request, res: Response) => Promise<void>;
    /**
     * Set attendance alert preferences
     * POST /api/v1/hr/time-attendance/alert-preferences
     */
    setAttendanceAlertPreferences: (req: Request, res: Response) => Promise<void>;
    /**
     * Health Check
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=time-attendance.controller.d.ts.map