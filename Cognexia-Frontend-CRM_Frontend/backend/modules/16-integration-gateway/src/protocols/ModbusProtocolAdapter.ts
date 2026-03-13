import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';
import { ConnectionConfig, DataFormat } from '../services/IntegrationGatewayService';

export interface ModbusConnectionConfig extends ConnectionConfig {
  host: string;
  port: number;
  unitId: number;
  protocol: ModbusProtocol;
  serialPort?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: ModbusParity;
  connectionTimeout?: number;
  responseTimeout?: number;
  retryCount?: number;
  maxConnections?: number;
  pollInterval?: number;
  autoReconnect?: boolean;
}

export enum ModbusProtocol {
  TCP = 'TCP',
  RTU = 'RTU',
  ASCII = 'ASCII'
}

export enum ModbusParity {
  NONE = 'none',
  ODD = 'odd',
  EVEN = 'even',
  MARK = 'mark',
  SPACE = 'space'
}

export enum ModbusRegisterType {
  COIL = 'coil',
  DISCRETE_INPUT = 'discrete_input',
  INPUT_REGISTER = 'input_register',
  HOLDING_REGISTER = 'holding_register'
}

export enum ModbusDataType {
  BOOLEAN = 'boolean',
  UINT16 = 'uint16',
  INT16 = 'int16',
  UINT32 = 'uint32',
  INT32 = 'int32',
  FLOAT32 = 'float32',
  DOUBLE64 = 'double64',
  STRING = 'string',
  BCD = 'bcd'
}

export interface ModbusRegister {
  name: string;
  address: number;
  type: ModbusRegisterType;
  dataType: ModbusDataType;
  length?: number; // For strings or arrays
  scale?: number;
  offset?: number;
  unit?: string;
  description?: string;
  writeable?: boolean;
  pollingEnabled?: boolean;
  pollingInterval?: number;
  byteOrder?: ModbusByteOrder;
  wordOrder?: ModbusWordOrder;
}

export enum ModbusByteOrder {
  BIG_ENDIAN = 'big_endian',
  LITTLE_ENDIAN = 'little_endian'
}

export enum ModbusWordOrder {
  HIGH_WORD_FIRST = 'high_word_first',
  LOW_WORD_FIRST = 'low_word_first'
}

export interface ModbusReadRequest {
  unitId?: number;
  registers: ModbusRegister[];
  maxRegistersPerRead?: number;
}

export interface ModbusReadResult {
  register: ModbusRegister;
  value: any;
  rawValue: number[];
  timestamp: Date;
  quality: ModbusQuality;
  error?: string;
}

export interface ModbusWriteRequest {
  unitId?: number;
  register: ModbusRegister;
  value: any;
}

export interface ModbusWriteResult {
  register: ModbusRegister;
  success: boolean;
  timestamp: Date;
  error?: string;
}

export enum ModbusQuality {
  GOOD = 'good',
  BAD = 'bad',
  UNCERTAIN = 'uncertain',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

export interface ModbusPollingGroup {
  name: string;
  interval: number;
  registers: ModbusRegister[];
  enabled: boolean;
  unitId?: number;
  maxRegistersPerRead?: number;
  onData?: (results: ModbusReadResult[]) => void;
  onError?: (error: any) => void;
}

export interface ModbusFunction {
  code: number;
  name: string;
  description: string;
  supportsMultiple: boolean;
}

export const MODBUS_FUNCTIONS: { [key: string]: ModbusFunction } = {
  READ_COILS: { code: 1, name: 'Read Coils', description: 'Read Coil Status', supportsMultiple: true },
  READ_DISCRETE_INPUTS: { code: 2, name: 'Read Discrete Inputs', description: 'Read Input Status', supportsMultiple: true },
  READ_HOLDING_REGISTERS: { code: 3, name: 'Read Holding Registers', description: 'Read Holding Registers', supportsMultiple: true },
  READ_INPUT_REGISTERS: { code: 4, name: 'Read Input Registers', description: 'Read Input Registers', supportsMultiple: true },
  WRITE_SINGLE_COIL: { code: 5, name: 'Write Single Coil', description: 'Force Single Coil', supportsMultiple: false },
  WRITE_SINGLE_REGISTER: { code: 6, name: 'Write Single Register', description: 'Preset Single Register', supportsMultiple: false },
  WRITE_MULTIPLE_COILS: { code: 15, name: 'Write Multiple Coils', description: 'Force Multiple Coils', supportsMultiple: true },
  WRITE_MULTIPLE_REGISTERS: { code: 16, name: 'Write Multiple Registers', description: 'Preset Multiple Registers', supportsMultiple: true }
};

export class ModbusProtocolAdapter extends EventEmitter {
  private config: ModbusConnectionConfig;
  private client: any; // Modbus client instance
  private registers: Map<string, ModbusRegister> = new Map();
  private pollingGroups: Map<string, ModbusPollingGroup> = new Map();
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private reconnectTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private statistics = {
    totalReads: 0,
    totalWrites: 0,
    successfulReads: 0,
    successfulWrites: 0,
    errors: 0,
    lastActivity: null as Date | null
  };

