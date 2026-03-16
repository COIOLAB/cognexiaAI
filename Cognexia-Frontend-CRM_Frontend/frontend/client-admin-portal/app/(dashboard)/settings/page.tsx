'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Building2, Bell, Shield, Plug, CreditCard, Save } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [userPreferences, setUserPreferences] = useState({
    timezone: 'utc',
    language: 'en',
    notifications: {
      email: true,
      leadAssignments: true,
      dealUpdates: true,
      taskReminders: true,
      meetingNotifications: true,
      weeklyDigest: false,
    },
    security: {
      twoFactor: false,
      loginNotifications: true,
    },
  });

  const [organization, setOrganization] = useState({
    name: '',
    domain: '',
    address: '',
    industry: 'technology',
    companySize: '50-200',
  });

  const [organizationSettings, setOrganizationSettings] = useState({
    integrations: {
      googleWorkspace: false,
      microsoft365: false,
      slack: false,
      zapier: false,
      stripe: false,
    },
    billing: {
      planName: 'Enterprise Plan',
      billingAddress: '',
      billingEmail: '',
      paymentMethodLast4: '4242',
      paymentMethodExpiry: '12/2025',
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const meResponse = await apiClient.get('/auth/me');
        const me = meResponse.data?.data || meResponse.data;

        if (me?.id) {
          setUserId(me.id);
          const userResponse = await apiClient.get(`/users/${me.id}`);
          const user = userResponse.data?.data || userResponse.data;

          setProfile({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || me?.email || '',
            phoneNumber: user?.phoneNumber || '',
          });

          const preferences = user?.preferences || {};
          setUserPreferences((prev) => ({
            ...prev,
            ...preferences,
            notifications: {
              ...prev.notifications,
              ...(preferences.notifications || {}),
            },
            security: {
              ...prev.security,
              ...(preferences.security || {}),
            },
          }));
        }

        const orgResponse = await apiClient.get('/organizations/me/organization');
        const org = orgResponse.data?.data || orgResponse.data;

        if (org?.id) {
          setOrgId(org.id);
          setOrganization({
            name: org?.name || '',
            domain: org?.website || '',
            address: org?.address || '',
            industry: org?.metadata?.industry || 'technology',
            companySize: org?.metadata?.accountType || '50-200',
          });

          const settings = org?.settings || {};
          setOrganizationSettings((prev) => ({
            ...prev,
            ...settings,
            integrations: {
              ...prev.integrations,
              ...(settings.integrations || {}),
            },
            billing: {
              ...prev.billing,
              ...(settings.billing || {}),
            },
          }));
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveUser = async () => {
    if (!userId) return;
    setIsSavingUser(true);
    try {
      await apiClient.put(`/users/${userId}`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        preferences: userPreferences,
      });
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!orgId) return;
    setIsSavingOrg(true);
    try {
      await apiClient.put(`/organizations/${orgId}`, {
        name: organization.name,
        website: organization.domain,
        address: organization.address,
        industry: organization.industry,
        accountType: organization.companySize,
        settings: organizationSettings,
      });
      toast.success('Organization updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update organization');
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!userId) return;
    setIsSavingSecurity(true);
    try {
      if ((passwordForm.newPassword || passwordForm.confirmPassword) && !passwordForm.currentPassword) {
        toast.error('Current password is required');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (passwordForm.newPassword || passwordForm.confirmPassword) {
        await apiClient.post(`/users/${userId}/password`, {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password updated');
      }

      await apiClient.put(`/users/${userId}`, {
        preferences: userPreferences,
      });
      toast.success('Security settings updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update security');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const toggleIntegration = (key: keyof typeof organizationSettings.integrations) => {
    setOrganizationSettings((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: !prev.integrations[key],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* User Settings */}
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={profile.firstName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={profile.lastName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={profile.phoneNumber}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, phoneNumber: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={userPreferences.timezone}
                  onValueChange={(value) =>
                    setUserPreferences((prev) => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={userPreferences.language}
                  onValueChange={(value) =>
                    setUserPreferences((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveUser} disabled={isSavingUser || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Manage your organization information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Acme Corporation"
                  value={organization.name}
                  onChange={(event) =>
                    setOrganization((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDomain">Domain</Label>
                <Input
                  id="orgDomain"
                  placeholder="acme.com"
                  value={organization.domain}
                  onChange={(event) =>
                    setOrganization((prev) => ({ ...prev, domain: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgAddress">Address</Label>
                <Textarea
                  id="orgAddress"
                  rows={3}
                  placeholder="123 Main St, City, Country"
                  value={organization.address}
                  onChange={(event) =>
                    setOrganization((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={organization.industry}
                    onValueChange={(value) =>
                      setOrganization((prev) => ({ ...prev, industry: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={organization.companySize}
                    onValueChange={(value) =>
                      setOrganization((prev) => ({ ...prev, companySize: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveOrganization} disabled={isSavingOrg || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.email}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when leads are assigned to you
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.leadAssignments}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, leadAssignments: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deal Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about deal stage changes
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.dealUpdates}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, dealUpdates: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders for upcoming tasks
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.taskReminders}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskReminders: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Meeting Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified 15 minutes before meetings
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.meetingNotifications}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, meetingNotifications: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of activities
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyDigest: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveUser} disabled={isSavingUser || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.security.twoFactor}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        security: { ...prev.security, twoFactor: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new logins to your account
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences.security.loginNotifications}
                    onCheckedChange={(checked) =>
                      setUserPreferences((prev) => ({
                        ...prev,
                        security: { ...prev.security, loginNotifications: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={isSavingSecurity || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your CRM with other tools and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Google Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect Gmail, Calendar, and Drive
                    </p>
                  </div>
                  <Button
                    variant={organizationSettings.integrations.googleWorkspace ? 'secondary' : 'outline'}
                    onClick={() => toggleIntegration('googleWorkspace')}
                  >
                    {organizationSettings.integrations.googleWorkspace ? 'Connected' : 'Connect'}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Microsoft 365</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect Outlook, Teams, and OneDrive
                    </p>
                  </div>
                  <Button
                    variant={organizationSettings.integrations.microsoft365 ? 'secondary' : 'outline'}
                    onClick={() => toggleIntegration('microsoft365')}
                  >
                    {organizationSettings.integrations.microsoft365 ? 'Connected' : 'Connect'}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Slack</h4>
                    <p className="text-sm text-muted-foreground">
                      Get CRM notifications in Slack
                    </p>
                  </div>
                  <Button
                    variant={organizationSettings.integrations.slack ? 'secondary' : 'outline'}
                    onClick={() => toggleIntegration('slack')}
                  >
                    {organizationSettings.integrations.slack ? 'Connected' : 'Connect'}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Zapier</h4>
                    <p className="text-sm text-muted-foreground">
                      Automate workflows with 5000+ apps
                    </p>
                  </div>
                  <Button
                    variant={organizationSettings.integrations.zapier ? 'secondary' : 'outline'}
                    onClick={() => toggleIntegration('zapier')}
                  >
                    {organizationSettings.integrations.zapier ? 'Connected' : 'Connect'}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Stripe</h4>
                    <p className="text-sm text-muted-foreground">
                      Payment processing integration
                    </p>
                  </div>
                  <Button
                    variant={organizationSettings.integrations.stripe ? 'secondary' : 'outline'}
                    onClick={() => toggleIntegration('stripe')}
                  >
                    {organizationSettings.integrations.stripe ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveOrganization} disabled={isSavingOrg || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Integrations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your billing information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      {organizationSettings.billing.planName} - $299/month
                    </p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8" />
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {organizationSettings.billing.paymentMethodLast4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {organizationSettings.billing.paymentMethodExpiry}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost">Update</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Billing Address</Label>
                <Textarea
                  rows={3}
                  placeholder="123 Main St, City, Country"
                  value={organizationSettings.billing.billingAddress}
                  onChange={(event) =>
                    setOrganizationSettings((prev) => ({
                      ...prev,
                      billing: { ...prev.billing, billingAddress: event.target.value },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Billing Email</Label>
                <Input
                  type="email"
                  placeholder="billing@example.com"
                  value={organizationSettings.billing.billingEmail}
                  onChange={(event) =>
                    setOrganizationSettings((prev) => ({
                      ...prev,
                      billing: { ...prev.billing, billingEmail: event.target.value },
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Invoices will be sent to this email address
                </p>
              </div>

              <Button onClick={handleSaveOrganization} disabled={isSavingOrg || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Billing Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
