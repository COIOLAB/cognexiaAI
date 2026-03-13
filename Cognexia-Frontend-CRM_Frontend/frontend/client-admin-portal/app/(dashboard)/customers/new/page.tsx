'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/customers/customer-form';
import { useCreateCustomer } from '@/hooks/useCustomers';
import type { CreateCustomerDto } from '@/types/api.types';

export default function NewCustomerPage() {
  const router = useRouter();
  const createMutation = useCreateCustomer();

  const handleSubmit = (data: CreateCustomerDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        router.push(`/customers/${response.data.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
          <p className="text-muted-foreground">
            Add a new customer to your CRM system
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Customer"
      />
    </div>
  );
}
