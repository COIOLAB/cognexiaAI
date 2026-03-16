var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Robot } from './robot.entity';
import { WorkCell } from './work-cell.entity';
import { TaskStep } from './task-step.entity';
export var TaskType;
(function (TaskType) {
    TaskType["PICK_AND_PLACE"] = "pick_and_place";
    TaskType["ASSEMBLY"] = "assembly";
    TaskType["WELDING"] = "welding";
    TaskType["PAINTING"] = "painting";
    TaskType["INSPECTION"] = "inspection";
    TaskType["MACHINING"] = "machining";
    TaskType["PACKAGING"] = "packaging";
    TaskType["MATERIAL_HANDLING"] = "material_handling";
    TaskType["QUALITY_CHECK"] = "quality_check";
    TaskType["CALIBRATION"] = "calibration";
    TaskType["MAINTENANCE"] = "maintenance";
    TaskType["LEARNING"] = "learning";
    TaskType["COLLABORATIVE"] = "collaborative";
    TaskType["CUSTOM"] = "custom";
})(TaskType || (TaskType = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["NORMAL"] = "normal";
    TaskPriority["HIGH"] = "high";
    TaskPriority["CRITICAL"] = "critical";
    TaskPriority["EMERGENCY"] = "emergency";
})(TaskPriority || (TaskPriority = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["QUEUED"] = "queued";
    TaskStatus["ASSIGNED"] = "assigned";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["PAUSED"] = "paused";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["TIMEOUT"] = "timeout";
})(TaskStatus || (TaskStatus = {}));
export var TaskComplexity;
(function (TaskComplexity) {
    TaskComplexity["SIMPLE"] = "simple";
    TaskComplexity["MODERATE"] = "moderate";
    TaskComplexity["COMPLEX"] = "complex";
    TaskComplexity["ADVANCED"] = "advanced";
})(TaskComplexity || (TaskComplexity = {}));
let RobotTask = class RobotTask {
    // Hooks
    updateProgress() {
        if (this.steps && this.steps.length > 0) {
            this.totalSteps = this.steps.length;
            this.stepsCompleted = this.steps.filter(step => step.status === 'completed').length;
            this.progressPercentage = (this.stepsCompleted / this.totalSteps) * 100;
        }
    }
    // Helper Methods
    canStart() {
        return this.status === TaskStatus.ASSIGNED &&
            !this.hasUnresolvedDependencies() &&
            this.robot?.isAvailable();
    }
    hasUnresolvedDependencies() {
        // This would need to check the actual dependency status
        // Simplified implementation
        return false;
    }
    isCompleted() {
        return this.status === TaskStatus.COMPLETED;
    }
    isFailed() {
        return this.status === TaskStatus.FAILED;
    }
    canRetry() {
        return this.isFailed() && this.retryCount < this.maxRetries;
    }
    isOverdue() {
        if (!this.scheduledAt || this.isCompleted())
            return false;
        return new Date() > this.scheduledAt;
    }
    getEstimatedCompletion() {
        if (!this.startedAt || !this.estimatedDuration)
            return null;
        return new Date(this.startedAt.getTime() + this.estimatedDuration * 1000);
    }
    getRemainingTime() {
        if (!this.startedAt || !this.estimatedDuration || this.isCompleted())
            return 0;
        const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
        return Math.max(0, this.estimatedDuration - elapsed);
    }
    start() {
        if (!this.canStart()) {
            throw new Error('Task cannot be started');
        }
        this.status = TaskStatus.IN_PROGRESS;
        this.startedAt = new Date();
        this.currentStepIndex = 0;
        if (this.robot) {
            this.robot.startTask(this.id);
        }
    }
    pause() {
        if (this.status === TaskStatus.IN_PROGRESS) {
            this.status = TaskStatus.PAUSED;
        }
    }
    resume() {
        if (this.status === TaskStatus.PAUSED) {
            this.status = TaskStatus.IN_PROGRESS;
        }
    }
    complete(result) {
        this.status = TaskStatus.COMPLETED;
        this.completedAt = new Date();
        this.result = result;
        this.progressPercentage = 100;
        if (this.startedAt) {
            this.actualDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
        }
        if (this.robot) {
            this.robot.completeTask();
        }
    }
    fail(reason) {
        this.status = TaskStatus.FAILED;
        this.completedAt = new Date();
        if (!this.errors)
            this.errors = [];
        this.errors.push(reason);
        if (this.robot) {
            this.robot.failTask(reason);
        }
    }
    cancel(reason) {
        this.status = TaskStatus.CANCELLED;
        this.completedAt = new Date();
        if (reason) {
            if (!this.warnings)
                this.warnings = [];
            this.warnings.push(`Cancelled: ${reason}`);
        }
    }
    retry() {
        if (!this.canRetry()) {
            throw new Error('Task cannot be retried');
        }
        this.retryCount++;
        this.status = TaskStatus.ASSIGNED;
        this.completedAt = null;
        this.startedAt = null;
        this.currentStepIndex = 0;
        this.progressPercentage = 0;
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
    updateAIAnalysis(analysis) {
        this.aiAnalysis = {
            ...this.aiAnalysis,
            ...analysis
        };
    }
    recordLearning(learningData) {
        if (!this.learningData)
            this.learningData = {};
        this.learningData = { ...this.learningData, ...learningData };
        this.enableLearning = true;
    }
    recordOptimization(parameter, oldValue, newValue, improvement) {
        if (!this.optimizationHistory)
            this.optimizationHistory = [];
        this.optimizationHistory.push({
            timestamp: new Date(),
            parameter,
            oldValue,
            newValue,
            improvement
        });
        this.isOptimized = true;
    }
    getEfficiencyScore() {
        if (!this.estimatedDuration || !this.actualDuration)
            return 0;
        return Math.max(0, (this.estimatedDuration / this.actualDuration) * 100);
    }
    getQualityScore() {
        return this.qualityScore || 0;
    }
    getPriorityScore() {
        const priorityScores = {
            [TaskPriority.LOW]: 1,
            [TaskPriority.NORMAL]: 2,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.CRITICAL]: 4,
            [TaskPriority.EMERGENCY]: 5
        };
        let score = priorityScores[this.priority];
        if (this.isUrgent)
            score += 2;
        if (this.isOverdue())
            score += 1;
        return score;
    }
    getTaskSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            priority: this.priority,
            complexity: this.complexity,
            robotId: this.robotId,
            workCellId: this.workCellId,
            progressPercentage: this.progressPercentage,
            stepsCompleted: this.stepsCompleted,
            totalSteps: this.totalSteps,
            estimatedDuration: this.estimatedDuration,
            actualDuration: this.actualDuration,
            remainingTime: this.getRemainingTime(),
            qualityScore: this.getQualityScore(),
            efficiencyScore: this.getEfficiencyScore(),
            priorityScore: this.getPriorityScore(),
            scheduledAt: this.scheduledAt,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            requiresHumanCollaboration: this.requiresHumanCollaboration,
            requiresMultipleRobots: this.requiresMultipleRobots,
            isUrgent: this.isUrgent,
            canStart: this.canStart(),
            canRetry: this.canRetry(),
            isOverdue: this.isOverdue()
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], RobotTask.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "name", void 0);
__decorate([
    Column({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "description", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: TaskType
    }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.NORMAL
    }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "priority", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING
    }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "status", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: TaskComplexity,
        default: TaskComplexity.SIMPLE
    }),
    __metadata("design:type", String)
], RobotTask.prototype, "complexity", void 0);
__decorate([
    ManyToOne(() => Robot, robot => robot.tasks, { nullable: true }),
    __metadata("design:type", Robot)
], RobotTask.prototype, "robot", void 0);
__decorate([
    Column({ nullable: true }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "robotId", void 0);
__decorate([
    ManyToOne(() => WorkCell, workCell => workCell.tasks, { nullable: true }),
    __metadata("design:type", WorkCell)
], RobotTask.prototype, "workCell", void 0);
__decorate([
    Column({ nullable: true }),
    Index(),
    __metadata("design:type", String)
], RobotTask.prototype, "workCellId", void 0);
__decorate([
    OneToMany(() => TaskStep, step => step.task, { cascade: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "steps", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], RobotTask.prototype, "requirements", void 0);
__decorate([
    Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], RobotTask.prototype, "parameters", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RobotTask.prototype, "result", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RobotTask.prototype, "aiAnalysis", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RobotTask.prototype, "scheduledAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RobotTask.prototype, "startedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RobotTask.prototype, "completedAt", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "estimatedDuration", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "actualDuration", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "remainingTime", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "currentStepIndex", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "progressPercentage", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "stepsCompleted", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "totalSteps", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "retryCount", void 0);
__decorate([
    Column({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], RobotTask.prototype, "maxRetries", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "errors", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "warnings", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "qualityScore", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "energyConsumed", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "cycleTime", void 0);
__decorate([
    Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "accuracy", void 0);
__decorate([
    Column({ type: 'decimal', precision: 6, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "precision", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "productId", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "batchId", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "orderId", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "customerId", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RobotTask.prototype, "quantity", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "partNumber", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "dependsOnTasks", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "blockedTasks", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "parentTaskId", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "subtaskIds", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "assignedOperatorId", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "collaboratingRobotIds", void 0);
__decorate([
    Column({ default: false }),
    Index(),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "requiresHumanCollaboration", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "requiresMultipleRobots", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "enableLearning", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "isOptimized", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RobotTask.prototype, "learningData", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "optimizationHistory", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RobotTask.prototype, "configuration", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RobotTask.prototype, "metadata", void 0);
__decorate([
    Column({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], RobotTask.prototype, "tags", void 0);
__decorate([
    Column({ default: false }),
    Index(),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "isUrgent", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "isRepeatable", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "isTemplate", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "requiresApproval", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "isSimulated", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], RobotTask.prototype, "hasDigitalTwin", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], RobotTask.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], RobotTask.prototype, "updatedAt", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "createdBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "updatedBy", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], RobotTask.prototype, "approvedBy", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RobotTask.prototype, "approvedAt", void 0);
__decorate([
    BeforeInsert(),
    BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RobotTask.prototype, "updateProgress", null);
RobotTask = __decorate([
    Entity('robot_tasks'),
    Index(['status', 'priority']),
    Index(['robotId', 'status']),
    Index(['workCellId', 'status']),
    Index(['type', 'status']),
    Index(['createdAt'])
], RobotTask);
export { RobotTask };
//# sourceMappingURL=robot-task.entity.js.map