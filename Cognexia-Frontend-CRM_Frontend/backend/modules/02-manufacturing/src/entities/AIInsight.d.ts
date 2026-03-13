import { WorkCenter } from './WorkCenter';
import { ProductionLine } from './ProductionLine';
export declare enum InsightType {
    PREDICTION = "prediction",
    OPTIMIZATION = "optimization",
    ANOMALY_DETECTION = "anomaly_detection",
    PATTERN_RECOGNITION = "pattern_recognition",
    RECOMMENDATION = "recommendation",
    FORECAST = "forecast",
    CLASSIFICATION = "classification",
    CLUSTERING = "clustering"
}
export declare enum InsightPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    URGENT = "urgent"
}
export declare enum InsightStatus {
    GENERATED = "generated",
    REVIEWED = "reviewed",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    IMPLEMENTED = "implemented",
    ARCHIVED = "archived"
}
export declare class AIInsight {
    id: string;
    insightCode: string;
    title: string;
    description: string;
    insightType: InsightType;
    priority: InsightPriority;
    status: InsightStatus;
    generatedAt: Date;
    confidenceScore: number;
    aiModel: string;
    modelVersion: string;
    modelDetails: {
        algorithm: string;
        parameters: object;
        trainingData: string;
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
    dataSources: {
        sensors: string[];
        systems: string[];
        databases: string[];
        apis: string[];
        files: string[];
    };
    inputData: {
        features: object[];
        values: object[];
        timeRange: object;
        sampleSize: number;
        dataQuality: number;
    };
    insightContent: {
        findings: string[];
        patterns: object[];
        anomalies: object[];
        trends: object[];
        correlations: object[];
        predictions: object[];
    };
    recommendations: {
        actions: string[];
        priorities: object[];
        timeline: object[];
        resources: object[];
        expectedImpact: object;
        riskLevel: string;
    };
    predictions: {
        targetVariable: string;
        predictedValue: number;
        confidenceInterval: object;
        forecastHorizon: number;
        uncertainty: number;
        factors: object[];
    };
    impactAssessment: {
        potential: object;
        financial: object;
        operational: object;
        quality: object;
        efficiency: object;
        sustainability: object;
    };
    validation: {
        testResults: object[];
        crossValidation: object;
        realWorldValidation: object;
        feedbackLoop: boolean;
        accuracyMetrics: object;
    };
    implementation: {
        status: string;
        startDate: Date;
        completionDate: Date;
        assignedTo: string[];
        progress: number;
        challenges: string[];
        results: object;
    };
    feedback: {
        userRating: number;
        effectiveness: number;
        usability: number;
        comments: string[];
        improvements: string[];
        lessonsLearned: string[];
    };
    context: {
        businessContext: string;
        operationalContext: string;
        technicalContext: string;
        constraints: object[];
        assumptions: string[];
    };
    relatedInsights: {
        dependencies: string[];
        conflicting: string[];
        supporting: string[];
        sequence: number;
    };
    visualizationData: {
        charts: object[];
        graphs: object[];
        dashboards: string[];
        reports: string[];
        images: string[];
    };
    alerts: {
        threshold: object;
        triggers: object[];
        recipients: string[];
        methods: string[];
        frequency: string;
    };
    performance: {
        processingTime: number;
        dataProcessed: number;
        resourceUsage: object;
        efficiency: number;
        scalability: object;
    };
    compliance: {
        ethicalConsiderations: string[];
        biasAssessment: object;
        fairness: object;
        transparency: number;
        explainability: number;
        auditTrail: object[];
    };
    integration: {
        systems: string[];
        apis: string[];
        webhooks: string[];
        eventTriggers: object[];
        automationRules: object[];
    };
    expiresAt: Date;
    lastRefreshed: Date;
    refreshFrequencyHours: number;
    autoRefresh: boolean;
    workCenterId: string;
    workCenter: WorkCenter;
    productionLineId: string;
    productionLine: ProductionLine;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    reviewedBy: string;
    reviewedAt: Date;
    isExpired(): boolean;
    needsRefresh(): boolean;
    calculateAge(): number;
    isHighPriority(): boolean;
    getRelevanceScore(): number;
    updateStatus(newStatus: InsightStatus, userId?: string): void;
    addFeedback(rating: number, comments: string, userId?: string): void;
    generateActionPlan(): object;
    private extractSuccessMetrics;
    validateInsight(): string[];
    generateSummary(): object;
    archive(): void;
    refresh(): void;
    clone(): Partial<AIInsight>;
}
//# sourceMappingURL=AIInsight.d.ts.map