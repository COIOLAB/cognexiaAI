import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { 
  SupplyChainEvent, 
  SupplyChainEventType, 
  SupplyChainEventStatus,
  SupplyChainEventPriority 
} from '../entities/supply-chain-event.entity';
import { BlockchainTransaction, BlockchainNetwork, TransactionType } from '../entities/blockchain-transaction.entity';
import { BlockchainService, BlockchainTransactionRequest } from './blockchain.service';
import { SmartContractService } from './smart-contract.service';
import { Web3Service } from './web3.service';

export interface CreateSupplyChainEventRequest {
  eventType: SupplyChainEventType;
  inventoryItemId: string;
  productSku: string;
  batchNumber?: string;
  serialNumber?: string;
  title: string;
  description?: string;
  eventTimestamp?: Date;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { latitude: number; longitude: number };
    facilityId?: string;
  };
  stakeholders?: {
    initiator?: { id: string; name: string; role: string; organization: string };
    participants?: Array<{ id: string; name: string; role: string; organization: string }>;
  };
  eventData?: Record<string, any>;
  quantity?: number;
  unit?: string;
  priority?: SupplyChainEventPriority;
  userId?: string;
  organizationId: string;
  attachments?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    hash?: string;
  }>;
  recordOnBlockchain?: boolean;
  network?: BlockchainNetwork;
}

export interface SupplyChainEventChain {
  events: SupplyChainEvent[];
  totalEvents: number;
  startDate: Date;
  endDate: Date;
  locations: string[];
  organizations: string[];
  complianceScore: number;
  verificationStatus: 'verified' | 'partial' | 'unverified';
}

export interface ProductJourney {
  productSku: string;
  inventoryItemId: string;
  currentStatus: string;
  currentLocation?: string;
  timeline: Array<{
    eventType: SupplyChainEventType;
    timestamp: Date;
    location?: string;
    organization?: string;
    verified: boolean;
    blockchainRecorded: boolean;
  }>;
  certifications: string[];
  qualityMetrics: Record<string, any>;
  complianceFlags: string[];
}

export interface TrackingMetrics {
  totalEvents: number;
  eventsByType: Record<SupplyChainEventType, number>;
  blockchainRecordedEvents: number;
  verifiedEvents: number;
  averageProcessingTime: number;
  complianceScore: number;
  activeProducts: number;
  locationsTracked: number;
}

@Injectable()
export class SupplyChainTrackingService {
  private readonly logger = new Logger(SupplyChainTrackingService.name);

  constructor(
    @InjectRepository(SupplyChainEvent)
    private supplyChainEventRepository: Repository<SupplyChainEvent>,
    
    @InjectRepository(BlockchainTransaction)
    private blockchainTransactionRepository: Repository<BlockchainTransaction>,
    
    @InjectQueue('supply-chain-events')
    private supplyChainQueue: Queue,
    
    private eventEmitter: EventEmitter2,
    private blockchainService: BlockchainService,
    private smartContractService: SmartContractService,
    private web3Service: Web3Service,
  ) {}

