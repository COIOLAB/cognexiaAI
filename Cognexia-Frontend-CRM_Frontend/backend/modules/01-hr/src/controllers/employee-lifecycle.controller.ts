// Industry 5.0 ERP Backend - Revolutionary Employee Lifecycle Management Controller
// Surpassing SuccessFactors, SAP HCM, Oracle HCM with AI-powered employee journey management
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Server, Socket } from 'socket.io';

import { EmployeeLifecycleService } from '../services/employee-lifecycle.service';
import { AITalentAnalyticsService } from '../services/ai-talent-analytics.service';
import { OnboardingAutomationService } from '../services/onboarding-automation.service';
import { CareerProgressionService } from '../services/career-progression.service';
import { OffboardingService } from '../services/offboarding.service';
import { HRGuard } from '../guards/hr.guard';

// Comprehensive DTOs for Employee Lifecycle
export class EmployeeDto {
  employeeId?: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    preferredName?: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' | 'OTHER';
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'DOMESTIC_PARTNERSHIP';
    nationality: string;
    citizenship: string[];
    languages: {
      language: string;
      proficiency: 'BASIC' | 'CONVERSATIONAL' | 'BUSINESS' | 'FLUENT' | 'NATIVE';
      certified?: boolean;
    }[];
    profilePhoto?: string;
    personalEmail?: string;
    personalPhone?: string;
  };
  contactInfo: {
    workEmail: string;
    workPhone: string;
    mobilePhone?: string;
    emergencyContacts: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      isPrimary: boolean;
    }[];
    addresses: {
      type: 'HOME' | 'WORK' | 'MAILING' | 'TEMPORARY';
      street1: string;
      street2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isPrimary: boolean;
    }[];
  };
  employmentInfo: {
    hireDate: string;
    originalHireDate?: string;
    rehireDate?: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN' | 'CONSULTANT';
    employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE' | 'SUSPENDED' | 'RETIRED';
    probationEndDate?: string;
    confirmationDate?: string;
    terminationDate?: string;
    terminationReason?: string;
    rehireEligible?: boolean;
    workLocation: {
      locationId: string;
      locationName: string;
      address: string;
      timeZone: string;
      workArrangement: 'OFFICE' | 'REMOTE' | 'HYBRID' | 'FIELD' | 'CLIENT_SITE';
      deskNumber?: string;
      floorPlan?: string;
    };
    reportingStructure: {
      managerId?: string;
      managerName?: string;
      dotLineManagerId?: string;
      hrBusinessPartnerId?: string;
      mentorId?: string;
      directReports?: string[];
    };
  };
  organizationInfo: {
    companyCode: string;
    businessUnit: string;
    department: string;
    division?: string;
    costCenter: string;
    jobTitle: string;
    jobCode: string;
    jobFamily: string;
    jobLevel: string;
    jobGrade: string;
    payGrade: string;
    careerTrack: 'INDIVIDUAL_CONTRIBUTOR' | 'MANAGEMENT' | 'SENIOR_LEADERSHIP' | 'EXECUTIVE' | 'SPECIALIST';
    union?: {
      unionCode: string;
      unionName: string;
      membershipStatus: 'MEMBER' | 'NON_MEMBER' | 'ELIGIBLE';
    };
  };
  compensationInfo: {
    baseSalary: {
      amount: number;
      currency: string;
      frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
      effectiveDate: string;
    };
    variableCompensation: {
      bonusTarget?: number;
      commissionPlan?: string;
      stockOptions?: {
        grantDate: string;
        vestingSchedule: string;
        numberOfShares: number;
        strikePrice: number;
      }[];
      ltip?: {
        programName: string;
        targetValue: number;
        performancePeriod: string;
      }[];
    };
    benefits: {
      healthInsurance?: {
        planType: string;
        enrollmentDate: string;
        dependents: string[];
      };
      retirement?: {
        planType: '401K' | '403B' | 'PENSION' | 'OTHER';
        employeeContribution: number;
        employerMatch: number;
        vestingSchedule: string;
      };
      timeOff?: {
        ptoBalance: number;
        sickLeaveBalance: number;
        vacationBalance: number;
        personalDaysBalance: number;
      };
    };
  };
  skillsAndCompetencies: {
    technicalSkills: {
      skillName: string;
      proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
      certifications?: {
        certificationName: string;
        issuingOrganization: string;
        issueDate: string;
        expirationDate?: string;
        credentialId?: string;
      }[];
      yearsOfExperience: number;
      lastAssessedDate: string;
      selfRating: number;
      managerRating?: number;
      peerRating?: number;
    }[];
    softSkills: {
      skillName: string;
      proficiencyLevel: 'DEVELOPING' | 'PROFICIENT' | 'ADVANCED' | 'EXPERT';
      assessmentMethod: 'SELF' | 'MANAGER' | 'PEER' | '360_FEEDBACK' | 'FORMAL_ASSESSMENT';
      lastAssessedDate: string;
      rating: number;
    }[];
    coreCompetencies: {
      competencyName: string;
      behavioralIndicators: string[];
      currentLevel: number;
      targetLevel: number;
      developmentPlan?: string;
    }[];
  };
  performanceHistory: {
    reviewPeriod: string;
    overallRating: number;
    goals: {
      goalId: string;
      goalDescription: string;
      weightage: number;
      achievement: number;
      rating: number;
    }[];
    competencyRatings: {
      competency: string;
      rating: number;
      feedback: string;
    }[];
    developmentAreas: string[];
    strengths: string[];
    careerAspirations: string[];
    managerFeedback: string;
    employeeFeedback?: string;
  }[];
  learningAndDevelopment: {
    trainingHistory: {
      courseId: string;
      courseName: string;
      provider: string;
      startDate: string;
      completionDate?: string;
      status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
      score?: number;
      certification?: boolean;
    }[];
    learningPaths: {
      pathId: string;
      pathName: string;
      currentProgress: number;
      estimatedCompletion: string;
      recommendedBy: 'MANAGER' | 'HR' | 'AI_SYSTEM' | 'SELF_SELECTED';
    }[];
    skillGaps: {
      skillName: string;
      currentLevel: number;
      requiredLevel: number;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      developmentPlan: string;
    }[];
  };
  complianceAndLegal: {
    backgroundCheckStatus: 'PENDING' | 'CLEARED' | 'FLAGGED' | 'FAILED';
    drugTestStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_REQUIRED';
    securityClearance?: {
      level: string;
      expirationDate: string;
      status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
    };
    visaStatus?: {
      visaType: string;
      expirationDate: string;
      sponsorshipRequired: boolean;
    };
    mandatoryTrainings: {
      trainingName: string;
      completionDate?: string;
      expirationDate: string;
      status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
    }[];
  };
  aiInsights: {
    talentRiskScore: number;
    flightRiskIndicators: string[];
    careerProgressionPrediction: {
      nextLevelTimeline: string;
      probability: number;
      recommendedActions: string[];
    };
    skillRecommendations: {
      skillName: string;
      relevanceScore: number;
      marketDemand: number;
      learningPath: string;
    }[];
    performancePrediction: {
      nextReviewRating: number;
      confidence: number;
      influencingFactors: string[];
    };
    engagementScore: number;
    sentimentAnalysis: {
      overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
      confidenceScore: number;
      keyTopics: string[];
    };
  };
}

