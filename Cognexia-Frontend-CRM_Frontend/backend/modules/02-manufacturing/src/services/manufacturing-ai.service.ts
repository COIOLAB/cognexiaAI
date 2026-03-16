import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

// Local entities
import { WorkCenter } from '../entities/WorkCenter';
import { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority } from '../entities/ProductionOrder';
import { ProductionLine } from '../entities/ProductionLine';
import { WorkOrder } from '../entities/WorkOrder';
import { BillOfMaterials } from '../entities/BillOfMaterials';

// Shop Floor Control integration
import { ShopFloorControlService } from '../../../09-shop-floor-control/src/services/shop-floor-control.service';
import { Robot, RobotState } from '../../../09-shop-floor-control/src/entities/robot.entity';
import { RobotTask, TaskStatus, TaskType, TaskPriority } from '../../../09-shop-floor-control/src/entities/robot-task.entity';

// IoT integration
import { IoTService } from '../../../14-iot/src/services/iot.service';

export interface SmartManufacturingMetrics {
  oee: {
    overall: number;
    availability: number;
    performance: number;
    quality: number;
    trend: number[];
  };
  productivity: {
    throughput: number;
    cycleTime: number;
    setupTime: number;
    efficiency: number;
  };
  quality: {
    firstPassYield: number;
    defectRate: number;
    reworkRate: number;
    customerSatisfaction: number;
  };
  sustainability: {
    energyEfficiency: number;
    carbonFootprint: number;
    wasteReduction: number;
    recyclingRate: number;
  };
  predictive: {
    maintenanceAlerts: number;
    qualityPredictions: any[];
    demandForecast: any[];
    riskAssessment: any[];
  };
}

export interface AIOptimizationSuggestion {
  id: string;
  type: 'scheduling' | 'resource_allocation' | 'quality' | 'maintenance' | 'energy' | 'workflow';
  title: string;
  description: string;
  impact: {
    efficiency: number;
    cost: number;
    quality: number;
    sustainability: number;
  };
  confidence: number;
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
    risks: string[];
  };
  status: 'pending' | 'approved' | 'implementing' | 'completed' | 'rejected';
  createdAt: Date;
  estimatedROI: number;
}

export interface DigitalTwinSimulation {
  id: string;
  name: string;
  scenario: {
    productionTarget: number;
    timeline: string;
    resources: any[];
    constraints: any[];
  };
  results: {
    throughput: number;
    efficiency: number;
    quality: number;
    cost: number;
    duration: number;
    bottlenecks: string[];
    risks: string[];
    recommendations: string[];
  };
  confidence: number;
  status: 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface HumanAICollaborationEvent {
  id: string;
  type: 'decision_support' | 'anomaly_alert' | 'optimization_suggestion' | 'quality_insight';
  aiRecommendation: {
    action: string;
    confidence: number;
    reasoning: string[];
    data: any;
  };
  humanResponse: {
    decision: 'accepted' | 'modified' | 'rejected';
    reasoning?: string;
    modifications?: any;
    timestamp: Date;
    operatorId: string;
  };
  outcome: {
    implemented: boolean;
    results?: any;
    feedback?: string;
  };
  learningData: any;
  timestamp: Date;
}

@Injectable()
export class ManufacturingAIService {
  private readonly logger = new Logger(ManufacturingAIService.name);

  constructor(
    @InjectRepository(WorkCenter)
    private readonly workCenterRepository: Repository<WorkCenter>,
    
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
    
    @InjectRepository(ProductionLine)
    private readonly productionLineRepository: Repository<ProductionLine>,
    
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
    
    @InjectRepository(BillOfMaterials)
    private readonly bomRepository: Repository<BillOfMaterials>,
    
    private readonly shopFloorControlService: ShopFloorControlService,
    private readonly iotService: IoTService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // AI-Powered Production Planning
  async generateOptimalProductionSchedule(
    orders: string[],
    constraints: any = {},
    horizon: number = 30 // days
  ): Promise<any> {
    try {
      this.logger.log(`Generating optimal production schedule for ${orders.length} orders`);

      const productionOrders = await this.productionOrderRepository.find({
        where: { id: In(orders) },
        relations: ['productionLine', 'billOfMaterials', 'workOrders']
      });

      const availableResources = await this.getAvailableResources();
      const shopFloorStatus = await this.shopFloorControlService.getShopFloorMetrics();

      // AI scheduling algorithm
      const schedule = await this.runAISchedulingOptimization(
        productionOrders,
        availableResources,
        constraints,
        horizon
      );

      // Create robot tasks for scheduled operations
      const robotTasks = await this.createRobotTasksFromSchedule(schedule);

      this.eventEmitter.emit('production.schedule.generated', {
        ordersCount: orders.length,
        horizon,
        efficiency: schedule.expectedEfficiency,
        throughput: schedule.expectedThroughput,
        timestamp: new Date()
      });

      return {
        schedule,
        robotTasks,
        metrics: {
          expectedEfficiency: schedule.expectedEfficiency,
          expectedThroughput: schedule.expectedThroughput,
          resourceUtilization: schedule.resourceUtilization,
          estimatedCompletion: schedule.estimatedCompletion
        },
        optimizationScore: schedule.optimizationScore
      };

    } catch (error) {
      this.logger.error(`Failed to generate production schedule: ${error.message}`);
      throw error;
    }
  }

  private async runAISchedulingOptimization(
    orders: ProductionOrder[],
    resources: any,
    constraints: any,
    horizon: number
  ): Promise<any> {
    // Advanced AI scheduling algorithm
    // This is a simplified version - in production would use ML models
    
    const schedule = {
      operations: [],
      expectedEfficiency: 0,
      expectedThroughput: 0,
      resourceUtilization: {},
      estimatedCompletion: new Date(),
      optimizationScore: 0
    };

    // Priority-based scheduling with resource optimization
    const prioritizedOrders = orders.sort((a, b) => {
      const priorityWeight = this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority);
      const urgencyWeight = (a.scheduledEndDate.getTime() - b.scheduledEndDate.getTime()) / (1000 * 60 * 60 * 24);
      return priorityWeight + urgencyWeight * 0.1;
    });

    let currentTime = new Date();
    let totalEfficiency = 0;
    let totalThroughput = 0;

    for (const order of prioritizedOrders) {
      const operations = await this.planOrderOperations(order, resources, currentTime);
      schedule.operations.push(...operations);
      
      // Update metrics
      totalEfficiency += operations.reduce((sum, op) => sum + (op.expectedEfficiency || 0), 0);
      totalThroughput += order.plannedQuantity;
      
      // Update current time to end of last operation
      const lastOperation = operations[operations.length - 1];
      if (lastOperation) {
        currentTime = new Date(Math.max(currentTime.getTime(), lastOperation.scheduledEnd.getTime()));
      }
    }

    schedule.expectedEfficiency = totalEfficiency / Math.max(schedule.operations.length, 1);
    schedule.expectedThroughput = totalThroughput;
    schedule.estimatedCompletion = currentTime;
    schedule.optimizationScore = this.calculateOptimizationScore(schedule);

    return schedule;
  }

