'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpportunityForm } from '@/components/opportunities/opportunity-form';
import { useCreateOpportunity } from '@/hooks/useOpportunities';
import type { CreateOpportunityDto } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function NewOpportunityPage() {
  const router = useRouter();
  const createMutation = useCreateOpportunity();

  const handleSubmit = (data: CreateOpportunityDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        router.push(`/opportunities/${response.data.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Opportunity"
        subtitle="Add a new sales opportunity to your pipeline"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Form */}
      <OpportunityForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Opportunity"
      />
    </div>
  );
}
