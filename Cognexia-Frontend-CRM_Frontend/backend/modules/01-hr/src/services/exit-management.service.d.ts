import { UUID } from 'crypto';
export declare class ExitManagementService {
    private exitModel;
    constructor();
    initiateExitProcess(organizationId: UUID, data: any): Promise<any>;
    conductExitInterview(organizationId: UUID, data: any): Promise<any>;
    createKnowledgeTransferPlan(employeeId: UUID, successorId: UUID, organizationId: UUID): Promise<any>;
    updateOffboardingStatus(checklistId: UUID, itemId: UUID, completed: boolean, organizationId: UUID): Promise<any>;
    getExitAnalytics(organizationId: UUID, period?: string): Promise<any>;
    getTurnoverReport(organizationId: UUID, filters?: any): Promise<any>;
    private generateOffboardingChecklist;
    private scheduleExitInterview;
    private calculateDefaultInterviewDate;
    private analyzeExitFeedback;
    private extractFeedbackThemes;
    private analyzeSentiment;
    private identifyRiskFactors;
    private generateActionItems;
    private generateTransferTimeline;
    private checkOffboardingCompletion;
    private generateExitInsights;
    private generateRetentionRecommendations;
    private validateExitData;
    private validateExitInterviewData;
}
//# sourceMappingURL=exit-management.service.d.ts.map