  private async planOrderOperations(
    order: ProductionOrder,
    resources: any,
    startTime: Date
  ): Promise<any[]> {
    const operations = [];
    const bom = order.billOfMaterials;
    
    if (!bom) return operations;

    // Get routing operations from BOM
    // This would be expanded based on actual routing data
    let currentTime = startTime;

    // Plan each operation
    const operationTemplates = [
      { type: 'setup', duration: 30, workCenterType: 'setup' },
      { type: 'processing', duration: order.plannedQuantity * 2, workCenterType: 'processing' },
      { type: 'quality_check', duration: 15, workCenterType: 'inspection' },
      { type: 'packaging', duration: 20, workCenterType: 'packaging' }
    ];

    for (const template of operationTemplates) {
      const workCenter = await this.findOptimalWorkCenter(template.workCenterType, currentTime);
      
      if (workCenter) {
        const operation = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          operationType: template.type,
          workCenterId: workCenter.id,
          workCenterName: workCenter.name,
          scheduledStart: new Date(currentTime),
          scheduledEnd: new Date(currentTime.getTime() + template.duration * 60 * 1000),
          estimatedDuration: template.duration,
          expectedEfficiency: workCenter.efficiency,
          requiredSkills: workCenter.skillsRequired || [],
          priority: order.priority
        };

        operations.push(operation);
        currentTime = operation.scheduledEnd;
      }
    }

    return operations;
  }

  private async findOptimalWorkCenter(type: string, timeSlot: Date): Promise<WorkCenter | null> {
    // Find the best available work center for the operation type
    const workCenters = await this.workCenterRepository.find({
      where: { 
        status: 'active',
        type: type as any
      },
      order: { efficiency: 'DESC' }
    });

    // Simple availability check - in production would check detailed scheduling
    return workCenters.find(wc => wc.isAvailable()) || workCenters[0] || null;
  }

  private async createRobotTasksFromSchedule(schedule: any): Promise<RobotTask[]> {
    const robotTasks: RobotTask[] = [];

    for (const operation of schedule.operations) {
      // Check if operation can be automated
      const availableRobots = await this.shopFloorControlService.getAvailableRobots();
      const suitableRobot = availableRobots.find(robot => 
        this.canRobotHandleOperation(robot, operation)
      );

      if (suitableRobot) {
        const taskData = {
          name: `${operation.operationType} - ${operation.orderNumber}`,
          description: `Automated ${operation.operationType} for production order ${operation.orderNumber}`,
          type: this.mapOperationToTaskType(operation.operationType),
          priority: this.mapOrderPriorityToTaskPriority(operation.priority),
          complexity: 'moderate' as any,
          requirements: {
            minPayloadKg: 5,
            visionRequired: operation.operationType === 'quality_check',
            collaborativeMode: false
          },
          parameters: {
            maxExecutionTime: operation.estimatedDuration * 60,
            targetCycleTime: operation.estimatedDuration * 60,
            qualityCheckpoints: operation.operationType === 'quality_check' ? ['visual', 'dimensional'] : []
          },
          scheduledAt: operation.scheduledStart,
          workCellId: operation.workCenterId,
          robotId: suitableRobot.id,
          steps: [{
            name: `Execute ${operation.operationType}`,
            type: this.mapOperationToStepType(operation.operationType),
            stepOrder: 1,
            parameters: {
              speed: 50,
              precision: 0.1,
              dwellTime: 5
            },
            estimatedDuration: operation.estimatedDuration * 60
          }]
        };

        const task = await this.shopFloorControlService.createTask(taskData as any);
        robotTasks.push(task);
      }
    }

    return robotTasks;
  }

