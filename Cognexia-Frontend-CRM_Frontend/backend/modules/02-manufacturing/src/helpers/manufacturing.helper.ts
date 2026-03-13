import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

export interface ProductionOrderSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  onTime: number;
  delayed: number;
  completionRate: number;
  onTimeDeliveryRate: number;
}

export interface WorkCenterUtilization {
  workCenterId: string;
  workCenterCode: string;
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
  efficiency: number;
  availability: number;
  oee: number;
  downtime: number;
  isBottleneck: boolean;
}

export interface MaterialRequirement {
  itemCode: string;
  itemName: string;
  totalRequired: number;
  totalAllocated: number;
  totalConsumed: number;
  shortage: number;
  unitOfMeasure: string;
  leadTime: number;
  safetyStock: number;
  reorderPoint: number;
}

export interface QualityMetrics {
  totalInspections: number;
  passed: number;
  failed: number;
  passRate: number;
  defectRate: number;
  firstPassYield: number;
  costOfQuality: number;
  averageInspectionTime: number;
}

export interface CapacityPlanningResult {
  workCenterId: string;
  currentLoad: number;
  capacity: number;
  utilizationRate: number;
  availableCapacity: number;
  overloadHours: number;
  recommendedActions: string[];
}

@Injectable()
export class ManufacturingHelper {
  private static readonly logger = new Logger(ManufacturingHelper.name);

