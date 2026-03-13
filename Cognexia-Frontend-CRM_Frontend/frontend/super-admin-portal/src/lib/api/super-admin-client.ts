import axios, { AxiosInstance } from 'axios';

// Use same base URL and auth as main api-client for backend consistency
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - use access_token (matches api-client)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - don't redirect on 401 if we have hash auth (MFA flow)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isReceivingAuth = typeof window !== 'undefined' && window.location.hash.startsWith('#auth=');
      if (!isReceivingAuth) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== FEATURE 1: Platform Analytics =====
export const platformAnalyticsAPI = {
  getOverview: async () => {
    const response = await apiClient.get('/platform-analytics/overview');
    return response.data;
  },
  
  getGrowthTrends: async (params?: { period?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/platform-analytics/growth-trends', { params });
    return response.data;
  },
  
  getUsageMetrics: async () => {
    const response = await apiClient.get('/platform-analytics/usage-metrics');
    return response.data;
  },
  
  getRevenueBreakdown: async () => {
    const response = await apiClient.get('/platform-analytics/revenue-breakdown');
    return response.data;
  },
};

// ===== FEATURE 2: Revenue & Billing =====
export const revenueBillingAPI = {
  getOverview: async () => {
    const response = await apiClient.get('/revenue-billing/overview');
    return response.data;
  },
  
  getChurnAnalysis: async () => {
    const response = await apiClient.get('/revenue-billing/churn-analysis');
    return response.data;
  },
  
  getTransactions: async (params?: any) => {
    const response = await apiClient.get('/revenue-billing/transactions', { params });
    return response.data;
  },
  
  getFailedPayments: async () => {
    const response = await apiClient.get('/revenue-billing/failed-payments');
    return response.data;
  },
  
  retryPayment: async (transactionId: string) => {
    const response = await apiClient.post(`/revenue-billing/retry-payment/${transactionId}`);
    return response.data;
  },
  
  processRefund: async (transactionId: string, reason: string) => {
    const response = await apiClient.post(`/revenue-billing/refund/${transactionId}`, { reason });
    return response.data;
  },
};

// ===== FEATURE 3: Organization Health =====
export const organizationHealthAPI = {
  getHealthScores: async (params?: any) => {
    const response = await apiClient.get('/organization-health/scores', { params });
    return response.data;
  },
  
  getHealthSummary: async () => {
    const response = await apiClient.get('/organization-health/summary');
    return response.data;
  },
  
  getInactiveOrganizations: async () => {
    const response = await apiClient.get('/organization-health/inactive');
    return response.data;
  },
  
  calculateHealthScore: async (organizationId: string) => {
    const response = await apiClient.post(`/organization-health/calculate/${organizationId}`);
    return response.data;
  },
  
  recalculateAll: async () => {
    const response = await apiClient.post('/organization-health/recalculate-all');
    return response.data;
  },
};

// ===== FEATURE 4: User Impersonation =====
export const userImpersonationAPI = {
  impersonateUser: async (data: { targetUserId: string; reason: string }) => {
    const response = await apiClient.post('/user-impersonation/impersonate', data);
    return response.data;
  },
  
  endImpersonation: async (sessionId: string) => {
    const response = await apiClient.post(`/user-impersonation/end/${sessionId}`);
    return response.data;
  },
  
  getActiveSessions: async () => {
    const response = await apiClient.get('/user-impersonation/active');
    return response.data;
  },
  
  searchUsers: async (params?: any) => {
    const response = await apiClient.get('/user-impersonation/search-users', { params });
    return response.data;
  },
  
  performBulkAction: async (data: { userIds: string[]; action: string; reason?: string }) => {
    const response = await apiClient.post('/user-impersonation/bulk-action', data);
    return response.data;
  },
  
  forceLogout: async (data: { userId: string; reason?: string }) => {
    const response = await apiClient.post('/user-impersonation/force-logout', data);
    return response.data;
  },
};

// ===== FEATURE 5: Security & Compliance =====
export const securityComplianceAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/security-compliance/dashboard');
    return response.data;
  },
  
  getEvents: async (params?: any) => {
    const response = await apiClient.get('/security-compliance/events', { params });
    return response.data;
  },
  
  resolveEvent: async (data: { eventId: string; resolutionNotes: string; resolvedBy: string }) => {
    const response = await apiClient.post('/security-compliance/events/resolve', data);
    return response.data;
  },
  
  blockIP: async (data: { ipAddress: string; reason: string; expiresAt?: string }) => {
    const response = await apiClient.post('/security-compliance/ip-blocklist/add', data);
    return response.data;
  },
  
  unblockIP: async (ip: string) => {
    const response = await apiClient.post(`/security-compliance/ip-blocklist/remove/${ip}`);
    return response.data;
  },
  
  getBlockedIPs: async () => {
    const response = await apiClient.get('/security-compliance/ip-blocklist');
    return response.data;
  },
  
  getComplianceReport: async (organizationId?: string) => {
    const response = await apiClient.get('/security-compliance/compliance-report', {
      params: { organizationId },
    });
    return response.data;
  },
  
  runComplianceCheck: async (data: { organizationId?: string; standard: string }) => {
    const response = await apiClient.post('/security-compliance/compliance/run-check', data);
    return response.data;
  },
  
  getMFAStatus: async () => {
    const response = await apiClient.get('/security-compliance/mfa-status');
    return response.data;
  },
};

