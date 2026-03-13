'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userImpersonationAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { User, LogOut, Search } from 'lucide-react';
import { useState } from 'react';

export default function UserImpersonationPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reason, setReason] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: () => userImpersonationAPI.searchUsers({ search: searchTerm }),
    enabled: searchTerm.length > 2,
  });

  const { data: activeSessions } = useQuery({
    queryKey: ['impersonation', 'active'],
    queryFn: () => userImpersonationAPI.getActiveSessions(),
    refetchInterval: 5000,
  });

  const impersonateMutation = useMutation({
    mutationFn: (data: { targetUserId: string; reason: string }) => 
      userImpersonationAPI.impersonateUser(data),
    onSuccess: (response) => {
      localStorage.setItem('impersonation_token', response.impersonationToken);
      window.location.href = '/dashboard'; // Redirect to user's dashboard
    },
    onError: () => toast.error('Failed to start impersonation'),
  });

  const endSessionMutation = useMutation({
    mutationFn: userImpersonationAPI.endImpersonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impersonation'] });
      toast.success('Impersonation session ended');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Impersonation</h1>
        <p className="text-muted-foreground">Securely access user accounts for debugging</p>
      </div>

      {/* Active Sessions */}
      {activeSessions && activeSessions.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Active Impersonation Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="font-medium">{session.adminEmail} → {session.targetEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.floor(session.duration / 60)} minutes • Reason: {session.reason}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => endSessionMutation.mutate(session.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    End Session
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users to Impersonate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by email, name, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchTerm.length > 2 && users && (
              <div className="space-y-2 mt-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.firstName} {user.lastName} • {user.role}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedUser(user)}>
                          <User className="h-4 w-4 mr-1" />
                          Impersonate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Impersonate User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>User to Impersonate</Label>
                            <Input value={selectedUser?.email} disabled />
                          </div>
                          <div>
                            <Label>Reason (Required)</Label>
                            <Textarea
                              placeholder="e.g., Debug issue with customer data not loading"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                            <p className="text-sm text-yellow-800">
                              ⚠️ This action will be logged. Session expires in 1 hour.
                            </p>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => {
                              if (reason.length < 10) {
                                toast.error('Please provide a detailed reason (min 10 characters)');
                                return;
                              }
                              impersonateMutation.mutate({
                                targetUserId: selectedUser.id,
                                reason,
                              });
                            }}
                            disabled={!reason || impersonateMutation.isPending}
                          >
                            Start Impersonation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

