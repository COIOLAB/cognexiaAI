/**
 * Validation Utilities for Industry 5.0 ERP
 * Provides common validation functions used across modules
 */

export class ValidationUtils {
  /**
   * Validate if a string is a valid UUID
   */
  static isUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Validate if a string is not empty
   */
  static isNotEmpty(value: string): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  }

  /**
   * Validate if a number is positive
   */
  static isPositive(value: number): boolean {
    return typeof value === 'number' && value > 0;
  }

  /**
   * Validate if a number is non-negative
   */
  static isNonNegative(value: number): boolean {
    return typeof value === 'number' && value >= 0;
  }

  /**
   * Validate if a value is within a range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && value >= min && value <= max;
  }

  /**
   * Validate email format
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic)
   */
  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate if a date is in the future
   */
  static isFutureDate(date: Date | string): boolean {
    const inputDate = new Date(date);
    const now = new Date();
    return inputDate > now;
  }

  /**
   * Validate if a date is valid
   */
  static isValidDate(date: Date | string): boolean {
    const inputDate = new Date(date);
    return inputDate instanceof Date && !isNaN(inputDate.getTime());
  }

  /**
   * Validate if an array is not empty
   */
  static isNonEmptyArray<T>(array: T[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  /**
   * Validate if a value is a valid JSON string
   */
  static isValidJSON(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate if a string matches a pattern
   */
  static matchesPattern(value: string, pattern: RegExp): boolean {
    return pattern.test(value);
  }

  /**
   * Validate if a value is an object (not null, not array)
   */
  static isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Validate if a string has minimum length
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return typeof value === 'string' && value.length >= minLength;
  }

  /**
   * Validate if a string has maximum length
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return typeof value === 'string' && value.length <= maxLength;
  }

  /**
   * Sanitize and validate input string
   */
  static sanitizeString(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate if all required fields are present in an object
   */
  static hasRequiredFields(obj: any, requiredFields: string[]): boolean {
    if (!this.isObject(obj)) {
      return false;
    }
    
    return requiredFields.every(field => 
      obj.hasOwnProperty(field) && obj[field] !== null && obj[field] !== undefined
    );
  }
}