  /**
   * Create a new supply chain event
   */
  async createSupplyChainEvent(request: CreateSupplyChainEventRequest): Promise<SupplyChainEvent> {
    try {
      this.logger.log(`Creating supply chain event: ${request.eventType} for item ${request.inventoryItemId}`);

      // Create the supply chain event entity
      const supplyChainEvent = this.supplyChainEventRepository.create({
        eventType: request.eventType,
        inventoryItemId: request.inventoryItemId,
        productSku: request.productSku,
        batchNumber: request.batchNumber,
        serialNumber: request.serialNumber,
        organizationId: request.organizationId,
        userId: request.userId,
        title: request.title,
        description: request.description,
        eventTimestamp: request.eventTimestamp || new Date(),
        location: request.location,
        stakeholders: request.stakeholders,
        eventData: request.eventData,
        quantity: request.quantity,
        unit: request.unit,
        priority: request.priority || SupplyChainEventPriority.NORMAL,
        status: SupplyChainEventStatus.PENDING,
        attachments: request.attachments,
        blockchainNetwork: request.network || BlockchainNetwork.ETHEREUM,
      });

      // Find previous event in the chain
      const previousEvent = await this.findPreviousEvent(request.inventoryItemId, request.eventTimestamp);
      if (previousEvent) {
        supplyChainEvent.previousEventId = previousEvent.id;
        // Update previous event's next pointer
        previousEvent.nextEventId = supplyChainEvent.id;
        await this.supplyChainEventRepository.save(previousEvent);
      }

      // Save the event
      const savedEvent = await this.supplyChainEventRepository.save(supplyChainEvent);

      // Record on blockchain if requested
      if (request.recordOnBlockchain !== false) { // Default to true
        await this.recordEventOnBlockchain(savedEvent, request.network);
      }

      // Queue for processing
      await this.supplyChainQueue.add('process-supply-chain-event', {
        eventId: savedEvent.id,
      });

      // Emit event
      this.eventEmitter.emit('supply-chain.event.created', {
        event: savedEvent,
        request,
      });

      this.logger.log(`Supply chain event created successfully: ${savedEvent.id}`);
      return savedEvent;

    } catch (error) {
      this.logger.error('Failed to create supply chain event:', error);
      throw new InternalServerErrorException(`Failed to create supply chain event: ${error.message}`);
    }
  }

