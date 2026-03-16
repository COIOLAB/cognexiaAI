import { WorkOrder } from './WorkOrder';
import { WorkCenter } from './WorkCenter';
import { RoutingOperation } from './RoutingOperation';
export declare enum QualityCheckStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    PASSED = "passed",
    FAILED = "failed",
    CONDITIONAL_PASS = "conditional_pass",
    REWORK_REQUIRED = "rework_required",
    CANCELLED = "cancelled"
}
export declare enum QualityCheckType {
    INCOMING_INSPECTION = "incoming_inspection",
    IN_PROCESS_INSPECTION = "in_process_inspection",
    FINAL_INSPECTION = "final_inspection",
    DIMENSIONAL_CHECK = "dimensional_check",
    VISUAL_INSPECTION = "visual_inspection",
    FUNCTIONAL_TEST = "functional_test",
    MATERIAL_TEST = "material_test",
    STATISTICAL_SAMPLING = "statistical_sampling"
}
export declare enum InspectionMethod {
    MANUAL = "manual",
    AUTOMATED = "automated",
    SEMI_AUTOMATED = "semi_automated",
    AI_VISION = "ai_vision",
    SENSOR_BASED = "sensor_based",
    STATISTICAL = "statistical"
}
export declare class QualityCheck {
    id: string;
    checkNumber: string;
    checkName: string;
    description: string;
    checkType: QualityCheckType;
    status: QualityCheckStatus;
    inspectionMethod: InspectionMethod;
    scheduledDate: Date;
    startedAt: Date;
    completedAt: Date;
    inspectionTime: number;
    inspectorId: string;
    inspectorName: string;
    inspectorCertification: string;
    sampleSize: number;
    lotSize: number;
    samplingPercentage: number;
    samplingPlan: {
        plan: string;
        aql: number;
        inspectionLevel: string;
        sampleCode: string;
        acceptanceNumber: number;
        rejectionNumber: number;
    };
    inspectionCriteria: {
        specifications: object[];
        tolerances: object[];
        acceptanceCriteria: string[];
        rejectionCriteria: string[];
        measurementPoints: string[];
    };
    measurementResults: {
        measurements: object[];
        dimensions: object[];
        characteristics: object[];
        defects: object[];
        observations: string[];
    };
    testResults: {
        functionalTests: object[];
        materialTests: object[];
        performanceTests: object[];
        environmentalTests: object[];
        safetyTests: object[];
    };
    statisticalData: {
        mean: number;
        standardDeviation: number;
        cpk: number;
        cp: number;
        controlChartData: object[];
        trends: object[];
    };
    aiAnalysis: {
        confidenceScore: number;
        anomalyDetection: object[];
        patternRecognition: object[];
        predictiveQuality: object;
        recommendations: string[];
    };
    overallScore: number;
    defectCount: number;
    defectRate: number;
    isConforming: boolean;
    defectClassification: {
        critical: number;
        major: number;
        minor: number;
        cosmetic: number;
        defectTypes: string[];
        rootCauses: string[];
    };
    correctiveActions: {
        required: boolean;
        actions: string[];
        responsible: string[];
        dueDate: Date;
        status: string;
        effectiveness: string;
    };
    documentation: {
        inspectionReport: string;
        photos: string[];
        videos: string[];
        certificates: string[];
        attachments: string[];
    };
    equipmentUsed: {
        measurementDevices: string[];
        testEquipment: string[];
        software: string[];
        calibrationStatus: object[];
        accuracy: object[];
    };
    environmentalConditions: {
        temperature: number;
        humidity: number;
        pressure: number;
        lighting: number;
        vibration: number;
    };
    inspectionCost: number;
    nonConformanceCost: number;
    reworkCost: number;
    complianceStandards: {
        standards: string[];
        certifications: string[];
        regulations: string[];
        auditTrail: object[];
    };
    isDigitallyIntegrated: boolean;
    digitalData: {
        barcodes: string[];
        qrCodes: string[];
        rfidTags: string[];
        digitalSignatures: string[];
        blockchain: object;
    };
    workOrderId: string;
    workOrder: WorkOrder;
    workCenterId: string;
    workCenter: WorkCenter;
    routingOperationId: string;
    routingOperation: RoutingOperation;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateInspectionDuration(): number;
    isOverdue(): boolean;
    calculatePassRate(): number;
    getQualityLevel(): string;
    requiresRework(): boolean;
    generateReport(): object;
    validateResults(): string[];
    updateStatus(newStatus: QualityCheckStatus, inspectorId?: string): void;
    calculateCpk(): number;
    isCapable(): boolean;
}
//# sourceMappingURL=QualityCheck.d.ts.map