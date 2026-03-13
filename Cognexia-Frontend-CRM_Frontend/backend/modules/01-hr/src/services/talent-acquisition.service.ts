// Industry 5.0 ERP Backend - Talent Acquisition Service
// Service for managing recruitment and candidate selection
// Author: AI Assistant
// Date: 2024

import { UUID } from 'crypto';
import { JobRequisition, CreateJobRequisitionRequest, JobApplication, Candidate, Interview, TalentAcquisitionService, PaginationOptions, PaginatedResponse, FilterOptions, ApplicationStatus, ApplicationStage, InterviewStatus, InterviewType, CandidateStatus, RequisitionStatus, HiringDecision } from '../types';
import { TalentAcquisitionModel } from '../models';
import { HRError, HRErrorCodes, HRErrorFactory } from '../utils/error.util';
import { logger } from '../../../utils/logger';
import { getErrorMessage, getErrorStack } from '../../../utils/error-handler.util';

export class TalentAcquisitionServiceImpl implements TalentAcquisitionService {
  private taModel: TalentAcquisitionModel;

  constructor() {
    this.taModel = new TalentAcquisitionModel();
  }

  /**
   * Creates a new job requisition
   */
  async createRequisition(organizationId: UUID, data: CreateJobRequisitionRequest): Promise<JobRequisition> {
    try {
      // Validate requisition data
      this.validateRequisitionData(data);

      const requisition = await this.taModel.createRequisition(organizationId, data);
      logger.info(`Job requisition created: ${requisition.id}`, { 
        requisitionId: requisition.id,
        jobTitle: requisition.jobTitle,
        department: requisition.department
      });
      
      return requisition;
    } catch (error) {
      logger.error('Error creating job requisition:', error);
      throw error instanceof HRError ? error : new HRError(HRErrorCodes.INVALID_REQUISITION_DATA, getErrorMessage(error), 500);
    }
  }

