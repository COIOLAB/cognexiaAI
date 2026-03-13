import { Injectable, Logger, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { TransactionReceipt, Transaction } from 'web3-core';

import { 
  BlockchainTransaction, 
  TransactionStatus, 
  TransactionType, 
  BlockchainNetwork 
} from '../entities/blockchain-transaction.entity';
import { SupplyChainEvent } from '../entities/supply-chain-event.entity';
import { Web3Service } from './web3.service';
import { BlockchainValidationService } from './blockchain-validation.service';
import { BlockchainSecurityService } from './blockchain-security.service';

export interface BlockchainTransactionRequest {
  network: BlockchainNetwork;
  transactionType: TransactionType;
  toAddress: string;
  value?: string;
  data?: string;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  userId?: string;
  inventoryItemId?: string;
  businessContext?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface TransactionResult {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: number;
  status: 'success' | 'failed';
  logs?: any[];
  contractAddress?: string;
  error?: string;
}

export interface NetworkStatus {
  network: BlockchainNetwork;
  isConnected: boolean;
  blockNumber: number;
  gasPrice: string;
  peerCount?: number;
  syncing: boolean;
  chainId: number;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

export interface GasEstimation {
  gasLimit: number;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCostEth: string;
  estimatedCostUsd?: number;
  networkCongestion: 'low' | 'medium' | 'high';
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly web3Instances = new Map<BlockchainNetwork, Web3>();
  private readonly networkConfigs: Map<BlockchainNetwork, any>;

  constructor(
    @InjectRepository(BlockchainTransaction)
    private blockchainTransactionRepository: Repository<BlockchainTransaction>,
    
    @InjectRepository(SupplyChainEvent)
    private supplyChainEventRepository: Repository<SupplyChainEvent>,
    
    @InjectQueue('blockchain-transactions')
    private transactionQueue: Queue,
    
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private web3Service: Web3Service,
    private validationService: BlockchainValidationService,
    private securityService: BlockchainSecurityService,
    
    @Inject('BLOCKCHAIN_CONFIG')
    private blockchainConfig: any,
  ) {
    this.networkConfigs = new Map();
    this.initializeNetworks();
  }

  /**
   * Submit a blockchain transaction
   */
  async submitTransaction(request: BlockchainTransactionRequest): Promise<BlockchainTransaction> {
    try {
      this.logger.log(`Submitting transaction: ${request.transactionType} on ${request.network}`);

      // Validate request
      await this.validationService.validateTransactionRequest(request);

      // Security checks
      await this.securityService.performSecurityChecks(request);

      // Get Web3 instance for the network
      const web3 = await this.getWeb3Instance(request.network);
      const networkConfig = this.networkConfigs.get(request.network);

      // Get account for signing
      const account = await this.web3Service.getSigningAccount(request.network);
      
      // Estimate gas if not provided
      let gasEstimation: GasEstimation;
      if (!request.gasLimit || !request.gasPrice) {
        gasEstimation = await this.estimateGas(request);
      }

      // Get nonce
      const nonce = await web3.eth.getTransactionCount(account.address, 'pending');

      // Create transaction object
      const txData = {
        from: account.address,
        to: request.toAddress,
        value: request.value || '0',
        data: request.data || '0x',
        gas: request.gasLimit || gasEstimation.gasLimit,
        gasPrice: request.gasPrice || gasEstimation.gasPrice,
        nonce,
        chainId: networkConfig.chainId,
      };

      // Add EIP-1559 fields if supported
      if (request.maxFeePerGas && request.maxPriorityFeePerGas) {
        txData['maxFeePerGas'] = request.maxFeePerGas;
        txData['maxPriorityFeePerGas'] = request.maxPriorityFeePerGas;
        delete txData.gasPrice;
      }

      // Sign transaction
      const signedTx = await account.signTransaction(txData);

      // Create blockchain transaction record
      const blockchainTx = this.blockchainTransactionRepository.create({
        transactionHash: signedTx.transactionHash,
        network: request.network,
        fromAddress: account.address,
        toAddress: request.toAddress,
        value: request.value || '0',
        gasLimit: BigInt(txData.gas),
        gasPrice: txData.gasPrice || gasEstimation?.gasPrice || '0',
        nonce: BigInt(nonce),
        inputData: request.data,
        transactionType: request.transactionType,
        status: TransactionStatus.PENDING,
        inventoryItemId: request.inventoryItemId,
        userId: request.userId,
        businessContext: request.businessContext,
        requiredConfirmations: networkConfig.confirmations,
        scheduledAt: request.scheduledAt,
        expiresAt: request.expiresAt,
        feeDetails: {
          gasPrice: txData.gasPrice,
          maxFeePerGas: txData['maxFeePerGas'],
          maxPriorityFeePerGas: txData['maxPriorityFeePerGas'],
          estimatedCostEth: gasEstimation?.estimatedCostEth,
          estimatedCostUsd: gasEstimation?.estimatedCostUsd,
        },
      });

      // Save transaction record
      const savedTx = await this.blockchainTransactionRepository.save(blockchainTx);

      // Submit to blockchain network
      try {
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        // Update transaction with receipt data
        savedTx.updateStatus(TransactionStatus.CONFIRMED, {
          blockNumber: BigInt(receipt.blockNumber),
          blockHash: receipt.blockHash,
          transactionIndex: receipt.transactionIndex,
          gasUsed: BigInt(receipt.gasUsed),
          logs: receipt.logs,
          contractAddress: receipt.contractAddress,
        });

        await this.blockchainTransactionRepository.save(savedTx);

      } catch (error) {
        this.logger.error(`Transaction submission failed: ${signedTx.transactionHash}`, error);
        
        savedTx.updateStatus(TransactionStatus.FAILED, {
          errorMessage: error.message,
          errorCode: error.code?.toString(),
        });

        await this.blockchainTransactionRepository.save(savedTx);

        // Queue for retry if appropriate
        if (this.shouldRetryTransaction(error)) {
          await this.queueTransactionRetry(savedTx);
        }
      }

      // Queue for confirmation monitoring
      await this.transactionQueue.add('monitor-confirmation', {
        transactionId: savedTx.id,
        transactionHash: savedTx.transactionHash,
        network: savedTx.network,
      });

      // Emit event
      this.eventEmitter.emit('blockchain.transaction.submitted', {
        transaction: savedTx,
        request,
      });

      this.logger.log(`Transaction submitted successfully: ${savedTx.transactionHash}`);
      return savedTx;

    } catch (error) {
      this.logger.error('Failed to submit blockchain transaction:', error);
      throw new InternalServerErrorException(`Transaction submission failed: ${error.message}`);
    }
  }

  /**
   * Get transaction status and details
   */
  async getTransactionStatus(transactionHash: string): Promise<{
    transaction: BlockchainTransaction;
    networkStatus: any;
    confirmations: number;
    isFinalized: boolean;
  }> {
    try {
      const transaction = await this.blockchainTransactionRepository.findOne({
        where: { transactionHash },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      const web3 = await this.getWeb3Instance(transaction.network);
      
      // Get current block number
      const currentBlockNumber = await web3.eth.getBlockNumber();
      
      // Calculate confirmations
      let confirmations = 0;
      if (transaction.blockNumber) {
        confirmations = currentBlockNumber - Number(transaction.blockNumber) + 1;
      }

      // Get network receipt
      let networkStatus = null;
      try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);
        if (receipt) {
          networkStatus = {
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
            status: receipt.status,
            logs: receipt.logs,
          };

          // Update local transaction if needed
          if (transaction.status === TransactionStatus.PENDING && receipt.status) {
            transaction.updateStatus(TransactionStatus.CONFIRMED, {
              blockNumber: BigInt(receipt.blockNumber),
              gasUsed: BigInt(receipt.gasUsed),
              logs: receipt.logs,
            });
            
            await this.blockchainTransactionRepository.save(transaction);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to get transaction receipt: ${transactionHash}`, error);
      }

      const isFinalized = confirmations >= transaction.requiredConfirmations;

      return {
        transaction,
        networkStatus,
        confirmations,
        isFinalized,
      };

    } catch (error) {
      this.logger.error(`Failed to get transaction status: ${transactionHash}`, error);
      throw new InternalServerErrorException(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(request: BlockchainTransactionRequest): Promise<GasEstimation> {
    try {
      const web3 = await this.getWeb3Instance(request.network);
      const networkConfig = this.networkConfigs.get(request.network);

      // Estimate gas limit
      const gasEstimate = await web3.eth.estimateGas({
        to: request.toAddress,
        data: request.data || '0x',
        value: request.value || '0',
      });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(gasEstimate * 1.2);

      // Get current gas price
      const currentGasPrice = await web3.eth.getGasPrice();
      
      // Get network congestion level
      const networkCongestion = await this.getNetworkCongestion(request.network);

      // Adjust gas price based on congestion
      let adjustedGasPrice = currentGasPrice;
      switch (networkCongestion) {
        case 'high':
          adjustedGasPrice = (BigInt(currentGasPrice) * BigInt(150) / BigInt(100)).toString(); // +50%
          break;
        case 'medium':
          adjustedGasPrice = (BigInt(currentGasPrice) * BigInt(120) / BigInt(100)).toString(); // +20%
          break;
        default:
          // Use current gas price for low congestion
          break;
      }

      // Calculate estimated cost
      const estimatedCostWei = BigInt(gasLimit) * BigInt(adjustedGasPrice);
      const estimatedCostEth = web3.utils.fromWei(estimatedCostWei.toString(), 'ether');

      // Get USD price (placeholder - would integrate with price API)
      let estimatedCostUsd: number | undefined;
      try {
        const ethPriceUsd = await this.getEthPriceUsd(); // Implement this
        estimatedCostUsd = parseFloat(estimatedCostEth) * ethPriceUsd;
      } catch (error) {
        this.logger.warn('Failed to get ETH price in USD', error);
      }

      // Check if network supports EIP-1559
      const supportsEIP1559 = await this.supportsEIP1559(request.network);
      let maxFeePerGas: string | undefined;
      let maxPriorityFeePerGas: string | undefined;

      if (supportsEIP1559) {
        // Get base fee from latest block
        const latestBlock = await web3.eth.getBlock('latest');
        const baseFee = latestBlock.baseFeePerGas;
        
        if (baseFee) {
          maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei'); // 2 gwei tip
          maxFeePerGas = (BigInt(baseFee) * BigInt(2) + BigInt(maxPriorityFeePerGas)).toString();
        }
      }

      return {
        gasLimit,
        gasPrice: adjustedGasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCostEth,
        estimatedCostUsd,
        networkCongestion,
      };

    } catch (error) {
      this.logger.error(`Gas estimation failed for ${request.network}:`, error);
      throw new InternalServerErrorException(`Gas estimation failed: ${error.message}`);
    }
  }

  /**
   * Get network status for all configured networks
   */
  async getAllNetworkStatus(): Promise<NetworkStatus[]> {
    const networkStatuses: NetworkStatus[] = [];

    for (const [network, config] of this.networkConfigs.entries()) {
      try {
        const status = await this.getNetworkStatus(network);
        networkStatuses.push(status);
      } catch (error) {
        networkStatuses.push({
          network,
          isConnected: false,
          blockNumber: 0,
          gasPrice: '0',
          syncing: false,
          chainId: config.chainId,
          lastChecked: new Date(),
          error: error.message,
        });
      }
    }

    return networkStatuses;
  }

  /**
   * Get network status for a specific network
   */
  async getNetworkStatus(network: BlockchainNetwork): Promise<NetworkStatus> {
    const startTime = Date.now();
    
    try {
      const web3 = await this.getWeb3Instance(network);
      const config = this.networkConfigs.get(network);

      // Get network info
      const [blockNumber, gasPrice, syncing, chainId] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice(),
        web3.eth.isSyncing(),
        web3.eth.getChainId(),
      ]);

      let peerCount: number | undefined;
      try {
        peerCount = await web3.eth.net.getPeerCount();
      } catch (error) {
        // Some networks don't support this
      }

      const responseTime = Date.now() - startTime;

      return {
        network,
        isConnected: true,
        blockNumber,
        gasPrice,
        peerCount,
        syncing: typeof syncing === 'boolean' ? syncing : true,
        chainId,
        lastChecked: new Date(),
        responseTime,
      };

    } catch (error) {
      this.logger.error(`Failed to get network status for ${network}:`, error);
      throw new InternalServerErrorException(`Network status check failed: ${error.message}`);
    }
  }

  /**
   * Monitor transaction confirmations
   */
  async monitorTransactionConfirmations(transactionId: string): Promise<void> {
    try {
      const transaction = await this.blockchainTransactionRepository.findOne({
        where: { id: transactionId },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found for monitoring: ${transactionId}`);
        return;
      }

      const web3 = await this.getWeb3Instance(transaction.network);
      const currentBlockNumber = await web3.eth.getBlockNumber();
      
      if (transaction.blockNumber) {
        const confirmations = currentBlockNumber - Number(transaction.blockNumber) + 1;
        transaction.confirmations = confirmations;

        // Check if transaction is finalized
        if (confirmations >= transaction.requiredConfirmations) {
          if (transaction.status !== TransactionStatus.CONFIRMED) {
            transaction.updateStatus(TransactionStatus.CONFIRMED);
            
            // Emit finalized event
            this.eventEmitter.emit('blockchain.transaction.finalized', {
              transaction,
              confirmations,
            });
          }
        }

        transaction.lastCheckedAt = new Date();
        await this.blockchainTransactionRepository.save(transaction);
      }

    } catch (error) {
      this.logger.error(`Failed to monitor transaction confirmations: ${transactionId}`, error);
    }
  }

  /**
   * Retry failed transaction
   */
  async retryTransaction(transactionId: string): Promise<BlockchainTransaction> {
    try {
      const originalTx = await this.blockchainTransactionRepository.findOne({
        where: { id: transactionId },
      });

      if (!originalTx) {
        throw new BadRequestException('Original transaction not found');
      }

      if (originalTx.status !== TransactionStatus.FAILED) {
        throw new BadRequestException('Only failed transactions can be retried');
      }

      // Create new transaction request
      const retryRequest: BlockchainTransactionRequest = {
        network: originalTx.network,
        transactionType: originalTx.transactionType,
        toAddress: originalTx.toAddress,
        value: originalTx.value,
        data: originalTx.inputData || undefined,
        userId: originalTx.userId || undefined,
        inventoryItemId: originalTx.inventoryItemId || undefined,
        businessContext: originalTx.businessContext,
      };

      // Submit retry transaction
      const retryTx = await this.submitTransaction(retryRequest);

      // Link retry to original
      retryTx.externalReferences = {
        ...retryTx.externalReferences,
        parentTransactionId: originalTx.id,
      };

      originalTx.externalReferences = {
        ...originalTx.externalReferences,
        childTransactionIds: [
          ...(originalTx.externalReferences?.childTransactionIds || []),
          retryTx.id,
        ],
      };

      await this.blockchainTransactionRepository.save([retryTx, originalTx]);

      return retryTx;

    } catch (error) {
      this.logger.error(`Failed to retry transaction: ${transactionId}`, error);
      throw new InternalServerErrorException(`Transaction retry failed: ${error.message}`);
    }
  }

  // Private helper methods

  private async initializeNetworks(): Promise<void> {
    try {
      const networks = this.blockchainConfig.networks;
      
      for (const [networkName, config] of Object.entries(networks)) {
        const network = networkName as BlockchainNetwork;
        this.networkConfigs.set(network, config);
        
        // Initialize Web3 instance
        try {
          const web3 = new Web3(config.rpcUrl);
          this.web3Instances.set(network, web3);
          this.logger.log(`Initialized Web3 for ${network}: ${config.rpcUrl}`);
        } catch (error) {
          this.logger.error(`Failed to initialize Web3 for ${network}:`, error);
        }
      }

    } catch (error) {
      this.logger.error('Failed to initialize blockchain networks:', error);
    }
  }

  private async getWeb3Instance(network: BlockchainNetwork): Promise<Web3> {
    const web3 = this.web3Instances.get(network);
    if (!web3) {
      throw new BadRequestException(`Web3 instance not found for network: ${network}`);
    }
    return web3;
  }

  private async getNetworkCongestion(network: BlockchainNetwork): Promise<'low' | 'medium' | 'high'> {
    try {
      const web3 = await this.getWeb3Instance(network);
      const currentGasPrice = BigInt(await web3.eth.getGasPrice());
      const networkConfig = this.networkConfigs.get(network);
      const baseGasPrice = BigInt(networkConfig.gasPrice);

      const ratio = Number(currentGasPrice) / Number(baseGasPrice);

      if (ratio > 2.0) return 'high';
      if (ratio > 1.5) return 'medium';
      return 'low';

    } catch (error) {
      this.logger.warn(`Failed to get network congestion for ${network}:`, error);
      return 'medium'; // Default to medium congestion
    }
  }

  private async supportsEIP1559(network: BlockchainNetwork): Promise<boolean> {
    // Networks that support EIP-1559
    const eip1559Networks = [
      BlockchainNetwork.ETHEREUM,
      BlockchainNetwork.POLYGON,
      BlockchainNetwork.AVALANCHE,
      BlockchainNetwork.ARBITRUM,
      BlockchainNetwork.OPTIMISM,
    ];

    return eip1559Networks.includes(network);
  }

  private shouldRetryTransaction(error: any): boolean {
    // Define retry conditions based on error types
    const retryableErrors = [
      'nonce too low',
      'replacement transaction underpriced',
      'network error',
      'connection timeout',
    ];

    return retryableErrors.some(retryableError => 
      error.message?.toLowerCase().includes(retryableError)
    );
  }

  private async queueTransactionRetry(transaction: BlockchainTransaction): Promise<void> {
    const retryAttempt = (transaction.retryInfo?.attempts || 0) + 1;
    const maxAttempts = 3;

    if (retryAttempt <= maxAttempts) {
      const delay = Math.pow(2, retryAttempt) * 1000; // Exponential backoff

      await this.transactionQueue.add(
        'retry-transaction',
        { transactionId: transaction.id },
        { delay }
      );

      transaction.retryInfo = {
        attempts: retryAttempt,
        maxAttempts,
        nextRetryAt: new Date(Date.now() + delay).toISOString(),
      };

      await this.blockchainTransactionRepository.save(transaction);
    }
  }

  private async getEthPriceUsd(): Promise<number> {
    // Placeholder for price API integration
    // In production, integrate with CoinGecko, CoinMarketCap, or similar
    return 2000; // Default price
  }
}
