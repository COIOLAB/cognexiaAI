// Configuration Constants for Industry 5.0 ERP

export const API_CONFIG = {
  VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000
  }
} as const;

export const SECURITY_CONFIG = {
  JWT: {
    EXPIRES_IN: '8h',
    REFRESH_EXPIRES_IN: '7d',
    ALGORITHM: 'RS256'
  },
  PASSWORD: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    EXPIRY_DAYS: 90,
    HISTORY_COUNT: 12
  },
  MFA: {
    TOTP_WINDOW: 1,
    BACKUP_CODES_COUNT: 10
  },
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16
  },
  SESSION: {
    TIMEOUT_MINUTES: 480, // 8 hours
    WARNING_MINUTES: 15,
    MAX_CONCURRENT: 3
  }
} as const;

export const COMPLIANCE_CONFIG = {
  AUDIT: {
    RETENTION_DAYS: 2555, // 7 years
    LOG_LEVEL: 'INFO',
    SENSITIVE_FIELDS: [
      'password',
      'ssn',
      'creditCardNumber',
      'bankAccount',
      'classifiedData'
    ]
  },
  DATA_RETENTION: {
    MANUFACTURING: {
      PRODUCTION_RECORDS: 2190, // 6 years
      QUALITY_RECORDS: 3650,    // 10 years
      MAINTENANCE_RECORDS: 2190
    },
    BANKING: {
      TRANSACTIONS: 2555,       // 7 years
      CUSTOMER_RECORDS: 2555,
      COMPLIANCE_REPORTS: 2555
    },
    DEFENCE: {
      PERSONNEL_RECORDS: 9125,  // 25 years
      MISSION_RECORDS: 5475,    // 15 years
      ASSET_RECORDS: 3650       // 10 years
    }
  }
} as const;

export const VALIDATION_CONFIG = {
  STRING: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 4000,
    TRIM_WHITESPACE: true
  },
  NUMERIC: {
    MIN_VALUE: -Number.MAX_SAFE_INTEGER,
    MAX_VALUE: Number.MAX_SAFE_INTEGER,
    DECIMAL_PLACES: 2
  },
  DATE: {
    MIN_YEAR: 1900,
    MAX_YEAR: 2100,
    FORMAT: 'YYYY-MM-DD'
  },
  FILE: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
  }
} as const;

export const INDUSTRY_SPECIFIC_CONFIG = {
  MANUFACTURING: {
    OEE_TARGETS: {
      WORLD_CLASS: 85,
      GOOD: 75,
      ACCEPTABLE: 60
    },
    IOT: {
      DATA_COLLECTION_INTERVAL: 5000, // 5 seconds
      ALERT_THRESHOLDS: {
        TEMPERATURE: { MAX: 80, MIN: -10 },
        PRESSURE: { MAX: 150, MIN: 0 },
        VIBRATION: { MAX: 10, MIN: 0 }
      },
      BATCH_SIZE: 1000,
      RETENTION_DAYS: 365
    },
    QUALITY: {
      SAMPLE_SIZES: {
        HIGH_VOLUME: 0.1,
        MEDIUM_VOLUME: 0.25,
        LOW_VOLUME: 1.0
      }
    }
  },
  BANKING: {
    TRANSACTION_LIMITS: {
      DAILY_WITHDRAWAL: 5000,
      DAILY_TRANSFER: 25000,
      MONTHLY_TRANSFER: 100000
    },
    RISK_SCORING: {
      LOW_RISK_THRESHOLD: 30,
      MEDIUM_RISK_THRESHOLD: 70,
      HIGH_RISK_THRESHOLD: 90
    },
    AML: {
      TRANSACTION_MONITORING_THRESHOLD: 10000,
      SUSPICIOUS_ACTIVITY_THRESHOLD: 50000,
      REVIEW_PERIOD_DAYS: 30
    },
    INTEREST_RATES: {
      SAVINGS_BASE: 0.01,
      CREDIT_BASE: 0.18,
      LOAN_BASE: 0.05
    }
  },
  DEFENCE: {
    CLASSIFICATION_LEVELS: {
      UNCLASSIFIED: 0,
      CONFIDENTIAL: 1,
      SECRET: 2,
      TOP_SECRET: 3
    },
    MISSION: {
      PLANNING_LEAD_TIME_DAYS: 30,
      MAX_DEPLOYMENT_DAYS: 365,
      RISK_ASSESSMENT_VALIDITY_DAYS: 90
    },
    ASSET: {
      MAINTENANCE_INTERVALS: {
        DAILY: 1,
        WEEKLY: 7,
        MONTHLY: 30,
        QUARTERLY: 90,
        ANNUALLY: 365
      },
      READINESS_THRESHOLDS: {
        C1: 95,
        C2: 85,
        C3: 75,
        C4: 50
      }
    }
  }
} as const;

export const NOTIFICATION_CONFIG = {
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    WEBHOOK: 'webhook'
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  TEMPLATES: {
    ALERT: 'alert',
    REMINDER: 'reminder',
    APPROVAL: 'approval',
    STATUS_UPDATE: 'status_update'
  },
  DELIVERY: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 5000,
    TIMEOUT_MS: 30000
  }
} as const;

export const CACHE_CONFIG = {
  TTL: {
    SHORT: 300,     // 5 minutes
    MEDIUM: 1800,   // 30 minutes
    LONG: 3600,     // 1 hour
    VERY_LONG: 86400 // 24 hours
  },
  KEYS: {
    USER_SESSION: 'user_session:',
    USER_PERMISSIONS: 'user_permissions:',
    ORGANIZATION_SETTINGS: 'org_settings:',
    SYSTEM_CONFIG: 'system_config',
    API_RESPONSE: 'api_response:'
  }
} as const;
