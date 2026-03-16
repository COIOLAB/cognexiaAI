var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { RobotTask } from './robot-task.entity';
export var StepType;
(function (StepType) {
    StepType["MOVE"] = "move";
    StepType["PICK"] = "pick";
    StepType["PLACE"] = "place";
    StepType["WELD"] = "weld";
    StepType["PAINT"] = "paint";
    StepType["INSPECT"] = "inspect";
    StepType["MACHINE"] = "machine";
    StepType["WAIT"] = "wait";
    StepType["SYNCHRONIZE"] = "synchronize";
    StepType["VALIDATE"] = "validate";
    StepType["SCAN"] = "scan";
    StepType["MEASURE"] = "measure";
    StepType["CALIBRATE"] = "calibrate";
    StepType["LEARN"] = "learn";
    StepType["ADAPT"] = "adapt";
    StepType["CUSTOM"] = "custom";
})(StepType || (StepType = {}));
export var StepStatus;
(function (StepStatus) {
    StepStatus["PENDING"] = "pending";
    StepStatus["READY"] = "ready";
    StepStatus["IN_PROGRESS"] = "in_progress";
    StepStatus["COMPLETED"] = "completed";
    StepStatus["FAILED"] = "failed";
    StepStatus["SKIPPED"] = "skipped";
    StepStatus["PAUSED"] = "paused";
    StepStatus["CANCELLED"] = "cancelled";
})(StepStatus || (StepStatus = {}));
export var InteractionType;
(function (InteractionType) {
    InteractionType["NONE"] = "none";
    InteractionType["HUMAN_SUPERVISION"] = "human_supervision";
    InteractionType["HUMAN_ASSISTANCE"] = "human_assistance";
    InteractionType["HUMAN_APPROVAL"] = "human_approval";
    InteractionType["ROBOT_COORDINATION"] = "robot_coordination";
    InteractionType["SYSTEM_INTEGRATION"] = "system_integration";
})(InteractionType || (InteractionType = {}));
let TaskStep = class TaskStep {
    // Hooks
    validateStep() {
        // Ensure step order is valid
        if (this.stepOrder < 0) {
            throw new Error('Step order must be non-negative');
        }
        // Validate timing constraints
        if (this.estimatedDuration && this.estimatedDuration <= 0) {
            throw new Error('Estimated duration must be positive');
        }
        // Validate retry limits
        if (this.maxRetries < 0) {
            throw new Error('Max retries must be non-negative');
        }
    }
    // Helper Methods
    canStart() {
        return this.status === StepStatus.READY &&
            this.areDependenciesMet() &&
            this.isApproved();
    }
    areDependenciesMet() {
        // This would need to check actual dependency status
        // Simplified implementation
        return true;
    }
    isApproved() {
        return !this.requiresApproval || !!this.approvedBy;
    }
    isCompleted() {
        return this.status === StepStatus.COMPLETED;
    }
    isFailed() {
        return this.status === StepStatus.FAILED;
    }
    canRetry() {
        return this.isFailed() && this.retryCount < this.maxRetries;
    }
    isOverdue() {
        if (!this.scheduledAt || this.isCompleted())
            return false;
        return new Date() > this.scheduledAt;
    }
    getExecutionProgress() {
        if (!this.startedAt || this.isCompleted()) {
            return this.isCompleted() ? 100 : 0;
        }
        if (!this.estimatedDuration)
            return 0;
        const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
        return Math.min(100, (elapsed / this.estimatedDuration) * 100);
    }
    getRemainingTime() {
        if (!this.startedAt || !this.estimatedDuration || this.isCompleted())
            return 0;
        const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
        return Math.max(0, this.estimatedDuration - elapsed);
    }
    start() {
        if (!this.canStart()) {
            throw new Error('Step cannot be started');
        }
        this.status = StepStatus.IN_PROGRESS;
        this.startedAt = new Date();
    }
    pause() {
        if (this.status === StepStatus.IN_PROGRESS) {
            this.status = StepStatus.PAUSED;
        }
    }
    resume() {
        if (this.status === StepStatus.PAUSED) {
            this.status = StepStatus.IN_PROGRESS;
        }
    }
    complete(result) {
        this.status = StepStatus.COMPLETED;
        this.completedAt = new Date();
        this.result = result;
        if (this.startedAt) {
            this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
        }
        // Extract quality metrics from result
        if (result.qualityScore !== undefined) {
            this.qualityScore = result.qualityScore;
        }
        if (result.energyConsumed !== undefined) {
            this.energyConsumed = result.energyConsumed;
        }
        // Calculate efficiency
        if (this.estimatedDuration && this.actualDuration) {
            this.efficiency = (this.estimatedDuration / this.actualDuration) * 100;
        }
    }
    fail(reason) {
        this.status = StepStatus.FAILED;
        this.completedAt = new Date();
        if (!this.errors)
            this.errors = [];
        this.errors.push(reason);
        if (this.startedAt) {
            this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
        }
    }
    skip(reason) {
        this.status = StepStatus.SKIPPED;
        this.completedAt = new Date();
        if (reason) {
            if (!this.warnings)
                this.warnings = [];
            this.warnings.push(`Skipped: ${reason}`);
        }
    }
    cancel(reason) {
        this.status = StepStatus.CANCELLED;
        this.completedAt = new Date();
        if (reason) {
            if (!this.warnings)
                this.warnings = [];
            this.warnings.push(`Cancelled: ${reason}`);
        }
    }
    retry() {
        if (!this.canRetry()) {
            throw new Error('Step cannot be retried');
        }
        this.retryCount++;
        this.status = StepStatus.READY;
        this.completedAt = null;
        this.startedAt = null;
        this.result = null;
        // Clear previous execution errors but keep historical data
        const errorCount = this.errors?.length || 0;
        this.clearErrors();
        if (!this.warnings)
            this.warnings = [];
        this.warnings.push(`Retry attempt ${this.retryCount} after ${errorCount} errors`);
    }
    addError(error) {
        if (!this.errors)
            this.errors = [];
        this.errors.push(error);
    }
    addWarning(warning) {
        if (!this.warnings)
            this.warnings = [];
        this.warnings.push(warning);
    }
    clearErrors() {
        this.errors = [];
    }
    clearWarnings() {
        this.warnings = [];
    }
    approve(approvedBy) {
        this.approvedBy = approvedBy;
        this.approvedAt = new Date();
        if (this.status === StepStatus.PENDING) {
            this.status = StepStatus.READY;
        }
    }
    recordLearning(learningData) {
        if (!this.learningData)
            this.learningData = {};
        this.learningData = { ...this.learningData, ...learningData };
        this.enableLearning = true;
    }
    recordAdaptation(parameter, oldValue, newValue, improvement) {
        if (!this.adaptationHistory)
            this.adaptationHistory = [];
        this.adaptationHistory.push({
            timestamp: new Date(),
            parameter,
            oldValue,
            newValue,
            improvement
        });
        this.hasBeenOptimized = true;
    }
    updateParameters(newParameters) {
        this.parameters = { ...this.parameters, ...newParameters };
    }
    validateResult() {
        if (!this.result || !this.validationCriteria)
            return true;
        const criteria = this.validationCriteria;
        const result = this.result;
        // Position validation
        if (criteria.positionTolerance && result.positionError) {
            if (result.positionError > criteria.positionTolerance)
                return false;
        }
        // Quality validation
        if (criteria.qualityThreshold && result.qualityScore) {
            if (result.qualityScore < criteria.qualityThreshold)
                return false;
        }
        // Custom validations
        if (criteria.customValidations) {
            for (const validation of criteria.customValidations) {
                const actualValue = result.measurements?.[validation.parameter];
                if (actualValue !== undefined) {
                    const diff = Math.abs(actualValue - validation.expectedValue);
                    if (diff > validation.tolerance)
                        return false;
                }
            }
        }
        return true;
    }
    getEfficiencyScore() {
        return this.efficiency || 0;
    }
    getQualityScore() {
        return this.qualityScore || 0;
    }
    getStepSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            stepOrder: this.stepOrder,
            interactionType: this.interactionType,
            isCritical: this.isCritical,
            isOptional: this.isOptional,
            isParallel: this.isParallel,
            estimatedDuration: this.estimatedDuration,
            actualDuration: this.actualDuration,
            remainingTime: this.getRemainingTime(),
            progress: this.getExecutionProgress(),
            qualityScore: this.getQualityScore(),
            efficiencyScore: this.getEfficiencyScore(),
            retryCount: this.retryCount,
            maxRetries: this.maxRetries,
            requiresApproval: this.requiresApproval,
            requiresOperatorPresence: this.requiresOperatorPresence,
            enableLearning: this.enableLearning,
            hasBeenOptimized: this.hasBeenOptimized,
            canStart: this.canStart(),
            canRetry: this.canRetry(),
            isOverdue: this.isOverdue(),
            isApproved: this.isApproved(),
            scheduledAt: this.scheduledAt,
            startedAt: this.startedAt,
            completedAt: this.completedAt
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TaskStep.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], TaskStep.prototype, "name", void 0);
__decorate([
    Column({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "description", void 0);
__decorate([
    Column({ length: 500, nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "instructions", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: StepType
    }),
    Index(),
    __metadata("design:type", String)
], TaskStep.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: StepStatus,
        default: StepStatus.PENDING
    }),
    Index(),
    __metadata("design:type", String)
], TaskStep.prototype, "status", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: InteractionType,
        default: InteractionType.NONE
    }),
    __metadata("design:type", String)
], TaskStep.prototype, "interactionType", void 0);
__decorate([
    ManyToOne(() => RobotTask, task => task.steps, { onDelete: 'CASCADE' }),
    __metadata("design:type", RobotTask)
], TaskStep.prototype, "task", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], TaskStep.prototype, "taskId", void 0);
__decorate([
    Column({ type: 'int' }),
    Index(),
    __metadata("design:type", Number)
], TaskStep.prototype, "stepOrder", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "dependsOnSteps", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "blocksSteps", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "isParallel", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "isCritical", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "isOptional", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], TaskStep.prototype, "parameters", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "result", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "validationCriteria", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "estimatedDuration", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "actualDuration", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskStep.prototype, "startedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskStep.prototype, "completedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskStep.prototype, "scheduledAt", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TaskStep.prototype, "retryCount", void 0);
__decorate([
    Column({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], TaskStep.prototype, "maxRetries", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "errors", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "warnings", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "qualityScore", void 0);
__decorate([
    Column({ type: 'decimal', precision: 6, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "positionAccuracy", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "speedAccuracy", void 0);
__decorate([
    Column({ type: 'decimal', precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "forceAccuracy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "requiredToolId", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "requiredEquipmentId", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "toolConfiguration", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "safetyRequirements", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "requiresSafetyStop", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "requiresOperatorPresence", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "requiresApproval", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "approvedBy", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskStep.prototype, "approvedAt", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "humanInteractionDuration", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "assignedOperatorId", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "humanInstructions", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "enableLearning", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "hasBeenOptimized", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "learningData", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "adaptationHistory", void 0);
__decorate([
    Column({ type: 'decimal', precision: 8, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "energyConsumed", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "efficiency", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TaskStep.prototype, "cycleTime", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TaskStep.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], TaskStep.prototype, "tags", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "isSimulated", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "requiresCalibration", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "hasDigitalTwin", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "isReversible", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], TaskStep.prototype, "canBeParallelized", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], TaskStep.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], TaskStep.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], TaskStep.prototype, "updatedBy", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskStep.prototype, "validateStep", null);
TaskStep = __decorate([
    Entity('task_steps'),
    Index(['taskId', 'stepOrder']),
    Index(['status']),
    Index(['type'])
], TaskStep);
export { TaskStep };
//# sourceMappingURL=task-step.entity.js.map