  /**
   * Calculate production order summary statistics
   */
  static calculateProductionOrderSummary(orders: any[]): ProductionOrderSummary {
    try {
      const total = orders.length;
      const completed = orders.filter(o => o.status === 'completed').length;
      const inProgress = orders.filter(o => o.status === 'in_progress').length;
      const pending = orders.filter(o => o.status === 'pending').length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;

      // Calculate on-time delivery
      const ordersWithSchedule = orders.filter(o => o.schedule?.plannedEndDate);
      const onTime = ordersWithSchedule.filter(o => this.isOnTime(o.schedule)).length;
      const delayed = ordersWithSchedule.filter(o => this.isDelayed(o.schedule)).length;

      return {
        total,
        completed,
        inProgress,
        pending,
        cancelled,
        onTime,
        delayed,
        completionRate: total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0,
        onTimeDeliveryRate: ordersWithSchedule.length > 0 ? 
          Math.round((onTime / ordersWithSchedule.length) * 100 * 100) / 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Error calculating production order summary: ${error.message}`);
      throw new BadRequestException('Failed to calculate production order summary');
    }
  }

  /**
   * Calculate work center utilization
   */
  static calculateWorkCenterUtilization(workCenters: any[]): WorkCenterUtilization[] {
    try {
      return workCenters.map(wc => {
        const totalCapacity = wc.capacity || 0;
        const usedCapacity = wc.currentLoad || 0;
        const utilizationRate = totalCapacity > 0 ? 
          Math.round((usedCapacity / totalCapacity) * 100 * 100) / 100 : 0;

        const efficiency = wc.efficiency || 0;
        const availability = wc.availability || 0;
        const oee = wc.oeeScore || (efficiency * availability / 100);
        const downtime = wc.totalDowntime || 0;

        // Consider a work center as bottleneck if utilization > 85%
        const isBottleneck = utilizationRate > 85;

        return {
          workCenterId: wc.id,
          workCenterCode: wc.code,
          totalCapacity,
          usedCapacity,
          utilizationRate,
          efficiency,
          availability,
          oee: Math.round(oee * 100) / 100,
          downtime,
          isBottleneck,
        };
      });
    } catch (error) {
      this.logger.error(`Error calculating work center utilization: ${error.message}`);
      throw new BadRequestException('Failed to calculate work center utilization');
    }
  }

  /**
   * Calculate material requirements summary
   */
  static calculateMaterialRequirements(
    orders: any[],
    inventory?: any[]
  ): MaterialRequirement[] {
    try {
      const materialMap = new Map<string, MaterialRequirement>();

      // Aggregate requirements from all orders
      orders.forEach(order => {
        if (order.materialRequirements) {
          order.materialRequirements.forEach((req: any) => {
            const key = req.itemCode;
            const existing = materialMap.get(key);

            if (existing) {
              existing.totalRequired += req.requiredQuantity || 0;
              existing.totalAllocated += req.allocatedQuantity || 0;
              existing.totalConsumed += req.consumedQuantity || 0;
            } else {
              materialMap.set(key, {
                itemCode: req.itemCode,
                itemName: req.itemName,
                totalRequired: req.requiredQuantity || 0,
                totalAllocated: req.allocatedQuantity || 0,
                totalConsumed: req.consumedQuantity || 0,
                shortage: 0,
                unitOfMeasure: req.unitOfMeasure,
                leadTime: req.leadTime || 0,
                safetyStock: req.safetyStock || 0,
                reorderPoint: req.reorderPoint || 0,
              });
            }
          });
        }
      });

      // Calculate shortages
      const requirements = Array.from(materialMap.values());
      requirements.forEach(req => {
        req.shortage = Math.max(0, req.totalRequired - req.totalAllocated);
      });

      return requirements.sort((a, b) => b.shortage - a.shortage);
    } catch (error) {
      this.logger.error(`Error calculating material requirements: ${error.message}`);
      throw new BadRequestException('Failed to calculate material requirements');
    }
  }

  /**
   * Calculate quality metrics
   */
  static calculateQualityMetrics(qualityData: any[]): QualityMetrics {
    try {
      const totalInspections = qualityData.length;
      const passed = qualityData.filter(q => q.result === 'pass' || q.passed === true).length;
      const failed = totalInspections - passed;

      const passRate = totalInspections > 0 ? 
        Math.round((passed / totalInspections) * 100 * 100) / 100 : 0;
      const defectRate = Math.round((100 - passRate) * 100) / 100;

      // Calculate first pass yield (assuming data has firstPass flag)
      const firstPassData = qualityData.filter(q => q.firstPass === true);
      const firstPassYield = totalInspections > 0 ? 
        Math.round((firstPassData.length / totalInspections) * 100 * 100) / 100 : 0;

      // Calculate cost of quality (sum of rework, scrap, inspection costs)
      const costOfQuality = qualityData.reduce((sum, q) => {
        return sum + (q.reworkCost || 0) + (q.scrapCost || 0) + (q.inspectionCost || 0);
      }, 0);

      // Calculate average inspection time
      const inspectionTimes = qualityData
        .filter(q => q.inspectionTime && q.inspectionTime > 0)
        .map(q => q.inspectionTime);
      const averageInspectionTime = inspectionTimes.length > 0 ? 
        Math.round((inspectionTimes.reduce((a, b) => a + b, 0) / inspectionTimes.length) * 100) / 100 : 0;

      return {
        totalInspections,
        passed,
        failed,
        passRate,
        defectRate,
        firstPassYield,
        costOfQuality: Math.round(costOfQuality * 100) / 100,
        averageInspectionTime,
      };
    } catch (error) {
      this.logger.error(`Error calculating quality metrics: ${error.message}`);
      throw new BadRequestException('Failed to calculate quality metrics');
    }
  }

  /**
   * Perform capacity planning analysis
   */
  static performCapacityPlanning(
    workCenters: any[],
    orders: any[],
    timeHorizon: number = 30 // days
  ): CapacityPlanningResult[] {
    try {
      return workCenters.map(wc => {
        const currentLoad = wc.currentLoad || 0;
        const capacity = wc.capacity || 0;
        const utilizationRate = capacity > 0 ? 
          Math.round((currentLoad / capacity) * 100 * 100) / 100 : 0;

        const availableCapacity = Math.max(0, capacity - currentLoad);
        const overloadHours = Math.max(0, currentLoad - capacity);

        // Generate recommendations based on utilization
        const recommendedActions: string[] = [];
        
        if (utilizationRate > 100) {
          recommendedActions.push('Critical: Capacity exceeded, immediate action required');
          recommendedActions.push('Consider overtime, additional shifts, or outsourcing');
        } else if (utilizationRate > 90) {
          recommendedActions.push('High utilization: Monitor closely');
          recommendedActions.push('Prepare contingency plans for additional capacity');
        } else if (utilizationRate > 80) {
          recommendedActions.push('Optimal utilization range');
          recommendedActions.push('Monitor for potential bottlenecks');
        } else if (utilizationRate < 60) {
          recommendedActions.push('Low utilization: Consider reducing capacity or increasing workload');
        }

        if (wc.availability && wc.availability < 85) {
          recommendedActions.push('Low availability: Review maintenance schedule');
        }

        if (wc.efficiency && wc.efficiency < 75) {
          recommendedActions.push('Low efficiency: Review processes and training needs');
        }

        return {
          workCenterId: wc.id,
          currentLoad,
          capacity,
          utilizationRate,
          availableCapacity,
          overloadHours,
          recommendedActions,
        };
      });
    } catch (error) {
      this.logger.error(`Error performing capacity planning: ${error.message}`);
      throw new BadRequestException('Failed to perform capacity planning');
    }
  }

  /**
   * Generate production schedule recommendations
   */
  static generateScheduleRecommendations(orders: any[], workCenters: any[]): any[] {
    try {
      const recommendations: any[] = [];

      // Sort orders by priority and due date
      const sortedOrders = orders
        .filter(o => o.status === 'pending' || o.status === 'in_progress')
        .sort((a, b) => {
          // First by priority (high = 1, medium = 2, low = 3)
          const priorityWeight = { high: 1, medium: 2, low: 3 };
          const priorityA = priorityWeight[a.priority] || 2;
          const priorityB = priorityWeight[b.priority] || 2;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Then by due date
          const dueDateA = new Date(a.schedule?.plannedEndDate || '2099-12-31');
          const dueDateB = new Date(b.schedule?.plannedEndDate || '2099-12-31');
          return dueDateA.getTime() - dueDateB.getTime();
        });

      // Analyze each order
      sortedOrders.forEach(order => {
        const rec: any = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          priority: order.priority,
          status: order.status,
          recommendations: [],
        };

        // Check for delays
        if (this.isDelayed(order.schedule)) {
          rec.recommendations.push({
            type: 'delay_alert',
            message: 'Order is behind schedule',
            action: 'Expedite production or adjust schedule',
            urgency: 'high',
          });
        }

        // Check work center capacity
        const workCenter = workCenters.find(wc => wc.id === order.workCenterId);
        if (workCenter) {
          const utilization = workCenter.capacity > 0 ? 
            (workCenter.currentLoad / workCenter.capacity) * 100 : 0;
          
          if (utilization > 90) {
            rec.recommendations.push({
              type: 'capacity_constraint',
              message: `Work center ${workCenter.code} is at ${utilization.toFixed(1)}% capacity`,
              action: 'Consider rescheduling or alternative work centers',
              urgency: 'medium',
            });
          }
        }

        // Check material availability
        if (order.materialRequirements) {
          const shortages = order.materialRequirements.filter(req => 
            (req.allocatedQuantity || 0) < (req.requiredQuantity || 0)
          );

          if (shortages.length > 0) {
            rec.recommendations.push({
              type: 'material_shortage',
              message: `${shortages.length} material shortages detected`,
              action: 'Procure missing materials or adjust schedule',
              urgency: 'high',
            });
          }
        }

        if (rec.recommendations.length > 0) {
          recommendations.push(rec);
        }
      });

      return recommendations;
    } catch (error) {
      this.logger.error(`Error generating schedule recommendations: ${error.message}`);
      throw new BadRequestException('Failed to generate schedule recommendations');
    }
  }

  /**
   * Calculate lead time for production order
   */
  static calculateLeadTime(
    bom: any,
    routing: any,
    workCenters: any[]
  ): number {
    try {
      let leadTime = 0;

      // Add material lead time (maximum of all components)
      if (bom?.components) {
        const materialLeadTime = Math.max(
          ...bom.components.map((comp: any) => comp.leadTime || 0)
        );
        leadTime += materialLeadTime;
      }

      // Add processing time from routing
      if (routing?.operations) {
        const processingTime = routing.operations.reduce(
          (total: number, op: any) => total + (op.standardTime || 0),
          0
        );
        leadTime += processingTime;
      }

      // Add buffer time based on work center load
      if (routing?.operations && workCenters.length > 0) {
        const avgUtilization = workCenters.reduce(
          (sum, wc) => sum + (wc.capacity > 0 ? (wc.currentLoad / wc.capacity) : 0),
          0
        ) / workCenters.length;

        // Add buffer based on utilization (higher utilization = more buffer)
        const bufferMultiplier = 1 + (avgUtilization * 0.5);
        leadTime *= bufferMultiplier;
      }

      return Math.ceil(leadTime);
    } catch (error) {
      this.logger.error(`Error calculating lead time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Validate production order feasibility
   */
  static validateProductionFeasibility(
    order: any,
    workCenters: any[],
    inventory?: any[]
  ): { feasible: boolean; issues: string[] } {
    try {
      const issues: string[] = [];

      // Check work center availability
      if (order.workCenterId) {
        const workCenter = workCenters.find(wc => wc.id === order.workCenterId);
        if (!workCenter) {
          issues.push('Work center not found');
        } else if (!workCenter.isOperational) {
          issues.push('Work center is not operational');
        } else if (workCenter.capacity > 0 && workCenter.currentLoad >= workCenter.capacity) {
          issues.push('Work center is at full capacity');
        }
      }

      // Check material availability
      if (order.materialRequirements && inventory) {
        order.materialRequirements.forEach((req: any) => {
          const inventoryItem = inventory.find(inv => inv.itemCode === req.itemCode);
          if (!inventoryItem) {
            issues.push(`Material ${req.itemCode} not found in inventory`);
          } else if (inventoryItem.availableQuantity < req.requiredQuantity) {
            issues.push(`Insufficient quantity for ${req.itemCode}`);
          }
        });
      }

      // Check schedule feasibility
      if (order.schedule) {
        const now = new Date();
        const plannedStart = new Date(order.schedule.plannedStartDate);
        const plannedEnd = new Date(order.schedule.plannedEndDate);

        if (plannedStart < now && order.status === 'pending') {
          issues.push('Planned start date is in the past');
        }

        if (plannedEnd <= plannedStart) {
          issues.push('Planned end date must be after start date');
        }

        const duration = plannedEnd.getTime() - plannedStart.getTime();
        const estimatedDuration = order.schedule.estimatedDuration || 0;
        
        if (estimatedDuration > 0 && duration < estimatedDuration * 0.8) {
          issues.push('Planned duration is too short for estimated work');
        }
      }

      return {
        feasible: issues.length === 0,
        issues,
      };
    } catch (error) {
      this.logger.error(`Error validating production feasibility: ${error.message}`);
      return {
        feasible: false,
        issues: ['Error during validation'],
      };
    }
  }

  /**
   * Check if order is on time
   */
  private static isOnTime(schedule: any): boolean {
    if (!schedule?.plannedEndDate) return true;

    const now = new Date();
    const plannedEnd = new Date(schedule.plannedEndDate);

    if (schedule.actualEndDate) {
      return new Date(schedule.actualEndDate) <= plannedEnd;
    }

    return now <= plannedEnd;
  }

  /**
   * Check if order is delayed
   */
  private static isDelayed(schedule: any): boolean {
    if (!schedule?.plannedEndDate) return false;

    const now = new Date();
    const plannedEnd = new Date(schedule.plannedEndDate);

    if (schedule.actualEndDate) {
      return new Date(schedule.actualEndDate) > plannedEnd;
    }

    return now > plannedEnd;
  }

  /**
   * Generate unique order number
   */
  static generateOrderNumber(prefix: string = 'PO', date: Date = new Date()): string {
    try {
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const timestamp = date.getTime().toString().slice(-6);
      
      return `${prefix}${year}${month}${day}${timestamp}`;
    } catch (error) {
      this.logger.error(`Error generating order number: ${error.message}`);
      return `${prefix}${Date.now()}`;
    }
  }

  /**
   * Calculate cost variance
   */
  static calculateCostVariance(plannedCost: number, actualCost: number): {
    variance: number;
    variancePercentage: number;
    status: 'over_budget' | 'under_budget' | 'on_budget';
  } {
    try {
      const variance = actualCost - plannedCost;
      const variancePercentage = plannedCost > 0 ? 
        Math.round((variance / plannedCost) * 100 * 100) / 100 : 0;

      let status: 'over_budget' | 'under_budget' | 'on_budget';
      if (Math.abs(variancePercentage) <= 5) {
        status = 'on_budget';
      } else if (variance > 0) {
        status = 'over_budget';
      } else {
        status = 'under_budget';
      }

      return {
        variance: Math.round(variance * 100) / 100,
        variancePercentage,
        status,
      };
    } catch (error) {
      this.logger.error(`Error calculating cost variance: ${error.message}`);
      return {
        variance: 0,
        variancePercentage: 0,
        status: 'on_budget',
      };
    }
  }
}
