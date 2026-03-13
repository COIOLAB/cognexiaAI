// Industry 5.0 ERP Backend - Compensation Service Integration Tests
// Full integration tests for compensation management functionality
// Author: AI Assistant
// Date: 2024

import { DataSource, Repository } from 'typeorm';
import { CompensationService } from '../services/compensation.service';
import { CompensationPlanEntity } from '../entities/compensation-plan.entity';
import { EmployeeCompensationEntity } from '../entities/employee-compensation.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import { OrganizationEntity } from '../../core/entities/organization.entity';
import {
  createMockOrganizationId,
  createMockCompensationPlanRequest,
  createMockEmployeeRequest,
  createMockEmployee
} from '../../../test/helpers/hr.helpers';
import {
  CreateCompensationPlanRequest,
  UpdateCompensationPlanRequest,
  CompensationPlan,
  EmployeeCompensation
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';

describe('Compensation Service Integration Tests', () => {
  let dataSource: DataSource;
  let compensationService: CompensationService;
  let compensationPlanRepository: Repository<CompensationPlanEntity>;
  let employeeCompensationRepository: Repository<EmployeeCompensationEntity>;
  let employeeRepository: Repository<EmployeeEntity>;
  let organizationRepository: Repository<OrganizationEntity>;
  let testOrganizationId: string;
  let testEmployees: any[] = [];

  beforeAll(async () => {
    // Use global test database connection
    dataSource = (global as any).testDataSource;
    compensationPlanRepository = dataSource.getRepository(CompensationPlanEntity);
    employeeCompensationRepository = dataSource.getRepository(EmployeeCompensationEntity);
    employeeRepository = dataSource.getRepository(EmployeeEntity);
    organizationRepository = dataSource.getRepository(OrganizationEntity);
    
    // Create test organization
    const organization = organizationRepository.create({
      name: 'Test Compensation Organization',
      code: 'TEST_COMP_ORG',
      type: 'company',
      industry: 'technology',
      country: 'US',
      currency: 'USD',
      isActive: true
    });
    const savedOrg = await organizationRepository.save(organization);
    testOrganizationId = savedOrg.id;
    
    compensationService = new CompensationService();
  });

  afterAll(async () => {
    // Clean up test data
    await employeeCompensationRepository.query('DELETE FROM employee_compensations WHERE organization_id = $1', [testOrganizationId]);
    await compensationPlanRepository.query('DELETE FROM compensation_plans WHERE organization_id = $1', [testOrganizationId]);
    await employeeRepository.query('DELETE FROM employees WHERE organization_id = $1', [testOrganizationId]);
    await organizationRepository.delete(testOrganizationId);
  });

  beforeEach(async () => {
    // Clean up compensation data before each test
    await employeeCompensationRepository.query('DELETE FROM employee_compensations WHERE organization_id = $1', [testOrganizationId]);
    await compensationPlanRepository.query('DELETE FROM compensation_plans WHERE organization_id = $1', [testOrganizationId]);
    await employeeRepository.query('DELETE FROM employees WHERE organization_id = $1', [testOrganizationId]);
    
    // Create test employees
    const employeeData = [
      { workEmail: 'comp.emp1@company.com', firstName: 'John', lastName: 'Doe', jobTitle: 'Software Engineer', department: 'Engineering' },
      { workEmail: 'comp.emp2@company.com', firstName: 'Jane', lastName: 'Smith', jobTitle: 'Senior Engineer', department: 'Engineering' },
      { workEmail: 'comp.emp3@company.com', firstName: 'Mike', lastName: 'Wilson', jobTitle: 'Product Manager', department: 'Product' }
    ];

    testEmployees = [];
    for (const emp of employeeData) {
      const employee = employeeRepository.create({
        organizationId: testOrganizationId,
        employeeNumber: `EMP-COMP-${Math.random().toString().slice(2, 8)}`,
        ...createMockEmployeeRequest(emp)
      });
      const savedEmp = await employeeRepository.save(employee);
      testEmployees.push(savedEmp);
    }
  });

  describe('Compensation Plan Management', () => {
    it('should create a new compensation plan', async () => {
      const planData = createMockCompensationPlanRequest({
        name: 'Software Engineer L2',
        jobTitle: 'Software Engineer',
        department: 'Engineering'
      });

      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      expect(plan).toBeDefined();
      expect(plan.id).toBeDefined();
      expect(plan.organizationId).toBe(testOrganizationId);
      expect(plan.name).toBe(planData.name);
      expect(plan.jobTitle).toBe(planData.jobTitle);
      expect(plan.baseSalary).toEqual(planData.baseSalary);
      expect(plan.bonusStructure).toEqual(planData.bonusStructure);
      expect(plan.benefits).toEqual(planData.benefits);
      expect(plan.isActive).toBe(true);
      
      // Verify plan was saved to database
      const savedPlan = await compensationPlanRepository.findOne({ 
        where: { id: plan.id } 
      });
      expect(savedPlan).toBeDefined();
      expect(savedPlan?.name).toBe(planData.name);
    });

    it('should update an existing compensation plan', async () => {
      // Create a plan first
      const planData = createMockCompensationPlanRequest({
        name: 'Original Plan',
        baseSalary: { min: 70000, max: 100000, currency: 'USD' }
      });
      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      // Update the plan
      const updateData: UpdateCompensationPlanRequest = {
        name: 'Updated Plan',
        description: 'Updated description',
        baseSalary: { min: 80000, max: 120000, currency: 'USD' },
        bonusStructure: {
          type: 'percentage',
          percentage: 20,
          maxAmount: 24000
        }
      };

      const updatedPlan = await compensationService.updateCompensationPlan(
        plan.id,
        updateData
      );

      expect(updatedPlan.name).toBe('Updated Plan');
      expect(updatedPlan.description).toBe('Updated description');
      expect(updatedPlan.baseSalary.min).toBe(80000);
      expect(updatedPlan.baseSalary.max).toBe(120000);
      expect(updatedPlan.bonusStructure?.percentage).toBe(20);
      
      // Verify changes persisted to database
      const savedPlan = await compensationPlanRepository.findOne({ 
        where: { id: plan.id } 
      });
      expect(savedPlan?.name).toBe('Updated Plan');
      expect(savedPlan?.baseSalary.min).toBe(80000);
    });

    it('should delete a compensation plan', async () => {
      const planData = createMockCompensationPlanRequest();
      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      await compensationService.deleteCompensationPlan(plan.id);

      // Verify plan was soft deleted (isActive = false)
      const deletedPlan = await compensationPlanRepository.findOne({ 
        where: { id: plan.id } 
      });
      expect(deletedPlan?.isActive).toBe(false);
    });

    it('should retrieve compensation plan by ID', async () => {
      const planData = createMockCompensationPlanRequest({
        name: 'Retrieval Test Plan'
      });
      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      const retrievedPlan = await compensationService.getCompensationPlanById(
        plan.id,
        testOrganizationId as any
      );

      expect(retrievedPlan).toBeDefined();
      expect(retrievedPlan?.id).toBe(plan.id);
      expect(retrievedPlan?.name).toBe('Retrieval Test Plan');
    });

    it('should return null for non-existent plan', async () => {
      const fakeId = createMockOrganizationId();
      const retrievedPlan = await compensationService.getCompensationPlanById(
        fakeId as any,
        testOrganizationId as any
      );

      expect(retrievedPlan).toBeNull();
    });

    it('should list compensation plans with pagination', async () => {
      // Create multiple plans
      const plans = [
        { name: 'Engineer L1', jobTitle: 'Junior Engineer' },
        { name: 'Engineer L2', jobTitle: 'Software Engineer' },
        { name: 'Engineer L3', jobTitle: 'Senior Engineer' },
        { name: 'Manager L1', jobTitle: 'Engineering Manager' }
      ];

      for (const planData of plans) {
        const planRequest = createMockCompensationPlanRequest(planData);
        await compensationService.createCompensationPlan(testOrganizationId as any, planRequest);
      }

      const result = await compensationService.listCompensationPlans(
        testOrganizationId as any,
        { page: 1, limit: 2 }
      );

      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(4);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it('should filter compensation plans by job title', async () => {
      // Create plans with different job titles
      const engineerPlan = createMockCompensationPlanRequest({
        name: 'Software Engineer Plan',
        jobTitle: 'Software Engineer'
      });
      const managerPlan = createMockCompensationPlanRequest({
        name: 'Manager Plan',
        jobTitle: 'Engineering Manager'
      });

      await compensationService.createCompensationPlan(testOrganizationId as any, engineerPlan);
      await compensationService.createCompensationPlan(testOrganizationId as any, managerPlan);

      const result = await compensationService.listCompensationPlans(
        testOrganizationId as any,
        {
          page: 1,
          limit: 10,
          filters: { jobTitle: 'Software Engineer' }
        }
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].jobTitle).toBe('Software Engineer');
    });
  });

  describe('Employee Compensation Assignment', () => {
    let testCompensationPlan: any;

    beforeEach(async () => {
      const planData = createMockCompensationPlanRequest({
        name: 'Test Assignment Plan',
        jobTitle: 'Software Engineer'
      });
      testCompensationPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );
    });

    it('should assign compensation plan to employee', async () => {
      const employee = testEmployees[0];
      const effectiveDate = new Date('2024-01-01');

      const assignment = await compensationService.assignCompensationPlan(
        employee.id,
        testCompensationPlan.id,
        testOrganizationId as any,
        {
          effectiveDate,
          currentSalary: 85000,
          notes: 'Annual review adjustment'
        }
      );

      expect(assignment).toBeDefined();
      expect(assignment.id).toBeDefined();
      expect(assignment.employeeId).toBe(employee.id);
      expect(assignment.compensationPlanId).toBe(testCompensationPlan.id);
      expect(assignment.currentSalary).toBe(85000);
      expect(assignment.effectiveDate).toEqual(effectiveDate);
      expect(assignment.isActive).toBe(true);
      
      // Verify assignment was saved to database
      const savedAssignment = await employeeCompensationRepository.findOne({ 
        where: { id: assignment.id } 
      });
      expect(savedAssignment).toBeDefined();
      expect(savedAssignment?.currentSalary).toBe(85000);
    });

    it('should prevent duplicate active assignments', async () => {
      const employee = testEmployees[0];

      // Create first assignment
      await compensationService.assignCompensationPlan(
        employee.id,
        testCompensationPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date('2024-01-01'), currentSalary: 80000 }
      );

      // Try to create another active assignment for the same employee
      await expect(
        compensationService.assignCompensationPlan(
          employee.id,
          testCompensationPlan.id,
          testOrganizationId as any,
          { effectiveDate: new Date('2024-02-01'), currentSalary: 85000 }
        )
      ).rejects.toThrow(HRError);
    });

    it('should remove employee compensation assignment', async () => {
      const employee = testEmployees[0];
      
      const assignment = await compensationService.assignCompensationPlan(
        employee.id,
        testCompensationPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date('2024-01-01'), currentSalary: 80000 }
      );

      await compensationService.removeCompensationPlan(
        employee.id,
        testOrganizationId as any
      );

      // Verify assignment was deactivated
      const deactivatedAssignment = await employeeCompensationRepository.findOne({ 
        where: { id: assignment.id } 
      });
      expect(deactivatedAssignment?.isActive).toBe(false);
    });

    it('should get employee compensation details', async () => {
      const employee = testEmployees[0];
      
      await compensationService.assignCompensationPlan(
        employee.id,
        testCompensationPlan.id,
        testOrganizationId as any,
        { 
          effectiveDate: new Date('2024-01-01'), 
          currentSalary: 90000,
          notes: 'Performance-based increase'
        }
      );

      const compensation = await compensationService.getEmployeeCompensation(
        employee.id,
        testOrganizationId as any
      );

      expect(compensation).toBeDefined();
      expect(compensation?.employeeId).toBe(employee.id);
      expect(compensation?.currentSalary).toBe(90000);
      expect(compensation?.compensationPlan).toBeDefined();
      expect(compensation?.compensationPlan.name).toBe('Test Assignment Plan');
    });

    it('should return null for employee with no compensation', async () => {
      const employee = testEmployees[0];
      
      const compensation = await compensationService.getEmployeeCompensation(
        employee.id,
        testOrganizationId as any
      );

      expect(compensation).toBeNull();
    });
  });

  describe('Compensation Calculations', () => {
    let testCompensationPlan: any;
    let testEmployee: any;

    beforeEach(async () => {
      const planData = createMockCompensationPlanRequest({
        name: 'Calculation Test Plan',
        baseSalary: { min: 80000, max: 120000, currency: 'USD' },
        bonusStructure: {
          type: 'percentage',
          percentage: 15,
          maxAmount: 18000
        },
        benefits: {
          healthInsurance: true,
          dentalInsurance: true,
          retirement401k: true,
          paidTimeOff: 25
        }
      });
      testCompensationPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      testEmployee = testEmployees[0];
      await compensationService.assignCompensationPlan(
        testEmployee.id,
        testCompensationPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date('2024-01-01'), currentSalary: 95000 }
      );
    });

    it('should calculate total compensation for employee', async () => {
      const calculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: true,
          performanceMultiplier: 1.0
        }
      );

      expect(calculation).toBeDefined();
      expect(calculation.baseSalary).toBe(95000);
      expect(calculation.bonus).toBe(14250); // 15% of 95000
      expect(calculation.totalCompensation).toBeGreaterThan(95000);
      expect(calculation.benefits).toBeDefined();
      expect(calculation.benefits.healthInsurance).toBeDefined();
      expect(calculation.benefits.retirement401k).toBeDefined();
    });

    it('should calculate compensation without bonus', async () => {
      const calculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: false,
          includeBenefits: true,
          performanceMultiplier: 1.0
        }
      );

      expect(calculation.bonus).toBe(0);
      expect(calculation.totalCompensation).toBe(calculation.baseSalary + calculation.benefitsValue);
    });

    it('should apply performance multiplier to bonus calculation', async () => {
      const highPerformanceCalculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: false,
          performanceMultiplier: 1.2 // 20% performance boost
        }
      );

      const standardCalculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: false,
          performanceMultiplier: 1.0
        }
      );

      expect(highPerformanceCalculation.bonus).toBeGreaterThan(standardCalculation.bonus);
      expect(highPerformanceCalculation.bonus).toBe(standardCalculation.bonus * 1.2);
    });

    it('should respect bonus maximum amount', async () => {
      // Update plan with lower max bonus
      await compensationService.updateCompensationPlan(testCompensationPlan.id, {
        bonusStructure: {
          type: 'percentage',
          percentage: 50, // 50% would be 47,500, but max is 18,000
          maxAmount: 18000
        }
      });

      const calculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: false,
          performanceMultiplier: 1.0
        }
      );

      expect(calculation.bonus).toBe(18000); // Should be capped at maximum
    });

    it('should handle fixed bonus amounts', async () => {
      // Update plan with fixed bonus
      await compensationService.updateCompensationPlan(testCompensationPlan.id, {
        bonusStructure: {
          type: 'fixed',
          fixedAmount: 10000
        }
      });

      const calculation = await compensationService.calculateCompensation(
        testEmployee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: false,
          performanceMultiplier: 1.5 // Should not affect fixed bonus
        }
      );

      expect(calculation.bonus).toBe(10000); // Fixed amount, unaffected by multiplier
    });
  });

  describe('Compensation Plan Validation', () => {
    it('should validate salary ranges', async () => {
      const invalidPlanData = createMockCompensationPlanRequest({
        baseSalary: {
          min: 120000, // Min greater than max
          max: 80000,
          currency: 'USD'
        }
      });

      await expect(
        compensationService.createCompensationPlan(testOrganizationId as any, invalidPlanData)
      ).rejects.toThrow();
    });

    it('should validate effective date ranges', async () => {
      const invalidPlanData = createMockCompensationPlanRequest({
        effectiveDate: new Date('2024-12-31'),
        expiryDate: new Date('2024-01-01') // Expiry before effective
      });

      await expect(
        compensationService.createCompensationPlan(testOrganizationId as any, invalidPlanData)
      ).rejects.toThrow();
    });

    it('should validate bonus structure', async () => {
      const invalidPlanData = createMockCompensationPlanRequest({
        bonusStructure: {
          type: 'percentage',
          percentage: -5 // Negative percentage
        }
      });

      await expect(
        compensationService.createCompensationPlan(testOrganizationId as any, invalidPlanData)
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent employee assignment', async () => {
      const fakeEmployeeId = createMockOrganizationId();
      const planData = createMockCompensationPlanRequest();
      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        planData
      );

      await expect(
        compensationService.assignCompensationPlan(
          fakeEmployeeId as any,
          plan.id,
          testOrganizationId as any,
          { effectiveDate: new Date(), currentSalary: 80000 }
        )
      ).rejects.toThrow(HRError);
    });

    it('should handle non-existent plan assignment', async () => {
      const employee = testEmployees[0];
      const fakePlanId = createMockOrganizationId();

      await expect(
        compensationService.assignCompensationPlan(
          employee.id,
          fakePlanId as any,
          testOrganizationId as any,
          { effectiveDate: new Date(), currentSalary: 80000 }
        )
      ).rejects.toThrow(HRError);
    });

    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the connection to simulate error
      await dataSource.destroy();

      const planData = createMockCompensationPlanRequest();

      await expect(
        compensationService.createCompensationPlan(testOrganizationId as any, planData)
      ).rejects.toThrow();

      // Restore connection for cleanup
      dataSource = (global as any).testDataSource;
    });
  });
});