  /**
   * Get supply chain events for an inventory item
   */
  async getSupplyChainEvents(
    inventoryItemId: string,
    options: {
      eventTypes?: SupplyChainEventType[];
      startDate?: Date;
      endDate?: Date;
      includeUnverified?: boolean;
      sortOrder?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    events: SupplyChainEvent[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const queryBuilder = this.supplyChainEventRepository
        .createQueryBuilder('event')
        .where('event.inventoryItemId = :inventoryItemId', { inventoryItemId });

      // Apply filters
      if (options.eventTypes && options.eventTypes.length > 0) {
        queryBuilder.andWhere('event.eventType IN (:...eventTypes)', { eventTypes: options.eventTypes });
      }

      if (options.startDate) {
        queryBuilder.andWhere('event.eventTimestamp >= :startDate', { startDate: options.startDate });
      }

      if (options.endDate) {
        queryBuilder.andWhere('event.eventTimestamp <= :endDate', { endDate: options.endDate });
      }

      if (!options.includeUnverified) {
        queryBuilder.andWhere('event.status != :failedStatus', { failedStatus: SupplyChainEventStatus.FAILED });
      }

      // Add sorting
      const sortOrder = options.sortOrder || 'ASC';
      queryBuilder.orderBy('event.eventTimestamp', sortOrder);

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      if (options.limit) {
        queryBuilder.limit(options.limit);
      }
      if (options.offset) {
        queryBuilder.offset(options.offset);
      }

      // Execute query
      const events = await queryBuilder.getMany();

      return {
        events,
        total,
        hasMore: options.limit ? (options.offset || 0) + events.length < total : false,
      };

    } catch (error) {
      this.logger.error(`Failed to get supply chain events for item ${inventoryItemId}:`, error);
      throw new InternalServerErrorException(`Failed to get supply chain events: ${error.message}`);
    }
  }

  /**
   * Get complete event chain for an inventory item
   */
  async getSupplyChainEventChain(inventoryItemId: string): Promise<SupplyChainEventChain> {
    try {
      const { events, total } = await this.getSupplyChainEvents(inventoryItemId, {
        includeUnverified: true,
        sortOrder: 'ASC',
      });

      if (events.length === 0) {
        throw new BadRequestException(`No supply chain events found for inventory item: ${inventoryItemId}`);
      }

      // Calculate chain metrics
      const startDate = events[0].eventTimestamp;
      const endDate = events[events.length - 1].eventTimestamp;
      
      const locations = [...new Set(
        events
          .map(e => e.location?.name)
          .filter(Boolean)
      )];

      const organizations = [...new Set(
        events
          .map(e => e.organizationId)
          .filter(Boolean)
      )];

      // Calculate compliance score
      let totalComplianceScore = 0;
      let eventsWithCompliance = 0;

      events.forEach(event => {
        if (event.compliance?.complianceScore !== undefined) {
          totalComplianceScore += event.compliance.complianceScore;
          eventsWithCompliance++;
        }
      });

      const complianceScore = eventsWithCompliance > 0 
        ? totalComplianceScore / eventsWithCompliance 
        : 100;

      // Determine verification status
      const verifiedCount = events.filter(e => e.isVerified()).length;
      let verificationStatus: 'verified' | 'partial' | 'unverified';

      if (verifiedCount === events.length) {
        verificationStatus = 'verified';
      } else if (verifiedCount > 0) {
        verificationStatus = 'partial';
      } else {
        verificationStatus = 'unverified';
      }

      return {
        events,
        totalEvents: total,
        startDate,
        endDate,
        locations,
        organizations,
        complianceScore,
        verificationStatus,
      };

    } catch (error) {
      this.logger.error(`Failed to get supply chain event chain for item ${inventoryItemId}:`, error);
      throw new InternalServerErrorException(`Failed to get event chain: ${error.message}`);
    }
  }

  /**
   * Get product journey timeline
   */
  async getProductJourney(inventoryItemId: string): Promise<ProductJourney> {
    try {
      const chain = await this.getSupplyChainEventChain(inventoryItemId);
      
      if (chain.events.length === 0) {
        throw new BadRequestException(`No journey found for inventory item: ${inventoryItemId}`);
      }

      const latestEvent = chain.events[chain.events.length - 1];
      
      // Build timeline
      const timeline = chain.events.map(event => ({
        eventType: event.eventType,
        timestamp: event.eventTimestamp,
        location: event.location?.name,
        organization: event.organizationId,
        verified: event.isVerified(),
        blockchainRecorded: event.isRecordedOnBlockchain(),
      }));

      // Extract certifications
      const certifications = [...new Set(
        chain.events
          .flatMap(e => e.compliance?.certifications || [])
          .filter(Boolean)
      )];

      // Aggregate quality metrics
      const qualityMetrics = {};
      chain.events.forEach(event => {
        if (event.eventData?.qualityScore !== undefined) {
          qualityMetrics['qualityScore'] = event.eventData.qualityScore;
        }
        if (event.eventData?.testResults) {
          Object.assign(qualityMetrics, event.eventData.testResults);
        }
      });

      // Collect compliance flags
      const complianceFlags = [...new Set(
        chain.events
          .flatMap(e => e.compliance?.regulations || [])
          .filter(Boolean)
      )];

      return {
        productSku: latestEvent.productSku,
        inventoryItemId,
        currentStatus: this.getReadableEventType(latestEvent.eventType),
        currentLocation: latestEvent.location?.name,
        timeline,
        certifications,
        qualityMetrics,
        complianceFlags,
      };

    } catch (error) {
      this.logger.error(`Failed to get product journey for item ${inventoryItemId}:`, error);
      throw new InternalServerErrorException(`Failed to get product journey: ${error.message}`);
    }
  }

  /**
   * Verify supply chain event
   */
  async verifySupplyChainEvent(
    eventId: string,
    verifierId: string,
    verificationMethod: string,
    score?: number,
    notes?: string
  ): Promise<SupplyChainEvent> {
    try {
      const event = await this.supplyChainEventRepository.findOne({
        where: { id: eventId },
      });

      if (!event) {
        throw new BadRequestException('Supply chain event not found');
      }

      // Mark as verified
      event.markAsVerified(verifierId, verificationMethod, score, notes);

      // Save updated event
      const updatedEvent = await this.supplyChainEventRepository.save(event);

      // Emit verification event
      this.eventEmitter.emit('supply-chain.event.verified', {
        event: updatedEvent,
        verifierId,
        verificationMethod,
        score,
        notes,
      });

      this.logger.log(`Supply chain event verified: ${eventId} by ${verifierId}`);
      return updatedEvent;

    } catch (error) {
      this.logger.error(`Failed to verify supply chain event ${eventId}:`, error);
      throw new InternalServerErrorException(`Failed to verify event: ${error.message}`);
    }
  }

  /**
   * Get tracking metrics and analytics
   */
  async getTrackingMetrics(
    organizationId?: string,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<TrackingMetrics> {
    try {
      const queryBuilder = this.supplyChainEventRepository
        .createQueryBuilder('event');

      if (organizationId) {
        queryBuilder.where('event.organizationId = :organizationId', { organizationId });
      }

      if (timeRange) {
        queryBuilder.andWhere('event.eventTimestamp BETWEEN :startDate AND :endDate', {
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
        });
      }

      const events = await queryBuilder.getMany();

      // Calculate metrics
      const totalEvents = events.length;
      
      const eventsByType: Record<SupplyChainEventType, number> = {} as any;
      Object.values(SupplyChainEventType).forEach(type => {
        eventsByType[type] = 0;
      });

      let blockchainRecordedEvents = 0;
      let verifiedEvents = 0;
      let totalProcessingTime = 0;
      let processedEvents = 0;
      let totalComplianceScore = 0;
      let eventsWithCompliance = 0;

      const uniqueProducts = new Set<string>();
      const uniqueLocations = new Set<string>();

      events.forEach(event => {
        // Event type count
        eventsByType[event.eventType]++;

        // Blockchain recording
        if (event.isRecordedOnBlockchain()) {
          blockchainRecordedEvents++;
        }

        // Verification
        if (event.isVerified()) {
          verifiedEvents++;
        }

        // Processing time
        if (event.processingMetadata?.processingDurationMs) {
          totalProcessingTime += event.processingMetadata.processingDurationMs;
          processedEvents++;
        }

        // Compliance score
        if (event.compliance?.complianceScore !== undefined) {
          totalComplianceScore += event.compliance.complianceScore;
          eventsWithCompliance++;
        }

        // Unique tracking
        uniqueProducts.add(event.inventoryItemId);
        if (event.location?.name) {
          uniqueLocations.add(event.location.name);
        }
      });

      const averageProcessingTime = processedEvents > 0 
        ? totalProcessingTime / processedEvents 
        : 0;

      const complianceScore = eventsWithCompliance > 0 
        ? totalComplianceScore / eventsWithCompliance 
        : 100;

      return {
        totalEvents,
        eventsByType,
        blockchainRecordedEvents,
        verifiedEvents,
        averageProcessingTime,
        complianceScore,
        activeProducts: uniqueProducts.size,
        locationsTracked: uniqueLocations.size,
      };

    } catch (error) {
      this.logger.error('Failed to get tracking metrics:', error);
      throw new InternalServerErrorException(`Failed to get tracking metrics: ${error.message}`);
    }
  }

  /**
   * Search supply chain events
   */
  async searchSupplyChainEvents(
    query: {
      productSku?: string;
      batchNumber?: string;
      serialNumber?: string;
      organizationId?: string;
      location?: string;
      eventType?: SupplyChainEventType;
      verified?: boolean;
      blockchainRecorded?: boolean;
    },
    pagination: { limit?: number; offset?: number } = {}
  ): Promise<{
    events: SupplyChainEvent[];
    total: number;
  }> {
    try {
      const queryBuilder = this.supplyChainEventRepository
        .createQueryBuilder('event');

      // Apply search filters
      if (query.productSku) {
        queryBuilder.andWhere('event.productSku ILIKE :productSku', { 
          productSku: `%${query.productSku}%` 
        });
      }

      if (query.batchNumber) {
        queryBuilder.andWhere('event.batchNumber ILIKE :batchNumber', { 
          batchNumber: `%${query.batchNumber}%` 
        });
      }

      if (query.serialNumber) {
        queryBuilder.andWhere('event.serialNumber ILIKE :serialNumber', { 
          serialNumber: `%${query.serialNumber}%` 
        });
      }

      if (query.organizationId) {
        queryBuilder.andWhere('event.organizationId = :organizationId', { 
          organizationId: query.organizationId 
        });
      }

      if (query.location) {
        queryBuilder.andWhere("event.location->>'name' ILIKE :location", { 
          location: `%${query.location}%` 
        });
      }

      if (query.eventType) {
        queryBuilder.andWhere('event.eventType = :eventType', { 
          eventType: query.eventType 
        });
      }

      if (query.verified !== undefined) {
        if (query.verified) {
          queryBuilder.andWhere("event.verification->>'isVerified' = 'true'");
        } else {
          queryBuilder.andWhere("(event.verification IS NULL OR event.verification->>'isVerified' != 'true')");
        }
      }

      if (query.blockchainRecorded !== undefined) {
        if (query.blockchainRecorded) {
          queryBuilder.andWhere('event.transactionHash IS NOT NULL');
        } else {
          queryBuilder.andWhere('event.transactionHash IS NULL');
        }
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination and sorting
      queryBuilder.orderBy('event.eventTimestamp', 'DESC');
      
      if (pagination.limit) {
        queryBuilder.limit(pagination.limit);
      }
      
      if (pagination.offset) {
        queryBuilder.offset(pagination.offset);
      }

      // Execute query
      const events = await queryBuilder.getMany();

      return { events, total };

    } catch (error) {
      this.logger.error('Failed to search supply chain events:', error);
      throw new InternalServerErrorException(`Failed to search events: ${error.message}`);
    }
  }

  // Private helper methods

  private async findPreviousEvent(
    inventoryItemId: string, 
    eventTimestamp?: Date
  ): Promise<SupplyChainEvent | null> {
    const timestamp = eventTimestamp || new Date();
    
    return this.supplyChainEventRepository.findOne({
      where: {
        inventoryItemId,
        eventTimestamp: timestamp as any, // Use LessThan operator
      },
      order: {
        eventTimestamp: 'DESC',
      },
    });
  }

  private async recordEventOnBlockchain(
    event: SupplyChainEvent,
    network?: BlockchainNetwork
  ): Promise<void> {
    try {
      // Get or deploy supply chain tracking contract
      const contractAddress = await this.smartContractService.getContractAddress(
        'SupplyChainTracker',
        network || BlockchainNetwork.ETHEREUM
      );

      if (!contractAddress) {
        this.logger.warn('Supply chain contract not deployed, skipping blockchain recording');
        return;
      }

      // Prepare event data for blockchain
      const eventData = {
        eventId: event.id,
        inventoryItemId: event.inventoryItemId,
        productSku: event.productSku,
        eventType: event.eventType,
        timestamp: Math.floor(event.eventTimestamp.getTime() / 1000), // Unix timestamp
        organizationId: event.organizationId,
        location: event.location?.name || '',
        verified: event.isVerified(),
      };

      // Create blockchain transaction request
      const txRequest: BlockchainTransactionRequest = {
        network: network || event.blockchainNetwork || BlockchainNetwork.ETHEREUM,
        transactionType: TransactionType.SUPPLY_CHAIN_EVENT,
        toAddress: contractAddress,
        data: await this.smartContractService.encodeContractCall(
          'SupplyChainTracker',
          'recordEvent',
          [
            eventData.eventId,
            eventData.inventoryItemId,
            eventData.productSku,
            eventData.eventType,
            eventData.timestamp,
            eventData.organizationId,
            eventData.location,
            eventData.verified,
          ]
        ),
        userId: event.userId,
        inventoryItemId: event.inventoryItemId,
        businessContext: {
          operation: 'supply_chain_event_recording',
          eventType: event.eventType,
          productSku: event.productSku,
        },
      };

      // Submit blockchain transaction
      const blockchainTx = await this.blockchainService.submitTransaction(txRequest);

      // Update event with blockchain transaction reference
      event.blockchainTransactionId = blockchainTx.id;
      event.transactionHash = blockchainTx.transactionHash;
      event.blockchainNetwork = blockchainTx.network;
      
      if (blockchainTx.status === 'confirmed') {
        event.updateStatus(SupplyChainEventStatus.RECORDED);
      }

      await this.supplyChainEventRepository.save(event);

      this.logger.log(`Supply chain event recorded on blockchain: ${event.id} -> ${blockchainTx.transactionHash}`);

    } catch (error) {
      this.logger.error(`Failed to record event ${event.id} on blockchain:`, error);
      
      // Update event status to indicate blockchain recording failed
      event.updateStatus(SupplyChainEventStatus.FAILED, `Blockchain recording failed: ${error.message}`);
      await this.supplyChainEventRepository.save(event);
    }
  }

  private getReadableEventType(eventType: SupplyChainEventType): string {
    const readableNames: Record<SupplyChainEventType, string> = {
      [SupplyChainEventType.MANUFACTURING_STARTED]: 'Manufacturing Started',
      [SupplyChainEventType.MANUFACTURING_COMPLETED]: 'Manufacturing Completed',
      [SupplyChainEventType.QUALITY_CONTROL]: 'Quality Control Check',
      [SupplyChainEventType.BATCH_CREATED]: 'Batch Created',
      [SupplyChainEventType.SHIPMENT_CREATED]: 'Shipment Created',
      [SupplyChainEventType.IN_TRANSIT]: 'In Transit',
      [SupplyChainEventType.CUSTOMS_CLEARANCE]: 'Customs Clearance',
      [SupplyChainEventType.DELIVERED]: 'Delivered',
      [SupplyChainEventType.RECEIVED]: 'Received',
      [SupplyChainEventType.INVENTORY_RECEIVED]: 'Inventory Received',
      [SupplyChainEventType.INVENTORY_MOVED]: 'Inventory Moved',
      [SupplyChainEventType.INVENTORY_COUNTED]: 'Inventory Counted',
      [SupplyChainEventType.INVENTORY_ADJUSTMENT]: 'Inventory Adjustment',
      [SupplyChainEventType.OWNERSHIP_TRANSFER]: 'Ownership Transfer',
      [SupplyChainEventType.SALE_COMPLETED]: 'Sale Completed',
      [SupplyChainEventType.PURCHASE_ORDER]: 'Purchase Order',
      [SupplyChainEventType.CERTIFICATION_ISSUED]: 'Certification Issued',
      [SupplyChainEventType.CERTIFICATION_RENEWED]: 'Certification Renewed',
      [SupplyChainEventType.CERTIFICATION_REVOKED]: 'Certification Revoked',
      [SupplyChainEventType.AUDIT_PERFORMED]: 'Audit Performed',
      [SupplyChainEventType.COMPLIANCE_CHECK]: 'Compliance Check',
      [SupplyChainEventType.REGULATORY_APPROVAL]: 'Regulatory Approval',
      [SupplyChainEventType.PRODUCT_ACTIVATED]: 'Product Activated',
      [SupplyChainEventType.MAINTENANCE_PERFORMED]: 'Maintenance Performed',
      [SupplyChainEventType.WARRANTY_CLAIM]: 'Warranty Claim',
      [SupplyChainEventType.END_OF_LIFE]: 'End of Life',
      [SupplyChainEventType.RECYCLING]: 'Recycling',
      [SupplyChainEventType.CUSTOM_EVENT]: 'Custom Event',
    };

    return readableNames[eventType] || eventType;
  }
}
