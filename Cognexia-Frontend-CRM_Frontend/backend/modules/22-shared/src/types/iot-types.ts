// ===========================================
// IOT AND SENSOR TYPES
// Industry 5.0 ERP Backend System
// ===========================================

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number | string | boolean;
  unit: string;
  quality: number;
  metadata: Record<string, any>;
}

export interface SensorConfiguration {
  sensorId: string;
  sensorType: string;
  location: string;
  calibrationDate: Date;
  samplingRate: number;
  accuracy: number;
  range: [number, number];
  alertThresholds: Record<string, number>;
}

export interface IoTDevice {
  deviceId: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength: number;
  location: string;
  status: string;
}

export interface ConnectivityStatus {
  deviceId: string;
  isOnline: boolean;
  lastConnected: Date;
  connectionType: string;
  dataRate: number;
  latency: number;
  packetLoss: number;
}
