// Industry 5.0 ERP Backend - Talent Acquisition Controller
// AI-powered recruitment with advanced ATS, candidate tracking, interview management, and predictive analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { TalentAcquisitionService } from '../services/talent-acquisition.service';
import { ServiceResponse } from '../types';
import { UUID } from 'crypto';

export class TalentAcquisitionController {
  private talentAcquisitionService: TalentAcquisitionService;

  constructor() {
    this.talentAcquisitionService = new TalentAcquisitionService();
  }

  /**
   * Create job requisition
   * POST /api/v1/hr/recruitment/job-requisitions
   */
  createJobRequisition = async (req: Request, res: Response): Promise<void> => {
    try {
      const requisitionData = req.body;

      if (!requisitionData.title || !requisitionData.departmentId || !requisitionData.organizationId) {
        res.status(400).json({
          success: false,
          message: 'Job title, department ID, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.createJobRequisition({
        ...requisitionData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating job requisition',
        error: error.message
      });
    }
  };

  /**
   * Get job requisitions
   * GET /api/v1/hr/recruitment/job-requisitions
   */
  getJobRequisitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        status,
        priority,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        status: status as string,
        priority: priority as string
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getJobRequisitions(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching job requisitions',
        error: error.message
      });
    }
  };

  /**
   * Get job requisition by ID
   * GET /api/v1/hr/recruitment/job-requisitions/:id
   */
  getJobRequisition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Job requisition ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getJobRequisitionById(id as UUID);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching job requisition',
        error: error.message
      });
    }
  };

  /**
   * Update job requisition
   * PUT /api/v1/hr/recruitment/job-requisitions/:id
   */
  updateJobRequisition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Job requisition ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.updateJobRequisition(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating job requisition',
        error: error.message
      });
    }
  };

  /**
   * Approve/Reject job requisition
   * POST /api/v1/hr/recruitment/job-requisitions/:id/approve
   */
  approveJobRequisition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      if (!id || !action) {
        res.status(400).json({
          success: false,
          message: 'Requisition ID and action are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.approveJobRequisition(
        id as UUID,
        action,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving job requisition',
        error: error.message
      });
    }
  };

  /**
   * Create candidate profile
   * POST /api/v1/hr/recruitment/candidates
   */
  createCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      const candidateData = req.body;

      if (!candidateData.firstName || !candidateData.lastName || !candidateData.email) {
        res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.createCandidate({
        ...candidateData,
        createdBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating candidate profile',
        error: error.message
      });
    }
  };

  /**
   * Get candidates
   * GET /api/v1/hr/recruitment/candidates
   */
  getCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        jobRequisitionId,
        stage,
        status,
        skills,
        experience,
        location,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        organizationId: organizationId as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        stage: stage as string,
        status: status as string,
        skills: skills ? (skills as string).split(',') : undefined,
        experience: experience as string,
        location: location as string
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getCandidates(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching candidates',
        error: error.message
      });
    }
  };

  /**
   * Get candidate by ID
   * GET /api/v1/hr/recruitment/candidates/:id
   */
  getCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { includeApplications = true, includeInterviews = true } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getCandidateById(
        id as UUID,
        includeApplications === 'true',
        includeInterviews === 'true'
      );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching candidate',
        error: error.message
      });
    }
  };

  /**
   * Update candidate profile
   * PUT /api/v1/hr/recruitment/candidates/:id
   */
  updateCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.updateCandidate(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating candidate',
        error: error.message
      });
    }
  };

  /**
   * Submit job application
   * POST /api/v1/hr/recruitment/applications
   */
  submitJobApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const applicationData = req.body;

      if (!applicationData.candidateId || !applicationData.jobRequisitionId) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID and job requisition ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.submitJobApplication({
        ...applicationData,
        submittedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting job application',
        error: error.message
      });
    }
  };

  /**
   * Get job applications
   * GET /api/v1/hr/recruitment/applications
   */
  getJobApplications = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        candidateId,
        jobRequisitionId,
        stage,
        status,
        organizationId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        candidateId: candidateId as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        stage: stage as string,
        status: status as string,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getJobApplications(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching job applications',
        error: error.message
      });
    }
  };

  /**
   * Update job application stage
   * PUT /api/v1/hr/recruitment/applications/:id/stage
   */
  updateApplicationStage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { stage, comments, rating } = req.body;

      if (!id || !stage) {
        res.status(400).json({
          success: false,
          message: 'Application ID and stage are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.updateApplicationStage(
        id as UUID,
        stage,
        req.user?.id as UUID,
        comments,
        rating
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating application stage',
        error: error.message
      });
    }
  };

  /**
   * Schedule interview
   * POST /api/v1/hr/recruitment/interviews
   */
  scheduleInterview = async (req: Request, res: Response): Promise<void> => {
    try {
      const interviewData = req.body;

      if (!interviewData.applicationId || !interviewData.interviewType || !interviewData.scheduledAt) {
        res.status(400).json({
          success: false,
          message: 'Application ID, interview type, and scheduled time are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.scheduleInterview({
        ...interviewData,
        scheduledBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while scheduling interview',
        error: error.message
      });
    }
  };

  /**
   * Get interviews
   * GET /api/v1/hr/recruitment/interviews
   */
  getInterviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        applicationId,
        candidateId,
        interviewerId,
        status,
        interviewType,
        startDate,
        endDate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        applicationId: applicationId as UUID,
        candidateId: candidateId as UUID,
        interviewerId: interviewerId as UUID,
        status: status as string,
        interviewType: interviewType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getInterviews(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching interviews',
        error: error.message
      });
    }
  };

  /**
   * Update interview
   * PUT /api/v1/hr/recruitment/interviews/:id
   */
  updateInterview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Interview ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.updateInterview(
        id as UUID,
        { ...updateData, updatedBy: req.user?.id }
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating interview',
        error: error.message
      });
    }
  };

  /**
   * Submit interview feedback
   * POST /api/v1/hr/recruitment/interviews/:id/feedback
   */
  submitInterviewFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const feedbackData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Interview ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      if (!feedbackData.overallRating || !feedbackData.recommendation) {
        res.status(400).json({
          success: false,
          message: 'Overall rating and recommendation are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.submitInterviewFeedback(
        id as UUID,
        {
          ...feedbackData,
          submittedBy: req.user?.id
        }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting interview feedback',
        error: error.message
      });
    }
  };

  /**
   * Get interview feedback
   * GET /api/v1/hr/recruitment/interviews/:id/feedback
   */
  getInterviewFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Interview ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getInterviewFeedback(id as UUID);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching interview feedback',
        error: error.message
      });
    }
  };

  /**
   * Generate job offer
   * POST /api/v1/hr/recruitment/offers
   */
  generateJobOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const offerData = req.body;

      if (!offerData.candidateId || !offerData.jobRequisitionId || !offerData.salary) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID, job requisition ID, and salary are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.generateJobOffer({
        ...offerData,
        generatedBy: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating job offer',
        error: error.message
      });
    }
  };

  /**
   * Get job offers
   * GET /api/v1/hr/recruitment/offers
   */
  getJobOffers = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        candidateId,
        jobRequisitionId,
        status,
        organizationId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        candidateId: candidateId as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        status: status as string,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getJobOffers(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching job offers',
        error: error.message
      });
    }
  };

  /**
   * Update job offer status
   * PUT /api/v1/hr/recruitment/offers/:id/status
   */
  updateOfferStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, comments } = req.body;

      if (!id || !status) {
        res.status(400).json({
          success: false,
          message: 'Offer ID and status are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.updateOfferStatus(
        id as UUID,
        status,
        req.user?.id as UUID,
        comments
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating offer status',
        error: error.message
      });
    }
  };

  /**
   * Parse resume with AI
   * POST /api/v1/hr/recruitment/resume/parse
   */
  parseResume = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resumeFile, candidateId } = req.body;

      if (!resumeFile) {
        res.status(400).json({
          success: false,
          message: 'Resume file is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.parseResumeWithAI(
        resumeFile,
        candidateId as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while parsing resume',
        error: error.message
      });
    }
  };

  /**
   * AI-powered candidate scoring
   * POST /api/v1/hr/recruitment/candidates/:id/score
   */
  scoreCandidateWithAI = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { jobRequisitionId, scoringCriteria } = req.body;

      if (!id || !jobRequisitionId) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID and job requisition ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.scoreCandidateWithAI(
        id as UUID,
        jobRequisitionId as UUID,
        scoringCriteria
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while scoring candidate',
        error: error.message
      });
    }
  };

  /**
   * Get candidate recommendations
   * GET /api/v1/hr/recruitment/job-requisitions/:id/candidate-recommendations
   */
  getCandidateRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit = 10, includeExternal = false } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Job requisition ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getCandidateRecommendations(
        id as UUID,
        parseInt(limit as string),
        includeExternal === 'true'
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting candidate recommendations',
        error: error.message
      });
    }
  };

  /**
   * Talent pool management
   * POST /api/v1/hr/recruitment/talent-pool
   */
  addToTalentPool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { candidateId, poolName, tags, notes } = req.body;

      if (!candidateId || !poolName) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID and pool name are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.addToTalentPool(
        candidateId as UUID,
        poolName,
        tags,
        notes,
        req.user?.id as UUID
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding candidate to talent pool',
        error: error.message
      });
    }
  };

  /**
   * Get talent pool candidates
   * GET /api/v1/hr/recruitment/talent-pool
   */
  getTalentPoolCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        poolName,
        skills,
        experience,
        location,
        organizationId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        poolName: poolName as string,
        skills: skills ? (skills as string).split(',') : undefined,
        experience: experience as string,
        location: location as string,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getTalentPoolCandidates(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching talent pool candidates',
        error: error.message
      });
    }
  };

  /**
   * Employee referral program
   * POST /api/v1/hr/recruitment/referrals
   */
  submitEmployeeReferral = async (req: Request, res: Response): Promise<void> => {
    try {
      const referralData = req.body;

      if (!referralData.referredCandidateId || !referralData.jobRequisitionId) {
        res.status(400).json({
          success: false,
          message: 'Referred candidate ID and job requisition ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.submitEmployeeReferral({
        ...referralData,
        referringEmployeeId: req.user?.id
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting employee referral',
        error: error.message
      });
    }
  };

  /**
   * Get employee referrals
   * GET /api/v1/hr/recruitment/referrals
   */
  getEmployeeReferrals = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        referringEmployeeId,
        jobRequisitionId,
        status,
        organizationId,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        referringEmployeeId: referringEmployeeId as UUID || req.user?.id as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        status: status as string,
        organizationId: organizationId as UUID
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getEmployeeReferrals(
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching employee referrals',
        error: error.message
      });
    }
  };

  /**
   * Generate recruitment analytics
   * GET /api/v1/hr/recruitment/analytics
   */
  getRecruitmentAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        analyticsType = 'overview'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        analyticsType: analyticsType as string
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getRecruitmentAnalytics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating recruitment analytics',
        error: error.message
      });
    }
  };

  /**
   * Diversity and inclusion metrics
   * GET /api/v1/hr/recruitment/diversity-metrics
   */
  getDiversityMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        metricType = 'all'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        metricType: metricType as string
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getDiversityMetrics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching diversity metrics',
        error: error.message
      });
    }
  };

  /**
   * Generate hiring funnel report
   * GET /api/v1/hr/recruitment/reports/hiring-funnel
   */
  getHiringFunnelReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        jobRequisitionId,
        startDate,
        endDate
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getHiringFunnelReport(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating hiring funnel report',
        error: error.message
      });
    }
  };

  /**
   * Source effectiveness analysis
   * GET /api/v1/hr/recruitment/reports/source-effectiveness
   */
  getSourceEffectivenessReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        startDate,
        endDate,
        includeConversionRates = true
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeConversionRates: includeConversionRates === 'true'
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getSourceEffectivenessReport(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating source effectiveness report',
        error: error.message
      });
    }
  };

  /**
   * Time-to-hire analysis
   * GET /api/v1/hr/recruitment/reports/time-to-hire
   */
  getTimeToHireReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        jobRequisitionId,
        startDate,
        endDate
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        jobRequisitionId: jobRequisitionId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getTimeToHireReport(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating time-to-hire report',
        error: error.message
      });
    }
  };

  /**
   * Cost-per-hire analysis
   * GET /api/v1/hr/recruitment/reports/cost-per-hire
   */
  getCostPerHireReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        includeBrokenDown = true
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeBrokenDown: includeBrokenDown === 'true'
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getCostPerHireReport(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating cost-per-hire report',
        error: error.message
      });
    }
  };

  /**
   * Quality of hire tracking
   * GET /api/v1/hr/recruitment/reports/quality-of-hire
   */
  getQualityOfHireReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        departmentId,
        startDate,
        endDate,
        includePerformanceData = true
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        departmentId: departmentId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includePerformanceData: includePerformanceData === 'true'
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getQualityOfHireReport(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating quality of hire report',
        error: error.message
      });
    }
  };

  /**
   * Predictive hiring analytics
   * GET /api/v1/hr/recruitment/ai/predictive-analytics
   */
  getPredictiveHiringAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        predictionType = 'success',
        timeFrame = '6m'
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getPredictiveHiringAnalytics(
        organizationId as UUID,
        predictionType as string,
        timeFrame as string
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating predictive hiring analytics',
        error: error.message
      });
    }
  };

  /**
   * Candidate experience feedback
   * POST /api/v1/hr/recruitment/candidate-feedback
   */
  submitCandidateExperienceFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const feedbackData = req.body;

      if (!feedbackData.candidateId || !feedbackData.applicationId) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID and application ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.submitCandidateExperienceFeedback({
        ...feedbackData,
        submittedAt: new Date()
      });

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while submitting candidate experience feedback',
        error: error.message
      });
    }
  };

  /**
   * Get candidate experience metrics
   * GET /api/v1/hr/recruitment/candidate-experience-metrics
   */
  getCandidateExperienceMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        organizationId,
        startDate,
        endDate,
        includeComments = false
      } = req.query;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeComments: includeComments === 'true'
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.getCandidateExperienceMetrics(filters);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching candidate experience metrics',
        error: error.message
      });
    }
  };

  /**
   * Import/Export operations
   * POST /api/v1/hr/recruitment/import
   */
  importRecruitmentData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { file, importType, organizationId } = req.body;

      if (!file || !importType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'File, import type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const result: ServiceResponse<any> = await this.talentAcquisitionService.importRecruitmentData(
        file,
        importType,
        organizationId as UUID,
        req.user?.id as UUID
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while importing recruitment data',
        error: error.message
      });
    }
  };

  /**
   * Export recruitment data
   * GET /api/v1/hr/recruitment/export
   */
  exportRecruitmentData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        format,
        dataType,
        organizationId,
        startDate,
        endDate
      } = req.query;

      if (!format || !dataType || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Format, data type, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const filters = {
        organizationId: organizationId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result: ServiceResponse<any> = await this.talentAcquisitionService.exportRecruitmentData(
        format as string,
        dataType as string,
        filters
      );

      if (result.success && result.data?.fileBuffer) {
        const contentType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="recruitment-${dataType}.${extension}"`);
        res.send(result.data.fileBuffer);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error while exporting recruitment data',
        error: error.message
      });
    }
  };

  /**
   * Health Check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ServiceResponse<any> = await this.talentAcquisitionService.healthCheck();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Talent Acquisition service health check failed',
        error: error.message
      });
    }
  };
}
