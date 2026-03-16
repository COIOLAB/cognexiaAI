import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketingContentApi } from '@/services/marketingContent.api';

const CONTENT_KEY = 'marketing-content';

export const useMarketingContent = (type?: string) => {
  return useQuery({
    queryKey: [CONTENT_KEY, type || 'all'],
    queryFn: () => marketingContentApi.getContent(type),
  });
};

export const useCreateMarketingContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marketingContentApi.createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_KEY] });
    },
  });
};
