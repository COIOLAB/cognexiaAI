'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';

interface CreateOrganizationData {
  name: string;
  email: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPassword?: string;
  phone?: string;
  address?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  subscriptionPlanId?: string;
  trialDays?: number;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
}

export function CreateOrganizationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: plans, isLoading: loadingPlans } = useSubscriptionPlans();

  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    email: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: '',
    phone: '',
    address: '',
    website: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    subscriptionPlanId: '',
    trialDays: 14,
    accountId: '',
    country: '',
    industry: '',
    accountType: '',
    accountOwner: '',
    accountStatus: '',
    createdDate: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!formData.adminEmail && formData.email) {
      setFormData((prev) => ({ ...prev, adminEmail: prev.email }));
    }
  }, [formData.email, formData.adminEmail]);

  const createOrganization = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const response = await apiClient.post('/organizations', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Organization created successfully!');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/organizations');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adminPassword || formData.adminPassword.length < 8) {
      toast.error('Admin password must be at least 8 characters');
      return;
    }
    if (formData.adminPassword !== confirmPassword) {
      toast.error('Admin password confirmation does not match');
      return;
    }
    createOrganization.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Organization Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Acme Corporation"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="contact@acme.com"
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://acme.com"
          />
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, State 12345"
          />
        </CardContent>
      </Card>

      {/* Contact Person */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Person</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            name="contactPersonName"
            value={formData.contactPersonName}
            onChange={handleChange}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            name="contactPersonEmail"
            type="email"
            value={formData.contactPersonEmail}
            onChange={handleChange}
            placeholder="john@acme.com"
          />
          <Input
            label="Phone"
            name="contactPersonPhone"
            value={formData.contactPersonPhone}
            onChange={handleChange}
            placeholder="+1 (555) 987-6543"
          />
        </CardContent>
      </Card>

      {/* Admin User */}
      <Card>
        <CardHeader>
          <CardTitle>Admin User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Admin Email"
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            required
            placeholder="admin@abcd.com"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Admin First Name"
              name="adminFirstName"
              value={formData.adminFirstName}
              onChange={handleChange}
              placeholder="Admin"
            />
            <Input
              label="Admin Last Name"
              name="adminLastName"
              value={formData.adminLastName}
              onChange={handleChange}
              placeholder="User"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Admin Password"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
            <Input
              label="Confirm Password"
              name="adminPasswordConfirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              placeholder="Re-enter password"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Business ID"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            placeholder="WEBN/NETWIZ-001A9F"
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="NZ"
          />
          <Input
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="Windows & Doors Installation"
          />
          <Input
            label="Business Type"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            placeholder="Enterprise"
          />
          <Input
            label="Business Owner"
            name="accountOwner"
            value={formData.accountOwner}
            onChange={handleChange}
            placeholder="Jane Smith"
          />
          <Input
            label="Business Status"
            name="accountStatus"
            value={formData.accountStatus}
            onChange={handleChange}
            placeholder="Active"
          />
          <Input
            label="Created Date"
            name="createdDate"
            value={formData.createdDate}
            onChange={handleChange}
            placeholder="23.01.2026"
          />
        </CardContent>
      </Card>

      {/* Subscription Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Plan
            </label>
            <select
              name="subscriptionPlanId"
              value={formData.subscriptionPlanId}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loadingPlans}
            >
              <option value="">Select a plan...</option>
              {plans?.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/{plan.billingInterval} ({plan.includedUsers} users, {plan.trialDays} day trial)
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Trial Period */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Period</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="Trial Days"
            name="trialDays"
            type="number"
            value={formData.trialDays?.toString() || '14'}
            onChange={handleChange}
            placeholder="14"
            min={0}
          />
          <p className="text-sm text-gray-500 mt-2">
            Number of days for the trial period. Default is 14 days.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating the organization, you'll need to create an admin user separately for this organization.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={createOrganization.isPending}
        >
          Create Organization
        </Button>
      </div>
    </form>
  );
}