  /**
   * Gets a job requisition by ID
   */
  async getRequisitionById(id: UUID): Promise<JobRequisition | null> {
    try {
      return await this.taModel.findRequisitionById(id);
    } catch (error) {
      logger.error(`Error getting requisition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lists job requisitions with pagination and filtering
   */
  async listRequisitions(organizationId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<JobRequisition>> {
    try {
      return await this.taModel.listRequisitions(organizationId, options);
    } catch (error) {
      logger.error('Error listing requisitions:', error);
      throw error;
    }
  }

  /**
   * Updates requisition status
   */
  async updateRequisitionStatus(id: UUID, status: RequisitionStatus): Promise<JobRequisition> {
    try {
      const requisition = await this.taModel.findRequisitionById(id);
      if (!requisition) {
        throw HRErrorFactory.requisitionNotFound(id);
      }

      const updatedRequisition = await this.taModel.updateRequisition(id, { status });
      logger.info(`Requisition status updated: ${id}`, { 
        requisitionId: id,
        oldStatus: requisition.status,
        newStatus: status
      });
      
      return updatedRequisition;
    } catch (error) {
      logger.error(`Error updating requisition status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new job application
   */
  async createApplication(candidateData: Partial<Candidate>, requisitionId: UUID): Promise<JobApplication> {
    try {
      // Check if requisition exists and is active
      const requisition = await this.taModel.findRequisitionById(requisitionId);
      if (!requisition) {
        throw HRErrorFactory.requisitionNotFound(requisitionId);
      }
      
      if (requisition.status !== RequisitionStatus.ACTIVE) {
        throw new HRError(HRErrorCodes.INVALID_REQUISITION_DATA, 'Job requisition is not active', 400);
      }

      // Create or find candidate
      let candidate: Candidate;
      const existingCandidate = await this.taModel.findCandidateByEmail(candidateData.email!);
      
      if (existingCandidate) {
        candidate = existingCandidate;
      } else {
        candidate = await this.taModel.createCandidate(requisition.organizationId, candidateData);
      }

      // Check for duplicate application
      const existingApplication = await this.taModel.findApplicationByRequisitionAndCandidate(requisitionId, candidate.id);
      if (existingApplication) {
        throw new HRError(HRErrorCodes.APPLICATION_ALREADY_EXISTS, 'Application already exists for this position', 409);
      }

      // Create application
      const application = await this.taModel.createApplication({
        requisitionId,
        candidateId: candidate.id,
        status: ApplicationStatus.APPLIED,
        stage: ApplicationStage.APPLICATION_RECEIVED,
        appliedDate: new Date()
      });

      logger.info(`Job application created: ${application.id}`, { 
        applicationId: application.id,
        candidateId: candidate.id,
        requisitionId
      });

      return application;
    } catch (error) {
      logger.error('Error creating job application:', error);
      throw error instanceof HRError ? error : new HRError(HRErrorCodes.INVALID_APPLICATION_DATA, getErrorMessage(error), 500);
    }
  }

  /**
   * Gets a job application by ID
   */
  async getApplicationById(id: UUID): Promise<JobApplication | null> {
    try {
      return await this.taModel.findApplicationById(id);
    } catch (error) {
      logger.error(`Error getting application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates application status and stage
   */
  async updateApplicationStatus(id: UUID, status: ApplicationStatus, stage: ApplicationStage): Promise<JobApplication> {
    try {
      const application = await this.taModel.findApplicationById(id);
      if (!application) {
        throw HRErrorFactory.applicationNotFound(id);
      }

      // Validate status transition
      this.validateStatusTransition(application.status, status);

      const updatedApplication = await this.taModel.updateApplication(id, { status, stage });
      
      logger.info(`Application status updated: ${id}`, { 
        applicationId: id,
        oldStatus: application.status,
        newStatus: status,
        stage
      });

      return updatedApplication;
    } catch (error) {
      logger.error(`Error updating application status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Schedules an interview for an application
   */
  async scheduleInterview(applicationId: UUID, interviewData: Partial<Interview>): Promise<Interview> {
    try {
      const application = await this.taModel.findApplicationById(applicationId);
      if (!application) {
        throw HRErrorFactory.applicationNotFound(applicationId);
      }

      // Validate interviewer availability
      if (interviewData.interviewerId && interviewData.scheduledDate) {
        const hasConflict = await this.checkInterviewerAvailability(
          interviewData.interviewerId,
          new Date(interviewData.scheduledDate),
          interviewData.duration || 60
        );

        if (hasConflict) {
          throw HRErrorFactory.interviewSchedulingConflict(
            interviewData.interviewerId,
            new Date(interviewData.scheduledDate)
          );
        }
      }

      const interview = await this.taModel.createInterview({
        applicationId,
        interviewerId: interviewData.interviewerId!,
        interviewType: interviewData.interviewType || InterviewType.VIDEO_INTERVIEW,
        scheduledDate: new Date(interviewData.scheduledDate!),
        duration: interviewData.duration || 60,
        location: interviewData.location,
        meetingLink: interviewData.meetingLink,
        status: InterviewStatus.SCHEDULED,
        strengths: [],
        concerns: [],
        recommendations: ''
      });

      // Update application stage
      await this.updateApplicationStatus(applicationId, ApplicationStatus.INTERVIEW, ApplicationStage.TECHNICAL_INTERVIEW);

      logger.info(`Interview scheduled: ${interview.id}`, { 
        interviewId: interview.id,
        applicationId,
        interviewerId: interviewData.interviewerId,
        scheduledDate: interviewData.scheduledDate
      });

      return interview;
    } catch (error) {
      logger.error(`Error scheduling interview for application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Submits interview feedback
   */
  async submitInterviewFeedback(interviewId: UUID, feedback: Partial<Interview>): Promise<Interview> {
    try {
      const interview = await this.taModel.findInterviewById(interviewId);
      if (!interview) {
        throw new HRError(HRErrorCodes.INTERVIEW_NOT_FOUND, `Interview with ID ${interviewId} not found`, 404);
      }

      const updatedInterview = await this.taModel.updateInterview(interviewId, {
        ...feedback,
        status: InterviewStatus.COMPLETED
      });

      // Update application stage based on interview outcome
      if (feedback.overallRating !== undefined) {
        let newStatus = ApplicationStatus.INTERVIEW;
        let newStage = ApplicationStage.TECHNICAL_INTERVIEW;

        if (feedback.overallRating >= 4) {
          newStatus = ApplicationStatus.ASSESSMENT;
          newStage = ApplicationStage.FINAL_INTERVIEW;
        } else if (feedback.overallRating < 2) {
          newStatus = ApplicationStatus.REJECTED;
          newStage = ApplicationStage.FINAL_INTERVIEW;
        }

        await this.updateApplicationStatus(interview.applicationId, newStatus, newStage);
      }

      logger.info(`Interview feedback submitted: ${interviewId}`, { 
        interviewId,
        applicationId: interview.applicationId,
        overallRating: feedback.overallRating
      });

      return updatedInterview;
    } catch (error) {
      logger.error(`Error submitting interview feedback for ${interviewId}:`, error);
      throw error;
    }
  }

  /**
   * Gets applications for a specific requisition
   */
  async getApplicationsForRequisition(requisitionId: UUID, options: PaginationOptions & FilterOptions): Promise<PaginatedResponse<JobApplication>> {
    try {
      return await this.taModel.listApplicationsByRequisition(requisitionId, options);
    } catch (error) {
      logger.error(`Error getting applications for requisition ${requisitionId}:`, error);
      throw error;
    }
  }

  /**
   * Makes hiring decision
   */
  async makeHiringDecision(applicationId: UUID, decision: HiringDecision, notes?: string): Promise<JobApplication> {
    try {
      const application = await this.taModel.findApplicationById(applicationId);
      if (!application) {
        throw HRErrorFactory.applicationNotFound(applicationId);
      }

      let newStatus: ApplicationStatus;
      let newStage: ApplicationStage;

      switch (decision) {
        case HiringDecision.HIRE:
        case HiringDecision.STRONG_HIRE:
          newStatus = ApplicationStatus.HIRED;
          newStage = ApplicationStage.OFFER_ACCEPTED;
          break;
        case HiringDecision.NO_HIRE:
        case HiringDecision.STRONG_NO_HIRE:
          newStatus = ApplicationStatus.REJECTED;
          newStage = ApplicationStage.OFFER_DECLINED;
          break;
        case HiringDecision.MAYBE:
          newStatus = ApplicationStatus.ASSESSMENT;
          newStage = ApplicationStage.REFERENCE_CHECK;
          break;
      }

      const updatedApplication = await this.taModel.updateApplication(applicationId, {
        status: newStatus,
        stage: newStage,
        finalDecision: decision,
        decisionDate: new Date(),
        decisionNotes: notes
      });

      logger.info(`Hiring decision made: ${applicationId}`, { 
        applicationId,
        decision,
        status: newStatus,
        stage: newStage
      });

      return updatedApplication;
    } catch (error) {
      logger.error(`Error making hiring decision for ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private validateRequisitionData(data: CreateJobRequisitionRequest): void {
    const errors: string[] = [];

    if (!data.jobTitle?.trim()) errors.push('Job title is required');
    if (!data.department?.trim()) errors.push('Department is required');
    if (!data.location?.trim()) errors.push('Location is required');
    if (!data.jobDescription?.trim()) errors.push('Job description is required');
    if (!data.requirements?.length) errors.push('At least one requirement is needed');
    if (!data.responsibilities?.length) errors.push('At least one responsibility is needed');
    if (data.requestedPositions < 1) errors.push('Requested positions must be at least 1');

    if (errors.length > 0) {
      throw new HRError(HRErrorCodes.INVALID_REQUISITION_DATA, 'Invalid requisition data', 400, { errors });
    }
  }

  private validateStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): void {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]: [ApplicationStatus.SCREENING, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.SCREENING]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.INTERVIEW]: [ApplicationStatus.ASSESSMENT, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.ASSESSMENT]: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.OFFER]: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.HIRED]: [],
      [ApplicationStatus.REJECTED]: [],
      [ApplicationStatus.WITHDRAWN]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new HRError(
        HRErrorCodes.INVALID_APPLICATION_STATUS_TRANSITION,
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        400,
        { currentStatus, newStatus, validTransitions: validTransitions[currentStatus] }
      );
    }
  }

  private async checkInterviewerAvailability(interviewerId: UUID, scheduledTime: Date, duration: number): Promise<boolean> {
    try {
      const conflicts = await this.taModel.findInterviewerConflicts(interviewerId, scheduledTime, duration);
      return conflicts.length > 0;
    } catch (error) {
      logger.warn('Error checking interviewer availability:', error);
      return false; // Assume available if check fails
    }
  }
}
