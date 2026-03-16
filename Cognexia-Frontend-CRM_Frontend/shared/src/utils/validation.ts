// Validation Utilities for Industry 5.0 ERP

import { VALIDATION_CONFIG } from '../constants/config';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationUtils {
  
  static validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} is required`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateString(value: string, fieldName: string, options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    trim?: boolean;
  } = {}): ValidationResult {
    const errors: string[] = [];
    
    let processedValue = value;
    if (options.trim !== false) {
      processedValue = value?.trim();
    }
    
    const minLength = options.minLength ?? VALIDATION_CONFIG.STRING.MIN_LENGTH;
    const maxLength = options.maxLength ?? VALIDATION_CONFIG.STRING.MAX_LENGTH;
    
    if (processedValue && processedValue.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }
    
    if (processedValue && processedValue.length > maxLength) {
      errors.push(`${fieldName} must not exceed ${maxLength} characters`);
    }
    
    if (options.pattern && processedValue && !options.pattern.test(processedValue)) {
      errors.push(`${fieldName} format is invalid`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateNumber(value: number, fieldName: string, options: {
    min?: number;
    max?: number;
    integer?: boolean;
    decimalPlaces?: number;
  } = {}): ValidationResult {
    const errors: string[] = [];
    
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${fieldName} must be a valid number`);
      return { isValid: false, errors };
    }
    
    const min = options.min ?? VALIDATION_CONFIG.NUMERIC.MIN_VALUE;
    const max = options.max ?? VALIDATION_CONFIG.NUMERIC.MAX_VALUE;
    
    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    
    if (value > max) {
      errors.push(`${fieldName} must not exceed ${max}`);
    }
    
    if (options.integer && !Number.isInteger(value)) {
      errors.push(`${fieldName} must be an integer`);
    }
    
    if (options.decimalPlaces !== undefined) {
      const decimalPart = value.toString().split('.')[1];
      if (decimalPart && decimalPart.length > options.decimalPlaces) {
        errors.push(`${fieldName} must have at most ${options.decimalPlaces} decimal places`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateDate(value: Date | string, fieldName: string, options: {
    minDate?: Date;
    maxDate?: Date;
    format?: string;
  } = {}): ValidationResult {
    const errors: string[] = [];
    
    let dateValue: Date;
    
    if (typeof value === 'string') {
      dateValue = new Date(value);
    } else if (value instanceof Date) {
      dateValue = value;
    } else {
      errors.push(`${fieldName} must be a valid date`);
      return { isValid: false, errors };
    }
    
    if (isNaN(dateValue.getTime())) {
      errors.push(`${fieldName} must be a valid date`);
      return { isValid: false, errors };
    }
    
    if (options.minDate && dateValue < options.minDate) {
      errors.push(`${fieldName} must be after ${options.minDate.toISOString().split('T')[0]}`);
    }
    
    if (options.maxDate && dateValue > options.maxDate) {
      errors.push(`${fieldName} must be before ${options.maxDate.toISOString().split('T')[0]}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEmail(value: string, fieldName: string = 'Email'): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validateString(value, fieldName, { pattern: emailRegex });
  }

  static validatePhone(value: string, fieldName: string = 'Phone'): ValidationResult {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return this.validateString(value, fieldName, { pattern: phoneRegex, minLength: 10 });
  }

  static validatePassword(value: string): ValidationResult {
    const errors: string[] = [];
    const config = VALIDATION_CONFIG;
    
    // This is a simplified validation - in production, use more sophisticated password validation
    if (!value || value.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(value)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateArray(value: any[], fieldName: string, options: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => ValidationResult;
  } = {}): ValidationResult {
    const errors: string[] = [];
    
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
      return { isValid: false, errors };
    }
    
    if (options.minLength !== undefined && value.length < options.minLength) {
      errors.push(`${fieldName} must contain at least ${options.minLength} items`);
    }
    
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      errors.push(`${fieldName} must contain at most ${options.maxLength} items`);
    }
    
    if (options.itemValidator) {
      value.forEach((item, index) => {
        const result = options.itemValidator!(item, index);
        if (!result.isValid) {
          errors.push(`${fieldName}[${index}]: ${result.errors.join(', ')}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEnum<T extends Record<string, string>>(
    value: string, 
    enumObject: T, 
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];
    const validValues = Object.values(enumObject);
    
    if (!validValues.includes(value)) {
      errors.push(`${fieldName} must be one of: ${validValues.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateObject<T>(
    value: any,
    validator: (obj: T) => ValidationResult,
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];
    
    if (typeof value !== 'object' || value === null) {
      errors.push(`${fieldName} must be an object`);
      return { isValid: false, errors };
    }
    
    const result = validator(value as T);
    return result;
  }

  static combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(result => result.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  // Industry-specific validators
  static validateAccountNumber(value: string): ValidationResult {
    const accountRegex = /^\d{10,16}$/; // 10-16 digits
    return this.validateString(value, 'Account Number', { pattern: accountRegex });
  }

  static validateSSN(value: string): ValidationResult {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return this.validateString(value, 'Social Security Number', { pattern: ssnRegex });
  }

  static validateClassificationLevel(value: string): ValidationResult {
    const validLevels = ['UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
    const errors: string[] = [];
    
    if (!validLevels.includes(value)) {
      errors.push(`Classification level must be one of: ${validLevels.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCoordinates(lat: number, lng: number): ValidationResult {
    const errors: string[] = [];
    
    if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
    
    if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCurrency(amount: number, currencyCode: string): ValidationResult {
    const errors: string[] = [];
    
    if (amount < 0) {
      errors.push('Amount cannot be negative');
    }
    
    // Validate currency code (simplified - should use proper currency validation)
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currencyCode)) {
      errors.push(`Invalid currency code: ${currencyCode}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
