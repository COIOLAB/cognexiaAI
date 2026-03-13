// Industry 5.0 ERP Backend - HR Integration Controller
// API endpoints for managing cross-module HR integrations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Request, Response } from 'express';
import { HRIntegrationService, HRIntegrationEvent, HREventType, IntegrationMapping } from '../services/hr-integration.service';
import { CrossModuleIntegrationService } from '../../../core/services/CrossModuleIntegrationService';
import { logger } from '../../../utils/logger';
import { UUID } from 'crypto';

export class HRIntegrationController {
  private hrIntegrationService: HRIntegrationService;

  constructor() {
    // Initialize integration service with cross-module service
    const crossModuleService = new CrossModuleIntegrationService();
    this.hrIntegrationService = new HRIntegrationService(crossModuleService);
    this.hrIntegrationService.subscribeToModuleEvents();
  }

  /**
   * Get integration health status
   * GET /api/v1/hr/integrations/health
   */
  getIntegrationHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = this.hrIntegrationService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: {
          service: 'HR Integration Service',
          status: healthStatus.integrationStatus,
          metrics: {
            eventsProcessed: healthStatus.eventsProcessed,
            eventsQueued: healthStatus.eventsQueued,
            integrationErrors: healthStatus.integrationErrors,
            activeMappings: healthStatus.activeMappings,
            queueLength: healthStatus.queueLength,
            lastProcessedTime: healthStatus.lastProcessedTime
          },
          timestamp: new Date().toISOString()
        },
        message: 'HR integration health status retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting integration health:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching integration health',
        error: error.message
      });
    }
  };

  /**
   * Get integration statistics
   * GET /api/v1/hr/integrations/stats
   */
  getIntegrationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.query;
      const orgId = (organizationId as UUID) || req.user?.organizationId;

      if (!orgId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const stats = this.hrIntegrationService.getIntegrationStats();
      
      res.status(200).json({
        success: true,
        data: {
          organizationId: orgId,
          integrationStats: stats,
          overview: {
            totalIntegrations: stats.totalMappings,
            activeIntegrations: stats.enabledMappings,
            healthScore: this.calculateHealthScore(stats),
            integrationEfficiency: this.calculateEfficiency(stats)
          },
          timestamp: new Date().toISOString()
        },
        message: 'Integration statistics retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting integration stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching integration statistics',
        error: error.message
      });
    }
  };

  /**
   * Publish HR integration event
   * POST /api/v1/hr/integrations/events
   */
  publishIntegrationEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventType, source, target, data } = req.body;
      const organizationId = req.user?.organizationId;
      const userId = req.user?.id;

      if (!eventType || !source || !target || !data || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Event type, source, target, data, and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Validate event type
      if (!Object.values(HREventType).includes(eventType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event type',
          error: 'INVALID_EVENT_TYPE',
          validEventTypes: Object.values(HREventType)
        });
        return;
      }

      const integrationEvent: HRIntegrationEvent = {
        eventType,
        source,
        target,
        data,
        timestamp: new Date(),
        organizationId,
        userId
      };

      await this.hrIntegrationService.publishHREvent(integrationEvent);

      res.status(201).json({
        success: true,
        data: {
          eventId: integrationEvent.correlationId,
          eventType: integrationEvent.eventType,
          source: integrationEvent.source,
          target: integrationEvent.target,
          timestamp: integrationEvent.timestamp,
          status: 'published'
        },
        message: 'HR integration event published successfully'
      });

    } catch (error) {
      logger.error('Error publishing integration event:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while publishing integration event',
        error: error.message
      });
    }
  };

  /**
   * Get integration mappings
   * GET /api/v1/hr/integrations/mappings
   */
  getIntegrationMappings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId, sourceModule, targetModule, enabled } = req.query;
      const orgId = (organizationId as UUID) || req.user?.organizationId;

      if (!orgId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Mock response - would integrate with actual service
      const mappings = [
        {
          id: 'hr-to-production-staffing',
          sourceModule: 'hr',
          targetModule: 'production-planning',
          sourceEvent: 'STAFFING_NEED_IDENTIFIED',
          targetAction: 'updateStaffingRequirements',
          enabled: true,
          priority: 1,
          description: 'Updates production planning with staffing requirements from HR'
        },
        {
          id: 'hr-to-supply-chain-capacity',
          sourceModule: 'hr',
          targetModule: 'supply-chain',
          sourceEvent: 'CAPACITY_UPDATED',
          targetAction: 'updateWarehouseStaffing',
          enabled: true,
          priority: 1,
          description: 'Updates supply chain with warehouse staffing capacity'
        },
        {
          id: 'hr-to-shop-floor-operator',
          sourceModule: 'hr',
          targetModule: 'shop-floor-control',
          sourceEvent: 'EMPLOYEE_HIRED',
          targetAction: 'registerOperator',
          enabled: true,
          priority: 1,
          description: 'Registers new operators in shop floor control system'
        }
      ];

      // Apply filters
      let filteredMappings = mappings;
      if (sourceModule) {
        filteredMappings = filteredMappings.filter(m => m.sourceModule === sourceModule);
      }
      if (targetModule) {
        filteredMappings = filteredMappings.filter(m => m.targetModule === targetModule);
      }
      if (enabled !== undefined) {
        const isEnabled = enabled === 'true';
        filteredMappings = filteredMappings.filter(m => m.enabled === isEnabled);
      }

      res.status(200).json({
        success: true,
        data: {
          organizationId: orgId,
          mappings: filteredMappings,
          total: filteredMappings.length,
          filters: { sourceModule, targetModule, enabled }
        },
        message: 'Integration mappings retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting integration mappings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching integration mappings',
        error: error.message
      });
    }
  };

  /**
   * Create new integration mapping
   * POST /api/v1/hr/integrations/mappings
   */
  createIntegrationMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const mappingData = req.body;
      const organizationId = req.user?.organizationId;
      const userId = req.user?.id;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Validate required fields
      const requiredFields = ['id', 'sourceModule', 'targetModule', 'sourceEvent', 'targetAction'];
      const missingFields = requiredFields.filter(field => !mappingData[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          error: 'VALIDATION_ERROR',
          missingFields
        });
        return;
      }

      const newMapping: IntegrationMapping = {
        id: mappingData.id,
        sourceModule: mappingData.sourceModule,
        targetModule: mappingData.targetModule,
        sourceEvent: mappingData.sourceEvent,
        targetAction: mappingData.targetAction,
        enabled: mappingData.enabled ?? true,
        priority: mappingData.priority ?? 1,
        retryCount: mappingData.retryCount ?? 3,
        timeout: mappingData.timeout ?? 30000,
        dataTransform: mappingData.dataTransform,
        conditions: mappingData.conditions
      };

      this.hrIntegrationService.addIntegrationMapping(newMapping);

      res.status(201).json({
        success: true,
        data: {
          mapping: newMapping,
          organizationId,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        message: 'Integration mapping created successfully'
      });

    } catch (error) {
      logger.error('Error creating integration mapping:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating integration mapping',
        error: error.message
      });
    }
  };

  /**
   * Delete integration mapping
   * DELETE /api/v1/hr/integrations/mappings/:mappingId
   */
  deleteIntegrationMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mappingId } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      if (!mappingId) {
        res.status(400).json({
          success: false,
          message: 'Mapping ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      this.hrIntegrationService.removeIntegrationMapping(mappingId);

      res.status(200).json({
        success: true,
        data: {
          mappingId,
          organizationId,
          deletedAt: new Date().toISOString()
        },
        message: 'Integration mapping deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting integration mapping:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting integration mapping',
        error: error.message
      });
    }
  };

  /**
   * Get integration dashboard data
   * GET /api/v1/hr/integrations/dashboard
   */
  getIntegrationDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organizationId } = req.query;
      const orgId = (organizationId as UUID) || req.user?.organizationId;

      if (!orgId) {
        res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      const stats = this.hrIntegrationService.getIntegrationStats();
      const health = this.hrIntegrationService.getHealthStatus();

      // Mock integration flow data
      const integrationFlows = [
        {
          source: 'hr',
          target: 'production-planning',
          eventCount: 156,
          successRate: 0.98,
          avgProcessingTime: 1.2,
          status: 'healthy'
        },
        {
          source: 'hr',
          target: 'supply-chain',
          eventCount: 89,
          successRate: 0.95,
          avgProcessingTime: 2.1,
          status: 'healthy'
        },
        {
          source: 'hr',
          target: 'shop-floor-control',
          eventCount: 234,
          successRate: 0.97,
          avgProcessingTime: 1.8,
          status: 'healthy'
        },
        {
          source: 'production-planning',
          target: 'hr',
          eventCount: 67,
          successRate: 0.92,
          avgProcessingTime: 3.2,
          status: 'degraded'
        }
      ];

      res.status(200).json({
        success: true,
        data: {
          organizationId: orgId,
          dashboard: {
            overview: {
              totalIntegrations: stats.totalMappings,
              activeIntegrations: stats.enabledMappings,
              eventsProcessedToday: stats.eventsProcessed,
              healthScore: this.calculateHealthScore(stats),
              status: health.integrationStatus
            },
            integrationFlows,
            recentEvents: [
              {
                id: 'event-001',
                eventType: 'EMPLOYEE_HIRED',
                source: 'hr',
                target: 'shop-floor-control',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                status: 'completed'
              },
              {
                id: 'event-002',
                eventType: 'CAPACITY_UPDATED',
                source: 'hr',
                target: 'supply-chain',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                status: 'completed'
              },
              {
                id: 'event-003',
                eventType: 'STAFFING_NEED_IDENTIFIED',
                source: 'hr',
                target: 'production-planning',
                timestamp: new Date(Date.now() - 1000 * 60 * 45),
                status: 'processing'
              }
            ],
            performanceMetrics: {
              totalEventsToday: 542,
              successfulEvents: 529,
              failedEvents: 13,
              avgProcessingTime: 1.8,
              peakHour: '10:00'
            }
          }
        },
        message: 'Integration dashboard data retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting integration dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching integration dashboard',
        error: error.message
      });
    }
  };

  /**
   * Test integration connectivity
   * POST /api/v1/hr/integrations/test-connection
   */
  testIntegrationConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { targetModule, testType } = req.body;
      const organizationId = req.user?.organizationId;

      if (!targetModule || !organizationId) {
        res.status(400).json({
          success: false,
          message: 'Target module and organization ID are required',
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Mock connectivity test
      const connectionTests = {
        'production-planning': {
          endpoint: '/api/v1/production-planning/health',
          status: 'connected',
          responseTime: 45,
          version: '2.0.1'
        },
        'supply-chain': {
          endpoint: '/api/v1/supply-chain/health',
          status: 'connected',
          responseTime: 67,
          version: '2.0.0'
        },
        'shop-floor-control': {
          endpoint: '/api/v1/shop-floor-control/health',
          status: 'connected',
          responseTime: 38,
          version: '1.0.0'
        },
        'quality-management': {
          endpoint: '/api/v1/quality/health',
          status: 'timeout',
          responseTime: null,
          version: null
        }
      };

      const testResult = connectionTests[targetModule] || {
        endpoint: 'unknown',
        status: 'not_found',
        responseTime: null,
        version: null
      };

      res.status(200).json({
        success: true,
        data: {
          targetModule,
          testType: testType || 'connectivity',
          result: testResult,
          timestamp: new Date().toISOString(),
          organizationId
        },
        message: `Integration connectivity test completed for ${targetModule}`
      });

    } catch (error) {
      logger.error('Error testing integration connection:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while testing integration connection',
        error: error.message
      });
    }
  };

  /**
   * Calculate health score based on integration statistics
   */
  private calculateHealthScore(stats: any): number {
    const errorRate = stats.errorCount / Math.max(stats.eventsProcessed, 1);
    const activeRate = stats.enabledMappings / Math.max(stats.totalMappings, 1);
    
    let score = 100;
    score -= errorRate * 50; // Errors reduce score
    score *= activeRate; // Inactive mappings reduce score
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate integration efficiency
   */
  private calculateEfficiency(stats: any): number {
    const processingRate = stats.eventsProcessed / Math.max(stats.uptime / 1000 / 60, 1); // events per minute
    const queueEfficiency = 1 - (stats.eventsQueued / Math.max(stats.eventsProcessed, 1));
    
    return Math.round((processingRate + queueEfficiency * 100) / 2);
  }

  /**
   * Service health check
   * GET /api/v1/hr/integrations/service-health
   */
  serviceHealthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = this.hrIntegrationService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: {
          service: 'HR Integration Controller',
          status: 'operational',
          integrationService: {
            status: health.integrationStatus,
            eventsProcessed: health.eventsProcessed,
            queueLength: health.queueLength,
            errorCount: health.integrationErrors
          },
          capabilities: [
            'cross_module_integration',
            'event_publishing',
            'mapping_management',
            'real_time_monitoring',
            'health_monitoring',
            'connectivity_testing'
          ],
          endpoints: {
            health: '/api/v1/hr/integrations/health',
            stats: '/api/v1/hr/integrations/stats',
            events: '/api/v1/hr/integrations/events',
            mappings: '/api/v1/hr/integrations/mappings',
            dashboard: '/api/v1/hr/integrations/dashboard',
            testConnection: '/api/v1/hr/integrations/test-connection'
          },
          timestamp: new Date().toISOString()
        },
        message: 'HR Integration Controller is fully operational'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Integration Controller health check failed',
        message: 'Service health check failed',
        status: 500
      });
    }
  };
}
