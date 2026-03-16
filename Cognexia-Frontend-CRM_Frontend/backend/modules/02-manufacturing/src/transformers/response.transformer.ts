import { Injectable, Logger } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class PaginationDto {
  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  totalPages: number;

  @IsBoolean()
  hasNext: boolean;

  @IsBoolean()
  hasPrev: boolean;
}

export class BaseResponseDto<T> {
  @IsBoolean()
  success: boolean;

  @IsOptional()
  data?: T;

  @IsOptional()
  @IsString()
  message?: string;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  errors?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}

@Injectable()
export class ResponseTransformer {
  private static readonly logger = new Logger(ResponseTransformer.name);

  /**
   * Transform single entity response
   */
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    metadata?: Record<string, any>
  ): BaseResponseDto<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  /**
   * Transform error response
   */
  static error(
    message: string = 'Operation failed',
    errors?: string[],
    metadata?: Record<string, any>
  ): BaseResponseDto<null> {
    return {
      success: false,
      data: null,
      message,
      timestamp: new Date().toISOString(),
      errors,
      metadata,
    };
  }

  /**
   * Transform paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data retrieved successfully'
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Transform list response (non-paginated)
   */
  static list<T>(
    data: T[],
    message: string = 'Data retrieved successfully',
    metadata?: Record<string, any>
  ): BaseResponseDto<T[]> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        count: data.length,
        ...metadata,
      },
    };
  }

  /**
   * Transform no content response (204)
   */
  static noContent(
    message: string = 'Operation completed successfully'
  ): BaseResponseDto<null> {
    return {
      success: true,
      data: null,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transform production order list response
   */
  static productionOrderList(
    orders: any[],
    total?: number,
    page?: number,
    limit?: number
  ): BaseResponseDto<any[]> | PaginatedResponseDto<any> {
    const transformedOrders = orders.map(order => this.transformProductionOrder(order));
    
    if (total !== undefined && page !== undefined && limit !== undefined) {
      return this.paginated(transformedOrders, total, page, limit, 'Production orders retrieved successfully');
    }
    
    return this.list(transformedOrders, 'Production orders retrieved successfully');
  }

  /**
   * Transform single production order response
   */
  static productionOrder(order: any): BaseResponseDto<any> {
    const transformed = this.transformProductionOrder(order);
    return this.success(transformed, 'Production order retrieved successfully');
  }

  /**
   * Transform work center list response
   */
  static workCenterList(
    workCenters: any[],
    total?: number,
    page?: number,
    limit?: number
  ): BaseResponseDto<any[]> | PaginatedResponseDto<any> {
    const transformedWorkCenters = workCenters.map(wc => this.transformWorkCenter(wc));
    
    if (total !== undefined && page !== undefined && limit !== undefined) {
      return this.paginated(transformedWorkCenters, total, page, limit, 'Work centers retrieved successfully');
    }
    
    return this.list(transformedWorkCenters, 'Work centers retrieved successfully');
  }

  /**
   * Transform single work center response
   */
  static workCenter(workCenter: any): BaseResponseDto<any> {
    const transformed = this.transformWorkCenter(workCenter);
    return this.success(transformed, 'Work center retrieved successfully');
  }

  /**
   * Transform BOM list response
   */
  static bomList(
    boms: any[],
    total?: number,
    page?: number,
    limit?: number
  ): BaseResponseDto<any[]> | PaginatedResponseDto<any> {
    const transformedBoms = boms.map(bom => this.transformBOM(bom));
    
    if (total !== undefined && page !== undefined && limit !== undefined) {
      return this.paginated(transformedBoms, total, page, limit, 'BOMs retrieved successfully');
    }
    
    return this.list(transformedBoms, 'BOMs retrieved successfully');
  }

  /**
   * Transform single BOM response
   */
  static bom(bom: any): BaseResponseDto<any> {
    const transformed = this.transformBOM(bom);
    return this.success(transformed, 'BOM retrieved successfully');
  }

  /**
   * Transform IoT device list response
   */
  static iotDeviceList(
    devices: any[],
    total?: number,
    page?: number,
    limit?: number
  ): BaseResponseDto<any[]> | PaginatedResponseDto<any> {
    const transformedDevices = devices.map(device => this.transformIoTDevice(device));
    
    if (total !== undefined && page !== undefined && limit !== undefined) {
      return this.paginated(transformedDevices, total, page, limit, 'IoT devices retrieved successfully');
    }
    
    return this.list(transformedDevices, 'IoT devices retrieved successfully');
  }

  /**
   * Transform single IoT device response
   */
  static iotDevice(device: any): BaseResponseDto<any> {
    const transformed = this.transformIoTDevice(device);
    return this.success(transformed, 'IoT device retrieved successfully');
  }

  /**
   * Transform analytics response
   */
  static analytics(
    data: any,
    analysisType: string,
    timeRange?: { start: Date; end: Date }
  ): BaseResponseDto<any> {
    const metadata: any = {
      analysisType,
      generatedAt: new Date().toISOString(),
    };

    if (timeRange) {
      metadata.timeRange = {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString(),
        duration: timeRange.end.getTime() - timeRange.start.getTime(),
      };
    }

    return this.success(
      this.transformAnalyticsData(data),
      `${analysisType} analytics retrieved successfully`,
      metadata
    );
  }

  /**
   * Transform dashboard data response
   */
  static dashboard(data: any): BaseResponseDto<any> {
    return this.success(
      this.transformDashboardData(data),
      'Dashboard data retrieved successfully',
      {
        refreshedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      }
    );
  }

  /**
   * Transform report response
   */
  static report(
    data: any,
    reportType: string,
    format: string = 'json'
  ): BaseResponseDto<any> {
    return this.success(
      data,
      `${reportType} report generated successfully`,
      {
        reportType,
        format,
        generatedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : undefined,
      }
    );
  }

  /**
   * Transform bulk operation response
   */
  static bulkOperation(
    results: any[],
    operation: string
  ): BaseResponseDto<any> {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return this.success(
      {
        results,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
          successRate: Math.round((successful.length / results.length) * 100 * 100) / 100,
        },
      },
      `Bulk ${operation} completed`,
      {
        operation,
        processedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Transform production order for response
   */
  private static transformProductionOrder(order: any): any {
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
          remaining: Math.max(0, order.plannedQuantity - (order.actualQuantity || 0)),
          completion: order.plannedQuantity > 0 ? 
            Math.round(((order.actualQuantity || 0) / order.plannedQuantity) * 100 * 100) / 100 : 0,
        },
        schedule: order.schedule ? {
          plannedStart: order.schedule.plannedStartDate,
          plannedEnd: order.schedule.plannedEndDate,
          actualStart: order.schedule.actualStartDate,
          actualEnd: order.schedule.actualEndDate,
          isDelayed: this.isDelayed(order.schedule),
        } : null,
        workCenter: order.workCenter ? {
          id: order.workCenter.id,
          code: order.workCenter.code,
          name: order.workCenter.name,
        } : null,
        timestamps: {
          created: order.createdAt,
          updated: order.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming production order: ${error.message}`);
      return order;
    }
  }

  /**
   * Transform work center for response
   */
  private static transformWorkCenter(workCenter: any): any {
    try {
      return {
        id: workCenter.id,
        code: workCenter.code,
        name: workCenter.name,
        type: workCenter.type,
        status: workCenter.status,
        capacity: {
          maximum: workCenter.capacity || 0,
          current: workCenter.currentLoad || 0,
          utilization: workCenter.capacity > 0 ? 
            Math.round(((workCenter.currentLoad || 0) / workCenter.capacity) * 100 * 100) / 100 : 0,
        },
        performance: {
          efficiency: workCenter.efficiency || 0,
          availability: workCenter.availability || 0,
          oee: workCenter.oeeScore || 0,
        },
        isOperational: workCenter.isOperational || false,
        timestamps: {
          created: workCenter.createdAt,
          updated: workCenter.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming work center: ${error.message}`);
      return workCenter;
    }
  }

  /**
   * Transform BOM for response
   */
  private static transformBOM(bom: any): any {
    try {
      return {
        id: bom.id,
        bomNumber: bom.bomNumber,
        bomName: bom.bomName,
        status: bom.status,
        version: bom.version,
        product: {
          code: bom.productCode,
          name: bom.productName,
        },
        componentCount: bom.components?.length || 0,
        totalCost: bom.costBreakdown?.totalCost || 0,
        isActive: bom.isActive || false,
        validity: {
          from: bom.effectiveFrom,
          to: bom.effectiveTo,
        },
        timestamps: {
          created: bom.createdAt,
          updated: bom.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming BOM: ${error.message}`);
      return bom;
    }
  }

  /**
   * Transform IoT device for response
   */
  private static transformIoTDevice(device: any): any {
    try {
      return {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        status: device.status,
        location: device.location,
        connectivity: {
          type: device.connectivityType,
          isConnected: device.status === 'active' || device.status === 'online',
        },
        lastSeen: device.lastSeen || device.updatedAt,
        isCritical: device.isCritical || false,
        workCenter: device.workCenter ? {
          id: device.workCenter.id,
          code: device.workCenter.code,
          name: device.workCenter.name,
        } : null,
        timestamps: {
          installed: device.installationDate,
          created: device.createdAt,
          updated: device.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming IoT device: ${error.message}`);
      return device;
    }
  }

  /**
   * Transform analytics data
   */
  private static transformAnalyticsData(data: any): any {
    try {
      if (!data) return null;

      return {
        ...data,
        metadata: {
          ...data.metadata,
          processedAt: new Date().toISOString(),
          dataPoints: Array.isArray(data.dataPoints) ? data.dataPoints.length : 0,
        },
      };
    } catch (error) {
      this.logger.error(`Error transforming analytics data: ${error.message}`);
      return data;
    }
  }

  /**
   * Transform dashboard data
   */
  private static transformDashboardData(data: any): any {
    try {
      return {
        summary: data.summary || {},
        metrics: data.metrics || {},
        charts: data.charts || [],
        alerts: data.alerts || [],
        performance: data.performance || {},
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error transforming dashboard data: ${error.message}`);
      return data;
    }
  }

  /**
   * Check if schedule is delayed
   */
  private static isDelayed(schedule: any): boolean {
    if (!schedule) return false;

    const now = new Date();
    
    // If actual end date exists, check if it's after planned end
    if (schedule.actualEndDate && schedule.plannedEndDate) {
      return new Date(schedule.actualEndDate) > new Date(schedule.plannedEndDate);
    }
    
    // If not completed but past planned end date
    if (!schedule.actualEndDate && schedule.plannedEndDate) {
      return now > new Date(schedule.plannedEndDate);
    }
    
    return false;
  }

  /**
   * Sanitize data for response (remove sensitive fields)
   */
  static sanitize(data: any, sensitiveFields: string[] = []): any {
    try {
      if (!data || typeof data !== 'object') return data;

      const defaultSensitiveFields = [
        'password',
        'secret',
        'token',
        'key',
        'privateKey',
        'apiKey',
        'accessToken',
        'refreshToken',
      ];

      const fieldsToRemove = [...defaultSensitiveFields, ...sensitiveFields];
      
      const sanitized = JSON.parse(JSON.stringify(data));
      
      const removeFields = (obj: any) => {
        if (Array.isArray(obj)) {
          return obj.map(item => removeFields(item));
        }
        
        if (obj && typeof obj === 'object') {
          const cleaned: any = {};
          
          Object.keys(obj).forEach(key => {
            const shouldRemove = fieldsToRemove.some(field => 
              key.toLowerCase().includes(field.toLowerCase())
            );
            
            if (!shouldRemove) {
              cleaned[key] = removeFields(obj[key]);
            }
          });
          
          return cleaned;
        }
        
        return obj;
      };

      return removeFields(sanitized);
    } catch (error) {
      this.logger.error(`Error sanitizing data: ${error.message}`);
      return data;
    }
  }
}
