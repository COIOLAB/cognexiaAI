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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwinController = exports.UpdateTwinDataDto = exports.SimulationSearchQueryDto = exports.TwinSearchQueryDto = exports.CreateSimulationRequestDto = exports.UpdateTwinRequestDto = exports.CreateTwinRequestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const digital_twin_service_1 = require("../services/digital-twin.service");
const digital_twin_entity_1 = require("../entities/digital-twin.entity");
const digital_twin_simulation_entity_1 = require("../entities/digital-twin-simulation.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../auth/decorators/get-user.decorator");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// DTOs for request validation
class CreateTwinRequestDto {
}
exports.CreateTwinRequestDto = CreateTwinRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "twinId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.TwinType),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "twinType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.IndustryType),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "industryType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "physicalAssetId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "physicalLocation", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "configuration", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "physicalSpecs", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "currentData", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "historicalSummary", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "integrations", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "compliance", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "performance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTwinRequestDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTwinRequestDto.prototype, "customFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTwinRequestDto.prototype, "notes", void 0);
class UpdateTwinRequestDto {
}
exports.UpdateTwinRequestDto = UpdateTwinRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTwinRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTwinRequestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.TwinStatus),
    __metadata("design:type", String)
], UpdateTwinRequestDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "configuration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "currentData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "historicalSummary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "aiInsights", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "simulationConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "integrations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "performance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateTwinRequestDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinRequestDto.prototype, "customFields", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTwinRequestDto.prototype, "notes", void 0);
class CreateSimulationRequestDto {
}
exports.CreateSimulationRequestDto = CreateSimulationRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.SimulationType),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "simulationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.SimulationPriority),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.ComputeType),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "computeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "twinId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSimulationRequestDto.prototype, "configuration", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSimulationRequestDto.prototype, "scenario", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSimulationRequestDto.prototype, "modelInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSimulationRequestDto.prototype, "quantumInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSimulationRequestDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSimulationRequestDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSimulationRequestDto.prototype, "notes", void 0);
class TwinSearchQueryDto {
    constructor() {
        this.limit = 50;
        this.offset = 0;
    }
}
exports.TwinSearchQueryDto = TwinSearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.TwinType),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "twinType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.TwinStatus),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.IndustryType),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "industryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value.split(',').map((tag) => tag.trim())),
    __metadata("design:type", Array)
], TwinSearchQueryDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], TwinSearchQueryDto.prototype, "healthyOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], TwinSearchQueryDto.prototype, "requiresAttention", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], TwinSearchQueryDto.prototype, "hasQuantumCapabilities", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_entity_1.SynchronizationMode),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "syncMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TwinSearchQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TwinSearchQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TwinSearchQueryDto.prototype, "offset", void 0);
class SimulationSearchQueryDto {
    constructor() {
        this.limit = 50;
        this.offset = 0;
    }
}
exports.SimulationSearchQueryDto = SimulationSearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.SimulationType),
    __metadata("design:type", String)
], SimulationSearchQueryDto.prototype, "simulationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.SimulationStatus),
    __metadata("design:type", String)
], SimulationSearchQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.SimulationPriority),
    __metadata("design:type", String)
], SimulationSearchQueryDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(digital_twin_simulation_entity_1.ComputeType),
    __metadata("design:type", String)
], SimulationSearchQueryDto.prototype, "computeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimulationSearchQueryDto.prototype, "twinId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], SimulationSearchQueryDto.prototype, "completedOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], SimulationSearchQueryDto.prototype, "requiresAttention", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SimulationSearchQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SimulationSearchQueryDto.prototype, "offset", void 0);
class UpdateTwinDataDto {
}
exports.UpdateTwinDataDto = UpdateTwinDataDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTwinDataDto.prototype, "data", void 0);
let DigitalTwinController = class DigitalTwinController {
    constructor(digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }
    // Digital Twin Management Endpoints
    async createDigitalTwin(createDto, user) {
        const dto = {
            ...createDto,
            createdBy: user.id,
        };
        return this.digitalTwinService.createDigitalTwin(dto);
    }
    async searchDigitalTwins(query) {
        const filters = {
            twinType: query.twinType,
            status: query.status,
            industryType: query.industryType,
            tags: query.tags,
            healthyOnly: query.healthyOnly,
            requiresAttention: query.requiresAttention,
            hasQuantumCapabilities: query.hasQuantumCapabilities,
            syncMode: query.syncMode,
        };
        if (query.startDate && query.endDate) {
            filters.createdDateRange = {
                start: new Date(query.startDate),
                end: new Date(query.endDate),
            };
        }
        return this.digitalTwinService.searchDigitalTwins(filters, query.limit, query.offset);
    }
    async getDigitalTwinById(id, includeSimulations) {
        return this.digitalTwinService.findDigitalTwinById(id, includeSimulations);
    }
    async getDigitalTwinByTwinId(twinId, includeSimulations) {
        return this.digitalTwinService.findDigitalTwinByTwinId(twinId, includeSimulations);
    }
    async updateDigitalTwin(id, updateDto, user) {
        const dto = {
            ...updateDto,
            updatedBy: user.id,
        };
        return this.digitalTwinService.updateDigitalTwin(id, dto);
    }
    async deleteDigitalTwin(id) {
        return this.digitalTwinService.deleteDigitalTwin(id);
    }
    // Real-time Data Management Endpoints
    async updateTwinData(twinId, updateDataDto, user) {
        return this.digitalTwinService.updateTwinData(twinId, updateDataDto.data, user.id);
    }
    async synchronizeTwin(twinId) {
        return this.digitalTwinService.synchronizeTwinData(twinId);
    }
    // AI & Analytics Endpoints
    async getAnomalies(twinId, limit) {
        return this.digitalTwinService.getAnomalyDetection(twinId, limit);
    }
    async getOptimizationRecommendations(twinId) {
        return this.digitalTwinService.getOptimizationRecommendations(twinId);
    }
    // Simulation Management Endpoints
    async createSimulation(createDto, user) {
        const dto = {
            ...createDto,
            createdBy: user.id,
        };
        return this.digitalTwinService.createSimulation(dto);
    }
    async searchSimulations(query) {
        const filters = {
            simulationType: query.simulationType,
            status: query.status,
            priority: query.priority,
            computeType: query.computeType,
            twinId: query.twinId,
            completedOnly: query.completedOnly,
            requiresAttention: query.requiresAttention,
        };
        return this.digitalTwinService.searchSimulations(filters, query.limit, query.offset);
    }
    async runSimulation(id, user) {
        return this.digitalTwinService.runSimulation(id, user.id);
    }
    async getSimulationResults(id) {
        return this.digitalTwinService.getSimulationResults(id);
    }
    // Analytics and Dashboard Endpoints
    async getTwinAnalytics() {
        return this.digitalTwinService.getTwinAnalytics();
    }
    async getSimulationAnalytics() {
        return this.digitalTwinService.getSimulationAnalytics();
    }
    // Industry-Specific Endpoints
    async getTwinsByIndustry(industryType) {
        const filters = { industryType };
        return this.digitalTwinService.searchDigitalTwins(filters);
    }
    async getQuantumEnabledTwins() {
        const filters = { hasQuantumCapabilities: true };
        return this.digitalTwinService.searchDigitalTwins(filters);
    }
    async getHealthStatus() {
        return this.digitalTwinService.getTwinAnalytics();
    }
    async getTwinsRequiringAttention() {
        const filters = { requiresAttention: true };
        return this.digitalTwinService.searchDigitalTwins(filters);
    }
    // Real-time Monitoring Endpoints
    async getRealTimeTwins() {
        const filters = {
            syncMode: digital_twin_entity_1.SynchronizationMode.REAL_TIME,
            status: digital_twin_entity_1.TwinStatus.ACTIVE
        };
        return this.digitalTwinService.searchDigitalTwins(filters);
    }
    async getRealTimeDataStream(twinId) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        return {
            twinId: digitalTwin.twinId,
            timestamp: digitalTwin.currentData.timestamp,
            isRealTime: digitalTwin.isRealTimeSync(),
            currentData: digitalTwin.currentData,
            performance: digitalTwin.performance,
            healthScore: digitalTwin.getHealthScore(),
            efficiency: digitalTwin.getOverallEffectiveness(),
            requiresAttention: digitalTwin.requiresAttention(),
        };
    }
    // Advanced Features
    async triggerPredictiveMaintenance(twinId, user) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        const simulationDto = {
            name: `Predictive Maintenance - ${digitalTwin.name}`,
            description: 'AI-powered predictive maintenance analysis',
            simulationType: digital_twin_simulation_entity_1.SimulationType.PREDICTIVE_MAINTENANCE,
            priority: digital_twin_simulation_entity_1.SimulationPriority.HIGH,
            computeType: digital_twin_simulation_entity_1.ComputeType.CLASSICAL,
            twinId: digitalTwin.id,
            configuration: {
                timeHorizon: 168, // 1 week
                timeStep: 3600, // 1 hour
                accuracy: 'high',
                modelComplexity: 'complex',
                enableUncertainty: true,
                parallelization: true,
                realTimeData: true,
                variables: [
                    { name: 'vibration', type: 'input' },
                    { name: 'temperature', type: 'input' },
                    { name: 'failure_probability', type: 'output' },
                ],
                objectives: [
                    { name: 'minimize_failure_risk', type: 'minimize', weight: 1.0 },
                ],
                constraints: [],
            },
            scenario: {
                name: 'Predictive Maintenance Scenario',
                baseline: digitalTwin.currentData,
                variations: [],
                externalFactors: [],
                businessRules: [],
                kpis: [
                    {
                        name: 'failure_risk',
                        formula: 'failure_probability * impact_severity',
                        target: 0.1,
                        threshold: { warning: 0.3, critical: 0.5 },
                    },
                ],
            },
            modelInfo: {
                type: 'machine_learning',
                version: '1.0',
                framework: 'tensorflow',
                algorithms: ['random_forest', 'neural_network'],
                complexity: 8,
                validationStatus: 'validated',
                limitations: ['Requires historical failure data'],
                assumptions: ['Equipment degradation follows predictable patterns'],
                dataRequirements: [
                    { dataset: 'sensor_data', required: true, frequency: 'hourly', quality: 'high' },
                    { dataset: 'maintenance_history', required: true, frequency: 'daily', quality: 'medium' },
                ],
                performance: {
                    computationTime: 300,
                    memoryUsage: 2048,
                    scalability: 'high',
                    reliability: 0.95,
                },
            },
            tags: ['predictive-maintenance', 'ai-analysis', 'critical'],
            createdBy: user.id,
        };
        const simulation = await this.digitalTwinService.createSimulation(simulationDto);
        return this.digitalTwinService.runSimulation(simulation.id, user.id);
    }
    async triggerProcessOptimization(twinId, user) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        const simulationDto = {
            name: `Process Optimization - ${digitalTwin.name}`,
            description: 'AI-powered process parameter optimization',
            simulationType: digital_twin_simulation_entity_1.SimulationType.PROCESS_OPTIMIZATION,
            priority: digital_twin_simulation_entity_1.SimulationPriority.MEDIUM,
            computeType: digitalTwin.hasQuantumCapabilities() ? digital_twin_simulation_entity_1.ComputeType.QUANTUM : digital_twin_simulation_entity_1.ComputeType.CLASSICAL,
            twinId: digitalTwin.id,
            configuration: {
                timeHorizon: 24, // 1 day
                timeStep: 900, // 15 minutes
                accuracy: 'high',
                modelComplexity: 'complex',
                enableUncertainty: true,
                parallelization: true,
                realTimeData: true,
                variables: [
                    { name: 'temperature', type: 'input', range: { min: 20, max: 100 } },
                    { name: 'pressure', type: 'input', range: { min: 50, max: 200 } },
                    { name: 'efficiency', type: 'output' },
                    { name: 'quality', type: 'output' },
                ],
                objectives: [
                    { name: 'maximize_efficiency', type: 'maximize', weight: 0.6 },
                    { name: 'maximize_quality', type: 'maximize', weight: 0.4 },
                ],
                constraints: [
                    { name: 'temperature_limit', expression: 'temperature <= 90', type: 'inequality' },
                    { name: 'pressure_limit', expression: 'pressure <= 180', type: 'inequality' },
                ],
            },
            scenario: {
                name: 'Process Optimization Scenario',
                baseline: digitalTwin.currentData,
                variations: [
                    {
                        name: 'high_efficiency',
                        description: 'Parameters optimized for maximum efficiency',
                        parameters: { temperature: 75, pressure: 120 },
                    },
                    {
                        name: 'high_quality',
                        description: 'Parameters optimized for maximum quality',
                        parameters: { temperature: 65, pressure: 100 },
                    },
                ],
                externalFactors: [
                    { factor: 'ambient_temperature', impact: 'medium', variability: 0.1 },
                ],
                businessRules: [
                    { rule: 'quality_threshold', condition: 'quality >= 90', action: 'continue', priority: 1 },
                ],
                kpis: [
                    {
                        name: 'overall_performance',
                        formula: '0.6 * efficiency + 0.4 * quality',
                        target: 85,
                        threshold: { warning: 75, critical: 65 },
                    },
                ],
            },
            modelInfo: {
                type: 'optimization',
                version: '2.1',
                framework: 'scipy',
                algorithms: ['genetic_algorithm', 'particle_swarm'],
                complexity: 7,
                validationStatus: 'validated',
                limitations: ['Local optima possible'],
                assumptions: ['Process parameters are independent'],
                dataRequirements: [
                    { dataset: 'process_data', required: true, frequency: 'realtime', quality: 'high' },
                ],
                performance: {
                    computationTime: 600,
                    memoryUsage: 1024,
                    scalability: 'medium',
                    reliability: 0.92,
                },
            },
            tags: ['optimization', 'performance', 'efficiency'],
            createdBy: user.id,
        };
        if (digitalTwin.hasQuantumCapabilities()) {
            simulationDto.quantumInfo = {
                processor: 'IBM_Q_System',
                qubits: 127,
                gateCount: 10000,
                circuitDepth: 100,
                errorRate: 0.001,
                coherenceTime: 100,
                algorithms: ['QAOA', 'VQE'],
            };
        }
        const simulation = await this.digitalTwinService.createSimulation(simulationDto);
        return this.digitalTwinService.runSimulation(simulation.id, user.id);
    }
    async getComplianceStatus(twinId) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        return digitalTwin.getComplianceStatus();
    }
    async getEnergyEfficiency(twinId) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        return {
            twinId: digitalTwin.twinId,
            energyEfficiency: digitalTwin.getEnergyEfficiency(),
            currentEnergyUsage: digitalTwin.currentData.operationalData.energy,
            industrySpecificMetrics: digitalTwin.getIndustrySpecificMetrics(),
            optimizationEnabled: digitalTwin.configuration.energyOptimization,
            recommendations: digitalTwin.getOptimizationOpportunities().filter(opt => opt.area === 'energy' || opt.type === 'energy_optimization'),
        };
    }
    async getIndustrySpecificMetrics(twinId) {
        const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
        return {
            twinId: digitalTwin.twinId,
            industryType: digitalTwin.industryType,
            metrics: digitalTwin.getIndustrySpecificMetrics(),
            benchmarks: this.getIndustryBenchmarks(digitalTwin.industryType),
            performanceGrade: this.calculatePerformanceGrade(digitalTwin),
        };
    }
    // Helper methods
    getIndustryBenchmarks(industryType) {
        const benchmarks = {
            [digital_twin_entity_1.IndustryType.AUTOMOTIVE]: {
                cycleTime: 60, // seconds
                defectPPM: 100,
                oee: 85,
            },
            [digital_twin_entity_1.IndustryType.PHARMACEUTICALS]: {
                batchYield: 95,
                contaminationLevel: 0.001,
                complianceScore: 99,
            },
            [digital_twin_entity_1.IndustryType.CHEMICALS]: {
                reactionEfficiency: 90,
                safetyScore: 98,
                environmentalImpact: 'low',
            },
        };
        return benchmarks[industryType] || {};
    }
    calculatePerformanceGrade(digitalTwin) {
        const overall = digitalTwin.getOverallEffectiveness();
        if (overall >= 90)
            return 'A+';
        if (overall >= 85)
            return 'A';
        if (overall >= 80)
            return 'B+';
        if (overall >= 75)
            return 'B';
        if (overall >= 70)
            return 'C+';
        if (overall >= 65)
            return 'C';
        if (overall >= 60)
            return 'D';
        return 'F';
    }
};
exports.DigitalTwinController = DigitalTwinController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new digital twin' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Digital twin created successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTwinRequestDto, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "createDigitalTwin", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search digital twins with advanced filters' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Digital twins retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'twinType', required: false, enum: digital_twin_entity_1.TwinType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: digital_twin_entity_1.TwinStatus }),
    (0, swagger_1.ApiQuery)({ name: 'industryType', required: false, enum: digital_twin_entity_1.IndustryType }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, description: 'Comma-separated tags' }),
    (0, swagger_1.ApiQuery)({ name: 'healthyOnly', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'requiresAttention', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'hasQuantumCapabilities', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'syncMode', required: false, enum: digital_twin_entity_1.SynchronizationMode }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TwinSearchQueryDto]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "searchDigitalTwins", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get digital twin by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Digital Twin UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'includeSimulations', required: false, type: Boolean }),
    (0, swagger_1.ApiOkResponse)({ description: 'Digital twin retrieved successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('includeSimulations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getDigitalTwinById", null);
__decorate([
    (0, common_1.Get)('twin-id/:twinId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get digital twin by twin ID' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiQuery)({ name: 'includeSimulations', required: false, type: Boolean }),
    (0, swagger_1.ApiOkResponse)({ description: 'Digital twin retrieved successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __param(1, (0, common_1.Query)('includeSimulations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getDigitalTwinByTwinId", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Digital Twin UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Digital twin updated successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTwinRequestDto, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "updateDigitalTwin", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Digital Twin UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Digital twin deleted successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "deleteDigitalTwin", null);
__decorate([
    (0, common_1.Put)(':twinId/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update real-time data for digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Twin data updated successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('twinId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTwinDataDto, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "updateTwinData", null);
__decorate([
    (0, common_1.Post)(':twinId/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Synchronize digital twin with external systems' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Twin synchronized successfully', type: digital_twin_entity_1.DigitalTwin }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Twin is already synchronizing' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "synchronizeTwin", null);
__decorate([
    (0, common_1.Get)(':twinId/anomalies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get anomaly detection results for digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of anomalies to return' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Anomalies retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getAnomalies", null);
__decorate([
    (0, common_1.Get)(':twinId/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered optimization recommendations' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Recommendations retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getOptimizationRecommendations", null);
__decorate([
    (0, common_1.Post)('simulations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new simulation' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Simulation created successfully', type: digital_twin_simulation_entity_1.DigitalTwinSimulation }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSimulationRequestDto, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "createSimulation", null);
__decorate([
    (0, common_1.Get)('simulations'),
    (0, swagger_1.ApiOperation)({ summary: 'Search simulations with filters' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Simulations retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'simulationType', required: false, enum: digital_twin_simulation_entity_1.SimulationType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: digital_twin_simulation_entity_1.SimulationStatus }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: digital_twin_simulation_entity_1.SimulationPriority }),
    (0, swagger_1.ApiQuery)({ name: 'computeType', required: false, enum: digital_twin_simulation_entity_1.ComputeType }),
    (0, swagger_1.ApiQuery)({ name: 'twinId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'completedOnly', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'requiresAttention', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SimulationSearchQueryDto]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "searchSimulations", null);
__decorate([
    (0, common_1.Post)('simulations/:id/run'),
    (0, swagger_1.ApiOperation)({ summary: 'Run a simulation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Simulation UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Simulation started successfully', type: digital_twin_simulation_entity_1.DigitalTwinSimulation }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Simulation not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Simulation is already running' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "runSimulation", null);
__decorate([
    (0, common_1.Get)('simulations/:id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get simulation results' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Simulation UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Simulation results retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Simulation not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Simulation has not completed yet' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getSimulationResults", null);
__decorate([
    (0, common_1.Get)('analytics/twins'),
    (0, swagger_1.ApiOperation)({ summary: 'Get digital twin analytics and metrics' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Twin analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getTwinAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/simulations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get simulation analytics and metrics' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Simulation analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getSimulationAnalytics", null);
__decorate([
    (0, common_1.Get)('industry/:industryType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get digital twins by industry type' }),
    (0, swagger_1.ApiParam)({ name: 'industryType', enum: digital_twin_entity_1.IndustryType, description: 'Industry type' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Industry-specific twins retrieved successfully' }),
    __param(0, (0, common_1.Param)('industryType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getTwinsByIndustry", null);
__decorate([
    (0, common_1.Get)('quantum/enabled'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quantum-enabled digital twins' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Quantum-enabled twins retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getQuantumEnabledTwins", null);
__decorate([
    (0, common_1.Get)('health/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall health status of all digital twins' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Health status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('attention/required'),
    (0, swagger_1.ApiOperation)({ summary: 'Get digital twins that require attention' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Twins requiring attention retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getTwinsRequiringAttention", null);
__decorate([
    (0, common_1.Get)('realtime/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time synchronized digital twins' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Real-time twins retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getRealTimeTwins", null);
__decorate([
    (0, common_1.Get)('realtime/:twinId/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time data stream for a digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Real-time data stream retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getRealTimeDataStream", null);
__decorate([
    (0, common_1.Post)(':twinId/maintenance/predict'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger predictive maintenance analysis' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Predictive maintenance analysis started' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "triggerPredictiveMaintenance", null);
__decorate([
    (0, common_1.Post)(':twinId/optimize'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger process optimization simulation' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Process optimization simulation started' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "triggerProcessOptimization", null);
__decorate([
    (0, common_1.Get)(':twinId/compliance/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance status for digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Compliance status retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getComplianceStatus", null);
__decorate([
    (0, common_1.Get)(':twinId/energy/efficiency'),
    (0, swagger_1.ApiOperation)({ summary: 'Get energy efficiency metrics for digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Energy efficiency metrics retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getEnergyEfficiency", null);
__decorate([
    (0, common_1.Get)(':twinId/industry-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get industry-specific metrics for digital twin' }),
    (0, swagger_1.ApiParam)({ name: 'twinId', description: 'Digital Twin identifier' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Industry-specific metrics retrieved successfully' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Digital twin not found' }),
    __param(0, (0, common_1.Param)('twinId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalTwinController.prototype, "getIndustrySpecificMetrics", null);
exports.DigitalTwinController = DigitalTwinController = __decorate([
    (0, swagger_1.ApiTags)('Digital Twin & Simulation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('digital-twin'),
    __metadata("design:paramtypes", [digital_twin_service_1.DigitalTwinService])
], DigitalTwinController);
//# sourceMappingURL=digital-twin.controller.js.map