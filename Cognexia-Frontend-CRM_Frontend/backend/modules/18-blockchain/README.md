# Blockchain Module (18-blockchain)

## Overview

The **Blockchain Module** provides distributed ledger technology for supply chain transparency, smart contracts, and immutable record keeping in Industry 5.0 manufacturing environments. It ensures data integrity, traceability, and secure transactions across the manufacturing ecosystem.

## Features

### Core Blockchain Capabilities
- **Supply Chain Transparency**: End-to-end supply chain traceability
- **Smart Contracts**: Automated contract execution
- **Immutable Records**: Tamper-proof manufacturing records
- **Digital Certificates**: Blockchain-based quality certificates
- **Multi-Party Consensus**: Distributed agreement mechanisms

### Advanced Features
- **DeFi Integration**: Decentralized finance for manufacturing
- **NFT Manufacturing**: Non-fungible tokens for unique products
- **Cross-Chain Interoperability**: Multi-blockchain support
- **Zero-Knowledge Proofs**: Privacy-preserving verification
- **Consensus Algorithms**: Proof-of-Stake, Practical Byzantine Fault Tolerance

## Key Components

### Smart Contract Service
```typescript
@Injectable()
export class SmartContractService {
  async deployContract(
    contractDefinition: ContractDefinition,
    deploymentParams: DeploymentParameters
  ): Promise<DeployedContract> {
    // Compile smart contract
    const compiledContract = await this.compileContract(contractDefinition);
    
    // Deploy to blockchain
    const deploymentTx = await this.blockchain.deployContract(
      compiledContract,
      deploymentParams
    );
    
    // Wait for confirmation
    const receipt = await this.waitForConfirmation(deploymentTx.hash);
    
    return new DeployedContract({
      address: receipt.contractAddress,
      transactionHash: deploymentTx.hash,
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode,
    });
  }
}
```

### Supply Chain Tracking Service
```typescript
@Injectable()
export class SupplyChainTrackingService {
  async trackProduct(
    productId: string,
    trackingEvent: TrackingEvent
  ): Promise<TrackingResult> {
    // Create blockchain transaction
    const transaction = await this.createTrackingTransaction(
      productId,
      trackingEvent
    );
    
    // Submit to blockchain
    const txHash = await this.blockchain.submitTransaction(transaction);
    
    // Update product history
    await this.updateProductHistory(productId, trackingEvent, txHash);
    
    return {
      productId,
      transactionHash: txHash,
      blockNumber: await this.getBlockNumber(txHash),
      timestamp: new Date(),
    };
  }
}
```

## API Endpoints

### Smart Contracts
- `POST /api/blockchain/contracts/deploy` - Deploy smart contract
- `POST /api/blockchain/contracts/execute` - Execute contract function
- `GET /api/blockchain/contracts/:address` - Get contract details
- `GET /api/blockchain/contracts/:address/events` - Get contract events

### Supply Chain
- `POST /api/blockchain/supply-chain/track` - Track product
- `GET /api/blockchain/supply-chain/:productId` - Get product history
- `POST /api/blockchain/supply-chain/verify` - Verify authenticity
- `GET /api/blockchain/supply-chain/certificates` - Get certificates

## Configuration

### Environment Variables
```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_NODE_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=${BLOCKCHAIN_PRIVATE_KEY}
GAS_LIMIT=3000000

# Smart Contracts
CONTRACT_DEPLOYMENT_ENABLED=true
DEFAULT_GAS_PRICE=20000000000
CONFIRMATION_BLOCKS=12
```

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.
