'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Mail, 
  Calendar, 
  Database,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface OrganizationFeature {
  key: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  enabled: boolean;
  tier: 'basic' | 'premium' | 'advanced';
}

interface OrganizationFeaturesManagerProps {
  organizationId: string;
  organizationName: string;
  currentTier: 'basic' | 'premium' | 'advanced';
  onUpdate?: () => void;
}

const AVAILABLE_FEATURES: Omit<OrganizationFeature, 'enabled'>[] = [
  // Basic Features (included in all tiers)
  { key: 'crm_basic', name: 'Basic CRM', description: 'Contacts, leads, and opportunities', icon: Users, category: 'CRM', tier: 'basic' },
  { key: 'documents_basic', name: 'Document Storage', description: '1GB storage', icon: FileText, category: 'Documents', tier: 'basic' },
  
  // Premium Features
  { key: 'advanced_reporting', name: 'Advanced Reporting', description: 'Custom reports and dashboards', icon: BarChart3, category: 'Analytics', tier: 'premium' },
  { key: 'email_campaigns', name: 'Email Campaigns', description: 'Marketing automation', icon: Mail, category: 'Marketing', tier: 'premium' },
  { key: 'calendar_integration', name: 'Calendar Integration', description: 'Sync with Google Calendar, Outlook', icon: Calendar, category: 'Integration', tier: 'premium' },
  { key: 'api_access', name: 'API Access', description: 'RESTful API for integrations', icon: Database, category: 'Developer', tier: 'premium' },
  
  // Advanced Features
  { key: 'custom_workflows', name: 'Custom Workflows', description: 'Build custom automation', icon: Zap, category: 'Automation', tier: 'advanced' },
  { key: 'advanced_security', name: 'Advanced Security', description: 'SSO, 2FA, audit logs', icon: Shield, category: 'Security', tier: 'advanced' },
  { key: 'white_label', name: 'White Label', description: 'Custom branding', icon: CheckCircle2, category: 'Branding', tier: 'advanced' },
  { key: 'priority_support', name: 'Priority Support', description: '24/7 dedicated support', icon: Users, category: 'Support', tier: 'advanced' },
];

export function OrganizationFeaturesManager({
  organizationId,
  organizationName,
  currentTier,
  onUpdate,
}: OrganizationFeaturesManagerProps) {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<OrganizationFeature[]>([]);

  useEffect(() => {
    loadFeatures();
  }, [organizationId]);

  const loadFeatures = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/organizations/${organizationId}/features`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeatures(data.features || []);
      } else {
        // Initialize with defaults based on tier
        initializeFeatures();
      }
    } catch (error) {
      console.error('Error loading features:', error);
      initializeFeatures();
    }
  };

  const initializeFeatures = () => {
    const tierRank = { basic: 1, premium: 2, advanced: 3 };
    const currentTierRank = tierRank[currentTier];

    const initializedFeatures = AVAILABLE_FEATURES.map(feature => ({
      ...feature,
      enabled: tierRank[feature.tier] <= currentTierRank,
    }));

    setFeatures(initializedFeatures);
  };

  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/organizations/${organizationId}/features`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          featureKey,
          enabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to update feature');

      setFeatures(prev =>
        prev.map(f =>
          f.key === featureKey ? { ...f, enabled } : f
        )
      );

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating feature:', error);
      toast.error('Failed to update feature');
      
      // Revert state on error
      setFeatures(prev =>
        prev.map(f =>
          f.key === featureKey ? { ...f, enabled: !enabled } : f
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, OrganizationFeature[]>);

  const getFeatureIcon = (featureKey: string) => {
    const iconMap: Record<string, any> = {
      'crm_basic': Users,
      'documents_basic': FileText,
      'advanced_reporting': BarChart3,
      'email_campaigns': Mail,
      'calendar_integration': Calendar,
      'api_access': Database,
      'custom_workflows': Zap,
      'advanced_security': Shield,
      'white_label': CheckCircle2,
      'priority_support': Users,
    };
    return iconMap[featureKey] || Users;
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Feature Management</CardTitle>
            <CardDescription>
              Enable or disable features for {organizationName}
            </CardDescription>
          </div>
          <Badge className={getTierBadgeColor(currentTier)}>
            {currentTier.toUpperCase()} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category}>
            <h3 className="font-semibold text-lg mb-3">{category}</h3>
            <div className="space-y-3">
              {categoryFeatures.map((feature) => {
                const Icon = getFeatureIcon(feature.key);
                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">{feature.name}</Label>
                          <Badge 
                            variant="outline" 
                            className={getTierBadgeColor(feature.tier)}
                          >
                            {feature.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(checked) => toggleFeature(feature.key, checked)}
                      disabled={loading}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Feature changes take effect immediately. Users in the client portal will see updated features on their next login or page refresh.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
