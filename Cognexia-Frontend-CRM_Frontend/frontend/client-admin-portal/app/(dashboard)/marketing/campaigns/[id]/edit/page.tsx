'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignForm } from '@/components/marketing/campaign-form';
import { useGetCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { data, isLoading } = useGetCampaign(campaignId);
  const updateMutation = useUpdateCampaign();

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (!data?.data) return <div className="flex flex-col items-center justify-center gap-4 p-6"><h2 className="text-2xl font-bold">Campaign not found</h2><Button onClick={() => router.push('/marketing/campaigns')}>Back</Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Campaign"
        subtitle={data.data.name}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <CampaignForm initialData={data.data} onSubmit={(formData) => updateMutation.mutate({ id: campaignId, data: formData }, { onSuccess: () => router.push(`/marketing/campaigns/${campaignId}`) })} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
