import { EventEmitter } from 'events';
import { CrossModuleIntegrationService } from '../../../core/services/CrossModuleIntegrationService';
export interface HRIntegrationEvent {
    eventType: HREventType;
    source: string;
    target: string;
    data: any;
    timestamp: Date;
    organizationId: string;
    userId?: string;
    correlationId?: string;
}
export declare enum HREventType {
    EMPLOYEE_HIRED = "employee_hired",
    EMPLOYEE_TERMINATED = "employee_terminated",
    EMPLOYEE_PROMOTED = "employee_promoted",
    EMPLOYEE_TRANSFERRED = "employee_transferred",
    EMPLOYEE_STATUS_CHANGED = "employee_status_changed",
    CANDIDATE_INTERVIEWED = "candidate_interviewed",
    CANDIDATE_HIRED = "candidate_hired",
    CANDIDATE_REJECTED = "candidate_rejected",
    JOB_POSTING_CREATED = "job_posting_created",
    PERFORMANCE_REVIEW_COMPLETED = "performance_review_completed",
    GOAL_ACHIEVED = "goal_achieved",
    GOAL_MISSED = "goal_missed",
    SKILL_UPDATED = "skill_updated",
    SALARY_UPDATED = "salary_updated",
    BONUS_AWARDED = "bonus_awarded",
    BENEFITS_ENROLLED = "benefits_enrolled",
    EQUITY_GRANTED = "equity_granted",
    PAYROLL_PROCESSED = "payroll_processed",
    PAYROLL_ERROR = "payroll_error",
    TAX_CALCULATED = "tax_calculated",
    SHIFT_STARTED = "shift_started",
    SHIFT_ENDED = "shift_ended",
    OVERTIME_RECORDED = "overtime_recorded",
    ABSENCE_RECORDED = "absence_recorded",
    TRAINING_COMPLETED = "training_completed",
    CERTIFICATION_EARNED = "certification_earned",
    LEARNING_PATH_ASSIGNED = "learning_path_assigned",
    STAFFING_NEED_IDENTIFIED = "staffing_need_identified",
    CAPACITY_UPDATED = "capacity_updated",
    WORKFORCE_FORECAST_UPDATED = "workforce_forecast_updated"
}
export interface IntegrationMapping {
    id: string;
    sourceModule: string;
    targetModule: string;
    sourceEvent: string;
    targetAction: string;
    dataTransform?: (data: any) => any;
    conditions?: (data: any) => boolean;
    enabled: boolean;
    priority: number;
    retryCount: number;
    timeout: number;
}
export declare class HRIntegrationService extends EventEmitter {
    private crossModuleService;
    private integrationMappings;
    private eventQueue;
    private isProcessing;
    private healthMetrics;
    constructor(crossModuleService: CrossModuleIntegrationService);
    /**
     * Initialize default integration mappings between HR and other modules
     */
    private initializeDefaultMappings;
    /**
     * Add a new integration mapping
     */
    addIntegrationMapping(mapping: IntegrationMapping): void;
    /**
     * Remove an integration mapping
     */
    removeIntegrationMapping(mappingId: string): void;
    /**
     * Publish an HR event to the integration system
     */
    publishHREvent(event: HRIntegrationEvent): Promise<void>;
    /**
     * Subscribe to events from other modules
     */
    subscribeToModuleEvents(): void;
    /**
     * Handle events from other modules
     */
    private handleExternalModuleEvent;
    /**
     * Process integration mapping
     */
    private processIntegrationMapping;
    /**
     * Execute target action based on the integration mapping
     */
    private executeTargetAction;
    /**
     * Target action implementations
     */
    private updateStaffingRequirements;
    private updateWarehouseStaffing;
    private registerOperator;
    private updateInspectorCertification;
    private forecastWorkforceNeeds;
    private requestTemporaryStaffing;
    private updateEmployeePerformance;
    /**
     * Utility method to map HR skills to shop floor control skills
     */
    private mapHRSkillToShopFloor;
    /**
     * Start processing events from the queue
     */
    private startEventProcessing;
    /**
     * Process individual HR event
     */
    private processHREvent;
    /**
     * Setup health monitoring
     */
    private setupHealthMonitoring;
    /**
     * Get integration health status
     */
    getHealthStatus(): any;
    /**
     * Get integration statistics
     */
    getIntegrationStats(): any;
    /**
     * Cleanup and shutdown
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=hr-integration.service.d.ts.map