'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Calendar, Shield, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function StaffMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    isActive: true,
    notes: '',
  });

  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff-member', id],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/staff/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch staff member');
      const data = await response.json();
      setFormData({
        role: data.data.role,
        isActive: data.data.isActive,
        notes: data.data.notes || '',
      });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update staff member');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Staff member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff-member', id] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update staff member');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/staff/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete staff member');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Staff member removed successfully');
      router.push('/staff');
    },
    onError: () => {
      toast.error('Failed to remove staff member');
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading staff member...</div>
      </div>
    );
  }

  const staff = staffData?.data;
  if (!staff) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-600">Staff member not found</div>
      </div>
    );
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
      support_manager: 'bg-blue-100 text-blue-800 border-blue-300',
      support_agent: 'bg-green-100 text-green-800 border-green-300',
      billing_admin: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      analytics_viewer: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      technical_specialist: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/staff">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {staff.firstName} {staff.lastName}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                {staff.email}
              </span>
              <Badge className={getRoleBadgeColor(staff.role)}>
                {formatRole(staff.role)}
              </Badge>
              <Badge
                className={
                  staff.isActive
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }
              >
                {staff.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="gap-2"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="gap-2"
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>
                Manage the role and permissions for this staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditing ? (
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="support_manager">Support Manager</SelectItem>
                      <SelectItem value="support_agent">Support Agent</SelectItem>
                      <SelectItem value="billing_admin">Billing Admin</SelectItem>
                      <SelectItem value="analytics_viewer">Analytics Viewer</SelectItem>
                      <SelectItem value="technical_specialist">
                        Technical Specialist
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Badge className={getRoleBadgeColor(staff.role)}>
                      {formatRole(staff.role)}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Account Status</Label>
                  <p className="text-sm text-gray-500">
                    Enable or disable access for this staff member
                  </p>
                </div>
                {isEditing ? (
                  <Switch
                    id="status"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                ) : (
                  <Badge
                    className={
                      staff.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this staff member..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {staff.notes || (
                      <span className="text-gray-500">No notes added</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Current permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {staff.permissions &&
                  Object.entries(staff.permissions).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <Badge
                        className={
                          value
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {value ? 'Granted' : 'Denied'}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">User ID</Label>
                <p className="font-mono text-sm mt-1">{staff.userId}</p>
              </div>
              <div>
                <Label className="text-gray-600">Staff ID</Label>
                <p className="font-mono text-sm mt-1">{staff.id}</p>
              </div>
              <div>
                <Label className="text-gray-600">Joined</Label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(staff.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
