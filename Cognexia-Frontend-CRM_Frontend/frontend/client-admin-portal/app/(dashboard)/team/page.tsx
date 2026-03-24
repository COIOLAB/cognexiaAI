'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, Mail, Trash2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface SeatUsage {
  currentUsers: number;
  maxUsers: number;
  availableSeats: number;
  usagePercentage: number;
  canAddUsers: boolean;
}

interface InviteUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  managerId: string;
}

export default function TeamManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    email: '',
    firstName: '',
    lastName: '',
<<<<<<< Updated upstream
    role: 'USER',
=======
    role: 'ORG_USER',
    managerId: 'none',
>>>>>>> Stashed changes
  });

  // Fetch team members
  const { data: teamMembers, isLoading: loadingTeam } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await apiClient.get('/users', { params: { limit: 200 } });
      return response.data?.users || response.data?.data || response.data;
    },
  });

  // Fetch seat usage
  const { data: seatUsage, isLoading: loadingSeats } = useQuery<SeatUsage>({
    queryKey: ['seat-usage'],
    queryFn: async () => {
      const organizationId = localStorage.getItem('organizationId');
      const response = await apiClient.get(`/organizations/${organizationId}/seat-usage`);
      return response.data?.data || response.data;
    },
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async (data: InviteUserForm) => {
      const response = await apiClient.post('/users/invite', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
<<<<<<< Updated upstream
        userType: data.role === 'ADMIN' ? 'org_admin' : 'org_user',
        roleIds: data.role ? [data.role.toLowerCase()] : [],
=======
        userType: data.role === 'ORG_ADMIN' ? 'org_admin' : 'org_user',
        roleIds: data.role ? [data.role] : [],
        ...(data.managerId && data.managerId !== 'none' ? { managerId: data.managerId } : {}),
>>>>>>> Stashed changes
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: 'User has been invited successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['seat-usage'] });
      setInviteDialogOpen(false);
<<<<<<< Updated upstream
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'USER' });
=======
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'ORG_USER', managerId: 'none' });
>>>>>>> Stashed changes
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to invite user',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: 'User removed',
        description: 'User has been removed from the team',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['seat-usage'] });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove user',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteUserMutation.mutate(inviteForm);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('OWNER') || roles.includes('owner')) return 'bg-purple-500';
    if (roles.includes('ADMIN') || roles.includes('admin') || roles.includes('org_admin')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getRoleLabel = (roles: string[]) => {
    if (roles.includes('OWNER') || roles.includes('owner')) return 'Owner';
    if (roles.includes('ADMIN') || roles.includes('admin') || roles.includes('org_admin')) return 'Admin';
    return 'User';
  };

  if (loadingTeam || loadingSeats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isNearLimit = seatUsage && seatUsage.usagePercentage >= 80;
  const isAtLimit = seatUsage && !seatUsage.canAddUsers;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and their roles
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isAtLimit}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerId">Reports To (Optional)</Label>
                <Select value={inviteForm.managerId} onValueChange={(value) => setInviteForm({ ...inviteForm, managerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {teamMembers
                      ?.filter(m => m.roles?.some(r => ['OWNER', 'ORG_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_MANAGER', 'SUPPORT_AGENT'].includes(r.toUpperCase())))
                      .map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName} - ({getRoleLabel(manager.roles)})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteUserMutation.isPending}>
                  {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seat Usage Card */}
      {seatUsage && (
        <Card className={isAtLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Seat Usage</span>
              <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'default' : 'secondary'}>
                {seatUsage.currentUsers} / {seatUsage.maxUsers} seats used
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(seatUsage.usagePercentage, 100)}%` }}
              />
            </div>
            {isAtLimit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your user limit. Please upgrade your plan to add more team members.
                </AlertDescription>
              </Alert>
            )}
            {isNearLimit && !isAtLimit && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're approaching your user limit ({seatUsage.availableSeats} seats remaining).
                  Consider upgrading your plan.
                </AlertDescription>
              </Alert>
            )}
            {!isNearLimit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {seatUsage.availableSeats} seats available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {teamMembers?.length || 0} member{teamMembers?.length !== 1 ? 's' : ''} in your organization
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.roles)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleLabel(member.roles)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={member.isActive ? 'default' : 'secondary'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {!member.isEmailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Email unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.lastLoginAt 
                      ? new Date(member.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    {!member.roles.includes('OWNER') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(member);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedUser?.firstName} {selectedUser?.lastName} from your team?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Removing...' : 'Remove User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
