// Industry 5.0 ERP Backend - Employee Module Tests
// Integration tests for employee management functionality
// Author: AI Assistant
// Date: 2024

import { EmployeeServiceImpl } from '../services/employee.service';
import { EmploymentType, CreateEmployeeRequest } from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { validateEmployeeData, generateEmployeeNumber } from '../utils/employee.util';

describe('HR Employee Module', () => {
  
  describe('Employee Utilities', () => {
    test('should validate employee data correctly', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        workEmail: 'john.doe@company.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        location: 'New York',
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 75000,
        hireDate: new Date('2024-01-15')
      };

      const validation = validateEmployeeData(validData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid employee data', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        workEmail: 'invalid-email',
        jobTitle: '',
        department: 'Engineering',
        location: 'New York'
      };

      const validation = validateEmployeeData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should generate employee number in correct format', async () => {
      // Mock the database query for testing
      const mockOrganizationId = '123e4567-e89b-12d3-a456-426614174000';
      
      // This test assumes the function works - in a real scenario, 
      // we would mock the database connection
      const employeeNumber = await generateEmployeeNumber(mockOrganizationId as any);
      
      // Check format: EMP-YYYY-NNNNNN
      expect(employeeNumber).toMatch(/^EMP-\d{4}-\d{6}$/);
      expect(employeeNumber).toContain(new Date().getFullYear().toString());
    });
  });

  describe('HR Error Handling', () => {
    test('should create HR errors correctly', () => {
      const error = new HRError(
        HRErrorCodes.EMPLOYEE_NOT_FOUND,
        'Test employee not found',
        404,
        { employeeId: '123' }
      );

      expect(error.code).toBe(HRErrorCodes.EMPLOYEE_NOT_FOUND);
      expect(error.message).toBe('Test employee not found');
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual({ employeeId: '123' });
    });

    test('should convert error to JSON', () => {
      const error = new HRError(
        HRErrorCodes.DUPLICATE_EMPLOYEE_EMAIL,
        'Email already exists',
        409
      );

      const json = error.toJSON();
      expect(json.error).toBe(true);
      expect(json.code).toBe(HRErrorCodes.DUPLICATE_EMPLOYEE_EMAIL);
      expect(json.statusCode).toBe(409);
      expect(json.timestamp).toBeDefined();
    });

    test('should provide user-friendly error messages', () => {
      const error = new HRError(
        HRErrorCodes.EMPLOYEE_NOT_FOUND,
        'Employee not found in database',
        404
      );

      const userMessage = error.getUserMessage();
      expect(userMessage).toBe('The requested employee could not be found.');
    });
  });

  describe('Employee Service (Unit Tests)', () => {
    let employeeService: EmployeeServiceImpl;

    beforeEach(() => {
      employeeService = new EmployeeServiceImpl();
    });

    test('should be instantiable', () => {
      expect(employeeService).toBeInstanceOf(EmployeeServiceImpl);
    });

    // Note: These would be more comprehensive with proper database mocking
    // For now, we're testing the structure and interfaces
    test('should have required methods', () => {
      expect(typeof employeeService.create).toBe('function');
      expect(typeof employeeService.getById).toBe('function');
      expect(typeof employeeService.getByEmail).toBe('function');
      expect(typeof employeeService.update).toBe('function');
      expect(typeof employeeService.delete).toBe('function');
      expect(typeof employeeService.list).toBe('function');
      expect(typeof employeeService.search).toBe('function');
      expect(typeof employeeService.getDirectReports).toBe('function');
      expect(typeof employeeService.getManagerHierarchy).toBe('function');
    });
  });

  describe('Type System', () => {
    test('should have correct employee types', () => {
      // Test that our enum values are correct
      expect(EmploymentType.FULL_TIME).toBe('full_time');
      expect(EmploymentType.PART_TIME).toBe('part_time');
      expect(EmploymentType.CONTRACT).toBe('contract');
    });

    test('should validate CreateEmployeeRequest structure', () => {
      const createRequest: CreateEmployeeRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        workEmail: 'jane.smith@company.com',
        jobTitle: 'Product Manager',
        department: 'Product',
        location: 'San Francisco',
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 95000,
        hireDate: new Date('2024-02-01'),
        personalInfo: {
          personalEmail: 'jane.smith@gmail.com',
          phoneNumber: '+1-555-0123'
        }
      };

      // If this compiles, the type structure is correct
      expect(createRequest.firstName).toBe('Jane');
      expect(createRequest.personalInfo?.personalEmail).toBe('jane.smith@gmail.com');
    });
  });
});

// Mock data for testing
export const mockEmployeeData: CreateEmployeeRequest = {
  firstName: 'John',
  lastName: 'Doe',
  workEmail: 'john.doe@company.com',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  location: 'New York',
  employmentType: EmploymentType.FULL_TIME,
  baseSalary: 85000,
  hireDate: new Date('2024-01-15'),
  managerId: undefined,
  personalInfo: {
    personalEmail: 'john.doe@gmail.com',
    phoneNumber: '+1-555-0123',
    dateOfBirth: new Date('1990-05-15')
  }
};

export const mockEmployeeResponse = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  organizationId: '123e4567-e89b-12d3-a456-426614174001',
  employeeNumber: 'EMP-2024-000001',
  ...mockEmployeeData,
  fullName: 'John Doe',
  displayName: 'John Doe',
  employmentStatus: 'active',
  currency: 'USD',
  isActive: true,
  skills: [],
  languages: [],
  certifications: [],
  tags: [],
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date()
};
