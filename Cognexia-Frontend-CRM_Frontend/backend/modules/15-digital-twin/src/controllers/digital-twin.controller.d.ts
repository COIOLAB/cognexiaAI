import { DigitalTwinService, TwinAnalytics, SimulationAnalytics } from '../services/digital-twin.service';
import { DigitalTwin, TwinType, TwinStatus, SynchronizationMode, IndustryType } from '../entities/digital-twin.entity';
import { DigitalTwinSimulation, SimulationType, SimulationStatus, SimulationPriority, ComputeType } from '../entities/digital-twin-simulation.entity';
export declare class CreateTwinRequestDto {
    twinId: string;
    name: string;
    description?: string;
    twinType: TwinType;
    industryType: IndustryType;
    physicalAssetId: string;
    physicalLocation: any;
    configuration: any;
    physicalSpecs: any;
    currentData: any;
    historicalSummary: any;
    integrations: any;
    compliance: any;
    performance: any;
    tags?: string[];
    customFields?: Record<string, any>;
    notes?: string;
}
export declare class UpdateTwinRequestDto {
    name?: string;
    description?: string;
    status?: TwinStatus;
    configuration?: any;
    currentData?: any;
    historicalSummary?: any;
    aiInsights?: any;
    simulationConfig?: any;
    integrations?: any;
    performance?: any;
    tags?: string[];
    customFields?: Record<string, any>;
    notes?: string;
}
export declare class CreateSimulationRequestDto {
    name: string;
    description?: string;
    simulationType: SimulationType;
    priority?: SimulationPriority;
    computeType?: ComputeType;
    twinId: string;
    configuration: any;
    scenario: any;
    modelInfo: any;
    quantumInfo?: any;
    tags?: string[];
    metadata?: Record<string, any>;
    notes?: string;
}
export declare class TwinSearchQueryDto {
    twinType?: TwinType;
    status?: TwinStatus;
    industryType?: IndustryType;
    tags?: string[];
    healthyOnly?: boolean;
    requiresAttention?: boolean;
    hasQuantumCapabilities?: boolean;
    syncMode?: SynchronizationMode;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
export declare class SimulationSearchQueryDto {
    simulationType?: SimulationType;
    status?: SimulationStatus;
    priority?: SimulationPriority;
    computeType?: ComputeType;
    twinId?: string;
    completedOnly?: boolean;
    requiresAttention?: boolean;
    limit?: number;
    offset?: number;
}
export declare class UpdateTwinDataDto {
    data: any;
}
export declare class DigitalTwinController {
    private readonly digitalTwinService;
    constructor(digitalTwinService: DigitalTwinService);
    createDigitalTwin(createDto: CreateTwinRequestDto, user: any): Promise<DigitalTwin>;
    searchDigitalTwins(query: TwinSearchQueryDto): Promise<any>;
    getDigitalTwinById(id: string, includeSimulations?: boolean): Promise<DigitalTwin>;
    getDigitalTwinByTwinId(twinId: string, includeSimulations?: boolean): Promise<DigitalTwin>;
    updateDigitalTwin(id: string, updateDto: UpdateTwinRequestDto, user: any): Promise<DigitalTwin>;
    deleteDigitalTwin(id: string): Promise<void>;
    updateTwinData(twinId: string, updateDataDto: UpdateTwinDataDto, user: any): Promise<DigitalTwin>;
    synchronizeTwin(twinId: string): Promise<DigitalTwin>;
    getAnomalies(twinId: string, limit?: number): Promise<any[]>;
    getOptimizationRecommendations(twinId: string): Promise<any[]>;
    createSimulation(createDto: CreateSimulationRequestDto, user: any): Promise<DigitalTwinSimulation>;
    searchSimulations(query: SimulationSearchQueryDto): Promise<any>;
    runSimulation(id: string, user: any): Promise<DigitalTwinSimulation>;
    getSimulationResults(id: string): Promise<any>;
    getTwinAnalytics(): Promise<TwinAnalytics>;
    getSimulationAnalytics(): Promise<SimulationAnalytics>;
    getTwinsByIndustry(industryType: IndustryType): Promise<any>;
    getQuantumEnabledTwins(): Promise<any>;
    getHealthStatus(): Promise<any>;
    getTwinsRequiringAttention(): Promise<any>;
    getRealTimeTwins(): Promise<any>;
    getRealTimeDataStream(twinId: string): Promise<any>;
    triggerPredictiveMaintenance(twinId: string, user: any): Promise<DigitalTwinSimulation>;
    triggerProcessOptimization(twinId: string, user: any): Promise<DigitalTwinSimulation>;
    getComplianceStatus(twinId: string): Promise<any>;
    getEnergyEfficiency(twinId: string): Promise<any>;
    getIndustrySpecificMetrics(twinId: string): Promise<any>;
    private getIndustryBenchmarks;
    private calculatePerformanceGrade;
}
//# sourceMappingURL=digital-twin.controller.d.ts.map