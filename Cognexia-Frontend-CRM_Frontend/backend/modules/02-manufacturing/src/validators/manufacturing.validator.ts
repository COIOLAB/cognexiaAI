import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ManufacturingValidator {
  private static readonly logger = new Logger(ManufacturingValidator.name);

  /**
   * Validate production order data
   */
  static validateProductionOrder(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields validation
      if (!data.orderNumber) {
        errors.push('Production order number is required');
      }

      if (!data.productCode) {
        errors.push('Product code is required');
      }

      if (!data.plannedQuantity || data.plannedQuantity <= 0) {
        errors.push('Planned quantity must be greater than 0');
      }

      // Business logic validation
      if (data.plannedQuantity > 1000000) {
        warnings.push('Planned quantity is extremely high, please verify');
      }

      // Date validation
      if (data.schedule) {
        if (!data.schedule.plannedStartDate) {
          errors.push('Planned start date is required');
        }

        if (!data.schedule.plannedEndDate) {
          errors.push('Planned end date is required');
        }

        if (data.schedule.plannedStartDate && data.schedule.plannedEndDate) {
          const startDate = new Date(data.schedule.plannedStartDate);
          const endDate = new Date(data.schedule.plannedEndDate);

          if (startDate >= endDate) {
            errors.push('Planned start date must be before planned end date');
          }

          if (startDate < new Date()) {
            warnings.push('Planned start date is in the past');
          }
        }
      }

      // Priority validation
      if (data.priority && !['low', 'normal', 'high', 'urgent', 'critical'].includes(data.priority)) {
        errors.push('Invalid priority value');
      }

      // Material requirements validation
      if (data.materialRequirements && Array.isArray(data.materialRequirements)) {
        data.materialRequirements.forEach((material: any, index: number) => {
          if (!material.itemCode) {
            errors.push(`Material requirement ${index + 1}: Item code is required`);
          }
          if (!material.requiredQuantity || material.requiredQuantity <= 0) {
            errors.push(`Material requirement ${index + 1}: Required quantity must be greater than 0`);
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating production order: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate work center data
   */
  static validateWorkCenter(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.code) {
        errors.push('Work center code is required');
      }

      if (!data.name) {
        errors.push('Work center name is required');
      }

      if (!data.type) {
        errors.push('Work center type is required');
      }

      // Capacity validation
      if (data.capacity !== undefined && data.capacity < 0) {
        errors.push('Capacity cannot be negative');
      }

      if (data.capacity > 10000) {
        warnings.push('Capacity is extremely high, please verify');
      }

      // Efficiency validation
      if (data.efficiency !== undefined) {
        if (data.efficiency < 0 || data.efficiency > 100) {
          errors.push('Efficiency must be between 0 and 100');
        }
        if (data.efficiency < 50) {
          warnings.push('Efficiency is below 50%, consider maintenance');
        }
      }

      // OEE validation
      if (data.oeeScore !== undefined) {
        if (data.oeeScore < 0 || data.oeeScore > 100) {
          errors.push('OEE score must be between 0 and 100');
        }
        if (data.oeeScore < 60) {
          warnings.push('OEE score is below industry standard (60%)');
        }
      }

      // Safety compliance validation
      if (data.safetyCompliance === false) {
        errors.push('Work center must be safety compliant');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating work center: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate BOM (Bill of Materials) data
   */
  static validateBOM(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.bomNumber) {
        errors.push('BOM number is required');
      }

      if (!data.productCode) {
        errors.push('Product code is required');
      }

      if (!data.version) {
        errors.push('BOM version is required');
      }

      if (!data.baseQuantity || data.baseQuantity <= 0) {
        errors.push('Base quantity must be greater than 0');
      }

      // Components validation
      if (!data.components || !Array.isArray(data.components) || data.components.length === 0) {
        errors.push('BOM must have at least one component');
      } else {
        let totalCost = 0;

        data.components.forEach((component: any, index: number) => {
          if (!component.itemCode) {
            errors.push(`Component ${index + 1}: Item code is required`);
          }

          if (!component.quantity || component.quantity <= 0) {
            errors.push(`Component ${index + 1}: Quantity must be greater than 0`);
          }

          if (component.scrapAllowance !== undefined && (component.scrapAllowance < 0 || component.scrapAllowance > 50)) {
            warnings.push(`Component ${index + 1}: Scrap allowance seems unusual (${component.scrapAllowance}%)`);
          }

          if (component.unitCost && component.quantity) {
            totalCost += component.unitCost * component.quantity;
          }
        });

        if (totalCost > 100000) {
          warnings.push('Total BOM cost is very high, please verify');
        }
      }

      // Yield validation
      if (data.yieldPercentage !== undefined) {
        if (data.yieldPercentage <= 0 || data.yieldPercentage > 100) {
          errors.push('Yield percentage must be between 0 and 100');
        }
        if (data.yieldPercentage < 80) {
          warnings.push('Yield percentage is below 80%, consider process improvement');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating BOM: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate IoT device configuration
   */
  static validateIoTDevice(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.deviceId) {
        errors.push('Device ID is required');
      }

      if (!data.deviceName) {
        errors.push('Device name is required');
      }

      if (!data.deviceType) {
        errors.push('Device type is required');
      }

      if (!data.manufacturer) {
        errors.push('Manufacturer is required');
      }

      if (!data.connectivityType) {
        errors.push('Connectivity type is required');
      }

      if (!data.protocol) {
        errors.push('Communication protocol is required');
      }

      // Network configuration validation
      if (data.networkConfig) {
        if (data.networkConfig.ipAddress && !this.isValidIPAddress(data.networkConfig.ipAddress)) {
          errors.push('Invalid IP address format');
        }

        if (data.networkConfig.port && (data.networkConfig.port < 1 || data.networkConfig.port > 65535)) {
          errors.push('Port number must be between 1 and 65535');
        }

        if (data.networkConfig.macAddress && !this.isValidMacAddress(data.networkConfig.macAddress)) {
          errors.push('Invalid MAC address format');
        }
      }

      // Sensor specifications validation
      if (data.sensorSpecs && Array.isArray(data.sensorSpecs)) {
        data.sensorSpecs.forEach((sensor: any, index: number) => {
          if (!sensor.type) {
            errors.push(`Sensor ${index + 1}: Type is required`);
          }

          if (!sensor.range || !sensor.range.min === undefined || !sensor.range.max === undefined) {
            errors.push(`Sensor ${index + 1}: Valid range is required`);
          }

          if (sensor.accuracy !== undefined && (sensor.accuracy < 0 || sensor.accuracy > 100)) {
            errors.push(`Sensor ${index + 1}: Accuracy must be between 0 and 100`);
          }

          if (sensor.accuracy < 80) {
            warnings.push(`Sensor ${index + 1}: Accuracy is below 80%`);
          }
        });
      }

      // Power configuration validation
      if (data.powerConfig) {
        if (data.powerConfig.lowBatteryThreshold !== undefined && 
            (data.powerConfig.lowBatteryThreshold < 0 || data.powerConfig.lowBatteryThreshold > 100)) {
          errors.push('Low battery threshold must be between 0 and 100');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating IoT device: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate digital twin configuration
   */
  static validateDigitalTwin(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.twinCode) {
        errors.push('Twin code is required');
      }

      if (!data.twinName) {
        errors.push('Twin name is required');
      }

      if (!data.type) {
        errors.push('Twin type is required');
      }

      if (!data.physicalAsset) {
        errors.push('Physical asset information is required');
      }

      if (!data.digitalModel) {
        errors.push('Digital model information is required');
      }

      // Performance and accuracy validation
      if (data.performance !== undefined && (data.performance < 0 || data.performance > 100)) {
        errors.push('Performance must be between 0 and 100');
      }

      if (data.accuracy !== undefined && (data.accuracy < 0 || data.accuracy > 100)) {
        errors.push('Accuracy must be between 0 and 100');
      }

      if (data.performance < 70) {
        warnings.push('Digital twin performance is below 70%');
      }

      if (data.accuracy < 80) {
        warnings.push('Digital twin accuracy is below 80%');
      }

      // Simulation parameters validation
      if (data.simulationParameters) {
        if (data.simulationParameters.timeStep !== undefined) {
          if (data.simulationParameters.timeStep <= 0 || data.simulationParameters.timeStep > 3600) {
            errors.push('Time step must be between 0 and 3600 seconds');
          }
        }

        if (data.simulationParameters.convergenceCriteria !== undefined) {
          if (data.simulationParameters.convergenceCriteria <= 0) {
            errors.push('Convergence criteria must be positive');
          }
        }
      }

      // Resource management validation
      if (data.resourceManagement) {
        if (data.resourceManagement.scaling) {
          if (data.resourceManagement.scaling.minInstances !== undefined && 
              data.resourceManagement.scaling.minInstances < 1) {
            errors.push('Minimum instances must be at least 1');
          }

          if (data.resourceManagement.scaling.maxInstances !== undefined &&
              data.resourceManagement.scaling.minInstances !== undefined &&
              data.resourceManagement.scaling.maxInstances < data.resourceManagement.scaling.minInstances) {
            errors.push('Maximum instances must be greater than minimum instances');
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating digital twin: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate routing data
   */
  static validateRouting(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.routingNumber) {
        errors.push('Routing number is required');
      }

      if (!data.productCode) {
        errors.push('Product code is required');
      }

      if (!data.version) {
        errors.push('Routing version is required');
      }

      if (!data.operations || !Array.isArray(data.operations) || data.operations.length === 0) {
        errors.push('Routing must have at least one operation');
      } else {
        const operationNumbers = new Set();
        let totalTime = 0;

        data.operations.forEach((operation: any, index: number) => {
          if (!operation.operationNumber) {
            errors.push(`Operation ${index + 1}: Operation number is required`);
          } else {
            if (operationNumbers.has(operation.operationNumber)) {
              errors.push(`Operation ${index + 1}: Duplicate operation number ${operation.operationNumber}`);
            }
            operationNumbers.add(operation.operationNumber);
          }

          if (!operation.operationName) {
            errors.push(`Operation ${index + 1}: Operation name is required`);
          }

          if (!operation.workCenterId) {
            errors.push(`Operation ${index + 1}: Work center ID is required`);
          }

          if (operation.setupTime !== undefined && operation.setupTime < 0) {
            errors.push(`Operation ${index + 1}: Setup time cannot be negative`);
          }

          if (operation.runTime !== undefined && operation.runTime < 0) {
            errors.push(`Operation ${index + 1}: Run time cannot be negative`);
          }

          if (operation.laborHours !== undefined && operation.laborHours < 0) {
            errors.push(`Operation ${index + 1}: Labor hours cannot be negative`);
          }

          if (operation.machineHours !== undefined && operation.machineHours < 0) {
            errors.push(`Operation ${index + 1}: Machine hours cannot be negative`);
          }

          // Calculate total time
          totalTime += (operation.setupTime || 0) + (operation.runTime || 0);

          // Check for unrealistic times
          if (operation.setupTime > 480) { // 8 hours
            warnings.push(`Operation ${index + 1}: Setup time exceeds 8 hours`);
          }

          if (operation.runTime > 1440) { // 24 hours
            warnings.push(`Operation ${index + 1}: Run time exceeds 24 hours`);
          }
        });

        if (totalTime > 10080) { // 1 week
          warnings.push('Total routing time exceeds 1 week');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating routing: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate sensor data
   */
  static validateSensorData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Required fields
      if (!data.deviceId) {
        errors.push('Device ID is required');
      }

      if (!data.sensorId) {
        errors.push('Sensor ID is required');
      }

      if (!data.dataType) {
        errors.push('Data type is required');
      }

      if (!data.readings || !Array.isArray(data.readings) || data.readings.length === 0) {
        errors.push('At least one sensor reading is required');
      } else {
        data.readings.forEach((reading: any, index: number) => {
          if (reading.value === undefined || reading.value === null) {
            errors.push(`Reading ${index + 1}: Value is required`);
          }

          if (!reading.unit) {
            errors.push(`Reading ${index + 1}: Unit is required`);
          }

          if (!reading.timestamp) {
            errors.push(`Reading ${index + 1}: Timestamp is required`);
          } else {
            const timestamp = new Date(reading.timestamp);
            if (isNaN(timestamp.getTime())) {
              errors.push(`Reading ${index + 1}: Invalid timestamp format`);
            } else if (timestamp > new Date()) {
              warnings.push(`Reading ${index + 1}: Timestamp is in the future`);
            }
          }

          // Validate reading value ranges based on data type
          if (reading.value !== undefined && data.dataType) {
            const validationResult = this.validateSensorValueRange(data.dataType, reading.value);
            if (!validationResult.isValid) {
              warnings.push(`Reading ${index + 1}: ${validationResult.message}`);
            }
          }
        });
      }

      // Validate thresholds
      if (data.thresholds) {
        if (data.thresholds.min !== undefined && data.thresholds.max !== undefined &&
            data.thresholds.min >= data.thresholds.max) {
          errors.push('Minimum threshold must be less than maximum threshold');
        }

        if (data.thresholds.warningMin !== undefined && data.thresholds.warningMax !== undefined &&
            data.thresholds.warningMin >= data.thresholds.warningMax) {
          errors.push('Warning minimum threshold must be less than warning maximum threshold');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating sensor data: ${error.message}`);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate sensor value range based on data type
   */
  private static validateSensorValueRange(dataType: string, value: number): { isValid: boolean; message: string } {
    const ranges: Record<string, { min: number; max: number; unit?: string }> = {
      temperature: { min: -273.15, max: 3000 }, // Celsius
      pressure: { min: 0, max: 100000 }, // kPa
      humidity: { min: 0, max: 100 }, // %
      ph: { min: 0, max: 14 },
      speed: { min: 0, max: 10000 }, // RPM
      voltage: { min: 0, max: 10000 }, // V
      current: { min: 0, max: 10000 }, // A
      power: { min: 0, max: 1000000 }, // W
    };

    const range = ranges[dataType.toLowerCase()];
    if (!range) {
      return { isValid: true, message: '' }; // Unknown type, assume valid
    }

    if (value < range.min || value > range.max) {
      return {
        isValid: false,
        message: `Value ${value} is outside expected range (${range.min} - ${range.max})`,
      };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Validate IP address format
   */
  private static isValidIPAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Validate MAC address format
   */
  private static isValidMacAddress(mac: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  }

  /**
   * Validate general business rules
   */
  static validateBusinessRules(entityType: string, data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      switch (entityType.toLowerCase()) {
        case 'production_order':
          return this.validateProductionOrder(data);
        case 'work_center':
          return this.validateWorkCenter(data);
        case 'bom':
        case 'bill_of_materials':
          return this.validateBOM(data);
        case 'iot_device':
          return this.validateIoTDevice(data);
        case 'digital_twin':
          return this.validateDigitalTwin(data);
        case 'routing':
          return this.validateRouting(data);
        case 'sensor_data':
          return this.validateSensorData(data);
        default:
          warnings.push(`No specific validation rules defined for entity type: ${entityType}`);
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error(`Error validating business rules: ${error.message}`);
      return {
        isValid: false,
        errors: ['Business rule validation failed due to internal error'],
        warnings: [],
      };
    }
  }
}

// Custom validator decorators
@ValidatorConstraint({ name: 'isValidWorkCenterCode', async: false })
export class IsValidWorkCenterCode implements ValidatorConstraintInterface {
  validate(code: string, args: ValidationArguments) {
    // Work center code should be alphanumeric and between 3-10 characters
    return /^[A-Za-z0-9]{3,10}$/.test(code);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Work center code must be alphanumeric and 3-10 characters long';
  }
}

@ValidatorConstraint({ name: 'isValidProductionQuantity', async: false })
export class IsValidProductionQuantity implements ValidatorConstraintInterface {
  validate(quantity: number, args: ValidationArguments) {
    return quantity > 0 && quantity <= 1000000;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Production quantity must be between 1 and 1,000,000';
  }
}

@ValidatorConstraint({ name: 'isValidOEEScore', async: false })
export class IsValidOEEScore implements ValidatorConstraintInterface {
  validate(score: number, args: ValidationArguments) {
    return score >= 0 && score <= 100;
  }

  defaultMessage(args: ValidationArguments) {
    return 'OEE score must be between 0 and 100';
  }
}

@ValidatorConstraint({ name: 'isValidEfficiencyScore', async: false })
export class IsValidEfficiencyScore implements ValidatorConstraintInterface {
  validate(score: number, args: ValidationArguments) {
    return score >= 0 && score <= 200; // Allow up to 200% for exceptional cases
  }

  defaultMessage(args: ValidationArguments) {
    return 'Efficiency score must be between 0 and 200';
  }
}
