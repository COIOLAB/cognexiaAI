import { Logger } from '@nestjs/common';

export interface OEEComponents {
  availability: number;
  performance: number;
  quality: number;
}

export interface ProductionMetrics {
  plannedProductionTime: number;
  actualProductionTime: number;
  downtime: number;
  idealCycleTime: number;
  totalPiecesProduced: number;
  goodPieces: number;
  defectivePieces: number;
  targetRate: number;
  actualRate: number;
}

export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  machineCost: number;
  energyCost: number;
  maintenanceCost: number;
  qualityCost: number;
  totalCost: number;
  costPerUnit: number;
}

export interface CapacityAnalysis {
  theoreticalCapacity: number;
  practicalCapacity: number;
  currentUtilization: number;
  availableCapacity: number;
  bottleneckFactor: number;
  expansionNeed: number;
}

export interface EnergyConsumption {
  totalConsumption: number;
  consumptionPerUnit: number;
  peakDemand: number;
  averageDemand: number;
  efficiencyRating: number;
  carbonFootprint: number;
  costPerKWh: number;
  totalEnergyCost: number;
}

export class ManufacturingCalculationsUtil {
  private static readonly logger = new Logger(ManufacturingCalculationsUtil.name);

  /**
   * Calculate Overall Equipment Effectiveness (OEE)
   */
  static calculateOEE(metrics: ProductionMetrics): OEEComponents & { oee: number } {
    try {
      // Availability = (Planned Production Time - Downtime) / Planned Production Time
      const availability = Math.max(0, Math.min(1, 
        (metrics.plannedProductionTime - metrics.downtime) / metrics.plannedProductionTime
      ));

      // Performance = (Ideal Cycle Time × Total Pieces) / Actual Production Time
      const performance = Math.max(0, Math.min(1,
        (metrics.idealCycleTime * metrics.totalPiecesProduced) / metrics.actualProductionTime
      ));

      // Quality = Good Pieces / Total Pieces Produced
      const quality = Math.max(0, Math.min(1,
        metrics.goodPieces / Math.max(1, metrics.totalPiecesProduced)
      ));

      // OEE = Availability × Performance × Quality
      const oee = availability * performance * quality;

      return {
        availability: Math.round(availability * 100 * 100) / 100, // Round to 2 decimal places
        performance: Math.round(performance * 100 * 100) / 100,
        quality: Math.round(quality * 100 * 100) / 100,
        oee: Math.round(oee * 100 * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating OEE: ${error.message}`);
      return { availability: 0, performance: 0, quality: 0, oee: 0 };
    }
  }

  /**
   * Calculate production efficiency
   */
  static calculateEfficiency(actualOutput: number, standardOutput: number): number {
    try {
      if (standardOutput <= 0) return 0;
      return Math.round((actualOutput / standardOutput) * 100 * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating efficiency: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate cycle time
   */
  static calculateCycleTime(totalTime: number, unitsProduced: number): number {
    try {
      if (unitsProduced <= 0) return 0;
      return Math.round((totalTime / unitsProduced) * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating cycle time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate throughput
   */
  static calculateThroughput(unitsProduced: number, timeInHours: number): number {
    try {
      if (timeInHours <= 0) return 0;
      return Math.round((unitsProduced / timeInHours) * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating throughput: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate takt time (customer demand rate)
   */
  static calculateTaktTime(availableTimePerShift: number, customerDemandPerShift: number): number {
    try {
      if (customerDemandPerShift <= 0) return 0;
      return Math.round((availableTimePerShift / customerDemandPerShift) * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating takt time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate lead time
   */
  static calculateLeadTime(
    processingTime: number,
    queueTime: number = 0,
    setupTime: number = 0,
    waitTime: number = 0
  ): number {
    try {
      return Math.round((processingTime + queueTime + setupTime + waitTime) * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating lead time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate capacity utilization
   */
  static calculateCapacityUtilization(actualCapacity: number, maxCapacity: number): number {
    try {
      if (maxCapacity <= 0) return 0;
      return Math.round((actualCapacity / maxCapacity) * 100 * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating capacity utilization: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate comprehensive cost breakdown
   */
  static calculateCostBreakdown(
    materialCost: number,
    laborHours: number,
    laborRate: number,
    overheadRate: number,
    machineHours: number,
    machineRate: number,
    energyConsumption: number,
    energyRate: number,
    maintenanceCost: number = 0,
    qualityCost: number = 0,
    quantity: number = 1
  ): CostBreakdown {
    try {
      const laborCost = laborHours * laborRate;
      const overheadCost = laborCost * (overheadRate / 100);
      const machineCost = machineHours * machineRate;
      const energyCost = energyConsumption * energyRate;
      
      const totalCost = materialCost + laborCost + overheadCost + machineCost + 
                       energyCost + maintenanceCost + qualityCost;
      
      const costPerUnit = quantity > 0 ? totalCost / quantity : totalCost;

      return {
        materialCost: Math.round(materialCost * 100) / 100,
        laborCost: Math.round(laborCost * 100) / 100,
        overheadCost: Math.round(overheadCost * 100) / 100,
        machineCost: Math.round(machineCost * 100) / 100,
        energyCost: Math.round(energyCost * 100) / 100,
        maintenanceCost: Math.round(maintenanceCost * 100) / 100,
        qualityCost: Math.round(qualityCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        costPerUnit: Math.round(costPerUnit * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating cost breakdown: ${error.message}`);
      return {
        materialCost: 0, laborCost: 0, overheadCost: 0, machineCost: 0,
        energyCost: 0, maintenanceCost: 0, qualityCost: 0, totalCost: 0, costPerUnit: 0,
      };
    }
  }

  /**
   * Calculate capacity analysis
   */
  static calculateCapacityAnalysis(
    theoreticalCapacity: number,
    currentOutput: number,
    targetOutput: number,
    bottleneckEfficiency: number = 1
  ): CapacityAnalysis {
    try {
      const practicalCapacity = theoreticalCapacity * 0.85; // Assuming 85% practical capacity
      const currentUtilization = (currentOutput / theoreticalCapacity) * 100;
      const availableCapacity = Math.max(0, practicalCapacity - currentOutput);
      const bottleneckFactor = Math.min(1, bottleneckEfficiency);
      const expansionNeed = Math.max(0, targetOutput - practicalCapacity);

      return {
        theoreticalCapacity: Math.round(theoreticalCapacity * 100) / 100,
        practicalCapacity: Math.round(practicalCapacity * 100) / 100,
        currentUtilization: Math.round(currentUtilization * 100) / 100,
        availableCapacity: Math.round(availableCapacity * 100) / 100,
        bottleneckFactor: Math.round(bottleneckFactor * 100) / 100,
        expansionNeed: Math.round(expansionNeed * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating capacity analysis: ${error.message}`);
      return {
        theoreticalCapacity: 0, practicalCapacity: 0, currentUtilization: 0,
        availableCapacity: 0, bottleneckFactor: 0, expansionNeed: 0,
      };
    }
  }

  /**
   * Calculate energy consumption metrics
   */
  static calculateEnergyConsumption(
    totalConsumption: number,
    unitsProduced: number,
    peakDemand: number,
    operatingHours: number,
    costPerKWh: number,
    carbonFactorKgCO2PerKWh: number = 0.5
  ): EnergyConsumption {
    try {
      const consumptionPerUnit = unitsProduced > 0 ? totalConsumption / unitsProduced : 0;
      const averageDemand = operatingHours > 0 ? totalConsumption / operatingHours : 0;
      const efficiencyRating = peakDemand > 0 ? (averageDemand / peakDemand) * 100 : 0;
      const carbonFootprint = totalConsumption * carbonFactorKgCO2PerKWh;
      const totalEnergyCost = totalConsumption * costPerKWh;

      return {
        totalConsumption: Math.round(totalConsumption * 100) / 100,
        consumptionPerUnit: Math.round(consumptionPerUnit * 1000) / 1000, // 3 decimal places for precision
        peakDemand: Math.round(peakDemand * 100) / 100,
        averageDemand: Math.round(averageDemand * 100) / 100,
        efficiencyRating: Math.round(efficiencyRating * 100) / 100,
        carbonFootprint: Math.round(carbonFootprint * 100) / 100,
        costPerKWh: Math.round(costPerKWh * 1000) / 1000,
        totalEnergyCost: Math.round(totalEnergyCost * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating energy consumption: ${error.message}`);
      return {
        totalConsumption: 0, consumptionPerUnit: 0, peakDemand: 0, averageDemand: 0,
        efficiencyRating: 0, carbonFootprint: 0, costPerKWh: 0, totalEnergyCost: 0,
      };
    }
  }

  /**
   * Calculate quality metrics
   */
  static calculateQualityMetrics(
    totalProduced: number,
    goodPieces: number,
    defectivePieces: number,
    reworkPieces: number = 0
  ) {
    try {
      const yieldRate = totalProduced > 0 ? (goodPieces / totalProduced) * 100 : 0;
      const defectRate = totalProduced > 0 ? (defectivePieces / totalProduced) * 100 : 0;
      const reworkRate = totalProduced > 0 ? (reworkPieces / totalProduced) * 100 : 0;
      const firstPassYield = totalProduced > 0 ? ((goodPieces - reworkPieces) / totalProduced) * 100 : 0;
      
      return {
        yieldRate: Math.round(yieldRate * 100) / 100,
        defectRate: Math.round(defectRate * 100) / 100,
        reworkRate: Math.round(reworkRate * 100) / 100,
        firstPassYield: Math.max(0, Math.round(firstPassYield * 100) / 100),
        qualityScore: Math.max(0, Math.round((100 - defectRate - reworkRate) * 100) / 100),
      };
    } catch (error) {
      this.logger.error(`Error calculating quality metrics: ${error.message}`);
      return {
        yieldRate: 0, defectRate: 0, reworkRate: 0, firstPassYield: 0, qualityScore: 0,
      };
    }
  }

  /**
   * Calculate safety metrics
   */
  static calculateSafetyMetrics(
    totalHoursWorked: number,
    numberOfIncidents: number,
    numberOfNearMisses: number,
    totalEmployees: number,
    reportingPeriodDays: number = 30
  ) {
    try {
      const incidentRate = totalHoursWorked > 0 ? 
        (numberOfIncidents * 200000) / totalHoursWorked : 0; // OSHA formula
      const nearMissRate = totalHoursWorked > 0 ? 
        (numberOfNearMisses * 200000) / totalHoursWorked : 0;
      const safetyIndex = Math.max(0, 100 - (incidentRate * 10 + nearMissRate * 2));
      const averageDaysWithoutIncident = numberOfIncidents > 0 ? 
        reportingPeriodDays / numberOfIncidents : reportingPeriodDays;

      return {
        incidentRate: Math.round(incidentRate * 100) / 100,
        nearMissRate: Math.round(nearMissRate * 100) / 100,
        safetyIndex: Math.round(safetyIndex * 100) / 100,
        averageDaysWithoutIncident: Math.round(averageDaysWithoutIncident * 100) / 100,
        totalIncidents: numberOfIncidents,
        totalNearMisses: numberOfNearMisses,
      };
    } catch (error) {
      this.logger.error(`Error calculating safety metrics: ${error.message}`);
      return {
        incidentRate: 0, nearMissRate: 0, safetyIndex: 0, averageDaysWithoutIncident: 0,
        totalIncidents: 0, totalNearMisses: 0,
      };
    }
  }

  /**
   * Calculate maintenance metrics
   */
  static calculateMaintenanceMetrics(
    plannedMaintenanceTime: number,
    unplannedMaintenanceTime: number,
    totalOperatingTime: number,
    maintenanceCost: number,
    equipmentValue: number
  ) {
    try {
      const totalMaintenanceTime = plannedMaintenanceTime + unplannedMaintenanceTime;
      const mttr = totalMaintenanceTime; // Mean Time To Repair (simplified)
      const mtbf = totalOperatingTime / Math.max(1, unplannedMaintenanceTime / 24); // Mean Time Between Failures
      const availability = totalOperatingTime / (totalOperatingTime + totalMaintenanceTime) * 100;
      const maintenanceRatio = (maintenanceCost / equipmentValue) * 100;
      const plannedMaintenanceRatio = (plannedMaintenanceTime / totalMaintenanceTime) * 100;

      return {
        mttr: Math.round(mttr * 100) / 100,
        mtbf: Math.round(mtbf * 100) / 100,
        availability: Math.round(availability * 100) / 100,
        maintenanceRatio: Math.round(maintenanceRatio * 100) / 100,
        plannedMaintenanceRatio: Math.round(plannedMaintenanceRatio * 100) / 100,
        totalMaintenanceTime: Math.round(totalMaintenanceTime * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating maintenance metrics: ${error.message}`);
      return {
        mttr: 0, mtbf: 0, availability: 0, maintenanceRatio: 0,
        plannedMaintenanceRatio: 0, totalMaintenanceTime: 0,
      };
    }
  }

  /**
   * Calculate ROI for manufacturing investments
   */
  static calculateROI(
    initialInvestment: number,
    annualBenefits: number,
    annualCosts: number,
    years: number = 5
  ) {
    try {
      const netAnnualBenefit = annualBenefits - annualCosts;
      const totalBenefit = netAnnualBenefit * years;
      const roi = ((totalBenefit - initialInvestment) / initialInvestment) * 100;
      const paybackPeriod = netAnnualBenefit > 0 ? initialInvestment / netAnnualBenefit : 0;
      const npv = this.calculateNPV(initialInvestment, netAnnualBenefit, years, 0.1); // 10% discount rate

      return {
        roi: Math.round(roi * 100) / 100,
        paybackPeriod: Math.round(paybackPeriod * 100) / 100,
        npv: Math.round(npv * 100) / 100,
        totalBenefit: Math.round(totalBenefit * 100) / 100,
        netAnnualBenefit: Math.round(netAnnualBenefit * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error calculating ROI: ${error.message}`);
      return { roi: 0, paybackPeriod: 0, npv: 0, totalBenefit: 0, netAnnualBenefit: 0 };
    }
  }

  /**
   * Calculate Net Present Value (NPV)
   */
  private static calculateNPV(
    initialInvestment: number,
    annualCashFlow: number,
    years: number,
    discountRate: number
  ): number {
    try {
      let npv = -initialInvestment;
      for (let year = 1; year <= years; year++) {
        npv += annualCashFlow / Math.pow(1 + discountRate, year);
      }
      return npv;
    } catch (error) {
      this.logger.error(`Error calculating NPV: ${error.message}`);
      return 0;
    }
  }

  /**
   * Convert units between different measurement systems
   */
  static convertUnits(value: number, fromUnit: string, toUnit: string): number {
    try {
      const conversions: Record<string, Record<string, number>> = {
        // Length conversions
        meters: { feet: 3.28084, inches: 39.3701, centimeters: 100, millimeters: 1000 },
        feet: { meters: 0.3048, inches: 12, centimeters: 30.48, millimeters: 304.8 },
        inches: { meters: 0.0254, feet: 0.0833333, centimeters: 2.54, millimeters: 25.4 },
        
        // Weight conversions
        kilograms: { pounds: 2.20462, grams: 1000, tons: 0.001 },
        pounds: { kilograms: 0.453592, grams: 453.592, tons: 0.000453592 },
        grams: { kilograms: 0.001, pounds: 0.00220462, tons: 0.000001 },
        
        // Volume conversions
        liters: { gallons: 0.264172, milliliters: 1000, cubic_meters: 0.001 },
        gallons: { liters: 3.78541, milliliters: 3785.41, cubic_meters: 0.00378541 },
        
        // Temperature conversions (handled separately)
        // Energy conversions
        kwh: { mwh: 0.001, joules: 3600000, btu: 3412.14 },
        mwh: { kwh: 1000, joules: 3600000000, btu: 3412140 },
      };

      const fromConversions = conversions[fromUnit.toLowerCase()];
      if (!fromConversions || !fromConversions[toUnit.toLowerCase()]) {
        this.logger.warn(`Conversion not supported: ${fromUnit} to ${toUnit}`);
        return value;
      }

      return Math.round(value * fromConversions[toUnit.toLowerCase()] * 100000) / 100000;
    } catch (error) {
      this.logger.error(`Error converting units: ${error.message}`);
      return value;
    }
  }

  /**
   * Convert temperature between Celsius, Fahrenheit, and Kelvin
   */
  static convertTemperature(value: number, fromUnit: string, toUnit: string): number {
    try {
      const from = fromUnit.toLowerCase();
      const to = toUnit.toLowerCase();
      
      if (from === to) return value;

      // Convert to Celsius first
      let celsius: number;
      switch (from) {
        case 'fahrenheit':
        case 'f':
          celsius = (value - 32) * 5/9;
          break;
        case 'kelvin':
        case 'k':
          celsius = value - 273.15;
          break;
        case 'celsius':
        case 'c':
        default:
          celsius = value;
          break;
      }

      // Convert from Celsius to target unit
      switch (to) {
        case 'fahrenheit':
        case 'f':
          return Math.round((celsius * 9/5 + 32) * 100) / 100;
        case 'kelvin':
        case 'k':
          return Math.round((celsius + 273.15) * 100) / 100;
        case 'celsius':
        case 'c':
        default:
          return Math.round(celsius * 100) / 100;
      }
    } catch (error) {
      this.logger.error(`Error converting temperature: ${error.message}`);
      return value;
    }
  }
}
