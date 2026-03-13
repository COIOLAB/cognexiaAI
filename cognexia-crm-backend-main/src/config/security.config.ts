import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  // CORS settings
  cors: {
    enabled: boolean;
    origin: boolean | string | RegExp | string[] | RegExp[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };

  // Helmet security headers
  helmet: {
    enabled: boolean;
    contentSecurityPolicy: boolean | object;
    hsts: boolean | object;
    frameguard: boolean | object;
    xssFilter: boolean;
    noSniff: boolean;
    ieNoOpen: boolean;
    hidePoweredBy: boolean;
  };

  // Rate limiting
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };

  // CSRF protection
  csrf: {
    enabled: boolean;
    cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };

  // Session security
  session: {
    secret: string;
    name: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };

  // JWT security
  jwt: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };

  // Password policy
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventCommon: boolean;
    maxAge: number; // days
    historyCount: number; // prevent reuse of last N passwords
  };

  // File upload security
  fileUpload: {
    maxFileSize: number; // bytes
    allowedMimeTypes: string[];
    maxFiles: number;
    virusScan: boolean;
  };

  // API security
  api: {
    requestTimeout: number; // milliseconds
    maxPayloadSize: string; // e.g., '10mb'
    requireApiKey: boolean;
    apiKeyHeader: string;
  };
}

export function getSecurityConfig(configService: ConfigService): SecurityConfig {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';

  // Get allowed origins from environment
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '');
  const originsArray = allowedOrigins
    ? allowedOrigins.split(',').map((o) => o.trim())
    : isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
    : [];

  return {
    cors: {
      enabled: true,
      origin: isProduction
        ? originsArray.length > 0
          ? originsArray
          : false // Block all in production if not configured
        : true, // Allow all in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Organization-Id',
        'X-API-Key',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Current-Page'],
      maxAge: 86400, // 24 hours
    },

    helmet: {
      enabled: true,
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          }
        : false, // Disable in development for easier debugging
      hsts: isProduction
        ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
          }
        : false,
      frameguard: {
        action: 'deny', // Prevent clickjacking
      },
      xssFilter: true,
      noSniff: true,
      ieNoOpen: true,
      hidePoweredBy: true,
    },

    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 100 : 1000, // Stricter in production
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },

    csrf: {
      enabled: isProduction,
      cookieOptions: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
      },
    },

    session: {
      secret: configService.get<string>('SESSION_SECRET', 'change-me-in-production'),
      name: 'cognexia.sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'strict' : 'lax',
      },
    },

    jwt: {
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
      issuer: configService.get<string>('JWT_ISSUER', 'cognexia-crm'),
      audience: configService.get<string>('JWT_AUDIENCE', 'cognexia-api'),
    },

    passwordPolicy: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommon: true,
      maxAge: 90, // days
      historyCount: 5,
    },

    fileUpload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      maxFiles: 10,
      virusScan: isProduction,
    },

    api: {
      requestTimeout: 30000, // 30 seconds
      maxPayloadSize: '10mb',
      requireApiKey: false, // Optional API key authentication
      apiKeyHeader: 'X-API-Key',
    },
  };
}

/**
 * Validate security environment variables
 */
export function validateSecurityEnv(configService: ConfigService): void {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SESSION_SECRET',
      'ALLOWED_ORIGINS',
      'DATABASE_PASSWORD',
    ];

    const missing = requiredVars.filter((varName) => !configService.get(varName));

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables for production: ${missing.join(', ')}`
      );
    }

    // Warn about insecure defaults
    if (configService.get('JWT_SECRET') === 'your-secret-key-here') {
      throw new Error('JWT_SECRET must be changed from default value in production!');
    }

    if (configService.get('SESSION_SECRET') === 'change-me-in-production') {
      throw new Error('SESSION_SECRET must be changed from default value in production!');
    }
  }

  console.log('✅ Security environment variables validated');
}
