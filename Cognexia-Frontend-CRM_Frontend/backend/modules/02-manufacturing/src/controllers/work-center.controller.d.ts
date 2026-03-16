import { WorkCenterService } from '../services/work-center.service';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';
import { WorkCenterResponseDto } from '../dto/work-center-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class WorkCenterController {
    private readonly workCenterService;
    private readonly logger;
    constructor(workCenterService: WorkCenterService);
    create(createWorkCenterDto: CreateWorkCenterDto): Promise<WorkCenterResponseDto>;
    findAll(paginationDto: PaginationDto, search?: string, status?: string, type?: string): Promise<{
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
}
//# sourceMappingURL=work-center.controller.d.ts.map