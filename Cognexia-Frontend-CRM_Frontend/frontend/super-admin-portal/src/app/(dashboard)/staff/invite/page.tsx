'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserPlus, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface RoleInfo {
  role: string;
  displayName: string;
}

export default function InviteStaffPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    assignedOrganizations: [] as string[],
  });

  const { data: rolesData } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${apiBase}/staff/roles/available`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${apiBase}/staff/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to invite staff member');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Staff member invited successfully!');
      router.push('/staff');
    },
    onError: () => {
      toast.error('Failed to invite staff member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    inviteMutation.mutate(formData);
  };

  const roles: RoleInfo[] = rolesData?.data || [];

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      super_admin: 'Full system access with all permissions',
      support_manager: 'Manage support team and tickets',
      support_agent: 'Handle customer support tickets',
      billing_admin: 'Manage billing and subscriptions',
      analytics_viewer: 'View reports and analytics',
      technical_specialist: 'Technical support and system access',
    };
    return descriptions[role] || '';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/staff">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-blue-600" />
          Invite Staff Member
        </h1>
        <p className="text-gray-600 mt-1">
          Add a new team member to your Super Admin portal
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic information about the staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@cognexiaai.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-gray-500">
                  An invitation email will be sent to this address
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>
                Select the role and permissions for this staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleInfo) => (
                      <SelectItem key={roleInfo.role} value={roleInfo.role}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {roleInfo.displayName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{getRoleDescription(formData.role)}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/staff">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {inviteMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

