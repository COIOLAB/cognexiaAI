// Industry 5.0 ERP Backend - Revolutionary Learning & Development Controller
// Surpassing Cornerstone OnDemand, LinkedIn Learning, Udemy Business with AI-powered personalized learning
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

import { LearningPathService } from '../services/learning-path.service';
import { SkillAssessmentService } from '../services/skill-assessment.service';
import { TrainingManagementService } from '../services/training-management.service';
import { KnowledgeManagementService } from '../services/knowledge-management.service';
import { CertificationManagementService } from '../services/certification-management.service';
import { HRGuard } from '../guards/hr.guard';

// Comprehensive DTOs for Learning & Development
export class LearningPathDto {
  pathId?: string;
  pathName: string;
  pathDescription: string;
  pathType: 'ROLE_BASED' | 'SKILL_BASED' | 'CERTIFICATION' | 'COMPLIANCE' | 'LEADERSHIP' | 'TECHNICAL' | 'CUSTOM';
  targetAudience: {
    roles: string[];
    departments: string[];
    levels: string[];
    skillLevels: string[];
    customCriteria?: string[];
  };
  pathStructure: {
    totalModules: number;
    estimatedDuration: number; // in hours
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    prerequisites: {
      requiredSkills: string[];
      requiredCertifications: string[];
      experienceLevel: number; // in years
    };
    learningObjectives: {
      objective: string;
      measurableOutcome: string;
      assessmentMethod: string;
    }[];
  };
  curriculum: {
    moduleId: string;
    moduleName: string;
    moduleType: 'VIDEO' | 'INTERACTIVE' | 'DOCUMENT' | 'ASSESSMENT' | 'SIMULATION' | 'VR_AR' | 'HANDS_ON' | 'MENTORING';
    duration: number; // in minutes
    content: {
      contentType: string;
      contentUrl: string;
      contentSize?: number;
      interactiveElements?: {
        elementType: string;
        description: string;
      }[];
    };
    learningActivities: {
      activityType: 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'DISCUSSION' | 'PEER_REVIEW' | 'SIMULATION';
      description: string;
      estimatedTime: number;
      passingCriteria: string;
    }[];
    dependencies: string[]; // moduleIds that must be completed first
    optional: boolean;
  }[];
  assessmentStrategy: {
    formativeAssessments: {
      assessmentType: string;
      frequency: string;
      weightage: number;
    }[];
    summativeAssessments: {
      assessmentType: string;
      passingScore: number;
      maxAttempts: number;
      weightage: number;
    }[];
    certification: {
      certificationAvailable: boolean;
      certificationName?: string;
      validityPeriod?: number; // in months
      renewalRequirements?: string[];
    };
  };
  personalization: {
    adaptiveLearning: boolean;
    personalizedContent: boolean;
    learningStyleAdaptation: boolean;
    paceCustomization: boolean;
    difficultyAdjustment: boolean;
  };
  gamification: {
    pointsSystem: {
      pointsPerModule: number;
      bonusPoints: {
        criteria: string;
        points: number;
      }[];
    };
    badges: {
      badgeName: string;
      criteria: string;
      iconUrl: string;
    }[];
    leaderboards: boolean;
    achievements: {
      achievementName: string;
      description: string;
      unlockCriteria: string;
    }[];
  };
  socialLearning: {
    discussions: boolean;
    peerReviews: boolean;
    studyGroups: boolean;
    mentoring: {
      mentorAssignment: boolean;
      mentorCriteria: string[];
    };
    collaboration: {
      groupProjects: boolean;
      knowledgeSharing: boolean;
    };
  };
  aiFeatures: {
    contentRecommendations: boolean;
    learningPathOptimization: boolean;
    performancePrediction: boolean;
    dropoutRiskPrediction: boolean;
    personalizedFeedback: boolean;
    intelligentTutoring: boolean;
  };
  analytics: {
    learnerProgress: {
      trackingMetrics: string[];
      reportingFrequency: string;
    };
    effectivenessMetrics: {
      knowledgeRetention: boolean;
      skillImprovement: boolean;
      behaviorChange: boolean;
      businessImpact: boolean;
    };
    engagementMetrics: {
      timeSpent: boolean;
      interactionRate: boolean;
      completionRate: boolean;
      satisfactionScore: boolean;
    };
  };
}

