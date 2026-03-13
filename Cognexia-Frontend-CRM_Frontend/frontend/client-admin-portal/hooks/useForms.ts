import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formApi, type Form } from '@/services/form.api';
import { useToast } from '@/hooks/use-toast';

export function useGetForms() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: formApi.getForms,
  });
}

export function useGetForm(id: string) {
  return useQuery({
    queryKey: ['form', id],
    queryFn: () => formApi.getForm(id),
    enabled: !!id,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Form>) => formApi.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Success', description: 'Form created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Form> }) =>
      formApi.updateForm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', variables.id] });
      toast({ title: 'Success', description: 'Form updated successfully' });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => formApi.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Success', description: 'Form deleted successfully' });
    },
  });
}

export function usePublishForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => formApi.publishForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      toast({ title: 'Success', description: 'Form published successfully' });
    },
  });
}

export function usePauseForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => formApi.pauseForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      toast({ title: 'Success', description: 'Form paused successfully' });
    },
  });
}

export function useDuplicateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => formApi.duplicateForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Success', description: 'Form duplicated successfully' });
    },
  });
}

export function useGetFormSubmissions(id: string) {
  return useQuery({
    queryKey: ['form-submissions', id],
    queryFn: () => formApi.getFormSubmissions(id),
    enabled: !!id,
  });
}

export function useGetFormAnalytics(id: string) {
  return useQuery({
    queryKey: ['form-analytics', id],
    queryFn: () => formApi.getFormAnalytics(id),
    enabled: !!id,
  });
}

export function useGetEmbedCode(id: string) {
  return useQuery({
    queryKey: ['form-embed-code', id],
    queryFn: () => formApi.getEmbedCode(id),
    enabled: !!id,
  });
}
