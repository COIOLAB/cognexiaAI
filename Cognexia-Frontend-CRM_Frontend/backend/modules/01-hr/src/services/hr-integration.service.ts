// Industry 5.0 ERP Backend - HR Integration Service
// Advanced cross-module integration for seamless HR ecosystem connectivity
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { SocketService } from '../../../services/SocketService';
import { CrossModuleIntegrationService, ModuleEventData } from '../../../core/services/CrossModuleIntegrationService';
import { DatabaseConnection } from '../../../database/connection';

export interface HRIntegrationEvent {
  eventType: HREventType;
  source: string;
  target: string;
  data: any;
  timestamp: Date;
  organizationId: string;
  userId?: string;
  correlationId?: string;
}

export enum HREventType {
  // Employee Events
  EMPLOYEE_HIRED = 'employee_hired',
  EMPLOYEE_TERMINATED = 'employee_terminated',
  EMPLOYEE_PROMOTED = 'employee_promoted',
  EMPLOYEE_TRANSFERRED = 'employee_transferred',
  EMPLOYEE_STATUS_CHANGED = 'employee_status_changed',
  
  // Talent Acquisition Events
  CANDIDATE_INTERVIEWED = 'candidate_interviewed',
  CANDIDATE_HIRED = 'candidate_hired',
  CANDIDATE_REJECTED = 'candidate_rejected',
  JOB_POSTING_CREATED = 'job_posting_created',
  
  // Performance Events
  PERFORMANCE_REVIEW_COMPLETED = 'performance_review_completed',
  GOAL_ACHIEVED = 'goal_achieved',
  GOAL_MISSED = 'goal_missed',
  SKILL_UPDATED = 'skill_updated',
  
  // Compensation Events
  SALARY_UPDATED = 'salary_updated',
  BONUS_AWARDED = 'bonus_awarded',
  BENEFITS_ENROLLED = 'benefits_enrolled',
  EQUITY_GRANTED = 'equity_granted',
  
  // Payroll Events
  PAYROLL_PROCESSED = 'payroll_processed',
  PAYROLL_ERROR = 'payroll_error',
  TAX_CALCULATED = 'tax_calculated',
  
  // Time & Attendance Events
  SHIFT_STARTED = 'shift_started',
  SHIFT_ENDED = 'shift_ended',
  OVERTIME_RECORDED = 'overtime_recorded',
  ABSENCE_RECORDED = 'absence_recorded',
  
  // Learning & Development Events
  TRAINING_COMPLETED = 'training_completed',
  CERTIFICATION_EARNED = 'certification_earned',
  LEARNING_PATH_ASSIGNED = 'learning_path_assigned',
  
  // Workforce Planning Events
  STAFFING_NEED_IDENTIFIED = 'staffing_need_identified',
  CAPACITY_UPDATED = 'capacity_updated',
  WORKFORCE_FORECAST_UPDATED = 'workforce_forecast_updated'
}

export interface IntegrationMapping {
  id: string;
  sourceModule: string;
  targetModule: string;
  sourceEvent: string;
  targetAction: string;
  dataTransform?: (data: any) => any;
  conditions?: (data: any) => boolean;
  enabled: boolean;
  priority: number;
  retryCount: number;
  timeout: number;
}

export class HRIntegrationService extends EventEmitter {
  private crossModuleService: CrossModuleIntegrationService;
  private integrationMappings: Map<string, IntegrationMapping> = new Map();
  private eventQueue: HRIntegrationEvent[] = [];
  private isProcessing = false;
  private healthMetrics = {
    eventsProcessed: 0,
    eventsQueued: 0,
    integrationErrors: 0,
    lastProcessedTime: new Date(),
    integrationStatus: 'healthy' as 'healthy' | 'degraded' | 'critical'
  };

  constructor(crossModuleService: CrossModuleIntegrationService) {
    super();
    this.crossModuleService = crossModuleService;
    this.initializeDefaultMappings();
    this.startEventProcessing();
    this.setupHealthMonitoring();
  }

