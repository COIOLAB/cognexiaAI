import { Repository } from 'typeorm';
import { WorkCenter } from '../entities/WorkCenter';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';
import { WorkCenterResponseDto } from '../dto/work-center-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class WorkCenterService {
    private readonly workCenterRepository;
    private readonly logger;
    constructor(workCenterRepository: Repository<WorkCenter>);
    create(createWorkCenterDto: CreateWorkCenterDto): Promise<WorkCenterResponseDto>;
    findAll(paginationDto: PaginationDto, filters: {
        search?: string;
        status?: string;
        type?: string;
    }): Promise<{
        data: WorkCenterResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<WorkCenterResponseDto>;
    findByCode(code: string): Promise<WorkCenterResponseDto>;
    update(id: string, updateWorkCenterDto: UpdateWorkCenterDto): Promise<WorkCenterResponseDto>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<WorkCenterResponseDto>;
    deactivate(id: string): Promise<WorkCenterResponseDto>;
    getCapacity(id: string, date?: string): Promise<any>;
    getEfficiency(id: string, startDate?: string, endDate?: string): Promise<any>;
    getSchedule(id: string, days?: number): Promise<any>;
    scheduleMaintenance(id: string, maintenanceData: any): Promise<any>;
    getQualityMetrics(id: string, period?: string): Promise<any>;
    emergencyStop(id: string, stopData: any): Promise<any>;
    clone(id: string, cloneData: {
        newCode: string;
        newName: string;
    }): Promise<WorkCenterResponseDto>;
    private mapToResponseDto;
    private calculateEfficiencyTrend;
    private calculatePerformanceTrend;
    private calculateScheduledUtilization;
    private calculateQualityScore;
    private calculateQualityTrends;
}
//# sourceMappingURL=work-center.service.d.ts.map