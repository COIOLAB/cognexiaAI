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
exports.DigitalTwinSimulation = exports.ComputeType = exports.SimulationPriority = exports.SimulationStatus = exports.SimulationType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const digital_twin_entity_1 = require("./digital-twin.entity");
var SimulationType;
(function (SimulationType) {
    SimulationType["PREDICTIVE_MAINTENANCE"] = "predictive_maintenance";
    SimulationType["PROCESS_OPTIMIZATION"] = "process_optimization";
    SimulationType["WHAT_IF_ANALYSIS"] = "what_if_analysis";
    SimulationType["FAILURE_ANALYSIS"] = "failure_analysis";
    SimulationType["CAPACITY_PLANNING"] = "capacity_planning";
    SimulationType["ENERGY_OPTIMIZATION"] = "energy_optimization";
    SimulationType["QUALITY_PREDICTION"] = "quality_prediction";
    SimulationType["SUPPLY_CHAIN"] = "supply_chain";
    SimulationType["SAFETY_ANALYSIS"] = "safety_analysis";
    SimulationType["STRESS_TESTING"] = "stress_testing";
    SimulationType["PRODUCTION_SCHEDULING"] = "production_scheduling";
    SimulationType["RISK_ASSESSMENT"] = "risk_assessment";
})(SimulationType || (exports.SimulationType = SimulationType = {}));
var SimulationStatus;
(function (SimulationStatus) {
    SimulationStatus["QUEUED"] = "queued";
    SimulationStatus["RUNNING"] = "running";
    SimulationStatus["COMPLETED"] = "completed";
    SimulationStatus["FAILED"] = "failed";
    SimulationStatus["CANCELLED"] = "cancelled";
    SimulationStatus["PAUSED"] = "paused";
})(SimulationStatus || (exports.SimulationStatus = SimulationStatus = {}));
var SimulationPriority;
(function (SimulationPriority) {
    SimulationPriority["LOW"] = "low";
    SimulationPriority["MEDIUM"] = "medium";
    SimulationPriority["HIGH"] = "high";
    SimulationPriority["URGENT"] = "urgent";
})(SimulationPriority || (exports.SimulationPriority = SimulationPriority = {}));
var ComputeType;
(function (ComputeType) {
    ComputeType["CLASSICAL"] = "classical";
    ComputeType["QUANTUM"] = "quantum";
    ComputeType["HYBRID"] = "hybrid";
    ComputeType["GPU_ACCELERATED"] = "gpu_accelerated";
    ComputeType["DISTRIBUTED"] = "distributed";
    ComputeType["EDGE_COMPUTING"] = "edge_computing";
})(ComputeType || (exports.ComputeType = ComputeType = {}));
let DigitalTwinSimulation = class DigitalTwinSimulation {
    // Methods
    isCompleted() {
        return this.status === SimulationStatus.COMPLETED;
    }
    isRunning() {
        return this.status === SimulationStatus.RUNNING;
    }
    isFailed() {
        return this.status === SimulationStatus.FAILED;
    }
    getProgress() {
        return this.execution?.progress || 0;
    }
    getDuration() {
        return this.execution?.duration || 0;
    }
    getEstimatedTimeRemaining() {
        return this.execution?.estimatedTimeRemaining || 0;
    }
    hasQuantumAdvantage() {
        return this.quantumInfo?.quantumAdvantage === true;
    }
    getAccuracy() {
        return this.results?.summary.accuracyAchieved || 0;
    }
    getQualityScore() {
        return this.results?.summary.qualityScore || 0;
    }
    getCriticalAnomalies() {
        if (!this.results?.anomalies)
            return [];
        return this.results.anomalies.filter(a => a.severity === 'critical');
    }
    getHighPriorityRecommendations() {
        if (!this.results?.recommendations)
            return [];
        return this.results.recommendations.filter(r => r.priority === 'high');
    }
    getROI() {
        if (!this.results?.recommendations)
            return 0;
        return this.results.recommendations.reduce((total, rec) => total + rec.roi, 0) / this.results.recommendations.length;
    }
    getRiskLevel() {
        return this.results?.riskAssessment?.overallRisk || 'unknown';
    }
    getConvergenceStatus() {
        return this.results?.summary.convergenceStatus || 'unknown';
    }
    updateProgress(progress, phase) {
        if (!this.execution) {
            this.execution = {
                progress: 0,
                resourceUtilization: {},
                computeResources: {},
            };
        }
        this.execution.progress = Math.min(100, Math.max(0, progress));
        if (phase) {
            this.execution.currentPhase = phase;
        }
    }
    addError(severity, code, message, context) {
        if (!this.execution) {
            this.execution = {
                progress: 0,
                resourceUtilization: {},
                computeResources: {},
            };
        }
        if (!this.execution.errors) {
            this.execution.errors = [];
        }
        this.execution.errors.push({
            timestamp: new Date().toISOString(),
            severity,
            code,
            message,
            context,
        });
    }
    addRecommendation(type, description, priority, impact, effort, roi, steps) {
        if (!this.results) {
            this.results = {
                summary: {
                    objectiveValues: {},
                    keyMetrics: {},
                    convergenceStatus: 'not_converged',
                    accuracyAchieved: 0,
                    qualityScore: 0,
                },
            };
        }
        if (!this.results.recommendations) {
            this.results.recommendations = [];
        }
        this.results.recommendations.push({
            type,
            description,
            priority,
            impact,
            effort,
            roi,
            implementationSteps: steps,
        });
    }
    calculateCostEfficiency() {
        if (!this.costInfo || !this.results) {
            return { costPerResult: 0, costPerAccuracy: 0, resourceUtilizationRate: 0 };
        }
        const actualCost = this.costInfo.actualCost || this.costInfo.estimatedCost;
        const accuracy = this.results.summary.accuracyAchieved || 1;
        const resultCount = Object.keys(this.results.summary.keyMetrics).length || 1;
        return {
            costPerResult: actualCost / resultCount,
            costPerAccuracy: actualCost / accuracy,
            resourceUtilizationRate: this.execution?.resourceUtilization.cpu || 0,
        };
    }
    getExecutionSummary() {
        return {
            status: this.status,
            progress: this.getProgress(),
            duration: this.getDuration(),
            accuracy: this.getAccuracy(),
            quality: this.getQualityScore(),
            risks: this.getRiskLevel(),
            recommendations: this.results?.recommendations?.length || 0,
            anomalies: this.results?.anomalies?.length || 0,
            convergence: this.getConvergenceStatus(),
        };
    }
    isHighPriority() {
        return this.priority === SimulationPriority.HIGH || this.priority === SimulationPriority.URGENT;
    }
    requiresAttention() {
        return (this.isFailed() ||
            this.getCriticalAnomalies().length > 0 ||
            this.getRiskLevel() === 'critical' ||
            (this.isRunning() && this.execution?.errors?.some(e => e.severity === 'critical')));
    }
    getSimulationTypeCategory() {
        const categories = {
            [SimulationType.PREDICTIVE_MAINTENANCE]: 'Maintenance',
            [SimulationType.PROCESS_OPTIMIZATION]: 'Optimization',
            [SimulationType.WHAT_IF_ANALYSIS]: 'Analysis',
            [SimulationType.FAILURE_ANALYSIS]: 'Analysis',
            [SimulationType.CAPACITY_PLANNING]: 'Planning',
            [SimulationType.ENERGY_OPTIMIZATION]: 'Optimization',
            [SimulationType.QUALITY_PREDICTION]: 'Quality',
            [SimulationType.SUPPLY_CHAIN]: 'Supply Chain',
            [SimulationType.SAFETY_ANALYSIS]: 'Safety',
            [SimulationType.STRESS_TESTING]: 'Testing',
            [SimulationType.PRODUCTION_SCHEDULING]: 'Planning',
            [SimulationType.RISK_ASSESSMENT]: 'Risk',
        };
        return categories[this.simulationType] || 'Other';
    }
};
exports.DigitalTwinSimulation = DigitalTwinSimulation;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation UUID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation name' }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation description' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of simulation', enum: SimulationType }),
    (0, typeorm_1.Column)({ type: 'enum', enum: SimulationType }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "simulationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current simulation status', enum: SimulationStatus }),
    (0, typeorm_1.Column)({ type: 'enum', enum: SimulationStatus, default: SimulationStatus.QUEUED }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation priority', enum: SimulationPriority }),
    (0, typeorm_1.Column)({ type: 'enum', enum: SimulationPriority, default: SimulationPriority.MEDIUM }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Compute type used for simulation', enum: ComputeType }),
    (0, typeorm_1.Column)({ type: 'enum', enum: ComputeType, default: ComputeType.CLASSICAL }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "computeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associated digital twin ID' }),
    (0, typeorm_1.Column)({ name: 'twin_id' }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "twinId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => digital_twin_entity_1.DigitalTwin, (digitalTwin) => digitalTwin.simulations, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'twin_id' }),
    __metadata("design:type", digital_twin_entity_1.DigitalTwin)
], DigitalTwinSimulation.prototype, "digitalTwin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation parameters and configuration', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "configuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation scenario parameters', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "scenario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation execution information', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "execution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation results and analysis', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation model details', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "modelInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantum simulation details', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "quantumInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation validation metrics', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "validation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation cost and resource information', type: 'object' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "costInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Simulation tags' }),
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], DigitalTwinSimulation.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom metadata' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DigitalTwinSimulation.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Internal notes' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record creation timestamp' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DigitalTwinSimulation.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record last update timestamp' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DigitalTwinSimulation.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by user' }),
    (0, typeorm_1.Column)({ name: 'created_by', length: 255 }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated by user' }),
    (0, typeorm_1.Column)({ name: 'updated_by', length: 255 }),
    __metadata("design:type", String)
], DigitalTwinSimulation.prototype, "updatedBy", void 0);
exports.DigitalTwinSimulation = DigitalTwinSimulation = __decorate([
    (0, typeorm_1.Entity)('digital_twin_simulations'),
    (0, typeorm_1.Index)(['twinId']),
    (0, typeorm_1.Index)(['simulationType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['createdAt'])
], DigitalTwinSimulation);
//# sourceMappingURL=digital-twin-simulation.entity.js.map