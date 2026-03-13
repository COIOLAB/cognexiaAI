'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/leads/lead-form';
import { useLead, useUpdateLead } from '@/hooks/useLeads';
import type { CreateLeadDto } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { data, isLoading } = useLead(leadId);
  const updateMutation = useUpdateLead();

  const lead = data?.data;

  const handleSubmit = (formData: CreateLeadDto) => {
    updateMutation.mutate(
      { id: leadId, data: formData },
      {
        onSuccess: () => {
          router.push(`/leads/${leadId}`);
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

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-bold">Lead not found</h2>
        <Button onClick={() => router.push('/leads')}>Back to Leads</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Lead"
        subtitle={`Update information for ${lead.fullName}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Form */}
      <LeadForm
        initialData={lead}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
