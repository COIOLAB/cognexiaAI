// Industry 5.0 ERP Backend - Compensation & Benefits Management Service
// Business logic for compensation structures, benefits packages, and salary administration
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { CompensationModel } from '../models/compensation.model';
import { 
  CompensationPlan, 
  BenefitsPlan, 
  SalaryStructure, 
  BenefitsEnrollment,
  CreateCompensationPlanRequest,
  CreateBenefitsPlanRequest,
  CreateSalaryStructureRequest,
  CreateBenefitsEnrollmentRequest,
  PaginationOptions,
  PaginatedResponse,
  FilterOptions,
  CompensationType,
  BenefitType,
  BenefitStatus,
  EnrollmentStatus
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class CompensationService {
  private compensationModel: CompensationModel;

  constructor() {
    this.compensationModel = new CompensationModel();
  }

  // =====================
  // COMPENSATION PLANS
  // =====================

  async createCompensationPlan(organizationId: UUID, data: CreateCompensationPlanRequest): Promise<CompensationPlan> {
    try {
      // Validate plan data
      this.validateCompensationPlan(data);

      // Check for existing active plans with same name
      const existingPlan = await this.compensationModel.findCompensationPlanByName(organizationId, data.name);
      if (existingPlan && existingPlan.isActive) {
        throw new HRError(
          HRErrorCodes.COMPENSATION_PLAN_ALREADY_EXISTS,
          `Active compensation plan with name "${data.name}" already exists`,
          400
        );
      }

      // Create the compensation plan
      const plan = await this.compensationModel.createCompensationPlan(organizationId, data);

      logger.info(`Created compensation plan: ${plan.name} (ID: ${plan.id})`);
      return plan;

    } catch (error) {
      logger.error('Error creating compensation plan:', error);
      throw error;
    }
  }

  async getCompensationPlanById(id: UUID, organizationId: UUID): Promise<CompensationPlan | null> {
    try {
      const plan = await this.compensationModel.findCompensationPlanById(id);
      
      if (!plan || plan.organizationId !== organizationId) {
        return null;
      }

      return plan;
    } catch (error) {
      logger.error(`Error getting compensation plan ${id}:`, error);
      throw error;
    }
  }

  async updateCompensationPlan(id: UUID, data: Partial<CompensationPlan>, organizationId: UUID): Promise<CompensationPlan> {
    try {
      // Verify plan exists and belongs to organization
      const existingPlan = await this.getCompensationPlanById(id, organizationId);
      if (!existingPlan) {
        throw new HRError(HRErrorCodes.COMPENSATION_PLAN_NOT_FOUND, 'Compensation plan not found', 404);
      }

      // Validate update data
      if (data.name && data.name !== existingPlan.name) {
        const nameExists = await this.compensationModel.findCompensationPlanByName(organizationId, data.name);
        if (nameExists && nameExists.id !== id) {
          throw new HRError(
            HRErrorCodes.COMPENSATION_PLAN_ALREADY_EXISTS,
            `Compensation plan with name "${data.name}" already exists`,
            400
          );
        }
      }

      const updatedPlan = await this.compensationModel.updateCompensationPlan(id, data);
      logger.info(`Updated compensation plan ${id}`);
      return updatedPlan;

    } catch (error) {
      logger.error(`Error updating compensation plan ${id}:`, error);
      throw error;
    }
  }

  async listCompensationPlans(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<CompensationPlan>> {
    try {
      return await this.compensationModel.listCompensationPlans(organizationId, options);
    } catch (error) {
      logger.error('Error listing compensation plans:', error);
      throw error;
    }
  }

  async deactivateCompensationPlan(id: UUID, organizationId: UUID): Promise<CompensationPlan> {
    try {
      const plan = await this.getCompensationPlanById(id, organizationId);
      if (!plan) {
        throw new HRError(HRErrorCodes.COMPENSATION_PLAN_NOT_FOUND, 'Compensation plan not found', 404);
      }

      const updatedPlan = await this.compensationModel.updateCompensationPlan(id, { isActive: false });
      logger.info(`Deactivated compensation plan ${id}`);
      return updatedPlan;

    } catch (error) {
      logger.error(`Error deactivating compensation plan ${id}:`, error);
      throw error;
    }
  }

  // =====================
  // SALARY STRUCTURES
  // =====================

  async createSalaryStructure(organizationId: UUID, data: CreateSalaryStructureRequest): Promise<SalaryStructure> {
    try {
      // Validate salary structure data
      this.validateSalaryStructure(data);

      // Check for overlapping grade levels
      const overlapping = await this.compensationModel.findOverlappingSalaryStructures(
        organizationId, 
        data.gradeLevel, 
        data.effectiveDate
      );

      if (overlapping.length > 0) {
        throw new HRError(
          HRErrorCodes.SALARY_STRUCTURE_OVERLAP,
          `Salary structure for grade level ${data.gradeLevel} already exists for this period`,
          400
        );
      }

      const structure = await this.compensationModel.createSalaryStructure(organizationId, data);
      logger.info(`Created salary structure for grade ${data.gradeLevel} (ID: ${structure.id})`);
      return structure;

    } catch (error) {
      logger.error('Error creating salary structure:', error);
      throw error;
    }
  }

  async getSalaryStructureById(id: UUID, organizationId: UUID): Promise<SalaryStructure | null> {
    try {
      const structure = await this.compensationModel.findSalaryStructureById(id);
      
      if (!structure || structure.organizationId !== organizationId) {
        return null;
      }

      return structure;
    } catch (error) {
      logger.error(`Error getting salary structure ${id}:`, error);
      throw error;
    }
  }

  async updateSalaryStructure(id: UUID, data: Partial<SalaryStructure>, organizationId: UUID): Promise<SalaryStructure> {
    try {
      const existingStructure = await this.getSalaryStructureById(id, organizationId);
      if (!existingStructure) {
        throw new HRError(HRErrorCodes.SALARY_STRUCTURE_NOT_FOUND, 'Salary structure not found', 404);
      }

      const updatedStructure = await this.compensationModel.updateSalaryStructure(id, data);
      logger.info(`Updated salary structure ${id}`);
      return updatedStructure;

    } catch (error) {
      logger.error(`Error updating salary structure ${id}:`, error);
      throw error;
    }
  }

  async listSalaryStructures(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<SalaryStructure>> {
    try {
      return await this.compensationModel.listSalaryStructures(organizationId, options);
    } catch (error) {
      logger.error('Error listing salary structures:', error);
      throw error;
    }
  }

  // =====================
  // BENEFITS PLANS
  // =====================

  async createBenefitsPlan(organizationId: UUID, data: CreateBenefitsPlanRequest): Promise<BenefitsPlan> {
    try {
      // Validate benefits plan data
      this.validateBenefitsPlan(data);

      // Check for existing active plans with same name
      const existingPlan = await this.compensationModel.findBenefitsPlanByName(organizationId, data.name);
      if (existingPlan && existingPlan.isActive) {
        throw new HRError(
          HRErrorCodes.BENEFITS_PLAN_ALREADY_EXISTS,
          `Active benefits plan with name "${data.name}" already exists`,
          400
        );
      }

      const plan = await this.compensationModel.createBenefitsPlan(organizationId, data);
      logger.info(`Created benefits plan: ${plan.name} (ID: ${plan.id})`);
      return plan;

    } catch (error) {
      logger.error('Error creating benefits plan:', error);
      throw error;
    }
  }

  async getBenefitsPlanById(id: UUID, organizationId: UUID): Promise<BenefitsPlan | null> {
    try {
      const plan = await this.compensationModel.findBenefitsPlanById(id);
      
      if (!plan || plan.organizationId !== organizationId) {
        return null;
      }

      return plan;
    } catch (error) {
      logger.error(`Error getting benefits plan ${id}:`, error);
      throw error;
    }
  }

  async updateBenefitsPlan(id: UUID, data: Partial<BenefitsPlan>, organizationId: UUID): Promise<BenefitsPlan> {
    try {
      const existingPlan = await this.getBenefitsPlanById(id, organizationId);
      if (!existingPlan) {
        throw new HRError(HRErrorCodes.BENEFITS_PLAN_NOT_FOUND, 'Benefits plan not found', 404);
      }

      const updatedPlan = await this.compensationModel.updateBenefitsPlan(id, data);
      logger.info(`Updated benefits plan ${id}`);
      return updatedPlan;

    } catch (error) {
      logger.error(`Error updating benefits plan ${id}:`, error);
      throw error;
    }
  }

  async listBenefitsPlans(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<BenefitsPlan>> {
    try {
      return await this.compensationModel.listBenefitsPlans(organizationId, options);
    } catch (error) {
      logger.error('Error listing benefits plans:', error);
      throw error;
    }
  }

  // =====================
  // BENEFITS ENROLLMENT
  // =====================

  async createBenefitsEnrollment(organizationId: UUID, data: CreateBenefitsEnrollmentRequest): Promise<BenefitsEnrollment> {
    try {
      // Validate enrollment data
      this.validateBenefitsEnrollment(data);

      // Check if employee is already enrolled in this plan
      const existingEnrollment = await this.compensationModel.findBenefitsEnrollment(
        data.employeeId, 
        data.benefitsPlanId
      );

      if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        throw new HRError(
          HRErrorCodes.BENEFITS_ENROLLMENT_EXISTS,
          'Employee is already enrolled in this benefits plan',
          400
        );
      }

      // Verify benefits plan exists and is active
      const benefitsPlan = await this.getBenefitsPlanById(data.benefitsPlanId, organizationId);
      if (!benefitsPlan || !benefitsPlan.isActive) {
        throw new HRError(HRErrorCodes.BENEFITS_PLAN_NOT_FOUND, 'Benefits plan not found or inactive', 404);
      }

      // Check enrollment eligibility
      const isEligible = await this.checkBenefitsEligibility(data.employeeId, benefitsPlan);
      if (!isEligible) {
        throw new HRError(
          HRErrorCodes.BENEFITS_ENROLLMENT_NOT_ELIGIBLE,
          'Employee is not eligible for this benefits plan',
          400
        );
      }

      const enrollment = await this.compensationModel.createBenefitsEnrollment(organizationId, data);
      logger.info(`Created benefits enrollment for employee ${data.employeeId} in plan ${data.benefitsPlanId}`);
      return enrollment;

    } catch (error) {
      logger.error('Error creating benefits enrollment:', error);
      throw error;
    }
  }

  async updateBenefitsEnrollment(id: UUID, data: Partial<BenefitsEnrollment>, organizationId: UUID): Promise<BenefitsEnrollment> {
    try {
      const existingEnrollment = await this.compensationModel.findBenefitsEnrollmentById(id);
      if (!existingEnrollment || existingEnrollment.organizationId !== organizationId) {
        throw new HRError(HRErrorCodes.BENEFITS_ENROLLMENT_NOT_FOUND, 'Benefits enrollment not found', 404);
      }

      const updatedEnrollment = await this.compensationModel.updateBenefitsEnrollment(id, data);
      logger.info(`Updated benefits enrollment ${id}`);
      return updatedEnrollment;

    } catch (error) {
      logger.error(`Error updating benefits enrollment ${id}:`, error);
      throw error;
    }
  }

  async listBenefitsEnrollments(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<BenefitsEnrollment>> {
    try {
      return await this.compensationModel.listBenefitsEnrollments(organizationId, options);
    } catch (error) {
      logger.error('Error listing benefits enrollments:', error);
      throw error;
    }
  }

  async getEmployeeBenefits(employeeId: UUID, organizationId: UUID): Promise<BenefitsEnrollment[]> {
    try {
      return await this.compensationModel.findEmployeeBenefitsEnrollments(employeeId, organizationId);
    } catch (error) {
      logger.error(`Error getting employee benefits for ${employeeId}:`, error);
      throw error;
    }
  }

  // =====================
  // COMPENSATION ANALYTICS
  // =====================

  async getCompensationAnalytics(organizationId: UUID, filters?: any): Promise<any> {
    try {
      const analytics = await this.compensationModel.getCompensationAnalytics(organizationId, filters);
      
      return {
        ...analytics,
        insights: this.generateCompensationInsights(analytics),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting compensation analytics:', error);
      throw error;
    }
  }

  async getBenefitsUtilization(organizationId: UUID): Promise<any> {
    try {
      return await this.compensationModel.getBenefitsUtilization(organizationId);
    } catch (error) {
      logger.error('Error getting benefits utilization:', error);
      throw error;
    }
  }

  async getCompensationBenchmark(organizationId: UUID, jobTitle: string, location?: string): Promise<any> {
    try {
      return await this.compensationModel.getCompensationBenchmark(organizationId, jobTitle, location);
    } catch (error) {
      logger.error(`Error getting compensation benchmark for ${jobTitle}:`, error);
      throw error;
    }
  }

  // =====================
  // PRIVATE HELPER METHODS
  // =====================

  private validateCompensationPlan(data: CreateCompensationPlanRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Plan name is required', 400);
    }

    if (!data.type || !Object.values(CompensationType).includes(data.type)) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Valid compensation type is required', 400);
    }

    if (data.baseSalary !== undefined && data.baseSalary < 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Base salary cannot be negative', 400);
    }

    if (data.effectiveDate && new Date(data.effectiveDate) < new Date()) {
      logger.warn('Compensation plan effective date is in the past');
    }
  }

  private validateSalaryStructure(data: CreateSalaryStructureRequest): void {
    if (!data.gradeLevel || data.gradeLevel < 1) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Valid grade level is required', 400);
    }

    if (!data.minSalary || data.minSalary < 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Minimum salary must be positive', 400);
    }

    if (!data.maxSalary || data.maxSalary < 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Maximum salary must be positive', 400);
    }

    if (data.minSalary >= data.maxSalary) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Maximum salary must be greater than minimum salary', 400);
    }

    if (data.midSalary && (data.midSalary < data.minSalary || data.midSalary > data.maxSalary)) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Mid salary must be between minimum and maximum salary', 400);
    }
  }

  private validateBenefitsPlan(data: CreateBenefitsPlanRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Benefits plan name is required', 400);
    }

    if (!data.type || !Object.values(BenefitType).includes(data.type)) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Valid benefit type is required', 400);
    }

    if (data.employerContribution !== undefined && (data.employerContribution < 0 || data.employerContribution > 100)) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Employer contribution must be between 0 and 100 percent', 400);
    }
  }

  private validateBenefitsEnrollment(data: CreateBenefitsEnrollmentRequest): void {
    if (!data.employeeId) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Employee ID is required', 400);
    }

    if (!data.benefitsPlanId) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Benefits plan ID is required', 400);
    }

    if (!data.enrollmentDate) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Enrollment date is required', 400);
    }

    if (data.employeeContribution !== undefined && data.employeeContribution < 0) {
      throw new HRError(HRErrorCodes.INVALID_COMPENSATION_DATA, 'Employee contribution cannot be negative', 400);
    }
  }

  private async checkBenefitsEligibility(employeeId: UUID, benefitsPlan: BenefitsPlan): Promise<boolean> {
    // Basic eligibility check - can be extended with more complex rules
    if (!benefitsPlan.eligibilityCriteria) {
      return true; // No specific criteria means all employees are eligible
    }

    // TODO: Implement more sophisticated eligibility checks based on:
    // - Employee tenure
    // - Employment type (full-time, part-time, contractor)
    // - Department/location restrictions
    // - Job level requirements
    
    return true; // Simplified for now
  }

  private generateCompensationInsights(analytics: any): any {
    const insights = [];

    if (analytics.payEquityGap && analytics.payEquityGap > 0.05) {
      insights.push({
        type: 'pay_equity_concern',
        message: 'Pay equity gap detected - consider reviewing compensation fairness',
        priority: 'high'
      });
    }

    if (analytics.averageSalary && analytics.marketMedian) {
      const deviation = (analytics.averageSalary - analytics.marketMedian) / analytics.marketMedian;
      if (deviation < -0.1) {
        insights.push({
          type: 'below_market',
          message: 'Average compensation is significantly below market rates',
          priority: 'medium'
        });
      } else if (deviation > 0.2) {
        insights.push({
          type: 'above_market',
          message: 'Average compensation is significantly above market rates',
          priority: 'low'
        });
      }
    }

    return insights;
  }
}
