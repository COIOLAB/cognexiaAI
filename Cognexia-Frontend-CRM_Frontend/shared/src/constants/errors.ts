// Error Constants for Industry 5.0 ERP

export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  AUTH_MFA_REQUIRED: 'AUTH_004',
  AUTH_ACCOUNT_LOCKED: 'AUTH_005',
  AUTH_PASSWORD_EXPIRED: 'AUTH_006',

  // Validation Errors
  VALIDATION_REQUIRED_FIELD: 'VAL_001',
  VALIDATION_INVALID_FORMAT: 'VAL_002',
  VALIDATION_OUT_OF_RANGE: 'VAL_003',
  VALIDATION_DUPLICATE_VALUE: 'VAL_004',

  // Business Logic Errors
  BIZ_INSUFFICIENT_INVENTORY: 'BIZ_001',
  BIZ_INVALID_OPERATION: 'BIZ_002',
  BIZ_RESOURCE_UNAVAILABLE: 'BIZ_003',
  BIZ_WORKFLOW_VIOLATION: 'BIZ_004',

  // Database Errors
  DB_CONNECTION_FAILED: 'DB_001',
  DB_TRANSACTION_FAILED: 'DB_002',
  DB_CONSTRAINT_VIOLATION: 'DB_003',
  DB_RECORD_NOT_FOUND: 'DB_004',

  // External Service Errors
  EXT_SERVICE_UNAVAILABLE: 'EXT_001',
  EXT_SERVICE_TIMEOUT: 'EXT_002',
  EXT_INVALID_RESPONSE: 'EXT_003',

  // Security Clearance Errors
  SEC_CLEARANCE_INSUFFICIENT: 'SEC_001',
  SEC_CLASSIFIED_ACCESS_DENIED: 'SEC_002',
  SEC_COMPLIANCE_VIOLATION: 'SEC_003',

  // Manufacturing Specific
  MFG_EQUIPMENT_OFFLINE: 'MFG_001',
  MFG_QUALITY_FAILURE: 'MFG_002',
  MFG_PRODUCTION_HALT: 'MFG_003',

  // Banking Specific
  BNK_INSUFFICIENT_FUNDS: 'BNK_001',
  BNK_TRANSACTION_LIMIT_EXCEEDED: 'BNK_002',
  BNK_ACCOUNT_FROZEN: 'BNK_003',
  BNK_REGULATORY_HOLD: 'BNK_004',

  // Defence Specific
  DEF_MISSION_SECURITY_BREACH: 'DEF_001',
  DEF_ASSET_COMPROMISE: 'DEF_002',
  DEF_OPERATIONAL_SECURITY_VIOLATION: 'DEF_003'
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',
  [ERROR_CODES.AUTH_MFA_REQUIRED]: 'Multi-factor authentication required',
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: 'Account is locked due to security policy',
  [ERROR_CODES.AUTH_PASSWORD_EXPIRED]: 'Password has expired and must be changed',

  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Invalid field format',
  [ERROR_CODES.VALIDATION_OUT_OF_RANGE]: 'Value is outside acceptable range',
  [ERROR_CODES.VALIDATION_DUPLICATE_VALUE]: 'Duplicate value not allowed',

  [ERROR_CODES.BIZ_INSUFFICIENT_INVENTORY]: 'Insufficient inventory for operation',
  [ERROR_CODES.BIZ_INVALID_OPERATION]: 'Operation not permitted in current state',
  [ERROR_CODES.BIZ_RESOURCE_UNAVAILABLE]: 'Required resource is not available',
  [ERROR_CODES.BIZ_WORKFLOW_VIOLATION]: 'Operation violates workflow rules',

  [ERROR_CODES.DB_CONNECTION_FAILED]: 'Database connection failed',
  [ERROR_CODES.DB_TRANSACTION_FAILED]: 'Database transaction failed',
  [ERROR_CODES.DB_CONSTRAINT_VIOLATION]: 'Database constraint violation',
  [ERROR_CODES.DB_RECORD_NOT_FOUND]: 'Record not found',

  [ERROR_CODES.EXT_SERVICE_UNAVAILABLE]: 'External service unavailable',
  [ERROR_CODES.EXT_SERVICE_TIMEOUT]: 'External service timeout',
  [ERROR_CODES.EXT_INVALID_RESPONSE]: 'Invalid response from external service',

  [ERROR_CODES.SEC_CLEARANCE_INSUFFICIENT]: 'Security clearance level insufficient',
  [ERROR_CODES.SEC_CLASSIFIED_ACCESS_DENIED]: 'Access denied to classified information',
  [ERROR_CODES.SEC_COMPLIANCE_VIOLATION]: 'Compliance violation detected',

  [ERROR_CODES.MFG_EQUIPMENT_OFFLINE]: 'Manufacturing equipment is offline',
  [ERROR_CODES.MFG_QUALITY_FAILURE]: 'Quality check failed',
  [ERROR_CODES.MFG_PRODUCTION_HALT]: 'Production has been halted',

  [ERROR_CODES.BNK_INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction',
  [ERROR_CODES.BNK_TRANSACTION_LIMIT_EXCEEDED]: 'Transaction limit exceeded',
  [ERROR_CODES.BNK_ACCOUNT_FROZEN]: 'Account is frozen',
  [ERROR_CODES.BNK_REGULATORY_HOLD]: 'Transaction on regulatory hold',

  [ERROR_CODES.DEF_MISSION_SECURITY_BREACH]: 'Mission security breach detected',
  [ERROR_CODES.DEF_ASSET_COMPROMISE]: 'Asset security compromise',
  [ERROR_CODES.DEF_OPERATIONAL_SECURITY_VIOLATION]: 'Operational security violation'
} as const;
