import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { territoryApi, type CreateTerritoryDto, type UpdateTerritoryDto, type AssignLeadToTerritoryDto, type BulkAssignLeadsDto, type RebalanceTerritoriesDto } from '@/services/territory.api';
import { useToast } from '@/hooks/use-toast';

// Get All Territories
export function useGetTerritories() {
  return useQuery({
    queryKey: ['territories'],
    queryFn: territoryApi.getTerritories,
  });
}

// Get Territory by ID
export function useGetTerritory(id: string) {
  return useQuery({
    queryKey: ['territory', id],
    queryFn: () => territoryApi.getTerritory(id),
    enabled: !!id,
  });
}

// Create Territory
export function useCreateTerritory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateTerritoryDto) => territoryApi.createTerritory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast({ title: 'Territory created', description: 'New territory has been created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create territory', description: error.message, variant: 'destructive' });
    },
  });
}

// Update Territory
export function useUpdateTerritory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTerritoryDto }) => territoryApi.updateTerritory(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.invalidateQueries({ queryKey: ['territory', variables.id] });
      toast({ title: 'Territory updated', description: 'Changes have been saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update territory', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete Territory
export function useDeleteTerritory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => territoryApi.deleteTerritory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast({ title: 'Territory deleted', description: 'Territory has been permanently deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete territory', description: error.message, variant: 'destructive' });
    },
  });
}

// Assign Lead to Territory
export function useAssignLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: AssignLeadToTerritoryDto) => territoryApi.assignLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.invalidateQueries({ queryKey: ['territory-stats'] });
      toast({ title: 'Lead assigned', description: 'Lead has been assigned to territory' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to assign lead', description: error.message, variant: 'destructive' });
    },
  });
}

// Bulk Assign Leads
export function useBulkAssignLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: BulkAssignLeadsDto) => territoryApi.bulkAssignLeads(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.invalidateQueries({ queryKey: ['territory-stats'] });
      toast({
        title: 'Bulk assignment complete',
        description: `${data.assigned} leads assigned successfully, ${data.failed} failed`,
      });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to assign leads', description: error.message, variant: 'destructive' });
    },
  });
}

// Rebalance Territories
export function useRebalanceTerritories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: RebalanceTerritoriesDto) => territoryApi.rebalanceTerritories(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.invalidateQueries({ queryKey: ['territory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['territory-coverage'] });
      toast({
        title: 'Territories rebalanced',
        description: `Successfully reassigned ${data.reassigned} leads`,
      });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to rebalance territories', description: error.message, variant: 'destructive' });
    },
  });
}

// Get Territory Stats
export function useGetTerritoryStats(id: string) {
  return useQuery({
    queryKey: ['territory-stats', id],
    queryFn: () => territoryApi.getTerritoryStats(id),
    enabled: !!id,
  });
}

// Get Territory Performance
export function useGetTerritoryPerformance(territoryId?: string) {
  return useQuery({
    queryKey: ['territory-performance', territoryId],
    queryFn: () => territoryApi.getTerritoryPerformance(territoryId),
  });
}

// Compare Territories
export function useCompareTerritories(territoryIds: string[]) {
  return useQuery({
    queryKey: ['territories-comparison', territoryIds],
    queryFn: () => territoryApi.compareTerritories(territoryIds),
    enabled: territoryIds.length > 0,
  });
}

// Get Territory Coverage
export function useGetTerritoryCoverage() {
  return useQuery({
    queryKey: ['territory-coverage'],
    queryFn: territoryApi.getTerritoryCoverage,
  });
}
