/**
 * Analytics & Telemetry System
 * Sends usage data from Client Admin Portal to Super Admin Portal
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getUserData() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Track user activity
 */
export async function trackActivity(event: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}) {
  try {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) return;

    await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: user.organizationId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        ...event,
      }),
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, metadata?: Record<string, any>) {
  trackActivity({
    action: 'page_view',
    category: 'navigation',
    label: pageName,
    metadata,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, action: string = 'used') {
  trackActivity({
    action,
    category: 'feature',
    label: featureName,
  });
}

/**
 * Track user creation
 */
export function trackUserCreated(userId: string) {
  trackActivity({
    action: 'create',
    category: 'user',
    label: userId,
  });
}

/**
 * Track document upload
 */
export function trackDocumentUpload(fileSize: number, fileType: string) {
  trackActivity({
    action: 'upload',
    category: 'document',
    value: fileSize,
    metadata: { fileType },
  });
}

/**
 * Track API call (for API Access feature)
 */
export function trackAPICall(endpoint: string, method: string, statusCode: number) {
  trackActivity({
    action: 'api_call',
    category: 'api',
    label: `${method} ${endpoint}`,
    value: statusCode,
  });
}

/**
 * Track custom workflow execution (for Custom Workflows feature)
 */
export function trackWorkflowExecution(workflowId: string, success: boolean) {
  trackActivity({
    action: 'execute',
    category: 'workflow',
    label: workflowId,
    value: success ? 1 : 0,
  });
}

/**
 * Send usage statistics (called periodically or on demand)
 */
export async function sendUsageStatistics() {
  try {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) return;

    // Gather usage stats from localStorage or session storage
    const stats = {
      organizationId: user.organizationId,
      userId: user.id,
      sessionDuration: getSessionDuration(),
      pagesVisited: getVisitedPages(),
      featuresUsed: getUsedFeatures(),
      activeUsers: await getActiveUsersCount(),
      storageUsed: await getStorageUsage(),
      apiCallsCount: getAPICallsCount(),
    };

    await fetch(`${API_BASE_URL}/analytics/usage-stats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });
  } catch (error) {
    console.error('Failed to send usage statistics:', error);
  }
}

// Helper functions for gathering stats
function getSessionDuration(): number {
  const sessionStart = sessionStorage.getItem('sessionStart');
  if (!sessionStart) {
    sessionStorage.setItem('sessionStart', Date.now().toString());
    return 0;
  }
  return Date.now() - parseInt(sessionStart);
}

function getVisitedPages(): string[] {
  const pages = sessionStorage.getItem('visitedPages');
  return pages ? JSON.parse(pages) : [];
}

function getUsedFeatures(): string[] {
  const features = sessionStorage.getItem('usedFeatures');
  return features ? JSON.parse(features) : [];
}

async function getActiveUsersCount(): Promise<number> {
  // This would call your users API
  try {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) return 0;

    const response = await fetch(
      `${API_BASE_URL}/organizations/${user.organizationId}/users/active-count`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

async function getStorageUsage(): Promise<number> {
  // This would call your storage API
  try {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) return 0;

    const response = await fetch(
      `${API_BASE_URL}/organizations/${user.organizationId}/storage/usage`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return 0;
    const data = await response.json();
    return data.usedBytes || 0;
  } catch {
    return 0;
  }
}

function getAPICallsCount(): number {
  const count = sessionStorage.getItem('apiCallsCount');
  return count ? parseInt(count) : 0;
}

/**
 * Initialize telemetry system
 * Call this once when the app loads
 */
export function initTelemetry() {
  if (typeof window === 'undefined') return;

  // Track page views automatically
  if ('navigation' in window.performance) {
    const pageName = window.location.pathname;
    trackPageView(pageName);
  }

  // Send usage stats every 5 minutes
  setInterval(() => {
    sendUsageStatistics();
  }, 5 * 60 * 1000); // 5 minutes

  // Send stats before page unload
  window.addEventListener('beforeunload', () => {
    sendUsageStatistics();
  });
}
