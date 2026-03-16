import { Injectable, BadRequestException } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

@Injectable()
export class ManufacturingValidationService {
  /**
   * Validate production order data
   */
  validateProductionOrder(orderData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!orderData.productId) {
      errors.push('Product ID is required');
    }

    if (!orderData.quantity || orderData.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!orderData.startDate) {
      errors.push('Start date is required');
    } else {
      const startDate = new Date(orderData.startDate);
      if (startDate < new Date()) {
        warnings.push('Start date is in the past');
      }
    }

    if (orderData.endDate) {
      const endDate = new Date(orderData.endDate);
      const startDate = new Date(orderData.startDate);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    // Business logic validation
    if (orderData.quantity > 10000) {
      warnings.push('Large quantity order - consider splitting into batches');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate equipment data
   */
  validateEquipment(equipmentData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!equipmentData.name) {
      errors.push('Equipment name is required');
    }

    if (!equipmentData.type) {
      errors.push('Equipment type is required');
    }

    if (!equipmentData.capacity || equipmentData.capacity <= 0) {
      errors.push('Equipment capacity must be greater than 0');
    }

    if (equipmentData.maintenanceDate) {
      const maintenanceDate = new Date(equipmentData.maintenanceDate);
      const now = new Date();
      const daysDiff = (now.getTime() - maintenanceDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff > 90) {
        warnings.push('Equipment maintenance is overdue');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate material requirements
   */
  validateMaterialRequirements(materials: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!materials || materials.length === 0) {
      errors.push('At least one material is required');
      return { isValid: false, errors, warnings };
    }

    materials.forEach((material, index) => {
      if (!material.materialId) {
        errors.push(`Material ${index + 1}: Material ID is required`);
      }

      if (!material.quantity || material.quantity <= 0) {
        errors.push(`Material ${index + 1}: Quantity must be greater than 0`);
      }

      if (!material.unit) {
        errors.push(`Material ${index + 1}: Unit is required`);
      }

      if (material.availableQuantity && material.quantity > material.availableQuantity) {
        warnings.push(`Material ${index + 1}: Required quantity exceeds available stock`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate quality control parameters
   */
  validateQualityControl(qcData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!qcData.inspectionType) {
      errors.push('Inspection type is required');
    }

    if (qcData.toleranceLevel !== undefined) {
      if (qcData.toleranceLevel < 0 || qcData.toleranceLevel > 100) {
        errors.push('Tolerance level must be between 0 and 100');
      }
    }

    if (qcData.sampleSize !== undefined) {
      if (qcData.sampleSize <= 0) {
        errors.push('Sample size must be greater than 0');
      }
    }

    if (qcData.defectRate !== undefined) {
      if (qcData.defectRate < 0 || qcData.defectRate > 100) {
        errors.push('Defect rate must be between 0 and 100');
      } else if (qcData.defectRate > 5) {
        warnings.push('High defect rate detected - review process');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate production schedule
   */
  validateProductionSchedule(scheduleData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!scheduleData.shifts || scheduleData.shifts.length === 0) {
      errors.push('At least one shift must be scheduled');
    }

    if (scheduleData.shifts) {
      scheduleData.shifts.forEach((shift: any, index: number) => {
        if (!shift.startTime || !shift.endTime) {
          errors.push(`Shift ${index + 1}: Start and end times are required`);
        } else {
          const start = new Date(shift.startTime);
          const end = new Date(shift.endTime);
          if (end <= start) {
            errors.push(`Shift ${index + 1}: End time must be after start time`);
          }
        }

        if (!shift.workerId) {
          warnings.push(`Shift ${index + 1}: No worker assigned`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Throw validation exception if validation fails
   */
  throwIfInvalid(validationResult: ValidationResult, context: string = 'Validation'): void {
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: `${context} failed`,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }
  }
}