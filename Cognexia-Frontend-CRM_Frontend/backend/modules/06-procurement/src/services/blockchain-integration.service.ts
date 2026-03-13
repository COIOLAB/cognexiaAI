import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ethers, Wallet, ContractFactory, Contract as EthersContract } from 'ethers';

import { 
  PurchaseOrder, 
  OrderStatus,
  BlockchainData as POBlockchainData
} from '../entities/purchase-order.entity';
import { 
  Contract as ProcurementContract, 
  ContractStatus,
  BlockchainIntegration as ContractBlockchainData
} from '../entities/contract.entity';
import { Supplier } from '../entities/supplier.entity';
import { AIProcurementIntelligenceService } from './ai-procurement-intelligence.service';

// --- Interfaces for Blockchain Service ---

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  HYPERLEDGER = 'hyperledger',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  LOCAL_TESTNET = 'local_testnet'
}

export enum TransactionType {
  CREATE_PO = 'create_po',
  UPDATE_PO_STATUS = 'update_po_status',
  RECORD_DELIVERY = 'record_delivery',
  PROCESS_PAYMENT = 'process_payment',
  CREATE_CONTRACT = 'create_contract',
  AMEND_CONTRACT = 'amend_contract',
  EXECUTE_CLAUSE = 'execute_clause',
  TERMINATE_CONTRACT = 'terminate_contract',
  SUPPLIER_VERIFICATION = 'supplier_verification',
  QUALITY_ASSURANCE = 'quality_assurance'
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  network: BlockchainNetwork;
  from: string;
  to: string;
  gasUsed: string;
  transactionFee: string;
  status: 'success' | 'failed';
  
  // Application-specific data
  transactionType: TransactionType;
  entityId: string; // PO, Contract, or Supplier ID
  entityType: 'PurchaseOrder' | 'Contract' | 'Supplier';
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SmartContractDeployment {
  address: string;
  network: BlockchainNetwork;
  deploymentTransaction: BlockchainTransaction;
  abi: any[];
  bytecode: string;
  verification: {
    verified: boolean;
    verifier?: string;
    verificationDate?: Date;
    reportUrl?: string;
  };
}

export interface DataVerificationResult {
  dataHash: string;
  onChainHash: string;
  isMatch: boolean;
  timestamp: Date;
  transaction: BlockchainTransaction;
  confidence: number; // 0-100
}

@Injectable()
export class BlockchainIntegrationService {
  private readonly logger = new Logger(BlockchainIntegrationService.name);
  private readonly supabase: SupabaseClient;
  private provider: ethers.JsonRpcProvider;
  private wallet: Wallet;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private aiIntelligenceService: AIProcurementIntelligenceService,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(ProcurementContract)
    private contractRepository: Repository<ProcurementContract>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>
  ) {
    // Initialize Supabase client
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_ANON_KEY')
    );