  /**
   * Initialize default integration mappings between HR and other modules
   */
  private initializeDefaultMappings(): void {
    // HR → Production Planning Integration
    this.addIntegrationMapping({
      id: 'hr-to-production-staffing',
      sourceModule: 'hr',
      targetModule: 'production-planning',
      sourceEvent: HREventType.STAFFING_NEED_IDENTIFIED,
      targetAction: 'updateStaffingRequirements',
      dataTransform: (data) => ({
        departmentId: data.departmentId,
        skillsRequired: data.skillsRequired,
        headcountNeeded: data.headcountNeeded,
        urgency: data.urgency,
        expectedFulfillmentDate: data.expectedFulfillmentDate
      }),
      enabled: true,
      priority: 1,
      retryCount: 3,
      timeout: 30000
    });

    // HR → Supply Chain Integration (Workforce Capacity)
    this.addIntegrationMapping({
      id: 'hr-to-supply-chain-capacity',
      sourceModule: 'hr',
      targetModule: 'supply-chain',
      sourceEvent: HREventType.CAPACITY_UPDATED,
      targetAction: 'updateWarehouseStaffing',
      dataTransform: (data) => ({
        warehouseId: data.locationId,
        staffCount: data.availableStaff,
        shiftCapacity: data.shiftCapacity,
        skillDistribution: data.skillDistribution,
        effectiveDate: data.effectiveDate
      }),
      conditions: (data) => data.locationType === 'warehouse',
      enabled: true,
      priority: 1,
      retryCount: 2,
      timeout: 20000
    });

    // HR → Shop Floor Control Integration
    this.addIntegrationMapping({
      id: 'hr-to-shop-floor-operator',
      sourceModule: 'hr',
      targetModule: 'shop-floor-control',
      sourceEvent: HREventType.EMPLOYEE_HIRED,
      targetAction: 'registerOperator',
      dataTransform: (data) => ({
        operatorId: data.employeeId,
        operatorName: data.employeeName,
        skillLevel: this.mapHRSkillToShopFloor(data.skillLevel),
        certifications: data.certifications || [],
        preferences: data.workPreferences || {}
      }),
      conditions: (data) => data.department === 'manufacturing' || data.role.includes('operator'),
      enabled: true,
      priority: 1,
      retryCount: 3,
      timeout: 25000
    });

    // HR → Quality Management Integration
    this.addIntegrationMapping({
      id: 'hr-to-quality-inspector',
      sourceModule: 'hr',
      targetModule: 'quality-management',
      sourceEvent: HREventType.CERTIFICATION_EARNED,
      targetAction: 'updateInspectorCertification',
      dataTransform: (data) => ({
        inspectorId: data.employeeId,
        certificationType: data.certificationType,
        certificationLevel: data.certificationLevel,
        validFrom: data.certificationDate,
        validTo: data.expirationDate,
        issuingAuthority: data.issuingAuthority
      }),
      conditions: (data) => data.certificationType.includes('quality') || data.role.includes('inspector'),
      enabled: true,
      priority: 2,
      retryCount: 2,
      timeout: 15000
    });

    // Production Planning → HR Integration (Resource Requirements)
    this.addIntegrationMapping({
      id: 'production-to-hr-resource-needs',
      sourceModule: 'production-planning',
      targetModule: 'hr',
      sourceEvent: 'PRODUCTION_PLAN_CREATED',
      targetAction: 'forecastWorkforceNeeds',
      dataTransform: (data) => ({
        productionPlanId: data.planId,
        requiredSkills: data.resourceRequirements?.skills || [],
        requiredHeadcount: data.resourceRequirements?.headcount || 0,
        timeframe: data.plannedDuration,
        priority: data.priority,
        location: data.facility
      }),
      enabled: true,
      priority: 1,
      retryCount: 3,
      timeout: 30000
    });

    // Supply Chain → HR Integration (Logistics Staffing)
    this.addIntegrationMapping({
      id: 'supply-chain-to-hr-logistics',
      sourceModule: 'supply-chain',
      targetModule: 'hr',
      sourceEvent: 'SHIPMENT_VOLUME_SPIKE',
      targetAction: 'requestTemporaryStaffing',
      dataTransform: (data) => ({
        locationId: data.warehouseId,
        staffingType: 'temporary',
        requiredSkills: ['logistics', 'material_handling'],
        urgency: 'high',
        duration: data.expectedDuration,
        shiftRequirements: data.additionalShifts
      }),
      conditions: (data) => data.volumeIncrease > 0.3, // 30% volume spike
      enabled: true,
      priority: 1,
      retryCount: 2,
      timeout: 20000
    });

    // Shop Floor Control → HR Integration (Operator Performance)
    this.addIntegrationMapping({
      id: 'shop-floor-to-hr-performance',
      sourceModule: 'shop-floor-control',
      targetModule: 'hr',
      sourceEvent: 'OPERATOR_PERFORMANCE_UPDATED',
      targetAction: 'updateEmployeePerformance',
      dataTransform: (data) => ({
        employeeId: data.operatorId,
        performanceMetrics: {
          productivity: data.productivity,
          quality: data.qualityScore,
          safety: data.safetyScore,
          efficiency: data.efficiency
        },
        period: data.measurementPeriod,
        source: 'shop-floor-control'
      }),
      enabled: true,
      priority: 2,
      retryCount: 2,
      timeout: 15000
    });

    logger.info('🔗 HR Integration mappings initialized');
  }

