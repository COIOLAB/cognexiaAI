import { injectable } from 'inversify';
import { EventEmitter } from 'events';

interface BlockchainTransaction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'TRANSFER' | 'QUALITY' | 'DISPOSE';
  itemId: string;
  sku?: string;
  data: any;
  timestamp: Date;
  userId?: string;
  warehouseId: string;
  hash?: string;
  blockNumber?: number;
  confirmed: boolean;
  gasUsed?: number;
}

interface SupplyChainEvent {
  eventId: string;
  itemId: string;
  eventType: 'manufactured' | 'received' | 'stored' | 'moved' | 'inspected' | 'shipped' | 'delivered';
  location: {
    warehouseId: string;
    coordinates?: { lat: number; lng: number };
    address?: string;
  };
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  metadata: Record<string, any>;
  previousEventId?: string;
  signatures: Array<{
    signerId: string;
    signature: string;
    timestamp: Date;
  }>;
}

interface TraceabilityRecord {
  itemId: string;
  sku: string;
  currentStatus: string;
  currentLocation: string;
  events: SupplyChainEvent[];
  verificationStatus: 'verified' | 'pending' | 'failed';
  complianceChecks: Array<{
    checkType: string;
    status: 'passed' | 'failed' | 'pending';
    timestamp: Date;
    details: any;
  }>;
  certifications: Array<{
    type: string;
    issuer: string;
    validFrom: Date;
    validTo: Date;
    certificateHash: string;
  }>;
}

interface SmartContractCall {
  contractAddress: string;
  methodName: string;
  parameters: any[];
  gasLimit: number;
  value?: string;
}

@injectable()
export class AdvancedBlockchainIntegrationService extends EventEmitter {
  private transactions: Map<string, BlockchainTransaction> = new Map();
  private traceabilityRecords: Map<string, TraceabilityRecord> = new Map();
  private pendingTransactions: BlockchainTransaction[] = [];
  private batchQueue: BlockchainTransaction[] = [];
  private connected = false;
  private blockchainNetwork: string;
  private contractAddresses: Record<string, string> = {};

  // Mock Web3 instance (replace with actual Web3 integration)
  private web3Instance: any = null;
  private contracts: Map<string, any> = new Map();

  constructor() {
    super();
    this.blockchainNetwork = process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545';
    this.initializeBlockchainService();
  }

  /**
   * Initialize blockchain service
   */
  private async initializeBlockchainService(): Promise<void> {
    try {
      console.log('Initializing Advanced Blockchain Integration Service...');
      
      await this.connectToBlockchain();
      await this.initializeSmartContracts();
      this.startBatchProcessing();
      
      this.connected = true;
      console.log('Advanced Blockchain Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Blockchain Service:', error);
      this.connected = false;
    }
  }

  /**
   * Connect to blockchain network
   */
  private async connectToBlockchain(): Promise<void> {
    try {
      // In a real implementation, initialize Web3 here
      // const Web3 = require('web3');
      // this.web3Instance = new Web3(this.blockchainNetwork);
      
      // Mock connection
      this.web3Instance = {
        isConnected: () => true,
        getBlockNumber: async () => Math.floor(Math.random() * 10000000),
        getGasPrice: async () => '20000000000',
        sendTransaction: async (tx: any) => ({
          hash: this.generateTransactionHash(),
          blockNumber: Math.floor(Math.random() * 10000000),
          gasUsed: Math.floor(Math.random() * 100000)
        })
      };
      
      console.log(`Connected to blockchain network: ${this.blockchainNetwork}`);
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      throw error;
    }
  }

  /**
   * Initialize smart contracts
   */
  private async initializeSmartContracts(): Promise<void> {
    try {
      // Define contract addresses
      this.contractAddresses = {
        supplyChain: process.env.SUPPLY_CHAIN_CONTRACT || '0x1234567890123456789012345678901234567890',
        traceability: process.env.TRACEABILITY_CONTRACT || '0x0987654321098765432109876543210987654321',
        quality: process.env.QUALITY_CONTRACT || '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        compliance: process.env.COMPLIANCE_CONTRACT || '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba'
      };

      // Initialize contract instances (mock implementation)
      for (const [name, address] of Object.entries(this.contractAddresses)) {
        const contract = await this.createMockContract(name, address);
        this.contracts.set(name, contract);
        console.log(`Smart contract initialized: ${name} at ${address}`);
      }
    } catch (error) {
      console.error('Error initializing smart contracts:', error);
      throw error;
    }
  }