    // Initialize blockchain provider and wallet
    this.initializeEthers();
  }

  /**
   * Initialize Ethers.js provider and wallet
   */
  private initializeEthers() {
    try {
      const providerUrl = this.configService.get('BLOCKCHAIN_PROVIDER_URL');
      const privateKey = this.configService.get('BLOCKCHAIN_WALLET_PRIVATE_KEY');

      if (!providerUrl || !privateKey) {
        this.logger.warn('Blockchain provider URL or private key not configured. Service will run in mock mode.');
        return;
      }

      this.provider = new ethers.JsonRpcProvider(providerUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      this.logger.log(`Blockchain integration initialized for network: ${(await this.provider.getNetwork()).name}`);
      this.logger.log(`Wallet address: ${this.wallet.address}`);
    } catch (error) {
      this.logger.error('Failed to initialize Ethers.js client:', error);
      this.provider = null; // Ensure service fails gracefully
    }
  }

  /**
   * Record a Purchase Order on the blockchain for immutability
   */
  async recordPurchaseOrder(purchaseOrderId: string): Promise<SmartContractDeployment> {
    if (!this.provider) throw new Error('Blockchain provider not initialized.');
    
    try {
      this.logger.log(`Recording Purchase Order on blockchain: ${purchaseOrderId}`);

      const po = await this.purchaseOrderRepository.findOne({ where: { id: purchaseOrderId }, relations: ['supplier'] });
      if (!po) {
        throw new NotFoundException('Purchase Order not found');
      }

      // Compile smart contract (mock)
      const { abi, bytecode } = this.compilePOContract(po);

      // Deploy smart contract
      const factory = new ContractFactory(abi, bytecode, this.wallet);
      const contract = await factory.deploy(
        po.id,
        po.supplier.id,
        po.totalAmount,
        po.currency,
        po.deliveryInfo.requestedDate.getTime()
      );
      await contract.waitForDeployment();

      const deploymentTx = contract.deploymentTransaction();
      const deploymentReceipt = await deploymentTx.wait();

      const deploymentResult: SmartContractDeployment = {
        address: await contract.getAddress(),
        network: BlockchainNetwork.LOCAL_TESTNET, // Or get from provider
        abi,
        bytecode,
        deploymentTransaction: this.formatTransaction(deploymentReceipt, TransactionType.CREATE_PO, po),
        verification: { verified: false },
      };

      // Update PO with blockchain data
      po.blockchainData = {
        enabled: true,
        smartContractAddress: deploymentResult.address,
        contractHash: deploymentTx.hash,
        transactionHistory: [this.formatTransaction(deploymentReceipt, TransactionType.CREATE_PO, po)],
        lastSync: new Date(),
      };
      await this.purchaseOrderRepository.save(po);

      this.eventEmitter.emit('blockchain.po.recorded', { po, deployment: deploymentResult });
      this.logger.log(`PO ${po.id} recorded on blockchain at address: ${deploymentResult.address}`);

      return deploymentResult;
    } catch (error) {
      this.logger.error(`Failed to record PO ${purchaseOrderId} on blockchain:`, error);
      throw error;
    }
  }

  /**
   * Record a Procurement Contract on the blockchain
   */
  async recordContract(contractId: string): Promise<SmartContractDeployment> {
    if (!this.provider) throw new Error('Blockchain provider not initialized.');

    try {
      this.logger.log(`Recording Contract on blockchain: ${contractId}`);

      const contract = await this.contractRepository.findOne({ where: { id: contractId }, relations: ['supplier'] });
      if (!contract) {
        throw new NotFoundException('Contract not found');
      }

      // Compile smart contract (mock)
      const { abi, bytecode } = this.compileProcurementContract(contract);

      // Deploy smart contract
      const factory = new ContractFactory(abi, bytecode, this.wallet);
      const sc = await factory.deploy(
        contract.id,
        contract.supplier.id,
        contract.totalValue,
        JSON.stringify(contract.terms.deliverables.map(d => d.id)),
        contract.endDate.getTime()
      );
      await sc.waitForDeployment();

      const deploymentTx = sc.deploymentTransaction();
      const deploymentReceipt = await deploymentTx.wait();

      const deploymentResult: SmartContractDeployment = {
        address: await sc.getAddress(),
        network: BlockchainNetwork.LOCAL_TESTNET,
        abi,
        bytecode,
        deploymentTransaction: this.formatTransaction(deploymentReceipt, TransactionType.CREATE_CONTRACT, contract),
        verification: { verified: false },
      };

      // Update contract with blockchain data
      contract.blockchainData = {
        enabled: true,
        smartContractAddress: deploymentResult.address,
        contractHash: deploymentTx.hash,
        transactionHistory: [],
        immutableClauses: [],
        autoExecutionRules: [],
      };
      contract.blockchainData.transactionHistory.push(this.formatTransaction(deploymentReceipt, TransactionType.CREATE_CONTRACT, contract));
      await this.contractRepository.save(contract);

      this.eventEmitter.emit('blockchain.contract.recorded', { contract, deployment: deploymentResult });
      this.logger.log(`Contract ${contract.id} recorded at address: ${deploymentResult.address}`);

      return deploymentResult;
    } catch (error) {
      this.logger.error(`Failed to record contract ${contractId} on blockchain:`, error);
      throw error;
    }
  }

  /**
   * Generic method to record a transaction for any entity
   */
  async recordTransaction(
    entity: PurchaseOrder | ProcurementContract,
    transactionType: TransactionType,
    payload: Record<string, any>
  ): Promise<BlockchainTransaction> {
    if (!this.provider) throw new Error('Blockchain provider not initialized.');

    try {
      this.logger.log(`Recording transaction ${transactionType} for entity ${entity.id}`);

      const contract = new EthersContract(entity.blockchainData.smartContractAddress, this.getContractABI(entity), this.wallet);

      let tx;
      switch (transactionType) {
        case TransactionType.UPDATE_PO_STATUS:
          tx = await contract.updateStatus(payload.status);
          break;
        case TransactionType.RECORD_DELIVERY:
          tx = await contract.recordDelivery(payload.deliveryDate, payload.isCompleted);
          break;
        case TransactionType.PROCESS_PAYMENT:
          tx = await contract.processPayment(payload.amount, payload.paymentDate);
          break;
        default:
          throw new BadRequestException('Unsupported transaction type for this method');
      }

      const receipt = await tx.wait();
      const formattedTx = this.formatTransaction(receipt, transactionType, entity, payload);

      // Update entity with new transaction
      entity.blockchainData.transactionHistory.push(formattedTx);
      entity.blockchainData.lastSync = new Date();
      if (entity instanceof PurchaseOrder) {
        await this.purchaseOrderRepository.save(entity);
      } else {
        await this.contractRepository.save(entity as ProcurementContract);
      }

      this.eventEmitter.emit('blockchain.transaction.recorded', { entity, transaction: formattedTx });
      this.logger.log(`Transaction ${formattedTx.txHash} recorded successfully`);

      return formattedTx;
    } catch (error) {
      this.logger.error(`Failed to record transaction for entity ${entity.id}:`, error);
      throw error;
    }
  }

  /**
   * Verify the integrity of data against the blockchain hash
   */
  async verifyData(entity: PurchaseOrder | ProcurementContract): Promise<DataVerificationResult> {
    if (!this.provider) throw new Error('Blockchain provider not initialized.');

    try {
      this.logger.log(`Verifying data integrity for entity: ${entity.id}`);
      
      const contract = new EthersContract(entity.blockchainData.smartContractAddress, this.getContractABI(entity), this.provider);

      // Calculate local hash
      const localHash = this.calculateDataHash(entity);

      // Get on-chain hash
      const onChainHash = await contract.getDataHash();

      const isMatch = localHash === onChainHash;

      if (!isMatch) {
        this.logger.warn(`Data mismatch for entity ${entity.id}. Local: ${localHash}, On-chain: ${onChainHash}`);
        this.eventEmitter.emit('blockchain.verification.failed', { entity, localHash, onChainHash });
      }

      return {
        dataHash: localHash,
        onChainHash,
        isMatch,
        timestamp: new Date(),
        transaction: null, // Would be populated from logs if needed
        confidence: isMatch ? 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to verify data for entity ${entity.id}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction history for an entity from the blockchain
   */
  async getTransactionHistory(entity: PurchaseOrder | ProcurementContract): Promise<BlockchainTransaction[]> {
    if (!this.provider) throw new Error('Blockchain provider not initialized.');

    try {
      this.logger.log(`Fetching transaction history for entity: ${entity.id}`);
      const contract = new EthersContract(entity.blockchainData.smartContractAddress, this.getContractABI(entity), this.provider);
      
      // This is a simplified approach. A real implementation would query past events.
      // For example, using contract.queryFilter(event, fromBlock, toBlock)
      // Here, we just return the locally stored history for demonstration.
      return entity.blockchainData.transactionHistory.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      this.logger.error(`Failed to fetch transaction history for ${entity.id}:`, error);
      throw error;
    }
  }

  /**
   * Automated audit of blockchain records
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performBlockchainAudit(): Promise<void> {
    try {
      this.logger.log('Performing daily blockchain audit');

      const auditablePOs = await this.purchaseOrderRepository.find({ 
        where: { blockchainData: { enabled: true } }
      });

      const auditableContracts = await this.contractRepository.find({ 
        where: { blockchainData: { enabled: true } }
      });

      let verifiedCount = 0;
      let failedCount = 0;

      for (const entity of [...auditablePOs, ...auditableContracts]) {
        try {
          const result = await this.verifyData(entity);
          if (result.isMatch) {
            verifiedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          this.logger.error(`Audit failed for entity ${entity.id}:`, error);
        }
      }

      const auditReport = {
        timestamp: new Date(),
        totalAudited: auditablePOs.length + auditableContracts.length,
        verifiedCount,
        failedCount,
      };

      // Store audit report
      await this.storeAuditReport(auditReport);

      this.eventEmitter.emit('blockchain.audit.completed', auditReport);
      this.logger.log(`Blockchain audit completed. Verified: ${verifiedCount}, Failed: ${failedCount}`);

    } catch (error) {
      this.logger.error('Blockchain audit process failed:', error);
    }
  }
  
  // --- Private Helper Methods ---

  private formatTransaction(
    receipt: ethers.TransactionReceipt,
    transactionType: TransactionType,
    entity: PurchaseOrder | ProcurementContract,
    payload: Record<string, any> = {}
  ): BlockchainTransaction {
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: new Date(), // receipt.timestamp is not available in ethers v6 receipts
      network: BlockchainNetwork.LOCAL_TESTNET,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      transactionFee: receipt.gasUsed.mul(receipt.gasPrice).toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      transactionType,
      entityId: entity.id,
      entityType: entity instanceof PurchaseOrder ? 'PurchaseOrder' : 'Contract',
      payload,
    };
  }

  private compilePOContract(po: PurchaseOrder): { abi: any[], bytecode: string } {
    // This would be a real compilation step in a real project (e.g., using Hardhat or Truffle)
    // Mock ABI and bytecode for demonstration
    const abi = [
      "constructor(string, string, uint256, string, uint256)",
      "function updateStatus(uint8)",
      "function recordDelivery(uint256, bool)",
      "function processPayment(uint256, uint256)",
      "function getDataHash() public view returns (bytes32)",
      // Events
      "event StatusUpdated(uint8 newStatus)",
      "event DeliveryRecorded(uint256 deliveryDate, bool completed)",
    ];
    const bytecode = '0x...'; // Mock bytecode
    return { abi, bytecode };
  }
  
  private compileProcurementContract(contract: ProcurementContract): { abi: any[], bytecode: string } {
    const abi = [
      "constructor(string, string, uint256, string[], uint256)",
      "function executeClause(string clauseId)",
      "function amendContract(string newHash)",
      "function getDataHash() public view returns (bytes32)",
      "event ContractAmended(string newHash)",
      "event ClauseExecuted(string clauseId)",
    ];
    const bytecode = '0x...'; // Mock bytecode
    return { abi, bytecode };
  }
  
  private getContractABI(entity: PurchaseOrder | ProcurementContract): any[] {
    if (entity instanceof PurchaseOrder) {
      return this.compilePOContract(entity).abi;
    }
    return this.compileProcurementContract(entity as ProcurementContract).abi;
  }

  private calculateDataHash(entity: PurchaseOrder | ProcurementContract): string {
    // Create a consistent string representation of the core data
    const dataString = JSON.stringify({
      id: entity.id,
      ...(entity instanceof PurchaseOrder && { 
        supplier: entity.supplierId,
        amount: entity.totalAmount,
        status: entity.status 
      }),
      ...(entity instanceof ProcurementContract && { 
        supplier: entity.supplierId, 
        value: entity.totalValue, 
        endDate: entity.endDate 
      }),
    });
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  private async storeAuditReport(report: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('blockchain_audit_reports')
        .insert(report);
      if (error) throw error;
    } catch (error) {
      this.logger.error('Failed to store blockchain audit report:', error);
    }
  }
}
