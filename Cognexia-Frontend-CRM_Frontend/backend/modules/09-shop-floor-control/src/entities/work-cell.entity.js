var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Robot } from './robot.entity';
import { RobotTask } from './robot-task.entity';
export var WorkCellType;
(function (WorkCellType) {
    WorkCellType["ASSEMBLY"] = "assembly";
    WorkCellType["MACHINING"] = "machining";
    WorkCellType["WELDING"] = "welding";
    WorkCellType["PAINTING"] = "painting";
    WorkCellType["PACKAGING"] = "packaging";
    WorkCellType["INSPECTION"] = "inspection";
    WorkCellType["MATERIAL_HANDLING"] = "material_handling";
    WorkCellType["COLLABORATIVE"] = "collaborative";
    WorkCellType["FLEXIBLE_MANUFACTURING"] = "flexible_manufacturing";
    WorkCellType["SMART_ASSEMBLY"] = "smart_assembly";
})(WorkCellType || (WorkCellType = {}));
export var WorkCellStatus;
(function (WorkCellStatus) {
    WorkCellStatus["OPERATIONAL"] = "operational";
    WorkCellStatus["IDLE"] = "idle";
    WorkCellStatus["MAINTENANCE"] = "maintenance";
    WorkCellStatus["ERROR"] = "error";
    WorkCellStatus["SETUP"] = "setup";
    WorkCellStatus["CHANGEOVER"] = "changeover";
    WorkCellStatus["EMERGENCY_STOP"] = "emergency_stop";
})(WorkCellStatus || (WorkCellStatus = {}));
let WorkCell = class WorkCell {
    // Hooks
    updateCounters() {
        this.assignedRobots = this.robots?.length || 0;
    }
    // Helper Methods
    isOperational() {
        return this.status === WorkCellStatus.OPERATIONAL && this.isActive;
    }
    isAvailable() {
        return this.status === WorkCellStatus.IDLE &&
            this.isActive &&
            !this.needsMaintenance &&
            !this.isEmergencyStopped;
    }
    canAcceptNewTask() {
        return this.isAvailable() && this.hasAvailableRobots();
    }
    hasAvailableRobots() {
        return this.robots && this.robots.some(robot => robot.isAvailable());
    }
    getAvailableRobots() {
        return this.robots ? this.robots.filter(robot => robot.isAvailable()) : [];
    }
    getUtilization() {
        if (!this.productionMetrics)
            return 0;
        return this.productionMetrics.robotUtilization || 0;
    }
    getOEE() {
        if (!this.productionMetrics)
            return 0;
        return this.productionMetrics.oee || 0;
    }
    getQualityRate() {
        if (!this.productionMetrics)
            return 0;
        return this.productionMetrics.qualityRate || 0;
    }
    getThroughputEfficiency() {
        if (!this.productionMetrics)
            return 0;
        return this.productionMetrics.throughputEfficiency || 0;
    }
    getBatchProgress() {
        if (!this.currentBatchSize || this.currentBatchSize === 0)
            return 0;
        return (this.currentBatchProgress / this.currentBatchSize) * 100;
    }
    addAlert(alert) {
        if (!this.currentAlerts)
            this.currentAlerts = [];
        this.currentAlerts.push(alert);
    }
    clearAlerts() {
        this.currentAlerts = [];
    }
    addIssue(issue) {
        if (!this.recentIssues)
            this.recentIssues = [];
        this.recentIssues.push(issue);
        // Keep only last 20 issues
        if (this.recentIssues.length > 20) {
            this.recentIssues = this.recentIssues.slice(-20);
        }
        this.issueCount++;
    }
    clearIssues() {
        this.recentIssues = [];
    }
    startProduction(productId, productName, batchId, batchSize) {
        this.status = WorkCellStatus.OPERATIONAL;
        this.currentProductId = productId;
        this.currentProductName = productName;
        this.currentBatchId = batchId;
        this.currentBatchSize = batchSize;
        this.currentBatchProgress = 0;
        this.lastProductionStart = new Date();
    }
    completeProduction() {
        this.status = WorkCellStatus.IDLE;
        this.totalBatchesCompleted++;
        this.totalPartsProduced += this.currentBatchSize || 0;
        this.lastProductionEnd = new Date();
        // Reset current production info
        this.currentProductId = null;
        this.currentProductName = null;
        this.currentBatchId = null;
        this.currentBatchSize = null;
        this.currentBatchProgress = 0;
    }
    pauseProduction() {
        if (this.status === WorkCellStatus.OPERATIONAL) {
            this.status = WorkCellStatus.IDLE;
        }
    }
    resumeProduction() {
        if (this.status === WorkCellStatus.IDLE && this.currentBatchId) {
            this.status = WorkCellStatus.OPERATIONAL;
        }
    }
    emergencyStop(reason) {
        this.status = WorkCellStatus.EMERGENCY_STOP;
        this.isEmergencyStopped = true;
        this.addAlert(`Emergency stop: ${reason}`);
        // Emergency stop all robots in the cell
        if (this.robots) {
            this.robots.forEach(robot => {
                robot.emergencyStop(reason);
            });
        }
    }
    reset() {
        this.status = WorkCellStatus.IDLE;
        this.isEmergencyStopped = false;
        this.clearAlerts();
        // Reset all robots in the cell
        if (this.robots) {
            this.robots.forEach(robot => {
                robot.reset();
            });
        }
    }
    updateProductionMetrics(metrics) {
        this.productionMetrics = {
            ...this.productionMetrics,
            ...metrics,
            lastUpdated: new Date()
        };
    }
    incrementBatchProgress(amount = 1) {
        this.currentBatchProgress += amount;
        // Complete batch if finished
        if (this.currentBatchSize && this.currentBatchProgress >= this.currentBatchSize) {
            this.completeProduction();
        }
    }
    getHealthScore() {
        let score = 100;
        if (this.currentAlerts && this.currentAlerts.length > 0)
            score -= 10;
        if (this.recentIssues && this.recentIssues.length > 5)
            score -= 15;
        if (this.needsMaintenance)
            score -= 20;
        if (this.issueCount > 10)
            score -= 15;
        if (this.productionMetrics?.oee && this.productionMetrics.oee < 60)
            score -= 20;
        if (this.productionMetrics?.qualityRate && this.productionMetrics.qualityRate < 95)
            score -= 10;
        if (!this.isActive)
            score -= 50;
        if (this.isEmergencyStopped)
            score -= 30;
        return Math.max(0, score);
    }
    getEfficiencyScore() {
        if (!this.productionMetrics)
            return 0;
        const availability = this.productionMetrics.availability || 0;
        const performance = this.productionMetrics.performance || 0;
        const quality = this.productionMetrics.qualityRate || 0;
        return (availability + performance + quality) / 3;
    }
    getWorkCellSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            facility: this.facility,
            productionLine: this.productionLine,
            healthScore: this.getHealthScore(),
            utilization: this.getUtilization(),
            oee: this.getOEE(),
            qualityRate: this.getQualityRate(),
            throughputEfficiency: this.getThroughputEfficiency(),
            assignedRobots: this.assignedRobots,
            isAvailable: this.isAvailable(),
            currentProduct: this.currentProductName,
            batchProgress: this.getBatchProgress(),
            totalPartsProduced: this.totalPartsProduced,
            capabilities: {
                maxRobots: this.capabilities.maxRobots,
                throughputCapacity: this.capabilities.throughputCapacity,
                automationLevel: this.capabilities.automationLevel,
                hasAI: this.hasAI,
                isCollaborative: this.isCollaborative,
                isFlexible: this.isFlexible
            }
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], WorkCell.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "name", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "displayName", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: WorkCellType
    }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: WorkCellStatus,
        default: WorkCellStatus.IDLE
    }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "status", void 0);