  /**
   * Create mock contract instance
   */
  private async createMockContract(name: string, address: string): Promise<any> {
    return {
      address,
      name,
      methods: {
        recordEvent: (eventData: string) => ({
          call: async () => true,
          send: async () => ({
            transactionHash: this.generateTransactionHash(),
            blockNumber: Math.floor(Math.random() * 10000000)
          })
        }),
        verifyItem: (itemId: string) => ({
          call: async () => ({
            verified: true,
            lastUpdate: Date.now(),
            eventCount: Math.floor(Math.random() * 50)
          })
        }),
        getItemHistory: (itemId: string) => ({
          call: async () => [
            { eventType: 'CREATE', timestamp: Date.now(), location: 'Factory A' },
            { eventType: 'TRANSFER', timestamp: Date.now(), location: 'Warehouse B' }
          ]
        })
      }
    };
  }

  /**
   * Record item creation on blockchain
   */
  public async recordItemCreation(
    itemId: string,
    sku: string,
    itemData: any,
    warehouseId: string,
    userId?: string
  ): Promise<string> {
    try {
      const transaction: BlockchainTransaction = {
        id: this.generateTransactionId(),
        type: 'CREATE',
        itemId,
        sku,
        data: {
          name: itemData.name,
          category: itemData.category,
          quantity: itemData.quantity,
          cost: itemData.cost,
          supplier: itemData.supplier,
          manufacturingDate: itemData.manufacturingDate,
          expiryDate: itemData.expiryDate,
          certifications: itemData.certifications || []
        },
        timestamp: new Date(),
        userId,
        warehouseId,
        confirmed: false
      };

      // Add to batch queue
      this.batchQueue.push(transaction);
      this.transactions.set(transaction.id, transaction);

      // Create traceability record
      await this.createTraceabilityRecord(itemId, sku, warehouseId, transaction);

      this.emit('transactionCreated', transaction);
      console.log(`Item creation recorded for blockchain: ${sku} (${itemId})`);
      
      return transaction.id;

    } catch (error) {
      console.error('Error recording item creation:', error);
      throw error;
    }
  }