  constructor(config: ModbusConnectionConfig) {
    super();
    this.config = config;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('connection_lost', () => {
      logger.warn('Modbus connection lost, attempting to reconnect...');
      this.stopPolling();
      if (this.config.autoReconnect !== false) {
        this.scheduleReconnect();
      }
    });

    this.on('error', (error: any) => {
      logger.error('Modbus adapter error:', error);
      this.statistics.errors++;
    });

    this.on('data_received', (data: ModbusReadResult[]) => {
      this.statistics.lastActivity = new Date();
      this.statistics.successfulReads++;
    });

    this.on('data_written', (result: ModbusWriteResult) => {
      this.statistics.lastActivity = new Date();
      if (result.success) {
        this.statistics.successfulWrites++;
      }
    });
  }

  public async connect(): Promise<void> {
    try {
      logger.info(`Connecting to Modbus ${this.config.protocol} server: ${this.config.host}:${this.config.port}`);
      this.connectionState = 'connecting';

      // Initialize Modbus client
      this.client = await this.createModbusClient();
      
      // Establish connection
      await this.client.connect();
      
      this.connectionState = 'connected';
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Start polling if configured
      this.startPolling();
      
      logger.info('Successfully connected to Modbus server');
      this.emit('connected');

    } catch (error) {
      this.connectionState = 'error';
      logger.error('Failed to connect to Modbus server:', error);
      this.emit('connection_error', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from Modbus server...');
      
      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }

      // Stop reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      // Stop all polling
      this.stopPolling();

      // Disconnect client
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
      }

      this.connectionState = 'disconnected';
      logger.info('Disconnected from Modbus server');
      this.emit('disconnected');

    } catch (error) {
      logger.error('Error disconnecting from Modbus server:', error);
      throw error;
    }
  }

  public addRegister(register: ModbusRegister): void {
    this.registers.set(register.name, register);
    logger.info(`Added Modbus register: ${register.name} at address ${register.address}`);
  }

  public removeRegister(name: string): void {
    this.registers.delete(name);
    logger.info(`Removed Modbus register: ${name}`);
  }

  public getRegister(name: string): ModbusRegister | undefined {
    return this.registers.get(name);
  }

  public getAllRegisters(): ModbusRegister[] {
    return Array.from(this.registers.values());
  }

