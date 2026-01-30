import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { dummyItems } from '@/data/inventory-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function KitchenStores() {
  const { checkModuleAccess } = usePermissions();
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('kitchen_stores')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  // Filter items that are in kitchen store
  const kitchenItems = useMemo(() => {
    return dummyItems.filter(item => {
      const kitchenStock = item.stockAllocations.find(alloc => alloc.godownName === 'Kitchen Store');
      if (!kitchenStock || kitchenStock.quantity === 0) return false;
      if (stockStatusFilter === 'low_stock' && kitchenStock.quantity >= item.reorderPoint) return false;
      if (stockStatusFilter === 'out_of_stock' && kitchenStock.quantity > 0) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && !item.code?.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [stockStatusFilter, searchQuery]);

  const getStockStatus = (item: typeof dummyItems[0]) => {
    const kitchenStock = item.stockAllocations.find(alloc => alloc.godownName === 'Kitchen Store');
    const quantity = kitchenStock?.quantity || 0;
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity < item.reorderPoint) return { label: 'Low Stock', variant: 'destructive' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const lowStockItems = kitchenItems.filter(item => {
    const kitchenStock = item.stockAllocations.find(alloc => alloc.godownName === 'Kitchen Store');
    return kitchenStock && kitchenStock.quantity < item.reorderPoint && kitchenStock.quantity > 0;
  });

  const itemColumns = [
    { key: 'name', label: 'Item Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (_: unknown, item: typeof dummyItems[0]) => {
        const kitchenStock = item.stockAllocations.find(alloc => alloc.godownName === 'Kitchen Store');
        return kitchenStock?.quantity || 0;
      },
    },
    {
      key: 'minLevel',
      label: 'Min Level',
      render: (_: unknown, item: typeof dummyItems[0]) => item.reorderPoint,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, item: typeof dummyItems[0]) => {
        const status = getStockStatus(item);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Kitchen Stores"
        description="Manage kitchen raw material inventory and stock levels"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kitchenItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kitchen Stock</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={kitchenItems}
              columns={itemColumns}
              searchKey="name"
              defaultPageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
