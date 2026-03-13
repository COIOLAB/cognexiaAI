'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Shield,
  TrendingUp,
  AlertTriangle,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
  Download,
  Upload,
  Database
} from 'lucide-react';
import { getStatusColor } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { UserTierManager } from '@/components/organizations/user-tier-manager';
import { OrganizationFeaturesManager } from '@/components/organizations/organization-features-manager';
import { RealTimeActivityFeed } from '@/components/analytics/real-time-activity-feed';
import { UsageAnalyticsDashboard } from '@/components/analytics/usage-analytics-dashboard';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  status: string;
  subscriptionStatus: string;
  subscriptionPlan?: {
    id: string;
    name: string;
    price: number;
    billingInterval: string;
    includedUsers: number;
  };
  maxUsers: number;
  currentUserCount: number;
  trialEndsAt?: string;
  nextBillingDate?: string;
  monthlyRevenue: number;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  createdAt: string;
  updatedAt: string;
  tier?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  userType?: string;
}

interface SeatUsage {
  currentUsers: number;
  maxUsers: number;
  availableSeats: number;
  usagePercentage: number;
  canAddUsers: boolean;
}

export default function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [seatLimitDialogOpen, setSeatLimitDialogOpen] = useState(false);
  const [newSeatLimit, setNewSeatLimit] = useState('');
  const [reason, setReason] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  // Fetch organization
  const { data: org, isLoading, error } = useQuery<Organization>({
    queryKey: ['organization', id],
    queryFn: async () => {
      const response = await apiClient.get(`/organizations/${id}`);
      const orgData = response.data?.data ?? response.data;
      
      // Ensure all expected fields exist with defaults
      return {
        ...orgData,
        owner: orgData.owner || { name: 'N/A', email: 'N/A' },
        subscriptionPlan: orgData.subscriptionPlan || { name: 'N/A' },
        tier: orgData.tier || 'basic',
        userCount: orgData.userCount || orgData.currentUserCount || 0,
      };
    },
  });

  // Fetch organization users
  const { data: users } = useQuery<User[]>({
    queryKey: ['organization-users', id],
    queryFn: async () => {
      const response = await apiClient.get(`/organizations/${id}/users`);
      const payload = response.data?.data ?? response.data;
      return payload.users ?? payload;
    },
    enabled: !!org,
  });

  // Fetch seat usage
  const { data: seatUsage } = useQuery<SeatUsage>({
    queryKey: ['seat-usage', id],
    queryFn: async () => {
      const response = await apiClient.get(`/organizations/${id}/seat-usage`);
      return response.data?.data ?? response.data;
    },
    enabled: !!org,
  });

  // Update seat limit mutation
  const updateSeatLimitMutation = useMutation({
    mutationFn: async (data: { newMaxUsers: number; reason: string; paymentConfirmed: boolean }) => {
      const response = await apiClient.patch(`/organizations/${id}/seat-limit`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Seat limit updated successfully');
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['seat-usage', id] });
      setSeatLimitDialogOpen(false);
      setNewSeatLimit('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update seat limit');
    },
  });

  const handleUpdateSeatLimit = () => {
    const newLimit = parseInt(newSeatLimit);
    if (isNaN(newLimit) || newLimit < 1) {
      toast.error('Please enter a valid seat limit');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for the change');
      return;
    }

    updateSeatLimitMutation.mutate({
      newMaxUsers: newLimit,
      reason: reason.trim(),
      paymentConfirmed: true, // Super admin confirms payment
    });
  };

  const deleteOrganizationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/organizations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Organization deleted');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/organizations');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    },
  });

  const upsertAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/organizations/${id}/admin-user`, {
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPassword,
        contactPersonName: org?.contactPersonName,
        contactPersonEmail: org?.contactPersonEmail,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Admin password updated');
      setAdminPassword('');
      setAdminPasswordConfirm('');
      queryClient.invalidateQueries({ queryKey: ['organization-users', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update admin password');
    },
  });

  useEffect(() => {
    if (org && !adminEmail) {
      setAdminEmail(org.contactPersonEmail || org.email || '');
    }
  }, [org, adminEmail]);

  const handleDeleteOrganization = () => {
    if (
      confirm(
        'Are you sure you want to delete this organization? This action cannot be undone.',
      )
    ) {
      deleteOrganizationMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-gray-900 mb-2">Failed to load organization</p>
          <p className="text-sm text-gray-500 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Organization not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isNearLimit = seatUsage && seatUsage.usagePercentage >= 80;
  const isAtLimit = seatUsage && !seatUsage.canAddUsers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/organizations">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground">{org.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
            {org.status}
          </Badge>
          <Badge variant={org.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
            {org.subscriptionStatus}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteOrganization}
            disabled={deleteOrganizationMutation.isPending}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{org.currentUserCount}</div>
            <p className="text-xs text-muted-foreground">of {org.maxUsers} max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${org.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{org.subscriptionPlan?.name || 'None'}</div>
            {org.subscriptionPlan && (
              <p className="text-xs text-muted-foreground">
                ${org.subscriptionPlan.price}/{org.subscriptionPlan.billingInterval}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(org.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor((Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seat Usage */}
      {seatUsage && (
        <Card className={isAtLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Seat Usage</CardTitle>
                <CardDescription>
                  {seatUsage.currentUsers} of {seatUsage.maxUsers} seats used
                </CardDescription>
              </div>
              <Button onClick={() => setSeatLimitDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Adjust Seat Limit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={seatUsage.usagePercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span>{seatUsage.usagePercentage.toFixed(1)}% utilized</span>
              <span>{seatUsage.availableSeats} seats available</span>
            </div>
            {isAtLimit && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Organization has reached seat limit. Increase limit to allow more users.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Export / Import / Data Migration */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Export, Import & Data Migration</CardTitle>
          <CardDescription>
            Export this organization, import data, or migrate from another CRM platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={async () => {
                const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/organizations/export?organizationId=${id}`;
                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${org.name.replace(/\s+/g, '-')}-export-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
                toast.success('Organization data exported');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Organization
            </Button>
            <Link href="/onboarding">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import Organizations
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Data Migration
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Use Organization Onboarding to import multiple organizations from CSV or migrate from Salesforce, HubSpot, Zoho.
          </p>
        </CardContent>
      </Card>

      {/* User Tier Management */}
      <UserTierManager
        organizationId={id}
        organizationName={org.name}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['organization', id] });
          queryClient.invalidateQueries({ queryKey: ['seat-usage', id] });
        }}
      />

      {/* Feature Management */}
      <OrganizationFeaturesManager
        organizationId={id}
        organizationName={org.name}
        currentTier={(org.tier as 'basic' | 'premium' | 'advanced') || 'basic'}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['organization', id] });
        }}
      />

      {/* Usage Analytics Dashboard */}
      <UsageAnalyticsDashboard
        organizationId={id}
        organizationName={org.name}
      />

      {/* Real-time Activity Feed */}
      <RealTimeActivityFeed
        organizationId={id}
        limit={20}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{org.phone}</span>
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {org.website}
                </a>
              </div>
            )}
            {org.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{org.address}</span>
              </div>
            )}
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Contact Person</h4>
              {org.contactPersonName && <p className="text-sm font-medium">{org.contactPersonName}</p>}
              {org.contactPersonEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {org.contactPersonEmail}
                </div>
              )}
              {org.contactPersonPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {org.contactPersonPhone}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.subscriptionPlan ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold">{org.subscriptionPlan.name}</p>
                  <p className="text-sm">
                    ${org.subscriptionPlan.price}/{org.subscriptionPlan.billingInterval}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Included Users</p>
                  <p className="font-medium">{org.subscriptionPlan.includedUsers} seats</p>
                </div>
                {org.trialEndsAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Trial Ends</p>
                    <p className="font-medium">{new Date(org.trialEndsAt).toLocaleDateString()}</p>
                  </div>
                )}
                {org.nextBillingDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">{new Date(org.nextBillingDate).toLocaleDateString()}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Admin Access</CardTitle>
          <CardDescription>
            Set or reset the admin password for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Admin First Name</Label>
            <Input value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Admin Last Name</Label>
            <Input value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={adminPasswordConfirm}
              onChange={(e) => setAdminPasswordConfirm(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              if (!adminEmail.trim()) {
                toast.error('Admin email is required');
                return;
              }
              if (!adminPassword || adminPassword.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
              }
              if (adminPassword !== adminPasswordConfirm) {
                toast.error('Passwords do not match');
                return;
              }
              upsertAdminMutation.mutate();
            }}
            isLoading={upsertAdminMutation.isPending}
          >
            Save Admin Password
          </Button>
        </CardFooter>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Users</CardTitle>
          <CardDescription>
            {users?.length || 0} user{users?.length !== 1 ? 's' : ''} in this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                  <Badge variant={user.userType === 'super_admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.userType === 'super_admin' ? 'Super Admin' : user.userType === 'org_admin' ? 'Org Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {!user.isEmailVerified && (
                        <Badge variant="outline" className="text-xs">Unverified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Seat Limit Adjustment Dialog */}
      <Dialog open={seatLimitDialogOpen} onOpenChange={setSeatLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Seat Limit</DialogTitle>
            <DialogDescription>
              Update the maximum number of users for {org.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Current: {org.currentUserCount} users / {org.maxUsers} seats
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="newLimit">New Seat Limit</Label>
              <Input
                id="newLimit"
                type="number"
                min={org.currentUserCount}
                placeholder="Enter new limit"
                value={newSeatLimit}
                onChange={(e) => setNewSeatLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least {org.currentUserCount} (current user count)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change</Label>
              <Input
                id="reason"
                placeholder="e.g., Client upgraded plan, Payment confirmed"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Alert variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                As Super Admin, you confirm that payment has been received for this change.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeatLimitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSeatLimit} disabled={updateSeatLimitMutation.isPending}>
              {updateSeatLimitMutation.isPending ? 'Updating...' : 'Update Seat Limit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
