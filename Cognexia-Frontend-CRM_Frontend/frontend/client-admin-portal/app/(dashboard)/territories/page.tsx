'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table';
import {
  useGetTerritories,
  useCreateTerritory,
  useUpdateTerritory,
  useDeleteTerritory,
  useRebalanceTerritories,
  useGetTerritoryCoverage,
} from '@/hooks/useTerritories';
import { MapPin, Users, TrendingUp, Target, MoreVertical, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Territory } from '@/services/territory.api';

export default function TerritoriesPage() {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);
  const [newTerritory, setNewTerritory] = useState({
    name: '',
    description: '',
    active: true,
    hasCapacityLimit: false,
    maxLeadsPerUser: 50,
  });
  const [rebalanceStrategy, setRebalanceStrategy] = useState<'EVEN_DISTRIBUTION' | 'BY_CAPACITY' | 'BY_PERFORMANCE'>('EVEN_DISTRIBUTION');

  const { data: territories = [], isLoading } = useGetTerritories();
  const { data: coverage } = useGetTerritoryCoverage();
  const createTerritory = useCreateTerritory();
  const updateTerritory = useUpdateTerritory();
  const deleteTerritory = useDeleteTerritory();
  const rebalanceTerritories = useRebalanceTerritories();

  const handleCreateTerritory = async () => {
    await createTerritory.mutateAsync(newTerritory);
    setIsCreateOpen(false);
    setNewTerritory({
      name: '',
      description: '',
      active: true,
      hasCapacityLimit: false,
      maxLeadsPerUser: 50,
    });
  };

  const handleRebalance = async () => {
    await rebalanceTerritories.mutateAsync({ strategy: rebalanceStrategy });
    setIsRebalanceOpen(false);
  };

  const columns: ColumnDef<Territory>[] = [
    {
      accessorKey: 'name',
      header: 'Territory Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/territories/${row.original.id}`)}>
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'users',
      header: 'Team Members',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.users?.length || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalLeadsAssigned',
      header: 'Leads Assigned',
      cell: ({ row }) => row.original.totalLeadsAssigned || 0,
    },
    {
      accessorKey: 'activeLeads',
      header: 'Active Leads',
      cell: ({ row }) => row.original.activeLeads || 0,
    },
    {
      accessorKey: 'conversionRate',
      header: 'Conversion Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>{(row.original.conversionRate || 0).toFixed(1)}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => {
        const territory = row.original;
        if (!territory.hasCapacityLimit) return <span className="text-muted-foreground">Unlimited</span>;
        const capacity = (territory.users?.length || 0) * (territory.maxLeadsPerUser || 0);
        const utilization =
          capacity > 0 ? ((Number(territory.activeLeads ?? 0) / capacity) * 100).toFixed(0) : 0;
        return (
          <div className="text-sm">
            <div>{Number(territory.activeLeads ?? 0)} / {capacity}</div>
            <div className="text-muted-foreground">{utilization}% utilized</div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const territory = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/territories/${territory.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  updateTerritory.mutate({
                    id: territory.id,
                    dto: { active: !territory.active },
                  })
                }
              >
                {territory.active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteTerritory.mutate(territory.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Territory Management</h1>
          <p className="text-muted-foreground">Organize and manage your sales territories</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRebalanceOpen} onOpenChange={setIsRebalanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebalance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rebalance Territories</DialogTitle>
                <DialogDescription>
                  Redistribute leads across territories for optimal performance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rebalancing Strategy</Label>
                  <Select value={rebalanceStrategy} onValueChange={(value: any) => setRebalanceStrategy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVEN_DISTRIBUTION">Even Distribution</SelectItem>
                      <SelectItem value="BY_CAPACITY">By Capacity</SelectItem>
                      <SelectItem value="BY_PERFORMANCE">By Performance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {rebalanceStrategy === 'EVEN_DISTRIBUTION' && 'Distribute leads evenly across all territories'}
                    {rebalanceStrategy === 'BY_CAPACITY' && 'Distribute based on territory capacity and utilization'}
                    {rebalanceStrategy === 'BY_PERFORMANCE' && 'Distribute more leads to high-performing territories'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRebalanceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRebalance} disabled={rebalanceTerritories.isPending}>
                  Rebalance Territories
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Territory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Territory</DialogTitle>
                <DialogDescription>Add a new sales territory to your organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Territory Name</Label>
                  <Input
                    id="name"
                    value={newTerritory.name}
                    onChange={(e) => setNewTerritory({ ...newTerritory, name: e.target.value })}
                    placeholder="North Region"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTerritory.description}
                    onChange={(e) => setNewTerritory({ ...newTerritory, description: e.target.value })}
                    placeholder="Covers northern states..."
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCapacityLimit"
                      checked={newTerritory.hasCapacityLimit}
                      onCheckedChange={(checked) =>
                        setNewTerritory({ ...newTerritory, hasCapacityLimit: !!checked })
                      }
                    />
                    <label htmlFor="hasCapacityLimit" className="text-sm cursor-pointer">
                      Enable capacity limits
                    </label>
                  </div>
                  {newTerritory.hasCapacityLimit && (
                    <div className="space-y-2">
                      <Label htmlFor="maxLeadsPerUser">Max Leads Per User</Label>
                      <Input
                        id="maxLeadsPerUser"
                        type="number"
                        value={newTerritory.maxLeadsPerUser}
                        onChange={(e) =>
                          setNewTerritory({ ...newTerritory, maxLeadsPerUser: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTerritory} disabled={!newTerritory.name || createTerritory.isPending}>
                  Create Territory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {coverage && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Territories</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(coverage.summary.totalTerritories ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(coverage.summary.activeTerritories ?? 0)} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof coverage.summary.totalCapacity === 'number'
                  ? Number(coverage.summary.totalCapacity ?? 0).toLocaleString()
                  : coverage.summary.totalCapacity}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Load</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(coverage.summary.currentLoad ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">leads assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(coverage.summary.overallUtilization ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(coverage.summary.territoriesAtCapacity ?? 0)} at capacity
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Territories</CardTitle>
          <CardDescription>Manage your sales territories and team assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={territories} />
        </CardContent>
      </Card>
    </div>
  );
}
