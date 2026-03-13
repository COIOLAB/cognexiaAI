/**
 * Analytics Services Index
 * 
 * This module provides a comprehensive suite of analytics services for the Industry 5.0 platform.
 * The services are designed to work together to provide enterprise-grade analytics capabilities
 * including data management, query execution, visualization, machine learning, and real-time processing.
 * 
 * Architecture Overview:
 * - BaseAnalyticsService: Common functionality and utilities for all services
 * - DataSourceService: Connection management and data source operations
 * - DatasetService: Data management, profiling, and quality assessment
 * - DashboardService: Visualization, dashboard management, and sharing
 * - QueryExecutionService: Query optimization, execution, and performance monitoring
 * - [Additional services to be added...]
 * 
 * Each service follows enterprise patterns with:
 * - Comprehensive error handling and logging
 * - Caching and performance optimization
 * - Security and data sanitization
 * - Real-time capabilities
 * - Scalable architecture
 * 
 * @version 1.0.0
 * @author Industry 5.0 Analytics Team
 */

// Core Services
export { BaseAnalyticsService } from './base-analytics.service';

// Data Management Services
export { DataSourceService } from './data-source.service';
export { DatasetService } from './dataset.service';

// Visualization Services
export { DashboardService } from './dashboard.service';

// Query and Execution Services
export { QueryExecutionService } from './query-execution.service';

// Service Categories for easier organization
export const CORE_SERVICES = {
  BaseAnalyticsService: 'base-analytics.service',
} as const;

export const DATA_SERVICES = {
  DataSourceService: 'data-source.service',
  DatasetService: 'dataset.service',
} as const;

export const VISUALIZATION_SERVICES = {
  DashboardService: 'dashboard.service',
} as const;

export const EXECUTION_SERVICES = {
  QueryExecutionService: 'query-execution.service',
} as const;

// Service registry for dynamic service discovery
export const SERVICE_REGISTRY = {
  ...CORE_SERVICES,
  ...DATA_SERVICES,
  ...VISUALIZATION_SERVICES,
  ...EXECUTION_SERVICES,
} as const;

// Service metadata for documentation and tooling
export const SERVICE_METADATA = {
  BaseAnalyticsService: {
    category: 'Core',
    description: 'Base service providing common functionality for all analytics services',
    dependencies: ['EntityManager'],
    features: ['error handling', 'validation', 'caching', 'logging', 'performance monitoring'],
    version: '1.0.0',
  },
  DataSourceService: {
    category: 'Data Management',
    description: 'Manages data source connections, testing, and schema discovery',
    dependencies: ['BaseAnalyticsService', 'AnalyticsDataSource'],
    features: ['connection management', 'schema discovery', 'connection pooling', 'real-time streaming'],
    version: '1.0.0',
  },
  DatasetService: {
    category: 'Data Management',
    description: 'Handles dataset management, profiling, and quality assessment',
    dependencies: ['BaseAnalyticsService', 'AnalyticsDataset', 'AnalyticsDataSource'],
    features: ['data profiling', 'quality assessment', 'schema validation', 'data transformation'],
    version: '1.0.0',
  },
  DashboardService: {
    category: 'Visualization',
    description: 'Manages dashboards, widgets, and visualization components',
    dependencies: ['BaseAnalyticsService', 'Dashboard', 'DashboardWidget', 'DashboardShare', 'DashboardView'],
    features: ['dashboard management', 'widget management', 'sharing', 'real-time updates', 'layout optimization'],
    version: '1.0.0',
  },
  QueryExecutionService: {
    category: 'Execution',
    description: 'Handles query parsing, optimization, execution, and performance monitoring',
    dependencies: ['BaseAnalyticsService', 'DataSourceService', 'AnalyticsQuery', 'QueryExecution'],
    features: ['query optimization', 'execution caching', 'performance monitoring', 'execution history'],
    version: '1.0.0',
  },
} as const;

// Helper functions for service discovery and management
export const getServicesByCategory = (category: string) => {
  return Object.entries(SERVICE_METADATA)
    .filter(([, metadata]) => metadata.category === category)
    .map(([serviceName]) => serviceName);
};

export const getServiceMetadata = (serviceName: string) => {
  return SERVICE_METADATA[serviceName as keyof typeof SERVICE_METADATA];
};

export const getAllServiceCategories = () => {
  return [...new Set(Object.values(SERVICE_METADATA).map(metadata => metadata.category))];
};

// Type definitions for better TypeScript support
export type ServiceName = keyof typeof SERVICE_REGISTRY;
export type ServiceCategory = 'Core' | 'Data Management' | 'Visualization' | 'Execution' | 'Machine Learning' | 'Advanced Analytics' | 'Real-time' | 'Anomaly Detection' | 'Insights' | 'Reporting' | 'Pipeline' | 'Engine';

// Service configuration interface
export interface ServiceConfig {
  name: ServiceName;
  enabled: boolean;
  config?: Record<string, any>;
  dependencies?: ServiceName[];
}

// Analytics module service provider configuration
export const ANALYTICS_SERVICE_PROVIDERS = [
  'BaseAnalyticsService',
  'DataSourceService', 
  'DatasetService',
  'DashboardService',
  'QueryExecutionService',
] as const;

/**
 * Service initialization order based on dependencies
 * Services with no dependencies are initialized first
 */
export const SERVICE_INITIALIZATION_ORDER: ServiceName[] = [
  'BaseAnalyticsService',      // No dependencies
  'DataSourceService',         // Depends on BaseAnalyticsService
  'DatasetService',           // Depends on BaseAnalyticsService, DataSourceService
  'QueryExecutionService',    // Depends on BaseAnalyticsService, DataSourceService  
  'DashboardService',         // Depends on BaseAnalyticsService
];

/**
 * Service health check interface
 */
export interface ServiceHealthCheck {
  serviceName: ServiceName;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: Date;
  responseTime: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

/**
 * Service performance metrics interface
 */
export interface ServiceMetrics {
  serviceName: ServiceName;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastReset: Date;
  customMetrics?: Record<string, number>;
}

// Default export for convenience
export default {
  BaseAnalyticsService,
  DataSourceService,
  DatasetService,
  DashboardService,
  QueryExecutionService,
  SERVICE_REGISTRY,
  SERVICE_METADATA,
  ANALYTICS_SERVICE_PROVIDERS,
  SERVICE_INITIALIZATION_ORDER,
  getServicesByCategory,
  getServiceMetadata,
  getAllServiceCategories,
};

/**
 * Usage Examples:
 * 
 * // Import specific services
 * import { DataSourceService, DashboardService } from './services';
 * 
 * // Import all services
 * import * as AnalyticsServices from './services';
 * 
 * // Get services by category
 * const dataServices = getServicesByCategory('Data Management');
 * 
 * // Get service metadata
 * const metadata = getServiceMetadata('DataSourceService');
 * 
 * // Service registry for dynamic loading
 * const serviceName = SERVICE_REGISTRY.DataSourceService;
 */