// ===== FEATURE 6: Feature Usage Analytics =====
export const featureUsageAPI = {
  getAdoptionRates: async () => {
    const response = await apiClient.get('/feature-usage/adoption-rates');
    return response.data;
  },
  
  getUsageByTier: async () => {
    const response = await apiClient.get('/feature-usage/usage-by-tier');
    return response.data;
  },
  
  getUserJourney: async () => {
    const response = await apiClient.get('/feature-usage/user-journey');
    return response.data;
  },
};

// ===== FEATURE 7: Support Tickets =====
export const supportTicketsAPI = {
  getAllTickets: async (status?: string) => {
    const response = await apiClient.get('/admin-support-tickets', { params: { status } });
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/admin-support-tickets/stats');
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.post(`/admin-support-tickets/${id}/status`, { status });
    return response.data;
  },
  
  assignTicket: async (id: string, assignedTo: string) => {
    const response = await apiClient.post(`/admin-support-tickets/${id}/assign`, { assignedTo });
    return response.data;
  },
};

// ===== FEATURE 8: System Configuration =====
export const systemConfigAPI = {
  getAllConfigs: async () => {
    const response = await apiClient.get('/system-config/configs');
    return response.data;
  },
  
  getConfig: async (key: string) => {
    const response = await apiClient.get(`/system-config/configs/${key}`);
    return response.data;
  },
  
  updateConfig: async (key: string, value: string) => {
    const response = await apiClient.put(`/system-config/configs/${key}`, { value });
    return response.data;
  },
  
  getAllFeatureFlags: async () => {
    const response = await apiClient.get('/system-config/feature-flags');
    return response.data;
  },
  
  updateFeatureFlag: async (id: string, data: { enabled: boolean; rolloutPercentage?: number }) => {
    const response = await apiClient.put(`/system-config/feature-flags/${id}`, data);
    return response.data;
  },
};

// ===== FEATURE 9: Communication Center =====
export const communicationAPI = {
  createAnnouncement: async (data: any) => {
    const response = await apiClient.post('/communication/announcements', data);
    return response.data;
  },
  
  getAllAnnouncements: async () => {
    const response = await apiClient.get('/communication/announcements');
    return response.data;
  },
  
  deactivateAnnouncement: async (id: string) => {
    const response = await apiClient.post(`/communication/announcements/${id}/deactivate`);
    return response.data;
  },
  
  sendBulkEmail: async (data: any) => {
    const response = await apiClient.post('/communication/send-bulk-email', data);
    return response.data;
  },
};

