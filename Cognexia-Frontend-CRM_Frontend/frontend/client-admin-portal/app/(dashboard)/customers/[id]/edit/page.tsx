'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/customers/customer-form';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import type { CreateCustomerDto } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { data, isLoading } = useCustomer(customerId);
  const updateMutation = useUpdateCustomer();

  const customer = data?.data;

  const handleSubmit = (formData: CreateCustomerDto) => {
    updateMutation.mutate(
      { id: customerId, data: formData },
      {
        onSuccess: () => {
          router.push(`/customers/${customerId}`);
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

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button onClick={() => router.push('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Customer"
        subtitle={`Update information for ${customer.companyName}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Form */}
      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
