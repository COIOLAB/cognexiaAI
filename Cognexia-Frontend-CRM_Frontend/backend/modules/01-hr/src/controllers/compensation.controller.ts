// Industry 5.0 ERP Backend - Compensation & Benefits Controller
// HTTP controllers for compensation plans, salary structures, benefits management
// Author: AI Assistant
// Date: 2024

import { Request, Response } from 'express';
import { UUID } from 'crypto';
import { CompensationService } from '../services/compensation.service';
import { 
  CreateCompensationPlanRequest, 
  CreateSalaryStructureRequest, 
  CreateBenefitsPlanRequest, 
  CreateBenefitsEnrollmentRequest,
  PaginationOptions,
  FilterOptions,
  CompensationPlan,
  SalaryStructure,
  BenefitsPlan,
  BenefitsEnrollment
} from '../types';
import { HRError, HRErrorCodes } from '../utils/error.util';
import { logger } from '../../../utils/logger';

export class CompensationController {
  private compensationService: CompensationService;

  constructor() {
    this.compensationService = new CompensationService();
  }

  // =====================
  // COMPENSATION PLANS
  // =====================

  createCompensationPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const planData: CreateCompensationPlanRequest = req.body;

      const plan = await this.compensationService.createCompensationPlan(organizationId, planData);

