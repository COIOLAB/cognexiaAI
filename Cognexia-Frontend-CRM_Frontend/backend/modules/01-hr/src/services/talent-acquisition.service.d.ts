import { UUID } from 'crypto';
import { JobRequisition, CreateJobRequisitionRequest, JobApplication, Candidate, Interview, TalentAcquisitionService, PaginationOptions, PaginatedResponse, FilterOptions, ApplicationStatus, ApplicationStage, RequisitionStatus, HiringDecision } from '../types';
export declare class TalentAcquisitionServiceImpl implements TalentAcquisitionService {
    private taModel;
    constructor();
    /**
     * Creates a new job requisition
     */
    createRequisition(organizationId: UUID, data: CreateJobRequisitionRequest): Promise<JobRequisition>;
    /**
     * Gets a job requisition by ID
     */
    getRequisitionById(id: UUID): Promise<JobRequisition | null>;
    /**
     * Lists job requisitions with pagination and filtering
     */
    listRequisitions(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<JobRequisition>>;
    /**
     * Updates requisition status
     */
    updateRequisitionStatus(id: UUID, status: RequisitionStatus): Promise<JobRequisition>;
    /**
     * Creates a new job application
     */
    createApplication(candidateData: Partial<Candidate>, requisitionId: UUID): Promise<JobApplication>;
    /**
     * Gets a job application by ID
     */
    getApplicationById(id: UUID): Promise<JobApplication | null>;
    /**
     * Updates application status and stage
     */
    updateApplicationStatus(id: UUID, status: ApplicationStatus, stage: ApplicationStage): Promise<JobApplication>;
    /**
     * Schedules an interview for an application
     */
    scheduleInterview(applicationId: UUID, interviewData: Partial<Interview>): Promise<Interview>;
    /**
     * Submits interview feedback
     */
    submitInterviewFeedback(interviewId: UUID, feedback: Partial<Interview>): Promise<Interview>;
    /**
     * Gets applications for a specific requisition
     */
    getApplicationsForRequisition(requisitionId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<JobApplication>>;
    /**
     * Makes hiring decision
     */
    makeHiringDecision(applicationId: UUID, decision: HiringDecision, notes?: string): Promise<JobApplication>;
    /**
     * Private helper methods
     */
    private validateRequisitionData;
    private validateStatusTransition;
    private checkInterviewerAvailability;
}
//# sourceMappingURL=talent-acquisition.service.d.ts.map