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
import { Plus, Edit, Eye, QrCode, Download } from 'lucide-react';
import type { Asset } from '@/types/assets';
import { AssetMasterModal } from '@/components/assets/AssetMasterModal';
import { dummyAssets, dummyAssetCategories, dummyAssetLocations } from '@/data/assets-data';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

export default function AssetMaster() {
  const { checkModuleAccess, checkWriteAccess } = usePermissions();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!checkModuleAccess('assets')) {
    return (
      <MainLayout>
        <PageHeader title="Access Denied" description="You do not have permission to access this module" />
      </MainLayout>
    );
  }

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (sensitivityFilter !== 'all' && asset.sensitivity !== sensitivityFilter) return false;
      if (conditionFilter !== 'all' && asset.condition !== conditionFilter) return false;
      if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!asset.name.toLowerCase().includes(query) &&
            !asset.assetCode.toLowerCase().includes(query) &&
            !asset.nameEnglish?.toLowerCase().includes(query) &&
            !asset.donorName?.toLowerCase().includes(query) &&
            !asset.currentLocationName.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [assets, categoryFilter, sensitivityFilter, conditionFilter, statusFilter, searchQuery]);

  const handleSaveAsset = (data: Partial<Asset>) => {
    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...data } as Asset : a));
    } else {
      const newAsset: Asset = {
        ...data,
        id: `ast-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'user-1',
        createdByName: user?.name || 'Current User',
        updatedAt: new Date().toISOString(),
      } as Asset;
      setAssets([...assets, newAsset]);
    }
    setEditingAsset(null);
    setAssetModalOpen(false);
  };

  const totalAssets = assets.length;
  const highValueCount = assets.filter(a => a.sensitivity === 'high_value').length;
  const sacredCount = assets.filter(a => a.sensitivity === 'sacred').length;
  const underMaintenanceCount = assets.filter(a => a.lifecycleStatus === 'under_maintenance').length;
  const totalValuation = assets.reduce((sum, a) => sum + a.currentValuation, 0);

  const assetColumns = [
    { key: 'assetCode', label: 'Asset Code', sortable: true },
    {
      key: 'name',
      label: 'Asset Name',
      render: (_: unknown, row: Asset) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.nameEnglish && <div className="text-xs text-muted-foreground">{row.nameEnglish}</div>}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_: unknown, row: Asset) => (
        <Badge variant="outline">{row.category}</Badge>
      ),
    },
    {
      key: 'sensitivity',
      label: 'Sensitivity',
      render: (_: unknown, row: Asset) => {
        const variant = row.sensitivity === 'sacred' ? 'destructive' : row.sensitivity === 'high_value' ? 'default' : 'secondary';
        return <Badge variant={variant}>{row.sensitivity}</Badge>;
      },
    },
    {
      key: 'currentValuation',
      label: 'Valuation',
      render: (_: unknown, row: Asset) => (
        <div className="font-medium">₹{row.currentValuation.toLocaleString()}</div>
      ),
    },
    {
      key: 'currentLocationName',
      label: 'Location',
      render: (_: unknown, row: Asset) => (
        <div className="text-sm">{row.currentLocationName}</div>
      ),
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (_: unknown, row: Asset) => (
        <Badge variant={row.condition === 'excellent' ? 'default' : row.condition === 'good' ? 'secondary' : 'destructive'}>
          {row.condition}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: Asset) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Asset Master"
        description="Manage asset master records, categories, valuations, and asset details"
        actions={
          checkWriteAccess('asset_master') && (
            <Button onClick={() => { setEditingAsset(null); setAssetModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          )
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAssets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highValueCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sacred</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sacredCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{underMaintenanceCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalValuation / 100000).toFixed(1)}L</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search by asset code, name, donor, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="immovable">Immovable</SelectItem>
                <SelectItem value="sacred">Sacred</SelectItem>
                <SelectItem value="valuables">Valuables</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="vehicles">Vehicles</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sensitivity</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high_value">High Value</SelectItem>
                <SelectItem value="sacred">Sacred</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="condemned">Condemned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              // Export functionality
              console.log('Export assets');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Assets Table */}
          <DataTable
            data={filteredAssets}
            columns={assetColumns}
            actions={(row: Asset) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setViewingAsset(row); }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {checkWriteAccess('asset_master') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingAsset(row); setAssetModalOpen(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Generate QR code
                    console.log('Generate QR for', row.assetCode);
                  }}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dummyAssetCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      {cat.subCategory && <div className="text-sm text-muted-foreground">{cat.subCategory}</div>}
                    </div>
                    <Badge variant="outline">{cat.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssetMasterModal
        open={assetModalOpen}
        onOpenChange={setAssetModalOpen}
        asset={editingAsset}
        locations={dummyAssetLocations}
        categories={dummyAssetCategories}
        onSave={handleSaveAsset}
      />
    </MainLayout>
  );
}
