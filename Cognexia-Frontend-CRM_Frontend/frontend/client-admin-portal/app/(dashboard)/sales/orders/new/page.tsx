'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateOrder } from '@/hooks/useOrders';
import SalesOrderForm from '../../sales-order-form';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function NewOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  const handleSubmit = (data: any) => {
    createOrder.mutate(data, {
      onSuccess: (response) => {
        router.push(`/sales/orders/${response.data.id}`);
      },
    });
  };

  const handleCancel = () => {
    router.push('/sales/orders');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Sales Order"
        subtitle="Create a new sales order with line items"
        actions={
          <Button variant="outline" asChild>
            <Link href="/sales/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        }
      />

      <SalesOrderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createOrder.isPending}
      />
    </div>
  );
}
