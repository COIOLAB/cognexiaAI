// Industry 5.0 ERP Backend - Integration Gateway Entities Bundle
// Database entities for integration gateway functionality

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// ========== Integration Endpoint Entity ==========
@Entity('integration_endpoints')
export class IntegrationEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 50 })
  method: string;

  @Column({ length: 50 })
  protocol: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column('json', { nullable: true })
  headers: Record<string, string>;

  @Column('json', { nullable: true })
  configuration: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== API Connection Entity ==========
@Entity('api_connections')
export class APIConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  baseUrl: string;

  @Column({ length: 500, nullable: true })
  testEndpoint: string;

  @Column({ length: 50 })
  protocol: string;

  @Column({ length: 50, default: 'inactive' })
  status: string;

  @Column({ length: 50, nullable: true })
  lastTestResult: string;

  @Column({ nullable: true })
  lastTested: Date;

  @Column('json', { nullable: true })
  configuration: any;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => APICredential, credential => credential.connection)
  credentials: APICredential[];

  @OneToMany(() => IntegrationLog, log => log.connection)
  logs: IntegrationLog[];
}

// ========== API Credential Entity ==========
@Entity('api_credentials')
export class APICredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  connectionId: string;

  @Column({ length: 50 })
  type: string; // 'bearer_token', 'api_key', 'basic_auth', etc.

  @Column({ length: 255, nullable: true })
  keyName: string;

  @Column('text')
  value: string;

  @Column({ default: false })
  encrypted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => APIConnection, connection => connection.credentials)
  @JoinColumn({ name: 'connectionId' })
  connection: APIConnection;
}

// ========== Data Mapping Entity ==========
@Entity('data_mappings')
export class DataMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  sourceFormat: string;

  @Column({ length: 100 })
  targetFormat: string;

  @Column('json')
  mappingRules: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Integration Log Entity ==========
@Entity('integration_logs')
export class IntegrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  connectionId: string;

  @Column({ length: 100 })
  activity: string;

  @Column('text')
  message: string;

  @Column({ length: 50, default: 'info' })
  level: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column()
  timestamp: Date;

  @ManyToOne(() => APIConnection, connection => connection.logs)
  @JoinColumn({ name: 'connectionId' })
  connection: APIConnection;
}

// ========== Webhook Subscription Entity ==========
@Entity('webhook_subscriptions')
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 100 })
  event: string;

  @Column({ default: true })
  active: boolean;

  @Column('json', { nullable: true })
  headers: Record<string, string>;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Message Queue Entity ==========
@Entity('message_queues')
export class MessageQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ default: 0 })
  messageCount: number;

  @Column({ default: 0 })
  consumers: number;

  @Column('json', { nullable: true })
  configuration: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== External System Entity ==========
@Entity('external_systems')
export class ExternalSystem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 500, nullable: true })
  endpoint: string;

  @Column({ length: 50, default: 'registered' })
  status: string;

  @Column({ nullable: true })
  lastConnected: Date;

  @Column('json', { nullable: true })
  configuration: any;

  @Column({ length: 255, nullable: true })
  registeredBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Integration Config Entity ==========
@Entity('integration_configs')
export class IntegrationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  category: string;

  @Column('json')
  configuration: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Data Transformation Entity ==========
@Entity('data_transformations')
export class DataTransformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  inputFormat: string;

  @Column({ length: 100 })
  outputFormat: string;

  @Column('json')
  transformationRules: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Integration Alert Entity ==========
@Entity('integration_alerts')
export class IntegrationAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  alertType: string;

  @Column({ length: 50 })
  severity: string;

  @Column('text')
  message: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column()
  triggeredAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;
}

// ========== Integration Metric Entity ==========
@Entity('integration_metrics')
export class IntegrationMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  metricName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ length: 50 })
  unit: string;

  @Column('json', { nullable: true })
  tags: Record<string, string>;

  @Column()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}

// ========== Sync Operation Entity ==========
@Entity('sync_operations')
export class SyncOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  sourceSystem: string;

  @Column({ length: 255 })
  targetSystem: string;

  @Column({ length: 50, default: 'pending' })
  status: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  recordsProcessed: number;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Integration Audit Entity ==========
@Entity('integration_audits')
export class IntegrationAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 255 })
  resourceId: string;

  @Column({ length: 100 })
  resourceType: string;

  @Column({ length: 255, nullable: true })
  userId: string;

  @Column('json', { nullable: true })
  changes: any;

  @Column()
  timestamp: Date;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;
}

// ========== External Data Source Entity ==========
@Entity('external_data_sources')
export class ExternalDataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  sourceType: string;

  @Column({ length: 500 })
  connectionString: string;

  @Column('json', { nullable: true })
  credentials: any;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ nullable: true })
  lastSyncAt: Date;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ========== Integration Analytics Entity ==========
@Entity('integration_analytics')
export class IntegrationAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  metricType: string;

  @Column('json')
  data: any;

  @Column()
  periodStart: Date;

  @Column()
  periodEnd: Date;

  @CreateDateColumn()
  generatedAt: Date;
}
