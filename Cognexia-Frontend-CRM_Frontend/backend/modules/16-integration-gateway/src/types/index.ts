// Integration Gateway Type Definitions
// Core types for integration gateway functionality

export interface User {
  id: string;
  email?: string;
  role?: string;
  organizationId?: string;
  // Add additional properties commonly expected
  username?: string;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  isActive?: boolean;
}

// Configuration Types
export interface OPCUAConnectionConfig {
  serverUrl: string;
  endpoint?: string;
  securityPolicy?: string;
  securityMode?: string;
  clientCertificate?: string;
  privateKey?: string;
  timeout?: number;
  reconnectTimeout?: number;
}

export interface ModbusConnectionConfig {
  host: string;
  port: number;
  unitId?: number;
  timeout?: number;
  reconnectTimeout?: number;
  protocol?: ModbusProtocol;
}

export interface MQTTConnectionConfig {
  brokerUrl: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  keepAlive?: number;
  clean?: boolean;
  reconnectPeriod?: number;
  qos?: number;
}

// Enums
export enum ModbusProtocol {
  TCP = 'tcp',
  RTU = 'rtu',
  ASCII = 'ascii'
}

export enum SystemType {
  PLC = 'PLC',
  SENSOR = 'SENSOR',
  IOT_GATEWAY = 'IOT_GATEWAY',
  DATABASE = 'DATABASE',
  API = 'API',
  FILE_SYSTEM = 'FILE_SYSTEM'
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR'
}

export enum MigrationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum IntegrationProtocol {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  MQTT = 'MQTT',
  OPCUA = 'OPCUA',
  MODBUS = 'MODBUS',
  WEBSOCKET = 'WEBSOCKET'
}

// System Configuration
export interface IntegrationSystemConfig {
  id: string;
  name: string;
  type: SystemType;
  protocol: IntegrationProtocol;
  connectionConfig: OPCUAConnectionConfig | ModbusConnectionConfig | MQTTConnectionConfig;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export interface IntegrationConfig {
  systems: IntegrationSystemConfig[];
  globalSettings?: {
    logLevel?: string;
    enableMonitoring?: boolean;
    healthCheckInterval?: number;
  };
  dataFlowRules?: DataFlowRule[];
}

export interface DataFlowRule {
  id: string;
  source: string;
  target: string;
  transformation?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
}

// Gateway Manager (placeholder)
export interface IntegrationGatewayManager {
  initialize(config: IntegrationConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): Promise<any>;
}

// System Capabilities
export interface SystemCapabilities {
  supportsRealtimeData: boolean;
  supportsHistoricalData: boolean;
  supportsCommands: boolean;
  supportedDataTypes: string[];
  maxConnections: number;
}

export interface DataMappingRule {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  lastUpdated: Date;
}
