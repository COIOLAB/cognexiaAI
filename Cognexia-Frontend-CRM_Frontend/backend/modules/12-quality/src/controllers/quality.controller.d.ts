import { QualityService } from '../services/quality.service';
export declare class QualityController {
    private readonly qualityService;
    private readonly logger;
    constructor(qualityService: QualityService);
    getAllInspections(page?: number, limit?: number, status?: string, type?: string, workCenterId?: string): Promise<any>;
    getInspection(id: string): Promise<any>;
    createInspection(createInspectionDto: any): Promise<any>;
    updateInspection(id: string, updateInspectionDto: any): Promise<any>;
    completeInspection(id: string, completionData: any): Promise<any>;
    getQualityAnalytics(timeRange?: string, industryType?: string): Promise<{
        success: boolean;
        data: {
            overview: {
                totalInspections: number;
                passedInspections: number;
                failedInspections: number;
                passRate: number;
                averageQualityScore: number;
                defectRate: number;
                reworkRate: number;
            };
            trends: {
                labels: string[];
                passRate: number[];
                qualityScore: number[];
                defectRate: number[];
            };
            topDefects: {
                type: string;
                count: number;
                percentage: number;
            }[];
            industryMetrics: {
                pharmaceutical: {
                    gmpCompliance: number;
                    sterileProcesses: number;
                    validationStatus: string;
                };
                chemical: {
                    safetyCompliance: number;
                    hazmatCompliance: number;
                    environmentalCompliance: number;
                };
                automotive: {
                    ts16949Compliance: number;
                    ppapApproval: number;
                    customerSatisfaction: number;
                };
            };
            alerts: {
                critical: number;
                warning: number;
                info: number;
            };
        };
        message: string;
    }>;
    getDefectAnalysis(timeRange?: string, workCenterId?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalDefects: number;
                criticalDefects: number;
                majorDefects: number;
                minorDefects: number;
                resolvedDefects: number;
                openDefects: number;
            };
            byCategory: {
                category: string;
                count: number;
                trend: string;
            }[];
            byWorkCenter: {
                workCenterId: string;
                name: string;
                defects: number;
            }[];
            rootCauses: {
                cause: string;
                percentage: number;
            }[];
            correctiveActions: {
                implemented: number;
                inProgress: number;
                planned: number;
                effectiveness: number;
            };
        };
        message: string;
    }>;
    getComplianceStatus(industryType?: string): Promise<{
        success: boolean;
        data: {
            overall: {
                complianceScore: number;
                activeStandards: number;
                nonCompliances: number;
                overdueActions: number;
                lastAudit: string;
            };
            standards: {
                name: string;
                status: string;
                lastReview: string;
                nextReview: string;
            }[];
            industrySpecific: {
                pharmaceutical: {
                    name: string;
                    status: string;
                    expires: string;
                }[];
                chemical: {
                    name: string;
                    status: string;
                    expires: string;
                }[];
                automotive: {
                    name: string;
                    status: string;
                    expires: string;
                }[];
            };
            nonCompliances: {
                id: string;
                standard: string;
                description: string;
                severity: string;
                dueDate: string;
                assignedTo: string;
            }[];
            auditSchedule: {
                audit: string;
                date: string;
                auditor: string;
            }[];
        };
        message: string;
    }>;
    getCalibrationSchedule(workCenterId?: string, status?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalEquipment: number;
                calibrated: number;
                overdue: number;
                dueThisWeek: number;
                dueThisMonth: number;
            };
            schedule: {
                id: string;
                equipmentId: string;
                equipmentName: string;
                workCenterId: string;
                lastCalibration: string;
                nextCalibration: string;
                frequency: string;
                status: string;
                calibrationLab: string;
            }[];
            upcoming: {
                date: string;
                equipment: number;
                lab: string;
            }[];
            certificates: {
                certificateNumber: string;
                equipmentId: string;
                issueDate: string;
                validUntil: string;
                issuedBy: string;
                status: string;
            }[];
        };
        message: string;
    }>;
    getQualityAlerts(severity?: string, status?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                critical: number;
                high: number;
                medium: number;
                low: number;
                total: number;
                acknowledged: number;
                unacknowledged: number;
            };
            alerts: {
                id: string;
                severity: string;
                type: string;
                title: string;
                description: string;
                workCenterId: string;
                workCenterName: string;
                timestamp: Date;
                status: string;
                assignedTo: string;
                correctiveAction: string;
            }[];
            escalations: {
                alertId: string;
                escalatedTo: string;
                escalatedAt: Date;
                reason: string;
            }[];
        };
        message: string;
    }>;
    acknowledgeAlert(id: string, acknowledgmentData: any): Promise<{
        success: boolean;
        data: {
            alertId: string;
            acknowledgedBy: any;
            acknowledgedAt: Date;
            notes: any;
            status: string;
        };
        message: string;
    }>;
}
//# sourceMappingURL=quality.controller.d.ts.map