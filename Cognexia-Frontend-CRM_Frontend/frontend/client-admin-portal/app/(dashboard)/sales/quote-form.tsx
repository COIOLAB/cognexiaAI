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
import { QuoteStatus, type SalesQuote } from '@/types/api.types';

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  discount: z.coerce.number().min(0).max(100).optional(),
});

const quoteSchema = z.object({
  quoteNumber: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().optional(),
  quoteDate: z.string().min(1, 'Quote date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  status: z.nativeEnum(QuoteStatus),
  terms: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  quote?: Partial<SalesQuote>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function QuoteForm({
  quote,
  onSubmit,
  onCancel,
  isLoading,
}: QuoteFormProps) {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as unknown as Resolver<QuoteFormValues>,
    defaultValues: {
      quoteNumber: quote?.quoteNumber || '',
      customerId: quote?.customerId || '',
      customerName: quote?.customerName || '',
      quoteDate: quote?.createdAt
        ? new Date(quote.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      validUntil: quote?.validUntil
        ? new Date(quote.validUntil).toISOString().slice(0, 10)
        : '',
      status: quote?.status || QuoteStatus.DRAFT,
      terms: quote?.terms || '',
      notes: quote?.notes || '',
      lineItems: quote?.lineItems || [
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

  const handleSubmit = (data: QuoteFormValues) => {
    const submitData = {
      ...data,
      quoteDate: new Date(data.quoteDate).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
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
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="quoteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-generated" disabled />
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
                        <SelectItem value={QuoteStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={QuoteStatus.SENT}>Sent</SelectItem>
                        <SelectItem value={QuoteStatus.ACCEPTED}>
                          Accepted
                        </SelectItem>
                        <SelectItem value={QuoteStatus.REJECTED}>
                          Rejected
                        </SelectItem>
                        <SelectItem value={QuoteStatus.EXPIRED}>
                          Expired
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
                name="quoteDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Date *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until *</FormLabel>
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
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
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
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
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
            {quote ? 'Update Quote' : 'Create Quote'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
