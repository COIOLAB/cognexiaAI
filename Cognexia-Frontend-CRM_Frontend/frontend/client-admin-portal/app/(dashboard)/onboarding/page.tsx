'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  useStartOnboarding,
  useGetCurrentSession,
  useCompleteStep,
  useSkipStep,
  useCompleteChecklistItem,
  useRequestHelp,
  useSubmitFeedback,
  useClaimReward,
} from '@/hooks/useOnboarding';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Rocket, Users, Settings, BarChart, HelpCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Welcome to CognexiaAI CRM',
    icon: Rocket,
  },
  {
    id: 'profile',
    title: 'Company Profile',
    description: 'Set up your company profile',
    icon: Settings,
  },
  {
    id: 'team',
    title: 'Invite Team',
    description: 'Invite your team members',
    icon: Users,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Tour',
    description: 'Explore your dashboard',
    icon: BarChart,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);

  // Hooks
  const startOnboarding = useStartOnboarding();
  const { data: session, isLoading } = useGetCurrentSession('ORGANIZATION');
  const completeStep = useCompleteStep();
  const skipStep = useSkipStep();
  const completeChecklistItem = useCompleteChecklistItem();
  const requestHelp = useRequestHelp();
  const submitFeedback = useSubmitFeedback();
  const claimReward = useClaimReward();

  useEffect(() => {
    if (!session && !isLoading) {
      startOnboarding.mutate({ type: 'ORGANIZATION', metadata: {} });
    }
  }, [session, isLoading]);

  useEffect(() => {
    if (session) {
      setCurrentStepIndex(session.currentStep || 0);
    }
  }, [session]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = session ? session.progress : 0;

  const handleNext = async () => {
    if (!session) return;

    await completeStep.mutateAsync({
      sessionId: session.id,
      dto: {
        stepId: currentStep.id,
        stepData: stepData[currentStep.id],
      },
    });

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowFeedback(true);
    }
  };

  const handleSkip = async () => {
    if (!session) return;

    await skipStep.mutateAsync({
      sessionId: session.id,
      dto: {
        stepId: currentStep.id,
        reason: 'User skipped',
      },
    });

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleChecklistItemToggle = async (itemId: string) => {
    if (!session) return;
    await completeChecklistItem.mutateAsync({
      sessionId: session.id,
      dto: { itemId },
    });
  };

  const handleRequestHelp = async (message: string) => {
    if (!session) return;
    await requestHelp.mutateAsync({
      sessionId: session.id,
      dto: {
        stepId: currentStep.id,
        message,
      },
    });
    setShowHelp(false);
  };

  const handleSubmitFeedback = async () => {
    if (!session) return;
    await submitFeedback.mutateAsync({
      sessionId: session.id,
      dto: {
        rating,
        feedback: stepData.feedback,
      },
    });
    router.push('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Rocket className="h-24 w-24 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">Welcome to CognexiaAI CRM!</h2>
            <p className="text-center text-muted-foreground">
              Let's get you set up in just a few minutes. We'll help you configure your account and get started with your CRM.
            </p>
            <div className="space-y-2">
              <Label>What features are you interested in?</Label>
              <div className="space-y-2">
                {['CRM', 'Sales', 'Support', 'Marketing', 'Analytics'].map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={stepData.welcome?.features?.includes(feature)}
                      onCheckedChange={(checked) => {
                        const features = stepData.welcome?.features || [];
                        setStepData({
                          ...stepData,
                          welcome: {
                            ...stepData.welcome,
                            features: checked
                              ? [...features, feature]
                              : features.filter((f: string) => f !== feature),
                          },
                        });
                      }}
                    />
                    <label htmlFor={feature} className="text-sm cursor-pointer">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Company Profile</h2>
            <p className="text-muted-foreground">Tell us about your company</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={stepData.profile?.companyName || ''}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      profile: { ...stepData.profile, companyName: e.target.value },
                    })
                  }
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={stepData.profile?.industry || ''}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      profile: { ...stepData.profile, industry: e.target.value },
                    })
                  }
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Input
                  id="companySize"
                  value={stepData.profile?.companySize || ''}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      profile: { ...stepData.profile, companySize: e.target.value },
                    })
                  }
                  placeholder="10-50 employees"
                />
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Invite Your Team</h2>
            <p className="text-muted-foreground">Collaborate with your team members</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses (comma-separated)</Label>
                <Textarea
                  id="emails"
                  value={stepData.team?.emails || ''}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      team: { ...stepData.team, emails: e.target.value },
                    })
                  }
                  placeholder="john@example.com, jane@example.com"
                  rows={4}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You can skip this step and invite team members later from Settings.
              </p>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dashboard Tour</h2>
            <p className="text-muted-foreground">Here's what you can do with CognexiaAI CRM</p>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session?.checklistItems?.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleChecklistItemToggle(item.id)}
                        />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Manage Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track customer information, interactions, and history
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sales Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage leads and opportunities through your sales pipeline
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>🎉 Congratulations!</CardTitle>
            <CardDescription>You've completed the onboarding process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>How was your onboarding experience?</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Any additional feedback? (Optional)</Label>
              <Textarea
                id="feedback"
                value={stepData.feedback || ''}
                onChange={(e) => setStepData({ ...stepData, feedback: e.target.value })}
                placeholder="Tell us about your experience..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitFeedback} disabled={rating === 0} className="w-full">
              Complete Onboarding
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Getting Started</h1>
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Help?
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% Complete</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {ONBOARDING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isCurrent
                        ? 'border-primary text-primary'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center max-w-[80px] ${
                      isCurrent ? 'font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
        <Separator />
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext} disabled={completeStep.isPending}>
              {currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Tell us how we can assist you</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe what you need help with..."
                rows={4}
                value={stepData.helpMessage || ''}
                onChange={(e) => setStepData({ ...stepData, helpMessage: e.target.value })}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowHelp(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleRequestHelp(stepData.helpMessage || '')}
                disabled={!stepData.helpMessage}
              >
                Send Request
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
