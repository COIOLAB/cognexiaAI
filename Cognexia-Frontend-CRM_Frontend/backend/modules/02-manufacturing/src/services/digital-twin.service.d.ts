import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { DigitalTwin } from '../entities/DigitalTwin';
import { CreateDigitalTwinDto } from '../dto/create-digital-twin.dto';
import { UpdateDigitalTwinDto } from '../dto/update-digital-twin.dto';
import { DigitalTwinResponseDto } from '../dto/digital-twin-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class DigitalTwinService {
    private readonly digitalTwinRepository;
    private readonly logger;
    private readonly realTimeDataStreams;
    constructor(digitalTwinRepository: Repository<DigitalTwin>);
    create(createDigitalTwinDto: CreateDigitalTwinDto): Promise<DigitalTwinResponseDto>;
    findAll(paginationDto: PaginationDto, filters: {
        search?: string;
        status?: string;
        type?: string;
    }): Promise<{
        data: DigitalTwinResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<DigitalTwinResponseDto>;
    update(id: string, updateDigitalTwinDto: UpdateDigitalTwinDto): Promise<DigitalTwinResponseDto>;
    remove(id: string): Promise<void>;
    startSimulation(id: string, simulationParams?: any): Promise<any>;
    stopSimulation(id: string): Promise<any>;
    synchronize(id: string): Promise<any>;
    getRealTimeDataStream(id: string): Observable<MessageEvent>;
    runPrediction(id: string, predictionParams: any): Promise<any>;
    runOptimization(id: string, optimizationParams: any): Promise<any>;
    getAnalytics(id: string, period?: string): Promise<any>;
    enableQuantumComputing(id: string): Promise<any>;
    enableBlockchain(id: string): Promise<any>;
    getHealthStatus(id: string): Promise<any>;
    runScenarioAnalysis(id: string, scenarioParams: any): Promise<any>;
    getDigitalThread(id: string): Promise<any>;
    runSecurityValidation(id: string): Promise<any>;
    generateReport(id: string, reportParams: any): Promise<any>;
    clone(id: string, cloneData: {
        newCode: string;
        newName: string;
    }): Promise<DigitalTwinResponseDto>;
    getPerformanceMetrics(id: string, startDate?: string, endDate?: string): Promise<any>;
    updateDigitalModel(id: string, modelData: any): Promise<any>;
    private initializeRealTimeStream;
    private cleanupRealTimeStream;
    private generateRealTimeData;
    private mapToResponseDto;
    private calculateUtilizationMetrics;
    private calculatePredictionAccuracy;
    private getSimulationStatistics;
    private calculateResourceUsage;
    private calculateAnalyticsTrends;
    private generateMockSystemMetric;
    private detectAnomalies;
    private generateHealthRecommendations;
    private generateTraceabilityData;
    private mapDependencies;
    private getChangeLog;
    private calculateThroughput;
    private calculateLatency;
    private calculateReliability;
    private calculateScalability;
    private calculatePerformanceTrends;
}
//# sourceMappingURL=digital-twin.service.d.ts.map