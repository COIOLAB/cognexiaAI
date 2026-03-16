'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import SalesOrderForm from '../../../sales-order-form';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: orderData, isLoading } = useOrder(orderId);
  const updateOrder = useUpdateOrder();

  const handleSubmit = (data: any) => {
    updateOrder.mutate(
      { id: orderId, data },
      {
        onSuccess: () => {
          router.push(`/sales/orders/${orderId}`);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(`/sales/orders/${orderId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!orderData?.data) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Sales Order"
        subtitle="Update order details and line items"
        actions={
          <Button variant="outline" asChild>
            <Link href={`/sales/orders/${orderId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Order
            </Link>
          </Button>
        }
      />

      <SalesOrderForm
        order={orderData.data}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateOrder.isPending}
      />
    </div>
  );
}