__decorate([
    Column({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "description", void 0);
__decorate([
    Column({ length: 100 }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "facility", void 0);
__decorate([
    Column({ length: 100 }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "department", void 0);
__decorate([
    Column({ length: 100 }),
    Index(),
    __metadata("design:type", String)
], WorkCell.prototype, "productionLine", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "floor", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "zone", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "physicalLocation", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], WorkCell.prototype, "capabilities", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], WorkCell.prototype, "layoutConfiguration", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "currentProductId", void 0);
__decorate([
    Column({ length: 255, nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "currentProductName", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "currentBatchId", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WorkCell.prototype, "currentBatchSize", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "currentBatchProgress", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkCell.prototype, "productionMetrics", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalPartsProduced", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalBatchesCompleted", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalOperatingHours", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalEnergyConsumed", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalDowntimeEvents", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "averageQualityScore", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalDefectsToday", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "totalReworkToday", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "assignedRobots", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "assignedOperators", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WorkCell.prototype, "requiredSkills", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WorkCell.prototype, "certificationRequirements", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "lastProductionStart", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "lastProductionEnd", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "lastMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "nextMaintenanceDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "lastSetupDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WorkCell.prototype, "nextCalibrationDate", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WorkCell.prototype, "currentAlerts", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WorkCell.prototype, "recentIssues", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkCell.prototype, "issueCount", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkCell.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkCell.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], WorkCell.prototype, "tags", void 0);
__decorate([
    Column({ default: true }),
    Index(),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "isActive", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "isFlexible", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "hasAI", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "hasDigitalTwin", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "isCollaborative", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "isAutonomous", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "needsMaintenance", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], WorkCell.prototype, "isEmergencyStopped", void 0);
__decorate([
    OneToMany(() => Robot, robot => robot.workCell),
    __metadata("design:type", Array)
], WorkCell.prototype, "robots", void 0);
__decorate([
    OneToMany(() => RobotTask, task => task.workCell),
    __metadata("design:type", Array)
], WorkCell.prototype, "tasks", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], WorkCell.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], WorkCell.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], WorkCell.prototype, "updatedBy", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkCell.prototype, "updateCounters", null);
WorkCell = __decorate([
    Entity('work_cells'),
    Index(['type', 'status']),
    Index(['facility', 'status']),
    Index(['productionLine'])
], WorkCell);
export { WorkCell };
//# sourceMappingURL=work-cell.entity.js.map