// ===========================================
// CORE MAINTENANCE DATA TYPES
// Industry 5.0 ERP Backend System
// ===========================================

// Core data structures for maintenance operations
export interface MaintenanceOperation {
  operationId: string;
  operationType: string;
  equipmentId: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  technician: string;
  notes: string;
  cost: number;
  partsUsed: string[];
  toolsUsed: string[];
}

export interface EquipmentData {
  equipmentId: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  operatingHours: number;
  specifications: Record<string, any>;
  location: string;
  status: string;
}

export interface IoTSensorStream {
  streamId: string;
  sensorId: string;
  equipmentId: string;
  dataType: string;
  sampleRate: number;
  lastReading: Date;
  isActive: boolean;
  dataBuffer: number[];
  metadata: Record<string, any>;
}

export interface MaintenanceDashboard {
  dashboardId: string;
  userId: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshRate: number;
  lastUpdated: Date;
  preferences: Record<string, any>;
}

export interface DashboardWidget {
  widgetId: string;
  widgetType: string;
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface DashboardLayout {
  layoutId: string;
  name: string;
  columns: number;
  rows: number;
  responsive: boolean;
}

export interface AIMaintenanceModel {
  modelId: string;
  modelType: string;
  version: string;
  trainingData: string;
  accuracy: number;
  lastTrained: Date;
  parameters: Record<string, any>;
  deploymentStatus: string;
}
