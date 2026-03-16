import { UUID } from 'crypto';
export declare class TimeAttendanceService {
    private timeAttendanceModel;
    constructor();
    clockIn(employeeId: UUID, organizationId: UUID, location?: string): Promise<any>;
    clockOut(employeeId: UUID, organizationId: UUID, location?: string): Promise<any>;
    requestLeave(organizationId: UUID, data: any): Promise<any>;
    getAttendanceReport(organizationId: UUID, filters: any): Promise<any>;
    private calculateHours;
    private validateLeaveRequest;
}
//# sourceMappingURL=time-attendance.service.d.ts.map