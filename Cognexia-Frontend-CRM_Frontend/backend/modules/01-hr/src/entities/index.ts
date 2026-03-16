// Industry 5.0 ERP Backend - HR Entities Index
// Exports all HR TypeORM entities
// Author: AI Assistant
// Date: 2024

export { OrganizationEntity } from './organization.entity';
export { DepartmentEntity } from './department.entity';
export { PositionEntity } from './position.entity';
export { EmployeeEntity } from './employee.entity';
export { CompensationPlanEntity } from './compensation-plan.entity';
export { EmployeeCompensationEntity } from './employee-compensation.entity';
export { PayrollRunEntity } from './payroll-run.entity';
export { PayrollRecordEntity } from './payroll-record.entity';
export { PerformanceReviewEntity } from './performance-review.entity';

// Array of all entities for easy import in TypeORM configuration
export const HR_ENTITIES = [
  OrganizationEntity,
  DepartmentEntity,
  PositionEntity,
  EmployeeEntity,
  CompensationPlanEntity,
  EmployeeCompensationEntity,
  PayrollRunEntity,
  PayrollRecordEntity,
  PerformanceReviewEntity,
];

// Entity metadata for migrations and schema generation
export const ENTITY_METADATA = {
  OrganizationEntity: {
    tableName: 'organizations',
    primaryKey: 'id',
    description: 'Core organizational structure'
  },
  DepartmentEntity: {
    tableName: 'departments',
    primaryKey: 'id',
    description: 'Organizational departments and divisions'
  },
  PositionEntity: {
    tableName: 'positions',
    primaryKey: 'id',
    description: 'Job positions and role definitions'
  },
  EmployeeEntity: {
    tableName: 'employees',
    primaryKey: 'id',
    description: 'Employee master data and information'
  },
  CompensationPlanEntity: {
    tableName: 'compensation_plans',
    primaryKey: 'id',
    description: 'Compensation plans and salary structures'
  },
  EmployeeCompensationEntity: {
    tableName: 'employee_compensations',
    primaryKey: 'id',
    description: 'Individual employee compensation assignments'
  },
  PayrollRunEntity: {
    tableName: 'payroll_runs',
    primaryKey: 'id',
    description: 'Payroll batch processing runs'
  },
  PayrollRecordEntity: {
    tableName: 'payroll_records',
    primaryKey: 'id',
    description: 'Individual employee payroll records'
  },
  PerformanceReviewEntity: {
    tableName: 'performance_reviews',
    primaryKey: 'id',
    description: 'Employee performance reviews and evaluations'
  },
};
