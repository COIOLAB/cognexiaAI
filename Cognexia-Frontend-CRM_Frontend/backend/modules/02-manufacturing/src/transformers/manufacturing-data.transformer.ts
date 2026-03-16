import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance, instanceToPlain, Transform } from 'class-transformer';

export interface TransformOptions {
  excludeNullValues?: boolean;
  excludeUndefinedValues?: boolean;
  enableCircularCheck?: boolean;
  exposeDefaultValues?: boolean;
  enableImplicitConversion?: boolean;
}

export interface DataMappingRule {
  source: string;
  target: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  errors?: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class ManufacturingDataTransformer {
  private static readonly logger = new Logger(ManufacturingDataTransformer.name);

  /**
   * Transform entity to API response format
   */
  static toApiResponse<T>(
    data: T,
    message?: string,
    metadata?: Record<string, any>
  ): ApiResponse<T> {
    try {
      return {
        success: true,
        data,
        message: message || 'Operation completed successfully',
        timestamp: new Date().toISOString(),
        metadata,
      };
    } catch (error) {
      this.logger.error(`Error creating API response: ${error.message}`);
      return {
        success: false,
        message: 'Failed to create response',
        timestamp: new Date().toISOString(),
        errors: [error.message],
      };
    }
  }

  /**
   * Transform error to API error response
   */
  static toErrorResponse(
    error: Error | string,
    statusCode?: number
  ): ApiResponse<null> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return {
      success: false,
      data: null,
      message: 'Operation failed',
      timestamp: new Date().toISOString(),
      errors: [errorMessage],
      metadata: { statusCode },
    };
  }

  /**
   * Transform paginated results to API response
   */
  static toPaginatedResponse<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: items,
      message: message || 'Data retrieved successfully',
      timestamp: new Date().toISOString(),
      metadata: {
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  }

