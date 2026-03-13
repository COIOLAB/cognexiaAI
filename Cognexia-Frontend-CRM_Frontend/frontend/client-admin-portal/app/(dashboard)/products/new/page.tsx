'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/product-form';
import { useCreateProduct } from '@/hooks/useProducts';
import type { CreateProductDto } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const handleSubmit = (data: CreateProductDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => router.push(`/products/${response.id}`),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Product"
        subtitle="Add a new product to your catalog"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <ProductForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Product" />
    </div>
  );
}
