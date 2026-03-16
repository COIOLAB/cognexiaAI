import { UUID } from 'crypto';
export declare class EmployeeEngagementService {
    private engagementModel;
    constructor();
    createSurvey(organizationId: UUID, data: any): Promise<any>;
    submitSurveyResponse(organizationId: UUID, data: any): Promise<any>;
    submitFeedback(organizationId: UUID, data: any): Promise<any>;
    getEngagementScore(organizationId: UUID, filters?: any): Promise<any>;
    getSurveyResults(surveyId: UUID, organizationId: UUID): Promise<any>;
    getEngagementTrends(organizationId: UUID, period: string): Promise<any>;
    private getEngagementBenchmarks;
    private generateEngagementRecommendations;
    private validateSurveyData;
    private validateFeedbackData;
}
//# sourceMappingURL=employee-engagement.service.d.ts.map