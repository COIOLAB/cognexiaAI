import { MockType } from '../types/mock.type';

// Mock Repository Factory
export const repositoryMockFactory = <T = any>(): MockType<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  count: jest.fn(),
  query: jest.fn(),
  manager: {
    transaction: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
});

// Mock Work Center Service
export const mockWorkCenterService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  calculateOEE: jest.fn(),
  getCapacityUtilization: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  scheduleMaintenace: jest.fn(),
  getDowntimeAnalysis: jest.fn(),
  updateEfficiency: jest.fn(),
  checkOperationalStatus: jest.fn(),
  getEnergyConsumption: jest.fn(),
  getSafetyCompliance: jest.fn(),
  getCostAnalysis: jest.fn(),
};

// Mock Production Order Service
export const mockProductionOrderService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  release: jest.fn(),
  start: jest.fn(),
  complete: jest.fn(),
  cancel: jest.fn(),
  hold: jest.fn(),
  resume: jest.fn(),
  updateQuantity: jest.fn(),
  calculateProgress: jest.fn(),
  getScheduleStatus: jest.fn(),
  getMaterialRequirements: jest.fn(),
  getQualityStatus: jest.fn(),
  getCostTracking: jest.fn(),
  getKPIs: jest.fn(),
  generateReport: jest.fn(),
};

// Mock Work Order Service
export const mockWorkOrderService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  start: jest.fn(),
  complete: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  skip: jest.fn(),
  assignOperator: jest.fn(),
  updateProgress: jest.fn(),
  recordQuality: jest.fn(),
  recordMaterialConsumption: jest.fn(),
  calculateEfficiency: jest.fn(),
  getOperationStatus: jest.fn(),
  generateWorkInstruction: jest.fn(),
};

// Mock IoT Device Service
export const mockIoTDeviceService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  activate: jest.fn(),
  deactivate: jest.fn(),
  calibrate: jest.fn(),
  getDeviceStatus: jest.fn(),
  getDeviceData: jest.fn(),
  setThresholds: jest.fn(),
  getAlerts: jest.fn(),
  updateFirmware: jest.fn(),
  resetDevice: jest.fn(),
  getConnectivity: jest.fn(),
  getPowerStatus: jest.fn(),
  getSecurityStatus: jest.fn(),
  scheduleMaintenance: jest.fn(),
};

// Mock Digital Twin Service
export const mockDigitalTwinService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  sync: jest.fn(),
  simulate: jest.fn(),
  predict: jest.fn(),
  optimize: jest.fn(),
  validate: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  runScenario: jest.fn(),
  updateModel: jest.fn(),
  getAIInsights: jest.fn(),
  getSimulationResults: jest.fn(),
  generateReport: jest.fn(),
  exportModel: jest.fn(),
  importModel: jest.fn(),
};

// Mock Quality Check Service
export const mockQualityCheckService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  startInspection: jest.fn(),
  completeInspection: jest.fn(),
  recordResult: jest.fn(),
  recordDefect: jest.fn(),
  calculatePassRate: jest.fn(),
  generateCertificate: jest.fn(),
  getQualityMetrics: jest.fn(),
  getComplianceStatus: jest.fn(),
  getCostOfQuality: jest.fn(),
  scheduleInspection: jest.fn(),
  getDefectAnalysis: jest.fn(),
  generateReport: jest.fn(),
};

// Mock BOM Service
export const mockBOMService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addComponent: jest.fn(),
  removeComponent: jest.fn(),
  updateComponent: jest.fn(),
  calculateCost: jest.fn(),
  validateStructure: jest.fn(),
  getComponentList: jest.fn(),
  explodeBOM: jest.fn(),
  wherUsed: jest.fn(),
  checkAvailability: jest.fn(),
  getCostBreakdown: jest.fn(),
  getAlternatives: jest.fn(),
  exportBOM: jest.fn(),
  importBOM: jest.fn(),
};

