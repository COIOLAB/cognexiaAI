import { CybersecurityService } from '../services/cybersecurity.service';
import { CreateCybersecurityDto } from '../dto/create-cybersecurity.dto';
import { UpdateCybersecurityDto } from '../dto/update-cybersecurity.dto';
import { CybersecurityResponseDto } from '../dto/cybersecurity-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CybersecurityController {
    private readonly cybersecurityService;
    private readonly logger;
    constructor(cybersecurityService: CybersecurityService);
    create(createCybersecurityDto: CreateCybersecurityDto): Promise<CybersecurityResponseDto>;
    findAll(paginationDto: PaginationDto, search?: string, securityLevel?: string, threatLevel?: string, complianceFramework?: string): Promise<{
        data: CybersecurityResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<CybersecurityResponseDto>;
    update(id: string, updateCybersecurityDto: UpdateCybersecurityDto): Promise<CybersecurityResponseDto>;
    remove(id: string): Promise<void>;
    getSecurityScore(id: string): Promise<any>;
    detectThreat(id: string, threatData: any): Promise<any>;
    createIncident(id: string, incidentData: any): Promise<any>;
    respondToIncident(id: string, incidentId: string, responseAction: any): Promise<any>;
    runVulnerabilityAssessment(id: string): Promise<any>;
    enableQuantumSecurity(id: string): Promise<any>;
    enableBlockchainSecurity(id: string): Promise<any>;
    conductSecurityTraining(id: string, trainingData: {
        trainingType: string;
        participants: string[];
    }): Promise<any>;
    getComplianceScore(id: string): Promise<any>;
    generateSecurityReport(id: string): Promise<any>;
    auditSecurity(id: string, auditData: {
        auditorId: string;
    }): Promise<any>;
    updateSecurityMetrics(id: string, metricsData: any): Promise<any>;
    getActiveThreats(id: string): Promise<any>;
    getSecurityAnalytics(id: string, period?: string): Promise<any>;
    initiateEmergencyResponse(id: string, emergencyData: any): Promise<any>;
    clone(id: string, cloneData: {
        newSecurityCode: string;
        newSecurityName: string;
    }): Promise<CybersecurityResponseDto>;
    getRiskAssessment(id: string): Promise<any>;
    getSecurityCulture(id: string): Promise<any>;
}
//# sourceMappingURL=cybersecurity.controller.d.ts.map