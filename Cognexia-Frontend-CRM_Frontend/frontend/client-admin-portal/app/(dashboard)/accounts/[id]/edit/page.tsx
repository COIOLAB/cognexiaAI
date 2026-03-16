'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountForm } from '@/components/accounts/account-form';
import { useAccount, useUpdateAccount } from '@/hooks/useAccounts';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const { data, isLoading } = useAccount(accountId);
  const updateMutation = useUpdateAccount();

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (!data?.data) return <div className="flex flex-col items-center justify-center gap-4 p-6"><h2 className="text-2xl font-bold">Account not found</h2><Button onClick={() => router.push('/accounts')}>Back</Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Account"
        subtitle={data.data.name}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <AccountForm initialData={data.data} onSubmit={(formData) => updateMutation.mutate({ id: accountId, data: formData }, { onSuccess: () => router.push(`/accounts/${accountId}`) })} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
