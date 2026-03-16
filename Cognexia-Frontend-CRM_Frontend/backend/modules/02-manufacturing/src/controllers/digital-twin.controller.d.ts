import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DigitalTwinService } from '../services/digital-twin.service';
import { CreateDigitalTwinDto } from '../dto/create-digital-twin.dto';
import { UpdateDigitalTwinDto } from '../dto/update-digital-twin.dto';
import { DigitalTwinResponseDto } from '../dto/digital-twin-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class DigitalTwinController {
    private readonly digitalTwinService;
    private readonly logger;
    constructor(digitalTwinService: DigitalTwinService);
    create(createDigitalTwinDto: CreateDigitalTwinDto): Promise<DigitalTwinResponseDto>;
    findAll(paginationDto: PaginationDto, search?: string, status?: string, type?: string): Promise<{
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
    getRealTimeData(id: string): Observable<MessageEvent>;
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
}
//# sourceMappingURL=digital-twin.controller.d.ts.map