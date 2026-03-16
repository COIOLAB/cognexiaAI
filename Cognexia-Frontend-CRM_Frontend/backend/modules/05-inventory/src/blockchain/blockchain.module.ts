import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';

// Entities
import { BlockchainTransaction } from './entities/blockchain-transaction.entity';
import { SmartContract } from './entities/smart-contract.entity';
import { SupplyChainEvent } from './entities/supply-chain-event.entity';
import { AssetTracker } from './entities/asset-tracker.entity';
import { BlockchainAuditLog } from './entities/blockchain-audit-log.entity';
import { Web3Wallet } from './entities/web3-wallet.entity';
import { ContractDeployment } from './entities/contract-deployment.entity';

// Services
import { BlockchainService } from './services/blockchain.service';
import { SmartContractService } from './services/smart-contract.service';
import { SupplyChainTrackingService } from './services/supply-chain-tracking.service';
import { Web3Service } from './services/web3.service';
import { BlockchainValidationService } from './services/blockchain-validation.service';
import { ContractInteractionService } from './services/contract-interaction.service';
import { BlockchainEventListenerService } from './services/blockchain-event-listener.service';
import { AssetTokenizationService } from './services/asset-tokenization.service';
import { CrossChainService } from './services/cross-chain.service';
import { BlockchainSecurityService } from './services/blockchain-security.service';

// Controllers
import { BlockchainController } from './controllers/blockchain.controller';
import { SmartContractController } from './controllers/smart-contract.controller';
import { SupplyChainController } from './controllers/supply-chain.controller';
import { AssetController } from './controllers/asset.controller';
import { Web3Controller } from './controllers/web3.controller';

// Processors
import { BlockchainTransactionProcessor } from './processors/blockchain-transaction.processor';
import { SmartContractProcessor } from './processors/smart-contract.processor';
import { SupplyChainEventProcessor } from './processors/supply-chain-event.processor';

// Guards and Middleware
import { Web3AuthGuard } from './guards/web3-auth.guard';
import { BlockchainRateLimitGuard } from './guards/blockchain-rate-limit.guard';
import { SmartContractValidationGuard } from './guards/smart-contract-validation.guard';

// Providers and Factories
import { Web3ProviderFactory } from './providers/web3-provider.factory';
import { ContractFactory } from './factories/contract.factory';
import { BlockchainNetworkSelector } from './providers/blockchain-network-selector';

// Interceptors
import { BlockchainLoggingInterceptor } from './interceptors/blockchain-logging.interceptor';
import { GasFeeInterceptor } from './interceptors/gas-fee.interceptor';
import { TransactionTimeoutInterceptor } from './interceptors/transaction-timeout.interceptor';

