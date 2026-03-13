// Industry 5.0 ERP Backend - Employee Utilities
// Utility functions for employee management
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { Pool } from 'pg';
import { DatabaseConnection } from '../../../database/connection';
import { EmploymentStatus, EmploymentType, Gender, MaritalStatus } from '../types';
import { logger } from '../../../utils/logger';

/**
 * Generates a unique employee number for a given organization
 * Format: EMP-{YYYY}-{NNNNNN} (e.g., EMP-2024-000001)
 */
export async function generateEmployeeNumber(organizationId: UUID): Promise<string> {
  const db: Pool = DatabaseConnection.getPool();
  const currentYear = new Date().getFullYear();
  
  try {
    // Get the next sequence number for the current year
    const query = `
      SELECT COUNT(*) + 1 as next_number 
      FROM employees 
      WHERE organization_id = $1 
      AND EXTRACT(YEAR FROM created_at) = $2
    `;
    
    const result = await db.query(query, [organizationId, currentYear]);
    const nextNumber = parseInt(result.rows[0].next_number);
    
    // Format: EMP-YYYY-NNNNNN
    const employeeNumber = `EMP-${currentYear}-${nextNumber.toString().padStart(6, '0')}`;
    
    logger.info(`Generated employee number: ${employeeNumber}`);
    return employeeNumber;
  } catch (error) {
    logger.error('Error generating employee number:', error);
    throw error;
  }
}

/**
 * Validates employee data before creation or update
 */
