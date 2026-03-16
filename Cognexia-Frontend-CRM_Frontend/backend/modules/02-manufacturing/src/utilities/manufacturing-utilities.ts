import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

// ========================================================================================
// MANUFACTURING GUARD
// ========================================================================================
@Injectable()
export class ManufacturingGuard implements CanActivate {
  private readonly logger = new Logger(ManufacturingGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Basic authentication check - in real implementation, verify JWT tokens
    const isAuthenticated = request.headers.authorization ? true : false;
    
    if (!isAuthenticated) {
      this.logger.warn('Unauthorized access attempt to manufacturing endpoint');
    }
    
    return isAuthenticated;
  }
}

// ========================================================================================
// PRODUCTION LINE GUARD  
// ========================================================================================
@Injectable()
export class ProductionLineGuard implements CanActivate {
  private readonly logger = new Logger(ProductionLineGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check if user has production line access permissions
    const hasPermission = true; // Mock implementation
    
    if (!hasPermission) {
      this.logger.warn('Access denied to production line operations');
    }
    
    return hasPermission;
  }
}

// ========================================================================================
// MANUFACTURING UTILITIES
// ========================================================================================
@Injectable()
export class ManufacturingUtilities {
  private readonly logger = new Logger(ManufacturingUtilities.name);

  constructor() {
    this.logger.log('Manufacturing Utilities initialized');
  }

  generateOrderNumber(): string {
    return `MO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  generateWorkOrderNumber(): string {
    return `WO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  calculateOEE(availability: number, performance: number, quality: number): number {
    return (availability * performance * quality) / 10000;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  validateProductionSchedule(schedule: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schedule.startDate) {
      errors.push('Start date is required');
    }

    if (!schedule.endDate) {
      errors.push('End date is required');
    }

    if (schedule.startDate && schedule.endDate && schedule.startDate >= schedule.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ========================================================================================
// PRODUCTION CALCULATOR SERVICE
// ========================================================================================
@Injectable()
export class ProductionCalculatorService {
  private readonly logger = new Logger(ProductionCalculatorService.name);

  constructor() {
    this.logger.log('Production Calculator Service initialized');
  }

  calculateCycleTime(totalTime: number, unitsProduced: number): number {
    return unitsProduced > 0 ? totalTime / unitsProduced : 0;
  }

  calculateThroughput(unitsProduced: number, timeHours: number): number {
    return timeHours > 0 ? unitsProduced / timeHours : 0;
  }

  calculateEfficiency(actualOutput: number, plannedOutput: number): number {
    return plannedOutput > 0 ? (actualOutput / plannedOutput) * 100 : 0;
  }

  calculateYieldRate(goodUnits: number, totalUnits: number): number {
    return totalUnits > 0 ? (goodUnits / totalUnits) * 100 : 0;
  }

  calculateScrapRate(scrapUnits: number, totalUnits: number): number {
    return totalUnits > 0 ? (scrapUnits / totalUnits) * 100 : 0;
  }

  calculateSetupTime(totalSetupMinutes: number, numberOfSetups: number): number {
    return numberOfSetups > 0 ? totalSetupMinutes / numberOfSetups : 0;
  }

  calculateDowntime(totalDowntimeMinutes: number, totalAvailableTime: number): number {
    return totalAvailableTime > 0 ? (totalDowntimeMinutes / totalAvailableTime) * 100 : 0;
  }

  calculateCapacityUtilization(actualProduction: number, maxCapacity: number): number {
    return maxCapacity > 0 ? (actualProduction / maxCapacity) * 100 : 0;
  }
}

// ========================================================================================
// MANUFACTURING VALIDATION SERVICE  
// ========================================================================================
@Injectable()
export class ManufacturingValidationService {
  private readonly logger = new Logger(ManufacturingValidationService.name);

  constructor() {
    this.logger.log('Manufacturing Validation Service initialized');
  }

  validateProductionOrder(order: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!order.productSku) {
      errors.push('Product SKU is required');
    }

    if (!order.plannedQuantity || order.plannedQuantity <= 0) {
      errors.push('Planned quantity must be greater than zero');
    }

    if (!order.dueDate) {
      errors.push('Due date is required');
    }

    if (order.dueDate && new Date(order.dueDate) <= new Date()) {
      errors.push('Due date must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateWorkOrder(workOrder: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workOrder.workOrderNumber) {
      errors.push('Work order number is required');
    }

    if (!workOrder.productionOrderId) {
      errors.push('Production order ID is required');
    }

    if (!workOrder.workCenterId) {
      errors.push('Work center ID is required');
    }

    if (!workOrder.plannedQuantity || workOrder.plannedQuantity <= 0) {
      errors.push('Planned quantity must be greater than zero');
    }

    if (!workOrder.scheduledStartTime) {
      errors.push('Scheduled start time is required');
    }

    if (!workOrder.scheduledEndTime) {
      errors.push('Scheduled end time is required');
    }

    if (workOrder.scheduledStartTime && workOrder.scheduledEndTime && 
        workOrder.scheduledStartTime >= workOrder.scheduledEndTime) {
      errors.push('Scheduled start time must be before end time');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateBOM(bom: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bom.productSku) {
      errors.push('Product SKU is required');
    }

    if (!bom.productName) {
      errors.push('Product name is required');
    }

    if (!bom.baseQuantity || bom.baseQuantity <= 0) {
      errors.push('Base quantity must be greater than zero');
    }

    if (!bom.components || bom.components.length === 0) {
      errors.push('BOM must have at least one component');
    }

    if (bom.components) {
      bom.components.forEach((component: any, index: number) => {
        if (!component.materialSku) {
          errors.push(`Component ${index + 1}: Material SKU is required`);
        }

        if (!component.quantity || component.quantity <= 0) {
          errors.push(`Component ${index + 1}: Quantity must be greater than zero`);
        }

        if (!component.unit) {
          errors.push(`Component ${index + 1}: Unit is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateQualityCheck(qualityCheck: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!qualityCheck.workOrderId) {
      errors.push('Work order ID is required');
    }

    if (!qualityCheck.inspectorId) {
      errors.push('Inspector ID is required');
    }

    if (!qualityCheck.parameters || qualityCheck.parameters.length === 0) {
      errors.push('Quality parameters are required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
