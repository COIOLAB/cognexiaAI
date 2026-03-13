'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountForm } from '@/components/accounts/account-form';
import { useCreateAccount } from '@/hooks/useAccounts';
import type { CreateAccountDto } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function NewAccountPage() {
  const router = useRouter();
  const createMutation = useCreateAccount();

  const handleSubmit = (data: CreateAccountDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => router.push(`/accounts/${response.data.id}`),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Account"
        subtitle="Create a new organizational account"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <AccountForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Account" />
    </div>
  );
}
