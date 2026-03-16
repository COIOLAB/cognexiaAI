import { QualityPlan } from './quality-plan.entity';
import { QualityDefect } from './quality-defect.entity';
export declare enum InspectionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum InspectionType {
    INCOMING = "incoming",
    IN_PROCESS = "in_process",
    FINAL = "final",
    AUDIT = "audit",
    CALIBRATION = "calibration",
    COMPLIANCE = "compliance"
}
export declare enum InspectionResult {
    PASS = "pass",
    FAIL = "fail",
    CONDITIONAL_PASS = "conditional_pass",
    PENDING = "pending"
}
export declare class QualityInspection {
    id: string;
    inspectionNumber: string;
    type: InspectionType;
    status: InspectionStatus;
    result: InspectionResult;
    workCenterId: string;
    productionOrderId: string;
    batchNumber: string;
    productCode: string;
    inspectorId: string;
    inspectorName: string;
    scheduledDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    inspectionParameters: Record<string, any>;
    testResults: Record<string, any>;
    measurements: Array<{
        parameter: string;
        value: number;
        unit: string;
        specification: {
            min?: number;
            max?: number;
            target?: number;
        };
        passed: boolean;
    }>;
    qualityScore: number;
    notes: string;
    failureReason: string;
    corrective_actions: Array<{
        action: string;
        assignedTo: string;
        dueDate: Date;
        status: string;
    }>;
    attachments: Array<{
        filename: string;
        url: string;
        type: string;
    }>;
    requiresReInspection: boolean;
    reInspectionReason: string;
    compliance: {
        standards: string[];
        regulations: string[];
        certifications: string[];
    };
    industrySpecific: Record<string, any>;
    qualityPlan: QualityPlan;
    qualityPlanId: string;
    defects: QualityDefect[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
//# sourceMappingURL=quality-inspection.entity.d.ts.map