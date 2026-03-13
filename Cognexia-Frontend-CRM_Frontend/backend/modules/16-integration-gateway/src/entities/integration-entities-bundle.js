"use strict";
// Industry 5.0 ERP Backend - Integration Gateway Entities Bundle
// Database entities for integration gateway functionality
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
exports.IntegrationAnalytics = exports.ExternalDataSource = exports.IntegrationAudit = exports.SyncOperation = exports.IntegrationMetric = exports.IntegrationAlert = exports.DataTransformation = exports.IntegrationConfig = exports.ExternalSystem = exports.MessageQueue = exports.WebhookSubscription = exports.IntegrationLog = exports.DataMapping = exports.APICredential = exports.APIConnection = exports.IntegrationEndpoint = void 0;
const typeorm_1 = require("typeorm");
// ========== Integration Endpoint Entity ==========
let IntegrationEndpoint = class IntegrationEndpoint {
};
exports.IntegrationEndpoint = IntegrationEndpoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], IntegrationEndpoint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationEndpoint.prototype, "headers", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationEndpoint.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationEndpoint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationEndpoint.prototype, "updatedAt", void 0);
exports.IntegrationEndpoint = IntegrationEndpoint = __decorate([
    (0, typeorm_1.Entity)('integration_endpoints')
], IntegrationEndpoint);
// ========== API Connection Entity ==========
let APIConnection = class APIConnection {
};
exports.APIConnection = APIConnection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], APIConnection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], APIConnection.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], APIConnection.prototype, "baseUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], APIConnection.prototype, "testEndpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], APIConnection.prototype, "protocol", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'inactive' }),
    __metadata("design:type", String)
], APIConnection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], APIConnection.prototype, "lastTestResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], APIConnection.prototype, "lastTested", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], APIConnection.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], APIConnection.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], APIConnection.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], APIConnection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], APIConnection.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => APICredential, credential => credential.connection),
    __metadata("design:type", Array)
], APIConnection.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => IntegrationLog, log => log.connection),
    __metadata("design:type", Array)
], APIConnection.prototype, "logs", void 0);
exports.APIConnection = APIConnection = __decorate([
    (0, typeorm_1.Entity)('api_connections')
], APIConnection);
// ========== API Credential Entity ==========
let APICredential = class APICredential {
};
exports.APICredential = APICredential;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], APICredential.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], APICredential.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], APICredential.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], APICredential.prototype, "keyName", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], APICredential.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], APICredential.prototype, "encrypted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], APICredential.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], APICredential.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => APIConnection, connection => connection.credentials),
    (0, typeorm_1.JoinColumn)({ name: 'connectionId' }),
    __metadata("design:type", APIConnection)
], APICredential.prototype, "connection", void 0);
exports.APICredential = APICredential = __decorate([
    (0, typeorm_1.Entity)('api_credentials')
], APICredential);
// ========== Data Mapping Entity ==========
let DataMapping = class DataMapping {
};
exports.DataMapping = DataMapping;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataMapping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DataMapping.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DataMapping.prototype, "sourceFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DataMapping.prototype, "targetFormat", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], DataMapping.prototype, "mappingRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], DataMapping.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DataMapping.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DataMapping.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DataMapping.prototype, "updatedAt", void 0);
exports.DataMapping = DataMapping = __decorate([
    (0, typeorm_1.Entity)('data_mappings')
], DataMapping);
// ========== Integration Log Entity ==========
let IntegrationLog = class IntegrationLog {
};
exports.IntegrationLog = IntegrationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], IntegrationLog.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationLog.prototype, "activity", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], IntegrationLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'info' }),
    __metadata("design:type", String)
], IntegrationLog.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationLog.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => APIConnection, connection => connection.logs),
    (0, typeorm_1.JoinColumn)({ name: 'connectionId' }),
    __metadata("design:type", APIConnection)
], IntegrationLog.prototype, "connection", void 0);
exports.IntegrationLog = IntegrationLog = __decorate([
    (0, typeorm_1.Entity)('integration_logs')
], IntegrationLog);
// ========== Webhook Subscription Entity ==========
let WebhookSubscription = class WebhookSubscription {
};
exports.WebhookSubscription = WebhookSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], WebhookSubscription.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], WebhookSubscription.prototype, "headers", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], WebhookSubscription.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WebhookSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WebhookSubscription.prototype, "updatedAt", void 0);
exports.WebhookSubscription = WebhookSubscription = __decorate([
    (0, typeorm_1.Entity)('webhook_subscriptions')
], WebhookSubscription);
// ========== Message Queue Entity ==========
let MessageQueue = class MessageQueue {
};
exports.MessageQueue = MessageQueue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MessageQueue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], MessageQueue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], MessageQueue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MessageQueue.prototype, "messageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MessageQueue.prototype, "consumers", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], MessageQueue.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MessageQueue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MessageQueue.prototype, "updatedAt", void 0);
exports.MessageQueue = MessageQueue = __decorate([
    (0, typeorm_1.Entity)('message_queues')
], MessageQueue);
// ========== External System Entity ==========
let ExternalSystem = class ExternalSystem {
};
exports.ExternalSystem = ExternalSystem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExternalSystem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'registered' }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ExternalSystem.prototype, "lastConnected", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExternalSystem.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "registeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ExternalSystem.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExternalSystem.prototype, "registeredAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExternalSystem.prototype, "updatedAt", void 0);
exports.ExternalSystem = ExternalSystem = __decorate([
    (0, typeorm_1.Entity)('external_systems')
], ExternalSystem);
// ========== Integration Config Entity ==========
let IntegrationConfig = class IntegrationConfig {
};
exports.IntegrationConfig = IntegrationConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], IntegrationConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationConfig.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], IntegrationConfig.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], IntegrationConfig.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], IntegrationConfig.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationConfig.prototype, "updatedAt", void 0);
exports.IntegrationConfig = IntegrationConfig = __decorate([
    (0, typeorm_1.Entity)('integration_configs')
], IntegrationConfig);
// ========== Data Transformation Entity ==========
let DataTransformation = class DataTransformation {
};
exports.DataTransformation = DataTransformation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataTransformation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], DataTransformation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DataTransformation.prototype, "inputFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DataTransformation.prototype, "outputFormat", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], DataTransformation.prototype, "transformationRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], DataTransformation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DataTransformation.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DataTransformation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DataTransformation.prototype, "updatedAt", void 0);
exports.DataTransformation = DataTransformation = __decorate([
    (0, typeorm_1.Entity)('data_transformations')
], DataTransformation);
// ========== Integration Alert Entity ==========
let IntegrationAlert = class IntegrationAlert {
};
exports.IntegrationAlert = IntegrationAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationAlert.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], IntegrationAlert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], IntegrationAlert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationAlert.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], IntegrationAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationAlert.prototype, "triggeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], IntegrationAlert.prototype, "resolvedAt", void 0);
exports.IntegrationAlert = IntegrationAlert = __decorate([
    (0, typeorm_1.Entity)('integration_alerts')
], IntegrationAlert);
// ========== Integration Metric Entity ==========
let IntegrationMetric = class IntegrationMetric {
};
exports.IntegrationMetric = IntegrationMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], IntegrationMetric.prototype, "metricName", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], IntegrationMetric.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], IntegrationMetric.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationMetric.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationMetric.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationMetric.prototype, "createdAt", void 0);
exports.IntegrationMetric = IntegrationMetric = __decorate([
    (0, typeorm_1.Entity)('integration_metrics')
], IntegrationMetric);
// ========== Sync Operation Entity ==========
let SyncOperation = class SyncOperation {
};
exports.SyncOperation = SyncOperation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SyncOperation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], SyncOperation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], SyncOperation.prototype, "sourceSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], SyncOperation.prototype, "targetSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'pending' }),
    __metadata("design:type", String)
], SyncOperation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SyncOperation.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], SyncOperation.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], SyncOperation.prototype, "recordsProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], SyncOperation.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], SyncOperation.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SyncOperation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SyncOperation.prototype, "updatedAt", void 0);
exports.SyncOperation = SyncOperation = __decorate([
    (0, typeorm_1.Entity)('sync_operations')
], SyncOperation);
// ========== Integration Audit Entity ==========
let IntegrationAudit = class IntegrationAudit {
};
exports.IntegrationAudit = IntegrationAudit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "resourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], IntegrationAudit.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationAudit.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 45, nullable: true }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], IntegrationAudit.prototype, "userAgent", void 0);
exports.IntegrationAudit = IntegrationAudit = __decorate([
    (0, typeorm_1.Entity)('integration_audits')
], IntegrationAudit);
// ========== External Data Source Entity ==========
let ExternalDataSource = class ExternalDataSource {
};
exports.ExternalDataSource = ExternalDataSource;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "connectionString", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExternalDataSource.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'active' }),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ExternalDataSource.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], ExternalDataSource.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExternalDataSource.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExternalDataSource.prototype, "updatedAt", void 0);
exports.ExternalDataSource = ExternalDataSource = __decorate([
    (0, typeorm_1.Entity)('external_data_sources')
], ExternalDataSource);
// ========== Integration Analytics Entity ==========
let IntegrationAnalytics = class IntegrationAnalytics {
};
exports.IntegrationAnalytics = IntegrationAnalytics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IntegrationAnalytics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], IntegrationAnalytics.prototype, "metricType", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], IntegrationAnalytics.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationAnalytics.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], IntegrationAnalytics.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntegrationAnalytics.prototype, "generatedAt", void 0);
exports.IntegrationAnalytics = IntegrationAnalytics = __decorate([
    (0, typeorm_1.Entity)('integration_analytics')
], IntegrationAnalytics);
//# sourceMappingURL=integration-entities-bundle.js.map