// Industry 5.0 ERP Backend - Employee Service Integration Tests
// Full integration tests for employee management functionality
// Author: AI Assistant
// Date: 2024

import { DataSource, Repository } from 'typeorm';
import { EmployeeServiceImpl } from '../services/employee.service';
import { EmployeeEntity } from '../entities/employee.entity';
import { OrganizationEntity } from '../../core/entities/organization.entity';
import { DepartmentEntity } from '../entities/department.entity';
import { PositionEntity } from '../entities/position.entity';
import { 
  createMockOrganizationId, 
  createMockEmployeeRequest, 
  expectEmployeeMatch,
  createMockEmployee
} from '../../../test/helpers/hr.helpers';
import { 
  EmploymentType, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest 
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';

describe('Employee Service Integration Tests', () => {
  let dataSource: DataSource;
  let employeeService: EmployeeServiceImpl;
  let employeeRepository: Repository<EmployeeEntity>;
  let organizationRepository: Repository<OrganizationEntity>;
  let testOrganizationId: string;

  beforeAll(async () => {
    // Use global test database connection
    dataSource = (global as any).testDataSource;
    employeeRepository = dataSource.getRepository(EmployeeEntity);
    organizationRepository = dataSource.getRepository(OrganizationEntity);
    
    // Create test organization
    const organization = organizationRepository.create({
      name: 'Test Organization',
      code: 'TEST_ORG',
      type: 'company',
      industry: 'technology',
      country: 'US',
      currency: 'USD',
      isActive: true
    });
    const savedOrg = await organizationRepository.save(organization);
    testOrganizationId = savedOrg.id;
    
    employeeService = new EmployeeServiceImpl();
  });

  afterAll(async () => {
    // Clean up test data
    await employeeRepository.query('DELETE FROM employees WHERE organization_id = $1', [testOrganizationId]);
    await organizationRepository.delete(testOrganizationId);
  });

  beforeEach(async () => {
    // Clean up employees before each test
    await employeeRepository.query('DELETE FROM employees WHERE organization_id = $1', [testOrganizationId]);
  });

  describe('Employee Creation', () => {
    it('should create a new employee with valid data', async () => {
      const employeeData = createMockEmployeeRequest({
        workEmail: 'test.employee@company.com',
        department: 'Engineering',
        jobTitle: 'Senior Developer'
      });

      const employee = await employeeService.create(testOrganizationId as any, employeeData);

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();
      expect(employee.organizationId).toBe(testOrganizationId);
      expectEmployeeMatch(employee, employeeData);
      
      // Verify employee was saved to database
      const savedEmployee = await employeeRepository.findOne({ 
        where: { id: employee.id } 
      });
      expect(savedEmployee).toBeDefined();
      expect(savedEmployee?.workEmail).toBe(employeeData.workEmail);
    });

    it('should generate unique employee numbers', async () => {
      const employeeData1 = createMockEmployeeRequest({ workEmail: 'emp1@company.com' });
      const employeeData2 = createMockEmployeeRequest({ workEmail: 'emp2@company.com' });

      const employee1 = await employeeService.create(testOrganizationId as any, employeeData1);
      const employee2 = await employeeService.create(testOrganizationId as any, employeeData2);

      expect(employee1.employeeNumber).toMatch(/^EMP-\d{4}-\d{6}$/);
      expect(employee2.employeeNumber).toMatch(/^EMP-\d{4}-\d{6}$/);
      expect(employee1.employeeNumber).not.toBe(employee2.employeeNumber);
    });

    it('should reject duplicate email addresses', async () => {
      const employeeData1 = createMockEmployeeRequest({ 
        workEmail: 'duplicate@company.com' 
      });
      const employeeData2 = createMockEmployeeRequest({ 
        workEmail: 'duplicate@company.com' 
      });

      await employeeService.create(testOrganizationId as any, employeeData1);

      await expect(
        employeeService.create(testOrganizationId as any, employeeData2)
      ).rejects.toThrow(HRError);

      await expect(
        employeeService.create(testOrganizationId as any, employeeData2)
      ).rejects.toMatchObject({
        code: HRErrorCodes.DUPLICATE_EMPLOYEE_EMAIL
      });
    });

    it('should validate manager assignment', async () => {
      // Create a manager first
      const managerData = createMockEmployeeRequest({ 
        workEmail: 'manager@company.com',
        jobTitle: 'Engineering Manager'
      });
      const manager = await employeeService.create(testOrganizationId as any, managerData);

      // Create employee with valid manager
      const employeeData = createMockEmployeeRequest({
        workEmail: 'employee@company.com',
        managerId: manager.id
      });

      const employee = await employeeService.create(testOrganizationId as any, employeeData);
      expect(employee.managerId).toBe(manager.id);
    });

    it('should reject invalid manager assignment', async () => {
      const fakeManagerId = createMockOrganizationId();
      const employeeData = createMockEmployeeRequest({
        workEmail: 'employee@company.com',
        managerId: fakeManagerId as any
      });

      await expect(
        employeeService.create(testOrganizationId as any, employeeData)
      ).rejects.toThrow(HRError);

      await expect(
        employeeService.create(testOrganizationId as any, employeeData)
      ).rejects.toMatchObject({
        code: HRErrorCodes.INVALID_MANAGER_ASSIGNMENT
      });
    });
  });

  describe('Employee Retrieval', () => {
    let testEmployee: any;

    beforeEach(async () => {
      const employeeData = createMockEmployeeRequest({
        workEmail: 'test@company.com'
      });
      testEmployee = await employeeService.create(testOrganizationId as any, employeeData);
    });

    it('should retrieve employee by ID', async () => {
      const employee = await employeeService.getById(testEmployee.id);
      
      expect(employee).toBeDefined();
      expect(employee?.id).toBe(testEmployee.id);
      expect(employee?.workEmail).toBe('test@company.com');
    });

    it('should return null for non-existent employee ID', async () => {
      const fakeId = createMockOrganizationId();
      const employee = await employeeService.getById(fakeId as any);
      
      expect(employee).toBeNull();
    });

    it('should retrieve employee by email', async () => {
      const employee = await employeeService.getByEmail('test@company.com');
      
      expect(employee).toBeDefined();
      expect(employee?.id).toBe(testEmployee.id);
      expect(employee?.workEmail).toBe('test@company.com');
    });

    it('should return null for non-existent email', async () => {
      const employee = await employeeService.getByEmail('nonexistent@company.com');
      
      expect(employee).toBeNull();
    });
  });

  describe('Employee Updates', () => {
    let testEmployee: any;

    beforeEach(async () => {
      const employeeData = createMockEmployeeRequest({
        workEmail: 'update-test@company.com'
      });
      testEmployee = await employeeService.create(testOrganizationId as any, employeeData);
    });

    it('should update employee information', async () => {
      const updateData: UpdateEmployeeRequest = {
        firstName: 'Updated',
        lastName: 'Name',
        jobTitle: 'Senior Engineer',
        baseSalary: 120000
      };

      const updatedEmployee = await employeeService.update(testEmployee.id, updateData);

      expect(updatedEmployee.firstName).toBe('Updated');
      expect(updatedEmployee.lastName).toBe('Name');
      expect(updatedEmployee.jobTitle).toBe('Senior Engineer');
      expect(updatedEmployee.baseSalary).toBe(120000);
      
      // Verify changes persisted to database
      const savedEmployee = await employeeRepository.findOne({ 
        where: { id: testEmployee.id } 
      });
      expect(savedEmployee?.firstName).toBe('Updated');
      expect(savedEmployee?.baseSalary).toBe(120000);
    });

    it('should reject update for non-existent employee', async () => {
      const fakeId = createMockOrganizationId();
      const updateData: UpdateEmployeeRequest = {
        firstName: 'Should Fail'
      };

      await expect(
        employeeService.update(fakeId as any, updateData)
      ).rejects.toThrow(HRError);

      await expect(
        employeeService.update(fakeId as any, updateData)
      ).rejects.toMatchObject({
        code: HRErrorCodes.EMPLOYEE_NOT_FOUND
      });
    });

    it('should validate manager update', async () => {
      // Create a manager
      const managerData = createMockEmployeeRequest({
        workEmail: 'new-manager@company.com'
      });
      const manager = await employeeService.create(testOrganizationId as any, managerData);

      // Update employee with valid manager
      const updateData: UpdateEmployeeRequest = {
        managerId: manager.id
      };

      const updatedEmployee = await employeeService.update(testEmployee.id, updateData);
      expect(updatedEmployee.managerId).toBe(manager.id);
    });

    it('should prevent self-manager assignment', async () => {
      const updateData: UpdateEmployeeRequest = {
        managerId: testEmployee.id
      };

      await expect(
        employeeService.update(testEmployee.id, updateData)
      ).rejects.toThrow(HRError);

      await expect(
        employeeService.update(testEmployee.id, updateData)
      ).rejects.toMatchObject({
        code: HRErrorCodes.INVALID_MANAGER_ASSIGNMENT
      });
    });
  });

  describe('Employee Deletion', () => {
    let testEmployee: any;

    beforeEach(async () => {
      const employeeData = createMockEmployeeRequest({
        workEmail: 'delete-test@company.com'
      });
      testEmployee = await employeeService.create(testOrganizationId as any, employeeData);
    });

    it('should delete an existing employee', async () => {
      await employeeService.delete(testEmployee.id);

      // Verify employee was deleted
      const deletedEmployee = await employeeRepository.findOne({ 
        where: { id: testEmployee.id } 
      });
      expect(deletedEmployee).toBeNull();
    });

    it('should reject deletion of non-existent employee', async () => {
      const fakeId = createMockOrganizationId();

      await expect(
        employeeService.delete(fakeId as any)
      ).rejects.toThrow(HRError);

      await expect(
        employeeService.delete(fakeId as any)
      ).rejects.toMatchObject({
        code: HRErrorCodes.EMPLOYEE_NOT_FOUND
      });
    });
  });

  describe('Employee Hierarchy Operations', () => {
    let manager: any;
    let employee1: any;
    let employee2: any;
    let subEmployee: any;

    beforeEach(async () => {
      // Create manager
      const managerData = createMockEmployeeRequest({
        workEmail: 'hierarchy-manager@company.com',
        jobTitle: 'Engineering Manager'
      });
      manager = await employeeService.create(testOrganizationId as any, managerData);

      // Create direct reports
      const emp1Data = createMockEmployeeRequest({
        workEmail: 'hierarchy-emp1@company.com',
        managerId: manager.id
      });
      employee1 = await employeeService.create(testOrganizationId as any, emp1Data);

      const emp2Data = createMockEmployeeRequest({
        workEmail: 'hierarchy-emp2@company.com',
        managerId: manager.id
      });
      employee2 = await employeeService.create(testOrganizationId as any, emp2Data);

      // Create sub-employee under employee1
      const subEmpData = createMockEmployeeRequest({
        workEmail: 'hierarchy-sub@company.com',
        managerId: employee1.id
      });
      subEmployee = await employeeService.create(testOrganizationId as any, subEmpData);
    });

    it('should get direct reports for a manager', async () => {
      const directReports = await employeeService.getDirectReports(manager.id);

      expect(directReports).toHaveLength(2);
      expect(directReports.map(emp => emp.id)).toContain(employee1.id);
      expect(directReports.map(emp => emp.id)).toContain(employee2.id);
      expect(directReports.map(emp => emp.id)).not.toContain(subEmployee.id);
    });

    it('should get empty array for employee with no direct reports', async () => {
      const directReports = await employeeService.getDirectReports(employee2.id);

      expect(directReports).toHaveLength(0);
    });

    it('should get manager hierarchy for an employee', async () => {
      const hierarchy = await employeeService.getManagerHierarchy(subEmployee.id);

      expect(hierarchy).toHaveLength(2);
      expect(hierarchy[0].id).toBe(employee1.id); // Direct manager
      expect(hierarchy[1].id).toBe(manager.id);   // Top-level manager
    });

    it('should get empty hierarchy for top-level manager', async () => {
      const hierarchy = await employeeService.getManagerHierarchy(manager.id);

      expect(hierarchy).toHaveLength(0);
    });
  });

  describe('Employee Listing and Search', () => {
    beforeEach(async () => {
      // Create multiple employees for testing
      const employees = [
        { workEmail: 'john.doe@company.com', firstName: 'John', lastName: 'Doe', department: 'Engineering' },
        { workEmail: 'jane.smith@company.com', firstName: 'Jane', lastName: 'Smith', department: 'Product' },
        { workEmail: 'mike.wilson@company.com', firstName: 'Mike', lastName: 'Wilson', department: 'Engineering' },
        { workEmail: 'sarah.jones@company.com', firstName: 'Sarah', lastName: 'Jones', department: 'Marketing' }
      ];

      for (const emp of employees) {
        const employeeData = createMockEmployeeRequest(emp);
        await employeeService.create(testOrganizationId as any, employeeData);
      }
    });

    it('should list employees with pagination', async () => {
      const result = await employeeService.list(testOrganizationId as any, {
        page: 1,
        limit: 2
      });

      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(4);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it('should filter employees by department', async () => {
      const result = await employeeService.list(testOrganizationId as any, {
        page: 1,
        limit: 10,
        filters: { department: 'Engineering' }
      });

      expect(result.items).toHaveLength(2);
      expect(result.items.every(emp => emp.department === 'Engineering')).toBe(true);
    });

    it('should search employees by name', async () => {
      const results = await employeeService.search(testOrganizationId as any, {
        query: 'John',
        fields: ['firstName', 'lastName']
      });

      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('John');
    });

    it('should search employees by email', async () => {
      const results = await employeeService.search(testOrganizationId as any, {
        query: 'jane.smith',
        fields: ['workEmail']
      });

      expect(results).toHaveLength(1);
      expect(results[0].workEmail).toBe('jane.smith@company.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the connection to simulate error
      await dataSource.destroy();

      const employeeData = createMockEmployeeRequest();

      await expect(
        employeeService.create(testOrganizationId as any, employeeData)
      ).rejects.toThrow();

      // Restore connection for cleanup
      dataSource = (global as any).testDataSource;
    });
  });
});
