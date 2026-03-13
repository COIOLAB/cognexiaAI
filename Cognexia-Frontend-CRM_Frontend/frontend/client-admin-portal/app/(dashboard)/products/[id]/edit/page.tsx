'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/product-form';
import { useGetProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { data, isLoading } = useGetProduct(productId);
  const updateMutation = useUpdateProduct();

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (!data) return <div className="flex flex-col items-center justify-center gap-4 p-6"><h2 className="text-2xl font-bold">Product not found</h2><Button onClick={() => router.push('/products')}>Back</Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Edit Product"
        subtitle={data.name}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <ProductForm initialData={data} onSubmit={(formData) => updateMutation.mutate({ id: productId, data: formData }, { onSuccess: () => router.push(`/products/${productId}`) })} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