// Mock Production Line Service
export const mockProductionLineService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  emergencyStop: jest.fn(),
  getStatus: jest.fn(),
  getThroughput: jest.fn(),
  getBottlenecks: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  optimizeFlow: jest.fn(),
  balanceLine: jest.fn(),
  getEnergyConsumption: jest.fn(),
  getSustainabilityMetrics: jest.fn(),
  getMaintenanceStatus: jest.fn(),
  scheduleMaintenance: jest.fn(),
};

// Mock Equipment Maintenance Service
export const mockEquipmentMaintenanceService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  schedule: jest.fn(),
  start: jest.fn(),
  complete: jest.fn(),
  defer: jest.fn(),
  cancel: jest.fn(),
  assignTechnician: jest.fn(),
  recordWork: jest.fn(),
  recordParts: jest.fn(),
  calculateDowntime: jest.fn(),
  getPredictiveInsights: jest.fn(),
  generateWorkOrder: jest.fn(),
  getMaintenanceHistory: jest.fn(),
  getCostAnalysis: jest.fn(),
  getComplianceStatus: jest.fn(),
};

// Mock Operation Log Service
export const mockOperationLogService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  logEvent: jest.fn(),
  resolveEvent: jest.fn(),
  getEventHistory: jest.fn(),
  getAlarms: jest.fn(),
  getMetrics: jest.fn(),
  generateReport: jest.fn(),
  exportLogs: jest.fn(),
  archiveLogs: jest.fn(),
  getSystemHealth: jest.fn(),
  getPerformanceInsights: jest.fn(),
  getDowntimeAnalysis: jest.fn(),
  getOperatorActions: jest.fn(),
};

// Mock Analytics Service
export const mockAnalyticsService = {
  getProductionMetrics: jest.fn(),
  getQualityMetrics: jest.fn(),
  getMaintenanceMetrics: jest.fn(),
  getEnergyMetrics: jest.fn(),
  getCostMetrics: jest.fn(),
  getEfficiencyTrends: jest.fn(),
  getDowntimeAnalysis: jest.fn(),
  getCapacityUtilization: jest.fn(),
  getBottleneckAnalysis: jest.fn(),
  getPredictiveInsights: jest.fn(),
  generateDashboard: jest.fn(),
  exportReport: jest.fn(),
  getRealtimeMetrics: jest.fn(),
  getHistoricalTrends: jest.fn(),
  getBenchmarkData: jest.fn(),
  getKPIDashboard: jest.fn(),
};

// Mock Routing Service
export const mockRoutingService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addOperation: jest.fn(),
  removeOperation: jest.fn(),
  updateOperation: jest.fn(),
  resequenceOperations: jest.fn(),
  calculateTotalTime: jest.fn(),
  calculateTotalCost: jest.fn(),
  validateRouting: jest.fn(),
  getOperationList: jest.fn(),
  getCriticalPath: jest.fn(),
  optimizeSequence: jest.fn(),
  getAlternativeRoutings: jest.fn(),
  simulateRouting: jest.fn(),
};

// Mock Logger
export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

// Mock Event Emitter
export const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  listeners: jest.fn(),
  listenerCount: jest.fn(),
};

// Mock Cache Manager
export const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  wrap: jest.fn(),
  ttl: jest.fn(),
  keys: jest.fn(),
  store: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
    keys: jest.fn(),
    ttl: jest.fn(),
  },
};

// Mock Queue
export const mockQueue = {
  add: jest.fn(),
  process: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(),
  getJobCounts: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  empty: jest.fn(),
  clean: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock WebSocket Gateway
export const mockWebSocketGateway = {
  server: {
    emit: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
    in: jest.fn(() => ({
      emit: jest.fn(),
    })),
  },
  handleConnection: jest.fn(),
  handleDisconnect: jest.fn(),
  sendUpdate: jest.fn(),
  sendAlert: jest.fn(),
  broadcastMetrics: jest.fn(),
  sendNotification: jest.fn(),
};

// Mock HTTP Service
export const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  head: jest.fn(),
  request: jest.fn(),
  axiosRef: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    request: jest.fn(),
  },
};

// Mock Configuration Service
export const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
  set: jest.fn(),
};

