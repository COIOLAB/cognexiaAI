// Industry 5.0 ERP Backend - Time & Attendance Service
// Business logic for time tracking, attendance, and leave management
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { TimeAttendanceModel } from '../models/time-attendance.model';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class TimeAttendanceService {
  private timeAttendanceModel: TimeAttendanceModel;

  constructor() {
    this.timeAttendanceModel = new TimeAttendanceModel();
  }

  async clockIn(employeeId: UUID, organizationId: UUID, location?: string): Promise<any> {
    try {
      // Check if employee already clocked in
      const activeSession = await this.timeAttendanceModel.getActiveTimeSession(employeeId);
      if (activeSession) {
        throw new HRError(HRErrorCodes.ALREADY_CLOCKED_IN, 'Employee is already clocked in', 400);
      }

      const timeEntry = await this.timeAttendanceModel.createTimeEntry(organizationId, {
        employeeId,
        clockInTime: new Date(),
        location,
        entryType: 'CLOCK_IN'
      });

      logger.info(`Employee ${employeeId} clocked in at ${timeEntry.clockInTime}`);
      return timeEntry;
    } catch (error) {
      logger.error(`Error clocking in employee ${employeeId}:`, error);
      throw error;
    }
  }

  async clockOut(employeeId: UUID, organizationId: UUID, location?: string): Promise<any> {
    try {
      const activeSession = await this.timeAttendanceModel.getActiveTimeSession(employeeId);
      if (!activeSession) {
        throw new HRError(HRErrorCodes.NOT_CLOCKED_IN, 'Employee is not clocked in', 400);
      }

      const timeEntry = await this.timeAttendanceModel.updateTimeEntry(activeSession.id, {
        clockOutTime: new Date(),
        location,
        totalHours: this.calculateHours(activeSession.clockInTime, new Date())
      });

      logger.info(`Employee ${employeeId} clocked out`);
      return timeEntry;
    } catch (error) {
      logger.error(`Error clocking out employee ${employeeId}:`, error);
      throw error;
    }
  }

  async requestLeave(organizationId: UUID, data: any): Promise<any> {
    try {
      // Validate leave request data
      this.validateLeaveRequest(data);

      // Check for overlapping leave requests
      const overlapping = await this.timeAttendanceModel.findOverlappingLeaveRequests(
        data.employeeId,
        data.startDate,
        data.endDate
      );

      if (overlapping.length > 0) {
        throw new HRError(HRErrorCodes.LEAVE_REQUEST_OVERLAP, 'Overlapping leave request exists', 400);
      }

      const leaveRequest = await this.timeAttendanceModel.createLeaveRequest(organizationId, data);
      logger.info(`Leave request created for employee ${data.employeeId}`);
      
      return leaveRequest;
    } catch (error) {
      logger.error('Error creating leave request:', error);
      throw error;
    }
  }

  async getAttendanceReport(organizationId: UUID, filters: any): Promise<any> {
    try {
      return await this.timeAttendanceModel.generateAttendanceReport(organizationId, filters);
    } catch (error) {
      logger.error('Error generating attendance report:', error);
      throw error;
    }
  }

  private calculateHours(clockIn: Date, clockOut: Date): number {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }

  private validateLeaveRequest(data: any): void {
    if (!data.employeeId || !data.startDate || !data.endDate || !data.leaveType) {
      throw new HRError(HRErrorCodes.INVALID_LEAVE_REQUEST, 'Missing required leave request data', 400);
    }

    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new HRError(HRErrorCodes.INVALID_LEAVE_REQUEST, 'End date must be after start date', 400);
    }
  }
}