export class SkillAssessmentDto {
  assessmentId?: string;
  assessmentName: string;
  assessmentType: 'SELF_ASSESSMENT' | 'MANAGER_ASSESSMENT' | 'PEER_ASSESSMENT' | '360_FEEDBACK' | 'TECHNICAL_TEST' | 'BEHAVIORAL_ASSESSMENT' | 'COMPETENCY_EVALUATION';
  skillDomain: 'TECHNICAL' | 'SOFT_SKILLS' | 'LEADERSHIP' | 'DOMAIN_EXPERTISE' | 'DIGITAL_LITERACY' | 'COMMUNICATION' | 'PROBLEM_SOLVING';
  targetEmployees: {
    employeeIds: string[];
    roles: string[];
    departments: string[];
    levels: string[];
    includeNewHires: boolean;
  };
  assessmentStructure: {
    totalQuestions: number;
    estimatedDuration: number; // in minutes
    questionTypes: {
      multipleChoice: number;
      scenario: number;
      practical: number;
      behavioral: number;
      codeSubmission: number;
      presentation: number;
    };
    difficultyDistribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
      expert: number;
    };
  };
  skillsEvaluated: {
    skillName: string;
    skillCategory: string;
    weightage: number;
    proficiencyLevels: {
      level: number;
      description: string;
      indicators: string[];
    }[];
    assessmentCriteria: {
      criterion: string;
      measurableIndicator: string;
      scoringRubric: string;
    }[];
  }[];
  assessmentQuestions: {
    questionId: string;
    questionType: string;
    questionText: string;
    skillsTested: string[];
    difficultyLevel: string;
    expectedAnswer?: string;
    scoringCriteria: {
      excellent: string;
      good: string;
      satisfactory: string;
      needsImprovement: string;
    };
    timeLimit?: number; // in minutes
    resources?: string[];
  }[];
  scoringModel: {
    scoringMethod: 'WEIGHTED_AVERAGE' | 'COMPETENCY_BASED' | 'ADAPTIVE' | 'AI_ENHANCED';
    passingScore: number;
    proficiencyThresholds: {
      beginner: { min: number; max: number };
      intermediate: { min: number; max: number };
      advanced: { min: number; max: number };
      expert: { min: number; max: number };
    };
    calibration: {
      peerComparison: boolean;
      industryBenchmarking: boolean;
      roleBasedNorms: boolean;
    };
  };
  adaptiveFeatures: {
    adaptiveQuestioning: boolean;
    difficultyAdjustment: boolean;
    personalizedFeedback: boolean;
    realTimeHints: boolean;
  };
  aiEnhancements: {
    naturalLanguageProcessing: boolean;
    sentimentAnalysis: boolean;
    responsePatternAnalysis: boolean;
    cheatingDetection: boolean;
    performancePrediction: boolean;
    skillGapPrediction: boolean;
  };
  reportingAndAnalytics: {
    individualReports: {
      skillProfile: boolean;
      strengthsWeaknesses: boolean;
      developmentRecommendations: boolean;
      careerPathGuidance: boolean;
    };
    managerReports: {
      teamSkillMap: boolean;
      skillGapAnalysis: boolean;
      trainingRecommendations: boolean;
      successionPlanning: boolean;
    };
    organizationalReports: {
      skillInventory: boolean;
      skillTrends: boolean;
      competencyBenchmarking: boolean;
      talentMapping: boolean;
    };
  };
}