// Mock Database Connection
export const mockDataSource = {
  manager: {
    transaction: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    query: jest.fn(),
    getRepository: jest.fn(),
  },
  getRepository: jest.fn(),
  createQueryBuilder: jest.fn(),
  query: jest.fn(),
  isInitialized: true,
  options: {},
};

// Mock Request/Response
export const mockRequest = {
  user: {
    id: 'user-001',
    username: 'testuser',
    roles: ['operator', 'engineer'],
    permissions: ['read', 'write'],
  },
  headers: {
    authorization: 'Bearer token',
    'content-type': 'application/json',
  },
  body: {},
  params: {},
  query: {},
  ip: '127.0.0.1',
  method: 'GET',
  url: '/api/manufacturing/work-centers',
};

export const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  redirect: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
  header: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  type: jest.fn().mockReturnThis(),
  locals: {},
};

// Mock JWT Service
export const mockJwtService = {
  sign: jest.fn(),
  signAsync: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
  decode: jest.fn(),
};

// Mock Guard Execution Context
export const mockExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => mockRequest,
    getResponse: () => mockResponse,
  }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
};

// Factory functions for creating specific mocks
export const createMockRepository = <T>(entity: new () => T) => ({
  ...repositoryMockFactory<T>(),
  target: entity,
  metadata: {
    target: entity,
    name: entity.name,
  },
});

export const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getMany: jest.fn(),
  getManyAndCount: jest.fn(),
  getCount: jest.fn(),
  getRawOne: jest.fn(),
  getRawMany: jest.fn(),
  execute: jest.fn(),
  printSql: jest.fn(),
  getQuery: jest.fn(),
  getParameters: jest.fn(),
  setParameter: jest.fn().mockReturnThis(),
  setParameters: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
});

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'user-001',
  username: 'testuser',
  email: 'test@example.com',
  roles: ['operator'],
  permissions: ['read', 'write'],
  isActive: true,
  ...overrides,
});

export const createMockGuardContext = (user?: any) => ({
  ...mockExecutionContext,
  switchToHttp: () => ({
    getRequest: () => ({
      ...mockRequest,
      user: user || createMockUser(),
    }),
    getResponse: () => mockResponse,
  }),
});

// Error mocks
export const mockDatabaseError = new Error('Database connection failed');
export const mockValidationError = new Error('Validation failed');
export const mockNotFoundError = new Error('Resource not found');
export const mockUnauthorizedError = new Error('Unauthorized access');
export const mockForbiddenError = new Error('Forbidden action');

// Date/Time mocks
export const mockDate = new Date('2024-01-15T10:00:00Z');
export const mockTimestamp = mockDate.getTime();

// Environment mocks
export const mockEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  JWT_SECRET: 'test-secret',
  REDIS_URL: 'redis://localhost:6379',
  MQTT_BROKER_URL: 'mqtt://localhost:1883',
  LOG_LEVEL: 'debug',
};

// Reset all mocks function
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  
  // Reset specific mock implementations
  Object.values(mockWorkCenterService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
  
  Object.values(mockProductionOrderService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
  
  // Add more service resets as needed
};

// Mock factory for creating test modules
export const createTestingModule = (providers: any[] = []) => ({
  get: jest.fn(),
  resolve: jest.fn(),
  createNestApplication: jest.fn(),
  createNestMicroservice: jest.fn(),
  init: jest.fn(),
  close: jest.fn(),
});

export default {
  repositoryMockFactory,
  mockWorkCenterService,
  mockProductionOrderService,
  mockWorkOrderService,
  mockIoTDeviceService,
  mockDigitalTwinService,
  mockQualityCheckService,
  mockBOMService,
  mockProductionLineService,
  mockEquipmentMaintenanceService,
  mockOperationLogService,
  mockAnalyticsService,
  mockRoutingService,
  mockLogger,
  mockEventEmitter,
  mockCacheManager,
  mockQueue,
  mockWebSocketGateway,
  mockHttpService,
  mockConfigService,
  mockDataSource,
  mockRequest,
  mockResponse,
  mockJwtService,
  mockExecutionContext,
  createMockRepository,
  createMockQueryBuilder,
  createMockUser,
  createMockGuardContext,
  createTestingModule,
  resetAllMocks,
};