export class OnboardingPlanDto {
  planId?: string;
  employeeId: string;
  planTemplate: string;
  startDate: string;
  estimatedCompletionDate: string;
  onboardingBuddy?: {
    employeeId: string;
    name: string;
    role: string;
  };
  checklistItems: {
    itemId: string;
    category: 'DOCUMENTATION' | 'IT_SETUP' | 'WORKSPACE' | 'TRAINING' | 'INTRODUCTIONS' | 'COMPLIANCE';
    description: string;
    owner: 'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE' | 'FACILITY' | 'BUDDY';
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'OVERDUE';
    completedDate?: string;
    completedBy?: string;
    notes?: string;
    dependencies?: string[];
    automationEnabled: boolean;
  }[];
  trainingSchedule: {
    sessionId: string;
    sessionName: string;
    type: 'ORIENTATION' | 'ROLE_SPECIFIC' | 'COMPLIANCE' | 'CULTURAL' | 'TECHNICAL';
    scheduledDate: string;
    duration: number; // in minutes
    location: 'VIRTUAL' | 'IN_PERSON' | 'SELF_PACED' | 'HYBRID';
    trainer?: string;
    materials: string[];
    prerequisites?: string[];
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  }[];
  milestoneCheckins: {
    milestone: '30_DAYS' | '60_DAYS' | '90_DAYS' | '6_MONTHS' | '1_YEAR';
    scheduledDate: string;
    checkpoints: {
      question: string;
      type: 'RATING' | 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO';
      response?: any;
      managerFeedback?: string;
    }[];
    overallRating?: number;
    actionItems?: string[];
    completed: boolean;
  }[];
  integrationMetrics: {
    productivityRampTime: number; // days to reach 75% productivity
    satisfactionScore: number;
    retentionProbability: number;
    engagementLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    culturalFit: number;
    skillGapAnalysis: {
      skillName: string;
      gapSize: number;
      closureTimeline: string;
    }[];
  };
}