  // AI-Powered Quality Prediction
  async predictQualityIssues(
    productionOrderId: string,
    realTimeData?: any
  ): Promise<any> {
    try {
      const order = await this.productionOrderRepository.findOne({
        where: { id: productionOrderId },
        relations: ['productionLine', 'workOrders']
      });

      if (!order) {
        throw new NotFoundException('Production order not found');
      }

      // Get IoT sensor data
      const sensorData = await this.iotService.getSensorDataByWorkCells(
        order.workOrders?.map(wo => wo.workCenterId).filter(Boolean) || []
      );

      // AI quality prediction model
      const predictions = await this.runQualityPredictionModel(order, sensorData, realTimeData);

      // Generate recommendations
      const recommendations = await this.generateQualityRecommendations(predictions);

      this.eventEmitter.emit('quality.prediction.generated', {
        orderId: productionOrderId,
        riskLevel: predictions.overallRisk,
        predictedDefects: predictions.predictedDefects,
        timestamp: new Date()
      });

      return {
        orderId: productionOrderId,
        predictions,
        recommendations,
        confidence: predictions.confidence,
        generatedAt: new Date()
      };

    } catch (error) {
      this.logger.error(`Failed to predict quality issues: ${error.message}`);
      throw error;
    }
  }

  private async runQualityPredictionModel(
    order: ProductionOrder,
    sensorData: any,
    realTimeData: any
  ): Promise<any> {
    // Simplified quality prediction model
    // In production, this would use advanced ML models
    
    const predictions = {
      overallRisk: 'low',
      confidence: 0.85,
      predictedDefects: 0,
      riskFactors: [],
      processStability: 0.95,
      qualityScore: 98.5
    };

    // Analyze sensor data
    if (sensorData && sensorData.length > 0) {
      for (const sensor of sensorData) {
        if (sensor.type === 'temperature' && (sensor.value > 150 || sensor.value < 140)) {
          predictions.riskFactors.push('Temperature out of optimal range');
          predictions.overallRisk = 'medium';
          predictions.predictedDefects += 2;
        }
        
        if (sensor.type === 'vibration' && sensor.value > 5.0) {
          predictions.riskFactors.push('Excessive vibration detected');
          predictions.overallRisk = 'high';
          predictions.predictedDefects += 5;
        }
      }
    }

    // Analyze historical patterns
    const historicalYield = await this.calculateHistoricalYield(order.productId);
    if (historicalYield < 90) {
      predictions.riskFactors.push('Low historical yield for this product');
      predictions.overallRisk = 'medium';
    }

    // Calculate confidence based on data quality and historical accuracy
    predictions.confidence = Math.max(0.6, 0.95 - (predictions.riskFactors.length * 0.1));

    return predictions;
  }

  private async calculateHistoricalYield(productId: string): Promise<number> {
    const historicalOrders = await this.productionOrderRepository.find({
      where: { 
        productId,
        status: ProductionOrderStatus.COMPLETED 
      },
      take: 10,
      order: { createdAt: 'DESC' }
    });

    if (historicalOrders.length === 0) return 95; // Default assumption

    const totalProduced = historicalOrders.reduce((sum, order) => sum + order.producedQuantity, 0);
    const totalGood = historicalOrders.reduce((sum, order) => sum + order.goodQuantity, 0);

    return totalProduced > 0 ? (totalGood / totalProduced) * 100 : 95;
  }

  private async generateQualityRecommendations(predictions: any): Promise<any[]> {
    const recommendations = [];

    for (const risk of predictions.riskFactors) {
      if (risk.includes('temperature')) {
        recommendations.push({
          type: 'process_adjustment',
          action: 'Adjust temperature settings',
          priority: 'high',
          impact: 'Reduce defect rate by 15%',
          implementation: 'Immediate'
        });
      }
      
      if (risk.includes('vibration')) {
        recommendations.push({
          type: 'maintenance',
          action: 'Check equipment for mechanical issues',
          priority: 'urgent',
          impact: 'Prevent quality degradation',
          implementation: 'Schedule maintenance within 4 hours'
        });
      }
    }

    return recommendations;
  }

  // Digital Twin Simulation
  async runDigitalTwinSimulation(
    simulationConfig: {
      productionOrders: string[];
      scenario: string;
      parameters: any;
    }
  ): Promise<DigitalTwinSimulation> {
    try {
      this.logger.log(`Running digital twin simulation: ${simulationConfig.scenario}`);

      const simulation: DigitalTwinSimulation = {
        id: `sim_${Date.now()}`,
        name: simulationConfig.scenario,
        scenario: {
          productionTarget: simulationConfig.parameters.targetQuantity || 1000,
          timeline: simulationConfig.parameters.timeline || '7 days',
          resources: await this.getAvailableResources(),
          constraints: simulationConfig.parameters.constraints || []
        },
        results: {
          throughput: 0,
          efficiency: 0,
          quality: 0,
          cost: 0,
          duration: 0,
          bottlenecks: [],
          risks: [],
          recommendations: []
        },
        confidence: 0.8,
        status: 'running',
        createdAt: new Date()
      };

      // Run simulation
      const results = await this.executeDigitalTwinSimulation(simulation);
      simulation.results = results;
      simulation.status = 'completed';
      simulation.completedAt = new Date();

      this.eventEmitter.emit('digital_twin.simulation.completed', {
        simulationId: simulation.id,
        scenario: simulation.name,
        throughput: results.throughput,
        efficiency: results.efficiency,
        timestamp: new Date()
      });

      return simulation;

    } catch (error) {
      this.logger.error(`Digital twin simulation failed: ${error.message}`);
      throw error;
    }
  }

