/**
 * Industry 5.0 ERP Backend - Maintenance Management Module
 * DTO Index - Comprehensive Export of All Data Transfer Objects
 * 
 * This module provides advanced maintenance management capabilities including:
 * - Comprehensive Work Order Management
 * - Equipment Lifecycle Management
 * - AI-Powered Predictive Maintenance
 * - Advanced Maintenance Scheduling
 * - Real-time Technician Management
 * - Smart Spare Parts Inventory
 * - Industry 5.0 Analytics & Insights
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 */

// ============== ENUMS ==============
export {
  WorkOrderType,
  WorkOrderStatus,
  Priority,
  EquipmentStatus,
  Criticality,
  MaintenanceType,
  SensorType,
  SensorStatus,
  TechnicianSkillLevel,
  PartCondition
} from './maintenance.dto';

// ============== BASE DTOs ==============
export {
  EquipmentSpecificationDto,
  SensorReadingDto,
  MaintenanceMetricsDto,
  SafetyRequirementsDto,
  ProcedureStepDto,
  AttachmentDto
} from './maintenance.dto';

// ============== WORK ORDER DTOs ==============
export {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderFilterDto,
  WorkOrderAssignmentDto,
  WorkOrderCompletionDto,
  WorkOrderResponseDto
} from './maintenance.dto';

// ============== EQUIPMENT DTOs ==============
export {
  CreateEquipmentDto,
  UpdateEquipmentDto
} from './maintenance.dto';

// ============== MAINTENANCE SCHEDULE DTOs ==============
export {
  CreateMaintenanceScheduleDto,
  UpdateMaintenanceScheduleDto,
  RequiredPartDto
} from './maintenance.dto';

// ============== TECHNICIAN DTOs ==============
export {
  CreateTechnicianDto,
  UpdateTechnicianDto
} from './maintenance.dto';

// ============== SPARE PARTS DTOs ==============
export {
  CreateSparePartDto,
  UpdateSparePartDto
} from './maintenance.dto';

// ============== PREDICTIVE MAINTENANCE DTOs ==============
export {
  PredictiveMaintenanceAnalysisDto
} from './maintenance.dto';

// ============== ANALYTICS DTOs ==============
export {
  MaintenanceAnalyticsQueryDto,
  MaintenanceDashboardDto
} from './maintenance.dto';

// ============== BULK OPERATIONS DTOs ==============
export {
  BulkWorkOrderOperationDto
} from './maintenance.dto';

// ============== RE-EXPORT ALL DTOs (Wildcard Export) ==============
// This ensures all current and future DTOs are available
export * from './maintenance.dto';

/**
 * DTO Categories Summary:
 * 
 * 🔧 Work Order Management
 *   - CreateWorkOrderDto, UpdateWorkOrderDto
 *   - WorkOrderFilterDto, WorkOrderAssignmentDto
 *   - WorkOrderCompletionDto, WorkOrderResponseDto
 * 
 * ⚙️ Equipment Management
 *   - CreateEquipmentDto, UpdateEquipmentDto
 *   - EquipmentSpecificationDto
 * 
 * 📅 Maintenance Scheduling
 *   - CreateMaintenanceScheduleDto, UpdateMaintenanceScheduleDto
 *   - RequiredPartDto
 * 
 * 👷 Technician Management
 *   - CreateTechnicianDto, UpdateTechnicianDto
 * 
 * 🔩 Spare Parts Inventory
 *   - CreateSparePartDto, UpdateSparePartDto
 * 
 * 🤖 AI-Powered Predictive Maintenance
 *   - PredictiveMaintenanceAnalysisDto
 *   - SensorReadingDto
 * 
 * 📊 Analytics & Reporting
 *   - MaintenanceAnalyticsQueryDto
 *   - MaintenanceDashboardDto
 *   - MaintenanceMetricsDto
 * 
 * 🛡️ Safety & Compliance
 *   - SafetyRequirementsDto
 *   - ProcedureStepDto
 * 
 * 📎 Attachments & Media
 *   - AttachmentDto
 * 
 * 🔄 Bulk Operations
 *   - BulkWorkOrderOperationDto
 */
