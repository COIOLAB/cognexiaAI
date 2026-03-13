// Industry 5.0 ERP Backend - Time & Attendance Management Controller
// Advanced time tracking with biometric integration, shift management, AI analytics, and quantum processing
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { TimeAttendanceService } from '../services/time-attendance.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class TimeAttendanceController {
  private timeAttendanceService: TimeAttendanceService;

  constructor() {
    this.timeAttendanceService = new TimeAttendanceService();
  }

  /**
   * Employee clock in
   * POST /api/v1/hr/time-attendance/clock-in
   */
  clockIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, location, deviceId, biometricData } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.clockIn(
        finalEmployeeId as UUID,
        {
          location,
          deviceId,
          biometricData,
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during clock in',
        error: error.message
      });
    }
  };

  /**
   * Employee clock out
   * POST /api/v1/hr/time-attendance/clock-out
   */
  clockOut = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, location, deviceId, notes } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.clockOut(
        finalEmployeeId as UUID,
        {
          location,
          deviceId,
          notes,
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during clock out',
        error: error.message
      });
    }
  };

  /**
   * Start break
   * POST /api/v1/hr/time-attendance/break-start
   */
  startBreak = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, breakType, notes } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.startBreak(
        finalEmployeeId as UUID,
        breakType || 'general',
        notes
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while starting break',
        error: error.message
      });
    }
  };

  /**
   * End break
   * POST /api/v1/hr/time-attendance/break-end
   */
  endBreak = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, notes } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.endBreak(
        finalEmployeeId as UUID,
        notes
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while ending break',
        error: error.message
      });
    }
  };

  /**
   * Get current attendance status
   * GET /api/v1/hr/time-attendance/status/:employeeId
   */
  getAttendanceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access attendance status',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getAttendanceStatus(
        employeeId as UUID
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching attendance status',
        error: error.message
      });
    }
  };

  /**
   * Get attendance records
   * GET /api/v1/hr/time-attendance/records
   */
  getAttendanceRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        departmentId,
        startDate,
        endDate,
        status,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getAttendanceRecords(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching attendance records',
        error: error.message
      });
    }
  };

  /**
   * Get employee attendance records (self-service)
   * GET /api/v1/hr/time-attendance/employees/:employeeId/records
   */
  getEmployeeAttendanceRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate, limit = 30, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access attendance records',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getEmployeeAttendanceRecords(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee attendance records',
        error: error.message
      });
    }
  };

  /**
   * Create manual attendance record
   * POST /api/v1/hr/time-attendance/records
   */
  createAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const recordData = req.body;

      if (!recordData.employeeId || !recordData.date) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.createManualAttendanceRecord({
        ...recordData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating attendance record',
        error: error.message
      });
    }
  };

  /**
   * Update attendance record
   * PUT /api/v1/hr/time-attendance/records/:id
   */
  updateAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Attendance record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.updateAttendanceRecord(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating attendance record',
        error: error.message
      });
    }
  };

  /**
   * Delete attendance record
   * DELETE /api/v1/hr/time-attendance/records/:id
   */
  deleteAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Attendance record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.deleteAttendanceRecord(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting attendance record',
        error: error.message
      });
    }
  };

  /**
   * Approve/Reject attendance record
   * POST /api/v1/hr/time-attendance/records/:id/approve
   */
  approveAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      if (!id || !action) {
        res.status(400).json({
          success: false,
          message: 'Record ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.approveAttendanceRecord(
        id as UUID,
        action,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving attendance record',
        error: error.message
      });
    }
  };

  /**
   * Get shift schedules
   * GET /api/v1/hr/time-attendance/shifts
   */
  getShiftSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        departmentId,
        date,
        organizationId,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        departmentId: departmentId as UUID,
        date: date ? new Date(date as string) : undefined,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getShiftSchedules(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching shift schedules',
        error: error.message
      });
    }
  };

  /**
   * Create shift schedule
   * POST /api/v1/hr/time-attendance/shifts
   */
  createShiftSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const shiftData = req.body;

      const result: ServiceResponse<any> = await this.timeAttendanceService.createShiftSchedule({
        ...shiftData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating shift schedule',
        error: error.message
      });
    }
  };

  /**
   * Update shift schedule
   * PUT /api/v1/hr/time-attendance/shifts/:id
   */
  updateShiftSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Shift schedule ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.updateShiftSchedule(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating shift schedule',
        error: error.message
      });
    }
  };

  /**
   * Delete shift schedule
   * DELETE /api/v1/hr/time-attendance/shifts/:id
   */
  deleteShiftSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Shift schedule ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.deleteShiftSchedule(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting shift schedule',
        error: error.message
      });
    }
  };

  /**
   * Get employee shift assignments
   * GET /api/v1/hr/time-attendance/employees/:employeeId/shifts
   */
  getEmployeeShifts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate, limit = 30, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access employee shifts',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getEmployeeShifts(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee shifts',
        error: error.message
      });
    }
  };

  /**
   * Assign employee to shift
   * POST /api/v1/hr/time-attendance/employees/:employeeId/shifts
   */
  assignEmployeeToShift = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { shiftId, startDate, endDate, notes } = req.body;

      if (!employeeId || !shiftId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID and Shift ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.assignEmployeeToShift(
        employeeId as UUID,
        shiftId as UUID,
        {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          notes,
          assignedBy: req.user?.id
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while assigning employee to shift',
        error: error.message
      });
    }
  };

  /**
   * Submit leave request
   * POST /api/v1/hr/time-attendance/leaves
   */
  submitLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const leaveData = req.body;

      if (!leaveData.employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = leaveData.employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.submitLeaveRequest({
        ...leaveData,
        employeeId: finalEmployeeId,
        submittedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting leave request',
        error: error.message
      });
    }
  };

  /**
   * Get leave requests
   * GET /api/v1/hr/time-attendance/leaves
   */
  getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        status,
        leaveType,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        status: status as string,
        leaveType: leaveType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getLeaveRequests(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching leave requests',
        error: error.message
      });
    }
  };

  /**
   * Get employee leave requests (self-service)
   * GET /api/v1/hr/time-attendance/employees/:employeeId/leaves
   */
  getEmployeeLeaveRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { status, year, limit = 20, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access leave requests',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        status: status as string,
        year: year ? parseInt(year as string) : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getEmployeeLeaveRequests(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee leave requests',
        error: error.message
      });
    }
  };

  /**
   * Update leave request
   * PUT /api/v1/hr/time-attendance/leaves/:id
   */
  updateLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Leave request ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.updateLeaveRequest(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating leave request',
        error: error.message
      });
    }
  };

  /**
   * Approve/Reject leave request
   * POST /api/v1/hr/time-attendance/leaves/:id/approve
   */
  approveLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      if (!id || !action) {
        res.status(400).json({
          success: false,
          message: 'Leave request ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.approveLeaveRequest(
        id as UUID,
        action,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving leave request',
        error: error.message
      });
    }
  };

  /**
   * Cancel leave request
   * POST /api/v1/hr/time-attendance/leaves/:id/cancel
   */
  cancelLeaveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Leave request ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.cancelLeaveRequest(
        id as UUID,
        req.user?.id as UUID,
        reason
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while canceling leave request',
        error: error.message
      });
    }
  };

  /**
   * Get leave balance
   * GET /api/v1/hr/time-attendance/employees/:employeeId/leave-balance
   */
  getLeaveBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access leave balance',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getLeaveBalance(
        employeeId as UUID,
        year ? parseInt(year as string) : undefined
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching leave balance',
        error: error.message
      });
    }
  };

  /**
   * Request overtime
   * POST /api/v1/hr/time-attendance/overtime
   */
  requestOvertime = async (req: Request, res: Response): Promise<void> => {
    try {
      const overtimeData = req.body;

      if (!overtimeData.employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = overtimeData.employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.requestOvertime({
        ...overtimeData,
        employeeId: finalEmployeeId,
        requestedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while requesting overtime',
        error: error.message
      });
    }
  };

  /**
   * Get overtime records
   * GET /api/v1/hr/time-attendance/overtime
   */
  getOvertimeRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        period,
        status,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        period: period as string,
        status: status as string
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getOvertimeRecords(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching overtime records',
        error: error.message
      });
    }
  };

  /**
   * Approve overtime request
   * POST /api/v1/hr/time-attendance/overtime/:id/approve
   */
  approveOvertimeRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      if (!id || !action) {
        res.status(400).json({
          success: false,
          message: 'Overtime request ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.approveOvertimeRequest(
        id as UUID,
        action,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving overtime request',
        error: error.message
      });
    }
  };

  /**
   * Get employee overtime summary
   * GET /api/v1/hr/time-attendance/employees/:employeeId/overtime-summary
   */
  getEmployeeOvertimeSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { period } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access overtime summary',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getEmployeeOvertimeSummary(
        employeeId as UUID,
        period as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching overtime summary',
        error: error.message
      });
    }
  };

  /**
   * Register biometric template
   * POST /api/v1/hr/time-attendance/biometric/register
   */
  registerBiometric = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, biometricType, template, deviceId } = req.body;

      if (!employeeId || !biometricType || !template) {
        res.status(400).json({
          success: false,
          message: 'Employee ID, biometric type, and template are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.registerBiometric(
        employeeId as UUID,
        biometricType,
        template,
        deviceId,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while registering biometric',
        error: error.message
      });
    }
  };

  /**
   * Verify biometric attendance
   * POST /api/v1/hr/time-attendance/biometric/verify
   */
  verifyBiometricAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { biometricData, deviceId, action } = req.body;

      if (!biometricData || !action) {
        res.status(400).json({
          success: false,
          message: 'Biometric data and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.verifyBiometricAttendance(
        biometricData,
        deviceId,
        action
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying biometric attendance',
        error: error.message
      });
    }
  };

  /**
   * Get biometric devices status
   * GET /api/v1/hr/time-attendance/biometric/devices
   */
  getBiometricDevices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, status } = req.query;

      const result: ServiceResponse<any> = await this.timeAttendanceService.getBiometricDevices(
        organizationId as UUID,
        status as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching biometric devices',
        error: error.message
      });
    }
  };

  /**
   * Sync biometric data
   * POST /api/v1/hr/time-attendance/biometric/sync
   */
  syncBiometricData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { deviceId, syncType } = req.body;

      const result: ServiceResponse<any> = await this.timeAttendanceService.syncBiometricData(
        deviceId,
        syncType || 'full',
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while syncing biometric data',
        error: error.message
      });
    }
  };

  /**
   * Set geofence boundaries
   * POST /api/v1/hr/time-attendance/geofence
   */
  setGeofence = async (req: Request, res: Response): Promise<void> => {
    try {
      const geofenceData = req.body;

      const result: ServiceResponse<any> = await this.timeAttendanceService.setGeofence({
        ...geofenceData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while setting geofence',
        error: error.message
      });
    }
  };

  /**
   * Get geofence settings
   * GET /api/v1/hr/time-attendance/geofence/:organizationId
   */
  getGeofence = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.params;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getGeofence(
        organizationId as UUID
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching geofence settings',
        error: error.message
      });
    }
  };

  /**
   * Clock in with location
   * POST /api/v1/hr/time-attendance/clock-in-location
   */
  clockInWithLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, latitude, longitude, accuracy, address } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      if (!latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Location coordinates are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.clockInWithLocation(
        finalEmployeeId as UUID,
        {
          latitude,
          longitude,
          accuracy,
          address,
          timestamp: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during location-based clock in',
        error: error.message
      });
    }
  };

  /**
   * Get location-based attendance reports
   * GET /api/v1/hr/time-attendance/location-reports
   */
  getLocationBasedReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        reportType = 'summary'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        reportType: reportType as string
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getLocationBasedReports(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating location-based reports',
        error: error.message
      });
    }
  };

  /**
   * Get attendance policies
   * GET /api/v1/hr/time-attendance/policies
   */
  getAttendancePolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, status } = req.query;

      const result: ServiceResponse<any> = await this.timeAttendanceService.getAttendancePolicies(
        organizationId as UUID,
        status as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching attendance policies',
        error: error.message
      });
    }
  };

  /**
   * Create attendance policy
   * POST /api/v1/hr/time-attendance/policies
   */
  createAttendancePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const policyData = req.body;

      const result: ServiceResponse<any> = await this.timeAttendanceService.createAttendancePolicy({
        ...policyData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating attendance policy',
        error: error.message
      });
    }
  };

  /**
   * Update attendance policy
   * PUT /api/v1/hr/time-attendance/policies/:id
   */
  updateAttendancePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Policy ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.updateAttendancePolicy(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating attendance policy',
        error: error.message
      });
    }
  };

  /**
   * Get compliance violations
   * GET /api/v1/hr/time-attendance/violations
   */
  getComplianceViolations = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        type,
        severity,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        employeeId: employeeId as UUID,
        type: type as string,
        severity: severity as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getComplianceViolations(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching compliance violations',
        error: error.message
      });
    }
  };

  /**
   * Generate attendance summary report
   * GET /api/v1/hr/time-attendance/reports/summary
   */
  getAttendanceSummaryReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        format = 'json'
      } = req.query;

      if (!organizationId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Organization ID, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getAttendanceSummaryReport(
        organizationId as UUID,
        new Date(startDate as string),
        new Date(endDate as string),
        departmentId as UUID,
        format as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating attendance summary report',
        error: error.message
      });
    }
  };

  /**
   * Generate departmental attendance report
   * GET /api/v1/hr/time-attendance/reports/department/:departmentId
   */
  getDepartmentalAttendanceReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departmentId } = req.params;
      const { startDate, endDate, metrics = 'all' } = req.query;

      if (!departmentId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Department ID, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getDepartmentalAttendanceReport(
        departmentId as UUID,
        new Date(startDate as string),
        new Date(endDate as string),
        metrics as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating departmental attendance report',
        error: error.message
      });
    }
  };

  /**
   * Generate tardiness report
   * GET /api/v1/hr/time-attendance/reports/tardiness
   */
  getTardinessReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        threshold = 15
      } = req.query;

      if (!organizationId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Organization ID, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getTardinessReport(
        organizationId as UUID,
        new Date(startDate as string),
        new Date(endDate as string),
        departmentId as UUID,
        parseInt(threshold as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating tardiness report',
        error: error.message
      });
    }
  };

  /**
   * Generate productivity insights
   * GET /api/v1/hr/time-attendance/analytics/productivity
   */
  getProductivityInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        period = 'month',
        includeComparison = true
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getProductivityInsights(
        organizationId as UUID,
        departmentId as UUID,
        period as string,
        includeComparison === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating productivity insights',
        error: error.message
      });
    }
  };

  /**
   * Predict attendance patterns
   * GET /api/v1/hr/time-attendance/ai/predict-patterns
   */
  predictAttendancePatterns = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        employeeId,
        period = '30d',
        includeFactors = true
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.predictAttendancePatterns(
        organizationId as UUID,
        employeeId as UUID,
        period as string,
        includeFactors === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while predicting attendance patterns',
        error: error.message
      });
    }
  };

  /**
   * Detect anomalous behavior
   * GET /api/v1/hr/time-attendance/ai/anomaly-detection
   */
  detectAttendanceAnomalies = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        employeeId,
        threshold = 0.8,
        period = '90d'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.detectAttendanceAnomalies(
        organizationId as UUID,
        employeeId as UUID,
        parseFloat(threshold as string),
        period as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while detecting attendance anomalies',
        error: error.message
      });
    }
  };

  /**
   * Get work-life balance insights
   * GET /api/v1/hr/time-attendance/ai/work-life-balance/:employeeId
   */
  getWorkLifeBalanceInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { period = '3m', includeRecommendations = true } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:analytics')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access work-life balance insights',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getWorkLifeBalanceInsights(
        employeeId as UUID,
        period as string,
        includeRecommendations === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating work-life balance insights',
        error: error.message
      });
    }
  };

  /**
   * Generate optimal shift recommendations
   * GET /api/v1/hr/time-attendance/ai/shift-optimization
   */
  getShiftOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        criteria = 'efficiency',
        period = '30d'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getShiftOptimizationRecommendations(
        organizationId as UUID,
        departmentId as UUID,
        criteria as string,
        period as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating shift optimization recommendations',
        error: error.message
      });
    }
  };

  /**
   * Verify attendance record on blockchain
   * POST /api/v1/hr/time-attendance/blockchain/verify/:recordId
   */
  verifyAttendanceOnBlockchain = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;

      if (!recordId) {
        res.status(400).json({
          success: false,
          message: 'Attendance record ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.verifyAttendanceOnBlockchain(
        recordId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying attendance on blockchain',
        error: error.message
      });
    }
  };

  /**
   * Get blockchain attendance history
   * GET /api/v1/hr/time-attendance/blockchain/history/:employeeId
   */
  getBlockchainAttendanceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getBlockchainAttendanceHistory(
        employeeId as UUID,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching blockchain attendance history',
        error: error.message
      });
    }
  };

  /**
   * Mobile check-in with selfie verification
   * POST /api/v1/hr/time-attendance/mobile/check-in
   */
  mobileCheckIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        employeeId,
        location,
        selfieData,
        deviceInfo,
        action = 'clock_in'
      } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      const result: ServiceResponse<any> = await this.timeAttendanceService.mobileCheckIn(
        finalEmployeeId as UUID,
        {
          location,
          selfieData,
          deviceInfo,
          action,
          timestamp: new Date()
        }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during mobile check-in',
        error: error.message
      });
    }
  };

  /**
   * Get mobile attendance dashboard
   * GET /api/v1/hr/time-attendance/mobile/dashboard/:employeeId
   */
  getMobileAttendanceDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { period = 'month' } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access mobile attendance dashboard',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.getMobileAttendanceDashboard(
        employeeId as UUID,
        period as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching mobile attendance dashboard',
        error: error.message
      });
    }
  };

  /**
   * Import attendance data from CSV/Excel
   * POST /api/v1/hr/time-attendance/import
   */
  importAttendanceData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, importType, organizationId } = req.body;

      if (!file || !importType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'File, import type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.importAttendanceData(
        file,
        importType,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing attendance data',
        error: error.message
      });
    }
  };

  /**
   * Export attendance data
   * GET /api/v1/hr/time-attendance/export
   */
  exportAttendanceData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format,
        organizationId,
        departmentId,
        startDate,
        endDate,
        employeeIds
      } = req.query;

      if (!format || !organizationId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Format, organization ID, start date, and end date are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        employeeIds: employeeIds ? (employeeIds as string).split(',') : undefined
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.exportAttendanceData(
        format as string,
        filters
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="attendance-export.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting attendance data',
        error: error.message
      });
    }
  };

  /**
   * Sync with external time clock systems
   * POST /api/v1/hr/time-attendance/sync/external
   */
  syncWithExternalSystems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { systemType, syncConfig, organizationId } = req.body;

      if (!systemType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'System type and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.syncWithExternalSystems(
        systemType,
        syncConfig,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while syncing with external systems',
        error: error.message
      });
    }
  };

  /**
   * Get attendance notifications
   * GET /api/v1/hr/time-attendance/notifications/:employeeId
   */
  getAttendanceNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { status, type, limit = 20, offset = 0 } = req.query;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check access permissions
      if (req.user?.id !== employeeId && !req.user?.permissions?.includes('hr:attendance:read')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access attendance notifications',
          error: 'FORBIDDEN'
        });
        return;
      }

      const filters = {
        status: status as string,
        type: type as string
      };

      const result: ServiceResponse<any> = await this.timeAttendanceService.getAttendanceNotifications(
        employeeId as UUID,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching attendance notifications',
        error: error.message
      });
    }
  };

  /**
   * Mark notification as read
   * PUT /api/v1/hr/time-attendance/notifications/:id/read
   */
  markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.markNotificationAsRead(
        id as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while marking notification as read',
        error: error.message
      });
    }
  };

  /**
   * Set attendance alert preferences
   * POST /api/v1/hr/time-attendance/alert-preferences
   */
  setAttendanceAlertPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, preferences } = req.body;

      if (!employeeId && !req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const finalEmployeeId = employeeId || req.user?.id;

      // Check access permissions
      if (req.user?.id !== finalEmployeeId && !req.user?.permissions?.includes('hr:attendance:settings')) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to set attendance alert preferences',
          error: 'FORBIDDEN'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.timeAttendanceService.setAttendanceAlertPreferences(
        finalEmployeeId as UUID,
        preferences
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while setting attendance alert preferences',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.timeAttendanceService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Time & Attendance service health check failed',
        error: error.message
      });
    }
  };
}
