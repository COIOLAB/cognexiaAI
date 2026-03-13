'use client';

import { ReactNode } from 'react';

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * FeatureGuard Component - Simplified version
 * Currently allows all features (implement feature checking as needed)
 */
export function FeatureGuard({ 
  children, 
}: FeatureGuardProps) {
  // Simplified: always allow access
  // TODO: Implement proper feature access checking when auth context is available
  return <>{children}</>;
}

/**
 * UpgradePrompt Component
 * Default fallback for locked features
 */
interface UpgradePromptProps {
  feature?: string;
  tier?: 'premium' | 'advanced';
}

export function UpgradePrompt({ 
  feature = 'this feature',
  tier = 'premium'
}: UpgradePromptProps) {
  return (
    <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {feature} is not available in your current plan. 
          Upgrade to unlock this feature.
        </p>
        <button
          onClick={() => {
            // Navigate to upgrade page or contact admin
            window.location.href = '/settings/subscription';
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Upgrade Options
        </button>
      </div>
    </div>
  );
}
