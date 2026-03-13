import { UUID } from 'crypto';
export declare class LearningDevelopmentService {
    private learningModel;
    constructor();
    createCourse(organizationId: UUID, data: any): Promise<any>;
    enrollEmployee(organizationId: UUID, data: any): Promise<any>;
    updateProgress(enrollmentId: UUID, progress: number, organizationId: UUID): Promise<any>;
    getEmployeeSkills(employeeId: UUID, organizationId: UUID): Promise<any>;
    getLearningAnalytics(organizationId: UUID): Promise<any>;
    private handleCourseCompletion;
    private validateCourseData;
}
//# sourceMappingURL=learning-development.service.d.ts.map