  /**
   * Transform production order for external API
   */
  static transformProductionOrderForApi(order: any): any {
    try {
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderName: order.orderName,
        status: order.status,
        priority: order.priority,
        product: {
          code: order.productCode,
          name: order.productName,
        },
        quantities: {
          planned: order.plannedQuantity,
          actual: order.actualQuantity || 0,
          good: order.goodQuantity || 0,
          rejected: order.rejectedQuantity || 0,
          scrap: order.scrapQuantity || 0,
        },
        schedule: order.schedule ? {
          plannedStart: order.schedule.plannedStartDate,
          plannedEnd: order.schedule.plannedEndDate,
          actualStart: order.schedule.actualStartDate,
          actualEnd: order.schedule.actualEndDate,
          estimatedDuration: order.schedule.estimatedDuration,
          actualDuration: order.schedule.actualDuration,
        } : null,
        progress: {
          completion: order.completionPercentage || 0,
          efficiency: this.calculateEfficiency(order.actualQuantity, order.plannedQuantity),
          onTime: this.isOnSchedule(order.schedule),
        },
        costs: order.costTracking ? {
          planned: order.costTracking.totalPlannedCost || 0,
          actual: order.costTracking.totalActualCost || 0,
          variance: order.costTracking.costVariance || 0,
          variancePercentage: order.costTracking.costVariancePercentage || 0,
        } : null,
        materials: order.materialRequirements?.map((material: any) => ({
          itemCode: material.itemCode,
          itemName: material.itemName,
          required: material.requiredQuantity,
          allocated: material.allocatedQuantity || 0,
          consumed: material.consumedQuantity || 0,
          unitOfMeasure: material.unitOfMeasure,
        })) || [],
        quality: order.qualityRequirements?.map((quality: any) => ({
          parameter: quality.parameter,
          target: quality.targetValue,
          tolerance: quality.tolerance,
          method: quality.testMethod,
          critical: quality.isCritical || false,
        })) || [],
        timestamps: {
          created: order.createdAt,
          updated: order.updatedAt,
        },
        metadata: {
          bomId: order.bomId,
          routingId: order.routingId,
          workCenterId: order.workCenterId,
          productionLineId: order.productionLineId,
          isRush: order.isRush || false,
          requiresSpecialHandling: order.requiresSpecialHandling || false,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming production order: ${error.message}`);
      return order; // Return original if transformation fails
    }
  }

  /**
   * Transform work center for external API
   */
  static transformWorkCenterForApi(workCenter: any): any {
    try {
      return {
        id: workCenter.id,
        code: workCenter.code,
        name: workCenter.name,
        type: workCenter.type,
        industryType: workCenter.industryType,
        status: workCenter.status,
        location: workCenter.location,
        capacity: {
          maximum: workCenter.capacity || 0,
          current: workCenter.currentLoad || 0,
          available: Math.max(0, (workCenter.capacity || 0) - (workCenter.currentLoad || 0)),
          utilization: workCenter.capacity > 0 ? 
            ((workCenter.currentLoad || 0) / workCenter.capacity * 100) : 0,
        },
        performance: {
          efficiency: workCenter.efficiency || 0,
          availability: workCenter.availability || 0,
          quality: workCenter.quality || 0,
          oee: workCenter.oeeScore || 0,
        },
        operational: {
          isOperational: workCenter.isOperational || false,
          lastMaintenance: workCenter.lastMaintenanceDate,
          nextMaintenance: workCenter.nextMaintenanceDate,
          downtime: workCenter.totalDowntime || 0,
          plannedDowntime: workCenter.plannedDowntime || 0,
          unplannedDowntime: workCenter.unplannedDowntime || 0,
        },
        compliance: {
          safety: workCenter.safetyCompliance || false,
          gmp: workCenter.gmpCompliant || false,
          hazmat: workCenter.hazmatCompliant || false,
          certifications: workCenter.safetyCertifications || [],
        },
        capabilities: workCenter.capabilities || [],
        timestamps: {
          created: workCenter.createdAt,
          updated: workCenter.updatedAt,
        },
        metadata: workCenter.metadata || {},
      };
    } catch (error) {
      this.logger.error(`Error transforming work center: ${error.message}`);
      return workCenter;
    }
  }

  /**
   * Transform BOM for external API
   */
  static transformBOMForApi(bom: any): any {
    try {
      return {
        id: bom.id,
        bomNumber: bom.bomNumber,
        bomName: bom.bomName,
        status: bom.status,
        type: bom.bomType,
        version: bom.version,
        revision: bom.revision,
        product: {
          code: bom.productCode,
          name: bom.productName,
        },
        baseQuantity: bom.baseQuantity,
        baseUnitOfMeasure: bom.baseUnitOfMeasure,
        components: bom.components?.map((component: any) => ({
          itemCode: component.itemCode,
          itemName: component.itemName,
          type: component.componentType,
          quantity: component.quantity,
          unitOfMeasure: component.unitOfMeasure,
          unitCost: component.unitCost || 0,
          extendedCost: component.extendedCost || 0,
          scrapAllowance: component.scrapAllowance || 0,
          leadTime: component.leadTime || 0,
          critical: component.isCritical || false,
          optional: component.isOptional || false,
          supplier: component.supplier,
          supplierPartNumber: component.supplierPartNumber,
          position: component.position,
          level: component.level || 0,
        })) || [],
        costs: bom.costBreakdown ? {
          material: bom.costBreakdown.materialCost || 0,
          labor: bom.costBreakdown.laborCost || 0,
          overhead: bom.costBreakdown.overheadCost || 0,
          subcontractor: bom.costBreakdown.subcontractorCost || 0,
          total: bom.costBreakdown.totalCost || 0,
          perUnit: bom.costBreakdown.costPerUnit || 0,
        } : null,
        quality: bom.qualitySpecifications ? {
          standards: bom.qualitySpecifications.standards || [],
          inspections: bom.qualitySpecifications.inspectionRequirements || [],
          tests: bom.qualitySpecifications.testProcedures || [],
          criteria: bom.qualitySpecifications.acceptanceCriteria,
        } : null,
        manufacturing: {
          method: bom.manufacturingMethod,
          routingId: bom.routingId,
          workCenterId: bom.workCenterId,
          productionLineId: bom.productionLineId,
          leadTime: bom.manufacturingLeadTime || 0,
          yield: bom.yieldPercentage || 100,
          scrapRate: bom.scrapRate || 0,
          batchSize: bom.batchSize || 1,
        },
        validity: {
          effectiveFrom: bom.effectiveFrom,
          effectiveTo: bom.effectiveTo,
          isActive: bom.isActive || false,
          approvedBy: bom.approvedBy,
          approvalDate: bom.approvalDate,
        },
        timestamps: {
          created: bom.createdAt,
          updated: bom.updatedAt,
        },
        metadata: bom.metadata || {},
      };
    } catch (error) {
      this.logger.error(`Error transforming BOM: ${error.message}`);
      return bom;
    }
  }

  /**
   * Transform IoT device for external API
   */
  static transformIoTDeviceForApi(device: any): any {
    try {
      return {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        status: device.status,
        manufacturer: device.manufacturer,
        model: device.model,
        serialNumber: device.serialNumber,
        location: device.location,
        connectivity: {
          type: device.connectivityType,
          protocol: device.protocol,
          network: device.networkConfig ? {
            ipAddress: device.networkConfig.ipAddress,
            macAddress: device.networkConfig.macAddress,
            port: device.networkConfig.port,
            dhcp: device.networkConfig.dhcpEnabled,
            ssl: device.networkConfig.sslEnabled,
          } : null,
        },
        power: device.powerConfig ? {
          source: device.powerConfig.powerSource,
          consumption: device.powerConfig.powerConsumption,
          batteryLevel: device.powerConfig.batteryCapacity,
          lowBatteryThreshold: device.powerConfig.lowBatteryThreshold,
          powerSaving: device.powerConfig.powerSavingEnabled,
        } : null,
        sensors: device.sensorSpecs?.map((sensor: any) => ({
          type: sensor.type,
          range: sensor.range,
          accuracy: sensor.accuracy,
          resolution: sensor.resolution,
          responseTime: sensor.responseTime,
          samplingRate: sensor.samplingRate,
          calibrationInterval: sensor.calibrationInterval,
        })) || [],
        data: {
          collectionFrequency: device.dataCollectionFrequency,
          transmissionFrequency: device.dataTransmissionFrequency,
          retentionDays: device.dataRetentionDays,
          thresholds: device.alertThresholds || {},
        },
        maintenance: device.maintenanceSchedule ? {
          last: device.maintenanceSchedule.lastMaintenance,
          next: device.maintenanceSchedule.nextMaintenance,
          interval: device.maintenanceSchedule.maintenanceInterval,
        } : null,
        capabilities: {
          edge: device.edgeCapabilities || false,
          ai: device.aiCapabilities || false,
          realTime: device.realTimeProcessing || false,
        },
        associations: {
          workCenter: device.workCenterId,
          productionLine: device.productionLineId,
          equipment: device.equipmentId,
        },
        tags: device.tags || [],
        critical: device.isCritical || false,
        redundancy: device.redundancy,
        backupDevices: device.backupDevices || [],
        timestamps: {
          installed: device.installationDate,
          created: device.createdAt,
          updated: device.updatedAt,
        },
        metadata: device.metadata || {},
      };
    } catch (error) {
      this.logger.error(`Error transforming IoT device: ${error.message}`);
      return device;
    }
  }

  /**
   * Transform sensor data for analytics
   */
  static transformSensorDataForAnalytics(sensorData: any): any {
    try {
      return {
        deviceId: sensorData.deviceId,
        sensorId: sensorData.sensorId,
        sensorName: sensorData.sensorName,
        dataType: sensorData.dataType,
        location: sensorData.location,
        readings: sensorData.readings?.map((reading: any) => ({
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp,
          quality: reading.quality,
          alertLevel: reading.alertLevel,
          confidence: reading.confidence,
        })) || [],
        aggregations: this.calculateSensorAggregations(sensorData.readings),
        thresholds: sensorData.thresholds || {},
        associations: {
          workCenter: sensorData.workCenterId,
          productionLine: sensorData.productionLineId,
          equipment: sensorData.equipmentId,
          productionOrder: sensorData.productionOrderId,
          batch: sensorData.batchNumber,
        },
        quality: sensorData.qualityMetrics ? {
          score: sensorData.qualityMetrics.qualityScore,
          defectRate: sensorData.qualityMetrics.defectRate,
          firstPassYield: sensorData.qualityMetrics.firstPassYield,
          oee: sensorData.qualityMetrics.oee,
        } : null,
        anomalies: sensorData.anomalies || { detected: false },
        predictions: sensorData.predictions || {},
        tags: sensorData.tags || [],
        metadata: sensorData.metadata || {},
      };
    } catch (error) {
      this.logger.error(`Error transforming sensor data: ${error.message}`);
      return sensorData;
    }
  }

  /**
   * Transform data using mapping rules
   */
  static transformWithRules<T>(
    sourceData: any,
    mappingRules: DataMappingRule[],
    targetClass?: new () => T
  ): T {
    try {
      const result: any = {};

      mappingRules.forEach(rule => {
        let sourceValue = this.getNestedProperty(sourceData, rule.source);

        // Apply default value if source is undefined/null and default is provided
        if ((sourceValue === undefined || sourceValue === null) && rule.defaultValue !== undefined) {
          sourceValue = rule.defaultValue;
        }

        // Check required fields
        if (rule.required && (sourceValue === undefined || sourceValue === null)) {
          throw new Error(`Required field '${rule.source}' is missing`);
        }

        // Apply transformation if provided
        if (rule.transform && sourceValue !== undefined && sourceValue !== null) {
          sourceValue = rule.transform(sourceValue);
        }

        // Set the target property
        if (sourceValue !== undefined && sourceValue !== null) {
          this.setNestedProperty(result, rule.target, sourceValue);
        }
      });

      // Convert to target class if provided
      if (targetClass) {
        return plainToInstance(targetClass, result);
      }

      return result as T;
    } catch (error) {
      this.logger.error(`Error transforming data with rules: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate sensor data aggregations
   */
  private static calculateSensorAggregations(readings: any[]): any {
    if (!readings || readings.length === 0) {
      return null;
    }

    try {
      const values = readings.map(r => r.value).filter(v => typeof v === 'number');
      
      if (values.length === 0) {
        return null;
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate standard deviation
      const variance = values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      return {
        count: values.length,
        sum: Math.round(sum * 100) / 100,
        average: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        range: Math.round((max - min) * 100) / 100,
        standardDeviation: Math.round(stdDev * 100) / 100,
        variance: Math.round(variance * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating sensor aggregations: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate efficiency
   */
  private static calculateEfficiency(actual: number, planned: number): number {
    if (!planned || planned <= 0) return 0;
    return Math.round((actual / planned) * 100 * 100) / 100;
  }

  /**
   * Check if production is on schedule
   */
  private static isOnSchedule(schedule: any): boolean {
    if (!schedule || !schedule.plannedEndDate) return true;
    
    const now = new Date();
    const plannedEnd = new Date(schedule.plannedEndDate);
    
    if (schedule.actualEndDate) {
      return new Date(schedule.actualEndDate) <= plannedEnd;
    }
    
    return now <= plannedEnd;
  }

  /**
   * Get nested property value using dot notation
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Set nested property value using dot notation
   */
  private static setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    
    if (lastKey) {
      target[lastKey] = value;
    }
  }

  /**
   * Clean object by removing null/undefined values
   */
  static cleanObject(obj: any, options: TransformOptions = {}): any {
    try {
      const {
        excludeNullValues = true,
        excludeUndefinedValues = true,
      } = options;

      if (obj === null || obj === undefined) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj
          .map(item => this.cleanObject(item, options))
          .filter(item => {
            if (excludeNullValues && item === null) return false;
            if (excludeUndefinedValues && item === undefined) return false;
            return true;
          });
      }

      if (typeof obj === 'object') {
        const cleaned: any = {};
        
        Object.keys(obj).forEach(key => {
          const value = this.cleanObject(obj[key], options);
          
          if (excludeNullValues && value === null) return;
          if (excludeUndefinedValues && value === undefined) return;
          
          cleaned[key] = value;
        });

        return cleaned;
      }

      return obj;
    } catch (error) {
      this.logger.error(`Error cleaning object: ${error.message}`);
      return obj;
    }
  }

  /**
   * Convert entity to plain object
   */
  static toPlain<T>(entity: T, options: TransformOptions = {}): any {
    try {
      const plainObject = instanceToPlain(entity, {
        excludeExtraneousValues: false,
        exposeDefaultValues: options.exposeDefaultValues,
        enableCircularCheck: options.enableCircularCheck,
        enableImplicitConversion: options.enableImplicitConversion,
      });

      return this.cleanObject(plainObject, options);
    } catch (error) {
      this.logger.error(`Error converting to plain object: ${error.message}`);
      return entity;
    }
  }

  /**
   * Convert plain object to class instance
   */
  static toInstance<T>(plainObject: any, targetClass: new () => T, options: TransformOptions = {}): T {
    try {
      return plainToInstance(targetClass, plainObject, {
        excludeExtraneousValues: false,
        exposeDefaultValues: options.exposeDefaultValues,
        enableCircularCheck: options.enableCircularCheck,
        enableImplicitConversion: options.enableImplicitConversion,
      });
    } catch (error) {
      this.logger.error(`Error converting to instance: ${error.message}`);
      throw error;
    }
  }
}
