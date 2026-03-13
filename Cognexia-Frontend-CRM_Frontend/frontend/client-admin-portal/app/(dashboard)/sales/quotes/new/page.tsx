'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateQuote } from '@/hooks/useQuotes';
import QuoteForm from '../../quote-form';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function NewQuotePage() {
  const router = useRouter();
  const createQuote = useCreateQuote();

  const handleSubmit = (data: any) => {
    createQuote.mutate(data, {
      onSuccess: (response) => {
        router.push(`/sales/quotes/${response.data.id}`);
      },
    });
  };

  const handleCancel = () => {
    router.push('/sales/quotes');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Quote"
        subtitle="Create a new sales quote with line items"
        actions={
          <Button variant="outline" asChild>
            <Link href="/sales/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotes
            </Link>
          </Button>
        }
      />

      <QuoteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createQuote.isPending}
      />
    </div>
  );
}
