// Industry 5.0 ERP Backend - HR Error Utilities
// Error handling utilities for the HR module
// Author: AI Assistant
// Date: 2024

export enum HRErrorCodes {
  // Employee Errors
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_EMPLOYEE_DATA = 'INVALID_EMPLOYEE_DATA',
  DUPLICATE_EMPLOYEE_EMAIL = 'DUPLICATE_EMPLOYEE_EMAIL',
  INVALID_MANAGER_ASSIGNMENT = 'INVALID_MANAGER_ASSIGNMENT',
  EMPLOYEE_HIERARCHY_LOOP = 'EMPLOYEE_HIERARCHY_LOOP',
  
  // Authentication and Authorization
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Talent Acquisition Errors
  REQUISITION_NOT_FOUND = 'REQUISITION_NOT_FOUND',
  INVALID_REQUISITION_DATA = 'INVALID_REQUISITION_DATA',
  INVALID_JOB_REQUISITION_DATA = 'INVALID_JOB_REQUISITION_DATA',
  REQUISITION_ALREADY_FILLED = 'REQUISITION_ALREADY_FILLED',
  
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  INVALID_APPLICATION_DATA = 'INVALID_APPLICATION_DATA',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  INVALID_APPLICATION_STATUS_TRANSITION = 'INVALID_APPLICATION_STATUS_TRANSITION',
  
  CANDIDATE_NOT_FOUND = 'CANDIDATE_NOT_FOUND',
  INVALID_CANDIDATE_DATA = 'INVALID_CANDIDATE_DATA',
  DUPLICATE_CANDIDATE_EMAIL = 'DUPLICATE_CANDIDATE_EMAIL',
  
  INTERVIEW_NOT_FOUND = 'INTERVIEW_NOT_FOUND',
  INTERVIEW_SCHEDULING_CONFLICT = 'INTERVIEW_SCHEDULING_CONFLICT',
  INVALID_INTERVIEW_DATA = 'INVALID_INTERVIEW_DATA',
  INTERVIEWER_NOT_AVAILABLE = 'INTERVIEWER_NOT_AVAILABLE',
  
  // Performance Management Errors
  PERFORMANCE_REVIEW_NOT_FOUND = 'PERFORMANCE_REVIEW_NOT_FOUND',
  INVALID_PERFORMANCE_REVIEW_DATA = 'INVALID_PERFORMANCE_REVIEW_DATA',
  INVALID_PERFORMANCE_DATA = 'INVALID_PERFORMANCE_DATA',
  REVIEW_PERIOD_OVERLAP = 'REVIEW_PERIOD_OVERLAP',
  COMPETENCY_NOT_FOUND = 'COMPETENCY_NOT_FOUND',
  
  // Compensation and Benefits Errors
  COMPENSATION_PLAN_NOT_FOUND = 'COMPENSATION_PLAN_NOT_FOUND',
  COMPENSATION_PLAN_ALREADY_EXISTS = 'COMPENSATION_PLAN_ALREADY_EXISTS',
  SALARY_STRUCTURE_NOT_FOUND = 'SALARY_STRUCTURE_NOT_FOUND',
  SALARY_STRUCTURE_OVERLAP = 'SALARY_STRUCTURE_OVERLAP',
  INVALID_COMPENSATION_DATA = 'INVALID_COMPENSATION_DATA',
  BENEFIT_PLAN_NOT_FOUND = 'BENEFIT_PLAN_NOT_FOUND',
  BENEFITS_PLAN_NOT_FOUND = 'BENEFITS_PLAN_NOT_FOUND',
  BENEFITS_PLAN_ALREADY_EXISTS = 'BENEFITS_PLAN_ALREADY_EXISTS',
  BENEFITS_ENROLLMENT_NOT_FOUND = 'BENEFITS_ENROLLMENT_NOT_FOUND',
  BENEFITS_ENROLLMENT_EXISTS = 'BENEFITS_ENROLLMENT_EXISTS',
  BENEFITS_ENROLLMENT_NOT_ELIGIBLE = 'BENEFITS_ENROLLMENT_NOT_ELIGIBLE',
  PAYROLL_PERIOD_NOT_FOUND = 'PAYROLL_PERIOD_NOT_FOUND',
  PAYROLL_RUN_NOT_FOUND = 'PAYROLL_RUN_NOT_FOUND',
  PAYROLL_PERIOD_OVERLAP = 'PAYROLL_PERIOD_OVERLAP',
  INVALID_PAYROLL_STATUS = 'INVALID_PAYROLL_STATUS',
  INVALID_PAYROLL_DATA = 'INVALID_PAYROLL_DATA',
  
  // Time and Attendance Errors
  INVALID_TIME_ENTRY = 'INVALID_TIME_ENTRY',
  TIME_ENTRY_CONFLICT = 'TIME_ENTRY_CONFLICT',
  LEAVE_REQUEST_NOT_FOUND = 'LEAVE_REQUEST_NOT_FOUND',
  INSUFFICIENT_LEAVE_BALANCE = 'INSUFFICIENT_LEAVE_BALANCE',
  ALREADY_CLOCKED_IN = 'ALREADY_CLOCKED_IN',
  NOT_CLOCKED_IN = 'NOT_CLOCKED_IN',
  LEAVE_REQUEST_OVERLAP = 'LEAVE_REQUEST_OVERLAP',
  INVALID_LEAVE_REQUEST = 'INVALID_LEAVE_REQUEST',
  
  // Learning and Development Errors
  TRAINING_PROGRAM_NOT_FOUND = 'TRAINING_PROGRAM_NOT_FOUND',
  ENROLLMENT_NOT_FOUND = 'ENROLLMENT_NOT_FOUND',
  PREREQUISITE_NOT_MET = 'PREREQUISITE_NOT_MET',
  TRAINING_CAPACITY_EXCEEDED = 'TRAINING_CAPACITY_EXCEEDED',
  
