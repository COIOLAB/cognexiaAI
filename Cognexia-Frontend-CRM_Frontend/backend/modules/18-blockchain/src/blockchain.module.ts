import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainController } from './controllers/blockchain.controller';
import { BlockchainService } from './services/blockchain.service';
import { BlockchainTransaction } from './entities/blockchain-transaction.entity';
import { SmartContract } from './entities/smart-contract.entity';
import { DigitalAsset } from './entities/digital-asset.entity';
import { SupplyChainTrace } from './entities/supply-chain-trace.entity';
import { CryptoWallet } from './entities/crypto-wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockchainTransaction,
      SmartContract,
      DigitalAsset,
      SupplyChainTrace,
      CryptoWallet,
    ]),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
