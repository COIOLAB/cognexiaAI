'use client';

import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { OrderStatus, type SalesOrder } from '@/types/api.types';

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  discount: z.coerce.number().min(0).max(100).optional(),
});

const orderSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  deliveryDate: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface SalesOrderFormProps {
  order?: Partial<SalesOrder>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SalesOrderForm({
  order,
  onSubmit,
  onCancel,
  isLoading,
}: SalesOrderFormProps) {
  const legacyOrder = order as
    | (Partial<SalesOrder> & {
        deliveryDate?: string;
        shippingAddress?: string;
        billingAddress?: string;
        lineItems?: Array<{
          productId: string;
          productName?: string;
          quantity: number;
          unitPrice: number;
          discount?: number;
        }>;
      })
    | undefined;
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as unknown as Resolver<OrderFormValues>,
    defaultValues: {
      orderNumber: order?.orderNumber || '',
      customerId: order?.customerId || '',
      customerName: order?.customerName || '',
      orderDate: order?.orderDate
        ? new Date(order.orderDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      deliveryDate: legacyOrder?.deliveryDate
        ? new Date(legacyOrder.deliveryDate)
            .toISOString()
            .slice(0, 10)
        : '',
      status: order?.status || OrderStatus.DRAFT,
      shippingAddress: legacyOrder?.shippingAddress || order?.shipping?.address || '',
      billingAddress: legacyOrder?.billingAddress || '',
      notes: order?.notes || '',
      lineItems: legacyOrder?.lineItems || order?.items || [
        { productId: '', productName: '', quantity: 1, unitPrice: 0, discount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const lineItems = form.watch('lineItems');
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discount = itemTotal * ((item.discount || 0) / 100);
    return sum + (itemTotal - discount);
  }, 0);

  const handleSubmit = (data: OrderFormValues) => {
    const submitData = {
      ...data,
      orderDate: new Date(data.orderDate).toISOString(),
      deliveryDate: data.deliveryDate
        ? new Date(data.deliveryDate).toISOString()
        : undefined,
      subtotal,
      totalAmount: subtotal,
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Auto-generated"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={OrderStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={OrderStatus.CONFIRMED}>
                          Confirmed
                        </SelectItem>
                        <SelectItem value={OrderStatus.PROCESSING}>
                          Processing
                        </SelectItem>
                        <SelectItem value={OrderStatus.SHIPPED}>
                          Shipped
                        </SelectItem>
                        <SelectItem value={OrderStatus.DELIVERED}>
                          Delivered
                        </SelectItem>
                        <SelectItem value={OrderStatus.CANCELLED}>
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Customer ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Customer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productId: '',
                    productName: '',
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start border rounded-lg p-4"
                >
                  <div className="grid flex-1 gap-4 md:grid-cols-5">
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product ID *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Product ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.productName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Product name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.discount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount %</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" max="100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
