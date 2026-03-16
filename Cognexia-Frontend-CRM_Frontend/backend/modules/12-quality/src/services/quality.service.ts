import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan, Like } from 'typeorm';
import { QualityInspection, InspectionStatus } from '../entities/quality-inspection.entity';
import { QualityPlan, QualityPlanStatus } from '../entities/quality-plan.entity';
import { QualityDefect, DefectStatus } from '../entities/quality-defect.entity';
import { QualityAlert, AlertStatus, AlertSeverity } from '../entities/quality-alert.entity';
import { QualityMetrics, MetricType, TrendDirection } from '../entities/quality-metrics.entity';
import { Calibration, CalibrationStatus } from '../entities/calibration.entity';
import { ComplianceRecord, ComplianceStatus } from '../entities/compliance-record.entity';

export interface QualityDashboardData {
  summary: {
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    pendingInspections: number;
    defectRate: number;
    firstPassYield: number;
    overallQualityScore: number;
    activeAlerts: number;
  };
  metrics: {
    defectTrend: Array<{ date: string; count: number }>;
    qualityTrend: Array<{ date: string; score: number }>;
    processCapability: { cp: number; cpk: number; sigma: number };
    topDefects: Array<{ type: string; count: number; percentage: number }>;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    createdAt: Date;
  }>;
  compliance: {
    overallScore: number;
    expiringSoon: number;
    nonCompliant: number;
    certifications: Array<{ name: string; status: string; expiryDate: Date }>;
  };
}

export interface QualityPrediction {
  defectProbability: number;
  qualityScore: number;
  riskFactors: Array<{
    factor: string;
    impact: number;
    confidence: number;
  }>;
  recommendations: string[];
  confidence: number;
}

export interface ProcessCapabilityAnalysis {
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  cpm: number;
  sigmaLevel: number;
  defectsPerMillion: number;
  processStability: boolean;
  recommendations: string[];
}

