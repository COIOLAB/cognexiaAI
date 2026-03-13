"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const InventoryController_1 = require("./controllers/InventoryController");
const InventoryService_1 = require("./services/InventoryService");
const entities_1 = require("./entities");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.InventoryItem,
                entities_1.StockTransaction,
                entities_1.StockLocation,
                entities_1.CycleCount,
                entities_1.InventoryAdjustment,
                entities_1.InventoryAlert,
                entities_1.ReorderPoint
            ]),
        ],
        controllers: [InventoryController_1.InventoryController],
        providers: [InventoryService_1.InventoryService],
        exports: [InventoryService_1.InventoryService, typeorm_1.TypeOrmModule],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map