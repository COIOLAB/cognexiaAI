// Core Integration Gateway Services
export { IntegrationGatewayService } from './services/IntegrationGatewayService';
export { IntegrationGatewayManager } from './services/IntegrationGatewayManager';

// Protocol Adapters
export { OPCUAProtocolAdapter } from './protocols/OPCUAProtocolAdapter';
export { ModbusProtocolAdapter } from './protocols/ModbusProtocolAdapter';
export { MQTTProtocolAdapter } from './protocols/MQTTProtocolAdapter';

// Controllers
export * from './controllers';

// Routes
export * from './routes';

// Types and Interfaces from IntegrationGatewayService
export type {
  IntegrationSystem,
  SystemCapabilities,
  SystemStatus,
  ConnectionConfig,
  AuthenticationConfig,
  RetryPolicy,
  DataMapping,
  DataMappingRule,
  TransformationRule,
  ValidationRule,
  EnrichmentRule,
  FilterRule,
  MigrationStrategy,
  MigrationPhase,
  SystemMetadata,
  PerformanceMetrics
} from './services/IntegrationGatewayService';

export {
  SystemType,
  ConnectionStatus,
  AuthenticationType,
  DataFormat,
  TransformationType,
  ValidationType,
  MigrationStatus,
  IntegrationProtocol
} from './services/IntegrationGatewayService';

// Types from IntegrationGatewayManager
export type {
  IntegrationConfig,
  IntegrationSystemConfig,
  SystemMetrics,
  IntegrationEvent,
  DataFlowRule,
  DataFlowCondition
} from './services/IntegrationGatewayManager';

export {
  IntegrationStatus
} from './services/IntegrationGatewayManager';

// OPC UA Types and Interfaces
export type {
  OPCUAConnectionConfig,
  OPCUANodeReference,
  OPCUASubscriptionConfig,
  OPCUAMonitoredItem,
  OPCUADataChangeFilter,
  OPCUADataValue,
  OPCUAMethodCallRequest,
  OPCUAMethodCallResult,
  OPCUAWriteRequest,
  OPCUAWriteResult,
  OPCUAHistoryReadRequest,
  OPCUAHistoryReadResult
} from './protocols/OPCUAProtocolAdapter';

export {
  OPCUASecurityPolicy,
  OPCUASecurityMode,
  OPCUANodeClass,
  OPCUADataChangeTrigger,
  OPCUADeadbandType,
  OPCUATimestampsToReturn
} from './protocols/OPCUAProtocolAdapter';

// Modbus Types and Interfaces
export type {
  ModbusConnectionConfig,
  ModbusRegister,
  ModbusReadRequest,
  ModbusReadResult,
  ModbusWriteRequest,
  ModbusWriteResult,
  ModbusPollingGroup,
  ModbusFunction
} from './protocols/ModbusProtocolAdapter';

export {
  ModbusProtocol,
  ModbusParity,
  ModbusRegisterType,
  ModbusDataType,
  ModbusByteOrder,
  ModbusWordOrder,
  ModbusQuality,
  MODBUS_FUNCTIONS
} from './protocols/ModbusProtocolAdapter';

// MQTT Types and Interfaces
export type {
  MQTTConnectionConfig,
  MQTTWillMessage,
  MQTTSubscription,
  MQTTPacket,
  MQTTPublishOptions,
  MQTTMessage,
  MQTTTopicPattern,
  MQTTDataMapping,
  MQTTStatistics
} from './protocols/MQTTProtocolAdapter';

export {
  MQTTQoS,
  MQTTConnectionState
} from './protocols/MQTTProtocolAdapter';

