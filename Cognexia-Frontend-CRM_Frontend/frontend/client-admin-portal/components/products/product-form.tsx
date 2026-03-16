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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ProductType } from '@/types/api.types';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType).optional(),
  basePrice: z.coerce.number().min(0, 'Price must be at least 0'),
  costPrice: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional(),
  quantityInStock: z.coerce.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProductForm({ initialData, onSubmit, isLoading, submitLabel = 'Create Product' }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: initialData || {},
  });

  const onFormSubmit = (data: ProductFormData) => {
    const categoryId = data.categoryId?.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const payload = {
      ...data,
      categoryId: categoryId && uuidRegex.test(categoryId) ? categoryId : undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Basic product details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" placeholder="Premium CRM License" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Product description..." rows={4} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="PRD-001" {...register('sku')} />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input id="categoryId" placeholder="Category UUID" {...register('categoryId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as ProductType, { shouldValidate: true })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductType.PHYSICAL}>Physical</SelectItem>
                  <SelectItem value={ProductType.DIGITAL}>Digital</SelectItem>
                  <SelectItem value={ProductType.SERVICE}>Service</SelectItem>
                  <SelectItem value={ProductType.SUBSCRIPTION}>Subscription</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Price ($) *</Label>
              <Input id="basePrice" type="number" step="0.01" placeholder="99.99" {...register('basePrice')} />
              {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost ($)</Label>
              <Input id="costPrice" type="number" step="0.01" placeholder="50.00" {...register('costPrice')} />
              {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityInStock">Quantity</Label>
              <Input id="quantityInStock" type="number" min="0" step="1" placeholder="0" {...register('quantityInStock')} />
              {errors.quantityInStock && <p className="text-sm text-destructive">{errors.quantityInStock.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
