// Industry 5.0 ERP Backend - Payroll Service Integration Tests
// Full integration tests for payroll management functionality
// Author: AI Assistant
// Date: 2024

import { DataSource, Repository } from 'typeorm';
import { PayrollService } from '../services/payroll.service';
import { PayrollRunEntity } from '../entities/payroll-run.entity';
import { PayrollRecordEntity } from '../entities/payroll-record.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import { OrganizationEntity } from '../../core/entities/organization.entity';
import {
  createMockOrganizationId,
  createMockPayrollRunRequest,
  createMockPayrollRun,
  expectPayrollRunMatch,
  createMockEmployeeRequest,
  createDateRange
} from '../../../test/helpers/hr.helpers';
import {
  PayrollStatus,
  CreatePayrollRunRequest,
  CreateTaxRuleRequest
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';

describe('Payroll Service Integration Tests', () => {
  let dataSource: DataSource;
  let payrollService: PayrollService;
  let payrollRunRepository: Repository<PayrollRunEntity>;
  let payrollRecordRepository: Repository<PayrollRecordEntity>;
  let employeeRepository: Repository<EmployeeEntity>;
  let organizationRepository: Repository<OrganizationEntity>;
  let testOrganizationId: string;
  let testEmployees: any[] = [];

  beforeAll(async () => {
    // Use global test database connection
    dataSource = (global as any).testDataSource;
    payrollRunRepository = dataSource.getRepository(PayrollRunEntity);
    payrollRecordRepository = dataSource.getRepository(PayrollRecordEntity);
    employeeRepository = dataSource.getRepository(EmployeeEntity);
    organizationRepository = dataSource.getRepository(OrganizationEntity);
    
    // Create test organization
    const organization = organizationRepository.create({
      name: 'Test Payroll Organization',
      code: 'TEST_PAYROLL_ORG',
      type: 'company',
      industry: 'technology',
      country: 'US',
      currency: 'USD',
      isActive: true
    });
    const savedOrg = await organizationRepository.save(organization);
    testOrganizationId = savedOrg.id;
    
    payrollService = new PayrollService();
  });

  afterAll(async () => {
    // Clean up test data
    await payrollRecordRepository.query('DELETE FROM payroll_records WHERE organization_id = $1', [testOrganizationId]);
    await payrollRunRepository.query('DELETE FROM payroll_runs WHERE organization_id = $1', [testOrganizationId]);
    await employeeRepository.query('DELETE FROM employees WHERE organization_id = $1', [testOrganizationId]);
    await organizationRepository.delete(testOrganizationId);
  });

  beforeEach(async () => {
    // Clean up payroll data before each test
    await payrollRecordRepository.query('DELETE FROM payroll_records WHERE organization_id = $1', [testOrganizationId]);
    await payrollRunRepository.query('DELETE FROM payroll_runs WHERE organization_id = $1', [testOrganizationId]);
    
    // Create test employees for payroll processing
    const employeeData = [
      { workEmail: 'payroll.emp1@company.com', firstName: 'John', lastName: 'Doe', baseSalary: 80000 },
      { workEmail: 'payroll.emp2@company.com', firstName: 'Jane', lastName: 'Smith', baseSalary: 90000 },
      { workEmail: 'payroll.emp3@company.com', firstName: 'Mike', lastName: 'Wilson', baseSalary: 75000 }
    ];

    testEmployees = [];
    for (const emp of employeeData) {
      const employee = employeeRepository.create({
        organizationId: testOrganizationId,
        employeeNumber: `EMP-TEST-${Math.random().toString().slice(2, 8)}`,
        ...createMockEmployeeRequest(emp)
      });
      const savedEmp = await employeeRepository.save(employee);
      testEmployees.push(savedEmp);
    }
  });

  describe('Payroll Run Creation', () => {
    it('should create a new payroll run', async () => {
      const payrollRunData = createMockPayrollRunRequest({
        name: 'Test Payroll Run',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-05')
      });

      const payrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData
      );

      expect(payrollRun).toBeDefined();
      expect(payrollRun.id).toBeDefined();
      expect(payrollRun.organizationId).toBe(testOrganizationId);
      expectPayrollRunMatch(payrollRun, payrollRunData);
      expect(payrollRun.status).toBe(PayrollStatus.DRAFT);
      
      // Verify payroll run was saved to database
      const savedRun = await payrollRunRepository.findOne({ 
        where: { id: payrollRun.id } 
      });
      expect(savedRun).toBeDefined();
      expect(savedRun?.name).toBe(payrollRunData.name);
    });

    it('should reject overlapping payroll periods', async () => {
      // Create first payroll run
      const payrollRunData1 = createMockPayrollRunRequest({
        name: 'First Payroll Run',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31')
      });
      await payrollService.createPayrollRun(testOrganizationId as any, payrollRunData1);

      // Try to create overlapping payroll run
      const payrollRunData2 = createMockPayrollRunRequest({
        name: 'Overlapping Payroll Run',
        payPeriodStart: new Date('2024-01-15'),
        payPeriodEnd: new Date('2024-02-15')
      });

      await expect(
        payrollService.createPayrollRun(testOrganizationId as any, payrollRunData2)
      ).rejects.toThrow(HRError);

      await expect(
        payrollService.createPayrollRun(testOrganizationId as any, payrollRunData2)
      ).rejects.toMatchObject({
        code: HRErrorCodes.PAYROLL_PERIOD_OVERLAP
      });
    });

    it('should allow non-overlapping payroll periods', async () => {
      // Create first payroll run
      const payrollRunData1 = createMockPayrollRunRequest({
        name: 'January Payroll',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31')
      });
      await payrollService.createPayrollRun(testOrganizationId as any, payrollRunData1);

      // Create non-overlapping payroll run
      const payrollRunData2 = createMockPayrollRunRequest({
        name: 'February Payroll',
        payPeriodStart: new Date('2024-02-01'),
        payPeriodEnd: new Date('2024-02-29')
      });

      const payrollRun2 = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData2
      );

      expect(payrollRun2).toBeDefined();
      expect(payrollRun2.name).toBe('February Payroll');
    });
  });

  describe('Payroll Run Processing', () => {
    let testPayrollRun: any;

    beforeEach(async () => {
      const payrollRunData = createMockPayrollRunRequest({
        name: 'Test Processing Run',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31')
      });
      testPayrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData
      );
    });

    it('should process a draft payroll run', async () => {
      const processedRun = await payrollService.processPayrollRun(
        testPayrollRun.id,
        testOrganizationId as any
      );

      expect(processedRun.status).toBe(PayrollStatus.PROCESSED);
      expect(processedRun.processedDate).toBeDefined();
      expect(processedRun.totalEmployees).toBe(testEmployees.length);
      
      // Verify payroll records were created for each employee
      const payrollRecords = await payrollRecordRepository.find({
        where: { payrollRunId: testPayrollRun.id }
      });
      expect(payrollRecords).toHaveLength(testEmployees.length);
    });

    it('should reject processing non-draft payroll runs', async () => {
      // First process the run
      await payrollService.processPayrollRun(testPayrollRun.id, testOrganizationId as any);

      // Try to process again
      await expect(
        payrollService.processPayrollRun(testPayrollRun.id, testOrganizationId as any)
      ).rejects.toThrow(HRError);

      await expect(
        payrollService.processPayrollRun(testPayrollRun.id, testOrganizationId as any)
      ).rejects.toMatchObject({
        code: HRErrorCodes.INVALID_PAYROLL_STATUS
      });
    });

    it('should calculate correct payroll amounts', async () => {
      const processedRun = await payrollService.processPayrollRun(
        testPayrollRun.id,
        testOrganizationId as any
      );

      // Calculate expected totals
      const expectedGrossPay = testEmployees.reduce((sum, emp) => sum + (emp.baseSalary / 12), 0);
      
      expect(processedRun.totalGrossPay).toBeCloseTo(expectedGrossPay, 2);
      expect(processedRun.totalNetPay).toBeGreaterThan(0);
      expect(processedRun.totalNetPay).toBeLessThan(processedRun.totalGrossPay);
    });

    it('should reject processing non-existent payroll runs', async () => {
      const fakeId = createMockOrganizationId();

      await expect(
        payrollService.processPayrollRun(fakeId as any, testOrganizationId as any)
      ).rejects.toThrow(HRError);

      await expect(
        payrollService.processPayrollRun(fakeId as any, testOrganizationId as any)
      ).rejects.toMatchObject({
        code: HRErrorCodes.PAYROLL_RUN_NOT_FOUND
      });
    });
  });

  describe('Payroll Run Approval', () => {
    let testPayrollRun: any;
    let approverEmployeeId: any;

    beforeEach(async () => {
      const payrollRunData = createMockPayrollRunRequest();
      testPayrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData
      );
      
      // Process the run first
      await payrollService.processPayrollRun(testPayrollRun.id, testOrganizationId as any);
      
      approverEmployeeId = testEmployees[0].id;
    });

    it('should approve a processed payroll run', async () => {
      const approvedRun = await payrollService.approvePayrollRun(
        testPayrollRun.id,
        approverEmployeeId,
        testOrganizationId as any
      );

      expect(approvedRun.status).toBe(PayrollStatus.APPROVED);
      expect(approvedRun.approvedBy).toBe(approverEmployeeId);
      expect(approvedRun.approvedDate).toBeDefined();
    });

    it('should reject approval of non-processed payroll runs', async () => {
      // Create a new draft run
      const draftRunData = createMockPayrollRunRequest({
        payPeriodStart: new Date('2024-02-01'),
        payPeriodEnd: new Date('2024-02-29')
      });
      const draftRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        draftRunData
      );

      await expect(
        payrollService.approvePayrollRun(
          draftRun.id,
          approverEmployeeId,
          testOrganizationId as any
        )
      ).rejects.toThrow(HRError);

      await expect(
        payrollService.approvePayrollRun(
          draftRun.id,
          approverEmployeeId,
          testOrganizationId as any
        )
      ).rejects.toMatchObject({
        code: HRErrorCodes.INVALID_PAYROLL_STATUS
      });
    });
  });

  describe('Payroll Run Retrieval', () => {
    let testPayrollRun: any;

    beforeEach(async () => {
      const payrollRunData = createMockPayrollRunRequest({
        name: 'Retrieval Test Run'
      });
      testPayrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData
      );
    });

    it('should get payroll run by ID', async () => {
      const retrievedRun = await payrollService.getPayrollRunById(
        testPayrollRun.id,
        testOrganizationId as any
      );

      expect(retrievedRun).toBeDefined();
      expect(retrievedRun?.id).toBe(testPayrollRun.id);
      expect(retrievedRun?.name).toBe('Retrieval Test Run');
    });

    it('should return null for non-existent payroll run', async () => {
      const fakeId = createMockOrganizationId();
      const retrievedRun = await payrollService.getPayrollRunById(
        fakeId as any,
        testOrganizationId as any
      );

      expect(retrievedRun).toBeNull();
    });

    it('should return null for payroll run from different organization', async () => {
      const otherOrgId = createMockOrganizationId();
      const retrievedRun = await payrollService.getPayrollRunById(
        testPayrollRun.id,
        otherOrgId as any
      );

      expect(retrievedRun).toBeNull();
    });
  });

  describe('Payroll Run Listing', () => {
    beforeEach(async () => {
      // Create multiple payroll runs for testing
      const payrollRuns = [
        { name: 'January 2024', payPeriodStart: new Date('2024-01-01'), payPeriodEnd: new Date('2024-01-31') },
        { name: 'February 2024', payPeriodStart: new Date('2024-02-01'), payPeriodEnd: new Date('2024-02-29') },
        { name: 'March 2024', payPeriodStart: new Date('2024-03-01'), payPeriodEnd: new Date('2024-03-31') }
      ];

      for (const runData of payrollRuns) {
        const payrollRunData = createMockPayrollRunRequest(runData);
        await payrollService.createPayrollRun(testOrganizationId as any, payrollRunData);
      }
    });

    it('should list payroll runs with pagination', async () => {
      const result = await payrollService.listPayrollRuns(testOrganizationId as any, {
        page: 1,
        limit: 2
      });

      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it('should filter payroll runs by status', async () => {
      // Process one payroll run
      const runs = await payrollService.listPayrollRuns(testOrganizationId as any, {
        page: 1,
        limit: 10
      });
      await payrollService.processPayrollRun(runs.items[0].id, testOrganizationId as any);

      // Filter by processed status
      const result = await payrollService.listPayrollRuns(testOrganizationId as any, {
        page: 1,
        limit: 10,
        filters: { status: PayrollStatus.PROCESSED }
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe(PayrollStatus.PROCESSED);
    });
  });

  describe('Payroll Records', () => {
    let testPayrollRun: any;
    let testPayrollRecord: any;

    beforeEach(async () => {
      const payrollRunData = createMockPayrollRunRequest();
      testPayrollRun = await payrollService.createPayrollRun(
        testOrganizationId as any, 
        payrollRunData
      );
      
      // Process to create payroll records
      await payrollService.processPayrollRun(testPayrollRun.id, testOrganizationId as any);
      
      const records = await payrollRecordRepository.find({
        where: { payrollRunId: testPayrollRun.id }
      });
      testPayrollRecord = records[0];
    });

    it('should get payroll record by ID', async () => {
      const retrievedRecord = await payrollService.getPayrollRecord(
        testPayrollRecord.id,
        testOrganizationId as any
      );

      expect(retrievedRecord).toBeDefined();
      expect(retrievedRecord?.id).toBe(testPayrollRecord.id);
      expect(retrievedRecord?.employeeId).toBeDefined();
      expect(retrievedRecord?.grossPay).toBeGreaterThan(0);
    });

    it('should list payroll records with pagination', async () => {
      const result = await payrollService.listPayrollRecords(testOrganizationId as any, {
        page: 1,
        limit: 2
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.totalItems).toBe(testEmployees.length);
    });

    it('should get employee payroll history', async () => {
      const employeeId = testEmployees[0].id;
      const history = await payrollService.getEmployeePayrollHistory(
        employeeId,
        testOrganizationId as any,
        2024
      );

      expect(history).toHaveLength(1);
      expect(history[0].employeeId).toBe(employeeId);
      expect(history[0].grossPay).toBeGreaterThan(0);
    });
  });

  describe('Tax Rules Management', () => {
    it('should create a tax rule', async () => {
      const taxRuleData: CreateTaxRuleRequest = {
        name: 'Federal Income Tax',
        description: 'Federal income tax calculation',
        taxType: 'income',
        jurisdiction: 'federal',
        country: 'US',
        rate: 22,
        isPercentage: true,
        minAmount: 0,
        maxAmount: null,
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        isActive: true,
        brackets: [
          { min: 0, max: 19900, rate: 10 },
          { min: 19901, max: 81050, rate: 12 },
          { min: 81051, max: 172750, rate: 22 }
        ]
      };

      const taxRule = await payrollService.createTaxRule(testOrganizationId as any, taxRuleData);

      expect(taxRule).toBeDefined();
      expect(taxRule.id).toBeDefined();
      expect(taxRule.name).toBe(taxRuleData.name);
      expect(taxRule.rate).toBe(taxRuleData.rate);
      expect(taxRule.brackets).toEqual(taxRuleData.brackets);
    });

    it('should update a tax rule', async () => {
      const taxRuleData: CreateTaxRuleRequest = {
        name: 'State Tax',
        taxType: 'income',
        jurisdiction: 'state',
        country: 'US',
        rate: 5,
        isPercentage: true,
        effectiveDate: new Date('2024-01-01'),
        isActive: true
      };

      const taxRule = await payrollService.createTaxRule(testOrganizationId as any, taxRuleData);
      
      const updatedRule = await payrollService.updateTaxRule(taxRule.id, {
        rate: 6,
        name: 'Updated State Tax'
      });

      expect(updatedRule.rate).toBe(6);
      expect(updatedRule.name).toBe('Updated State Tax');
    });

    it('should list tax rules with filtering', async () => {
      // Create multiple tax rules
      const taxRules = [
        { name: 'Federal Tax', taxType: 'income', rate: 22 },
        { name: 'State Tax', taxType: 'income', rate: 5 },
        { name: 'Social Security', taxType: 'social_security', rate: 6.2 }
      ];

      for (const rule of taxRules) {
        const taxRuleData: CreateTaxRuleRequest = {
          ...rule,
          jurisdiction: 'federal',
          country: 'US',
          isPercentage: true,
          effectiveDate: new Date('2024-01-01'),
          isActive: true
        };
        await payrollService.createTaxRule(testOrganizationId as any, taxRuleData);
      }

      const result = await payrollService.listTaxRules(testOrganizationId as any, {
        page: 1,
        limit: 10,
        filters: { taxType: 'income' }
      });

      expect(result.items).toHaveLength(2);
      expect(result.items.every(rule => rule.taxType === 'income')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payroll run data', async () => {
      const invalidData: any = {
        name: '', // Empty name should fail validation
        payPeriodStart: new Date('2024-01-31'),
        payPeriodEnd: new Date('2024-01-01'), // End before start
        payDate: new Date('2023-12-31') // Pay date before period
      };

      await expect(
        payrollService.createPayrollRun(testOrganizationId as any, invalidData)
      ).rejects.toThrow();
    });

    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the connection to simulate error
      await dataSource.destroy();

      const payrollRunData = createMockPayrollRunRequest();

      await expect(
        payrollService.createPayrollRun(testOrganizationId as any, payrollRunData)
      ).rejects.toThrow();

      // Restore connection for cleanup
      dataSource = (global as any).testDataSource;
    });
  });
});
