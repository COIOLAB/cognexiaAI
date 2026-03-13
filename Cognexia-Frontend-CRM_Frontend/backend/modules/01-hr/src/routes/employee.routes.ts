// Industry 5.0 ERP Backend - Employee Routes
// HTTP route definitions for employee management
// Author: AI Assistant
// Date: 2024

import { Router } from 'express';
import { employeeController } from '../controllers';
import { 
  authenticateHRRequest, 
  requireEmployeeAccess, 
  requireEmployeeWrite,
  allowSelfServiceAccess,
  validateOrganizationContext,
  hrRateLimit
} from '../middleware';

const router = Router();

// Apply common middleware to all employee routes
router.use(authenticateHRRequest);
router.use(validateOrganizationContext);
router.use(hrRateLimit(150, 15)); // 150 requests per 15 minutes

/**
 * Employee Management Routes
 * Base path: /api/v1/hr/employees
 */

// Create new employee
// POST /api/v1/hr/employees
router.post('/', 
  requireEmployeeWrite,
  (req, res, next) => employeeController.createEmployee(req, res, next)
);

// Search employees
// GET /api/v1/hr/employees/search?q=query&fields=field1,field2&fuzzy=true
router.get('/search',
  requireEmployeeAccess,
  (req, res, next) => employeeController.searchEmployees(req, res, next)
);

// Get employee by email (useful for integrations)
// GET /api/v1/hr/employees/by-email/:email
router.get('/by-email/:email',
  requireEmployeeAccess,
  (req, res, next) => employeeController.getEmployeeByEmail(req, res, next)
);

// List employees with pagination and filtering
// GET /api/v1/hr/employees?page=1&limit=50&department=IT&location=NYC
router.get('/',
  requireEmployeeAccess,
  (req, res, next) => employeeController.listEmployees(req, res, next)
);

// Get employee by ID (with self-service access)
// GET /api/v1/hr/employees/:id
router.get('/:id',
  allowSelfServiceAccess, // Allows users to access their own profile
  (req, res, next) => employeeController.getEmployee(req, res, next)
);

// Update employee
// PUT /api/v1/hr/employees/:id
router.put('/:id',
  requireEmployeeWrite,
  (req, res, next) => employeeController.updateEmployee(req, res, next)
);

// Delete employee (soft delete)
// DELETE /api/v1/hr/employees/:id
router.delete('/:id',
  requireEmployeeWrite,
  (req, res, next) => employeeController.deleteEmployee(req, res, next)
);

// Get direct reports for a manager
// GET /api/v1/hr/employees/:id/direct-reports
router.get('/:id/direct-reports',
  allowSelfServiceAccess, // Managers can see their direct reports
  (req, res, next) => employeeController.getDirectReports(req, res, next)
);

// Get manager hierarchy for an employee
// GET /api/v1/hr/employees/:id/manager-hierarchy
router.get('/:id/manager-hierarchy',
  allowSelfServiceAccess, // Employees can see their management chain
  (req, res, next) => employeeController.getManagerHierarchy(req, res, next)
);

/**
 * Future employee-related routes to be implemented:
 * 
 * // Employee profile management
 * router.patch('/:id/profile', updateEmployeeProfile);
 * router.post('/:id/profile-picture', uploadProfilePicture);
 * 
 * // Employee skills and certifications
 * router.get('/:id/skills', getEmployeeSkills);
 * router.post('/:id/skills', addEmployeeSkill);
 * router.delete('/:id/skills/:skillId', removeEmployeeSkill);
 * 
 * // Employee emergency contacts
 * router.get('/:id/emergency-contacts', getEmergencyContacts);
 * router.post('/:id/emergency-contacts', addEmergencyContact);
 * router.put('/:id/emergency-contacts/:contactId', updateEmergencyContact);
 * router.delete('/:id/emergency-contacts/:contactId', removeEmergencyContact);
 * 
 * // Employee documents
 * router.get('/:id/documents', getEmployeeDocuments);
 * router.post('/:id/documents', uploadEmployeeDocument);
 * router.delete('/:id/documents/:documentId', deleteEmployeeDocument);
 * 
 * // Employee audit trail
 * router.get('/:id/audit-trail', getEmployeeAuditTrail);
 * 
 * // Employee bulk operations
 * router.post('/bulk-import', bulkImportEmployees);
 * router.post('/bulk-update', bulkUpdateEmployees);
 * router.get('/export', exportEmployees);
 * 
 * // Employee organizational chart
 * router.get('/org-chart', getOrganizationalChart);
 * router.get('/org-chart/:id', getEmployeeOrgChart);
 */

export default router;