  /**
   * Record inventory update on blockchain
   */
  public async recordInventoryUpdate(
    itemId: string,
    updateData: any,
    warehouseId: string,
    userId?: string
  ): Promise<string> {
    try {
      const transaction: BlockchainTransaction = {
        id: this.generateTransactionId(),
        type: 'UPDATE',
        itemId,
        data: {
          previousQuantity: updateData.previousQuantity,
          newQuantity: updateData.newQuantity,
          adjustment: updateData.adjustment,
          reason: updateData.reason,
          location: updateData.location,
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId,
        warehouseId,
        confirmed: false
      };

      this.batchQueue.push(transaction);
      this.transactions.set(transaction.id, transaction);

      // Update traceability record
      await this.updateTraceabilityRecord(itemId, {
        eventType: 'stored',
        location: { warehouseId, address: updateData.location },
        actor: { id: userId || 'system', name: 'System', role: 'operator' },
        metadata: updateData
      });

      this.emit('transactionCreated', transaction);
      return transaction.id;

    } catch (error) {
      console.error('Error recording inventory update:', error);
      throw error;
    }
  }

  /**
   * Record item transfer between locations
   */
  public async recordItemTransfer(
    itemId: string,
    fromWarehouse: string,
    toWarehouse: string,
    quantity: number,
    userId?: string
  ): Promise<string> {
    try {
      const transaction: BlockchainTransaction = {
        id: this.generateTransactionId(),
        type: 'TRANSFER',
        itemId,
        data: {
          fromWarehouse,
          toWarehouse,
          quantity,
          transferDate: new Date(),
          carrier: 'TBD',
          trackingNumber: this.generateTrackingNumber()
        },
        timestamp: new Date(),
        userId,
        warehouseId: toWarehouse,
        confirmed: false
      };

      this.batchQueue.push(transaction);
      this.transactions.set(transaction.id, transaction);

      // Update traceability record
      await this.updateTraceabilityRecord(itemId, {
        eventType: 'moved',
        location: { warehouseId: toWarehouse },
        actor: { id: userId || 'system', name: 'System', role: 'logistics' },
        metadata: {
          fromWarehouse,
          toWarehouse,
          quantity,
          trackingNumber: transaction.data.trackingNumber
        }
      });

      this.emit('transactionCreated', transaction);
      return transaction.id;

    } catch (error) {
      console.error('Error recording item transfer:', error);
      throw error;
    }
  }

  /**
   * Record quality inspection results
   */
  public async recordQualityInspection(
    itemId: string,
    inspectionData: any,
    warehouseId: string,
    inspectorId: string
  ): Promise<string> {
    try {
      const transaction: BlockchainTransaction = {
        id: this.generateTransactionId(),
        type: 'QUALITY',
        itemId,
        data: {
          inspectionDate: new Date(),
          inspector: inspectorId,
          result: inspectionData.result,
          score: inspectionData.score,
          notes: inspectionData.notes,
          certifications: inspectionData.certifications || [],
          defectsFound: inspectionData.defects || [],
          passedTests: inspectionData.passedTests || [],
          failedTests: inspectionData.failedTests || []
        },
        timestamp: new Date(),
        userId: inspectorId,
        warehouseId,
        confirmed: false
      };

      this.batchQueue.push(transaction);
      this.transactions.set(transaction.id, transaction);

      // Update traceability record
      await this.updateTraceabilityRecord(itemId, {
        eventType: 'inspected',
        location: { warehouseId },
        actor: { id: inspectorId, name: 'Quality Inspector', role: 'inspector' },
        metadata: inspectionData
      });

      // Add compliance check
      await this.addComplianceCheck(itemId, {
        checkType: 'quality_inspection',
        status: inspectionData.result === 'pass' ? 'passed' : 'failed',
        timestamp: new Date(),
        details: inspectionData
      });

      this.emit('transactionCreated', transaction);
      return transaction.id;

    } catch (error) {
      console.error('Error recording quality inspection:', error);
      throw error;
    }
  }

  /**
   * Create traceability record for new item
   */
  private async createTraceabilityRecord(
    itemId: string,
    sku: string,
    warehouseId: string,
    initialTransaction: BlockchainTransaction
  ): Promise<void> {
    const initialEvent: SupplyChainEvent = {
      eventId: this.generateEventId(),
      itemId,
      eventType: 'manufactured',
      location: { warehouseId },
      timestamp: new Date(),
      actor: {
        id: initialTransaction.userId || 'system',
        name: 'Manufacturing System',
        role: 'manufacturer'
      },
      metadata: initialTransaction.data,
      signatures: []
    };

    const record: TraceabilityRecord = {
      itemId,
      sku,
      currentStatus: 'created',
      currentLocation: warehouseId,
      events: [initialEvent],
      verificationStatus: 'pending',
      complianceChecks: [],
      certifications: []
    };

    this.traceabilityRecords.set(itemId, record);
    this.emit('traceabilityRecordCreated', record);
  }

  /**
   * Update traceability record with new event
   */
  private async updateTraceabilityRecord(
    itemId: string,
    eventData: Partial<SupplyChainEvent>
  ): Promise<void> {
    const record = this.traceabilityRecords.get(itemId);
    if (!record) {
      console.warn(`Traceability record not found for item: ${itemId}`);
      return;
    }

    const newEvent: SupplyChainEvent = {
      eventId: this.generateEventId(),
      itemId,
      eventType: eventData.eventType || 'stored',
      location: eventData.location || { warehouseId: record.currentLocation },
      timestamp: new Date(),
      actor: eventData.actor || { id: 'system', name: 'System', role: 'operator' },
      metadata: eventData.metadata || {},
      previousEventId: record.events[record.events.length - 1]?.eventId,
      signatures: []
    };

    record.events.push(newEvent);
    record.currentLocation = newEvent.location.warehouseId;
    record.currentStatus = newEvent.eventType;

    this.traceabilityRecords.set(itemId, record);
    this.emit('traceabilityRecordUpdated', { itemId, event: newEvent });
  }

  /**
   * Add compliance check to traceability record
   */
  private async addComplianceCheck(
    itemId: string,
    complianceCheck: TraceabilityRecord['complianceChecks'][0]
  ): Promise<void> {
    const record = this.traceabilityRecords.get(itemId);
    if (record) {
      record.complianceChecks.push(complianceCheck);
      this.traceabilityRecords.set(itemId, record);
    }
  }

  /**
   * Get complete supply chain history for an item
   */
  public async getSupplyChainHistory(itemId: string): Promise<TraceabilityRecord | null> {
    try {
      // First check local cache
      let record = this.traceabilityRecords.get(itemId);
      
      if (!record) {
        // Try to fetch from blockchain
        record = await this.fetchFromBlockchain(itemId);
      }

      if (record) {
        // Verify blockchain data integrity
        const verified = await this.verifySupplyChainIntegrity(itemId);
        record.verificationStatus = verified ? 'verified' : 'failed';
      }

      return record || null;

    } catch (error) {
      console.error('Error getting supply chain history:', error);
      throw error;
    }
  }

  /**
   * Verify supply chain integrity using blockchain
   */
  public async verifySupplyChainIntegrity(itemId: string): Promise<boolean> {
    try {
      const record = this.traceabilityRecords.get(itemId);
      if (!record) return false;

      // Verify each event in the chain
      for (const event of record.events) {
        const verified = await this.verifyEvent(event);
        if (!verified) {
          console.warn(`Event verification failed for item ${itemId}, event ${event.eventId}`);
          return false;
        }
      }

      // Check event sequence integrity
      const sequenceValid = this.validateEventSequence(record.events);
      if (!sequenceValid) {
        console.warn(`Event sequence validation failed for item ${itemId}`);
        return false;
      }

      // Verify blockchain transactions
      const transactionsValid = await this.verifyBlockchainTransactions(itemId);
      
      return transactionsValid;

    } catch (error) {
      console.error('Error verifying supply chain integrity:', error);
      return false;
    }
  }

  /**
   * Generate supply chain compliance report
   */
  public async generateComplianceReport(itemId: string): Promise<any> {
    try {
      const record = await this.getSupplyChainHistory(itemId);
      if (!record) {
        throw new Error('No supply chain record found for item');
      }

      const report = {
        itemId,
        sku: record.sku,
        generatedAt: new Date(),
        verificationStatus: record.verificationStatus,
        complianceScore: this.calculateComplianceScore(record),
        eventSummary: {
          totalEvents: record.events.length,
          eventTypes: this.summarizeEventTypes(record.events),
          timeSpan: this.calculateTimeSpan(record.events)
        },
        complianceChecks: {
          total: record.complianceChecks.length,
          passed: record.complianceChecks.filter(c => c.status === 'passed').length,
          failed: record.complianceChecks.filter(c => c.status === 'failed').length,
          pending: record.complianceChecks.filter(c => c.status === 'pending').length
        },
        certifications: record.certifications.map(cert => ({
          type: cert.type,
          issuer: cert.issuer,
          status: this.getCertificationStatus(cert),
          validUntil: cert.validTo
        })),
        riskAssessment: this.assessSupplyChainRisks(record),
        recommendations: this.generateComplianceRecommendations(record)
      };

      this.emit('complianceReportGenerated', report);
      return report;

    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Start batch processing of blockchain transactions
   */
  private startBatchProcessing(): void {
    setInterval(async () => {
      if (this.batchQueue.length > 0) {
        await this.processBatch();
      }
    }, 30000); // Process every 30 seconds
  }

  /**
   * Process batch of transactions
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, 10); // Process up to 10 transactions
    console.log(`Processing blockchain batch of ${batch.length} transactions`);

    try {
      const batchData = batch.map(tx => ({
        id: tx.id,
        type: tx.type,
        itemId: tx.itemId,
        data: JSON.stringify(tx.data),
        timestamp: tx.timestamp.getTime()
      }));

      // Submit batch to blockchain
      const result = await this.submitBatchToBlockchain(batchData);
      
      if (result.success) {
        // Update transaction status
        batch.forEach(tx => {
          tx.confirmed = true;
          tx.hash = result.transactionHash;
          tx.blockNumber = result.blockNumber;
          this.transactions.set(tx.id, tx);
        });

        this.emit('batchProcessed', { 
          transactionCount: batch.length,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        });

        console.log(`Batch processed successfully. Hash: ${result.transactionHash}`);
      }

    } catch (error) {
      console.error('Error processing blockchain batch:', error);
      
      // Return failed transactions to queue
      this.batchQueue.unshift(...batch);
    }
  }

  /**
   * Submit batch to blockchain
   */
  private async submitBatchToBlockchain(batchData: any[]): Promise<any> {
    try {
      const contract = this.contracts.get('supplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not initialized');
      }

      // Encode batch data
      const encodedData = JSON.stringify(batchData);
      
      // Submit to blockchain (mock implementation)
      const result = await contract.methods.recordEvent(encodedData).send();
      
      return {
        success: true,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed || 100000
      };

    } catch (error) {
      console.error('Error submitting batch to blockchain:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch supply chain record from blockchain
   */
  private async fetchFromBlockchain(itemId: string): Promise<TraceabilityRecord | null> {
    try {
      const contract = this.contracts.get('traceability');
      if (!contract) return null;

      const result = await contract.methods.getItemHistory(itemId).call();
      
      // Convert blockchain data to TraceabilityRecord format
      const record: TraceabilityRecord = {
        itemId,
        sku: result.sku || 'UNKNOWN',
        currentStatus: result.status || 'unknown',
        currentLocation: result.location || 'unknown',
        events: result.events || [],
        verificationStatus: 'pending',
        complianceChecks: result.complianceChecks || [],
        certifications: result.certifications || []
      };

      this.traceabilityRecords.set(itemId, record);
      return record;

    } catch (error) {
      console.error('Error fetching from blockchain:', error);
      return null;
    }
  }

  /**
   * Verify individual event authenticity
   */
  private async verifyEvent(event: SupplyChainEvent): Promise<boolean> {
    try {
      // Verify event signatures
      for (const signature of event.signatures) {
        const verified = await this.verifySignature(event, signature);
        if (!verified) return false;
      }

      // Verify event data integrity
      const dataValid = this.validateEventData(event);
      
      return dataValid;

    } catch (error) {
      console.error('Error verifying event:', error);
      return false;
    }
  }

  /**
   * Verify digital signature
   */
  private async verifySignature(event: SupplyChainEvent, signature: any): Promise<boolean> {
    // Mock signature verification
    return signature.signature.length > 0;
  }

  /**
   * Validate event data structure and content
   */
  private validateEventData(event: SupplyChainEvent): boolean {
    return !!(
      event.eventId &&
      event.itemId &&
      event.eventType &&
      event.timestamp &&
      event.actor &&
      event.location
    );
  }

  /**
   * Validate sequence of events
   */
  private validateEventSequence(events: SupplyChainEvent[]): boolean {
    if (events.length <= 1) return true;

    // Check chronological order
    for (let i = 1; i < events.length; i++) {
      if (events[i].timestamp < events[i - 1].timestamp) {
        return false;
      }
    }

    // Check event linking
    for (let i = 1; i < events.length; i++) {
      if (events[i].previousEventId !== events[i - 1].eventId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verify blockchain transactions for an item
   */
  private async verifyBlockchainTransactions(itemId: string): Promise<boolean> {
    try {
      const itemTransactions = Array.from(this.transactions.values())
        .filter(tx => tx.itemId === itemId && tx.confirmed);

      for (const transaction of itemTransactions) {
        if (!transaction.hash) continue;
        
        // Mock blockchain transaction verification
        const verified = await this.verifyTransactionOnChain(transaction.hash);
        if (!verified) return false;
      }

      return true;

    } catch (error) {
      console.error('Error verifying blockchain transactions:', error);
      return false;
    }
  }

  /**
   * Verify transaction exists on blockchain
   */
  private async verifyTransactionOnChain(txHash: string): Promise<boolean> {
    try {
      // Mock verification - in real implementation, query blockchain
      return txHash.startsWith('0x') && txHash.length === 66;
    } catch (error) {
      return false;
    }
  }

  // Utility methods
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionHash(): string {
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrackingNumber(): string {
    return `TRK${Date.now().toString().substr(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private calculateComplianceScore(record: TraceabilityRecord): number {
    const totalChecks = record.complianceChecks.length;
    if (totalChecks === 0) return 0;

    const passedChecks = record.complianceChecks.filter(c => c.status === 'passed').length;
    return Math.round((passedChecks / totalChecks) * 100);
  }

  private summarizeEventTypes(events: SupplyChainEvent[]): Record<string, number> {
    const summary: Record<string, number> = {};
    
    events.forEach(event => {
      summary[event.eventType] = (summary[event.eventType] || 0) + 1;
    });

    return summary;
  }

  private calculateTimeSpan(events: SupplyChainEvent[]): { start: Date; end: Date; duration: number } {
    if (events.length === 0) {
      return { start: new Date(), end: new Date(), duration: 0 };
    }

    const start = new Date(Math.min(...events.map(e => e.timestamp.getTime())));
    const end = new Date(Math.max(...events.map(e => e.timestamp.getTime())));
    const duration = end.getTime() - start.getTime();

    return { start, end, duration };
  }

  private getCertificationStatus(cert: TraceabilityRecord['certifications'][0]): 'valid' | 'expired' | 'expiring_soon' {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (cert.validTo < now) return 'expired';
    if (cert.validTo < thirtyDaysFromNow) return 'expiring_soon';
    return 'valid';
  }

  private assessSupplyChainRisks(record: TraceabilityRecord): any[] {
    const risks = [];

    // Check for expired certifications
    const expiredCerts = record.certifications.filter(cert => 
      this.getCertificationStatus(cert) === 'expired'
    );
    if (expiredCerts.length > 0) {
      risks.push({
        type: 'certification',
        level: 'high',
        description: `${expiredCerts.length} certification(s) expired`,
        impact: 'Compliance violation risk'
      });
    }

    // Check for failed compliance checks
    const failedChecks = record.complianceChecks.filter(c => c.status === 'failed');
    if (failedChecks.length > 0) {
      risks.push({
        type: 'compliance',
        level: 'medium',
        description: `${failedChecks.length} compliance check(s) failed`,
        impact: 'Quality assurance risk'
      });
    }

    // Check for unusual event patterns
    const eventGaps = this.analyzeEventGaps(record.events);
    if (eventGaps.length > 0) {
      risks.push({
        type: 'traceability',
        level: 'low',
        description: 'Gaps detected in event timeline',
        impact: 'Traceability integrity risk'
      });
    }

    return risks;
  }

  private analyzeEventGaps(events: SupplyChainEvent[]): any[] {
    const gaps = [];
    const maxGapHours = 72; // 3 days

    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp.getTime() - events[i - 1].timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff > maxGapHours) {
        gaps.push({
          between: [events[i - 1].eventId, events[i].eventId],
          duration: hoursDiff,
          description: `${Math.round(hoursDiff)} hour gap between events`
        });
      }
    }

    return gaps;
  }

  private generateComplianceRecommendations(record: TraceabilityRecord): string[] {
    const recommendations = [];

    // Check certification status
    const expiringSoon = record.certifications.filter(cert => 
      this.getCertificationStatus(cert) === 'expiring_soon'
    );
    if (expiringSoon.length > 0) {
      recommendations.push('Renew expiring certifications before they expire');
    }

    // Check compliance score
    const complianceScore = this.calculateComplianceScore(record);
    if (complianceScore < 80) {
      recommendations.push('Improve compliance processes to achieve >80% pass rate');
    }

    // Check event frequency
    if (record.events.length < 5) {
      recommendations.push('Increase supply chain event tracking for better traceability');
    }

    return recommendations;
  }

  // Public interface methods

  /**
   * Get transaction status
   */
  public getTransactionStatus(transactionId: string): BlockchainTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * Get all transactions for an item
   */
  public getItemTransactions(itemId: string): BlockchainTransaction[] {
    return Array.from(this.transactions.values()).filter(tx => tx.itemId === itemId);
  }

  /**
   * Check if blockchain service is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get blockchain network status
   */
  public async getNetworkStatus(): Promise<any> {
    try {
      if (!this.connected) {
        return { connected: false };
      }

      const blockNumber = await this.web3Instance.getBlockNumber();
      const gasPrice = await this.web3Instance.getGasPrice();

      return {
        connected: true,
        network: this.blockchainNetwork,
        currentBlock: blockNumber,
        gasPrice: gasPrice,
        pendingTransactions: this.batchQueue.length,
        totalTransactions: this.transactions.size,
        contracts: Object.keys(this.contractAddresses)
      };

    } catch (error) {
      console.error('Error getting network status:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Force process pending transactions
   */
  public async processPendingTransactions(): Promise<void> {
    if (this.batchQueue.length > 0) {
      await this.processBatch();
    }
  }

  /**
   * Get supply chain analytics
   */
  public getSupplyChainAnalytics(): any {
    const allRecords = Array.from(this.traceabilityRecords.values());
    
    return {
      totalItems: allRecords.length,
      verifiedItems: allRecords.filter(r => r.verificationStatus === 'verified').length,
      averageEvents: allRecords.reduce((sum, r) => sum + r.events.length, 0) / allRecords.length,
      complianceRate: allRecords.reduce((sum, r) => sum + this.calculateComplianceScore(r), 0) / allRecords.length,
      eventTypes: this.summarizeEventTypes(allRecords.flatMap(r => r.events)),
      riskDistribution: {
        high: allRecords.filter(r => this.assessSupplyChainRisks(r).some(risk => risk.level === 'high')).length,
        medium: allRecords.filter(r => this.assessSupplyChainRisks(r).some(risk => risk.level === 'medium')).length,
        low: allRecords.filter(r => this.assessSupplyChainRisks(r).some(risk => risk.level === 'low')).length
      }
    };
  }
}

export default AdvancedBlockchainIntegrationService;
