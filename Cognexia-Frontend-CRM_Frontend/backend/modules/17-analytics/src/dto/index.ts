/**
 * Analytics DTOs Index
 * Exports all analytics-related DTOs and interfaces
 */

// Main DTOs
export * from './analytics.dto';
export * from './analytics-advanced.dto';

// Base interfaces and response types
export type {
  AnalyticsApiResponse,
  PaginationMetadata,
  PaginatedAnalyticsResponse,
} from './analytics.dto';

// Data Source DTOs
export {
  CreateDataSourceDto,
  UpdateDataSourceDto,
  DataSourceDto,
  TestDataSourceConnectionDto,
  DataSourceConnectionResultDto,
} from './analytics.dto';

// Dataset DTOs
export {
  CreateDatasetDto,
  UpdateDatasetDto,
  DatasetDto,
  DataPreviewDto,
  DataPreviewResultDto,
} from './analytics.dto';

// Dashboard DTOs
export {
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardDto,
  CreateDashboardWidgetDto,
  UpdateDashboardWidgetDto,
  DashboardWidgetDto,
} from './analytics.dto';

// Analytics Query DTOs
export {
  CreateAnalyticsQueryDto,
  UpdateAnalyticsQueryDto,
  AnalyticsQueryDto,
  ExecuteQueryDto,
  QueryExecutionResultDto,
} from './analytics.dto';

// Machine Learning DTOs
export {
  CreateMLModelDto,
  UpdateMLModelDto,
  MLModelDto,
  TrainMLModelDto,
  CreateMLPredictionDto,
  MLPredictionDto,
} from './analytics.dto';

// Reporting DTOs
export {
  CreateReportDto,
  UpdateReportDto,
  ReportDto,
  GenerateReportDto,
  ReportGenerationDto,
} from './analytics-advanced.dto';

// Insights DTOs
export {
  CreateInsightDto,
  AnalyticsInsightDto,
} from './analytics-advanced.dto';

// Anomaly Detection DTOs
export {
  CreateAnomalyDto,
  UpdateAnomalyDto,
  AnomalyDto,
} from './analytics-advanced.dto';

// Filter and Search DTOs
export {
  AnalyticsFilterDto,
  DataExplorationDto,
  DataExplorationResultDto,
} from './analytics-advanced.dto';

// Advanced Analytics DTOs
export {
  TimeSeriesAnalysisDto,
  TimeSeriesResultDto,
  StatisticalTestDto,
  StatisticalTestResultDto,
} from './analytics-advanced.dto';

// Real-time Analytics DTOs
export {
  RealTimeStreamDto,
  RealTimeMetricsDto,
} from './analytics-advanced.dto';
