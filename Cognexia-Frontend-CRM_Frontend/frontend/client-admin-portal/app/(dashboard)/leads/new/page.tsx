'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/leads/lead-form';
import { useCreateLead } from '@/hooks/useLeads';
import type { CreateLeadDto } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function NewLeadPage() {
  const router = useRouter();
  const createMutation = useCreateLead();

  const handleSubmit = (data: CreateLeadDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        router.push(`/leads/${response.data.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Lead"
        subtitle="Add a new lead to your CRM pipeline"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Form */}
      <LeadForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Lead"
      />
    </div>
  );
}
