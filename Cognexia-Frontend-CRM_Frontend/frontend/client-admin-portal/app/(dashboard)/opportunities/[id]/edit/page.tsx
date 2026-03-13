'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpportunityForm } from '@/components/opportunities/opportunity-form';
import { useOpportunity, useUpdateOpportunity } from '@/hooks/useOpportunities';
import type { CreateOpportunityDto } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;

  const { data, isLoading } = useOpportunity(opportunityId);
  const updateMutation = useUpdateOpportunity();

  const opportunity = data?.data;

  const handleSubmit = (formData: CreateOpportunityDto) => {
    updateMutation.mutate(
      { id: opportunityId, data: formData },
      {
        onSuccess: () => {
          router.push(`/opportunities/${opportunityId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-bold">Opportunity not found</h2>
        <Button onClick={() => router.push('/opportunities')}>Back to Opportunities</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Opportunity"
        subtitle={`Update information for ${opportunity.name}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Form */}
      <OpportunityForm
        initialData={opportunity}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