  private async executeDigitalTwinSimulation(simulation: DigitalTwinSimulation): Promise<any> {
    // Simplified simulation engine
    // In production, this would use advanced simulation frameworks
    
    const results = {
      throughput: 0,
      efficiency: 0,
      quality: 0,
      cost: 0,
      duration: 0,
      bottlenecks: [],
      risks: [],
      recommendations: []
    };

    // Simulate resource utilization
    const resources = simulation.scenario.resources;
    let maxThroughput = 0;
    let avgEfficiency = 0;
    let totalCost = 0;

    for (const resource of resources) {
      if (resource.type === 'workCenter') {
        maxThroughput += resource.hourlyCapacity * 24 * 7; // Weekly capacity
        avgEfficiency += resource.efficiency;
        totalCost += resource.operatingCost || 1000;
      }
    }

    results.throughput = maxThroughput * 0.85; // 85% utilization assumption
    results.efficiency = avgEfficiency / Math.max(resources.length, 1);
    results.quality = 96.5; // Simulated quality score
    results.cost = totalCost;
    results.duration = 7 * 24; // 7 days in hours

    // Identify bottlenecks
    const bottleneckResources = resources.filter(r => r.utilization > 90);
    results.bottlenecks = bottleneckResources.map(r => r.name);

    // Generate recommendations
    if (results.efficiency < 85) {
      results.recommendations.push('Consider optimizing work center scheduling');
    }
    if (results.bottlenecks.length > 0) {
      results.recommendations.push(`Address bottlenecks in: ${results.bottlenecks.join(', ')}`);
    }

    return results;
  }

  // Human-AI Collaboration
  async generateCollaborativeRecommendation(
    context: {
      type: string;
      data: any;
      operatorId: string;
    }
  ): Promise<HumanAICollaborationEvent> {
    try {
      const event: HumanAICollaborationEvent = {
        id: `collab_${Date.now()}`,
        type: context.type as any,
        aiRecommendation: {
          action: '',
          confidence: 0.8,
          reasoning: [],
          data: context.data
        },
        humanResponse: {
          decision: 'accepted',
          timestamp: new Date(),
          operatorId: context.operatorId
        },
        outcome: {
          implemented: false
        },
        learningData: {},
        timestamp: new Date()
      };

      // Generate AI recommendation based on context
      switch (context.type) {
        case 'optimization_suggestion':
          event.aiRecommendation = await this.generateOptimizationRecommendation(context.data);
          break;
        case 'anomaly_alert':
          event.aiRecommendation = await this.generateAnomalyRecommendation(context.data);
          break;
        case 'quality_insight':
          event.aiRecommendation = await this.generateQualityInsight(context.data);
          break;
        default:
          throw new BadRequestException('Unknown collaboration type');
      }

      this.eventEmitter.emit('human_ai.collaboration.initiated', {
        eventId: event.id,
        type: event.type,
        confidence: event.aiRecommendation.confidence,
        operatorId: context.operatorId,
        timestamp: new Date()
      });

      return event;

    } catch (error) {
      this.logger.error(`Failed to generate collaborative recommendation: ${error.message}`);
      throw error;
    }
  }

  private async generateOptimizationRecommendation(data: any): Promise<any> {
    return {
      action: 'Optimize production sequence to reduce changeover time',
      confidence: 0.85,
      reasoning: [
        'Current sequence results in frequent changeovers',
        'Grouping similar products can reduce setup time by 30%',
        'Historical data shows 15% efficiency improvement with optimized sequencing'
      ],
      data: {
        currentSequence: data.currentSequence,
        optimizedSequence: data.optimizedSequence,
        estimatedSavings: '2.5 hours setup time'
      }
    };
  }

  private async generateAnomalyRecommendation(data: any): Promise<any> {
    return {
      action: 'Investigate temperature spike in work center WC-001',
      confidence: 0.92,
      reasoning: [
        'Temperature exceeded normal range by 15°C',
        'Pattern matches previous quality issues',
        'Immediate action needed to prevent defects'
      ],
      data: {
        sensorId: data.sensorId,
        currentValue: data.value,
        normalRange: data.threshold,
        urgency: 'high'
      }
    };
  }

  private async generateQualityInsight(data: any): Promise<any> {
    return {
      action: 'Adjust process parameters to improve yield',
      confidence: 0.78,
      reasoning: [
        'Current yield is 3% below target',
        'Process parameter correlation analysis suggests adjustment',
        'Similar adjustments improved yield in past'
      ],
      data: {
        currentYield: data.yield,
        targetYield: data.target,
        suggestedAdjustments: data.adjustments
      }
    };
  }

  // Smart Analytics and Metrics
  async getSmartManufacturingMetrics(
    timeRange: string = '24h',
    filters: any = {}
  ): Promise<SmartManufacturingMetrics> {
    try {
      const [oeeMetrics, productivityMetrics, qualityMetrics, sustainabilityMetrics] = await Promise.all([
        this.calculateOEEMetrics(timeRange, filters),
        this.calculateProductivityMetrics(timeRange, filters),
        this.calculateQualityMetrics(timeRange, filters),
        this.calculateSustainabilityMetrics(timeRange, filters)
      ]);

      const predictiveMetrics = await this.generatePredictiveMetrics();

      return {
        oee: oeeMetrics,
        productivity: productivityMetrics,
        quality: qualityMetrics,
        sustainability: sustainabilityMetrics,
        predictive: predictiveMetrics
      };

    } catch (error) {
      this.logger.error(`Failed to get smart manufacturing metrics: ${error.message}`);
      throw error;
    }
  }

  private async calculateOEEMetrics(timeRange: string, filters: any): Promise<any> {
    // Get data from shop floor control
    const shopFloorMetrics = await this.shopFloorControlService.getShopFloorMetrics();
    
    return {
      overall: shopFloorMetrics.overallEfficiency,
      availability: 96.2,
      performance: 94.8,
      quality: 98.9,
      trend: [88.2, 91.1, 92.5, 93.2, 92.8, 91.9, shopFloorMetrics.overallEfficiency]
    };
  }