  /**
   * Add a new integration mapping
   */
  public addIntegrationMapping(mapping: IntegrationMapping): void {
    this.integrationMappings.set(mapping.id, mapping);
    logger.debug(`✅ Added HR integration mapping: ${mapping.id}`);
  }

  /**
   * Remove an integration mapping
   */
  public removeIntegrationMapping(mappingId: string): void {
    this.integrationMappings.delete(mappingId);
    logger.debug(`❌ Removed HR integration mapping: ${mappingId}`);
  }

  /**
   * Publish an HR event to the integration system
   */
  public async publishHREvent(event: HRIntegrationEvent): Promise<void> {
    try {
      // Add correlation ID if not provided
      if (!event.correlationId) {
        event.correlationId = `hr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Add to event queue
      this.eventQueue.push(event);
      this.healthMetrics.eventsQueued = this.eventQueue.length;

      // Cache event for audit trail
      await CacheService.set(
        `hr-event:${event.correlationId}`,
        event,
        3600 // 1 hour TTL
      );

      // Emit for real-time listeners
      this.emit('hrEvent', event);

      // Broadcast via WebSocket
      SocketService.broadcast('hr:integration-event', {
        eventType: event.eventType,
        source: event.source,
        target: event.target,
        timestamp: event.timestamp,
        correlationId: event.correlationId
      });

      logger.debug(`📤 HR event published: ${event.eventType} (${event.correlationId})`);

    } catch (error) {
      logger.error('❌ Failed to publish HR event:', error);
      this.healthMetrics.integrationErrors++;
      throw error;
    }
  }

  /**
   * Subscribe to events from other modules
   */
  public subscribeToModuleEvents(): void {
    // Subscribe to cross-module events
    this.crossModuleService.subscribeToEvent('PRODUCTION_PLAN_CREATED' as any, (eventData) => {
      this.handleExternalModuleEvent('production-planning', eventData);
    });

    this.crossModuleService.subscribeToEvent('SHIPMENT_VOLUME_SPIKE' as any, (eventData) => {
      this.handleExternalModuleEvent('supply-chain', eventData);
    });

    this.crossModuleService.subscribeToEvent('OPERATOR_PERFORMANCE_UPDATED' as any, (eventData) => {
      this.handleExternalModuleEvent('shop-floor-control', eventData);
    });

    logger.info('👂 Subscribed to external module events');
  }

  /**
   * Handle events from other modules
   */
  private async handleExternalModuleEvent(sourceModule: string, eventData: ModuleEventData): Promise<void> {
    try {
      // Find applicable integration mappings
      const applicableMappings = Array.from(this.integrationMappings.values())
        .filter(mapping => 
          mapping.sourceModule === sourceModule &&
          mapping.sourceEvent === eventData.eventType &&
          mapping.enabled &&
          (!mapping.conditions || mapping.conditions(eventData.data))
        );

      for (const mapping of applicableMappings) {
        await this.processIntegrationMapping(mapping, eventData);
      }

    } catch (error) {
      logger.error(`❌ Error handling event from ${sourceModule}:`, error);
      this.healthMetrics.integrationErrors++;
    }
  }

  /**
   * Process integration mapping
   */
  private async processIntegrationMapping(
    mapping: IntegrationMapping, 
    eventData: ModuleEventData
  ): Promise<void> {
    try {
      // Transform data if needed
      const transformedData = mapping.dataTransform 
        ? mapping.dataTransform(eventData.data)
        : eventData.data;

      // Create HR integration event
      const hrEvent: HRIntegrationEvent = {
        eventType: mapping.sourceEvent as HREventType,
        source: mapping.sourceModule,
        target: mapping.targetModule,
        data: transformedData,
        timestamp: new Date(),
        organizationId: eventData.organizationId,
        userId: eventData.userId,
        correlationId: `integration-${Date.now()}-${mapping.id}`
      };

      // Process based on target action
      await this.executeTargetAction(mapping.targetAction, hrEvent);

      logger.debug(`🔄 Processed integration mapping: ${mapping.id}`);

    } catch (error) {
      logger.error(`❌ Failed to process mapping ${mapping.id}:`, error);
      this.healthMetrics.integrationErrors++;
      
      // Retry logic could be implemented here
      if (mapping.retryCount > 0) {
        mapping.retryCount--;
        // Schedule retry...
      }
    }
  }

  /**
   * Execute target action based on the integration mapping
   */
  private async executeTargetAction(action: string, event: HRIntegrationEvent): Promise<void> {
    try {
      switch (action) {
        case 'updateStaffingRequirements':
          await this.updateStaffingRequirements(event.data);
          break;
        
        case 'updateWarehouseStaffing':
          await this.updateWarehouseStaffing(event.data);
          break;
        
        case 'registerOperator':
          await this.registerOperator(event.data);
          break;
        
        case 'updateInspectorCertification':
          await this.updateInspectorCertification(event.data);
          break;
        
        case 'forecastWorkforceNeeds':
          await this.forecastWorkforceNeeds(event.data);
          break;
        
        case 'requestTemporaryStaffing':
          await this.requestTemporaryStaffing(event.data);
          break;
        
        case 'updateEmployeePerformance':
          await this.updateEmployeePerformance(event.data);
          break;
        
        default:
          logger.warn(`⚠️ Unknown target action: ${action}`);
      }

    } catch (error) {
      logger.error(`❌ Failed to execute target action ${action}:`, error);
      throw error;
    }
  }

  /**
   * Target action implementations
   */
  private async updateStaffingRequirements(data: any): Promise<void> {
    // Update workforce planning based on production requirements
    logger.info(`📊 Updating staffing requirements: ${JSON.stringify(data)}`);
    // Implementation would call HR workforce planning service
  }

  private async updateWarehouseStaffing(data: any): Promise<void> {
    // Update warehouse staffing based on capacity changes
    logger.info(`🏭 Updating warehouse staffing: ${JSON.stringify(data)}`);
    // Implementation would call HR time & attendance service
  }

  private async registerOperator(data: any): Promise<void> {
    // Register new operator in shop floor control systems
    logger.info(`👷 Registering operator: ${JSON.stringify(data)}`);
    // Implementation would call shop floor control service
  }

  private async updateInspectorCertification(data: any): Promise<void> {
    // Update quality inspector certifications
    logger.info(`🔍 Updating inspector certification: ${JSON.stringify(data)}`);
    // Implementation would call quality management service
  }

  private async forecastWorkforceNeeds(data: any): Promise<void> {
    // Forecast workforce needs based on production plans
    logger.info(`📈 Forecasting workforce needs: ${JSON.stringify(data)}`);
    // Implementation would call HR analytics service
  }

  private async requestTemporaryStaffing(data: any): Promise<void> {
    // Request temporary staffing for logistics operations
    logger.info(`⏱️ Requesting temporary staffing: ${JSON.stringify(data)}`);
    // Implementation would call HR talent acquisition service
  }

  private async updateEmployeePerformance(data: any): Promise<void> {
    // Update employee performance from shop floor metrics
    logger.info(`📈 Updating employee performance: ${JSON.stringify(data)}`);
    // Implementation would call HR performance management service
  }

  /**
   * Utility method to map HR skills to shop floor control skills
   */
  private mapHRSkillToShopFloor(hrSkillLevel: string): string {
    const skillMapping = {
      'entry': 'beginner',
      'junior': 'beginner',
      'intermediate': 'intermediate',
      'senior': 'advanced',
      'expert': 'expert',
      'master': 'expert'
    };
    
    return skillMapping[hrSkillLevel] || 'intermediate';
  }

  /**
   * Start processing events from the queue
   */
  private startEventProcessing(): void {
    setInterval(async () => {
      if (this.isProcessing || this.eventQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        const events = this.eventQueue.splice(0, 5); // Process 5 events at a time
        
        await Promise.all(events.map(async (event) => {
          try {
            await this.processHREvent(event);
            this.healthMetrics.eventsProcessed++;
          } catch (error) {
            logger.error(`❌ Error processing HR event ${event.correlationId}:`, error);
            this.healthMetrics.integrationErrors++;
          }
        }));

        this.healthMetrics.lastProcessedTime = new Date();
        this.healthMetrics.eventsQueued = this.eventQueue.length;

      } catch (error) {
        logger.error('❌ Error in event processing cycle:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 2000); // Process every 2 seconds
  }

  /**
   * Process individual HR event
   */
  private async processHREvent(event: HRIntegrationEvent): Promise<void> {
    // Find applicable integration mappings
    const applicableMappings = Array.from(this.integrationMappings.values())
      .filter(mapping => 
        mapping.sourceModule === 'hr' &&
        mapping.sourceEvent === event.eventType &&
        mapping.enabled &&
        (!mapping.conditions || mapping.conditions(event.data))
      );

    // Process each applicable mapping
    for (const mapping of applicableMappings) {
      await this.processIntegrationMapping(mapping, {
        moduleId: event.source,
        eventType: event.eventType as any,
        entityId: event.data.id || 'unknown',
        entityType: event.eventType,
        data: event.data,
        timestamp: event.timestamp,
        userId: event.userId,
        organizationId: event.organizationId
      });
    }
  }

  /**
   * Setup health monitoring
   */
  private setupHealthMonitoring(): void {
    setInterval(() => {
      const now = new Date();
      const timeSinceLastProcessed = now.getTime() - this.healthMetrics.lastProcessedTime.getTime();
      
      // Update health status based on metrics
      if (this.healthMetrics.integrationErrors > 10 || timeSinceLastProcessed > 300000) { // 5 minutes
        this.healthMetrics.integrationStatus = 'critical';
      } else if (this.healthMetrics.integrationErrors > 5 || timeSinceLastProcessed > 120000) { // 2 minutes
        this.healthMetrics.integrationStatus = 'degraded';
      } else {
        this.healthMetrics.integrationStatus = 'healthy';
      }

    }, 30000); // Check every 30 seconds
  }

  /**
   * Get integration health status
   */
  public getHealthStatus(): any {
    return {
      ...this.healthMetrics,
      activeMappings: this.integrationMappings.size,
      queueLength: this.eventQueue.length,
      timestamp: new Date()
    };
  }

  /**
   * Get integration statistics
   */
  public getIntegrationStats(): any {
    return {
      totalMappings: this.integrationMappings.size,
      enabledMappings: Array.from(this.integrationMappings.values()).filter(m => m.enabled).length,
      eventsProcessed: this.healthMetrics.eventsProcessed,
      eventsQueued: this.healthMetrics.eventsQueued,
      errorCount: this.healthMetrics.integrationErrors,
      uptime: Date.now() - this.healthMetrics.lastProcessedTime.getTime(),
      status: this.healthMetrics.integrationStatus
    };
  }

  /**
   * Cleanup and shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('🔄 Shutting down HR Integration Service...');
    
    // Process remaining events
    if (this.eventQueue.length > 0) {
      logger.info(`📝 Processing ${this.eventQueue.length} remaining events...`);
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event) {
          try {
            await this.processHREvent(event);
          } catch (error) {
            logger.error('❌ Error processing final event:', error);
          }
        }
      }
    }
    
    logger.info('✅ HR Integration Service shutdown complete');
  }
}