// ===== FEATURE 10: Automation Workflows =====
export const automationWorkflowsAPI = {
  getAllWorkflows: async () => {
    const response = await apiClient.get('/automation-workflows');
    return response.data;
  },
  
  createWorkflow: async (data: any) => {
    const response = await apiClient.post('/automation-workflows', data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/automation-workflows/${id}/status`, { status });
    return response.data;
  },
  
  executeWorkflow: async (id: string) => {
    const response = await apiClient.post(`/automation-workflows/${id}/execute`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/automation-workflows/stats');
    return response.data;
  },
};

// ===== FEATURE 11: Custom Reporting =====
export const customReportingAPI = {
  getAllReports: async () => {
    const response = await apiClient.get('/custom-reports');
    return response.data;
  },
  
  createReport: async (data: any) => {
    const response = await apiClient.post('/custom-reports', data);
    return response.data;
  },
  
  runReport: async (id: string) => {
    const response = await apiClient.post(`/custom-reports/${id}/run`);
    return response.data;
  },
  
  deleteReport: async (id: string) => {
    const response = await apiClient.delete(`/custom-reports/${id}`);
    return response.data;
  },
};

// ===== FEATURE 12: Multi-Region =====
export const multiRegionAPI = {
  getOrganizationsByRegion: async () => {
    const response = await apiClient.get('/multi-region/organizations-by-region');
    return response.data;
  },
  
  getRegionalCompliance: async () => {
    const response = await apiClient.get('/multi-region/compliance');
    return response.data;
  },
  
  getRegionalPerformance: async () => {
    const response = await apiClient.get('/multi-region/performance');
    return response.data;
  },
};

// ===== FEATURE 13: Onboarding =====
export const onboardingAPI = {
  getProgress: async () => {
    const response = await apiClient.get('/onboarding/progress');
    return response.data;
  },
  
  bulkImport: async (data: any[]) => {
    const response = await apiClient.post('/onboarding/bulk-import', { data });
    return response.data;
  },
  
  migrate: async (data: { platform: string; credentials: any }) => {
    const response = await apiClient.post('/onboarding/migrate', data);
    return response.data;
  },
};

// ===== FEATURE 14: KPI Tracking =====
export const kpiTrackingAPI = {
  getAllGoals: async () => {
    const response = await apiClient.get('/kpi-goals');
    return response.data;
  },
  
  createGoal: async (data: any) => {
    const response = await apiClient.post('/kpi-goals', data);
    return response.data;
  },
  
  updateProgress: async (id: string, currentValue: number) => {
    const response = await apiClient.put(`/kpi-goals/${id}/progress`, { currentValue });
    return response.data;
  },
  
  getProgress: async () => {
    const response = await apiClient.get('/kpi-goals/progress');
    return response.data;
  },
};

// ===== FEATURE 15: A/B Testing =====
export const abTestingAPI = {
  getAllTests: async () => {
    const response = await apiClient.get('/ab-tests');
    return response.data;
  },
  
  createTest: async (data: any) => {
    const response = await apiClient.post('/ab-tests', data);
    return response.data;
  },
  
  startTest: async (id: string) => {
    const response = await apiClient.post(`/ab-tests/${id}/start`);
    return response.data;
  },
  
  getResults: async (id: string) => {
    const response = await apiClient.get(`/ab-tests/${id}/results`);
    return response.data;
  },
};

// ===== FEATURE 16: API Management =====
export const apiManagementAPI = {
  getAllAPIKeys: async () => {
    const response = await apiClient.get('/api-management/keys');
    return response.data;
  },
  
  createAPIKey: async (data: any) => {
    const response = await apiClient.post('/api-management/keys', data);
    return response.data;
  },
  
  revokeAPIKey: async (id: string) => {
    const response = await apiClient.post(`/api-management/keys/${id}/revoke`);
    return response.data;
  },
  
  getUsageStats: async () => {
    const response = await apiClient.get('/api-management/usage-stats');
    return response.data;
  },
  
  getEndpointAnalytics: async () => {
    const response = await apiClient.get('/api-management/endpoint-analytics');
    return response.data;
  },
};

// ===== FEATURE 17: Mobile Admin =====
export const mobileAdminAPI = {
  getTemplates: async () => {
    const response = await apiClient.get('/mobile-admin/notification-templates');
    return response.data;
  },
  
  sendNotification: async (data: { templateId: string; recipients: string[] }) => {
    const response = await apiClient.post('/mobile-admin/send-notification', data);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/mobile-admin/stats');
    return response.data;
  },
};

// ===== FEATURE 18: White Label =====
export const whiteLabelAPI = {
  getAllConfigs: async () => {
    const response = await apiClient.get('/white-label/configs');
    return response.data;
  },
  
  getConfig: async (organizationId: string) => {
    const response = await apiClient.get(`/white-label/configs/${organizationId}`);
    return response.data;
  },
  
  updateConfig: async (organizationId: string, data: any) => {
    const response = await apiClient.put(`/white-label/configs/${organizationId}`, data);
    return response.data;
  },
  
  deleteConfig: async (organizationId: string) => {
    const response = await apiClient.delete(`/white-label/configs/${organizationId}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/white-label/stats');
    return response.data;
  },
};

// ===== FEATURE 19: Predictive Analytics =====
export const predictiveAnalyticsAPI = {
  getChurnPredictions: async (filters?: any) => {
    const response = await apiClient.get('/predictive-analytics/churn-predictions', { params: filters });
    return response.data;
  },
  
  predictChurn: async (organizationId: string) => {
    const response = await apiClient.post(`/predictive-analytics/predict-churn/${organizationId}`);
    return response.data;
  },
  
  getRevenueForecast: async (type: string, months?: number) => {
    const response = await apiClient.get('/predictive-analytics/revenue-forecast', { params: { type, months } });
    return response.data;
  },
  
  getChurnSummary: async () => {
    const response = await apiClient.get('/predictive-analytics/churn-summary');
    return response.data;
  },
};

// ===== FEATURE 20: Recommendations =====
export const recommendationsAPI = {
  getAll: async (organizationId?: string) => {
    const response = await apiClient.get('/recommendations', { params: { organizationId } });
    return response.data;
  },
  
  generate: async (organizationId: string) => {
    const response = await apiClient.post(`/recommendations/generate/${organizationId}`);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string, reason?: string) => {
    const response = await apiClient.put(`/recommendations/${id}/status`, { status, dismissed_reason: reason });
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/recommendations/stats');
    return response.data;
  },
};

// ===== FEATURE 21: Natural Language Query =====
export const nlQueryAPI = {
  execute: async (queryText: string, queryType?: string) => {
    const response = await apiClient.post('/nl-query/execute', { query_text: queryText, query_type: queryType });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await apiClient.get('/nl-query/history');
    return response.data;
  },
  
  getSuggestions: async () => {
    const response = await apiClient.get('/nl-query/suggestions');
    return response.data;
  },
};

// ===== FEATURE 22: Anomaly Detection =====
export const anomalyAPI = {
  getAll: async (filters?: any) => {
    const response = await apiClient.get('/anomalies', { params: filters });
    return response.data;
  },
  
  detect: async () => {
    const response = await apiClient.post('/anomalies/detect');
    return response.data;
  },
  
  resolve: async (id: string, resolution: string, userId: string) => {
    const response = await apiClient.put(`/anomalies/${id}/resolve`, { resolution, userId });
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await apiClient.get('/anomalies/dashboard');
    return response.data;
  },
};

// ===== FEATURE 23-27: Additional APIs =====
export const healthV2API = {
  calculate: async (organizationId: string) => {
    const response = await apiClient.post(`/health-v2/calculate/${organizationId}`);
    return response.data;
  },
  
  getTrends: async (organizationId: string) => {
    const response = await apiClient.get(`/health-v2/trends/${organizationId}`);
    return response.data;
  },
};

export const dbConsoleAPI = {
  execute: async (query: string) => {
    const response = await apiClient.post('/db-console/execute', { query_text: query });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await apiClient.get('/db-console/history');
    return response.data;
  },
};

export const advancedAuditAPI = {
  searchLogs: async (filters?: any) => {
    const response = await apiClient.get('/audit/logs', { params: filters });
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/audit/stats');
    return response.data;
  },
};

export const performanceMonitorAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/performance/dashboard');
    return response.data;
  },
  
  getEndpoints: async () => {
    const response = await apiClient.get('/performance/endpoints');
    return response.data;
  },
  
  getSystemHealth: async () => {
    const response = await apiClient.get('/performance/system-health');
    return response.data;
  },
};