  public async readRegisters(request: ModbusReadRequest): Promise<ModbusReadResult[]> {
    try {
      if (!this.client || this.connectionState !== 'connected') {
        throw new Error('Modbus client not connected');
      }

      this.statistics.totalReads++;
      
      const results: ModbusReadResult[] = [];
      const unitId = request.unitId || this.config.unitId;
      
      // Group registers by type for efficient reading
      const registerGroups = this.groupRegistersByType(request.registers);
      
      for (const [type, registers] of registerGroups) {
        const groupResults = await this.readRegisterGroup(unitId, type, registers, request.maxRegistersPerRead);
        results.push(...groupResults);
      }

      this.emit('data_received', results);
      return results;

    } catch (error) {
      logger.error('Error reading Modbus registers:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async writeRegister(request: ModbusWriteRequest): Promise<ModbusWriteResult> {
    try {
      if (!this.client || this.connectionState !== 'connected') {
        throw new Error('Modbus client not connected');
      }

      this.statistics.totalWrites++;
      
      const unitId = request.unitId || this.config.unitId;
      
      logger.info(`Writing to Modbus register ${request.register.name} (${request.register.address}): ${request.value}`);

      // Convert value to raw format
      const rawValue = this.convertValueToRaw(request.value, request.register);
      
      // Write based on register type
      const success = await this.writeRegisterValue(unitId, request.register, rawValue);
      
      const result: ModbusWriteResult = {
        register: request.register,
        success,
        timestamp: new Date(),
        error: success ? undefined : 'Write operation failed'
      };

      this.emit('data_written', result);
      return result;

    } catch (error) {
      logger.error('Error writing Modbus register:', error);
      
      const result: ModbusWriteResult = {
        register: request.register,
        success: false,
        timestamp: new Date(),
        error: error.message
      };

      this.emit('error', error);
      return result;
    }
  }

  public addPollingGroup(group: ModbusPollingGroup): void {
    this.pollingGroups.set(group.name, group);
    
    if (group.enabled && this.connectionState === 'connected') {
      this.startPollingGroup(group);
    }
    
    logger.info(`Added Modbus polling group: ${group.name} with ${group.registers.length} registers`);
  }

  public removePollingGroup(name: string): void {
    this.stopPollingGroup(name);
    this.pollingGroups.delete(name);
    logger.info(`Removed Modbus polling group: ${name}`);
  }

  public enablePollingGroup(name: string): void {
    const group = this.pollingGroups.get(name);
    if (group) {
      group.enabled = true;
      if (this.connectionState === 'connected') {
        this.startPollingGroup(group);
      }
    }
  }

  public disablePollingGroup(name: string): void {
    const group = this.pollingGroups.get(name);
    if (group) {
      group.enabled = false;
      this.stopPollingGroup(name);
    }
  }

  public async healthCheck(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      if (this.connectionState !== 'connected' || !this.client) {
        return {
          healthy: false,
          message: 'Modbus client not connected',
          details: { 
            connectionState: this.connectionState,
            statistics: this.statistics
          }
        };
      }

      // Test connection by reading a simple register
      const testRegister: ModbusRegister = {
        name: 'health_check',
        address: 0,
        type: ModbusRegisterType.HOLDING_REGISTER,
        dataType: ModbusDataType.UINT16
      };

      try {
        await this.readRegisters({ registers: [testRegister] });
      } catch (error) {
        return {
          healthy: false,
          message: 'Modbus health check read failed',
          details: { error: error.message, statistics: this.statistics }
        };
      }

      return {
        healthy: true,
        message: 'Modbus connection healthy',
        details: {
          connectionState: this.connectionState,
          activePollingGroups: Array.from(this.pollingGroups.keys()).filter(name => 
            this.pollingGroups.get(name)?.enabled
          ).length,
          totalRegisters: this.registers.size,
          statistics: this.statistics
        }
      };

    } catch (error) {
      return {
        healthy: false,
        message: 'Modbus health check failed',
        details: { error: error.message, statistics: this.statistics }
      };
    }
  }

  public getConnectionInfo(): any {
    return {
      host: this.config.host,
      port: this.config.port,
      protocol: this.config.protocol,
      unitId: this.config.unitId,
      connectionState: this.connectionState,
      totalRegisters: this.registers.size,
      activePollingGroups: Array.from(this.pollingGroups.values()).filter(g => g.enabled).length,
      statistics: this.statistics
    };
  }

  public getStatistics(): any {
    return { ...this.statistics };
  }

  public resetStatistics(): void {
    this.statistics = {
      totalReads: 0,
      totalWrites: 0,
      successfulReads: 0,
      successfulWrites: 0,
      errors: 0,
      lastActivity: null
    };
  }

  private async createModbusClient(): Promise<any> {
    // Mock Modbus client creation
    // In real implementation, use modbus-serial or jsmodbus library
    return {
      connect: async () => {
        logger.info(`Mock Modbus ${this.config.protocol} client connecting to ${this.config.host}:${this.config.port}`);
      },
      disconnect: async () => {
        logger.info('Mock Modbus client disconnecting');
      },
      readCoils: async (address: number, count: number, unitId: number) => {
        return new Array(count).fill(0).map(() => Math.random() > 0.5);
      },
      readDiscreteInputs: async (address: number, count: number, unitId: number) => {
        return new Array(count).fill(0).map(() => Math.random() > 0.5);
      },
      readHoldingRegisters: async (address: number, count: number, unitId: number) => {
        return new Array(count).fill(0).map(() => Math.floor(Math.random() * 65536));
      },
      readInputRegisters: async (address: number, count: number, unitId: number) => {
        return new Array(count).fill(0).map(() => Math.floor(Math.random() * 65536));
      },
      writeSingleCoil: async (address: number, value: boolean, unitId: number) => {
        return true;
      },
      writeSingleRegister: async (address: number, value: number, unitId: number) => {
        return true;
      },
      writeMultipleCoils: async (address: number, values: boolean[], unitId: number) => {
        return true;
      },
      writeMultipleRegisters: async (address: number, values: number[], unitId: number) => {
        return true;
      }
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      const health = await this.healthCheck();
      if (!health.healthy) {
        this.emit('connection_lost');
      }
    }, 30000); // Check every 30 seconds
  }

