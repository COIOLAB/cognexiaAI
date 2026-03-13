'use client';

import { useEffect } from 'react';
import { FeatureGuard, UpgradePrompt } from '@/components/guards/FeatureGuard';
// Temporary: stub out missing dependencies
const FEATURES = {
  ADVANCED_REPORTING: 'advanced_reporting',
  EMAIL_CAMPAIGNS: 'email_campaigns',
  CALENDAR_INTEGRATION: 'calendar_integration',
  CUSTOM_WORKFLOWS: 'custom_workflows',
};
const trackPageView = (page: string) => console.log('Track page:', page);
const trackFeatureUsage = (feature: string, action: string) => console.log('Track feature:', feature, action);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Mail, 
  Calendar,
  Workflow,
  Shield,
  Crown
} from 'lucide-react';

export default function DashboardPage() {
  useEffect(() => {
    // Track page view
    trackPageView('Dashboard');
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to your CRM dashboard</p>
      </div>

      {/* Always Visible - Basic Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts
            </CardTitle>
            <CardDescription>Manage your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
            <p className="text-sm text-gray-500">Total contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Your stored files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">42</p>
            <p className="text-sm text-gray-500">Total documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Leads
            </CardTitle>
            <CardDescription>Track your leads</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">89</p>
            <p className="text-sm text-gray-500">Active leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Feature - Advanced Reporting */}
      <FeatureGuard
        feature={FEATURES.ADVANCED_REPORTING}
        fallback={
          <UpgradePrompt 
            feature="Advanced Reporting & Analytics" 
            tier="premium" 
          />
        }
      >
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Advanced Analytics
              <Crown className="h-4 w-4 text-purple-600 ml-auto" />
            </CardTitle>
            <CardDescription>Deep insights into your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">24.5%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold text-green-600">+18%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer LTV</p>
                <p className="text-2xl font-bold text-blue-600">$4,230</p>
              </div>
            </div>
            <button 
              onClick={() => {
                trackFeatureUsage(FEATURES.ADVANCED_REPORTING, 'accessed');
                window.location.href = '/reports/advanced';
              }}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              View Detailed Reports
            </button>
          </CardContent>
        </Card>
      </FeatureGuard>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Premium Feature - Email Campaigns */}
        <FeatureGuard
          feature={FEATURES.EMAIL_CAMPAIGNS}
          fallback={
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-5 w-5" />
                  Email Campaigns
                  <Crown className="h-4 w-4 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpgradePrompt feature="Email Campaigns" tier="premium" />
              </CardContent>
            </Card>
          }
        >
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
                <Crown className="h-4 w-4 text-purple-600 ml-auto" />
              </CardTitle>
              <CardDescription>Automate your marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Campaigns</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sent</span>
                  <span className="font-bold">12,450</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Rate</span>
                  <span className="font-bold text-green-600">34.2%</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  trackFeatureUsage(FEATURES.EMAIL_CAMPAIGNS, 'accessed');
                  window.location.href = '/marketing/campaigns';
                }}
                className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Manage Campaigns
              </button>
            </CardContent>
          </Card>
        </FeatureGuard>

        {/* Premium Feature - Calendar Integration */}
        <FeatureGuard
          feature={FEATURES.CALENDAR_INTEGRATION}
          fallback={
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-5 w-5" />
                  Calendar Sync
                  <Crown className="h-4 w-4 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpgradePrompt feature="Calendar Integration" tier="premium" />
              </CardContent>
            </Card>
          }
        >
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar Sync
                <Crown className="h-4 w-4 text-purple-600 ml-auto" />
              </CardTitle>
              <CardDescription>Sync with Google & Outlook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Google Calendar: Connected</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Outlook: Connected</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  trackFeatureUsage(FEATURES.CALENDAR_INTEGRATION, 'accessed');
                  window.location.href = '/settings/calendar';
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage Calendars
              </button>
            </CardContent>
          </Card>
        </FeatureGuard>
      </div>

      {/* Advanced Feature - Custom Workflows */}
      <FeatureGuard
        feature={FEATURES.CUSTOM_WORKFLOWS}
        fallback={
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-400">
                <Workflow className="h-5 w-5" />
                Custom Workflows
                <Shield className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpgradePrompt feature="Custom Workflows & Automation" tier="advanced" />
            </CardContent>
          </Card>
        }
      >
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-600" />
              Custom Workflows
              <Shield className="h-4 w-4 text-blue-600 ml-auto" />
            </CardTitle>
            <CardDescription>Automate your business processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lead Assignment Workflow</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Auto-assign leads based on territory</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Follow-up Automation</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Send automated follow-ups after 3 days</p>
              </div>
            </div>
            <button 
              onClick={() => {
                trackFeatureUsage(FEATURES.CUSTOM_WORKFLOWS, 'accessed');
                window.location.href = '/workflows/builder';
              }}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New Workflow
            </button>
          </CardContent>
        </Card>
      </FeatureGuard>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Features</CardTitle>
          <CardDescription>See what's included in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Basic CRM Features</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Document Storage (1GB)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Advanced Reporting (Premium)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Email Campaigns (Premium)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Custom Workflows (Advanced)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Priority Support (Advanced)</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/settings/subscription'}
            className="mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View All Features & Upgrade
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
