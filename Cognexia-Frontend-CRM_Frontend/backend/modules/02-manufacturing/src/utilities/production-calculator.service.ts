import { Injectable } from '@nestjs/common';

export interface ProductionCalculation {
  totalCost: number;
  unitCost: number;
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  estimatedTime: number;
  efficiency: number;
}

@Injectable()
export class ProductionCalculatorService {
  /**
   * Calculate total production cost
   */
  calculateProductionCost(
    quantity: number,
    materialCostPerUnit: number,
    laborHours: number,
    laborRate: number,
    overheadRate: number = 0.15
  ): ProductionCalculation {
    const materialCost = quantity * materialCostPerUnit;
    const laborCost = laborHours * laborRate;
    const overheadCost = (materialCost + laborCost) * overheadRate;
    const totalCost = materialCost + laborCost + overheadCost;
    const unitCost = totalCost / quantity;

    return {
      totalCost,
      unitCost,
      laborCost,
      materialCost,
      overheadCost,
      estimatedTime: laborHours,
      efficiency: this.calculateEfficiency(quantity, laborHours)
    };
  }

  /**
   * Calculate production efficiency
   */
  calculateEfficiency(quantity: number, actualHours: number, standardHours?: number): number {
    const standard = standardHours || quantity * 0.5; // Default 0.5 hours per unit
    return (standard / actualHours) * 100;
  }

  /**
   * Calculate capacity utilization
   */
  calculateCapacityUtilization(actualOutput: number, maxCapacity: number): number {
    return (actualOutput / maxCapacity) * 100;
  }

  /**
   * Calculate lead time
   */
  calculateLeadTime(
    setupTime: number,
    processingTime: number,
    queueTime: number = 0,
    waitTime: number = 0
  ): number {
    return setupTime + processingTime + queueTime + waitTime;
  }

  /**
   * Calculate batch size optimization
   */
  calculateOptimalBatchSize(
    demand: number,
    setupCost: number,
    holdingCost: number
  ): number {
    // Economic Order Quantity (EOQ) formula
    return Math.sqrt((2 * demand * setupCost) / holdingCost);
  }

  /**
   * Calculate throughput
   */
  calculateThroughput(unitsProduced: number, timeInHours: number): number {
    return unitsProduced / timeInHours;
  }

  /**
   * Calculate cycle time
   */
  calculateCycleTime(totalTime: number, unitsProduced: number): number {
    return totalTime / unitsProduced;
  }

  /**
   * Calculate Overall Equipment Effectiveness (OEE)
   */
  calculateOEE(
    plannedProductionTime: number,
    actualRunTime: number,
    idealCycleTime: number,
    totalPieces: number,
    goodPieces: number
  ): {
    availability: number;
    performance: number;
    quality: number;
    oee: number;
  } {
    const availability = (actualRunTime / plannedProductionTime) * 100;
    const performance = ((idealCycleTime * totalPieces) / actualRunTime) * 100;
    const quality = (goodPieces / totalPieces) * 100;
    const oee = (availability * performance * quality) / 10000;

    return {
      availability,
      performance,
      quality,
      oee
    };
  }
}