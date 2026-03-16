'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Check, X, RefreshCw } from 'lucide-react';
import { useQuote, useSendQuote, useAcceptQuote, useConvertQuoteToOrder } from '@/hooks/useQuotes';
import { QuoteStatus } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

const statusStyles: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [QuoteStatus.SENT]: 'bg-blue-100 text-blue-800',
  [QuoteStatus.VIEWED]: 'bg-purple-100 text-purple-800',
  [QuoteStatus.ACCEPTED]: 'bg-green-100 text-green-800',
  [QuoteStatus.REJECTED]: 'bg-red-100 text-red-800',
  [QuoteStatus.EXPIRED]: 'bg-orange-100 text-orange-800',
  [QuoteStatus.REVISED]: 'bg-yellow-100 text-yellow-800',
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading } = useQuote(id);
  const sendMutation = useSendQuote();
  const acceptMutation = useAcceptQuote();
  const convertMutation = useConvertQuoteToOrder();

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!data?.data) {
    return <div className="flex items-center justify-center h-96">Quote not found</div>;
  }

  const quote = data.data;

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(id);
      toast({ title: 'Success', description: 'Quote sent to customer' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send quote', variant: 'destructive' });
    }
  };

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync(id);
      toast({ title: 'Success', description: 'Quote accepted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to accept quote', variant: 'destructive' });
    }
  };

  const handleConvert = async () => {
    try {
      const result = await convertMutation.mutateAsync(id);
      toast({ title: 'Success', description: 'Quote converted to order' });
      router.push(`/sales/orders/${result.data.orderId}`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to convert quote', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={quote.quoteNumber}
        subtitle={quote.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusStyles[quote.status]} variant="secondary">
              {quote.status}
            </Badge>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {quote.status === QuoteStatus.DRAFT && (
              <Button onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            )}
            {quote.status === QuoteStatus.SENT && (
              <Button onClick={handleAccept}>
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
            )}
            {quote.status === QuoteStatus.ACCEPTED && (
              <Button onClick={handleConvert}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Convert to Order
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${Number(quote.totals?.total ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Valid Until</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(quote.validUntil).toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{quote.customerName}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Line Items ({quote.lineItems.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Quote Number</div>
                  <div className="font-medium">{quote.quoteNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={statusStyles[quote.status]} variant="secondary">
                    {quote.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{quote.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Valid Until</div>
                  <div className="font-medium">{new Date(quote.validUntil).toLocaleDateString()}</div>
                </div>
              </div>
              {quote.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Notes</div>
                    <p className="text-sm">{quote.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.lineItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                        <div className="text-sm mt-1">
                          Qty: {Number(item.quantity ?? 0)} × $
                          {Number(item.unitPrice ?? 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${Number(item.totalPrice ?? 0).toLocaleString()}
                        </div>
                        {item.discount > 0 && (
                          <div className="text-sm text-green-600">
                            -${Number(item.discount ?? 0).toLocaleString()} discount
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ${Number(quote.totals?.subtotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-medium text-green-600">
                      -${Number(quote.totals?.discount ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-medium">
                      ${Number(quote.totals?.tax ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${Number(quote.totals?.total ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.terms && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Terms & Conditions</div>
                  <p className="text-sm">{quote.terms}</p>
                </div>
              )}
              <Separator />
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(quote.createdAt).toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs">by {quote.createdBy}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last Updated</div>
                  <div>{new Date(quote.updatedAt).toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs">by {quote.updatedBy}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
