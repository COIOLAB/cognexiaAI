import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ManufacturingMetaverseARVRService } from '../../services/ManufacturingMetaverseARVRService';
import { ProductionOrder } from '../../entities/ProductionOrder';
import { WorkCenter } from '../../entities/WorkCenter';
import { OperationLog } from '../../entities/OperationLog';
import { Robotics } from '../../entities/Robotics';
import { repositoryMockFactory } from '../mocks/manufacturing.mocks';
import { MockType } from '../types/mock.type';

describe('ManufacturingMetaverseARVRService', () => {
  let service: ManufacturingMetaverseARVRService;
  let productionOrderRepository: MockType<Repository<ProductionOrder>>;
  let workCenterRepository: MockType<Repository<WorkCenter>>;
  let operationLogRepository: MockType<Repository<OperationLog>>;
  let roboticsRepository: MockType<Repository<Robotics>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // Mock test data
  const mockMetaverseExperienceRequest = {
    sessionId: 'mvs-001',
    userId: 'user-001',
    experienceType: 'virtual_factory_tour' as const,
    deviceType: 'vr_headset' as const,
    immersionLevel: 'full_vr' as const,
    manufacturingContext: {
      facilityId: 'facility-001',
      productionLines: ['pl-001', 'pl-002'],
      equipmentSystems: [
        { id: 'eq-001', type: 'cnc_machine', status: 'operational' },
        { id: 'eq-002', type: 'robot_arm', status: 'maintenance' }
      ],
      processingAreas: [
        { id: 'area-001', name: 'Assembly Zone', capacity: 100 },
        { id: 'area-002', name: 'Quality Control', capacity: 50 }
      ],
      safetyZones: [
        { id: 'safety-001', type: 'restricted_access', level: 'high' }
      ],
      realTimeDataSources: [
        { id: 'sensor-001', type: 'temperature', frequency: 1000 }
      ],
      digitalTwinAssets: [
        { id: 'dt-001', assetType: 'production_line', status: 'active' }
      ],
      collaborativeSpaces: [
        { id: 'collab-001', type: 'design_review', capacity: 8 }
      ],
      trainingScenarios: [
        { id: 'training-001', type: 'safety_procedure', difficulty: 'basic' }
      ]
    },
    participantProfiles: [
      {
        id: 'participant-001',
        role: 'operator',
        experienceLevel: 'intermediate',
        certifications: ['safety', 'equipment_operation']
      }
    ],
    experienceGoals: [
      { type: 'training', objective: 'safety_awareness', targetScore: 85 },
      { type: 'orientation', objective: 'facility_familiarization', targetScore: 90 }
    ],
    interactionCapabilities: [
      { type: 'gesture', enabled: true },
      { type: 'voice', enabled: true },
      { type: 'haptic', enabled: false }
    ],
    environmentSettings: {
      renderQuality: 'high',
      physicsAccuracy: 'medium',
      audioSpatial: true,
      lightingRealistic: true,
      weatherSimulation: false
    }
  };

  const mockARMaintenanceRequest = {
    maintenanceId: 'maint-001',
    equipmentId: 'eq-001',
    maintenanceType: 'preventive' as const,
    technicianProfile: {
      id: 'tech-001',
      name: 'John Doe',
      certifications: ['mechanical', 'electrical'],
      experienceYears: 5,
      specializations: ['cnc_machines', 'robotics']
    },
    arDeviceCapabilities: {
      displayResolution: '2160x1200',
      fieldOfView: 110,
      handTracking: true,
      eyeTracking: false,
      spatialMapping: true,
      markerDetection: true
    },
    maintenanceInstructions: [
      {
        step: 1,
        instruction: 'Power down the equipment',
        estimatedTime: 300,
        safetyWarnings: ['High voltage present'],
        requiredTools: ['multimeter']
      },
      {
        step: 2,
        instruction: 'Remove access panel',
        estimatedTime: 600,
        safetyWarnings: ['Sharp edges'],
        requiredTools: ['screwdriver_set']
      }
    ],
    safetyRequirements: [
      { type: 'ppe', item: 'safety_glasses', required: true },
      { type: 'ppe', item: 'gloves', required: true },
      { type: 'lockout', procedure: 'loto_001', required: true }
    ],
    requiredTools: [
      { id: 'tool-001', name: 'Digital Multimeter', tracked: true },
      { id: 'tool-002', name: 'Screwdriver Set', tracked: false }
    ],
    expertiseLevel: 'intermediate' as const,
    remoteExpertSupport: true
  };

  const mockVRTrainingRequest = {
    trainingId: 'train-001',
    trainingProgram: {
      id: 'program-001',
      name: 'CNC Machine Operation',
      version: '2.1',
      duration: 7200, // 2 hours
      modules: [
        { id: 'mod-001', name: 'Safety Procedures', duration: 1800 },
        { id: 'mod-002', name: 'Equipment Operation', duration: 3600 },
        { id: 'mod-003', name: 'Quality Control', duration: 1800 }
      ]
    },
    traineeProfiles: [
      {
        id: 'trainee-001',
        name: 'Alice Smith',
        role: 'machine_operator',
        currentSkillLevel: 'novice',
        learningStyle: 'visual',
        previousExperience: []
      }
    ],
    learningObjectives: [
      {
        objective: 'safety_compliance',
        targetProficiency: 95,
        assessmentMethod: 'simulation',
        criticalSkill: true
      },
      {
        objective: 'operation_efficiency',
        targetProficiency: 80,
        assessmentMethod: 'performance',
        criticalSkill: false
      }
    ],
    skillAssessment: {
      preTrainingScore: 45,
      targetScore: 85,
      assessmentCriteria: [
        'safety_awareness',
        'equipment_knowledge',
        'process_understanding'
      ]
    },
    scenarioComplexity: 'intermediate' as const,
    simulationFidelity: 'high' as const,
    hapticFeedbackEnabled: true,
    multiUserCollaboration: false,
    performanceTracking: true
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturingMetaverseARVRService,
        {
          provide: getRepositoryToken(ProductionOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(WorkCenter),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(OperationLog),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Robotics),
          useFactory: repositoryMockFactory,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
            removeListener: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ManufacturingMetaverseARVRService>(ManufacturingMetaverseARVRService);
    productionOrderRepository = module.get(getRepositoryToken(ProductionOrder));
    workCenterRepository = module.get(getRepositoryToken(WorkCenter));
    operationLogRepository = module.get(getRepositoryToken(OperationLog));
    roboticsRepository = module.get(getRepositoryToken(Robotics));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2) as jest.Mocked<EventEmitter2>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize metaverse systems on construction', () => {
      expect(service).toBeTruthy();
      // System initialization is called in constructor
    });

    it('should have proper logger configuration', () => {
      expect(service['logger']).toBeDefined();
      expect(service['logger']['context']).toBe('ManufacturingMetaverseARVRService');
    });
  });

  describe('Metaverse Experience Management', () => {
    describe('createImmersiveExperience', () => {
      it('should create virtual factory tour experience successfully', async () => {
        // Mock repository responses
        workCenterRepository.find.mockResolvedValue([
          { id: 'wc-001', name: 'Assembly Line 1', type: 'assembly', status: 'active' }
        ]);
        productionOrderRepository.find.mockResolvedValue([
          { id: 'po-001', orderNumber: 'PO-001', status: 'in_progress' }
        ]);

        const result = await service.createImmersiveExperience(mockMetaverseExperienceRequest);

        expect(result).toBeDefined();
        expect(result.sessionId).toBe(mockMetaverseExperienceRequest.sessionId);
        expect(result.virtualEnvironment).toBeDefined();
        expect(result.immersiveElements).toBeArray();
        expect(result.performanceMetrics).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith('metaverse.experience.created', expect.any(Object));
      });

      it('should handle AR maintenance experience creation', async () => {
        const arRequest = { ...mockMetaverseExperienceRequest, experienceType: 'ar_maintenance' as const };
        
        workCenterRepository.findOne.mockResolvedValue({
          id: 'wc-001',
          equipment: [{ id: 'eq-001', type: 'cnc_machine', status: 'operational' }]
        });

        const result = await service.createImmersiveExperience(arRequest);

        expect(result.virtualEnvironment.experienceType).toBe('ar_maintenance');
        expect(result.immersiveElements).toContain(
          expect.objectContaining({ type: 'ar_overlay' })
        );
      });

      it('should handle VR training experience creation', async () => {
        const vrRequest = { ...mockMetaverseExperienceRequest, experienceType: 'vr_training' as const };

        const result = await service.createImmersiveExperience(vrRequest);

        expect(result.virtualEnvironment.experienceType).toBe('vr_training');
        expect(result.learningOutcomes).toBeDefined();
        expect(result.performanceMetrics.trainingMetrics).toBeDefined();
      });

      it('should validate device compatibility', async () => {
        const incompatibleRequest = {
          ...mockMetaverseExperienceRequest,
          deviceType: 'mobile_device' as const,
          immersionLevel: 'full_vr' as const // Incompatible combination
        };

        await expect(service.createImmersiveExperience(incompatibleRequest))
          .rejects.toThrow(BadRequestException);
      });

      it('should handle missing manufacturing context', async () => {
        const invalidRequest = {
          ...mockMetaverseExperienceRequest,
          manufacturingContext: null
        };

        await expect(service.createImmersiveExperience(invalidRequest))
          .rejects.toThrow(BadRequestException);
      });

      it('should validate user permissions for experience type', async () => {
        const restrictedRequest = {
          ...mockMetaverseExperienceRequest,
          experienceType: 'remote_operation' as const,
          participantProfiles: [
            { ...mockMetaverseExperienceRequest.participantProfiles[0], role: 'visitor' }
          ]
        };

        await expect(service.createImmersiveExperience(restrictedRequest))
          .rejects.toThrow('Insufficient permissions for remote operation experience');
      });
    });

    describe('manageVirtualEnvironment', () => {
      it('should create and configure virtual manufacturing environment', async () => {
        const environmentConfig = {
          facilityLayout: 'automotive_assembly',
          realTimeDataIntegration: true,
          physicsSimulation: true,
          collaborativeFeatures: true
        };

        const result = await service.manageVirtualEnvironment('session-001', environmentConfig);

        expect(result).toBeDefined();
        expect(result.environment).toBeDefined();
        expect(result.environment.realTimeDataStreams).toBeArray();
        expect(result.collaborationCapabilities).toBeDefined();
      });

      it('should update existing virtual environment', async () => {
        // First create environment
        await service.manageVirtualEnvironment('session-001', { facilityLayout: 'basic' });

        // Then update it
        const updateConfig = {
          facilityLayout: 'advanced',
          weatherEffects: true
        };

        const result = await service.manageVirtualEnvironment('session-001', updateConfig);

        expect(result.environment.facilityLayout).toBe('advanced');
        expect(result.environment.weatherEffects).toBe(true);
      });

      it('should handle invalid session ID', async () => {
        await expect(service.manageVirtualEnvironment('invalid-session', {}))
          .rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('AR Maintenance Guidance', () => {
    describe('provideARMaintenanceGuidance', () => {
      it('should provide comprehensive AR maintenance guidance', async () => {
        // Mock equipment data
        roboticsRepository.findOne.mockResolvedValue({
          id: 'eq-001',
          type: 'cnc_machine',
          model: 'XYZ-2000',
          specifications: { power: '15kW', dimensions: '2x3x1.5m' },
          maintenanceHistory: []
        });

        const result = await service.provideARMaintenanceGuidance(mockARMaintenanceRequest);

        expect(result).toBeDefined();
        expect(result.maintenanceId).toBe(mockARMaintenanceRequest.maintenanceId);
        expect(result.arGuidanceSystem).toBeDefined();
        expect(result.realTimeInstructions).toBeArray();
        expect(result.spatialMapping).toBeDefined();
        expect(result.objectRecognition).toBeDefined();
        expect(result.safetyMonitoring).toBeDefined();
      });

      it('should provide step-by-step AR instructions', async () => {
        roboticsRepository.findOne.mockResolvedValue({
          id: 'eq-001',
          maintenanceProcedures: mockARMaintenanceRequest.maintenanceInstructions
        });

        const result = await service.provideARMaintenanceGuidance(mockARMaintenanceRequest);

        expect(result.realTimeInstructions).toHaveLength(
          mockARMaintenanceRequest.maintenanceInstructions.length
        );
        expect(result.realTimeInstructions[0]).toMatchObject({
          step: 1,
          arVisualization: expect.any(Object),
          safetyHighlights: expect.any(Array)
        });
      });

      it('should track maintenance tools in AR', async () => {
        roboticsRepository.findOne.mockResolvedValue({ id: 'eq-001' });

        const result = await service.provideARMaintenanceGuidance(mockARMaintenanceRequest);

        expect(result.toolTracking).toBeDefined();
        expect(result.toolTracking.trackedTools).toBeArray();
        expect(result.toolTracking.toolValidation).toBeDefined();
      });

      it('should provide remote expert assistance integration', async () => {
        const requestWithExpert = { ...mockARMaintenanceRequest, remoteExpertSupport: true };
        roboticsRepository.findOne.mockResolvedValue({ id: 'eq-001' });

        const result = await service.provideARMaintenanceGuidance(requestWithExpert);

        expect(result.expertRemoteAssistance).toBeDefined();
        expect(result.expertRemoteAssistance.sessionActive).toBe(true);
        expect(result.expertRemoteAssistance.communicationChannels).toBeArray();
      });

      it('should monitor safety in real-time', async () => {
        roboticsRepository.findOne.mockResolvedValue({ id: 'eq-001' });

        const result = await service.provideARMaintenanceGuidance(mockARMaintenanceRequest);

        expect(result.safetyMonitoring).toBeDefined();
        expect(result.safetyMonitoring.ppeDetection).toBeDefined();
        expect(result.safetyMonitoring.hazardDetection).toBeDefined();
        expect(result.safetyMonitoring.complianceTracking).toBeDefined();
      });

      it('should handle equipment not found', async () => {
        roboticsRepository.findOne.mockResolvedValue(null);

        await expect(service.provideARMaintenanceGuidance(mockARMaintenanceRequest))
          .rejects.toThrow(NotFoundException);
      });

      it('should validate technician expertise level', async () => {
        const noviceRequest = { ...mockARMaintenanceRequest, expertiseLevel: 'novice' as const };
        roboticsRepository.findOne.mockResolvedValue({
          id: 'eq-001',
          requiredExpertiseLevel: 'expert'
        });

        const result = await service.provideARMaintenanceGuidance(noviceRequest);

        expect(result.arGuidanceSystem.enhancedSupport).toBe(true);
        expect(result.realTimeInstructions[0].detailLevel).toBe('comprehensive');
      });
    });

    describe('recognizeEquipmentAR', () => {
      it('should recognize equipment using AR markers', async () => {
        const recognitionData = {
          cameraFeed: 'base64_image_data',
          markerDetection: true,
          spatialContext: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
        };

        const result = await service.recognizeEquipmentAR('eq-001', recognitionData);

        expect(result).toBeDefined();
        expect(result.equipmentIdentified).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.boundingBox).toBeDefined();
        expect(result.spatialAnchors).toBeArray();
      });

      it('should handle low confidence recognition', async () => {
        const poorQualityData = {
          cameraFeed: 'poor_quality_image',
          markerDetection: false,
          spatialContext: null
        };

        const result = await service.recognizeEquipmentAR('eq-001', poorQualityData);

        expect(result.confidence).toBeLessThan(0.6);
        expect(result.requiresManualAlignment).toBe(true);
        expect(result.alternativeRecognitionMethods).toBeArray();
      });
    });
  });

  describe('VR Training Systems', () => {
    describe('conductVRTraining', () => {
      it('should conduct comprehensive VR training session', async () => {
        const result = await service.conductVRTraining(mockVRTrainingRequest);

        expect(result).toBeDefined();
        expect(result.trainingId).toBe(mockVRTrainingRequest.trainingId);
        expect(result.virtualTrainingEnvironment).toBeDefined();
        expect(result.simulatedScenarios).toBeArray();
        expect(result.skillDevelopmentTracking).toBeDefined();
        expect(result.performanceAssessment).toBeDefined();
        expect(result.learningAnalytics).toBeDefined();
        expect(result.competencyValidation).toBeDefined();
      });

      it('should adapt training based on trainee performance', async () => {
        const adaptiveRequest = {
          ...mockVRTrainingRequest,
          traineeProfiles: [{
            ...mockVRTrainingRequest.traineeProfiles[0],
            learningDifficulties: ['spatial_awareness']
          }]
        };

        const result = await service.conductVRTraining(adaptiveRequest);

        expect(result.adaptiveLearningRecommendations).toBeArray();
        expect(result.virtualTrainingEnvironment.adaptations).toBeDefined();
        expect(result.skillDevelopmentTracking.personalizedPath).toBeTruthy();
      });

      it('should provide multi-user collaborative training', async () => {
        const collaborativeRequest = {
          ...mockVRTrainingRequest,
          multiUserCollaboration: true,
          traineeProfiles: [
            mockVRTrainingRequest.traineeProfiles[0],
            { ...mockVRTrainingRequest.traineeProfiles[0], id: 'trainee-002', name: 'Bob Johnson' }
          ]
        };

        const result = await service.conductVRTraining(collaborativeRequest);

        expect(result.collaborativeInteractions).toBeArray();
        expect(result.virtualTrainingEnvironment.multiUserSupport).toBeTruthy();
        expect(result.performanceAssessment.teamworkMetrics).toBeDefined();
      });

      it('should validate training completion and competency', async () => {
        const result = await service.conductVRTraining(mockVRTrainingRequest);

        expect(result.competencyValidation).toBeDefined();
        expect(result.competencyValidation.skillsAssessed).toBeArray();
        expect(result.competencyValidation.overallScore).toBeNumber();
        expect(result.certificationStatus).toBeDefined();
      });

      it('should handle invalid training program', async () => {
        const invalidRequest = {
          ...mockVRTrainingRequest,
          trainingProgram: null
        };

        await expect(service.conductVRTraining(invalidRequest))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('assessTraineePerformance', () => {
      it('should assess comprehensive trainee performance metrics', async () => {
        const performanceData = {
          sessionId: 'train-001',
          completedTasks: ['safety_check', 'equipment_startup', 'quality_control'],
          taskScores: { safety_check: 95, equipment_startup: 82, quality_control: 88 },
          timeSpent: { safety_check: 300, equipment_startup: 1200, quality_control: 600 },
          errors: [
            { task: 'equipment_startup', type: 'procedure_skipped', severity: 'medium' }
          ],
          interactions: {
            gestureAccuracy: 87,
            voiceCommandSuccess: 92,
            spatialAwareness: 78
          }
        };

        const result = await service.assessTraineePerformance('trainee-001', performanceData);

        expect(result).toBeDefined();
        expect(result.overallScore).toBeNumber();
        expect(result.skillBreakdown).toBeDefined();
        expect(result.improvementAreas).toBeArray();
        expect(result.strengths).toBeArray();
        expect(result.nextLearningObjectives).toBeArray();
      });
    });
  });

  describe('Digital Twin Visualization', () => {
    describe('visualizeDigitalTwin', () => {
      it('should create immersive digital twin visualization', async () => {
        const visualizationRequest = {
          twinId: 'dt-001',
          assetType: 'production_line' as const,
          visualizationMode: '3d_model' as const,
          dataStreams: ['temperature', 'vibration', 'efficiency'],
          interactionMode: 'immersive',
          collaborativeAccess: true
        };

        const result = await service.visualizeDigitalTwin(visualizationRequest);

        expect(result).toBeDefined();
        expect(result.twinId).toBe('dt-001');
        expect(result.visualizationMode).toBe('3d_model');
        expect(result.realTimeDataStreams).toBeArray();
        expect(result.interactiveElements).toBeArray();
        expect(result.predictiveVisualizations).toBeArray();
      });

      it('should support AR overlay visualization mode', async () => {
        const arVisualizationRequest = {
          twinId: 'dt-002',
          assetType: 'equipment' as const,
          visualizationMode: 'ar_overlay' as const,
          spatialAlignment: {
            markerBased: true,
            markerlessTracking: false
          }
        };

        const result = await service.visualizeDigitalTwin(arVisualizationRequest);

        expect(result.visualizationMode).toBe('ar_overlay');
        expect(result.spatialAlignment).toBeDefined();
        expect(result.realWorldIntegration).toBeTruthy();
      });

      it('should provide predictive visualizations', async () => {
        const predictiveRequest = {
          twinId: 'dt-003',
          assetType: 'process' as const,
          visualizationMode: 'holographic' as const,
          predictiveAnalytics: true,
          forecastPeriod: 24 // hours
        };

        const result = await service.visualizeDigitalTwin(predictiveRequest);

        expect(result.predictiveVisualizations).toBeArray();
        expect(result.predictiveVisualizations.length).toBeGreaterThan(0);
        expect(result.predictiveVisualizations[0]).toMatchObject({
          type: expect.any(String),
          timeframe: expect.any(Number),
          confidence: expect.any(Number),
          visualization: expect.any(Object)
        });
      });
    });
  });

  describe('System Monitoring and Analytics', () => {
    describe('monitorSystemPerformance', () => {
      it('should monitor metaverse system performance', async () => {
        const result = await service.monitorSystemPerformance();

        expect(result).toBeDefined();
        expect(result.activesessions).toBeNumber();
        expect(result.systemLoad).toBeDefined();
        expect(result.renderingPerformance).toBeDefined();
        expect(result.networkLatency).toBeDefined();
        expect(result.userExperience).toBeDefined();
      });

      it('should identify performance bottlenecks', async () => {
        // Simulate high system load
        service['activeMetaverseSessions'].set('session-1', {} as any);
        service['activeMetaverseSessions'].set('session-2', {} as any);
        service['activeMetaverseSessions'].set('session-3', {} as any);

        const result = await service.monitorSystemPerformance();

        expect(result.bottlenecks).toBeArray();
        if (result.systemLoad.cpu > 80) {
          expect(result.recommendations).toContain('Scale processing resources');
        }
      });
    });

    describe('generateAnalyticsReport', () => {
      it('should generate comprehensive usage analytics', async () => {
        const reportParams = {
          dateRange: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31')
          },
          includeUserBehavior: true,
          includePerformanceMetrics: true,
          includeTrainingOutcomes: true
        };

        const result = await service.generateAnalyticsReport(reportParams);

        expect(result).toBeDefined();
        expect(result.usageStatistics).toBeDefined();
        expect(result.userBehaviorAnalytics).toBeDefined();
        expect(result.performanceMetrics).toBeDefined();
        expect(result.trainingEffectiveness).toBeDefined();
        expect(result.recommendations).toBeArray();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle system overload gracefully', async () => {
      // Fill up session capacity
      for (let i = 0; i < 100; i++) {
        service['activeMetaverseSessions'].set(`session-${i}`, {} as any);
      }

      const overloadRequest = { ...mockMetaverseExperienceRequest, sessionId: 'overload-session' };

      const result = await service.createImmersiveExperience(overloadRequest);

      expect(result.queuePosition).toBeDefined();
      expect(result.estimatedWaitTime).toBeDefined();
    });

    it('should handle network connectivity issues', async () => {
      // Simulate network issues
      const networkIssueRequest = {
        ...mockMetaverseExperienceRequest,
        networkConditions: {
          bandwidth: 'low',
          latency: 'high',
          stability: 'poor'
        }
      };

      const result = await service.createImmersiveExperience(networkIssueRequest);

      expect(result.adaptiveQuality).toBeDefined();
      expect(result.virtualEnvironment.renderQuality).toBe('optimized');
    });

    it('should validate hardware requirements', async () => {
      const insufficientHardwareRequest = {
        ...mockMetaverseExperienceRequest,
        deviceCapabilities: {
          processingPower: 'low',
          memoryAvailable: 2048, // 2GB
          gpuCapability: 'integrated'
        }
      };

      await expect(service.createImmersiveExperience(insufficientHardwareRequest))
        .rejects.toThrow('Hardware requirements not met for requested experience');
    });

    it('should handle malformed input data', async () => {
      const malformedRequest = {
        ...mockMetaverseExperienceRequest,
        manufacturingContext: 'invalid_context' // Should be object
      };

      await expect(service.createImmersiveExperience(malformedRequest as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('Integration with Manufacturing Systems', () => {
    it('should integrate with production order data', async () => {
      productionOrderRepository.find.mockResolvedValue([
        {
          id: 'po-001',
          orderNumber: 'PO-001',
          status: 'in_progress',
          progress: 75,
          workCenterId: 'wc-001'
        }
      ]);

      const result = await service.createImmersiveExperience(mockMetaverseExperienceRequest);

      expect(result.realTimeDataIntegration.productionData).toBeDefined();
      expect(result.virtualEnvironment.productionVisibility).toBeTruthy();
    });

    it('should integrate with work center status', async () => {
      workCenterRepository.find.mockResolvedValue([
        {
          id: 'wc-001',
          name: 'Assembly Line 1',
          status: 'active',
          currentLoad: 85,
          efficiency: 92
        }
      ]);

      const result = await service.createImmersiveExperience(mockMetaverseExperienceRequest);

      expect(result.realTimeDataIntegration.workCenterData).toBeArray();
      expect(result.immersiveElements).toContain(
        expect.objectContaining({ type: 'work_center_status' })
      );
    });
  });

  describe('Security and Access Control', () => {
    it('should validate user authentication', async () => {
      const unauthenticatedRequest = {
        ...mockMetaverseExperienceRequest,
        userId: null
      };

      await expect(service.createImmersiveExperience(unauthenticatedRequest))
        .rejects.toThrow('User authentication required');
    });

    it('should enforce role-based access control', async () => {
      const restrictedRequest = {
        ...mockMetaverseExperienceRequest,
        experienceType: 'remote_operation' as const,
        participantProfiles: [{
          ...mockMetaverseExperienceRequest.participantProfiles[0],
          role: 'intern',
          clearanceLevel: 'basic'
        }]
      };

      await expect(service.createImmersiveExperience(restrictedRequest))
        .rejects.toThrow('Insufficient clearance level for remote operation');
    });

    it('should audit all activities', async () => {
      await service.createImmersiveExperience(mockMetaverseExperienceRequest);

      expect(operationLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'metaverse_experience_created',
          userId: mockMetaverseExperienceRequest.userId,
          sessionId: mockMetaverseExperienceRequest.sessionId
        })
      );
    });
  });
});