  private startPolling(): void {
    for (const group of this.pollingGroups.values()) {
      if (group.enabled) {
        this.startPollingGroup(group);
      }
    }
  }

  private stopPolling(): void {
    for (const name of this.pollingGroups.keys()) {
      this.stopPollingGroup(name);
    }
  }

  private startPollingGroup(group: ModbusPollingGroup): void {
    this.stopPollingGroup(group.name); // Stop existing timer
    
    const timer = setInterval(async () => {
      try {
        const request: ModbusReadRequest = {
          unitId: group.unitId,
          registers: group.registers,
          maxRegistersPerRead: group.maxRegistersPerRead
        };
        
        const results = await this.readRegisters(request);
        
        if (group.onData) {
          group.onData(results);
        }
        
        this.emit('polling_data', { group: group.name, results });
        
      } catch (error) {
        logger.error(`Polling group ${group.name} error:`, error);
        
        if (group.onError) {
          group.onError(error);
        }
        
        this.emit('polling_error', { group: group.name, error });
      }
    }, group.interval);
    
    this.pollingTimers.set(group.name, timer);
    logger.info(`Started polling group: ${group.name} (interval: ${group.interval}ms)`);
  }

  private stopPollingGroup(name: string): void {
    const timer = this.pollingTimers.get(name);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(name);
      logger.info(`Stopped polling group: ${name}`);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('Modbus reconnection failed:', error);
        this.scheduleReconnect();
      }
    }, this.config.retryPolicy?.initialDelay || 5000);
  }

  private groupRegistersByType(registers: ModbusRegister[]): Map<ModbusRegisterType, ModbusRegister[]> {
    const groups = new Map<ModbusRegisterType, ModbusRegister[]>();
    
    for (const register of registers) {
      const existing = groups.get(register.type) || [];
      existing.push(register);
      groups.set(register.type, existing);
    }
    
    return groups;
  }

  private async readRegisterGroup(
    unitId: number, 
    type: ModbusRegisterType, 
    registers: ModbusRegister[],
    maxRegistersPerRead?: number
  ): Promise<ModbusReadResult[]> {
    const results: ModbusReadResult[] = [];
    
    // Sort registers by address for efficient reading
    const sortedRegisters = registers.sort((a, b) => a.address - b.address);
    
    for (const register of sortedRegisters) {
      try {
        const rawValue = await this.readSingleRegister(unitId, register);
        const value = this.convertRawToValue(rawValue, register);
        
        results.push({
          register,
          value,
          rawValue,
          timestamp: new Date(),
          quality: ModbusQuality.GOOD
        });
        
      } catch (error) {
        results.push({
          register,
          value: null,
          rawValue: [],
          timestamp: new Date(),
          quality: ModbusQuality.ERROR,
          error: error.message
        });
      }
    }
    
    return results;
  }

  private async readSingleRegister(unitId: number, register: ModbusRegister): Promise<number[]> {
    const length = this.getRegisterLength(register);
    
    switch (register.type) {
      case ModbusRegisterType.COIL:
        return (await this.client.readCoils(register.address, length, unitId)).map((b: boolean) => b ? 1 : 0);
      
      case ModbusRegisterType.DISCRETE_INPUT:
        return (await this.client.readDiscreteInputs(register.address, length, unitId)).map((b: boolean) => b ? 1 : 0);
      
      case ModbusRegisterType.HOLDING_REGISTER:
        return await this.client.readHoldingRegisters(register.address, length, unitId);
      
      case ModbusRegisterType.INPUT_REGISTER:
        return await this.client.readInputRegisters(register.address, length, unitId);
      
      default:
        throw new Error(`Unsupported register type: ${register.type}`);
    }
  }

  private async writeRegisterValue(unitId: number, register: ModbusRegister, rawValue: number[]): Promise<boolean> {
    try {
      switch (register.type) {
        case ModbusRegisterType.COIL:
          if (rawValue.length === 1) {
            return await this.client.writeSingleCoil(register.address, rawValue[0] !== 0, unitId);
          } else {
            return await this.client.writeMultipleCoils(register.address, rawValue.map(v => v !== 0), unitId);
          }
        
        case ModbusRegisterType.HOLDING_REGISTER:
          if (rawValue.length === 1) {
            return await this.client.writeSingleRegister(register.address, rawValue[0], unitId);
          } else {
            return await this.client.writeMultipleRegisters(register.address, rawValue, unitId);
          }
        
        default:
          throw new Error(`Register type ${register.type} is not writable`);
      }
    } catch (error) {
      logger.error(`Error writing to register ${register.name}:`, error);
      return false;
    }
  }

  private getRegisterLength(register: ModbusRegister): number {
    switch (register.dataType) {
      case ModbusDataType.BOOLEAN:
      case ModbusDataType.UINT16:
      case ModbusDataType.INT16:
        return 1;
      
      case ModbusDataType.UINT32:
      case ModbusDataType.INT32:
      case ModbusDataType.FLOAT32:
        return 2;
      
      case ModbusDataType.DOUBLE64:
        return 4;
      
      case ModbusDataType.STRING:
        return register.length || 10; // Default string length
      
      case ModbusDataType.BCD:
        return register.length || 1;
      
      default:
        return 1;
    }
  }

  private convertRawToValue(rawValue: number[], register: ModbusRegister): any {
    if (rawValue.length === 0) {
      return null;
    }

    let value: any;

    switch (register.dataType) {
      case ModbusDataType.BOOLEAN:
        value = rawValue[0] !== 0;
        break;
      
      case ModbusDataType.UINT16:
        value = rawValue[0];
        break;
      
      case ModbusDataType.INT16:
        value = rawValue[0] > 32767 ? rawValue[0] - 65536 : rawValue[0];
        break;
      
      case ModbusDataType.UINT32:
        value = register.wordOrder === ModbusWordOrder.LOW_WORD_FIRST
          ? (rawValue[1] << 16) | rawValue[0]
          : (rawValue[0] << 16) | rawValue[1];
        break;
      
      case ModbusDataType.INT32:
        const uint32 = register.wordOrder === ModbusWordOrder.LOW_WORD_FIRST
          ? (rawValue[1] << 16) | rawValue[0]
          : (rawValue[0] << 16) | rawValue[1];
        value = uint32 > 2147483647 ? uint32 - 4294967296 : uint32;
        break;
      
      case ModbusDataType.FLOAT32:
        // IEEE 754 float conversion (simplified)
        value = this.parseFloat32(rawValue, register.wordOrder, register.byteOrder);
        break;
      
      case ModbusDataType.STRING:
        value = this.parseString(rawValue);
        break;
      
      default:
        value = rawValue[0];
    }

    // Apply scaling and offset
    if (register.scale !== undefined && typeof value === 'number') {
      value *= register.scale;
    }
    
    if (register.offset !== undefined && typeof value === 'number') {
      value += register.offset;
    }

    return value;
  }

  private convertValueToRaw(value: any, register: ModbusRegister): number[] {
    let numValue = value;

    // Apply reverse scaling and offset
    if (register.offset !== undefined && typeof numValue === 'number') {
      numValue -= register.offset;
    }
    
    if (register.scale !== undefined && typeof numValue === 'number') {
      numValue /= register.scale;
    }

    switch (register.dataType) {
      case ModbusDataType.BOOLEAN:
        return [value ? 1 : 0];
      
      case ModbusDataType.UINT16:
        return [Math.max(0, Math.min(65535, Math.floor(numValue)))];
      
      case ModbusDataType.INT16:
        const int16 = Math.max(-32768, Math.min(32767, Math.floor(numValue)));
        return [int16 < 0 ? int16 + 65536 : int16];
      
      case ModbusDataType.UINT32:
        const uint32 = Math.max(0, Math.min(4294967295, Math.floor(numValue)));
        return register.wordOrder === ModbusWordOrder.LOW_WORD_FIRST
          ? [uint32 & 0xFFFF, (uint32 >> 16) & 0xFFFF]
          : [(uint32 >> 16) & 0xFFFF, uint32 & 0xFFFF];
      
      case ModbusDataType.STRING:
        return this.stringToRaw(value.toString());
      
      default:
        return [Math.floor(numValue)];
    }
  }

  private parseFloat32(rawValue: number[], wordOrder?: ModbusWordOrder, byteOrder?: ModbusByteOrder): number {
    // Simplified float parsing - in real implementation, use proper IEEE 754 conversion
    return rawValue[0] / 100.0; // Mock conversion
  }

  private parseString(rawValue: number[]): string {
    let result = '';
    for (const word of rawValue) {
      result += String.fromCharCode((word >> 8) & 0xFF);
      result += String.fromCharCode(word & 0xFF);
    }
    return result.replace(/\0/g, '').trim();
  }

  private stringToRaw(str: string): number[] {
    const result: number[] = [];
    for (let i = 0; i < str.length; i += 2) {
      const char1 = str.charCodeAt(i) || 0;
      const char2 = str.charCodeAt(i + 1) || 0;
      result.push((char1 << 8) | char2);
    }
    return result;
  }
}
