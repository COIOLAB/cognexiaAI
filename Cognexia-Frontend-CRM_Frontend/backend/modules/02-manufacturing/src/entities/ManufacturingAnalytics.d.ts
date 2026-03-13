import { WorkCenter } from './WorkCenter';
import { ProductionLine } from './ProductionLine';
import { ProductionOrder } from './ProductionOrder';
export declare enum AnalyticsType {
    REAL_TIME = "real_time",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare enum MetricCategory {
    PRODUCTION = "production",
    QUALITY = "quality",
    EFFICIENCY = "efficiency",
    UTILIZATION = "utilization",
    DOWNTIME = "downtime",
    COST = "cost",
    ENVIRONMENTAL = "environmental",
    SAFETY = "safety"
}
export declare class ManufacturingAnalytics {
    id: string;
    analyticsCode: string;
    name: string;
    description: string;
    analyticsType: AnalyticsType;
    metricCategory: MetricCategory;
    measurementDate: Date;
    periodStart: Date;
    periodEnd: Date;
    productionMetrics: {
        unitsProduced: number;
        targetUnits: number;
        productionRate: number;
        throughput: number;
        cycleTimes: number[];
        averageCycleTime: number;
        firstPassYield: number;
        totalYield: number;
    };
    qualityMetrics: {
        defectRate: number;
        defectCount: number;
        reworkRate: number;
        scrapRate: number;
        inspectionResults: object[];
        qualityScore: number;
        customerComplaints: number;
        returnRate: number;
    };
    efficiencyMetrics: {
        overallEquipmentEffectiveness: number;
        availability: number;
        performance: number;
        quality: number;
        laborEfficiency: number;
        materialEfficiency: number;
        energyEfficiency: number;
    };
    utilizationMetrics: {
        equipmentUtilization: number;
        laborUtilization: number;
        capacityUtilization: number;
        plannedUtilization: number;
        actualUtilization: number;
        utilizationVariance: number;
    };
    downtimeAnalysis: {
        totalDowntime: number;
        plannedDowntime: number;
        unplannedDowntime: number;
        maintenanceDowntime: number;
        setupDowntime: number;
        breakdownDowntime: number;
        downtimeReasons: object[];
        mtbf: number;
        mttr: number;
    };
    costAnalysis: {
        laborCost: number;
        materialCost: number;
        energyCost: number;
        maintenanceCost: number;
        qualityCost: number;
        totalCost: number;
        costPerUnit: number;
        targetCostPerUnit: number;
        costVariance: number;
    };
    environmentalMetrics: {
        energyConsumption: number;
        waterUsage: number;
        wasteGeneration: number;
        carbonFootprint: number;
        recyclingRate: number;
        sustainabilityScore: number;
        emissionReduction: number;
    };
    safetyMetrics: {
        incidentCount: number;
        nearMissCount: number;
        lostTimeInjuries: number;
        safetyScore: number;
        complianceRate: number;
        trainingHours: number;
        auditResults: object[];
    };
    performanceTrends: {
        productionTrend: string;
        qualityTrend: string;
        efficiencyTrend: string;
        costTrend: string;
        trendAnalysis: object[];
        forecastData: object[];
        seasonalPatterns: object[];
    };
    comparativeAnalysis: {
        vsTarget: object;
        vsPreviousPeriod: object;
        vsIndustryBenchmark: object;
        vsBestPractice: object;
        improvementOpportunities: string[];
    };
    aiInsights: {
        anomalies: object[];
        patterns: object[];
        predictions: object[];
        recommendations: string[];
        confidenceLevel: number;
        modelAccuracy: number;
    };
    kpiData: {
        primaryKPIs: object[];
        secondaryKPIs: object[];
        alertThresholds: object[];
        currentStatus: object[];
        targetValues: object[];
    };
    statisticalAnalysis: {
        mean: number;
        median: number;
        standardDeviation: number;
        variance: number;
        correlations: object[];
        distributions: object[];
        outliers: object[];
    };
    benchmarkingData: {
        industryAverage: object;
        topQuartile: object;
        worldClass: object;
        competitorData: object[];
        gapAnalysis: object[];
        improvementTargets: object[];
    };
    isRealTime: boolean;
    realTimeData: {
        lastUpdate: Date;
        updateFrequency: number;
        dataPoints: object[];
        alerts: object[];
        notifications: object[];
    };
    dataQuality: {
        completeness: number;
        accuracy: number;
        timeliness: number;
        consistency: number;
        validationRules: object[];
        dataSource: string;
    };
    workCenterId: string;
    workCenter: WorkCenter;
    productionLineId: string;
    productionLine: ProductionLine;
    productionOrderId: string;
    productionOrder: ProductionOrder;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateOEE(): number;
    getProductionVariance(): number;
    getCostVariance(): number;
    getOverallPerformanceScore(): number;
    identifyTopIssues(): string[];
    generateActionItems(): string[];
    validateData(): string[];
    generateSummaryReport(): object;
    compareWithBenchmark(benchmarkType: string): object;
    private calculatePercentile;
    private generateBenchmarkRecommendations;
    updateRealTimeData(newData: object): void;
    archiveData(): void;
}
//# sourceMappingURL=ManufacturingAnalytics.d.ts.map