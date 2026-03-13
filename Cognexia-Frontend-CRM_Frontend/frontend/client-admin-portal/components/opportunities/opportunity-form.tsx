'use client';

import * as React from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { CreateOpportunityDto, Opportunity } from '@/types/api.types';

// Validation schema
const opportunitySchema = z.object({
  name: z.string().min(1, 'Opportunity name is required'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  contactId: z.string().optional(),
  assignedTo: z.string().optional(),
  products: z.string().optional(), // Will be split into array
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  initialData?: Opportunity;
  onSubmit: (data: CreateOpportunityDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function OpportunityForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel = 'Create Opportunity' 
}: OpportunityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema) as unknown as Resolver<OpportunityFormData>,
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      amount: initialData.amount,
      expectedCloseDate: initialData.expectedCloseDate?.split('T')[0],
      customerId: initialData.customerId,
      contactId: initialData.contactId || '',
      assignedTo: initialData.assignedTo || '',
      products: initialData.products?.join(', ') || '',
    } : {
      expectedCloseDate: new Date().toISOString().split('T')[0],
    },
  });

  const onFormSubmit = (data: OpportunityFormData) => {
    const payload: CreateOpportunityDto = {
      name: data.name,
      description: data.description || undefined,
      amount: data.amount,
      expectedCloseDate: data.expectedCloseDate,
      customerId: data.customerId,
      contactId: data.contactId || undefined,
      assignedTo: data.assignedTo || undefined,
      products: data.products 
        ? data.products.split(',').map((p) => p.trim()).filter(Boolean) 
        : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>Basic information about the sales opportunity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opportunity Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Opportunity Name *</Label>
              <Input
                id="name"
                placeholder="Q1 2026 Enterprise Deal"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Details about this opportunity..."
                rows={3}
                {...register('description')}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Deal Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="50000"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Expected Close Date */}
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                {...register('expectedCloseDate')}
              />
              {errors.expectedCloseDate && (
                <p className="text-sm text-destructive">{errors.expectedCloseDate.message}</p>
              )}
            </div>

            {/* Customer ID */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID *</Label>
              <Input
                id="customerId"
                placeholder="Customer UUID"
                {...register('customerId')}
              />
              {errors.customerId && (
                <p className="text-sm text-destructive">{errors.customerId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The customer associated with this opportunity
              </p>
            </div>

            {/* Contact ID */}
            <div className="space-y-2">
              <Label htmlFor="contactId">Contact ID</Label>
              <Input
                id="contactId"
                placeholder="Contact UUID (optional)"
                {...register('contactId')}
              />
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To (User ID)</Label>
              <Input
                id="assignedTo"
                placeholder="User ID"
                {...register('assignedTo')}
              />
            </div>

            {/* Products */}
            <div className="space-y-2">
              <Label htmlFor="products">Products (comma-separated IDs)</Label>
              <Input
                id="products"
                placeholder="prod-1, prod-2, prod-3"
                {...register('products')}
              />
              <p className="text-xs text-muted-foreground">
                Enter product IDs separated by commas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
