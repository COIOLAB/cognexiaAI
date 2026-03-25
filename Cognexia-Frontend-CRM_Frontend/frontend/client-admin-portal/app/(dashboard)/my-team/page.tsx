'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity } from 'lucide-react';
import { useTeamActivities, useTeamMembers } from '@/hooks/useDashboards';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

type TeamActivity = {
  id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  type?: string;
  performed_by?: string;
  related_to_id?: string;
  performed_by_name?: string;
};

export default function MyTeamPage() {
  const { user } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  const isManager = useMemo(() => {
    return (user as any)?.roles?.some((r: string) =>
      ['OWNER', 'ORG_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_MANAGER', 'SUPPORT_AGENT'].includes(r.toUpperCase()),
    ) ?? false;
  }, [user]);

  const { data: teamActivitiesData, isLoading: teamActivitiesLoading } = useTeamActivities(100);
  const { data: teamMembersData, isLoading: teamMembersLoading } = useTeamMembers();

  const teamActivities = ((teamActivitiesData as any)?.data ?? teamActivitiesData ?? []) as TeamActivity[];
  const teamMembers = ((teamMembersData as any)?.data ?? teamMembersData ?? []) as Array<any>;

  const selectedMember = useMemo(() => {
    if (selectedMemberId === 'all') return null;
    return teamMembers.find((member) => member.id === selectedMemberId) || null;
  }, [teamMembers, selectedMemberId]);

  const filteredTeamActivities = useMemo(() => {
    if (selectedMemberId === 'all') {
      return teamActivities;
    }

    return teamActivities.filter((activity) => {
      const actorId = activity.performed_by || activity.related_to_id;
      if (!actorId) {
        return false;
      }
      return actorId === selectedMemberId;
    });
  }, [selectedMemberId, teamActivities]);

  if (!isManager) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view team management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground">Manage your direct reports and view their recent activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-3 bg-blue-50/50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              My Direct Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {teamMembersLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading team members...</div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="space-y-2">
                <button
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedMemberId === 'all' ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:bg-muted/40'
                  }`}
                  onClick={() => setSelectedMemberId('all')}
                >
                  <p className="text-sm font-semibold">All Team Members</p>
                  <p className="text-xs text-muted-foreground mt-1">Show combined activity feed</p>
                </button>
                {teamMembers.map((member) => (
                  <button
                    type="button"
                    key={member.id}
                    className={`w-full rounded-lg border p-3 text-left transition-colors flex items-center justify-between ${
                      selectedMemberId === member.id ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:bg-muted/40'
                    }`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                    </div>
                    <Badge variant={member.isActive ? 'default' : member.isInvited ? 'outline' : 'secondary'} className="ml-4">
                      {member.isActive ? 'Active' : member.isInvited ? 'Pending' : 'Inactive'}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">You have no assigned team members.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-sm">
          <CardHeader className="pb-3 bg-emerald-50/50">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Activity className="h-5 w-5" />
              {selectedMember ? `${selectedMember.firstName}'s Recent Activity` : "My Team's Recent Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {teamActivitiesLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading team activity...</div>
            ) : filteredTeamActivities && filteredTeamActivities.length > 0 ? (
              <div className="max-h-[460px] overflow-y-auto pr-2 space-y-6">
                {filteredTeamActivities.map((activity) => (
                  <div key={activity.id || activity.timestamp} className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title || activity.description || 'Activity update'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-emerald-700">{activity.performed_by_name || 'Team member'}</span> |{' '}
                        {formatDistanceToNow(new Date(activity.timestamp || activity.createdAt || new Date().toISOString()), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {selectedMember ? `No activity found for ${selectedMember.firstName} ${selectedMember.lastName}.` : 'No team activity yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
