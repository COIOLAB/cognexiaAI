'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetProduct } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, BarChart3, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useCreateProduct, useDeleteProduct } from '@/hooks/useProducts';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: product, isLoading } = useGetProduct(params.id as string);
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const available = product.quantityInStock - product.quantityReserved;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <Button variant="outline" onClick={() => router.push(`/products/${product.id}/edit`)}>
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const skuSuffix = `${Date.now()}`.slice(-4);
                createProduct.mutate(
                  {
                    sku: `${product.sku}-COPY-${skuSuffix}`,
                    name: `${product.name} (Copy)`,
                    description: product.description,
                    type: product.type,
                    basePrice: Number(product.basePrice) || 0,
                    costPrice: product.costPrice != null ? Number(product.costPrice) : undefined,
                    currency: product.currency,
                    trackInventory: product.trackInventory,
                    quantityInStock: Number(product.quantityInStock) || 0,
                    categoryId: product.categoryId,
                    brand: product.brand,
                    tags: product.tags,
                    imageUrls: product.imageUrls,
                    attributes: product.attributes,
                  },
                  {
                    onSuccess: (newProduct) => {
                      router.push(`/products/${newProduct.id}`);
                    },
                  },
                );
              }}
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? 'Duplicating...' : 'Duplicate'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(`Delete ${product.name}? This action cannot be undone.`)) {
                  deleteProduct.mutate(product.id, {
                    onSuccess: () => router.push('/products'),
                  });
                }
              }}
              disabled={deleteProduct.isPending}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.currency} {Number(product.basePrice).toFixed(2)}
            </div>
            {product.isOnSale && product.salePrice && (
              <p className="text-xs text-green-600">
                Sale: {product.currency} {Number(product.salePrice).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{available}</div>
            <p className="text-xs text-muted-foreground">
              {product.quantityReserved} reserved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.totalSold}</div>
            <p className="text-xs text-muted-foreground">
              Revenue: {product.currency} {Number(product.totalRevenue).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge>{product.type}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge>{product.status}</Badge>
                </div>
                {product.brand && (
                  <div>
                    <p className="text-sm font-medium">Brand</p>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                )}
                {product.manufacturer && (
                  <div>
                    <p className="text-sm font-medium">Manufacturer</p>
                    <p className="text-sm text-muted-foreground">{product.manufacturer}</p>
                  </div>
                )}
              </div>
              {product.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Base Price</p>
                  <p className="text-sm text-muted-foreground">
                    {product.currency} {Number(product.basePrice).toFixed(2)}
                  </p>
                </div>
                {product.costPrice && (
                  <div>
                    <p className="text-sm font-medium">Cost Price</p>
                    <p className="text-sm text-muted-foreground">
                      {product.currency} {Number(product.costPrice).toFixed(2)}
                    </p>
                  </div>
                )}
                {product.msrp && (
                  <div>
                    <p className="text-sm font-medium">MSRP</p>
                    <p className="text-sm text-muted-foreground">
                      {product.currency} {Number(product.msrp).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">In Stock</p>
                  <p className="text-sm text-muted-foreground">{product.quantityInStock}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reserved</p>
                  <p className="text-sm text-muted-foreground">{product.quantityReserved}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-sm text-muted-foreground">{available}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Low Stock Threshold</p>
                  <p className="text-sm text-muted-foreground">{product.lowStockThreshold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
