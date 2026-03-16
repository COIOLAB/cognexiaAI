'use client';

import { useState } from 'react';
import {
  useCreateDiscount,
  useCreatePriceList,
  useGetDiscounts,
  useGetPriceLists,
} from '@/hooks/usePricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetProducts } from '@/hooks/useProducts';
import { DiscountApplicability, DiscountType, PriceListType } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function PricingPage() {
  const { data: priceLists, isLoading: priceListsLoading } = useGetPriceLists();
  const { data: discounts, isLoading: discountsLoading } = useGetDiscounts();
  const { data: products } = useGetProducts();
  const createPriceList = useCreatePriceList();
  const createDiscount = useCreateDiscount();
  const [priceListOpen, setPriceListOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);

  const [priceListName, setPriceListName] = useState('');
  const [priceListType, setPriceListType] = useState<PriceListType>(PriceListType.STANDARD);
  const [priceListCurrency, setPriceListCurrency] = useState('USD');
  const [priceListProductId, setPriceListProductId] = useState('');
  const [priceListPrice, setPriceListPrice] = useState('');

  const [discountName, setDiscountName] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState('');
  const [discountApplicability, setDiscountApplicability] = useState<DiscountApplicability>(DiscountApplicability.ALL_PRODUCTS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        subtitle="Manage price lists, discounts, and rules"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDiscountOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Discount
            </Button>
            <Button onClick={() => setPriceListOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Price List
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price Lists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priceListsLoading ? (
              <div className="text-sm text-muted-foreground">Loading price lists...</div>
            ) : priceLists && priceLists.length > 0 ? (
              priceLists.map((priceList) => (
                <div
                  key={priceList.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{priceList.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {priceList.currency} · {priceList.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <Badge variant={priceList.active ? 'default' : 'secondary'}>
                    {priceList.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No price lists found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {discountsLoading ? (
              <div className="text-sm text-muted-foreground">Loading discounts...</div>
            ) : discounts && discounts.length > 0 ? (
              discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{discount.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {discount.name || 'Discount'} · {discount.type}
                    </div>
                  </div>
                  <Badge variant={discount.active ? 'default' : 'secondary'}>
                    {discount.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No discounts found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={priceListOpen} onOpenChange={setPriceListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Price List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={priceListName} onChange={(event) => setPriceListName(event.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={priceListType} onValueChange={(value) => setPriceListType(value as PriceListType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PriceListType).map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Input value={priceListCurrency} onChange={(event) => setPriceListCurrency(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Product</label>
                <Select value={priceListProductId} onValueChange={setPriceListProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {(products || []).map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={priceListPrice}
                  onChange={(event) => setPriceListPrice(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceListOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!priceListName.trim() || !priceListProductId || !priceListPrice) return;
                createPriceList.mutate(
                  {
                    name: priceListName.trim(),
                    type: priceListType,
                    currency: priceListCurrency.trim() || 'USD',
                    active: true,
                    prices: [
                      {
                        productId: priceListProductId,
                        price: Number(priceListPrice),
                      },
                    ],
                  },
                  {
                    onSuccess: () => {
                      setPriceListOpen(false);
                      setPriceListName('');
                      setPriceListCurrency('USD');
                      setPriceListProductId('');
                      setPriceListPrice('');
                    },
                  },
                );
              }}
              disabled={createPriceList.isPending}
            >
              {createPriceList.isPending ? 'Creating...' : 'Create Price List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={discountName} onChange={(event) => setDiscountName(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Code</label>
              <Input value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="SAVE10" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as DiscountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DiscountType).map((value) => (
                      <SelectItem key={value} value={value}>{value.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Value</label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Applicability</label>
              <Select value={discountApplicability} onValueChange={(value) => setDiscountApplicability(value as DiscountApplicability)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DiscountApplicability).map((value) => (
                    <SelectItem key={value} value={value}>{value.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!discountName.trim() || !discountValue) return;
                createDiscount.mutate(
                  {
                    name: discountName.trim(),
                    code: discountCode.trim() || undefined,
                    type: discountType,
                    value: Number(discountValue),
                    applicability: discountApplicability,
                    active: true,
                  },
                  {
                    onSuccess: () => {
                      setDiscountOpen(false);
                      setDiscountName('');
                      setDiscountCode('');
                      setDiscountValue('');
                      setDiscountType(DiscountType.PERCENTAGE);
                      setDiscountApplicability(DiscountApplicability.ALL_PRODUCTS);
                    },
                  },
                );
              }}
              disabled={createDiscount.isPending}
            >
              {createDiscount.isPending ? 'Creating...' : 'Create Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
