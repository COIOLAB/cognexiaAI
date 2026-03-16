'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignForm } from '@/components/marketing/campaign-form';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { PageHeader } from '@/components/PageHeader';

export default function NewCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateCampaign();

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (response) => router.push(`/marketing/campaigns/${response.data.id}`),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Campaign"
        subtitle="Create a new marketing campaign"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <CampaignForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Campaign" />
    </div>
  );
}