export class CareerPathDto {
  pathId?: string;
  employeeId: string;
  currentRole: {
    title: string;
    level: string;
    department: string;
  };
  careerGoals: {
    shortTerm: {
      targetRole: string;
      targetLevel: string;
      timeline: string;
      probability: number;
    };
    mediumTerm: {
      targetRole: string;
      targetLevel: string;
      timeline: string;
      probability: number;
    };
    longTerm: {
      targetRole: string;
      targetLevel: string;
      timeline: string;
      probability: number;
    };
  };
  developmentPlan: {
    skillRequirements: {
      skillName: string;
      currentLevel: number;
      requiredLevel: number;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      developmentActions: {
        action: string;
        type: 'TRAINING' | 'PROJECT' | 'MENTORING' | 'STRETCH_ASSIGNMENT' | 'JOB_ROTATION';
        timeline: string;
        cost: number;
        probability: number;
      }[];
    }[];
    experienceRequirements: {
      experienceType: string;
      currentExperience: number; // in months
      requiredExperience: number; // in months
      gapClosurePlan: string;
    }[];
    certificationRequirements: {
      certificationName: string;
      provider: string;
      estimatedCost: number;
      estimatedDuration: string; // in months
      businessValue: number;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }[];
  };
  mentorship: {
    currentMentor?: {
      employeeId: string;
      name: string;
      role: string;
      expertise: string[];
    };
    mentoringGoals: string[];
    meetingFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
    progress: {
      goal: string;
      completion: number;
      feedback: string;
    }[];
  };
  succession: {
    readinessLevel: 'NOT_READY' | 'READY_IN_2_YEARS' | 'READY_IN_1_YEAR' | 'READY_NOW';
    potentialRoles: {
      roleTitle: string;
      department: string;
      readinessGap: string[];
      probability: number;
    }[];
    emergencyBackup: boolean;
    developmentPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  aiRecommendations: {
    careerMovePredictions: {
      move: string;
      probability: number;
      timeline: string;
      requiredActions: string[];
    }[];
    skillTrendAnalysis: {
      skillName: string;
      marketDemand: 'DECLINING' | 'STABLE' | 'GROWING' | 'HOT';
      relevanceScore: number;
      recommendation: string;
    }[];
    networkingRecommendations: {
      type: 'INTERNAL' | 'EXTERNAL' | 'INDUSTRY';
      suggestions: string[];
      events: string[];
    };
  };
}

export class PerformanceReviewDto {
  reviewId?: string;
  employeeId: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
    type: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'PROJECT_BASED' | 'PROBATIONARY';
  };
  reviewers: {
    reviewerType: 'MANAGER' | 'PEER' | 'DIRECT_REPORT' | 'CUSTOMER' | 'SELF';
    employeeId?: string;
    name: string;
    relationship: string;
    weightage: number;
    completionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  goals: {
    goalId: string;
    goalType: 'INDIVIDUAL' | 'TEAM' | 'ORGANIZATIONAL' | 'DEVELOPMENT';
    description: string;
    category: 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'LEARNING' | 'LEADERSHIP';
    targetMetric: string;
    targetValue: number;
    actualValue?: number;
    weightage: number;
    selfAssessment?: {
      achievement: number;
      rating: number;
      comments: string;
    };
    managerAssessment?: {
      achievement: number;
      rating: number;
      comments: string;
    };
    finalRating?: number;
  }[];
  competencyAssessment: {
    competencyName: string;
    behavioralIndicators: string[];
    selfRating?: number;
    managerRating?: number;
    peerRating?: number;
    finalRating?: number;
    evidence: string[];
    developmentNeed: boolean;
  }[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    managerComments: string;
    employeeComments?: string;
    careerDiscussion: {
      careerAspirations: string[];
      supportNeeded: string[];
      nextSteps: string[];
    };
  };
  developmentPlan: {
    developmentGoals: {
      goal: string;
      timeline: string;
      resources: string[];
      successMetrics: string[];
      manager: string;
    }[];
    trainingRecommendations: string[];
    stretchAssignments: string[];
    mentoring: boolean;
  };
  ratings: {
    overallRating: number;
    goalAchievement: number;
    competencyRating: number;
    potentialRating: number;
    ratingJustification: string;
  };
  calibration: {
    calibrationGroup: string;
    peerComparisons: {
      peerEmployeeId: string;
      relativePerfomance: 'BELOW' | 'SAME' | 'ABOVE';
    }[];
    distributionFit: boolean;
    calibrationNotes: string;
  };
  aiInsights: {
    performanceTrends: {
      trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
      confidence: number;
      contributingFactors: string[];
    };
    biasDetection: {
      potentialBiases: string[];
      ratingAdjustments: number;
      confidence: number;
    };
    retentionRisk: {
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      indicators: string[];
      mitigationActions: string[];
    };
  };
}

@ApiTags('Employee Lifecycle Management')
@Controller('hr/employee-lifecycle')
@WebSocketGateway({
  cors: true,
  path: '/hr-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(HRGuard)
@ApiBearerAuth()
export class EmployeeLifecycleController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EmployeeLifecycleController.name);
  private activeHRSessions = new Map<string, any>();

  constructor(
    private readonly employeeLifecycleService: EmployeeLifecycleService,
    private readonly aiTalentAnalyticsService: AITalentAnalyticsService,
    private readonly onboardingAutomationService: OnboardingAutomationService,
    private readonly careerProgressionService: CareerProgressionService,
    private readonly offboardingService: OffboardingService,
  ) {}

  @Post('employees')
  @ApiOperation({
    summary: 'Create Employee Profile',
    description: 'Create comprehensive employee profile with AI-powered insights and automated workflows',
  })
  @ApiBody({ type: EmployeeDto })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    schema: {
      example: {
        employeeId: 'EMP_2024_001',
        employeeNumber: 'E000001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15'
        },
        employmentInfo: {
          hireDate: '2024-01-15',
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE'
        },
        aiInsights: {
          talentRiskScore: 0.15,
          flightRiskIndicators: ['Limited career progression'],
          engagementScore: 8.5,
          performancePrediction: {
            nextReviewRating: 4.2,
            confidence: 0.89
          }
        },
        onboardingProgress: {
          overallCompletion: 85,
          milestonesMet: 3,
          estimatedCompletion: '2024-02-15'
        }
      }
    }
  })
  async createEmployee(@Body() employeeDto: EmployeeDto) {
    try {
      this.logger.log(`Creating employee: ${employeeDto.personalInfo.firstName} ${employeeDto.personalInfo.lastName}`);
      
      const employee = await this.employeeLifecycleService.createAdvancedEmployee(employeeDto);
      
      // Trigger automated onboarding
      const onboardingPlan = await this.onboardingAutomationService.createPersonalizedOnboardingPlan(employee.employeeId);
      
      // Generate AI insights
      const aiInsights = await this.aiTalentAnalyticsService.generateEmployeeInsights(employee.employeeId);
      
      // Emit real-time update
      this.server.emit('employee-created', {
        employeeId: employee.employeeId,
        name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        department: employee.organizationInfo.department,
        onboardingId: onboardingPlan.planId,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Employee created successfully',
        data: {
          ...employee,
          onboardingPlan,
          aiInsights
        },
      };
    } catch (error) {
      this.logger.error(`Employee creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('onboarding-plans')
  @ApiOperation({
    summary: 'Create Onboarding Plan',
    description: 'Create AI-powered personalized onboarding plan with automated workflows and milestone tracking',
  })
  @ApiBody({ type: OnboardingPlanDto })
  @ApiResponse({
    status: 201,
    description: 'Onboarding plan created successfully'
  })
  async createOnboardingPlan(@Body() onboardingDto: OnboardingPlanDto) {
    try {
      this.logger.log(`Creating onboarding plan for employee: ${onboardingDto.employeeId}`);
      
      const plan = await this.onboardingAutomationService.createAdvancedOnboardingPlan(onboardingDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Onboarding plan created successfully',
        data: plan,
      };
    } catch (error) {
      this.logger.error(`Onboarding plan creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create onboarding plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('career-paths')
  @ApiOperation({
    summary: 'Create Career Path',
    description: 'Create AI-driven career progression path with skill development and succession planning',
  })
  @ApiBody({ type: CareerPathDto })
  @ApiResponse({
    status: 201,
    description: 'Career path created successfully'
  })
  async createCareerPath(@Body() careerPathDto: CareerPathDto) {
    try {
      this.logger.log(`Creating career path for employee: ${careerPathDto.employeeId}`);
      
      const careerPath = await this.careerProgressionService.createAdvancedCareerPath(careerPathDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Career path created successfully',
        data: careerPath,
      };
    } catch (error) {
      this.logger.error(`Career path creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create career path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('performance-reviews')
  @ApiOperation({
    summary: 'Create Performance Review',
    description: 'Create comprehensive performance review with 360-degree feedback and AI bias detection',
  })
  @ApiBody({ type: PerformanceReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Performance review created successfully'
  })
  async createPerformanceReview(@Body() reviewDto: PerformanceReviewDto) {
    try {
      this.logger.log(`Creating performance review for employee: ${reviewDto.employeeId}`);
      
      const review = await this.employeeLifecycleService.createAdvancedPerformanceReview(reviewDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Performance review created successfully',
        data: review,
      };
    } catch (error) {
      this.logger.error(`Performance review creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create performance review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('employees/:id')
  @ApiOperation({
    summary: 'Get Employee Profile',
    description: 'Get comprehensive employee profile with real-time AI insights and analytics',
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee profile retrieved successfully'
  })
  async getEmployee(@Param('id') employeeId: string) {
    try {
      this.logger.log(`Retrieving employee profile: ${employeeId}`);
      
      const employee = await this.employeeLifecycleService.getAdvancedEmployeeProfile(employeeId);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee profile retrieved successfully',
        data: employee,
      };
    } catch (error) {
      this.logger.error(`Employee profile retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve employee profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('talent-analytics')
  @ApiOperation({
    summary: 'Talent Analytics Dashboard',
    description: 'Comprehensive talent analytics with AI insights, predictive modeling, and workforce planning',
  })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Analytics time range' })
  @ApiResponse({
    status: 200,
    description: 'Talent analytics retrieved successfully'
  })
  async getTalentAnalytics(
    @Query('department') department?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      this.logger.log('Generating talent analytics dashboard');
      
      const analytics = await this.aiTalentAnalyticsService.generateTalentAnalyticsDashboard({
        department,
        timeRange: timeRange || 'CURRENT_QUARTER',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Talent analytics generated successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Talent analytics generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate talent analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ai-talent-prediction')
  @ApiOperation({
    summary: 'AI Talent Prediction',
    description: 'AI-powered talent prediction including flight risk, performance forecasting, and career trajectory',
  })
  @ApiResponse({
    status: 200,
    description: 'AI talent prediction completed successfully'
  })
  async performAITalentPrediction(@Body() predictionParams: any) {
    try {
      this.logger.log('Performing AI talent prediction');
      
      const predictions = await this.aiTalentAnalyticsService.performAdvancedTalentPrediction(predictionParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI talent prediction completed successfully',
        data: predictions,
      };
    } catch (error) {
      this.logger.error(`AI talent prediction failed: ${error.message}`);
      throw new HttpException(
        'AI talent prediction failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('employees/:id/documents')
  @ApiOperation({
    summary: 'Upload Employee Document',
    description: 'Upload and process employee documents with AI-powered categorization and data extraction',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully'
  })
  async uploadEmployeeDocument(
    @Param('id') employeeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    try {
      this.logger.log(`Uploading document for employee: ${employeeId}`);
      
      const documentResult = await this.employeeLifecycleService.processEmployeeDocument(
        employeeId,
        file,
        metadata
      );
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Document uploaded and processed successfully',
        data: documentResult,
      };
    } catch (error) {
      this.logger.error(`Document upload failed: ${error.message}`);
      throw new HttpException(
        'Failed to upload document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('org-chart')
  @ApiOperation({
    summary: 'Interactive Org Chart',
    description: 'Real-time interactive organizational chart with AI-powered insights and succession planning',
  })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  @ApiQuery({ name: 'level', required: false, description: 'Organizational level' })
  @ApiResponse({
    status: 200,
    description: 'Organizational chart retrieved successfully'
  })
  async getOrgChart(
    @Query('department') department?: string,
    @Query('level') level?: string,
  ) {
    try {
      this.logger.log('Generating interactive org chart');
      
      const orgChart = await this.employeeLifecycleService.generateInteractiveOrgChart({
        department,
        level,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Organizational chart generated successfully',
        data: orgChart,
      };
    } catch (error) {
      this.logger.error(`Org chart generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate org chart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('succession-planning')
  @ApiOperation({
    summary: 'Succession Planning Analysis',
    description: 'AI-powered succession planning with talent pipeline analysis and readiness assessment',
  })
  @ApiResponse({
    status: 200,
    description: 'Succession planning analysis completed successfully'
  })
  async performSuccessionPlanning(@Body() planningParams: any) {
    try {
      this.logger.log('Performing succession planning analysis');
      
      const successionPlan = await this.aiTalentAnalyticsService.performSuccessionPlanningAnalysis(planningParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Succession planning analysis completed successfully',
        data: successionPlan,
      };
    } catch (error) {
      this.logger.error(`Succession planning analysis failed: ${error.message}`);
      throw new HttpException(
        'Succession planning analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time HR updates
  @SubscribeMessage('subscribe-hr-updates')
  handleHRSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { departments, employees, reviews } = data;
    departments.forEach(dept => client.join(`department_${dept}`));
    employees.forEach(emp => client.join(`employee_${emp}`));
    reviews.forEach(review => client.join(`review_${review}`));
    
    this.activeHRSessions.set(client.id, { departments, employees, reviews });
    
    client.emit('subscription-confirmed', {
      departments,
      employees,
      reviews,
      realTimeTracking: true,
      aiInsights: true,
      performanceMonitoring: true,
      talentAnalytics: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`HR monitoring subscription: ${departments.length} departments, ${employees.length} employees`);
  }

  @SubscribeMessage('onboarding-progress')
  async handleOnboardingProgress(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const progress = await this.onboardingAutomationService.getOnboardingProgressRealTime(data.employeeId);
      
      client.emit('onboarding-update', {
        employeeId: data.employeeId,
        progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time onboarding progress failed: ${error.message}`);
      client.emit('error', { message: 'Onboarding progress update failed' });
    }
  }

  @SubscribeMessage('performance-insights')
  async handlePerformanceInsights(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const insights = await this.aiTalentAnalyticsService.generatePerformanceInsightsRealTime(data);
      
      client.emit('performance-insights-result', {
        requestId: data.requestId,
        insights,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time performance insights failed: ${error.message}`);
      client.emit('error', { message: 'Performance insights generation failed' });
    }
  }

  @SubscribeMessage('talent-risk-alert')
  async handleTalentRiskAlert(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const riskAnalysis = await this.aiTalentAnalyticsService.analyzeTalentRiskRealTime(data);
      
      client.emit('talent-risk-analysis', {
        alertId: data.alertId,
        riskAnalysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time talent risk analysis failed: ${error.message}`);
      client.emit('error', { message: 'Talent risk analysis failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const hrSession = this.activeHRSessions.get(client.id);
    if (hrSession) {
      this.activeHRSessions.delete(client.id);
      this.logger.log(`HR monitoring disconnection: ${hrSession.departments.length} departments`);
    }
  }
}