// Utilities
import { BlockchainUtils } from './utils/blockchain.utils';
import { ContractAbiManager } from './utils/contract-abi-manager';
import { CryptoUtils } from './utils/crypto.utils';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([
      BlockchainTransaction,
      SmartContract,
      SupplyChainEvent,
      AssetTracker,
      BlockchainAuditLog,
      Web3Wallet,
      ContractDeployment,
    ]),
    BullModule.registerQueue(
      {
        name: 'blockchain-transactions',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: 'smart-contracts',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'fixed',
            delay: 5000,
          },
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      },
      {
        name: 'supply-chain-events',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'linear',
            delay: 3000,
          },
          removeOnComplete: 200,
          removeOnFail: 100,
        },
      },
    ),
    EventEmitterModule,
  ],
  controllers: [
    BlockchainController,
    SmartContractController,
    SupplyChainController,
    AssetController,
    Web3Controller,
  ],
  providers: [
    // Core Services
    BlockchainService,
    SmartContractService,
    SupplyChainTrackingService,
    Web3Service,
    BlockchainValidationService,
    ContractInteractionService,
    BlockchainEventListenerService,
    AssetTokenizationService,
    CrossChainService,
    BlockchainSecurityService,

    // Processors
    BlockchainTransactionProcessor,
    SmartContractProcessor,
    SupplyChainEventProcessor,

    // Guards
    Web3AuthGuard,
    BlockchainRateLimitGuard,
    SmartContractValidationGuard,

    // Factories and Providers
    {
      provide: 'WEB3_PROVIDER_FACTORY',
      useFactory: (configService: ConfigService) => {
        return new Web3ProviderFactory(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'CONTRACT_FACTORY',
      useFactory: (web3Service: Web3Service, configService: ConfigService) => {
        return new ContractFactory(web3Service, configService);
      },
      inject: [Web3Service, ConfigService],
    },
    {
      provide: 'BLOCKCHAIN_NETWORK_SELECTOR',
      useFactory: (configService: ConfigService) => {
        return new BlockchainNetworkSelector(configService);
      },
      inject: [ConfigService],
    },

    // Interceptors
    BlockchainLoggingInterceptor,
    GasFeeInterceptor,
    TransactionTimeoutInterceptor,

    // Utilities
    BlockchainUtils,
    ContractAbiManager,
    CryptoUtils,

    // Configuration Providers
    {
      provide: 'BLOCKCHAIN_CONFIG',
      useFactory: (configService: ConfigService) => ({
        networks: {
          ethereum: {
            name: 'ethereum',
            chainId: 1,
            rpcUrl: configService.get('ETHEREUM_RPC_URL', 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'),
            gasPrice: configService.get('ETHEREUM_GAS_PRICE', '20000000000'), // 20 gwei
            confirmations: configService.get('ETHEREUM_CONFIRMATIONS', 12),
            blockTime: 13000, // 13 seconds
          },
          polygon: {
            name: 'polygon',
            chainId: 137,
            rpcUrl: configService.get('POLYGON_RPC_URL', 'https://polygon-rpc.com'),
            gasPrice: configService.get('POLYGON_GAS_PRICE', '30000000000'), // 30 gwei
            confirmations: configService.get('POLYGON_CONFIRMATIONS', 20),
            blockTime: 2000, // 2 seconds
          },
          binance: {
            name: 'binance',
            chainId: 56,
            rpcUrl: configService.get('BSC_RPC_URL', 'https://bsc-dataseed.binance.org'),
            gasPrice: configService.get('BSC_GAS_PRICE', '5000000000'), // 5 gwei
            confirmations: configService.get('BSC_CONFIRMATIONS', 10),
            blockTime: 3000, // 3 seconds
          },
          avalanche: {
            name: 'avalanche',
            chainId: 43114,
            rpcUrl: configService.get('AVALANCHE_RPC_URL', 'https://api.avax.network/ext/bc/C/rpc'),
            gasPrice: configService.get('AVALANCHE_GAS_PRICE', '25000000000'), // 25 nAVAX
            confirmations: configService.get('AVALANCHE_CONFIRMATIONS', 5),
            blockTime: 2000, // 2 seconds
          },
          // Development/Test networks
          hardhat: {
            name: 'hardhat',
            chainId: 31337,
            rpcUrl: configService.get('HARDHAT_RPC_URL', 'http://127.0.0.1:8545'),
            gasPrice: configService.get('HARDHAT_GAS_PRICE', '8000000000'), // 8 gwei
            confirmations: 1,
            blockTime: 1000, // 1 second
          },
          sepolia: {
            name: 'sepolia',
            chainId: 11155111,
            rpcUrl: configService.get('SEPOLIA_RPC_URL', 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'),
            gasPrice: configService.get('SEPOLIA_GAS_PRICE', '10000000000'), // 10 gwei
            confirmations: 3,
            blockTime: 12000, // 12 seconds
          },
        },
        defaultNetwork: configService.get('DEFAULT_BLOCKCHAIN_NETWORK', 'ethereum'),
        enableMultiChain: configService.get('ENABLE_MULTI_CHAIN', true),
        
        // Smart Contract Settings
        contracts: {
          supplyChainTracker: {
            name: 'SupplyChainTracker',
            version: '1.0.0',
            gasLimit: configService.get('SUPPLY_CHAIN_GAS_LIMIT', 500000),
          },
          assetTokenization: {
            name: 'AssetTokenization',
            version: '1.0.0',
            gasLimit: configService.get('ASSET_TOKEN_GAS_LIMIT', 300000),
          },
          auditTrail: {
            name: 'AuditTrail',
            version: '1.0.0',
            gasLimit: configService.get('AUDIT_TRAIL_GAS_LIMIT', 200000),
          },
          inventoryManagement: {
            name: 'InventoryManagement',
            version: '1.0.0',
            gasLimit: configService.get('INVENTORY_MGT_GAS_LIMIT', 400000),
          },
        },

        // Transaction Settings
        transaction: {
          maxGasPrice: configService.get('MAX_GAS_PRICE', '100000000000'), // 100 gwei
          maxRetries: configService.get('BLOCKCHAIN_MAX_RETRIES', 3),
          timeout: configService.get('BLOCKCHAIN_TIMEOUT', 60000), // 60 seconds
          batchSize: configService.get('BLOCKCHAIN_BATCH_SIZE', 100),
        },

        // Security Settings
        security: {
          enableMultiSig: configService.get('ENABLE_MULTI_SIG', true),
          requiredSignatures: configService.get('REQUIRED_SIGNATURES', 2),
          maxDailyTransactionValue: configService.get('MAX_DAILY_TX_VALUE', '1000000000000000000'), // 1 ETH equivalent
          enableRateLimiting: configService.get('ENABLE_BLOCKCHAIN_RATE_LIMITING', true),
          rateLimitPerMinute: configService.get('BLOCKCHAIN_RATE_LIMIT_PER_MINUTE', 10),
        },

        // IPFS Settings (for metadata storage)
        ipfs: {
          enabled: configService.get('ENABLE_IPFS', true),
          apiUrl: configService.get('IPFS_API_URL', 'https://ipfs.infura.io:5001'),
          gatewayUrl: configService.get('IPFS_GATEWAY_URL', 'https://ipfs.infura.io/ipfs/'),
          projectId: configService.get('IPFS_PROJECT_ID'),
          projectSecret: configService.get('IPFS_PROJECT_SECRET'),
        },

        // Event Monitoring
        monitoring: {
          enableEventListening: configService.get('ENABLE_BLOCKCHAIN_EVENT_LISTENING', true),
          eventPollingInterval: configService.get('EVENT_POLLING_INTERVAL', 5000), // 5 seconds
          maxBlocksToScan: configService.get('MAX_BLOCKS_TO_SCAN', 1000),
          enableHealthChecks: configService.get('ENABLE_BLOCKCHAIN_HEALTH_CHECKS', true),
          healthCheckInterval: configService.get('BLOCKCHAIN_HEALTH_CHECK_INTERVAL', 30000), // 30 seconds
        },

        // Development Settings
        development: {
          enableTestMode: configService.get('BLOCKCHAIN_TEST_MODE', false),
          mockTransactions: configService.get('MOCK_BLOCKCHAIN_TRANSACTIONS', false),
          logLevel: configService.get('BLOCKCHAIN_LOG_LEVEL', 'info'),
          enableDebugLogging: configService.get('ENABLE_BLOCKCHAIN_DEBUG', false),
        },
      }),
      inject: [ConfigService],
    },
  ],
  exports: [
    BlockchainService,
    SmartContractService,
    SupplyChainTrackingService,
    Web3Service,
    AssetTokenizationService,
    CrossChainService,
    BlockchainUtils,
    CryptoUtils,
    'WEB3_PROVIDER_FACTORY',
    'CONTRACT_FACTORY',
    'BLOCKCHAIN_CONFIG',
  ],
})
export class BlockchainModule {
  constructor(
    private readonly blockchainEventListener: BlockchainEventListenerService,
    private readonly configService: ConfigService,
  ) {
    this.initializeBlockchainModule();
  }

  private async initializeBlockchainModule(): Promise<void> {
    const isEnabled = this.configService.get<boolean>('ENABLE_BLOCKCHAIN', true);
    
    if (isEnabled) {
      // Start blockchain event listeners
      if (this.configService.get<boolean>('ENABLE_BLOCKCHAIN_EVENT_LISTENING', true)) {
        await this.blockchainEventListener.startListening();
      }
    }
  }
}
