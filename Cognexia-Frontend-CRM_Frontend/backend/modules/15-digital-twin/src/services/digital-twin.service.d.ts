export declare class DigitalTwinService {
    private readonly logger;
    createDigitalTwin(entity: any): Promise<any>;
    simulateScenario(twinId: string, scenario: any): Promise<any>;
    createPositionTwin(data: any): Promise<any>;
    getPositionPredictions(positionId: string): Promise<any>;
    simulateCareerProgression(fromPositionId: string, toPositionId: string, skillGaps: any[]): Promise<any>;
    simulateSuccessionScenarios(positionId: string): Promise<any>;
    simulateSkillGapImpact(organizationId: string): Promise<any>;
    simulateWorkspaceEfficiency(positionId: string): Promise<any>;
    updatePositionModel(positionId: string, optimizations: any[]): Promise<any>;
    healthCheck(): Promise<{
        status: string;
    }>;
}
//# sourceMappingURL=digital-twin.service.d.ts.map