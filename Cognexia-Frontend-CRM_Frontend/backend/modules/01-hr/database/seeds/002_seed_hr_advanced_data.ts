import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class SeedHRAdvancedData {
  
  static async seed(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.startTransaction();
      
      logger.info('🌱 Seeding Advanced HR Data...');

      // Get organizations and employees
      const organizations = await this.getOrganizations(queryRunner);
      const employees = await this.getEmployees(queryRunner);

      // 1. Create Compensation Plans
      const compensationPlans = await this.seedCompensationPlans(queryRunner, organizations);
      logger.info(`✅ Created ${compensationPlans.length} compensation plans`);

      // 2. Create Salary Structures
      const salaryStructures = await this.seedSalaryStructures(queryRunner, organizations);
      logger.info(`✅ Created ${salaryStructures.length} salary structures`);

      // 3. Create Benefits Plans
      const benefitsPlans = await this.seedBenefitsPlans(queryRunner, organizations);
      logger.info(`✅ Created ${benefitsPlans.length} benefits plans`);

      // 4. Create Employee Compensations
      const employeeCompensations = await this.seedEmployeeCompensations(queryRunner, organizations, employees, compensationPlans);
      logger.info(`✅ Created ${employeeCompensations.length} employee compensations`);

      // 5. Create Benefits Enrollments
      const benefitsEnrollments = await this.seedBenefitsEnrollments(queryRunner, organizations, employees, benefitsPlans);
      logger.info(`✅ Created ${benefitsEnrollments.length} benefits enrollments`);

      // 6. Create Tax Rules
      const taxRules = await this.seedTaxRules(queryRunner, organizations);
      logger.info(`✅ Created ${taxRules.length} tax rules`);

      // 7. Create Performance Reviews
      const performanceReviews = await this.seedPerformanceReviews(queryRunner, organizations, employees);
      logger.info(`✅ Created ${performanceReviews.length} performance reviews`);

      await queryRunner.commitTransaction();
      logger.info('🎉 Advanced HR seed data created successfully!');
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('❌ Failed to seed advanced HR data:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private static async getOrganizations(queryRunner: any): Promise<any[]> {
    const result = await queryRunner.query('SELECT * FROM organizations WHERE is_active = true');
    return result;
  }

  private static async getEmployees(queryRunner: any): Promise<any[]> {
    const result = await queryRunner.query('SELECT * FROM employees WHERE is_active = true');
    return result;
  }

  private static async seedCompensationPlans(queryRunner: any, organizations: any[]): Promise<any[]> {
    const plans = [];

    for (const org of organizations) {
      const orgPlans = [
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Executive Compensation Plan',
          description: 'Comprehensive compensation plan for C-level executives',
          type: 'salary',
          baseSalary: 5000000.00,
          currency: 'INR',
          components: JSON.stringify([
            {
              id: uuidv4(),
              name: 'Performance Bonus',
              type: 'bonus',
              amount: 0,
              percentage: 30,
              frequency: 'annually',
              isTaxable: true,
              isVariable: true,
              conditions: 'Based on company performance metrics'
            },
            {
              id: uuidv4(),
              name: 'Stock Options',
              type: 'equity',
              amount: 500000,
              percentage: 0,
              frequency: 'annually',
              isTaxable: false,
              isVariable: true,
              conditions: '4-year vesting period'
            }
          ]),
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31'),
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            positions: ['CEO', 'CTO', 'CFO'],
            minTenure: 0,
            performanceRating: 4.0
          }),
          totalEmployees: 2,
          totalCost: 13000000.00,
          budgetAllocated: 15000000.00,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Management Compensation Plan',
          description: 'Compensation plan for senior management roles',
          type: 'salary',
          baseSalary: 2500000.00,
          currency: 'INR',
          components: JSON.stringify([
            {
              id: uuidv4(),
              name: 'Performance Bonus',
              type: 'bonus',
              amount: 0,
              percentage: 20,
              frequency: 'annually',
              isTaxable: true,
              isVariable: true,
              conditions: 'Based on department performance'
            },
            {
              id: uuidv4(),
              name: 'Leadership Allowance',
              type: 'allowance',
              amount: 50000,
              percentage: 0,
              frequency: 'monthly',
              isTaxable: true,
              isVariable: false,
              conditions: 'For team management responsibilities'
            }
          ]),
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31'),
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            positions: ['HR-HEAD', 'ENG-MGR'],
            minTenure: 12,
            performanceRating: 3.5
          }),
          totalEmployees: 2,
          totalCost: 6200000.00,
          budgetAllocated: 7000000.00,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Technical Staff Compensation Plan',
          description: 'Compensation plan for technical employees',
          type: 'salary',
          baseSalary: 1200000.00,
          currency: 'INR',
          components: JSON.stringify([
            {
              id: uuidv4(),
              name: 'Technical Bonus',
              type: 'bonus',
              amount: 0,
              percentage: 15,
              frequency: 'annually',
              isTaxable: true,
              isVariable: true,
              conditions: 'Based on project deliveries and code quality'
            },
            {
              id: uuidv4(),
              name: 'Certification Allowance',
              type: 'allowance',
              amount: 25000,
              percentage: 0,
              frequency: 'annually',
              isTaxable: false,
              isVariable: false,
              conditions: 'For professional certifications'
            }
          ]),
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31'),
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            positions: ['SR-SWE', 'SWE'],
            minTenure: 6,
            performanceRating: 3.0
          }),
          totalEmployees: 3,
          totalCost: 4050000.00,
          budgetAllocated: 4500000.00,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      plans.push(...orgPlans);
    }

    for (const plan of plans) {
      await queryRunner.query(
        `INSERT INTO hr_compensation_plans (id, "organizationId", name, description, type, "baseSalary", currency, components, "effectiveDate", "expiryDate", "isActive", "eligibilityCriteria", "totalEmployees", "totalCost", "budgetAllocated", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [plan.id, plan.organizationId, plan.name, plan.description, plan.type, plan.baseSalary, plan.currency, plan.components, plan.effectiveDate, plan.expiryDate, plan.isActive, plan.eligibilityCriteria, plan.totalEmployees, plan.totalCost, plan.budgetAllocated, plan.createdAt, plan.updatedAt]
      );
    }

    return plans;
  }

  private static async seedSalaryStructures(queryRunner: any, organizations: any[]): Promise<any[]> {
    const structures = [];

    for (const org of organizations) {
      const orgStructures = [
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 1,
          gradeName: 'Executive Grade E1',
          minSalary: 5000000.00,
          midSalary: 6500000.00,
          maxSalary: 8000000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 250000.00,
          benefits: ['{"Executive Health Insurance", "Company Car", "Stock Options"}'],
          jobTitles: ['{"CEO", "President"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 36,
            requiredPerformanceRating: 4.5,
            requiredTrainingHours: 40
          }),
          marketMin: 4500000.00,
          marketMedian: 6000000.00,
          marketMax: 8500000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 2,
          gradeName: 'Executive Grade E2',
          minSalary: 4000000.00,
          midSalary: 5000000.00,
          maxSalary: 6000000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 200000.00,
          benefits: ['{"Senior Management Health", "Travel Allowance"}'],
          jobTitles: ['{"CTO", "CFO", "COO"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 30,
            requiredPerformanceRating: 4.2,
            requiredTrainingHours: 35
          }),
          marketMin: 3800000.00,
          marketMedian: 4800000.00,
          marketMax: 6200000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 3,
          gradeName: 'Management Grade M1',
          minSalary: 2500000.00,
          midSalary: 3200000.00,
          maxSalary: 4000000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 150000.00,
          benefits: ['{"Management Health Insurance", "Performance Bonus"}'],
          jobTitles: ['{"HR Head", "Department Head"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 24,
            requiredPerformanceRating: 4.0,
            requiredTrainingHours: 30
          }),
          marketMin: 2400000.00,
          marketMedian: 3100000.00,
          marketMax: 4100000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 4,
          gradeName: 'Management Grade M2',
          minSalary: 1200000.00,
          midSalary: 1500000.00,
          maxSalary: 2000000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 100000.00,
          benefits: ['{"Standard Health Insurance", "Team Lead Bonus"}'],
          jobTitles: ['{"Manager", "Team Lead"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 18,
            requiredPerformanceRating: 3.8,
            requiredTrainingHours: 25
          }),
          marketMin: 1100000.00,
          marketMedian: 1400000.00,
          marketMax: 2100000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 5,
          gradeName: 'Senior Grade S1',
          minSalary: 1200000.00,
          midSalary: 1600000.00,
          maxSalary: 2200000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 100000.00,
          benefits: ['{"Standard Health Insurance", "Technical Allowance"}'],
          jobTitles: ['{"Senior Engineer", "Senior Specialist"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 18,
            requiredPerformanceRating: 3.8,
            requiredTrainingHours: 25
          }),
          marketMin: 1150000.00,
          marketMedian: 1550000.00,
          marketMax: 2300000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          gradeLevel: 6,
          gradeName: 'Junior Grade J1',
          minSalary: 600000.00,
          midSalary: 900000.00,
          maxSalary: 1200000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          stepIncrement: 75000.00,
          benefits: ['{"Basic Health Insurance", "Learning Allowance"}'],
          jobTitles: ['{"Software Engineer", "Associate", "Executive"}'],
          progressionRules: JSON.stringify({
            minTenureForPromotion: 12,
            requiredPerformanceRating: 3.5,
            requiredTrainingHours: 20
          }),
          marketMin: 580000.00,
          marketMedian: 850000.00,
          marketMax: 1250000.00,
          marketDataDate: new Date('2024-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      structures.push(...orgStructures);
    }

    for (const structure of structures) {
      await queryRunner.query(
        `INSERT INTO hr_salary_structures (id, "organizationId", "gradeLevel", "gradeName", "minSalary", "midSalary", "maxSalary", currency, "effectiveDate", "expiryDate", "stepIncrement", benefits, "jobTitles", "progressionRules", "marketMin", "marketMedian", "marketMax", "marketDataDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [structure.id, structure.organizationId, structure.gradeLevel, structure.gradeName, structure.minSalary, structure.midSalary, structure.maxSalary, structure.currency, structure.effectiveDate, structure.expiryDate, structure.stepIncrement, structure.benefits, structure.jobTitles, structure.progressionRules, structure.marketMin, structure.marketMedian, structure.marketMax, structure.marketDataDate, structure.createdAt, structure.updatedAt]
      );
    }

    return structures;
  }

  private static async seedBenefitsPlans(queryRunner: any, organizations: any[]): Promise<any[]> {
    const plans = [];

    for (const org of organizations) {
      const orgPlans = [
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Comprehensive Health Insurance',
          description: 'Complete health insurance coverage including family',
          type: 'health_insurance',
          provider: 'ICICI Lombard',
          cost: 50000.00,
          employerContribution: 45000.00,
          employeeContribution: 5000.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31'),
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            employmentType: ['full_time'],
            minHoursPerWeek: 40,
            minTenure: 3,
            dependentEligibility: {
              spouse: true,
              children: true,
              maxAge: 25
            }
          }),
          benefitDetails: JSON.stringify([
            {
              coverage: 'Hospitalization',
              limit: 500000,
              deductible: 5000,
              copay: 20,
              coinsurance: 80
            },
            {
              coverage: 'OPD Consultation',
              limit: 25000,
              deductible: 0,
              copay: 30,
              coinsurance: 70
            }
          ]),
          enrollmentPeriod: JSON.stringify({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            isOpenEnrollment: true,
            allowMidYearChanges: true,
            qualifyingEvents: ['Marriage', 'Childbirth', 'Adoption']
          }),
          totalEnrollments: 0,
          totalEmployerCost: 0,
          totalEmployeeCost: 0,
          utilizationRate: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Life Insurance Plan',
          description: 'Term life insurance for employees',
          type: 'life_insurance',
          provider: 'LIC of India',
          cost: 12000.00,
          employerContribution: 12000.00,
          employeeContribution: 0.00,
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31'),
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            employmentType: ['full_time', 'part_time'],
            minHoursPerWeek: 20,
            minTenure: 1
          }),
          benefitDetails: JSON.stringify([
            {
              coverage: 'Death Benefit',
              limit: 1000000,
              deductible: 0
            },
            {
              coverage: 'Accidental Death',
              limit: 2000000,
              deductible: 0
            }
          ]),
          enrollmentPeriod: JSON.stringify({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            isOpenEnrollment: true,
            allowMidYearChanges: false
          }),
          totalEnrollments: 0,
          totalEmployerCost: 0,
          totalEmployeeCost: 0,
          utilizationRate: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Provident Fund',
          description: 'Employee Provident Fund as per Indian law',
          type: 'retirement',
          provider: 'EPFO',
          cost: 0.00, // Calculated based on salary
          employerContribution: 0.00, // 12% of basic salary
          employeeContribution: 0.00, // 12% of basic salary
          currency: 'INR',
          effectiveDate: new Date('2024-01-01'),
          expiryDate: null,
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            employmentType: ['full_time'],
            minHoursPerWeek: 40,
            minTenure: 0
          }),
          benefitDetails: JSON.stringify([
            {
              coverage: 'PF Contribution',
              description: '12% employee + 12% employer contribution'
            }
          ]),
          totalEnrollments: 0,
          totalEmployerCost: 0,
          totalEmployeeCost: 0,
          utilizationRate: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      plans.push(...orgPlans);
    }

    for (const plan of plans) {
      await queryRunner.query(
        `INSERT INTO hr_benefits_plans (id, "organizationId", name, description, type, provider, cost, "employerContribution", "employeeContribution", currency, "effectiveDate", "expiryDate", "isActive", "eligibilityCriteria", "benefitDetails", "enrollmentPeriod", "totalEnrollments", "totalEmployerCost", "totalEmployeeCost", "utilizationRate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [plan.id, plan.organizationId, plan.name, plan.description, plan.type, plan.provider, plan.cost, plan.employerContribution, plan.employeeContribution, plan.currency, plan.effectiveDate, plan.expiryDate, plan.isActive, plan.eligibilityCriteria, plan.benefitDetails, plan.enrollmentPeriod, plan.totalEnrollments, plan.totalEmployerCost, plan.totalEmployeeCost, plan.utilizationRate, plan.createdAt, plan.updatedAt]
      );
    }

    return plans;
  }

  private static async seedEmployeeCompensations(queryRunner: any, organizations: any[], employees: any[], compensationPlans: any[]): Promise<any[]> {
    const compensations = [];

    for (const employee of employees) {
      // Determine appropriate compensation plan based on position
      let plan = null;
      if (employee.employee_number.endsWith('001') || employee.employee_number.endsWith('002')) {
        // CEO/CTO - Executive plan
        plan = compensationPlans.find(p => p.organizationId === employee.organization_id && p.name.includes('Executive'));
      } else if (employee.employee_number.endsWith('003') || employee.employee_number.endsWith('005')) {
        // Heads/Managers - Management plan
        plan = compensationPlans.find(p => p.organizationId === employee.organization_id && p.name.includes('Management'));
      } else {
        // Engineers - Technical plan
        plan = compensationPlans.find(p => p.organizationId === employee.organization_id && p.name.includes('Technical'));
      }

      if (plan) {
        const compensation = {
          id: uuidv4(),
          organizationId: employee.organization_id,
          employeeId: employee.id,
          planId: plan.id,
          effectiveDate: new Date('2024-01-01'),
          endDate: null,
          baseSalary: employee.current_salary,
          componentValues: JSON.stringify([
            {
              componentId: uuidv4(),
              actualAmount: employee.current_salary * 0.15, // 15% performance bonus
              calculatedAmount: employee.current_salary * 0.15,
              performanceMultiplier: 1.0
            }
          ]),
          totalCompensation: employee.current_salary + (employee.current_salary * 0.15),
          reason: 'Annual compensation review',
          notes: 'Initial compensation setup based on current market standards',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        compensations.push(compensation);
      }
    }

    for (const comp of compensations) {
      await queryRunner.query(
        `INSERT INTO hr_employee_compensation (id, "organizationId", "employeeId", "planId", "effectiveDate", "endDate", "baseSalary", "componentValues", "totalCompensation", reason, notes, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [comp.id, comp.organizationId, comp.employeeId, comp.planId, comp.effectiveDate, comp.endDate, comp.baseSalary, comp.componentValues, comp.totalCompensation, comp.reason, comp.notes, comp.isActive, comp.createdAt, comp.updatedAt]
      );
    }

    return compensations;
  }

  private static async seedBenefitsEnrollments(queryRunner: any, organizations: any[], employees: any[], benefitsPlans: any[]): Promise<any[]> {
    const enrollments = [];

    for (const employee of employees) {
      const orgPlans = benefitsPlans.filter(p => p.organizationId === employee.organization_id);

      for (const plan of orgPlans) {
        const enrollment = {
          id: uuidv4(),
          organizationId: employee.organization_id,
          employeeId: employee.id,
          planId: plan.id,
          enrollmentDate: new Date('2024-01-15'),
          effectiveDate: new Date('2024-02-01'),
          terminationDate: null,
          status: 'active',
          employeeContribution: plan.employeeContribution,
          employerContribution: plan.employerContribution,
          selectedOption: plan.type === 'health_insurance' ? 'Family Coverage' : 'Standard',
          dependents: plan.type === 'health_insurance' ? JSON.stringify([
            {
              id: uuidv4(),
              name: 'Spouse',
              relationship: 'Spouse',
              dateOfBirth: new Date('1985-01-01'),
              isActive: true
            }
          ]) : null,
          elections: JSON.stringify([
            {
              coverageType: 'Employee + Family',
              coverageLevel: 'Standard',
              amount: plan.cost
            }
          ]),
          requiresEvidenceOfInsurability: false,
          evidenceStatus: 'not_required',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        enrollments.push(enrollment);
      }
    }

    for (const enrollment of enrollments) {
      await queryRunner.query(
        `INSERT INTO hr_benefits_enrollments (id, "organizationId", "employeeId", "planId", "enrollmentDate", "effectiveDate", "terminationDate", status, "employeeContribution", "employerContribution", "selectedOption", dependents, elections, "requiresEvidenceOfInsurability", "evidenceStatus", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [enrollment.id, enrollment.organizationId, enrollment.employeeId, enrollment.planId, enrollment.enrollmentDate, enrollment.effectiveDate, enrollment.terminationDate, enrollment.status, enrollment.employeeContribution, enrollment.employerContribution, enrollment.selectedOption, enrollment.dependents, enrollment.elections, enrollment.requiresEvidenceOfInsurability, enrollment.evidenceStatus, enrollment.createdAt, enrollment.updatedAt]
      );
    }

    return enrollments;
  }

  private static async seedTaxRules(queryRunner: any, organizations: any[]): Promise<any[]> {
    const taxRules = [];

    for (const org of organizations) {
      const orgTaxRules = [
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Income Tax Slab - New Regime',
          description: 'Indian Income Tax as per new tax regime',
          type: 'tiered',
          rate: null,
          fixedAmount: null,
          minAmount: null,
          maxAmount: null,
          tiers: JSON.stringify([
            { minIncome: 0, maxIncome: 300000, rate: 0, fixedAmount: 0 },
            { minIncome: 300000, maxIncome: 600000, rate: 0.05, fixedAmount: 0 },
            { minIncome: 600000, maxIncome: 900000, rate: 0.10, fixedAmount: 15000 },
            { minIncome: 900000, maxIncome: 1200000, rate: 0.15, fixedAmount: 45000 },
            { minIncome: 1200000, maxIncome: 1500000, rate: 0.20, fixedAmount: 90000 },
            { minIncome: 1500000, maxIncome: null, rate: 0.30, fixedAmount: 150000 }
          ]),
          applicableTo: 'federal',
          applicableStates: ['{}'],
          isActive: true,
          effectiveDate: new Date('2024-04-01'),
          expiryDate: new Date('2025-03-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Provident Fund',
          description: 'Employee Provident Fund contribution',
          type: 'percentage',
          rate: 0.12,
          fixedAmount: null,
          minAmount: null,
          maxAmount: 21600, // Rs 1800 * 12 months
          tiers: null,
          applicableTo: 'provident_fund',
          applicableStates: ['{}'],
          isActive: true,
          effectiveDate: new Date('2024-04-01'),
          expiryDate: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'ESIC Contribution',
          description: 'Employee State Insurance Corporation',
          type: 'percentage',
          rate: 0.0075, // 0.75%
          fixedAmount: null,
          minAmount: null,
          maxAmount: null,
          tiers: null,
          applicableTo: 'esic',
          applicableStates: ['{}'],
          isActive: true,
          effectiveDate: new Date('2024-04-01'),
          expiryDate: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          organizationId: org.id,
          name: 'Professional Tax - Maharashtra',
          description: 'Professional tax for Maharashtra state',
          type: 'tiered',
          rate: null,
          fixedAmount: null,
          minAmount: null,
          maxAmount: null,
          tiers: JSON.stringify([
            { minIncome: 0, maxIncome: 21000, rate: 0, fixedAmount: 0 },
            { minIncome: 21000, maxIncome: null, rate: 0, fixedAmount: 200 }
          ]),
          applicableTo: 'professional_tax',
          applicableStates: ['{"Maharashtra"}'],
          isActive: true,
          effectiveDate: new Date('2024-04-01'),
          expiryDate: new Date('2025-03-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      taxRules.push(...orgTaxRules);
    }

    for (const rule of taxRules) {
      await queryRunner.query(
        `INSERT INTO hr_tax_rules (id, "organizationId", name, description, type, rate, "fixedAmount", "minAmount", "maxAmount", tiers, "applicableTo", "applicableStates", "isActive", "effectiveDate", "expiryDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [rule.id, rule.organizationId, rule.name, rule.description, rule.type, rule.rate, rule.fixedAmount, rule.minAmount, rule.maxAmount, rule.tiers, rule.applicableTo, rule.applicableStates, rule.isActive, rule.effectiveDate, rule.expiryDate, rule.createdAt, rule.updatedAt]
      );
    }

    return taxRules;
  }

  private static async seedPerformanceReviews(queryRunner: any, organizations: any[], employees: any[]): Promise<any[]> {
    const reviews = [];

    for (const employee of employees) {
      const review = {
        id: uuidv4(),
        organizationId: employee.organization_id,
        employeeId: employee.id,
        reviewerId: null, // Could be set to manager
        reviewCycle: 'Annual Review 2023',
        reviewPeriodStart: new Date('2023-01-01'),
        reviewPeriodEnd: new Date('2023-12-31'),
        reviewType: 'annual',
        status: 'completed',
        overallRating: employee.performance_rating,
        overallComments: 'Strong performance throughout the year. Consistently meets and often exceeds expectations.',
        goals: JSON.stringify([
          {
            id: uuidv4(),
            title: 'Professional Development',
            description: 'Complete relevant certifications and training',
            category: 'development',
            weight: 20,
            rating: Math.min(5, employee.performance_rating + 0.2),
            comments: 'Excellent commitment to learning and development'
          },
          {
            id: uuidv4(),
            title: 'Project Delivery',
            description: 'Deliver assigned projects on time and within budget',
            category: 'performance',
            weight: 40,
            rating: employee.performance_rating,
            comments: 'Consistent delivery of high-quality work'
          },
          {
            id: uuidv4(),
            title: 'Team Collaboration',
            description: 'Work effectively with team members and stakeholders',
            category: 'behavioral',
            weight: 25,
            rating: Math.max(3.5, employee.performance_rating - 0.1),
            comments: 'Good team player with positive attitude'
          },
          {
            id: uuidv4(),
            title: 'Innovation',
            description: 'Contribute innovative ideas and solutions',
            category: 'innovation',
            weight: 15,
            rating: Math.min(5, employee.performance_rating + 0.1),
            comments: 'Shows creativity in problem-solving'
          }
        ]),
        competencies: JSON.stringify([
          {
            id: uuidv4(),
            name: 'Technical Skills',
            rating: employee.performance_rating,
            comments: 'Strong technical capabilities'
          },
          {
            id: uuidv4(),
            name: 'Communication',
            rating: Math.max(3.5, employee.performance_rating - 0.2),
            comments: 'Clear and effective communication'
          },
          {
            id: uuidv4(),
            name: 'Leadership',
            rating: employee.employee_number.endsWith('001') || employee.employee_number.endsWith('002') ? 
              Math.min(5, employee.performance_rating + 0.3) : Math.max(3.0, employee.performance_rating - 0.5),
            comments: 'Shows leadership potential'
          }
        ]),
        developmentPlans: JSON.stringify([
          {
            area: 'Technical Skills Enhancement',
            actions: ['Attend advanced training programs', 'Work on challenging projects'],
            timeline: '6 months',
            resources: 'Training budget allocated'
          },
          {
            area: 'Leadership Development',
            actions: ['Mentoring junior team members', 'Lead cross-functional projects'],
            timeline: '12 months',
            resources: 'Leadership coaching available'
          }
        ]),
        managerComments: 'Valuable team member with consistent performance and growth potential.',
        employeeSelfAssessment: JSON.stringify({
          overallRating: Math.max(3.5, employee.performance_rating - 0.1),
          achievements: ['Completed major project deliverables', 'Improved process efficiency'],
          challenges: ['Managing workload during peak periods'],
          goals: ['Take on more challenging assignments', 'Develop leadership skills']
        }),
        reviewDate: new Date('2024-01-15'),
        submittedDate: new Date('2024-01-20'),
        approvedDate: new Date('2024-01-25'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      reviews.push(review);
    }

    for (const review of reviews) {
      await queryRunner.query(
        `INSERT INTO hr_performance_reviews (id, "organizationId", "employeeId", "reviewerId", "reviewCycle", "reviewPeriodStart", "reviewPeriodEnd", "reviewType", status, "overallRating", "overallComments", goals, competencies, "developmentPlans", "managerComments", "employeeSelfAssessment", "reviewDate", "submittedDate", "approvedDate", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [review.id, review.organizationId, review.employeeId, review.reviewerId, review.reviewCycle, review.reviewPeriodStart, review.reviewPeriodEnd, review.reviewType, review.status, review.overallRating, review.overallComments, review.goals, review.competencies, review.developmentPlans, review.managerComments, review.employeeSelfAssessment, review.reviewDate, review.submittedDate, review.approvedDate, review.isActive, review.createdAt, review.updatedAt]
      );
    }

    return reviews;
  }
}