  // Exit Management Errors
  EXIT_RECORD_NOT_FOUND = 'EXIT_RECORD_NOT_FOUND',
  INVALID_EXIT_DATA = 'INVALID_EXIT_DATA',
  INVALID_EXIT_INTERVIEW_DATA = 'INVALID_EXIT_INTERVIEW_DATA',
  EXIT_INTERVIEW_NOT_FOUND = 'EXIT_INTERVIEW_NOT_FOUND',
  OFFBOARDING_CHECKLIST_NOT_FOUND = 'OFFBOARDING_CHECKLIST_NOT_FOUND',
  KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND = 'KNOWLEDGE_TRANSFER_PLAN_NOT_FOUND',
  
  // General System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  
  // AI and Analytics Errors
  AI_PROCESSING_ERROR = 'AI_PROCESSING_ERROR',
  INSUFFICIENT_DATA_FOR_ANALYSIS = 'INSUFFICIENT_DATA_FOR_ANALYSIS',
  MODEL_NOT_AVAILABLE = 'MODEL_NOT_AVAILABLE'
}

export class HRError extends Error {
  public readonly code: HRErrorCodes;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    code: HRErrorCodes,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'HRError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();

    // Ensure the stack trace is properly captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HRError);
    }
  }

  /**
   * Convert the error to a JSON object for API responses
   */
  toJSON(): Record<string, any> {
    return {
      error: true,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString()
    };
  }

  /**
   * Check if this error is a specific type
   */
  isOfType(code: HRErrorCodes): boolean {
    return this.code === code;
  }

  /**
   * Create a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case HRErrorCodes.EMPLOYEE_NOT_FOUND:
        return 'The requested employee could not be found.';
      case HRErrorCodes.DUPLICATE_EMPLOYEE_EMAIL:
        return 'An employee with this email address already exists.';
      case HRErrorCodes.UNAUTHORIZED_ACCESS:
        return 'You do not have permission to perform this action.';
      case HRErrorCodes.INVALID_EMPLOYEE_DATA:
        return 'The employee data provided is invalid or incomplete.';
      case HRErrorCodes.INTERVIEW_SCHEDULING_CONFLICT:
        return 'There is a scheduling conflict for the requested interview time.';
      case HRErrorCodes.INSUFFICIENT_LEAVE_BALANCE:
        return 'Insufficient leave balance for the requested time off.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}

/**
 * Factory functions for common HR errors
 */
export class HRErrorFactory {
  static employeeNotFound(employeeId: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.EMPLOYEE_NOT_FOUND,
      `Employee with ID ${employeeId} not found`,
      404,
      { employeeId, ...details }
    );
  }

  static duplicateEmployeeEmail(email: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.DUPLICATE_EMPLOYEE_EMAIL,
      `Employee with email ${email} already exists`,
      409,
      { email, ...details }
    );
  }

  static unauthorizedAccess(action: string, resource: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.UNAUTHORIZED_ACCESS,
      `Unauthorized to ${action} ${resource}`,
      403,
      { action, resource, ...details }
    );
  }

  static validationError(field: string, message: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.VALIDATION_ERROR,
      `Validation failed for ${field}: ${message}`,
      400,
      { field, validationMessage: message, ...details }
    );
  }

  static databaseError(operation: string, tableName: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.DATABASE_ERROR,
      `Database error during ${operation} on ${tableName}`,
      500,
      { operation, tableName, ...details }
    );
  }

  static requisitionNotFound(requisitionId: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.REQUISITION_NOT_FOUND,
      `Job requisition with ID ${requisitionId} not found`,
      404,
      { requisitionId, ...details }
    );
  }

  static applicationNotFound(applicationId: string, details?: Record<string, any>): HRError {
    return new HRError(
      HRErrorCodes.APPLICATION_NOT_FOUND,
      `Job application with ID ${applicationId} not found`,
      404,
      { applicationId, ...details }
    );
  }

  static interviewSchedulingConflict(
    interviewerId: string,
    scheduledTime: Date,
    details?: Record<string, any>
  ): HRError {
    return new HRError(
      HRErrorCodes.INTERVIEW_SCHEDULING_CONFLICT,
      `Interviewer ${interviewerId} has a scheduling conflict at ${scheduledTime.toISOString()}`,
      409,
      { interviewerId, scheduledTime: scheduledTime.toISOString(), ...details }
    );
  }
}

/**
 * Error handler middleware helper
 */
export function handleHRError(error: any): HRError {
  if (error instanceof HRError) {
    return error;
  }

  // Handle common database errors
  if (error.code === '23505') { // PostgreSQL unique constraint violation
    return new HRError(
      HRErrorCodes.VALIDATION_ERROR,
      'Duplicate entry detected',
      409,
      { originalError: error.message }
    );
  }

  if (error.code === '23503') { // PostgreSQL foreign key constraint violation
    return new HRError(
      HRErrorCodes.VALIDATION_ERROR,
      'Referenced record does not exist',
      400,
      { originalError: error.message }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return new HRError(
      HRErrorCodes.VALIDATION_ERROR,
      error.message,
      400,
      { originalError: error.message }
    );
  }

  // Default to generic error
  return new HRError(
    HRErrorCodes.DATABASE_ERROR,
    error.message || 'An unexpected error occurred',
    500,
    { originalError: error.message, stack: error.stack }
  );
}

/**
 * Error response formatter for API responses
 */
export function formatErrorResponse(error: HRError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.getUserMessage(),
      details: error.details,
      timestamp: error.timestamp.toISOString()
    }
  };
}