export function validateEmployeeData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push('First name is required and must be a non-empty string');
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.push('Last name is required and must be a non-empty string');
  }

  if (!data.workEmail || !isValidEmail(data.workEmail)) {
    errors.push('Valid work email is required');
  }

  if (!data.jobTitle || typeof data.jobTitle !== 'string' || data.jobTitle.trim().length === 0) {
    errors.push('Job title is required');
  }

  if (!data.department || typeof data.department !== 'string' || data.department.trim().length === 0) {
    errors.push('Department is required');
  }

  if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
    errors.push('Location is required');
  }

  // Employment type validation
  if (data.employmentType && !Object.values(EmploymentType).includes(data.employmentType)) {
    errors.push('Invalid employment type');
  }

  // Employment status validation
  if (data.employmentStatus && !Object.values(EmploymentStatus).includes(data.employmentStatus)) {
    errors.push('Invalid employment status');
  }

  // Salary validation
  if (data.baseSalary !== undefined) {
    if (typeof data.baseSalary !== 'number' || data.baseSalary < 0) {
      errors.push('Base salary must be a positive number');
    }
  }

  // Date validations
  if (data.hireDate && !isValidDate(data.hireDate)) {
    errors.push('Invalid hire date');
  }

  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    errors.push('Invalid date of birth');
  }

  // Age validation (must be at least 16 years old)
  if (data.dateOfBirth) {
    const age = calculateAge(new Date(data.dateOfBirth));
    if (age < 16) {
      errors.push('Employee must be at least 16 years old');
    }
  }

  // Gender validation
  if (data.gender && !Object.values(Gender).includes(data.gender)) {
    errors.push('Invalid gender');
  }

  // Marital status validation
  if (data.maritalStatus && !Object.values(MaritalStatus).includes(data.maritalStatus)) {
    errors.push('Invalid marital status');
  }

  // Personal email validation (if provided)
  if (data.personalEmail && !isValidEmail(data.personalEmail)) {
    errors.push('Invalid personal email format');
  }

  // Phone number validation (if provided)
  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.push('Invalid phone number format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Simple phone number validation - accepts various formats
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates date
 */
export function isValidDate(date: any): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Calculates age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Formats employee full name
 */
export function formatEmployeeName(firstName: string, lastName: string, middleName?: string): string {
  if (middleName) {
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Generates display name for employee
 */
export function generateDisplayName(firstName: string, lastName: string, preferredName?: string): string {
  if (preferredName && preferredName.trim().length > 0) {
    return preferredName;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Sanitizes employee data for database insertion
 */
export function sanitizeEmployeeData(data: any): any {
  const sanitized = { ...data };

  // Trim string fields
  const stringFields = ['firstName', 'lastName', 'middleName', 'workEmail', 'personalEmail', 
                       'jobTitle', 'department', 'location', 'phoneNumber'];
  
  stringFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  // Convert email to lowercase
  if (sanitized.workEmail) {
    sanitized.workEmail = sanitized.workEmail.toLowerCase();
  }
  if (sanitized.personalEmail) {
    sanitized.personalEmail = sanitized.personalEmail.toLowerCase();
  }

  // Remove empty strings and set to null
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });

  return sanitized;
}

/**
 * Checks if employee can be assigned as a manager (no circular reference)
 */
export async function validateManagerAssignment(
  employeeId: UUID, 
  managerId: UUID, 
  organizationId: UUID
): Promise<{ isValid: boolean; error?: string }> {
  if (employeeId === managerId) {
    return { isValid: false, error: 'Employee cannot be their own manager' };
  }

  const db: Pool = DatabaseConnection.getPool();

  try {
    // Check if the proposed manager exists and is active
    const managerQuery = `
      SELECT id FROM employees 
      WHERE id = $1 AND organization_id = $2 AND is_active = true
    `;
    const managerResult = await db.query(managerQuery, [managerId, organizationId]);
    
    if (managerResult.rows.length === 0) {
      return { isValid: false, error: 'Manager not found or inactive' };
    }

    // Check for circular reference by traversing the management hierarchy
    let currentManagerId = managerId;
    const visitedManagers = new Set<string>();
    
    while (currentManagerId) {
      if (visitedManagers.has(currentManagerId)) {
        return { isValid: false, error: 'Circular reference detected in management hierarchy' };
      }
      
      if (currentManagerId === employeeId) {
        return { isValid: false, error: 'Cannot create circular management relationship' };
      }
      
      visitedManagers.add(currentManagerId);
      
      const hierarchyQuery = `
        SELECT manager_id FROM employees 
        WHERE id = $1 AND is_active = true
      `;
      const hierarchyResult = await db.query(hierarchyQuery, [currentManagerId]);
      
      if (hierarchyResult.rows.length === 0) {
        break;
      }
      
      currentManagerId = hierarchyResult.rows[0].manager_id;
    }

    return { isValid: true };
  } catch (error) {
    logger.error('Error validating manager assignment:', error);
    return { isValid: false, error: 'Failed to validate manager assignment' };
  }
}

/**
 * Gets employee hierarchy depth
 */
export async function getEmployeeHierarchyDepth(employeeId: UUID): Promise<number> {
  const db: Pool = DatabaseConnection.getPool();
  let depth = 0;
  let currentEmployeeId = employeeId;

  try {
    while (currentEmployeeId) {
      const query = `
        SELECT manager_id FROM employees 
        WHERE id = $1 AND is_active = true
      `;
      const result = await db.query(query, [currentEmployeeId]);
      
      if (result.rows.length === 0 || !result.rows[0].manager_id) {
        break;
      }
      
      currentEmployeeId = result.rows[0].manager_id;
      depth++;
      
      // Prevent infinite loops
      if (depth > 10) {
        logger.warn(`Potential circular reference detected for employee ${employeeId}`);
        break;
      }
    }
    
    return depth;
  } catch (error) {
    logger.error('Error calculating hierarchy depth:', error);
    return 0;
  }
}

/**
 * Formats salary for display
 */
export function formatSalary(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Checks if employee is eligible for certain actions based on tenure
 */
export function checkTenureEligibility(hireDate: Date, requiredMonths: number): boolean {
  const today = new Date();
  const monthsDiff = (today.getFullYear() - hireDate.getFullYear()) * 12 + 
                    (today.getMonth() - hireDate.getMonth());
  return monthsDiff >= requiredMonths;
}

/**
 * Gets years of service for an employee
 */
export function getYearsOfService(hireDate: Date, terminationDate?: Date): number {
  const endDate = terminationDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - hireDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears * 100) / 100; // Round to 2 decimal places
}

/**
 * Masks sensitive employee data for logging
 */
export function maskSensitiveData(employee: any): any {
  const masked = { ...employee };
  
  if (masked.workEmail) {
    masked.workEmail = maskEmail(masked.workEmail);
  }
  
  if (masked.personalEmail) {
    masked.personalEmail = maskEmail(masked.personalEmail);
  }
  
  if (masked.phoneNumber) {
    masked.phoneNumber = maskPhoneNumber(masked.phoneNumber);
  }
  
  if (masked.dateOfBirth) {
    masked.dateOfBirth = '[MASKED]';
  }
  
  if (masked.baseSalary) {
    masked.baseSalary = '[MASKED]';
  }
  
  return masked;
}

/**
 * Masks email address
 */
function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}

/**
 * Masks phone number
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) {
    return '*'.repeat(phone.length);
  }
  return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
}
