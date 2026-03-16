'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Stub out auth context
const useAuth = () => ({ user: { organizationId: '123' } });
import { 
  Check, 
  X, 
  Users, 
  Crown, 
  Infinity, 
  Mail,
  BarChart3,
  Calendar,
  Database,
  Workflow,
  Shield,
  Sparkles
} from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29',
    period: '/month',
    icon: Users,
    color: 'gray',
    description: 'Perfect for getting started',
    maxUsers: 1,
    features: [
      { name: 'Basic CRM', included: true, icon: Check },
      { name: 'Document Storage (1GB)', included: true, icon: Check },
      { name: 'Mobile App Access', included: true, icon: Check },
      { name: 'Email Support', included: true, icon: Check },
      { name: 'Advanced Reporting', included: false, icon: X },
      { name: 'Email Campaigns', included: false, icon: X },
      { name: 'Calendar Integration', included: false, icon: X },
      { name: 'API Access', included: false, icon: X },
      { name: 'Custom Workflows', included: false, icon: X },
      { name: 'Priority Support', included: false, icon: X },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99',
    period: '/month',
    icon: Crown,
    color: 'purple',
    description: 'For growing teams',
    maxUsers: 10,
    popular: true,
    features: [
      { name: 'Everything in Basic', included: true, icon: Check },
      { name: 'Up to 10 Users', included: true, icon: Check },
      { name: 'Document Storage (10GB)', included: true, icon: Check },
      { name: 'Advanced Reporting', included: true, icon: BarChart3 },
      { name: 'Email Campaigns', included: true, icon: Mail },
      { name: 'Calendar Integration', included: true, icon: Calendar },
      { name: 'API Access', included: true, icon: Database },
      { name: 'Phone Support', included: true, icon: Check },
      { name: 'Custom Workflows', included: false, icon: X },
      { name: 'Priority Support', included: false, icon: X },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '$299',
    period: '/month',
    icon: Infinity,
    color: 'blue',
    description: 'For enterprise organizations',
    maxUsers: null,
    features: [
      { name: 'Everything in Premium', included: true, icon: Check },
      { name: 'Unlimited Users', included: true, icon: Infinity },
      { name: 'Unlimited Storage', included: true, icon: Check },
      { name: 'Custom Workflows', included: true, icon: Workflow },
      { name: 'Advanced Security (SSO, 2FA)', included: true, icon: Shield },
      { name: 'White Label', included: true, icon: Sparkles },
      { name: 'Priority Support (24/7)', included: true, icon: Check },
      { name: 'Dedicated Account Manager', included: true, icon: Check },
      { name: 'Custom Integrations', included: true, icon: Check },
      { name: 'SLA Guarantee', included: true, icon: Check },
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current plan from API
    if (user?.organizationId) {
      fetchCurrentPlan();
    }
  }, [user]);

  const fetchCurrentPlan = async () => {
    // In real implementation, fetch from API
    setCurrentPlan('basic');
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // In real implementation, call API to initiate upgrade
      const response = await fetch(`/api/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          organizationId: user?.organizationId,
          newPlan: planId,
        }),
      });

      if (response.ok) {
        alert(`Successfully upgraded to ${planId}!`);
        setCurrentPlan(planId);
      } else {
        alert('Upgrade failed. Please contact support.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('An error occurred during upgrade.');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-300',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-300',
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-300',
      },
    };
    return colors[color]?.[variant] || '';
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">Select the perfect plan for your business</p>
      </div>

      {/* Current Plan Banner */}
      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            You're currently on the <strong className="capitalize">{currentPlan}</strong> plan
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          const canUpgrade = !isCurrentPlan;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-purple-500 border-2 shadow-xl' : ''
              } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Current Plan
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className={`w-16 h-16 ${getColorClasses(plan.color, 'bg')} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-8 w-8 ${getColorClasses(plan.color, 'text')}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {plan.maxUsers === null ? (
                    <span className="flex items-center justify-center gap-1">
                      <Infinity className="h-4 w-4" />
                      Unlimited Users
                    </span>
                  ) : (
                    <span>Up to {plan.maxUsers} user{plan.maxUsers > 1 ? 's' : ''}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <li key={idx} className="flex items-center gap-2">
                        {feature.included ? (
                          <FeatureIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Downgrade Not Available
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Additional Info */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Can I change plans later?</h3>
            <p className="text-sm text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">What happens when I reach my user limit?</h3>
            <p className="text-sm text-gray-600">
              You'll need to upgrade to a higher tier to add more users. Don't worry, we'll notify you before you hit the limit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Is there a free trial?</h3>
            <p className="text-sm text-gray-600">
              Yes! All new accounts start with a 14-day free trial of the Premium plan. No credit card required.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Need a custom plan?</h3>
            <p className="text-sm text-gray-600">
              Contact our sales team at sales@cognexiaai.com for enterprise plans with custom features and pricing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
