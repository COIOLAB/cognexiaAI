// Controllers
export * from './controllers';

// Routes
export * from './routes';

// Services (when available)
// export * from './services';

// Types and interfaces (when available)
// export * from './types';

// Version information
export const MAINTENANCE_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Default export
export default {
  MAINTENANCE_VERSION,
  BUILD_DATE
};
