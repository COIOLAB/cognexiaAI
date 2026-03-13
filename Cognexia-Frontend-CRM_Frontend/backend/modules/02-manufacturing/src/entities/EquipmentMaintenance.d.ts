import { WorkCenter } from './WorkCenter';
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    EMERGENCY = "emergency",
    OVERHAUL = "overhaul",
    CALIBRATION = "calibration",
    INSPECTION = "inspection"
}
export declare enum MaintenanceStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue",
    PENDING_APPROVAL = "pending_approval"
}
export declare enum MaintenancePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export declare class EquipmentMaintenance {
    id: string;
    maintenanceNumber: string;
    title: string;
    description: string;
    maintenanceType: MaintenanceType;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    scheduledDate: Date;
    startedAt: Date;
    completedAt: Date;
    estimatedDuration: number;
    actualDuration: number;
    assignedTechnician: string;
    supervisor: string;
    maintenanceTeam: {
        technicians: string[];
        specialists: string[];
        contractors: string[];
        requiredSkills: string[];
    };
    laborCost: number;
    materialCost: number;
    contractorCost: number;
    totalCost: number;
    partsRequired: {
        parts: object[];
        consumables: object[];
        lubricants: string[];
        tools: string[];
        specialEquipment: string[];
    };
    partsUsed: {
        parts: object[];
        quantities: object[];
        costs: object[];
        suppliers: object[];
    };
    workPerformed: {
        tasks: string[];
        procedures: string[];
        replacedParts: string[];
        adjustments: string[];
        tests: string[];
        observations: string[];
    };
    qualityChecks: {
        preMaintenanceCheck: object;
        postMaintenanceCheck: object;
        functionalTests: object[];
        performanceTests: object[];
        safetyTests: object[];
    };
    conditionAssessment: {
        beforeMaintenance: object;
        afterMaintenance: object;
        wear: object;
        damage: object;
        improvements: string[];
    };
    documentation: {
        workOrders: string[];
        procedures: string[];
        manuals: string[];
        photos: string[];
        videos: string[];
        reports: string[];
    };
    safetyInformation: {
        hazards: string[];
        precautions: string[];
        ppe: string[];
        lockoutTagout: boolean;
        permits: string[];
        incidents: object[];
    };
    isPredictiveMaintenance: boolean;
    predictiveData: {
        triggerCondition: string;
        sensorData: object[];
        aiPrediction: object;
        remainingLife: number;
        recommendedAction: string;
    };
    environmentalImpact: {
        waste: object[];
        emissions: object;
        energyConsumption: number;
        waterUsage: number;
        recycling: object[];
    };
    compliance: {
        standards: string[];
        regulations: string[];
        certifications: string[];
        auditRequired: boolean;
        complianceStatus: string;
    };
    followUpActions: {
        required: boolean;
        actions: string[];
        dueDate: Date;
        responsible: string;
        status: string;
    };
    nextMaintenanceDate: Date;
    maintenanceInterval: number;
    nextMaintenanceDetails: {
        type: string;
        estimatedDuration: number;
        partsRequired: string[];
        specialRequirements: string[];
    };
    isDigitallyIntegrated: boolean;
    digitalData: {
        workOrderSystem: string;
        cmmsIntegration: boolean;
        iotData: object[];
        aiAnalysis: object;
        digitalSignature: string;
    };
    performanceImpact: {
        downtimeBefore: number;
        downtimeAfter: number;
        efficiencyBefore: number;
        efficiencyAfter: number;
        qualityImpact: string;
        productivityGain: number;
    };
    workCenterId: string;
    workCenter: WorkCenter;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    calculateActualDuration(): number;
    isOverdue(): boolean;
    getDaysOverdue(): number;
    getEfficiencyGain(): number;
    getDowntimeReduction(): number;
    calculateROI(): number;
    updateStatus(newStatus: MaintenanceStatus, userId?: string): void;
    validateMaintenance(): string[];
    generateMaintenanceReport(): object;
    clone(newScheduledDate: Date): Partial<EquipmentMaintenance>;
    canStart(): boolean;
    requiresApproval(): boolean;
    getMaintenanceHistory(): object;
}
//# sourceMappingURL=EquipmentMaintenance.d.ts.map