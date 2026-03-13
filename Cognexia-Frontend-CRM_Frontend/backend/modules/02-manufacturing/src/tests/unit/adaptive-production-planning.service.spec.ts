import { Test, TestingModule } from '@nestjs/testing';
import { AdaptiveProductionPlanningService } from '../../services/AdaptiveProductionPlanningService';

describe('AdaptiveProductionPlanningService', () => {
  let service: AdaptiveProductionPlanningService;

  // Mock test data
  const mockProductionPlanningRequest = {
    planningHorizon: '3_months',
    historicalData: {
      salesHistory: [
        { period: '2024-01', productId: 'prod-001', quantity: 1500, revenue: 75000 },
        { period: '2024-02', productId: 'prod-001', quantity: 1650, revenue: 82500 },
        { period: '2024-03', productId: 'prod-001', quantity: 1720, revenue: 86000 }
      ],
      productionHistory: [
        { period: '2024-01', productId: 'prod-001', produced: 1500, efficiency: 85.5 },
        { period: '2024-02', productId: 'prod-001', produced: 1650, efficiency: 87.2 },
        { period: '2024-03', productId: 'prod-001', produced: 1720, efficiency: 88.1 }
      ],
      qualityMetrics: [
        { period: '2024-01', defectRate: 2.1, customerSatisfaction: 94.5 },
        { period: '2024-02', defectRate: 1.8, customerSatisfaction: 95.2 },
        { period: '2024-03', defectRate: 1.6, customerSatisfaction: 95.8 }
      ]
    },
    marketIntelligence: {
      marketTrends: [
        { trend: 'increasing_demand_for_sustainability', impact: 'high', confidence: 0.85 },
        { trend: 'supply_chain_disruption_risk', impact: 'medium', confidence: 0.72 }
      ],
      competitorAnalysis: {
        marketShare: 28.5,
        competitiveAdvantages: ['quality', 'innovation', 'sustainability'],
        threats: ['new_entrants', 'price_pressure']
      },
      economicIndicators: {
        gdpGrowth: 2.8,
        inflationRate: 3.2,
        industryGrowthRate: 5.1
      }
    },
    forecastingParameters: {
      algorithms: ['arima', 'neural_network', 'ensemble'],
      seasonalityFactors: true,
      externalFactorsWeight: 0.3,
      confidenceInterval: 0.95
    },
    availableResources: {
      workCenters: [
        { id: 'wc-001', capacity: 1000, availability: 0.92, skills: ['machining', 'assembly'] },
        { id: 'wc-002', capacity: 800, availability: 0.95, skills: ['welding', 'finishing'] }
      ],
      workforce: {
        totalWorkers: 150,
        skillDistribution: {
          'machine_operators': 60,
          'quality_inspectors': 20,
          'maintenance_technicians': 25,
          'supervisors': 15
        },
        shiftCapacity: { shift1: 50, shift2: 45, shift3: 30 }
      },
      materials: [
        { materialId: 'mat-001', availableQuantity: 5000, leadTime: 14, cost: 25.50 },
        { materialId: 'mat-002', availableQuantity: 3500, leadTime: 21, cost: 45.75 }
      ]
    },
    productPortfolio: [
      {
        productId: 'prod-001',
        name: 'Premium Engine Block',
        profitMargin: 35.2,
        complexity: 'high',
        demand: 'stable',
        strategicImportance: 'critical'
      },
      {
        productId: 'prod-002',
        name: 'Standard Engine Block',
        profitMargin: 22.8,
        complexity: 'medium',
        demand: 'growing',
        strategicImportance: 'important'
      }
    ],
    profitabilityTargets: {
      targetMargin: 30.0,
      revenueTarget: 2500000,
      costReductionTarget: 5.0
    },
    volumeConstraints: {
      minOrderQuantity: 100,
      maxProductionCapacity: 2000,
      setupTimeConstraints: true,
      qualityStandardConstraints: true
    },
    resourceSpecifications: {
      criticalResources: ['specialized_equipment', 'skilled_operators'],
      resourceUtilizationTargets: { equipment: 85, workforce: 80 },
      bottleneckResources: ['cnc_machines', 'quality_stations']
    },
    supplyChainData: {
      suppliers: [
        { supplierId: 'sup-001', reliability: 0.95, leadTime: 14, qualityScore: 98.5 },
        { supplierId: 'sup-002', reliability: 0.88, leadTime: 21, qualityScore: 96.2 }
      ],
      logisticsConstraints: {
        transportationCosts: { local: 50, regional: 150, national: 300 },
        warehouseCapacity: 10000,
        inventoryHoldingCosts: 0.15
      }
    },
    riskParameters: {
      riskTolerance: 'medium',
      criticalRiskFactors: ['supply_disruption', 'demand_volatility', 'quality_issues'],
      mitigationStrategies: ['diversification', 'buffer_inventory', 'flexible_capacity']
    },
    scenarioParameters: {
      scenarios: ['optimistic', 'realistic', 'pessimistic'],
      probabilityWeights: [0.25, 0.50, 0.25],
      sensitivityAnalysis: true
    },
    stakeholderRequirements: {
      customers: { deliveryReliability: 0.98, qualityStandards: 'premium' },
      management: { profitabilityTargets: true, sustainabilityGoals: true },
      workforce: { workloadBalance: true, skillDevelopment: true }
    }
  };

  const mockProductionAdaptationRequest = {
    adaptationTrigger: 'performance_deviation',
    currentPlan: {
      planId: 'plan-001',
      plannedProduction: 1800,
      scheduledStart: new Date('2024-04-01'),
      scheduledEnd: new Date('2024-04-30'),
      resourceAllocations: [
        { resourceId: 'wc-001', allocatedCapacity: 900, utilization: 0.85 },
        { resourceId: 'wc-002', allocatedCapacity: 700, utilization: 0.82 }
      ]
    },
    realTimeData: {
      currentProduction: 1650,
      actualEfficiency: 82.3,
      qualityRate: 96.5,
      resourceUtilization: { 'wc-001': 0.78, 'wc-002': 0.85 },
      bottlenecks: ['material_availability', 'quality_inspection'],
      unplannedDowntime: 45 // minutes
    },
    expectedPerformance: {
      productionTarget: 1800,
      efficiencyTarget: 87.0,
      qualityTarget: 98.0,
      utilizationTarget: 0.85
    },
    operationalConstraints: {
      mandatoryMaintenance: [
        { equipmentId: 'eq-001', scheduledDate: new Date('2024-04-15'), duration: 240 }
      ],
      workforceConstraints: {
        availableWorkers: 145, // 5 workers on leave
        shiftLimitations: { overtime: 'limited', weekends: 'available' }
      },
      materialConstraints: {
        criticalMaterials: ['mat-001'],
        deliveryDelays: [{ materialId: 'mat-002', delayDays: 3 }]
      }
    },
    schedulingParameters: {
      optimizationObjective: 'minimize_deviation',
      reschedulingWindow: '2_weeks',
      priorityOrders: ['urgent', 'critical'],
      flexibilityOptions: ['overtime', 'subcontracting', 'alternative_routing']
    },
    availableResources: {
      additionalCapacity: { 'wc-003': 500, 'subcontractor': 300 },
      alternativeRouting: [
        { productId: 'prod-001', alternativeRoute: 'route-002', efficiency: 0.92 }
      ],
      emergencyResources: {
        rentableEquipment: ['temp_cnc_001', 'temp_cnc_002'],
        contractWorkers: 25
      }
    },
    riskMitigation: {
      contingencyPlans: [
        { scenario: 'equipment_failure', action: 'activate_backup', cost: 5000 },
        { scenario: 'material_shortage', action: 'alternative_supplier', cost: 3500 }
      ],
      escalationProcedures: {
        level1: 'supervisor_notification',
        level2: 'manager_approval',
        level3: 'executive_decision'
      }
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdaptiveProductionPlanningService],
    }).compile();

    service = module.get<AdaptiveProductionPlanningService>(AdaptiveProductionPlanningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize AI planning systems', () => {
      expect(service['aiPlanningEngine']).toBeDefined();
      expect(service['demandForecastingSystem']).toBeDefined();
      expect(service['capacityOptimizer']).toBeDefined();
      expect(service['scheduleOptimizer']).toBeDefined();
      expect(service['resourceAllocator']).toBeDefined();
    });

    it('should initialize cache systems', () => {
      expect(service['productionPlansCache']).toBeInstanceOf(Map);
      expect(service['schedulesCache']).toBeInstanceOf(Map);
      expect(service['metricsCache']).toBeInstanceOf(Map);
    });
  });

  describe('AI-Driven Production Planning', () => {
    describe('createProductionPlan', () => {
      it('should create comprehensive production plan with AI optimization', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result).toBeDefined();
        expect(result.planningId).toBeDefined();
        expect(result.demandForecasting).toBeDefined();
        expect(result.capacityAnalysis).toBeDefined();
        expect(result.productMixOptimization).toBeDefined();
        expect(result.volumePlanning).toBeDefined();
        expect(result.resourcePlanning).toBeDefined();
        expect(result.productionPlan).toBeDefined();
      });

      it('should perform advanced demand forecasting with multiple algorithms', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.demandForecasting).toBeDefined();
        expect(result.demandForecasting.algorithms).toContain('arima');
        expect(result.demandForecasting.algorithms).toContain('neural_network');
        expect(result.demandForecasting.algorithms).toContain('ensemble');
        expect(result.demandForecasting.forecast).toBeDefined();
        expect(result.demandForecasting.confidenceInterval).toBeDefined();
      });

      it('should optimize product mix for maximum profitability', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.productMixOptimization).toBeDefined();
        expect(result.productMixOptimization.optimizedProducts).toBeArray();
        expect(result.productMixOptimization.profitabilityImprovement).toBeNumber();
        expect(result.productMixOptimization.resourceUtilization).toBeDefined();
      });

      it('should integrate supply chain considerations', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.supplyChainIntegration).toBeDefined();
        expect(result.supplyChainIntegration.supplierAlignment).toBeDefined();
        expect(result.supplyChainIntegration.inventoryOptimization).toBeDefined();
        expect(result.supplyChainIntegration.logisticsPlanning).toBeDefined();
      });

      it('should assess and mitigate production risks', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.riskAssessment).toBeDefined();
        expect(result.riskAssessment.identifiedRisks).toBeArray();
        expect(result.riskAssessment.mitigationStrategies).toBeArray();
        expect(result.riskAssessment.riskScore).toBeNumber();
        expect(result.riskAssessment.contingencyPlans).toBeDefined();
      });

      it('should perform multi-scenario planning', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.scenarioPlanning).toBeArray();
        expect(result.scenarioPlanning.length).toBeGreaterThanOrEqual(3);
        expect(result.scenarioPlanning[0]).toMatchObject({
          scenario: expect.any(String),
          probability: expect.any(Number),
          outcomes: expect.any(Object)
        });
      });

      it('should generate performance predictions', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.performancePrediction).toBeDefined();
        expect(result.performancePrediction.expectedEfficiency).toBeNumber();
        expect(result.performancePrediction.qualityPrediction).toBeNumber();
        expect(result.performancePrediction.costPrediction).toBeNumber();
        expect(result.performancePrediction.deliveryReliability).toBeNumber();
      });

      it('should create adaptation strategies for dynamic changes', async () => {
        const result = await service.createProductionPlan(mockProductionPlanningRequest);

        expect(result.adaptationStrategies).toBeArray();
        expect(result.adaptationStrategies.length).toBeGreaterThan(0);
        expect(result.adaptationStrategies[0]).toMatchObject({
          trigger: expect.any(String),
          strategy: expect.any(String),
          implementation: expect.any(Object)
        });
      });

      it('should validate input parameters', async () => {
        const invalidRequest = {
          ...mockProductionPlanningRequest,
          planningHorizon: null
        };

        await expect(service.createProductionPlan(invalidRequest))
          .rejects.toThrow('Invalid planning horizon specified');
      });

      it('should handle insufficient resource scenarios', async () => {
        const resourceConstrainedRequest = {
          ...mockProductionPlanningRequest,
          availableResources: {
            ...mockProductionPlanningRequest.availableResources,
            workCenters: [
              { id: 'wc-001', capacity: 100, availability: 0.50, skills: ['machining'] }
            ]
          }
        };

        const result = await service.createProductionPlan(resourceConstrainedRequest);

        expect(result.resourcePlanning.constraints).toBeDefined();
        expect(result.adaptationStrategies).toContain(
          expect.objectContaining({ trigger: 'resource_constraint' })
        );
      });
    });

    describe('adaptProductionPlanRealTime', () => {
      it('should adapt production plan based on real-time performance data', async () => {
        const result = await service.adaptProductionPlanRealTime(mockProductionAdaptationRequest);

        expect(result).toBeDefined();
        expect(result.adaptationId).toBeDefined();
        expect(result.performanceMonitoring).toBeDefined();
        expect(result.deviationAnalysis).toBeDefined();
        expect(result.adaptedPlan).toBeDefined();
      });

      it('should identify and analyze performance deviations', async () => {
        const result = await service.adaptProductionPlanRealTime(mockProductionAdaptationRequest);

        expect(result.deviationAnalysis).toBeDefined();
        expect(result.deviationAnalysis.productionDeviation).toBeDefined();
        expect(result.deviationAnalysis.efficiencyDeviation).toBeDefined();
        expect(result.deviationAnalysis.rootCauses).toBeArray();
      });

      it('should resolve constraints dynamically', async () => {
        const result = await service.adaptProductionPlanRealTime(mockProductionAdaptationRequest);

        expect(result.constraintResolution).toBeDefined();
        expect(result.constraintResolution.resolvedConstraints).toBeArray();
        expect(result.constraintResolution.alternativeSolutions).toBeDefined();
      });

      it('should reallocate resources optimally', async () => {
        const result = await service.adaptProductionPlanRealTime(mockProductionAdaptationRequest);

        expect(result.resourceReallocation).toBeDefined();
        expect(result.resourceReallocation.newAllocations).toBeArray();
        expect(result.resourceReallocation.utilizationImpact).toBeDefined();
        expect(result.resourceReallocation.costImpact).toBeNumber();
      });

      it('should implement risk mitigation strategies', async () => {
        const result = await service.adaptProductionPlanRealTime(mockProductionAdaptationRequest);

        expect(result.riskMitigation).toBeDefined();
        expect(result.riskMitigation.activatedStrategies).toBeArray();
        expect(result.riskMitigation.riskReduction).toBeNumber();
      });

      it('should handle emergency adaptation scenarios', async () => {
        const emergencyRequest = {
          ...mockProductionAdaptationRequest,
          adaptationTrigger: 'equipment_failure',
          realTimeData: {
            ...mockProductionAdaptationRequest.realTimeData,
            equipmentFailures: [{ equipmentId: 'eq-001', severity: 'critical', downtime: 480 }]
          }
        };

        const result = await service.adaptProductionPlanRealTime(emergencyRequest);

        expect(result.emergencyProtocols).toBeDefined();
        expect(result.adaptedPlan.urgency).toBe('high');
        expect(result.resourceReallocation.emergencyAllocations).toBeDefined();
      });

      it('should validate adaptation request parameters', async () => {
        const invalidRequest = {
          ...mockProductionAdaptationRequest,
          currentPlan: null
        };

        await expect(service.adaptProductionPlanRealTime(invalidRequest))
          .rejects.toThrow('Current production plan is required for adaptation');
      });
    });
  });

  describe('Advanced Scheduling and Optimization', () => {
    describe('optimizeProductionSchedule', () => {
      it('should optimize production schedule for maximum efficiency', async () => {
        const scheduleRequest = {
          productionOrders: [
            { orderId: 'po-001', productId: 'prod-001', quantity: 500, priority: 'high', dueDate: new Date('2024-05-15') },
            { orderId: 'po-002', productId: 'prod-002', quantity: 800, priority: 'medium', dueDate: new Date('2024-05-20') }
          ],
          resourceConstraints: {
            workCenters: ['wc-001', 'wc-002'],
            workforceConstraints: { maxOvertimeHours: 40, skillAvailability: true }
          },
          optimizationObjectives: ['minimize_makespan', 'maximize_resource_utilization', 'minimize_cost']
        };

        const result = await service.optimizeProductionSchedule(scheduleRequest);

        expect(result).toBeDefined();
        expect(result.optimizedSchedule).toBeDefined();
        expect(result.schedulePerformance).toBeDefined();
        expect(result.resourceUtilization).toBeDefined();
      });

      it('should handle complex multi-objective optimization', async () => {
        const complexScheduleRequest = {
          productionOrders: Array.from({ length: 20 }, (_, i) => ({
            orderId: `po-${i.toString().padStart(3, '0')}`,
            productId: `prod-${(i % 3) + 1}`,
            quantity: 100 + i * 50,
            priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
            dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
          })),
          resourceConstraints: {
            workCenters: ['wc-001', 'wc-002', 'wc-003'],
            bottleneckConstraints: ['quality_station', 'packaging_line']
          },
          optimizationObjectives: ['minimize_tardiness', 'balance_workload', 'minimize_setup_time']
        };

        const result = await service.optimizeProductionSchedule(complexScheduleRequest);

        expect(result.optimizationMetrics.objectiveAchievement).toBeDefined();
        expect(result.tradeoffAnalysis).toBeDefined();
        expect(result.paretoFront).toBeArray();
      });
    });

    describe('optimizeResourceAllocation', () => {
      it('should allocate resources for optimal production efficiency', async () => {
        const allocationRequest = {
          productionRequirements: [
            { productId: 'prod-001', quantity: 1000, skillRequirements: ['machining', 'assembly'] },
            { productId: 'prod-002', quantity: 1500, skillRequirements: ['welding', 'finishing'] }
          ],
          availableResources: {
            workCenters: mockProductionPlanningRequest.availableResources.workCenters,
            workforce: mockProductionPlanningRequest.availableResources.workforce
          },
          allocationObjectives: ['maximize_utilization', 'minimize_cost', 'ensure_quality']
        };

        const result = await service.optimizeResourceAllocation(allocationRequest);

        expect(result).toBeDefined();
        expect(result.optimalAllocation).toBeDefined();
        expect(result.utilizationMetrics).toBeDefined();
        expect(result.costOptimization).toBeDefined();
        expect(result.qualityImpact).toBeDefined();
      });

      it('should handle dynamic resource reallocation', async () => {
        const dynamicRequest = {
          currentAllocation: {
            'wc-001': { allocated: 800, available: 1000 },
            'wc-002': { allocated: 600, available: 800 }
          },
          changeRequirements: {
            newOrders: [{ productId: 'prod-003', quantity: 500, urgency: 'high' }],
            cancelledOrders: [{ orderId: 'po-005' }],
            resourceChanges: { 'wc-003': { status: 'maintenance', duration: 240 } }
          },
          reallocationConstraints: {
            minimumDisruption: true,
            priorityOrders: ['urgent', 'critical']
          }
        };

        const result = await service.optimizeResourceAllocation(dynamicRequest);

        expect(result.reallocationPlan).toBeDefined();
        expect(result.disruptionMinimization).toBeDefined();
        expect(result.transitionPlan).toBeDefined();
      });
    });
  });

  describe('Demand Forecasting and Capacity Planning', () => {
    describe('forecastDemandAdvanced', () => {
      it('should perform advanced multi-algorithm demand forecasting', async () => {
        const forecastRequest = {
          historicalSalesData: mockProductionPlanningRequest.historicalData.salesHistory,
          marketIntelligence: mockProductionPlanningRequest.marketIntelligence,
          forecastingHorizon: '6_months',
          algorithms: ['arima', 'lstm', 'prophet', 'ensemble'],
          externalFactors: {
            economic: { gdpGrowth: 2.8, inflation: 3.2 },
            seasonal: { seasonality: true, holidays: true },
            competitive: { marketShare: 28.5, competitiveActions: [] }
          }
        };

        const result = await service.forecastDemandAdvanced(forecastRequest);

        expect(result).toBeDefined();
        expect(result.forecastResults).toBeArray();
        expect(result.algorithmPerformance).toBeDefined();
        expect(result.ensembleForecast).toBeDefined();
        expect(result.confidenceIntervals).toBeDefined();
        expect(result.accuracyMetrics).toBeDefined();
      });

      it('should incorporate market intelligence and external factors', async () => {
        const intelligenceBasedRequest = {
          baseData: mockProductionPlanningRequest.historicalData,
          marketIntelligence: {
            ...mockProductionPlanningRequest.marketIntelligence,
            emergingTrends: ['AI_adoption', 'sustainability_focus'],
            competitorMoves: [
              { competitor: 'CompA', action: 'price_reduction', impact: 'medium' }
            ]
          },
          externalEvents: [
            { event: 'trade_policy_change', probability: 0.7, impact: 'high' },
            { event: 'supply_chain_disruption', probability: 0.3, impact: 'critical' }
          ]
        };

        const result = await service.forecastDemandAdvanced(intelligenceBasedRequest);

        expect(result.marketImpactAnalysis).toBeDefined();
        expect(result.externalFactorAdjustments).toBeDefined();
        expect(result.scenarioBasedForecasts).toBeArray();
      });
    });

    describe('planCapacityOptimal', () => {
      it('should plan optimal capacity for forecasted demand', async () => {
        const capacityRequest = {
          demandForecast: {
            periods: [
              { period: '2024-Q2', demand: 5000, confidence: 0.85 },
              { period: '2024-Q3', demand: 5500, confidence: 0.82 },
              { period: '2024-Q4', demand: 6200, confidence: 0.78 }
            ]
          },
          currentCapacity: {
            totalCapacity: 6000,
            utilizationRate: 0.83,
            bottlenecks: ['quality_control', 'final_assembly']
          },
          expansionOptions: {
            workCenterExpansion: { cost: 250000, additionalCapacity: 1000, timeline: 90 },
            equipmentUpgrade: { cost: 150000, efficiencyGain: 0.15, timeline: 45 },
            workforceExpansion: { cost: 80000, additionalCapacity: 500, timeline: 30 }
          }
        };

        const result = await service.planCapacityOptimal(capacityRequest);

        expect(result).toBeDefined();
        expect(result.capacityGapAnalysis).toBeDefined();
        expect(result.expansionRecommendations).toBeArray();
        expect(result.investmentAnalysis).toBeDefined();
        expect(result.implementationPlan).toBeDefined();
      });

      it('should optimize capacity utilization across multiple resources', async () => {
        const utilizationRequest = {
          currentUtilization: {
            'wc-001': 0.85,
            'wc-002': 0.72,
            'wc-003': 0.94,
            'quality_station': 0.96
          },
          utilizationTargets: { min: 0.80, max: 0.90, optimal: 0.85 },
          balancingOptions: {
            crossTraining: { cost: 15000, flexibility: 0.25 },
            workflowRedesign: { cost: 25000, efficiency: 0.12 },
            additionalEquipment: { cost: 100000, capacity: 0.20 }
          }
        };

        const result = await service.planCapacityOptimal(utilizationRequest);

        expect(result.utilizationOptimization).toBeDefined();
        expect(result.balancingStrategy).toBeDefined();
        expect(result.resourceReallocation).toBeDefined();
      });
    });
  });

  describe('Performance Analytics and Optimization', () => {
    describe('analyzeProductionPerformance', () => {
      it('should analyze comprehensive production performance metrics', async () => {
        const performanceData = {
          productionPeriod: '2024-Q1',
          actualProduction: 4850,
          plannedProduction: 5000,
          qualityMetrics: { defectRate: 1.8, customerReturns: 0.5 },
          efficiencyMetrics: { oee: 86.5, availability: 94.2, performance: 91.8 },
          costMetrics: { actualCost: 485000, budgetedCost: 475000 },
          deliveryMetrics: { onTimeDelivery: 96.5, averageDelay: 1.2 }
        };

        const result = await service.analyzeProductionPerformance(performanceData);

        expect(result).toBeDefined();
        expect(result.performanceScore).toBeNumber();
        expect(result.varianceAnalysis).toBeDefined();
        expect(result.trendAnalysis).toBeDefined();
        expect(result.benchmarkComparison).toBeDefined();
        expect(result.improvementOpportunities).toBeArray();
      });

      it('should identify performance bottlenecks and root causes', async () => {
        const bottleneckData = {
          performanceIssues: [
            { area: 'quality_control', impact: 'high', frequency: 'frequent' },
            { area: 'material_handling', impact: 'medium', frequency: 'occasional' }
          ],
          operationalData: {
            cycleTimesms: { station1: 125, station2: 145, station3: 138 },
            waitTimes: { materialWait: 35, qualityWait: 28, setupWait: 42 },
            defectSources: [
              { source: 'operator_error', percentage: 35 },
              { source: 'material_defect', percentage: 28 },
              { source: 'equipment_variance', percentage: 22 }
            ]
          }
        };

        const result = await service.analyzeProductionPerformance(bottleneckData);

        expect(result.bottleneckAnalysis).toBeDefined();
        expect(result.rootCauseAnalysis).toBeArray();
        expect(result.impactQuantification).toBeDefined();
        expect(result.improvementRecommendations).toBeArray();
      });
    });

    describe('optimizeProductionKPIs', () => {
      it('should optimize production KPIs for maximum performance', async () => {
        const kpiOptimizationRequest = {
          currentKPIs: {
            productivity: 85.2,
            quality: 97.8,
            cost: 102.5, // index, 100 = target
            delivery: 96.5,
            safety: 99.1
          },
          targetKPIs: {
            productivity: 90.0,
            quality: 99.0,
            cost: 95.0,
            delivery: 98.0,
            safety: 99.5
          },
          optimizationConstraints: {
            budgetLimit: 500000,
            timeframe: '6_months',
            resourceConstraints: ['skilled_workforce', 'equipment_availability']
          }
        };

        const result = await service.optimizeProductionKPIs(kpiOptimizationRequest);

        expect(result).toBeDefined();
        expect(result.optimizationPlan).toBeDefined();
        expect(result.expectedImprovements).toBeDefined();
        expect(result.implementationRoadmap).toBeArray();
        expect(result.costBenefitAnalysis).toBeDefined();
      });
    });
  });

  describe('Risk Management and Contingency Planning', () => {
    describe('assessProductionRisks', () => {
      it('should assess comprehensive production risks', async () => {
        const riskAssessmentData = {
          riskCategories: ['operational', 'supply_chain', 'quality', 'market', 'regulatory'],
          currentRiskFactors: [
            { factor: 'key_supplier_concentration', probability: 0.6, impact: 'high' },
            { factor: 'equipment_aging', probability: 0.8, impact: 'medium' },
            { factor: 'skill_shortage', probability: 0.4, impact: 'high' }
          ],
          riskTolerance: 'medium',
          timeHorizon: '12_months'
        };

        const result = await service.assessProductionRisks(riskAssessmentData);

        expect(result).toBeDefined();
        expect(result.riskMatrix).toBeDefined();
        expect(result.prioritizedRisks).toBeArray();
        expect(result.riskScore).toBeNumber();
        expect(result.mitigation Strategies).toBeArray();
      });

      it('should develop contingency plans for critical risks', async () => {
        const contingencyRequest = {
          criticalRisks: [
            { riskId: 'supply_disruption', severity: 'critical', probability: 0.3 },
            { riskId: 'equipment_failure', severity: 'high', probability: 0.5 }
          ],
          contingencyOptions: {
            alternativeSuppliers: 3,
            backupEquipment: true,
            flexibleWorkforce: 0.25,
            emergencyInventory: 15 // days
          }
        };

        const result = await service.assessProductionRisks(contingencyRequest);

        expect(result.contingencyPlans).toBeArray();
        expect(result.contingencyPlans[0]).toMatchObject({
          riskScenario: expect.any(String),
          triggerConditions: expect.any(Array),
          responseActions: expect.any(Array),
          resourceRequirements: expect.any(Object)
        });
      });
    });
  });

  describe('Integration and Collaboration', () => {
    describe('integrateExternalSystems', () => {
      it('should integrate with ERP and supply chain systems', async () => {
        const integrationRequest = {
          systems: ['erp_system', 'mes_system', 'scm_system', 'crm_system'],
          dataMapping: {
            productionOrders: 'erp.production_orders',
            inventory: 'erp.inventory',
            qualityData: 'mes.quality',
            customerDemand: 'crm.demand'
          },
          syncFrequency: 'real_time'
        };

        const result = await service.integrateExternalSystems(integrationRequest);

        expect(result).toBeDefined();
        expect(result.integrationStatus).toBeDefined();
        expect(result.dataConsistency).toBeDefined();
        expect(result.synchronizationMetrics).toBeDefined();
      });
    });

    describe('enableCollaborativePlanning', () => {
      it('should enable collaborative planning with stakeholders', async () => {
        const collaborationRequest = {
          stakeholders: ['production_managers', 'supply_chain', 'sales', 'finance'],
          planningScope: 'quarterly',
          collaborationMode: 'concurrent',
          decisionCriteria: {
            consensus: 0.80,
            expertise_weighting: true,
            conflict_resolution: 'escalation'
          }
        };

        const result = await service.enableCollaborativePlanning(collaborationRequest);

        expect(result).toBeDefined();
        expect(result.collaborationPlatform).toBeDefined();
        expect(result.stakeholderEngagement).toBeDefined();
        expect(result.consensusMetrics).toBeDefined();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid planning parameters', async () => {
      const invalidRequest = {
        ...mockProductionPlanningRequest,
        planningHorizon: 'invalid_horizon',
        historicalData: null
      };

      await expect(service.createProductionPlan(invalidRequest))
        .rejects.toThrow('Invalid planning parameters provided');
    });

    it('should handle resource shortage scenarios', async () => {
      const shortageRequest = {
        ...mockProductionPlanningRequest,
        availableResources: {
          workCenters: [],
          workforce: { totalWorkers: 0 },
          materials: []
        }
      };

      const result = await service.createProductionPlan(shortageRequest);

      expect(result.feasibilityAssessment.feasible).toBe(false);
      expect(result.recommendations).toContain(
        expect.objectContaining({ type: 'resource_acquisition' })
      );
    });

    it('should handle conflicting optimization objectives', async () => {
      const conflictingRequest = {
        productionOrders: [{ orderId: 'po-001', dueDate: new Date(Date.now() + 86400000) }],
        objectives: ['minimize_cost', 'minimize_time', 'maximize_quality'],
        constraints: { budget: 10000, time: 1, quality: 99 } // Impossible constraints
      };

      const result = await service.optimizeProductionSchedule(conflictingRequest);

      expect(result.feasibilityAnalysis).toBeDefined();
      expect(result.tradeoffRecommendations).toBeArray();
    });

    it('should handle system performance degradation gracefully', async () => {
      // Simulate heavy load
      const heavyLoadRequest = Array.from({ length: 1000 }, (_, i) => ({
        ...mockProductionPlanningRequest,
        planningId: `heavy-load-${i}`
      }));

      // Should not crash and should provide reasonable response times
      const startTime = Date.now();
      const results = await Promise.allSettled(
        heavyLoadRequest.slice(0, 5).map(req => service.createProductionPlan(req))
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(30000); // 30 second timeout
      expect(results.some(r => r.status === 'fulfilled')).toBe(true);
    });
  });

  describe('Cache and Performance Optimization', () => {
    it('should cache production plans for reuse', async () => {
      const result1 = await service.createProductionPlan(mockProductionPlanningRequest);
      const result2 = await service.createProductionPlan(mockProductionPlanningRequest);

      expect(service['productionPlansCache'].size).toBeGreaterThan(0);
      // Second call should leverage cached computations for better performance
      expect(result2).toBeDefined();
    });

    it('should manage cache memory efficiently', async () => {
      const initialSize = service['productionPlansCache'].size;

      // Generate many plans to test cache management
      for (let i = 0; i < 100; i++) {
        await service.createProductionPlan({
          ...mockProductionPlanningRequest,
          planId: `test-plan-${i}`
        });
      }

      // Cache should not grow indefinitely
      expect(service['productionPlansCache'].size).toBeLessThan(150);
    });
  });
});
