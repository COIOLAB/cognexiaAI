export declare class BlockchainService {
    private readonly logger;
    verifyCredential(credential: any): Promise<boolean>;
    storeTransaction(data: any): Promise<string>;
    verifyAndOptimizeSkillRequirements(skillRequirements: any[]): Promise<any>;
    createPositionRecord(position: any): Promise<any>;
    getPositionAuditTrail(positionId: string): Promise<any>;
    getCareerSkillProgression(fromPositionId: string, toPositionId: string): Promise<any>;
    verifySuccessionReadiness(positionId: string): Promise<any>;
    verifyOrganizationalSkills(organizationId: string): Promise<any>;
    recordWorkspaceOptimization(positionId: string, optimization: any): Promise<any>;
    getVerifiedMarketData(positionId: string): Promise<any>;
    recordAutonomousOptimization(positionId: string, optimizations: any[]): Promise<any>;
    upgradePositionVerification(positionId: string, parameters: any): Promise<any>;
    healthCheck(): Promise<{
        status: string;
    }>;
}
//# sourceMappingURL=blockchain.service.d.ts.map