export const disasterRecoveryAPI = {
  createBackup: async (type: string) => {
    const response = await apiClient.post('/disaster-recovery/backup', { backup_type: type });
    return response.data;
  },
  
  getBackups: async () => {
    const response = await apiClient.get('/disaster-recovery/backups');
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/disaster-recovery/stats');
    return response.data;
  },
};

// ===== FEATURE 28-33: Financial & CS APIs =====
export const financialAdvancedAPI = {
  getCohortAnalysis: async (type?: string) => {
    const response = await apiClient.get('/financial-analytics/cohort-analysis', { params: { type } });
    return response.data;
  },
  
  getRevenueWaterfall: async (period: string) => {
    const response = await apiClient.get('/financial-analytics/revenue-waterfall', { params: { period } });
    return response.data;
  },
  
  getUnitEconomics: async () => {
    const response = await apiClient.get('/financial-analytics/unit-economics');
    return response.data;
  },
};

export const invoicesAPI = {
  getAll: async (organizationId?: string) => {
    const response = await apiClient.get('/invoices', { params: { organizationId } });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/invoices/${id}/status`, { status });
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/invoices/stats');
    return response.data;
  },
};

export const customerSuccessAPI = {
  getMilestones: async (organizationId?: string) => {
    const response = await apiClient.get('/customer-success/milestones', { params: { organizationId } });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/customer-success/milestones', data);
    return response.data;
  },
  
  getProgress: async () => {
    const response = await apiClient.get('/customer-success/progress');
    return response.data;
  },
};

export const supportAnalyticsAdvancedAPI = {
  getOverview: async () => {
    const response = await apiClient.get('/support-analytics/overview');
    return response.data;
  },
  
  getSentimentTrends: async () => {
    const response = await apiClient.get('/support-analytics/sentiment-trends');
    return response.data;
  },
};

export const devPortalAPI = {
  getSandboxes: async (organizationId?: string) => {
    const response = await apiClient.get('/developer-portal/sandboxes', { params: { organizationId } });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/developer-portal/sandboxes', data);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/developer-portal/stats');
    return response.data;
  },
};

export const releasesAPI = {
  getAll: async (environment?: string) => {
    const response = await apiClient.get('/releases', { params: { environment } });
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await apiClient.post('/releases', data);
    return response.data;
  },
  
  rollback: async (id: string) => {
    const response = await apiClient.post(`/releases/${id}/rollback`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/releases/stats');
    return response.data;
  },
};

export default apiClient;