      logger.info(`Created compensation plan ${plan.id} for organization ${organizationId}`);
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Compensation plan created successfully'
      });
    } catch (error) {
      logger.error('Error in createCompensationPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getCompensationPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const plan = await this.compensationService.getCompensationPlanById(id as UUID, organizationId);

      if (!plan) {
        res.status(404).json({
          success: false,
          error: HRErrorCodes.COMPENSATION_PLAN_NOT_FOUND,
          message: 'Compensation plan not found'
        });
        return;
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      logger.error('Error in getCompensationPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateCompensationPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData: Partial<CompensationPlan> = req.body;

      const plan = await this.compensationService.updateCompensationPlan(id as UUID, updateData, organizationId);

      logger.info(`Updated compensation plan ${id}`);
      res.json({
        success: true,
        data: plan,
        message: 'Compensation plan updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateCompensationPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listCompensationPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        type: req.query.type as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        effectiveDateFrom: req.query.effectiveDateFrom as string,
        effectiveDateTo: req.query.effectiveDateTo as string
      };

      const result = await this.compensationService.listCompensationPlans(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listCompensationPlans:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  deactivateCompensationPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const plan = await this.compensationService.deactivateCompensationPlan(id as UUID, organizationId);

      logger.info(`Deactivated compensation plan ${id}`);
      res.json({
        success: true,
        data: plan,
        message: 'Compensation plan deactivated successfully'
      });
    } catch (error) {
      logger.error('Error in deactivateCompensationPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // SALARY STRUCTURES
  // =====================

  createSalaryStructure = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const structureData: CreateSalaryStructureRequest = req.body;

      const structure = await this.compensationService.createSalaryStructure(organizationId, structureData);

      logger.info(`Created salary structure ${structure.id} for grade ${structureData.gradeLevel}`);
      res.status(201).json({
        success: true,
        data: structure,
        message: 'Salary structure created successfully'
      });
    } catch (error) {
      logger.error('Error in createSalaryStructure:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getSalaryStructure = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const structure = await this.compensationService.getSalaryStructureById(id as UUID, organizationId);

      if (!structure) {
        res.status(404).json({
          success: false,
          error: HRErrorCodes.SALARY_STRUCTURE_NOT_FOUND,
          message: 'Salary structure not found'
        });
        return;
      }

      res.json({
        success: true,
        data: structure
      });
    } catch (error) {
      logger.error('Error in getSalaryStructure:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateSalaryStructure = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData: Partial<SalaryStructure> = req.body;

      const structure = await this.compensationService.updateSalaryStructure(id as UUID, updateData, organizationId);

      logger.info(`Updated salary structure ${id}`);
      res.json({
        success: true,
        data: structure,
        message: 'Salary structure updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateSalaryStructure:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listSalaryStructures = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'grade_level',
        sortOrder: (req.query.sortOrder as string) || 'asc',
        gradeLevel: req.query.gradeLevel ? parseInt(req.query.gradeLevel as string) : undefined,
        effectiveDateFrom: req.query.effectiveDateFrom as string,
        effectiveDateTo: req.query.effectiveDateTo as string
      };

      const result = await this.compensationService.listSalaryStructures(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listSalaryStructures:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // BENEFITS PLANS
  // =====================

  createBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const planData: CreateBenefitsPlanRequest = req.body;

      const plan = await this.compensationService.createBenefitsPlan(organizationId, planData);

      logger.info(`Created benefits plan ${plan.id}: ${planData.name}`);
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Benefits plan created successfully'
      });
    } catch (error) {
      logger.error('Error in createBenefitsPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;

      const plan = await this.compensationService.getBenefitsPlanById(id as UUID, organizationId);

      if (!plan) {
        res.status(404).json({
          success: false,
          error: HRErrorCodes.BENEFITS_PLAN_NOT_FOUND,
          message: 'Benefits plan not found'
        });
        return;
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      logger.error('Error in getBenefitsPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateBenefitsPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData: Partial<BenefitsPlan> = req.body;

      const plan = await this.compensationService.updateBenefitsPlan(id as UUID, updateData, organizationId);

      logger.info(`Updated benefits plan ${id}`);
      res.json({
        success: true,
        data: plan,
        message: 'Benefits plan updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateBenefitsPlan:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listBenefitsPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        type: req.query.type as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const result = await this.compensationService.listBenefitsPlans(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listBenefitsPlans:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // BENEFITS ENROLLMENT
  // =====================

  createBenefitsEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const enrollmentData: CreateBenefitsEnrollmentRequest = req.body;

      const enrollment = await this.compensationService.createBenefitsEnrollment(organizationId, enrollmentData);

      logger.info(`Created benefits enrollment ${enrollment.id} for employee ${enrollmentData.employeeId}`);
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Benefits enrollment created successfully'
      });
    } catch (error) {
      logger.error('Error in createBenefitsEnrollment:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  updateBenefitsEnrollment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const organizationId = req.organizationId as UUID;
      const updateData: Partial<BenefitsEnrollment> = req.body;

      const enrollment = await this.compensationService.updateBenefitsEnrollment(id as UUID, updateData, organizationId);

      logger.info(`Updated benefits enrollment ${id}`);
      res.json({
        success: true,
        data: enrollment,
        message: 'Benefits enrollment updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateBenefitsEnrollment:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  listBenefitsEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const options: PaginationOptions & FilterOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        employeeId: req.query.employeeId as UUID,
        benefitsPlanId: req.query.benefitsPlanId as UUID,
        status: req.query.status as string
      };

      const result = await this.compensationService.listBenefitsEnrollments(organizationId, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in listBenefitsEnrollments:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getEmployeeBenefits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const organizationId = req.organizationId as UUID;

      const benefits = await this.compensationService.getEmployeeBenefits(employeeId as UUID, organizationId);

      res.json({
        success: true,
        data: benefits
      });
    } catch (error) {
      logger.error('Error in getEmployeeBenefits:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  // =====================
  // ANALYTICS & REPORTING
  // =====================

  getCompensationAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const filters = req.query;

      const analytics = await this.compensationService.getCompensationAnalytics(organizationId, filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error in getCompensationAnalytics:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getBenefitsUtilization = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;

      const utilization = await this.compensationService.getBenefitsUtilization(organizationId);

      res.json({
        success: true,
        data: utilization
      });
    } catch (error) {
      logger.error('Error in getBenefitsUtilization:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };

  getCompensationBenchmark = async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId as UUID;
      const { jobTitle } = req.params;
      const { location } = req.query;

      const benchmark = await this.compensationService.getCompensationBenchmark(
        organizationId, 
        jobTitle, 
        location as string
      );

      res.json({
        success: true,
        data: benchmark
      });
    } catch (error) {
      logger.error('Error in getCompensationBenchmark:', error);
      if (error instanceof HRError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.code,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: HRErrorCodes.INTERNAL_ERROR,
          message: 'Internal server error'
        });
      }
    }
  };
}