export class TrainingProgramDto {
  programId?: string;
  programName: string;
  programType: 'INSTRUCTOR_LED' | 'SELF_PACED' | 'BLENDED' | 'VIRTUAL' | 'ON_THE_JOB' | 'MICROLEARNING' | 'IMMERSIVE_VR' | 'SIMULATION';
  programCategory: 'TECHNICAL' | 'SOFT_SKILLS' | 'LEADERSHIP' | 'COMPLIANCE' | 'ORIENTATION' | 'SAFETY' | 'PRODUCT' | 'PROCESS' | 'CUSTOM';
  businessObjectives: {
    primaryObjective: string;
    successMetrics: {
      metric: string;
      targetValue: number;
      measurementMethod: string;
    }[];
    alignmentToStrategy: string;
    expectedROI: number;
  };
  targetAudience: {
    eligibilityCriteria: {
      roles: string[];
      departments: string[];
      experienceLevel: string;
      prerequisites: string[];
    };
    capacity: {
      minParticipants: number;
      maxParticipants: number;
      optimalSize: number;
    };
    mandatory: boolean;
  };
  contentDesign: {
    learningObjectives: {
      objective: string;
      bloomsLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
      assessmentMethod: string;
    }[];
    modules: {
      moduleId: string;
      title: string;
      duration: number;
      deliveryMethod: string;
      content: {
        materials: {
          type: string;
          title: string;
          url: string;
          description: string;
        }[];
        activities: {
          activityType: string;
          description: string;
          duration: number;
          groupSize?: number;
        }[];
        assessments: {
          type: string;
          passingCriteria: string;
          weightage: number;
        }[];
      };
    }[];
    practicalComponents: {
      handsOnExercises: boolean;
      rolePlay: boolean;
      caseStudies: boolean;
      simulation: boolean;
      realProjectWork: boolean;
    };
  };
  deliverySchedule: {
    programDuration: number; // in days
    sessionSchedule: {
      sessionId: string;
      sessionTitle: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      instructor: string;
      capacity: number;
      deliveryMode: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
    }[];
    flexibility: {
      selfPacedOptions: boolean;
      makeUpSessions: boolean;
      flexibleScheduling: boolean;
    };
  };
  instructorDetails: {
    internalInstructors: {
      employeeId: string;
      name: string;
      expertise: string[];
      certifications: string[];
      rating: number;
    }[];
    externalInstructors: {
      name: string;
      organization: string;
      expertise: string[];
      certifications: string[];
      hourlyRate: number;
      rating: number;
    }[];
    instructorRequirements: {
      minimumExperience: number;
      requiredCertifications: string[];
      preferredBackground: string[];
    };
  };
  assessmentAndCertification: {
    assessmentStrategy: {
      formativeAssessments: string[];
      summativeAssessments: string[];
      practicalEvaluations: string[];
    };
    passingCriteria: {
      overallScore: number;
      moduleMinimums: boolean;
      attendanceRequirement: number;
      participationRequirement: number;
    };
    certification: {
      certificateIssued: boolean;
      certificateName: string;
      validityPeriod: number;
      renewalRequirements: string[];
      accreditingBody?: string;
    };
  };
  technologyRequirements: {
    lmsIntegration: boolean;
    virtualClassroomTools: string[];
    mobileCompatibility: boolean;
    bandwidthRequirements: string;
    deviceRequirements: string[];
    softwareRequirements: string[];
  };
  costStructure: {
    developmentCost: number;
    deliveryCostPerSession: number;
    instructorCosts: number;
    materialCosts: number;
    technologyCosts: number;
    facilityCosts: number;
    totalCostPerParticipant: number;
  };
  qualityAssurance: {
    contentReview: {
      subjectMatterExperts: string[];
      reviewCriteria: string[];
      approvalProcess: string;
    };
    pilotTesting: {
      pilotRequired: boolean;
      pilotSize: number;
      feedbackCollection: string[];
    };
    continuousImprovement: {
      feedbackMechanisms: string[];
      updateFrequency: string;
      versionControl: boolean;
    };
  };
  aiEnhancements: {
    contentPersonalization: boolean;
    adaptiveLearning: boolean;
    intelligentRecommendations: boolean;
    realTimeFeedback: boolean;
    performancePrediction: boolean;
    engagementOptimization: boolean;
  };
}

