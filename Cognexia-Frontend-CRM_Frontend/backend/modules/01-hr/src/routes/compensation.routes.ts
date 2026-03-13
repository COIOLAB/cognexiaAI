// Industry 5.0 ERP Backend - Compensation & Benefits Routes
// Express routes configuration for compensation plans, salary structures, benefits management
// Author: AI Assistant
// Date: 2024

import { Router } from 'express';
import { CompensationController } from '../controllers/compensation.controller';
import { authenticateToken, authorizeHRRole, rateLimitByUser, validateOrganization } from '../middleware';
import { HRRole, HRPermission } from '../types';

const router = Router();
const compensationController = new CompensationController();

// Apply common middleware to all routes
router.use(authenticateToken);
router.use(validateOrganization);
router.use(rateLimitByUser);

// =====================
// COMPENSATION PLANS ROUTES
// =====================

// Create a new compensation plan (HR Admin/Manager only)
router.post('/plans', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.createCompensationPlan
);

// Get all compensation plans with pagination and filtering
router.get('/plans', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.listCompensationPlans
);

// Get specific compensation plan by ID
router.get('/plans/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.getCompensationPlan
);

// Update compensation plan
router.put('/plans/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.updateCompensationPlan
);

// Deactivate compensation plan
router.patch('/plans/:id/deactivate', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.deactivateCompensationPlan
);

// =====================
// SALARY STRUCTURES ROUTES
// =====================

// Create a new salary structure (HR Admin/Manager only)
router.post('/salary-structures', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.createSalaryStructure
);

// Get all salary structures with pagination and filtering
router.get('/salary-structures', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.listSalaryStructures
);

// Get specific salary structure by ID
router.get('/salary-structures/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.getSalaryStructure
);

// Update salary structure
router.put('/salary-structures/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.updateSalaryStructure
);

// =====================
// BENEFITS PLANS ROUTES
// =====================

// Create a new benefits plan (HR Admin/Manager only)
router.post('/benefits-plans', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.createBenefitsPlan
);

// Get all benefits plans with pagination and filtering
router.get('/benefits-plans', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER, HRRole.EMPLOYEE]),
  compensationController.listBenefitsPlans
);

// Get specific benefits plan by ID
router.get('/benefits-plans/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER, HRRole.EMPLOYEE]),
  compensationController.getBenefitsPlan
);

// Update benefits plan
router.put('/benefits-plans/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.updateBenefitsPlan
);

// =====================
// BENEFITS ENROLLMENT ROUTES
// =====================

// Create a new benefits enrollment
router.post('/benefits-enrollments', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.EMPLOYEE]),
  compensationController.createBenefitsEnrollment
);

// Get all benefits enrollments with pagination and filtering
router.get('/benefits-enrollments', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.listBenefitsEnrollments
);

// Update benefits enrollment
router.put('/benefits-enrollments/:id', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.EMPLOYEE]),
  compensationController.updateBenefitsEnrollment
);

// Get employee benefits (specific employee's enrollments)
router.get('/employees/:employeeId/benefits', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER, HRRole.EMPLOYEE]),
  compensationController.getEmployeeBenefits
);

// =====================
// ANALYTICS & REPORTING ROUTES
// =====================

// Get compensation analytics (organization-wide)
router.get('/analytics/compensation', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.getCompensationAnalytics
);

// Get benefits utilization analytics
router.get('/analytics/benefits-utilization', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER]),
  compensationController.getBenefitsUtilization
);

// Get compensation benchmark for job title/location
router.get('/analytics/compensation-benchmark/:jobTitle', 
  authorizeHRRole([HRRole.HR_ADMIN, HRRole.HR_MANAGER, HRRole.MANAGER]),
  compensationController.getCompensationBenchmark
);

export default router;
