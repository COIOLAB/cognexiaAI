'use client';

import { useGetInventoryReport, useGetLowStockProducts, useGetStockAlerts } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';

export default function InventoryPage() {
  const { data: report, isLoading: reportLoading } = useGetInventoryReport();
  const { data: lowStockProducts } = useGetLowStockProducts();
  const { data: alerts } = useGetStockAlerts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Monitor stock levels and inventory health"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {report?.lowStockCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {report?.outOfStockCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report
                ? `$${Math.round(Number(report.totalInventoryValue ?? 0)).toLocaleString()}`
                : '$0'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportLoading ? (
            <div className="text-sm text-muted-foreground">Loading inventory...</div>
          ) : lowStockProducts && lowStockProducts.length > 0 ? (
            lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.sku}</div>
                </div>
                <Badge variant="outline">Low stock</Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No low stock items.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {alert.severity}
                  </div>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No alerts.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