@ApiTags('Learning & Development Management')
@Controller('hr/learning-development')
@WebSocketGateway({
  cors: true,
  path: '/learning-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(HRGuard)
@ApiBearerAuth()
export class LearningDevelopmentController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LearningDevelopmentController.name);
  private activeLearningSession = new Map<string, any>();

  constructor(
    private readonly learningPathService: LearningPathService,
    private readonly skillAssessmentService: SkillAssessmentService,
    private readonly trainingManagementService: TrainingManagementService,
    private readonly knowledgeManagementService: KnowledgeManagementService,
    private readonly certificationManagementService: CertificationManagementService,
  ) {}

  @Post('learning-paths')
  @ApiOperation({
    summary: 'Create Learning Path',
    description: 'Create AI-powered personalized learning path with adaptive content and gamification',
  })
  @ApiBody({ type: LearningPathDto })
  @ApiResponse({
    status: 201,
    description: 'Learning path created successfully',
    schema: {
      example: {
        pathId: 'LP_2024_001',
        pathName: 'Full Stack Development Mastery',
        pathType: 'TECHNICAL',
        totalModules: 12,
        estimatedDuration: 120,
        difficultyLevel: 'INTERMEDIATE',
        personalization: {
          adaptiveLearning: true,
          personalizedContent: true,
          learningStyleAdaptation: true
        },
        aiFeatures: {
          contentRecommendations: true,
          learningPathOptimization: true,
          performancePrediction: true,
          intelligentTutoring: true
        },
        enrollmentStats: {
          currentEnrollments: 45,
          completionRate: 87.3,
          averageRating: 4.6
        }
      }
    }
  })
  async createLearningPath(@Body() learningPathDto: LearningPathDto) {
    try {
      this.logger.log(`Creating learning path: ${learningPathDto.pathName}`);
      
      const learningPath = await this.learningPathService.createAdvancedLearningPath(learningPathDto);
      
      // Emit real-time update
      this.server.emit('learning-path-created', {
        pathId: learningPath.pathId,
        pathName: learningPath.pathName,
        pathType: learningPath.pathType,
        totalModules: learningPath.pathStructure.totalModules,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Learning path created successfully',
        data: learningPath,
      };
    } catch (error) {
      this.logger.error(`Learning path creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('skill-assessments')
  @ApiOperation({
    summary: 'Create Skill Assessment',
    description: 'Create comprehensive skill assessment with AI-powered adaptive questioning and bias detection',
  })
  @ApiBody({ type: SkillAssessmentDto })
  @ApiResponse({
    status: 201,
    description: 'Skill assessment created successfully'
  })
  async createSkillAssessment(@Body() assessmentDto: SkillAssessmentDto) {
    try {
      this.logger.log(`Creating skill assessment: ${assessmentDto.assessmentName}`);
      
      const assessment = await this.skillAssessmentService.createAdvancedAssessment(assessmentDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Skill assessment created successfully',
        data: assessment,
      };
    } catch (error) {
      this.logger.error(`Skill assessment creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create skill assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('training-programs')
  @ApiOperation({
    summary: 'Create Training Program',
    description: 'Create comprehensive training program with multi-modal delivery and AI-enhanced content',
  })
  @ApiBody({ type: TrainingProgramDto })
  @ApiResponse({
    status: 201,
    description: 'Training program created successfully'
  })
  async createTrainingProgram(@Body() trainingDto: TrainingProgramDto) {
    try {
      this.logger.log(`Creating training program: ${trainingDto.programName}`);
      
      const program = await this.trainingManagementService.createAdvancedTrainingProgram(trainingDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Training program created successfully',
        data: program,
      };
    } catch (error) {
      this.logger.error(`Training program creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create training program',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('learning-analytics')
  @ApiOperation({
    summary: 'Learning Analytics Dashboard',
    description: 'Comprehensive learning analytics with AI insights, skill gap analysis, and ROI measurement',
  })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Employee ID filter' })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Analytics time range' })
  @ApiResponse({
    status: 200,
    description: 'Learning analytics retrieved successfully'
  })
  async getLearningAnalytics(
    @Query('employeeId') employeeId?: string,
    @Query('department') department?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      this.logger.log('Generating learning analytics dashboard');
      
      const analytics = await this.learningPathService.generateLearningAnalyticsDashboard({
        employeeId,
        department,
        timeRange: timeRange || 'CURRENT_QUARTER',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Learning analytics generated successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Learning analytics generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate learning analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ai-learning-recommendation')
  @ApiOperation({
    summary: 'AI Learning Recommendation',
    description: 'Personalized AI-powered learning recommendations based on skill gaps, career goals, and performance',
  })
  @ApiResponse({
    status: 200,
    description: 'AI learning recommendations generated successfully'
  })
  async generateAILearningRecommendation(@Body() recommendationParams: any) {
    try {
      this.logger.log('Generating AI learning recommendations');
      
      const recommendations = await this.learningPathService.generateAILearningRecommendations(recommendationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI learning recommendations generated successfully',
        data: recommendations,
      };
    } catch (error) {
      this.logger.error(`AI learning recommendation failed: ${error.message}`);
      throw new HttpException(
        'AI learning recommendation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('skill-gap-analysis')
  @ApiOperation({
    summary: 'Skill Gap Analysis',
    description: 'Comprehensive skill gap analysis with AI-powered insights and development recommendations',
  })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  @ApiQuery({ name: 'role', required: false, description: 'Role filter' })
  @ApiResponse({
    status: 200,
    description: 'Skill gap analysis completed successfully'
  })
  async performSkillGapAnalysis(
    @Query('department') department?: string,
    @Query('role') role?: string,
  ) {
    try {
      this.logger.log('Performing skill gap analysis');
      
      const analysis = await this.skillAssessmentService.performAdvancedSkillGapAnalysis({
        department,
        role,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Skill gap analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Skill gap analysis failed: ${error.message}`);
      throw new HttpException(
        'Failed to perform skill gap analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('learning-roi-analysis')
  @ApiOperation({
    summary: 'Learning ROI Analysis',
    description: 'Comprehensive learning ROI analysis with business impact measurement and predictive insights',
  })
  @ApiQuery({ name: 'programId', required: false, description: 'Training program filter' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Analysis time range' })
  @ApiResponse({
    status: 200,
    description: 'Learning ROI analysis completed successfully'
  })
  async getLearningROIAnalysis(
    @Query('programId') programId?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      this.logger.log('Generating learning ROI analysis');
      
      const roiAnalysis = await this.trainingManagementService.generateLearningROIAnalysis({
        programId,
        timeRange: timeRange || 'CURRENT_YEAR',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Learning ROI analysis completed successfully',
        data: roiAnalysis,
      };
    } catch (error) {
      this.logger.error(`Learning ROI analysis failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate learning ROI analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('adaptive-learning-optimization')
  @ApiOperation({
    summary: 'Adaptive Learning Optimization',
    description: 'AI-powered adaptive learning optimization based on learning patterns and performance data',
  })
  @ApiResponse({
    status: 200,
    description: 'Adaptive learning optimization completed successfully'
  })
  async performAdaptiveLearningOptimization(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing adaptive learning optimization');
      
      const optimization = await this.learningPathService.performAdaptiveLearningOptimization(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Adaptive learning optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Adaptive learning optimization failed: ${error.message}`);
      throw new HttpException(
        'Adaptive learning optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time learning updates
  @SubscribeMessage('subscribe-learning-updates')
  handleLearningSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { learningPaths, employees, assessments, programs } = data;
    learningPaths.forEach(path => client.join(`learning_path_${path}`));
    employees.forEach(emp => client.join(`employee_learning_${emp}`));
    assessments.forEach(assessment => client.join(`assessment_${assessment}`));
    programs.forEach(program => client.join(`program_${program}`));
    
    this.activeLearningSession.set(client.id, { learningPaths, employees, assessments, programs });
    
    client.emit('subscription-confirmed', {
      learningPaths,
      employees,
      assessments,
      programs,
      adaptiveLearning: true,
      aiRecommendations: true,
      realTimeProgress: true,
      personalizedContent: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Learning monitoring subscription: ${learningPaths.length} paths, ${employees.length} employees`);
  }

  @SubscribeMessage('learning-progress-update')
  async handleLearningProgressUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const progress = await this.learningPathService.getLearningProgressRealTime(data.employeeId, data.pathId);
      
      client.emit('learning-progress-updated', {
        employeeId: data.employeeId,
        pathId: data.pathId,
        progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time learning progress update failed: ${error.message}`);
      client.emit('error', { message: 'Learning progress update failed' });
    }
  }

  @SubscribeMessage('skill-assessment-completion')
  async handleSkillAssessmentCompletion(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const results = await this.skillAssessmentService.processAssessmentCompletionRealTime(data);
      
      client.emit('assessment-results', {
        assessmentId: data.assessmentId,
        employeeId: data.employeeId,
        results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time skill assessment completion failed: ${error.message}`);
      client.emit('error', { message: 'Skill assessment completion processing failed' });
    }
  }

  @SubscribeMessage('ai-learning-insight')
  async handleAILearningInsight(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const insights = await this.learningPathService.generateAILearningInsightsRealTime(data);
      
      client.emit('learning-insights', {
        requestId: data.requestId,
        insights,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time AI learning insight failed: ${error.message}`);
      client.emit('error', { message: 'AI learning insight generation failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const learningSession = this.activeLearningSession.get(client.id);
    if (learningSession) {
      this.activeLearningSession.delete(client.id);
      this.logger.log(`Learning monitoring disconnection: ${learningSession.learningPaths.length} paths`);
    }
  }
}