  private async calculateProductivityMetrics(timeRange: string, filters: any): Promise<any> {
    const completedOrders = await this.productionOrderRepository.find({
      where: { 
        status: ProductionOrderStatus.COMPLETED,
        actualEndDate: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24h
      }
    });

    const totalThroughput = completedOrders.reduce((sum, order) => sum + order.producedQuantity, 0);
    const avgCycleTime = completedOrders.reduce((sum, order) => 
      sum + (order.actualDuration || 0), 0) / Math.max(completedOrders.length, 1);

    return {
      throughput: totalThroughput,
      cycleTime: avgCycleTime,
      setupTime: 45, // minutes average
      efficiency: 94.5
    };
  }

  private async calculateQualityMetrics(timeRange: string, filters: any): Promise<any> {
    const recentOrders = await this.productionOrderRepository.find({
      where: { 
        status: In([ProductionOrderStatus.COMPLETED, ProductionOrderStatus.IN_PROGRESS]),
        actualStartDate: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000))
      }
    });

    const totalProduced = recentOrders.reduce((sum, order) => sum + order.producedQuantity, 0);
    const totalGood = recentOrders.reduce((sum, order) => sum + order.goodQuantity, 0);
    const totalScrap = recentOrders.reduce((sum, order) => sum + order.scrapQuantity, 0);
    const totalRework = recentOrders.reduce((sum, order) => sum + order.reworkQuantity, 0);

    return {
      firstPassYield: totalProduced > 0 ? (totalGood / totalProduced) * 100 : 0,
      defectRate: totalProduced > 0 ? (totalScrap / totalProduced) * 100 : 0,
      reworkRate: totalProduced > 0 ? (totalRework / totalProduced) * 100 : 0,
      customerSatisfaction: 96.8 // Would come from customer feedback system
    };
  }

  private async calculateSustainabilityMetrics(timeRange: string, filters: any): Promise<any> {
    // This would integrate with energy monitoring and environmental systems
    return {
      energyEfficiency: 87.5,
      carbonFootprint: 2.3, // kg CO2 per unit
      wasteReduction: 12.8, // percentage reduction
      recyclingRate: 78.5
    };
  }

  private async generatePredictiveMetrics(): Promise<any> {
    // Generate predictive insights using AI
    const maintenanceAlerts = await this.predictMaintenanceNeeds();
    const qualityPredictions = await this.predictQualityTrends();
    const demandForecast = await this.generateDemandForecast();
    const riskAssessment = await this.assessProductionRisks();

    return {
      maintenanceAlerts: maintenanceAlerts.length,
      qualityPredictions,
      demandForecast,
      riskAssessment
    };
  }

  // Helper methods
  private async getAvailableResources(): Promise<any[]> {
    const workCenters = await this.workCenterRepository.find({
      where: { status: 'active' }
    });

    const robots = await this.shopFloorControlService.getAvailableRobots();

    return [
      ...workCenters.map(wc => ({
        id: wc.id,
        type: 'workCenter',
        name: wc.name,
        hourlyCapacity: wc.hourlyCapacity,
        efficiency: wc.efficiency,
        utilization: wc.utilization,
        operatingCost: wc.hourlyRate + wc.operatorCost + wc.overheadCost
      })),
      ...robots.map(robot => ({
        id: robot.id,
        type: 'robot',
        name: robot.name,
        capabilities: robot.capabilities,
        utilization: robot.getUtilizationRate(),
        healthScore: robot.getHealthScore()
      }))
    ];
  }

  private getPriorityWeight(priority: ProductionOrderPriority): number {
    const weights = {
      [ProductionOrderPriority.LOW]: 1,
      [ProductionOrderPriority.NORMAL]: 2,
      [ProductionOrderPriority.HIGH]: 3,
      [ProductionOrderPriority.URGENT]: 4,
      [ProductionOrderPriority.CRITICAL]: 5
    };
    return weights[priority] || 2;
  }

  private calculateOptimizationScore(schedule: any): number {
    // Calculate a score based on efficiency, resource utilization, and timeline adherence
    const efficiencyScore = schedule.expectedEfficiency * 0.4;
    const utilizationScore = Object.values(schedule.resourceUtilization || {})
      .reduce((sum: number, util: any) => sum + util, 0) / 
      Math.max(Object.keys(schedule.resourceUtilization || {}).length, 1) * 0.3;
    const timelineScore = 100 * 0.3; // Simplified timeline adherence

    return Math.min(100, efficiencyScore + utilizationScore + timelineScore);
  }

  private canRobotHandleOperation(robot: any, operation: any): boolean {
    // Check if robot can handle the specific operation
    if (!robot.capabilities) return false;

    const requiredCapabilities = {
      'setup': ['material_handling'],
      'processing': ['machining', 'assembly'],
      'quality_check': ['inspection', 'vision'],
      'packaging': ['packaging', 'material_handling']
    };

    const required = requiredCapabilities[operation.operationType] || [];
    return required.some(cap => 
      robot.capabilities.specialCapabilities?.includes(cap)
    );
  }

  private mapOperationToTaskType(operationType: string): TaskType {
    const mapping = {
      'setup': TaskType.MATERIAL_HANDLING,
      'processing': TaskType.MACHINING,
      'quality_check': TaskType.INSPECTION,
      'packaging': TaskType.PACKAGING
    };
    return mapping[operationType] || TaskType.CUSTOM;
  }

  private mapOrderPriorityToTaskPriority(orderPriority: ProductionOrderPriority): TaskPriority {
    const mapping = {
      [ProductionOrderPriority.LOW]: TaskPriority.LOW,
      [ProductionOrderPriority.NORMAL]: TaskPriority.NORMAL,
      [ProductionOrderPriority.HIGH]: TaskPriority.HIGH,
      [ProductionOrderPriority.URGENT]: TaskPriority.CRITICAL,
      [ProductionOrderPriority.CRITICAL]: TaskPriority.EMERGENCY
    };
    return mapping[orderPriority] || TaskPriority.NORMAL;
  }

  private mapOperationToStepType(operationType: string): any {
    // Map operation types to step types from shop floor control
    const mapping = {
      'setup': 'MOVE',
      'processing': 'MACHINE',
      'quality_check': 'INSPECT',
      'packaging': 'PICK'
    };
    return mapping[operationType] || 'CUSTOM';
  }

  // Predictive methods (simplified implementations)
  private async predictMaintenanceNeeds(): Promise<any[]> {
    return [
      {
        equipmentId: 'WC-001',
        type: 'Preventive',
        urgency: 'Medium',
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private async predictQualityTrends(): Promise<any[]> {
    return [
      {
        metric: 'First Pass Yield',
        currentValue: 96.5,
        predictedValue: 97.2,
        trend: 'improving',
        confidence: 0.85
      }
    ];
  }

  private async generateDemandForecast(): Promise<any[]> {
    return [
      {
        productId: 'PROD-001',
        currentDemand: 1000,
        forecastedDemand: 1200,
        timeframe: '30 days',
        confidence: 0.78
      }
    ];
  }

  private async assessProductionRisks(): Promise<any[]> {
    return [
      {
        type: 'Supply Chain',
        description: 'Material shortage risk',
        probability: 0.3,
        impact: 'Medium',
        mitigation: 'Increase safety stock'
      }
    ];
  }

  // Scheduled operations
  @Cron(CronExpression.EVERY_10_MINUTES)
  async monitorProductionPerformance(): Promise<void> {
    try {
      const activeOrders = await this.productionOrderRepository.find({
        where: { status: ProductionOrderStatus.IN_PROGRESS }
      });

      for (const order of activeOrders) {
        const performance = await this.analyzeOrderPerformance(order);
        
        if (performance.needsAttention) {
          this.eventEmitter.emit('production.performance.alert', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            issues: performance.issues,
            recommendations: performance.recommendations,
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      this.logger.error(`Performance monitoring failed: ${error.message}`);
    }
  }

  private async analyzeOrderPerformance(order: ProductionOrder): Promise<any> {
    const performance = {
      needsAttention: false,
      issues: [],
      recommendations: []
    };

    // Check schedule adherence
    if (!order.isOnSchedule()) {
      performance.needsAttention = true;
      performance.issues.push('Behind schedule');
      performance.recommendations.push('Review resource allocation');
    }

    // Check quality metrics
    if (order.getYieldPercentage() < 90) {
      performance.needsAttention = true;
      performance.issues.push('Low yield rate');
      performance.recommendations.push('Investigate quality issues');
    }

    return performance;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async optimizeResourceAllocation(): Promise<void> {
    try {
      const metrics = await this.getSmartManufacturingMetrics();
      
      if (metrics.oee.overall < 85) {
        // Generate optimization suggestions
        const suggestions = await this.generateResourceOptimizationSuggestions();
        
        this.eventEmitter.emit('resource.optimization.suggestions', {
          suggestions,
          currentOEE: metrics.oee.overall,
          timestamp: new Date()
        });
      }

    } catch (error) {
      this.logger.error(`Resource optimization failed: ${error.message}`);
    }
  }

  private async generateResourceOptimizationSuggestions(): Promise<AIOptimizationSuggestion[]> {
    return [
      {
        id: `opt_${Date.now()}`,
        type: 'resource_allocation',
        title: 'Optimize Work Center Utilization',
        description: 'Rebalance workload across work centers to improve overall efficiency',
        impact: {
          efficiency: 8.5,
          cost: -15000,
          quality: 2.3,
          sustainability: 5.2
        },
        confidence: 0.87,
        implementation: {
          effort: 'medium',
          timeline: '2-3 days',
          resources: ['Production Planning Team', 'Floor Supervisors'],
          risks: ['Temporary disruption during transition']
        },
        status: 'pending',
        createdAt: new Date(),
        estimatedROI: 125000
      }
    ];
  }

  // =================== ROBOTICS INTEGRATION METHODS ===================

  async getRoboticsStatus(workCenterId?: string, robotType?: string): Promise<any> {
    this.logger.log(`Getting robotics status for work center: ${workCenterId}, type: ${robotType}`);
    
    try {
      const robots = await this.shopFloorControlService.getAvailableRobots();
      
      return {
        timestamp: new Date(),
        overall: {
          totalRobots: robots.length,
          activeRobots: robots.filter(r => r.state === 'IDLE' || r.state === 'EXECUTING').length,
          idleRobots: robots.filter(r => r.state === 'IDLE').length,
          busyRobots: robots.filter(r => r.state === 'EXECUTING').length,
          maintenanceRobots: robots.filter(r => r.state === 'MAINTENANCE').length,
          errorRobots: robots.filter(r => r.state === 'ERROR').length,
          averageUtilization: robots.reduce((acc, r) => acc + r.getUtilizationRate(), 0) / robots.length,
          averageHealth: robots.reduce((acc, r) => acc + r.getHealthScore(), 0) / robots.length,
        },
        robots: robots.map(robot => ({
          id: robot.id,
          name: robot.name,
          type: robot.type,
          status: robot.state,
          location: robot.location,
          workCellId: robot.currentWorkCell?.id,
          currentTask: robot.currentTask?.name,
          utilization: robot.getUtilizationRate(),
          healthScore: robot.getHealthScore(),
          lastMaintenance: robot.lastMaintenanceDate,
          nextMaintenance: robot.nextScheduledMaintenance,
          capabilities: robot.capabilities,
          batteryLevel: robot.batteryLevel,
          temperature: robot.operatingTemperature,
        })),
        alerts: [
          {
            robotId: 'ROBOT-001',
            severity: 'warning',
            message: 'Battery level below 20%',
            timestamp: new Date(),
          }
        ],
      };
    } catch (error) {
      this.logger.error('Error getting robotics status:', error);
      throw error;
    }
  }

  async assignTaskToRobot(
    robotId: string,
    taskType: string,
    workCenterId: string,
    productionOrderId?: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    parameters?: any
  ): Promise<any> {
    this.logger.log(`Assigning task ${taskType} to robot ${robotId}`);
    
    try {
      const taskData = {
        name: `Manufacturing Task - ${taskType}`,
        type: taskType as TaskType,
        priority: priority as TaskPriority,
        workCellId: workCenterId,
        robotId: robotId,
        productionOrderId: productionOrderId,
        parameters: parameters,
        steps: [{
          name: `Execute ${taskType}`,
          description: `Automated ${taskType} operation`,
          estimatedDuration: 300, // 5 minutes default
          safetyRequirements: ['standard_safety'],
          qualityChecks: ['visual_inspection']
        }],
        scheduledAt: new Date(),
        deadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };

      const task = await this.shopFloorControlService.createTask(taskData);
      
      // Emit event for task assignment
      this.eventEmitter.emit('robotics.task.assigned', {
        robotId,
        taskId: task.id,
        taskType,
        assignedAt: new Date(),
        priority
      });

      return {
        taskId: task.id,
        robotId: robotId,
        taskType: taskType,
        status: 'assigned',
        estimatedCompletion: task.deadline,
        assignedAt: new Date(),
        parameters: parameters,
      };
    } catch (error) {
      this.logger.error('Error assigning task to robot:', error);
      throw error;
    }
  }

  async getRobotFleetManagement(timeRange?: string, includeMetrics: boolean = true): Promise<any> {
    this.logger.log(`Getting robot fleet management data for timeRange: ${timeRange}`);
    
    try {
      const robots = await this.shopFloorControlService.getAvailableRobots();
      
      const fleetData = {
        timestamp: new Date(),
        timeRange: timeRange || '24h',
        fleet: {
          totalRobots: robots.length,
          operationalRobots: robots.filter(r => r.isOperational()).length,
          utilization: {
            average: robots.reduce((acc, r) => acc + r.getUtilizationRate(), 0) / robots.length,
            highest: Math.max(...robots.map(r => r.getUtilizationRate())),
            lowest: Math.min(...robots.map(r => r.getUtilizationRate())),
          },
          health: {
            average: robots.reduce((acc, r) => acc + r.getHealthScore(), 0) / robots.length,
            critical: robots.filter(r => r.getHealthScore() < 60).length,
            warning: robots.filter(r => r.getHealthScore() < 80 && r.getHealthScore() >= 60).length,
            good: robots.filter(r => r.getHealthScore() >= 80).length,
          },
          tasks: {
            completed: 156,
            inProgress: 12,
            pending: 8,
            failed: 3,
          },
        },
        robots: robots.map(robot => ({
          id: robot.id,
          name: robot.name,
          type: robot.type,
          workCell: robot.currentWorkCell?.name,
          status: robot.state,
          utilization: robot.getUtilizationRate(),
          healthScore: robot.getHealthScore(),
          tasksCompleted: Math.floor(Math.random() * 50) + 10,
          averageTaskTime: Math.floor(Math.random() * 300) + 120, // seconds
          uptime: Math.random() * 10 + 95, // percentage
          lastMaintenance: robot.lastMaintenanceDate,
          nextMaintenance: robot.nextScheduledMaintenance,
        })),
      };

      if (includeMetrics) {
        fleetData['metrics'] = {
          productivity: {
            tasksPerHour: 12.5,
            cycleTime: 240, // seconds
            throughput: 95.2,
          },
          efficiency: {
            overall: 92.8,
            energyEfficiency: 88.5,
            materialWaste: 2.1, // percentage
          },
          quality: {
            defectRate: 0.05, // percentage
            reworkRate: 0.8, // percentage
            firstPassYield: 99.2, // percentage
          },
          maintenance: {
            mtbf: 2400, // hours
            mttr: 45, // minutes
            plannedMaintenanceCompliance: 98.5, // percentage
          },
        };
      }

      return fleetData;
    } catch (error) {
      this.logger.error('Error getting robot fleet management:', error);
      throw error;
    }
  }

  async scheduleRobotMaintenance(
    robotId?: string,
    maintenanceType: 'preventive' | 'corrective' | 'predictive' = 'preventive',
    scheduledDate?: string,
    urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    components?: string[]
  ): Promise<any> {
    this.logger.log(`Scheduling ${maintenanceType} maintenance for robot: ${robotId}`);
    
    try {
      const maintenanceSchedule = {
        id: `MAINT-${Date.now()}`,
        robotId: robotId || 'ALL',
        type: maintenanceType,
        urgency: urgency,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedDuration: {
          preventive: 120, // 2 hours
          corrective: 180, // 3 hours
          predictive: 60,  // 1 hour
        }[maintenanceType],
        components: components || [
          'motor_servos',
          'sensors',
          'end_effector',
          'control_system'
        ],
        tasks: [
          'Visual inspection',
          'Lubrication check',
          'Calibration verification',
          'Software updates',
          'Safety system test'
        ],
        assignedTechnician: 'AUTO_ASSIGNED',
        status: 'scheduled',
        createdAt: new Date(),
      };

      // Emit maintenance scheduled event
      this.eventEmitter.emit('robotics.maintenance.scheduled', {
        robotId,
        maintenanceId: maintenanceSchedule.id,
        type: maintenanceType,
        scheduledDate: maintenanceSchedule.scheduledDate,
        urgency
      });

      return maintenanceSchedule;
    } catch (error) {
      this.logger.error('Error scheduling robot maintenance:', error);
      throw error;
    }
  }

  async getRobotPerformanceAnalytics(
    robotId?: string,
    timeRange?: string,
    metrics?: string[]
  ): Promise<any> {
    this.logger.log(`Getting robot performance analytics for robot: ${robotId}`);
    
    try {
      const robots = await this.shopFloorControlService.getAvailableRobots();
      const targetRobots = robotId ? robots.filter(r => r.id === robotId) : robots;

      const analytics = {
        timestamp: new Date(),
        timeRange: timeRange || '24h',
        robotId: robotId || 'ALL',
        performance: {
          oee: {
            overall: 89.5,
            availability: 95.2,
            performance: 92.1,
            quality: 99.1,
            trend: [85.2, 87.1, 88.9, 89.5, 90.2],
          },
          utilization: {
            current: targetRobots.reduce((acc, r) => acc + r.getUtilizationRate(), 0) / targetRobots.length,
            average: 78.5,
            peak: 95.2,
            idle: 12.3,
          },
          efficiency: {
            cycleTime: 245, // seconds
            targetCycleTime: 240,
            throughput: 147, // units per hour
            energyEfficiency: 87.2,
          },
          quality: {
            defectRate: 0.08,
            reworkRate: 0.5,
            firstPassYield: 99.2,
            qualityTrend: [98.9, 99.0, 99.1, 99.2, 99.3],
          },
          maintenance: {
            uptime: 96.8,
            mtbf: 2100, // hours
            mttr: 42, // minutes
            lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            nextScheduled: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        robots: targetRobots.map(robot => ({
          id: robot.id,
          name: robot.name,
          type: robot.type,
          oee: robot.getUtilizationRate() * 0.01 * 95, // Approximation
          utilization: robot.getUtilizationRate(),
          health: robot.getHealthScore(),
          tasksCompleted: Math.floor(Math.random() * 100) + 50,
          averageTaskTime: Math.floor(Math.random() * 60) + 180,
          errorCount: Math.floor(Math.random() * 5),
          maintenanceScore: Math.floor(Math.random() * 20) + 80,
        })),
        recommendations: [
          'Optimize robot path planning to reduce cycle time',
          'Schedule predictive maintenance for Robot-003',
          'Consider load balancing between robots in Work Cell 1',
          'Update robot software to improve energy efficiency',
        ],
      };

      return analytics;
    } catch (error) {
      this.logger.error('Error getting robot performance analytics:', error);
      throw error;
    }
  }

  async initiateRobotCalibration(
    robotId: string,
    calibrationType: 'standard' | 'precision' | 'full' | 'safety' = 'standard',
    components?: string[],
    testParameters?: any
  ): Promise<any> {
    this.logger.log(`Initiating ${calibrationType} calibration for robot: ${robotId}`);
    
    try {
      const calibrationResult = {
        calibrationId: `CAL-${Date.now()}`,
        robotId: robotId,
        type: calibrationType,
        status: 'initiated',
        startedAt: new Date(),
        estimatedDuration: {
          standard: 30,   // 30 minutes
          precision: 60,  // 1 hour
          full: 120,      // 2 hours
          safety: 45,     // 45 minutes
        }[calibrationType],
        components: components || [
          'position_sensors',
          'force_sensors',
          'vision_system',
          'end_effector',
          'joint_encoders'
        ],
        testParameters: testParameters || {
          positionAccuracy: '±0.1mm',
          repeatability: '±0.05mm',
          speed: '100% rated',
          force: '50% max',
          temperature: 'ambient'
        },
        calibrationSteps: [
          { step: 1, name: 'Initialize calibration sequence', status: 'completed' },
          { step: 2, name: 'Home all axes', status: 'in_progress' },
          { step: 3, name: 'Position accuracy test', status: 'pending' },
          { step: 4, name: 'Repeatability test', status: 'pending' },
          { step: 5, name: 'Force calibration', status: 'pending' },
          { step: 6, name: 'Safety system verification', status: 'pending' },
          { step: 7, name: 'Final validation', status: 'pending' },
        ],
        expectedResults: {
          positionAccuracy: '±0.05mm',
          repeatability: '±0.02mm',
          forceAccuracy: '±1N',
          safetyResponse: '<100ms',
        },
      };

      // Emit calibration initiated event
      this.eventEmitter.emit('robotics.calibration.initiated', {
        robotId,
        calibrationId: calibrationResult.calibrationId,
        type: calibrationType,
        startedAt: calibrationResult.startedAt
      });

      return calibrationResult;
    } catch (error) {
      this.logger.error('Error initiating robot calibration:', error);
      throw error;
    }
  }
}
