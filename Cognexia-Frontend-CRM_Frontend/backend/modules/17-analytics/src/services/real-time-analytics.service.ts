import { Injectable, NotFoundException, BadRequestException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { DashboardService } from './dashboard.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import {
  AnalyticsDataSource,
  ProcessingStatus,
} from '../entities';
import {
  RealTimeStreamDto,
  RealTimeMetricsDto,
  AnalyticsApiResponse,
} from '../dto';

/**
 * Real-time Analytics Service
 * Handles stream processing, event detection, and live metrics
 */
@Injectable()
export class RealTimeAnalyticsService extends BaseAnalyticsService implements OnModuleInit, OnModuleDestroy {
  private readonly activeStreams = new Map<string, any>();
  private readonly streamSubscribers = new Map<string, Set<string>>();
  private readonly eventListeners = new Map<string, any[]>();
  private readonly metricsCache = new Map<string, any>();
  private readonly streamProcessors = new Map<string, any>();

  private streamCleanupInterval: NodeJS.Timeout;
  private metricsComputationInterval: NodeJS.Timeout;

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>,
    private readonly dashboardService: DashboardService,
    private readonly anomalyDetectionService: AnomalyDetectionService
  ) {
    super(entityManager);
  }

  /**
   * Initialize module - setup background processes
   */
  async onModuleInit() {
    this.startBackgroundProcesses();
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    this.stopBackgroundProcesses();
  }

  /**
   * Create a real-time stream
   */
  async createStream(
    streamDto: RealTimeStreamDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('CREATE_STREAM', 'RealTimeStream');

      // Validate DTO
      const validatedDto = await this.validateDto(streamDto, RealTimeStreamDto);

      // Check if data source exists and is real-time
      const dataSource = await this.dataSourceRepository.findOne({
        where: { id: validatedDto.dataSourceId, isRealTime: true },
      });

      if (!dataSource) {
        throw new NotFoundException(
          `Real-time data source with ID ${validatedDto.dataSourceId} not found`
        );
      }

      // Create stream ID
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Initialize stream
      const stream = await this.initializeStream(streamId, dataSource, validatedDto);

      // Register stream
      this.activeStreams.set(streamId, {
        id: streamId,
        dataSource,
        configuration: validatedDto,
        status: 'active',
        createdBy: userId,
        createdAt: new Date(),
        metrics: {
          messagesProcessed: 0,
          eventsDetected: 0,
          anomaliesDetected: 0,
          processingRate: 0,
          lastMessageTimestamp: null,
        },
      });

      // Setup stream processing
      await this.setupStreamProcessing(streamId, validatedDto);

      this.logOperation('CREATE_STREAM_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        {
          streamId,
          status: 'active',
          dataSourceId: dataSource.id,
          configuration: validatedDto,
        },
        'Real-time stream created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_STREAM');
    }
  }

  /**
   * Subscribe to real-time stream updates
   */
  async subscribeToStream(
    streamId: string,
    clientId: string,
    filters?: Record<string, any>
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('SUBSCRIBE_TO_STREAM', 'RealTimeStream', streamId);

      if (!this.activeStreams.has(streamId)) {
        throw new NotFoundException(`Stream with ID ${streamId} not found or is not active`);
      }

      // Get or create subscriber set for this stream
      let subscribers = this.streamSubscribers.get(streamId);
      if (!subscribers) {
        subscribers = new Set<string>();
        this.streamSubscribers.set(streamId, subscribers);
      }

      // Add subscriber
      subscribers.add(clientId);

      // Setup any filters
      const streamConfig = this.activeStreams.get(streamId);
      streamConfig.filters = {
        ...streamConfig.filters,
        [clientId]: filters,
      };

      this.logOperation('SUBSCRIBE_TO_STREAM_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        {
          streamId,
          clientId,
          status: 'subscribed',
          filters,
        },
        'Successfully subscribed to stream'
      );
    } catch (error) {
      this.handleError(error, 'SUBSCRIBE_TO_STREAM');
    }
  }

  /**
   * Unsubscribe from stream
   */
  async unsubscribeFromStream(
    streamId: string,
    clientId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('UNSUBSCRIBE_FROM_STREAM', 'RealTimeStream', streamId);

      const subscribers = this.streamSubscribers.get(streamId);
      if (subscribers) {
        subscribers.delete(clientId);
        
        // If no subscribers left, consider cleanup
        if (subscribers.size === 0) {
          this.streamSubscribers.delete(streamId);
        }
      }

      // Remove client filters
      const streamConfig = this.activeStreams.get(streamId);
      if (streamConfig?.filters) {
        delete streamConfig.filters[clientId];
      }

      this.logOperation('UNSUBSCRIBE_FROM_STREAM_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        {
          streamId,
          clientId,
          status: 'unsubscribed',
        },
        'Successfully unsubscribed from stream'
      );
    } catch (error) {
      this.handleError(error, 'UNSUBSCRIBE_FROM_STREAM');
    }
  }

  /**
   * Get real-time metrics for a stream
   */
  async getStreamMetrics(
    streamId: string
  ): Promise<AnalyticsApiResponse<RealTimeMetricsDto>> {
    try {
      this.logOperation('GET_STREAM_METRICS', 'RealTimeStream', streamId);

      const stream = this.activeStreams.get(streamId);
      if (!stream) {
        throw new NotFoundException(`Stream with ID ${streamId} not found`);
      }

      // Compute current metrics
      const metrics = await this.computeStreamMetrics(streamId);

      this.logOperation('GET_STREAM_METRICS_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        metrics,
        'Stream metrics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_STREAM_METRICS');
    }
  }

  /**
   * Get all active streams
   */
  async getActiveStreams(
    userId: string
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_ACTIVE_STREAMS', 'RealTimeStream');

      const streams = Array.from(this.activeStreams.entries())
        .map(([id, stream]) => ({
          id,
          dataSourceId: stream.dataSource.id,
          dataSourceName: stream.dataSource.name,
          configuration: stream.configuration,
          status: stream.status,
          metrics: stream.metrics,
          createdAt: stream.createdAt,
          createdBy: stream.createdBy,
          subscriberCount: (this.streamSubscribers.get(id) || new Set()).size,
        }));

      this.logOperation('GET_ACTIVE_STREAMS_SUCCESS', 'RealTimeStream');

      return this.createResponse(
        streams,
        'Active streams retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_ACTIVE_STREAMS');
    }
  }

  /**
   * Stop a real-time stream
   */
  async stopStream(
    streamId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('STOP_STREAM', 'RealTimeStream', streamId);

      if (!this.activeStreams.has(streamId)) {
        throw new NotFoundException(`Stream with ID ${streamId} not found`);
      }

      // Stop stream processor
      await this.stopStreamProcessor(streamId);

      // Remove stream and subscribers
      this.activeStreams.delete(streamId);
      this.streamSubscribers.delete(streamId);
      this.streamProcessors.delete(streamId);

      this.logOperation('STOP_STREAM_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        {
          streamId,
          status: 'stopped',
        },
        'Stream stopped successfully'
      );
    } catch (error) {
      this.handleError(error, 'STOP_STREAM');
    }
  }

  /**
   * Add event listener to stream
   */
  async addStreamEventListener(
    streamId: string,
    eventType: string,
    callbackUrl: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('ADD_STREAM_EVENT_LISTENER', 'RealTimeStream', streamId);

      if (!this.activeStreams.has(streamId)) {
        throw new NotFoundException(`Stream with ID ${streamId} not found`);
      }

      // Get or create event listeners for this stream
      let listeners = this.eventListeners.get(streamId);
      if (!listeners) {
        listeners = [];
        this.eventListeners.set(streamId, listeners);
      }

      // Add listener
      const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      listeners.push({
        id: listenerId,
        eventType,
        callbackUrl,
        createdBy: userId,
        createdAt: new Date(),
      });

      this.logOperation('ADD_STREAM_EVENT_LISTENER_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        {
          streamId,
          listenerId,
          eventType,
          callbackUrl,
        },
        'Event listener added successfully'
      );
    } catch (error) {
      this.handleError(error, 'ADD_STREAM_EVENT_LISTENER');
    }
  }

  /**
   * Get stream event history
   */
  async getStreamEventHistory(
    streamId: string,
    limit: number = 100
  ): Promise<AnalyticsApiResponse<any[]>> {
    try {
      this.logOperation('GET_STREAM_EVENT_HISTORY', 'RealTimeStream', streamId);

      if (!this.activeStreams.has(streamId)) {
        throw new NotFoundException(`Stream with ID ${streamId} not found`);
      }

      // In a real implementation, this would fetch from a database or event log
      // Here we'll generate mock events
      const events = this.generateMockEventHistory(streamId, limit);

      this.logOperation('GET_STREAM_EVENT_HISTORY_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        events,
        'Stream event history retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_STREAM_EVENT_HISTORY');
    }
  }

  /**
   * Update real-time dashboard with latest data
   */
  async updateDashboard(
    dashboardId: string,
    data: any,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('UPDATE_DASHBOARD', 'RealTimeDashboard', dashboardId);

      // This would integrate with the DashboardService to update real-time widgets
      // For demonstration, we'll mock this
      const updateResult = {
        dashboardId,
        updated: true,
        timestamp: new Date(),
        updatedWidgets: Math.floor(Math.random() * 5) + 1,
      };

      this.logOperation('UPDATE_DASHBOARD_SUCCESS', 'RealTimeDashboard', dashboardId);

      return this.createResponse(
        updateResult,
        'Dashboard updated with real-time data'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_DASHBOARD');
    }
  }

  /**
   * Get real-time data snapshot
   */
  async getDataSnapshot(
    streamId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_DATA_SNAPSHOT', 'RealTimeStream', streamId);

      if (!this.activeStreams.has(streamId)) {
        throw new NotFoundException(`Stream with ID ${streamId} not found`);
      }

      // Generate snapshot of current data state
      const snapshot = this.generateDataSnapshot(streamId);

      this.logOperation('GET_DATA_SNAPSHOT_SUCCESS', 'RealTimeStream', streamId);

      return this.createResponse(
        snapshot,
        'Data snapshot retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATA_SNAPSHOT');
    }
  }

  /**
   * Initialize a stream
   */
  private async initializeStream(
    streamId: string,
    dataSource: AnalyticsDataSource,
    config: RealTimeStreamDto
  ): Promise<any> {
    // In a real implementation, this would connect to the actual data source
    // For demonstration, we'll mock this
    this.logger.log(`Initializing stream ${streamId} for data source ${dataSource.id}`);
    
    return {
      id: streamId,
      status: 'initialized',
      timestamp: new Date(),
    };
  }

  /**
   * Setup stream processing
   */
  private async setupStreamProcessing(
    streamId: string,
    config: RealTimeStreamDto
  ): Promise<void> {
    this.logger.log(`Setting up stream processing for ${streamId}`);

    // Setup stream processor
    const processor = {
      id: streamId,
      processMessage: async (message: any) => {
        // Process incoming message
        await this.processStreamMessage(streamId, message);
      },
      processInterval: setInterval(() => {
        // Generate mock data for testing
        const mockMessage = this.generateMockStreamMessage(streamId);
        this.processStreamMessage(streamId, mockMessage);
      }, 5000), // Generate mock data every 5 seconds
    };

    this.streamProcessors.set(streamId, processor);
  }

  /**
   * Stop stream processor
   */
  private async stopStreamProcessor(streamId: string): Promise<void> {
    const processor = this.streamProcessors.get(streamId);
    if (processor?.processInterval) {
      clearInterval(processor.processInterval);
    }
  }

  /**
   * Process stream message
   */
  private async processStreamMessage(streamId: string, message: any): Promise<void> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;

    // Update metrics
    stream.metrics.messagesProcessed++;
    stream.metrics.lastMessageTimestamp = new Date();

    // Calculate processing rate
    const elapsedSeconds = (new Date().getTime() - stream.createdAt.getTime()) / 1000;
    stream.metrics.processingRate = stream.metrics.messagesProcessed / Math.max(1, elapsedSeconds);

    // Check for events
    const detectedEvents = await this.detectEvents(streamId, message);
    if (detectedEvents.length > 0) {
      stream.metrics.eventsDetected += detectedEvents.length;
      await this.notifyEventListeners(streamId, detectedEvents);
    }

    // Check for anomalies
    const detectedAnomalies = await this.detectAnomalies(streamId, message);
    if (detectedAnomalies.length > 0) {
      stream.metrics.anomaliesDetected += detectedAnomalies.length;
      await this.notifyAnomalyDetection(streamId, detectedAnomalies);
    }

    // Distribute to subscribers
    await this.distributeToSubscribers(streamId, message);
  }

  /**
   * Detect events in stream data
   */
  private async detectEvents(streamId: string, message: any): Promise<any[]> {
    // In a real implementation, this would use rules engines or pattern matching
    // For demonstration, we'll randomly generate events
    const events = [];
    
    if (Math.random() > 0.9) { // 10% chance of event
      events.push({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        streamId,
        type: ['threshold_breach', 'pattern_match', 'state_change'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        data: message,
        description: 'Detected event in stream data',
      });
    }
    
    return events;
  }

  /**
   * Detect anomalies in stream data
   */
  private async detectAnomalies(streamId: string, message: any): Promise<any[]> {
    // In a real implementation, this would integrate with the AnomalyDetectionService
    // For demonstration, we'll randomly generate anomalies
    const anomalies = [];
    
    if (Math.random() > 0.95) { // 5% chance of anomaly
      anomalies.push({
        id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        streamId,
        type: ['outlier', 'trend_change', 'variance_change', 'level_shift'][Math.floor(Math.random() * 4)],
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        timestamp: new Date(),
        data: message,
        description: 'Detected anomaly in stream data',
      });
    }
    
    return anomalies;
  }

  /**
   * Notify event listeners
   */
  private async notifyEventListeners(streamId: string, events: any[]): Promise<void> {
    const listeners = this.eventListeners.get(streamId) || [];
    
    for (const event of events) {
      for (const listener of listeners) {
        if (listener.eventType === 'all' || listener.eventType === event.type) {
          // In a real implementation, this would make an HTTP request to the callback URL
          this.logger.log(`Notifying listener ${listener.id} for event ${event.id}`);
        }
      }
    }
  }

  /**
   * Notify anomaly detection
   */
  private async notifyAnomalyDetection(streamId: string, anomalies: any[]): Promise<void> {
    // In a real implementation, this would integrate with anomaly management
    this.logger.log(`Detected ${anomalies.length} anomalies in stream ${streamId}`);
  }

  /**
   * Distribute message to subscribers
   */
  private async distributeToSubscribers(streamId: string, message: any): Promise<void> {
    const subscribers = this.streamSubscribers.get(streamId) || new Set();
    const streamConfig = this.activeStreams.get(streamId);
    
    for (const clientId of subscribers) {
      // Apply client-specific filters
      const filters = streamConfig?.filters?.[clientId];
      const shouldSend = this.applySubscriberFilters(message, filters);
      
      if (shouldSend) {
        // In a real implementation, this would send via WebSockets or SSE
        this.logger.debug(`Sending message to subscriber ${clientId}`);
      }
    }
  }

  /**
   * Apply subscriber filters to message
   */
  private applySubscriberFilters(message: any, filters?: Record<string, any>): boolean {
    if (!filters) return true;
    
    // Simple filter implementation
    for (const [key, value] of Object.entries(filters)) {
      if (message[key] !== value) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Compute stream metrics
   */
  private async computeStreamMetrics(streamId: string): Promise<RealTimeMetricsDto> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }
    
    // Calculate additional metrics
    const elapsedTime = new Date().getTime() - stream.createdAt.getTime();
    const uptime = Math.floor(elapsedTime / 1000);
    const subscriberCount = (this.streamSubscribers.get(streamId) || new Set()).size;
    
    // Generate mock metrics data
    const metrics: RealTimeMetricsDto = {
      streamId,
      timestamp: new Date(),
      messagesProcessed: stream.metrics.messagesProcessed,
      eventsDetected: stream.metrics.eventsDetected,
      anomaliesDetected: stream.metrics.anomaliesDetected,
      processingRate: stream.metrics.processingRate,
      messageRate: stream.metrics.messagesProcessed / Math.max(1, uptime),
      cpuUsage: Math.round(Math.random() * 20 + 5), // 5-25%
      memoryUsage: Math.round(Math.random() * 200 + 50), // 50-250 MB
      uptime,
      subscriberCount,
      lastMessageTimestamp: stream.metrics.lastMessageTimestamp,
      healthStatus: 'healthy',
      customMetrics: {
        averageMessageSize: Math.round(Math.random() * 5000 + 1000), // 1-6 KB
        messageBacklog: Math.round(Math.random() * 100), // 0-100 messages
        processingLatency: Math.round(Math.random() * 100 + 5), // 5-105 ms
      },
    };
    
    // Cache metrics for history
    this.updateMetricsCache(streamId, metrics);
    
    return metrics;
  }

  /**
   * Update metrics cache
   */
  private updateMetricsCache(streamId: string, metrics: RealTimeMetricsDto): void {
    const metricsHistory = this.metricsCache.get(streamId) || [];
    metricsHistory.push(metrics);
    
    // Keep only last 100 metrics snapshots
    if (metricsHistory.length > 100) {
      metricsHistory.shift();
    }
    
    this.metricsCache.set(streamId, metricsHistory);
  }

  /**
   * Generate mock stream message
   */
  private generateMockStreamMessage(streamId: string): any {
    // Generate random data for testing
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      timestamp: new Date(),
      deviceId: `device_${Math.floor(Math.random() * 10) + 1}`,
      sensorType: ['temperature', 'pressure', 'vibration', 'speed', 'voltage'][Math.floor(Math.random() * 5)],
      value: Math.random() * 100,
      unit: ['C', 'Pa', 'Hz', 'rpm', 'V'][Math.floor(Math.random() * 5)],
      status: ['normal', 'warning', 'alert'][Math.floor(Math.random() * 3)],
      metadata: {
        location: `zone_${Math.floor(Math.random() * 5) + 1}`,
        machineId: `machine_${Math.floor(Math.random() * 20) + 1}`,
        batchId: `batch_${Math.floor(Math.random() * 50) + 1}`,
      },
    };
  }

  /**
   * Generate mock event history
   */
  private generateMockEventHistory(streamId: string, limit: number): any[] {
    const events = [];
    
    for (let i = 0; i < limit; i++) {
      const timestamp = new Date();
      timestamp.setSeconds(timestamp.getSeconds() - (i * 60)); // One event per minute in the past
      
      events.push({
        id: `event_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
        streamId,
        type: ['threshold_breach', 'pattern_match', 'state_change'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        timestamp,
        source: {
          deviceId: `device_${Math.floor(Math.random() * 10) + 1}`,
          sensorType: ['temperature', 'pressure', 'vibration', 'speed', 'voltage'][Math.floor(Math.random() * 5)],
        },
        description: `Event detected in stream data at ${timestamp.toISOString()}`,
        acknowledged: i < 5 ? false : Math.random() > 0.5, // Recent events less likely to be acknowledged
      });
    }
    
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
  }

  /**
   * Generate data snapshot
   */
  private generateDataSnapshot(streamId: string): any {
    const deviceCount = 10;
    const devices = [];
    
    for (let i = 1; i <= deviceCount; i++) {
      devices.push({
        deviceId: `device_${i}`,
        lastReading: {
          timestamp: new Date(),
          temperature: Math.round(Math.random() * 50 + 20), // 20-70 C
          pressure: Math.round(Math.random() * 200 + 800), // 800-1000 Pa
          vibration: Math.round(Math.random() * 50) / 10, // 0-5.0 Hz
          speed: Math.round(Math.random() * 3000 + 1000), // 1000-4000 rpm
          voltage: Math.round(Math.random() * 50 + 200), // 200-250 V
        },
        status: ['online', 'online', 'online', 'online', 'offline'][Math.floor(Math.random() * 5)], // 80% online
        alerts: Math.floor(Math.random() * 3), // 0-2 alerts
        uptime: Math.floor(Math.random() * 24 * 60 * 60), // 0-24 hours in seconds
      });
    }
    
    return {
      streamId,
      timestamp: new Date(),
      devices,
      aggregates: {
        temperature: {
          avg: Math.round(devices.reduce((sum, d) => sum + d.lastReading.temperature, 0) / deviceCount * 10) / 10,
          min: Math.min(...devices.map(d => d.lastReading.temperature)),
          max: Math.max(...devices.map(d => d.lastReading.temperature)),
        },
        pressure: {
          avg: Math.round(devices.reduce((sum, d) => sum + d.lastReading.pressure, 0) / deviceCount),
          min: Math.min(...devices.map(d => d.lastReading.pressure)),
          max: Math.max(...devices.map(d => d.lastReading.pressure)),
        },
        deviceStatus: {
          online: devices.filter(d => d.status === 'online').length,
          offline: devices.filter(d => d.status === 'offline').length,
          alerting: devices.filter(d => d.alerts > 0).length,
        },
      },
    };
  }

  /**
   * Start background processes
   */
  private startBackgroundProcesses(): void {
    // Cleanup inactive streams
    this.streamCleanupInterval = setInterval(() => {
      this.cleanupInactiveStreams();
    }, 60000); // Every minute
    
    // Compute metrics
    this.metricsComputationInterval = setInterval(() => {
      this.computeAllStreamMetrics();
    }, 10000); // Every 10 seconds
  }

  /**
   * Stop background processes
   */
  private stopBackgroundProcesses(): void {
    if (this.streamCleanupInterval) {
      clearInterval(this.streamCleanupInterval);
    }
    
    if (this.metricsComputationInterval) {
      clearInterval(this.metricsComputationInterval);
    }
    
    // Stop all stream processors
    for (const streamId of this.streamProcessors.keys()) {
      this.stopStreamProcessor(streamId);
    }
  }

  /**
   * Cleanup inactive streams
   */
  private cleanupInactiveStreams(): void {
    const now = new Date().getTime();
    const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [streamId, stream] of this.activeStreams.entries()) {
      const lastActivity = stream.metrics.lastMessageTimestamp || stream.createdAt;
      const inactive = now - lastActivity.getTime() > inactivityThreshold;
      
      // Check if inactive and no subscribers
      if (inactive && (!this.streamSubscribers.has(streamId) || this.streamSubscribers.get(streamId).size === 0)) {
        this.logger.log(`Auto-stopping inactive stream ${streamId}`);
        this.stopStreamProcessor(streamId);
        this.activeStreams.delete(streamId);
        this.streamSubscribers.delete(streamId);
        this.streamProcessors.delete(streamId);
      }
    }
  }

  /**
   * Compute metrics for all streams
   */
  private computeAllStreamMetrics(): void {
    for (const streamId of this.activeStreams.keys()) {
      this.computeStreamMetrics(streamId).catch(error => {
        this.logger.error(`Failed to compute metrics for stream ${streamId}:`, error);
      });
    }
  }
}