export interface SPCAnalysis {
  controlLimits: {
    ucl: number;
    lcl: number;
    centerline: number;
  };
  violations: Array<{
    rule: string;
    points: number[];
    description: string;
  }>;
  processInControl: boolean;
  trendAnalysis: {
    direction: TrendDirection;
    slope: number;
    correlation: number;
  };
  recommendations: string[];
}

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);

  constructor(
    @InjectRepository(QualityInspection)
    private qualityInspectionRepository: Repository<QualityInspection>,
    @InjectRepository(QualityPlan)
    private qualityPlanRepository: Repository<QualityPlan>,
    @InjectRepository(QualityDefect)
    private qualityDefectRepository: Repository<QualityDefect>,
    @InjectRepository(QualityAlert)
    private qualityAlertRepository: Repository<QualityAlert>,
    @InjectRepository(QualityMetrics)
    private qualityMetricsRepository: Repository<QualityMetrics>,
    @InjectRepository(Calibration)
    private calibrationRepository: Repository<Calibration>,
    @InjectRepository(ComplianceRecord)
    private complianceRecordRepository: Repository<ComplianceRecord>,
  ) {}

  // Dashboard and Analytics
  async getDashboardData(
    workCenterId?: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<QualityDashboardData> {
    try {
      const whereConditions: any = {};
      if (workCenterId) whereConditions.workCenterId = workCenterId;
      if (dateRange) {
        whereConditions.createdAt = Between(dateRange.start, dateRange.end);
      }

      // Get inspection summary
      const totalInspections = await this.qualityInspectionRepository.count({
        where: whereConditions,
      });

      const passedInspections = await this.qualityInspectionRepository.count({
        where: { ...whereConditions, result: 'pass' },
      });

      const failedInspections = await this.qualityInspectionRepository.count({
        where: { ...whereConditions, result: 'fail' },
      });

      const pendingInspections = await this.qualityInspectionRepository.count({
        where: { ...whereConditions, status: 'pending' },
      });

      // Calculate metrics
      const defectRate = totalInspections > 0 ? (failedInspections / totalInspections) * 100 : 0;
      const firstPassYield = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0;

      // Get active alerts
      const activeAlerts = await this.qualityAlertRepository.count({
        where: { status: AlertStatus.ACTIVE, ...whereConditions },
      });

      // Get quality metrics for trends
      const qualityMetrics = await this.qualityMetricsRepository.find({
        where: {
          metricType: MetricType.DEFECT_RATE,
          ...whereConditions,
        },
        order: { measurementDate: 'ASC' },
        take: 30,
      });

      // Get top defects
      const defects = await this.qualityDefectRepository
        .createQueryBuilder('defect')
        .select('defect.defectType', 'type')
        .addSelect('COUNT(*)', 'count')
        .where(whereConditions)
        .groupBy('defect.defectType')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

      const totalDefects = defects.reduce((sum, d) => sum + parseInt(d.count), 0);
      const topDefects = defects.map(d => ({
        type: d.type,
        count: parseInt(d.count),
        percentage: totalDefects > 0 ? (parseInt(d.count) / totalDefects) * 100 : 0,
      }));

      // Get recent alerts
      const recentAlerts = await this.qualityAlertRepository.find({
        where: { status: AlertStatus.ACTIVE },
        order: { createdAt: 'DESC' },
        take: 10,
        select: ['id', 'type', 'severity', 'title', 'createdAt'],
      });

      // Get compliance data
      const complianceRecords = await this.complianceRecordRepository.find({
        where: { isActive: true },
      });

      const overallComplianceScore = complianceRecords.length > 0
        ? complianceRecords.reduce((sum, r) => sum + r.complianceScore, 0) / complianceRecords.length
        : 100;

      const expiringSoon = complianceRecords.filter(r =>
        r.expiryDate && r.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length;

      const nonCompliant = complianceRecords.filter(r =>
        r.status === ComplianceStatus.NON_COMPLIANT
      ).length;

      return {
        summary: {
          totalInspections,
          passedInspections,
          failedInspections,
          pendingInspections,
          defectRate,
          firstPassYield,
          overallQualityScore: firstPassYield,
          activeAlerts,
        },
        metrics: {
          defectTrend: qualityMetrics.map(m => ({
            date: m.measurementDate.toISOString().split('T')[0],
            count: Number(m.value),
          })),
          qualityTrend: qualityMetrics.map(m => ({
            date: m.measurementDate.toISOString().split('T')[0],
            score: 100 - Number(m.value),
          })),
          processCapability: {
            cp: 1.33,
            cpk: 1.25,
            sigma: 4.2,
          },
          topDefects,
        },
        alerts: recentAlerts.map(a => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          message: a.title,
          createdAt: a.createdAt,
        })),
        compliance: {
          overallScore: Math.round(overallComplianceScore),
          expiringSoon,
          nonCompliant,
          certifications: complianceRecords
            .filter(r => r.certificateNumber)
            .slice(0, 5)
            .map(r => ({
              name: r.standardName,
              status: r.status,
              expiryDate: r.expiryDate,
            })),
        },
      };
    } catch (error) {
      this.logger.error('Error getting dashboard data:', error);
      throw new BadRequestException('Failed to get dashboard data');
    }
  }

  // AI-Powered Quality Prediction
  async predictQuality(
    productCode: string,
    processParameters: Record<string, number>,
    environmentalConditions?: Record<string, number>,
  ): Promise<QualityPrediction> {
    try {
      // Get historical data for this product
      const historicalInspections = await this.qualityInspectionRepository.find({
        where: { productCode },
        order: { createdAt: 'DESC' },
        take: 100,
      });

      const historicalDefects = await this.qualityDefectRepository.find({
        where: { productCode },
        order: { detectedAt: 'DESC' },
        take: 50,
      });

      // Simple ML prediction algorithm (in production, use TensorFlow.js or external ML service)
      const defectRate = historicalInspections.length > 0
        ? historicalDefects.length / historicalInspections.length
        : 0.1;

      // Analyze process parameters against historical data
      const riskFactors = [];
      let riskScore = 0;

      // Temperature risk analysis
      if (processParameters.temperature) {
        const tempRisk = this.analyzeParameterRisk(
          'temperature',
          processParameters?.temperature,
          historicalInspections
            .map(i => i.processParameters?.temperature)
            .filter((t): t is number => t !== undefined && t !== null)
        );
        riskFactors.push(tempRisk);
        riskScore += tempRisk.impact * tempRisk.confidence;
      }

      // Pressure risk analysis
      if (processParameters.pressure) {
        const pressureRisk = this.analyzeParameterRisk(
          'pressure',
          processParameters?.pressure,
          historicalInspections
            .map(i => i.processParameters?.pressure)
            .filter((p): p is number => p !== undefined && p !== null)
        );
        riskFactors.push(pressureRisk);
        riskScore += pressureRisk.impact * pressureRisk.confidence;
      }

      // Calculate defect probability
      const baseProbability = defectRate;
      const adjustedProbability = Math.min(1.0, baseProbability * (1 + riskScore));

      // Generate recommendations
      const recommendations = this.generateQualityRecommendations(
        riskFactors,
        adjustedProbability,
        processParameters,
      );

      return {
        defectProbability: adjustedProbability,
        qualityScore: (1 - adjustedProbability) * 100,
        riskFactors,
        recommendations,
        confidence: 0.85, // This would be calculated based on data quality and model accuracy
      };
    } catch (error) {
      this.logger.error('Error predicting quality:', error);
      throw new BadRequestException('Failed to predict quality');
    }
  }

  // Statistical Process Control (SPC) Analysis
  async performSPCAnalysis(
    metricType: MetricType,
    workCenterId?: string,
    productCode?: string,
    days: number = 30,
  ): Promise<SPCAnalysis> {
    try {
      const whereConditions: any = { metricType };
      if (workCenterId) whereConditions.workCenterId = workCenterId;
      if (productCode) whereConditions.productCode = productCode;

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      whereConditions.measurementDate = MoreThan(startDate);

      const metrics = await this.qualityMetricsRepository.find({
        where: whereConditions,
        order: { measurementDate: 'ASC' },
      });

      if (metrics.length < 10) {
        throw new BadRequestException('Insufficient data for SPC analysis (minimum 10 points required)');
      }

      // Calculate control limits
      const values = metrics.map(m => Number(m.value));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const standardDeviation = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
      );

      const ucl = mean + 3 * standardDeviation;
      const lcl = mean - 3 * standardDeviation;

      // Check for control chart violations
      const violations = this.checkControlChartRules(values, mean, standardDeviation);

      // Trend analysis
      const trendAnalysis = this.analyzeTrend(values);

      // Determine if process is in control
      const processInControl = violations.length === 0;

      // Generate recommendations
      const recommendations = this.generateSPCRecommendations(
        violations,
        trendAnalysis,
        processInControl,
      );

      return {
        controlLimits: {
          ucl,
          lcl,
          centerline: mean,
        },
        violations,
        processInControl,
        trendAnalysis,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Error performing SPC analysis:', error);
      throw new BadRequestException('Failed to perform SPC analysis');
    }
  }

  // Process Capability Analysis
  async calculateProcessCapability(
    metricType: MetricType,
    upperSpecLimit: number,
    lowerSpecLimit: number,
    workCenterId?: string,
    productCode?: string,
  ): Promise<ProcessCapabilityAnalysis> {
    try {
      const whereConditions: any = { metricType };
      if (workCenterId) whereConditions.workCenterId = workCenterId;
      if (productCode) whereConditions.productCode = productCode;

      const metrics = await this.qualityMetricsRepository.find({
        where: whereConditions,
        order: { measurementDate: 'DESC' },
        take: 100,
      });

      if (metrics.length < 30) {
        throw new BadRequestException('Insufficient data for capability analysis (minimum 30 points required)');
      }

      const values = metrics.map(m => Number(m.value));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const standardDeviation = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
      );

      // Calculate capability indices
      const tolerance = upperSpecLimit - lowerSpecLimit;
      const cp = tolerance / (6 * standardDeviation);
      
      const cpu = (upperSpecLimit - mean) / (3 * standardDeviation);
      const cpl = (mean - lowerSpecLimit) / (3 * standardDeviation);
      const cpk = Math.min(cpu, cpl);

      // Long-term capability (assuming 1.5 sigma shift)
      const longTermSigma = standardDeviation * 1.5;
      const pp = tolerance / (6 * longTermSigma);
      const ppu = (upperSpecLimit - mean) / (3 * longTermSigma);
      const ppl = (mean - lowerSpecLimit) / (3 * longTermSigma);
      const ppk = Math.min(ppu, ppl);

      // Calculate Cpm (capability index with respect to target)
      const target = (upperSpecLimit + lowerSpecLimit) / 2;
      const variance = Math.pow(standardDeviation, 2);
      const targetVariance = Math.pow(mean - target, 2);
      const cpm = tolerance / (6 * Math.sqrt(variance + targetVariance));

      // Calculate sigma level and DPMO
      const sigmaLevel = cpk * 3 + 1.5; // Approximate sigma level
      const defectsPerMillion = this.calculateDPMO(values, upperSpecLimit, lowerSpecLimit);

      // Check process stability
      const processStability = this.checkProcessStability(values);

      // Generate recommendations
      const recommendations = this.generateCapabilityRecommendations(
        { cp, cpk, pp, ppk, cpm },
        sigmaLevel,
        processStability,
      );

      return {
        cp,
        cpk,
        pp,
        ppk,
        cpm,
        sigmaLevel,
        defectsPerMillion,
        processStability,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Error calculating process capability:', error);
      throw new BadRequestException('Failed to calculate process capability');
    }
  }

  // Quality Alert Management
  async createQualityAlert(alertData: Partial<QualityAlert>): Promise<QualityAlert> {
    try {
      const alertNumber = await this.generateAlertNumber();
      
      const alert = this.qualityAlertRepository.create({
        ...alertData,
        alertNumber,
        status: AlertStatus.ACTIVE,
      });

      const savedAlert = await this.qualityAlertRepository.save(alert);

      // Send notifications (implement based on your notification system)
      await this.sendAlertNotifications(savedAlert);

      return savedAlert;
    } catch (error) {
      this.logger.error('Error creating quality alert:', error);
      throw new BadRequestException('Failed to create quality alert');
    }
  }

  // Calibration Management
  async scheduleCalibration(calibrationData: Partial<Calibration>): Promise<Calibration> {
    try {
      const calibrationNumber = await this.generateCalibrationNumber();
      
      const calibration = this.calibrationRepository.create({
        ...calibrationData,
        calibrationNumber,
        status: CalibrationStatus.SCHEDULED,
      });

      return await this.calibrationRepository.save(calibration);
    } catch (error) {
      this.logger.error('Error scheduling calibration:', error);
      throw new BadRequestException('Failed to schedule calibration');
    }
  }

  async getOverdueCalibrations(): Promise<Calibration[]> {
    const today = new Date();
    return await this.calibrationRepository.find({
      where: {
        dueDate: LessThan(today),
        status: CalibrationStatus.SCHEDULED,
        isActive: true,
      },
      order: { dueDate: 'ASC' },
    });
  }

  // Helper Methods
  private analyzeParameterRisk(
    parameter: string,
    currentValue: number,
    historicalValues: number[],
  ): { factor: string; impact: number; confidence: number } {
    if (historicalValues.length === 0) {
      return { factor: parameter, impact: 0.1, confidence: 0.3 };
    }

    const mean = historicalValues.reduce((sum, v) => sum + v, 0) / historicalValues.length;
    const stdDev = Math.sqrt(
      historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length
    );

    const zScore = Math.abs((currentValue - mean) / stdDev);
    const impact = Math.min(1.0, zScore / 3); // Normalize to 0-1 scale
    const confidence = Math.min(1.0, historicalValues.length / 50); // Higher confidence with more data

    return {
      factor: parameter,
      impact,
      confidence,
    };
  }

  private generateQualityRecommendations(
    riskFactors: Array<{ factor: string; impact: number; confidence: number }>,
    defectProbability: number,
    processParameters: Record<string, number>,
  ): string[] {
    const recommendations = [];

    if (defectProbability > 0.3) {
      recommendations.push('High defect probability detected - consider process adjustment');
    }

    riskFactors.forEach(factor => {
      if (factor.impact > 0.5) {
        recommendations.push(`Monitor ${factor.factor} closely - significant risk factor detected`);
      }
    });

    if (processParameters.temperature && processParameters.temperature > 100) {
      recommendations.push('Temperature exceeds optimal range - consider cooling');
    }

    if (recommendations.length === 0) {
      recommendations.push('Process parameters within acceptable limits - continue monitoring');
    }

    return recommendations;
  }

  private checkControlChartRules(
    values: number[],
    mean: number,
    standardDeviation: number,
  ): Array<{ rule: string; points: number[]; description: string }> {
    const violations = [];
    const ucl = mean + 3 * standardDeviation;
    const lcl = mean - 3 * standardDeviation;

    // Rule 1: Any point beyond 3 sigma
    for (let i = 0; i < values.length; i++) {
      if (values[i] > ucl || values[i] < lcl) {
        violations.push({
          rule: 'Rule 1',
          points: [i],
          description: 'Point beyond 3 sigma control limits',
        });
      }
    }

    // Rule 2: 9 consecutive points on same side of centerline
    let consecutiveCount = 0;
    let lastSide = null;
    const consecutivePoints = [];

    for (let i = 0; i < values.length; i++) {
      const currentSide = values[i] > mean ? 'above' : 'below';
      
      if (currentSide === lastSide) {
        consecutiveCount++;
        consecutivePoints.push(i);
      } else {
        if (consecutiveCount >= 9) {
          violations.push({
            rule: 'Rule 2',
            points: [...consecutivePoints],
            description: '9 consecutive points on same side of centerline',
          });
        }
        consecutiveCount = 1;
        consecutivePoints.length = 0;
        consecutivePoints.push(i);
      }
      lastSide = currentSide;
    }

    return violations;
  }

  private analyzeTrend(values: number[]): {
    direction: TrendDirection;
    slope: number;
    correlation: number;
  } {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = y.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    let direction: TrendDirection;
    if (Math.abs(slope) < 0.01) {
      direction = TrendDirection.STABLE;
    } else if (slope > 0) {
      direction = TrendDirection.IMPROVING;
    } else {
      direction = TrendDirection.DECLINING;
    }

    return { direction, slope, correlation };
  }

  private generateSPCRecommendations(
    violations: Array<{ rule: string; points: number[]; description: string }>,
    trendAnalysis: { direction: TrendDirection; slope: number; correlation: number },
    processInControl: boolean,
  ): string[] {
    const recommendations = [];

    if (!processInControl) {
      recommendations.push('Process is out of control - investigate special causes');
    }

    violations.forEach(violation => {
      recommendations.push(`Address ${violation.rule}: ${violation.description}`);
    });

    if (trendAnalysis.direction === TrendDirection.DECLINING) {
      recommendations.push('Declining trend detected - investigate process drift');
    }

    if (Math.abs(trendAnalysis.correlation) > 0.7) {
      recommendations.push('Strong trend detected - consider process adjustment');
    }

    if (recommendations.length === 0) {
      recommendations.push('Process is in statistical control - continue monitoring');
    }

    return recommendations;
  }

  private calculateDPMO(
    values: number[],
    upperSpecLimit: number,
    lowerSpecLimit: number,
  ): number {
    const defects = values.filter(v => v > upperSpecLimit || v < lowerSpecLimit).length;
    return (defects / values.length) * 1000000;
  }

  private checkProcessStability(values: number[]): boolean {
    // Simple stability check - more sophisticated methods can be implemented
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    // Check if variance is consistent across the dataset
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstVariance = this.calculateVariance(firstHalf);
    const secondVariance = this.calculateVariance(secondHalf);
    
    // Process is stable if variance difference is less than 20%
    return Math.abs(firstVariance - secondVariance) / Math.max(firstVariance, secondVariance) < 0.2;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private generateCapabilityRecommendations(
    indices: { cp: number; cpk: number; pp: number; ppk: number; cpm: number },
    sigmaLevel: number,
    processStability: boolean,
  ): string[] {
    const recommendations = [];

    if (!processStability) {
      recommendations.push('Improve process stability before focusing on capability');
    }

    if (indices.cp < 1.0) {
      recommendations.push('Process capability is inadequate - reduce process variation');
    } else if (indices.cp < 1.33) {
      recommendations.push('Process capability is marginal - consider process improvement');
    }

    if (indices.cpk < indices.cp * 0.75) {
      recommendations.push('Process is not centered - adjust process mean');
    }

    if (sigmaLevel < 3.0) {
      recommendations.push('Process sigma level is below 3 - implement Six Sigma methodology');
    } else if (sigmaLevel < 4.0) {
      recommendations.push('Good process performance - continue monitoring and gradual improvement');
    }

    return recommendations;
  }

  private async generateAlertNumber(): Promise<string> {
    const today = new Date();
    const prefix = `AL${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastAlert = await this.qualityAlertRepository.findOne({
      where: { alertNumber: Like(`${prefix}%`) },
      order: { alertNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastAlert) {
      const lastSequence = parseInt(lastAlert.alertNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private async generateCalibrationNumber(): Promise<string> {
    const today = new Date();
    const prefix = `CAL${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastCalibration = await this.calibrationRepository.findOne({
      where: { calibrationNumber: Like(`${prefix}%`) },
      order: { calibrationNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastCalibration) {
      const lastSequence = parseInt(lastCalibration.calibrationNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private async sendAlertNotifications(alert: QualityAlert): Promise<void> {
    // Implement notification logic based on your system
    this.logger.log(`Alert ${alert.alertNumber} created with severity ${alert.severity}`);
    
    // Example: Send email, SMS, or push notifications
    // This would integrate with your notification service
  }
}
