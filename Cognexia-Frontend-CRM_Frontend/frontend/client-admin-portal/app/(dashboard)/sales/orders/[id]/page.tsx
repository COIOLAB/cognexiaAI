'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { OrderStatus } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-green-100 text-green-800',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useOrder(id);

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!data?.data) return <div className="flex items-center justify-center h-96">Order not found</div>;

  const order = data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        subtitle={order.customerName}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusStyles[order.status]} variant="secondary">{order.status}</Badge>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Amount</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${Number(order.totalAmount ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Date</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{new Date(order.orderDate).toLocaleDateString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Sales Rep</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">{order.salesRep.name}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({order.items.length})</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Order Number</div>
                  <div className="font-medium">{order.orderNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={statusStyles[order.status]} variant="secondary">{order.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{order.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                  <div className="font-medium">{order.payment.method}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {Number(item.quantity ?? 0)} × $
                          {Number(item.unitPrice ?? 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-bold">
                        ${Number(item.totalPrice ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Shipping Address</div>
                <div className="font-medium">{order.shipping.address}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Shipping Method</div>
                <div className="font-medium">{order.shipping.method}</div>
              </div>
              {order.shipping.trackingNumber && (
                <div>
                  <div className="text-sm text-muted-foreground">Tracking Number</div>
                  <div className="font-medium">{order.shipping.trackingNumber}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
