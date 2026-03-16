'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote, useUpdateQuote } from '@/hooks/useQuotes';
import QuoteForm from '../../../quote-form';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const { data: quoteData, isLoading } = useQuote(quoteId);
  const updateQuote = useUpdateQuote();

  const handleSubmit = (data: any) => {
    updateQuote.mutate(
      { id: quoteId, data },
      {
        onSuccess: () => {
          router.push(`/sales/quotes/${quoteId}`);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(`/sales/quotes/${quoteId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!quoteData?.data) {
    return <div>Quote not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Quote"
        subtitle="Update quote details and line items"
        actions={
          <Button variant="outline" asChild>
            <Link href={`/sales/quotes/${quoteId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quote
            </Link>
          </Button>
        }
      />

      <QuoteForm
        quote={quoteData.data}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateQuote.isPending}
      />
    </div>
  );
}
