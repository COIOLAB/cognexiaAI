/**
 * Feature Access Control System
 * Checks if the current organization has access to specific features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Check if organization has access to a specific feature
 */
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found');
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}/features/check/${featureKey}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache feature checks
      }
    );

    if (!response.ok) {
      console.error(`Feature check failed: ${response.status}`);
      return false; // Fail closed - deny access on error
    }

    const data = await response.json();
    return data.hasAccess === true;
  } catch (error) {
    console.error('Feature check error:', error);
    return false; // Fail closed
  }
}

/**
 * Check if organization can add more users
 */
export async function checkCanAddUser(organizationId: string): Promise<{
  canAdd: boolean;
  reason?: string;
  currentUsers?: number;
  maxUsers?: number;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { canAdd: false, reason: 'Not authenticated' };
    }

    const response = await fetch(
      `${API_BASE_URL}/user-tiers/organization/${organizationId}/can-add-user`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { canAdd: false, reason: 'Failed to check user limit' };
    }

    return await response.json();
  } catch (error) {
    console.error('User limit check error:', error);
    return { canAdd: false, reason: 'Error checking user limit' };
  }
}

/**
 * Get all features for the organization
 */
export async function getOrganizationFeatures(organizationId: string) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch features');

    return await response.json();
  } catch (error) {
    console.error('Get features error:', error);
    return { features: [] };
  }
}

/**
 * Feature keys available in the system
 */
export const FEATURES = {
  // Basic features
  CRM_BASIC: 'crm_basic',
  DOCUMENTS_BASIC: 'documents_basic',
  
  // Premium features
  ADVANCED_REPORTING: 'advanced_reporting',
  EMAIL_CAMPAIGNS: 'email_campaigns',
  CALENDAR_INTEGRATION: 'calendar_integration',
  API_ACCESS: 'api_access',
  
  // Advanced features
  CUSTOM_WORKFLOWS: 'custom_workflows',
  ADVANCED_SECURITY: 'advanced_security',
  WHITE_LABEL: 'white_label',
  PRIORITY_SUPPORT: 'priority_support',
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];
