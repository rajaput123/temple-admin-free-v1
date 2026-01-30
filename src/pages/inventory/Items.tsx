import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Item } from '@/types/inventory';
import { ItemModal } from '@/components/inventory/ItemModal';
import { dummyItems, dummyCategories, dummyGodowns, dummyUOMs, dummySuppliers } from '@/data/inventory-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function Items() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const [items, setItems] = useState<Item[]>(dummyItems);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [godownFilter, setGodownFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('inventory')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
      if (godownFilter !== 'all') {
        const hasStockInGodown = item.stockAllocations.some(
          alloc => alloc.godownId === godownFilter && alloc.quantity > 0
        );
        if (!hasStockInGodown) return false;
      }
      if (stockStatusFilter !== 'all') {
        if (stockStatusFilter === 'low_stock' && item.totalStock >= item.reorderPoint) return false;
        if (stockStatusFilter === 'out_of_stock' && item.totalStock > 0) return false;
        if (stockStatusFilter === 'in_stock' && (item.totalStock === 0 || item.totalStock < item.reorderPoint)) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && 
            !item.code?.toLowerCase().includes(query) &&
            !item.categoryName.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [items, categoryFilter, stockStatusFilter, godownFilter, searchQuery]);

  const handleSaveItem = (data: Partial<Item>) => {
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
    } else {
      const newItem: Item = {
        ...data,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Item;
      setItems([...items, newItem]);
    }
    setEditingItem(null);
    setItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getStockStatus = (item: Item) => {
    if (item.totalStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (item.totalStock < item.reorderPoint) return { label: 'Low Stock', variant: 'destructive' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const lowStockItems = items.filter(item => item.totalStock < item.reorderPoint && item.totalStock > 0);
  const outOfStockItems = items.filter(item => item.totalStock === 0);
  const totalItems = items.length;
  const totalStockValue = items.reduce((sum, item) => {
    const avgRate = item.supplierPricing?.[0]?.rate || 0;
    return sum + (item.totalStock * avgRate);
  }, 0);

  const itemColumns = [
    { key: 'name', label: 'Item Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { 
      key: 'categoryName', 
      label: 'Category', 
      render: (_: unknown, row: Item) => (
        <div>
          <div>{row.categoryName}</div>
          {row.subCategory && <div className="text-xs text-muted-foreground">{row.subCategory}</div>}
        </div>
      )
    },
    { 
      key: 'totalStock', 
      label: 'Total Stock', 
      render: (_: unknown, row: Item) => (
        <div>
          <div className="font-medium">{row.totalStock} {row.baseUOM}</div>
          <div className="text-xs text-muted-foreground">
            Min: {row.minStockLevel} | Reorder: {row.reorderPoint}
          </div>
        </div>
      )
    },
    { 
      key: 'stockAllocations', 
      label: 'Godown Allocation', 
      render: (_: unknown, row: Item) => (
        <div className="space-y-1">
          {row.stockAllocations.map(alloc => (
            <div key={alloc.godownId} className="text-xs">
              {alloc.godownName}: {alloc.quantity} {row.baseUOM}
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Stock Status',
      render: (_: unknown, row: Item) => {
        const status = getStockStatus(row);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Item Status',
      render: (_: unknown, row: Item) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Items"
        description="Manage inventory items, stock levels, and item master data"
        actions={
          checkWriteAccess('items') && (
            <Button onClick={() => { setEditingItem(null); setItemModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="supplier-pricing">Supplier Pricing</TabsTrigger>
          <TabsTrigger value="tax-compliance">Tax & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{outOfStockItems.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search items by name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {dummyCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={godownFilter} onValueChange={setGodownFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Godowns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Godowns</SelectItem>
                {dummyGodowns.map(godown => (
                  <SelectItem key={godown.id} value={godown.id}>{godown.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          <DataTable
            data={filteredItems}
            columns={itemColumns}
            searchable={false}
            onRowClick={(row) => {
              setSelectedItem(row);
            }}
            actions={(row) => (
              <>
                {checkWriteAccess('items') && (
                  <>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(row);
                      setItemModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(row.id);
                    }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="stock-levels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {dummyGodowns.map(godown => {
              const godownItems = items.filter(item =>
                item.stockAllocations.some(alloc => alloc.godownId === godown.id)
              );
              const totalQty = godownItems.reduce((sum, item) => {
                const alloc = item.stockAllocations.find(a => a.godownId === godown.id);
                return sum + (alloc?.quantity || 0);
              }, 0);
              return (
                <Card key={godown.id}>
                  <CardHeader>
                    <CardTitle>{godown.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{godownItems.length} Items</div>
                    <div className="text-sm text-muted-foreground">Total Quantity: {totalQty}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="supplier-pricing" className="space-y-4">
          <p className="text-sm text-muted-foreground">Supplier pricing information available in item details</p>
        </TabsContent>

        <TabsContent value="tax-compliance" className="space-y-4">
          <p className="text-sm text-muted-foreground">Tax and compliance information available in item details</p>
        </TabsContent>
      </Tabs>

      <ItemModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        item={editingItem}
        categories={dummyCategories}
        uoms={dummyUOMs}
        godowns={dummyGodowns}
        suppliers={dummySuppliers}
        onSave={handleSaveItem}
      />
    </MainLayout>
  );
}
