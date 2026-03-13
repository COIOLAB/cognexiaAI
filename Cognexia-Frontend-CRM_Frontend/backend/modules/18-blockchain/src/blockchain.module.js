"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const blockchain_controller_1 = require("./controllers/blockchain.controller");
const blockchain_service_1 = require("./services/blockchain.service");
const blockchain_transaction_entity_1 = require("./entities/blockchain-transaction.entity");
const smart_contract_entity_1 = require("./entities/smart-contract.entity");
const digital_asset_entity_1 = require("./entities/digital-asset.entity");
const supply_chain_trace_entity_1 = require("./entities/supply-chain-trace.entity");
const crypto_wallet_entity_1 = require("./entities/crypto-wallet.entity");
let BlockchainModule = class BlockchainModule {
};
exports.BlockchainModule = BlockchainModule;
exports.BlockchainModule = BlockchainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                blockchain_transaction_entity_1.BlockchainTransaction,
                smart_contract_entity_1.SmartContract,
                digital_asset_entity_1.DigitalAsset,
                supply_chain_trace_entity_1.SupplyChainTrace,
                crypto_wallet_entity_1.CryptoWallet,
            ]),
        ],
        controllers: [blockchain_controller_1.BlockchainController],
        providers: [blockchain_service_1.BlockchainService],
        exports: [blockchain_service_1.BlockchainService],
    })
], BlockchainModule);
//# sourceMappingURL=blockchain.module.js.map