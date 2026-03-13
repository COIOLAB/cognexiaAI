// Industry 5.0 ERP Backend - HR Module End-to-End Integration Tests
// Complete workflow tests involving multiple HR services
// Author: AI Assistant
// Date: 2024

import { DataSource } from 'typeorm';
import { EmployeeServiceImpl } from '../services/employee.service';
import { PayrollService } from '../services/payroll.service';
import { CompensationService } from '../services/compensation.service';
import { PerformanceService } from '../services/performance.service';
import {
  createMockOrganizationId,
  createMockEmployeeRequest,
  createMockPayrollRunRequest,
  createMockCompensationPlanRequest,
  expectEmployeeMatch,
  expectPayrollRunMatch
} from '../../../test/helpers/hr.helpers';
import {
  EmploymentType,
  PayrollStatus,
  PerformanceRating
} from '../types';

describe('HR Module End-to-End Integration Tests', () => {
  let dataSource: DataSource;
  let employeeService: EmployeeServiceImpl;
  let payrollService: PayrollService;
  let compensationService: CompensationService;
  let performanceService: PerformanceService;
  let testOrganizationId: string;

  beforeAll(async () => {
    dataSource = (global as any).testDataSource;
    testOrganizationId = createMockOrganizationId();
    
    employeeService = new EmployeeServiceImpl();
    payrollService = new PayrollService();
    compensationService = new CompensationService();
    performanceService = new PerformanceService();

    // Create test organization
    const organizationRepository = dataSource.getRepository('OrganizationEntity');
    const organization = organizationRepository.create({
      id: testOrganizationId,
      name: 'Test E2E Organization',
      code: 'TEST_E2E_ORG',
      type: 'company',
      industry: 'technology',
      country: 'US',
      currency: 'USD',
      isActive: true
    });
    await organizationRepository.save(organization);
  });

  afterAll(async () => {
    // Cleanup all test data
    const organizationRepository = dataSource.getRepository('OrganizationEntity');
    await organizationRepository.delete(testOrganizationId);
  });

  beforeEach(async () => {
    // Clean up all HR data before each test
    const repositories = [
      'EmployeeEntity',
      'CompensationPlanEntity',
      'EmployeeCompensationEntity',
      'PayrollRunEntity',
      'PayrollRecordEntity',
      'PerformanceReviewEntity'
    ];

    for (const repo of repositories) {
      const repository = dataSource.getRepository(repo);
      await repository.query(`DELETE FROM ${repo.toLowerCase().replace('entity', 's')} WHERE organization_id = $1`, [testOrganizationId]);
    }
  });

  describe('Complete Employee Lifecycle', () => {
    it('should handle complete employee onboarding workflow', async () => {
      // Step 1: Create compensation plan
      const compensationPlanData = createMockCompensationPlanRequest({
        name: 'Software Engineer Level 2',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        baseSalary: { min: 80000, max: 120000, currency: 'USD' },
        bonusStructure: {
          type: 'percentage',
          percentage: 15,
          maxAmount: 18000
        }
      });

      const compensationPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        compensationPlanData
      );

      expect(compensationPlan).toBeDefined();
      expect(compensationPlan.name).toBe('Software Engineer Level 2');

      // Step 2: Create employee
      const employeeData = createMockEmployeeRequest({
        firstName: 'John',
        lastName: 'Doe',
        workEmail: 'john.doe.e2e@company.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        baseSalary: 95000,
        hireDate: new Date('2024-01-15')
      });

      const employee = await employeeService.create(testOrganizationId as any, employeeData);

      expect(employee).toBeDefined();
      expectEmployeeMatch(employee, employeeData);

      // Step 3: Assign compensation plan
      const compensation = await compensationService.assignCompensationPlan(
        employee.id,
        compensationPlan.id,
        testOrganizationId as any,
        {
          effectiveDate: new Date('2024-01-15'),
          currentSalary: 95000,
          notes: 'Initial hire compensation'
        }
      );

      expect(compensation).toBeDefined();
      expect(compensation.currentSalary).toBe(95000);
      expect(compensation.compensationPlanId).toBe(compensationPlan.id);

      // Step 4: Verify employee can be retrieved with compensation
      const employeeWithCompensation = await compensationService.getEmployeeCompensation(
        employee.id,
        testOrganizationId as any
      );

      expect(employeeWithCompensation).toBeDefined();
      expect(employeeWithCompensation?.compensationPlan.name).toBe('Software Engineer Level 2');
    });

    it('should handle employee promotion workflow', async () => {
      // Setup: Create employee and initial compensation
      const initialPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          name: 'Junior Engineer',
          jobTitle: 'Junior Software Engineer',
          baseSalary: { min: 60000, max: 80000, currency: 'USD' }
        })
      );

      const employee = await employeeService.create(
        testOrganizationId as any,
        createMockEmployeeRequest({
          workEmail: 'promotion.test@company.com',
          jobTitle: 'Junior Software Engineer',
          baseSalary: 70000
        })
      );

      await compensationService.assignCompensationPlan(
        employee.id,
        initialPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date('2024-01-01'), currentSalary: 70000 }
      );

      // Promotion: Create senior plan
      const seniorPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          name: 'Senior Engineer',
          jobTitle: 'Senior Software Engineer',
          baseSalary: { min: 90000, max: 130000, currency: 'USD' },
          bonusStructure: {
            type: 'percentage',
            percentage: 20,
            maxAmount: 26000
          }
        })
      );

      // Update employee title and salary
      const promotedEmployee = await employeeService.update(employee.id, {
        jobTitle: 'Senior Software Engineer',
        baseSalary: 105000
      });

      expect(promotedEmployee.jobTitle).toBe('Senior Software Engineer');
      expect(promotedEmployee.baseSalary).toBe(105000);

      // Remove old compensation plan
      await compensationService.removeCompensationPlan(employee.id, testOrganizationId as any);

      // Assign new compensation plan
      const newCompensation = await compensationService.assignCompensationPlan(
        employee.id,
        seniorPlan.id,
        testOrganizationId as any,
        {
          effectiveDate: new Date('2024-06-01'),
          currentSalary: 105000,
          notes: 'Promotion to Senior Engineer'
        }
      );

      expect(newCompensation.currentSalary).toBe(105000);
      expect(newCompensation.compensationPlanId).toBe(seniorPlan.id);

      // Verify promotion is reflected in compensation calculation
      const calculation = await compensationService.calculateCompensation(
        employee.id,
        testOrganizationId as any,
        { includeBonus: true, includeBenefits: false, performanceMultiplier: 1.0 }
      );

      expect(calculation.baseSalary).toBe(105000);
      expect(calculation.bonus).toBe(21000); // 20% of 105000
    });
  });

  describe('Payroll Processing Workflow', () => {
    it('should process end-to-end payroll for multiple employees', async () => {
      // Setup: Create multiple employees with different compensation
      const employees = [];
      const compensationPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          name: 'Standard Engineer Plan',
          bonusStructure: {
            type: 'percentage',
            percentage: 10,
            maxAmount: 12000
          }
        })
      );

      const employeeData = [
        { workEmail: 'emp1.payroll@company.com', firstName: 'Alice', baseSalary: 80000 },
        { workEmail: 'emp2.payroll@company.com', firstName: 'Bob', baseSalary: 90000 },
        { workEmail: 'emp3.payroll@company.com', firstName: 'Carol', baseSalary: 85000 }
      ];

      for (const data of employeeData) {
        const employee = await employeeService.create(
          testOrganizationId as any,
          createMockEmployeeRequest(data)
        );
        
        await compensationService.assignCompensationPlan(
          employee.id,
          compensationPlan.id,
          testOrganizationId as any,
          { effectiveDate: new Date('2024-01-01'), currentSalary: data.baseSalary }
        );
        
        employees.push(employee);
      }

      // Create payroll run
      const payrollRunData = createMockPayrollRunRequest({
        name: 'January 2024 Payroll',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        includeBonus: true
      });

      const payrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any,
        payrollRunData
      );

      expect(payrollRun).toBeDefined();
      expect(payrollRun.status).toBe(PayrollStatus.DRAFT);

      // Process payroll
      const processedRun = await payrollService.processPayrollRun(
        payrollRun.id,
        testOrganizationId as any
      );

      expect(processedRun.status).toBe(PayrollStatus.PROCESSED);
      expect(processedRun.totalEmployees).toBe(3);
      expect(processedRun.totalGrossPay).toBeGreaterThan(0);

      // Verify individual payroll records
      const payrollRecords = await payrollService.listPayrollRecords(
        testOrganizationId as any,
        { page: 1, limit: 10, filters: { payrollRunId: payrollRun.id } }
      );

      expect(payrollRecords.items).toHaveLength(3);
      
      // Verify each employee has correct calculations
      for (const record of payrollRecords.items) {
        expect(record.grossPay).toBeGreaterThan(0);
        expect(record.netPay).toBeGreaterThan(0);
        expect(record.netPay).toBeLessThan(record.grossPay);
        expect(record.bonusAmount).toBeGreaterThan(0); // Bonus included
      }

      // Approve payroll
      const approverEmployee = employees[0];
      const approvedRun = await payrollService.approvePayrollRun(
        payrollRun.id,
        approverEmployee.id,
        testOrganizationId as any
      );

      expect(approvedRun.status).toBe(PayrollStatus.APPROVED);
      expect(approvedRun.approvedBy).toBe(approverEmployee.id);
      expect(approvedRun.approvedDate).toBeDefined();
    });

    it('should handle payroll with performance-based bonuses', async () => {
      // Setup employee with performance review
      const employee = await employeeService.create(
        testOrganizationId as any,
        createMockEmployeeRequest({
          workEmail: 'performance.payroll@company.com',
          baseSalary: 100000
        })
      );

      const compensationPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          bonusStructure: {
            type: 'percentage',
            percentage: 15,
            maxAmount: 20000
          }
        })
      );

      await compensationService.assignCompensationPlan(
        employee.id,
        compensationPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date('2024-01-01'), currentSalary: 100000 }
      );

      // Create performance review (high performer)
      const performanceReview = await performanceService.createPerformanceReview({
        employeeId: employee.id,
        reviewerId: employee.id,
        organizationId: testOrganizationId as any,
        reviewPeriodStart: new Date('2023-07-01'),
        reviewPeriodEnd: new Date('2023-12-31'),
        overallRating: PerformanceRating.EXCEEDS_EXPECTATIONS,
        goals: [],
        feedback: 'Exceptional performance',
        developmentPlan: []
      });

      expect(performanceReview).toBeDefined();

      // Calculate compensation with performance multiplier
      const calculation = await compensationService.calculateCompensation(
        employee.id,
        testOrganizationId as any,
        {
          includeBonus: true,
          includeBenefits: false,
          performanceMultiplier: 1.3 // 30% performance bonus
        }
      );

      expect(calculation.bonus).toBe(19500); // 15% * 100000 * 1.3
      expect(calculation.totalCompensation).toBe(119500);

      // Create and process payroll with performance bonus
      const payrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any,
        createMockPayrollRunRequest({
          name: 'Performance Bonus Payroll',
          includeBonus: true
        })
      );

      const processedRun = await payrollService.processPayrollRun(
        payrollRun.id,
        testOrganizationId as any
      );

      expect(processedRun.status).toBe(PayrollStatus.PROCESSED);
      expect(processedRun.totalGrossPay).toBeGreaterThan(100000 / 12); // Monthly + bonus

      // Verify payroll record includes performance bonus
      const payrollRecords = await payrollService.listPayrollRecords(
        testOrganizationId as any,
        { page: 1, limit: 1, filters: { employeeId: employee.id } }
      );

      const record = payrollRecords.items[0];
      expect(record.bonusAmount).toBeGreaterThan(0);
    });
  });

  describe('Manager-Employee Hierarchy Workflows', () => {
    it('should handle manager reporting relationships in payroll', async () => {
      // Create manager
      const manager = await employeeService.create(
        testOrganizationId as any,
        createMockEmployeeRequest({
          workEmail: 'manager.hierarchy@company.com',
          firstName: 'Manager',
          lastName: 'Smith',
          jobTitle: 'Engineering Manager',
          baseSalary: 120000
        })
      );

      // Create team members reporting to manager
      const teamMembers = [];
      for (let i = 1; i <= 3; i++) {
        const member = await employeeService.create(
          testOrganizationId as any,
          createMockEmployeeRequest({
            workEmail: `member${i}.hierarchy@company.com`,
            firstName: `Member${i}`,
            managerId: manager.id,
            baseSalary: 80000 + (i * 5000)
          })
        );
        teamMembers.push(member);
      }

      // Create compensation plans and assign
      const managerPlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          name: 'Manager Plan',
          jobTitle: 'Engineering Manager',
          bonusStructure: { type: 'percentage', percentage: 25 }
        })
      );

      const employeePlan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest({
          name: 'Employee Plan',
          jobTitle: 'Software Engineer',
          bonusStructure: { type: 'percentage', percentage: 15 }
        })
      );

      await compensationService.assignCompensationPlan(
        manager.id,
        managerPlan.id,
        testOrganizationId as any,
        { effectiveDate: new Date(), currentSalary: 120000 }
      );

      for (const member of teamMembers) {
        await compensationService.assignCompensationPlan(
          member.id,
          employeePlan.id,
          testOrganizationId as any,
          { effectiveDate: new Date(), currentSalary: member.baseSalary }
        );
      }

      // Verify manager-employee relationships
      const directReports = await employeeService.getDirectReports(manager.id);
      expect(directReports).toHaveLength(3);

      for (const member of teamMembers) {
        const hierarchy = await employeeService.getManagerHierarchy(member.id);
        expect(hierarchy).toHaveLength(1);
        expect(hierarchy[0].id).toBe(manager.id);
      }

      // Process payroll for entire team
      const payrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any,
        createMockPayrollRunRequest({
          name: 'Team Payroll',
          includeBonus: true
        })
      );

      const processedRun = await payrollService.processPayrollRun(
        payrollRun.id,
        testOrganizationId as any
      );

      expect(processedRun.totalEmployees).toBe(4); // Manager + 3 team members

      // Manager should approve the payroll
      const approvedRun = await payrollService.approvePayrollRun(
        payrollRun.id,
        manager.id,
        testOrganizationId as any
      );

      expect(approvedRun.approvedBy).toBe(manager.id);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle employee termination workflow', async () => {
      // Create employee
      const employee = await employeeService.create(
        testOrganizationId as any,
        createMockEmployeeRequest({
          workEmail: 'termination.test@company.com'
        })
      );

      // Assign compensation
      const plan = await compensationService.createCompensationPlan(
        testOrganizationId as any,
        createMockCompensationPlanRequest()
      );

      await compensationService.assignCompensationPlan(
        employee.id,
        plan.id,
        testOrganizationId as any,
        { effectiveDate: new Date(), currentSalary: 80000 }
      );

      // Process payroll before termination
      const payrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any,
        createMockPayrollRunRequest({
          name: 'Pre-Termination Payroll'
        })
      );

      await payrollService.processPayrollRun(payrollRun.id, testOrganizationId as any);

      // Terminate employee (deactivate)
      const terminatedEmployee = await employeeService.update(employee.id, {
        employmentStatus: 'terminated',
        isActive: false
      });

      expect(terminatedEmployee.employmentStatus).toBe('terminated');
      expect(terminatedEmployee.isActive).toBe(false);

      // Remove compensation
      await compensationService.removeCompensationPlan(
        employee.id,
        testOrganizationId as any
      );

      // Verify employee is excluded from future payroll
      const futurePayrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any,
        createMockPayrollRunRequest({
          name: 'Post-Termination Payroll',
          payPeriodStart: new Date('2024-02-01'),
          payPeriodEnd: new Date('2024-02-29')
        })
      );

      const processedFutureRun = await payrollService.processPayrollRun(
        futurePayrollRun.id,
        testOrganizationId as any
      );

      expect(processedFutureRun.totalEmployees).toBe(0); // No active employees
    });
  });
});