// Utility functions for creating configurations
export const IntegrationGatewayUtils = {
  /**
   * Creates a basic OPC UA configuration
   */
  createOPCUAConfig: (serverUrl: string, options: Partial<OPCUAConnectionConfig> = {}): OPCUAConnectionConfig => ({
    id: `opcua-${Date.now()}`,
    serverUrl,
    securityPolicy: options.securityPolicy || 'None' as any,
    securityMode: options.securityMode || 'None' as any,
    authentication: {
      type: 'none' as any,
      credentials: {}
    },
    retryPolicy: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    },
    ...options
  }),

  /**
   * Creates a basic Modbus configuration
   */
  createModbusConfig: (host: string, port: number, options: Partial<ModbusConnectionConfig> = {}): ModbusConnectionConfig => ({
    id: `modbus-${Date.now()}`,
    host,
    port,
    unitId: options.unitId || 1,
    protocol: options.protocol || 'TCP' as any,
    authentication: {
      type: 'none' as any,
      credentials: {}
    },
    retryPolicy: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    },
    ...options
  }),

  /**
   * Creates a basic MQTT configuration
   */
  createMQTTConfig: (brokerUrl: string, port: number, clientId: string, options: Partial<MQTTConnectionConfig> = {}): MQTTConnectionConfig => ({
    id: `mqtt-${Date.now()}`,
    brokerUrl,
    port,
    clientId,
    authentication: {
      type: 'none' as any,
      credentials: {}
    },
    retryPolicy: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    },
    ...options
  }),

  /**
   * Creates a basic integration system configuration
   */
  createSystemConfig: (
    id: string,
    name: string,
    type: SystemType,
    protocol: 'OPC-UA' | 'MODBUS' | 'MQTT',
    protocolConfig: any,
    options: Partial<IntegrationSystemConfig> = {}
  ): IntegrationSystemConfig => ({
    id,
    name,
    type,
    protocol,
    config: protocolConfig,
    enabled: options.enabled ?? true,
    priority: options.priority ?? 1,
    healthCheckInterval: options.healthCheckInterval ?? 60000,
    autoReconnect: options.autoReconnect ?? true,
    tags: options.tags || [],
    metadata: options.metadata || {}
  }),

  /**
   * Creates a basic data flow rule
   */
  createDataFlowRule: (
    id: string,
    name: string,
    sourceSystemId: string,
    targetSystemId: string,
    options: Partial<DataFlowRule> = {}
  ): DataFlowRule => ({
    id,
    name,
    sourceSystemId,
    targetSystemId,
    dataMapping: options.dataMapping || {
      sourceField: '*',
      targetField: '*',
      transformation: {
        type: 'direct' as any,
        config: {}
      }
    },
    enabled: options.enabled ?? true,
    priority: options.priority ?? 1,
    conditions: options.conditions || [],
    transformations: options.transformations || [],
    throttling: options.throttling,
    retry: options.retry || {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxDelay: 30000
    }
  })
};

// Integration Gateway Factory
export class IntegrationGatewayFactory {
  /**
   * Creates a fully configured Integration Gateway Manager
   */
  static async createGateway(config: IntegrationConfig): Promise<IntegrationGatewayManager> {
    const manager = new IntegrationGatewayManager();
    await manager.initialize(config);
    return manager;
  }

  /**
   * Creates a basic integration configuration template
   */
  static createBasicConfig(systems: IntegrationSystemConfig[]): IntegrationConfig {
    return {
      systems,
      globalSettings: {
        dataRetentionDays: 30,
        maxConcurrentConnections: 100,
        defaultTimeout: 30000,
        enableMetrics: true,
        enableTracing: true,
        logLevel: 'info'
      },
      dataMappings: [],
      transformationRules: [],
      securitySettings: {
        enableEncryption: true,
        trustedCertificates: [],
        allowedIPRanges: ['*']
      }
    };
  }

  /**
   * Creates a demo configuration for testing
   */
  static createDemoConfig(): IntegrationConfig {
    const opcuaSystem = IntegrationGatewayUtils.createSystemConfig(
      'demo-opcua',
      'Demo OPC UA Server',
      SystemType.PLC,
      'OPC-UA',
      IntegrationGatewayUtils.createOPCUAConfig('opc.tcp://localhost:4840')
    );

    const modbusSystem = IntegrationGatewayUtils.createSystemConfig(
      'demo-modbus',
      'Demo Modbus Device',
      SystemType.SENSOR,
      'MODBUS',
      IntegrationGatewayUtils.createModbusConfig('localhost', 502)
    );

    const mqttSystem = IntegrationGatewayUtils.createSystemConfig(
      'demo-mqtt',
      'Demo MQTT Broker',
      SystemType.IOT_GATEWAY,
      'MQTT',
      IntegrationGatewayUtils.createMQTTConfig('localhost', 1883, 'industry50-demo')
    );

    return this.createBasicConfig([opcuaSystem, modbusSystem, mqttSystem]);
  }
}

// Version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Default export
export default {
  IntegrationGatewayManager,
  IntegrationGatewayService,
  OPCUAProtocolAdapter,
  ModbusProtocolAdapter,
  MQTTProtocolAdapter,
  IntegrationGatewayUtils,
  IntegrationGatewayFactory,
  VERSION,
  BUILD_DATE
};
