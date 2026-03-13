"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwin = exports.IndustryType = exports.SynchronizationMode = exports.TwinStatus = exports.TwinType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const digital_twin_simulation_entity_1 = require("./digital-twin-simulation.entity");
var TwinType;
(function (TwinType) {
    TwinType["EQUIPMENT"] = "equipment";
    TwinType["PROCESS"] = "process";
    TwinType["FACILITY"] = "facility";
    TwinType["PRODUCT"] = "product";
    TwinType["SUPPLY_CHAIN"] = "supply_chain";
    TwinType["PRODUCTION_LINE"] = "production_line";
    TwinType["QUALITY_SYSTEM"] = "quality_system";
    TwinType["ENERGY_SYSTEM"] = "energy_system";
    TwinType["SAFETY_SYSTEM"] = "safety_system";
    TwinType["COMPOSITE"] = "composite";
})(TwinType || (exports.TwinType = TwinType = {}));
var TwinStatus;
(function (TwinStatus) {
    TwinStatus["ACTIVE"] = "active";
    TwinStatus["INACTIVE"] = "inactive";
    TwinStatus["SYNCHRONIZING"] = "synchronizing";
    TwinStatus["SIMULATING"] = "simulating";
    TwinStatus["ERROR"] = "error";
    TwinStatus["MAINTENANCE"] = "maintenance";
})(TwinStatus || (exports.TwinStatus = TwinStatus = {}));
var SynchronizationMode;
(function (SynchronizationMode) {
    SynchronizationMode["REAL_TIME"] = "real_time";
    SynchronizationMode["BATCH"] = "batch";
    SynchronizationMode["ON_DEMAND"] = "on_demand";
    SynchronizationMode["SCHEDULED"] = "scheduled";
    SynchronizationMode["EVENT_DRIVEN"] = "event_driven";
})(SynchronizationMode || (exports.SynchronizationMode = SynchronizationMode = {}));
var IndustryType;
(function (IndustryType) {
    IndustryType["AUTOMOTIVE"] = "automotive";
    IndustryType["AEROSPACE"] = "aerospace";
    IndustryType["PHARMACEUTICALS"] = "pharmaceuticals";
    IndustryType["CHEMICALS"] = "chemicals";
    IndustryType["STEEL"] = "steel";
    IndustryType["OIL_GAS"] = "oil_gas";
    IndustryType["FOOD_BEVERAGE"] = "food_beverage";
    IndustryType["ELECTRONICS"] = "electronics";
    IndustryType["TEXTILE"] = "textile";
    IndustryType["DEFENSE"] = "defense";
    IndustryType["ENERGY"] = "energy";
    IndustryType["MINING"] = "mining";
})(IndustryType || (exports.IndustryType = IndustryType = {}));
let DigitalTwin = class DigitalTwin {
    // Methods
    isHealthy() {
        return (this.status === TwinStatus.ACTIVE &&
            this.performance.syncAccuracy > 90 &&
            this.performance.availability > 95 &&
            this.performance.errorRate < 0.01);
    }
    getOverallEffectiveness() {
        const oee = this.currentData.performanceMetrics.oee || 0;
        const quality = this.currentData.performanceMetrics.quality || 0;
        const availability = this.currentData.performanceMetrics.availability || 0;
        const efficiency = this.currentData.performanceMetrics.efficiency || 0;
        return (oee + quality + availability + efficiency) / 4;
    }
    requiresAttention() {
        if (!this.isHealthy())
            return true;
        const hasHighSeverityAnomalies = this.aiInsights?.anomalies?.some(a => a.severity === 'high' || a.severity === 'critical') || false;
        const lowPerformance = this.currentData.performanceMetrics.efficiency < 70;
        return hasHighSeverityAnomalies || lowPerformance;
    }
    getNextMaintenanceDate() {
        if (!this.currentData.maintenanceData?.nextMaintenance)
            return null;
        return new Date(this.currentData.maintenanceData.nextMaintenance);
    }
    getPredictedFailureDate() {
        if (!this.currentData.maintenanceData?.predictedFailure)
            return null;
        return new Date(this.currentData.maintenanceData.predictedFailure);
    }
    getHealthScore() {
        if (!this.currentData.maintenanceData?.healthScore)
            return 50; // default middle score
        return this.currentData.maintenanceData.healthScore;
    }
    isRealTimeSync() {
        return this.configuration.syncMode === SynchronizationMode.REAL_TIME;
    }
    getLatestAnomalies(count = 5) {
        if (!this.historicalSummary?.anomalies)
            return [];
        return this.historicalSummary.anomalies
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
    }
    getOptimizationOpportunities() {
        if (!this.aiInsights?.optimizations)
            return [];
        return this.aiInsights.optimizations
            .sort((a, b) => b.estimatedROI - a.estimatedROI)
            .filter(opt => opt.estimatedROI > 0);
    }
    hasQuantumCapabilities() {
        return this.configuration.quantumOptimization === true ||
            this.simulationConfig?.quantumSimulation?.enabled === true;
    }
    calculateUptime() {
        // This would calculate uptime based on historical data
        // For now, return based on availability metric
        return this.performance.availability || 0;
    }
    getComplianceStatus() {
        // This would check compliance against various standards
        const issues = [];
        if (this.performance.syncAccuracy < 95) {
            issues.push('Sync accuracy below compliance threshold');
        }
        if (this.performance.availability < 99) {
            issues.push('Availability below required uptime');
        }
        return {
            compliant: issues.length === 0,
            issues,
        };
    }
    getEnergyEfficiency() {
        if (!this.currentData.operationalData.energy || !this.currentData.operationalData.production) {
            return 0;
        }
        const energyConsumed = this.currentData.operationalData.energy;
        const outputProduced = this.currentData.performanceMetrics.throughput || 1;
        return outputProduced / energyConsumed;
    }
    updateCurrentData(newData) {
        this.currentData = {
            ...this.currentData,
            ...newData,
            timestamp: new Date().toISOString(),
        };
    }
    addAnomalyDetection(anomaly) {
        if (!this.aiInsights) {
            this.aiInsights = { predictions: [], anomalies: [], optimizations: [], patterns: [] };
        }
        this.aiInsights.anomalies.push({
            ...anomaly,
            detected: new Date().toISOString(),
        });
    }
    getIndustrySpecificMetrics() {
        switch (this.industryType) {
            case IndustryType.AUTOMOTIVE:
                return {
                    cycleTime: this.currentData.operationalData.production?.cycleTime,
                    defectPPM: this.currentData.qualityData?.defectRate * 1000000,
                    toolWear: this.currentData.maintenanceData?.healthScore,
                };
            case IndustryType.PHARMACEUTICALS:
                return {
                    batchYield: this.currentData.qualityData?.qualityScore,
                    contaminationLevel: this.currentData.qualityData?.inspectionResults?.contamination,
                    complianceScore: this.currentData.qualityData?.compliance,
                };
            case IndustryType.CHEMICALS:
                return {
                    reactionEfficiency: this.currentData.performanceMetrics.efficiency,
                    safetyScore: this.currentData.operationalData.production?.safety,
                    environmentalImpact: this.customFields?.environmentalMetrics,
                };
            default:
                return {};
        }
    }
};
exports.DigitalTwin = DigitalTwin;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Digital Twin UUID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DigitalTwin.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique twin identifier' }),
    (0, typeorm_1.Column)({ unique: true, length: 100 }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "twinId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Digital twin name' }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Twin description' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of digital twin', enum: TwinType }),
    (0, typeorm_1.Column)({ type: 'enum', enum: TwinType }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "twinType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status', enum: TwinStatus }),
    (0, typeorm_1.Column)({ type: 'enum', enum: TwinStatus, default: TwinStatus.INACTIVE }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Industry type', enum: IndustryType }),
    (0, typeorm_1.Column)({ type: 'enum', enum: IndustryType }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "industryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Physical asset identifier' }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "physicalAssetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Physical asset location' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "physicalLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Digital twin configuration', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "configuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Physical asset specifications', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "physicalSpecs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current real-time data', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "currentData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Historical data summary', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "historicalSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'AI-powered insights', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "aiInsights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation configuration', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "simulationConfig", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System integrations', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "integrations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compliance and security settings', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "compliance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Twin performance metrics', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "performance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Twin metadata and tags' }),
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], DigitalTwin.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom fields for industry-specific data' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwin.prototype, "customFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Internal notes and documentation' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record creation timestamp' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DigitalTwin.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record last update timestamp' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DigitalTwin.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by user' }),
    (0, typeorm_1.Column)({ name: 'created_by', length: 255 }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated by user' }),
    (0, typeorm_1.Column)({ name: 'updated_by', length: 255 }),
    __metadata("design:type", String)
], DigitalTwin.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => digital_twin_simulation_entity_1.DigitalTwinSimulation, (simulation) => simulation.digitalTwin),
    __metadata("design:type", Array)
], DigitalTwin.prototype, "simulations", void 0);
exports.DigitalTwin = DigitalTwin = __decorate([
    (0, typeorm_1.Entity)('digital_twins'),
    (0, typeorm_1.Index)(['twinId'], { unique: true }),
    (0, typeorm_1.Index)(['twinType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['industryType']),
    (0, typeorm_1.Index)(['physicalAssetId'])
], DigitalTwin);
//# sourceMappingURL=digital-twin.entity.js.map